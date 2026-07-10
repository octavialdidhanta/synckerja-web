import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UpdateOrganizationSettingsInput,
  UpdateOrganizationSettingsResult,
} from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function updateOrganizationSettings(
  input: UpdateOrganizationSettingsInput,
): Promise<UpdateOrganizationSettingsResult> {
  const { data, error } = await supabase.rpc("admin_update_organization_settings", {
    p_organization_id: input.organization_id,
    p_subscription_self_service_enabled: input.subscription_self_service_enabled,
    p_reason: input.reason.trim(),
  });

  if (error) throw error;
  return data as UpdateOrganizationSettingsResult;
}

export function useUpdateOrganizationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationSettings,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations-summary"] });
      void queryClient.invalidateQueries({
        queryKey: ["subscription-adjustments", variables.organization_id],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organization-sales-modules", variables.organization_id],
      });
    },
  });
}
