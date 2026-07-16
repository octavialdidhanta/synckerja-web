/**
 * Sales tenant module catalog — keep in sync with public.sales_module_catalog_keys() in Supabase.
 */

/** Top-level module toggles (plan editor + org sales sheet). */
export const SALES_MODULE_TOP_LEVEL = [
  { key: "okr", label: "OKR" },
  { key: "humanResources", label: "Human Resources" },
  { key: "finance", label: "Finance" },
  { key: "digitalMarketing", label: "Digital Marketing" },
  { key: "omnichannel", label: "Operations / Omnichannel" },
  { key: "operations", label: "Sales Operations" },
  { key: "tools", label: "Tools" },
  { key: "requestForm", label: "Request Form" },
] as const;

/** Plan-card-only flags (CMS plan editor — not org routing / nav). */
export const SALES_PLAN_FEATURE_TOGGLES = [
  {
    key: "customModules",
    label: "Custom Modul",
    hint: "Tampilkan label modul kustom di kartu plan office",
  },
  {
    key: "customerSupport",
    label: "Customer Support",
    hint: "Label di kartu plan office mengikuti tier plan",
  },
] as const;

export type SalesModuleTopLevelKey = (typeof SALES_MODULE_TOP_LEVEL)[number]["key"];
export type SalesPlanFeatureKey = (typeof SALES_PLAN_FEATURE_TOGGLES)[number]["key"];

export type SalesSubModuleScope = "orgSales";

export type SalesSubModuleDefinition = {
  key: "leadMagnet";
  label: string;
  parentKey: SalesModuleTopLevelKey;
  description: string;
  scopes: readonly SalesSubModuleScope[];
};

/** Sub-modules nested under a parent — shown only in org sales sheet, not plan editor. */
export const SALES_SUB_MODULES: readonly SalesSubModuleDefinition[] = [
  {
    key: "leadMagnet",
    label: "Lead Magnet",
    parentKey: "digitalMarketing",
    description: "Add-on — aktifkan manual untuk tenant sales",
    scopes: ["orgSales"],
  },
] as const;

export type SalesSubModuleKey = (typeof SALES_SUB_MODULES)[number]["key"];

/** Plan editor catalog: routed modules + plan-card feature toggles. */
export const SALES_MODULE_CATALOG = [
  ...SALES_MODULE_TOP_LEVEL,
  ...SALES_PLAN_FEATURE_TOGGLES,
] as const;

export type SalesModuleCatalogKey = SalesModuleTopLevelKey | SalesPlanFeatureKey;

export type SalesModuleKey = SalesModuleCatalogKey | SalesSubModuleKey;

export const SALES_MODULE_KEYS: SalesModuleKey[] = [
  ...SALES_MODULE_CATALOG.map((m) => m.key),
  ...SALES_SUB_MODULES.map((m) => m.key),
];

export function createDefaultSalesModulesRecord(): Record<SalesModuleKey, boolean> {
  return SALES_MODULE_KEYS.reduce(
    (acc, key) => {
      acc[key] = key === "customerSupport";
      return acc;
    },
    {} as Record<SalesModuleKey, boolean>,
  );
}

export function salesModuleLabel(key: SalesModuleKey): string {
  const catalog = SALES_MODULE_CATALOG.find((m) => m.key === key);
  if (catalog) return catalog.label;
  const sub = SALES_SUB_MODULES.find((m) => m.key === key);
  return sub?.label ?? key;
}

export function getSubModulesForParent(
  parentKey: SalesModuleTopLevelKey,
  scope: SalesSubModuleScope,
): SalesSubModuleDefinition[] {
  return SALES_SUB_MODULES.filter(
    (mod) => mod.parentKey === parentKey && mod.scopes.includes(scope),
  );
}

export function applySalesModuleParentRules(
  modules: Record<SalesModuleKey, boolean>,
  changedKey: SalesModuleKey,
  nextValue: boolean,
): Record<SalesModuleKey, boolean> {
  const next = { ...modules, [changedKey]: nextValue };

  if (changedKey === "digitalMarketing" && !nextValue) {
    for (const sub of getSubModulesForParent("digitalMarketing", "orgSales")) {
      next[sub.key] = false;
    }
  }

  return next;
}

export function coerceSalesModuleDependencies(
  modules: Record<SalesModuleKey, boolean>,
): Record<SalesModuleKey, boolean> {
  const next = { ...modules };

  for (const sub of SALES_SUB_MODULES) {
    if (!next[sub.parentKey]) {
      next[sub.key] = false;
    }
  }

  return next;
}
