-- CMS admin: update trial/subscription end dates for a single organization.
-- Additive only: does not change RLS or existing triggers on organization_subscriptions.

CREATE OR REPLACE FUNCTION public.admin_update_organization_subscription(
  p_organization_id uuid,
  p_is_trial boolean,
  p_trial_end_date timestamptz,
  p_subscription_end_date timestamptz,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sub public.organization_subscriptions%ROWTYPE;
  v_before jsonb;
  v_after jsonb;
  v_new_status text;
  v_new_is_trial boolean;
  v_new_trial_end timestamptz;
  v_new_sub_end timestamptz;
  v_effective_status text;
  v_end timestamptz;
  v_max_future timestamptz := now() + interval '365 days';
  v_active_end timestamptz;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  IF p_reason IS NULL OR char_length(trim(p_reason)) < 3 THEN
    RAISE EXCEPTION 'reason required (min 3 characters)' USING ERRCODE = '22023';
  END IF;

  SELECT *
  INTO v_sub
  FROM public.organization_subscriptions
  WHERE organization_id = p_organization_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'subscription not found for organization' USING ERRCODE = 'P0002';
  END IF;

  v_new_is_trial := coalesce(p_is_trial, false);
  v_new_trial_end := p_trial_end_date;
  v_new_sub_end := p_subscription_end_date;

  IF v_new_is_trial THEN
    IF v_new_trial_end IS NULL THEN
      RAISE EXCEPTION 'trial_end_date required when in trial mode' USING ERRCODE = '22023';
    END IF;
    v_active_end := v_new_trial_end;
  ELSE
    IF v_new_sub_end IS NULL THEN
      RAISE EXCEPTION 'subscription_end_date required when in paid mode' USING ERRCODE = '22023';
    END IF;
    v_active_end := v_new_sub_end;
  END IF;

  IF v_active_end > now() AND v_active_end > v_max_future THEN
    RAISE EXCEPTION 'end date cannot exceed 365 days from now' USING ERRCODE = '22023';
  END IF;

  v_before := jsonb_build_object(
    'is_trial', v_sub.is_trial,
    'status', v_sub.status,
    'trial_end_date', v_sub.trial_end_date,
    'subscription_end_date', v_sub.subscription_end_date,
    'auto_renew', v_sub.auto_renew
  );

  IF v_new_is_trial THEN
    IF v_new_trial_end > now() THEN
      v_new_status := 'trial';
    ELSE
      v_new_status := 'expired';
      v_new_is_trial := false;
    END IF;
  ELSE
    v_new_is_trial := false;
    IF v_new_sub_end > now() THEN
      v_new_status := 'active';
    ELSE
      v_new_status := 'expired';
    END IF;
  END IF;

  UPDATE public.organization_subscriptions
  SET
    is_trial = v_new_is_trial,
    status = v_new_status,
    trial_end_date = v_new_trial_end,
    subscription_end_date = v_new_sub_end,
    auto_renew = CASE
      WHEN NOT v_new_is_trial AND v_new_status = 'active' THEN true
      WHEN v_new_status = 'expired' THEN false
      ELSE auto_renew
    END,
    updated_at = now()
  WHERE organization_id = p_organization_id
  RETURNING * INTO v_sub;

  v_after := jsonb_build_object(
    'is_trial', v_sub.is_trial,
    'status', v_sub.status,
    'trial_end_date', v_sub.trial_end_date,
    'subscription_end_date', v_sub.subscription_end_date,
    'auto_renew', v_sub.auto_renew,
    'has_active_subscription', (
      SELECT o.has_active_subscription
      FROM public.organizations o
      WHERE o.id = p_organization_id
    )
  );

  IF v_sub.is_trial THEN
    v_end := v_sub.trial_end_date;
  ELSE
    v_end := v_sub.subscription_end_date;
  END IF;

  IF v_end IS NOT NULL AND v_end < now() THEN
    v_effective_status := 'expired';
  ELSIF v_sub.is_trial THEN
    v_effective_status := 'trial';
  ELSIF v_sub.status = 'active' THEN
    v_effective_status := 'active';
  ELSE
    v_effective_status := coalesce(v_sub.status, 'unknown');
  END IF;

  INSERT INTO public.cms_subscription_adjustments (
    organization_id,
    adjusted_by,
    reason,
    before_state,
    after_state
  ) VALUES (
    p_organization_id,
    auth.uid(),
    trim(p_reason),
    v_before,
    v_after
  );

  RETURN jsonb_build_object(
    'organization_id', p_organization_id,
    'effective_status', v_effective_status,
    'is_trial', v_sub.is_trial,
    'trial_end_date', v_sub.trial_end_date,
    'subscription_end_date', v_sub.subscription_end_date,
    'has_active_subscription', v_after->'has_active_subscription',
    'after_state', v_after
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_list_subscription_adjustments(
  p_organization_id uuid,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  organization_id uuid,
  adjusted_by uuid,
  reason text,
  before_state jsonb,
  after_state jsonb,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  lim int;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  lim := greatest(1, least(coalesce(p_limit, 5), 50));

  RETURN QUERY
  SELECT
    a.id,
    a.organization_id,
    a.adjusted_by,
    a.reason,
    a.before_state,
    a.after_state,
    a.created_at
  FROM public.cms_subscription_adjustments a
  WHERE a.organization_id = p_organization_id
  ORDER BY a.created_at DESC
  LIMIT lim;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_update_organization_subscription(
  uuid, boolean, timestamptz, timestamptz, text
) TO authenticated;

GRANT EXECUTE ON FUNCTION public.admin_list_subscription_adjustments(uuid, integer) TO authenticated;
