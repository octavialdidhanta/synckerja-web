import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Synckerja Office membantu owner menyelesaikan masalah apa?",
    a: "Mengontrol biaya tenaga kerja, merapikan absensi/cuti/lembur, mempercepat payroll, dan memberi visibilitas lintas cabang—supaya Anda bisa ambil keputusan cepat berbasis data. Plus modul digital: CRM, media sosial, dan iklan.",
  },
  {
    q: "Apakah Synckerja terhubung dengan Facebook dan Instagram (Meta)?",
    a: "Ya. Klien bisnis menghubungkan Facebook Page dan akun Instagram profesional mereka sendiri melalui Meta login di aplikasi Synckerja Office. Dengan izin klien, platform dipakai untuk menampilkan akun terhubung, publikasi/jadwal konten (termasuk Reels), serta fitur pesan/engagement yang diaktifkan. Synckerja bertindak atas nama klien yang memberi otorisasi dan tidak menjual Platform Data Meta.",
  },
  {
    q: "Bisnis seperti apa yang paling cocok memakai Synckerja Office?",
    a: "Cocok untuk bisnis bertumbuh (tim puluhan–ribuan), multi-shift atau multi-cabang, yang butuh kontrol disiplin, produktivitas, dan biaya payroll tanpa menambah beban admin—sekaligus menyatukan CRM dan kanal digital.",
  },
  {
    q: "Bagaimana keamanan data dan kontrol aksesnya?",
    a: "Akses bisa diatur per peran (role-based) dan aktivitas penting tercatat (audit trail). Ini menjaga data sensitif (karyawan & payroll) tetap aman dan mudah ditelusuri saat dibutuhkan. Integrasi Meta hanya memakai data yang diizinkan klien untuk layanan yang mereka aktifkan.",
  },
  {
    q: "Berapa lama onboarding sampai bisa dipakai tim?",
    a: "Tergantung kompleksitas (cabang, shift, komponen gaji, kebijakan). Biasanya bisa mulai dari kebutuhan dasar lebih dulu, lalu ditingkatkan bertahap dengan pendampingan tanpa mengganggu operasional.",
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-muted py-14 lg:py-20">
      <div className="container mx-auto w-full px-4">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-2 text-xl font-bold text-foreground md:text-2xl">
            Pertanyaan yang sering ditanyakan business owner
          </h2>
        </div>
        <div className="w-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-border/50 last:border-b-0">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6 md:px-8"
              >
                <span className="font-semibold text-foreground">{faq.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6 md:px-8">
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
