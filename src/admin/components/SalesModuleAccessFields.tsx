import type { ReactNode } from "react";
import {
  applySalesModuleParentRules,
  getSubModulesForParent,
  SALES_MODULE_TOP_LEVEL,
  SALES_ORG_ONLY_MODULES,
  type SalesModuleKey,
  type SalesModuleTopLevelKey,
} from "@/admin/lib/salesModuleCatalog";
import { Switch } from "@/share/ui/switch";

type SalesModuleAccessFieldsProps = {
  moduleAccess: Record<SalesModuleKey, boolean>;
  onChange: (next: Record<SalesModuleKey, boolean>) => void;
  disabled?: boolean;
  afterModule?: Partial<Record<SalesModuleKey, ReactNode>>;
  afterSubModule?: Partial<Record<SalesModuleKey, ReactNode>>;
};

function orgSalesStatusText(enabled: boolean): string {
  return enabled ? "Aktif — tenant bisa akses modul" : "Blocked — upsell di office";
}

export default function SalesModuleAccessFields({
  moduleAccess,
  onChange,
  disabled = false,
  afterModule,
  afterSubModule,
}: SalesModuleAccessFieldsProps) {
  const handleToggle = (key: SalesModuleKey, checked: boolean) => {
    onChange(applySalesModuleParentRules(moduleAccess, key, checked));
  };

  const orgModules = [
    SALES_MODULE_TOP_LEVEL[0],
    SALES_MODULE_TOP_LEVEL[1],
    ...SALES_ORG_ONLY_MODULES,
    ...SALES_MODULE_TOP_LEVEL.slice(2),
  ];

  return (
    <div className="space-y-2">
      {orgModules.map(({ key, label }) => {
        const parentKey = SALES_MODULE_TOP_LEVEL.find((mod) => mod.key === key)?.key;
        const subModules = parentKey
          ? getSubModulesForParent(parentKey as SalesModuleTopLevelKey, "orgSales")
          : [];
        const parentEnabled = moduleAccess[key];

        return (
          <div key={key} className="rounded-md border">
            <div className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{orgSalesStatusText(parentEnabled)}</p>
              </div>
              <Switch
                checked={parentEnabled}
                disabled={disabled}
                onCheckedChange={(checked) => handleToggle(key, checked)}
              />
            </div>

            {afterModule?.[key] ? (
              <div className="border-t px-3 py-2.5">{afterModule[key]}</div>
            ) : null}

            {subModules.length > 0 ? (
              <div className="space-y-2 border-t bg-muted/30 px-3 pb-3 pt-2">
                {subModules.map((sub) => {
                  const subEnabled = moduleAccess[sub.key];
                  const subDisabled = disabled || !parentEnabled;

                  return (
                    <div key={sub.key} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 rounded-md border border-l-4 border-l-muted-foreground/30 bg-background pl-4 pr-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{sub.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {subEnabled
                              ? orgSalesStatusText(true)
                              : parentEnabled
                                ? orgSalesStatusText(false)
                                : `Prasyarat: ${label} aktif`}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground/80">{sub.description}</p>
                        </div>
                        <Switch
                          checked={subEnabled}
                          disabled={subDisabled}
                          onCheckedChange={(checked) => handleToggle(sub.key, checked)}
                        />
                      </div>
                      {afterSubModule?.[sub.key] ?? null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
