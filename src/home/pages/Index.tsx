import { Suspense, lazy } from "react";
import Navbar from "@/home/components/Navbar";
import HeroSection from "@/home/components/HeroSection";
import { APP_NAME } from "@/home/constants/legal";
import { useDocumentTitle } from "@/home/hooks/useDocumentTitle";

const HomeBelowFold = lazy(() => import("@/home/pages/HomeBelowFold"));

const Index = () => {
  useDocumentTitle(APP_NAME);

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
