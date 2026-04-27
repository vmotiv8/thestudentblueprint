/**
 * Shared prompt builder for AI assessment analysis.
 * Used by both the submit route (two-phase) and admin regenerate route.
 */

// Sanitize free-text input before sending to the AI prompt.
export function sanitizeForPrompt(value: unknown, maxLength = 1000): string {
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

export function toStringList(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'string') return value
  return ''
}

export type KnowledgeHubResource = { type: string; title: string; description: string | null; fileContent?: string | null }

/**
 * Returns the AI expert persona string appropriate for the student type.
 */
export function getSystemPrompt(studentType?: string): string {
  switch (studentType) {
    case 'elementary':
      return `You are an expert early childhood enrichment specialist and talent development advisor with 15+ years of experience identifying learning styles, natural talents, and age-appropriate development pathways for K-5 students. You understand how to nurture curiosity, build foundational skills, and create action plans that parents can implement immediately. Focus on encouragement, discovery, and developmentally appropriate opportunities.`
    case 'middle':
      return `You are an expert middle school academic advisor and early talent development specialist with 15+ years of experience helping 6-8th grade students discover their strengths, build competitive foundations, and prepare strategically for high school success. You know which competitions, programs, and activities give students a head start, and how to position students for strong high school trajectories.`
    case 'undergrad':
      return `You are an expert career advisor and graduate school strategist for undergraduate students with 15+ years of experience helping college students navigate career clarity, internship pipelines, research opportunities, and graduate school decisions. You understand what employers and grad school admissions committees look for, and you deliver honest, actionable roadmaps that close skills gaps fast.`
    case 'grad':
      return `You are an expert graduate school admissions strategist specializing in Masters, MBA, MD, JD, and MPH program placement with 15+ years of experience. You understand program ranking criteria, application timelines, personal statement angles, and how to position candidates with various professional backgrounds for competitive programs. Be brutally honest about program fit and competitiveness.`
    case 'phd':
      return `You are an expert PhD admissions and research career advisor with 15+ years of experience helping applicants secure positions at top research universities, match with the right advisors, secure NSF/NIH/NDSEG fellowships, and navigate the academia-vs-industry career decision. You understand what makes a compelling research statement and how to evaluate lab fit.`
    default:
      return `You are an expert college admissions counselor and academic success strategist specializing in Ivy League and Top 20 college admissions with 15+ years of experience. Your students have been accepted to Harvard, Stanford, MIT, Yale, Princeton, and other elite institutions. You understand what sets apart successful applicants: intellectual vitality, demonstrated impact, authentic passion, and a compelling narrative.

CRITICAL: Your recommendations MUST be specific, actionable, and prestigious. Avoid generic advice. Focus on opportunities that demonstrate exceptional achievement and differentiation.

For gap analysis and missing elements: Be BRUTALLY HONEST. Do not soften the message. Students are paying for the truth, not flattery. If their profile has serious holes, say so directly. Use language like "dealbreaker", "critical gap", "will be rejected if not addressed". The goal is to give them a reality check so they can fix it in time.`
  }
}

/**
 * Build the student profile context string used in all AI prompts.
 */
