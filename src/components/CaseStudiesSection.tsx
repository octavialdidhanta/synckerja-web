import { useState } from "react";

const industries = ["Manufaktur", "Jasa Keuangan", "Trading", "Jasa Profesional", "F&B dan Retail", "Hospitality"];

const caseStudies: Record<string, { stats: { value: string; label: string }[]; quote: string; person: string; company: string }> = {
  Manufaktur: {
    stats: [
      { value: "1000+", label: "payroll karyawan selesai dalam 1 hari" },
      { value: "100%", label: "lebih cepat & akurat mengelola absensi" },
      { value: "3x", label: "lebih efisien mengelola onboarding" },
    ],
    quote: "Sebelum pakai Mekari Talenta, kami manual, di mana perhitungan manual membutuhkan paling cepat 3 hari. Sekarang, 30 menit bisa selesai.",
    person: "Erna",
    company: "Compensation & Benefit, PT Victoria Care Indonesia Tbk.",
  },
  "Jasa Keuangan": {
    stats: [
      { value: "500+", label: "karyawan terkelola otomatis" },
      { value: "95%", label: "akurasi perhitungan payroll" },
      { value: "2x", label: "lebih cepat proses rekrutmen" },
    ],
    quote: "Talenta membantu kami mengotomasi proses HR yang sebelumnya memakan waktu berhari-hari.",
    person: "Andi",
    company: "HR Manager, PT Finance Corp.",
  },
};

const CaseStudiesSection = () => {
  const [active, setActive] = useState("Manufaktur");
  const data = caseStudies[active] || caseStudies["Manufaktur"];

  return (
    <section className="py-16 lg:py-24 section-red text-primary-foreground">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3">
          Bagaimana Mekari Talenta membantu bisnis di berbagai industri
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl">
          Lihat hasil nyata dari perusahaan yang berhasil mempercepat proses HR dan meningkatkan akurasi data.
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setActive(ind)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === ind
                  ? "bg-primary-foreground text-foreground"
                  : "border border-primary-foreground/30 text-primary-foreground/80 hover:bg-primary-foreground/10"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-card text-foreground rounded-2xl p-8 lg:p-10">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {data.stats.map((s) => (
              <div key={s.value}>
                <p className="text-3xl lg:text-4xl font-extrabold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <blockquote className="text-lg lg:text-xl font-medium text-foreground mb-4 leading-relaxed">
            &ldquo;{data.quote}&rdquo;
          </blockquote>
          <p className="font-bold text-foreground">{data.person}</p>
          <p className="text-sm text-muted-foreground">{data.company}</p>
        </div>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
