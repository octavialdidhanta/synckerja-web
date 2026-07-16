import {
  applySalesModuleParentRules,
  getSubModulesForParent,
  SALES_MODULE_TOP_LEVEL,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import { Switch } from "@/share/ui/switch";

type SalesModuleAccessFieldsProps = {
  moduleAccess: Record<SalesModuleKey, boolean>;
  onChange: (next: Record<SalesModuleKey, boolean>) => void;
  disabled?: boolean;
};

function orgSalesStatusText(enabled: boolean): string {
  return enabled ? "Aktif — tenant bisa akses modul" : "Blocked — upsell di office";
}

export default function SalesModuleAccessFields({
  moduleAccess,
  onChange,
  disabled = false,
}: SalesModuleAccessFieldsProps) {
  const handleToggle = (key: SalesModuleKey, checked: boolean) => {
    onChange(applySalesModuleParentRules(moduleAccess, key, checked));
  };

  return (
    <div className="space-y-2">
      {SALES_MODULE_TOP_LEVEL.map(({ key, label }) => {
        const subModules = getSubModulesForParent(key, "orgSales");
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

            {subModules.length > 0 ? (
              <div className="space-y-2 border-t bg-muted/30 px-3 pb-3 pt-2">
                {subModules.map((sub) => {
                  const subEnabled = moduleAccess[sub.key];
                  const subDisabled = disabled || !parentEnabled;

                  return (
                    <div
                      key={sub.key}
                      className="flex items-center justify-between gap-3 rounded-md border border-l-4 border-l-muted-foreground/30 bg-background pl-4 pr-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{sub.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {subEnabled
                            ? orgSalesStatusText(true)
                            : parentEnabled
                              ? orgSalesStatusText(false)
                              : "Prasyarat: Digital Marketing aktif"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80">{sub.description}</p>
                      </div>
                      <Switch
                        checked={subEnabled}
                        disabled={subDisabled}
                        onCheckedChange={(checked) => handleToggle(sub.key, checked)}
                      />
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
