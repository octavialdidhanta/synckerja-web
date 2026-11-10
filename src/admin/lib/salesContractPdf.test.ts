import { readFileSync } from "node:fs";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { buildSalesContractPdf } from "@/admin/lib/salesContractPdf";
import {
  emptySalesContractModules,
  type SalesContractPending,
} from "@/admin/lib/salesContractPackage";

function pending(): SalesContractPending {
  const modules = emptySalesContractModules();
  modules.okr = true;
  modules.humanResources = true;
  modules.finance = true;
  modules.digitalMarketing = true;
  modules.leadMagnet = true;
  modules.omnichannel = true;
  modules.whatsappBusiness = true;
  modules.pos = true;
  modules.operations = true;
  modules.tools = true;
  modules.requestForm = true;
  return {
    organization_id: "5fa70166-0a35-4f0d-94b3-54f19b3f8c30",
    reason: "Paket uji",
    is_trial: false,
    trial_end_date: null,
    subscription_end_date: "2026-12-10T08:34:00.000Z",
    modules,
    hr_seat_count: 3,
    omnichannel_paid_seat_count: 2,
    keep_employee_ids: [],
    outlet_quota: 2,
    keep_outlet_ids: [],
    monthly_price_idr: 2_000_000,
    billing_mode: "monthly",
    ppn_included: false,
    price_effective_on: "2026-11-10",
    period_value_idr: 2_000_000,
    adjustment_idr: 2_000_000,
    saved_at: "2026-11-10T09:00:00.000Z",
  };
}

function pdfStrings(bytes: Uint8Array): string {
  const raw = Buffer.from(bytes).toString("latin1");
  const parts: string[] = [];
  const streamPattern = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  for (const match of raw.matchAll(streamPattern)) {
    const body = Buffer.from(match[1], "latin1");
    try {
      parts.push(inflateSync(body).toString("latin1"));
    } catch {
      parts.push(match[1]);
    }
  }
  const content = parts.join("\n");
  const pieces: string[] = [];
  for (const hex of content.matchAll(/<([0-9A-Fa-f\s]+)>/g)) {
    const digits = hex[1].replace(/\s/g, "");
    if (digits.length < 4 || digits.length % 2 !== 0) continue;
    let text = "";
    for (let index = 0; index < digits.length; index += 2) {
      text += String.fromCharCode(Number.parseInt(digits.slice(index, index + 2), 16));
    }
    pieces.push(text);
  }
  for (const literal of content.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
    pieces.push(literal[0].slice(1, -1).replace(/\\([()\\])/g, "$1"));
  }
  return pieces.join("\n");
}

describe("sales contract pdf", () => {
  it("builds a multi-page agreement with the active package", async () => {
    const logo = readFileSync(path.resolve("src/home/assets/synckerja-logo.png"));
    const bytes = await buildSalesContractPdf({
      organizationName: "Sate Sultan PIK",
      pending: pending(),
      logoBytes: logo,
      current: {
        modules: {},
        hrSeats: 0,
        omniSeats: 0,
        outletQuota: null,
        monthlyPriceIdr: 1_000_000,
      },
    });

    const doc = await PDFDocument.load(bytes);
    const raw = pdfStrings(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
    expect(doc.getTitle()).toContain("Sate Sultan PIK");
    expect(bytes.byteLength).toBeGreaterThan(20_000);
    expect(raw).toContain("NILAI PERJANJIAN");
    expect(raw).toContain("Rp 2.000.000");
    expect(raw).toContain("Total tagihan");
    expect(raw).toContain("1 bulan");
    expect(raw).toContain("tidak menghitung pecahan hari");
    expect(raw).not.toContain("Ditagih tiap bulan");
    expect(raw).not.toContain("Berlaku mulai");
    expect(raw).not.toContain("Penyesuaian ditagihkan");
    expect(raw).not.toContain("Nilai sisa periode");
    expect(raw).toContain("tidak memakai daftar harga per modul");
    expect(raw).not.toContain("kesepakatan terpisah");
    expect(raw).not.toContain("Harga OKR");
  });
});
