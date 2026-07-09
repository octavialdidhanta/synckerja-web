const WIB_TIMEZONE = "Asia/Jakarta";

/** UTC ISO string → YYYY-MM-DD for date input (WIB calendar day). */
export function utcToWibDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-CA", { timeZone: WIB_TIMEZONE });
}

/** YYYY-MM-DD from date input → UTC ISO at end of that day in WIB. */
export function wibDateInputToUtcEndOfDay(dateInput: string): string {
  return new Date(`${dateInput}T23:59:59.999+07:00`).toISOString();
}

export function formatWibDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: WIB_TIMEZONE,
  });
}

export function previewEffectiveStatus(
  isTrial: boolean,
  trialEndUtc: string | null,
  subscriptionEndUtc: string | null,
): string {
  const activeEnd = isTrial ? trialEndUtc : subscriptionEndUtc;
  if (!activeEnd) return "unknown";
  if (new Date(activeEnd) <= new Date()) return "expired";
  return isTrial ? "trial" : "active";
}
