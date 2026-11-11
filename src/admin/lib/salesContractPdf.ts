import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import logoUrl from "@/home/assets/synckerja-logo.png";
import {
  agreedContractRows,
  contractAnnexRows,
  contractTermMonthsBetween,
  formatContractIdr,
  type ContractAnnexOutlet,
  type SalesContractBaseline,
  type SalesContractPending,
} from "@/admin/lib/salesContractPackage";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 50;
const BOTTOM = 52;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const INK = rgb(0.11, 0.13, 0.16);
const PAPER = rgb(1, 1, 1);
/** hsl(359 77% 52%) from --brand-red */
const BRAND_RED = rgb(0.89, 0.15, 0.163);
const MUTED = rgb(0.33, 0.36, 0.42);
const LINE = rgb(0.78, 0.8, 0.84);
const RULE = rgb(0.12, 0.32, 0.58);
const HEAD_BG = rgb(0.94, 0.95, 0.97);

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const NUMBER_WORDS = [
  "nol",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
  "dua belas",
  "tiga belas",
  "empat belas",
  "lima belas",
  "enam belas",
  "tujuh belas",
  "delapan belas",
  "sembilan belas",
  "dua puluh",
];

type Clause = { n: string; text: string };
type Article = { title: string; clauses: Clause[] };

function pngBytes(input: ArrayBuffer | Uint8Array): Uint8Array {
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return Uint8Array.from(input);
}

function pdfText(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) out += ch;
    else out += " ";
  }
  return out.replace(/[ \t]+/g, " ").trim();
}

function wibParts(iso: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jakarta",
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

function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const { year, month, day } = wibParts(iso);
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

function formatLongDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  const { hour, minute } = wibParts(iso);
  return `${formatLongDate(iso)}, pukul ${hour}.${minute} WIB`;
}

function spelled(count: number): string {
  if (Number.isInteger(count) && count >= 0 && count < NUMBER_WORDS.length) {
    return `${count} (${NUMBER_WORDS[count]})`;
  }
  return String(count);
}

function contractNumber(pending: SalesContractPending): string {
  const stamp = pending.saved_at && !Number.isNaN(new Date(pending.saved_at).getTime())
    ? pending.saved_at
    : new Date().toISOString();
  const { year, month, day } = wibParts(stamp);
  const suffix = pending.organization_id.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `SKJ/${year}${month}${day}/${suffix || "DRAFT"}`;
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = pdfText(text).split(" ").filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = "";

  const flush = (value: string) => {
    if (value) lines.push(value);
  };

  const appendBroken = (word: string) => {
    let chunk = "";
    for (const ch of word) {
      const next = chunk + ch;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) chunk = next;
      else {
        flush(chunk);
        chunk = ch;
      }
    }
    current = chunk;
  };

  for (const word of words) {
    if (font.widthOfTextAtSize(word, size) > maxWidth) {
      flush(current);
      current = "";
      appendBroken(word);
      continue;
    }
    const trial = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) current = trial;
    else {
      flush(current);
      current = word;
    }
  }
  flush(current);
  return lines;
}

