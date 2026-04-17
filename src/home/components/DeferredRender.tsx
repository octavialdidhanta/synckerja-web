import { ReactNode, useEffect, useRef, useState } from "react";

type DeferredRenderProps = {
  children: ReactNode;
  /**
   * If set, the component will only render when it becomes visible.
   * This avoids loading below-the-fold JS during the critical path.
   */
  whenVisible?: boolean;
  /**
   * Fallback to show after a short delay even if IO isn't available.
   */
  maxWaitMs?: number;
};

export default function DeferredRender({
  children,
  whenVisible = true,
  maxWaitMs = 1500,
}: DeferredRenderProps) {
  const [show, setShow] = useState(!whenVisible);
  const markerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!whenVisible) return;
    if (show) return;

    let cancelled = false;

    const reveal = () => {
      if (cancelled) return;
      setShow(true);
    };

    const el = markerRef.current;
    if (!el) {
      // If for some reason we don't have a marker, don't block forever.
      const t = window.setTimeout(reveal, maxWaitMs);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    // Reveal at idle if supported (helps speed index).
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout: number }) => number);
    const cic = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
    const idleId = ric ? ric(reveal, { timeout: maxWaitMs }) : undefined;

    if (!("IntersectionObserver" in window)) {
      const t = window.setTimeout(reveal, maxWaitMs) as unknown as number;
      return () => {
        cancelled = true;
        if (idleId != null && cic) cic(idleId);
        window.clearTimeout(t);
      };
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          reveal();
        }
      },
      { rootMargin: "200px 0px" }
    );

    io.observe(el);

    const timeoutId = window.setTimeout(reveal, maxWaitMs);

    return () => {
      cancelled = true;
      io.disconnect();
      if (idleId != null && cic) cic(idleId);
      window.clearTimeout(timeoutId);
    };
  }, [maxWaitMs, show, whenVisible]);

  if (!show) return <div ref={markerRef} />;
  return <>{children}</>;
}

