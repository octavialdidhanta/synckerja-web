import { BadgeCheck, LineChart, ShieldAlert } from "lucide-react";
import { trackWaBlueCta } from "../analytics";

const cards = [
  {
    title: "Otoritas yang terbaca dalam detik",
    body: "Centang biru mempercepat jawaban pertanyaan mendasar: “Ini benar perusahaannya?” Tanpa tanda itu, pelanggan sering menunda atau memindahkan ke channel lain.",
    icon: BadgeCheck,
  },
  {
    title: "Kampanye terasa seperti komunikasi resmi",
    body: "Pesan promosi dari entitas terverifikasi cenderung dibaca sebagai informasi bisnis, bukan gangguan nomor tidak dikenal—mengurangi gesekan psikologis di awal percakapan.",
    icon: LineChart,
  },
  {
    title: "Tekanan reputasi turun, ritme tim naik",
    body: "Profil rapi + status verifikasi menurunkan curiga spam. Tim CS dan sales menghabiskan energi untuk menjual dan menyelesaikan tiket, bukan membuktikan legitimasi berulang kali.",
    icon: ShieldAlert,
  },
];

const WaBlueTrustCards = () => {
  return (
    <section className="section-warm py-14 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
          <h2 className="text-2xl font-extrabold text-foreground md:text-3xl">
            Bangun bisnis yang terasa “ada bendara” di WhatsApp
          </h2>
          <p className="mt-4 text-muted-foreground">
            Synckerja Office memosisikan WhatsApp sebagai saluran premium: identitas jelas, alur verifikasi terdokumentasi,
            dan pengalaman pelanggan yang konsisten dari pesan pertama hingga penyelesaian masalah.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6">
          {cards.map(({ title, body, icon: Icon }) => (
            <article
              key={title}
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md md:rounded-2xl md:p-6"
            >
              <div className="mb-2 flex items-center gap-3 md:mb-4">
                <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-6" strokeWidth={1.75} />
                </span>
                <span className="size-2 rounded-full bg-accent" aria-hidden />
              </div>
              <h3 className="text-lg font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:mt-3">{body}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-8 flex flex-wrap justify-center gap-3 md:mt-12">
          <a
            href="#"
            onClick={() => trackWaBlueCta("whatsapp_sales", "wa_blue_trust_cards")}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <span aria-hidden>💬</span>
            WhatsApp sales
          </a>
          <a
            href="https://office.synckerja.com/register"
            onClick={() => trackWaBlueCta("coba_gratis", "wa_blue_trust_cards")}
            className="inline-flex items-center justify-center rounded-lg border-2 border-primary bg-background px-6 py-3 text-sm font-semibold text-primary hover:bg-secondary"
          >
            Coba gratis
          </a>
        </div>
      </div>
    </section>
  );
};

export default WaBlueTrustCards;