function buildArticles(input: {
  organizationName: string;
  pending: SalesContractPending;
  keptOutletNames: string[];
}): Article[] {
  const pending = input.pending;
  const customer = pdfText(input.organizationName) || "Pelanggan";
  const status = pending.is_trial ? "Trial" : "Berlangganan";
  const endIso = pending.is_trial ? pending.trial_end_date : pending.subscription_end_date;
  const rows = agreedContractRows({
    modules: pending.modules,
    hrSeats: pending.hr_seat_count,
    omniSeats: pending.omnichannel_paid_seat_count,
    aiEmployeeSeats: pending.ai_employee_seat_count,
    outletQuota: pending.outlet_quota,
    keptOutletNames: input.keptOutletNames,
  });
  const hrRow = rows.find((row) => row.label === "Kuota seat HR");
  const rosterRow = rows.find((row) => row.label === "Kuota user omnichannel");
  const outletRow = rows.find((row) => row.label === "Kuota outlet");
  const quotaClauses: Clause[] = [];
  const pushQuota = (text: string) => {
    quotaClauses.push({ n: `5.${quotaClauses.length + 1}.`, text });
  };

  if (hrRow) {
    pushQuota(
      `Kuota seat Human Resources yang disepakati adalah ${spelled(pending.hr_seat_count)} pengguna aktif. Pelanggan tidak menambah pengguna aktif Human Resources di luar kuota itu.`,
    );
  }
  const aiRow = rows.find((row) => row.label === "Kuota karyawan AI");
  if (aiRow) {
    pushQuota(
      `Kuota karyawan AI yang disepakati adalah ${spelled(pending.ai_employee_seat_count)} karyawan AI aktif. Pelanggan tidak menambah karyawan AI aktif di luar kuota itu.`,
    );
  }
  if (rosterRow) {
    pushQuota(
      `Kuota user omnichannel yang disepakati adalah ${spelled(pending.omnichannel_paid_seat_count)} pengguna. Pelanggan tidak menambah pengguna roster di luar kuota itu.`,
    );
  }
  if (outletRow && pending.outlet_quota != null) {
    const openNames = input.keptOutletNames.filter(Boolean);
    pushQuota(
      `Kuota outlet yang disepakati adalah ${spelled(pending.outlet_quota)} cabang. Hanya cabang sebanyak kuota itu yang boleh beroperasi. Cabang di luar kuota ditutup. Data transaksi dan stok cabang yang ditutup tetap tersimpan.`,
    );
    if (openNames.length > 0) {
      pushQuota(`Cabang yang tetap buka adalah ${openNames.join(", ")}.`);
    }
  }
  if (!hrRow && !rosterRow && !outletRow && !aiRow) {
    pushQuota(
      "Lampiran tidak mencantumkan kuota tambahan. Batas pengguna mengikuti pengaturan layanan yang berlaku bagi Modul Aktif.",
    );
  }
  pushQuota(
    "Kenaikan atau penurunan kuota hanya berlaku setelah dituangkan dalam perjanjian atau adendum yang ditandatangani Para Pihak. Apabila kuota baru lebih kecil daripada jumlah pengguna yang sedang aktif, Pelanggan menunjuk pengguna yang tetap memiliki akses sebelum perubahan berlaku. Pengguna yang tidak ditunjuk dapat dikeluarkan dari akses tersebut. Data karyawan tidak dihapus hanya karena pengeluaran akses itu.",
  );

  const termClauses: Clause[] = [
    {
      n: "4.1.",
      text: `Status langganan yang berlaku adalah ${status}.`,
    },
    {
      n: "4.2.",
      text: `Hak akses berlaku sampai ${formatLongDateTime(endIso)}. Setelah waktu tersebut, Penyedia dapat menghentikan akses, kecuali Para Pihak menandatangani perpanjangan.`,
    },
  ];
  if (pending.is_trial && pending.subscription_end_date) {
    termClauses.push({
      n: "4.3.",
      text: `Tanggal berakhir berlangganan yang ikut dicatat adalah ${formatLongDateTime(pending.subscription_end_date)}. Selama status yang berlaku masih Trial, batas akses mengikuti tanggal berakhir trial.`,
    });
  } else if (!pending.is_trial && pending.trial_end_date) {
    termClauses.push({
      n: "4.3.",
      text: `Tanggal berakhir trial yang ikut dicatat adalah ${formatLongDateTime(pending.trial_end_date)}. Karena status yang berlaku adalah Berlangganan, batas akses mengikuti tanggal berakhir berlangganan.`,
    });
  }
  const changeNumber = termClauses.length + 1;
  termClauses.push({
    n: `4.${changeNumber}.`,
    text: "Perubahan tanggal berakhir hanya berlaku setelah dituangkan dalam perjanjian atau adendum yang ditandatangani Para Pihak.",
  });

  return [
    {
      title: "PASAL 1 - PARA PIHAK",
      clauses: [
        {
          n: "1.1.",
          text: 'Pihak Pertama adalah PT Integrasi Visual Digital Indonesia, yang menyediakan layanan Synckerja Office melalui https://office.synckerja.com, selanjutnya disebut "Penyedia".',
        },
        {
          n: "1.2.",
          text: `Pihak Kedua adalah ${customer}, selanjutnya disebut "Pelanggan".`,
        },
        {
          n: "1.3.",
          text: 'Penyedia dan Pelanggan secara bersama-sama disebut "Para Pihak", dan masing-masing disebut "Pihak".',
        },
      ],
    },
    {
      title: "PASAL 2 - DEFINISI",
      clauses: [
        {
          n: "2.1.",
          text: "Layanan adalah perangkat lunak Synckerja Office yang disediakan secara daring.",
        },
        {
          n: "2.2.",
          text: "Modul Aktif adalah modul yang menurut Lampiran tetap aktif atau menjadi aktif. Apabila kolom Kesepakatan tertulis Sama dan kolom Ketentuan berlaku tertulis Aktif, modul itu tetap menjadi Modul Aktif. Modul yang tidak tercantum, serta modul yang menjadi Tidak aktif, bukan bagian dari kesepakatan ini.",
        },
        {
          n: "2.3.",
          text: "Kuota adalah batas yang tercantum pada Lampiran. Apabila kolom Kesepakatan tertulis Sama, batas pada kolom Ketentuan berlaku tetap berlaku.",
        },
        {
          n: "2.4.",
          text: "Lampiran adalah rincian layanan yang tidak terpisahkan dari Perjanjian ini.",
        },
      ],
    },
    {
      title: "PASAL 3 - RUANG LINGKUP",
      clauses: [
        {
          n: "3.1.",
          text: "Penyedia memberi Pelanggan hak akses yang non-eksklusif dan tidak dapat dipindahtangankan, selama jangka waktu Perjanjian, terbatas pada Modul Aktif.",
        },
        {
          n: "3.2.",
          text: "Penyedia tidak wajib menyediakan modul di luar Lampiran.",
        },
        {
          n: "3.3.",
          text: "Penambahan, pengurangan, atau penggantian modul hanya berlaku jika dituangkan dalam perjanjian atau adendum yang ditandatangani Para Pihak.",
        },
      ],
    },
    {
      title: "PASAL 4 - JANGKA WAKTU",
      clauses: termClauses,
    },
    {
      title: "PASAL 5 - KUOTA",
      clauses: quotaClauses,
    },
    {
      title: "PASAL 6 - KEWAJIBAN PENYEDIA",
      clauses: [
        {
          n: "6.1.",
          text: "Penyedia menyediakan akses ke Modul Aktif selama jangka waktu Perjanjian, sepanjang Pelanggan memenuhi Perjanjian ini.",
        },
        {
          n: "6.2.",
          text: "Penyedia menjaga kerahasiaan data Pelanggan dan menggunakannya hanya untuk menyediakan, mengamankan, dan mendukung Layanan.",
        },
        {
          n: "6.3.",
          text: "Penyedia menerima permintaan dukungan melalui support@synckerja.com.",
        },
      ],
    },
    {
      title: "PASAL 7 - KEWAJIBAN PELANGGAN",
      clauses: [
        {
          n: "7.1.",
          text: "Pelanggan menggunakan Layanan sesuai hukum yang berlaku dan untuk kepentingan organisasinya.",
        },
        {
          n: "7.2.",
          text: "Pelanggan menjaga kerahasiaan akun, kata sandi, dan hak akses penggunanya, serta bertanggung jawab atas aktivitas yang dilakukan melalui akun tersebut.",
        },
        {
          n: "7.3.",
          text: "Pelanggan tidak menyalin, menjual, menyewakan, atau membuka akses Layanan kepada pihak di luar kuota yang disepakati.",
        },
        {
          n: "7.4.",
          text: "Pelanggan tidak menggunakan Layanan untuk muatan atau kegiatan yang melanggar hukum.",
        },
      ],
    },
    {
      title: "PASAL 8 - BIAYA",
      clauses: pending.is_trial
        ? [
            {
              n: "8.1.",
              text: "Selama status yang berlaku adalah Trial, tidak ada biaya berlangganan.",
            },
            {
              n: "8.2.",
              text: "Biaya berlangganan hanya berlaku setelah dituangkan dalam perjanjian berbayar yang ditandatangani Para Pihak.",
            },
          ]
        : [
            {
              n: "8.1.",
              text: "Biaya langganan adalah harga paket per bulan pada bagian Nilai Perjanjian. Harga itu mencakup seluruh modul dan kuota dalam Lampiran. Perjanjian ini tidak memakai daftar harga per modul.",
            },
            {
              n: "8.2.",
              text: "Total tagihan adalah harga paket per bulan dikalikan jangka pada bagian Nilai Perjanjian. Perjanjian ini tidak menghitung pecahan hari.",
            },
            {
              n: "8.3.",
              text: "Keterangan PPN pada bagian Nilai Perjanjian menyatakan apakah harga sudah termasuk PPN atau belum. Perjanjian ini tidak menghitung jumlah pajak.",
            },
            {
              n: "8.4.",
              text: "Penambahan atau pengurangan cakupan di tengah periode hanya berlaku melalui adendum yang ditandatangani Para Pihak. Pengurangan cakupan tidak mengembalikan biaya periode yang sedang berjalan.",
            },
          ],
    },
    {
      title: "PASAL 9 - DATA DAN KERAHASIAAN",
      clauses: [
        {
          n: "9.1.",
          text: "Data yang dimasukkan Pelanggan ke dalam Layanan tetap milik Pelanggan.",
        },
        {
          n: "9.2.",
          text: "Masing-masing Pihak menjaga kerahasiaan informasi non-publik yang diterimanya karena Perjanjian ini, dan tidak membukanya kepada pihak ketiga kecuali diwajibkan hukum atau diperlukan untuk melaksanakan Perjanjian ini.",
        },
        {
          n: "9.3.",
          text: "Kewajiban kerahasiaan tetap berlaku selama 3 (tiga) tahun setelah Perjanjian berakhir.",
        },
      ],
    },
    {
      title: "PASAL 10 - HAK KEKAYAAN INTELEKTUAL",
      clauses: [
        {
          n: "10.1.",
          text: "Perangkat lunak, merek, dan materi Synckerja Office tetap milik PT Integrasi Visual Digital Indonesia atau pemberi lisensinya.",
        },
        {
          n: "10.2.",
          text: "Perjanjian ini hanya memberi hak akses yang terbatas. Kepemilikan atas Layanan tidak beralih kepada Pelanggan.",
        },
      ],
    },
    {
      title: "PASAL 11 - BATASAN TANGGUNG JAWAB",
      clauses: [
        {
          n: "11.1.",
          text: "Layanan disediakan sesuai ketersediaannya. Penyedia tidak bertanggung jawab atas gangguan yang disebabkan pihak ketiga di luar kendalinya, termasuk jaringan, penyedia pesan, atau layanan pembayaran.",
        },
        {
          n: "11.2.",
          text: "Sepanjang diizinkan hukum, tidak ada Pihak yang bertanggung jawab atas kerugian tidak langsung, kehilangan keuntungan, atau kehilangan data yang timbul dari penggunaan Layanan.",
        },
        {
          n: "11.3.",
          text: "Tidak ada ketentuan dalam Perjanjian ini yang membatasi tanggung jawab atas kesengajaan, atau atas hal yang tidak boleh dibatasi menurut hukum Republik Indonesia.",
        },
      ],
    },
    {
      title: "PASAL 12 - PENGAKHIRAN",
      clauses: [
        {
          n: "12.1.",
          text: "Perjanjian berakhir pada tanggal berakhir yang berlaku, atau lebih awal jika Para Pihak sepakat secara tertulis.",
        },
        {
          n: "12.2.",
          text: "Salah satu Pihak dapat mengakhiri Perjanjian jika Pihak lainnya melanggar ketentuan yang material dan tidak memperbaiki pelanggaran itu dalam 14 (empat belas) hari setelah menerima pemberitahuan tertulis.",
        },
        {
          n: "12.3.",
          text: "Setelah Perjanjian berakhir, akses Pelanggan dapat ditutup. Sebelum akses ditutup, Pelanggan dapat meminta salinan datanya yang tersedia melalui fitur ekspor Layanan.",
        },
      ],
    },
    {
      title: "PASAL 13 - HUKUM DAN SENGKETA",
      clauses: [
        {
          n: "13.1.",
          text: "Perjanjian ini diatur oleh hukum Republik Indonesia.",
        },
        {
          n: "13.2.",
          text: "Sengketa diselesaikan terlebih dahulu melalui musyawarah. Jika tidak tercapai dalam 30 (tiga puluh) hari sejak salah satu Pihak memberitahukan sengketa secara tertulis, sengketa diselesaikan melalui pengadilan negeri yang berwenang di Indonesia.",
        },
      ],
    },
    {
      title: "PASAL 14 - KETENTUAN LAIN",
      clauses: [
        {
          n: "14.1.",
          text: "Lampiran merupakan satu kesatuan dan bagian yang tidak terpisahkan dari Perjanjian ini.",
        },
        {
          n: "14.2.",
          text: "Perubahan Perjanjian hanya sah jika tertulis dan ditandatangani Para Pihak.",
        },
        {
          n: "14.3.",
          text: "Jika satu ketentuan tidak dapat diberlakukan, ketentuan lainnya tetap berlaku.",
        },
        {
          n: "14.4.",
          text: "Ketentuan layanan di https://office.synckerja.com/policy/terms berlaku sepanjang tidak bertentangan dengan Perjanjian ini. Untuk ruang lingkup, jangka waktu, dan kuota, Perjanjian ini yang berlaku.",
        },
        {
          n: "14.5.",
          text: "Perjanjian ini berlaku sejak ditandatangani Para Pihak. Salinan basah dan salinan digital yang ditandatangani mempunyai kekuatan yang sama. Pelanggan dapat membubuhi meterai pada tempat yang disediakan sesuai ketentuan bea meterai yang berlaku.",
        },
      ],
    },
  ];
}

