import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useDeleteOrganization } from "@/admin/hooks/useDeleteOrganization";
import { usePreviewOrganizationDeletion } from "@/admin/hooks/usePreviewOrganizationDeletion";
import {
  ORGANIZATION_DELETE_CONFIRM_PHRASE,
  type OrganizationDeletionPreview,
} from "@/admin/types/organization";
import { cn } from "@/home/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/share/ui/alert-dialog";
import { Button } from "@/share/ui/button";
import { Checkbox } from "@/share/ui/checkbox";
import { Input } from "@/share/ui/input";
import { Label } from "@/share/ui/label";
import { Textarea } from "@/share/ui/textarea";
import { toast } from "@/share/ui/sonner";

const COUNTDOWN_SECONDS = 5;

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function PreviewSummary({ preview }: { preview: OrganizationDeletionPreview }) {
  return (
    <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground">
      <p>
        <span className="font-medium text-foreground">{preview.member_count}</span> anggota ·{" "}
        <span className="font-medium text-foreground">{preview.user_count}</span> user
        {preview.has_active_subscription ? " · Subscription aktif" : ""}
      </p>
      {preview.has_active_subscription && (
        <p className="text-destructive">Data pembayaran ikut terhapus.</p>
      )}
      {preview.has_cms_admin_member && (
        <p className="text-destructive">Tidak bisa dihapus: ada anggota CMS admin.</p>
      )}
    </div>
  );
}

function ConfirmText({ children }: { children: ReactNode }) {
  return (
    <strong className="font-semibold text-foreground">&quot;{children}&quot;</strong>
  );
}

type DeleteOrganizationDialogProps = {
  organizationId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
};

export default function DeleteOrganizationDialog({
  organizationId,
  companyName,
  open,
  onOpenChange,
  onDeleted,
}: DeleteOrganizationDialogProps) {
  const [confirmName, setConfirmName] = useState("");
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { data: preview, isLoading: previewLoading, error: previewError } =
    usePreviewOrganizationDeletion(organizationId, open);
  const deleteMutation = useDeleteOrganization();

  useEffect(() => {
    if (!open) {
      setConfirmName("");
      setConfirmPhrase("");
      setReason("");
      setAcknowledged(false);
      setCountdown(0);
    }
  }, [open]);

  const inputsValid = useMemo(() => {
    if (!preview) return false;
    if (preview.has_cms_admin_member) return false;
    if (reason.trim().length < 3) return false;
    if (normalizeName(confirmName) !== normalizeName(companyName)) return false;
    if (normalizeName(confirmPhrase) !== ORGANIZATION_DELETE_CONFIRM_PHRASE) return false;
    return acknowledged;
  }, [preview, reason, confirmName, confirmPhrase, acknowledged, companyName]);

  useEffect(() => {
    if (!open || !inputsValid) {
      setCountdown(0);
      return;
    }

    setCountdown(COUNTDOWN_SECONDS);
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [open, inputsValid]);

  const canDelete = inputsValid && countdown === 0 && !deleteMutation.isPending;

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      const result = await deleteMutation.mutateAsync({
        organization_id: organizationId,
        confirm_name: confirmName,
        confirm_phrase: confirmPhrase,
        reason: reason.trim(),
      });
      toast.success(
        `Organisasi "${result.company_name}" dihapus. ${result.deleted_auth_users} user Auth, ${result.deleted_storage_objects} file storage.`,
      );
      onOpenChange(false);
      onDeleted?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal menghapus organisasi.";
      if (message.includes("cms admin members")) {
        toast.error("Organisasi memiliki anggota CMS admin. Penghapusan dibatalkan.");
      } else if (message.includes("not allowed")) {
        toast.error("Akses ditolak.");
      } else if (message.includes("organization name does not match")) {
        toast.error("Nama organisasi tidak cocok.");
      } else if (message.includes("invalid confirmation phrase")) {
        toast.error("Frasa konfirmasi tidak cocok.");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus organisasi</AlertDialogTitle>
          <AlertDialogDescription>
            Data dihapus permanen. Tidak bisa dikembalikan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {previewLoading && <p className="text-sm text-muted-foreground">Memuat...</p>}
        {previewError && (
          <p className="text-sm text-destructive">
            {previewError instanceof Error ? previewError.message : "Gagal memuat preview."}
          </p>
        )}
        {preview && <PreviewSummary preview={preview} />}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete-confirm-name">
              Ketik <ConfirmText>{companyName}</ConfirmText>
            </Label>
            <Input
              id="delete-confirm-name"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={companyName}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm-phrase">
              Ketik <ConfirmText>{ORGANIZATION_DELETE_CONFIRM_PHRASE}</ConfirmText>
            </Label>
            <Input
              id="delete-confirm-phrase"
              value={confirmPhrase}
              onChange={(e) => setConfirmPhrase(e.target.value)}
              placeholder={ORGANIZATION_DELETE_CONFIRM_PHRASE}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delete-reason">Alasan</Label>
            <Textarea
              id="delete-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: tenant duplikat"
              rows={2}
            />
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="delete-ack"
              checked={acknowledged}
              onCheckedChange={(checked) => setAcknowledged(checked === true)}
            />
            <Label htmlFor="delete-ack" className="text-sm font-normal leading-snug">
              Saya paham ini permanen.
            </Label>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!canDelete}
            className={cn(!canDelete && "opacity-60")}
            onClick={(e) => {
              e.preventDefault();
              void handleDelete();
            }}
          >
            {deleteMutation.isPending
              ? "Menghapus..."
              : countdown > 0
                ? `Hapus (${countdown}s)`
                : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
