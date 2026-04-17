import DeferredRender from "@/home/components/DeferredRender";
import CaseStudiesSection from "@/home/components/CaseStudiesSection";
import FAQSection from "@/home/components/FAQSection";
import FeaturesSection from "@/home/components/FeaturesSection";
import FooterSection from "@/home/components/FooterSection";
import WhyChooseSection from "@/home/components/WhyChooseSection";

/**
 * Satu chunk dinamis untuk seluruh konten bawah liputan beranda.
 * Mengurangi rantai permintaan kritis dibanding banyak `React.lazy` terpisah.
 */
export default function HomeBelowFold() {
  return (
    <>
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
    </>
  );
}
