import { trackWaBlueCta } from "../analytics";

const WaBlueHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-secondary/40 via-background to-background">
      <div className="container mx-auto px-4 pb-10 pt-10 text-center md:pb-14 md:pt-14 lg:pb-16 lg:pt-16">
        <div className="mx-auto mb-6 inline-flex max-w-full">
          <span className="rounded-full bg-gradient-to-r from-primary to-primary/80 px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm md:text-sm">
            Jalur verifikasi resmi WhatsApp — prioritas kepercayaan merek di Indonesia
          </span>
        </div>
        <h1 className="mx-auto max-w-4xl text-balance text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-[2.65rem] lg:leading-[1.12]">
          Pelanggan ragu membalas nomor asing? Tampilkan identitas resmi lewat centang biru WhatsApp
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          Banyak bisnis kehilangan percakapan bernilai karena profil terlihat “nomor pribadi”. Lewat Synckerja Office, Anda
          merapikan identitas WhatsApp Business, menyiapkan bukti legalitas, dan berjalan menuju status terverifikasi
          Meta—agar pelanggan yakin mereka sedang berbicara dengan entitas yang benar, bukan akun acak.
        </p>
        <div className="mx-auto mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#"
            onClick={() => trackWaBlueCta("whatsapp_sales", "wa_blue_hero_primary")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 md:text-base"
          >
            <span aria-hidden>💬</span>
            WhatsApp sales
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
      <div className="container mx-auto px-4">
        <div className="mx-auto h-3 max-w-5xl rounded-t-2xl bg-primary shadow-[0_-8px_40px_-18px_hsl(var(--primary)/0.55)]" aria-hidden />
      </div>
    </section>
  );
};

export default WaBlueHero;
