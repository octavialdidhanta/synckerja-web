import { CheckCircle } from "lucide-react";
import heroPerson from "@/home/assets/hero-person.webp";
import { gtmPush } from "@/share/analytics/gtm";

const HeroSection = () => {
  return (
    <section className="hero-gradient">
      <div className="container mx-auto px-4 py-5 md:py-8 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <h1 className="mb-6 text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-[1.12]">
              <span className="block">
                Satu sistem untuk seluruh&nbsp;siklus&nbsp;SDM
              </span>
              <span className="mt-2 block md:mt-2.5">
                <span className="text-muted-foreground"></span>
                Lebih rapi, lebih cepat, lebih terukur
              </span>
            </h1>
            <ul className="space-y-3 mb-8">
              {[
                "Insight & bantuan AI agar tim HR fokus pada prioritas bisnis, bukan hanya laporan",
                "Otomatisasi alur administrasi sehari-hari sehingga pekerjaan manual turun drastis",
                "Kurangi pekerjaan ulang (duplikasi data, form, approval) di seluruh modul HR",
                "Manajemen proyek dan media sosial berbasis AI untuk kolaborasi tim yang terarah",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mb-8">
              <a
                href="#"
                onClick={() => gtmPush({ event: "cta_click", cta: "whatsapp_sales", placement: "hero" })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                💬 WhatsApp sales
              </a>
              <a
                href="https://office.synckerja.com/register"
                onClick={() => gtmPush({ event: "cta_click", cta: "coba_gratis", placement: "hero" })}
                className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
              >
                Coba gratis
              </a>
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center relative">
            <img
              src={heroPerson}
              alt="Professional menggunakan Synckerja Office"
              width={500}
              height={500}
              sizes="(max-width: 1023px) 92vw, 480px"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative z-10 mx-auto h-auto max-w-[min(100%,480px)] w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
