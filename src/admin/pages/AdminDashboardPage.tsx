import OrganizationStatsCards from "@/admin/components/OrganizationStatsCards";
import OrganizationsTable from "@/admin/components/OrganizationsTable";
import { useDocumentTitle } from "@/home/hooks/useDocumentTitle";
import { APP_NAME } from "@/home/constants/legal";

export default function AdminDashboardPage() {
  useDocumentTitle(`Admin Dashboard — ${APP_NAME}`);

  return (
    <div className="space-y-6">
      <OrganizationStatsCards />
      <OrganizationsTable />
    </div>
  );
}
