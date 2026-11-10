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
  const match = /^(\d{4}-\d{2}-\d{2})$/.exec(dateInput.trim());
  if (!match) return "";
  const parsed = new Date(`${match[1]}T23:59:59.999+07:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

function wibClockParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const hour = pick("hour") === "24" ? "00" : pick("hour");
  return { year: pick("year"), month: pick("month"), day: pick("day"), hour, minute: pick("minute") };
}

/** UTC ISO string → YYYY-MM-DDTHH:mm for datetime-local (WIB). */
export function utcToWibDateTimeInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const { year, month, day, hour, minute } = wibClockParts(iso);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/** Add calendar months in WIB and return YYYY-MM-DDTHH:mm. Day clamps to the target month. */
export function addCalendarMonthsInWib(from: Date, months: number): string {
  const { year, month, day, hour, minute } = wibClockParts(from.toISOString());
  const monthIndex = Number(year) * 12 + (Number(month) - 1) + months;
  const nextYear = Math.floor(monthIndex / 12);
  const nextMonth = (monthIndex % 12) + 1;
  const lastDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
  const nextDay = Math.min(Number(day), lastDay);
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}T${hour}:${minute}`;
}

/** Extend a future end. An empty or past end starts from now. */
export function renewalStart(currentEndUtc: string | null, now = new Date()): Date {
  if (!currentEndUtc) return now;
  const end = new Date(currentEndUtc);
  if (Number.isNaN(end.getTime()) || end.getTime() <= now.getTime()) return now;
  return end;
}

/** YYYY-MM-DDTHH:mm from datetime-local → UTC ISO at that WIB minute. */
export function wibDateTimeInputToUtc(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return "";
  const parsed = new Date(`${match[1]}T${match[2]}:${match[3]}:00+07:00`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString();
}

export function formatWibDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: WIB_TIMEZONE,
  });
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
