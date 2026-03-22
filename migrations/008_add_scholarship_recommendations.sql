-- Add scholarship_recommendations column to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS scholarship_recommendations JSONB;
