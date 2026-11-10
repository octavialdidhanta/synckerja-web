import { describe, expect, it } from "vitest";
import {
  agreedContractRows,
  contractAnnexRows,
  emptySalesContractModules,
  contractTermMonthsBetween,
  formatPackagePriceInput,
  parsePackagePriceInput,
  salesContractFormMatchesPending,
  type SalesContractPending,
} from "@/admin/lib/salesContractPackage";

function pending(overrides: Partial<SalesContractPending> = {}): SalesContractPending {
  const modules = emptySalesContractModules();
  modules.pos = true;
  modules.humanResources = true;
  modules.omnichannel = true;
  return {
    organization_id: "org",
    reason: "Paket uji",
    is_trial: false,
    trial_end_date: null,
    subscription_end_date: "2026-12-10T08:34:20.000Z",
    modules,
    hr_seat_count: 4,
    omnichannel_paid_seat_count: 2,
    keep_employee_ids: [],
    outlet_quota: 1,
    keep_outlet_ids: [],
    monthly_price_idr: 2_000_000,
    billing_mode: "monthly",
    ppn_included: false,
    price_effective_on: "2026-11-10",
    period_value_idr: 2_000_000,
    adjustment_idr: 2_000_000,
    saved_at: "2026-11-10T08:00:00.000Z",
    ...overrides,
  };
}

