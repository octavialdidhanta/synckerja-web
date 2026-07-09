export type OrganizationSubscriptionFilter = "all" | "active" | "expired";

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
};

export type SubscriptionAdjustmentState = {
  is_trial: boolean;
  status: string;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  auto_renew?: boolean;
  has_active_subscription?: boolean;
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

export type UpdateOrganizationSubscriptionResult = {
  organization_id: string;
  effective_status: string;
  is_trial: boolean;
  trial_end_date: string | null;
  subscription_end_date: string | null;
  has_active_subscription: boolean;
  after_state: SubscriptionAdjustmentState;
};
