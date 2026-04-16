import { Suspense, lazy } from "react";
import Navbar from "@/home/components/Navbar";
import HeroSection from "@/home/components/HeroSection";

const FeaturesSection = lazy(() => import("@/home/components/FeaturesSection"));
const WhyChooseSection = lazy(() => import("@/home/components/WhyChooseSection"));
const CaseStudiesSection = lazy(() => import("@/home/components/CaseStudiesSection"));
const FAQSection = lazy(() => import("@/home/components/FAQSection"));
const FooterSection = lazy(() => import("@/home/components/FooterSection"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={null}>
          <FeaturesSection />
          <WhyChooseSection />
          <CaseStudiesSection />
          <FAQSection />
          <FooterSection />
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
