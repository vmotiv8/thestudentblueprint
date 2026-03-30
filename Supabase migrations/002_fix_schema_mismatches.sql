-- ============================================================================
-- MIGRATION 002: Fix Schema Mismatches
-- ============================================================================
-- Adds missing columns referenced by application code but absent from schema.
-- Run this in Supabase SQL Editor after the initial setup script.
-- ============================================================================

-- ============================================================================
-- 1. OTP CODES — add is_used tracking
-- ============================================================================
ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS is_used BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_otp_codes_is_used ON otp_codes(is_used);

-- ============================================================================
-- 2. STUDENTS — add missing columns referenced by API routes
-- ============================================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS unique_code TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS current_grade TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS target_college_year TEXT;

-- Generate unique_code for existing students that don't have one
UPDATE students
SET unique_code = UPPER(SUBSTR(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE unique_code IS NULL;

-- Unique index on unique_code (partial — only non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_unique_code ON students(unique_code) WHERE unique_code IS NOT NULL;

-- Composite unique index to prevent duplicate emails per organization
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_org_email ON students(organization_id, email);

-- Backfill full_name from first_name + last_name for existing rows
UPDATE students
SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, ''))
WHERE full_name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Backfill current_grade from grade_level for existing rows
UPDATE students
SET current_grade = grade_level
WHERE current_grade IS NULL AND grade_level IS NOT NULL;

-- ============================================================================
-- 3. ASSESSMENTS — add missing section columns and tracking fields
-- ============================================================================
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS current_section INT DEFAULT 1;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS competitiveness_score NUMERIC;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS gap_analysis JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS basic_info JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS academic_profile JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS testing_info JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS extracurriculars JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS leadership JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS competitions JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS passions JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS career_aspirations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS research_experience JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS summer_programs JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS special_talents JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS family_context JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS personality JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS personal_stories JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS time_commitment JSONB;

-- Backfill is_completed from status for existing rows
UPDATE assessments SET is_completed = true WHERE status = 'completed' AND is_completed = false;

-- Index for at-risk queries
CREATE INDEX IF NOT EXISTS idx_assessments_is_completed ON assessments(is_completed);
CREATE INDEX IF NOT EXISTS idx_assessments_current_section ON assessments(current_section);

-- ============================================================================
-- 4. RLS POLICIES — Replace permissive policies with proper tenant isolation
-- ============================================================================

-- Drop the old overly-permissive policies
DROP POLICY IF EXISTS "Service role full access organizations" ON organizations;
DROP POLICY IF EXISTS "Service role full access admins" ON admins;
DROP POLICY IF EXISTS "Service role full access students" ON students;
DROP POLICY IF EXISTS "Service role full access assessments" ON assessments;
DROP POLICY IF EXISTS "Service role full access coupons" ON coupons;
DROP POLICY IF EXISTS "Service role full access payments" ON payments;
DROP POLICY IF EXISTS "Service role full access otp_codes" ON otp_codes;
DROP POLICY IF EXISTS "Service role full access audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Service role full access usage_logs" ON usage_logs;
DROP POLICY IF EXISTS "Service role full access cms_faqs" ON cms_faqs;
DROP POLICY IF EXISTS "Service role full access cms_testimonials" ON cms_testimonials;
DROP POLICY IF EXISTS "Service role full access knowledge_hub_resources" ON knowledge_hub_resources;
DROP POLICY IF EXISTS "Service role full access webhook_events" ON webhook_events;
DROP POLICY IF EXISTS "Service role full access email_logs" ON email_logs;
DROP POLICY IF EXISTS "Service role full access invitations" ON invitations;
DROP POLICY IF EXISTS "Service role full access organization_members" ON organization_members;

-- NOTE: The service_role key bypasses RLS entirely in Supabase.
-- These new policies restrict what the anon key can access.
-- Only public CMS content should be readable via the anon key.

-- Organizations: anon can read basic org info (needed for tenant resolution)
CREATE POLICY "anon_read_organizations" ON organizations
  FOR SELECT USING (true);

-- CMS FAQs: anon can read active FAQs (public landing page)
CREATE POLICY "anon_read_active_faqs" ON cms_faqs
  FOR SELECT USING (is_active = true);

-- CMS Testimonials: anon can read active testimonials (public landing page)
CREATE POLICY "anon_read_active_testimonials" ON cms_testimonials
  FOR SELECT USING (is_active = true);

-- All other tables: no anon access (service_role bypasses RLS for API routes)
-- Admins: no anon access
CREATE POLICY "deny_anon_admins" ON admins
  FOR ALL USING (false);

-- Students: no anon access
CREATE POLICY "deny_anon_students" ON students
  FOR ALL USING (false);

-- Assessments: no anon access
CREATE POLICY "deny_anon_assessments" ON assessments
  FOR ALL USING (false);

-- Coupons: no anon access
CREATE POLICY "deny_anon_coupons" ON coupons
  FOR ALL USING (false);

-- Payments: no anon access
CREATE POLICY "deny_anon_payments" ON payments
  FOR ALL USING (false);

-- OTP Codes: no anon access
CREATE POLICY "deny_anon_otp_codes" ON otp_codes
  FOR ALL USING (false);

-- Audit Logs: no anon access
CREATE POLICY "deny_anon_audit_logs" ON audit_logs
  FOR ALL USING (false);

-- Usage Logs: no anon access
CREATE POLICY "deny_anon_usage_logs" ON usage_logs
  FOR ALL USING (false);

-- Knowledge Hub: no anon access
CREATE POLICY "deny_anon_knowledge_hub" ON knowledge_hub_resources
  FOR ALL USING (false);

-- Webhook Events: no anon access
CREATE POLICY "deny_anon_webhook_events" ON webhook_events
  FOR ALL USING (false);

-- Email Logs: no anon access
CREATE POLICY "deny_anon_email_logs" ON email_logs
  FOR ALL USING (false);

-- Invitations: no anon access
CREATE POLICY "deny_anon_invitations" ON invitations
  FOR ALL USING (false);

-- Organization Members: no anon access
CREATE POLICY "deny_anon_org_members" ON organization_members
  FOR ALL USING (false);


-- ============================================================================
-- DONE! Summary:
-- ============================================================================
-- Added columns:
--   otp_codes: is_used
--   students: full_name, unique_code, current_grade, target_college_year
--   assessments: current_section, is_completed, competitiveness_score,
--     gap_analysis, basic_info, academic_profile, testing_info,
--     extracurriculars, leadership, competitions, passions,
--     career_aspirations, research_experience, summer_programs,
--     special_talents, family_context, personality, personal_stories,
--     time_commitment
--
-- Added indexes:
--   idx_otp_codes_is_used, idx_students_unique_code, idx_students_org_email,
--   idx_assessments_is_completed, idx_assessments_current_section
--
-- RLS policies: Replaced permissive USING(true) with restrictive policies.
--   Only public CMS content and org info readable via anon key.
--   All sensitive tables deny anon access entirely.
-- ============================================================================
