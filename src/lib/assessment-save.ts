/**
 * Shared assessment save logic for all phase processing routes.
 */
import { createServerSupabaseClient } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Results = Record<string, any>

/**
 * Save phase results to the assessment record.
 * Maps camelCase AI output keys to snake_case database columns.
 */
export async function savePhaseResults(
  assessmentId: string,
  results: Results,
  status: 'partial' | 'completed',
  phaseStatus?: Record<string, string>,
): Promise<void> {
  const supabase = createServerSupabaseClient()

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }
  if (status === 'completed') update.completed_at = new Date().toISOString()
  // phase_status column may not exist yet if migration hasn't been run
  // We'll set it but handle the error gracefully below

  // Map AI output keys → DB columns (only write what exists)
  if (results.studentArchetype) update.student_archetype = results.studentArchetype
  if (results.archetypeScores) update.archetype_scores = results.archetypeScores
  if (results.competitivenessScore != null) {
    update.competitiveness_score = results.competitivenessScore
    update.scores = { competitivenessScore: results.competitivenessScore, archetypeScores: results.archetypeScores }
  }
  if (results.roadmap) update.roadmap_data = results.roadmap
  if (results.strengthsAnalysis) update.strengths_analysis = results.strengthsAnalysis
  if (results.gapAnalysis) update.gap_analysis = results.gapAnalysis
  if (results.gradeByGradeRoadmap) update.grade_by_grade_roadmap = results.gradeByGradeRoadmap
  if (results.essayBrainstorm) update.report_data = { essayBrainstorm: results.essayBrainstorm }
  if (results.passionProjects) update.passion_projects = results.passionProjects
  if (results.academicCoursesRecommendations) update.academic_courses_recommendations = results.academicCoursesRecommendations
  if (results.satActGoals) update.sat_act_goals = results.satActGoals
  if (results.researchPublicationsRecommendations) update.research_publications_recommendations = results.researchPublicationsRecommendations
  if (results.leadershipRecommendations) update.leadership_recommendations = results.leadershipRecommendations
  if (results.serviceCommunityRecommendations) update.service_community_recommendations = results.serviceCommunityRecommendations
  if (results.summerIvyProgramsRecommendations) update.summer_ivy_programs_recommendations = results.summerIvyProgramsRecommendations
  if (results.sportsRecommendations) update.sports_recommendations = results.sportsRecommendations
  if (results.competitionsRecommendations) update.competitions_recommendations = results.competitionsRecommendations
  if (results.studentGovernmentRecommendations) update.student_government_recommendations = results.studentGovernmentRecommendations
  if (results.internshipsRecommendations) update.internships_recommendations = results.internshipsRecommendations
  if (results.cultureArtsRecommendations) update.culture_arts_recommendations = results.cultureArtsRecommendations
  if (results.careerRecommendations) update.career_recommendations = results.careerRecommendations
  if (results.collegeRecommendations) update.college_recommendations = results.collegeRecommendations
  if (results.mentorRecommendations) update.mentor_recommendations = results.mentorRecommendations
  if (results.wasteOfTimeActivities) update.waste_of_time_activities = results.wasteOfTimeActivities
  if (results.scholarshipRecommendations) update.scholarship_recommendations = results.scholarshipRecommendations

  // Try with phase_status first, fall back without it if column doesn't exist
  if (phaseStatus) update.phase_status = phaseStatus

  let { error } = await supabase.from('assessments').update(update).eq('id', assessmentId)

  // If phase_status column doesn't exist yet, retry without it
  if (error?.message?.includes('phase_status')) {
    delete update.phase_status
    const retry = await supabase.from('assessments').update(update).eq('id', assessmentId)
    error = retry.error
  }

  if (error) {
    // If 'partial' status fails (CHECK constraint), retry with 'in_progress'
    if (status === 'partial' && (error.message?.includes('check') || error.code === '23514')) {
      update.status = 'in_progress'
      const { error: retryErr } = await supabase.from('assessments').update(update).eq('id', assessmentId)
      if (retryErr) console.error(`[Save] Retry failed for ${assessmentId}:`, retryErr.message)
    } else {
      console.error(`[Save] Failed for ${assessmentId}:`, error.message)
    }
  }
}

/**
 * Get the current phase_status for an assessment, updating it with the new phase state.
 */
export async function updatePhaseStatus(
  assessmentId: string,
  phase: string,
  state: 'completed' | 'failed',
): Promise<{ phaseStatus: Record<string, string>; allCompleted: boolean }> {
  const supabase = createServerSupabaseClient()

  const { data } = await supabase
    .from('assessments')
    .select('phase_status')
    .eq('id', assessmentId)
    .single()

  const phaseStatus = (data?.phase_status || {}) as Record<string, string>
  phaseStatus[phase] = state

  const allCompleted = ['phase1', 'phase2', 'phase3', 'phase4'].every(
    p => phaseStatus[p] === 'completed'
  )

  return { phaseStatus, allCompleted }
}
