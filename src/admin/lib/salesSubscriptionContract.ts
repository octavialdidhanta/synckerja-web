import { supabase } from "@/share/supabase/client";

export const SALES_CONTRACT_BUCKET = "sales-subscription-contracts";
export const SALES_CONTRACT_MAX_BYTES = 10 * 1024 * 1024;

export function sameUtcMinute(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  if (!left && !right) return true;
  if (!left || !right) return false;
  const a = new Date(left);
  const b = new Date(right);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;
  return Math.floor(a.getTime() / 60_000) === Math.floor(b.getTime() / 60_000);
}

export function salesContractFileError(file: File | null, required: boolean): string | null {
  if (!required) return null;
  if (!file) return "Kontrak PDF wajib diunggah.";
  if (file.type && file.type !== "application/pdf") return "Kontrak harus berupa PDF.";
  if (!file.name.toLowerCase().endsWith(".pdf")) return "Kontrak harus berupa PDF.";
  if (file.size <= 0 || file.size > SALES_CONTRACT_MAX_BYTES) {
    return "Kontrak PDF paling besar 10 MB.";
  }
  return null;
}

export async function uploadSalesContract(organizationId: string, file: File): Promise<string> {
  const path = `${organizationId}/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage.from(SALES_CONTRACT_BUCKET).upload(path, file, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function removeUnrecordedSalesContract(path: string): Promise<void> {
  await supabase.storage.from(SALES_CONTRACT_BUCKET).remove([path]);
}

export async function openSalesContract(path: string): Promise<void> {
  const { data, error } = await supabase.storage
    .from(SALES_CONTRACT_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Kontrak tidak bisa dibuka.");
  }
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
