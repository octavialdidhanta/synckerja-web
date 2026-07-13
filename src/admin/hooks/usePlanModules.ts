import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import {
  createDefaultSalesModulesRecord,
  SALES_MODULE_KEYS,
  type SalesModuleKey,
} from "@/admin/lib/salesModuleCatalog";
import type { PlanModules } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

function coerceModuleBoolean(value: unknown): boolean {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return Boolean(value);
}

function normalizeModulesFromRecord(
  subscriptionPlanId: string,
  modules: Record<string, unknown>,
): PlanModules {
  const normalized = createDefaultSalesModulesRecord();
  for (const key of SALES_MODULE_KEYS) {
    if (key in modules) {
      normalized[key] = coerceModuleBoolean(modules[key]);
    }
  }
  return {
    subscription_plan_id: subscriptionPlanId,
    modules: normalized,
  };
}

function shouldUseDirectReadFallback(error: SupabaseErrorLike): boolean {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  if (message.includes("not allowed") || code === "42501") return false;
  if (message.includes("plan not found") || code === "P0002") return false;
  return true;
}

async function fetchPlanModulesDirect(planId: string): Promise<PlanModules> {
  const { data, error } = await supabase
    .from("subscription_plan_module_access")
    .select("module_key, is_enabled")
    .eq("subscription_plan_id", planId);

  if (error) throw error;

  const modules = createDefaultSalesModulesRecord();
  for (const row of data ?? []) {
    const key = row.module_key as string;
    if ((SALES_MODULE_KEYS as string[]).includes(key)) {
      modules[key as SalesModuleKey] = row.is_enabled === true;
    }
  }

  return {
    subscription_plan_id: planId,
    modules,
  };
}

async function fetchPlanModules(planId: string): Promise<PlanModules> {
  const { data, error } = await supabase.rpc("admin_get_plan_modules", {
    p_subscription_plan_id: planId,
  });

  if (!error) {
    const result = data as { subscription_plan_id: string; modules: Record<string, unknown> };
    return normalizeModulesFromRecord(result.subscription_plan_id ?? planId, result.modules ?? {});
  }

  if (!shouldUseDirectReadFallback(error)) {
    throw error;
  }

  try {
    return await fetchPlanModulesDirect(planId);
  } catch (fallbackError) {
    throw error;
  }
}

export function usePlanModules(planId: string | null, enabled: boolean) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["plan-modules", planId],
    queryFn: () => fetchPlanModules(planId!),
    enabled: isCmsAdmin && enabled && !!planId,
  });
}
