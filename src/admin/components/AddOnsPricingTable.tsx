import { useState } from "react";
import EditAddOnPricingSheet from "@/admin/components/EditAddOnPricingSheet";
import EditPlanAddOnOverrideSheet from "@/admin/components/EditPlanAddOnOverrideSheet";
import { useAdminAddOns, usePlanAddOnOverrides } from "@/admin/hooks/useAdminAddOns";
import { formatIdr } from "@/admin/lib/formatCurrency";
import type { AdminSubscriptionAddOn, PlanAddOnOverride } from "@/admin/types/pricing";
import { cn } from "@/home/lib/utils";
import { Badge } from "@/share/ui/badge";
import { Button } from "@/share/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/share/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/share/ui/table";

function ActiveBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={cn(
        active
          ? "border-transparent bg-emerald-100 text-emerald-800"
          : "border-transparent bg-muted text-muted-foreground",
      )}
    >
      {active ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}

export default function AddOnsPricingTable() {
  const { data: addOns, isLoading, error } = useAdminAddOns();
  const { data: overrides, isLoading: overridesLoading } = usePlanAddOnOverrides();
  const [editAddOn, setEditAddOn] = useState<AdminSubscriptionAddOn | null>(null);
  const [editOverride, setEditOverride] = useState<PlanAddOnOverride | null>(null);
  const [addOnSheetOpen, setAddOnSheetOpen] = useState(false);
  const [overrideSheetOpen, setOverrideSheetOpen] = useState(false);

  const addOnRows = addOns ?? [];
  const overrideRows = overrides ?? [];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Add-ons</CardTitle>
          <CardDescription>
            Harga default add-on global. Add-on baru ditambahkan lewat migration SQL ke Supabase (bukan tombol di
            halaman ini). Panduan: documents/HANDOFF-subscription-addons-catalog.md
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Memuat data...</p>}
          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Gagal memuat add-ons"}
            </p>
          )}

          {!isLoading && !error && addOnRows.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Harga default</TableHead>
                    <TableHead>Ikuti diskon plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {addOnRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="font-mono text-xs">{row.code}</TableCell>
                      <TableCell>{formatIdr(Number(row.default_unit_price_per_month))}</TableCell>
                      <TableCell>{row.follows_plan_annual_discount ? "Ya" : "Tidak"}</TableCell>
                      <TableCell>
                        <ActiveBadge active={row.is_active} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditAddOn(row);
                            setAddOnSheetOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Override per Plan</CardTitle>
          <CardDescription>
            Harga khusus add-on per plan. Kosong = pakai harga default add-on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overridesLoading && (
            <p className="text-sm text-muted-foreground">Memuat override...</p>
          )}

          {!overridesLoading && overrideRows.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada relasi plan-add-on.</p>
          )}

          {!overridesLoading && overrideRows.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Add-on</TableHead>
                    <TableHead>Override</TableHead>
                    <TableHead>Harga efektif</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overrideRows.map((row) => (
                    <TableRow key={`${row.subscription_plan_id}-${row.add_on_id}`}>
                      <TableCell>{row.plan_name}</TableCell>
                      <TableCell>
                        {row.add_on_name}
                        <span className="ml-1 font-mono text-xs text-muted-foreground">
                          ({row.add_on_code})
                        </span>
                      </TableCell>
                      <TableCell>
                        {row.unit_price_override_per_month === null
                          ? "—"
                          : formatIdr(Number(row.unit_price_override_per_month))}
                      </TableCell>
                      <TableCell>{formatIdr(Number(row.resolved_unit_price_per_month))}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditOverride(row);
                            setOverrideSheetOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditAddOnPricingSheet
        addOn={editAddOn}
        open={addOnSheetOpen}
        onOpenChange={(open) => {
          setAddOnSheetOpen(open);
          if (!open) setEditAddOn(null);
        }}
      />

      <EditPlanAddOnOverrideSheet
        override={editOverride}
        open={overrideSheetOpen}
        onOpenChange={(open) => {
          setOverrideSheetOpen(open);
          if (!open) setEditOverride(null);
        }}
      />
    </>
  );
}
