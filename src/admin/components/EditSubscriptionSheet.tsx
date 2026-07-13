import { useEffect, useMemo, useState } from "react";
import DeleteOrganizationDialog from "@/admin/components/DeleteOrganizationDialog";
import { useUpdateOrganizationSubscription } from "@/admin/hooks/useUpdateOrganizationSubscription";
import { useUpdateOrganizationSettings } from "@/admin/hooks/useUpdateOrganizationSettings";
import { useOrganizationModuleAdjustments } from "@/admin/hooks/useOrganizationModuleAdjustments";
import { useOrganizationSalesModules } from "@/admin/hooks/useOrganizationSalesModules";
import { useUpdateOrganizationSalesModules } from "@/admin/hooks/useUpdateOrganizationSalesModules";
import { useSubscriptionAdjustments } from "@/admin/hooks/useSubscriptionAdjustments";
import {
  createDefaultSalesModulesRecord,
  SALES_MODULE_CATALOG,
  salesModuleLabel,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import {
  formatWibDate,
  previewEffectiveStatus,
  utcToWibDateInput,
  wibDateInputToUtcEndOfDay,
} from "@/admin/lib/subscriptionDates";
import type { AdminOrganizationRow } from "@/admin/types/organization";
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
  const [activeTab, setActiveTab] = useState<"subscription" | "tenant" | "history" | "danger">(
    "subscription",
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateMutation = useUpdateOrganizationSubscription();
  const settingsMutation = useUpdateOrganizationSettings();
  const modulesMutation = useUpdateOrganizationSalesModules();
  const { data: salesModules, isLoading: salesModulesLoading } = useOrganizationSalesModules(
    row?.organization_id ?? null,
  );
  const { data: adjustments, isLoading: adjustmentsLoading } = useSubscriptionAdjustments(
    row?.organization_id ?? null,
  );
  const { data: moduleAdjustments, isLoading: moduleAdjustmentsLoading } =
    useOrganizationModuleAdjustments(row?.organization_id ?? null);

  useEffect(() => {
    if (!row || !open) return;
    setIsTrial(row.is_trial);
    setTrialDateInput(utcToWibDateInput(row.trial_end_date));
    setSubscriptionDateInput(utcToWibDateInput(row.subscription_end_date));
    setReason("");
    setSelfServiceEnabled(row.subscription_self_service_enabled);
    setSettingsReason("");
    setConfirmOpen(false);
    setSettingsConfirmOpen(false);
    setModulesConfirmOpen(false);
    setModulesReason("");
    setActiveTab("subscription");
    setDeleteDialogOpen(false);
  }, [row, open]);

  useEffect(() => {
    if (!salesModules?.is_sales_tenant) {
      setModuleAccess(createDefaultSalesModulesRecord());
      return;
    }
    setModuleAccess(salesModules.modules);
  }, [salesModules]);

  const trialEndUtc = trialDateInput ? wibDateInputToUtcEndOfDay(trialDateInput) : null;
  const subscriptionEndUtc = subscriptionDateInput
    ? wibDateInputToUtcEndOfDay(subscriptionDateInput)
    : null;

  const previewStatus = useMemo(
    () => previewEffectiveStatus(isTrial, trialEndUtc, subscriptionEndUtc),
    [isTrial, trialEndUtc, subscriptionEndUtc],
  );

  const previewEndLabel = isTrial ? formatWibDate(trialEndUtc) : formatWibDate(subscriptionEndUtc);

  const validationError = useMemo(() => {
    if (reason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    if (isTrial) {
      if (!trialDateInput) return "Tanggal berakhir trial wajib diisi.";
    } else if (!subscriptionDateInput) {
      return "Tanggal berakhir berlangganan wajib diisi.";
    }

    const activeEnd = isTrial ? trialEndUtc : subscriptionEndUtc;
    if (activeEnd && new Date(activeEnd) > new Date()) {
      const maxFuture = new Date();
      maxFuture.setDate(maxFuture.getDate() + 365);
      if (new Date(activeEnd) > maxFuture) {
        return "Tanggal tidak boleh lebih dari 365 hari dari hari ini.";
      }
    }
    return null;
  }, [isTrial, trialDateInput, subscriptionDateInput, reason, trialEndUtc, subscriptionEndUtc]);

  const settingsValidationError = useMemo(() => {
    if (settingsReason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [settingsReason]);

  const modulesValidationError = useMemo(() => {
    if (modulesReason.trim().length < 3) return "Alasan wajib diisi (min. 3 karakter).";
    return null;
  }, [modulesReason]);

  const modulesDirty = useMemo(() => {
    if (!salesModules?.is_sales_tenant) return false;
    return SALES_MODULE_CATALOG.some(({ key }) => moduleAccess[key] !== salesModules.modules[key]);
  }, [moduleAccess, salesModules]);

  const handleSave = async () => {
    if (!row || validationError) return;

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
    if (!row || modulesValidationError) return;

    try {
      await modulesMutation.mutateAsync({
        organization_id: row.organization_id,
        modules: moduleAccess,
        reason: modulesReason.trim(),
      });
      toast.success("Akses modul berhasil diperbarui.");
      setModulesConfirmOpen(false);
      setModulesReason("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui akses modul.";
      toast.error(message.includes("not allowed") ? "Akses ditolak." : message);
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
                    Berlangganan (referensi): {formatWibDate(subscriptionEndUtc)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="subscription-end">Berakhir berlangganan (WIB)</Label>
                <Input
                  id="subscription-end"
                  type="date"
                  value={subscriptionDateInput}
                  onChange={(e) => setSubscriptionDateInput(e.target.value)}
                />
                {trialDateInput && (
                  <p className="text-xs text-muted-foreground">
                    Trial (referensi): {formatWibDate(trialEndUtc)}
                  </p>
                )}
              </div>
            )}

            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="font-medium">Preview setelah simpan</p>
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
                    <div className="space-y-2">
                      {SALES_MODULE_CATALOG.map(({ key, label }) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-3 rounded-md border p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">
                              {moduleAccess[key]
                                ? "Aktif — tenant bisa akses modul"
                                : "Blocked — upsell di office"}
                            </p>
                          </div>
                          <Switch
                            checked={moduleAccess[key]}
                            onCheckedChange={(checked) =>
                              setModuleAccess((prev) => ({ ...prev, [key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
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

                  <Button
                    className="w-full"
                    disabled={
                      !!modulesValidationError ||
                      modulesMutation.isPending ||
                      !modulesDirty ||
                      salesModulesLoading
                    }
                    onClick={() => setModulesConfirmOpen(true)}
                  >
                    Simpan modul
                  </Button>
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
                const isSettingsChange =
                  item.after_state.subscription_self_service_enabled !== undefined &&
                  item.after_state.status === undefined;

                return (
                  <div key={item.id} className="rounded-md border p-3 text-xs">
                    <p className="font-medium">{item.reason}</p>
                    <p className="mt-1 text-muted-foreground">
                      {formatWibDate(item.created_at)}
                      {isSettingsChange ? (
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
                        </>
                      )}
                    </p>
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
                disabled={!!validationError || updateMutation.isPending}
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
              Anda akan mengubah subscription untuk <strong>{row.company_name}</strong> menjadi{" "}
              <strong>{previewStatus}</strong> hingga <strong>{previewEndLabel}</strong>.
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
            <AlertDialogCancel disabled={updateMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={updateMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSave();
              }}
            >
              {updateMutation.isPending ? "Menyimpan..." : "Ya, simpan"}
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
              Anda akan memperbarui modul aktif untuk <strong>{row.company_name}</strong>.
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
            <AlertDialogCancel disabled={modulesMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={modulesMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                void handleSaveModules();
              }}
            >
              {modulesMutation.isPending ? "Menyimpan..." : "Ya, simpan"}
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
