-- Repair: ensure admin_get_plan_modules exists and PostgREST schema cache is refreshed.
-- Run in Supabase SQL Editor if CMS Modul tab shows "Gagal memuat modul plan".

CREATE OR REPLACE FUNCTION public.admin_get_plan_modules(p_subscription_plan_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  v_modules jsonb := '{}'::jsonb;
  v_key text;
  v_enabled boolean;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.subscription_plans WHERE id = p_subscription_plan_id
  ) THEN
    RAISE EXCEPTION 'plan not found' USING ERRCODE = 'P0002';
  END IF;

  PERFORM public.seed_plan_module_access_defaults(p_subscription_plan_id);

  FOREACH v_key IN ARRAY public.sales_module_catalog_keys()
  LOOP
    v_enabled := false;
    SELECT m.is_enabled
    INTO v_enabled
    FROM public.subscription_plan_module_access m
    WHERE m.subscription_plan_id = p_subscription_plan_id
      AND m.module_key = v_key;

    v_modules := v_modules || jsonb_build_object(v_key, coalesce(v_enabled, false));
  END LOOP;

  RETURN jsonb_build_object(
    'subscription_plan_id', p_subscription_plan_id,
    'modules', v_modules
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_get_plan_modules(uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
