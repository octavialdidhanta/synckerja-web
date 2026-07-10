import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { OrganizationModuleAdjustmentRow } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function fetchOrganizationModuleAdjustments(
  organizationId: string,
  limit: number,
): Promise<OrganizationModuleAdjustmentRow[]> {
  const { data, error } = await supabase.rpc("admin_list_organization_module_adjustments", {
    p_organization_id: organizationId,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as OrganizationModuleAdjustmentRow[];
}

export function useOrganizationModuleAdjustments(organizationId: string | null, limit = 20) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["organization-module-adjustments", organizationId, limit],
    queryFn: () => fetchOrganizationModuleAdjustments(organizationId!, limit),
    enabled: isCmsAdmin && !!organizationId,
  });
}
