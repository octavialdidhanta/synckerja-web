import { useState } from "react";
import { Check, MessageCircle } from "lucide-react";
import waBlueTabHero from "../assets/wa-blue-tab-hero.svg";
import { trackWaBlueCta, trackWaBlueTab } from "../analytics";

type TabId = "automation" | "multi_agent" | "crm";

const tabs: { id: TabId; label: string }[] = [
  { id: "automation", label: "Layanan terautomasi" },
  { id: "multi_agent", label: "Operasional multiagen" },
  { id: "crm", label: "CRM terintegrasi" },
];

const tabContent: Record<TabId, { title: string; bullets: string[]; kicker: string; note: string }> = {
  automation: {
    kicker: "Di luar centang biru, kecepatan tetap dirasakan pelanggan",
    title: "Automasi layanan pelanggan",
    bullets: [
      "Pertanyaan berulang dijawab otomatis, tim fokus ke kasus yang lebih penting.",
      "Template balasan selaras dengan profil resmi, jadi nada chat tetap konsisten.",
      "Tim balas lebih cepat tanpa bolak-balik kirim bukti identitas manual.",
    ],
    note: "Identitas terverifikasi, tim kerja yang rapi, dan riwayat chat pelanggan tetap aman di satu tempat, bukan berpindah ke nomor pribadi siapa pun.",
  },
  multi_agent: {
    kicker: "Kepercayaan pelanggan tidak boleh bergantung pada satu nomor pribadi",
    title: "Operasional multiagen yang tetap terasa satu brand",
    bullets: [
      "Setiap tim punya akses sesuai peran, chat resmi tidak bergantung pada satu nomor pribadi.",
      "Supervisi percakapan menjaga nada chat tetap selaras dengan brand Anda.",
      "Eskalasi antar shift tidak merusak kredibilitas karena konteks pelanggan tersimpan rapi.",
    ],
    note: "Banyak tim, satu identitas resmi. Pelanggan selalu merasa bicara dengan bisnis yang sama.",
  },
  crm: {
    kicker: "Riwayat chat tersimpan, follow-up jadi lebih personal",
    title: "CRM terintegrasi dengan WhatsApp",
    bullets: [
      "Semua chat WhatsApp tersimpan di profil pelanggan, tim tidak perlu tanya ulang dari awal.",
      "Tim sales bisa lihat status verifikasi dan info bisnis langsung di dashboard.",
      "Tahu chat mana yang perlu ditangani manusia lebih dulu.",
    ],
    note: "Data pelanggan rapi di satu tempat, follow-up terasa personal dan tidak mengulang dari nol.",
  },
};

const WaBlueTabShowcase = () => {
  const [active, setActive] = useState<TabId>("automation");
  const content = tabContent[active];

  return (
    <section className="border-t border-border bg-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Di luar centang biru</p>
          <h2 className="mt-3 text-2xl font-extrabold leading-snug text-foreground md:text-3xl">
            Lebih dari sekedar centang biru, layanan yang benar-benar rapi
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Centang biru bikin pelanggan percaya. Synckerja Office melengkapi dengan operasional yang rapi supaya kepercayaan
            itu berlanjut jadi layanan yang konsisten, bukan cuma tampilan meyakinkan.
          </p>
        </div>
      </div>

      <div className="mt-10 w-full border-b border-border md:container md:mx-auto md:px-4">
        <div
          className="flex snap-x snap-mandatory flex-nowrap gap-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] md:snap-none md:flex-wrap md:justify-center md:gap-2 md:overflow-visible [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Kemampuan Synckerja Office"
        >
          {tabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActive(t.id);
                  trackWaBlueTab(t.id);
                }}
                className={`shrink-0 snap-start whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors md:snap-align-none md:rounded-t-lg md:text-base ${
                  isActive
                    ? "border-b-2 border-primary bg-secondary/40 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/20 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div
          className="grid gap-10 border-b border-border pt-4 pb-10 md:pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-center lg:gap-8"
          role="tabpanel"
        >
          <div>
            <h3 className="text-xl font-extrabold text-foreground md:text-2xl">{content.title}</h3>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{content.kicker}</p>
            <ul className="mt-6 space-y-4">
              {content.bullets.map((line) => (
                <li key={line} className="flex gap-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground">{content.note}</p>
            <a
              href="#"
              onClick={() => trackWaBlueCta("hubungi_sales", "wa_blue_tab_showcase")}
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-5" strokeWidth={2} aria-hidden />
              hubungi Sales
            </a>
          </div>

          <div className="flex w-full flex-col gap-3 lg:border-l lg:border-border lg:pl-6">
            <img
              src={waBlueTabHero}
              alt="Ilustrasi operasional WhatsApp Business Bisnis Anda dengan dashboard tim dan CRM terintegrasi"
              width={400}
              height={440}
              sizes="(max-width: 1023px) 100vw, 420px"
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
            <p className="text-center text-xs text-muted-foreground lg:text-left">
              WhatsApp terverifikasi + operasional tim yang rapi
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaBlueTabShowcase;
