import {
  SALES_MODULE_CATALOG,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import { Badge } from "@/share/ui/badge";
import { Switch } from "@/share/ui/switch";

type PlanModuleAccessFieldsProps = {
  moduleAccess: Record<SalesModuleKey, boolean>;
  onChange: (next: Record<SalesModuleKey, boolean>) => void;
  disabled?: boolean;
};

export default function PlanModuleAccessFields({
  moduleAccess,
  onChange,
  disabled = false,
}: PlanModuleAccessFieldsProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">Akses modul (mandiri)</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Modul nonaktif diblok di office untuk tenant mandiri (fase 2). Dashboard selalu aktif.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Dashboard: selalu aktif</Badge>
        <Badge variant="outline">Subscription: selalu aktif (mandiri)</Badge>
      </div>

      <div className="space-y-2">
        {SALES_MODULE_CATALOG.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {moduleAccess[key] ? "Aktif di plan ini" : "Nonaktif di plan ini"}
              </p>
            </div>
            <Switch
              checked={moduleAccess[key]}
              disabled={disabled}
              onCheckedChange={(checked) =>
                onChange({ ...moduleAccess, [key]: checked })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
