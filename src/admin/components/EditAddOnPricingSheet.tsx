import { useEffect, useMemo, useState } from "react";
import { usePlanPriceAdjustments } from "@/admin/hooks/usePlanPriceAdjustments";
import { useUpdatePlanPricing } from "@/admin/hooks/useUpdatePlanPricing";
import {
  formatIdr,
  formatIdrInput,
  parseIdrInput,
  validatePrice,
} from "@/admin/lib/formatCurrency";
import type { AdminSubscriptionAddOn } from "@/admin/types/pricing";
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

type EditAddOnPricingSheetProps = {
  addOn: AdminSubscriptionAddOn | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditAddOnPricingSheet({ addOn, open, onOpenChange }: EditAddOnPricingSheetProps) {
  const [priceInput, setPriceInput] = useState("");
  const [followsDiscount, setFollowsDiscount] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { updateAddOn } = useUpdatePlanPricing();
  const { data: adjustments } = usePlanPriceAdjustments(
    { entityType: "add_on", entityId: addOn?.id ?? null, limit: 5 },
    open && !!addOn,
  );

  useEffect(() => {
    if (!addOn || !open) return;
    setPriceInput(formatIdrInput(Number(addOn.default_unit_price_per_month)));
    setFollowsDiscount(addOn.follows_plan_annual_discount);
    setIsActive(addOn.is_active);
    setReason("");
    setConfirmOpen(false);
  }, [addOn, open]);

  const defaultPrice = parseIdrInput(priceInput);

  const validationError = useMemo(() => {
    const priceErr = validatePrice(defaultPrice, "Harga default");
    if (priceErr) return priceErr;
    if (reason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [defaultPrice, reason]);

  const handleSave = async () => {
    if (!addOn || validationError || defaultPrice === null) return;

    try {
      await updateAddOn.mutateAsync({
        add_on_id: addOn.id,
        default_unit_price_per_month: defaultPrice,
        follows_plan_annual_discount: followsDiscount,
        is_active: isActive,
        reason: reason.trim(),
      });
      toast.success("Harga add-on berhasil diperbarui.");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui add-on.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setConfirmOpen(false);
    }
  };

  if (!addOn) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Add-on</SheetTitle>
            <SheetDescription>
              {addOn.name} ({addOn.code})
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="addon-price">Harga default / bulan</Label>
              <Input
                id="addon-price"
                inputMode="numeric"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
              />
              {defaultPrice !== null && (
                <p className="text-xs text-muted-foreground">Preview: {formatIdr(defaultPrice)}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="addon-follows">Ikuti diskon tahunan plan</Label>
              <Switch
                id="addon-follows"
                checked={followsDiscount}
                onCheckedChange={setFollowsDiscount}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="addon-active">Add-on aktif</Label>
              <Switch id="addon-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addon-reason">Alasan perubahan</Label>
              <Textarea
                id="addon-reason"
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
              disabled={!!validationError || updateAddOn.isPending}
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
            <AlertDialogTitle>Konfirmasi perubahan harga</AlertDialogTitle>
            <AlertDialogDescription>
              Add-on <strong>{addOn.name}</strong> akan diubah menjadi{" "}
              <strong>{formatIdr(defaultPrice ?? 0)}</strong>/bulan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateAddOn.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateAddOn.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              {updateAddOn.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
