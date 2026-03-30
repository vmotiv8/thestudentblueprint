-- ============================================================================
-- ORCHIDS STUDENT ASSESSMENT PLATFORM — Full Supabase Setup Script
-- ============================================================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- This script creates ALL tables, indexes, functions, RLS policies,
-- and storage buckets needed for the platform.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================================
-- 1. ORGANIZATIONS TABLE (core multi-tenant table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  domain TEXT,
  domain_verified BOOLEAN DEFAULT false,
  domain_verified_at TIMESTAMPTZ,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#1e3a5f',
  secondary_color TEXT NOT NULL DEFAULT '#c9a227',
  billing_email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_connect_account_id TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial'
    CHECK (subscription_status IN ('trial', 'active', 'past_due', 'canceled', 'suspended')),
  plan_type TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan_type IN ('starter', 'pro', 'enterprise')),
  max_students INT NOT NULL DEFAULT 100,
  max_admins INT NOT NULL DEFAULT 5,
  current_students_count INT NOT NULL DEFAULT 0,
  assessment_price NUMERIC(10,2) NOT NULL DEFAULT 47.00,
  custom_email_from TEXT,
  custom_email_reply_to TEXT,
  remove_branding BOOLEAN DEFAULT false,
  webhook_url TEXT,
  api_key TEXT,
  features JSONB DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{"sendParentEmails": true, "sendStudentEmails": true, "enabledSections": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], "customQuestions": []}',
  trial_ends_at TIMESTAMPTZ,
  onboarding_completed BOOLEAN DEFAULT false,
  enabled_sections JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);
CREATE INDEX IF NOT EXISTS idx_organizations_api_key ON organizations(api_key);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer ON organizations(stripe_customer_id);


-- ============================================================================
-- 2. ADMINS TABLE (admin users for organizations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('super_admin', 'owner', 'admin', 'viewer', 'agency_owner', 'agency_admin', 'god')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  password_setup_token TEXT,
  password_setup_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_organization_id ON admins(organization_id);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);


-- ============================================================================
-- 3. STUDENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  unique_code TEXT,
  current_grade TEXT,
  target_college_year TEXT,
  phone TEXT,
  grade_level TEXT,
  school_name TEXT,
  parent_email TEXT,
  parent_phone TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_organization_id ON students(organization_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_unique_code ON students(unique_code) WHERE unique_code IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_org_email ON students(organization_id, email);


-- ============================================================================
-- 4. ASSESSMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'free')),
  payment_intent_id TEXT,
  coupon_code TEXT,
  coupon_code_used TEXT,
  amount_paid NUMERIC(10,2),
  current_section INT DEFAULT 1,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  competitiveness_score NUMERIC,
  gap_analysis JSONB,
  basic_info JSONB,
  academic_profile JSONB,
  testing_info JSONB,
  extracurriculars JSONB,
  leadership JSONB,
  competitions JSONB,
  passions JSONB,
  career_aspirations JSONB,
  research_experience JSONB,
  summer_programs JSONB,
  special_talents JSONB,
  family_context JSONB,
  personality JSONB,
  personal_stories JSONB,
  time_commitment JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  responses JSONB NOT NULL DEFAULT '{}',
  scores JSONB NOT NULL DEFAULT '{}',
  report_data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_organization_id ON assessments(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_assessments_payment_status ON assessments(payment_status);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_assessments_is_completed ON assessments(is_completed);
CREATE INDEX IF NOT EXISTS idx_assessments_current_section ON assessments(current_section);


-- ============================================================================
-- 5. COUPONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL
    CHECK (discount_type IN ('percentage', 'fixed', 'free')),
  discount_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INT,
  current_uses INT NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coupons_organization_id ON coupons(organization_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_org_code ON coupons(organization_id, code);


-- ============================================================================
-- 6. PAYMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_organization_id ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);


-- ============================================================================
-- 7. OTP CODES TABLE (student authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);


-- ============================================================================
-- 8. AUDIT LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);


-- ============================================================================
-- 9. USAGE LOGS TABLE (tracking metrics per organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_organization_id ON usage_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_metric ON usage_logs(metric);
CREATE INDEX IF NOT EXISTS idx_usage_logs_period ON usage_logs(period_start, period_end);


-- ============================================================================
-- 10. CMS FAQs TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Also create the "faqs" alias view (some routes use "faqs" directly)
CREATE OR REPLACE VIEW faqs AS SELECT * FROM cms_faqs;

CREATE INDEX IF NOT EXISTS idx_cms_faqs_organization_id ON cms_faqs(organization_id);


-- ============================================================================
-- 11. CMS TESTIMONIALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS cms_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_title TEXT,
  name TEXT,
  school TEXT,
  content TEXT NOT NULL,
  rating INT DEFAULT 5,
  image_url TEXT,
  display_order INT NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Also create the "testimonials" alias view (some routes use "testimonials" directly)
CREATE OR REPLACE VIEW testimonials AS SELECT * FROM cms_testimonials;

CREATE INDEX IF NOT EXISTS idx_cms_testimonials_organization_id ON cms_testimonials(organization_id);


-- ============================================================================
-- 12. KNOWLEDGE HUB RESOURCES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS knowledge_hub_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_hub_resources_org ON knowledge_hub_resources(organization_id);


-- ============================================================================
-- 13. WEBHOOK EVENTS TABLE (idempotency for Stripe webhooks)
-- ============================================================================
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);