type Writer = {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  pages: PDFPage[];
  font: PDFFont;
  bold: PDFFont;
  contractNo: string;
};

function paintTopBar(page: PDFPage) {
  page.drawRectangle({
    x: 0,
    y: PAGE_HEIGHT - 6,
    width: PAGE_WIDTH,
    height: 6,
    color: RULE,
  });
}

function addPage(writer: Writer, runningHeader: boolean) {
  const page = writer.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  writer.page = page;
  writer.pages.push(page);
  paintTopBar(page);
  if (!runningHeader) {
    writer.y = PAGE_HEIGHT - 24;
    return;
  }
  page.drawText("Perjanjian Berlangganan Synckerja Office", {
    x: MARGIN_X,
    y: PAGE_HEIGHT - 26,
    size: 8,
    font: writer.bold,
    color: INK,
  });
  const numberWidth = writer.font.widthOfTextAtSize(writer.contractNo, 8);
  page.drawText(writer.contractNo, {
    x: PAGE_WIDTH - MARGIN_X - numberWidth,
    y: PAGE_HEIGHT - 26,
    size: 8,
    font: writer.font,
    color: MUTED,
  });
  page.drawLine({
    start: { x: MARGIN_X, y: PAGE_HEIGHT - 34 },
    end: { x: PAGE_WIDTH - MARGIN_X, y: PAGE_HEIGHT - 34 },
    thickness: 0.6,
    color: LINE,
  });
  writer.y = PAGE_HEIGHT - 50;
}

