import { Briefcase, MonitorSmartphone, Share2 } from "lucide-react";

const pillars = [
  {
    title: "Stop buang waktu meyakinkan pelanggan",
    body: "Chat tanpa verifikasi sering berhenti di keraguan. Dengan profil resmi, pelanggan lebih cepat lanjut ke nego, follow-up, dan closing, bukan stuck di 'ini beneran perusahaan Anda?'",
    icon: MonitorSmartphone,
  },
  {
    title: "Satu brand, di semua tim dan cabang",
    body: "Pelanggan tidak peduli siapa yang balas. Yang mereka lihat adalah bisnis Anda. Identitas resmi tetap sama, profesional dan dipercaya, dari shift pertama sampai cabang terakhir.",
    icon: Briefcase,
  },
  {
    title: "Kepercayaan hari ini tidak hilang besok",
    body: "Riwayat chat tersimpan rapi, akses tim diatur per peran. Pergantian shift atau pertumbuhan bisnis tidak bikin pelanggan merasa chat dengan orang berbeda-beda.",
    icon: Share2,
  },
];

const WaBlueWhyOffice = () => {
  return (
    <section className="border-t-4 border-primary bg-gradient-to-b from-secondary/60 via-background to-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Kenapa Synckerja Office</p>
          <h2 className="mt-3 text-2xl font-extrabold text-foreground md:text-3xl">
            Yang penting pelanggan percaya dulu, transaksi akan mengikuti
          </h2>
          <p className="mt-4 text-muted-foreground">
            WhatsApp resmi bukan cuma centang biru di profil, tapi soal bagaimana setiap chat Anda terasa meyakinkan dari
            pesan pertama sampai closing. Itu yang Synckerja Office bantu bangun.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-3 md:gap-6">
          {pillars.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden />
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <span className="size-2.5 rounded-full bg-accent" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WaBlueWhyOffice;
