import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type TransitionEvent } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, ChevronRight, HelpCircle, LineChart, ShieldCheck } from "lucide-react";
import { cn } from "@/home/lib/utils";
import { gtmPush } from "@/share/analytics/gtm";

export const FITUR_WA_BLUE_PATH = "/fitur/whatsapp-centang-biru";

/** Ringkasan section di `/fitur/whatsapp-centang-biru` — selaras urutan & copy halaman. */
const pageHighlights: { id: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: "verifikasi",
    title: "Pendampingan verifikasi centang biru",
    description:
      "Mulai dari profil WhatsApp Business sampai pengajuan ke Meta. Bantu bisnis tampil sebagai entitas resmi, bukan nomor asing.",
    icon: BadgeCheck,
  },
  {
    id: "kepercayaan",
    title: "WhatsApp bisnis yang terasa resmi",
    description:
      "Pelanggan percaya sejak chat pertama: profil terverifikasi, promosi terasa resmi, dan tim fokus jualan bukan buktiin diri.",
    icon: ShieldCheck,
  },
  {
    id: "operasional",
    title: "Operasional rapi setelah verifikasi",
    description:
      "Automasi layanan, tim multiagen, dan CRM terintegrasi supaya kepercayaan pelanggan berlanjut jadi layanan yang konsisten.",
    icon: LineChart,
  },
  {
    id: "faq",
    title: "FAQ verifikasi centang biru",
    description:
      "Jawaban seputar definisi centang biru, proses pengajuan, durasi, dan peran Synckerja Office dari awal sampai persetujuan Meta.",
    icon: HelpCircle,
  },
];

const SIDEBAR_LABEL = "Centang biru WhatsApp";

function trackFiturMegaLink(itemId: string, itemTitle: string, placement: "navbar_desktop" | "navbar_mobile") {
  gtmPush({
    event: "nav_click",
    item: "fitur_mega_link",
    placement,
    fitur_category: "whatsapp_centang_biru",
    fitur_detail: itemId,
    fitur_title: itemTitle,
    destination_path: FITUR_WA_BLUE_PATH,
  });
}

function trackFiturMegaOpenPage(placement: "navbar_desktop" | "navbar_mobile") {
  gtmPush({
    event: "nav_click",
    item: "fitur_mega_open_page",
    placement,
    destination_path: FITUR_WA_BLUE_PATH,
  });
}

function trackFiturMenuOpen(placement: "navbar_desktop") {
  gtmPush({ event: "nav_click", item: "fitur_menu_open", placement });
}

