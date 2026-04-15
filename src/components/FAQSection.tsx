import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Apa itu Synckerja Office?",
    a: "Synckerja Office adalah software HRIS berbasis cloud yang membantu perusahaan mengelola proses manajemen sumber daya manusia dalam satu sistem terintegrasi, mulai dari administrasi karyawan, absensi, hingga penggajian dan pengembangan karyawan.",
  },
  {
    q: "Perusahaan seperti apa yang cocok menggunakan Synckerja Office?",
    a: "Synckerja Office cocok untuk perusahaan dari berbagai skala dan industri, mulai dari startup hingga enterprise, yang ingin mengotomasi dan menyederhanakan proses HR mereka.",
  },
  {
    q: "Apakah Synckerja Office dapat terintegrasi dengan sistem lain?",
    a: "Ya, Synckerja Office terintegrasi dengan berbagai solusi dan juga mendukung integrasi dengan sistem pihak ketiga melalui API.",
  },
  {
    q: "Bagaimana Synckerja Office mengelola keamanan data perusahaan?",
    a: "Synckerja Office menggunakan standar keamanan internasional termasuk sertifikasi ISO 27001 dan menyimpan data di pusat data lokal Indonesia.",
  },
  {
    q: "Bagaimana cara memulai penggunaan Synckerja Office?",
    a: "Anda bisa memulai dengan mendaftar untuk uji coba gratis atau menghubungi tim sales kami untuk konsultasi kebutuhan HR perusahaan Anda.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-10">
          Saya punya pertanyaan mengenai Synckerja Office
        </h2>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border last:border-b-0">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-foreground">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
