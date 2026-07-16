export type CustomerSupportTier = "limited" | "standard" | "247";

export function isEnterprisePlanName(planName: string): boolean {
  const n = planName
    .trim()
    .toLowerCase()
    .replace(/[-–—]/g, " ")
    .replace(/\s+/g, " ");
  if (n === "enterprise") return true;
  return n === "enterprise plan" || /\benterprise\b/.test(n);
}

export function resolveCustomerSupportTier(params: {
  basePricePerMember: number | null | undefined;
  planName: string;
  isCustom?: boolean;
}): CustomerSupportTier {
  if (params.isCustom === true || isEnterprisePlanName(params.planName)) {
    return "247";
  }
  const price = params.basePricePerMember ?? 0;
  if (price === 0) return "limited";
  return "standard";
}

const TIER_HINT_LABEL: Record<CustomerSupportTier, string> = {
  limited: "Limited Support",
  standard: "Standard Support",
  "247": "24/7 support",
};

export function customerSupportHintForTier(tier: CustomerSupportTier): string {
  return `Kartu office: ${TIER_HINT_LABEL[tier]}`;
}
