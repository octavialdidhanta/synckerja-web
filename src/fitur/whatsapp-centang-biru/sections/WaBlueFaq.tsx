import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/share/ui/accordion";
import { trackWaBlueFaq } from "../analytics";

const faqs = [
  {
    id: "definisi",
    q: "Apa yang dimaksud centang biru di WhatsApp Business?",
    a: "Itu adalah sinyal verifikasi bahwa nama brand, domain, dan entitas legal telah melewati pemeriksaan Meta. Bagi pelanggan, ini jawaban cepat atas pertanyaan mendasar: apakah percakapan ini resmi dari perusahaan yang dimaksud.",
  },
  {
    id: "beda",
    q: "Kenapa ini berbeda dari sekadar logo dan bio yang rapi?",
    a: "Bio yang rapi membantu estetika, tetapi tidak menggantikan bukti otoritas. Centang biru menghubungkan identitas visual dengan proses legal/organisasi—sehingga pelanggan tidak perlu “percaya saja” pada nomor yang tidak dikenal.",
  },
  {
    id: "masalah",
    q: "Masalah bisnis apa yang paling sering muncul sebelum verifikasi?",
    a: "Percakapan terhenti di tahap verifikasi manual: screenshot website, surat pernyataan berulang, atau pindah ke email. Akibatnya, waktu respon panjang dan peluang hilang saat pelanggan mencari alternatif yang terasa lebih aman.",
  },
  {
    id: "peran_synckerja",
    q: "Apa peran Synckerja Office dalam perjalanan ini?",
    a: "Kami membantu Anda merapikan fondasi identitas bisnis di WhatsApp—nama tampilan, kategori, bukti kepemilikan domain, dan konsistensi data—agar pengajuan tidak berulang karena detail kecil yang terlewat.",
  },
  {
    id: "siapa_cocok",
    q: "Siapa yang paling mendapatkan dampak positif?",
    a: "Brand yang menjual nominal besar, layanan berlangganan, atau dukungan purnajual: tempat di mana kepercayaan awal menentukan apakah pelanggan melanjutkan atau berhenti di pesan pertama.",
  },
  {
    id: "durasi",
    q: "Berapa lama biasanya prosesnya berjalan?",
    a: "Durasi bergantung pada kelengkapan dokumen dan kejelasan kepemilikan merek. Yang penting, tim Anda memiliki panduan langkah demi langkah sehingga tidak membuang minggu hanya menebak format pengajuan.",
  },
  {
    id: "ditolak",
    q: "Bagaimana jika pengajuan ditolak?",
    a: "Penolakan biasanya menyertakan alasan teknis. Synckerja Office membantu menafsirkan feedback Meta, memperbaiki bukti yang lemah, dan mengajukan ulang dengan perubahan yang terukur—bukan sekadar mengirimkan ulang file yang sama.",
  },
];

const WaBlueFaq = () => {
  return (
    <section className="bg-background py-14 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="max-w-3xl text-2xl font-extrabold text-foreground md:text-3xl">
          FAQ seputar verifikasi centang biru WhatsApp bersama Synckerja Office
        </h2>
        <div className="mx-auto mt-10 max-w-3xl">
          <Accordion
            type="single"
            collapsible
            defaultValue={faqs[0].id}
            onValueChange={(value) => {
              if (!value) return;
              trackWaBlueFaq(value);
            }}
            className="rounded-xl border border-border bg-card"
          >
            {faqs.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-b border-border px-4 last:border-b-0 md:px-6">
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default WaBlueFaq;
