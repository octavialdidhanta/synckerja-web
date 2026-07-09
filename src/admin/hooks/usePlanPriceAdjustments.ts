import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { PlanPriceAdjustment, PricingEntityType } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

type AdjustmentFilters = {
  entityType?: PricingEntityType | null;
  entityId?: string | null;
  planId?: string | null;
  addOnId?: string | null;
  limit?: number;
};

async function fetchPlanPriceAdjustments(
  filters: AdjustmentFilters,
): Promise<PlanPriceAdjustment[]> {
  const { data, error } = await supabase.rpc("admin_list_plan_price_adjustments", {
    p_entity_type: filters.entityType ?? null,
    p_entity_id: filters.entityId ?? null,
    p_plan_id: filters.planId ?? null,
    p_add_on_id: filters.addOnId ?? null,
    p_limit: filters.limit ?? 5,
  });
  if (error) throw error;
  return (data ?? []) as PlanPriceAdjustment[];
}

export function usePlanPriceAdjustments(filters: AdjustmentFilters, enabled = true) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: [
      "plan-price-adjustments",
      filters.entityType,
      filters.entityId,
      filters.planId,
      filters.addOnId,
      filters.limit,
    ],
    queryFn: () => fetchPlanPriceAdjustments(filters),
    enabled: isCmsAdmin && enabled,
  });
}
