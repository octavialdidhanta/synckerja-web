import { MessageCircle } from "lucide-react";
import { trackWaBlueCta } from "../analytics";

const WaBlueClosingCta = () => {
  return (
    <section className="border-t-4 border-primary bg-gradient-to-b from-secondary/25 to-background py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Langkah berikutnya</p>
            <h2 className="mt-3 max-w-2xl text-2xl font-extrabold leading-snug text-foreground md:text-3xl">
              Saatnya tampil sebagai brand resmi, bukan nomor acak
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Mulai dari perbaikan profil, penyelarasan domain, hingga strategi komunikasi pasca verifikasi. Synckerja Office
              bantu Anda pindahkan diskusi dari &ldquo;apakah ini aman?&rdquo; ke &ldquo;berapa dan kapan mulai?&rdquo;
            </p>
          </div>

          <div className="flex flex-col gap-4 border-border lg:border-l lg:pl-10">
            <a
              href="#"
              onClick={() => trackWaBlueCta("hubungi_sales", "wa_blue_closing_banner")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 md:text-base"
            >
              <MessageCircle className="size-5" strokeWidth={2} aria-hidden />
              hubungi Sales
            </a>
            <p className="text-center text-xs text-muted-foreground lg:text-left">
              Tim kami bantu cek kelayakan verifikasi WhatsApp bisnis Anda
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaBlueClosingCta;
