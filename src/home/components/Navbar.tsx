import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X, Globe } from "lucide-react";
import logoUrl from "@/home/assets/pwa-192.png";
import { gtmPush } from "@/share/analytics/gtm";
import { FiturMegaMenuDesktop, FiturMegaMenuMobile } from "@/home/components/FiturMegaMenu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fiturMobileOpen, setFiturMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex min-h-16 items-center justify-between gap-2 px-2 py-2.5 md:gap-3 md:px-4">
        {/* Logo */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 lg:flex-initial">
          <img src={logoUrl} alt="" width={36} height={36} className="size-9 shrink-0 rounded-md object-contain md:size-12" />
          <div className="min-w-0">
            <p className="text-[15px] md:text-lg font-semibold leading-none text-foreground">
              Synckerja Office
            </p>
            <p className="mt-0 text-[9.5px] md:text-[11px] font-normal leading-tight text-muted-foreground sm:text-xs lg:text-[0.8125rem]">
              Measuring Performance, Connecting Progress
            </p>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <Link
            to="/"
            onClick={() => gtmPush({ event: "nav_click", item: "home", placement: "navbar_desktop" })}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <FiturMegaMenuDesktop />
          <a
            href="#solusi"
            onClick={() => gtmPush({ event: "nav_click", item: "solusi", placement: "navbar_desktop" })}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Solusi ▾
          </a>
          <a
            href="#harga"
            onClick={() => gtmPush({ event: "nav_click", item: "harga", placement: "navbar_desktop" })}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Harga
          </a>
          <a
            href="#resources"
            onClick={() => gtmPush({ event: "nav_click", item: "resources", placement: "navbar_desktop" })}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            Resources ▾
          </a>
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            className="flex items-center gap-1 text-sm text-muted-foreground"
            onClick={() => gtmPush({ event: "cta_click", cta: "language_switch", placement: "navbar_desktop" })}
          >
            <Globe className="w-4 h-4" /> ID ▾
          </button>
          <a
            href="#"
            onClick={() => gtmPush({ event: "cta_click", cta: "sign_in", placement: "navbar_desktop" })}
            className="text-sm font-semibold text-foreground"
          >
            Sign In
          </a>
          <a
            href="#"
            onClick={() => gtmPush({ event: "cta_click", cta: "hubungi_sales", placement: "navbar_desktop" })}
            className="px-5 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Hubungi sales
          </a>
          <a
            href="https://office.synckerja.com/register"
            onClick={() => gtmPush({ event: "cta_click", cta: "coba_gratis", placement: "navbar_desktop" })}
            className="px-5 py-2 border border-foreground text-foreground text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            Coba gratis
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="lg:hidden"
          onClick={() =>
            setMobileOpen((open) => {
              const next = !open;
              if (!next) setFiturMobileOpen(false);
              return next;
            })
          }
          aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div id="mobile-nav" className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => {
              gtmPush({ event: "nav_click", item: "home", placement: "navbar_mobile" });
              setMobileOpen(false);
              setFiturMobileOpen(false);
            }}
            className="block text-sm font-semibold text-foreground hover:text-primary"
          >
            Home
          </Link>
          <div>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-md py-1 text-left text-sm font-semibold text-foreground"
              onClick={() => setFiturMobileOpen((v) => !v)}
              aria-expanded={fiturMobileOpen}
              aria-controls="mobile-fitur-submenu"
            >
              Fitur
              <ChevronDown className={`size-4 shrink-0 transition-transform ${fiturMobileOpen ? "rotate-180" : ""}`} aria-hidden />
            </button>
            {fiturMobileOpen && (
              <div id="mobile-fitur-submenu" className="mt-2">
                <FiturMegaMenuMobile
                  onNavigate={() => {
                    setMobileOpen(false);
                    setFiturMobileOpen(false);
                  }}
                />
              </div>
            )}
          </div>
          <a
            href="#solusi"
            onClick={() => gtmPush({ event: "nav_click", item: "solusi", placement: "navbar_mobile" })}
            className="block text-sm font-semibold"
          >
            Solusi
          </a>
          <a
            href="#harga"
            onClick={() => gtmPush({ event: "nav_click", item: "harga", placement: "navbar_mobile" })}
            className="block text-sm font-semibold"
          >
            Harga
          </a>
          <a
            href="#resources"
            onClick={() => gtmPush({ event: "nav_click", item: "resources", placement: "navbar_mobile" })}
            className="block text-sm font-semibold"
          >
            Resources
          </a>
          <div className="flex gap-3 pt-2">
            <a
              href="#"
              onClick={() => gtmPush({ event: "cta_click", cta: "hubungi_sales", placement: "navbar_mobile" })}
              className="flex-1 text-center px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-lg"
            >
              Hubungi sales
            </a>
            <a
              href="https://office.synckerja.com/register"
              onClick={() => gtmPush({ event: "cta_click", cta: "coba_gratis", placement: "navbar_mobile" })}
              className="flex-1 text-center px-4 py-2 border border-foreground text-sm font-semibold rounded-lg"
            >
              Coba gratis
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
