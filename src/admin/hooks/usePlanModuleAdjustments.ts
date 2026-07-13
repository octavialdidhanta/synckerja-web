import { useQuery } from "@tanstack/react-query";
import type { PlanModuleAdjustmentRow } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

async function fetchPlanModuleAdjustments(
  planId: string,
  limit: number,
): Promise<PlanModuleAdjustmentRow[]> {
  const { data, error } = await supabase.rpc("admin_list_plan_module_adjustments", {
    p_subscription_plan_id: planId,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as PlanModuleAdjustmentRow[];
}

export function usePlanModuleAdjustments(planId: string | null, enabled: boolean, limit = 5) {
  return useQuery({
    queryKey: ["plan-module-adjustments", planId, limit],
    queryFn: () => fetchPlanModuleAdjustments(planId!, limit),
    enabled: enabled && !!planId,
  });
}
