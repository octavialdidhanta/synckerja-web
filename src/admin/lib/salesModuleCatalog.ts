/**
 * Sales tenant module catalog — keep in sync with public.sales_module_catalog_keys() in Supabase.
 */
export const SALES_MODULE_CATALOG = [
  { key: "okr", label: "OKR" },
  { key: "humanResources", label: "Human Resources" },
  { key: "finance", label: "Finance" },
  { key: "digitalMarketing", label: "Digital Marketing" },
  { key: "omnichannel", label: "Operations / Omnichannel" },
  { key: "operations", label: "Sales Operations" },
  { key: "tools", label: "Tools" },
  { key: "requestForm", label: "Request Form" },
] as const;

export type SalesModuleKey = (typeof SALES_MODULE_CATALOG)[number]["key"];

export const SALES_MODULE_KEYS: SalesModuleKey[] = SALES_MODULE_CATALOG.map((m) => m.key);

export function createDefaultSalesModulesRecord(): Record<SalesModuleKey, boolean> {
  return SALES_MODULE_KEYS.reduce(
    (acc, key) => {
      acc[key] = false;
      return acc;
    },
    {} as Record<SalesModuleKey, boolean>,
  );
}

export function salesModuleLabel(key: SalesModuleKey): string {
  return SALES_MODULE_CATALOG.find((m) => m.key === key)?.label ?? key;
}
