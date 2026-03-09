-- Migration: Atomic student count increment + domain verification fields
-- Run this in Supabase SQL Editor

-- 1. Atomic increment function for student counts (prevents race conditions)
CREATE OR REPLACE FUNCTION increment_students_count(org_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE organizations
  SET current_students_count = COALESCE(current_students_count, 0) + amount
  WHERE id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Domain verification fields (if not already added)
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain_verified BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMPTZ;

-- Mark existing domains as verified (they passed DNS check already)
UPDATE organizations SET domain_verified = true, domain_verified_at = NOW() WHERE domain IS NOT NULL AND domain != '';

-- 3. Webhook events table for idempotency
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Email logs table for tracking
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template TEXT NOT NULL,
  recipient TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
