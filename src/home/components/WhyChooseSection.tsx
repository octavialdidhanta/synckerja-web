import { Sparkles, Database, Phone, Users } from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Insight cepat untuk keputusan bisnis",
    desc: "Ringkas keterlambatan, lembur, dan biaya tim dalam hitungan detik—tanpa spreadsheet dan tanpa tebak-tebakan.",
    link: "Lihat contoh insight →",
  },
  {
    icon: Database,
    title: "Data aman & siap audit",
    desc: "Lindungi data karyawan dan payroll dengan kontrol akses, jejak audit, dan pengelolaan data yang rapi untuk kebutuhan compliance.",
    link: null,
  },
  {
    icon: Phone,
    title: "Implementasi cepat, operasional tetap jalan",
    desc: "Tim kami bantu set up alur absensi, cuti, hingga payroll—jadi Anda bisa tetap fokus jualan dan scaling bisnis.",
    link: null,
  },
  {
    icon: Users,
    title: "Kontrol tim lintas cabang dari satu tempat",
    desc: "Pantau kinerja operasional, disiplin kehadiran, dan biaya per cabang dalam satu dashboard yang mudah dipahami owner.",
    link: null,
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-16 lg:py-24 section-warm">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-4 mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground">
            Kontrol operasional tim untuk business owner yang ingin tumbuh cepat
          </h2>
          <p className="text-foreground/70 self-end">
            Satukan data orang, jam kerja, dan payroll agar biaya terkendali, tim lebih disiplin, dan keputusan bisa diambil cepat tanpa tenggelam di urusan admin.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-2 md:gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-card rounded-xl border border-border p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 md:mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.desc}</p>
                {item.link && (
                  <a href="#" className="text-sm font-medium text-foreground underline hover:text-primary transition-colors">
                    {item.link}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
