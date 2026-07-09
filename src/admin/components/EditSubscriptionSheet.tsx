import { useEffect, useMemo, useState } from "react";
import { useUpdateOrganizationSubscription } from "@/admin/hooks/useUpdateOrganizationSubscription";
import { useSubscriptionAdjustments } from "@/admin/hooks/useSubscriptionAdjustments";
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
import { Tabs, TabsList, TabsTrigger } from "@/share/ui/tabs";
import { Textarea } from "@/share/ui/textarea";
import { toast } from "@/share/ui/sonner";

type EditSubscriptionSheetProps = {
  row: AdminOrganizationRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export default function EditSubscriptionSheet({ row, open, onOpenChange }: EditSubscriptionSheetProps) {
  const [isTrial, setIsTrial] = useState(false);
  const [trialDateInput, setTrialDateInput] = useState("");
  const [subscriptionDateInput, setSubscriptionDateInput] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const updateMutation = useUpdateOrganizationSubscription();
  const { data: adjustments, isLoading: adjustmentsLoading } = useSubscriptionAdjustments(
    row?.organization_id ?? null,
  );

  useEffect(() => {
    if (!row || !open) return;
    setIsTrial(row.is_trial);
    setTrialDateInput(utcToWibDateInput(row.trial_end_date));
    setSubscriptionDateInput(utcToWibDateInput(row.subscription_end_date));
    setReason("");
    setConfirmOpen(false);
  }, [row, open]);

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

  if (!row) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Atur Subscription</SheetTitle>
            <SheetDescription>{row.company_name}</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
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

            <div className="space-y-3">
              <p className="text-sm font-medium">Riwayat perubahan</p>
              {adjustmentsLoading && (
                <p className="text-sm text-muted-foreground">Memuat riwayat...</p>
              )}
              {!adjustmentsLoading && (!adjustments || adjustments.length === 0) && (
                <p className="text-sm text-muted-foreground">Belum ada riwayat.</p>
              )}
              {adjustments?.map((item) => (
                <div key={item.id} className="rounded-md border p-3 text-xs">
                  <p className="font-medium">{item.reason}</p>
                  <p className="mt-1 text-muted-foreground">
                    {formatWibDate(item.created_at)} ·{" "}
                    {item.after_state.is_trial ? "trial" : "paid"} · status{" "}
                    {item.after_state.status}
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
              disabled={!!validationError || updateMutation.isPending}
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
    </>
  );
}
