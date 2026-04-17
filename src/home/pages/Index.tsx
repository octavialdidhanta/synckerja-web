import { Suspense, lazy } from "react";
import Navbar from "@/home/components/Navbar";
import HeroSection from "@/home/components/HeroSection";

const HomeBelowFold = lazy(() => import("@/home/pages/HomeBelowFold"));

const Index = () => {
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
