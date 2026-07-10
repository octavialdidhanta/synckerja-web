import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import {
  createDefaultSalesModulesRecord,
  SALES_MODULE_KEYS,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import type { OrganizationSalesModules } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

function parseSalesModules(data: Record<string, unknown>): Record<SalesModuleKey, boolean> {
  const defaults = createDefaultSalesModulesRecord();
  const modules = (data.modules ?? {}) as Record<string, boolean>;
  for (const key of SALES_MODULE_KEYS) {
    defaults[key] = Boolean(modules[key]);
  }
  return defaults;
}

async function fetchOrganizationSalesModules(
  organizationId: string,
): Promise<OrganizationSalesModules> {
  const { data, error } = await supabase.rpc("admin_get_organization_sales_modules", {
    p_organization_id: organizationId,
  });

  if (error) throw error;

  const payload = data as Record<string, unknown>;
  return {
    organization_id: organizationId,
    is_sales_tenant: Boolean(payload.is_sales_tenant),
    modules: parseSalesModules(payload),
  };
}

export function useOrganizationSalesModules(organizationId: string | null) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["organization-sales-modules", organizationId],
    queryFn: () => fetchOrganizationSalesModules(organizationId!),
    enabled: isCmsAdmin && !!organizationId,
  });
}
