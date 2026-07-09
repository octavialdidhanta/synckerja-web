import { useEffect, useMemo, useState } from "react";
import { usePlanPriceAdjustments } from "@/admin/hooks/usePlanPriceAdjustments";
import { useUpdatePlanPricing } from "@/admin/hooks/useUpdatePlanPricing";
import {
  formatIdr,
  formatIdrInput,
  parseIdrInput,
  validateDiscountPercent,
  validatePrice,
  validateTrialDays,
} from "@/admin/lib/formatCurrency";
import type { AdminSubscriptionPlan } from "@/admin/types/pricing";
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

type EditPlanPricingSheetProps = {
  plan: AdminSubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function EditPlanPricingSheet({ plan, open, onOpenChange }: EditPlanPricingSheetProps) {
  const [priceInput, setPriceInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [trialDaysInput, setTrialDaysInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { updatePlan } = useUpdatePlanPricing();
  const { data: adjustments } = usePlanPriceAdjustments(
    { entityType: "plan", entityId: plan?.id ?? null, limit: 5 },
    open && !!plan,
  );

  useEffect(() => {
    if (!plan || !open) return;
    setPriceInput(formatIdrInput(Number(plan.base_price_per_member)));
    setDiscountInput(
      plan.annual_discount_percentage === null ? "" : String(plan.annual_discount_percentage),
    );
    setTrialDaysInput(plan.jumlah_hari_trial === null ? "" : String(plan.jumlah_hari_trial));
    setIsActive(plan.is_active);
    setReason("");
    setConfirmOpen(false);
  }, [plan, open]);

  const basePrice = parseIdrInput(priceInput);
  const annualDiscount = discountInput.trim() === "" ? null : Number(discountInput);
  const trialDays = trialDaysInput.trim() === "" ? null : Number(trialDaysInput);

  const validationError = useMemo(() => {
    const priceErr = validatePrice(basePrice, "Harga per member");
    if (priceErr) return priceErr;
    const discountErr = validateDiscountPercent(annualDiscount);
    if (discountErr) return discountErr;
    const trialErr = validateTrialDays(trialDays);
    if (trialErr) return trialErr;
    if (reason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    if (!isActive && plan && plan.subscriber_count > 0) {
      return null;
    }
    return null;
  }, [basePrice, annualDiscount, trialDays, reason, isActive, plan]);

  const deactivateWarning =
    plan && !isActive && plan.is_active && plan.subscriber_count > 0
      ? `${plan.subscriber_count} org masih menggunakan plan ini.`
      : null;

  const handleSave = async () => {
    if (!plan || validationError || basePrice === null) return;

    try {
      await updatePlan.mutateAsync({
        plan_id: plan.id,
        base_price_per_member: basePrice,
        annual_discount_percentage: annualDiscount,
        jumlah_hari_trial: trialDays,
        is_active: isActive,
        reason: reason.trim(),
      });
      toast.success("Harga plan berhasil diperbarui.");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui plan.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setConfirmOpen(false);
    }
  };

  if (!plan) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit Plan</SheetTitle>
            <SheetDescription>{plan.name}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="plan-price">Harga per member / bulan</Label>
              <Input
                id="plan-price"
                inputMode="numeric"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="50.000"
              />
              {basePrice !== null && (
                <p className="text-xs text-muted-foreground">Preview: {formatIdr(basePrice)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-discount">Diskon tahunan (%)</Label>
              <Input
                id="plan-discount"
                inputMode="decimal"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Kosongkan jika tidak ada"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-trial">Jumlah hari trial</Label>
              <Input
                id="plan-trial"
                inputMode="numeric"
                value={trialDaysInput}
                onChange={(e) => setTrialDaysInput(e.target.value)}
                placeholder="Kosongkan untuk default office"
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <Label htmlFor="plan-active">Plan aktif</Label>
                {deactivateWarning && (
                  <p className="text-xs text-amber-600">{deactivateWarning}</p>
                )}
              </div>
              <Switch id="plan-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-reason">Alasan perubahan</Label>
              <Textarea
                id="plan-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Penyesuaian harga Q3 2026"
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
              disabled={!!validationError || updatePlan.isPending}
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
              Plan <strong>{plan.name}</strong> akan diubah menjadi{" "}
              <strong>{formatIdr(basePrice ?? 0)}</strong>/member
              {annualDiscount !== null ? `, diskon tahunan ${annualDiscount}%` : ""}.
              {deactivateWarning && (
                <>
                  <br />
                  <br />
                  Peringatan: {deactivateWarning}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updatePlan.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={updatePlan.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              {updatePlan.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
