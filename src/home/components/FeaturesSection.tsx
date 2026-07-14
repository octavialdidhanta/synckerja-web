import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!carouselApi) return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    let timer: ReturnType<typeof setInterval> | undefined;

    const stopAutoplay = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (!mobileQuery.matches) return;
      timer = setInterval(() => {
        carouselApi.scrollNext();
      }, 2000);
    };

    startAutoplay();
    mobileQuery.addEventListener("change", startAutoplay);

    return () => {
      mobileQuery.removeEventListener("change", startAutoplay);
      stopAutoplay();
    };
  }, [carouselApi]);

  return (
    <section className="bg-background pt-12 pb-6 md:pt-16 lg:pt-24 lg:pb-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-3xl text-left md:mb-10 md:text-center">
          <h2 className="mb-4 text-2xl font-extrabold text-foreground md:text-3xl lg:text-4xl">
            Visibilitas dan kontrol bisnis untuk Business Owner
          </h2>
          <p className="text-muted-foreground">
            SDM, CRM, manajemen proyek, media sosial, dan iklan terintegrasi dalam satu platform.
            Pantau performance, produktivitas, dan kepatuhan, lalu ambil keputusan lebih cepat tanpa tenggelam dalam
            detail operasional harian.
          </p>
        </div>
      </div>

      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full md:container md:mx-auto md:px-4"
      >
        <div>
          <CarouselContent className="ml-0 md:-ml-4">
            {features.map((f) => (
              <CarouselItem
                key={f.title}
                className="basis-[88%] pl-2 first:pl-3 last:pr-3 sm:basis-[400px] md:basis-1/2 md:pl-3 lg:basis-1/3"
              >
                <div className="h-full rounded-xl border border-primary/20 bg-card p-4 transition-shadow hover:shadow-lg md:p-5">
                  <div className="mb-3 h-28 w-full overflow-hidden rounded-lg md:mb-4 md:h-32">
                    <FeatureIllustration id={f.id} className="h-full w-full" />
                  </div>
                  <h3 className="mb-1.5 text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{f.desc}</p>
                  <ul className="space-y-1.5">
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
          <div className="mt-2 flex items-center justify-center gap-2 px-3">
            <CarouselPrevious className="static left-auto top-auto h-8 w-8 translate-x-0 translate-y-0 rounded-full border-primary/20 bg-background shadow-sm hover:bg-muted" />
            <CarouselNext className="static right-auto top-auto h-8 w-8 translate-x-0 translate-y-0 rounded-full border-primary/20 bg-background shadow-sm hover:bg-muted" />
          </div>
        </div>
      </Carousel>
    </section>
  );
};

export default FeaturesSection;
