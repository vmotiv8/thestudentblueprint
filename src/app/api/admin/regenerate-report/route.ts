import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { resend } from "@/lib/resend"
import Anthropic from '@anthropic-ai/sdk'

// Sanitize free-text input before sending to the AI prompt.
function sanitizeForPrompt(value: unknown, maxLength = 1000): string {
  if (value === null || value === undefined) return ''
  let text = typeof value === 'string' ? value : String(value)

  const injectionPatterns = /^(you are|ignore previous|system:|assistant:|human:|forget all|disregard|override|new instructions|<\/?s>|<\|)/im
  text = text
    .split('\n')
    .filter(line => !injectionPatterns.test(line.trim()))
    .join('\n')

  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + '...[truncated]'
  }

  text = text.replace(/`/g, "'").replace(/\$\{/g, '(')

  return text
}

export async function POST(request: NextRequest) {
  try {
    // Support both cookie formats: admin_session (standard) and admin_token (legacy)
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

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 500 })
    }

    // Fetch knowledge hub resources for the organization to enrich the AI prompt
    let knowledgeHubResources: { type: string; title: string; description: string | null }[] = []
    if (assessment.organization_id) {
      const { data: khData } = await supabase
        .from('knowledge_hub_resources')
        .select('type, title, description')
        .eq('organization_id', assessment.organization_id)
      knowledgeHubResources = khData || []
    }

    const khByType: Record<string, string[]> = {}
    for (const r of knowledgeHubResources) {
      if (!khByType[r.type]) khByType[r.type] = []
      khByType[r.type].push(r.description ? `${r.title} (${r.description})` : r.title)
    }
    const khSection = Object.keys(khByType).length > 0
      ? '\nSCHOOL-SPECIFIC RESOURCES (uploaded by the student\'s school — prioritize these in your recommendations):\n' +
        Object.entries(khByType)
          .map(([type, items]) => `- ${type.replace(/_/g, ' ')}: ${items.join('; ')}`)
          .join('\n')
      : ''

    const currentGrade = assessment.students?.current_grade || assessment.basic_info?.currentGrade || '10th Grade'

    // Sanitize the assessment data before including in the prompt
    const sanitizedAssessment = sanitizeForPrompt(JSON.stringify(assessment), 10000)

    const prompt = `You are an expert college admissions counselor and academic success strategist specializing in Ivy League and Top 20 college admissions with 15+ years of experience. Your students have been accepted to Harvard, Stanford, MIT, Yale, Princeton, and other elite institutions. You understand what sets apart successful applicants: intellectual vitality, demonstrated impact, authentic passion, and a compelling narrative.

CRITICAL: Your recommendations MUST be specific, actionable, and prestigious. Avoid generic advice. Focus on opportunities that demonstrate exceptional achievement and differentiation. Think about what would impress admissions officers at Harvard, Stanford, MIT, Yale, and Princeton.

Analyze this comprehensive student profile and create a personalized roadmap to maximize their college application competitiveness.

STUDENT PROFILE:
${sanitizedAssessment}
${khSection}

  Generate a comprehensive analysis with the following structure in JSON format:
  {
    "studentArchetype": "A unique 2-3 word descriptor (e.g., 'Analytical Entrepreneur', 'Creative Humanitarian')",
    "archetypeScores": {
      "Visionary": number 0-100,
      "Builder": number 0-100,
      "Healer": number 0-100,
      "Analyst": number 0-100,
      "Artist": number 0-100,
      "Advocate": number 0-100,
      "Entrepreneur": number 0-100,
      "Researcher": number 0-100
    },
    "strengthsAnalysis": {
      "competitiveAdvantages": ["3 specific competitive advantages with concrete examples"],
      "uniqueDifferentiators": ["2-3 unique differentiators that make them stand out"],
      "alignedActivities": ["Specific activities that match their passions"]
    },
    "gapAnalysis": {
      "missingElements": ["3-4 specific elements missing for target schools"],
      "activitiesToDeepen": ["2-3 activities needing more depth"],
      "skillsToDevelope": ["3-4 skills needed for career goals"]
    },
    "roadmap": {
      "immediate": ["4-5 specific high-impact actions for next 3 months. Include specific names of programs, competitions, and opportunities."],
      "shortTerm": ["4-5 detailed goals for 3-6 months focused on building a 'spike'."],
      "mediumTerm": ["4-5 transformative projects for 6-12 months that create measurable community impact."],
      "longTerm": ["4-5 trajectory items for 1+ years."]
    },
    "gradeByGradeRoadmap": {
        "currentGrade": {
          "grade": "${currentGrade}",
          "focus": "Main focus areas for this year, specific to their current development stage",
          "academics": ["3-4 highly descriptive academic goals. Each must be a full sentence (15+ words) explaining the 'why' and 'how'."],
          "extracurriculars": ["3-4 specific extracurricular actions. Avoid repetition from previous sections. Be age-appropriate."],
          "testing": ["2-3 testing milestones (e.g., PSAT 8/9 for younger, SAT/ACT for older)"],
          "leadership": ["2-3 leadership opportunities. MUST be age-appropriate. Do NOT suggest mentoring or major founding roles for 8th/9th graders unless they are already at that level."],
          "summerPlan": "A descriptive, 2-3 sentence summer plan that bridges to the next grade level."
        },
        "nextYears": "CRITICAL: This MUST be an array containing ONE object for EACH subsequent grade until 12th Grade graduation. If student is in 8th Grade, include 4 objects (9th, 10th, 11th, 12th). If 9th, include 3 objects (10th, 11th, 12th). Each object must be increasingly sophisticated and avoid any repetition of advice from previous years. Each goal must be a detailed, descriptive sentence."
      },
    "academicCoursesRecommendations": {
      "apCourses": ["4-5 specific AP courses with detailed reasoning"],
      "ibCourses": ["IB courses if applicable"],
      "honorsCourses": ["3-4 Advanced/Honors courses"],
      "electivesRecommended": ["3-4 strategic electives"]
    },
  "satActGoals": {
    "targetSATScore": "Target composite score",
    "satSectionGoals": { "reading": "target", "writing": "target", "math": "target" },
    "targetACTScore": "Target composite score",
    "actSectionGoals": { "english": "target", "math": "target", "reading": "target", "science": "target" },
    "prepStrategy": "Recommended preparation approach",
    "timeline": "When to take tests"
  },
    "researchPublicationsRecommendations": {
      "researchTopics": ["4-5 cutting-edge, specific research topics with concrete research questions."],
      "publicationOpportunities": ["3-4 prestigious publication venues."],
      "mentorshipSuggestions": ["3-4 concrete strategies for finding research mentors."],
      "timeline": "Detailed timeline for research activities"
    },
    "leadershipRecommendations": {
      "clubLeadership": ["3-4 specific leadership positions"],
      "schoolWideRoles": ["2-3 student body/class officer positions"],
      "communityLeadership": ["3-4 external leadership opportunities"],
      "leadershipDevelopment": ["4-5 specific skills and experiences"]
    },
    "serviceCommunityRecommendations": {
      "localOpportunities": ["4-5 specific community service opportunities"],
      "nationalPrograms": ["3-4 national service programs"],
      "internationalService": ["2-3 international volunteer opportunities"],
      "sustainedCommitment": ["3-4 strategies for impact metrics"]
    },
    "summerIvyProgramsRecommendations": {
      "preFreshmanPrograms": ["3-4 prestigious pre-college programs."],
      "competitivePrograms": ["4-5 selective summer programs"],
      "researchPrograms": ["4-5 summer research opportunities"],
      "enrichmentPrograms": ["3-4 academic enrichment programs"]
    },
    "sportsRecommendations": {
      "varsitySports": ["2-3 sports recommendations"],
      "clubSports": ["2-3 club/travel team opportunities"],
      "recruitingStrategy": ["3-4 athletic recruiting tips"],
      "fitnessLeadership": ["2-3 leadership opportunities in fitness"]
    },
    "competitionsRecommendations": {
      "academicCompetitions": ["5-6 national/international level competitions."],
      "businessCompetitions": ["4-5 elite business competitions."],
      "artsCompetitions": ["4-5 nationally recognized arts competitions."],
      "debateSpeech": ["4-5 elite debate/speech competitions."]
    },
    "studentGovernmentRecommendations": {
      "schoolGovernment": ["3-4 student council positions"],
      "districtStateRoles": ["2-3 district/state advisory roles"],
      "youthGovernment": ["3-4 youth government programs"],
      "advocacyRoles": ["3-4 student advocacy positions"]
    },
    "internshipsRecommendations": {
      "industryInternships": ["4-5 specific internships"],
      "researchInternships": ["4-5 lab/research positions"],
      "nonprofitInternships": ["3-4 nonprofit opportunities"],
      "virtualOpportunities": ["3-4 remote internships"]
    },
    "cultureArtsRecommendations": {
      "performingArts": ["3-4 performing arts opportunities"],
      "visualArts": ["3-4 visual arts projects"],
      "creativeWriting": ["4-5 publications and literary magazines"],
      "culturalClubs": ["3-4 heritage/cultural organizations"]
    },
    "passionProjects": [
      {
        "title": "Specific project title",
        "description": "Detailed description with concrete steps",
        "timeCommitment": "Specific hours per week",
        "skillsDeveloped": ["3-4 specific skills"],
        "applicationImpact": "Detailed explanation of impact",
        "resources": "List of resources",
        "implementationSteps": ["4-5 step-by-step actions"]
      }
    ],
    "careerRecommendations": {
      "jobTitles": ["3 specific job titles"],
      "blueOceanIndustries": [
        { "industry": "Name of industry", "why": "Explanation of why this fits." }
      ],
      "salaryPotential": "Description of salary potential",
      "linkedInBioHeadline": "A professional headline"
    },
    "collegeRecommendations": {
      "collegeBreakdown": {
        "reach": ["3 reach schools"],
        "target": ["3 target schools"],
        "safety": ["3 safety schools"]
      },
      "schoolMatches": [
        { "schoolName": "University Name", "matchScore": number 0-100, "why": "Detailed explanation." }
      ]
    },
    "mentorRecommendations": {
      "mentors": [
        { "name": "Dr. Name", "university": "University Name", "department": "Department", "why": "Explanation." }
      ]
    },
    "wasteOfTimeActivities": {
      "activities": [
        { "activity": "Activity to stop", "whyQuit": "Reason why it doesn't align." }
      ]
    },
    "competitivenessScore": number 0-100
  }

  Respond ONLY with valid JSON, no additional text.`

    const client = new Anthropic({ apiKey })
    const TIMEOUT_MS = 120000
    const result = await Promise.race([
      client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Claude API timeout after 120s')), TIMEOUT_MS)
      ),
    ])

    const textBlock = result.content.find(block => block.type === 'text')
    const text = textBlock?.text || ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

      let analysisResult;
      try {
        const jsonText = jsonMatch[0];
        analysisResult = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("JSON parse error from AI response:", parseError);
        console.error("Raw text that failed parsing:", text);
        throw new Error("AI returned invalid JSON structure");
      }

      if (!analysisResult.studentArchetype || !analysisResult.competitivenessScore) {
        console.error("AI response missing critical fields:", analysisResult);
        throw new Error("AI response missing critical fields (archetype or score)");
      }

      // Ensure nextYears is properly populated if AI didn't generate it
        if (analysisResult.gradeByGradeRoadmap) {
          const gradeMap: Record<string, string[]> = {
            '6th Grade': ['7th Grade', '8th Grade', '9th Grade (Freshman)', '10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)'],
            '7th Grade': ['8th Grade', '9th Grade (Freshman)', '10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)'],
            '8th Grade': ['9th Grade (Freshman)', '10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)'],
            '9th Grade': ['10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)'],
            '9th Grade (Freshman)': ['10th Grade (Sophomore)', '11th Grade (Junior)', '12th Grade (Senior)'],
            '10th Grade': ['11th Grade (Junior)', '12th Grade (Senior)'],
            '10th Grade (Sophomore)': ['11th Grade (Junior)', '12th Grade (Senior)'],
            '11th Grade': ['12th Grade (Senior)'],
            '11th Grade (Junior)': ['12th Grade (Senior)'],
            '12th Grade': [],
            '12th Grade (Senior)': []
          }

          const currentGradeValue = analysisResult.gradeByGradeRoadmap.currentGrade?.grade || currentGrade
          const futureGrades = gradeMap[currentGradeValue] || gradeMap[currentGrade] || []

          if (!Array.isArray(analysisResult.gradeByGradeRoadmap.nextYears) || analysisResult.gradeByGradeRoadmap.nextYears.length === 0) {
            analysisResult.gradeByGradeRoadmap.nextYears = futureGrades.map((grade) => ({
              grade,
              focus: grade.includes('12th')
                ? "Legacy and Application Excellence: finalizing your narrative and ensuring your impact lasts beyond your time in high school."
                : grade.includes('11th')
                ? "The 'Spike' Year: achieving peak performance in testing, leadership, and national-level recognitions."
                : "Deepening and Leading: taking on significant responsibilities and launching your primary independent initiatives.",
              academics: grade.includes('12th')
                ? [
                    "Maintain 'Full Rigor' with 5-6 AP/IB courses to show colleges you are not slowing down in your final year.",
                    "Execute an Independent Study or Capstone project that synthesizes your academic interests and shows mastery.",
                    "Maintain a top-tier GPA through the first semester, as mid-year reports are critical for Regular Decision.",
                    "Assist younger students in advanced subjects to demonstrate deep mastery and a collaborative spirit."
                  ]
                : grade.includes('11th')
                ? [
                    "Take 5-7 AP/IB courses, focusing on 'core' subjects that align with your intended major or spike.",
                    "Achieve your highest possible GPA—this is the most important academic year for college admissions evaluation.",
                    "Demonstrate intellectual vitality by taking a college-level course at a local university or through an elite online portal.",
                    "Prepare for and excel in AP exams to earn 'AP Scholar with Distinction' or similar regional/national honors."
                  ]
                : [
                    "Increase your academic rigor significantly by taking your first 2-3 AP courses in subjects you excel in.",
                    "Focus on 'Academic Depth'—going beyond the syllabus by joining related academic teams like Mathletes or Science Bowl.",
                    "Achieve a GPA that puts you in the top 5-10% of your class to stay competitive for Ivy League admissions.",
                    "Develop advanced research and writing skills through honors-level English and social science coursework."
                  ],
              extracurriculars: grade.includes('12th')
                ? [
                    "Solidify your legacy by ensuring your founded projects or club initiatives have a clear, sustainable future.",
                    "Curate your 'Activities List' for applications, focusing on impact metrics (e.g., 'Raised $5,000', 'Impacted 200 kids').",
                    "Complete a senior capstone project that serves as the 'final word' on your high school extracurricular journey.",
                    "Mentor incoming freshmen and sophomores to share the systems you've built for success and impact."
                  ]
                : grade.includes('11th')
                ? [
                    "Achieve 'National Recognition' in your primary activities through prestigious competitions or awards.",
                    "Scale your passion project to its maximum height, potentially seeking external funding or major partnerships.",
                    "Focus on 'Impact at Scale'—shifting from local school impact to city, state, or national-level influence.",
                    "Balance your deep commitments with 1-2 strategic new initiatives that round out your 'spike' narrative."
                  ]
                : [
                    "Win a significant leadership election (e.g., VP, Secretary) or be appointed to a major committee chair role.",
                    "Transition your passion project from the 'Idea Phase' to a 'Pilot Phase' with at least 50 active beneficiaries.",
                    "Start competing in regional competitions to build a track record that will support national bids in 11th grade.",
                    "Develop a 'niche expertise' in one specific area of your extracurricular work to become the go-to person."
                  ],
              testing: grade.includes('12th')
                ? [
                    "Only retake the SAT/ACT if your current score is significantly below the 25th percentile of your target schools.",
                    "Focus on AP exams in May to earn college credit and finalize your academic profile with top-tier scores.",
                    "Complete any remaining subject-specific requirements for international schools if you are applying abroad."
                  ]
                : grade.includes('11th')
                ? [
                    "Achieve your target SAT/ACT score (e.g., 1550+ or 35+) by the end of the spring semester to clear your senior year.",
                    "Take the PSAT/NMSQT with the goal of qualifying for National Merit Scholarship recognition.",
                    "Coordinate your test prep with your most rigorous AP exams to maximize efficiency in subject mastery."
                  ]
                : [
                    "Begin a structured SAT/ACT prep program 3-4 months before your first official sitting in late spring.",
                    "Take the PSAT 10 to identify specific areas of weakness and track your improvement from 9th grade baseline.",
                    "Consider taking 1-2 SAT Subject Tests (if still relevant for your targets) or subject-specific diagnostic tests."
                  ],
              leadership: grade.includes('12th')
                ? [
                    "Serve as a Senior Advisor or Board Member, focusing on institutional strategy and transition planning.",
                    "Organize a major school-wide or community summit that brings together all your years of work and impact.",
                    "Write a 'Leadership Manual' for your successors to ensure your impact doesn't fade after you graduate.",
                    "Collaborate with school administration on a long-term policy change or new institutional program."
                  ]
                : grade.includes('11th')
                ? [
                    "Serve as President, Founder, or Captain of your two primary organizations, managing teams of 20+ people.",
                    "Spearhead a major new initiative that requires coordinating multiple stakeholders and substantial resources.",
                    "Represent your school or community at a state or national leadership conference as a selected delegate.",
                    "Mentor a junior leadership team, teaching them the skills needed to take over your roles in the future."
                  ]
                : [
                    "Take on the role of 'Project Manager' for a flagship event, overseeing a budget and a specific timeline.",
                    "Found a new branch or chapter of a national organization at your school to show initiative and drive.",
                    "Participate in a summer leadership institute to build formal skills in management and public speaking.",
                    "Become the 'Advocate' for a specific cause within your school, leading a campaign or awareness drive."
                  ],
              summerPlan: grade.includes('12th')
                ? "Focus on 'The Final Narrative': write elite-level essays, finalize your passion project legacy, and perhaps take a meaningful part-time job or internship that shows maturity."
                : grade.includes('11th')
                ? "The 'Impact Summer': attend a top-3 selective program (like RSI, TASP, or SSP), conduct publishable research, or launch a massive community initiative. This is your biggest differentiator."
                : "The 'Growth Summer': secure a competitive internship or research assistantship, or scale your passion project to its first 50 users. Focus on moving from 'participant' to 'creator'."
            }))
          }
        }

      const { error: updateError } = await supabase
        .from("assessments")
        .update({
          status: 'completed',
          scores: {
            competitivenessScore: analysisResult.competitivenessScore,
            archetypeScores: analysisResult.archetypeScores,
          },
          report_data: analysisResult,
          student_archetype: analysisResult.studentArchetype,
          archetype_scores: analysisResult.archetypeScores,
          competitiveness_score: analysisResult.competitivenessScore,
          roadmap_data: analysisResult.roadmap,
          grade_by_grade_roadmap: analysisResult.gradeByGradeRoadmap,
          strengths_analysis: analysisResult.strengthsAnalysis,
          gap_analysis: analysisResult.gapAnalysis,
          passion_projects: analysisResult.passionProjects,
          academic_courses_recommendations: analysisResult.academicCoursesRecommendations,
          sat_act_goals: analysisResult.satActGoals,
          research_publications_recommendations: analysisResult.researchPublicationsRecommendations,
          leadership_recommendations: analysisResult.leadershipRecommendations,
          service_community_recommendations: analysisResult.serviceCommunityRecommendations,
          summer_ivy_programs_recommendations: analysisResult.summerIvyProgramsRecommendations,
          sports_recommendations: analysisResult.sportsRecommendations,
          competitions_recommendations: analysisResult.competitionsRecommendations,
          student_government_recommendations: analysisResult.studentGovernmentRecommendations,
          internships_recommendations: analysisResult.internshipsRecommendations,
          culture_arts_recommendations: analysisResult.cultureArtsRecommendations,
          career_recommendations: analysisResult.careerRecommendations,
          college_recommendations: analysisResult.collegeRecommendations,
          mentor_recommendations: analysisResult.mentorRecommendations,
          waste_of_time_activities: analysisResult.wasteOfTimeActivities,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assessmentId)

      if (updateError) {
        console.error("Database update error:", updateError)
        return NextResponse.json({ error: `Database update failed: ${updateError.message}` }, { status: 500 });
      }

      try {
        const studentRaw = assessment.students;
        const student = Array.isArray(studentRaw) ? studentRaw[0] : studentRaw;

        if (!student?.email) {
          console.warn("No student email found, skipping email notification. Student data:", student);
        } else {
          const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://thestudentblueprint.com'}/results/${assessmentId}`
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'Student Blueprint Team <hello@thestudentblueprint.com>'

          await resend.emails.send({
            from: fromEmail,
            to: [student.email],
            subject: "Your Updated Student Blueprint Report is Ready!",
            html: `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0f1520 0%, #1e3a5f 50%, #2a4a6f 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 60px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.5);">

            <tr>
              <td style="background: linear-gradient(135deg, #1e3a5f 0%, #152a45 100%); padding: 50px 40px; text-align: center; position: relative;">
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at 50% 20%, rgba(201,162,39,0.15) 0%, transparent 60%);"></div>
                <div style="position: relative; z-index: 1;">
                  <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 32px; font-weight: 800;">Report Updated!</h1>
                  <p style="margin: 0; color: #c9a227; font-size: 16px; font-weight: 600;">Fresh Insights & Recommendations</p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 50px 40px;">
                <h2 style="margin: 0 0 16px; color: #1e3a5f; font-size: 24px; font-weight: 700;">
                  Hi ${student.full_name || "there"}!
                </h2>
                <p style="margin: 0 0 30px; color: #5a7a9a; font-size: 16px; line-height: 1.7;">
                  We've regenerated your Student Blueprint assessment with the latest analysis and enhanced recommendations. Your roadmap has been updated with fresh insights!
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                  <tr>
                    <td width="50%" style="padding-right: 8px;">
                      <div style="background: linear-gradient(135deg, #fef9e7 0%, #fcf4d6 100%); border: 2px solid #c9a227; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 8px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Archetype</p>
                        <h3 style="margin: 0; color: #1e3a5f; font-size: 18px; font-weight: 800;">${analysisResult.studentArchetype}</h3>
                      </div>
                    </td>
                    <td width="50%" style="padding-left: 8px;">
                      <div style="background: linear-gradient(135deg, #e8f4f8 0%, #f0f7fa 100%); border: 2px solid #5a7a9a; border-radius: 12px; padding: 20px; text-align: center;">
                        <p style="margin: 0 0 8px; color: #5a7a9a; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Score</p>
                        <h3 style="margin: 0; color: #1e3a5f; font-size: 24px; font-weight: 800;"><span style="color: #c9a227;">${analysisResult.competitivenessScore}</span>/100</h3>
                      </div>
                    </td>
                  </tr>
                </table>

                <div style="text-align: center; margin: 40px 0;">
                  <a href="${dashboardUrl}" style="display: inline-block; background: linear-gradient(135deg, #c9a227 0%, #d4af37 100%); color: #1e3a5f; padding: 18px 48px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 17px; box-shadow: 0 10px 30px rgba(201,162,39,0.35);">
                    View Updated Report
                  </a>
                </div>

                <div style="background: linear-gradient(135deg, #f8f6f1 0%, #faf8f3 100%); border-radius: 12px; padding: 24px; border-left: 4px solid #c9a227;">
                  <p style="margin: 0; color: #5a7a9a; font-size: 14px; line-height: 1.7;">
                    <strong style="color: #1e3a5f;">What's New:</strong><br>
                    Enhanced recommendations, updated timelines, and fresh insights based on the latest assessment methodology.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background: linear-gradient(135deg, #1e3a5f 0%, #0f1520 100%); padding: 40px; text-align: center;">
                <h4 style="margin: 0 0 8px; color: #c9a227; font-size: 20px; font-weight: 800;">Student Blueprint</h4>
                <p style="margin: 0; color: rgba(255,255,255,0.6); font-size: 13px;">Questions? We're here to help!</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
            `,
          })
        }
      } catch (emailError) {
        console.error("Failed to send email:", emailError)
      }

      return NextResponse.json({
        success: true,
        message: "Report regenerated successfully",
        archetype: analysisResult.studentArchetype,
        competitivenessScore: analysisResult.competitivenessScore,
      })
  } catch (error) {
    console.error("Error regenerating report:", error)
    return NextResponse.json(
      { error: "Failed to regenerate report" },
      { status: 500 }
    )
  }
}
