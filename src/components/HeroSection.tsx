import { CheckCircle } from "lucide-react";
import heroPerson from "@/assets/hero-person.webp";

const HeroSection = () => {
  return (
    <section className="hero-gradient">
      <div className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <span className="inline-block text-accent text-sm font-semibold mb-4">#1 Software HR di Indonesia</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-6">
              Solusi HCM terintegrasi untuk efisiensi pengelolaan SDM
            </h1>
            <ul className="space-y-3 mb-8">
              {[
                "Dukungan AI untuk keputusan strategis yang lebih cepat",
                "Kurangi beban kerja administratif HR hingga 90%",
                "Patuh regulasi Indonesia, siap untuk operasional skala besar",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3 mb-8">
              <a href="#" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity">
                💬 WhatsApp sales
              </a>
              <a href="#" className="px-6 py-3 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors">
                Coba gratis
              </a>
            </div>
            {/* Ratings */}
            <div className="flex flex-wrap gap-4">
              {[
                { name: "G2", score: "4.8" },
                { name: "Capterra", score: "4.7" },
                { name: "GetApp", score: "4.7" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-2 bg-background rounded-lg px-4 py-2 border border-border">
                  <span className="text-sm font-bold text-foreground">⭐ {r.score}</span>
                  <span className="text-xs text-muted-foreground">{r.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex justify-center relative">
            <img src={heroPerson} alt="Professional menggunakan Synckerja Office" width={500} height={500} className="relative z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
