-- Audit trail for CMS admin subscription date adjustments.
-- RLS enabled with no policies: direct table access denied; only SECURITY DEFINER RPCs.

CREATE TABLE public.cms_subscription_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  adjusted_by uuid NOT NULL REFERENCES auth.users(id),
  reason text NOT NULL CHECK (char_length(trim(reason)) >= 3),
  before_state jsonb NOT NULL,
  after_state jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX cms_subscription_adjustments_org_created_idx
  ON public.cms_subscription_adjustments (organization_id, created_at DESC);

ALTER TABLE public.cms_subscription_adjustments ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.cms_subscription_adjustments IS
  'CMS admin audit log for organization_subscriptions date/mode changes. Read/write via admin RPCs only.';
