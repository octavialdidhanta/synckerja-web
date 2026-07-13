import { CheckCircle } from "lucide-react";
import heroPlatform from "@/home/assets/hero-platform.webp";
import { gtmPush } from "@/share/analytics/gtm";

const HeroSection = () => {
  return (
    <section className="hero-gradient">
      <div className="container mx-auto px-4 py-5 md:py-8 lg:py-14">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-5xl lg:leading-[1.12]">
              Satu sistem untuk tim penjualan, dan operasional bisnis.
            </h1>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              SDM, CRM, manajemen proyek, media sosial, dan iklan, semua dalam satu platform
            </p>
            <p className="mt-2 text-sm font-medium text-primary md:text-base">
              Lebih rapi, lebih cepat, lebih terukur
            </p>
            <ul className="mb-8 mt-6 space-y-3">
              {[
                "CRM terintegrasi: lacak pelanggan dan pipeline sales dalam satu dashboard",
                "Kelola proyek, media sosial, dan iklan tanpa pindah-pindah tools",
                "SDM dan administrasi tim dalam sistem yang sama",
                "Pantau performa tim dan operasional dari satu dashboard",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mb-8 flex flex-wrap gap-3">
              <a
                href="#"
                onClick={() => gtmPush({ event: "cta_click", cta: "whatsapp_sales", placement: "hero" })}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground transition-opacity hover:opacity-90"
              >
                💬 WhatsApp sales
              </a>
              <a
                href="https://office.synckerja.com/register"
                onClick={() => gtmPush({ event: "cta_click", cta: "coba_gratis", placement: "hero" })}
                className="rounded-lg border border-border px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Coba gratis
              </a>
            </div>
          </div>

          <div className="relative flex justify-center">
            <img
              src={heroPlatform}
              alt="Dashboard Synckerja Office untuk SDM, CRM, proyek, media sosial, dan iklan terintegrasi"
              width={520}
              height={480}
              sizes="(max-width: 1023px) 92vw, 480px"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative z-10 mx-auto h-auto w-full max-w-[min(100%,480px)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
