import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gtmPush } from "./gtm";

/**
 * SPA page_view tracking for Google Tag Manager.
 * Works for all current & future routes (no need to reinstall GTM per page).
 */
export default function GtmPageView() {
  const location = useLocation();

  useEffect(() => {
    const page_path = location.pathname + location.search + location.hash;
    gtmPush({
      event: "page_view",
      page_path,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);

  return null;
}

