import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { AdminOrganizationRow, OrganizationSubscriptionFilter } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

function mapFilterToRpc(filter: OrganizationSubscriptionFilter): string | null {
  if (filter === "active") return "active";
  if (filter === "expired") return "expired";
  return null;
}

async function fetchAdminOrganizations(
  filter: OrganizationSubscriptionFilter,
  search: string,
): Promise<AdminOrganizationRow[]> {
  const { data, error } = await supabase.rpc("admin_list_organizations", {
    p_status_filter: mapFilterToRpc(filter),
    p_search: search.trim() || null,
    p_limit: 200,
    p_offset: 0,
  });

  if (error) throw error;
  return (data ?? []) as AdminOrganizationRow[];
}

export function useAdminOrganizations(filter: OrganizationSubscriptionFilter, search: string) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin-organizations", filter, search.trim()],
    queryFn: () => fetchAdminOrganizations(filter, search),
    enabled: isCmsAdmin,
  });
}