export function buildStudentProfileContext(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = []
): { context: string; currentGrade: string } {
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const testingInfo = (formData.testingInfo || {}) as Record<string, unknown>
  const extracurriculars = (formData.extracurriculars || {}) as Record<string, unknown>
  const leadership = (formData.leadership || {}) as Record<string, unknown>
  const competitions = (formData.competitions || {}) as Record<string, unknown>
  const passions = (formData.passions || {}) as Record<string, unknown>
  const careerAspirations = (formData.careerAspirations || {}) as Record<string, unknown>
  const researchExperience = (formData.researchExperience || {}) as Record<string, unknown>
  const summerPrograms = (formData.summerPrograms || {}) as Record<string, unknown>
  const specialTalents = (formData.specialTalents || {}) as Record<string, unknown>
  const familyContext = (formData.familyContext || {}) as Record<string, unknown>
  const personality = (formData.personality || {}) as Record<string, unknown>
  const personalStories = (formData.personalStories || {}) as Record<string, unknown>
  const timeCommitment = (formData.timeCommitment || {}) as Record<string, unknown>

  const studentType = (basicInfo.studentType as string) || 'high_school'
  const currentGrade = sanitizeForPrompt(basicInfo.currentGrade) || 'Not provided'

  const khSection = (() => {
    if (knowledgeHubResources.length === 0) return ''
    const khByType: Record<string, string[]> = {}
    const fileContents: string[] = []
    for (const r of knowledgeHubResources) {
      if (!khByType[r.type]) khByType[r.type] = []
      khByType[r.type].push(r.description ? `${r.title} (${r.description})` : r.title)
      if (r.fileContent) {
        fileContents.push(`--- ${r.type.replace(/_/g, ' ').toUpperCase()}: ${r.title} ---\n${r.fileContent}`)
      }
    }
    let section = '\n  School-Specific Resources (uploaded by the student\'s school — PRIORITIZE these in recommendations, use specific names and details from uploaded documents):\n' +
      Object.entries(khByType)
        .map(([type, items]) => `  - ${type.replace(/_/g, ' ')}: ${items.join('; ')}`)
        .join('\n')
    if (fileContents.length > 0) {
      section += '\n\n  === UPLOADED DOCUMENT CONTENTS (reference these directly when making recommendations) ===\n' +
        fileContents.join('\n\n')
    }
    return section
  })()

  // Build type-specific identity section
  const identitySection = (() => {
    if (studentType === 'undergrad') {
      return `- College Year: ${sanitizeForPrompt(basicInfo.collegeYear) || currentGrade}
- Major: ${sanitizeForPrompt(basicInfo.major) || 'Not provided'}
- University: ${sanitizeForPrompt(basicInfo.universityName) || 'Not provided'}
- Post-Grad Goal: ${sanitizeForPrompt(basicInfo.postGradGoal) || 'Not provided'}`
    }
    if (studentType === 'grad') {
      return `- Target Program Type: ${sanitizeForPrompt(basicInfo.targetProgramType) || 'Not provided'}
- Undergrad Institution: ${sanitizeForPrompt(basicInfo.undergradInstitution) || 'Not provided'}
- Undergrad Major: ${sanitizeForPrompt(basicInfo.undergradMajor) || 'Not provided'}
- Years of Work Experience: ${sanitizeForPrompt(basicInfo.workExperienceYears) || 'Not provided'}`
    }
    if (studentType === 'phd') {
      return `- Current Institution: ${sanitizeForPrompt(basicInfo.currentInstitution) || 'Not provided'}
- Research Field: ${sanitizeForPrompt(basicInfo.researchField) || 'Not provided'}
- Department: ${sanitizeForPrompt(basicInfo.department) || 'Not provided'}
- Target Advisor: ${sanitizeForPrompt(basicInfo.targetAdvisor) || 'Not provided'}
- Dissertation Stage: ${sanitizeForPrompt(basicInfo.dissertationStage) || 'Not provided'}`
    }
    return `- Current Grade: ${currentGrade}`
  })()

  // Build type-specific testing section
  const testingSection = (() => {
    if (studentType === 'grad' || studentType === 'phd') {
      if (testingInfo.greNotTaken) return '- Standardized Tests: Not yet taken'
      const lines = []
      if (testingInfo.greVerbal || testingInfo.greQuantitative || testingInfo.greAnalytical) {
        lines.push(`- GRE: Verbal ${sanitizeForPrompt(testingInfo.greVerbal) || 'N/A'}, Quant ${sanitizeForPrompt(testingInfo.greQuantitative) || 'N/A'}, AWA ${sanitizeForPrompt(testingInfo.greAnalytical) || 'N/A'}`)
      }
      if (testingInfo.gmatScore) lines.push(`- GMAT: ${sanitizeForPrompt(testingInfo.gmatScore)}`)
      if (testingInfo.mcatScore) lines.push(`- MCAT: ${sanitizeForPrompt(testingInfo.mcatScore)}`)
      if (testingInfo.lsatScore) lines.push(`- LSAT: ${sanitizeForPrompt(testingInfo.lsatScore)}`)
      return lines.length > 0 ? lines.join('\n') : '- Standardized Tests: Not yet taken'
    }
    if (testingInfo.notTakenYet) return '- Standardized Tests: Not yet taken'
    return `- PSAT: ${sanitizeForPrompt(testingInfo.psatScore) || 'Not taken'}${testingInfo.psatMath ? ` (Math: ${sanitizeForPrompt(testingInfo.psatMath)}, Reading: ${sanitizeForPrompt(testingInfo.psatReading)})` : ''}
- SAT: ${sanitizeForPrompt(testingInfo.satScore) || 'Not taken'}${testingInfo.satMath ? ` (Math: ${sanitizeForPrompt(testingInfo.satMath)}, Reading: ${sanitizeForPrompt(testingInfo.satReading)})` : ''}
- ACT: ${sanitizeForPrompt(testingInfo.actScore) || 'Not taken'}${testingInfo.actEnglish ? ` (English: ${sanitizeForPrompt(testingInfo.actEnglish)}, Math: ${sanitizeForPrompt(testingInfo.actMath)}, Reading: ${sanitizeForPrompt(testingInfo.actReading)}, Science: ${sanitizeForPrompt(testingInfo.actScience)})` : ''}
- AP/IB Exam Scores: ${sanitizeForPrompt(testingInfo.apScores) || 'Not provided'}
- Testing Timeline: ${sanitizeForPrompt(testingInfo.testingTimeline) || 'Not provided'}`
  })()

  // Build type-specific career section
  const careerSection = (() => {
    if (studentType === 'phd') {
      return `Research Goals:
- Dissertation Topic Area: ${sanitizeForPrompt(careerAspirations.dissertationTopicArea) || 'Not provided'}
- Research Questions: ${sanitizeForPrompt(careerAspirations.researchQuestionsToAnswer) || 'Not provided'}
- Academia vs Industry: ${sanitizeForPrompt(careerAspirations.academiaVsIndustry) || 'Not provided'}
- Dream Role: ${sanitizeForPrompt(careerAspirations.dreamJobTitle) || 'Not provided'}`
    }
    if (studentType === 'grad') {
      return `Program Goals:
- Target Careers: ${sanitizeForPrompt(careerAspirations.career1 || '')}, ${sanitizeForPrompt(careerAspirations.career2 || '')}
- Dream Job: ${sanitizeForPrompt(careerAspirations.dreamJobTitle) || 'Not provided'}
- Why This Program Now: ${sanitizeForPrompt(careerAspirations.whyProgramNow) || 'Not provided'}
- 5-Year Goal Post-Graduation: ${sanitizeForPrompt(careerAspirations.fiveYearGoal) || 'Not provided'}`
    }
    return `Career Aspirations:
- Top Careers: ${sanitizeForPrompt(careerAspirations.career1 || '')}, ${sanitizeForPrompt(careerAspirations.career2 || '')}
- Dream Job: ${sanitizeForPrompt(careerAspirations.dreamJobTitle) || 'Not provided'}`
  })()

  // Build type-specific research section
  const researchSection = (() => {
    const entries = sanitizeForPrompt(JSON.stringify(researchExperience.entries || []), 2000)
    if (studentType === 'grad' || studentType === 'phd') {
      return `Research & Professional Experience:
${entries}
- Publications: ${sanitizeForPrompt(researchExperience.publicationCount) || '0'} publication(s)
- Publication Titles: ${sanitizeForPrompt(researchExperience.publications) || 'Not provided'}
- Conference Presentations: ${sanitizeForPrompt(researchExperience.conferencePresentation) || 'Not provided'}
- Patents: ${sanitizeForPrompt(researchExperience.patents) || 'Not provided'}`
    }
    return `Experience:
${entries}`
  })()

  const context = `Student Information:
- Student Type: ${studentType.replace('_', ' ')}
- Name: ${sanitizeForPrompt(basicInfo.fullName)}
${identitySection}
- Location: ${sanitizeForPrompt(basicInfo.city)}, ${sanitizeForPrompt(basicInfo.state)}, ${sanitizeForPrompt(basicInfo.country)}
- Gender: ${sanitizeForPrompt(basicInfo.gender) || 'Not provided'}
- Ethnicity/Background: ${sanitizeForPrompt(basicInfo.ethnicity) || 'Not provided'}

Academic Profile:
- Curriculum: ${sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum) || 'Not provided'}
- GPA: ${sanitizeForPrompt(academicProfile.gpaUnweighted) || 'Not provided'} (unweighted), ${sanitizeForPrompt(academicProfile.gpaWeighted) || 'Not provided'} (weighted)
- Courses Taken: ${sanitizeForPrompt(toStringList(academicProfile.coursesTaken))}
- Academic Awards: ${sanitizeForPrompt(academicProfile.academicAwards) || 'Not provided'}
- Favorite Subjects: ${sanitizeForPrompt(toStringList(academicProfile.favoriteSubjects))}

Standardized Testing:
${testingSection}

Extracurriculars & Leadership:
${sanitizeForPrompt(JSON.stringify(extracurriculars.activities || []), 2000)}
- Leadership Entries: ${sanitizeForPrompt(JSON.stringify(leadership.entries || []), 1000)}
- Competitions: ${sanitizeForPrompt(JSON.stringify(competitions.entries || []), 1000)}

Passions & Interests:
- Topics They Love: ${sanitizeForPrompt(toStringList(passions.topicsYouLove))}
- Industries Curious About: ${sanitizeForPrompt(toStringList(passions.industriesCurious))}
- Hobbies & Skills: ${sanitizeForPrompt(passions.hobbiesSkills) || 'Not provided'}

${careerSection}

${researchSection}
- Summer Programs: ${sanitizeForPrompt(JSON.stringify(summerPrograms.entries || []), 1000)}
- Special Talents: ${sanitizeForPrompt(JSON.stringify(specialTalents), 1000)}

Family Context:
- Family Professions: ${sanitizeForPrompt(familyContext.familyProfessions) || 'Not provided'}
- Legacy Connections: ${sanitizeForPrompt(JSON.stringify(familyContext.legacyEntries || []), 500)}
- Annual Family Income: ${sanitizeForPrompt(familyContext.annualFamilyIncome) || 'Not provided'}
- Financial Aid Needed: ${familyContext.financialAidNeeded ? 'Yes' : 'No'}
- Merit Scholarship Interest: ${familyContext.meritScholarshipInterest ? 'Yes' : 'No'}

Personality & Story:
- Strengths: ${sanitizeForPrompt(toStringList(personality.topStrengths))}
- Archetypes: ${sanitizeForPrompt(toStringList(personality.archetypes))}
- Personality Type: ${sanitizeForPrompt(personality.introvertExtrovert) || 'Not provided'}
- Life Challenge: ${sanitizeForPrompt(personalStories.lifeChallenge) || 'Not provided'}
- Proud Moment: ${sanitizeForPrompt(personalStories.proudMoment) || 'Not provided'}

Time Commitment:
- School Year: ${sanitizeForPrompt(timeCommitment.hoursSchoolYear) || 'Not provided'}
- Summer: ${sanitizeForPrompt(timeCommitment.hoursSummer) || 'Not provided'}
${khSection}`

  return { context, currentGrade }
}

const GUIDELINES = (curriculum: string) => `
IMPORTANT GUIDELINES:
1. If the student is from India, you MUST include local Indian competitions, hackathons, and opportunities (e.g., Imperial STEM Hackathon, ISEF India, national coding challenges like ZCO/ZIO, various Olympiads, IRIS National Science Fair, etc.) in the roadmap.
2. If the student is planning to study abroad, update the "Reach/Target/Safety schools" and recommendations based on the admissions data of universities in their target countries.
3. Tailor the roadmap actions, goals, and projects to the student's specific location and curriculum (${curriculum}).
4. If the student is in a specific curriculum (like CBSE or IB), ensure the academic suggestions respect that curriculum's requirements and timelines.
5. If school-specific resources are listed above (courses, clubs, competitions, extracurriculars), PRIORITIZE recommending those specific options over generic alternatives wherever applicable.
6. For ALL activity/recommendation arrays (summer programs, sports, competitions, internships, service, culture/arts, leadership, etc.), generate EXACTLY 5 items per category unless otherwise specified.`

/**
 * Phase 1 prompt: Core analysis (archetype, scores, strengths, gaps, roadmap, timeline, essays).
 * Generates the hero section data and the first set of tabs.
 */