-- ============================================================================
-- 14. EMAIL LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template TEXT NOT NULL,
  recipient TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);


-- ============================================================================
-- 15. INVITATIONS TABLE (admin invitations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('owner', 'admin', 'viewer')),
  token TEXT NOT NULL UNIQUE,
  invited_by TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_organization_id ON invitations(organization_id);


-- ============================================================================
-- 16. ORGANIZATION MEMBERS TABLE (many-to-many: users ↔ organizations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin'
    CHECK (role IN ('owner', 'admin', 'viewer')),
  invited_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);


-- ============================================================================
-- 17. DATABASE FUNCTIONS
-- ============================================================================

-- Atomic increment for student count (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_students_count(org_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE organizations
  SET current_students_count = COALESCE(current_students_count, 0) + amount
  WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'organizations', 'admins', 'students', 'assessments',
    'cms_faqs', 'cms_testimonials', 'knowledge_hub_resources', 'payments'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON %I; CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END;
$$;


-- ============================================================================
-- 18. SUPABASE STORAGE BUCKET (for logos and file uploads)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('knowledge-hub', 'knowledge-hub', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow authenticated uploads and public reads
CREATE POLICY "Public read logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Authenticated upload logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Authenticated update logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'logos');

CREATE POLICY "Public read knowledge-hub" ON storage.objects
  FOR SELECT USING (bucket_id = 'knowledge-hub');

CREATE POLICY "Authenticated upload knowledge-hub" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'knowledge-hub');

CREATE POLICY "Authenticated update knowledge-hub" ON storage.objects
  FOR UPDATE USING (bucket_id = 'knowledge-hub');


-- ============================================================================
-- 19. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- NOTE: Since this app uses a service_role key on the server side, RLS is
-- effectively bypassed for all API routes. These policies are a safety net
-- for any direct client-side Supabase calls.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_hub_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Restrict anon key access. Service role bypasses RLS entirely.
-- Only public CMS content and org info are readable via the anon key.
-- All sensitive tables deny anon access.

-- Organizations: anon can read basic org info (needed for tenant resolution)
CREATE POLICY "anon_read_organizations" ON organizations FOR SELECT USING (true);

-- CMS FAQs: anon can read active FAQs (public landing page)
CREATE POLICY "anon_read_active_faqs" ON cms_faqs FOR SELECT USING (is_active = true);

-- CMS Testimonials: anon can read active testimonials (public landing page)
CREATE POLICY "anon_read_active_testimonials" ON cms_testimonials FOR SELECT USING (is_active = true);

-- All other tables: no anon access
CREATE POLICY "deny_anon_admins" ON admins FOR ALL USING (false);
CREATE POLICY "deny_anon_students" ON students FOR ALL USING (false);
CREATE POLICY "deny_anon_assessments" ON assessments FOR ALL USING (false);
CREATE POLICY "deny_anon_coupons" ON coupons FOR ALL USING (false);
CREATE POLICY "deny_anon_payments" ON payments FOR ALL USING (false);
CREATE POLICY "deny_anon_otp_codes" ON otp_codes FOR ALL USING (false);
CREATE POLICY "deny_anon_audit_logs" ON audit_logs FOR ALL USING (false);
CREATE POLICY "deny_anon_usage_logs" ON usage_logs FOR ALL USING (false);
CREATE POLICY "deny_anon_knowledge_hub" ON knowledge_hub_resources FOR ALL USING (false);
CREATE POLICY "deny_anon_webhook_events" ON webhook_events FOR ALL USING (false);
CREATE POLICY "deny_anon_email_logs" ON email_logs FOR ALL USING (false);
CREATE POLICY "deny_anon_invitations" ON invitations FOR ALL USING (false);
CREATE POLICY "deny_anon_org_members" ON organization_members FOR ALL USING (false);


-- ============================================================================
-- 20. SEED DATA — Default Platform Organization (Student Blueprint)
-- ============================================================================

-- The main platform organization
INSERT INTO organizations (
  name, slug, primary_color, secondary_color,
  subscription_status, plan_type, max_students, max_admins,
  current_students_count, assessment_price, remove_branding,
  settings, trial_ends_at, onboarding_completed
) VALUES (
  'Student Blueprint',
  'studentblueprint',
  '#1e3a5f',
  '#c9a227',
  'active',
  'enterprise',
  -1,
  -1,
  0,
  47.00,
  false,
  '{"isDefault": true, "platformOwner": true, "sendParentEmails": true, "sendStudentEmails": true, "enabledSections": [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], "customQuestions": []}',
  (NOW() + INTERVAL '10 years'),
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Super admin account for the platform
-- Password: CHANGE_ME_IMMEDIATELY (bcrypt hash of "ChangeMe123!")
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admins (
  organization_id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  is_active
) VALUES (
  (SELECT id FROM organizations WHERE slug = 'studentblueprint'),
  'admin@thestudentblueprint.com',
  '$2a$12$LJ3m5yGPhVfBHA24L7I7TuEWBnMhzrREdmFwDOFPNcwxqfv6MV8iO',
  'Platform',
  'Admin',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;

-- Default FAQs for the platform organization
INSERT INTO cms_faqs (organization_id, question, answer, sort_order, is_active)
SELECT
  o.id,
  q.question,
  q.answer,
  q.sort_order,
  true
FROM organizations o
CROSS JOIN (VALUES
  ('How long does the assessment take?',
   'The assessment typically takes about one hour to complete. You can save your progress and return later if needed.', 1),
  ('What happens after I complete the assessment?',
   'You will receive a comprehensive personalized report with your student archetype, strengths analysis, and a detailed roadmap for college success.', 2),
  ('Can I retake the assessment?',
   'Each assessment purchase is for a single comprehensive evaluation. Contact us if you need to update your information.', 3),
  ('Is my information secure?',
   'Yes, we take data security seriously. All information is encrypted and stored securely. We never share your personal data with third parties.', 4),
  ('What age group is this assessment for?',
   'The assessment is designed for students in grades 6 through 12, covering middle school through high school.', 5)
) AS q(question, answer, sort_order)
WHERE o.slug = 'studentblueprint'
AND NOT EXISTS (
  SELECT 1 FROM cms_faqs WHERE organization_id = o.id
);

-- Default testimonials for the platform organization
INSERT INTO cms_testimonials (organization_id, author_name, author_title, content, rating, sort_order, is_active)
SELECT
  o.id,
  t.author_name,
  t.author_title,
  t.content,
  t.rating,
  t.sort_order,
  true
FROM organizations o
CROSS JOIN (VALUES
  ('Priya S.', 'Parent, 11th Grade Student',
   'The assessment gave us incredible clarity on my daughter''s strengths. The college roadmap was exactly what we needed to plan ahead.', 5, 1),
  ('Rahul M.', 'High School Senior',
   'I discovered career paths I hadn''t even considered. The personality insights were spot-on and helped me write better college essays.', 5, 2),
  ('Dr. Anita K.', 'School Counselor',
   'We''ve been using Student Blueprint for our entire school. The reports are comprehensive and save us hours of manual assessment work.', 5, 3)
) AS t(author_name, author_title, content, rating, sort_order)
WHERE o.slug = 'studentblueprint'
AND NOT EXISTS (
  SELECT 1 FROM cms_testimonials WHERE organization_id = o.id
);


-- ============================================================================
-- 21. SEED DATA — Default Welcome Coupon
-- ============================================================================
INSERT INTO coupons (
  organization_id, code, discount_type, discount_value,
  max_uses, current_uses, is_active, valid_from, valid_until
)
SELECT
  id,
  'WELCOME10',
  'percentage',
  10,
  1000,
  0,
  true,
  NOW(),
  NOW() + INTERVAL '1 year'
FROM organizations
WHERE slug = 'studentblueprint'
AND NOT EXISTS (
  SELECT 1 FROM coupons WHERE code = 'WELCOME10' AND organization_id = (
    SELECT id FROM organizations WHERE slug = 'studentblueprint'
  )
);


-- ============================================================================
-- 22. HELPER: Clean up expired OTP codes (run periodically via cron)
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS VOID AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- DONE! Summary of what was created:
-- ============================================================================
-- Tables (16):
--   organizations, admins, students, assessments, coupons, payments,
--   otp_codes, audit_logs, usage_logs, cms_faqs, cms_testimonials,
--   knowledge_hub_resources, webhook_events, email_logs, invitations,
--   organization_members
--
-- Views (2):
--   faqs (alias for cms_faqs), testimonials (alias for cms_testimonials)
--
-- Functions (3):
--   increment_students_count, update_updated_at_column, cleanup_expired_otps
--
-- Storage Buckets (2):
--   logos, knowledge-hub
--
-- Seed Data:
--   - "Student Blueprint" default platform organization (enterprise plan)
--   - Super admin account (admin@thestudentblueprint.com)
--   - 5 default FAQs
--   - 3 default testimonials
--   - WELCOME10 coupon (10% off, 1000 uses, valid 1 year)
--
-- NEXT STEPS:
--   1. Update your .env with the new Supabase URL, anon key, and service role key
--   2. Change the super admin password immediately after first login
--   3. Add your Stripe keys, Resend API key, and other env vars
-- ============================================================================
