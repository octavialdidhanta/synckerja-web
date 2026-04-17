import { trackWaBlueCta } from "../analytics";

const WaBlueTestimonial = () => {
  return (
    <section className="bg-[hsl(45_78%_96%)] py-14 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="max-w-3xl text-2xl font-extrabold text-foreground md:text-3xl">
          Dari keraguan nomor asing menuju percakapan yang diperlakukan serius
        </h2>
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 shadow-lg md:p-10">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-foreground/90 via-primary/40 to-secondary" />
            </div>
            <div>
              <div className="grid grid-cols-3 gap-4 border-b border-border pb-8">
                <div>
                  <p className="text-3xl font-extrabold text-accent md:text-4xl">72%</p>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">lebih sedikit pertanyaan “ini siapa?”</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-accent md:text-4xl">4.6</p>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">skor kepuasan pelanggan (internal)</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-accent md:text-4xl">2.1×</p>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">balasan bernilai dalam 24 jam</p>
                </div>
              </div>
              <blockquote className="mt-8 text-base leading-relaxed text-foreground md:text-lg">
                “Kami sempat stuck: tim sales aktif di WhatsApp, tapi pelanggan enggan melanjutkan pembayaran karena profil
                terasa tidak resmi. Setelah alur verifikasi melalui Synckerja Office berjalan, percakapan bergerak lebih
                cepat ke detail transaksi—bukan debat legitimasi.”
              </blockquote>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-foreground">Aira Maharani</p>
                  <p className="text-sm text-muted-foreground">COO, Nusantara Retail Hub</p>
                </div>
                <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  Mitra implementasi Synckerja Office
                </p>
              </div>
              <a
                href="#"
                onClick={() => trackWaBlueCta("baca_cerita_implementasi", "wa_blue_testimonial")}
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Baca cerita implementasi →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaBlueTestimonial;