export function buildPhase1Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = []
): string {
  const { context, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const studentType = (basicInfo.studentType as string) || 'high_school'

  return `${getSystemPrompt(studentType)}

Analyze this student profile and create a core analysis.

${context}
${GUIDELINES(curriculum)}

Generate a core analysis with the following structure in JSON format:
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
  "competitivenessScore": number 0-100,
  "strengthsAnalysis": {
    "competitiveAdvantages": ["3 specific competitive advantages with concrete examples"],
    "uniqueDifferentiators": ["2-3 unique differentiators that make them stand out"],
    "alignedActivities": ["Specific activities that match their passions"]
  },
  "gapAnalysis": {
    "missingElements": ["EXACTLY 10 brutally honest gaps — be direct and aggressive about what is missing. Do NOT sugarcoat. Name specific weaknesses that admissions officers WILL notice. Examples: 'Zero research experience is a dealbreaker for top STEM programs', 'No national-level awards puts you behind 80% of Ivy applicants'. The student needs a wake-up call, not encouragement. Cover academics, testing, extracurriculars, leadership, research, awards, community service, narrative/story, and any other gaps."],
    "activitiesToDeepen": ["2-3 activities needing more depth"],
    "skillsToDevelope": ["EXACTLY 10 skills needed — at least 5 must be AI and modern technology skills: prompt engineering and AI communication, using AI tools for research and writing (Claude, ChatGPT, Gemini, Perplexity), AI-assisted coding and vibe coding (Cursor, GitHub Copilot, Replit Agent), building AI-powered projects and automations, AI-powered data analysis and visualization, creating content with AI (video, design, music), understanding AI ethics and responsible AI use, no-code/low-code AI app building. The remaining 5 should be traditional skills specific to their career path and field of interest."],
    "vulnerabilities": ["3-4 specific vulnerabilities that admissions officers may flag — be harsh and specific"]
  },
  "roadmap": {
    "immediate": ["4-5 specific high-impact actions for next 3 months"],
    "shortTerm": ["4-5 detailed goals for 3-6 months"],
    "mediumTerm": ["4-5 transformative projects for 6-12 months"],
    "longTerm": ["4-5 trajectory items for 1+ years"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "Main focus areas for this year",
      "academics": ["3-4 academic goals"],
      "extracurriculars": ["3-4 specific extracurricular actions"],
      "testing": ["2-3 testing milestones"],
      "leadership": ["2-3 age-appropriate leadership opportunities"],
      "summerPlan": "A 2-3 sentence summer plan"
    },
    "nextYears": [
      {
        "grade": "Next grade name",
        "focus": "Focus for that year",
        "academics": ["3-4 goals"],
        "extracurriculars": ["3-4 actions"],
        "testing": ["2-3 milestones"],
        "leadership": ["2-3 opportunities"],
        "summerPlan": "Summer plan"
      }
    ]
  },
  "essayBrainstorm": [
    {
      "title": "A compelling 5-8 word essay title",
      "hook": "A vivid, specific opening sentence that immediately draws the reader in. Must reference a real moment from the student's life.",
      "narrative": "A 3-4 sentence description of the essay's narrative arc — how it moves from the opening moment through a challenge or realization to a meaningful conclusion that reveals character growth.",
      "connectingThreads": ["3-5 specific elements from the student's profile that this essay weaves together, e.g., 'robotics club', 'grandmother's immigration story', 'love of mathematics'"],
      "whyItWorks": "2-3 sentences explaining why this essay would resonate with Ivy League admissions officers — what qualities it demonstrates and why the narrative structure is effective."
    }
  ]
}

IMPORTANT for essayBrainstorm: Generate exactly 5 essay ideas. Each must connect at least 3 different aspects of the student's profile (academics, extracurriculars, personal stories, family background, passions) into a cohesive narrative. Avoid cliche topics. Focus on specific, personal moments that reveal character.

Respond ONLY with valid JSON, no additional text.`
}

/**
 * Phase 2 prompt: Detailed recommendations (all recommendation tabs).
 * Includes Phase 1 summary for calibration.
 */
export function buildPhase2Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = [],
  phase1Summary: { studentArchetype: string; competitivenessScore: number; topStrengths: string[] }
): string {
  const { context } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const studentType = (basicInfo.studentType as string) || 'high_school'

  return `${getSystemPrompt(studentType)}

You have already analyzed this student and determined:
- Student Archetype: ${phase1Summary.studentArchetype}
- Competitiveness Score: ${phase1Summary.competitivenessScore}/100
- Top Strengths: ${phase1Summary.topStrengths.join(', ')}

Now generate detailed, specific recommendations for this student.

${context}
${GUIDELINES(curriculum)}

Generate detailed recommendations with the following structure in JSON format:
{
  "academicCoursesRecommendations": {
    "apCourses": ["4-5 specific AP courses with reasoning — ONLY if student is on AP or US curriculum, otherwise leave as empty array"],
    "ibCourses": ["IB courses — ONLY if student is on IB curriculum, otherwise leave as empty array"],
    "curriculumSpecificCourses": {"label": "The student's curriculum name (e.g. CBSE, A-Levels, IGCSE, etc.)", "courses": ["4-6 advanced/recommended courses specific to the student's curriculum — ONLY populate if the student is NOT on AP or IB curriculum, otherwise leave courses as empty array"]},
    "honorsCourses": ["3-4 Advanced/Honors courses"],
    "electivesRecommended": ["3-4 strategic electives"]
  },
  "satActGoals": {
    "targetSATScore": "Target composite score",
    "satSectionGoals": { "reading": "target", "math": "target" },
    "targetACTScore": "Target composite score",
    "actSectionGoals": { "english": "target", "math": "target", "reading": "target", "science": "target" },
    "prepStrategy": "Recommended preparation approach",
    "timeline": "When to take tests"
  },
  "researchPublicationsRecommendations": {
    "researchTopics": ["string - EXACTLY 5 topics. Format: 'Concise Title (5-10 words): Detailed description with methodology, scope, and application'. MUST be PhD-level, HIGHLY SPECIFIC, and UNEXPLORED. Each must include: specific methodology, target variable/outcome, and real-world application. Must correlate with the student's interests and career goals. Example: 'Drug Synergy via Graph Networks: Developing GNN to predict synergistic drug combinations for triple-negative breast cancer via protein-protein interaction networks.'"],
    "publicationOpportunities": ["3-4 publication venues"],
    "mentorshipSuggestions": ["3-4 strategies for finding mentors"],
    "timeline": "Timeline for research activities"
  },
  "leadershipRecommendations": {
    "clubLeadership": ["3-4 specific leadership positions"],
    "schoolWideRoles": ["2-3 student body/class officer positions"],
    "communityLeadership": ["3-4 external leadership opportunities"],
    "leadershipDevelopment": ["4-5 specific skills and experiences"]
  },
  "serviceCommunityRecommendations": {
    "localOpportunities": [{"name": "Opportunity name", "description": "What it involves and expected commitment", "dates": "Application deadline or availability window", "relevance": "Why this matters for this specific student's goals"}],
    "nationalPrograms": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline or program dates", "relevance": "Why this matters for this student"}],
    "internationalService": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline or program dates", "relevance": "Why this matters for this student"}],
    "sustainedCommitment": [{"name": "Strategy name", "description": "What it involves and how to build impact metrics", "dates": "Timeline for implementation", "relevance": "Why this matters for this student"}]
  },
  "summerIvyProgramsRecommendations": {
    "preFreshmanPrograms": [{"name": "Program name", "description": "What the program offers and involves", "dates": "Application deadline and program dates", "relevance": "Why this program fits this student's profile and goals"}],
    "competitivePrograms": [{"name": "Program name", "description": "What the program offers and involves", "dates": "Application deadline and program dates", "relevance": "Why this program fits this student"}],
    "researchPrograms": [{"name": "Program name", "description": "What the research opportunity involves", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "enrichmentPrograms": [{"name": "Program name", "description": "What the program offers", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}]
  },
  "sportsRecommendations": {
    "varsitySports": [{"name": "Sport name", "description": "Specific recommendations and goals", "dates": "Season dates and tryout timeline", "relevance": "Why this sport matters for this student's profile"}],
    "clubSports": [{"name": "Club/team name", "description": "What it involves", "dates": "Season or availability", "relevance": "Why this matters for this student"}],
    "recruitingStrategy": [{"name": "Strategy name", "description": "Specific steps to take", "dates": "Timeline for this strategy", "relevance": "Why this matters for this student"}],
    "fitnessLeadership": [{"name": "Opportunity name", "description": "What it involves", "dates": "Timeline or availability", "relevance": "Why this matters for this student"}]
  },
  "competitionsRecommendations": {
    "academicCompetitions": [{"name": "Competition name", "description": "What it involves, categories, and target placement", "dates": "Registration deadline and competition dates", "relevance": "Why this competition fits this student"}],
    "businessCompetitions": [{"name": "Competition name", "description": "What it involves", "dates": "Registration deadline and competition dates", "relevance": "Why this fits this student"}],
    "artsCompetitions": [{"name": "Competition name", "description": "What it involves", "dates": "Submission deadline and competition dates", "relevance": "Why this fits this student"}],
    "debateSpeech": [{"name": "Competition name", "description": "What it involves and recommended events", "dates": "Season dates and registration deadlines", "relevance": "Why this fits this student"}]
  },
  "studentGovernmentRecommendations": {
    "schoolGovernment": [{"name": "Position or initiative", "description": "What it involves and how to pursue it", "dates": "Election timeline or availability", "relevance": "Why this matters for this student"}],
    "districtStateRoles": [{"name": "Role or program", "description": "What it involves", "dates": "Application deadline", "relevance": "Why this matters for this student"}],
    "youthGovernment": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline and program dates", "relevance": "Why this matters for this student"}],
    "advocacyRoles": [{"name": "Role or initiative", "description": "What it involves", "dates": "Timeline or availability", "relevance": "Why this matters for this student"}]
  },
  "internshipsRecommendations": {
    "industryInternships": [{"name": "Internship or organization", "description": "What the role involves", "dates": "Application deadline and internship dates", "relevance": "Why this fits this student"}],
    "researchInternships": [{"name": "Lab or program name", "description": "What the research involves", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "nonprofitInternships": [{"name": "Organization name", "description": "What the role involves", "dates": "Application deadline or availability", "relevance": "Why this fits this student"}],
    "virtualOpportunities": [{"name": "Opportunity name", "description": "What it involves", "dates": "Availability or enrollment period", "relevance": "Why this fits this student"}]
  },
  "cultureArtsRecommendations": {
    "performingArts": [{"name": "Opportunity name", "description": "What it involves", "dates": "Audition or participation dates", "relevance": "Why this fits this student"}],
    "visualArts": [{"name": "Project or opportunity", "description": "What it involves", "dates": "Submission deadline or timeline", "relevance": "Why this fits this student"}],
    "creativeWriting": [{"name": "Publication or opportunity", "description": "What it involves", "dates": "Submission deadline", "relevance": "Why this fits this student"}],
    "culturalClubs": [{"name": "Organization name", "description": "What it involves", "dates": "Meeting schedule or membership timeline", "relevance": "Why this fits this student"}]
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
      { "industry": "Name of industry", "why": "Explanation" }
    ],
    "salaryPotential": "Description of salary potential",
    "linkedInBioHeadline": "A professional headline"
  },
  "collegeRecommendations": {
    "collegeBreakdown": {
      "reach": ["EXACTLY 10 reach schools. ALL Ivy League schools MUST be reach. Format: 'University Name: BRUTALLY HONEST reason why this is a reach — cite the student's SPECIFIC weaknesses (e.g., 3.7 GPA is below Harvard's 3.95 median, no research experience, limited extracurricular leadership, no test scores submitted, acceptance rate is X%). Do NOT flatter — explain why they would likely be rejected without significant improvement.'"],
      "target": ["EXACTLY 10 target schools. Format: 'University Name: Honest assessment of fit — reference the student's SPECIFIC stats (GPA, scores, activities) vs. the school's median admits. Explain what makes this realistic but not guaranteed (e.g., GPA is competitive but lack of X weakens the application).'"],
      "safety": ["EXACTLY 10 safety schools. Format: 'University Name: Why this student is likely to be admitted — cite specific stats that exceed the school's median (e.g., student's 3.7 GPA exceeds the school's 3.4 average, acceptance rate is X%, strong fit with their Y program).'"]
    },
    "schoolMatches": [
      { "schoolName": "University Name", "matchScore": 0-100, "why": "Detailed explanation" }
    ]
  },
  "mentorRecommendations": {
    "mentors": [
      { "name": "Dr. Name", "university": "University Name", "department": "Department", "why": "Explanation" }
    ]
  },
  "wasteOfTimeActivities": {
    "activities": [
      { "activity": "Activity to stop", "whyQuit": "Reason why it doesn't align" }
    ]
  },
  "scholarshipRecommendations": {
    "scholarships": [
      { "name": "Scholarship Name", "organization": "Organization", "amount": "Amount", "deadline": "Deadline", "why": "Why this student qualifies", "url": "Application URL" }
    ]
  }
}

Generate exactly 3 passion projects (no more, no less) with detailed implementation steps.
Generate at least 6 school matches with match scores.
Generate at least 4 scholarship recommendations.

Respond ONLY with valid JSON, no additional text.`
}