export function FiturMegaMenuDesktop() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [topPx, setTopPx] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openMenu = useCallback(() => {
    if (!mounted) setMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
  }, [mounted]);

  const closeMenu = useCallback(() => {
    setVisible(false);
  }, []);

  const toggleMenu = useCallback(() => {
    if (visible) closeMenu();
    else openMenu();
  }, [visible, openMenu, closeMenu]);

  const updateTop = useCallback(() => {
    const nav = triggerRef.current?.closest("nav");
    if (!nav) return;
    setTopPx(nav.getBoundingClientRect().bottom);
  }, []);

  useLayoutEffect(() => {
    if (!mounted) return;
    updateTop();
    window.addEventListener("resize", updateTop);
    window.addEventListener("scroll", updateTop, true);
    return () => {
      window.removeEventListener("resize", updateTop);
      window.removeEventListener("scroll", updateTop, true);
    };
  }, [mounted, updateTop]);

  useEffect(() => {
    if (visible) trackFiturMenuOpen("navbar_desktop");
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, closeMenu]);

  useEffect(() => {
    if (!visible) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      closeMenu();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [visible, closeMenu]);

  const handlePanelTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.propertyName !== "opacity" && e.propertyName !== "transform") return;
    if (!visible) setMounted(false);
  };

  /** Tanpa transisi, `transitionend` tidak terpanggil — tetap unmount panel. */
  useEffect(() => {
    if (visible || !mounted) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!reduced) return;
    const id = window.setTimeout(() => setMounted(false), 0);
    return () => window.clearTimeout(id);
  }, [visible, mounted]);

  const panel = mounted
    ? createPortal(
      <div
        ref={panelRef}
        className={cn(
          "fixed left-0 right-0 z-[100] w-screen max-w-[100vw] overflow-hidden border-b border-border bg-background shadow-xl",
          "transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transition-none",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0",
        )}
        style={{ top: topPx }}
        role="dialog"
        aria-label="Menu Fitur"
        onTransitionEnd={handlePanelTransitionEnd}
      >
        <div className="flex max-h-[min(72vh,620px)] w-full min-h-[240px]">
          <div className="w-1.5 shrink-0 bg-primary" aria-hidden />
          <div className="container mx-auto flex min-w-0 flex-1 flex-col px-4 py-5 md:flex-row md:px-4 md:py-6 lg:px-6">
            <div className="w-full shrink-0 border-border md:w-[16rem] md:border-r md:pr-5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Fitur</p>
              <nav className="mt-3" aria-label="Fitur tersedia">
                <div
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-left text-sm font-semibold text-primary",
                  )}
                >
                  <span className="min-w-0 flex-1 leading-snug">{SIDEBAR_LABEL}</span>
                  <ChevronRight className="size-4 shrink-0 text-primary" aria-hidden />
                </div>
              </nav>
              <div className="my-4 h-px bg-border" />
              <p className="text-xs text-muted-foreground">Ingin melihat penjelasan lengkap di halaman fitur?</p>
              <Link
                to={FITUR_WA_BLUE_PATH}
                className="mt-2 inline-flex items-center gap-1 px-1 py-2 text-sm font-semibold text-primary hover:underline"
                onClick={() => {
                  trackFiturMegaOpenPage("navbar_desktop");
                  closeMenu();
                }}
              >
                Buka halaman fitur →
              </Link>
            </div>

            <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-secondary/40 px-0 py-5 md:px-6 md:py-0 md:pl-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Ringkasan isi halaman
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {pageHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={FITUR_WA_BLUE_PATH}
                      className="flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-background"
                      onClick={() => {
                        trackFiturMegaLink(item.id, item.title, "navbar_desktop");
                        closeMenu();
                      }}
                    >
                      <span className="inline-flex size-11 items-center justify-center rounded-lg border border-primary/25 text-primary">
                        <Icon className="size-5" strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body,
    )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={visible}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-1 py-2 text-sm font-semibold text-foreground outline-none transition-colors",
          "hover:text-primary focus-visible:text-primary",
          visible && "text-primary",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        onClick={toggleMenu}
      >
        Fitur <span className="text-xs opacity-80">▾</span>
      </button>
      {panel}
    </>
  );
}

type FiturMegaMenuMobileProps = {
  onNavigate: () => void;
};

export function FiturMegaMenuMobile({ onNavigate }: FiturMegaMenuMobileProps) {
  return (
    <div className="space-y-3 border-l-4 border-primary pl-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{SIDEBAR_LABEL}</p>
      <p className="text-sm text-muted-foreground">
        Halaman verifikasi centang biru WhatsApp: pendampingan ke Meta, manfaat kepercayaan pelanggan, operasional tim,
        cerita mitra, hingga FAQ lengkap.
      </p>
      <ul className="space-y-1">
        {pageHighlights.map((item) => (
          <li key={item.id}>
            <Link
              to={FITUR_WA_BLUE_PATH}
              className="block rounded-lg px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              onClick={() => {
                trackFiturMegaLink(item.id, item.title, "navbar_mobile");
                onNavigate();
              }}
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to={FITUR_WA_BLUE_PATH}
        className="inline-flex text-sm font-semibold text-primary hover:underline"
        onClick={() => {
          trackFiturMegaOpenPage("navbar_mobile");
          onNavigate();
        }}
      >
        Buka halaman fitur →
      </Link>
    </div>
  );
}
