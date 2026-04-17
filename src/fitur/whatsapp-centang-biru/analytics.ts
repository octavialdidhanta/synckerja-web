import { gtmPush } from "@/share/analytics/gtm";

export const WA_BLUE_FEATURE_SLUG = "whatsapp_centang_biru";

export function trackWaBlueCta(cta: string, placement: string) {
  gtmPush({
    event: "cta_click",
    cta,
    placement,
    feature_page: WA_BLUE_FEATURE_SLUG,
    page_path: "/fitur/whatsapp-centang-biru",
  });
}

export function trackWaBlueFaq(questionId: string) {
  gtmPush({
    event: "faq_interaction",
    feature_page: WA_BLUE_FEATURE_SLUG,
    page_path: "/fitur/whatsapp-centang-biru",
    faq_id: questionId,
    faq_action: "open",
  });
}

export function trackWaBlueTab(tabId: string) {
  gtmPush({
    event: "feature_tab_click",
    feature_page: WA_BLUE_FEATURE_SLUG,
    page_path: "/fitur/whatsapp-centang-biru",
    tab_id: tabId,
  });
}