/**
 * Full combined prompt (used by admin regenerate-report for backward compat).
 */
export function buildFullPrompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = []
): string {
  const { context, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const studentType = (basicInfo.studentType as string) || 'high_school'

  return `${getSystemPrompt(studentType)}

Analyze this student profile and create a personalized roadmap.

${context}
${GUIDELINES(curriculum)}

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
    "missingElements": ["EXACTLY 10 brutally honest gaps — be direct and aggressive about what is missing. Do NOT sugarcoat. Name specific weaknesses that admissions officers WILL notice. Examples: 'Zero research experience is a dealbreaker for top STEM programs', 'No national-level awards puts you behind 80% of Ivy applicants'. The student needs a wake-up call, not encouragement. Cover academics, testing, extracurriculars, leadership, research, awards, community service, narrative/story, and any other gaps."],
    "activitiesToDeepen": ["2-3 activities needing more depth"],
    "skillsToDevelope": ["EXACTLY 10 skills needed — at least 5 must be AI and modern technology skills: prompt engineering and AI communication, using AI tools for research and writing (Claude, ChatGPT, Gemini, Perplexity), AI-assisted coding and vibe coding (Cursor, GitHub Copilot, Replit Agent), building AI-powered projects and automations, AI-powered data analysis and visualization, creating content with AI (video, design, music), understanding AI ethics and responsible AI use, no-code/low-code AI app building. The remaining 5 should be traditional skills specific to their career path and field of interest."],
    "vulnerabilities": ["3-4 specific vulnerabilities that admissions officers may flag — be harsh and specific"]
  },
  "roadmap": {
    "immediate": ["4-5 specific high-impact actions for next 3 months"],
    "shortTerm": ["4-5 detailed goals for 3-6 months"],
    "mediumTerm": ["4-5 transformative projects for 6-12 months"],
    "longTerm": ["4-5 trajectory items for 1+ years"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "Main focus areas for this year",
      "academics": ["3-4 academic goals"],
      "extracurriculars": ["3-4 specific extracurricular actions"],
      "testing": ["2-3 testing milestones"],
      "leadership": ["2-3 age-appropriate leadership opportunities"],
      "summerPlan": "A 2-3 sentence summer plan"
    },
    "nextYears": [
      {
        "grade": "Next grade name",
        "focus": "Focus for that year",
        "academics": ["3-4 goals"],
        "extracurriculars": ["3-4 actions"],
        "testing": ["2-3 milestones"],
        "leadership": ["2-3 opportunities"],
        "summerPlan": "Summer plan"
      }
    ]
  },
  "academicCoursesRecommendations": {
    "apCourses": ["4-5 specific AP courses with reasoning — ONLY if student is on AP or US curriculum, otherwise leave as empty array"],
    "ibCourses": ["IB courses — ONLY if student is on IB curriculum, otherwise leave as empty array"],
    "curriculumSpecificCourses": {"label": "The student's curriculum name (e.g. CBSE, A-Levels, IGCSE, etc.)", "courses": ["4-6 advanced/recommended courses specific to the student's curriculum — ONLY populate if the student is NOT on AP or IB curriculum, otherwise leave courses as empty array"]},
    "honorsCourses": ["3-4 Advanced/Honors courses"],
    "electivesRecommended": ["3-4 strategic electives"]
  },
  "satActGoals": {
    "targetSATScore": "Target composite score",
    "satSectionGoals": { "reading": "target", "math": "target" },
    "targetACTScore": "Target composite score",
    "actSectionGoals": { "english": "target", "math": "target", "reading": "target", "science": "target" },
    "prepStrategy": "Recommended preparation approach",
    "timeline": "When to take tests"
  },
  "researchPublicationsRecommendations": {
    "researchTopics": ["string - EXACTLY 5 topics. Format: 'Concise Title (5-10 words): Detailed description with methodology, scope, and application'. MUST be PhD-level, HIGHLY SPECIFIC, and UNEXPLORED. Each must include: specific methodology, target variable/outcome, and real-world application. Must correlate with the student's interests and career goals. Example: 'Drug Synergy via Graph Networks: Developing GNN to predict synergistic drug combinations for triple-negative breast cancer via protein-protein interaction networks.'"],
    "publicationOpportunities": ["3-4 publication venues"],
    "mentorshipSuggestions": ["3-4 strategies for finding mentors"],
    "timeline": "Timeline for research activities"
  },
  "leadershipRecommendations": {
    "clubLeadership": ["3-4 specific leadership positions"],
    "schoolWideRoles": ["2-3 student body/class officer positions"],
    "communityLeadership": ["3-4 external leadership opportunities"],
    "leadershipDevelopment": ["4-5 specific skills and experiences"]
  },
  "serviceCommunityRecommendations": {
    "localOpportunities": [{"name": "Opportunity name", "description": "What it involves and expected commitment", "dates": "Application deadline or availability window", "relevance": "Why this matters for this specific student's goals"}],
    "nationalPrograms": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline or program dates", "relevance": "Why this matters for this student"}],
    "internationalService": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline or program dates", "relevance": "Why this matters for this student"}],
    "sustainedCommitment": [{"name": "Strategy name", "description": "What it involves and how to build impact metrics", "dates": "Timeline for implementation", "relevance": "Why this matters for this student"}]
  },
  "summerIvyProgramsRecommendations": {
    "preFreshmanPrograms": [{"name": "Program name", "description": "What the program offers and involves", "dates": "Application deadline and program dates", "relevance": "Why this program fits this student's profile and goals"}],
    "competitivePrograms": [{"name": "Program name", "description": "What the program offers and involves", "dates": "Application deadline and program dates", "relevance": "Why this program fits this student"}],
    "researchPrograms": [{"name": "Program name", "description": "What the research opportunity involves", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "enrichmentPrograms": [{"name": "Program name", "description": "What the program offers", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}]
  },
  "sportsRecommendations": {
    "varsitySports": [{"name": "Sport name", "description": "Specific recommendations and goals", "dates": "Season dates and tryout timeline", "relevance": "Why this sport matters for this student's profile"}],
    "clubSports": [{"name": "Club/team name", "description": "What it involves", "dates": "Season or availability", "relevance": "Why this matters for this student"}],
    "recruitingStrategy": [{"name": "Strategy name", "description": "Specific steps to take", "dates": "Timeline for this strategy", "relevance": "Why this matters for this student"}],
    "fitnessLeadership": [{"name": "Opportunity name", "description": "What it involves", "dates": "Timeline or availability", "relevance": "Why this matters for this student"}]
  },
  "competitionsRecommendations": {
    "academicCompetitions": [{"name": "Competition name", "description": "What it involves, categories, and target placement", "dates": "Registration deadline and competition dates", "relevance": "Why this competition fits this student"}],
    "businessCompetitions": [{"name": "Competition name", "description": "What it involves", "dates": "Registration deadline and competition dates", "relevance": "Why this fits this student"}],
    "artsCompetitions": [{"name": "Competition name", "description": "What it involves", "dates": "Submission deadline and competition dates", "relevance": "Why this fits this student"}],
    "debateSpeech": [{"name": "Competition name", "description": "What it involves and recommended events", "dates": "Season dates and registration deadlines", "relevance": "Why this fits this student"}]
  },
  "studentGovernmentRecommendations": {
    "schoolGovernment": [{"name": "Position or initiative", "description": "What it involves and how to pursue it", "dates": "Election timeline or availability", "relevance": "Why this matters for this student"}],
    "districtStateRoles": [{"name": "Role or program", "description": "What it involves", "dates": "Application deadline", "relevance": "Why this matters for this student"}],
    "youthGovernment": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline and program dates", "relevance": "Why this matters for this student"}],
    "advocacyRoles": [{"name": "Role or initiative", "description": "What it involves", "dates": "Timeline or availability", "relevance": "Why this matters for this student"}]
  },
  "internshipsRecommendations": {
    "industryInternships": [{"name": "Internship or organization", "description": "What the role involves", "dates": "Application deadline and internship dates", "relevance": "Why this fits this student"}],
    "researchInternships": [{"name": "Lab or program name", "description": "What the research involves", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "nonprofitInternships": [{"name": "Organization name", "description": "What the role involves", "dates": "Application deadline or availability", "relevance": "Why this fits this student"}],
    "virtualOpportunities": [{"name": "Opportunity name", "description": "What it involves", "dates": "Availability or enrollment period", "relevance": "Why this fits this student"}]
  },
  "cultureArtsRecommendations": {
    "performingArts": [{"name": "Opportunity name", "description": "What it involves", "dates": "Audition or participation dates", "relevance": "Why this fits this student"}],
    "visualArts": [{"name": "Project or opportunity", "description": "What it involves", "dates": "Submission deadline or timeline", "relevance": "Why this fits this student"}],
    "creativeWriting": [{"name": "Publication or opportunity", "description": "What it involves", "dates": "Submission deadline", "relevance": "Why this fits this student"}],
    "culturalClubs": [{"name": "Organization name", "description": "What it involves", "dates": "Meeting schedule or membership timeline", "relevance": "Why this fits this student"}]
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
      { "industry": "Name of industry", "why": "Explanation" }
    ],
    "salaryPotential": "Description of salary potential",
    "linkedInBioHeadline": "A professional headline"
  },
  "collegeRecommendations": {
    "collegeBreakdown": {
      "reach": ["EXACTLY 10 reach schools. ALL Ivy League schools MUST be reach. Format: 'University Name: BRUTALLY HONEST reason why this is a reach — cite the student's SPECIFIC weaknesses (e.g., 3.7 GPA is below Harvard's 3.95 median, no research experience, limited extracurricular leadership, no test scores submitted, acceptance rate is X%). Do NOT flatter — explain why they would likely be rejected without significant improvement.'"],
      "target": ["EXACTLY 10 target schools. Format: 'University Name: Honest assessment of fit — reference the student's SPECIFIC stats (GPA, scores, activities) vs. the school's median admits. Explain what makes this realistic but not guaranteed (e.g., GPA is competitive but lack of X weakens the application).'"],
      "safety": ["EXACTLY 10 safety schools. Format: 'University Name: Why this student is likely to be admitted — cite specific stats that exceed the school's median (e.g., student's 3.7 GPA exceeds the school's 3.4 average, acceptance rate is X%, strong fit with their Y program).'"]
    },
    "schoolMatches": [
      { "schoolName": "University Name", "matchScore": 0-100, "why": "Detailed explanation" }
    ]
  },
  "mentorRecommendations": {
    "mentors": [
      { "name": "Dr. Name", "university": "University Name", "department": "Department", "why": "Explanation" }
    ]
  },
  "wasteOfTimeActivities": {
    "activities": [
      { "activity": "Activity to stop", "whyQuit": "Reason why it doesn't align" }
    ]
  },
  "essayBrainstorm": [
    {
      "title": "A compelling 5-8 word essay title",
      "hook": "A vivid, specific opening sentence that immediately draws the reader in. Must reference a real moment from the student's life.",
      "narrative": "A 3-4 sentence description of the essay's narrative arc — how it moves from the opening moment through a challenge or realization to a meaningful conclusion that reveals character growth.",
      "connectingThreads": ["3-5 specific elements from the student's profile that this essay weaves together, e.g., 'robotics club', 'grandmother's immigration story', 'love of mathematics'"],
      "whyItWorks": "2-3 sentences explaining why this essay would resonate with Ivy League admissions officers — what qualities it demonstrates and why the narrative structure is effective."
    }
  ],
  "scholarshipRecommendations": {
    "scholarships": [
      { "name": "Scholarship Name", "organization": "Organization", "amount": "Amount", "deadline": "Deadline", "why": "Why this student qualifies", "url": "Application URL" }
    ]
  },
  "competitivenessScore": number 0-100
}

IMPORTANT for essayBrainstorm: Generate exactly 5 essay ideas. Each must connect at least 3 different aspects of the student's profile (academics, extracurriculars, personal stories, family background, passions) into a cohesive narrative. Avoid cliche topics. Focus on specific, personal moments that reveal character.

Respond ONLY with valid JSON, no additional text.`
}

/**
 * Parse Claude's response text into a JSON object.
 * Returns the parsed object or a failure object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseClaudeResponse(content: string, requiredFields: string[]): { success: true; data: any } | { success: false; error: string } {
  if (!content.trim()) {
    return { success: false, error: 'Empty response from AI' }
  }

  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return { success: false, error: 'AI response was not valid JSON' }
  }

  try {
    const parsed = JSON.parse(jsonMatch[0])

    for (const field of requiredFields) {
      if (parsed[field] == null) {
        return { success: false, error: `Missing required field: ${field}` }
      }
    }

    return { success: true, data: parsed }
  } catch {
    return { success: false, error: 'Failed to parse AI response JSON' }
  }
}

/** Fields required in Phase 1 response */
export const PHASE_1_REQUIRED_FIELDS = ['studentArchetype', 'competitivenessScore']

/** Fields required in Phase 2 response */
export const PHASE_2_REQUIRED_FIELDS = ['academicCoursesRecommendations', 'collegeRecommendations']

/* ==========================================================================
 * Process-route prompt builders (one source of truth used by both the
 * QStash phase routes and the sync-fallback / regenerate paths).
 *
 * Each builder picks its persona via getSystemPrompt(studentType) and
 * conditionally includes JSON schema fields that only make sense for
 * certain student types (e.g. essays for middle+ only, college lists
 * for HS/undergrad only, summer Ivy programs for HS/undergrad only).
 * ==========================================================================
 */

const PROCESS_GUIDELINES = (curriculum: string) => `
IMPORTANT GUIDELINES:
1. If the student is from India, include local Indian competitions, hackathons, and opportunities.
2. If planning to study abroad, tailor recommendations to target countries.
3. Tailor to the student's location and curriculum (${curriculum}).
4. If school-specific resources are listed, PRIORITIZE those in recommendations.`

const TYPES_WITH_ESSAYS: ReadonlySet<string> = new Set(['middle', 'high_school', 'undergrad', 'grad', 'phd'])
const TYPES_WITH_COLLEGE_RECS: ReadonlySet<string> = new Set(['high_school', 'undergrad'])
const TYPES_WITH_SAT_ACT: ReadonlySet<string> = new Set(['high_school', 'middle'])
const TYPES_WITH_SUMMER_IVY: ReadonlySet<string> = new Set(['high_school', 'undergrad'])

/** Returns the type-appropriate label for the funding-opportunities tab. */
export function getScholarshipLabel(studentType?: string): string {
  if (studentType === 'grad' || studentType === 'phd') return 'Fellowships & Funding'
  if (studentType === 'elementary' || studentType === 'middle') return 'Merit Programs'
  return 'Scholarships'
}

/** Returns scope guidance for the AI when recommending funding. */
function scholarshipScopeGuidance(studentType?: string): string {
  if (studentType === 'grad' || studentType === 'phd') {
    return 'Recommend graduate-level fellowships, research grants, NSF/NIH/NDSEG funding, departmental TA/RA positions, and industry-sponsored programs.'
  }
  if (studentType === 'elementary' || studentType === 'middle') {
    return 'Recommend age-appropriate merit programs, gifted-and-talented enrichment grants, summer scholarship programs, and competitions with cash prizes.'
  }
  return 'Recommend undergraduate scholarships, merit awards, need-based aid, and program-specific funding.'
}

function resolveStudentType(formData: Record<string, unknown>, override?: string): string {
  if (override) return override
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  return (basicInfo.studentType as string) || 'high_school'
}

/**
 * Elementary (K-5) Phase 1 prompt — parent-facing, encouragement-first.
 * Replaces "10 brutally honest gaps" with developmentally honest framing
 * and adds parentCoachingTips, enrichmentRecommendations, talentSearchEligibility.
 */
function buildElementaryPhase1Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[]
): string {
  const { context, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

  return `${getSystemPrompt('elementary')}

This is a K-5 child. The reader of your output is the PARENT, not the child. Tone: encouraging, specific, and parent-actionable. Never use "dealbreaker", "rejected", "competitive", or college-admissions framing. The goal is to help the parent nurture early strengths, find the right enrichment, and identify whether their child should pursue gifted/talented testing.

${context}
${PROCESS_GUIDELINES(curriculum)}

Generate JSON:
{
  "studentArchetype": "A unique 2-3 word encouraging descriptor (e.g., 'Curious Builder', 'Empathetic Storyteller', 'Patient Investigator')",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100 (interpret as developmental readiness, not competitiveness; most K-5 children should score 60-85),
  "strengthsAnalysis": {
    "competitiveAdvantages": ["5 strengths the parent can amplify, framed positively. Each tied to a concrete behavior the parent reported."],
    "uniqueDifferentiators": ["2-3 things that make this child distinctive for their age"],
    "alignedActivities": ["3-4 current activities that already match the child's natural strengths"]
  },
  "gapAnalysis": {
    "missingElements": ["5 next-step growth areas, framed as opportunities (NOT gaps). Each with a concrete way to practice at home. NEVER use 'dealbreaker', 'rejected', or scary language."],
    "activitiesToDeepen": ["2-3 current activities the child could go deeper on"],
    "skillsToDevelope": ["5 age-appropriate skills to build (reading fluency, basic math facts, social-emotional skills, simple persistence). Do NOT include AI tools or career skills — this is a K-5 child."],
    "vulnerabilities": []
  },
  "roadmap": {
    "immediate": ["5-6 specific actions for the next month — concrete, low-cost, parent-friendly"],
    "shortTerm": ["5-6 actions for the next 3-6 months"],
    "mediumTerm": ["4-5 goals for the next school year"],
    "longTerm": ["3-4 longer-arc directions to keep in mind"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "2-3 sentence developmental focus for this year",
      "academics": ["3-4 grade-appropriate academic milestones (reading level, math facts, etc.)"],
      "extracurriculars": ["3-4 enrichment ideas (library programs, weekend classes, free clubs)"],
      "testing": ["any age-appropriate assessments: e.g., district G&T screening, talent search testing through Johns Hopkins CTY or Duke TIP"],
      "leadership": ["age-appropriate leadership: e.g., line leader, helper, peer reading buddy"],
      "summerPlan": "Detailed summer plan: free library programs, day camps, family projects, reading goals"
    },
    "nextYears": [one entry per remaining year through 5th grade, same structure, with growing complexity]
  },
  "parentCoachingTips": [
    { "tip": "One short, specific action the parent can take this week", "why": "1-sentence explanation of why this works for THIS child's archetype" }
  ],
  "enrichmentRecommendations": [
    { "name": "Specific program/activity name (real, name-able)", "category": "literacy | math | science | arts | social", "description": "What it offers and how to enroll", "ageFit": "Why it fits this child's age and interests", "timeCommitment": "Hours per week or one-time" }
  ],
  "talentSearchEligibility": {
    "eligible": true | false,
    "programs": [
      { "name": "Johns Hopkins CTY | Duke TIP | District Gifted & Talented Program | Other named program", "whyConsider": "Why this child should be considered, citing specific profile details", "nextStep": "Concrete next action for the parent (URL, deadline, contact)" }
    ]
  }
}

CRITICAL: Generate exactly 6 parentCoachingTips. Generate at least 8 enrichmentRecommendations covering at least 3 different categories. talentSearchEligibility.programs should have 2-4 entries — be specific about which programs match THIS child.`
}

/**
 * Middle school (6-8) Phase 1 prompt — softer tone than HS, adds HS-prep planning.
 */
function buildMiddlePhase1Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[]
): string {
  const { context, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)

  return `${getSystemPrompt('middle')}

This is a 6-8th grade student. They (and their parent) will read this report. Be specific and ambitious, but supportive. Do NOT use "dealbreaker", "rejected", or punitive language — this is a 12-year-old, not a college applicant. The goal is to map a strong path INTO high school: which competitions to enter now, which courses to plan for, which summer programs are realistic.

${context}
${PROCESS_GUIDELINES(curriculum)}

Generate JSON:
{
  "studentArchetype": "A unique 2-3 word descriptor (e.g., 'Emerging Innovator', 'Analytical Storyteller')",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100 (interpret as 'readiness for high-school challenge'; most middle schoolers should score 50-80),
  "strengthsAnalysis": {
    "competitiveAdvantages": ["4-5 specific strengths with concrete evidence from the profile"],
    "uniqueDifferentiators": ["2-3 things that make this student stand out for their age"],
    "alignedActivities": ["3-4 current activities that already align with their direction"]
  },
  "gapAnalysis": {
    "missingElements": ["5-7 growth opportunities, framed constructively. Examples: 'Try one regional competition this year', 'Begin a 3-month sustained project'. NEVER use 'dealbreaker', 'rejected', or punitive language — this is a 12-year-old."],
    "activitiesToDeepen": ["2-3 activities to go deeper on"],
    "skillsToDevelope": ["7 skills mixing age-appropriate practical (writing clarity, time management, public speaking) with modern tech (basic coding via Scratch/Python, AI fluency, digital research)"],
    "vulnerabilities": []
  },
  "roadmap": {
    "immediate": ["5-6 specific actions for the next 1-3 months"],
    "shortTerm": ["5-6 goals for 3-6 months"],
    "mediumTerm": ["4-5 projects for 6-12 months"],
    "longTerm": ["4-5 goals for the transition into high school"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "2-3 sentence focus for this year",
      "academics": ["3-4 academic goals appropriate for this grade"],
      "extracurriculars": ["3-4 specific clubs/activities to deepen"],
      "testing": ["talent search tests (JHU CTY, Duke TIP via SAT/ACT for talent ID), state assessments — NOT high-school SAT prep yet"],
      "leadership": ["3-4 age-appropriate leadership opportunities"],
      "summerPlan": "Specific summer plan: programs, projects, reading goals"
    },
    "nextYears": [one entry per remaining middle-school year, then a single entry for 'High School Transition (9th grade)' that previews what's next]
  },
  "essayBrainstorm": [
    {
      "title": "5-8 word title — frame as 'story you can practice telling now, useful for HS essays later'",
      "hook": "A vivid opening sentence referencing something real from the student's life",
      "narrative": "3-4 sentence description",
      "connectingThreads": ["3-4 elements from the profile this story weaves together"],
      "whyItWorks": "2-3 sentences on why this story will become a strong high-school application essay later"
    }
  ],
  "highSchoolCoursePlan": {
    "9th": { "honors": ["3-4 honors/advanced courses to aim for"], "regular": ["3-4 regular courses"], "rationale": "1-2 sentence rationale grounded in this student's interests" },
    "10th": { "honors": [...], "regular": [...], "rationale": "..." },
    "11th": { "honors": [...], "regular": [...], "rationale": "..." },
    "12th": { "honors": [...], "regular": [...], "rationale": "..." }
  },
  "competitionPipeline": {
    "local": [{ "name": "Specific local/school competition", "description": "What it involves", "whyFit": "Why this student", "deadline": "Typical timing", "difficulty": "intro" }],
    "regional": [{ "name": "Regional competition (e.g., MATHCOUNTS Chapter, Science Olympiad Regional)", "description": "...", "whyFit": "...", "deadline": "...", "difficulty": "intermediate" }],
    "national": [{ "name": "National competition (e.g., MATHCOUNTS National, USACO, Regeneron Science Talent Search prep)", "description": "...", "whyFit": "...", "deadline": "...", "difficulty": "advanced" }]
  },
  "summerProgramLadder": {
    "intro": [{ "name": "Free/low-cost program (library workshops, community college classes, day camps)", "description": "...", "applicationDeadline": "Typical timing", "cost": "Free or under $200", "whyFit": "..." }],
    "intermediate": [{ "name": "Selective summer program (CTY, TIP, university pre-college)", "description": "...", "applicationDeadline": "...", "cost": "$$$", "whyFit": "..." }],
    "advanced": [{ "name": "Top-tier summer (e.g., MathPath, PROMYS Junior, RSI prep tracks)", "description": "...", "applicationDeadline": "...", "cost": "$$$$ or scholarship-eligible", "whyFit": "..." }]
  },
  "parentTips": ["3 short, specific tips for the student's parent on how to support this report's recommendations"]
}

CRITICAL: Generate exactly 5 essayBrainstorm story angles. Generate 2-3 items per competition tier and 2-3 per summer program tier. The highSchoolCoursePlan must have all four years populated, even if rough.`
}

