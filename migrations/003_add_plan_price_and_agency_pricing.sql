-- Migration: Add plan_price column for agency subscription costs
-- The plan_price represents what the agency pays monthly for their plan (set by super admin)
-- The assessment_price represents what the agency charges per student (set by the agency itself)

-- Add plan_price column (monthly plan cost in dollars, e.g. 99 for $99/mo)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_price NUMERIC DEFAULT NULL;

-- Copy current assessment_price values to plan_price for existing orgs
-- (since the old "Price" field was being used ambiguously)
UPDATE organizations SET plan_price = assessment_price WHERE plan_price IS NULL AND assessment_price IS NOT NULL;

-- Set a sensible default assessment_price for agencies that don't have one
-- (agencies can customize this themselves)
UPDATE organizations SET assessment_price = 499 WHERE assessment_price IS NULL;
