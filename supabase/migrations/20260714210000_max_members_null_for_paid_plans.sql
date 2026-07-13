-- Paid per-member plans: max_members stays NULL (office slider = quantity × price).
-- Free plans (Rp 0): max_members caps seats (typically 1).

CREATE OR REPLACE FUNCTION public._resolve_plan_max_members(
  p_max_members integer,
  p_jumlah_hari_trial integer,
  p_base_price_per_member numeric
)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
  v_validated integer;
BEGIN
  IF p_base_price_per_member IS NOT NULL AND p_base_price_per_member > 0 THEN
    RETURN NULL;
  END IF;

  v_validated := public._validate_plan_max_members(p_max_members);
  IF v_validated IS NOT NULL THEN
    RETURN v_validated;
  END IF;

  IF p_jumlah_hari_trial IS NOT NULL AND p_jumlah_hari_trial > 0 THEN
    RETURN 1;
  END IF;

  RETURN 1;
END;
$function$;

CREATE OR REPLACE FUNCTION public._build_plan_features_from_modules(
  p_base_price_per_member numeric,
  p_modules jsonb,
  p_max_members integer
)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $function$
DECLARE
  v_features jsonb := '[]'::jsonb;
  v_key text;
  v_enabled boolean;
  v_cap integer;
BEGIN
  IF p_max_members IS NOT NULL THEN
    v_cap := public._validate_plan_max_members(p_max_members);
    IF v_cap IS NOT NULL THEN
      v_features := v_features || jsonb_build_array(v_cap::text || ' Member Allowed');
    END IF;
  END IF;

  IF p_base_price_per_member IS NOT NULL AND p_base_price_per_member >= 0 THEN
    v_features := v_features || jsonb_build_array(
      'Rp ' || trim(to_char(p_base_price_per_member, 'FM999G999G999')) || ' per member / bulan'
    );
  END IF;

  FOREACH v_key IN ARRAY public.sales_module_catalog_keys()
  LOOP
    IF p_modules ? v_key AND (p_modules ->> v_key)::boolean IS TRUE THEN
      v_features := v_features || jsonb_build_array('Modul ' || public._plan_module_label(v_key));
    END IF;
  END LOOP;

  v_features := v_features || jsonb_build_array('Dashboard');

  RETURN v_features;
END;
$function$;

UPDATE public.subscription_plans
SET
  max_members = NULL,
  features = public._build_plan_features_from_modules(
    base_price_per_member,
    public._plan_modules_json_for_plan(id),
    NULL
  ),
  updated_at = now()
WHERE base_price_per_member > 0;

UPDATE public.subscription_plans sp
SET
  features = public._build_plan_features_from_modules(
    sp.base_price_per_member,
    public._plan_modules_json_for_plan(sp.id),
    sp.max_members
  ),
  updated_at = now()
WHERE sp.base_price_per_member = 0;

NOTIFY pgrst, 'reload schema';
