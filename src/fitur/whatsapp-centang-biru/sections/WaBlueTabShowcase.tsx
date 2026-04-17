import { useState } from "react";
import { BadgeCheck, Check } from "lucide-react";
import { trackWaBlueCta, trackWaBlueTab } from "../analytics";

type TabId = "automation" | "multi_agent" | "crm";

const tabs: { id: TabId; label: string }[] = [
  { id: "automation", label: "Layanan terautomasi" },
  { id: "multi_agent", label: "Operasional multiagen" },
  { id: "crm", label: "CRM terintegrasi" },
];

const tabContent: Record<
  TabId,
  { title: string; bullets: string[]; kicker: string }
> = {
  automation: {
    kicker: "Di luar centang biru, kecepatan tetap dirasakan pelanggan",
    title: "Automasi layanan pelanggan",
    bullets: [
      "Routing pertanyaan berulang ke jawaban terstandar agen tetap fokus pada kasus bernilai tinggi.",
      "Template balasan diselaraskan dengan identitas terverifikasi sehingga nada komunikasi konsisten.",
      "Integrasi channel membantu tim menjaga SLA tanpa bolak-balik bukti identitas manual.",
    ],
  },
  multi_agent: {
    kicker: "Kepercayaan pelanggan tidak boleh bergantung pada satu nomor pribadi",
    title: "Operasional multiagen yang tetap terasa satu brand",
    bullets: [
      "Hak akses per peran mencegah “nomor bos” menjadi bottleneck komunikasi resmi.",
      "Supervisi percakapan memastikan tone of voice selaras dengan positioning premium.",
      "Eskalasi antar shift tidak merusak kredibilitas karena konteks pelanggan tersimpan rapi.",
    ],
  },
  crm: {
    kicker: "Verifikasi percuma jika data pelanggan berantakan",
    title: "CRM terintegrasi untuk menutup loop kepercayaan",
    bullets: [
      "Riwayat interaksi WhatsApp terhubung ke profil pelanggan agar follow-up tidak terasa asing.",
      "Status verifikasi dan metadata bisnis tercermin di dashboard tim penjualan.",
      "Insight sederhana membantu Anda melihat percakapan mana yang butuh sentuhan manusia lebih cepat.",
    ],
  },
};

const WaBlueTabShowcase = () => {
  const [active, setActive] = useState<TabId>("automation");
  const content = tabContent[active];

  return (
    <section className="bg-primary py-14 text-primary-foreground md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:gap-12">
          <div>
            <h2 className="text-2xl font-extrabold leading-snug md:text-3xl">
              Lebih dari centang biru: fondasi pengalaman pelanggan yang profesional
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/85 md:text-base">
              Centang biru menjawab keraguan identitas. Synckerja Office melengkapinya dengan operasional yang rapi—agar
              kepercayaan awal berlanjut menjadi ritme layanan yang bisa diukur, bukan sekadar “tampilan meyakinkan”.
            </p>
            <nav className="mt-8 space-y-2" aria-label="Ringkasan kemampuan">
              {tabs.map((t) => {
                const isActive = t.id === active;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setActive(t.id);
                      trackWaBlueTab(t.id);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors md:text-base ${
                      isActive ? "bg-primary-foreground/10" : "hover:bg-primary-foreground/5"
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${isActive ? "bg-[#FFC107]" : "bg-primary-foreground/25"}`}
                      aria-hidden
                    />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </nav>
            <a
              href="#"
              onClick={() => trackWaBlueCta("whatsapp_sales", "wa_blue_tab_sidebar")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-background px-4 py-3 text-sm font-semibold text-primary shadow-sm transition-opacity hover:opacity-95 lg:w-auto"
            >
              <span aria-hidden>💬</span>
              WhatsApp sales
            </a>
          </div>

          <div className="rounded-3xl bg-background p-6 text-foreground shadow-xl md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{content.kicker}</p>
            <h3 className="mt-2 text-xl font-extrabold md:text-2xl">{content.title}</h3>
            <ul className="mt-6 space-y-3">
              {content.bullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-center">
              <div className="rounded-2xl bg-foreground p-4 text-background shadow-inner">
                <div className="mx-auto max-w-[220px] rounded-[1.75rem] border border-background/15 bg-background/5 p-3">
                  <div className="rounded-[1.35rem] bg-background px-4 py-5 text-foreground shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="size-11 rounded-full bg-secondary" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">Synckerja Office</p>
                        <p className="text-xs text-muted-foreground">WhatsApp Business</p>
                      </div>
                      <BadgeCheck className="ml-auto size-6 shrink-0 text-primary" aria-label="Terverifikasi" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-2 w-3/4 rounded-full bg-muted" />
                      <div className="h-2 w-1/2 rounded-full bg-muted" />
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-background/70">Ilustrasi profil — bukan tangkapan layar pihak ketiga</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/40 p-5">
                <p className="text-sm font-semibold text-foreground">Positioning singkat</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Synckerja Office memosisikan WhatsApp sebagai jalur resmi: identitas terverifikasi, alur kerja tim yang
                  terlihat, dan data pelanggan yang tidak “berpindah dompet” antar nomor pribadi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaBlueTabShowcase;