function ensure(writer: Writer, height: number) {
  if (writer.y - height >= BOTTOM) return;
  if (writer.y > PAGE_HEIGHT - 90) return;
  addPage(writer, true);
}

function drawWrapped(
  writer: Writer,
  text: string,
  options: {
    font: PDFFont;
    size: number;
    color?: ReturnType<typeof rgb>;
    x?: number;
    width?: number;
    gap?: number;
    indent?: number;
  },
) {
  const size = options.size;
  const leading = size + 4;
  const x = options.x ?? MARGIN_X;
  const width = options.width ?? CONTENT_WIDTH;
  const indent = options.indent ?? 0;
  const lines = wrap(text, options.font, size, width - indent);
  if (lines.length === 0) return;
  lines.forEach((line, index) => {
    ensure(writer, leading);
    writer.page.drawText(line, {
      x: x + (index === 0 ? 0 : indent),
      y: writer.y - size,
      size,
      font: options.font,
      color: options.color ?? INK,
    });
    writer.y -= leading;
  });
  writer.y -= options.gap ?? 0;
}

function drawCentered(writer: Writer, text: string, font: PDFFont, size: number, gap = 4) {
  const safe = pdfText(text);
  const width = font.widthOfTextAtSize(safe, size);
  ensure(writer, size + gap);
  writer.page.drawText(safe, {
    x: (PAGE_WIDTH - width) / 2,
    y: writer.y - size,
    size,
    font,
    color: INK,
  });
  writer.y -= size + gap;
}

