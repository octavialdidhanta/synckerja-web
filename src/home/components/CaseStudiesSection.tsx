import { useState } from "react";

const industries = ["F&B dan Retail", "Jasa Keuangan" , "Hospitality" , "Manufaktur", "Trading", "Jasa Profesional"];

const caseStudies: Record<string, { stats: { value: string; label: string }[]; quote: string; person: string; company: string }> = {
  "Manufaktur": {
    stats: [
      { value: "1000+", label: "Cukup 1 hari untuk payroll ribuan karyawan" },
      { value: "100%", label: "Bebas kesalahan hitung absensi, 100% lebih cepat" },
      { value: "3x", label: "Onboarding makin efisien" },
    ],
    quote: "Proses payroll dari 3 hari menjadi 30 menit—itulah bedanya setelah pakai Synckerja Office.",
    person: "Milda",
    company: "Compensation & Benefit, PT Chemistry Beauty Indonesia Tbk.",
  },

  "Jasa Keuangan": {
      stats: [
        { value: "2000+", label: "Payroll ribuan nasabah & karyawan selesai dalam 1 hari" },
        { value: "100%", label: "Rekonsiliasi data absensi & kehadiran 100% lebih akurat" },
        { value: "3x", label: "Proses onboarding agen & staf 3x lebih cepat" },
      ],
      quote: "Dulu laporan kehadiran dan payroll butuh 2-3 hari karena banyak verifikasi. Sekarang cukup 30 menit, semuanya rapi otomatis.",
      person: "Andre",
      company: "HR Operations Manager, PT Finansial Cepat Tbk.",
    },

  "Trading": {
      stats: [
        { value: "500+", label: "Payroll karyawan cabang tersebar selesai 1 hari" },
        { value: "100%", label: "Akurasi hitung shift & lembur 100% lebih terjamin" },
        { value: "3x", label: "Onboarding trader & staf pendukung 3x lebih efisien" },
      ],
      quote: "Dulu rekap absensi dari 10 cabang butuh waktu 2-3 hari. Sekarang 30 menit, semuanya terpusat dan langsung jadi.",
      person: "Santi",
      company: "HRIS Lead, PT Global Trading Solutions",
    },

  "Jasa Profesional": {
      stats: [
        { value: "800+", label: "Payroll konsultan & staf profesional selesai dalam 1 hari" },
        { value: "100%", label: "Bebas kesalahan hitung proyek & absensi, 100% lebih cepat" },
        { value: "3x", label: "Onboarding tim proyek baru 3x lebih ringkas" },
      ],
      quote: "Dulu kami manual, paling cepat 3 hari untuk payroll tim. Sekarang 30 menit, semua otomatis dan akurat.",
      person: "Rina",
      company: "Finance & HR Manager, PT Profesional Kreasi Mandiri",
    },

  "F&B dan Retail": {
      stats: [
        { value: "3000+", label: "Payroll karyawan outlet & toko selesai dalam 1 hari" },
        { value: "100%", label: "Rekap shift, lembur, & kehadiran 100% lebih cepat & akurat" },
        { value: "3x", label: "Onboarding staf outlet & kasir 3x lebih efisien" },
      ],
      quote: "Dulu kami manual per outlet, butuh minimal 3 hari. Sekarang 30 menit, semua data payroll langsung rapi.",
      person: "Dian",
      company: "HR Operations, PT Kuliner Nusantara Raya",
    },

  "Hospitality": {
      stats: [
        { value: "1500+", label: "Payroll karyawan hotel & restoran selesai dalam 1 hari" },
        { value: "100%", label: "Akurasi hitung shift bergilir & lembur 100% lebih terjamin" },
        { value: "3x", label: "Onboarding staf harian & tetap 3x lebih cepat" },
      ],
      quote: "Dulu rekap absensi shift pagi, siang, malam butuh 2-3 hari. Sekarang 30 menit, langsung selesai tanpa pusing.",
      person: "Yudha",
      company: "HRIS Specialist, PT Hotel Indah Hospitality Group",
    },
};

const CaseStudiesSection = () => {
  const [active, setActive] = useState("Manufaktur");
  const data = caseStudies[active] || caseStudies["Manufaktur"];

  return (
    <section className="py-16 lg:py-24 section-red text-primary-foreground">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3">
          Bagaimana Synckerja Office membantu bisnis di berbagai industri
        </h2>
        <p className="text-primary-foreground/90 mb-8 max-w-xl">
          Testimoni Klien kami yang menerima manfaat dari Synckerja Office.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto md:overflow-visible -mx-4 md:mx-0 px-4 md:px-0 flex-nowrap md:flex-wrap whitespace-nowrap md:whitespace-normal scrollbar-hide">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setActive(ind)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === ind
                  ? "bg-primary-foreground text-foreground"
                  : "border border-primary-foreground/40 text-primary-foreground/90 hover:bg-primary-foreground/10"
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
                <p className="text-3xl lg:text-4xl font-extrabold text-accent">{s.value}</p>
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
