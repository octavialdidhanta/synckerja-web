import { useEffect, useMemo, useState } from "react";
import { usePlanPriceAdjustments } from "@/admin/hooks/usePlanPriceAdjustments";
import { useUpdatePlanPricing } from "@/admin/hooks/useUpdatePlanPricing";
import {
  formatIdr,
  formatIdrInput,
  parseIdrInput,
  validatePrice,
} from "@/admin/lib/formatCurrency";
import type { PlanAddOnOverride } from "@/admin/types/pricing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/share/ui/alert-dialog";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/share/ui/sheet";
import { Switch } from "@/share/ui/switch";
import { Textarea } from "@/share/ui/textarea";
import { toast } from "@/share/ui/sonner";

type EditPlanAddOnOverrideSheetProps = {
  override: PlanAddOnOverride | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditPlanAddOnOverrideSheet({
  override,
  open,
  onOpenChange,
}: EditPlanAddOnOverrideSheetProps) {
  const [useOverride, setUseOverride] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { updateOverride } = useUpdatePlanPricing();
  const { data: adjustments } = usePlanPriceAdjustments(
    {
      entityType: "plan_add_on",
      planId: override?.subscription_plan_id ?? null,
      addOnId: override?.add_on_id ?? null,
      limit: 5,
    },
    open && !!override,
  );

  useEffect(() => {
    if (!override || !open) return;
    const hasOverride = override.unit_price_override_per_month !== null;
    setUseOverride(hasOverride);
    setPriceInput(
      hasOverride ? formatIdrInput(Number(override.unit_price_override_per_month)) : "",
    );
    setReason("");
    setConfirmOpen(false);
  }, [override, open]);

  const overridePrice = useOverride ? parseIdrInput(priceInput) : null;

  const resolvedPrice = useMemo(() => {
    if (!override) return null;
    if (!useOverride) return override.default_unit_price_per_month;
    return overridePrice ?? override.default_unit_price_per_month;
  }, [override, useOverride, overridePrice]);

  const validationError = useMemo(() => {
    if (useOverride) {
      const priceErr = validatePrice(overridePrice, "Harga override");
      if (priceErr) return priceErr;
    }
    if (reason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [useOverride, overridePrice, reason]);

  const handleSave = async () => {
    if (!override || validationError) return;

    try {
      await updateOverride.mutateAsync({
        plan_id: override.subscription_plan_id,
        add_on_id: override.add_on_id,
        unit_price_override_per_month: useOverride ? overridePrice : null,
        reason: reason.trim(),
      });
      toast.success("Override harga berhasil diperbarui.");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui override.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setConfirmOpen(false);
    }
  };

  if (!override) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Override Harga Add-on</SheetTitle>
            <SheetDescription>
              {override.plan_name} · {override.add_on_name}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <p className="text-sm text-muted-foreground">
              Default add-on: {formatIdr(override.default_unit_price_per_month)}
            </p>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="use-override">Gunakan harga khusus untuk plan ini</Label>
              <Switch id="use-override" checked={useOverride} onCheckedChange={setUseOverride} />
            </div>

            {useOverride && (
              <div className="space-y-2">
                <Label htmlFor="override-price">Harga override / bulan</Label>
                <Input
                  id="override-price"
                  inputMode="numeric"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                />
              </div>
            )}

            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-medium">Harga efektif setelah simpan</p>
              <p className="mt-1">{formatIdr(resolvedPrice)}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-reason">Alasan perubahan</Label>
              <Textarea
                id="override-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Riwayat perubahan</p>
              {adjustments?.length === 0 && (
                <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
              )}
              {adjustments?.map((item) => (
                <div key={item.id} className="rounded-md border p-3 text-xs">
                  <p className="font-medium">{item.reason}</p>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(item.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <SheetFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              disabled={!!validationError || updateOverride.isPending}
              onClick={() => setConfirmOpen(true)}
            >
              Simpan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi override</AlertDialogTitle>
            <AlertDialogDescription>
              Harga efektif untuk <strong>{override.add_on_name}</strong> di plan{" "}
              <strong>{override.plan_name}</strong>:{" "}
              <strong>{formatIdr(resolvedPrice)}</strong>
              {!useOverride && " (menggunakan harga default add-on)"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateOverride.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateOverride.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              {updateOverride.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