function drawClause(writer: Writer, clause: Clause) {
  const size = 10;
  const leading = 14;
  const indent = 18;
  const prefix = `${clause.n} `;
  const prefixWidth = writer.bold.widthOfTextAtSize(prefix, size);
  const textWidth = CONTENT_WIDTH - indent - prefixWidth;
  const lines = wrap(clause.text, writer.font, size, textWidth);
  lines.forEach((line, index) => {
    ensure(writer, leading);
    if (index === 0) {
      writer.page.drawText(prefix, {
        x: MARGIN_X + indent,
        y: writer.y - size,
        size,
        font: writer.bold,
        color: INK,
      });
    }
    writer.page.drawText(line, {
      x: MARGIN_X + indent + prefixWidth,
      y: writer.y - size,
      size,
      font: writer.font,
      color: INK,
    });
    writer.y -= leading;
  });
  writer.y -= 3;
}

function drawParty(writer: Writer, title: string, name: string) {
  const indent = 18;
  const fieldIndent = indent + 16;
  const labelWidth = 108;
  drawWrapped(writer, title, {
    font: writer.bold,
    size: 10,
    x: MARGIN_X + indent,
    width: CONTENT_WIDTH - indent,
    gap: 4,
  });
  const fields: Array<[string, string]> = [
    ["Nama", name],
    ["Kedudukan", title === "Pihak Pertama" ? "Penyedia" : "Pelanggan"],
    ["Alamat kantor", ""],
    ["Kota", ""],
    ["Telepon", ""],
    ["Email", ""],
  ];
  for (const [label, value] of fields) {
    const size = 10;
    const leading = 16;
    ensure(writer, leading);
    writer.page.drawText(label, {
      x: MARGIN_X + fieldIndent,
      y: writer.y - size,
      size,
      font: writer.font,
      color: MUTED,
    });
    const valueX = MARGIN_X + fieldIndent + labelWidth;
    const safeValue = pdfText(value);
    if (safeValue) {
      const lines = wrap(safeValue, value ? writer.bold : writer.font, size, PAGE_WIDTH - MARGIN_X - valueX);
      lines.forEach((line, index) => {
        if (index > 0) ensure(writer, leading);
        writer.page.drawText(line, {
          x: valueX,
          y: writer.y - size,
          size,
          font: writer.bold,
          color: INK,
        });
        if (index < lines.length - 1) writer.y -= leading;
      });
    } else {
      writer.page.drawLine({
        start: { x: valueX, y: writer.y - size - 1 },
        end: { x: PAGE_WIDTH - MARGIN_X, y: writer.y - size - 1 },
        thickness: 0.6,
        color: LINE,
      });
    }
    writer.y -= leading;
  }
  writer.y -= 6;
}

function drawParties(writer: Writer, organizationName: string) {
  drawParty(writer, "Pihak Pertama", "PT Integrasi Visual Digital Indonesia");
  drawParty(writer, "Pihak Kedua", organizationName);
}

