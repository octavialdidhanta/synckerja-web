import { useState } from "react";

const industries = [
  "F&B dan Retail",
  "Jasa Keuangan",
  "Hospitality",
  "Manufaktur",
  "Trading",
  "Jasa Profesional",
] as const;

type Industry = (typeof industries)[number];

const caseStudies: Record<
  Industry,
  { stats: { value: string; label: string }[]; quote: string; person: string; company: string }
> = {
  Manufaktur: {
    stats: [
      { value: "1000+", label: "Payroll ribuan karyawan selesai dalam 1 hari" },
      { value: "100%", label: "Hitung absensi lebih cepat, tanpa salah hitung" },
      { value: "3x", label: "Onboarding karyawan baru lebih efisien" },
    ],
    quote:
      "Proses payroll dari 3 hari jadi 30 menit. Itu bedanya setelah kami pakai Synckerja Office.",
    person: "Milda",
    company: "Compensation & Benefit, PT Chemistry Beauty Indonesia Tbk.",
  },
  "Jasa Keuangan": {
    stats: [
      { value: "2000+", label: "Payroll ribuan karyawan selesai dalam 1 hari" },
      { value: "100%", label: "Rekonsiliasi absensi lebih akurat" },
      { value: "3x", label: "Onboarding agen dan staf lebih cepat" },
    ],
    quote:
      "Dulu laporan kehadiran dan payroll butuh 2-3 hari karena banyak verifikasi. Sekarang cukup 30 menit, semuanya rapi otomatis.",
    person: "Andre",
    company: "HR Operations Manager, PT Finansial Cepat Tbk.",
  },
  Trading: {
    stats: [
      { value: "500+", label: "Payroll cabang tersebar selesai 1 hari" },
      { value: "100%", label: "Shift dan lembur terhitung lebih terjamin" },
      { value: "3x", label: "Onboarding staf cabang lebih efisien" },
    ],
    quote:
      "Dulu rekap absensi dari 10 cabang butuh 2-3 hari. Sekarang 30 menit, semuanya terpusat dan langsung jadi.",
    person: "Santi",
    company: "HRIS Lead, PT Global Trading Solutions",
  },
  "Jasa Profesional": {
    stats: [
      { value: "800+", label: "Payroll tim profesional selesai dalam 1 hari" },
      { value: "100%", label: "Absensi proyek lebih cepat dan akurat" },
      { value: "3x", label: "Onboarding tim proyek lebih ringkas" },
    ],
    quote:
      "Dulu kami manual, paling cepat 3 hari untuk payroll tim. Sekarang 30 menit, semua otomatis dan akurat.",
    person: "Rina",
    company: "Finance & HR Manager, PT Profesional Kreasi Mandiri",
  },
  "F&B dan Retail": {
    stats: [
      { value: "3000+", label: "Payroll outlet dan toko selesai dalam 1 hari" },
      { value: "100%", label: "Rekap shift dan lembur lebih cepat" },
      { value: "3x", label: "Onboarding staf outlet lebih efisien" },
    ],
    quote:
      "Dulu kami manual per outlet, butuh minimal 3 hari. Sekarang 30 menit, semua data payroll langsung rapi.",
    person: "Dian",
    company: "HR Operations, PT Kuliner Nusantara Raya",
  },
  Hospitality: {
    stats: [
      { value: "1500+", label: "Payroll hotel dan restoran selesai dalam 1 hari" },
      { value: "100%", label: "Shift bergilir terhitung lebih terjamin" },
      { value: "3x", label: "Onboarding staf harian lebih cepat" },
    ],
    quote:
      "Dulu rekap absensi shift pagi, siang, malam butuh 2-3 hari. Sekarang 30 menit, langsung selesai tanpa pusing.",
    person: "Yudha",
    company: "HRIS Specialist, PT Hotel Indah Hospitality Group",
  },
};

const CaseStudiesSection = () => {
  const [active, setActive] = useState<Industry>("Manufaktur");
  const data = caseStudies[active];

  return (
    <section className="section-warm py-14 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Testimoni klien</p>
          <h2 className="mt-2 text-xl font-bold text-foreground md:text-2xl">
            Cerita klien dari berbagai industri
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Payroll, absensi, dan onboarding yang lebih rapi di berbagai jenis bisnis.
          </p>
        </div>

        <article className="w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          <div className="grid items-stretch lg:grid-cols-12">
            <div
              role="tablist"
              aria-label="Industri klien"
              className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-border/50 bg-muted/30 px-4 py-4 lg:col-span-3 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-6"
            >
              {industries.map((ind) => {
                const isActive = active === ind;
                return (
                  <button
                    key={ind}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActive(ind)}
                    className={`shrink-0 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all duration-200 md:text-sm lg:w-full ${
                      isActive
                        ? "bg-card text-primary shadow-sm ring-1 ring-border/60 lg:border-l-2 lg:border-l-primary lg:bg-primary/[0.06] lg:pl-2.5 lg:shadow-none lg:ring-0"
                        : "text-muted-foreground hover:bg-card/60 hover:text-foreground lg:border-l-2 lg:border-l-transparent lg:pl-2.5"
                    }`}
                  >
                    {ind}
                  </button>
                );
              })}
            </div>

            <div
              key={active}
              className="animate-in fade-in grid duration-300 lg:col-span-9 lg:grid-cols-9"
            >
              <div className="flex flex-col justify-center gap-6 border-b border-border/50 px-5 py-6 sm:px-6 lg:col-span-3 lg:border-b-0 lg:border-r lg:py-8">
                {data.stats.map(({ value, label }, i) => (
                  <div
                    key={label}
                    className={i < data.stats.length - 1 ? "border-b border-border/40 pb-6" : ""}
                  >
                    <p className="text-2xl font-semibold tabular-nums text-primary md:text-3xl">{value}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground md:text-sm">{label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-center px-5 py-6 sm:px-6 lg:col-span-6 lg:px-8 lg:py-8">
                <p className="mb-4 text-xs font-medium text-primary">{active}</p>
                <blockquote className="text-sm leading-relaxed text-foreground/90 md:text-base lg:text-[1.05rem] lg:leading-7">
                  &ldquo;{data.quote}&rdquo;
                </blockquote>

                <footer className="mt-6 flex items-center gap-3 border-t border-border/40 pt-5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {data.person.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{data.person}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{data.company}</p>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};

export default CaseStudiesSection;
