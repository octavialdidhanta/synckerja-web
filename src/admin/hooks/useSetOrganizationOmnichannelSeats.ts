import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SetOrganizationOmnichannelSeatsInput } from "@/admin/types/organization";
import { supabase } from "@/share/supabase/client";

async function setOrganizationOmnichannelSeats(
  input: SetOrganizationOmnichannelSeatsInput,
): Promise<void> {
  const { error } = await supabase.rpc("admin_set_organization_omnichannel_seats", {
    p_organization_id: input.organization_id,
    p_seats: input.seats,
    p_reason: input.reason.trim(),
    p_keep_employee_ids: input.keep_employee_ids,
  });

  if (error) throw error;
}

export function useSetOrganizationOmnichannelSeats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setOrganizationOmnichannelSeats,
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
