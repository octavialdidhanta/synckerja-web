import { CheckCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/share/ui/carousel";
import { FeatureIllustration, type FeatureIllustrationId } from "./FeatureCardIllustrations";

const features: {
  id: FeatureIllustrationId;
  title: string;
  desc: string;
  items: string[];
}[] = [
  {
    id: "crm",
    title: "CRM",
    desc: "Lacak pelanggan, pipeline sales, dan follow-up dalam satu dashboard yang terhubung dengan tim Anda.",
    items: ["Pipeline & deal tracking", "Riwayat chat pelanggan", "Follow-up terjadwal"],
  },
  {
    id: "proyek",
    title: "Manajemen Proyek",
    desc: "Kelola tugas, deadline, dan kolaborasi tim proyek tanpa pindah ke tools terpisah.",
    items: ["Task & timeline proyek", "Assign tim per peran", "Progress & status real-time"],
  },
  {
    id: "sosmed",
    title: "Media Sosial",
    desc: "Rencanakan, jadwalkan, dan pantau konten media sosial brand Anda dari satu tempat.",
    items: ["Kalender konten", "Jadwal posting", "Monitoring engagement"],
  },
  {
    id: "iklan",
    title: "Iklan & Kampanye",
    desc: "Kelola kampanye iklan digital dan pantau performa tanpa bolak-balik antar platform.",
    items: ["Meta Ads & Google Ads", "Tracking CTR & ROAS", "Laporan kampanye"],
  },
  {
    id: "kehadiran",
    title: "Kehadiran",
    desc: "Kelola kehadiran dan jam kerja ribuan karyawan secara fleksibel dan terkontrol.",
    items: ["Absensi online", "Shift & jadwal kerja", "Pengelolaan cuti & lembur"],
  },
  {
    id: "payroll",
    title: "Payroll, Kompensasi & Benefit",
    desc: "Automasi proses penggajian, pajak, dan tunjangan karyawan dengan akurat, dan sesuai regulasi.",
    items: ["Perhitungan gaji, PPh 21 & BPJS", "Laporan payroll", "Earned wage access"],
  },
  {
    id: "rekrutmen",
    title: "Rekrutmen",
    desc: "Optimalkan proses rekrutmen dari pencarian kandidat hingga penilaian agar lebih cepat dan terukur.",
    items: ["MPP", "ATS terintegrasi", "Assessment test"],
  },
  {
    id: "talent",
    title: "Talent Development",
    desc: "Kembangkan potensi karyawan melalui penilaian kinerja, perencanaan karir, dan pelatihan yang terarah.",
    items: ["Performance management", "Individual Development Plan", "LMS"],
  },
  {
    id: "administrasi",
    title: "Administrasi HR",
    desc: "Kelola seluruh administrasi HR perusahaan multi cabang, holding, dan multinasional dari satu platform.",
    items: ["Survei karyawan", "Onboarding & offboarding", "Manajemen akses & aset"],
  },
];

const FeaturesSection = () => {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-left md:text-center">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl lg:text-4xl">
            Visibilitas dan kontrol bisnis untuk Business Owner
          </h2>
          <p className="text-muted-foreground">
            SDM, CRM, manajemen proyek, media sosial, dan iklan terintegrasi dalam satu platform.
            Pantau performance, produktivitas, dan kepatuhan, lalu ambil keputusan lebih cepat tanpa tenggelam dalam
            detail operasional harian.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <div className="relative px-10 sm:px-12">
            <CarouselContent>
              {features.map((f) => (
                <CarouselItem key={f.title} className="basis-[88%] sm:basis-[420px] md:basis-1/2 lg:basis-1/3">
                  <div className="h-full rounded-xl border border-primary/20 bg-card p-6 transition-shadow hover:shadow-lg">
                    <div className="mb-5 h-32 w-full overflow-hidden rounded-lg">
                      <FeatureIllustration id={f.id} className="h-full w-full" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">{f.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground">{f.desc}</p>
                    <ul className="space-y-2">
                      {f.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 border-primary/20 bg-background shadow-sm hover:bg-muted" />
            <CarouselNext className="right-0 border-primary/20 bg-background shadow-sm hover:bg-muted" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturesSection;
