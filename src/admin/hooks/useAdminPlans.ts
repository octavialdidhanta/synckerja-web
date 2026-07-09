import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import type { AdminSubscriptionPlan } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

async function fetchAdminPlans(): Promise<AdminSubscriptionPlan[]> {
  const { data, error } = await supabase.rpc("admin_list_subscription_plans");
  if (error) throw error;
  return (data ?? []) as AdminSubscriptionPlan[];
}

export function useAdminPlans() {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: fetchAdminPlans,
    enabled: isCmsAdmin,
  });
}
