import { useEffect, useMemo, useState } from "react";
import BillingTermDiscountFields from "@/admin/components/BillingTermDiscountFields";
import PlanModuleAccessFields from "@/admin/components/PlanModuleAccessFields";
import { usePlanModuleAdjustments } from "@/admin/hooks/usePlanModuleAdjustments";
import { usePlanModules } from "@/admin/hooks/usePlanModules";
import { usePlanPriceAdjustments } from "@/admin/hooks/usePlanPriceAdjustments";
import { useUpdatePlanModules } from "@/admin/hooks/useUpdatePlanModules";
import { useUpdatePlanPricing } from "@/admin/hooks/useUpdatePlanPricing";
import {
  formatIdr,
  formatIdrInput,
  maxMembersFieldEnabled,
  maxMembersRequiredForPlan,
  parseIdrInput,
  validateDiscountPercent,
  validateMaxMembers,
  validateMaxMembersOptional,
  validatePrice,
  validateTrialDays,
} from "@/admin/lib/formatCurrency";
import {
  billingTermDiscountsFromPlan,
  discountInputsFromDiscounts,
  formatBillingTermDiscountsSummary,
  parseBillingTermDiscounts,
  validateBillingTermDiscounts,
  type BillingTermKey,
} from "@/admin/lib/billingTermDiscounts";
import {
  createDefaultSalesModulesRecord,
  SALES_MODULE_KEYS,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/share/ui/tabs";
import { Textarea } from "@/share/ui/textarea";
import { toast } from "@/share/ui/sonner";

type EditPlanPricingSheetProps = {
  plan: AdminSubscriptionPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function coerceModuleBoolean(value: unknown): boolean {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return Boolean(value);
}

function modulesFromRecord(
  modules: Record<string, unknown> | undefined,
): Record<SalesModuleKey, boolean> {
  const defaults = createDefaultSalesModulesRecord();
  if (!modules) return defaults;
  for (const key of SALES_MODULE_KEYS) {
    if (key in modules) defaults[key] = coerceModuleBoolean(modules[key]);
  }
  return defaults;
}

export default function EditPlanPricingSheet({ plan, open, onOpenChange }: EditPlanPricingSheetProps) {
  const [activeTab, setActiveTab] = useState<"pricing" | "modules">("pricing");
  const [priceInput, setPriceInput] = useState("");
  const [discountInputs, setDiscountInputs] = useState<Record<BillingTermKey, string>>({
    "1": "",
    "3": "",
    "6": "",
    "12": "",
  });
  const [trialDaysInput, setTrialDaysInput] = useState("");
  const [maxMembersInput, setMaxMembersInput] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [reason, setReason] = useState("");
  const [moduleAccess, setModuleAccess] = useState<Record<SalesModuleKey, boolean>>(
    createDefaultSalesModulesRecord,
  );
  const [baselineModules, setBaselineModules] = useState<Record<SalesModuleKey, boolean> | null>(
    null,
  );
  const [modulesReason, setModulesReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [modulesConfirmOpen, setModulesConfirmOpen] = useState(false);

  const { updatePlan } = useUpdatePlanPricing();
  const { mutateAsync: updateModules, isPending: modulesPending } = useUpdatePlanModules();
  const { data: adjustments } = usePlanPriceAdjustments(
    { entityType: "plan", entityId: plan?.id ?? null, limit: 5 },
    open && !!plan && activeTab === "pricing",
  );
  const {
    data: planModules,
    isLoading: modulesLoading,
    isError: modulesLoadError,
    error: modulesLoadErrorDetail,
  } = usePlanModules(plan?.id ?? null, open && !!plan);
  const { data: moduleAdjustments } = usePlanModuleAdjustments(
    plan?.id ?? null,
    open && !!plan && activeTab === "modules",
  );

  useEffect(() => {
    if (!plan || !open) return;
    setActiveTab("pricing");
    setPriceInput(formatIdrInput(Number(plan.base_price_per_member)));
    setDiscountInputs(
      discountInputsFromDiscounts(
        billingTermDiscountsFromPlan(
          plan.billing_term_discounts as Record<string, unknown> | null | undefined,
          plan.annual_discount_percentage,
        ),
      ),
    );
    setTrialDaysInput(plan.jumlah_hari_trial === null ? "" : String(plan.jumlah_hari_trial));
    setMaxMembersInput(
      plan.max_members != null ? String(plan.max_members) : "",
    );
    setIsActive(plan.is_active);
    setReason("");
    setModulesReason("");
    setModuleAccess(createDefaultSalesModulesRecord());
    setBaselineModules(null);
    setConfirmOpen(false);
    setModulesConfirmOpen(false);
  }, [plan, open]);

  useEffect(() => {
    if (!planModules?.modules) return;
    const loaded = modulesFromRecord(planModules.modules);
    setBaselineModules(loaded);
    setModuleAccess(loaded);
  }, [planModules]);

  const modulesReady = baselineModules !== null;

  const basePrice = parseIdrInput(priceInput);
  const billingTermDiscounts = parseBillingTermDiscounts(discountInputs);
  const trialDays = trialDaysInput.trim() === "" ? null : Number(trialDaysInput);
  const effectiveBasePrice =
    basePrice ?? (plan && open ? Number(plan.base_price_per_member) : null);
  const maxMembersFieldOpen = maxMembersFieldEnabled(effectiveBasePrice);
  const maxMembersRequired = maxMembersRequiredForPlan(effectiveBasePrice);
  const maxMembers =
    !maxMembersFieldOpen || maxMembersInput.trim() === ""
      ? null
      : Number(maxMembersInput.replace(/[^\d]/g, ""));

  useEffect(() => {
    if (!open || !maxMembersRequired) return;
    setMaxMembersInput((prev) => (prev.trim() === "" ? "1" : prev));
  }, [maxMembersRequired, open]);

  const pricingValidationError = useMemo(() => {
    const priceErr = validatePrice(basePrice, "Harga per member");
    if (priceErr) return priceErr;
    const discountErr = validateBillingTermDiscounts(billingTermDiscounts);
    if (discountErr) return discountErr;
    const trialErr = validateTrialDays(trialDays);
    if (trialErr) return trialErr;
    if (maxMembersRequired) {
      const maxErr = validateMaxMembers(maxMembers);
      if (maxErr) return maxErr;
    } else {
      const maxErr = validateMaxMembersOptional(maxMembers);
      if (maxErr) return maxErr;
    }
    if (reason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [basePrice, billingTermDiscounts, trialDays, maxMembersRequired, maxMembers, reason]);

  const modulesValidationError = useMemo(() => {
    if (modulesReason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [modulesReason]);

  const modulesDirty = useMemo(() => {
    if (!baselineModules) return false;
    return SALES_MODULE_KEYS.some((key) => moduleAccess[key] !== baselineModules[key]);
  }, [moduleAccess, baselineModules]);

  const modulesSaveHint = useMemo(() => {
    if (modulesLoading) return "Memuat modul plan...";
    if (modulesLoadError) {
      const message =
        modulesLoadErrorDetail instanceof Error
          ? modulesLoadErrorDetail.message
          : "Gagal memuat modul plan.";
      return message.includes("not allowed") ? "Akses ditolak." : message;
    }
    if (!modulesReady) return "Data modul belum siap.";
    if (modulesValidationError) return modulesValidationError;
    if (!modulesDirty) return "Tidak ada perubahan modul dari data tersimpan.";
    return null;
  }, [
    modulesLoading,
    modulesLoadError,
    modulesLoadErrorDetail,
    modulesReady,
    modulesValidationError,
    modulesDirty,
  ]);

  const deactivateWarning =
    plan && !isActive && plan.is_active && plan.subscriber_count > 0
      ? `${plan.subscriber_count} org masih menggunakan plan ini.`
      : null;

  const handleSavePricing = async () => {
    if (!plan || pricingValidationError || basePrice === null) return;

    try {
      await updatePlan.mutateAsync({
        plan_id: plan.id,
        base_price_per_member: basePrice,
        billing_term_discounts: billingTermDiscounts,
        jumlah_hari_trial: trialDays,
        max_members: maxMembers,
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

  const handleSaveModules = async () => {
    if (!plan || modulesValidationError || !modulesDirty) return;

    try {
      await updateModules({
        plan_id: plan.id,
        modules: moduleAccess,
        reason: modulesReason.trim(),
      });
      toast.success("Modul plan berhasil diperbarui.");
      setModulesConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui modul plan.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setModulesConfirmOpen(false);
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

          <Tabs
            className="mt-6"
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "pricing" | "modules")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pricing">Harga</TabsTrigger>
              <TabsTrigger value="modules">Modul</TabsTrigger>
            </TabsList>

            <TabsContent value="pricing" className="mt-5 space-y-5">
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

              <BillingTermDiscountFields
                values={discountInputs}
                onChange={(key, value) =>
                  setDiscountInputs((prev) => ({ ...prev, [key]: value }))
                }
                idPrefix="plan-discount"
              />

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

              <div className="space-y-2">
                <Label htmlFor="plan-max-members">Max member (cap plan)</Label>
                <Input
                  id="plan-max-members"
                  inputMode="numeric"
                  value={maxMembersInput}
                  onChange={(e) => setMaxMembersInput(e.target.value)}
                  placeholder={maxMembersRequired ? "1" : "Kosongkan = tanpa batas (100 di office)"}
                  disabled={!maxMembersFieldOpen}
                />
                <p className="text-xs text-muted-foreground">
                  {maxMembersRequired
                    ? "Wajib untuk plan gratis (Rp 0). Subscriber lama tidak otomatis turun (grandfather)."
                    : "Opsional untuk plan berbayar. Kosong = tanpa batas (default 100 member di office). Isi angka untuk membatasi slider, mis. 50 untuk Scale Up."}
                </p>
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
                <p className="text-sm font-medium">Riwayat perubahan harga</p>
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

              <SheetFooter className="gap-2 px-0 sm:gap-0">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Batal
                </Button>
                <Button
                  disabled={!!pricingValidationError || updatePlan.isPending}
                  onClick={() => setConfirmOpen(true)}
                >
                  Simpan harga
                </Button>
              </SheetFooter>
            </TabsContent>

            <TabsContent value="modules" className="mt-5 space-y-5">
              {modulesLoading && (
                <p className="text-sm text-muted-foreground">Memuat modul plan...</p>
              )}

              {modulesLoadError && (
                <p className="text-sm text-destructive">
                  {modulesSaveHint ??
                    "Gagal memuat modul plan. Tutup sheet lalu buka lagi, atau periksa sesi CMS admin."}
                </p>
              )}

              {!modulesLoading && !modulesLoadError && (
                <>
                  <PlanModuleAccessFields
                    moduleAccess={moduleAccess}
                    onChange={setModuleAccess}
                    disabled={modulesPending}
                    basePricePerMember={effectiveBasePrice}
                    planName={plan?.name ?? ""}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="plan-modules-reason">Alasan perubahan modul</Label>
                    <Textarea
                      id="plan-modules-reason"
                      value={modulesReason}
                      onChange={(e) => setModulesReason(e.target.value)}
                      rows={3}
                      placeholder="Contoh: Tambah modul HR untuk paket scale-up"
                    />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Riwayat perubahan modul</p>
                    {moduleAdjustments?.length === 0 && (
                      <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
                    )}
                    {moduleAdjustments?.map((item) => (
                      <div key={item.id} className="rounded-md border p-3 text-xs">
                        <p className="font-medium">{item.reason}</p>
                        <p className="mt-1 text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("id-ID")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <SheetFooter className="mt-2 flex-col items-stretch gap-2 px-0 sm:gap-2">
                    {modulesSaveHint && (
                      <p
                        className={`text-xs ${
                          modulesLoadError || modulesValidationError
                            ? "text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {modulesSaveHint}
                      </p>
                    )}
                    <div className="flex gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Batal
                    </Button>
                    <Button
                      disabled={
                        !!modulesValidationError ||
                        !modulesDirty ||
                        !modulesReady ||
                        modulesPending ||
                        modulesLoading ||
                        modulesLoadError
                      }
                      onClick={() => setModulesConfirmOpen(true)}
                    >
                      Simpan modul
                    </Button>
                    </div>
                  </SheetFooter>
                </>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi perubahan harga</AlertDialogTitle>
            <AlertDialogDescription>
              Plan <strong>{plan.name}</strong> akan diubah menjadi{" "}
              <strong>{formatIdr(basePrice ?? 0)}</strong>/member.
              <br />
              Diskon periode:{" "}
              <strong>{formatBillingTermDiscountsSummary(billingTermDiscounts)}</strong>.
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
                void handleSavePricing();
              }}
            >
              {updatePlan.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={modulesConfirmOpen} onOpenChange={setModulesConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi perubahan modul</AlertDialogTitle>
            <AlertDialogDescription>
              Modul plan <strong>{plan.name}</strong> akan diperbarui. Features di office akan
              di-generate ulang dari modul aktif.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={modulesPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={modulesPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSaveModules();
              }}
            >
              {modulesPending ? "Menyimpan..." : "Ya, simpan modul"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
