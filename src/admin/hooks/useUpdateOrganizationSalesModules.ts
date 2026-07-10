import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  UpdateOrganizationSalesModulesInput,
  UpdateOrganizationSalesModulesResult,
} from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function updateOrganizationSalesModules(
  input: UpdateOrganizationSalesModulesInput,
): Promise<UpdateOrganizationSalesModulesResult> {
  const { data, error } = await supabase.rpc("admin_update_organization_sales_modules", {
    p_organization_id: input.organization_id,
    p_modules: input.modules,
    p_reason: input.reason.trim(),
  });

  if (error) throw error;
  return data as UpdateOrganizationSalesModulesResult;
}

export function useUpdateOrganizationSalesModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrganizationSalesModules,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["organization-sales-modules", variables.organization_id],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organization-module-adjustments", variables.organization_id],
      });
    },
  });
}
