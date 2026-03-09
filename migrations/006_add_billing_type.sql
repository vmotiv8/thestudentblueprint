-- Migration 006: Add billing_type to organizations
-- billing_type: 'subscription' (default, uses Stripe recurring)
--               'one_time'     (manual invoice, no Stripe subscription)

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS billing_type TEXT NOT NULL DEFAULT 'subscription';

-- Note: CHECK constraint added separately so it doesn't fail if column already exists
-- ALTER TABLE organizations ADD CONSTRAINT organizations_billing_type_check
--   CHECK (billing_type IN ('subscription', 'one_time'));