/**
 * Phase 1 prompt for the QStash process route.
 * Routes elementary and middle to dedicated builders; HS/undergrad/grad/phd
 * use the shared body below.
 */
export function buildProcessPhase1Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = [],
  studentTypeOverride?: string
): string {
  const studentType = resolveStudentType(formData, studentTypeOverride)
  if (studentType === 'elementary') return buildElementaryPhase1Prompt(formData, knowledgeHubResources)
  if (studentType === 'middle') return buildMiddlePhase1Prompt(formData, knowledgeHubResources)

  const { context, currentGrade } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const includeEssays = TYPES_WITH_ESSAYS.has(studentType)

  const essaysSchema = includeEssays
    ? `,
  "essayBrainstorm": [
    {
      "title": "Compelling 5-8 word title",
      "hook": "A vivid opening sentence referencing a REAL detail from the student's life.",
      "narrative": "4-5 sentence description of the full narrative arc.",
      "connectingThreads": ["4-5 specific elements this essay weaves together"],
      "whyItWorks": "3-4 sentences on why admissions officers would be captivated."
    }
  ]`
    : ''

  const essaysInstruction = includeEssays
    ? `\n\nCRITICAL: Generate exactly 5 essay ideas. Each MUST be deeply personal and connect 3+ profile elements.`
    : ''

  return `${getSystemPrompt(studentType)}

Analyze this student profile and produce a brutally honest, deeply insightful analysis.

${context}
${PROCESS_GUIDELINES(curriculum)}

Generate JSON:
{
  "studentArchetype": "A unique 2-3 word archetype (e.g., 'Analytical Entrepreneur', 'Creative Humanitarian', 'Scientific Visionary')",
  "archetypeScores": { "Visionary": 0-100, "Builder": 0-100, "Healer": 0-100, "Analyst": 0-100, "Artist": 0-100, "Advocate": 0-100, "Entrepreneur": 0-100, "Researcher": 0-100 },
  "competitivenessScore": number 0-100 (be realistic — most students are 40-70, only nationally ranked students get 80+),
  "strengthsAnalysis": {
    "competitiveAdvantages": ["5-6 SPECIFIC advantages with concrete evidence from their profile"],
    "uniqueDifferentiators": ["3-4 things that make this student genuinely different — what's their 'spike'?"],
    "alignedActivities": ["4-5 current activities that directly support their narrative"]
  },
  "gapAnalysis": {
    "missingElements": ["EXACTLY 10 brutally honest gaps — be direct and aggressive about what is missing. Do NOT sugarcoat."],
    "activitiesToDeepen": ["3-4 existing activities that need more depth/recognition/leadership"],
    "skillsToDevelope": ["EXACTLY 10 skills — at least 5 must be AI/modern tech skills: prompt engineering, AI tools (Claude, ChatGPT, Gemini), vibe coding (Cursor, Copilot), AI-powered projects, AI data analysis, AI content creation, AI ethics, no-code AI app building. The remaining 5 should be traditional skills for their career path."],
    "vulnerabilities": ["3-4 specific vulnerabilities that admissions/program reviewers may flag — be harsh and specific"]
  },
  "roadmap": {
    "immediate": ["6-8 highly specific actions for next 3 months"],
    "shortTerm": ["6-8 detailed goals for 3-6 months"],
    "mediumTerm": ["5-6 transformative projects for 6-12 months"],
    "longTerm": ["5-6 trajectory items for 1+ years"]
  },
  "gradeByGradeRoadmap": {
    "currentGrade": {
      "grade": "${currentGrade}",
      "focus": "2-3 sentence strategic focus",
      "academics": ["4-5 specific academic goals"],
      "extracurriculars": ["4-5 specific extracurricular milestones"],
      "testing": ["3-4 testing milestones (use stage-appropriate tests — SAT/ACT for high-school applicants, GRE/GMAT/MCAT/LSAT for grad/PhD applicants, none for elementary)"],
      "leadership": ["3-4 stage-appropriate leadership opportunities"],
      "summerPlan": "Detailed summer/break plan"
    },
    "nextYears": [one entry per remaining year/stage in this student's trajectory using the appropriate progression for their student type, same structure]
  }${essaysSchema}
}${essaysInstruction}`
}

