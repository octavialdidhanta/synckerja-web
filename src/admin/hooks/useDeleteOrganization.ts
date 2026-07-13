import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DeleteOrganizationInput, DeleteOrganizationResult } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function deleteOrganization(input: DeleteOrganizationInput): Promise<DeleteOrganizationResult> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sesi login tidak ditemukan.");
  }

  const { data, error } = await supabase.functions.invoke("admin-delete-organization", {
    body: {
      organization_id: input.organization_id,
      confirm_name: input.confirm_name,
      confirm_phrase: input.confirm_phrase,
      reason: input.reason.trim(),
    },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));

  return data as DeleteOrganizationResult;
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteOrganization,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations-summary"] });
    },
  });
}
