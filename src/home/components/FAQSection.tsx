import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Synckerja Office membantu owner menyelesaikan masalah apa?",
    a: "Mengontrol biaya tenaga kerja, merapikan absensi/cuti/lembur, mempercepat payroll, dan memberi visibilitas lintas cabang—supaya Anda bisa ambil keputusan cepat berbasis data.",
  },
  {
    q: "Bisnis seperti apa yang paling cocok memakai Synckerja Office?",
    a: "Cocok untuk bisnis bertumbuh (tim puluhan–ribuan), multi-shift atau multi-cabang, yang butuh kontrol disiplin, produktivitas, dan biaya payroll tanpa menambah beban admin.",
  },
  {
    q: "Bagaimana keamanan data dan kontrol aksesnya?",
    a: "Akses bisa diatur per peran (role-based) dan aktivitas penting tercatat (audit trail). Ini menjaga data sensitif (karyawan & payroll) tetap aman dan mudah ditelusuri saat dibutuhkan.",
  },
  {
    q: "Berapa lama onboarding sampai bisa dipakai tim?",
    a: "Tergantung kompleksitas (cabang, shift, komponen gaji, kebijakan). Biasanya bisa mulai dari kebutuhan dasar lebih dulu, lalu ditingkatkan bertahap dengan pendampingan tanpa mengganggu operasional.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 lg:py-24 bg-muted">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-10">
          Pertanyaan yang sering ditanyakan business owner
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
