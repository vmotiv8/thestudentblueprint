-- Add free_assessments flag to organizations
-- When true, students skip checkout and get free access to assessments
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS free_assessments BOOLEAN NOT NULL DEFAULT false;
