-- ============================================================================
-- MIGRATION 005: Add is_demo Flag to Assessments
-- ============================================================================
-- Adds a boolean is_demo column so demo assessments created from the super
-- admin dashboard are excluded from real agency dashboards, analytics, and
-- student lists.
-- Run this in Supabase SQL Editor.
-- ============================================================================

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false;

-- Back-fill any existing demo assessments (identifiable by the demo email pattern)
UPDATE assessments
SET is_demo = true
WHERE student_id IN (
  SELECT id FROM students WHERE email LIKE 'demo-%@thestudentblueprint.com'
);
