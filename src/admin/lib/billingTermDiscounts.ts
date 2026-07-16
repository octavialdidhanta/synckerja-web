import { validateDiscountPercent } from "@/admin/lib/formatCurrency";

export type BillingTermKey = "1" | "3" | "6" | "12";

export type BillingTermDiscounts = Record<BillingTermKey, number | null>;

export const BILLING_TERM_KEYS: BillingTermKey[] = ["1", "3", "6", "12"];

export const BILLING_TERM_LABELS: Record<BillingTermKey, string> = {
  "1": "1 bulan",
  "3": "3 bulan",
  "6": "6 bulan",
  "12": "1 tahun",
};

export function defaultBillingTermDiscounts(): BillingTermDiscounts {
  return { "1": null, "3": null, "6": null, "12": null };
}

export function billingTermDiscountsFromPlan(
  raw: Record<string, unknown> | null | undefined,
  annualFallback?: number | null,
): BillingTermDiscounts {
  const out = defaultBillingTermDiscounts();
  for (const key of BILLING_TERM_KEYS) {
    const val = raw?.[key];
    if (val === null || val === undefined || val === "") continue;
    const num = Number(val);
    if (Number.isFinite(num)) out[key] = num;
  }
  if (out["12"] === null && annualFallback != null && Number.isFinite(annualFallback)) {
    out["12"] = annualFallback;
  }
  return out;
}

export function discountInputsFromDiscounts(discounts: BillingTermDiscounts): Record<BillingTermKey, string> {
  return BILLING_TERM_KEYS.reduce(
    (acc, key) => {
      acc[key] = discounts[key] === null ? "" : String(discounts[key]);
      return acc;
    },
    {} as Record<BillingTermKey, string>,
  );
}

export function parseBillingTermDiscounts(
  inputs: Record<BillingTermKey, string>,
): BillingTermDiscounts {
  return BILLING_TERM_KEYS.reduce(
    (acc, key) => {
      const trimmed = inputs[key]?.trim() ?? "";
      acc[key] = trimmed === "" ? null : Number(trimmed);
      return acc;
    },
    defaultBillingTermDiscounts(),
  );
}

export function validateBillingTermDiscounts(discounts: BillingTermDiscounts): string | null {
  for (const key of BILLING_TERM_KEYS) {
    const err = validateDiscountPercent(discounts[key], `Diskon ${BILLING_TERM_LABELS[key]}`);
    if (err) return err;
  }
  return null;
}

export function formatBillingTermDiscountsSummary(discounts: BillingTermDiscounts | null | undefined): string {
  if (!discounts) return "—";
  return BILLING_TERM_KEYS.map((key) => {
    const val = discounts[key];
    const short = key === "12" ? "12m" : `${key}m`;
    return `${short}: ${val == null ? "—" : `${val}%`}`;
  }).join(" · ");
}
