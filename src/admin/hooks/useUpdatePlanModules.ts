import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdatePlanModulesInput, UpdatePlanModulesResult } from "@/admin/types/pricing";
import { supabase } from "@/share/supabase/client";

async function updatePlanModules(
  input: UpdatePlanModulesInput,
): Promise<UpdatePlanModulesResult> {
  const { data, error } = await supabase.rpc("admin_update_plan_modules", {
    p_subscription_plan_id: input.plan_id,
    p_modules: input.modules,
    p_reason: input.reason.trim(),
  });

  if (error) throw error;
  return data as UpdatePlanModulesResult;
}

export function useUpdatePlanModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlanModules,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] });
      void queryClient.invalidateQueries({ queryKey: ["plan-modules", variables.plan_id] });
      void queryClient.invalidateQueries({
        queryKey: ["plan-module-adjustments", variables.plan_id],
      });
    },
  });
}
