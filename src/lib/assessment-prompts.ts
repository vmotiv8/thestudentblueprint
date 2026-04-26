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

  const context = `Student Information:
- Name: ${sanitizeForPrompt(basicInfo.fullName)}
- Current Grade: ${currentGrade}
- Location: ${sanitizeForPrompt(basicInfo.address)}, ${sanitizeForPrompt(basicInfo.city)}, ${sanitizeForPrompt(basicInfo.state)}, ${sanitizeForPrompt(basicInfo.country)}
- Curriculum: ${sanitizeForPrompt(academicProfile.curriculum || basicInfo.curriculum) || 'Not provided'}
- Planning to Study Abroad: ${basicInfo.studyAbroad ? 'Yes' : 'No'}
- Target Countries: ${sanitizeForPrompt(toStringList(basicInfo.targetCountries || []))}
- GPA Scale: ${sanitizeForPrompt(academicProfile.gpaScale) || 'Not provided'}
- GPA: ${sanitizeForPrompt(academicProfile.gpaUnweighted) || 'Not provided'} (unweighted), ${sanitizeForPrompt(academicProfile.gpaWeighted) || 'Not provided'} (weighted)

Academic Profile:
- Advanced/Curriculum Courses Taken: ${sanitizeForPrompt(toStringList(academicProfile.coursesTaken))}
- Regular Courses Taken: ${sanitizeForPrompt(toStringList(academicProfile.regularCoursesTaken))}
- Courses Planned: ${sanitizeForPrompt(toStringList(academicProfile.coursesPlanned))}
- Regular Courses Planned: ${sanitizeForPrompt(toStringList(academicProfile.regularCoursesPlanned))}
- Class Rank: ${sanitizeForPrompt(academicProfile.classRank) || 'Not provided'}
- Academic Awards: ${sanitizeForPrompt(academicProfile.academicAwards) || 'Not provided'}
- Favorite Subjects: ${sanitizeForPrompt(toStringList(academicProfile.favoriteSubjects))}
- Least Favorite Subjects: ${sanitizeForPrompt(toStringList(academicProfile.leastFavoriteSubjects))}
- PSAT Score: ${sanitizeForPrompt(testingInfo.psatScore) || 'Not taken'}${testingInfo.psatMath ? ` (Math: ${sanitizeForPrompt(testingInfo.psatMath)}, Reading: ${sanitizeForPrompt(testingInfo.psatReading)})` : ''}
- SAT Score: ${sanitizeForPrompt(testingInfo.satScore) || 'Not taken'}${testingInfo.satMath ? ` (Math: ${sanitizeForPrompt(testingInfo.satMath)}, Reading: ${sanitizeForPrompt(testingInfo.satReading)})` : ''}
- ACT Score: ${sanitizeForPrompt(testingInfo.actScore) || 'Not taken'}${testingInfo.actEnglish ? ` (English: ${sanitizeForPrompt(testingInfo.actEnglish)}, Math: ${sanitizeForPrompt(testingInfo.actMath)}, Reading: ${sanitizeForPrompt(testingInfo.actReading)}, Science: ${sanitizeForPrompt(testingInfo.actScience)})` : ''}
- AP/IB Exam Scores: ${sanitizeForPrompt(testingInfo.apScores) || 'Not provided'}
- Testing Timeline: ${sanitizeForPrompt(testingInfo.testingTimeline) || 'Not provided'}

Extracurriculars & Leadership:
${sanitizeForPrompt(JSON.stringify(extracurriculars.activities || []), 2000)}
- Leadership: ${sanitizeForPrompt(leadership.positions) || 'Not provided'}
- Competitions: ${sanitizeForPrompt(competitions.competitions) || 'Not provided'}

Passions & Interests:
- Topics They Love: ${sanitizeForPrompt(toStringList(passions.topicsYouLove))}
- Industries Curious About: ${sanitizeForPrompt(toStringList(passions.industriesCurious))}

Career Aspirations:
- Top Careers: ${sanitizeForPrompt(toStringList(careerAspirations.career1 || ''))}, ${sanitizeForPrompt(toStringList(careerAspirations.career2 || ''))}
- Dream Job: ${sanitizeForPrompt(careerAspirations.dreamJobTitle) || 'Not provided'}

Experience & Talents:
- Research: ${sanitizeForPrompt(researchExperience.researchExperience) || 'Not provided'}
- Summer Programs: ${sanitizeForPrompt(summerPrograms.programs) || 'Not provided'}
- Special Talents: ${sanitizeForPrompt(JSON.stringify(specialTalents), 2000)}

Family Context:
- Father's Profession: ${sanitizeForPrompt(familyContext.fatherProfession) || 'Not provided'}
- Mother's Profession: ${sanitizeForPrompt(familyContext.motherProfession) || 'Not provided'}
- Sibling Professions: ${sanitizeForPrompt(familyContext.siblingProfessions) || 'Not provided'}
- Legacy Connections: ${sanitizeForPrompt(JSON.stringify(familyContext.legacyEntries || []), 1000)}
- Annual Family Income: ${sanitizeForPrompt(familyContext.annualFamilyIncome) || 'Not provided'}
- Financial Aid Needed: ${familyContext.financialAidNeeded ? 'Yes' : 'No'}
- Merit Scholarship Interest: ${familyContext.meritScholarshipInterest ? 'Yes' : 'No'}

Personality & Story:
- Strengths: ${sanitizeForPrompt(toStringList(personality.topStrengths))}
- Weaknesses: ${sanitizeForPrompt(toStringList(personality.topWeaknesses))}
- Personality Type: ${sanitizeForPrompt(personality.introvertExtrovert) || 'Not provided'}
- Archetypes: ${sanitizeForPrompt(toStringList(personality.archetypes))}
- Life Challenge: ${sanitizeForPrompt(personalStories.lifeChallenge) || 'Not provided'}
- Leadership Moment: ${sanitizeForPrompt(personalStories.leadershipMoment) || 'Not provided'}
- Failure Lesson: ${sanitizeForPrompt(personalStories.failureLesson) || 'Not provided'}
- Proud Moment: ${sanitizeForPrompt(personalStories.proudMoment) || 'Not provided'}

Time Commitment:
- School Year: ${sanitizeForPrompt(timeCommitment.hoursSchoolYear) || 'Not provided'}
- Summer: ${sanitizeForPrompt(timeCommitment.hoursSummer) || 'Not provided'}
${khSection}`

  return { context, currentGrade }
}

const SYSTEM_PREAMBLE = `You are an expert college admissions counselor and academic success strategist specializing in Ivy League and Top 20 college admissions with 15+ years of experience. Your students have been accepted to Harvard, Stanford, MIT, Yale, Princeton, and other elite institutions. You understand what sets apart successful applicants: intellectual vitality, demonstrated impact, authentic passion, and a compelling narrative.

CRITICAL: Your recommendations MUST be specific, actionable, and prestigious. Avoid generic advice. Focus on opportunities that demonstrate exceptional achievement and differentiation.

For gap analysis and missing elements: Be BRUTALLY HONEST. Do not soften the message. Students are paying for the truth, not flattery. If their profile has serious holes, say so directly. Use language like "dealbreaker", "critical gap", "will be rejected if not addressed". The goal is to give them a reality check so they can fix it in time.`

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

  return `${SYSTEM_PREAMBLE}

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

  return `${SYSTEM_PREAMBLE}

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

  return `${SYSTEM_PREAMBLE}

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
