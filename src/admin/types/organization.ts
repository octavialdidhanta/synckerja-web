import type { SalesModuleKey } from "@/admin/lib/salesModuleCatalog";

export type OrganizationSubscriptionFilter = "all" | "active" | "expired";

export type { SalesModuleKey };

export type AdminOrganizationsSummary = {
  total_count: number;
  active_count: number;
  trial_count: number;
  expired_count: number;
};

export type AdminOrganizationRow = {
  organization_id: string;
  company_name: string;
  email: string | null;
  created_at: string;
  subscription_status: string | null;
  effective_status: string;
  is_active: boolean;
  is_trial: boolean;
  plan_name: string | null;
  subscription_end_date: string | null;
  trial_end_date: string | null;
  has_active_subscription: boolean | null;
  member_count: number | null;
  subscription_self_service_enabled: boolean;
};

export type SubscriptionAdjustmentState = {
  is_trial?: boolean;
  status?: string;
  trial_end_date?: string | null;
  subscription_end_date?: string | null;
  auto_renew?: boolean;
  has_active_subscription?: boolean;
  subscription_self_service_enabled?: boolean;
};

export type SubscriptionAdjustmentRow = {
  id: string;
  organization_id: string;
  adjusted_by: string;
  reason: string;
  before_state: SubscriptionAdjustmentState;
  after_state: SubscriptionAdjustmentState;
  created_at: string;
};

export type UpdateOrganizationSubscriptionInput = {
  organization_id: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  reason: string;
};

export type UpdateOrganizationSettingsInput = {
  organization_id: string;
  subscription_self_service_enabled: boolean;
  reason: string;
};

export type UpdateOrganizationSettingsResult = {
  organization_id: string;
  subscription_self_service_enabled: boolean;
  before_state: Pick<SubscriptionAdjustmentState, "subscription_self_service_enabled">;
  after_state: Pick<SubscriptionAdjustmentState, "subscription_self_service_enabled">;
};

export type UpdateOrganizationSubscriptionResult = {
  organization_id: string;
  effective_status: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  has_active_subscription: boolean;
  after_state: SubscriptionAdjustmentState;
};

export type OrganizationSalesModules = {
  organization_id: string;
  is_sales_tenant: boolean;
  modules: Record<SalesModuleKey, boolean>;
};

export type OrganizationModuleAdjustmentRow = {
  id: string;
  organization_id: string;
  adjusted_by: string;
  reason: string;
  before_state: { modules: Record<SalesModuleKey, boolean> };
  after_state: { modules: Record<SalesModuleKey, boolean> };
  created_at: string;
};

export type UpdateOrganizationSalesModulesInput = {
  organization_id: string;
  modules: Record<SalesModuleKey, boolean>;
  reason: string;
};

export type UpdateOrganizationSalesModulesResult = {
  organization_id: string;
  modules: Record<SalesModuleKey, boolean>;
  before_state: { modules: Record<SalesModuleKey, boolean> };
  after_state: { modules: Record<SalesModuleKey, boolean> };
};

export const ORGANIZATION_DELETE_CONFIRM_PHRASE = "hapus organisasi ini" as const;

export type OrganizationDeletionPreview = {
  organization_id: string;
  company_name: string;
  email: string | null;
  created_at: string;
  subscription_status: string | null;
  is_trial: boolean;
  has_active_subscription: boolean;
  member_count: number;
  user_count: number;
  auth_users_to_delete: number;
  table_counts: Record<string, number>;
  has_cms_admin_member: boolean;
  confirm_phrase: typeof ORGANIZATION_DELETE_CONFIRM_PHRASE;
};

export type DeleteOrganizationInput = {
  organization_id: string;
  confirm_name: string;
  confirm_phrase: string;
  reason: string;
};

export type DeleteOrganizationResult = {
  audit_id: string;
  organization_id: string;
  company_name: string;
  deleted_counts: Record<string, number>;
  auth_users_to_delete: string[];
  deleted_auth_users: number;
  deleted_storage_objects: number;
  storage_prefix: string;
};

export type VerifyOrganizationDeletedResult = {
  organization_id: string;
  organization_exists: boolean;
  is_clean: boolean;
  remaining_counts: Record<string, number>;
};