/**
 * Phase 2 prompt: academics, testing, colleges, career.
 * Skips collegeRecommendations for grad/phd/middle/elementary (not relevant).
 * Skips satActGoals for non-HS-and-non-middle types.
 */
export function buildProcessPhase2Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = [],
  studentTypeOverride: string | undefined,
  archetype: string,
  competitivenessScore: number
): string {
  const { context } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const studentType = resolveStudentType(formData, studentTypeOverride)

  const includeColleges = TYPES_WITH_COLLEGE_RECS.has(studentType)
  const includeSatAct = TYPES_WITH_SAT_ACT.has(studentType)

  const satActSchema = includeSatAct
    ? `,
  "satActGoals": {
    "targetSATScore": "Specific target",
    "satSectionGoals": { "reading": "target with strategy", "math": "target" },
    "targetACTScore": "Specific target",
    "actSectionGoals": { "english": "target", "math": "target", "reading": "target", "science": "target" },
    "prepStrategy": "Detailed prep plan with specific resources",
    "timeline": "Month-by-month testing timeline"
  }`
    : ''

  const collegesSchema = includeColleges
    ? `,
  "collegeRecommendations": {
    "collegeBreakdown": {
      "reach": ["10 reach schools with 1-sentence fit reason — cite the student's SPECIFIC weaknesses"],
      "target": ["10 target schools with reasons referencing student's specific stats vs school medians"],
      "safety": ["10 safety schools with reasons citing how student's stats exceed averages"]
    },
    "schoolMatches": [{"schoolName": "University Name", "matchScore": 0-100, "why": "2-3 sentence fit explanation"}]
  }`
    : ''

  const collegesNote = includeColleges
    ? '\nCRITICAL: Generate at least 12 schoolMatches with detailed why.'
    : ''

  return `${getSystemPrompt(studentType)}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${archetype || 'Unknown'} (Competitiveness: ${competitivenessScore || 0}/100)

${context}
${PROCESS_GUIDELINES(curriculum)}

Generate DETAILED JSON:
{
  "academicCoursesRecommendations": {
    "apCourses": ["6-8 specific AP courses with reasoning — ONLY if AP/US curriculum, otherwise empty array"],
    "ibCourses": ["4-5 IB courses — ONLY if IB curriculum, otherwise empty array"],
    "curriculumSpecificCourses": {"label": "Curriculum name (e.g. CBSE, A-Levels)", "courses": ["4-6 courses — ONLY if NOT AP/IB, otherwise empty array"]},
    "honorsCourses": ["4-5 Honors/advanced courses appropriate for the student's stage"],
    "electivesRecommended": ["4-5 strategic electives"]
  }${satActSchema}${collegesSchema},
  "careerRecommendations": {
    "jobTitles": ["5 specific job titles or roles"],
    "blueOceanIndustries": [{"industry": "Emerging industry", "why": "Why it's a blue ocean for this student"}],
    "salaryPotential": "Salary range with trajectory",
    "linkedInBioHeadline": "Professional headline"
  }
}${collegesNote}`
}

