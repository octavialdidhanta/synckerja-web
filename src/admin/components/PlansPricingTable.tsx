import { useState } from "react";
import CreatePlanSheet from "@/admin/components/CreatePlanSheet";
import EditPlanPricingSheet from "@/admin/components/EditPlanPricingSheet";
import { useAdminPlans } from "@/admin/hooks/useAdminPlans";
import { formatIdr } from "@/admin/lib/formatCurrency";
import type { AdminSubscriptionPlan } from "@/admin/types/pricing";
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

export default function PlansPricingTable() {
  const { data, isLoading, error } = useAdminPlans();
  const [editPlan, setEditPlan] = useState<AdminSubscriptionPlan | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const rows = data ?? [];

  const openEdit = (plan: AdminSubscriptionPlan) => {
    setEditPlan(plan);
    setSheetOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Katalog plan global — harga & modul mandiri dikonfigurasi di CMS
            </CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Buat plan</Button>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Memuat data...</p>}
          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Gagal memuat plans"}
            </p>
          )}

          {!isLoading && !error && rows.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada plan.</p>
          )}

          {!isLoading && !error && rows.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Harga/member</TableHead>
                    <TableHead>Diskon tahunan</TableHead>
                    <TableHead>Hari trial</TableHead>
                    <TableHead>Max member</TableHead>
                    <TableHead>Subscriber</TableHead>
                    <TableHead>Modul aktif</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell>{formatIdr(Number(row.base_price_per_member))}</TableCell>
                      <TableCell>
                        {row.annual_discount_percentage === null
                          ? "—"
                          : `${row.annual_discount_percentage}%`}
                      </TableCell>
                      <TableCell>{row.jumlah_hari_trial ?? "—"}</TableCell>
                      <TableCell>
                        {Number(row.base_price_per_member) > 0 ? "—" : (row.max_members ?? "—")}
                      </TableCell>
                      <TableCell>{row.subscriber_count}</TableCell>
                      <TableCell>
                        {row.enabled_module_labels && row.enabled_module_labels.length > 0 ? (
                          <div className="flex max-w-[220px] flex-wrap gap-1">
                            {row.enabled_module_labels.map((label) => (
                              <Badge
                                key={label}
                                variant="secondary"
                                className="whitespace-nowrap text-xs font-normal"
                              >
                                {label}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ActiveBadge active={row.is_active} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
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

      <CreatePlanSheet open={createOpen} onOpenChange={setCreateOpen} />

      <EditPlanPricingSheet
        plan={editPlan}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditPlan(null);
        }}
      />
    </>
  );
}