function drawTable(
  writer: Writer,
  rows: { item: string; current: string; agreement: string }[],
) {
  const itemWidth = 210;
  const currentWidth = 145;
  const currentX = MARGIN_X + itemWidth;
  const agreementX = currentX + currentWidth;
  const agreementWidth = CONTENT_WIDTH - itemWidth - currentWidth;
  const columns = [
    { title: "Item", x: MARGIN_X, width: itemWidth },
    { title: "Ketentuan berlaku", x: currentX, width: currentWidth },
    { title: "Kesepakatan", x: agreementX, width: agreementWidth },
  ];

  const drawHeader = () => {
    const rowHeight = 24;
    ensure(writer, rowHeight);
    writer.page.drawRectangle({
      x: MARGIN_X,
      y: writer.y - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      color: HEAD_BG,
      borderColor: LINE,
      borderWidth: 0.6,
    });
    for (const column of columns) {
      writer.page.drawText(column.title, {
        x: column.x + 6,
        y: writer.y - 16,
        size: 8,
        font: writer.bold,
        color: INK,
      });
    }
    writer.page.drawLine({
      start: { x: currentX, y: writer.y },
      end: { x: currentX, y: writer.y - rowHeight },
      thickness: 0.6,
      color: LINE,
    });
    writer.page.drawLine({
      start: { x: agreementX, y: writer.y },
      end: { x: agreementX, y: writer.y - rowHeight },
      thickness: 0.6,
      color: LINE,
    });
    writer.y -= rowHeight;
  };

  const paintCell = (lines: string[], x: number, color = INK) => {
    lines.forEach((line, index) => {
      writer.page.drawText(line, {
        x: x + 6,
        y: writer.y - 15 - index * 12,
        size: 9,
        font: writer.font,
        color,
      });
    });
  };

  drawHeader();
  const body =
    rows.length > 0 ? rows : [{ item: "Tidak ada modul aktif", current: "-", agreement: "-" }];
  for (const row of body) {
    const itemLines = wrap(row.item, writer.font, 9, itemWidth - 12);
    const currentLines = wrap(row.current, writer.font, 9, currentWidth - 12);
    const agreementLines = wrap(row.agreement, writer.font, 9, agreementWidth - 12);
    const changed = row.agreement !== "Sama" && row.agreement !== "-";
    const lineCount = Math.max(itemLines.length, currentLines.length, agreementLines.length, 1);
    const rowHeight = Math.max(22, lineCount * 12 + 10);
    if (writer.y - rowHeight < BOTTOM) {
      addPage(writer, true);
      drawHeader();
    }
    writer.page.drawRectangle({
      x: MARGIN_X,
      y: writer.y - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      borderColor: LINE,
      borderWidth: 0.6,
    });
    if (changed) {
      writer.page.drawRectangle({
        x: agreementX + 0.6,
        y: writer.y - rowHeight + 0.6,
        width: agreementWidth - 0.6,
        height: rowHeight - 1.2,
        color: BRAND_RED,
      });
    }
    writer.page.drawLine({
      start: { x: currentX, y: writer.y },
      end: { x: currentX, y: writer.y - rowHeight },
      thickness: 0.6,
      color: LINE,
    });
    writer.page.drawLine({
      start: { x: agreementX, y: writer.y },
      end: { x: agreementX, y: writer.y - rowHeight },
      thickness: 0.6,
      color: LINE,
    });
    paintCell(itemLines, MARGIN_X);
    paintCell(currentLines, currentX);
    paintCell(agreementLines, agreementX, changed ? PAPER : INK);
    writer.y -= rowHeight;
  }
}

function drawSignatures(writer: Writer, organizationName: string) {
  if (writer.y < BOTTOM + 250) addPage(writer, true);

  drawWrapped(writer, "PENUTUP DAN TANDA TANGAN", {
    font: writer.bold,
    size: 11,
    gap: 8,
  });
  drawWrapped(
    writer,
    "Demikian Perjanjian ini dibuat. Dengan menandatangani di bawah ini, masing-masing Pihak menyatakan telah membaca, memahami, dan menyetujui seluruh pasal serta lampiran.",
    { font: writer.font, size: 10, gap: 18 },
  );

  const placeLine = "Dibuat di ........................, pada tanggal ........................";
  const placeWidth = writer.font.widthOfTextAtSize(placeLine, 10);
  ensure(writer, 16);
  writer.page.drawText(placeLine, {
    x: PAGE_WIDTH - MARGIN_X - placeWidth,
    y: writer.y - 10,
    size: 10,
    font: writer.font,
    color: INK,
  });
  writer.y -= 64;

  const colGap = 48;
  const colWidth = (CONTENT_WIDTH - colGap) / 2;
  const columns = [
    {
      x: MARGIN_X,
      title: "Pihak Pertama",
      name: "PT Integrasi Visual Digital Indonesia",
      role: "Penyedia",
      meterai: false,
    },
    {
      x: MARGIN_X + colWidth + colGap,
      title: "Pihak Kedua",
      name: pdfText(organizationName) || "Pelanggan",
      role: "Pelanggan",
      meterai: true,
    },
  ];
  const titleY = writer.y;
  let lowestRole = titleY;
  for (const column of columns) {
    writer.page.drawText(column.title, {
      x: column.x,
      y: titleY,
      size: 10,
      font: writer.bold,
      color: INK,
    });
    const nameLines = wrap(column.name, writer.bold, 10, colWidth);
    const nameStart = titleY - 16;
    nameLines.forEach((line, index) => {
      writer.page.drawText(line, {
        x: column.x,
        y: nameStart - index * 13,
        size: 10,
        font: writer.bold,
        color: INK,
      });
    });
    const roleY = nameStart - nameLines.length * 13 - 2;
    lowestRole = Math.min(lowestRole, roleY);
    writer.page.drawText(column.role, {
      x: column.x,
      y: roleY,
      size: 9,
      font: writer.font,
      color: MUTED,
    });
  }

  const namaY = lowestRole - 78;
  const jabatanY = namaY - 22;
  const meteraiColumn = columns[1];
  writer.page.drawText("Meterai", {
    x: meteraiColumn.x,
    y: namaY + 40,
    size: 9,
    font: writer.font,
    color: MUTED,
  });
  for (const column of columns) {
    writer.page.drawText("Nama", {
      x: column.x,
      y: namaY,
      size: 10,
      font: writer.font,
      color: INK,
    });
    writer.page.drawText("Jabatan", {
      x: column.x,
      y: jabatanY,
      size: 10,
      font: writer.font,
      color: INK,
    });
  }
  writer.y = jabatanY - 8;
}

