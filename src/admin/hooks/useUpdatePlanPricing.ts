import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UpdatePlanAddOnOverrideInput,
  UpdateSubscriptionAddOnInput,
  UpdateSubscriptionPlanInput,
} from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

export function useUpdatePlanPricing() {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-subscription-add-ons"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-plan-add-on-overrides"] });
    void queryClient.invalidateQueries({ queryKey: ["plan-price-adjustments"] });
  };

  const updatePlan = useMutation({
    mutationFn: async (input: UpdateSubscriptionPlanInput) => {
      const { data, error } = await supabase.rpc("admin_update_subscription_plan", {
        p_plan_id: input.plan_id,
        p_base_price_per_member: input.base_price_per_member,
        p_annual_discount_percentage: input.annual_discount_percentage,
        p_jumlah_hari_trial: input.jumlah_hari_trial,
        p_max_members: input.max_members,
        p_is_active: input.is_active,
        p_reason: input.reason.trim(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidateAll,
  });

  const updateAddOn = useMutation({
    mutationFn: async (input: UpdateSubscriptionAddOnInput) => {
      const { data, error } = await supabase.rpc("admin_update_subscription_add_on", {
        p_add_on_id: input.add_on_id,
        p_default_unit_price_per_month: input.default_unit_price_per_month,
        p_follows_plan_annual_discount: input.follows_plan_annual_discount,
        p_is_active: input.is_active,
        p_reason: input.reason.trim(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidateAll,
  });

  const updateOverride = useMutation({
    mutationFn: async (input: UpdatePlanAddOnOverrideInput) => {
      const { data, error } = await supabase.rpc("admin_update_plan_add_on_override", {
        p_plan_id: input.plan_id,
        p_add_on_id: input.add_on_id,
        p_unit_price_override_per_month: input.unit_price_override_per_month,
        p_reason: input.reason.trim(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: invalidateAll,
  });

  return { updatePlan, updateAddOn, updateOverride };
}
