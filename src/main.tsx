import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import faviconUrl from "@/home/assets/pwa-192.png";
import heroPersonUrl from "@/home/assets/hero-person.webp";

const favicon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
if (favicon) {
  favicon.href = faviconUrl;
} else {
  const link = document.createElement("link");
  link.rel = "icon";
  link.type = "image/png";
  link.href = faviconUrl;
  document.head.appendChild(link);
}

// Hint the browser to fetch LCP hero image ASAP.
if (!document.querySelector("link[rel='preload'][as='image'][data-hero-preload='true']")) {
  const heroPreload = document.createElement("link");
  heroPreload.rel = "preload";
  heroPreload.as = "image";
  heroPreload.href = heroPersonUrl;
  heroPreload.setAttribute("data-hero-preload", "true");
  document.head.appendChild(heroPreload);
}

createRoot(document.getElementById("root")!).render(<App />);
