import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import { SALES_MODULE_CATALOG } from "@/admin/lib/salesModuleCatalog";
import type { AdminSubscriptionPlan } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

function attachEnabledModuleLabels(
  plans: AdminSubscriptionPlan[],
  moduleRows: { subscription_plan_id: string; module_key: string }[] | null,
): AdminSubscriptionPlan[] {
  const enabledByPlan = new Map<string, Set<string>>();
  for (const row of moduleRows ?? []) {
    const keys = enabledByPlan.get(row.subscription_plan_id) ?? new Set<string>();
    keys.add(row.module_key);
    enabledByPlan.set(row.subscription_plan_id, keys);
  }

  return plans.map((plan) => {
    const enabledKeys = enabledByPlan.get(plan.id);
    const enabled_module_labels = enabledKeys
      ? SALES_MODULE_CATALOG.filter((m) => enabledKeys.has(m.key)).map((m) => m.label)
      : [];
    return { ...plan, enabled_module_labels };
  });
}

async function fetchAdminPlans(): Promise<AdminSubscriptionPlan[]> {
  const [plansRes, modulesRes] = await Promise.all([
    supabase.rpc("admin_list_subscription_plans"),
    supabase
      .from("subscription_plan_module_access")
      .select("subscription_plan_id, module_key")
      .eq("is_enabled", true),
  ]);

  if (plansRes.error) throw plansRes.error;

  const plans = (plansRes.data ?? []) as AdminSubscriptionPlan[];
  return attachEnabledModuleLabels(plans, modulesRes.error ? null : modulesRes.data);
}

export function useAdminPlans() {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: fetchAdminPlans,
    enabled: isCmsAdmin,
  });
}
