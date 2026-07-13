import { Suspense, lazy } from "react";
import Navbar from "@/home/components/Navbar";
import HeroSection from "@/home/components/HeroSection";
import { DEFAULT_PAGE_TITLE } from "@/home/constants/legal";
import { useDocumentTitle } from "@/home/hooks/useDocumentTitle";

const HomeBelowFold = lazy(() => import("@/home/pages/HomeBelowFold"));

const Index = () => {
  useDocumentTitle(DEFAULT_PAGE_TITLE);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <Suspense fallback={null}>
          <HomeBelowFold />
        </Suspense>
      </main>
    </div>
  );
};

export default Index;
