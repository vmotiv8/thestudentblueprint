-- ============================================================================
-- MIGRATION 004: Add Assessment Report Columns
-- ============================================================================
-- Adds missing JSONB/TEXT columns on the assessments table that are used by
-- the results page, PDF generation, assessment submission, report regeneration,
-- and the demo route.
-- Run this in Supabase SQL Editor.
-- ============================================================================

-- Core analysis fields
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS student_archetype TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS archetype_scores JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS roadmap_data JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS grade_by_grade_roadmap JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS strengths_analysis JSONB;

-- Recommendation sections
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS passion_projects JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS academic_courses_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS sat_act_goals JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS research_publications_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS leadership_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS service_community_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS summer_ivy_programs_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS sports_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS competitions_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS student_government_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS internships_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS culture_arts_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS career_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS college_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS mentor_recommendations JSONB;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS waste_of_time_activities JSONB;
