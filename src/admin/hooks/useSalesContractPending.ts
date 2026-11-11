import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/admin/context/AuthContext";
import {
  parseContractIdr,
  parseSalesContractPending,
  type SalesBillingMode,
  type SalesContractPending,
} from "@/admin/lib/salesContractPackage";
import type { SalesModuleKey } from "@/admin/lib/salesModuleCatalog";
import { supabase } from "@/share/supabase/client";

export type SaveSalesContractPendingInput = {
  organization_id: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  modules: Record<SalesModuleKey, boolean>;
  hr_seat_count: number;
  omnichannel_paid_seat_count: number;
  ai_employee_seat_count: number;
  keep_employee_ids: string[];
  outlet_quota: number | null;
  keep_outlet_ids: string[];
  monthly_price_idr: number | null;
  billing_mode: SalesBillingMode | null;
  ppn_included: boolean | null;
  price_effective_on: string | null;
  reason: string;
};

export type SalesContractPricePreview = {
  period_value_idr: number;
  adjustment_idr: number;
  term_months: number;
  old_monthly_price_idr: number | null;
};

async function fetchSalesContractPending(organizationId: string): Promise<SalesContractPending | null> {
  const { data, error } = await supabase.rpc("admin_get_sales_contract_pending", {
    p_organization_id: organizationId,
  });
  if (error) throw error;
  return parseSalesContractPending(data);
}

export function useSalesContractPending(organizationId: string | null) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: ["sales-contract-pending", organizationId],
    queryFn: () => fetchSalesContractPending(organizationId!),
    enabled: isCmsAdmin && !!organizationId,
  });
}

export function useSaveSalesContractPending() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveSalesContractPendingInput) => {
      const { data, error } = await supabase.rpc("admin_save_sales_contract_pending", {
        p_organization_id: input.organization_id,
        p_is_trial: input.is_trial,
        p_trial_end_date: input.trial_end_date,
        p_subscription_end_date: input.subscription_end_date,
        p_modules: input.modules,
        p_hr_seat_count: input.hr_seat_count,
        p_omnichannel_paid_seat_count: input.omnichannel_paid_seat_count,
        p_ai_employee_seat_count: input.ai_employee_seat_count,
        p_keep_employee_ids: input.keep_employee_ids,
        p_outlet_quota: input.outlet_quota,
        p_keep_outlet_ids: input.keep_outlet_ids,
        p_monthly_price_idr: input.monthly_price_idr,
        p_billing_mode: input.billing_mode,
        p_ppn_included: input.ppn_included,
        p_price_effective_on: input.price_effective_on,
        p_reason: input.reason.trim(),
      });
      if (error) throw error;
      return parseSalesContractPending(data);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["sales-contract-pending", variables.organization_id],
      });
    },
  });
}

export function useSalesContractPricePreview(input: {
  organizationId: string | null;
  monthlyPriceIdr: number | null;
  billingMode: SalesBillingMode | null;
  ppnIncluded: boolean;
  priceEffectiveOn: string;
  subscriptionEndUtc: string | null;
  enabled: boolean;
}) {
  const { isCmsAdmin } = useAuth();

  return useQuery({
    queryKey: [
      "sales-contract-price-preview",
      input.organizationId,
      input.monthlyPriceIdr,
      input.billingMode,
      input.ppnIncluded,
      input.priceEffectiveOn,
      input.subscriptionEndUtc,
    ],
    queryFn: async (): Promise<SalesContractPricePreview> => {
      const { data, error } = await supabase.rpc("admin_preview_sales_contract_price", {
        p_organization_id: input.organizationId,
        p_monthly_price_idr: input.monthlyPriceIdr,
        p_billing_mode: input.billingMode,
        p_ppn_included: input.ppnIncluded,
        p_price_effective_on: input.priceEffectiveOn,
        p_subscription_end_date: input.subscriptionEndUtc,
      });
      if (error) throw error;
      const row = (data ?? {}) as Record<string, unknown>;
      const period = parseContractIdr(row.period_value_idr);
      const adjustment = parseContractIdr(row.adjustment_idr);
      const termMonths = parseContractIdr(row.term_months);
      if (period === null || adjustment === null || termMonths === null || termMonths < 1) {
        throw new Error("preview harga tidak lengkap");
      }
      return {
        period_value_idr: period,
        adjustment_idr: adjustment,
        term_months: termMonths,
        old_monthly_price_idr: parseContractIdr(row.old_monthly_price_idr),
      };
    },
    enabled:
      isCmsAdmin &&
      input.enabled &&
      !!input.organizationId &&
      input.monthlyPriceIdr !== null &&
      !!input.priceEffectiveOn &&
      !!input.subscriptionEndUtc,
  });
}

export function useApplySalesSignedContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { organizationId: string; contractPath: string }) => {
      const { data, error } = await supabase.rpc("admin_apply_sales_signed_contract", {
        p_organization_id: input.organizationId,
        p_contract_path: input.contractPath,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ["sales-contract-pending", variables.organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["subscription-adjustments", variables.organizationId],
      });
      void queryClient.invalidateQueries({
        queryKey: ["organization-sales-modules", variables.organizationId],
      });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-organizations-summary"] });
    },
  });
}
