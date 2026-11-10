import { useEffect, useState } from "react";
import { useApplySalesSignedContract, useSalesContractPending } from "@/admin/hooks/useSalesContractPending";
import { downloadSalesContractPdf } from "@/admin/lib/salesContractPdf";
import {
  salesContractErrorMessage,
  salesContractFormMatchesPending,
  type ContractAnnexOutlet,
  type SalesContractBaseline,
  type SalesContractFormSnapshot,
} from "@/admin/lib/salesContractPackage";
import {
  removeUnrecordedSalesContract,
  salesContractFileError,
  uploadSalesContract,
} from "@/admin/lib/salesSubscriptionContract";
import { Button } from "@/share/ui/button";
import { Input } from "@/share/ui/input";
import { toast } from "@/share/ui/sonner";

type SalesContractPanelProps = {
  organizationId: string;
  organizationName: string;
  snapshot: SalesContractFormSnapshot | null;
  outlets?: ContractAnnexOutlet[];
  current?: SalesContractBaseline;
};

export default function SalesContractPanel({
  organizationId,
  organizationName,
  snapshot,
  outlets = [],
  current,
}: SalesContractPanelProps) {
  const pendingQuery = useSalesContractPending(organizationId);
  const applyMutation = useApplySalesSignedContract();
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const pending = pendingQuery.data ?? null;
  const matches = Boolean(snapshot && pending && salesContractFormMatchesPending(snapshot, pending));
  const fileError = salesContractFileError(file, Boolean(file));
  const savedAt = pending?.saved_at ?? "";

  useEffect(() => {
    setFile(null);
    setInputKey((current) => current + 1);
  }, [organizationId, savedAt]);

  const hint = !pending
    ? "Simpan tanggal atau modul terlebih dahulu."
    : matches
      ? "Unduh kontrak ini, tanda tangani, lalu unggah PDF yang sama."
      : "Isian berbeda dari paket menunggu. Simpan lagi agar kontrak mengikuti isian ini.";

  const handleDownload = async () => {
    if (!pending || !matches) return;
    setDownloading(true);
    try {
      await downloadSalesContractPdf({ organizationName, pending, outlets, current });
    } catch {
      toast.error("Kontrak gagal diunduh.");
    } finally {
      setDownloading(false);
    }
  };

  const handleApply = async () => {
    if (!file || !matches || fileError) return;
    let uploadedPath: string | null = null;
    try {
      uploadedPath = await uploadSalesContract(organizationId, file);
      await applyMutation.mutateAsync({ organizationId, contractPath: uploadedPath });
      uploadedPath = null;
      setFile(null);
      setInputKey((current) => current + 1);
      toast.success(
        pending.is_trial
          ? "Kontrak diterapkan. Tanggal, modul, dan kuota sudah diperbarui."
          : "Kontrak diterapkan. Tanggal, modul, kuota, dan harga paket sudah diperbarui.",
      );
    } catch (error) {
      if (uploadedPath) await removeUnrecordedSalesContract(uploadedPath);
      toast.error(salesContractErrorMessage(error, "Kontrak gagal diterapkan."));
    }
  };

  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">Kontrak</p>
      <p className="text-xs text-muted-foreground">{hint}</p>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={!matches || pendingQuery.isLoading || downloading}
        onClick={() => void handleDownload()}
      >
        {downloading ? "Menyiapkan PDF..." : "Unduh kontrak"}
      </Button>
      <Input
        key={`${organizationId}:${inputKey}`}
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      {file ? <p className="text-xs text-muted-foreground">{file.name}</p> : null}
      {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
      <Button
        type="button"
        className="w-full"
        disabled={!matches || !file || !!fileError || applyMutation.isPending}
        onClick={() => void handleApply()}
      >
        {applyMutation.isPending ? "Menerapkan..." : "Unggah dan terapkan"}
      </Button>
    </div>
  );
}
