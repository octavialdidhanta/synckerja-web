-- Jalankan SATU BLOK per kali di Supabase SQL Editor.
-- Jika timeout: tunggu 2-5 menit, restart project di Dashboard, lalu coba lagi.
-- Jangan jalankan seluruh file sekaligus saat DB sibuk.

-- ========== BLOK 1: helper (copy & run dulu) ==========
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
    SELECT unnest(ARRAY[
      'employees',
      'user_organizations',
      'payments',
      'organization_subscriptions',
      'attendance_records',
      'payroll_runs',
      'crm_leads',
      'projects',
      'social_media_posts',
      'social_media_scheduler_tick_logs'
    ]) AS table_name
  LOOP
    IF to_regclass(format('public.%I', r.table_name)) IS NULL THEN
      CONTINUE;
    END IF;

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

-- ========== BLOK 2: preview RPC (setelah blok 1 sukses) ==========
CREATE OR REPLACE FUNCTION public.admin_preview_organization_deletion(p_organization_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  v_org public.organizations%ROWTYPE;
  v_sub public.organization_subscriptions%ROWTYPE;
  v_table_counts jsonb;
  v_member_count bigint := 0;
  v_user_count bigint := 0;
  v_auth_delete_count int;
BEGIN
  IF NOT public.is_cms_admin() THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_org FROM public.organizations WHERE id = p_organization_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'organization not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT * INTO v_sub FROM public.organization_subscriptions WHERE organization_id = p_organization_id;

  IF to_regclass('public.user_organizations') IS NOT NULL THEN
    SELECT count(*)::bigint INTO v_user_count
    FROM public.user_organizations
    WHERE organization_id = p_organization_id;
  END IF;

  IF to_regclass('public.employees') IS NOT NULL THEN
    SELECT count(*)::bigint INTO v_member_count
    FROM public.employees
    WHERE organization_id = p_organization_id;
  END IF;

  v_table_counts := public._preview_organization_key_counts(p_organization_id);
  v_auth_delete_count := coalesce(
    cardinality(public._collect_organization_auth_users_to_delete(p_organization_id)),
    0
  );

  RETURN jsonb_build_object(
    'organization_id', v_org.id,
    'company_name', v_org.company_name,
    'email', v_org.email,
    'created_at', v_org.created_at,
    'subscription_status', v_sub.status,
    'is_trial', coalesce(v_sub.is_trial, false),
    'has_active_subscription', coalesce(v_org.has_active_subscription, false),
    'member_count', v_member_count,
    'user_count', v_user_count,
    'auth_users_to_delete', v_auth_delete_count,
    'table_counts', v_table_counts,
    'table_counts_scope', 'key_tables_only',
    'has_cms_admin_member', public._organization_has_cms_admin_member(p_organization_id),
    'confirm_phrase', 'hapus organisasi ini'
  );
END;
$function$;

COMMENT ON FUNCTION public.admin_preview_organization_deletion(uuid) IS
  'CMS admin: lightweight preview (key tables only) before deleting an organization.';

-- ========== BLOK 3: verifikasi (opsional) ==========
SELECT proname FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND proname IN ('_preview_organization_key_counts', 'admin_preview_organization_deletion');
