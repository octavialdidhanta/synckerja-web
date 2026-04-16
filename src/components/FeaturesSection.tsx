import { CheckCircle } from "lucide-react";

const features = [
  {
    title: "Kehadiran",
    desc: "Kelola kehadiran dan jam kerja ribuan karyawan secara fleksibel dan terkontrol.",
    items: ["Absensi online", "Shift & jadwal kerja", "Pengelolaan cuti & lembur"],
  },
  {
    title: "Payroll, Kompensasi & Benefit",
    desc: "Automasi proses penggajian, pajak, dan tunjangan karyawan dengan akurat, dan sesuai regulasi.",
    items: ["Perhitungan gaji, PPh 21 & BPJS", "Laporan payroll", "Earned wage access"],
  },
  {
    title: "AI & Analitik HR",
    desc: "Dapatkan laporan otomatis dan insight tenaga kerja mendalam dengan dukungan AI.",
    items: ["AI insight chatbot", "CV scoring", "Dashboard terkostumisasi"],
  },
  {
    title: "Rekrutmen",
    desc: "Optimalkan proses rekrutmen dari pencarian kandidat hingga penilaian agar lebih cepat dan terukur.",
    items: ["MPP", "ATS terintegrasi", "Assessment test"],
  },
  {
    title: "Talent Development",
    desc: "Kembangkan potensi karyawan melalui penilaian kinerja, perencanaan karir, dan pelatihan yang terarah.",
    items: ["Performance management", "Individual Development Plan", "LMS"],
  },
  {
    title: "Administrasi HR",
    desc: "Kelola seluruh administrasi HR perusahaan multi cabang, holding, dan multinasional dari satu platform.",
    items: ["Survei karyawan", "Onboarding & offboarding", "Manajemen akses & aset"],
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground mb-4">
            Fitur lengkap yang menjawab segala kebutuhan HR
          </h2>
          <p className="text-muted-foreground">
            Solusi HCM terintegrasi dengan fitur end-to-end dari rekrutmen, payroll, hingga performance management yang sesuai dengan kebutuhan industri Anda.
          </p>
        </div>
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-primary/20 bg-card p-6 hover:shadow-lg transition-shadow min-w-[80%] sm:min-w-[75%] md:min-w-0 snap-start flex-shrink-0 md:flex-shrink"
            >
              <div className="w-full h-32 bg-muted rounded-lg mb-5 flex items-center justify-center">
                <span className="text-3xl text-muted-foreground">📊</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{f.desc}</p>
              <ul className="space-y-2">
                {f.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
