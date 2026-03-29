import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { resend } from "@/lib/resend"
import { callAI } from "@/lib/ai-caller"
import { buildStudentProfileContext, sanitizeForPrompt } from "@/lib/assessment-prompts"
import { fetchKnowledgeHubWithContent } from "@/lib/knowledge-hub-content"
import { savePhaseResults } from "@/lib/assessment-save"

// Allow up to 5 minutes for full regeneration (4 AI phases)
export const maxDuration = 300

export async function POST(request: NextRequest) {
  try {
    const adminId = request.cookies.get("admin_session")?.value
      || (() => {
        const token = request.cookies.get("admin_token")?.value
        if (!token) return null
        try { return Buffer.from(token, 'base64').toString().split(':')[0] } catch { return null }
      })()

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data: admin } = await supabase
      .from("admins")
      .select("id, role, is_active, organization_id")
      .eq("id", adminId)
      .eq("is_active", true)
      .single()

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized: admin not found or inactive" }, { status: 401 })
    }

    if (!['super_admin', 'owner', 'god'].includes(admin.role)) {
      return NextResponse.json({ error: "Only super admins or owners can regenerate reports" }, { status: 403 })
    }

    const { assessmentId } = await request.json()

    if (!assessmentId) {
      return NextResponse.json({ error: "Assessment ID is required" }, { status: 400 })
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .select(`
        *,
        students (
          id,
          email,
          full_name,
          current_grade,
          parent_email
        )
      `)
      .eq("id", assessmentId)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 })
    }

    if (assessment.status !== 'completed') {
      return NextResponse.json({ error: "Assessment is not completed yet" }, { status: 400 })
    }

    // Get form data from responses
    const formData = assessment.responses as Record<string, Record<string, unknown>>
    if (!formData || typeof formData !== 'object') {
      return NextResponse.json({ error: "Assessment has no saved responses" }, { status: 400 })
    }

    // Fetch knowledge hub resources
    const knowledgeHubResources = assessment.organization_id
      ? await fetchKnowledgeHubWithContent(assessment.organization_id)
      : []

    const { context: studentContext, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
    const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
    const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
    const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

    const SYSTEM = `You are an elite college admissions strategist who has placed 500+ students into Harvard, Stanford, MIT, Yale, Princeton, and other Top 20 universities. Every recommendation must be SPECIFIC (name real programs, professors, competitions), ACTIONABLE (concrete next steps), and AMBITIOUS. Respond ONLY with valid JSON, no additional text.`
    const GUIDELINES = `
IMPORTANT GUIDELINES:
1. If the student is from India, include local Indian competitions, hackathons, and opportunities.
2. If planning to study abroad, tailor recommendations to target countries.
3. Tailor to the student's location and curriculum (${curriculum}).
4. If school-specific resources are listed, PRIORITIZE those in recommendations.`

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allResults: Record<string, any> = {}

    // ── Phase 1: Core Analysis (REQUIRED — fail if this fails) ──
    console.log(`[Regenerate] Phase 1 starting for ${assessmentId}`)
    const phase1 = await callAI(`${SYSTEM}

Analyze this student and produce a brutally honest analysis:

${studentContext}
${GUIDELINES}

Generate JSON:
{
  "studentArchetype": "Unique 2-3 word archetype",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100,
  "strengthsAnalysis": { "competitiveAdvantages": ["5-6 items"], "uniqueDifferentiators": ["3-4 items"], "alignedActivities": ["4-5 items"] },
  "gapAnalysis": { "missingElements": ["EXACTLY 10 brutally honest gaps"], "activitiesToDeepen": ["3-4 items"], "skillsToDevelope": ["EXACTLY 10 skills — at least 5 AI skills"], "vulnerabilities": ["3-4 items"] },
  "roadmap": { "immediate": ["6-8 items"], "shortTerm": ["6-8 items"], "mediumTerm": ["5-6 items"], "longTerm": ["5-6 items"] },
  "gradeByGradeRoadmap": { "currentGrade": { "grade": "${currentGrade}", "focus": "focus", "academics": [], "extracurriculars": [], "testing": [], "leadership": [], "summerPlan": "plan" }, "nextYears": [] },
  "essayBrainstorm": [{ "title": "title", "hook": "hook", "narrative": "narrative", "connectingThreads": [], "whyItWorks": "why" }]
}
Generate exactly 5 essay ideas.`, 16000, 120000)

    if (!phase1.success) {
      console.error(`[Regenerate] Phase 1 FAILED:`, phase1.error)
      return NextResponse.json({ error: `Report generation failed: ${phase1.error}` }, { status: 503 })
    }
    Object.assign(allResults, phase1.data)
    console.log(`[Regenerate] Phase 1 done — ${allResults.studentArchetype}`)
    await savePhaseResults(assessmentId, allResults, 'partial')

    // ── Phase 2: Academics, Testing, Colleges, Career (non-fatal) ──
    console.log(`[Regenerate] Phase 2 starting`)
    const phase2 = await callAI(`${SYSTEM}
Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)
${studentContext}
${GUIDELINES}
Generate JSON:
{
  "academicCoursesRecommendations": { "apCourses": [], "ibCourses": [], "curriculumSpecificCourses": {"label": "curriculum", "courses": []}, "honorsCourses": [], "electivesRecommended": [] },
  "satActGoals": { "targetSATScore": "", "satSectionGoals": {"reading":"","math":""}, "targetACTScore": "", "actSectionGoals": {"english":"","math":"","reading":"","science":""}, "prepStrategy": "", "timeline": "" },
  "collegeRecommendations": { "collegeBreakdown": { "reach": ["10 schools"], "target": ["10 schools"], "safety": ["10 schools"] }, "schoolMatches": [{"schoolName":"","matchScore":0,"why":""}] },
  "careerRecommendations": { "jobTitles": [], "blueOceanIndustries": [{"industry":"","why":""}], "salaryPotential": "", "linkedInBioHeadline": "" }
}
Generate 12+ schoolMatches.`, 16000, 60000)
    if (phase2.success) { Object.assign(allResults, phase2.data); await savePhaseResults(assessmentId, allResults, 'partial') }
    else console.error(`[Regenerate] Phase 2 failed (non-fatal):`, phase2.error)

    // ── Phase 3: Projects, Research, Mentors (non-fatal) ──
    console.log(`[Regenerate] Phase 3 starting`)
    const phase3 = await callAI(`${SYSTEM}
Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)
${studentContext}
${GUIDELINES}
Generate JSON:
{
  "passionProjects": [{"title":"","description":"","timeCommitment":"","skillsDeveloped":[],"applicationImpact":"","resources":"","implementationSteps":[]}],
  "researchPublicationsRecommendations": { "researchTopics": [], "publicationOpportunities": [], "mentorshipSuggestions": [], "timeline": "" },
  "mentorRecommendations": { "mentors": [{"name":"","university":"","department":"","why":""}] },
  "wasteOfTimeActivities": { "activities": [{"activity":"","whyQuit":""}] }
}
Generate exactly 3 passion projects. Generate 5+ mentors.`, 10000, 60000)
    if (phase3.success) { Object.assign(allResults, phase3.data); await savePhaseResults(assessmentId, allResults, 'partial') }
    else console.error(`[Regenerate] Phase 3 failed (non-fatal):`, phase3.error)

    // ── Phase 4: Activities, Competitions, Summer Programs (non-fatal) ──
    console.log(`[Regenerate] Phase 4 starting`)
    const phase4 = await callAI(`${SYSTEM}
Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${allResults.studentArchetype} (Score: ${allResults.competitivenessScore}/100)
${studentContext}
${GUIDELINES}
Generate JSON with each activity as {name, description, dates, relevance}:
{
  "summerIvyProgramsRecommendations": { "preFreshmanPrograms": [], "competitivePrograms": [], "researchPrograms": [], "enrichmentPrograms": [] },
  "sportsRecommendations": { "varsitySports": [], "clubSports": [], "recruitingStrategy": [], "fitnessLeadership": [] },
  "competitionsRecommendations": { "academicCompetitions": [], "businessCompetitions": [], "artsCompetitions": [], "debateSpeech": [] },
  "internshipsRecommendations": { "industryInternships": [], "researchInternships": [], "nonprofitInternships": [], "virtualOpportunities": [] },
  "serviceCommunityRecommendations": { "localOpportunities": [], "nationalPrograms": [], "internationalService": [], "sustainedCommitment": [] },
  "cultureArtsRecommendations": { "performingArts": [], "visualArts": [], "creativeWriting": [], "culturalClubs": [] },
  "leadershipRecommendations": { "clubLeadership": [], "schoolWideRoles": [], "communityLeadership": [], "leadershipDevelopment": [] }
}
Be SPECIFIC — name real programs, competitions, deadlines.`, 12000, 60000)
    if (phase4.success) { Object.assign(allResults, phase4.data) }
    else console.error(`[Regenerate] Phase 4 failed (non-fatal):`, phase4.error)

    // ── Final save ──
    await savePhaseResults(assessmentId, allResults, 'completed')
    console.log(`[Regenerate] All phases complete for ${assessmentId}`)

    // ── Send notification email (non-blocking) ──
    try {
      const studentRaw = assessment.students
      const student = Array.isArray(studentRaw) ? studentRaw[0] : studentRaw

      if (student?.email) {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://thestudentblueprint.com'}/results/${assessmentId}`
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'The Student Blueprint Team <hello@thestudentblueprint.com>'

        await resend.emails.send({
          from: fromEmail,
          to: [student.email],
          subject: "Your Updated The Student Blueprint Report is Ready!",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f1520 0%, #1e3a5f 50%, #2a4a6f 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.5);">
        <tr><td style="background: linear-gradient(135deg, #1e3a5f 0%, #152a45 100%); padding: 50px 40px; text-align: center;">
          <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 32px; font-weight: 800;">Report Updated!</h1>
          <p style="margin: 0; color: #c9a227; font-size: 16px; font-weight: 600;">Fresh Insights & Recommendations</p>
        </td></tr>
        <tr><td style="padding: 50px 40px;">
          <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 24px; font-weight: 700;">Hi ${student.full_name || "there"}!</h2>
          <p style="margin: 0 0 30px; color: #5a7a9a; font-size: 16px; line-height: 1.7;">We've regenerated your assessment with the latest analysis and enhanced recommendations.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
            <tr>
              <td width="50%" style="padding-right: 8px;">
                <div style="background: #fef9e7; border: 2px solid #c9a227; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="margin: 0 0 8px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Archetype</p>
                  <h3 style="margin: 0; color: #1e3a5f; font-size: 18px; font-weight: 800;">${allResults.studentArchetype}</h3>
                </div>
              </td>
              <td width="50%" style="padding-left: 8px;">
                <div style="background: #e8f4f8; border: 2px solid #5a7a9a; border-radius: 12px; padding: 20px; text-align: center;">
                  <p style="margin: 0 0 8px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Score</p>
                  <h3 style="margin: 0; color: #1e3a5f; font-size: 24px; font-weight: 800;"><span style="color: #c9a227;">${allResults.competitivenessScore}</span>/100</h3>
                </div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1e3a5f; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 17px;">View Updated Report</a>
          </div>
        </td></tr>
        <tr><td style="background: #1e3a5f; padding: 40px; text-align: center;">
          <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 800;">The Student Blueprint</h4>
          <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 13px;">Questions? We're here to help!</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
          `,
        })
      }
    } catch (emailError) {
      console.error("[Regenerate] Failed to send email (non-fatal):", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Report regenerated successfully",
      archetype: allResults.studentArchetype,
      competitivenessScore: allResults.competitivenessScore,
    })
  } catch (error) {
    console.error("[Regenerate] Error:", error)
    return NextResponse.json(
      { error: "Failed to regenerate report" },
      { status: 500 }
    )
  }
}