function paintFooters(writer: Writer) {
  const total = writer.pages.length;
  writer.pages.forEach((page, index) => {
    page.drawLine({
      start: { x: MARGIN_X, y: 38 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 38 },
      thickness: 0.5,
      color: LINE,
    });
    page.drawText(writer.contractNo, {
      x: MARGIN_X,
      y: 24,
      size: 8,
      font: writer.font,
      color: MUTED,
    });
    const label = `Halaman ${index + 1} dari ${total}`;
    const width = writer.font.widthOfTextAtSize(label, 8);
    page.drawText(label, {
      x: PAGE_WIDTH - MARGIN_X - width,
      y: 24,
      size: 8,
      font: writer.font,
      color: MUTED,
    });
  });
}

function drawContractValue(
  writer: Writer,
  pending: SalesContractPending,
  current?: SalesContractBaseline,
) {
  if (
    pending.is_trial ||
    pending.monthly_price_idr == null ||
    pending.period_value_idr == null ||
    pending.adjustment_idr == null
  ) {
    return;
  }

  const endDate = pending.subscription_end_date
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date(pending.subscription_end_date))
    : "";
  const months = contractTermMonthsBetween(pending.price_effective_on ?? "", endDate);
  const changed =
    typeof current?.monthlyPriceIdr === "number" &&
    current.monthlyPriceIdr !== pending.monthly_price_idr;
  const rows: Array<{ label: string; value: string; highlight?: boolean }> = [
    {
      label: "Harga paket per bulan",
      value: formatContractIdr(pending.monthly_price_idr),
      highlight: changed,
    },
    ...(months >= 1 ? [{ label: "Jangka", value: `${months} bulan` }] : []),
    {
      label: "PPN",
      value: pending.ppn_included ? "Sudah termasuk PPN" : "Belum termasuk PPN",
    },
    {
      label: "Total tagihan",
      value: formatContractIdr(pending.adjustment_idr),
    },
  ];

  writer.y -= 6;
  drawWrapped(writer, "NILAI PERJANJIAN", { font: writer.bold, size: 11, gap: 6 });
  const labelWidth = 168;
  for (const row of rows) {
    const valueLines = wrap(pdfText(row.value), writer.bold, 9, CONTENT_WIDTH - labelWidth - 16);
    const rowHeight = Math.max(22, valueLines.length * 12 + 10);
    ensure(writer, rowHeight);
    writer.page.drawRectangle({
      x: MARGIN_X,
      y: writer.y - rowHeight,
      width: CONTENT_WIDTH,
      height: rowHeight,
      borderColor: LINE,
      borderWidth: 0.6,
    });
    const valueX = MARGIN_X + labelWidth;
    if (row.highlight) {
      writer.page.drawRectangle({
        x: valueX + 0.6,
        y: writer.y - rowHeight + 0.6,
        width: CONTENT_WIDTH - labelWidth - 0.6,
        height: rowHeight - 1.2,
        color: BRAND_RED,
      });
    }
    writer.page.drawLine({
      start: { x: valueX, y: writer.y },
      end: { x: valueX, y: writer.y - rowHeight },
      thickness: 0.6,
      color: LINE,
    });
    writer.page.drawText(pdfText(row.label), {
      x: MARGIN_X + 6,
      y: writer.y - 15,
      size: 9,
      font: writer.font,
      color: INK,
    });
    valueLines.forEach((line, index) => {
      writer.page.drawText(line, {
        x: valueX + 6,
        y: writer.y - 15 - index * 12,
        size: 9,
        font: writer.bold,
        color: row.highlight ? PAPER : INK,
      });
    });
    writer.y -= rowHeight;
  }
  writer.y -= 8;
  drawWrapped(
    writer,
    "Total tagihan adalah harga paket per bulan dikalikan jangka waktu.",
    { font: writer.font, size: 10, gap: 10 },
  );
}

function keptOutletNames(
  pending: SalesContractPending,
  outlets: { id: string; name: string }[],
): string[] {
  const names = new Map(outlets.map((outlet) => [outlet.id, outlet.name]));
  return pending.keep_outlet_ids
    .map((id) => names.get(id) ?? "")
    .map((name) => name.trim())
    .filter(Boolean);
}

