const MAX_PRICE = 10_000_000;

export function formatIdr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Parse user input like "50.000" or "50000" to number. */
export function parseIdrInput(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

export function formatIdrInput(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(amount)) return "";
  return new Intl.NumberFormat("id-ID").format(amount);
}

export function validatePrice(amount: number | null, label = "Harga"): string | null {
  if (amount === null || Number.isNaN(amount)) return `${label} wajib diisi.`;
  if (amount < 0 || amount > MAX_PRICE) {
    return `${label} harus antara Rp 0 dan ${formatIdr(MAX_PRICE)}.`;
  }
  return null;
}

export function validateDiscountPercent(value: number | null): string | null {
  if (value === null) return null;
  if (Number.isNaN(value) || value < 0 || value > 100) {
    return "Diskon tahunan harus antara 0 dan 100%.";
  }
  return null;
}

export function validateTrialDays(value: number | null): string | null {
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 0) {
    return "Hari trial harus bilangan bulat >= 0.";
  }
  return null;
}

export function validateMaxMembers(value: number | null): string | null {
  if (value === null || Number.isNaN(value)) return "Max member wajib diisi.";
  if (!Number.isInteger(value) || value < 1 || value > 1000) {
    return "Max member harus bilangan bulat antara 1 dan 1000.";
  }
  return null;
}

/** Plan berbayar per member — cap ditentukan jumlah member di office, bukan kolom max_members. */
export function planUsesPerMemberPricing(basePrice: number | null): boolean {
  return basePrice !== null && basePrice > 0;
}

/** Max member hanya untuk plan gratis (harga Rp 0). */
export function maxMembersAppliesToPlan(basePrice: number | null): boolean {
  return basePrice !== null && basePrice === 0;
}

/** Default cap untuk plan gratis / trial tanpa harga. */
export function defaultMaxMembersForPlan(
  basePrice: number | null,
  trialDays: number | null,
): number {
  if (!maxMembersAppliesToPlan(basePrice)) return 1;
  if (trialDays !== null && trialDays > 0) return 1;
  return 1;
}
