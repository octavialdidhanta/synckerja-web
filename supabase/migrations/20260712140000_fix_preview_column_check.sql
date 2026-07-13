-- Fix 42703: skip tables that exist but lack organization_id (e.g. social_media_scheduler_tick_logs).

CREATE OR REPLACE FUNCTION public._preview_organization_key_counts(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  v_result jsonb := '{}'::jsonb;
  v_count bigint;
  r record;
BEGIN
  FOR r IN
    SELECT c.table_name
    FROM information_schema.columns c
    INNER JOIN information_schema.tables t
      ON t.table_schema = c.table_schema
      AND t.table_name = c.table_name
    WHERE c.table_schema = 'public'
      AND c.column_name = 'organization_id'
      AND t.table_type = 'BASE TABLE'
      AND c.table_name = ANY(ARRAY[
        'employees',
        'user_organizations',
        'payments',
        'organization_subscriptions',
        'attendance_records',
        'payroll_runs',
        'crm_leads',
        'projects',
        'social_media_posts'
      ])
    ORDER BY c.table_name
  LOOP
    EXECUTE format(
      'SELECT count(*)::bigint FROM public.%I WHERE organization_id = $1',
      r.table_name
    ) INTO v_count USING p_organization_id;

    IF v_count > 0 THEN
      v_result := v_result || jsonb_build_object(r.table_name, v_count);
    END IF;
  END LOOP;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public._purge_organization_rows(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  r record;
  v_sql text;
  v_count bigint;
  v_deleted jsonb := '{}'::jsonb;
  v_pass int;
  v_max_passes int := 40;
  v_remaining bigint;
  v_total_remaining bigint;
  v_prev_count bigint;
BEGIN
  FOR v_pass IN 1..v_max_passes LOOP
    FOR r IN
      SELECT c.table_name
      FROM information_schema.columns c
      INNER JOIN information_schema.tables t
        ON t.table_schema = c.table_schema
        AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND c.column_name = 'organization_id'
        AND t.table_type = 'BASE TABLE'
        AND c.table_name NOT IN ('organizations', 'cms_organization_deletions')
      ORDER BY c.table_name
    LOOP
      BEGIN
        v_sql := format(
          'DELETE FROM public.%I WHERE organization_id = $1',
          r.table_name
        );
        EXECUTE v_sql USING p_organization_id;
        GET DIAGNOSTICS v_count = ROW_COUNT;

        IF v_count > 0 THEN
          v_prev_count := coalesce((v_deleted ->> r.table_name)::bigint, 0);
          v_deleted := v_deleted || jsonb_build_object(r.table_name, v_prev_count + v_count);
        END IF;
      EXCEPTION
        WHEN foreign_key_violation THEN
          NULL;
        WHEN undefined_column THEN
          NULL;
      END;
    END LOOP;

    v_total_remaining := 0;
    FOR r IN
      SELECT c.table_name
      FROM information_schema.columns c
      INNER JOIN information_schema.tables t
        ON t.table_schema = c.table_schema
        AND t.table_name = c.table_name
      WHERE c.table_schema = 'public'
        AND c.column_name = 'organization_id'
        AND t.table_type = 'BASE TABLE'
        AND c.table_name NOT IN ('organizations', 'cms_organization_deletions')
      ORDER BY c.table_name
    LOOP
      BEGIN
        v_sql := format(
          'SELECT count(*)::bigint FROM public.%I WHERE organization_id = $1',
          r.table_name
        );
        EXECUTE v_sql INTO v_remaining USING p_organization_id;
        v_total_remaining := v_total_remaining + coalesce(v_remaining, 0);
      EXCEPTION
        WHEN undefined_column THEN
          NULL;
      END;
    END LOOP;

    EXIT WHEN v_total_remaining = 0;
  END LOOP;

  IF v_total_remaining > 0 THEN
    RAISE EXCEPTION 'purge incomplete: % tenant rows remain after % passes',
      v_total_remaining, v_max_passes
      USING ERRCODE = '23503';
  END IF;

  DELETE FROM public.organizations
  WHERE id = p_organization_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'organization row missing after purge' USING ERRCODE = 'P0002';
  END IF;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  v_deleted := v_deleted || jsonb_build_object('organizations', v_count);

  RETURN v_deleted;
END;
$function$;
