import { ArrowRight } from "lucide-react";
import { trackWaBlueCta } from "../analytics";

const stats = [
  { value: "72%", label: "lebih sedikit pertanyaan “ini siapa?”" },
  { value: "4.6", label: "skor kepuasan pelanggan (internal)" },
  { value: "2.1×", label: "balasan bernilai dalam 24 jam" },
] as const;

const WaBlueTestimonial = () => {
  return (
    <section className="bg-gradient-to-br from-primary/[0.06] via-background to-secondary/40 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Cerita mitra</p>
        <h2 className="mt-3 max-w-3xl text-2xl font-extrabold leading-snug text-foreground md:text-3xl">
          Profil resmi mengurangi keraguan pelanggan
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">
          Percakapan lebih cepat sampai transaksi.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-stretch lg:gap-8">
          <div className="flex flex-col justify-between gap-6 rounded-2xl bg-primary p-6 text-primary-foreground shadow-md md:p-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="border-b border-primary-foreground/15 pb-5 last:border-b-0 last:pb-0">
                <p className="text-3xl font-extrabold md:text-4xl">
                  <span className="text-[#FFC107]">{value}</span>
                </p>
                <p className="mt-1 text-sm text-primary-foreground/85">{label}</p>
              </div>
            ))}
          </div>

          <article className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1">
                <span className="size-2 rounded-full bg-accent" aria-hidden />
                <span className="text-xs font-semibold text-primary">Hasil implementasi</span>
              </div>
              <blockquote className="text-base leading-relaxed text-foreground md:text-lg">
                &ldquo;Kami sempat stuck: tim sales aktif di WhatsApp, tapi pelanggan enggan melanjutkan pembayaran karena
                profil terasa tidak resmi. Setelah alur verifikasi melalui Synckerja Office berjalan, percakapan bergerak
                lebih cepat ke detail transaksi, bukan debat legitimasi.&rdquo;
              </blockquote>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div>
                  <p className="font-bold text-foreground">Aira Maharani</p>
                  <p className="text-sm text-muted-foreground">COO, Nusantara Retail Hub</p>
                </div>
                <span className="rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Mitra Synckerja Office
                </span>
              </div>

              <a
                href="#"
                onClick={() => trackWaBlueCta("baca_cerita_implementasi", "wa_blue_testimonial")}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Baca cerita implementasi
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default WaBlueTestimonial;
