import { useQuery } from "@tanstack/react-query";
import type { OrganizationDeletionPreview } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function fetchPreview(organizationId: string): Promise<OrganizationDeletionPreview> {
  const { data, error } = await supabase.rpc("admin_preview_organization_deletion", {
    p_organization_id: organizationId,
  });

  if (error) throw error;
  return data as OrganizationDeletionPreview;
}

export function usePreviewOrganizationDeletion(organizationId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["organization-deletion-preview", organizationId],
    queryFn: () => fetchPreview(organizationId!),
    enabled: enabled && !!organizationId,
    staleTime: 30_000,
  });
}
