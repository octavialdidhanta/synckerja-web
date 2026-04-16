import Navbar from "@/home/components/Navbar";
import HeroSection from "@/home/components/HeroSection";
import FeaturesSection from "@/home/components/FeaturesSection";
import WhyChooseSection from "@/home/components/WhyChooseSection";
import CaseStudiesSection from "@/home/components/CaseStudiesSection";
import FAQSection from "@/home/components/FAQSection";
import FooterSection from "@/home/components/FooterSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WhyChooseSection />
      <CaseStudiesSection />
      <FAQSection />
      <FooterSection />
    </div>
  );
};

export default Index;