export async function buildSalesContractPdf(input: {
  organizationName: string;
  pending: SalesContractPending;
  logoBytes: ArrayBuffer | Uint8Array;
  outlets?: ContractAnnexOutlet[];
  current?: SalesContractBaseline;
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(pngBytes(input.logoBytes));
  const number = contractNumber(input.pending);
  const customer = pdfText(input.organizationName) || "Pelanggan";
  const agreementDate = formatLongDate(input.pending.saved_at);

  pdf.setTitle(`Perjanjian Berlangganan ${customer}`);
  pdf.setAuthor("PT Integrasi Visual Digital Indonesia");
  pdf.setSubject(`Perjanjian berlangganan Synckerja Office ${number}`);
  pdf.setCreator("Synckerja Office");

  const writer: Writer = {
    doc: pdf,
    page: undefined as unknown as PDFPage,
    y: PAGE_HEIGHT,
    pages: [],
    font,
    bold,
    contractNo: number,
  };
  addPage(writer, false);

  const logoHeight = 34;
  const logoWidth = (logo.width / logo.height) * logoHeight;
  writer.page.drawImage(logo, {
    x: MARGIN_X,
    y: writer.y - logoHeight,
    width: logoWidth,
    height: logoHeight,
  });
  writer.page.drawText("SYNCKERJA OFFICE", {
    x: MARGIN_X + logoWidth + 12,
    y: writer.y - 14,
    size: 11,
    font: bold,
    color: INK,
  });
  writer.page.drawText("Perjanjian Berlangganan Layanan", {
    x: MARGIN_X + logoWidth + 12,
    y: writer.y - 28,
    size: 9,
    font,
    color: MUTED,
  });
  writer.y -= logoHeight + 16;
  writer.page.drawLine({
    start: { x: MARGIN_X, y: writer.y },
    end: { x: PAGE_WIDTH - MARGIN_X, y: writer.y },
    thickness: 1,
    color: RULE,
  });
  writer.y -= 36;

  drawCentered(writer, "PERJANJIAN BERLANGGANAN", bold, 14, 4);
  drawCentered(writer, "LAYANAN PERANGKAT LUNAK SYNCKERJA OFFICE", bold, 10, 32);

  const meta = [
    ["Nomor perjanjian", number],
    ["Tanggal perjanjian", agreementDate],
    ["Pelanggan", customer],
  ];
  for (const [label, value] of meta) {
    const valueLines = wrap(value, bold, 10, CONTENT_WIDTH - 140);
    const rowHeight = Math.max(16, valueLines.length * 13);
    ensure(writer, rowHeight);
    writer.page.drawText(label, {
      x: MARGIN_X,
      y: writer.y - 10,
      size: 10,
      font,
      color: MUTED,
    });
    valueLines.forEach((line, index) => {
      writer.page.drawText(line, {
        x: MARGIN_X + 132,
        y: writer.y - 10 - index * 13,
        size: 10,
        font: bold,
        color: INK,
      });
    });
    writer.y -= rowHeight;
  }
  writer.y -= 20;

  drawWrapped(
    writer,
    `Perjanjian Berlangganan Layanan Perangkat Lunak ini, selanjutnya disebut Perjanjian, dibuat pada tanggal ${agreementDate} antara Para Pihak berikut.`,
    { font, size: 10, gap: 8 },
  );
  drawParties(writer, customer);
  drawWrapped(
    writer,
    "Para Pihak menerangkan bahwa Pelanggan akan berlangganan layanan Synckerja Office, dan Penyedia bersedia menyediakan layanan tersebut sesuai ruang lingkup, jangka waktu, dan kuota dalam Perjanjian ini beserta lampirannya.",
    { font, size: 10, gap: 10 },
  );

  addPage(writer, true);
  drawWrapped(writer, "SYARAT DAN KETENTUAN", { font: bold, size: 11, gap: 8 });

  const openOutlets = keptOutletNames(input.pending, input.outlets ?? []);
  for (const article of buildArticles({
    organizationName: customer,
    pending: input.pending,
    keptOutletNames: openOutlets,
  })) {
    if (article.title.startsWith("PASAL 6")) addPage(writer, true);
    ensure(writer, 42);
    drawWrapped(writer, article.title, { font: bold, size: 11, gap: 6 });
    for (const clause of article.clauses) drawClause(writer, clause);
    if (article.title.startsWith("PASAL 8")) drawContractValue(writer, input.pending, input.current);
    writer.y -= 4;
  }

  ensure(writer, 48);
  drawWrapped(writer, "LAMPIRAN - RINCIAN LAYANAN", { font: bold, size: 11, gap: 6 });
  drawWrapped(
    writer,
    "Kolom Ketentuan berlaku menunjukkan paket yang sedang berjalan. Kolom Kesepakatan menunjukkan paket dalam Perjanjian ini. Tulisan Sama berarti ketentuan itu tidak berubah. Modul yang tidak tercantum tetap di luar kesepakatan ini.",
    { font, size: 10, gap: 8 },
  );
  drawTable(
    writer,
    contractAnnexRows({
      current: input.current ?? {
        modules: {},
        hrSeats: 0,
        omniSeats: 0,
        outletQuota: null,
      },
      pending: input.pending,
      outlets: input.outlets,
      keptOutletNames: openOutlets,
    }),
  );
  writer.y -= 16;
  drawSignatures(writer, customer);
  paintFooters(writer);

  return pdf.save();
}

export async function downloadSalesContractPdf(input: {
  organizationName: string;
  pending: SalesContractPending;
  outlets?: ContractAnnexOutlet[];
  current?: SalesContractBaseline;
}): Promise<void> {
  const logoBytes = await fetch(logoUrl).then((response) => response.arrayBuffer());
  const bytes = await buildSalesContractPdf({ ...input, logoBytes });
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Kontrak ${input.organizationName}.pdf`;
  anchor.click();
  URL.revokeObjectURL(url);
}
