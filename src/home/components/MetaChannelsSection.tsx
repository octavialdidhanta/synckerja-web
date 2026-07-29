import { Instagram, MessageCircle, Share2 } from "lucide-react";

const capabilities = [
  {
    icon: Share2,
    title: "Hubungkan Facebook Page & Instagram",
    desc: "Klien bisnis login via Meta dan menghubungkan Facebook Page serta akun Instagram profesional mereka sendiri ke workspace Synckerja Office.",
  },
  {
    icon: Instagram,
    title: "Publikasi konten & Reels",
    desc: "Jadwalkan atau publikasikan post dan Reels yang klien buat, ke akun Meta yang sudah mereka otorisasi—bukan akun Synckerja.",
  },
  {
    icon: MessageCircle,
    title: "Pesan & engagement pelanggan",
    desc: "Kelola percakapan dan interaksi di kanal yang diaktifkan klien (termasuk WhatsApp, Facebook Messenger, dan Instagram) sesuai izin yang diberikan.",
  },
] as const;

/**
 * Homepage section: Meta / Facebook / Instagram untuk klien SaaS.
 * Privacy Policy ada di footer situs.
 */
const MetaChannelsSection = () => {
  return (
    <section id="meta-channels" className="border-y border-border/60 bg-card py-14 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-left md:text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Facebook · Instagram · Meta
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl lg:text-4xl">
            Kelola aset Meta klien di satu aplikasi SaaS
          </h2>
          <p className="mt-4 text-muted-foreground md:text-base">
            Synckerja Office adalah platform SaaS untuk bisnis klien. Mereka menghubungkan Facebook Page dan Instagram
            profesional melalui Meta login, lalu memakai Synckerja untuk publikasi konten, penjadwalan, dan komunikasi
            pelanggan—hanya atas nama bisnis yang memberi otorisasi. Data Meta dipakai untuk layanan yang diminta
            klien; kami tidak menjual Platform Data.
          </p>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-md md:p-6"
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="text-base font-semibold text-foreground md:text-lg">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MetaChannelsSection;
