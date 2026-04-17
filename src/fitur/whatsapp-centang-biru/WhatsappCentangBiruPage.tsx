import { Suspense, lazy, useEffect } from "react";
import Navbar from "@/home/components/Navbar";

const FooterSection = lazy(() => import("@/home/components/FooterSection"));
import WaBlueHero from "./sections/WaBlueHero";
import WaBlueProofStat from "./sections/WaBlueProofStat";
import WaBlueTrustCards from "./sections/WaBlueTrustCards";
import WaBlueTabShowcase from "./sections/WaBlueTabShowcase";
import WaBlueWhyOffice from "./sections/WaBlueWhyOffice";
import WaBlueTestimonial from "./sections/WaBlueTestimonial";
import WaBlueFaq from "./sections/WaBlueFaq";
import WaBlueClosingCta from "./sections/WaBlueClosingCta";

const PAGE_TITLE = "Centang Biru WhatsApp (Verified) — Synckerja Office";

const WhatsappCentangBiruPage = () => {
  useEffect(() => {
    const previous = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <WaBlueHero />
        <WaBlueProofStat />
        <WaBlueTrustCards />
        <WaBlueTabShowcase />
        <WaBlueWhyOffice />
        <WaBlueTestimonial />
        <WaBlueFaq />
        <WaBlueClosingCta />
      </main>
      <Suspense fallback={null}>
        <FooterSection />
      </Suspense>
    </div>
  );
};

export default WhatsappCentangBiruPage;
