import waBlueHero from "../assets/wa-blue-hero.svg";
import { trackWaBlueCta } from "../analytics";

const WaBlueHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
      <div className="container mx-auto px-4 pb-10 pt-10 md:pb-14 md:pt-14 lg:pb-16 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="text-center lg:text-left">
            <div className="mb-6 inline-flex max-w-full">
              <span className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm md:text-sm">
                Pendampingan verifikasi centang biru WhatsApp — dari dokumen sampai persetujuan Meta
              </span>
            </div>
            <h1 className="mx-auto max-w-4xl text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:mx-0 lg:text-[2.65rem] lg:leading-[1.12]">
              <span className="block">Pelanggan ragu balas nomor asing?</span>
              <span className="mt-2 block text-primary md:mt-2.5">
                Tampilkan identitas resmi lewat centang biru WhatsApp
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg lg:mx-0">
              Banyak bisnis kehilangan chat penting karena nomornya terlihat seperti nomor pribadi. Synckerja Office bantu
              rapikan profil WhatsApp Business, lengkapi syarat verifikasi, dan dampingi proses ke Meta supaya pelanggan yakin
              bicara dengan bisnis Anda, bukan akun sembarangan.
            </p>
            <div className="mx-auto mt-9 flex flex-wrap items-center justify-center gap-3 lg:mx-0 lg:justify-start">
              <a
                href="#"
                onClick={() => trackWaBlueCta("whatsapp_sales", "wa_blue_hero_primary")}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 md:text-base"
              >
                <span aria-hidden>💬</span>
                Konsultasi verifikasi
              </a>
              <a
                href="https://office.synckerja.com/register"
                onClick={() => trackWaBlueCta("coba_gratis", "wa_blue_hero_secondary")}
                className="inline-flex items-center justify-center rounded-lg border-2 border-primary bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary md:text-base"
              >
                Coba gratis
              </a>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <img
              src={waBlueHero}
              alt="Ilustrasi profil WhatsApp Business Bisnis Anda dengan centang biru verifikasi resmi"
              width={520}
              height={480}
              sizes="(max-width: 1023px) min(100%, 400px), 480px"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="relative z-10 mx-auto h-auto w-full max-w-[min(100%,480px)]"
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="mx-auto h-3 max-w-5xl rounded-t-2xl bg-primary shadow-[0_-8px_40px_-18px_hsl(var(--primary)/0.55)]" aria-hidden />
      </div>
    </section>
  );
};

export default WaBlueHero;
