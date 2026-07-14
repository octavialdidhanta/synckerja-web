import LegalDocumentShell from "@/policy/components/LegalDocumentShell";
import PolicyPageLayout from "@/policy/components/PolicyPageLayout";
import TermsOfServiceContent from "@/policy/content/termsOfServiceContent";
import { TERMS_OF_SERVICE_LINK_TEXT } from "@/home/constants/legal";
import { useDocumentTitle } from "@/home/hooks/useDocumentTitle";

const TermsOfServicePage = () => {
  useDocumentTitle(TERMS_OF_SERVICE_LINK_TEXT);

  return (
    <PolicyPageLayout>
      <LegalDocumentShell title={TERMS_OF_SERVICE_LINK_TEXT} lastUpdated="26th Nov, 2025">
        <TermsOfServiceContent />
      </LegalDocumentShell>
    </PolicyPageLayout>
  );
};

export default TermsOfServicePage;
