import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UpdateOrganizationSubscriptionInput,
  UpdateOrganizationSubscriptionResult,
} from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function updateOrganizationSubscription(
  input: UpdateOrganizationSubscriptionInput,
): Promise<UpdateOrganizationSubscriptionResult> {
  const { data, error } = await supabase.rpc("admin_update_organization_subscription", {
    p_organization_id: input.organization_id,
    p_is_trial: input.is_trial,
    p_trial_end_date: input.trial_end_date,
    p_subscription_end_date: input.subscription_end_date,
    p_reason: input.reason.trim(),
  });

  if (error) throw error;
  return data as UpdateOrganizationSubscriptionResult;
}

export function useUpdateOrganizationSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationSubscription,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations-summary"] });
      void queryClient.invalidateQueries({
        queryKey: ["subscription-adjustments", variables.organization_id],
      });
    },
  });
}
