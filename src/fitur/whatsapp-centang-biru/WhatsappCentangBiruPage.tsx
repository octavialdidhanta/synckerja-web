import { Suspense, lazy } from "react";
import Navbar from "@/home/components/Navbar";
import { APP_NAME } from "@/home/constants/legal";
import { useDocumentTitle } from "@/home/hooks/useDocumentTitle";

const FooterSection = lazy(() => import("@/home/components/FooterSection"));
import WaBlueHero from "./sections/WaBlueHero";
import WaBlueProofStat from "./sections/WaBlueProofStat";
import WaBlueTrustCards from "./sections/WaBlueTrustCards";
import WaBlueTabShowcase from "./sections/WaBlueTabShowcase";
import WaBlueWhyOffice from "./sections/WaBlueWhyOffice";
import WaBlueTestimonial from "./sections/WaBlueTestimonial";
import WaBlueFaq from "./sections/WaBlueFaq";
import WaBlueClosingCta from "./sections/WaBlueClosingCta";

const PAGE_TITLE = `Centang Biru WhatsApp: ${APP_NAME}`;

const WhatsappCentangBiruPage = () => {
  useDocumentTitle(PAGE_TITLE);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <WaBlueHero />
        <WaBlueTrustCards />
        <WaBlueTabShowcase />
        <WaBlueWhyOffice />
        <WaBlueTestimonial />
        <WaBlueProofStat />
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
