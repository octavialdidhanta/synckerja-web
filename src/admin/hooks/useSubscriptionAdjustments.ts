import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { SubscriptionAdjustmentRow } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function fetchSubscriptionAdjustments(
  organizationId: string,
  limit: number,
): Promise<SubscriptionAdjustmentRow[]> {
  const { data, error } = await supabase.rpc("admin_list_subscription_adjustments", {
    p_organization_id: organizationId,
    p_limit: limit,
  });

  if (error) throw error;
  return (data ?? []) as SubscriptionAdjustmentRow[];
}

export function useSubscriptionAdjustments(organizationId: string | null, limit = 5) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["subscription-adjustments", organizationId, limit],
    queryFn: () => fetchSubscriptionAdjustments(organizationId!, limit),
    enabled: isCmsAdmin && !!organizationId,
  });
}
