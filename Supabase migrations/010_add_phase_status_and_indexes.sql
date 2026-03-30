-- Migration 010: Add phase_status column and scaling indexes
-- Supports async queue-based assessment generation with per-phase tracking

-- Phase status tracking for async processing
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS phase_status JSONB NOT NULL DEFAULT '{}';

-- PDF cache invalidation
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS pdf_generated_at TIMESTAMPTZ;

-- Composite index for polling queries (frontend polls by id + status)
CREATE INDEX IF NOT EXISTS idx_assessments_id_status ON assessments(id, status);

-- Index for stuck assessment detection
CREATE INDEX IF NOT EXISTS idx_assessments_stuck ON assessments(status, updated_at)
  WHERE status IN ('in_progress', 'partial');

-- Comment for documentation
COMMENT ON COLUMN assessments.phase_status IS 'Tracks async phase completion: {"phase1": "completed", "phase2": "processing", ...}';
COMMENT ON COLUMN assessments.pdf_generated_at IS 'Timestamp of last cached PDF generation for cache invalidation';
