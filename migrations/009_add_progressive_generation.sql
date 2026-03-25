-- Migration 009: Add progressive generation support
-- Enables two-phase AI analysis so students see core results faster

ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS generation_phase smallint DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS phase2_started_at timestamptz DEFAULT NULL;

-- Index for efficiently finding assessments stuck in partial state
CREATE INDEX IF NOT EXISTS idx_assessments_partial_status
  ON assessments (status, phase2_started_at)
  WHERE status = 'partial';
