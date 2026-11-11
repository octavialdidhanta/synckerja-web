import {
  coerceSalesModuleDependencies,
  createDefaultSalesModulesRecord,
  getSubModulesForParent,
  SALES_MODULE_KEYS,
  SALES_MODULE_TOP_LEVEL,
  SALES_PLAN_FEATURE_TOGGLES,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";

export type SalesBillingMode = "monthly" | "prepaid";

export type SalesContractPending = {
  organization_id: string;
  reason: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  modules: Record<string, boolean>;
  hr_seat_count: number;
  omnichannel_paid_seat_count: number;
  ai_employee_seat_count: number;
  keep_employee_ids: string[];
  outlet_quota: number | null;
  keep_outlet_ids: string[];
  monthly_price_idr: number | null;
  billing_mode: SalesBillingMode | null;
  ppn_included: boolean | null;
  price_effective_on: string | null;
  period_value_idr: number | null;
  adjustment_idr: number | null;
  saved_at: string;
};

export type SalesContractFormSnapshot = {
  isTrial: boolean;
  trialEndUtc: string | null;
  subscriptionEndUtc: string | null;
  modules: Record<SalesModuleKey, boolean>;
  hrSeats: number;
  omniSeats: number;
  aiEmployeeSeats: number;
  keepEmployeeIds: string[];
  outletQuota: number;
  keepOutletIds: string[];
  monthlyPriceIdr: number | null;
  billingMode: SalesBillingMode | null;
  ppnIncluded: boolean | null;
  priceEffectiveOn: string | null;
};

export type SalesContractRow = {
  label: string;
  value: string;
};

export type SalesContractBaseline = {
  modules: Record<string, boolean>;
  hrSeats: number;
  omniSeats: number;
  aiEmployeeSeats?: number;
  outletQuota: number | null;
  monthlyPriceIdr?: number | null;
};

export function formatContractIdr(amount: number): string {
  const digits = Math.trunc(Math.abs(amount)).toString();
  return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function parseContractIdr(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) {
    const parsed = Number(value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
}

export function parseBillingMode(value: unknown): SalesBillingMode | null {
  return value === "monthly" || value === "prepaid" ? value : null;
}

export function formatPackagePriceInput(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function parsePackagePriceInput(value: string): number | null {
  const digits = value.trim().replace(/\./g, "");
  if (!/^\d+$/.test(digits)) return null;
  return parseContractIdr(digits);
}

export function contractTermMonthsBetween(start: string, end: string): number {
  const startParts = start.split("-").map(Number);
  const endParts = end.split("-").map(Number);
  if (startParts.length !== 3 || endParts.length !== 3) return 0;
  const [startYear, startMonth, startDay] = startParts;
  const [endYear, endMonth, endDay] = endParts;
  if (!startYear || !startMonth || !startDay || !endYear || !endMonth || !endDay) return 0;
  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const endUtc = Date.UTC(endYear, endMonth - 1, endDay);
  if (endUtc < startUtc) return 0;
  const months = (endYear - startYear) * 12 + (endMonth - startMonth);
  return endDay > startDay ? months + 1 : months;
}

function wibCalendarDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export type ContractAnnexRow = {
  item: string;
  current: string;
  agreement: string;
};

export type ContractAnnexOutlet = {
  id: string;
  name: string;
  is_active?: boolean;
};

function sameUtcMinute(left: string | null | undefined, right: string | null | undefined): boolean {
  if (!left && !right) return true;
  if (!left || !right) return false;
  const a = new Date(left);
  const b = new Date(right);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return false;
  return Math.floor(a.getTime() / 60_000) === Math.floor(b.getTime() / 60_000);
}

function sameIds(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const a = [...left].sort();
  const b = [...right].sort();
  return a.every((id, index) => id === b[index]);
}

export function salesContractFormMatchesPending(
  form: SalesContractFormSnapshot,
  pending: SalesContractPending,
): boolean {
  if (form.isTrial !== pending.is_trial) return false;
  if (!sameUtcMinute(form.trialEndUtc, pending.trial_end_date)) return false;
  if (!sameUtcMinute(form.subscriptionEndUtc, pending.subscription_end_date)) return false;
  if (form.hrSeats !== pending.hr_seat_count) return false;
  if (form.omniSeats !== pending.omnichannel_paid_seat_count) return false;
  if (form.aiEmployeeSeats !== pending.ai_employee_seat_count) return false;
  if (!sameIds(form.keepEmployeeIds, pending.keep_employee_ids)) return false;
  if (form.outletQuota !== (pending.outlet_quota ?? 0)) return false;
  if (!sameIds(form.keepOutletIds, pending.keep_outlet_ids)) return false;
  if (form.isTrial) {
    if (
      pending.monthly_price_idr != null ||
      pending.billing_mode != null ||
      pending.ppn_included != null ||
      pending.price_effective_on != null
    ) {
      return false;
    }
  } else if (
    form.monthlyPriceIdr !== pending.monthly_price_idr ||
    form.ppnIncluded !== pending.ppn_included ||
    form.priceEffectiveOn !== pending.price_effective_on
  ) {
    return false;
  } else if (form.monthlyPriceIdr != null) {
    const months = contractTermMonthsBetween(
      form.priceEffectiveOn ?? "",
      wibCalendarDate(pending.subscription_end_date),
    );
    if (
      months < 1 ||
      pending.adjustment_idr !== form.monthlyPriceIdr * months ||
      pending.period_value_idr !== pending.adjustment_idr
    ) {
      return false;
    }
  }

  const modules = coerceSalesModuleDependencies(form.modules);
  return SALES_MODULE_KEYS.every((key) => Boolean(modules[key]) === Boolean(pending.modules[key]));
}

export function agreedContractRows(input: {
  modules: Record<string, boolean>;
  hrSeats: number;
  omniSeats: number;
  aiEmployeeSeats?: number;
  outletQuota?: number | null;
  keptOutletNames?: string[];
}): SalesContractRow[] {
  const enabled = (key: string) => Boolean(input.modules[key]);
  const rows: SalesContractRow[] = [];

  for (const mod of SALES_MODULE_TOP_LEVEL) {
    if (enabled(mod.key)) rows.push({ label: mod.label, value: "Aktif" });
    for (const sub of getSubModulesForParent(mod.key, "orgSales")) {
      if (enabled(sub.key)) rows.push({ label: sub.label, value: "Aktif" });
    }
  }

  for (const feature of SALES_PLAN_FEATURE_TOGGLES) {
    if (enabled(feature.key)) rows.push({ label: feature.label, value: "Aktif" });
  }

  if ((enabled("omnichannel") || enabled("whatsappBusiness")) && input.omniSeats > 0) {
    rows.push({ label: "Kuota user omnichannel", value: String(input.omniSeats) });
  }

  if (enabled("humanResources")) {
    rows.push({ label: "Kuota seat HR", value: String(input.hrSeats) });
  }

  if (enabled("aiEmployee")) {
    rows.push({ label: "Kuota karyawan AI", value: String(input.aiEmployeeSeats ?? 0) });
  }

  if (enabled("pos") && input.outletQuota != null && input.outletQuota > 0) {
    rows.push({ label: "Kuota outlet", value: String(input.outletQuota) });
    for (const name of input.keptOutletNames ?? []) {
      rows.push({ label: "Outlet yang tetap buka", value: name });
    }
  }

  return rows;
}

function annexAgreement(current: string, next: string): string {
  return current === next ? "Sama" : next;
}

function moduleLabel(enabled: boolean): string {
  return enabled ? "Aktif" : "Tidak aktif";
}

function sortedOutletNames(names: string[]): string[] {
  return [...new Set(names.map((name) => name.trim()).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, "id"),
  );
}

export function contractAnnexRows(input: {
  current: SalesContractBaseline;
  pending: Pick<
    SalesContractPending,
    "modules" | "hr_seat_count" | "omnichannel_paid_seat_count" | "ai_employee_seat_count" | "outlet_quota"
  >;
  outlets?: ContractAnnexOutlet[];
  keptOutletNames?: string[];
}): ContractAnnexRow[] {
  const currentOn = (key: string) => Boolean(input.current.modules[key]);
  const nextOn = (key: string) => Boolean(input.pending.modules[key]);
  const rows: ContractAnnexRow[] = [];

  const pushModule = (label: string, key: string) => {
    if (!currentOn(key) && !nextOn(key)) return;
    const current = moduleLabel(currentOn(key));
    const next = moduleLabel(nextOn(key));
    rows.push({ item: label, current, agreement: annexAgreement(current, next) });
  };

  for (const mod of SALES_MODULE_TOP_LEVEL) {
    pushModule(mod.label, mod.key);
    for (const sub of getSubModulesForParent(mod.key, "orgSales")) {
      pushModule(sub.label, sub.key);
    }
  }
  for (const feature of SALES_PLAN_FEATURE_TOGGLES) {
    pushModule(feature.label, feature.key);
  }

  const omniOn = (enabled: (key: string) => boolean) => enabled("omnichannel") || enabled("whatsappBusiness");
  if (omniOn(currentOn) || omniOn(nextOn)) {
    const current = omniOn(currentOn) ? String(input.current.omniSeats) : "Tidak berlaku";
    const next = omniOn(nextOn) ? String(input.pending.omnichannel_paid_seat_count) : "Tidak berlaku";
    rows.push({ item: "Kuota user omnichannel", current, agreement: annexAgreement(current, next) });
  }

  if (currentOn("humanResources") || nextOn("humanResources")) {
    const current = currentOn("humanResources") ? String(input.current.hrSeats) : "Tidak berlaku";
    const next = nextOn("humanResources") ? String(input.pending.hr_seat_count) : "Tidak berlaku";
    rows.push({ item: "Kuota seat HR", current, agreement: annexAgreement(current, next) });
  }

  if (currentOn("aiEmployee") || nextOn("aiEmployee")) {
    const current = currentOn("aiEmployee") ? String(input.current.aiEmployeeSeats ?? 0) : "Tidak berlaku";
    const next = nextOn("aiEmployee") ? String(input.pending.ai_employee_seat_count ?? 0) : "Tidak berlaku";
    rows.push({ item: "Kuota karyawan AI", current, agreement: annexAgreement(current, next) });
  }

  if (currentOn("pos") || nextOn("pos")) {
    const activeNames = sortedOutletNames(
      (input.outlets ?? []).filter((outlet) => outlet.is_active !== false).map((outlet) => outlet.name),
    );
    const current = !currentOn("pos")
      ? "Tidak berlaku"
      : input.current.outletQuota != null
        ? String(input.current.outletQuota)
        : String(activeNames.length);
    const next = !nextOn("pos")
      ? "Tidak berlaku"
      : input.pending.outlet_quota != null && input.pending.outlet_quota > 0
        ? String(input.pending.outlet_quota)
        : "Tidak berlaku";
    rows.push({ item: "Kuota outlet", current, agreement: annexAgreement(current, next) });

    const agreedNames = !nextOn("pos")
      ? []
      : sortedOutletNames(
          input.keptOutletNames && input.keptOutletNames.length > 0
            ? input.keptOutletNames
            : (input.outlets ?? []).map((outlet) => outlet.name),
        );
    const currentNames = currentOn("pos") ? activeNames : [];
    const branchNames = sortedOutletNames([...currentNames, ...agreedNames]);
    if (branchNames.length === 0) {
      rows.push({
        item: "Cabang yang beroperasi",
        current: currentOn("pos") ? "Tidak ada" : "Tidak berlaku",
        agreement: nextOn("pos") ? "Tidak ada" : "Tidak berlaku",
      });
    } else {
      const openNow = new Set(currentNames);
      const openNext = new Set(agreedNames);
      for (const name of branchNames) {
        const current = openNow.has(name) ? name : "Tidak aktif";
        const next = openNext.has(name) ? name : nextOn("pos") ? "Ditutup" : "Tidak berlaku";
        rows.push({
          item: "Cabang yang beroperasi",
          current,
          agreement: annexAgreement(current, next),
        });
      }
    }
  }

  return rows;
}

export function emptySalesContractModules(): Record<SalesModuleKey, boolean> {
  const modules = createDefaultSalesModulesRecord();
  for (const key of SALES_MODULE_KEYS) modules[key] = false;
  return modules;
}

export function parseSalesContractPending(data: unknown): SalesContractPending | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (typeof row.organization_id !== "string") return null;

  const modules: Record<string, boolean> = {};
  if (row.modules && typeof row.modules === "object") {
    for (const [key, value] of Object.entries(row.modules as Record<string, unknown>)) {
      modules[key] = Boolean(value);
    }
  }

  const keep = Array.isArray(row.keep_employee_ids)
    ? row.keep_employee_ids.filter((id): id is string => typeof id === "string")
    : [];

  return {
    organization_id: row.organization_id,
    reason: typeof row.reason === "string" ? row.reason : "",
    is_trial: Boolean(row.is_trial),
    trial_end_date: typeof row.trial_end_date === "string" ? row.trial_end_date : null,
    subscription_end_date:
      typeof row.subscription_end_date === "string" ? row.subscription_end_date : null,
    modules,
    hr_seat_count: Number(row.hr_seat_count ?? 0),
    omnichannel_paid_seat_count: Number(row.omnichannel_paid_seat_count ?? 0),
    ai_employee_seat_count: Number(row.ai_employee_seat_count ?? 0),
    keep_employee_ids: keep,
    outlet_quota:
      typeof row.outlet_quota === "number" && Number.isFinite(row.outlet_quota)
        ? row.outlet_quota
        : null,
    keep_outlet_ids: Array.isArray(row.keep_outlet_ids)
      ? row.keep_outlet_ids.filter((id): id is string => typeof id === "string")
      : [],
    monthly_price_idr: parseContractIdr(row.monthly_price_idr),
    billing_mode: parseBillingMode(row.billing_mode),
    ppn_included: typeof row.ppn_included === "boolean" ? row.ppn_included : null,
    price_effective_on:
      typeof row.price_effective_on === "string" && /^\d{4}-\d{2}-\d{2}/.test(row.price_effective_on)
        ? row.price_effective_on.slice(0, 10)
        : null,
    period_value_idr: parseContractIdr(row.period_value_idr),
    adjustment_idr: parseContractIdr(row.adjustment_idr),
    saved_at: typeof row.saved_at === "string" ? row.saved_at : "",
  };
}

export function salesContractErrorMessage(error: unknown, fallback: string): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message: unknown }).message)
        : fallback;

  if (message.includes("sales changes wait for a signed contract")) {
    return "Perubahan Sales menunggu kontrak yang ditandatangani.";
  }
  if (message.includes("no pending sales contract")) return "Belum ada paket menunggu.";
  if (message.includes("contract file not found") || message.includes("contract pdf required")) {
    return "PDF kontrak tidak ditemukan.";
  }
  if (message.includes("contract file already used")) return "PDF ini sudah dipakai.";
  if (message.includes("contract file is too large")) return "Kontrak PDF paling besar 10 MB.";
  if (message.includes("contract must be a pdf")) return "Kontrak harus berupa PDF.";
  if (message.includes("kuota karyawan AI minimal")) {
    const count = message.match(/(\d+)/)?.[1];
    return count
      ? `Kuota karyawan AI tidak boleh kurang dari ${count} karyawan AI yang masih aktif.`
      : "Kuota karyawan AI tidak boleh kurang dari karyawan AI yang masih aktif.";
  }
  if (message.includes("not allowed")) return "Akses ditolak.";
  if (message.includes("end date cannot exceed 366 days")) {
    return "Tanggal tidak boleh lebih dari 1 tahun dari hari ini.";
  }
  if (message.includes("outlet quota must be between")) {
    return "Kuota outlet harus antara 1 dan 100.";
  }
  if (message.includes("pilih tepat") && message.includes("outlet")) {
    return "Pilih outlet yang tetap buka sesuai kuota.";
  }
  if (message.includes("outlet status waits for a signed contract")) {
    return "Status outlet menunggu kontrak yang ditandatangani.";
  }
  if (message.includes("outlet quota reached")) {
    return "Jumlah outlet sudah mencapai kuota.";
  }
  if (message.includes("contract price is stale")) {
    return "Harga di paket menunggu sudah tidak sesuai. Simpan dan unduh kontrak lagi.";
  }
  if (message.includes("package price required")) return "Isi harga paket per bulan.";
  if (message.includes("billing mode required")) return "Pilih cara tagih.";
  if (message.includes("ppn treatment required")) return "Pilih perlakuan PPN.";
  if (message.includes("price effective date cannot be in the past")) {
    return "Tanggal berlaku tidak boleh sebelum hari ini.";
  }
  if (message.includes("contract term must be at least 1 month")) {
    return "Jangka minimal 1 bulan. Gunakan Renew.";
  }
  if (message.includes("price effective date is outside the contract")) {
    return "Tanggal berlaku melewati tanggal berakhir.";
  }
  if (message.includes("trial contract has no package price")) {
    return "Kontrak trial tidak memiliki harga paket.";
  }
  if (message.includes("price changes wait for a signed contract")) {
    return "Perubahan harga menunggu kontrak yang ditandatangani.";
  }
  return message || fallback;
}
