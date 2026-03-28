-- ============================================================
-- VMotiv8 Referral Partner System — Database Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. REFERRAL DISCOUNT TIERS
CREATE TABLE IF NOT EXISTS referral_discount_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  discount_percent integer NOT NULL CHECK (discount_percent BETWEEN 1 AND 50),
  discounted_price numeric GENERATED ALWAYS AS (497.00 * (1 - discount_percent / 100.0)) STORED,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 2. REFERRAL PARTNERS
CREATE TABLE IF NOT EXISTS referral_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  organization text,
  referral_code text NOT NULL UNIQUE,
  discount_tier_id uuid REFERENCES referral_discount_tiers(id),
  status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  created_by uuid
);

-- 3. REFERRAL STUDENTS
CREATE TABLE IF NOT EXISTS referral_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES referral_partners(id) ON DELETE CASCADE,
  student_email text NOT NULL,
  student_name text,
  current_section integer DEFAULT 0,
  total_sections integer DEFAULT 14,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  sale_amount numeric,
  stripe_session_id text,
  created_at timestamptz DEFAULT now()
);

-- 4. REFERRAL COMMISSIONS
CREATE TABLE IF NOT EXISTS referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES referral_partners(id) ON DELETE CASCADE,
  referral_student_id uuid REFERENCES referral_students(id),
  sale_amount numeric NOT NULL,
  commission_amount numeric NOT NULL,
  paid_out boolean DEFAULT false,
  paid_out_at timestamptz,
  paid_out_by uuid,
  created_at timestamptz DEFAULT now()
);

-- 5. REFERRAL PAYMENT INFO
CREATE TABLE IF NOT EXISTS referral_payment_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES referral_partners(id) ON DELETE CASCADE UNIQUE,
  preferred_method text CHECK (preferred_method IN ('venmo', 'paypal', 'zelle', 'bank', 'other')),
  venmo_username text,
  paypal_email text,
  zelle_phone text,
  zelle_email text,
  bank_account_name text,
  bank_routing_number text,
  bank_account_number_last4 text,
  other_instructions text,
  contact_phone text,
  contact_email text,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- TRIGGER: Auto-create commission when referral_students.payment_status → 'paid'
-- ============================================================

CREATE OR REPLACE FUNCTION create_referral_commission()
RETURNS TRIGGER AS $$
BEGIN
  -- Only fire when payment_status changes to 'paid'
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    -- Check that a commission doesn't already exist for this student
    IF NOT EXISTS (
      SELECT 1 FROM referral_commissions WHERE referral_student_id = NEW.id
    ) THEN
      INSERT INTO referral_commissions (
        partner_id,
        referral_student_id,
        sale_amount,
        commission_amount
      ) VALUES (
        NEW.partner_id,
        NEW.id,
        COALESCE(NEW.sale_amount, 0),
        COALESCE(NEW.sale_amount, 0) * 0.20
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_referral_commission
  AFTER UPDATE ON referral_students
  FOR EACH ROW
  EXECUTE FUNCTION create_referral_commission();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE referral_discount_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_payment_info ENABLE ROW LEVEL SECURITY;

-- Service role (used by all API routes) bypasses RLS automatically.
-- These policies are for anon/authenticated client-side access from the partner portal.

-- referral_discount_tiers: anyone authenticated can read active tiers
CREATE POLICY "Anyone can read active tiers"
  ON referral_discount_tiers FOR SELECT
  USING (is_active = true);

-- referral_partners: no client-side access (server-side only via service role)
CREATE POLICY "No direct partner access"
  ON referral_partners FOR SELECT
  USING (false);

-- referral_students: partners can read their own referred students
CREATE POLICY "Partners can read own referral students"
  ON referral_students FOR SELECT
  USING (
    partner_id IN (
      SELECT rp.id FROM referral_partners rp
      WHERE rp.email = (SELECT auth.email())
    )
  );

-- referral_commissions: partners can read their own commissions
CREATE POLICY "Partners can read own commissions"
  ON referral_commissions FOR SELECT
  USING (
    partner_id IN (
      SELECT rp.id FROM referral_partners rp
      WHERE rp.email = (SELECT auth.email())
    )
  );

-- referral_payment_info: partners can read and update their own payment info
CREATE POLICY "Partners can read own payment info"
  ON referral_payment_info FOR SELECT
  USING (
    partner_id IN (
      SELECT rp.id FROM referral_partners rp
      WHERE rp.email = (SELECT auth.email())
    )
  );

CREATE POLICY "Partners can update own payment info"
  ON referral_payment_info FOR UPDATE
  USING (
    partner_id IN (
      SELECT rp.id FROM referral_partners rp
      WHERE rp.email = (SELECT auth.email())
    )
  );

CREATE POLICY "Partners can insert own payment info"
  ON referral_payment_info FOR INSERT
  WITH CHECK (
    partner_id IN (
      SELECT rp.id FROM referral_partners rp
      WHERE rp.email = (SELECT auth.email())
    )
  );

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_referral_partners_code ON referral_partners(referral_code);
CREATE INDEX idx_referral_partners_email ON referral_partners(email);
CREATE INDEX idx_referral_students_partner ON referral_students(partner_id);
CREATE INDEX idx_referral_students_email ON referral_students(student_email);
CREATE INDEX idx_referral_students_stripe ON referral_students(stripe_session_id);
CREATE INDEX idx_referral_commissions_partner ON referral_commissions(partner_id);
CREATE INDEX idx_referral_commissions_unpaid ON referral_commissions(partner_id) WHERE paid_out = false;
