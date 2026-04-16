declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export type GtmEvent = Record<string, unknown> & { event: string };

export function gtmPush(event: GtmEvent) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event);
}

