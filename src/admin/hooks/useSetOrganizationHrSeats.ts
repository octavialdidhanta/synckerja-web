import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetOrganizationHrSeatsInput } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function setOrganizationHrSeats(input: SetOrganizationHrSeatsInput): Promise<void> {
  const { error } = await supabase.rpc("admin_set_organization_hr_seats", {
    p_organization_id: input.organization_id,
    p_seats: input.seats,
    p_reason: input.reason.trim(),
    p_keep_employee_ids: input.keep_employee_ids,
    p_omnichannel_seats: input.omnichannel_seats,
  });

  if (error) throw error;
}

export function useSetOrganizationHrSeats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setOrganizationHrSeats,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["organization-sales-modules", variables.organization_id],
      });
      void queryClient.invalidateQueries({
        queryKey: ["subscription-adjustments", variables.organization_id],
      });
    },
  });
}
