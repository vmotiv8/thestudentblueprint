-- Add student_type column to assessments table
-- Tracks which student segment this assessment is for (K-5, middle, high school, undergrad, grad, PhD)
ALTER TABLE assessments
  ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'high_school'
  CHECK (student_type IN ('elementary', 'middle', 'high_school', 'undergrad', 'grad', 'phd'));

-- Backfill existing rows
UPDATE assessments SET student_type = 'high_school' WHERE student_type IS NULL;

-- Add index for filtering/reporting by student type
CREATE INDEX IF NOT EXISTS idx_assessments_student_type ON assessments (student_type);
