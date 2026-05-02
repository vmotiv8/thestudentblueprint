-- Migration 012: Coupon metadata used by admin dashboards
-- Run this in Supabase SQL Editor after the previous migrations.

ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS notes TEXT;
