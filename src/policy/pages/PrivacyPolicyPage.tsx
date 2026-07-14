import LegalDocumentShell from "@/policy/components/LegalDocumentShell";
import PolicyPageLayout from "@/policy/components/PolicyPageLayout";
import PrivacyPolicyContent from "@/policy/content/privacyPolicyContent";
import { PRIVACY_POLICY_LINK_TEXT } from "@/home/constants/legal";
import { useDocumentTitle } from "@/home/hooks/useDocumentTitle";

const PrivacyPolicyPage = () => {
  useDocumentTitle(PRIVACY_POLICY_LINK_TEXT);

  return (
    <PolicyPageLayout>
      <LegalDocumentShell title={PRIVACY_POLICY_LINK_TEXT} lastUpdated="23rd Jun, 2026">
        <PrivacyPolicyContent />
      </LegalDocumentShell>
    </PolicyPageLayout>
  );
};

export default PrivacyPolicyPage;
