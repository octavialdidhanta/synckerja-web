import { Briefcase, MonitorSmartphone, Share2 } from "lucide-react";

const pillars = [
  {
    title: "Kurangi gesekan operasional hingga signifikan",
    body: "Dengan profil yang konsisten dan verifikasi yang jelas, tim menghabiskan lebih sedikit waktu meyakinkan pelanggan di setiap tiket—alokasi jam kerja bergeser ke penyelesaian masalah dan penjualan tambahan.",
    icon: MonitorSmartphone,
  },
  {
    title: "Skalakan komunikasi tanpa merusak reputasi",
    body: "Pola multi-cabang dan multi-shift sering memecah brand experience. Synckerja Office membantu Anda menjaga satu narasi resmi di WhatsApp, termasuk saat tim berganti tugas.",
    icon: Briefcase,
  },
  {
    title: "Kontrol data yang layak untuk saluran sensitif",
    body: "Percakapan pelanggan adalah aset. Pendekatan terstruktur membantu Anda menjaga jejak audit, hak akses, dan kebijakan retensi agar saluran resmi tetap aman seiring pertumbuhan bisnis.",
    icon: Share2,
  },
];

const WaBlueWhyOffice = () => {
  return (
    <section className="bg-[hsl(40_60%_97%)] py-14 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="max-w-3xl text-2xl font-extrabold text-foreground md:text-3xl">
          Mengapa pemimpin operasional memilih Synckerja Office saat membuka WhatsApp untuk publik
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-2 md:mt-12 md:grid-cols-3 md:gap-10">
          {pillars.map(({ title, body, icon: Icon }) => (
            <div key={title}>
              <div className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm md:mb-4">
                <Icon className="size-6" strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:mt-3">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WaBlueWhyOffice;
