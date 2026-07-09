CREATE OR REPLACE FUNCTION public.admin_organizations_summary()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  WITH enriched AS (
    SELECT
      o.id AS organization_id,
      os.status AS subscription_status,
      coalesce(os.is_trial, false) AS is_trial,
      os.subscription_end_date,
      os.trial_end_date,
      CASE
        WHEN coalesce(os.is_trial, false) THEN os.trial_end_date
        ELSE os.subscription_end_date
      END AS v_end,
      (os.id IS NOT NULL) AS has_sub
    FROM public.organizations o
    LEFT JOIN public.organization_subscriptions os ON os.organization_id = o.id
  ),
  computed AS (
    SELECT
      e.organization_id,
      (e.v_end IS NOT NULL AND e.v_end < now()) AS is_expired,
      CASE
        WHEN NOT e.has_sub THEN 'none'
        WHEN e.v_end IS NOT NULL AND e.v_end < now() THEN 'expired'
        WHEN e.is_trial THEN 'trial'
        WHEN e.subscription_status = 'active' THEN 'active'
        ELSE coalesce(e.subscription_status, 'unknown')
      END AS effective_status,
      (
        NOT (e.v_end IS NOT NULL AND e.v_end < now()) AND (
          (e.is_trial AND (e.trial_end_date IS NULL OR e.trial_end_date > now()))
          OR (
            NOT e.is_trial
            AND e.subscription_status = 'active'
            AND (e.subscription_end_date IS NULL OR e.subscription_end_date > now())
          )
        )
      ) AS is_active
    FROM enriched e
  )
  SELECT jsonb_build_object(
    'total_count', count(*)::int,
    'active_count', count(*) FILTER (WHERE is_active)::int,
    'trial_count', count(*) FILTER (WHERE effective_status = 'trial')::int,
    'expired_count', count(*) FILTER (WHERE effective_status = 'expired')::int
  )
  INTO result
  FROM computed;

  RETURN coalesce(result, '{"total_count":0,"active_count":0,"trial_count":0,"expired_count":0}'::jsonb);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_organizations_summary() TO authenticated;