describe("sales contract package", () => {
  it("matches a saved package down to the minute and ignores inactive modules", () => {
    const saved = pending();
    const formModules = emptySalesContractModules();
    formModules.pos = true;
    formModules.humanResources = true;
    formModules.omnichannel = true;

    expect(
      salesContractFormMatchesPending(
        {
          isTrial: false,
          trialEndUtc: null,
          subscriptionEndUtc: "2026-12-10T08:34:59.000Z",
          modules: formModules,
          hrSeats: 4,
          omniSeats: 2,
          keepEmployeeIds: [],
          outletQuota: 1,
          keepOutletIds: [],
          monthlyPriceIdr: 2_000_000,
          billingMode: "monthly",
          ppnIncluded: false,
          priceEffectiveOn: "2026-11-10",
        },
        saved,
      ),
    ).toBe(true);

    expect(
      agreedContractRows({
        modules: saved.modules,
        hrSeats: saved.hr_seat_count,
        omniSeats: saved.omnichannel_paid_seat_count,
        outletQuota: saved.outlet_quota,
      }).map((row) => row.label),
    ).toEqual([
      "Human Resources",
      "Operations / Omnichannel",
      "POS",
      "Kuota user omnichannel",
      "Kuota seat HR",
      "Kuota outlet",
    ]);
  });

  it("omits a zero roster quota and still lists a zero HR quota when Human Resources is active", () => {
    const rows = agreedContractRows({
      modules: { humanResources: true, omnichannel: true, pos: true, finance: false },
      hrSeats: 0,
      omniSeats: 0,
    });

    expect(rows.map((row) => `${row.label}:${row.value}`)).toEqual([
      "Human Resources:Aktif",
      "Operations / Omnichannel:Aktif",
      "POS:Aktif",
      "Kuota seat HR:0",
    ]);
  });

  it("lists WhatsApp Business and a roster quota without listing inactive modules", () => {
    const rows = agreedContractRows({
      modules: { whatsappBusiness: true, leadMagnet: false, finance: false },
      hrSeats: 8,
      omniSeats: 3,
    });

    expect(rows).toEqual([
      { label: "WhatsApp Business API", value: "Aktif" },
      { label: "Kuota user omnichannel", value: "3" },
    ]);
  });

  it("lists the outlet quota and the branches that stay open, and omits a closed branch", () => {
    const rows = agreedContractRows({
      modules: { pos: true, humanResources: false },
      hrSeats: 0,
      omniSeats: 0,
      outletQuota: 2,
      keptOutletNames: ["PIK", "PIK 2"],
    });

    expect(rows.map((row) => `${row.label}:${row.value}`)).toEqual([
      "POS:Aktif",
      "Kuota outlet:2",
      "Outlet yang tetap buka:PIK",
      "Outlet yang tetap buka:PIK 2",
    ]);

    const withoutPos = agreedContractRows({
      modules: { pos: false, omnichannel: true },
      hrSeats: 0,
      omniSeats: 0,
      outletQuota: 2,
      keptOutletNames: ["PIK"],
    });
    expect(withoutPos.some((row) => row.label === "Kuota outlet")).toBe(false);
    expect(withoutPos.some((row) => row.value === "PIK")).toBe(false);
  });

  it("writes Sama when a module stays active and shows the new status when it changes", () => {
    const rows = contractAnnexRows({
      current: {
        modules: { okr: true, finance: false, pos: true, humanResources: true, omnichannel: true },
        hrSeats: 3,
        omniSeats: 2,
        outletQuota: 2,
      },
      pending: {
        modules: { okr: true, finance: true, pos: true, humanResources: true, omnichannel: true },
        hr_seat_count: 3,
        omnichannel_paid_seat_count: 2,
        outlet_quota: 3,
      },
      outlets: [
        { id: "a", name: "PIK", is_active: true },
        { id: "b", name: "PIK 2", is_active: true },
      ],
      keptOutletNames: ["PIK"],
    });

    expect(rows).toEqual(
      expect.arrayContaining([
        { item: "OKR", current: "Aktif", agreement: "Sama" },
        { item: "Finance", current: "Tidak aktif", agreement: "Aktif" },
        { item: "Kuota user omnichannel", current: "2", agreement: "Sama" },
        { item: "Kuota seat HR", current: "3", agreement: "Sama" },
        { item: "Kuota outlet", current: "2", agreement: "3" },
        { item: "Cabang yang beroperasi", current: "PIK", agreement: "Sama" },
        { item: "Cabang yang beroperasi", current: "PIK 2", agreement: "Ditutup" },
      ]),
    );
    expect(rows.some((row) => row.item === "Tools")).toBe(false);
    expect(rows.filter((row) => row.item === "Cabang yang beroperasi")).toHaveLength(2);
  });

  it("lists each operating branch once when the agreement keeps every branch", () => {
    const rows = contractAnnexRows({
      current: {
        modules: { pos: true },
        hrSeats: 0,
        omniSeats: 0,
        outletQuota: null,
      },
      pending: {
        modules: { pos: true },
        hr_seat_count: 0,
        omnichannel_paid_seat_count: 0,
        outlet_quota: 3,
      },
      outlets: [
        { id: "a", name: "Sate Sultan PIK", is_active: true },
        { id: "b", name: "Sate Sultan PIK 2", is_active: true },
      ],
      keptOutletNames: [],
    });

    expect(rows.filter((row) => row.item === "Cabang yang beroperasi")).toEqual([
      { item: "Cabang yang beroperasi", current: "Sate Sultan PIK", agreement: "Sama" },
      { item: "Cabang yang beroperasi", current: "Sate Sultan PIK 2", agreement: "Sama" },
    ]);
  });

  it("turns the download comparison off when the form moves away from the saved package", () => {
    const formModules = emptySalesContractModules();
    formModules.pos = true;
    expect(
      salesContractFormMatchesPending(
        {
          isTrial: false,
          trialEndUtc: null,
          subscriptionEndUtc: "2026-12-10T08:34:00.000Z",
          modules: formModules,
          hrSeats: 4,
          omniSeats: 2,
          keepEmployeeIds: [],
          outletQuota: 1,
          keepOutletIds: [],
          monthlyPriceIdr: 2_000_000,
          billingMode: "monthly",
          ppnIncluded: false,
          priceEffectiveOn: "2026-11-10",
        },
        pending(),
      ),
    ).toBe(false);

    const priced = pending();
    expect(
      salesContractFormMatchesPending(
        {
          isTrial: false,
          trialEndUtc: null,
          subscriptionEndUtc: "2026-12-10T08:34:59.000Z",
          modules: priced.modules,
          hrSeats: priced.hr_seat_count,
          omniSeats: priced.omnichannel_paid_seat_count,
          keepEmployeeIds: [],
          outletQuota: priced.outlet_quota ?? 0,
          keepOutletIds: [],
          monthlyPriceIdr: 1_500_000,
          billingMode: "monthly",
          ppnIncluded: false,
          priceEffectiveOn: "2026-11-10",
        },
        priced,
      ),
    ).toBe(false);
  });

  it("counts whole contract months from the renew end date", () => {
    expect(contractTermMonthsBetween("2026-11-10", "2026-12-10")).toBe(1);
    expect(contractTermMonthsBetween("2026-11-10", "2027-01-10")).toBe(2);
    expect(contractTermMonthsBetween("2026-11-10", "2027-05-10")).toBe(6);
    expect(contractTermMonthsBetween("2026-11-10", "2027-11-10")).toBe(12);
    expect(contractTermMonthsBetween("2026-11-10", "2026-11-10")).toBe(0);
  });

  it("groups package price input with thousand dots", () => {
    expect(formatPackagePriceInput("2000000")).toBe("2.000.000");
    expect(formatPackagePriceInput("2.000.000")).toBe("2.000.000");
    expect(parsePackagePriceInput("2.000.000")).toBe(2_000_000);
    expect(parsePackagePriceInput("2.000.000,5")).toBeNull();
  });
});