/**
 * Phase 3 prompt: passion projects, research/publications, mentors, waste-of-time.
 * Universal across student types but persona via getSystemPrompt() shapes tone.
 */
export function buildProcessPhase3Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = [],
  studentTypeOverride: string | undefined,
  archetype: string,
  competitivenessScore: number
): string {
  const { context } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const studentType = resolveStudentType(formData, studentTypeOverride)

  return `${getSystemPrompt(studentType)}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${archetype || 'Unknown'} (Competitiveness: ${competitivenessScore || 0}/100)

${context}
${PROCESS_GUIDELINES(curriculum)}

Generate DETAILED JSON tailored to the student's stage (${studentType.replace('_', ' ')}):
{
  "passionProjects": [
    {
      "title": "Specific project title",
      "description": "4-5 sentence description — AMBITIOUS and stage-appropriate (kindergarten-style discovery for elementary, PhD-level rigor for advanced students)",
      "timeCommitment": "Hours per week and duration",
      "skillsDeveloped": ["5-6 specific skills"],
      "applicationImpact": "How this transforms their profile/application/career trajectory",
      "resources": "Specific tools, platforms, funding sources",
      "implementationSteps": ["6-8 detailed step-by-step actions"]
    }
  ],
  "researchPublicationsRecommendations": {
    "researchTopics": ["string - EXACTLY 5 topics. Format: 'Concise Title (5-10 words): Detailed description with methodology, scope, and application'. Stage-appropriate rigor: PhD-level for grad/phd, accessible-but-ambitious for high-school, foundational for younger. Each must include: methodology, target outcome, and real-world application."],
    "publicationOpportunities": ["5-6 REAL journals, conferences, or showcases appropriate for the student's stage"],
    "mentorshipSuggestions": ["4-5 specific strategies to find research/career mentors"],
    "timeline": "Detailed research/project timeline"
  },
  "mentorRecommendations": {
    "mentors": [
      {
        "name": "Professor Name or 'Professor in [field]'",
        "university": "Nearby or relevant university or organization",
        "department": "Specific department",
        "why": "3-4 sentences on fit and approach strategy"
      }
    ]
  },
  "wasteOfTimeActivities": {
    "activities": [{"activity": "Activity to stop", "whyQuit": "2-3 sentence explanation"}]
  }
}

CRITICAL: Generate exactly 3 passion projects. Generate 5+ mentor recommendations.`
}

