import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { AdminSubscriptionAddOn, PlanAddOnOverride } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

async function fetchAdminAddOns(): Promise<AdminSubscriptionAddOn[]> {
  const { data, error } = await supabase.rpc("admin_list_subscription_add_ons");
  if (error) throw error;
  return (data ?? []) as AdminSubscriptionAddOn[];
}

async function fetchPlanAddOnOverrides(planId?: string | null): Promise<PlanAddOnOverride[]> {
  const { data, error } = await supabase.rpc("admin_list_plan_add_on_overrides", {
    p_plan_id: planId ?? null,
  });
  if (error) throw error;
  return (data ?? []) as PlanAddOnOverride[];
}

export function useAdminAddOns() {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin-subscription-add-ons"],
    queryFn: fetchAdminAddOns,
    enabled: isCmsAdmin,
  });
}

export function usePlanAddOnOverrides(planId?: string | null) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin-plan-add-on-overrides", planId ?? "all"],
    queryFn: () => fetchPlanAddOnOverrides(planId),
    enabled: isCmsAdmin,
  });
}
