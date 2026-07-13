import { useEffect, useMemo, useState } from "react";
import PlanModuleAccessFields from "@/admin/components/PlanModuleAccessFields";
import { useCreateSubscriptionPlan } from "@/admin/hooks/useCreateSubscriptionPlan";
import {
  formatIdr,
  maxMembersAppliesToPlan,
  parseIdrInput,
  validateDiscountPercent,
  validateMaxMembers,
  validatePrice,
  validateTrialDays,
} from "@/admin/lib/formatCurrency";
import {
  createDefaultSalesModulesRecord,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
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

type CreatePlanSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export default function CreatePlanSheet({ open, onOpenChange }: CreatePlanSheetProps) {
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [trialDaysInput, setTrialDaysInput] = useState("");
  const [maxMembersInput, setMaxMembersInput] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState("");
  const [moduleAccess, setModuleAccess] = useState<Record<SalesModuleKey, boolean>>(
    createDefaultSalesModulesRecord,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutateAsync: createPlan, isPending } = useCreateSubscriptionPlan();

  useEffect(() => {
    if (!open) return;
    setNameInput("");
    setDescriptionInput("");
    setPriceInput("");
    setDiscountInput("");
    setTrialDaysInput("");
    setMaxMembersInput("1");
    setIsActive(true);
    setReason("");
    setModuleAccess(createDefaultSalesModulesRecord());
    setConfirmOpen(false);
  }, [open]);

  const slug = nameInput.trim().toLowerCase();
  const basePrice = parseIdrInput(priceInput);
  const annualDiscount = discountInput.trim() === "" ? null : Number(discountInput);
  const trialDays = trialDaysInput.trim() === "" ? null : Number(trialDaysInput);
  const maxMembersApplies = maxMembersAppliesToPlan(basePrice);
  const maxMembers = maxMembersApplies
    ? maxMembersInput.trim() === ""
      ? null
      : Number(maxMembersInput.replace(/[^\d]/g, ""))
    : null;

  useEffect(() => {
    if (!maxMembersApplies) return;
    setMaxMembersInput((prev) => (prev.trim() === "" ? "1" : prev));
  }, [maxMembersApplies]);

  const validationError = useMemo(() => {
    if (!slug || slug.length < 2) return "Nama plan wajib diisi (min. 2 karakter).";
    if (!SLUG_PATTERN.test(slug)) {
      return "Nama plan harus slug lowercase (a-z, 0-9, tanda hubung).";
    }
    const priceErr = validatePrice(basePrice, "Harga per member");
    if (priceErr) return priceErr;
    const discountErr = validateDiscountPercent(annualDiscount);
    if (discountErr) return discountErr;
    const trialErr = validateTrialDays(trialDays);
    if (trialErr) return trialErr;
    if (maxMembersApplies) {
      const maxErr = validateMaxMembers(maxMembers);
      if (maxErr) return maxErr;
    }
    if (reason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [slug, basePrice, annualDiscount, trialDays, maxMembersApplies, maxMembers, reason]);

  const enabledModuleCount = useMemo(
    () => Object.values(moduleAccess).filter(Boolean).length,
    [moduleAccess],
  );

  const handleCreate = async () => {
    if (validationError || basePrice === null) return;

    try {
      await createPlan({
        name: slug,
        base_price_per_member: basePrice,
        modules: moduleAccess,
        is_active: isActive,
        reason: reason.trim(),
        max_members: maxMembers,
        description: descriptionInput.trim() || null,
        annual_discount_percentage: annualDiscount,
        jumlah_hari_trial: trialDays,
      });
      toast.success(`Plan "${slug}" berhasil dibuat.`);
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membuat plan.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Buat Plan</SheetTitle>
            <SheetDescription>
              Plan baru untuk tenant mandiri. Modul aktif di-generate ke features office.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="create-plan-name">Nama plan (slug)</Label>
              <Input
                id="create-plan-name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="scale-up"
              />
              {slug && SLUG_PATTERN.test(slug) && (
                <p className="text-xs text-muted-foreground">Slug: {slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-plan-desc">Deskripsi (opsional)</Label>
              <Textarea
                id="create-plan-desc"
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                rows={2}
                placeholder="Ringkasan plan untuk office"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-plan-price">Harga per member / bulan</Label>
              <Input
                id="create-plan-price"
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
              <Label htmlFor="create-plan-discount">Diskon tahunan (%)</Label>
              <Input
                id="create-plan-discount"
                inputMode="decimal"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Kosongkan jika tidak ada"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-plan-trial">Jumlah hari trial</Label>
              <Input
                id="create-plan-trial"
                inputMode="numeric"
                value={trialDaysInput}
                onChange={(e) => setTrialDaysInput(e.target.value)}
                placeholder="Kosongkan untuk default office"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-plan-max-members">Max member (cap plan)</Label>
              <Input
                id="create-plan-max-members"
                inputMode="numeric"
                value={maxMembersApplies ? maxMembersInput : ""}
                onChange={(e) => setMaxMembersInput(e.target.value)}
                placeholder={maxMembersApplies ? "1" : "—"}
                disabled={!maxMembersApplies}
              />
              <p className="text-xs text-muted-foreground">
                {maxMembersApplies
                  ? "Hanya untuk plan gratis (Rp 0). Batas seat saat subscribe."
                  : "Tidak berlaku untuk plan berbayar — office menentukan jumlah member × harga."}
              </p>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="create-plan-active">Plan aktif</Label>
              <Switch id="create-plan-active" checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <PlanModuleAccessFields
              moduleAccess={moduleAccess}
              onChange={setModuleAccess}
              disabled={isPending}
            />

            <div className="space-y-2">
              <Label htmlFor="create-plan-reason">Alasan pembuatan</Label>
              <Textarea
                id="create-plan-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Contoh: Plan baru untuk paket enterprise Q3"
              />
            </div>
          </div>

          <SheetFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button disabled={!!validationError || isPending} onClick={() => setConfirmOpen(true)}>
              Buat plan
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi buat plan</AlertDialogTitle>
            <AlertDialogDescription>
              Plan <strong>{slug}</strong> akan dibuat dengan harga{" "}
              <strong>{formatIdr(basePrice ?? 0)}</strong>/member
              {annualDiscount !== null ? `, diskon tahunan ${annualDiscount}%` : ""}.
              <br />
              <br />
              Modul aktif: <strong>{enabledModuleCount}</strong> dari 8.
              <br />
              Max member:{" "}
              <strong>
                {maxMembersApplies ? (maxMembers ?? "—") : "— (berdasarkan jumlah member)"}
              </strong>.
              {!isActive && (
                <>
                  <br />
                  Plan akan dibuat dalam status nonaktif.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleCreate();
              }}
            >
              {isPending ? "Membuat..." : "Ya, buat plan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
