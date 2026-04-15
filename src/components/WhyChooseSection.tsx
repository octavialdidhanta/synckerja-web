import { Sparkles, Database, Phone, Users } from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Dukungan AI untuk efektivitas",
    desc: "Analitik data yang mendalam secara otomatis untuk hasil laporan lebih cepat.",
    link: "Lihat Talenta AI →",
  },
  {
    icon: Database,
    title: "Pusat data lokal",
    desc: "Data Anda dikelola di dalam negeri untuk menjamin keamanan data sensitif.",
    link: null,
  },
  {
    icon: Phone,
    title: "Support terdedikasi",
    desc: "Kami menyediakan pendampingan implementasi secara gratis, lengkap dengan manajer akun khusus.",
    link: null,
  },
  {
    icon: Users,
    title: "Ekosistem HR 101",
    desc: "Komunitas SDM yang berfokus pada pemberdayaan anggotanya serta membangun jaringan yang kuat.",
    link: null,
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-16 lg:py-24 section-warm">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-4 mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground">
            Mekari Talenta paling mengerti kebutuhan Anda
          </h2>
          <p className="text-muted-foreground self-end">
            Dirancang menjadi solusi HCM yang memberikan keamanan, kemudahan, dan dukungan penuh bagi bisnis berbagai skala.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.desc}</p>
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
