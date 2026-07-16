import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CreateSubscriptionPlanInput,
  CreateSubscriptionPlanResult,
} from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

async function createSubscriptionPlan(
  input: CreateSubscriptionPlanInput,
): Promise<CreateSubscriptionPlanResult> {
  const { data, error } = await supabase.rpc("admin_create_subscription_plan", {
    p_name: input.name.trim(),
    p_base_price_per_member: input.base_price_per_member,
    p_modules: input.modules,
    p_is_active: input.is_active,
    p_reason: input.reason.trim(),
    p_description: input.description?.trim() || null,
    p_billing_term_discounts: input.billing_term_discounts ?? null,
    p_jumlah_hari_trial: input.jumlah_hari_trial ?? null,
    p_max_members: input.max_members,
  });

  if (error) throw error;
  return data as CreateSubscriptionPlanResult;
}

export function useCreateSubscriptionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscriptionPlan,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] });
    },
  });
}
