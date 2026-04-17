import { trackWaBlueCta } from "../analytics";

const WaBlueClosingCta = () => {
  return (
    <section className="container mx-auto px-4 pb-16">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-xl md:px-12 md:py-12">
        <div className="pointer-events-none absolute bottom-0 right-0 h-2 w-40 rounded-tl-md bg-[#FFC107]" aria-hidden />
        <div className="relative grid gap-8 md:grid-cols-[minmax(0,1.2fr)_auto] md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Saatnya tampil sebagai brand resmi, bukan nomor acak</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-primary-foreground/90 md:text-base">
              Mulai dari perbaikan profil, penyelarasan domain, hingga strategi komunikasi pasca-verifikasi. Synckerja Office
              membantu Anda memindahkan diskusi dari “apakah ini aman?” ke “berapa dan kapan mulai?”
            </p>
          </div>
          <a
            href="https://office.synckerja.com/register"
            onClick={() => trackWaBlueCta("coba_gratis", "wa_blue_closing_banner")}
            className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-3 text-sm font-semibold text-primary shadow-sm transition-opacity hover:opacity-95 md:text-base"
          >
            Coba gratis
          </a>
        </div>
      </div>
    </section>
  );
};

export default WaBlueClosingCta;
