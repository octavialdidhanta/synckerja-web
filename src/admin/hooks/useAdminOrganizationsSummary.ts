import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { AdminOrganizationsSummary } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function fetchAdminOrganizationsSummary(): Promise<AdminOrganizationsSummary> {
  const { data, error } = await supabase.rpc("admin_organizations_summary");
  if (error) throw error;

  const summary = data as AdminOrganizationsSummary | null;
  return {
    total_count: summary?.total_count ?? 0,
    active_count: summary?.active_count ?? 0,
    trial_count: summary?.trial_count ?? 0,
    expired_count: summary?.expired_count ?? 0,
  };
}

export function useAdminOrganizationsSummary() {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin-organizations-summary"],
    queryFn: fetchAdminOrganizationsSummary,
    enabled: isCmsAdmin,
  });
}
