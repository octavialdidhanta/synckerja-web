export type PricingEntityType = "plan" | "add_on" | "plan_add_on";

export type AdminSubscriptionPlan = {
  id: string;
  name: string;
  description: string | null;
  base_price_per_member: number;
  annual_discount_percentage: number | null;
  jumlah_hari_trial: number | null;
  max_members: number | null;
  is_active: boolean;
  subscriber_count: number;
  enabled_module_count: number;
  /** Di-enrich di client dari subscription_plan_module_access */
  enabled_module_labels?: string[];
  created_at: string;
  updated_at: string;
};

export type PlanModules = {
  subscription_plan_id: string;
  modules: Record<string, boolean>;
};

export type PlanModuleAdjustmentRow = {
  id: string;
  subscription_plan_id: string;
  adjusted_by: string;
  reason: string;
  before_state: { modules: Record<string, boolean> };
  after_state: { modules: Record<string, boolean> };
  created_at: string;
};

export type CreateSubscriptionPlanInput = {
  name: string;
  base_price_per_member: number;
  modules: Record<string, boolean>;
  is_active: boolean;
  reason: string;
  max_members: number | null;
  description?: string | null;
  annual_discount_percentage?: number | null;
  jumlah_hari_trial?: number | null;
};

export type CreateSubscriptionPlanResult = {
  id: string;
  name: string;
  description: string | null;
  base_price_per_member: number;
  annual_discount_percentage: number | null;
  jumlah_hari_trial: number | null;
  max_members: number | null;
  is_active: boolean;
  features: string[];
  modules: Record<string, boolean>;
};

export type UpdatePlanModulesInput = {
  plan_id: string;
  modules: Record<string, boolean>;
  reason: string;
};

export type UpdatePlanModulesResult = {
  subscription_plan_id: string;
  modules: Record<string, boolean>;
  before_state: { modules: Record<string, boolean> };
  after_state: { modules: Record<string, boolean> };
};

export type AdminSubscriptionAddOn = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  billing_unit: string;
  default_unit_price_per_month: number;
  follows_plan_annual_discount: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanAddOnOverride = {
  subscription_plan_id: string;
  plan_name: string;
  add_on_id: string;
  add_on_code: string;
  add_on_name: string;
  unit_price_override_per_month: number | null;
  default_unit_price_per_month: number;
  resolved_unit_price_per_month: number;
  display_order: number;
};

export type PlanPriceAdjustment = {
  id: string;
  entity_type: PricingEntityType;
  entity_id: string;
  plan_id: string | null;
  add_on_id: string | null;
  adjusted_by: string;
  reason: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  created_at: string;
};

export type UpdateSubscriptionPlanInput = {
  plan_id: string;
  base_price_per_member: number;
  annual_discount_percentage: number | null;
  jumlah_hari_trial: number | null;
  max_members: number | null;
  is_active: boolean;
  reason: string;
};

export type UpdateSubscriptionAddOnInput = {
  add_on_id: string;
  default_unit_price_per_month: number;
  follows_plan_annual_discount: boolean;
  is_active: boolean;
  reason: string;
};

export type UpdatePlanAddOnOverrideInput = {
  plan_id: string;
  add_on_id: string;
  unit_price_override_per_month: number | null;
  reason: string;
};
