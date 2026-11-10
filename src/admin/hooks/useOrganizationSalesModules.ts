import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import { parseBillingMode, parseContractIdr } from "@/admin/lib/salesContractPackage";
import {
  createDefaultSalesModulesRecord,
  SALES_MODULE_KEYS,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import type {
  OmnichannelRosterMember,
  OrganizationSalesModules,
  SalesOutletChoice,
} from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

function parseCount(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function parseOptionalCount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null;
}

function parseOutlets(value: unknown): SalesOutletChoice[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string") return [];
    return [
      {
        id: row.id,
        name: typeof row.name === "string" ? row.name : "",
        is_active: Boolean(row.is_active),
        is_default: Boolean(row.is_default),
      },
    ];
  });
}

function parseRoster(value: unknown): OmnichannelRosterMember[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.employee_id !== "string") return [];
    return [
      {
        employee_id: row.employee_id,
        full_name: typeof row.full_name === "string" ? row.full_name : "",
        email: typeof row.email === "string" ? row.email : null,
        role: typeof row.role === "string" ? row.role : "",
      },
    ];
  });
}

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
    omnichannel_paid_seat_count: parseCount(payload.omnichannel_paid_seat_count),
    hr_seat_count: parseCount(payload.hr_seat_count),
    active_employee_count: parseCount(payload.active_employee_count),
    roster_eligible_employee_count: parseCount(payload.roster_eligible_employee_count),
    omnichannel_roster: parseRoster(payload.omnichannel_roster),
    sales_outlet_quota: parseOptionalCount(payload.sales_outlet_quota),
    outlets: parseOutlets(payload.outlets),
    sales_monthly_price_idr: parseContractIdr(payload.sales_monthly_price_idr),
    sales_billing_mode: parseBillingMode(payload.sales_billing_mode),
    sales_ppn_included: typeof payload.sales_ppn_included === "boolean" ? payload.sales_ppn_included : null,
    sales_price_effective_on:
      typeof payload.sales_price_effective_on === "string"
        ? payload.sales_price_effective_on.slice(0, 10)
        : null,
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
