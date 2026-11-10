import { useEffect, useMemo, useRef, useState } from "react";
import DeleteOrganizationDialog from "@/admin/components/DeleteOrganizationDialog";
import SalesContractPanel from "@/admin/components/SalesContractPanel";
import SalesContractPriceFields from "@/admin/components/SalesContractPriceFields";
import SalesModuleAccessFields from "@/admin/components/SalesModuleAccessFields";
import {
  useSalesContractPending,
  useSalesContractPricePreview,
  useSaveSalesContractPending,
} from "@/admin/hooks/useSalesContractPending";
import { useUpdateOrganizationSubscription } from "@/admin/hooks/useUpdateOrganizationSubscription";
import { useUpdateOrganizationSettings } from "@/admin/hooks/useUpdateOrganizationSettings";
import { useOrganizationModuleAdjustments } from "@/admin/hooks/useOrganizationModuleAdjustments";
import { useOrganizationSalesModules } from "@/admin/hooks/useOrganizationSalesModules";
import { useSubscriptionAdjustments } from "@/admin/hooks/useSubscriptionAdjustments";
import {
  coerceSalesModuleDependencies,
  createDefaultSalesModulesRecord,
  SALES_MODULE_KEYS,
  salesModuleLabel,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import {
  formatWibDate,
  addCalendarMonthsInWib,
  formatWibDateTime,
  previewEffectiveStatus,
  utcToWibDateInput,
  utcToWibDateTimeInput,
  wibDateInputToUtcEndOfDay,
  wibDateTimeInputToUtc,
} from "@/admin/lib/subscriptionDates";
import {
  contractTermMonthsBetween,
  formatContractIdr,
  parsePackagePriceInput,
  salesContractErrorMessage,
  type SalesContractFormSnapshot,
} from "@/admin/lib/salesContractPackage";
import { openSalesContract } from "@/admin/lib/salesSubscriptionContract";
import type { AdminOrganizationRow, OmnichannelRosterMember } from "@/admin/types/organization";
import { cn } from "@/home/lib/utils";
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
import { Badge } from "@/share/ui/badge";
import { Button } from "@/share/ui/button";
import { Checkbox } from "@/share/ui/checkbox";
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

type EditSubscriptionSheetProps = {
  row: AdminOrganizationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationDeleted?: () => void;
};

function StatusBadge({ status }: { status: string }) {
  const className =
    status === "active"
      ? "border-transparent bg-emerald-100 text-emerald-800"
      : status === "trial"
        ? "border-transparent bg-blue-100 text-blue-800"
        : status === "expired"
          ? "border-transparent bg-destructive/15 text-destructive"
          : "border-transparent bg-muted text-muted-foreground";

  return <Badge className={cn(className)}>{status}</Badge>;
}

function parseSeatQuota(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? value : null;
}

function rosterMemberLabel(member: OmnichannelRosterMember): string {
  const name = member.full_name.trim();
  if (name && member.email) return `${name} (${member.email})`;
  return name || member.email || member.employee_id;
}

const RENEWAL_PRESETS = [
  { months: 1, label: "1 bulan" },
  { months: 3, label: "3 bulan" },
  { months: 6, label: "6 bulan" },
  { months: 12, label: "1 tahun" },
] as const;

function TenantTypeBadge({ selfServiceEnabled }: { selfServiceEnabled: boolean }) {
  return selfServiceEnabled ? (
    <Badge className="border-transparent bg-blue-100 text-blue-800">Mandiri</Badge>
  ) : (
    <Badge className="border-transparent bg-amber-100 text-amber-900">Sales</Badge>
  );
}

export default function EditSubscriptionSheet({
  row,
  open,
  onOpenChange,
  onOrganizationDeleted,
}: EditSubscriptionSheetProps) {
  const [isTrial, setIsTrial] = useState(false);
  const [trialDateInput, setTrialDateInput] = useState("");
  const [subscriptionDateInput, setSubscriptionDateInput] = useState("");
  const [renewalChoice, setRenewalChoice] = useState<number | null>(null);
  const renewalAppliedRef = useRef<string | null>(null);
  const [reason, setReason] = useState("");
  const [selfServiceEnabled, setSelfServiceEnabled] = useState(true);
  const [settingsReason, setSettingsReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [settingsConfirmOpen, setSettingsConfirmOpen] = useState(false);
  const [modulesConfirmOpen, setModulesConfirmOpen] = useState(false);
  const [moduleAccess, setModuleAccess] = useState<Record<SalesModuleKey, boolean>>(
    createDefaultSalesModulesRecord,
  );
  const [modulesReason, setModulesReason] = useState("");
  const [hrSeatInput, setHrSeatInput] = useState("0");
  const [seatQuotaInput, setSeatQuotaInput] = useState("0");
  const [keptEmployeeIds, setKeptEmployeeIds] = useState<string[]>([]);
  const [outletQuotaInput, setOutletQuotaInput] = useState("1");
  const [keptOutletIds, setKeptOutletIds] = useState<string[]>([]);
  const [monthlyPriceInput, setMonthlyPriceInput] = useState("");
  const [ppnIncluded, setPpnIncluded] = useState(false);
  const [activeTab, setActiveTab] = useState<"subscription" | "tenant" | "history" | "danger">(
    "subscription",
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateMutation = useUpdateOrganizationSubscription();
  const settingsMutation = useUpdateOrganizationSettings();
  const savePendingMutation = useSaveSalesContractPending();
  const { data: salesModules, isLoading: salesModulesLoading } = useOrganizationSalesModules(
    row?.organization_id ?? null,
  );
  const { data: adjustments, isLoading: adjustmentsLoading } = useSubscriptionAdjustments(
    row?.organization_id ?? null,
    50,
  );
  const { data: moduleAdjustments, isLoading: moduleAdjustmentsLoading } =
    useOrganizationModuleAdjustments(row?.organization_id ?? null);
  const salesSubscriptionClock = row?.subscription_self_service_enabled === false;
  const { data: pendingPackage } = useSalesContractPending(
    salesSubscriptionClock ? (row?.organization_id ?? null) : null,
  );
  const pendingPackageRef = useRef(pendingPackage);
  pendingPackageRef.current = pendingPackage;
  const pendingSavedAt = pendingPackage?.saved_at ?? "";

  useEffect(() => {
    if (!row || !open) {
      setTrialDateInput("");
      setSubscriptionDateInput("");
      setRenewalChoice(null);
      return;
    }
    setIsTrial(row.is_trial);
    setTrialDateInput(utcToWibDateInput(row.trial_end_date));
    setSubscriptionDateInput(
      row.subscription_self_service_enabled
        ? utcToWibDateInput(row.subscription_end_date)
        : utcToWibDateTimeInput(row.subscription_end_date),
    );
    setRenewalChoice(null);
    setReason("");
    setSelfServiceEnabled(row.subscription_self_service_enabled);
    setSettingsReason("");
    setConfirmOpen(false);
    setSettingsConfirmOpen(false);
    setModulesConfirmOpen(false);
    setModulesReason("");
    setMonthlyPriceInput("");
    setPpnIncluded(false);
    setActiveTab("subscription");
    setDeleteDialogOpen(false);
  }, [row, open]);

  useEffect(() => {
    const pending = pendingPackageRef.current;
    if (!open || !row || !salesSubscriptionClock || !pending) return;
    setIsTrial(pending.is_trial);
    setTrialDateInput(utcToWibDateInput(pending.trial_end_date));
    setSubscriptionDateInput(utcToWibDateTimeInput(pending.subscription_end_date));
    setRenewalChoice(null);
  }, [open, row, salesSubscriptionClock, pendingSavedAt]);

  useEffect(() => {
    if (!salesModules?.is_sales_tenant) {
      setModuleAccess(createDefaultSalesModulesRecord());
      setHrSeatInput("0");
      setSeatQuotaInput("0");
      setKeptEmployeeIds([]);
      setOutletQuotaInput("1");
      setKeptOutletIds([]);
      setMonthlyPriceInput("");
      setPpnIncluded(false);
      return;
    }
    const pending = salesSubscriptionClock ? pendingPackageRef.current : null;
    const outlets = salesModules.outlets ?? [];
    const fallbackQuota = Math.max(1, outlets.length || 1);
    if (pending) {
      const next = createDefaultSalesModulesRecord();
      for (const key of SALES_MODULE_KEYS) next[key] = Boolean(pending.modules[key]);
      setModuleAccess(coerceSalesModuleDependencies(next));
      setHrSeatInput(String(pending.hr_seat_count));
      setSeatQuotaInput(String(pending.omnichannel_paid_seat_count));
      setKeptEmployeeIds(pending.keep_employee_ids);
      setOutletQuotaInput(
        String(pending.outlet_quota != null && pending.outlet_quota > 0 ? pending.outlet_quota : fallbackQuota),
      );
      setKeptOutletIds(pending.keep_outlet_ids);
      setMonthlyPriceInput(pending.monthly_price_idr != null ? String(pending.monthly_price_idr) : "");
      setPpnIncluded(pending.ppn_included ?? false);
      return;
    }
    const activeOutletIds = outlets.filter((outlet) => outlet.is_active).map((outlet) => outlet.id);
    setModuleAccess(salesModules.modules);
    setHrSeatInput(String(salesModules.hr_seat_count));
    setSeatQuotaInput(String(salesModules.omnichannel_paid_seat_count));
    setKeptEmployeeIds([]);
    setOutletQuotaInput(
      String(
        salesModules.sales_outlet_quota != null && salesModules.sales_outlet_quota > 0
          ? salesModules.sales_outlet_quota
          : fallbackQuota,
      ),
    );
    setKeptOutletIds(
      salesModules.sales_outlet_quota != null &&
        outlets.length > salesModules.sales_outlet_quota &&
        activeOutletIds.length === salesModules.sales_outlet_quota
        ? activeOutletIds
        : [],
    );
    setMonthlyPriceInput(
      salesModules.sales_monthly_price_idr != null ? String(salesModules.sales_monthly_price_idr) : "",
    );
    setPpnIncluded(salesModules.sales_ppn_included ?? false);
  }, [salesModules, salesSubscriptionClock, pendingSavedAt]);
  const trialEndUtc =
    row && trialDateInput ? wibDateInputToUtcEndOfDay(trialDateInput) || null : null;
  const subscriptionEndUtc =
    !row || !subscriptionDateInput
      ? null
      : subscriptionDateInput.includes("T")
        ? wibDateTimeInputToUtc(subscriptionDateInput) || null
        : wibDateInputToUtcEndOfDay(subscriptionDateInput) || null;

  const previewStatus = useMemo(
    () => previewEffectiveStatus(isTrial, trialEndUtc, subscriptionEndUtc),
    [isTrial, trialEndUtc, subscriptionEndUtc],
  );

  const previewEndLabel = isTrial
    ? formatWibDate(trialEndUtc)
    : salesSubscriptionClock
      ? formatWibDateTime(subscriptionEndUtc)
      : formatWibDate(subscriptionEndUtc);

  const applyRenewal = (months: number, label: string) => {
    const savedEnd = row?.subscription_end_date ?? null;
    const clockSource =
      savedEnd && !Number.isNaN(new Date(savedEnd).getTime()) ? savedEnd : new Date().toISOString();
    const clock = utcToWibDateTimeInput(clockSource).slice(11, 16) || "00:00";
    const today = utcToWibDateInput(new Date().toISOString());
    const anchor = new Date(`${today}T${clock}:00+07:00`);
    const next = addCalendarMonthsInWib(Number.isNaN(anchor.getTime()) ? new Date() : anchor, months);
    renewalAppliedRef.current = next;
    setSubscriptionDateInput(next);
    setRenewalChoice(months);
    setIsTrial(false);
    setReason((current) => {
      const trimmed = current.trim();
      if (trimmed.length === 0 || trimmed.startsWith("Perpanjangan ")) return `Perpanjangan ${label}`;
      return current;
    });
  };

  const dateFieldError = useMemo(() => {
    if (isTrial) {
      if (!trialDateInput) return "Tanggal berakhir trial wajib diisi.";
    } else if (!subscriptionDateInput || !subscriptionEndUtc) {
      return salesSubscriptionClock
        ? "Waktu berakhir berlangganan wajib diisi."
        : "Tanggal berakhir berlangganan wajib diisi.";
    }

    const activeEnd = isTrial ? trialEndUtc : subscriptionEndUtc;
    if (activeEnd && new Date(activeEnd) > new Date()) {
      const maxFuture = new Date();
      maxFuture.setDate(maxFuture.getDate() + 366);
      if (new Date(activeEnd) > maxFuture) {
        return "Tanggal tidak boleh lebih dari 1 tahun dari hari ini.";
      }
    }
    return null;
  }, [isTrial, trialDateInput, subscriptionDateInput, trialEndUtc, subscriptionEndUtc, salesSubscriptionClock]);

  const validationError =
    reason.trim().length < 3 ? "Alasan wajib diisi (min. 3 karakter)." : dateFieldError;

  const settingsValidationError = useMemo(() => {
    if (settingsReason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [settingsReason]);

  const modulesValidationError = useMemo(() => {
    if (modulesReason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [modulesReason]);

  const savedHrSeatCount = salesModules?.hr_seat_count ?? 0;
  const activeEmployeeCount = salesModules?.active_employee_count ?? 0;
  const eligibleEmployeeCount = salesModules?.roster_eligible_employee_count ?? 0;
  const parsedHrSeat = parseSeatQuota(hrSeatInput);
  const parsedSeatQuota = parseSeatQuota(seatQuotaInput);
  const rosterMembers = salesModules?.omnichannel_roster ?? [];
  const hrForQuotaMax = parsedHrSeat ?? savedHrSeatCount;
  const seatQuotaMax = Math.min(hrForQuotaMax, eligibleEmployeeCount);
  const nextRosterCap =
    parsedHrSeat !== null && parsedSeatQuota !== null ? Math.min(parsedHrSeat, parsedSeatQuota) : null;
  const hrDirty = Boolean(
    salesModules?.is_sales_tenant && parsedHrSeat !== null && parsedHrSeat !== savedHrSeatCount,
  );
  const rosterOverCap = nextRosterCap !== null && rosterMembers.length > nextRosterCap;
  const hrSeatError = useMemo(() => {
    if (!salesModules?.is_sales_tenant) return null;
    if (parsedHrSeat === null) return "Isi angka bulat 0 atau lebih.";
    if (parsedHrSeat < activeEmployeeCount) {
      return `Seat HR tidak boleh kurang dari ${activeEmployeeCount} karyawan aktif.`;
    }
    return null;
  }, [activeEmployeeCount, parsedHrSeat, salesModules?.is_sales_tenant]);
  const removedRosterPreview = rosterOverCap
    ? rosterMembers.filter(
        (member) => nextRosterCap === 0 || !keptEmployeeIds.includes(member.employee_id),
      )
    : [];

  const seatQuotaError = useMemo(() => {
    if (!salesModules?.is_sales_tenant) return null;
    if (parsedSeatQuota === null) return "Isi angka bulat 0 atau lebih.";
    if (parsedSeatQuota > seatQuotaMax) {
      return `Kuota tidak boleh lebih dari ${seatQuotaMax}.`;
    }
    if (
      nextRosterCap !== null &&
      rosterMembers.length > nextRosterCap &&
      nextRosterCap > 0 &&
      keptEmployeeIds.length !== nextRosterCap
    ) {
      return `Pilih tepat ${nextRosterCap} user yang tetap aktif.`;
    }
    return null;
  }, [
    keptEmployeeIds.length,
    nextRosterCap,
    parsedSeatQuota,
    rosterMembers.length,
    salesModules?.is_sales_tenant,
    seatQuotaMax,
  ]);

  const parsedOutletQuota = useMemo(() => {
    if (!moduleAccess.pos) return 0;
    const parsed = Number(outletQuotaInput);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) return null;
    return parsed;
  }, [moduleAccess.pos, outletQuotaInput]);

  const outletQuotaError = useMemo(() => {
    if (!salesSubscriptionClock || !salesModules?.is_sales_tenant || !moduleAccess.pos) return null;
    if (parsedOutletQuota === null) return "Kuota outlet harus antara 1 dan 100.";
    const outlets = salesModules.outlets ?? [];
    if (outlets.length <= parsedOutletQuota) return null;
    const known = new Set(outlets.map((outlet) => outlet.id));
    if (
      keptOutletIds.length !== parsedOutletQuota ||
      keptOutletIds.some((id) => !known.has(id))
    ) {
      return `Pilih tepat ${parsedOutletQuota} outlet yang tetap buka.`;
    }
    return null;
  }, [
    keptOutletIds,
    moduleAccess.pos,
    parsedOutletQuota,
    salesModules?.is_sales_tenant,
    salesModules?.outlets,
    salesSubscriptionClock,
  ]);

  const parsedMonthlyPrice = parsePackagePriceInput(monthlyPriceInput);
  const todayWib = utcToWibDateInput(new Date().toISOString());
  const endWib = subscriptionEndUtc ? utcToWibDateInput(subscriptionEndUtc) : "";
  const termMonths = todayWib && endWib ? contractTermMonthsBetween(todayWib, endWib) : 0;
  const priceError = useMemo(() => {
    if (!salesSubscriptionClock || isTrial || !salesModules?.is_sales_tenant) return null;
    if (parsedMonthlyPrice === null) return "Isi harga paket dalam rupiah bulat.";
    if (termMonths < 1) return "Jangka minimal 1 bulan. Gunakan Renew.";
    return null;
  }, [
    isTrial,
    parsedMonthlyPrice,
    salesModules?.is_sales_tenant,
    salesSubscriptionClock,
    termMonths,
  ]);

  const salesPackageError =
    !salesSubscriptionClock || salesModulesLoading || !salesModules?.is_sales_tenant
      ? null
      : hrSeatError || seatQuotaError || outletQuotaError || priceError;

  const salesContractSnapshot: SalesContractFormSnapshot | null =
    salesSubscriptionClock &&
    salesModules?.is_sales_tenant &&
    parsedHrSeat !== null &&
    parsedSeatQuota !== null &&
    parsedOutletQuota !== null &&
    !dateFieldError &&
    !hrSeatError &&
    !seatQuotaError &&
    !outletQuotaError &&
    !priceError
      ? {
          isTrial,
          trialEndUtc,
          subscriptionEndUtc,
          modules: coerceSalesModuleDependencies(moduleAccess),
          hrSeats: parsedHrSeat,
          omniSeats: parsedSeatQuota,
          keepEmployeeIds:
            rosterOverCap && nextRosterCap !== null && nextRosterCap > 0 ? keptEmployeeIds : [],
          outletQuota: parsedOutletQuota,
          keepOutletIds:
            moduleAccess.pos &&
            parsedOutletQuota > 0 &&
            (salesModules?.outlets.length ?? 0) > parsedOutletQuota
              ? keptOutletIds
              : [],
          monthlyPriceIdr: isTrial ? null : parsedMonthlyPrice,
          billingMode: null,
          ppnIncluded: isTrial ? null : ppnIncluded,
          priceEffectiveOn: isTrial ? null : todayWib,
        }
      : null;

  const pricePreview = useSalesContractPricePreview({
    organizationId: row?.organization_id ?? null,
    monthlyPriceIdr: parsedMonthlyPrice,
    billingMode: null,
    ppnIncluded,
    priceEffectiveOn: todayWib,
    subscriptionEndUtc,
    enabled: Boolean(salesSubscriptionClock && !isTrial && !priceError),
  });
  const pricePreviewText = pricePreview.data
    ? `Jangka ${pricePreview.data.term_months} bulan. Total tagihan ${formatContractIdr(pricePreview.data.adjustment_idr)}.`
    : pricePreview.isFetching
      ? "Menghitung total tagihan..."
      : null;
  const pricePreviewError = pricePreview.error
    ? salesContractErrorMessage(pricePreview.error, "Nilai periode gagal dihitung.")
    : null;

  const saveSalesPackage = async (packageReason: string) => {
    if (!row || !salesContractSnapshot) return;
    await savePendingMutation.mutateAsync({
      organization_id: row.organization_id,
      is_trial: salesContractSnapshot.isTrial,
      trial_end_date: salesContractSnapshot.trialEndUtc,
      subscription_end_date: salesContractSnapshot.subscriptionEndUtc,
      modules: salesContractSnapshot.modules,
      hr_seat_count: salesContractSnapshot.hrSeats,
      omnichannel_paid_seat_count: salesContractSnapshot.omniSeats,
      keep_employee_ids: salesContractSnapshot.keepEmployeeIds,
      outlet_quota: salesContractSnapshot.outletQuota,
      keep_outlet_ids: salesContractSnapshot.keepOutletIds,
      monthly_price_idr: salesContractSnapshot.monthlyPriceIdr,
      billing_mode: salesContractSnapshot.billingMode,
      ppn_included: salesContractSnapshot.ppnIncluded,
      price_effective_on: salesContractSnapshot.priceEffectiveOn,
      reason: packageReason,
    });
  };

  const handleSave = async () => {
    if (!row || validationError || salesPackageError) return;

    if (salesSubscriptionClock) {
      if (!salesContractSnapshot) return;
      try {
        await saveSalesPackage(reason.trim());
        toast.success("Paket menunggu disimpan. Unduh kontrak untuk ditandatangani.");
        setConfirmOpen(false);
      } catch (err) {
        toast.error(salesContractErrorMessage(err, "Paket menunggu gagal disimpan."));
        setConfirmOpen(false);
      }
      return;
    }

    try {
      await updateMutation.mutateAsync({
        organization_id: row.organization_id,
        is_trial: isTrial,
        trial_end_date: trialEndUtc,
        subscription_end_date: subscriptionEndUtc,
        reason: reason.trim(),
      });
      toast.success("Subscription berhasil diperbarui.");
      setConfirmOpen(false);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui subscription.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setConfirmOpen(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!row || settingsValidationError) return;

    try {
      await settingsMutation.mutateAsync({
        organization_id: row.organization_id,
        subscription_self_service_enabled: selfServiceEnabled,
        reason: settingsReason.trim(),
      });
      toast.success("Pengaturan tenant berhasil diperbarui.");
      setSettingsConfirmOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui pengaturan tenant.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
      setSettingsConfirmOpen(false);
    }
  };

  const handleSaveModules = async () => {
    if (
      !row ||
      !salesSubscriptionClock ||
      !salesContractSnapshot ||
      modulesValidationError ||
      dateFieldError ||
      salesPackageError
    ) {
      return;
    }

    try {
      await saveSalesPackage(modulesReason.trim());
      toast.success("Paket menunggu disimpan. Unduh kontrak di tab Subscription.");
      setModulesConfirmOpen(false);
    } catch (err) {
      toast.error(salesContractErrorMessage(err, "Paket menunggu gagal disimpan."));
      setModulesConfirmOpen(false);
    }
  };

  if (!row) return null;

  const tenantTypeDirty = selfServiceEnabled !== row.subscription_self_service_enabled;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader className="space-y-3">
            <SheetTitle>Atur Subscription</SheetTitle>
            <div className="flex flex-wrap items-center gap-2">
              <SheetDescription className="mb-0 text-foreground">{row.company_name}</SheetDescription>
              <TenantTypeBadge selfServiceEnabled={selfServiceEnabled} />
            </div>
            <p className="text-xs text-muted-foreground">
              Tipe tenant:{" "}
              <span className="font-medium text-foreground">
                {selfServiceEnabled ? "Mandiri (self-service)" : "Sales (tanpa /subscription di office)"}
              </span>
              {tenantTypeDirty ? (
                <span className="ml-1 text-amber-700">· belum disimpan</span>
              ) : null}
            </p>
          </SheetHeader>

          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "subscription" | "tenant" | "history" | "danger")
            }
            className="mt-6"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="tenant">Tenant</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
              <TabsTrigger value="danger" className="text-destructive data-[state=active]:text-destructive">
                Zona bahaya
              </TabsTrigger>
            </TabsList>

            <TabsContent value="subscription" className="mt-4 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status saat ini:</span>
              <StatusBadge status={row.effective_status} />
            </div>

            <div className="space-y-2">
              <Label>Tipe</Label>
              <Tabs
                value={isTrial ? "trial" : "paid"}
                onValueChange={(value) => setIsTrial(value === "trial")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="trial">Trial</TabsTrigger>
                  <TabsTrigger value="paid">Berlangganan</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {isTrial ? (
              <div className="space-y-2">
                <Label htmlFor="trial-end">Berakhir trial (WIB)</Label>
                <Input
                  id="trial-end"
                  type="date"
                  value={trialDateInput}
                  onChange={(e) => setTrialDateInput(e.target.value)}
                />
                {subscriptionDateInput && (
                  <p className="text-xs text-muted-foreground">
                    Berlangganan (referensi):{" "}
                    {salesSubscriptionClock
                      ? formatWibDateTime(subscriptionEndUtc)
                      : formatWibDate(subscriptionEndUtc)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="subscription-end">Berakhir berlangganan (WIB)</Label>
                <Input
                  id="subscription-end"
                  type={salesSubscriptionClock ? "datetime-local" : "date"}
                  step={salesSubscriptionClock ? 60 : undefined}
                  value={subscriptionDateInput}
                  onChange={(e) => {
                    setSubscriptionDateInput(e.target.value);
                    if (salesSubscriptionClock && e.target.value !== renewalAppliedRef.current) {
                      setRenewalChoice(null);
                    }
                  }}
                />
                {salesSubscriptionClock ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Renew</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {RENEWAL_PRESETS.map((preset) => (
                        <Button
                          key={preset.months}
                          type="button"
                          size="sm"
                          className="w-full px-2"
                          variant={renewalChoice === preset.months ? "default" : "outline"}
                          onClick={() => applyRenewal(preset.months, preset.label)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
                {trialDateInput && (
                  <p className="text-xs text-muted-foreground">
                    Trial (referensi): {formatWibDate(trialEndUtc)}
                  </p>
                )}
              </div>
            )}

            {salesSubscriptionClock ? (
              <>
                {salesSubscriptionClock && !isTrial ? (
                  <SalesContractPriceFields
                    idPrefix="subscription"
                    monthlyPriceInput={monthlyPriceInput}
                    onMonthlyPriceInput={setMonthlyPriceInput}
                    ppnIncluded={ppnIncluded}
                    onPpnIncluded={setPpnIncluded}
                    error={priceError}
                    previewText={pricePreviewText}
                    previewError={priceError ? null : pricePreviewError}
                  />
                ) : null}
                <SalesContractPanel
                  organizationId={row.organization_id}
                  organizationName={row.company_name}
                  snapshot={salesContractSnapshot}
                  outlets={salesModules?.outlets ?? []}
                  current={
                    salesModules
                      ? {
                          modules: salesModules.modules,
                          hrSeats: salesModules.hr_seat_count,
                          omniSeats: salesModules.omnichannel_paid_seat_count,
                          outletQuota: salesModules.sales_outlet_quota,
                          monthlyPriceIdr: salesModules.sales_monthly_price_idr,
                        }
                      : undefined
                  }
                />
                {salesPackageError ? (
                  <p className="text-xs text-destructive">{salesPackageError}</p>
                ) : null}
              </>
            ) : null}

            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-medium">
                {salesSubscriptionClock ? "Preview paket menunggu" : "Preview setelah simpan"}
              </p>
              <p className="mt-1 text-muted-foreground">
                Status: <span className="font-medium text-foreground">{previewStatus}</span>
                {" · "}
                Berlaku hingga: <span className="font-medium text-foreground">{previewEndLabel}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Alasan perubahan</Label>
              <Textarea
                id="reason"
                placeholder="Contoh: Perpanjangan trial untuk evaluasi sales"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            </TabsContent>

            <TabsContent value="tenant" className="mt-4 space-y-4">
            <div>
                <p className="text-sm font-medium">Pengaturan tenant</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tenant sales tidak melihat halaman subscription di office. Perpanjang subscription
                  via tab Subscription.
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-md border p-3">
                <div className="space-y-1">
                  <Label htmlFor="self-service-toggle">Akses halaman subscription mandiri</Label>
                  <p className="text-xs text-muted-foreground">
                    {selfServiceEnabled
                      ? "Tenant bisa akses /subscription di office"
                      : "Tenant sales — halaman subscription disembunyikan"}
                  </p>
                </div>
                <Switch
                  id="self-service-toggle"
                  checked={selfServiceEnabled}
                  onCheckedChange={setSelfServiceEnabled}
                />
              </div>

              {!selfServiceEnabled && (
                <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  Tenant expired tidak bisa renew sendiri. Perpanjang tanggal subscription di tab
                  Subscription.
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="settings-reason">Alasan perubahan pengaturan</Label>
                <Textarea
                  id="settings-reason"
                  placeholder="Contoh: Tenant didaftarkan oleh tim sales"
                  value={settingsReason}
                  onChange={(e) => setSettingsReason(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                variant="secondary"
                className="w-full"
                disabled={
                  !!settingsValidationError ||
                  settingsMutation.isPending ||
                  selfServiceEnabled === row.subscription_self_service_enabled
                }
                onClick={() => setSettingsConfirmOpen(true)}
              >
                Simpan pengaturan tenant
              </Button>

              {!selfServiceEnabled && (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <p className="text-sm font-medium">Akses modul (upsell)</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Menu tetap tampil di office; modul nonaktif menampilkan halaman upsell.
                      Dashboard selalu aktif.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Dashboard: Selalu aktif</Badge>
                    <Badge variant="outline">Subscription: Hidden (sales)</Badge>
                  </div>

                  {salesModulesLoading && (
                    <p className="text-sm text-muted-foreground">Memuat modul...</p>
                  )}

                  {!salesModulesLoading && (
                    <SalesModuleAccessFields
                      moduleAccess={moduleAccess}
                      onChange={setModuleAccess}
                      afterModule={{
                        humanResources: (
                          <>
                            <div className="grid grid-cols-2 items-end gap-x-3 gap-y-2">
                              <Label htmlFor="hr-seat-quota">Seat HR</Label>
                              <p className="text-sm font-medium leading-none">Karyawan aktif</p>
                              <Input
                                id="hr-seat-quota"
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                value={hrSeatInput}
                                onChange={(event) => {
                                  setHrSeatInput(event.target.value);
                                  setKeptEmployeeIds([]);
                                }}
                              />
                              <p className="flex h-10 items-center text-sm font-medium tabular-nums">
                                {activeEmployeeCount}
                              </p>
                            </div>
                            {hrSeatError ? (
                              <p className="mt-1 text-xs text-destructive">{hrSeatError}</p>
                            ) : null}
                            {hrDirty &&
                            parsedHrSeat !== null &&
                            (rosterOverCap ||
                              (parsedSeatQuota !== null && parsedSeatQuota > parsedHrSeat)) ? (
                              <p className="mt-1.5 text-xs text-muted-foreground">
                                Penurunan ini mengikat kuota omnichannel. Sesuaikan angka dan pilihan
                                user di Operations / Omnichannel.
                              </p>
                            ) : null}
                          </>
                        ),
                        pos: moduleAccess.pos ? (
                          <div>
                            <div className="grid grid-cols-2 items-end gap-x-3 gap-y-2">
                              <Label htmlFor="outlet-quota">Kuota outlet</Label>
                              <p className="text-sm font-medium leading-none">Outlet tersimpan</p>
                              <Input
                                id="outlet-quota"
                                type="number"
                                min={1}
                                max={100}
                                step={1}
                                inputMode="numeric"
                                value={outletQuotaInput}
                                onChange={(event) => {
                                  setOutletQuotaInput(event.target.value);
                                  setKeptOutletIds([]);
                                }}
                              />
                              <p className="flex h-10 items-center text-sm font-medium tabular-nums">
                                {salesModules?.outlets.length ?? 0}
                              </p>
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              Angka ini adalah jumlah cabang yang boleh beroperasi.
                            </p>
                            {outletQuotaError ? (
                              <p className="mt-1 text-xs text-destructive">{outletQuotaError}</p>
                            ) : null}
                            {parsedOutletQuota !== null &&
                            (salesModules?.outlets.length ?? 0) > parsedOutletQuota ? (
                              <div className="mt-3 space-y-1.5">
                                <p className="text-xs text-muted-foreground">
                                  Pilih {parsedOutletQuota} outlet yang tetap buka. Yang tidak dipilih
                                  ditutup saat PDF diunggah. Data cabang tidak dihapus.
                                </p>
                                {(salesModules?.outlets ?? []).map((outlet) => {
                                  const checked = keptOutletIds.includes(outlet.id);
                                  return (
                                    <label key={outlet.id} className="flex items-start gap-2 text-xs">
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(value) => {
                                          setKeptOutletIds((current) => {
                                            if (value === true) {
                                              if (current.includes(outlet.id)) return current;
                                              if (
                                                parsedOutletQuota !== null &&
                                                current.length >= parsedOutletQuota
                                              ) {
                                                return current;
                                              }
                                              return [...current, outlet.id];
                                            }
                                            return current.filter((id) => id !== outlet.id);
                                          });
                                        }}
                                      />
                                      <span>
                                        {outlet.name}
                                        {outlet.is_active ? "" : " (saat ini tertutup)"}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>
                        ) : null,
                      }}
                      afterSubModule={{
                        whatsappBusiness: (
                          <div className="rounded-md border bg-background px-3 py-2.5">
                            <div className="grid grid-cols-2 items-end gap-x-3 gap-y-2">
                              <Label htmlFor="omnichannel-seat-quota">Kuota user omnichannel</Label>
                              <p className="text-sm font-medium leading-none">Roster aktif</p>
                              <Input
                                id="omnichannel-seat-quota"
                                type="number"
                                min={0}
                                step={1}
                                inputMode="numeric"
                                value={seatQuotaInput}
                                onChange={(event) => {
                                  setSeatQuotaInput(event.target.value);
                                  setKeptEmployeeIds([]);
                                }}
                              />
                              <p className="flex h-10 items-center text-sm font-medium tabular-nums">
                                {rosterMembers.length}
                              </p>
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              Karyawan aktif berakun: {eligibleEmployeeCount}. Maksimal {seatQuotaMax}.
                            </p>
                            <div className="mt-3 space-y-1.5">
                              <p className="text-xs font-medium">User di roster aktif</p>
                              {rosterMembers.length === 0 ? (
                                <p className="text-xs text-muted-foreground">Belum ada user di roster.</p>
                              ) : rosterOverCap && nextRosterCap === 0 ? (
                                <>
                                  <p className="text-xs text-muted-foreground">
                                    Batas roster 0 mengeluarkan semua user dari roster. Data karyawan
                                    tidak dihapus.
                                  </p>
                                  {rosterMembers.map((member) => (
                                    <p key={member.employee_id} className="text-xs">
                                      {rosterMemberLabel(member)}
                                    </p>
                                  ))}
                                </>
                              ) : rosterOverCap && nextRosterCap !== null && nextRosterCap > 0 ? (
                                <>
                                  <p className="text-xs text-muted-foreground">
                                    Pilih {nextRosterCap} user yang tetap memakai omnichannel. Yang
                                    tidak dipilih dikeluarkan dari roster. Data karyawan tidak dihapus.
                                  </p>
                                  {rosterMembers.map((member) => {
                                    const checked = keptEmployeeIds.includes(member.employee_id);
                                    return (
                                      <label
                                        key={member.employee_id}
                                        className="flex items-start gap-2 text-xs"
                                      >
                                        <Checkbox
                                          checked={checked}
                                          onCheckedChange={(value) => {
                                            setKeptEmployeeIds((current) => {
                                              if (value === true) {
                                                if (current.includes(member.employee_id)) return current;
                                                if (
                                                  nextRosterCap !== null &&
                                                  current.length >= nextRosterCap
                                                ) {
                                                  return current;
                                                }
                                                return [...current, member.employee_id];
                                              }
                                              return current.filter((id) => id !== member.employee_id);
                                            });
                                          }}
                                        />
                                        <span>{rosterMemberLabel(member)}</span>
                                      </label>
                                    );
                                  })}
                                </>
                              ) : (
                                rosterMembers.map((member) => (
                                  <p key={member.employee_id} className="text-xs">
                                    {rosterMemberLabel(member)}
                                  </p>
                                ))
                              )}
                            </div>
                            {seatQuotaError ? (
                              <p className="mt-1 text-xs text-destructive">{seatQuotaError}</p>
                            ) : null}
                          </div>
                        ),
                      }}
                    />
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="modules-reason">Alasan perubahan modul</Label>
                    <Textarea
                      id="modules-reason"
                      placeholder="Contoh: Aktifkan Finance untuk evaluasi pilot"
                      value={modulesReason}
                      onChange={(e) => setModulesReason(e.target.value)}
                      rows={2}
                    />
                  </div>

                  {dateFieldError ? (
                    <p className="text-xs text-destructive">{dateFieldError}</p>
                  ) : null}
                  {priceError ? (
                    <p className="text-xs text-destructive">Harga paket diisi di tab Subscription.</p>
                  ) : null}

                  {salesPackageError &&
                  salesPackageError !== hrSeatError &&
                  salesPackageError !== seatQuotaError &&
                  salesPackageError !== priceError ? (
                    <p className="text-xs text-destructive">{salesPackageError}</p>
                  ) : null}

                  <Button
                    className="w-full"
                    disabled={
                      !salesSubscriptionClock ||
                      !salesContractSnapshot ||
                      !!modulesValidationError ||
                      !!dateFieldError ||
                      !!salesPackageError ||
                      savePendingMutation.isPending
                    }
                    onClick={() => setModulesConfirmOpen(true)}
                  >
                    Simpan modul
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Kontrak diunduh dan diunggah di tab Subscription.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-4">
              <div className="space-y-3">
                <p className="text-sm font-medium">Subscription & tenant</p>
              {adjustmentsLoading && (
                <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
              )}
              {!adjustmentsLoading && (!adjustments || adjustments.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
              )}
              {adjustments?.map((item) => {
                const isHrSeatChange =
                  typeof item.after_state.member_count === "number" &&
                  item.after_state.status === undefined &&
                  item.after_state.subscription_self_service_enabled === undefined;
                const isSeatChange =
                  !isHrSeatChange &&
                  typeof item.after_state.omnichannel_paid_seat_count === "number" &&
                  item.after_state.status === undefined &&
                  item.after_state.subscription_self_service_enabled === undefined;
                const removedNames = (item.after_state.removed_roster ?? [])
                  .map((person) => person.full_name?.trim() || person.email || "User")
                  .join(", ");
                const closedOutletNames = (item.after_state.closed_outlets ?? [])
                  .map((outlet) => outlet.name?.trim() || "Outlet")
                  .join(", ");
                const isSettingsChange =
                  item.after_state.subscription_self_service_enabled !== undefined &&
                  item.after_state.status === undefined;
                const activeModuleLabels = Object.entries(item.after_state.modules ?? {})
                  .filter(([, enabled]) => enabled)
                  .map(([key]) => salesModuleLabel(key as SalesModuleKey));

                return (
                  <div key={item.id} className="rounded-md border p-3 text-xs">
                    <p className="font-medium">{item.reason}</p>
                    <p className="mt-1 text-muted-foreground">
                      {formatWibDate(item.created_at)}
                      {isHrSeatChange ? (
                        <>
                          {" · "}
                          Seat HR: {item.before_state.member_count ?? 0} menjadi{" "}
                          {item.after_state.member_count}
                          {item.before_state.omnichannel_paid_seat_count !==
                          item.after_state.omnichannel_paid_seat_count ? (
                            <>
                              {". Kuota user omnichannel: "}
                              {item.before_state.omnichannel_paid_seat_count ?? 0} menjadi{" "}
                              {item.after_state.omnichannel_paid_seat_count}
                            </>
                          ) : null}
                          {removedNames ? <>. Dikeluarkan: {removedNames}</> : null}
                        </>
                      ) : isSeatChange ? (
                        <>
                          {" · "}
                          Kuota user omnichannel: {item.before_state.omnichannel_paid_seat_count ?? 0}{" "}
                          menjadi {item.after_state.omnichannel_paid_seat_count}
                          {removedNames ? <>. Dikeluarkan: {removedNames}</> : null}
                        </>
                      ) : isSettingsChange ? (
                        <>
                          {" · "}
                          {item.after_state.subscription_self_service_enabled
                            ? "Mandiri (self-service)"
                            : "Sales (tanpa /subscription)"}
                        </>
                      ) : (
                        <>
                          {" · "}
                          {item.after_state.is_trial ? "trial" : "paid"} · status{" "}
                          {item.after_state.status}
                          {activeModuleLabels.length > 0
                            ? ` · Aktif: ${activeModuleLabels.join(", ")}`
                            : ""}
                          {typeof item.after_state.sales_outlet_quota === "number"
                            ? ` · Kuota outlet: ${item.after_state.sales_outlet_quota}`
                            : ""}
                          {typeof item.after_state.sales_monthly_price_idr === "number"
                            ? ` · Harga paket: ${formatContractIdr(item.after_state.sales_monthly_price_idr)}`
                            : ""}
                          {typeof item.after_state.adjustment_idr === "number"
                            ? ` · Penyesuaian: ${formatContractIdr(item.after_state.adjustment_idr)}`
                            : ""}
                          {removedNames ? ` · Dikeluarkan: ${removedNames}` : ""}
                          {closedOutletNames ? ` · Outlet ditutup: ${closedOutletNames}` : ""}
                        </>
                      )}
                    </p>
                    {item.contract_path ? (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="mt-1 h-auto px-0 text-xs"
                        onClick={() => {
                          void openSalesContract(item.contract_path!).catch(() => {
                            toast.error("Kontrak tidak bisa dibuka.");
                          });
                        }}
                      >
                        Lihat kontrak
                      </Button>
                    ) : null}
                  </div>
                );
              })}
              </div>

              <div className="space-y-3 border-t pt-4">
                <p className="text-sm font-medium">Modul (upsell)</p>
                {moduleAdjustmentsLoading && (
                  <p className="text-sm text-muted-foreground">Memuat riwayat modul...</p>
                )}
                {!moduleAdjustmentsLoading &&
                  (!moduleAdjustments || moduleAdjustments.length === 0) && (
                    <p className="text-sm text-muted-foreground">Belum ada riwayat modul.</p>
                  )}
                {moduleAdjustments?.map((item) => {
                  const enabledKeys = Object.entries(item.after_state.modules ?? {})
                    .filter(([, enabled]) => enabled)
                    .map(([key]) => salesModuleLabel(key as SalesModuleKey));

                  return (
                    <div key={item.id} className="rounded-md border p-3 text-xs">
                      <p className="font-medium">{item.reason}</p>
                      <p className="mt-1 text-muted-foreground">
                        {formatWibDate(item.created_at)}
                        {" · "}
                        Aktif: {enabledKeys.length > 0 ? enabledKeys.join(", ") : "—"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="danger" className="mt-4 space-y-4">
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4">
                <p className="text-sm font-semibold text-destructive">Hapus organisasi</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Semua data <span className="font-medium text-foreground">{row.company_name}</span>{" "}
                  dihapus permanen. Tidak bisa dibatalkan.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4 w-full"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Hapus organisasi
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <SheetFooter className="mt-6 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            {activeTab === "subscription" && (
              <Button
                disabled={
                  !!validationError ||
                  !!salesPackageError ||
                  (salesSubscriptionClock && !salesContractSnapshot) ||
                  updateMutation.isPending ||
                  savePendingMutation.isPending
                }
                onClick={() => setConfirmOpen(true)}
              >
                Simpan
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi perubahan</AlertDialogTitle>
            <AlertDialogDescription>
              {salesSubscriptionClock ? (
                <>
                  {isTrial ? "Tanggal, modul, dan kuota" : "Tanggal, modul, kuota, dan harga paket"} untuk{" "}
                  <strong>{row.company_name}</strong> disimpan sebagai paket menunggu ({previewStatus} hingga{" "}
                  <strong>{previewEndLabel}</strong>). Tenant belum berubah sampai PDF yang ditandatangani
                  diunggah.
                  {!isTrial && parsedMonthlyPrice !== null ? (
                    <>
                      {" "}
                      Harga paket: <strong>{formatContractIdr(parsedMonthlyPrice)}</strong> per bulan.
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  Anda akan mengubah subscription untuk <strong>{row.company_name}</strong> menjadi{" "}
                  <strong>{previewStatus}</strong> hingga <strong>{previewEndLabel}</strong>.
                </>
              )}
              {reason.trim() && (
                <>
                  <br />
                  <br />
                  Alasan: {reason.trim()}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateMutation.isPending || savePendingMutation.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={updateMutation.isPending || savePendingMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              {updateMutation.isPending || savePendingMutation.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={settingsConfirmOpen} onOpenChange={setSettingsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi pengaturan tenant</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan mengubah tipe tenant untuk <strong>{row.company_name}</strong> menjadi{" "}
              <strong>{selfServiceEnabled ? "Mandiri" : "Sales"}</strong>.
              {settingsReason.trim() && (
                <>
                  <br />
                  <br />
                  Alasan: {settingsReason.trim()}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={settingsMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={settingsMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSaveSettings();
              }}
            >
              {settingsMutation.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={modulesConfirmOpen} onOpenChange={setModulesConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi akses modul</AlertDialogTitle>
            <AlertDialogDescription>
              {isTrial ? "Tanggal, modul, dan kuota" : "Tanggal, modul, kuota, dan harga paket"} untuk{" "}
              <strong>{row.company_name}</strong> disimpan sebagai paket menunggu. Tenant belum berubah
              sampai PDF yang ditandatangani diunggah.
              {!isTrial && parsedMonthlyPrice !== null ? (
                <>
                  {" "}
                  Harga paket: <strong>{formatContractIdr(parsedMonthlyPrice)}</strong> per bulan.
                </>
              ) : null}
              {parsedHrSeat !== null ? (
                <>
                  {" "}
                  Seat HR: <strong>{parsedHrSeat}</strong>.
                </>
              ) : null}
              {parsedSeatQuota !== null ? (
                <>
                  {" "}
                  Kuota user omnichannel: <strong>{parsedSeatQuota}</strong>.
                </>
              ) : null}
              {moduleAccess.pos && parsedOutletQuota !== null ? (
                <>
                  {" "}
                  Kuota outlet: <strong>{parsedOutletQuota}</strong>.
                </>
              ) : null}
              {removedRosterPreview.length > 0 ? (
                <>
                  {" "}
                  Saat PDF diunggah, user ini dikeluarkan dari roster:{" "}
                  <strong>
                    {removedRosterPreview.map((member) => rosterMemberLabel(member)).join(", ")}
                  </strong>
                  .
                </>
              ) : null}
              {moduleAccess.pos &&
              parsedOutletQuota !== null &&
              (salesModules?.outlets.length ?? 0) > parsedOutletQuota ? (
                <>
                  {" "}
                  Saat PDF diunggah, outlet ini ditutup:{" "}
                  <strong>
                    {(salesModules?.outlets ?? [])
                      .filter((outlet) => !keptOutletIds.includes(outlet.id))
                      .map((outlet) => outlet.name)
                      .join(", ")}
                  </strong>
                  .
                </>
              ) : null}
              {modulesReason.trim() && (
                <>
                  <br />
                  <br />
                  Alasan: {modulesReason.trim()}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savePendingMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={savePendingMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSaveModules();
              }}
            >
              {savePendingMutation.isPending ? "Menyimpan..." : "Ya, simpan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteOrganizationDialog
        organizationId={row.organization_id}
        companyName={row.company_name}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDeleted={() => {
          setDeleteDialogOpen(false);
          onOpenChange(false);
          onOrganizationDeleted?.();
        }}
      />
    </>
  );
}
