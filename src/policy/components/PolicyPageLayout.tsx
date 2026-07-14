import { Suspense, lazy, type ReactNode } from "react";
import Navbar from "@/home/components/Navbar";

const FooterSection = lazy(() => import("@/home/components/FooterSection"));

type PolicyPageLayoutProps = {
  children: ReactNode;
};

const PolicyPageLayout = ({ children }: PolicyPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
      <Suspense fallback={null}>
        <FooterSection />
      </Suspense>
    </div>
  );
};

export default PolicyPageLayout;
