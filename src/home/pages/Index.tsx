import { Suspense, lazy } from "react";
import Navbar from "@/home/components/Navbar";
import HeroSection from "@/home/components/HeroSection";
import DeferredRender from "@/home/components/DeferredRender";

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
          <DeferredRender>
            <FeaturesSection />
          </DeferredRender>
          <DeferredRender>
            <WhyChooseSection />
          </DeferredRender>
          <DeferredRender>
            <CaseStudiesSection />
          </DeferredRender>
          <DeferredRender>
            <FAQSection />
          </DeferredRender>
          <DeferredRender>
            <FooterSection />
          </DeferredRender>
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