/**
 * Phase 4 prompt: activities, summer programs, sports, competitions, internships, etc.
 * Skips summerIvyProgramsRecommendations for grad/phd/middle/elementary.
 * Also includes scholarshipRecommendations scoped per type.
 */
export function buildProcessPhase4Prompt(
  formData: Record<string, unknown>,
  knowledgeHubResources: KnowledgeHubResource[] = [],
  studentTypeOverride: string | undefined,
  archetype: string,
  competitivenessScore: number
): string {
  const { context } = buildStudentProfileContext(formData, knowledgeHubResources)
  const academicProfile = (formData.academicProfile || {}) as Record<string, unknown>
  const basicInfo = (formData.basicInfo || {}) as Record<string, unknown>
  const curriculum = sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum)
  const studentType = resolveStudentType(formData, studentTypeOverride)
  const includeSummerIvy = TYPES_WITH_SUMMER_IVY.has(studentType)
  const scholarshipScope = scholarshipScopeGuidance(studentType)

  const summerIvySchema = includeSummerIvy
    ? `,
  "summerIvyProgramsRecommendations": {
    "preFreshmanPrograms": [{"name": "Program name", "description": "What it offers", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "competitivePrograms": [{"name": "Program name", "description": "What it offers", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "researchPrograms": [{"name": "Program name", "description": "What it involves", "dates": "Application deadline and program dates", "relevance": "Why this fits this student"}],
    "enrichmentPrograms": [{"name": "Program name", "description": "What it offers", "dates": "Dates", "relevance": "Why this fits"}]
  }`
    : ''

  return `${getSystemPrompt(studentType)}

Student: ${sanitizeForPrompt(basicInfo.fullName)} — ${archetype || 'Unknown'} (Competitiveness: ${competitivenessScore || 0}/100)

${context}
${PROCESS_GUIDELINES(curriculum)}

Generate DETAILED JSON tailored to the student's stage. For each activity entry use the shape {name, description, dates, relevance}.
${scholarshipScope}

{${summerIvySchema}${includeSummerIvy ? ',' : ''}
  "sportsRecommendations": {
    "varsitySports": [{"name": "Sport", "description": "Goals", "dates": "Season", "relevance": "Why this matters"}],
    "clubSports": [{"name": "Club", "description": "What it involves", "dates": "Season", "relevance": "Why this matters"}],
    "recruitingStrategy": [{"name": "Strategy", "description": "Steps", "dates": "Timeline", "relevance": "Why this matters"}],
    "fitnessLeadership": [{"name": "Opportunity", "description": "What it involves", "dates": "Timeline", "relevance": "Why this matters"}]
  },
  "competitionsRecommendations": {
    "academicCompetitions": [{"name": "Competition name", "description": "What it involves", "dates": "Registration and competition dates", "relevance": "Why this fits"}],
    "businessCompetitions": [{"name": "Competition", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "artsCompetitions": [{"name": "Competition", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "debateSpeech": [{"name": "Competition", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}]
  },
  "internshipsRecommendations": {
    "industryInternships": [{"name": "Internship", "description": "Role details", "dates": "Application deadline", "relevance": "Why this fits"}],
    "researchInternships": [{"name": "Program", "description": "Research details", "dates": "Dates", "relevance": "Why this fits"}],
    "nonprofitInternships": [{"name": "Organization", "description": "Role", "dates": "Dates", "relevance": "Why this fits"}],
    "virtualOpportunities": [{"name": "Opportunity", "description": "What it involves", "dates": "Availability", "relevance": "Why this fits"}]
  },
  "serviceCommunityRecommendations": {
    "localOpportunities": [{"name": "Opportunity", "description": "What it involves", "dates": "Availability", "relevance": "Why this matters"}],
    "nationalPrograms": [{"name": "Program", "description": "What it involves", "dates": "Dates", "relevance": "Why this matters"}],
    "internationalService": [{"name": "Program", "description": "What it involves", "dates": "Dates", "relevance": "Why this matters"}],
    "sustainedCommitment": [{"name": "Strategy", "description": "How to build impact", "dates": "Timeline", "relevance": "Why this matters"}]
  },
  "cultureArtsRecommendations": {
    "performingArts": [{"name": "Opportunity", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "visualArts": [{"name": "Opportunity", "description": "What it involves", "dates": "Dates", "relevance": "Why this fits"}],
    "creativeWriting": [{"name": "Publication", "description": "What it involves", "dates": "Deadline", "relevance": "Why this fits"}],
    "culturalClubs": [{"name": "Organization", "description": "What it involves", "dates": "Schedule", "relevance": "Why this fits"}]
  },
  "studentGovernmentRecommendations": {
    "schoolGovernment": [{"name": "Position", "description": "How to pursue it", "dates": "Election timeline", "relevance": "Why this matters"}],
    "districtStateRoles": [{"name": "Role", "description": "What it involves", "dates": "Deadline", "relevance": "Why this matters"}],
    "youthGovernment": [{"name": "Program", "description": "What it involves", "dates": "Dates", "relevance": "Why this matters"}],
    "advocacyRoles": [{"name": "Role", "description": "What it involves", "dates": "Timeline", "relevance": "Why this matters"}]
  },
  "leadershipRecommendations": {
    "clubLeadership": ["3-4 specific leadership positions"],
    "schoolWideRoles": ["2-3 student/program-body positions"],
    "communityLeadership": ["3-4 external leadership opportunities"],
    "leadershipDevelopment": ["4-5 specific skills and experiences"]
  },
  "scholarshipRecommendations": {
    "scholarships": [
      { "name": "Scholarship/Fellowship/Program Name", "organization": "Organization", "amount": "Amount", "deadline": "Deadline", "why": "Why this student qualifies", "url": "Application URL" }
    ]
  }
}

Be SPECIFIC — name real programs, competitions, and deadlines. Generate EXACTLY 5 items per array/category. Generate at least 4 scholarship/funding recommendations.`
}
