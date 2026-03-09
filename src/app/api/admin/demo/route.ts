import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

/**
 * POST /api/admin/demo
 * Creates a demo assessment with pre-filled sample data and analysis results.
 * Used by super admins to demonstrate the platform to prospects.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get("admin_session")?.value

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Verify admin access (super_admin or god)
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, role, organization_id")
      .eq("id", adminId)
      .single()

    if (adminError || !admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only super_admin and god can create demos, or agency admins for their own org
    const isSuperAdmin = admin.role === "super_admin" || admin.role === "god"

    const body = await request.json().catch(() => ({}))
    const { organizationId } = body

    // Determine which org to use
    let targetOrgId = organizationId
    if (!isSuperAdmin) {
      // Agency admins can only create demos for their own org
      targetOrgId = admin.organization_id
    }

    // Get the target organization (or null for Platform Default)
    let org: { id: string; name: string; slug: string } | null = null
    if (targetOrgId) {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("id", targetOrgId)
        .single()

      if (orgError || !orgData) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 })
      }
      org = orgData
    }

    // Create demo student
    const demoStudentEmail = `demo-${Date.now()}@thestudentblueprint.com`
    const { data: student, error: studentError } = await supabase
      .from("students")
      .insert({
        email: demoStudentEmail,
        first_name: "Alex",
        last_name: "Demo",
        full_name: "Alex Demo",
        current_grade: "11th",
        ...(org ? { organization_id: org.id } : {}),
        parent_email: "parent.demo@thestudentblueprint.com",
      })
      .select()
      .single()

    if (studentError) {
      console.error("Error creating demo student:", studentError)
      return NextResponse.json({ error: "Failed to create demo student" }, { status: 500 })
    }

    // Sample form data representing a strong applicant
    const sampleFormData = {
      basicInfo: {
        firstName: "Alex",
        lastName: "Demo",
        email: demoStudentEmail,
        gradeLevel: "11th",
        schoolName: "Prestigious Academy",
        parentEmail: "parent.demo@thestudentblueprint.com",
      },
      academicProfile: {
        gpaUnweighted: "3.92",
        gpaWeighted: "4.45",
        classRank: "Top 5%",
        coursesTaken: [
          "AP Calculus BC",
          "AP Physics C",
          "AP Computer Science A",
          "AP English Language",
          "AP US History",
          "AP Chemistry",
        ],
        favoriteSubjects: ["Computer Science", "Mathematics", "Physics"],
        academicChallenges: "Balancing rigorous course load while maintaining leadership roles",
      },
      testingInfo: {
        satScore: "1520",
        actScore: "34",
        apScores: "AP Calculus BC: 5, AP Physics 1: 5, AP CS A: 5, AP English Lang: 4",
        plannedTests: "SAT Subject Tests in Math 2 and Physics",
      },
      extracurriculars: {
        activities: [
          {
            name: "Robotics Team Captain",
            role: "Team Captain & Lead Programmer",
            yearsActive: "3",
            hoursPerWeek: "15",
            description: "Led team of 12 to state championship. Developed autonomous navigation systems.",
          },
          {
            name: "Math Olympiad",
            role: "Team Member",
            yearsActive: "4",
            hoursPerWeek: "8",
            description: "AIME qualifier for 2 consecutive years. Mentor underclassmen.",
          },
          {
            name: "Community Tech Tutoring",
            role: "Founder & Lead Tutor",
            yearsActive: "2",
            hoursPerWeek: "5",
            description: "Founded program teaching coding to underserved middle schoolers. 50+ students served.",
          },
          {
            name: "Science Research",
            role: "Student Researcher",
            yearsActive: "2",
            hoursPerWeek: "10",
            description: "Conducting research on machine learning applications in healthcare at local university.",
          },
        ],
      },
      leadership: {
        positions: "Robotics Team Captain, Student Council Technology Chair, Math Club President",
        impactDescription: "Increased robotics team membership by 40%, implemented school-wide digital suggestion system",
      },
      competitions: {
        competitions: "FIRST Robotics State Semifinalist, AIME Qualifier, Science Olympiad Regionals 3rd Place",
        awards: "National Merit Semifinalist, AP Scholar with Distinction, Regional Science Fair 2nd Place",
      },
      passions: {
        topicsYouLove: ["Artificial Intelligence", "Renewable Energy", "Entrepreneurship"],
        industriesCurious: ["Technology", "Healthcare", "Environmental Science"],
        uniqueInterests: "Building custom mechanical keyboards, learning Mandarin, urban farming",
      },
      careerAspirations: {
        topCareers: ["Software Engineer", "AI Researcher", "Tech Entrepreneur"],
        dreamJobTitle: "Founder of an AI-driven healthcare startup",
        whyThisPath: "Want to use technology to make healthcare accessible to underserved communities",
      },
      researchExperience: {
        researchExperience: "Working with Dr. Smith at State University on ML models for early disease detection. Co-authored paper submitted to undergraduate research journal.",
        publications: "Pending publication in undergraduate research symposium",
      },
      summerPrograms: {
        programs: "MIT Launch (entrepreneurship), Stanford AI4ALL, Local University Research Internship",
        internships: "Shadowed software engineers at local tech startup for 2 weeks",
      },
      specialTalents: {
        talents: ["Programming (Python, Java, C++)", "Public Speaking", "Technical Writing"],
        languages: "English (native), Spanish (intermediate), Mandarin (beginner)",
        athleticsArts: "Varsity Tennis, Piano (10 years)",
      },
      personality: {
        topStrengths: ["Problem Solving", "Leadership", "Collaboration", "Persistence"],
        archetypes: ["Builder", "Analyst"],
        workStyle: "Prefer structured approach with room for creative problem-solving",
      },
      personalStories: {
        lifeChallenge: "Overcame learning differences in middle school through determination and developing personalized study strategies. Now mentor other students facing similar challenges.",
        proudMoment: "Leading robotics team from near-elimination to state semifinals while building team cohesion during difficult season",
        uniquePerspective: "First-generation tech enthusiast in family of healthcare workers - bridge between both worlds",
      },
      timeCommitment: {
        hoursSchoolYear: "15-20",
        hoursSummer: "30-40",
        constraints: "Family responsibilities on weekends, must work around tennis practice schedule",
      },
      collegePreferences: {
        dreamSchools: ["MIT", "Stanford", "Carnegie Mellon"],
        factors: ["Strong CS program", "Research opportunities", "Entrepreneurship resources"],
        geography: "Open to anywhere in the US, prefer urban or suburban areas",
      },
    }

    // Pre-generated analysis results (high-quality demo analysis)
    const sampleAnalysis = {
      studentArchetype: "Innovative Builder",
      archetypeScores: {
        Visionary: 88,
        Builder: 95,
        Healer: 72,
        Analyst: 90,
        Artist: 65,
        Advocate: 78,
        Entrepreneur: 92,
        Researcher: 85,
      },
      strengthsAnalysis: {
        competitiveAdvantages: [
          "Strong technical foundation with demonstrated programming expertise across multiple languages",
          "Exceptional leadership experience, progressing from team member to captain in robotics",
          "Research experience with potential publication demonstrates college-level academic capability",
          "Founded community initiative showing genuine commitment to social impact through technology",
          "Test scores and GPA place student in competitive range for top-tier institutions",
        ],
        uniqueDifferentiators: [
          "Unique bridge between healthcare family background and technology passion creates compelling narrative",
          "Combination of competitive robotics, math olympiad, and independent research is rare and impressive",
          "Community tech tutoring program demonstrates leadership initiative beyond traditional extracurriculars",
          "First-generation tech enthusiast perspective adds diversity of thought to applications",
        ],
        alignedActivities: [
          "Robotics leadership directly supports 'Builder' archetype and demonstrates engineering aptitude",
          "Math Olympiad success reinforces analytical capabilities and competitive drive",
          "Research internship validates interest in AI/ML and provides talking points for interviews",
          "Community tutoring shows Advocate qualities and commitment to making technology accessible",
        ],
      },
      gapAnalysis: {
        missingElements: [
          "National-level recognition in primary area (robotics or research) would strengthen profile",
          "International exposure or global perspective project would add dimension",
          "Published research paper or patent application would validate innovation claims",
        ],
        activitiesToDeepen: [
          "Pursue deeper research outcomes - aim for conference presentation or journal publication",
          "Scale community tutoring program to demonstrate sustainable impact and leadership growth",
          "Seek robotics competition at national level or start mentoring younger teams",
        ],
        skillsToDevelope: [
          "Business and entrepreneurship fundamentals to support startup aspirations",
          "Technical writing skills for grant applications and research papers",
          "Networking strategies for connecting with industry professionals and mentors",
        ],
      },
      roadmap: {
        immediate: [
          "Submit current research paper to undergraduate research symposium",
          "Register for SAT Subject Tests in Math 2 and Physics",
          "Begin drafting personal statement focusing on healthcare-tech bridge theme",
          "Research summer programs at target schools (MIT MOSTEC, Stanford Pre-Collegiate)",
          "Schedule informational interviews with 3 tech professionals in healthcare space",
        ],
        shortTerm: [
          "Lead robotics team to qualify for state championship",
          "Expand tutoring program to second school location",
          "Apply for national robotics mentorship opportunities",
          "Develop personal project combining AI and healthcare (e.g., symptom checker app)",
          "Prepare for and take AP exams in remaining subjects",
        ],
        mediumTerm: [
          "Secure competitive summer research position at target university",
          "Submit college applications with compelling narrative",
          "Present research at regional or national conference",
          "Document tutoring program's impact with data and testimonials",
          "Achieve leadership role in additional organization to broaden profile",
        ],
        longTerm: [
          "Establish foundation for college success with strong scholarship applications",
          "Create portfolio website showcasing projects, research, and community impact",
          "Build network of mentors in AI and healthcare entrepreneurship",
          "Develop 4-year college plan aligned with career goals",
          "Position for competitive internships and research opportunities in freshman year",
        ],
      },
      competitivenessScore: 87,
      collegeRecommendations: {
        reach: ["MIT", "Stanford", "Carnegie Mellon", "Caltech"],
        match: ["Georgia Tech", "UC Berkeley", "University of Michigan", "Cornell"],
        safety: ["University of Illinois", "Purdue", "University of Washington", "UT Austin"],
      },
      essayTopics: [
        "The moment teaching coding to underserved students revealed your purpose",
        "How growing up around healthcare workers shaped your approach to technology",
        "The robotics season that tested your leadership and taught you resilience",
        "Bridging two worlds: Using tech to honor your family's healthcare legacy",
      ],
      actionPriorities: [
        {
          priority: "High",
          action: "Complete and submit research paper",
          deadline: "Within 6 weeks",
          impact: "Validates academic capability and research commitment",
        },
        {
          priority: "High",
          action: "Prepare compelling personal statement draft",
          deadline: "Within 8 weeks",
          impact: "Central to application narrative across all schools",
        },
        {
          priority: "Medium",
          action: "Scale tutoring program with documented outcomes",
          deadline: "Within 3 months",
          impact: "Strengthens community impact and leadership story",
        },
        {
          priority: "Medium",
          action: "Develop healthcare-focused personal project",
          deadline: "Within 4 months",
          impact: "Demonstrates initiative and reinforces career narrative",
        },
      ],
    }

    // Full demo data for all results page sections
    const demoPassionProjects = [
      {
        title: "HealthBridge AI",
        description: "Build an AI-powered symptom triage chatbot that connects underserved patients with relevant healthcare resources and nearby free clinics.",
        timeCommitment: "8-10 hours/week for 6 months",
        skillsDeveloped: ["Machine Learning", "Healthcare Systems", "UX Design", "Data Privacy"],
        applicationImpact: "Demonstrates intersection of tech and healthcare passion. Shows initiative, real-world problem-solving, and commitment to equity.",
        resources: "Google Dialogflow, OpenAI API, local community health center partnerships",
      },
      {
        title: "RoboMentor Network",
        description: "Launch an online mentorship platform pairing experienced robotics students with underrepresented middle schoolers interested in STEM.",
        timeCommitment: "5-6 hours/week ongoing",
        skillsDeveloped: ["Platform Development", "Mentorship", "Program Management", "Community Building"],
        applicationImpact: "Scales existing tutoring work into a sustainable initiative. Strong story of leadership growth from local to broader impact.",
        resources: "Discord/Slack for community, GitHub Pages for website, partnerships with local schools",
      },
    ]

    const demoAcademicCourses = {
      apCourses: ["AP Computer Science Principles", "AP Statistics", "AP Biology", "AP Government"],
      ibCourses: ["IB Mathematics HL", "IB Physics HL", "IB Computer Science HL"],
      honorsCourses: ["Honors Linear Algebra", "Honors Multivariable Calculus", "Honors Technical Writing"],
      electivesRecommended: ["Data Science", "Engineering Design", "Bioethics", "Entrepreneurship"],
    }

    const demoSatActGoals = {
      targetSATScore: "1550+",
      satSectionGoals: { reading: "780+", writing: "780+", math: "800" },
      targetACTScore: "35+",
      actSectionGoals: { english: "35+", math: "36", reading: "35+", science: "35+" },
      prepStrategy: "Focus on reading comprehension speed and evidence-based writing. Math foundation is strong — target perfect score. Use official College Board practice tests weekly.",
      timeline: "Begin intensive prep 4 months before test date. Take first attempt in spring of junior year, retake in fall of senior year if needed.",
    }

    const demoResearchPubs = {
      researchTopics: [
        "Machine learning models for early detection of chronic diseases",
        "Natural language processing for patient-doctor communication barriers",
        "Computer vision applications in radiology screening",
      ],
      publicationOpportunities: [
        "Journal of Young Investigators (JYI)",
        "Regeneron Science Talent Search",
        "Siemens Competition in Math, Science & Technology",
        "Local university undergraduate research symposium",
      ],
      mentorshipSuggestions: [
        "Reach out to CS and biomedical engineering professors at nearby research universities",
        "Apply to MIT PRIMES or RSI for structured research mentorship",
        "Connect with graduate students working on healthcare AI through LinkedIn",
      ],
      timeline: "Submit first paper by end of junior year. Present at regional conference by summer before senior year.",
    }

    const demoLeadership = {
      clubLeadership: [
        "Continue as Robotics Team Captain — aim for national qualification",
        "Run for Science Olympiad team leadership position",
        "Mentor underclassmen in Math Club as outgoing president",
      ],
      schoolWideRoles: [
        "Technology Chair on Student Council — lead digital initiatives",
        "Organize school-wide STEM showcase or hackathon event",
        "Start peer tutoring coordinator role for STEM subjects",
      ],
      communityLeadership: [
        "Expand Community Tech Tutoring to partner with local library system",
        "Organize neighborhood STEM fair for elementary students",
        "Volunteer as mentor at local Boys & Girls Club tech program",
      ],
      leadershipDevelopment: [
        "Apply to NSLC Engineering & Technology program",
        "Attend Leadership Enterprise for a Diverse America (LEDA)",
        "Practice public speaking through Toastmasters Youth Leadership Program",
      ],
    }

    const demoServiceCommunity = {
      localOpportunities: [
        "Teach coding workshops at local community centers and libraries",
        "Volunteer at free health clinics — bridge tech knowledge to improve patient intake",
        "Organize e-waste recycling and computer refurbishment for low-income families",
      ],
      nationalPrograms: [
        "Apply to be an Coding Ambassador through Code.org",
        "Join National Honor Society community service projects",
        "Participate in Habitat for Humanity builds with tech documentation",
      ],
      internationalService: [
        "Participate in virtual tutoring for international students learning STEM",
        "Contribute to open-source healthcare software projects (OpenMRS, GNU Health)",
        "Join Engineers Without Borders student chapter",
      ],
      sustainedCommitment: [
        "Maintain weekly tutoring sessions year-round (not just during school year)",
        "Document impact with student progress data and testimonials",
        "Create a sustainability plan so program continues after you graduate",
      ],
    }

    const demoSummerPrograms = {
      preFreshmanPrograms: [
        "MIT MOSTEC (Minority Introduction to Engineering and Science)",
        "Stanford Pre-Collegiate Summer Institutes",
        "Carnegie Mellon Pre-College Program in CS",
      ],
      competitivePrograms: [
        "Research Science Institute (RSI) at MIT — most competitive",
        "TASP (Telluride Association Summer Program)",
        "Clark Scholars Program at Texas Tech",
      ],
      researchPrograms: [
        "Simons Summer Research Fellowship",
        "NIH High School Summer Internship Program",
        "University-specific REU programs in Computer Science",
      ],
      enrichmentPrograms: [
        "Google CSSI (Computer Science Summer Institute)",
        "Facebook/Meta University Engineering Program",
        "Kode With Klossy coding summer camp (leadership track)",
      ],
    }

    const demoSports = {
      varsitySports: [
        "Continue Varsity Tennis — aim for team captain senior year",
        "Consider competing in USTA junior tournaments for additional recognition",
      ],
      clubSports: [
        "Join school or community rock climbing club for cross-training",
        "Consider intramural ultimate frisbee for team bonding and fun",
      ],
      recruitingStrategy: [
        "Tennis may not be primary recruiting angle, but mention in applications as long-term commitment",
        "Create a highlight reel if competitive level warrants it",
        "Reach out to college club tennis teams for walk-on opportunities",
      ],
      fitnessLeadership: [
        "Organize tennis clinics for younger students in the community",
        "Start a wellness or fitness club at school emphasizing student-athlete balance",
      ],
    }

    const demoCompetitions = {
      academicCompetitions: [
        "AMC 12 → AIME → USAMO pathway (continue current trajectory)",
        "USACO (USA Computing Olympiad) — aim for Gold/Platinum division",
        "Science Olympiad — compete at state and national level",
        "Physics Olympiad (USAPhO) qualifier",
      ],
      businessCompetitions: [
        "DECA State and International Competition",
        "Diamond Challenge entrepreneurship competition",
        "Conrad Challenge for innovation in STEM",
      ],
      artsCompetitions: [
        "Scholastic Art & Writing Awards (for technical writing or creative nonfiction)",
        "Piano competitions at regional/state level (MTNA)",
      ],
      debateSpeech: [
        "Join speech team — Original Oratory or Extemporaneous Speaking",
        "Consider policy debate for developing argumentation skills",
      ],
    }

    const demoStudentGov = {
      schoolGovernment: [
        "Run for Student Body Vice President or President senior year",
        "Propose and lead a tech modernization initiative for student council",
        "Create a student advisory board for school technology decisions",
      ],
      districtStateRoles: [
        "Apply for district-level Student Advisory Board positions",
        "Attend state Board of Education student representative meetings",
        "Join your state's Student Council Association",
      ],
      youthGovernment: [
        "Participate in YMCA Youth & Government program",
        "Apply for Congressional Award program (Gold Medal track)",
        "Consider Boys/Girls State program for civic engagement experience",
      ],
      advocacyRoles: [
        "Advocate for increased CS education funding at school board meetings",
        "Write op-eds for local newspaper on STEM education equity",
        "Partner with local representatives on tech literacy initiatives",
      ],
    }

    const demoInternships = {
      industryInternships: [
        "Apply to Google STEP internship (sophomore/junior year)",
        "Microsoft Explore Program for underclassmen",
        "Local tech startups — offer to build tools or analyze data",
      ],
      researchInternships: [
        "University hospital informatics department (combine healthcare + CS)",
        "Robotics lab at nearby research university",
        "Government research labs (NASA, DOE) — summer student programs",
      ],
      nonprofitInternships: [
        "Code for America — civic tech fellowship",
        "Local health nonprofit — help with data systems and analysis",
        "Khan Academy content development internship",
      ],
      virtualOpportunities: [
        "Contribute to major open-source projects on GitHub",
        "Remote internships through Extern or Virtual Internships platform",
        "Online research collaborations through PolyMath or Zooniverse",
      ],
    }

    const demoCultureArts = {
      performingArts: [
        "Continue piano — consider accompanying school performances",
        "Join school jazz ensemble or start a small music group",
        "Perform at community events to combine music with service",
      ],
      visualArts: [
        "Create digital art or visualizations combining art and technology",
        "Design graphics and branding for your passion projects",
        "Enter STEM-themed art competitions (Art of Science, SciArt)",
      ],
      creativeWriting: [
        "Start a blog or Medium publication about tech and healthcare intersections",
        "Write for school newspaper — technology or science column",
        "Submit pieces to teen literary magazines (Polyphony Lit, The Adroit Journal)",
      ],
      culturalClubs: [
        "Join or start a Multicultural STEM Alliance at school",
        "Participate in cultural celebration events with tech demonstrations",
        "Connect with professional organizations for underrepresented groups in tech (NSBE, SHPE)",
      ],
    }

    const demoCareer = {
      jobTitles: [
        "AI/ML Engineer at a Healthcare Technology Company",
        "Founder/CTO of a Health-Tech Startup",
        "Research Scientist in Computational Medicine",
        "Product Manager for Health AI Products",
      ],
      blueOceanIndustries: [
        { industry: "Digital Therapeutics", why: "FDA-approved software as medicine is a rapidly growing field with few specialists who combine deep CS and healthcare knowledge." },
        { industry: "AI-Powered Diagnostics", why: "Shortage of engineers who understand both ML architecture and clinical workflows — your unique background bridges this gap." },
        { industry: "Health Equity Technology", why: "Massive unmet need for technologists focused on making healthcare accessible. Your tutoring background shows commitment to equity." },
      ],
      salaryPotential: "Starting salary: $120K-$160K at major tech companies. Founding a health-tech startup could lead to significantly higher earnings within 5-10 years.",
      linkedInBioHeadline: "Aspiring Health-Tech Innovator | Robotics Captain | AI Researcher | Building technology to make healthcare accessible for all",
    }

    const demoCollegeRecs = {
      collegeBreakdown: {
        reach: ["MIT", "Stanford", "Carnegie Mellon", "Caltech"],
        target: ["Georgia Tech", "UC Berkeley", "University of Michigan", "Cornell"],
        safety: ["University of Illinois Urbana-Champaign", "Purdue", "University of Washington", "UT Austin"],
      },
      schoolMatches: [
        { schoolName: "MIT", matchScore: 92, why: "Top CS and AI programs, strong entrepreneurship ecosystem (MIT $100K), undergraduate research culture aligns perfectly with your profile." },
        { schoolName: "Stanford", matchScore: 90, why: "Stanford Bio-X for health-tech intersection, d.school for design thinking, Silicon Valley access for startup ambitions." },
        { schoolName: "Carnegie Mellon", matchScore: 88, why: "Top-ranked CS school with strong robotics program (NREC). Healthcare Robotics Lab matches your interests perfectly." },
        { schoolName: "Georgia Tech", matchScore: 85, why: "Excellent CS program with health informatics specialization. CREATE-X startup accelerator and strong industry connections." },
      ],
    }

    const demoMentors = {
      mentors: [
        {
          name: "Dr. Sarah Chen",
          university: "MIT",
          department: "Computer Science and Artificial Intelligence Laboratory (CSAIL)",
          why: "Leading researcher in ML applications for healthcare diagnostics. Her lab actively recruits motivated undergrads.",
          coldEmailTemplate: "Subject: Undergraduate Research Interest in Healthcare AI\n\nDear Dr. Chen,\n\nI am a high school junior passionate about applying machine learning to healthcare challenges. I have been conducting research on ML models for early disease detection at [University] and am deeply inspired by your work on [specific paper/project].\n\nI would love the opportunity to discuss potential undergraduate research in your lab. I bring experience in Python, TensorFlow, and a genuine commitment to making healthcare technology more accessible.\n\nThank you for your time and consideration.\n\nBest regards,\nAlex Demo",
        },
        {
          name: "Prof. Michael Rodriguez",
          university: "Stanford",
          department: "Biomedical Informatics",
          why: "Focuses on NLP for clinical text — directly relevant to your interest in patient-doctor communication. Known for mentoring undergrads.",
        },
        {
          name: "Dr. Priya Patel",
          university: "Carnegie Mellon",
          department: "Robotics Institute",
          why: "Works on assistive robotics for healthcare. Your robotics leadership experience makes you a strong fit for her lab.",
        },
      ],
    }

    const demoWasteOfTime = {
      activities: [
        { activity: "Generic volunteering without measurable impact", whyQuit: "Replace scattered volunteer hours with your focused Community Tech Tutoring program. Depth over breadth matters more for top schools." },
        { activity: "Too many club memberships without leadership", whyQuit: "Being a passive member of 8+ clubs dilutes your narrative. Focus on 4-5 where you lead, create, and drive measurable outcomes." },
        { activity: "SAT prep courses without targeted practice", whyQuit: "Your scores are already strong. Switch from general prep to targeted practice on weak areas only. Use freed time for passion projects." },
      ],
    }

    const demoGradeByGradeRoadmap = {
      currentGrade: {
        grade: "11th Grade (Current)",
        focus: "Maximize impact and begin college application groundwork",
        academics: [
          "Maintain 3.9+ unweighted GPA across all courses",
          "Excel in AP Calculus BC and AP Physics C — aim for 5s on both",
          "Take AP Computer Science Principles for additional CS credential",
        ],
        extracurriculars: [
          "Lead Robotics Team to state championship — document journey",
          "Scale Community Tech Tutoring to 75+ students served",
          "Submit ML healthcare research paper to journal",
        ],
        testing: [
          "Retake SAT aiming for 1550+ (focus on reading section)",
          "Register for SAT Subject Tests: Math 2 and Physics",
          "Complete remaining AP exams",
        ],
        leadership: [
          "Run for Student Council Technology Chair position",
          "Mentor 3+ underclassmen in robotics and math competitions",
          "Organize school-wide hackathon or STEM showcase",
        ],
        summerPlan: "Apply to RSI, MOSTEC, or Stanford Pre-Collegiate. If not accepted, secure research internship at local university hospital's informatics department.",
      },
      nextYears: [
        {
          grade: "12th Grade",
          focus: "Execute college applications and demonstrate sustained leadership",
          academics: [
            "Continue rigorous course load: AP Statistics, AP Government, AP Biology",
            "Maintain strong GPA — no senior year dip",
            "Consider dual enrollment in college-level CS or math course",
          ],
          extracurriculars: [
            "Serve as Robotics Team Captain for final season",
            "Launch HealthBridge AI passion project and demonstrate initial users",
            "Present research findings at regional or national conference",
          ],
          testing: [
            "Submit final test scores to colleges by October/November",
            "Complete any remaining AP exams in spring",
          ],
          leadership: [
            "Transition leadership of clubs to successors — demonstrate mentorship",
            "Write recommendation request letters highlighting growth and impact",
            "Create sustainability plan for Community Tech Tutoring program",
          ],
          summerPlan: "Pre-college orientation, connect with future classmates and professors. Begin exploring undergraduate research opportunities at chosen university.",
        },
      ],
    }

    // Create the demo assessment with ALL fields populated
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        student_id: student.id,
        ...(org ? { organization_id: org.id } : {}),
        is_demo: true,
        status: "completed",
        responses: sampleFormData,
        scores: {
          competitivenessScore: sampleAnalysis.competitivenessScore,
          archetypeScores: sampleAnalysis.archetypeScores,
        },
        report_data: sampleAnalysis,
        student_archetype: sampleAnalysis.studentArchetype,
        archetype_scores: sampleAnalysis.archetypeScores,
        competitiveness_score: sampleAnalysis.competitivenessScore,
        roadmap_data: sampleAnalysis.roadmap,
        grade_by_grade_roadmap: demoGradeByGradeRoadmap,
        strengths_analysis: sampleAnalysis.strengthsAnalysis,
        gap_analysis: sampleAnalysis.gapAnalysis,
        passion_projects: demoPassionProjects,
        academic_courses_recommendations: demoAcademicCourses,
        sat_act_goals: demoSatActGoals,
        research_publications_recommendations: demoResearchPubs,
        leadership_recommendations: demoLeadership,
        service_community_recommendations: demoServiceCommunity,
        summer_ivy_programs_recommendations: demoSummerPrograms,
        sports_recommendations: demoSports,
        competitions_recommendations: demoCompetitions,
        student_government_recommendations: demoStudentGov,
        internships_recommendations: demoInternships,
        culture_arts_recommendations: demoCultureArts,
        career_recommendations: demoCareer,
        college_recommendations: demoCollegeRecs,
        mentor_recommendations: demoMentors,
        waste_of_time_activities: demoWasteOfTime,
        payment_status: "paid",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error("Error creating demo assessment:", assessmentError)
      // Clean up student if assessment creation fails
      await supabase.from("students").delete().eq("id", student.id)
      return NextResponse.json({ error: "Failed to create demo assessment" }, { status: 500 })
    }

    // Log the demo creation
    await supabase.from("audit_logs").insert({
      admin_id: admin.id,
      action: "create_demo",
      entity_type: "assessment",
      entity_id: assessment.id,
      details: {
        organization_id: org?.id || null,
        organization_name: org?.name || "Platform Default",
        student_id: student.id,
        demo_type: "full_assessment",
      },
    })

    // Build the results URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.thestudentblueprint.com"
    const resultsUrl = `${baseUrl}/results/${assessment.id}`

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        studentName: "Alex Demo",
        organization: org?.name || "Platform Default",
        competitivenessScore: sampleAnalysis.competitivenessScore,
        archetype: sampleAnalysis.studentArchetype,
      },
      resultsUrl,
      message: "Demo assessment created successfully. You can now view the results page.",
    })
  } catch (error) {
    console.error("Error creating demo:", error)
    return NextResponse.json({ error: "Failed to create demo" }, { status: 500 })
  }
}
