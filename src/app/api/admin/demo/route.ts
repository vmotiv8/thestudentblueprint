import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"
import { getDefaultOrganization } from "@/lib/tenant"

/**
 * Returns all demo data for a given demo type.
 * Supported types: "healthcare", "finance", "engineering"
 */
function getDemoData(demoType: string) {
  if (demoType === "finance") {
    return getFinanceDemoData()
  } else if (demoType === "engineering") {
    return getEngineeringDemoData()
  } else if (demoType === "elementary") {
    return getElementaryDemoData()
  } else if (demoType === "middle") {
    return getMiddleDemoData()
  } else if (demoType === "undergrad") {
    return getUndergradDemoData()
  } else if (demoType === "grad") {
    return getGradDemoData()
  } else if (demoType === "phd") {
    return getPhdDemoData()
  }
  return getHealthcareDemoData()
}

function getHealthcareDemoData() {
  const student = {
    first_name: "Priya",
    last_name: "Sharma",
    full_name: "Priya Sharma",
    current_grade: "9th",
    parent_email: "parent.demo@thestudentblueprint.com",
  }

  const formData = {
    basicInfo: {
      firstName: "Priya",
      lastName: "Sharma",
      email: "__EMAIL__",
      gradeLevel: "9th",
      schoolName: "Pace Academy",
      parentEmail: "parent.demo@thestudentblueprint.com",
    },
    academicProfile: {
      gpaUnweighted: "4.0",
      gpaWeighted: "4.3",
      classRank: "Top 3%",
      coursesTaken: [
        "Honors Biology",
        "Honors Chemistry",
        "Honors English 9",
        "Honors Geometry",
        "World History",
        "Spanish II",
      ],
      favoriteSubjects: ["Biology", "Chemistry", "English"],
      academicChallenges: "Balancing a demanding honors course load with hospital volunteering, cross country, and violin practice",
    },
    testingInfo: {
      satScore: "",
      actScore: "",
      apScores: "",
      plannedTests: "PSAT 8/9 this spring, PSAT 10 sophomore year, SAT and AP exams starting junior year",
    },
    extracurriculars: {
      activities: [
        {
          name: "Health Awareness Club",
          role: "Founder & President",
          yearsActive: "1",
          hoursPerWeek: "6",
          description: "Founded Pace Academy's first health literacy club. Organize monthly workshops on teen nutrition, mental health, and first aid. Partnered with local pediatricians to host Q&A sessions for students.",
        },
        {
          name: "Science Olympiad",
          role: "Varsity Team Member — Disease Detectives",
          yearsActive: "1",
          hoursPerWeek: "8",
          description: "Specialize in the Disease Detectives (epidemiology) event. Placed 3rd at regional invitational. Also compete in Anatomy & Physiology and Forensics events.",
        },
        {
          name: "Grady Memorial Hospital Volunteer",
          role: "Youth Volunteer — Patient Services",
          yearsActive: "1",
          hoursPerWeek: "5",
          description: "Volunteer weekly at Atlanta's largest public hospital. Assist nursing staff with patient comfort, deliver supplies, and interact with patients in the pediatric and rehabilitation wards.",
        },
        {
          name: "Cross Country & Track",
          role: "Varsity Runner",
          yearsActive: "1",
          hoursPerWeek: "12",
          description: "Varsity cross country runner at Pace Academy. Compete in 5K races across Georgia. Also run the 1600m and 3200m in spring track season.",
        },
        {
          name: "Violin — School Orchestra & Private Study",
          role: "First Violin, Atlanta Youth Symphony audition track",
          yearsActive: "6",
          hoursPerWeek: "7",
          description: "Play first violin in Pace Academy orchestra. Studying privately with a teacher from the Atlanta Symphony Orchestra. Preparing audition for Atlanta Symphony Youth Orchestra.",
        },
      ],
    },
    leadership: {
      positions: "Founder & President of Health Awareness Club, Class Representative on Student Council, Science Olympiad Disease Detectives Team Lead",
      impactDescription: "Built health club from zero to 35 members in first semester. Organized a school-wide CPR certification day with the American Red Cross that trained 120 students.",
    },
    competitions: {
      competitions: "Science Olympiad Regionals (Disease Detectives 3rd Place), Georgia Science & Engineering Fair, HOSA Future Health Professionals (preparing for state)",
      awards: "Pace Academy Freshman Scholar Award, Science Olympiad Regional Medal, Perfect Attendance Award",
    },
    passions: {
      topicsYouLove: ["Neuroscience", "Global Health", "Bioethics"],
      industriesCurious: ["Healthcare", "Medical Research", "Public Health"],
      uniqueInterests: "Fascinated by the ethics of gene editing (CRISPR), reads medical case studies for fun, learning about Ayurvedic medicine from grandparents in India",
    },
    careerAspirations: {
      topCareers: ["Physician (Neurosurgeon or Cardiologist)", "Medical Researcher", "Public Health Leader"],
      dreamJobTitle: "Neurosurgeon at a top academic medical center who also leads global health initiatives",
      whyThisPath: "Growing up watching my father save lives as a cardiologist and my mother care for patients as a pharmacist, I've always known medicine is my calling. I want to combine clinical practice with research to develop new treatments for neurological diseases, especially in underserved communities.",
    },
    researchExperience: {
      researchExperience: "Shadowed physicians at Emory Healthcare across cardiology, neurology, and emergency medicine departments (40+ hours). Currently working on an independent research project analyzing teen mental health data in Fulton County for the Georgia Science & Engineering Fair.",
      publications: "No publications yet — actively developing first research project for science fair submission",
    },
    summerPrograms: {
      programs: "Exploring Emory Pre-College Program, HOSA Summer Leadership Conference, and local hospital volunteer intensives for this summer",
      internships: "Shadowed Dr. Raj Sharma (father) at Emory Saint Joseph's Hospital cardiology department for two weeks",
    },
    specialTalents: {
      talents: ["Scientific Research & Lab Skills", "Public Speaking & Health Education", "Violin Performance"],
      languages: "English (native), Hindi (conversational fluency), Spanish (basic — currently in Spanish II)",
      athleticsArts: "Varsity Cross Country & Track, Violin (6 years — orchestra first chair, pursuing ASYO audition)",
    },
    personality: {
      topStrengths: ["Empathy", "Discipline", "Intellectual Curiosity", "Leadership"],
      archetypes: ["Healer", "Researcher"],
      workStyle: "Thrive on structured goals with deep focus time. Highly motivated by purpose-driven work. Prefer quality over quantity in all commitments.",
    },
    personalStories: {
      lifeChallenge: "When my grandmother in India was misdiagnosed due to a language barrier with her doctors, I saw firsthand how communication failures in healthcare can be life-threatening. That experience ignited my passion for health equity and culturally competent medicine.",
      proudMoment: "Organizing Pace Academy's first CPR certification day — seeing 120 classmates learn to save lives in a single afternoon was the most fulfilling thing I've done. Three students later used their training to help family members in real emergencies.",
      uniquePerspective: "As an Indian-American daughter of two healthcare professionals, I bridge Eastern and Western medical philosophies. My grandparents practice Ayurvedic medicine; my parents practice Western allopathic medicine. I want to integrate the best of both worlds.",
    },
    timeCommitment: {
      hoursSchoolYear: "15-20",
      hoursSummer: "30-40",
      constraints: "Cross country practice daily after school during fall season, violin lessons on Saturdays, hospital volunteering on Sunday mornings",
    },
    collegePreferences: {
      dreamSchools: ["Harvard", "Yale", "UPenn", "Columbia", "Princeton"],
      factors: ["Top pre-med program", "Research hospital affiliation", "Strong undergraduate science departments", "Global health opportunities"],
      geography: "Prefer East Coast for proximity to top medical schools, but open to exceptional programs anywhere. Would love to stay connected to Atlanta as well.",
    },
  }

  const analysis = {
    studentArchetype: "Compassionate Healer",
    archetypeScores: {
      Healer: 96,
      Researcher: 90,
      Advocate: 88,
      Analyst: 85,
      Visionary: 82,
      Builder: 70,
      Artist: 74,
      Entrepreneur: 68,
    },
    strengthsAnalysis: {
      competitiveAdvantages: [
        "Deeply authentic pre-med narrative rooted in family legacy — both parents are healthcare professionals (cardiologist father, pharmacist mother), providing a genuine and compelling 'why medicine' story",
        "Already building clinical exposure as a freshman through consistent volunteering at Grady Memorial Hospital, one of the nation's busiest public hospitals",
        "Founded Health Awareness Club from scratch, demonstrating entrepreneurial leadership and genuine passion for health education — not just resume padding",
        "Science Olympiad competitor specializing in Disease Detectives (epidemiology) shows early specialization in a field directly aligned with career goals",
        "Perfect 4.0 unweighted GPA in a rigorous honors curriculum at Pace Academy, one of Atlanta's most prestigious private schools",
        "Unique bicultural perspective bridging Indian and American medical traditions adds depth and diversity to applications",
      ],
      uniqueDifferentiators: [
        "Rare combination of clinical volunteering, health advocacy leadership, and competitive science at the freshman level — most students don't develop this coherence until junior year",
        "Personal story of grandmother's misdiagnosis due to language barriers provides a powerful, authentic motivation for pursuing health equity",
        "Six years of violin study combined with varsity cross country demonstrates the discipline and well-roundedness that Ivy League schools seek",
        "Access to physician shadowing at Emory Healthcare system gives real clinical exposure that few 9th graders can claim",
        "Bilingual capability (English/Hindi) with Spanish studies positions her for serving diverse patient populations",
      ],
      alignedActivities: [
        "Grady Memorial Hospital volunteering directly supports the 'Healer' archetype and provides authentic patient interaction stories for essays",
        "Health Awareness Club founding demonstrates the 'Advocate' dimension — not just wanting to heal individuals but to educate communities",
        "Science Olympiad Disease Detectives event perfectly aligns epidemiology interest with competitive achievement",
        "Doctor shadowing at Emory Healthcare validates clinical interest and shows proactive initiative",
        "Cross country builds the physical and mental resilience narrative that medical school admissions value",
      ],
    },
    gapAnalysis: {
      missingElements: [
        "No formal research experience yet — needs to develop a mentored research project by sophomore or junior year to compete for top programs",
        "No national-level competition results yet — Science Olympiad and HOSA should target state and national advancement",
        "Limited global health exposure — needs an international or cross-cultural health project to support global health interests",
        "No standardized test scores yet (expected for 9th grade) — will need to build a strong PSAT/SAT trajectory",
      ],
      activitiesToDeepen: [
        "Formalize the Emory shadowing into a structured clinical observation program with documented learning outcomes",
        "Expand Health Awareness Club impact beyond Pace Academy — partner with Atlanta Public Schools for city-wide health literacy workshops",
        "Develop Science Olympiad skills to qualify for state and national competitions — Disease Detectives has strong potential",
        "Begin building a research project with a mentor at Emory, Georgia Tech, or the CDC, which is headquartered in Atlanta",
      ],
      skillsToDevelope: [
        "Laboratory research methodology — seek out a wet lab or data analysis experience at Emory or Georgia Tech",
        "Medical Spanish — advance beyond basic Spanish II to become conversationally proficient for clinical settings",
        "Scientific writing and presentation skills — start submitting to science fairs and youth research journals",
        "Statistical analysis basics (for epidemiology research) — consider learning R or basic biostatistics",
      ],
    },
    roadmap: {
      immediate: [
        "Register for PSAT 8/9 to establish a baseline score and identify areas for future SAT prep",
        "Submit independent research project to Georgia Science & Engineering Fair this spring",
        "Apply for HOSA (Future Health Professionals) membership and register for regional competition",
        "Research summer programs: Emory Pre-College, NIH Summer Internship, and HOSA Summer Leadership Conference",
        "Schedule meeting with Pace Academy college counselor to map out 4-year pre-med course plan",
      ],
      shortTerm: [
        "Prepare for and compete at Science Olympiad state tournament — target top 5 in Disease Detectives",
        "Expand Health Awareness Club to 50+ members and partner with at least one community health organization",
        "Complete American Red Cross certifications: First Aid, CPR/AED, and Wilderness First Aid",
        "Audition for the Atlanta Symphony Youth Orchestra to elevate violin achievement",
        "Begin reaching out to Emory researchers about potential summer mentorship opportunities",
      ],
      mediumTerm: [
        "Secure a mentored research position at Emory, Georgia Tech, or the CDC for the summer after sophomore year",
        "Advance to Science Olympiad nationals and HOSA state competition",
        "Take AP Biology and AP Chemistry — aim for 5s on both exams",
        "Develop a community health initiative in underserved Atlanta neighborhoods (e.g., health screenings, nutrition education)",
        "Build relationships with 2-3 physician mentors who can write strong recommendation letters",
      ],
      longTerm: [
        "Publish or present original research at a regional or national conference by junior year",
        "Achieve leadership positions in multiple organizations: HOSA chapter president, Science Olympiad captain, Student Council officer",
        "Score 1550+ on SAT and earn National Merit recognition through strong PSAT performance",
        "Craft a compelling application narrative centered on health equity, bridging cultures, and the healer's journey",
        "Apply to top pre-med programs: Harvard, Yale, UPenn, Columbia, Johns Hopkins, Emory, Duke",
      ],
    },
    competitivenessScore: 94,
    collegeRecommendations: {
      reach: ["Harvard", "Yale", "Princeton", "Columbia", "UPenn"],
      match: ["Emory University", "Duke University", "Johns Hopkins University", "Vanderbilt University"],
      safety: ["University of Georgia (Honors)", "Georgia Tech (Pre-Health)", "Tulane University", "University of Florida (Honors)"],
    },
    essayTopics: [
      "The moment your grandmother's misdiagnosis transformed your understanding of what it means to be a healer — and why health equity became your mission",
      "What 120 students learning CPR in one afternoon taught you about the ripple effect of health education",
      "Growing up between two medical worlds: how Ayurvedic wisdom and Western cardiology shaped your vision for medicine",
      "Sunday mornings at Grady Memorial: what volunteering at Atlanta's busiest public hospital revealed about the patients society forgets",
      "The Disease Detective: how epidemiology competitions taught you that saving one life starts with understanding a million",
    ],
    actionPriorities: [
      {
        priority: "High",
        action: "Secure a mentored research opportunity for this summer",
        deadline: "Within 6 weeks",
        impact: "Research experience is the #1 gap in an otherwise exceptional profile. Emory, Georgia Tech, and the CDC are all within reach in Atlanta.",
      },
      {
        priority: "High",
        action: "Register for HOSA and prepare for regional competition",
        deadline: "Within 4 weeks",
        impact: "HOSA is the premier pre-health competition and directly validates the healthcare narrative. Start with Medical Terminology or Biomedical Debate events.",
      },
      {
        priority: "High",
        action: "Map out a 4-year pre-med course sequence with school counselor",
        deadline: "Within 3 weeks",
        impact: "Ensures optimal AP/Honors trajectory: AP Bio (10th), AP Chem (11th), AP Physics and AP Psych (12th) plus electives in bioethics and anatomy.",
      },
      {
        priority: "Medium",
        action: "Expand Health Awareness Club with a signature annual event",
        deadline: "Within 3 months",
        impact: "A flagship event (e.g., annual Health Fair or Mental Health Week) gives the club institutional permanence and a story of scaling impact.",
      },
      {
        priority: "Medium",
        action: "Begin PSAT prep and take diagnostic practice test",
        deadline: "Within 2 months",
        impact: "Early baseline allows for a 2-year improvement arc. Target National Merit Semifinalist status (top 1% in Georgia) by junior year PSAT.",
      },
    ],
  }

  const passionProjects = [
    {
      title: "HealthLit ATL — Community Health Literacy App",
      description: "Design and build a mobile app that translates complex health information into accessible, multilingual content (English, Spanish, Hindi) for underserved communities in Atlanta. Partner with Grady Memorial Hospital and local free clinics to distribute. Include modules on preventive care, nutrition, mental health, and navigating the healthcare system.",
      timeCommitment: "8-10 hours/week for 6 months",
      skillsDeveloped: ["Health Communication", "App Design (Figma/Flutter)", "Community Outreach", "Multilingual Content Creation", "Data Collection & Impact Measurement"],
      applicationImpact: "Demonstrates the intersection of health equity passion, cultural competence, and initiative. A tangible product with measurable community impact is exactly what Ivy League admissions officers look for — especially one rooted in authentic personal experience (grandmother's misdiagnosis).",
      resources: "Partner with Emory Rollins School of Public Health students, Atlanta Community Health Centers, Grady's community outreach department. Use Figma for design, Flutter for development, Google Translate API for multilingual support.",
    },
    {
      title: "The Pulse — Teen Mental Health Podcast",
      description: "Launch a podcast interviewing teen mental health advocates, school counselors, pediatric psychologists, and students about the mental health crisis among high schoolers. Record at Pace Academy's media lab. Feature episodes on anxiety, social media's impact on health, culturally-specific stigma around mental health (including in South Asian communities), and coping strategies backed by research.",
      timeCommitment: "4-5 hours/week ongoing",
      skillsDeveloped: ["Interviewing & Journalism", "Audio Production", "Mental Health Literacy", "Personal Branding", "Community Building"],
      applicationImpact: "Shows intellectual maturity and willingness to tackle uncomfortable topics. The South Asian mental health stigma angle adds a deeply personal and culturally relevant dimension. Demonstrates communication skills that medical schools value highly.",
      resources: "Anchor/Spotify for Podcasters for hosting, Pace Academy media equipment, network through Health Awareness Club for guests, promote through school social media channels",
    },
    {
      title: "STEM Sisters: Mentoring Girls in Healthcare Sciences",
      description: "Create a mentorship program pairing Pace Academy upper school students with middle school girls from Atlanta Public Schools who are interested in healthcare and science careers. Host monthly Saturday workshops at the Atlanta Science Center covering anatomy, disease prevention, first aid, and career pathways in medicine.",
      timeCommitment: "5-6 hours/week during school year",
      skillsDeveloped: ["Mentorship & Teaching", "Program Management", "Grant Writing", "Event Planning", "Youth Development"],
      applicationImpact: "Demonstrates the 'Advocate' dimension of your profile — not just pursuing medicine for yourself, but actively opening doors for the next generation. The gender equity angle in STEM/healthcare resonates strongly with admissions committees at schools like Harvard and Yale.",
      resources: "Partner with Atlanta Public Schools Title I coordinators, apply for micro-grants through Georgia STEM Alliance, use Pace Academy facilities on Saturdays",
    },
    {
      title: "Bridging Medicine: A Blog on Integrative Healthcare",
      description: "Start a research-backed blog exploring the intersection of Western allopathic medicine and traditional healing systems (Ayurveda, Traditional Chinese Medicine, indigenous healing practices). Write evidence-based articles examining which traditional practices have scientific support, the ethics of medical pluralism, and how cultural competence improves patient outcomes.",
      timeCommitment: "3-4 hours/week ongoing",
      skillsDeveloped: ["Scientific Writing", "Research Literacy", "Cross-Cultural Analysis", "SEO & Digital Publishing", "Critical Thinking"],
      applicationImpact: "Perfectly captures your unique bicultural medical perspective. Shows intellectual depth and the ability to engage with nuance — exactly the kind of thinking that bioethics programs and medical humanities tracks at top universities seek.",
      resources: "Substack or Medium for publishing, PubMed for research sourcing, interviews with family members who practice Ayurvedic medicine, collaboration with Emory's Center for Ethics",
    },
  ]

  const academicCourses = {
    apCourses: [
      "AP Biology (10th grade — foundational for pre-med, aim for 5)",
      "AP Chemistry (11th grade — critical for MCAT prep foundation)",
      "AP Psychology (11th grade — directly relevant to neuroscience interest)",
      "AP English Language (11th grade — strong writing is essential for medical school applications)",
      "AP Statistics (11th grade — crucial for understanding medical research and epidemiology)",
      "AP Physics 1 (12th grade — required for most pre-med tracks)",
      "AP Spanish Language (12th grade — medical Spanish proficiency is a major asset)",
      "AP Environmental Science (10th or 11th — connects to global health and public health interests)",
    ],
    ibCourses: [
      "IB Biology HL (if Pace offers IB track — excellent pre-med preparation)",
      "IB Chemistry HL (rigorous preparation exceeding AP level for medical school readiness)",
      "IB Global Politics (connects to global health policy interests)",
    ],
    honorsCourses: [
      "Honors Anatomy & Physiology (essential hands-on pre-med course)",
      "Honors Pre-Calculus / Calculus (strong math foundation supports scientific rigor)",
      "Honors English 10 — Advanced Composition (build the writing skills medical schools demand)",
      "Honors Spanish III and IV (progress toward medical Spanish fluency)",
    ],
    electivesRecommended: [
      "Bioethics (directly aligned with stated interest in medical ethics and CRISPR/gene editing)",
      "Human Anatomy & Physiology (if offered as an elective, take it as early as possible)",
      "Public Health or Global Studies (supports the global health dimension of your profile)",
      "Research Methods or Independent Study (build formal research skills with faculty mentorship)",
      "Medical Humanities or Philosophy (strengthens the humanistic side of your medical narrative)",
    ],
  }

  const satActGoals = {
    targetSATScore: "1550+ (target for junior year)",
    satSectionGoals: { reading: "770+", math: "790+" },
    targetACTScore: "35+",
    actSectionGoals: { english: "35+", math: "35+", reading: "36", science: "36" },
    prepStrategy: "Start with PSAT 8/9 this spring to establish a baseline. Focus on building strong reading habits now — read scientific journals (Nature, Scientific American), classic literature, and long-form journalism to build the comprehension speed needed for the SAT reading section. Math foundation in Honors Geometry is solid; continue strengthening through pre-calculus. Begin structured SAT prep in spring of sophomore year with Khan Academy (free, official College Board partner). Take a full-length practice test every month starting January of junior year.",
    timeline: "PSAT 8/9: Spring of 9th grade (baseline). PSAT 10: Fall of 10th grade. PSAT/NMSQT: October of 11th grade (National Merit qualifying — target 1480+ index for Georgia semifinalist). SAT: March of 11th grade (first attempt). SAT: October of 12th grade (retake if needed). AP Exams: May of each year starting 10th grade.",
  }

  const researchPubs = {
    researchTopics: [
      "Adolescent mental health disparities in Fulton County — analyzing the correlation between socioeconomic factors and access to teen mental health services in metro Atlanta",
      "The neuroscience of empathy: how physician empathy affects patient outcomes — a literature review with implications for medical education",
      "Epidemiological analysis of childhood asthma rates in Atlanta neighborhoods near major highways — environmental health meets public health",
      "Cultural barriers to healthcare access in South Asian immigrant communities in the American South — a qualitative interview-based study",
      "Effectiveness of peer-led health education programs in high schools — studying the impact of Health Awareness Club workshops on student health literacy",
    ],
    publicationOpportunities: [
      "Georgia Science & Engineering Fair (GSEF) — submit current teen mental health research project this spring",
      "Journal of Emerging Investigators (JEI) — peer-reviewed open-access journal specifically for middle and high school student research",
      "Regeneron Science Talent Search (apply junior year — most prestigious high school science competition in the US)",
      "Siemens Competition / Regeneron ISEF pathway through GSEF state advancement",
      "Emory Undergraduate Research Symposium — some programs allow exceptional high school students to present",
      "CDC Science Ambassador Fellowship (for teachers, but the CDC also has student-facing programs worth monitoring)",
    ],
    mentorshipSuggestions: [
      "Dr. Carlos del Rio, Emory School of Medicine — Distinguished Professor of Infectious Diseases and global health leader. His lab studies health disparities and infectious disease epidemiology. Reach out through Emory's SCORE (Students Conducting Original Research in Epidemiology) program.",
      "Georgia Tech School of Biological Sciences — multiple faculty run labs studying neuroscience and biomedical engineering. The Petit Institute for Bioengineering and Bioscience actively mentors high school students.",
      "CDC (Centers for Disease Control and Prevention) — headquartered in Atlanta. The CDC offers the Science Ambassador Fellowship and periodically hosts high school interns through the ORISE program. Your Disease Detectives background is directly relevant.",
      "Emory Rollins School of Public Health — one of the top public health schools in the country, located minutes from Pace Academy. Their community-based research projects often welcome motivated high school volunteers.",
    ],
    timeline: "9th Grade: Complete independent research project and submit to GSEF. 10th Grade: Secure mentored research position at Emory or CDC for the summer; begin formal data collection. 11th Grade: Submit polished paper to JEI or similar journal; present at regional conference; apply to Regeneron STS. 12th Grade: Continue research, aim for publication, and feature prominently in college applications.",
  }

  const leadership = {
    clubLeadership: [
      "Continue as President of Health Awareness Club — grow membership to 60+ students and establish it as the premier service club at Pace Academy",
      "Run for Science Olympiad Team Captain by sophomore year — lead the Disease Detectives squad and mentor incoming freshmen",
      "Seek HOSA Chapter President role by junior year — position yourself as the face of health professions at your school",
      "Found a Bioethics Discussion Group at Pace Academy — monthly debates on topics like gene editing, organ allocation, and AI in medicine",
    ],
    schoolWideRoles: [
      "Run for Sophomore Class Representative on Student Council — build toward Student Body President by senior year",
      "Propose and organize an annual 'Health & Wellness Week' at Pace Academy with speakers, workshops, fitness challenges, and mental health resources",
      "Serve as a Peer Health Educator through the school counseling office — train to lead small-group discussions on stress, nutrition, and sleep",
      "Organize an annual school-wide blood drive in partnership with the American Red Cross",
    ],
    communityLeadership: [
      "Expand Health Awareness Club programming beyond Pace Academy — host free health literacy workshops at Atlanta community centers in underserved neighborhoods",
      "Partner with Atlanta Community Food Bank to lead nutrition education sessions at food distribution events",
      "Organize teen volunteer cohorts for MedShare (Atlanta-based nonprofit that redistributes medical supplies globally)",
      "Launch a 'Future Physicians' mentoring circle at a local Atlanta Public School — inspire younger students from underrepresented backgrounds to pursue healthcare careers",
    ],
    leadershipDevelopment: [
      "Apply to the National Student Leadership Conference (NSLC) — Medicine & Healthcare track in Washington, D.C.",
      "Attend the HOSA International Leadership Conference as a Georgia delegate",
      "Apply to Leadership Atlanta's Youth Program for civic engagement training",
      "Pursue the Congressional Award program — Bronze and Silver medals by sophomore year, Gold medal by senior year",
    ],
  }

  const serviceCommunity = {
    localOpportunities: [
      "Continue and deepen volunteering at Grady Memorial Hospital — aim for 200+ cumulative hours by the end of sophomore year and request a letter of recommendation from volunteer coordinator",
      "Volunteer at Good Samaritan Health Center (Atlanta free clinic serving uninsured patients) — gain exposure to primary care in underserved settings",
      "Join the American Red Cross Youth Volunteer Program in metro Atlanta — assist with blood drives, disaster preparedness, and community health events",
      "Volunteer with the Atlanta Community Health Workers Network — shadow community health workers doing door-to-door outreach in neighborhoods with limited healthcare access",
      "Organize health screenings and basic wellness checks at local churches and community centers in partnership with Emory medical students",
    ],
    nationalPrograms: [
      "Apply to the American Red Cross National Youth Council — represent Georgia on national health and disaster preparedness initiatives",
      "Join HOSA (Future Health Professionals) community service projects — participate in the National HOSA Service Project each year",
      "Participate in the National Alliance on Mental Illness (NAMI) Ending the Silence program — present mental health awareness programs at Atlanta-area schools",
      "Apply for the Points of Light youth volunteer recognition program to document community health service impact",
    ],
    internationalService: [
      "Participate in MedShare's volunteer operations — sort and pack medical supplies in Atlanta's warehouse for shipment to hospitals in developing countries",
      "Join Partners in Health Engage — the student advocacy arm of Dr. Paul Farmer's global health organization",
      "Contribute to global health data projects through the Institute for Health Metrics and Evaluation (IHME) citizen science initiatives",
      "Connect with MERCY Ships youth advocates — learn about surgical care in underserved countries and raise awareness at school",
    ],
    sustainedCommitment: [
      "Maintain year-round volunteering at Grady Memorial — not just during the school year. Summer intensive volunteering shows exceptional dedication",
      "Track and document all service hours, patient interactions, and learning reflections in a dedicated healthcare service journal",
      "Build relationships with specific departments at Grady (pediatrics, emergency, rehabilitation) to demonstrate deepening commitment over time",
      "Create a sustainability plan for all service initiatives — train underclassmen to continue programs after you graduate from Pace Academy",
    ],
  }

  const summerPrograms = {
    preFreshmanPrograms: [
      "Emory Pre-College Program: Science & Health track — 2-week residential program at one of the nation's top medical research universities, right in Atlanta",
      "Johns Hopkins Center for Talented Youth (CTY) — Anatomy & Physiology or Epidemiology summer course",
      "Stanford Pre-Collegiate Summer Institutes — Biomedical Sciences track for rising sophomores",
      "HOSA Summer Leadership Conference — national conference featuring health career exploration, leadership training, and competitive event preparation",
    ],
    competitivePrograms: [
      "NIH High School Summer Internship Program (HHSIP) — 8-week paid research internship at the National Institutes of Health in Bethesda, MD (apply sophomore/junior year — extremely competitive)",
      "Research Science Institute (RSI) at MIT — most prestigious free summer research program for high school students (apply junior year)",
      "COSMOS (California State Summer School for Mathematics and Science) — cluster in biomedical sciences",
      "Jackson Laboratory Summer Student Program — genetics and genomics research in Bar Harbor, Maine",
    ],
    researchPrograms: [
      "Emory Summer Science Academy — conduct original research alongside Emory faculty and graduate students",
      "Georgia Tech Research Internship — Petit Institute for Bioengineering and Bioscience summer program for high school students",
      "CDC Disease Detective Camp (informal) — attend CDC Museum events and connect with epidemiologists during Atlanta Science Festival",
      "Simons Summer Research Program at Stony Brook — competitive 7-week research program with publication potential",
    ],
    enrichmentPrograms: [
      "Perry Initiative — orthopedic surgery and engineering outreach for young women interested in STEM and medicine",
      "MedLife Chapter Volunteering — global health service trips to underserved communities in South America (summer after junior year)",
      "Girls Who Code Summer Immersion Program — build tech skills applicable to health informatics and bioinformatics",
      "National Youth Leadership Forum: Medicine — explore healthcare careers through clinical simulations and hospital visits",
    ],
  }

  const sports = {
    varsitySports: [
      "Continue Varsity Cross Country and Track at Pace Academy — aim for team captain by junior or senior year",
      "Target sub-20:00 5K time by sophomore year to be competitive at the GHSA state meet level",
      "Cross country demonstrates the discipline, mental toughness, and time management that medical schools value",
      "The endurance athlete narrative pairs beautifully with the 'marathon, not sprint' mentality of a pre-med journey",
    ],
    clubSports: [
      "Consider joining the Atlanta Track Club's youth program for additional race experience and coaching",
      "Explore yoga or mindfulness practice — connects to both wellness interest and Indian cultural heritage",
      "Participate in charity races (e.g., Atlanta Marathon relay, Grady Memorial Hospital 5K) to combine athletics with healthcare advocacy",
    ],
    recruitingStrategy: [
      "Cross country is unlikely to be a primary recruiting tool for Ivy League admission, but it powerfully demonstrates commitment, discipline, and resilience",
      "Highlight the athlete-scholar balance in applications — running 40+ miles per week while maintaining a 4.0 GPA is genuinely impressive",
      "Reach out to college club running teams and intramural programs at target schools — staying active in college supports the 'balanced human' narrative",
      "If competitive times improve significantly, explore whether any target schools offer recruited walk-on opportunities",
    ],
    fitnessLeadership: [
      "Organize a 'Run for Health' charity 5K at Pace Academy benefiting Grady Memorial Hospital — combines athletics with healthcare advocacy",
      "Start a peer fitness mentoring program helping underclassmen build healthy exercise habits",
      "Lead a 'Couch to 5K' program at a local Atlanta community center for adults in underserved neighborhoods — ties to health equity mission",
      "Write about the connection between physical fitness and academic/clinical performance for the school newspaper",
    ],
  }

  const competitions = {
    academicCompetitions: [
      "Science Olympiad — continue advancing in Disease Detectives (epidemiology), Anatomy & Physiology, and Forensics events. Target state qualification by sophomore year and nationals by junior year.",
      "HOSA (Future Health Professionals of America) — compete in Medical Terminology, Biomedical Debate, Epidemiology, and Behavioral Health events. Target state winner and international qualifier.",
      "USA Biology Olympiad (USABO) — take the open exam sophomore year, target semifinalist by junior year. The top 20 students in the country are invited to a training camp.",
      "Georgia Science & Engineering Fair — submit original research each year. State winner advances to Regeneron ISEF (International Science & Engineering Fair).",
      "National Science Bowl — if Pace Academy has a team, this DOE-sponsored competition covers biology, chemistry, physics, and earth science.",
    ],
    businessCompetitions: [
      "Conrad Challenge — Health & Nutrition category. Design an innovative solution to a global health problem with a team of 2-5 students.",
      "Diamond Challenge — submit a healthcare-focused social venture idea (e.g., the HealthLit ATL app concept).",
      "DECA — compete in Principles of Hospitality & Tourism or Marketing (useful for understanding the business side of healthcare delivery).",
      "Social Innovation Challenge (various universities host these) — propose a health equity solution for Atlanta communities.",
    ],
    artsCompetitions: [
      "Scholastic Art & Writing Awards — submit a personal essay or science writing piece about healthcare, bioethics, or global health",
      "Georgia Music Educators Association (GMEA) All-State Orchestra auditions — competitive violin recognition at the state level",
      "Atlanta Symphony Youth Orchestra (ASYO) auditions — prestigious youth ensemble that demonstrates serious musical commitment",
    ],
    debateSpeech: [
      "Join Pace Academy's speech and debate team — Original Oratory or Extemporaneous Speaking events are ideal for building the communication skills physicians need",
      "Compete in Bioethics Bowl (national competition exploring ethical dilemmas in science and medicine) — directly aligned with stated bioethics interest",
      "Consider Congressional Debate — arguing policy positions on healthcare, education, and public health builds persuasive communication skills",
    ],
  }

  const studentGov = {
    schoolGovernment: [
      "Run for Sophomore Class Representative this spring — build name recognition and demonstrate school-wide leadership",
      "Propose a Student Health Advisory Committee within Student Council — advocate for better mental health resources, healthier cafeteria options, and wellness days",
      "Target Junior Class President, then Student Body President by senior year — student government leadership is a major Ivy League application booster",
      "Lead the charge on a school-wide initiative: stress management workshops during exam periods, coordinated with the counseling office",
    ],
    districtStateRoles: [
      "Apply for the Georgia Association of Student Councils (GASC) — represent Pace Academy at the state level",
      "Attend Fulton County Board of Education student input sessions — advocate for health education curriculum improvements",
      "Apply for the Governor's Honors Program (GHP) in Georgia — highly competitive summer program for gifted students (nominate in science or social studies)",
      "Seek a student representative role on the Georgia Department of Public Health's youth advisory board (if available)",
    ],
    youthGovernment: [
      "Participate in YMCA Youth Legislature / Youth & Government program — write and debate bills focused on healthcare policy",
      "Apply for the Congressional Award program — complete the Bronze, Silver, and Gold medal levels through community service, personal development, physical fitness, and exploration",
      "Attend Girls State through the American Legion Auxiliary — intensive civic engagement program for rising seniors",
      "Consider the United States Senate Youth Program (USSYP) — two students per state selected for a week in Washington, D.C. with a $10,000 scholarship",
    ],
    advocacyRoles: [
      "Write op-eds for the Atlanta Journal-Constitution or local outlets on teen health issues — school nutrition, mental health funding, health education requirements",
      "Partner with Georgia state legislators on youth health advocacy — attend town halls and speak about the need for school-based health services",
      "Organize student voter registration drives (starting at age 17 in Georgia for pre-registration) focused on health policy awareness",
      "Advocate for comprehensive health education curriculum at the Fulton County School Board — bring data from Health Awareness Club surveys",
    ],
  }

  const internships = {
    industryInternships: [
      "Shadow physicians at Emory Healthcare across multiple specialties — neurology, cardiology, oncology, and emergency medicine — to refine clinical interests (continue and expand current shadowing program)",
      "Apply to the Emory School of Medicine Summer Research Program for high school students — a structured, mentored clinical research experience",
      "Seek a volunteer/intern role at Children's Healthcare of Atlanta (CHOA) — one of the top pediatric hospital systems in the country, located in Atlanta",
      "Explore internship opportunities at the Grady Health System administrative level — learn how a major public hospital operates behind the scenes",
    ],
    researchInternships: [
      "CDC (Centers for Disease Control and Prevention) — apply for the ORISE high school internship program. CDC headquarters is in Atlanta, making this uniquely accessible.",
      "Emory Rollins School of Public Health — seek a research assistant position with a faculty member studying epidemiology, global health, or health disparities",
      "Georgia Tech Petit Institute for Bioengineering and Bioscience — summer research internships in biomedical engineering and computational biology",
      "Morehouse School of Medicine — research programs focused on health equity and underserved communities, directly aligned with your mission",
    ],
    nonprofitInternships: [
      "Task Force for Global Health (headquartered in Atlanta) — one of the largest nonprofits in the world, focused on eliminating neglected tropical diseases and improving public health systems",
      "Carter Center (Atlanta) — founded by President Jimmy Carter, focuses on disease eradication and global health. Student volunteer and internship opportunities available.",
      "MedShare (Atlanta) — intern with the operations team that redistributes medical supplies and equipment to hospitals in underserved countries",
      "American Cancer Society (headquartered in Atlanta) — youth advocacy and fundraising internship positions",
    ],
    virtualOpportunities: [
      "Coursera/edX pre-med courses: Take Introductory courses in neuroscience (MIT OpenCourseWare), epidemiology (Johns Hopkins on Coursera), or bioethics (Georgetown on edX)",
      "Contribute to citizen science health projects through SciStarter — participate in real medical research data collection and analysis",
      "Virtual shadowing through platforms like Virtual Clinical Education or MedSchool Bootcamp — observe real surgical and clinical procedures online",
      "Remote research collaborations — many university labs now offer virtual data analysis roles for motivated high school students",
    ],
  }

  const cultureArts = {
    performingArts: [
      "Continue violin training and audition for the Atlanta Symphony Youth Orchestra (ASYO) — acceptance is a prestigious distinction that demonstrates long-term discipline and artistic excellence",
      "Explore Indian classical music (Carnatic or Hindustani violin) — connect with Atlanta's vibrant Indian music community and add a unique cultural dimension to your artistic profile",
      "Perform at community health events — play violin at Grady Memorial's patient recreation programs, nursing home visits, and Health Awareness Club events to combine art with healing",
      "Consider joining a chamber music ensemble at Pace Academy — small ensemble experience builds collaboration skills that translate directly to clinical team dynamics",
    ],
    visualArts: [
      "Create anatomical art — medical illustration is a respected field, and drawing human anatomy deepens understanding of the body while producing beautiful portfolio pieces",
      "Design visuals, infographics, and educational posters for Health Awareness Club workshops and the HealthLit ATL app",
      "Enter the Scholastic Art Awards with STEM-inspired artwork — pieces exploring the beauty of biology, neuroscience, or the human body",
      "Study medical illustration history — from Leonardo da Vinci's anatomical sketches to modern surgical visualization — as a potential supplemental essay topic",
    ],
    creativeWriting: [
      "Write the 'Bridging Medicine' blog exploring integrative healthcare, bioethics, and cultural perspectives on healing",
      "Submit personal essays about healthcare experiences to teen literary magazines: Polyphony Lit, The Adroit Journal, or Cathartic Youth Literary Magazine",
      "Write a science column for Pace Academy's school newspaper covering health topics, medical breakthroughs, and student wellness",
      "Enter the Scholastic Writing Awards with creative nonfiction or personal essay about healthcare experiences — volunteering at Grady, shadowing at Emory, or the grandmother misdiagnosis story",
    ],
    culturalClubs: [
      "Join or help lead Pace Academy's South Asian Student Association (or found one if it doesn't exist) — celebrate Diwali, Holi, and Indian cultural heritage while building community",
      "Participate in the annual Festival of India Atlanta or India Day celebrations — volunteer, perform violin, or organize a health education booth",
      "Connect with the Hindu Temple of Atlanta or local cultural organizations for community service and cultural programming",
      "Explore the intersection of Indian culture and medicine — the rich tradition of Ayurveda, yoga, and meditation practices that are now being validated by Western medical research",
    ],
  }

  const career = {
    jobTitles: [
      "Neurosurgeon at a Top Academic Medical Center (Massachusetts General, Johns Hopkins, Emory)",
      "Physician-Scientist leading a Neuroscience Research Lab at NIH or a Major University",
      "Chief Medical Officer of a Global Health Organization (WHO, MSF/Doctors Without Borders, Partners in Health)",
      "Public Health Leader — Surgeon General, CDC Director, or State Health Commissioner",
      "Founder of a Healthcare Nonprofit bridging Western and traditional medicine for underserved populations",
    ],
    blueOceanIndustries: [
      { industry: "Precision Neuroscience & Brain-Computer Interfaces", why: "The next frontier in medicine. Companies like Neuralink and academic labs at Harvard and MIT are pioneering treatments for neurological disorders. Your neuroscience interest positions you perfectly for this emerging field." },
      { industry: "Global Health Equity & Pandemic Preparedness", why: "COVID-19 revealed massive gaps in global health infrastructure. The world needs physicians who understand epidemiology, health policy, and cross-cultural medicine — exactly the profile you're building." },
      { industry: "Integrative & Culturally-Competent Medicine", why: "Healthcare systems are finally recognizing that cultural context matters for patient outcomes. Your bicultural background (Ayurvedic + Western medicine) positions you to lead this growing movement." },
      { industry: "Adolescent Mental Health Innovation", why: "Teen mental health is in crisis, and few physician-leaders specialize in this intersection. Your Health Awareness Club and podcast work give you authentic credibility in this blue ocean." },
    ],
    salaryPotential: "Physicians earn $250K-$600K+ depending on specialty (neurosurgery is among the highest-compensated at $600K-$900K). Physician-scientists at academic medical centers earn $200K-$400K plus research grants. Public health leaders at organizations like the CDC or WHO earn $150K-$300K with extraordinary global impact. The pre-med path is long (4 years undergrad + 4 years medical school + 3-7 years residency) but leads to one of the most respected and well-compensated careers in the world.",
    linkedInBioHeadline: "Aspiring Physician-Scientist | Health Equity Advocate | Science Olympiad Competitor | Violinist | Building a future where every patient receives compassionate, culturally-competent care",
  }

  const collegeRecs = {
    collegeBreakdown: {
      reach: ["Harvard University", "Yale University", "Princeton University", "Columbia University", "University of Pennsylvania"],
      target: ["Emory University", "Duke University", "Johns Hopkins University", "Vanderbilt University"],
      safety: ["University of Georgia (Honors Program)", "Georgia Institute of Technology", "Tulane University", "University of Florida (Honors Program)"],
    },
    schoolMatches: [
      { schoolName: "Harvard University", matchScore: 95, why: "Harvard's pre-med track is unmatched — direct access to Harvard Medical School, Massachusetts General Hospital, and the Broad Institute. The undergraduate Global Health & Health Policy concentration aligns perfectly with your interests. Harvard's commitment to diversity and holistic admissions values your unique bicultural narrative." },
      { schoolName: "Yale University", matchScore: 93, why: "Yale's pre-med advising is among the best in the country, with exceptionally high medical school acceptance rates. The Bioethics Center, Global Health Studies program, and Yale-New Haven Hospital clinical volunteering match your exact interests. Yale's residential college system fosters the close community you thrive in." },
      { schoolName: "University of Pennsylvania", matchScore: 92, why: "Penn's pre-med program benefits from direct affiliation with the Perelman School of Medicine, one of the top medical schools in the world. Penn's unique sub-matriculation program allows exceptional undergrads to begin medical school early. The Netter Center for Community Partnerships supports the health equity work you're passionate about." },
      { schoolName: "Emory University", matchScore: 91, why: "Emory is your home-field advantage. Adjacent to the CDC, home to a top-20 medical school, and the Rollins School of Public Health. You already have connections through shadowing at Emory Healthcare. The Emory-Tibet Science Initiative and Center for Ethics align with your integrative medicine and bioethics interests. Strong pre-med advising and research opportunities for undergrads." },
      { schoolName: "Duke University", matchScore: 89, why: "Duke's pre-med program is among the strongest in the South, with direct ties to Duke University Medical Center. The Bass Connections interdisciplinary research program, Global Health Institute, and proximity to Atlanta make it an ideal target school." },
      { schoolName: "Johns Hopkins University", matchScore: 90, why: "The birthplace of modern American medical education. Johns Hopkins Hospital is consistently ranked #1 in the nation. Unparalleled undergraduate research opportunities in biomedical sciences. The Bloomberg School of Public Health is the top-ranked public health school in the world." },
    ],
  }

  const mentors = {
    mentors: [
      {
        name: "Dr. Sanjay Gupta",
        university: "Emory University School of Medicine",
        department: "Department of Neurosurgery — Associate Chief of Neurosurgery at Grady Memorial Hospital",
        why: "CNN's chief medical correspondent and a practicing neurosurgeon at the very hospital where you volunteer. Dr. Gupta is passionate about health communication, global health, and mentoring the next generation. His career path (neurosurgery + media + global health) mirrors elements of your own ambitions.",
        coldEmailTemplate: "Subject: Aspiring Neuroscientist and Grady Memorial Volunteer — Seeking Mentorship Guidance\n\nDear Dr. Gupta,\n\nMy name is Priya Sharma, and I am a freshman at Pace Academy in Atlanta. I have been volunteering at Grady Memorial Hospital for the past year and am deeply passionate about neuroscience, global health, and health equity.\n\nI founded my school's Health Awareness Club to bring health literacy education to my peers, and I compete in Science Olympiad's Disease Detectives event. Your career — bridging neurosurgery, public health communication, and global health advocacy — is exactly the kind of physician-leader I aspire to become.\n\nI would be incredibly grateful for even a brief conversation about your path and any advice you might have for a young student beginning her pre-med journey. I am also very interested in any research or mentorship opportunities within Emory's neuroscience programs.\n\nThank you so much for your time and for the inspiring work you do every day.\n\nWith deep respect,\nPriya Sharma\nPace Academy, Class of 2029\nHealth Awareness Club Founder & President",
      },
      {
        name: "Dr. Lisa Cooper",
        university: "Johns Hopkins University School of Medicine",
        department: "Department of Medicine — Director of the Johns Hopkins Center for Health Equity",
        why: "A MacArthur 'Genius Grant' recipient for her groundbreaking work on racial and ethnic disparities in healthcare. Her research on patient-physician communication and cultural competence directly aligns with your grandmother's story and your health equity mission. She actively mentors diverse students pursuing medicine.",
        coldEmailTemplate: "Subject: High School Student Passionate About Health Equity — Inspired by Your Research\n\nDear Dr. Cooper,\n\nMy name is Priya Sharma, a freshman at Pace Academy in Atlanta. I am writing because your research on health disparities and patient-physician communication has profoundly shaped my understanding of why culturally-competent medicine matters.\n\nMy grandmother in India was once misdiagnosed due to a language barrier with her physicians — an experience that ignited my commitment to health equity. I have since founded a Health Awareness Club at my school, volunteer at Grady Memorial Hospital, and compete in Science Olympiad's epidemiology events.\n\nI am exploring research opportunities related to healthcare access disparities in Atlanta's diverse communities and would deeply value any guidance you might offer. I am also considering Johns Hopkins as a dream school for undergraduate pre-med studies.\n\nThank you for your transformative work and for any time you might share.\n\nGratefully,\nPriya Sharma",
      },
      {
        name: "Dr. Atul Gawande",
        university: "Harvard T.H. Chan School of Public Health / Harvard Medical School",
        department: "Department of Health Policy and Management — Surgeon, Writer, and Public Health Leader",
        why: "Best-selling author of 'Being Mortal' and 'The Checklist Manifesto,' former head of USAID under the Biden administration. Dr. Gawande uniquely combines surgical practice, public health leadership, and medical writing — embodying the physician-scholar-advocate path you aspire to. His work on healthcare systems improvement and global surgery aligns with your interests.",
      },
      {
        name: "Dr. Jill Daugherty",
        university: "CDC (Centers for Disease Control and Prevention) — Atlanta",
        department: "Division of Injury Prevention — Epidemiologist specializing in adolescent brain health and concussion research",
        why: "Based at the CDC headquarters in Atlanta, Dr. Daugherty's work on adolescent brain health connects to both your neuroscience interest and your Disease Detectives competition experience. The CDC is a uniquely Atlanta resource, and connecting with epidemiologists there could lead to internship opportunities.",
      },
    ],
  }

  const wasteOfTime = {
    activities: [
      { activity: "Joining every club that sounds impressive without committing deeply", whyQuit: "Ivy League admissions officers see through 'resume padding' instantly. Being a passive member of 10 clubs is far less impressive than founding and leading 2-3 with measurable impact. Focus your energy on Health Awareness Club, Science Olympiad, HOSA, and Student Council — and go deep." },
      { activity: "Unfocused community service hours without a healthcare connection", whyQuit: "Generic volunteering (random park cleanups, event setup) doesn't strengthen your pre-med narrative. Every service hour should ideally connect to healthcare, health equity, or your community health mission. Redirect to Grady Hospital, free clinics, health education workshops, or Red Cross." },
      { activity: "Excessive SAT prep in 9th grade", whyQuit: "You're 2+ years away from taking the SAT. Heavy test prep now is premature and steals time from building the extracurricular profile that actually differentiates you. Take the PSAT 8/9 for a baseline, build strong reading habits, and save intensive prep for spring of sophomore year." },
      { activity: "Social media scrolling disguised as 'networking' or 'research'", whyQuit: "Be honest about unproductive screen time. Set specific time limits and replace scrolling with reading medical journals (Scientific American, STAT News), listening to healthcare podcasts, or working on passion projects. Use social media intentionally — to promote Health Awareness Club events or share your blog posts." },
      { activity: "Taking on too many leadership roles too early", whyQuit: "As a freshman, it's tempting to run for every position available. Resist. Build genuine competence and relationships in 2-3 organizations this year. Demonstrate impact before seeking titles. Your leadership story will be much more compelling if it shows organic growth from contributor to leader over 4 years rather than title-collecting from day one." },
    ],
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "9th Grade — Freshman (Current)",
      focus: "Build the foundation: establish your healthcare narrative, develop core relationships, and start strong academically",
      academics: [
        "Maintain 4.0 unweighted GPA in all Honors courses — Biology, Chemistry, English, Geometry",
        "Excel especially in Honors Biology and Chemistry — these are the bedrock of your pre-med story",
        "Begin reading beyond the textbook: Scientific American, STAT News, New England Journal of Medicine editorials",
        "Meet with your Pace Academy college counselor to map the optimal 4-year pre-med course sequence",
      ],
      extracurriculars: [
        "Grow Health Awareness Club to 50+ members and execute at least 4 major events this year (CPR Day, Mental Health Week, Nutrition Workshop, Guest Speaker Series)",
        "Compete at Science Olympiad regionals — target top 3 placement in Disease Detectives",
        "Maintain consistent weekly volunteering at Grady Memorial Hospital — build relationships with staff and document experiences in a reflection journal",
        "Continue cross country season strong — contribute to Pace Academy's team and build personal bests",
        "Practice violin consistently and audition for ASYO by spring",
      ],
      testing: [
        "Take PSAT 8/9 this spring to establish a baseline score",
        "Begin building SAT-relevant reading habits — 30 minutes of challenging nonfiction daily",
        "No formal SAT prep needed yet — focus on academics and reading stamina",
      ],
      leadership: [
        "Lead Health Awareness Club as Founder & President with clear vision and measurable goals",
        "Run for Sophomore Class Representative on Student Council this spring",
        "Begin mentoring relationship with a Pace Academy science teacher who can support research and recommendation letters",
        "Attend at least one HOSA chapter meeting and plan to compete in regional events next year",
      ],
      summerPlan: "Apply to Emory Pre-College Program (Science & Health track) or Johns Hopkins CTY summer course. If not accepted, create a structured self-directed summer: deepen Grady volunteering to 15+ hours/week, shadow physicians at Emory in 2-3 specialties, begin independent research project, read 5+ books on medicine (When Breath Becomes Air, Being Mortal, The Emperor of All Maladies, Mountains Beyond Mountains, The Immortal Life of Henrietta Lacks).",
    },
    nextYears: [
      {
        grade: "10th Grade — Sophomore",
        focus: "Accelerate: secure first research experience, advance in competitions, and deepen clinical exposure",
        academics: [
          "Take AP Biology — this is the most important single course for your pre-med profile. Target a 5 on the AP exam.",
          "Continue with Honors Pre-Calculus, Honors English 10, Honors Spanish III",
          "Consider adding Honors Anatomy & Physiology if available as an elective",
          "Maintain 4.0 unweighted GPA — sophomore year grades carry significant weight in college admissions",
        ],
        extracurriculars: [
          "Secure a mentored summer research position at Emory, Georgia Tech, or the CDC — this is the #1 priority for this year",
          "Advance to Science Olympiad state competition — target top 5 in Disease Detectives and Anatomy & Physiology",
          "Register for and compete in HOSA regional events — Medical Terminology, Biomedical Debate, or Epidemiology",
          "Apply for USA Biology Olympiad (USABO) open exam — begin building toward semifinalist status",
          "Expand Health Awareness Club impact: launch a partnership with an Atlanta community center or public school",
        ],
        testing: [
          "Take PSAT 10 in October to track improvement and identify SAT weak areas",
          "Begin light SAT prep using Khan Academy — focus on reading comprehension and data analysis",
          "Take AP Biology exam in May — first AP score on the transcript",
        ],
        leadership: [
          "Serve as Sophomore Class Representative on Student Council",
          "Take on a leadership role in Science Olympiad — event captain or team mentor for freshmen",
          "Apply to the National Student Leadership Conference (NSLC) Medicine & Healthcare track",
          "Begin organizing the annual Health & Wellness Week at Pace Academy as a signature event",
        ],
        summerPlan: "Top choice: NIH High School Summer Internship (HHSIP) or Emory Summer Science Academy for mentored research. Second choice: Georgia Tech Petit Institute summer program. Backup: Intensive clinical volunteering at Grady Memorial + independent research project with an Emory mentor + HOSA Summer Leadership Conference.",
      },
      {
        grade: "11th Grade — Junior",
        focus: "Peak performance: publish research, achieve national competition results, ace standardized tests, and build your college application narrative",
        academics: [
          "Take AP Chemistry, AP Psychology, AP English Language, AP Statistics — the most rigorous junior year course load possible",
          "Target 5s on all AP exams — these validate your academic intensity for Ivy League admissions",
          "Maintain 4.0 unweighted GPA — junior year is the single most important year for college admissions grades",
          "Consider dual enrollment in a college-level neuroscience or public health course at Emory or Georgia State (if available through Pace Academy)",
        ],
        extracurriculars: [
          "Submit polished research paper to Journal of Emerging Investigators (JEI) or present at a regional research conference",
          "Advance to Science Olympiad nationals — represent Georgia on the national stage",
          "Win HOSA state competition and qualify for HOSA International Leadership Conference",
          "Apply to Regeneron Science Talent Search with original research (application due November of junior year)",
          "Launch the HealthLit ATL app or Pulse podcast as a tangible passion project with measurable community impact",
        ],
        testing: [
          "PSAT/NMSQT in October — target 1480+ index score for National Merit Semifinalist in Georgia (top 1%)",
          "SAT in March — first attempt, target 1500+ with a realistic stretch goal of 1550+",
          "SAT retake in June or October of senior year if needed",
          "AP exams in May: Chemistry, Psychology, English Language, Statistics",
        ],
        leadership: [
          "Run for Junior Class President or Student Body Vice President",
          "Serve as HOSA Chapter President and Science Olympiad Team Captain simultaneously",
          "Health Awareness Club should now be a well-known institution at Pace Academy with 60+ members and a community service portfolio",
          "Request recommendation letters from 2-3 teachers and 1 mentor who know you deeply (ideally Honors Biology teacher, AP English teacher, and Grady Hospital volunteer coordinator)",
        ],
        summerPlan: "Apply to RSI at MIT (most competitive, fully funded) or Simons Summer Research Program. If conducting independent research, aim to finalize and submit for publication. Begin drafting college application essays in July — Common App personal statement and school-specific supplements. Visit top-choice colleges: Harvard, Yale, Penn, Columbia, Emory, Duke, Johns Hopkins.",
      },
      {
        grade: "12th Grade — Senior",
        focus: "Execute and close: submit exceptional college applications, maintain excellence, and leave a lasting legacy at Pace Academy",
        academics: [
          "Take AP Physics 1, AP Spanish Language, AP Government, and any remaining rigorous courses",
          "Maintain 4.0 GPA through senior year — Ivy League schools track mid-year and final grades closely (no 'senioritis')",
          "Consider an independent study or capstone project in neuroscience, bioethics, or public health with a Pace Academy faculty sponsor",
          "Complete any dual enrollment courses at Emory or Georgia State to demonstrate college readiness",
        ],
        extracurriculars: [
          "Serve in top leadership roles: Student Body President, HOSA Chapter President, Science Olympiad Captain",
          "Ensure all passion projects (HealthLit ATL, The Pulse podcast, STEM Sisters) have sustainability plans for your successors",
          "Present research at a national conference or achieve publication in a peer-reviewed student journal",
          "Mentor underclassmen who will carry on your legacy in Health Awareness Club and other organizations",
        ],
        testing: [
          "Submit final SAT/ACT scores to all colleges by October-November deadlines",
          "Complete remaining AP exams in May (scores sent to your chosen college for potential credit)",
          "No additional standardized testing needed if targets were met junior year",
        ],
        leadership: [
          "Transition all leadership roles gracefully — train successors and create documentation for every organization you led",
          "Deliver a signature capstone event: a school-wide or community-wide health summit bringing together students, physicians, and public health leaders",
          "Write thank-you letters to every mentor, teacher, and community partner who supported your journey",
          "Apply for the United States Presidential Scholars Program (one of the highest honors for graduating seniors)",
        ],
        summerPlan: "Attend pre-orientation programs at your chosen university. Connect with pre-med advisors, research labs, and clinical volunteering opportunities before classes begin. Read foundational texts for your intended major. Rest, reflect, and celebrate — you've earned it.",
      },
    ],
  }

  const scholarships = {
    scholarships: [
      {
        name: "QuestBridge National College Match",
        organization: "QuestBridge",
        amount: "Full 4-year scholarship to partner schools (Harvard, Yale, Princeton, Columbia, Penn, Stanford, Emory, Duke, etc.)",
        deadline: "September of senior year (early — begin prep in junior year)",
        why: "If you qualify based on financial need, QuestBridge is the single most impactful scholarship in the country. It provides full rides to the exact Ivy League and top schools on your list. Even if your family income is above the threshold, the application process is excellent practice for college essays.",
        url: "https://www.questbridge.org/high-school-students/national-college-match",
      },
      {
        name: "Coca-Cola Scholars Program",
        organization: "Coca-Cola Scholars Foundation (headquartered in Atlanta)",
        amount: "$20,000 scholarship",
        deadline: "October of senior year",
        why: "One of the most prestigious merit scholarships in the nation — 150 winners selected from 100,000+ applicants. Your health advocacy leadership, community service at Grady Memorial, and founding of the Health Awareness Club make you a strong candidate. Coca-Cola is headquartered in Atlanta, making this a hometown advantage.",
        url: "https://www.coca-colascholarsfoundation.org/apply/",
      },
      {
        name: "AXA Achievement Scholarship / Unilever Bright Future Scholarship",
        organization: "Various major corporate foundations",
        amount: "$10,000-$25,000",
        deadline: "Varies — typically October-December of senior year",
        why: "Major corporate scholarships that reward community impact and leadership. Your Health Awareness Club, Grady volunteering, and health equity mission align well with selection criteria.",
        url: "https://www.scholarships.com",
      },
      {
        name: "HOSA Future Health Professionals Scholarships",
        organization: "HOSA-Future Health Professionals",
        amount: "$1,000-$5,000 (multiple awards)",
        deadline: "Varies by state — typically spring of junior or senior year",
        why: "Directly aligned with your healthcare career path and HOSA competition involvement. Winners are selected based on HOSA participation, community service, academic excellence, and commitment to health professions.",
        url: "https://hosa.org/scholarships/",
      },
      {
        name: "Regeneron Science Talent Search Scholar/Finalist",
        organization: "Society for Science & the Public / Regeneron",
        amount: "$25,000 (Scholar), up to $250,000 (Top 10 Finalist)",
        deadline: "November of senior year (begin research in sophomore/junior year)",
        why: "The most prestigious pre-college science competition in the United States — often called the 'Junior Nobel Prize.' Your research trajectory (starting at GSEF, advancing to mentored research) is building toward a competitive STS application. Top scholars and finalists receive massive scholarships AND the recognition virtually guarantees admission to top research universities.",
        url: "https://www.societyforscience.org/regeneron-sts/",
      },
      {
        name: "Elks National Foundation Most Valuable Student Scholarship",
        organization: "Elks National Foundation",
        amount: "Up to $50,000 over 4 years (500 winners nationally)",
        deadline: "November of senior year",
        why: "One of the largest scholarship programs in the country. Evaluates leadership, community service, academics, and financial need. Your well-rounded profile with health advocacy, hospital volunteering, and academic excellence is ideal for this scholarship.",
        url: "https://www.elks.org/scholars/scholarships/mvs.cfm",
      },
      {
        name: "Georgia Governor's Scholarship / HOPE & Zell Miller Scholarships",
        organization: "Georgia Student Finance Commission",
        amount: "Full tuition at Georgia public universities (Zell Miller) or partial tuition (HOPE)",
        deadline: "Automatic qualification based on GPA and test scores",
        why: "If you attend UGA or Georgia Tech (safety schools), the Zell Miller Scholarship covers full tuition for students with a 3.7+ GPA and 1200+ SAT. This is essentially free college at two excellent Georgia universities. Even if you attend a private school, the HOPE scholarship provides a tuition grant.",
        url: "https://www.gafutures.org/",
      },
      {
        name: "National Merit Scholarship Program",
        organization: "National Merit Scholarship Corporation",
        amount: "$2,500-$10,000+ (plus university-sponsored full rides for National Merit Finalists)",
        deadline: "Automatic — based on PSAT/NMSQT score in October of junior year",
        why: "Scoring in the top 1% on the PSAT/NMSQT in Georgia (approximately 1480+ index) qualifies you as a National Merit Semifinalist. Many universities (including full-ride offers from schools like University of Alabama, University of Oklahoma, and others) recruit National Merit Finalists aggressively. This is essentially 'free money' earned through strong test performance.",
        url: "https://www.nationalmerit.org/",
      },
    ],
  }

  return {
    student, formData, analysis, passionProjects, academicCourses, satActGoals, researchPubs,
    leadership, serviceCommunity, summerPrograms, sports, competitions, studentGov, internships,
    cultureArts, career, collegeRecs, mentors, wasteOfTime, gradeByGradeRoadmap, scholarships,
  }
}

function getFinanceDemoData() {
  const student = {
    first_name: "Marcus",
    last_name: "Chen",
    full_name: "Marcus Chen",
    current_grade: "10th",
    parent_email: "parent.demo@thestudentblueprint.com",
  }

  const formData = {
    basicInfo: {
      firstName: "Marcus",
      lastName: "Chen",
      email: "__EMAIL__",
      gradeLevel: "10th",
      schoolName: "Stuyvesant High School",
      parentEmail: "parent.demo@thestudentblueprint.com",
    },
    academicProfile: {
      gpaUnweighted: "3.95",
      gpaWeighted: "4.4",
      classRank: "Top 5%",
      coursesTaken: [
        "AP Macroeconomics",
        "AP Microeconomics",
        "AP Statistics",
        "AP Calculus AB",
        "Honors English 10",
        "Honors World History",
      ],
      favoriteSubjects: ["Economics", "Mathematics", "History"],
      academicChallenges: "Balancing rigorous AP coursework with DECA competitions, managing my investment club portfolio, and leading Model UN preparation",
    },
    testingInfo: {
      satScore: "",
      actScore: "",
      apScores: "AP Macroeconomics: 5, AP Microeconomics: 5",
      plannedTests: "PSAT/NMSQT this fall, SAT spring of junior year, AP Statistics and AP Calculus AB exams this May",
    },
    extracurriculars: {
      activities: [
        {
          name: "DECA",
          role: "Chapter President",
          yearsActive: "2",
          hoursPerWeek: "8",
          description: "Lead Stuyvesant's DECA chapter of 60+ members. Compete in Business Finance and Entrepreneurship events. Won 1st place at NYC regionals in Financial Consulting. Organize weekly workshops on business case analysis and presentation skills.",
        },
        {
          name: "Stuyvesant Investment Club",
          role: "Founder & Portfolio Manager",
          yearsActive: "1",
          hoursPerWeek: "6",
          description: "Founded the school's first student-run investment club. Manage a simulated $100K portfolio using MarketWatch. Track S&P 500, tech sector, and emerging market ETFs. Host weekly analysis sessions where members pitch stock ideas using DCF models and fundamental analysis.",
        },
        {
          name: "Personal Trading Portfolio",
          role: "Independent Investor",
          yearsActive: "2",
          hoursPerWeek: "5",
          description: "Manage a personal custodial brokerage account with guidance from my mother (CFO). Track macroeconomic trends, analyze quarterly earnings reports, and maintain a diversified portfolio across equities, bonds, and index funds. Achieved 18% return in the past year.",
        },
        {
          name: "Model United Nations",
          role: "Head Delegate — Economic & Financial Committee (ECOFIN)",
          yearsActive: "2",
          hoursPerWeek: "7",
          description: "Specialize in ECOFIN committee, debating international monetary policy, trade agreements, and development finance. Won Best Delegate at NYMUN and Outstanding Delegate at HMUN. Lead crisis committee preparations for the Stuyvesant delegation.",
        },
        {
          name: "Debate Team",
          role: "Varsity Captain — Public Forum",
          yearsActive: "2",
          hoursPerWeek: "6",
          description: "Captain of Stuyvesant's Public Forum debate team. Specialize in economic and policy topics. Qualified for New York State tournament. Coach novice debaters on argument construction and cross-examination technique.",
        },
      ],
    },
    leadership: {
      positions: "DECA Chapter President, Investment Club Founder & Portfolio Manager, Model UN Head Delegate, Debate Team Varsity Captain",
      impactDescription: "Grew DECA chapter from 25 to 60+ members. Founded investment club now recognized as an official school organization. Led Stuyvesant's ECOFIN delegation to win Best Committee at three conferences.",
    },
    competitions: {
      competitions: "DECA NYC Regionals (1st Place Financial Consulting), DECA NY State (Top 10), Model UN — NYMUN Best Delegate, HMUN Outstanding Delegate, NY State Debate Qualifier",
      awards: "Stuyvesant Scholar Award, DECA Regional Champion, Model UN Best Delegate (3x), AP Scholar with Distinction",
    },
    passions: {
      topicsYouLove: ["Investment Banking", "Fintech", "Venture Capital", "Entrepreneurship"],
      industriesCurious: ["Financial Services", "Technology", "Private Equity", "Consulting"],
      uniqueInterests: "Fascinated by behavioral economics and market psychology, follows Federal Reserve policy decisions closely, building a financial literacy curriculum for underserved NYC high schools",
    },
    careerAspirations: {
      topCareers: ["Investment Banker at a Bulge Bracket Firm", "Venture Capital Partner", "Fintech Startup Founder", "Hedge Fund Manager"],
      dreamJobTitle: "Partner at a top venture capital firm who also runs a fintech startup democratizing financial access",
      whyThisPath: "Growing up with a mother who is a CFO at a tech company and a father who is an economics professor at NYU, I've been immersed in the world of finance and economic theory since childhood. I want to combine Wall Street expertise with entrepreneurial vision to build financial products that make investing accessible to everyone, not just the wealthy.",
    },
    researchExperience: {
      researchExperience: "Working on an independent research paper analyzing the impact of Federal Reserve interest rate decisions on tech startup valuations (2020-2024). Assisted my father's NYU research team with data collection on behavioral economics and consumer spending patterns.",
      publications: "Working paper on Fed rate impacts on tech valuations — planning to submit to the Journal of Emerging Investigators this spring",
    },
    summerPrograms: {
      programs: "Completed Wall Street mentorship program through SEO Scholars. Applied to Goldman Sachs and JP Morgan pre-internship programs for this summer.",
      internships: "Shadowed analysts at my mother's company during Take Your Child to Work initiatives. Completed NFTE (Network for Teaching Entrepreneurship) Young Entrepreneurs program.",
    },
    specialTalents: {
      talents: ["Excel & Financial Modeling", "Python for Data Analysis", "Public Speaking & Persuasion", "Business Case Analysis"],
      languages: "English (native), Mandarin Chinese (conversational fluency from family), Spanish (intermediate — AP Spanish next year)",
      athleticsArts: "Varsity Soccer (midfielder), School Chess Team (rated 1500+ USCF)",
    },
    personality: {
      topStrengths: ["Strategic Thinking", "Persuasion", "Analytical Rigor", "Entrepreneurial Drive"],
      archetypes: ["Entrepreneur", "Analyst"],
      workStyle: "Thrive in competitive, high-pressure environments. Energized by team collaboration and debate. Excel at synthesizing complex data into actionable insights. Prefer fast-paced work with tangible outcomes.",
    },
    personalStories: {
      lifeChallenge: "When my parents immigrated from Taiwan, they struggled with financial literacy in the American banking system — high-interest loans, predatory credit cards, and confusing mortgage terms. Watching them navigate this inspired me to build financial education programs so other immigrant families don't face the same barriers.",
      proudMoment: "Building Stuyvesant's Investment Club from an idea into a 40-member organization with a simulated $100K portfolio in just one semester. When a freshman member told me the club taught her more about money than anything she'd learned at home, I realized financial literacy is a form of empowerment.",
      uniquePerspective: "As a Chinese-American son of a CFO and an economics professor, I bridge the practical world of corporate finance with academic economic theory. My bilingual ability in Mandarin gives me insight into the fastest-growing economy in the world and US-China financial dynamics.",
    },
    timeCommitment: {
      hoursSchoolYear: "20-25",
      hoursSummer: "35-45",
      constraints: "Varsity soccer practice daily after school during fall season, DECA and debate competitions on weekends, chess tournaments monthly",
    },
    collegePreferences: {
      dreamSchools: ["Wharton/UPenn", "Harvard", "Princeton", "Columbia"],
      factors: ["Top undergraduate business/finance program", "Wall Street recruiting pipeline", "Strong alumni network in finance", "Entrepreneurship resources"],
      geography: "Strongly prefer East Coast for proximity to Wall Street and NYC financial ecosystem. Open to Stanford for its Silicon Valley/VC connections.",
    },
  }

  const analysis = {
    studentArchetype: "Strategic Entrepreneur",
    archetypeScores: {
      Entrepreneur: 95,
      Analyst: 92,
      Builder: 88,
      Visionary: 86,
      Advocate: 70,
      Researcher: 72,
      Artist: 55,
      Healer: 50,
    },
    strengthsAnalysis: {
      competitiveAdvantages: [
        "Exceptionally authentic finance narrative rooted in family background — mother is a CFO at a tech company, father is an economics professor at NYU, providing both practical and academic perspectives on finance",
        "Already demonstrating real financial acumen as a sophomore through personal trading portfolio management with documented 18% returns",
        "DECA Chapter President at Stuyvesant, one of the most competitive public high schools in the country — DECA regional champion in Financial Consulting",
        "Founded the school's Investment Club and built it to 40+ members, demonstrating entrepreneurial initiative and leadership beyond just academic achievement",
        "Model UN specialization in ECOFIN (Economic & Financial Committee) shows deep engagement with global economic policy and international finance",
        "Dual AP Economics scores of 5 as a sophomore demonstrate exceptional mastery of micro and macroeconomic principles ahead of schedule",
      ],
      uniqueDifferentiators: [
        "Rare combination of practical investing experience, competitive business achievements, and academic economics knowledge at the sophomore level — most students develop this coherence by senior year",
        "Personal story of immigrant parents struggling with financial literacy provides a powerful, authentic motivation for pursuing financial democratization",
        "Bilingual in Mandarin Chinese — invaluable asset for careers in international finance and US-China business relations",
        "Chess team membership (rated 1500+ USCF) signals the strategic, analytical thinking that finance firms specifically seek",
        "Already building financial literacy curriculum for underserved NYC schools — demonstrates the social impact dimension that top business schools value",
      ],
      alignedActivities: [
        "DECA competitions directly validate business and financial knowledge in competitive settings — regional champion status adds credibility",
        "Investment Club founding demonstrates the entrepreneurial dimension — not just studying finance but creating organizations around it",
        "Model UN ECOFIN specialization connects finance interest to global policy understanding — essential for careers in international banking or policy",
        "Personal trading portfolio shows real-world application of financial theory — documented returns provide concrete evidence of skill",
        "Debate team captaincy builds the persuasion and communication skills essential for investment banking, consulting, and entrepreneurship",
      ],
    },
    gapAnalysis: {
      missingElements: [
        "No formal internship or work experience at a financial institution yet — needs a Wall Street-adjacent experience by junior summer to compete for top business schools",
        "No published research or academic paper yet — the working paper on Fed rate impacts should be completed and submitted this year",
        "Limited community impact beyond school clubs — the financial literacy initiative for underserved schools needs to be formalized and scaled",
        "No national-level DECA achievement yet — needs to advance from state to ICDC (International Career Development Conference) by junior year",
      ],
      activitiesToDeepen: [
        "Formalize the financial literacy curriculum into a structured nonprofit or community program with documented participant outcomes",
        "Expand Investment Club to include inter-school competitions and partnerships with other NYC high schools",
        "Develop Model UN achievements to include chairing committees and organizing conferences, not just competing as a delegate",
        "Build deeper connections with the Wharton, Columbia, and NYU Stern communities through pre-college programs and networking events",
      ],
      skillsToDevelope: [
        "Advanced financial modeling — move beyond basic DCF to LBO modeling, merger models, and comparable company analysis using Wall Street standards",
        "Programming for finance — advance Python skills to include pandas, NumPy, and basic algorithmic trading strategies",
        "Accounting fundamentals — understanding financial statements is critical for investment banking; consider taking an accounting course",
        "Networking and professional communication — begin building relationships with finance professionals through LinkedIn, alumni networks, and informational interviews",
      ],
    },
    roadmap: {
      immediate: [
        "Complete and submit the working paper on Federal Reserve rate impacts on tech valuations to the Journal of Emerging Investigators",
        "Register for PSAT/NMSQT and begin structured prep — target National Merit Semifinalist in New York (top 1%)",
        "Apply to Goldman Sachs and JP Morgan pre-internship/insight programs for this summer",
        "Prepare for DECA State competition — target top 3 finish to qualify for ICDC",
        "Formalize the financial literacy initiative into a registered community program with a curriculum and measurable outcomes",
      ],
      shortTerm: [
        "Advance to DECA ICDC (International Career Development Conference) — competing at the international level is a major differentiator",
        "Win additional Model UN Best Delegate awards at prestigious conferences (HNMUN, YMUN, PMUNC)",
        "Build Investment Club into an inter-school network with quarterly competitions and speaker events",
        "Complete the NFTE entrepreneurship program and develop a fintech startup concept",
        "Begin building a relationship with a Wharton or Columbia Business School professor through email outreach or pre-college programs",
      ],
      mediumTerm: [
        "Secure a summer internship or pre-internship at a Wall Street firm (Goldman Sachs, JP Morgan, Morgan Stanley explorer programs)",
        "Launch a fintech prototype or MVP — even a simple financial literacy app demonstrates entrepreneurial execution",
        "Achieve national recognition in DECA — top 10 at ICDC in a finance-related event",
        "Take AP Calculus BC and AP Computer Science A to demonstrate quantitative rigor",
        "Develop the financial literacy nonprofit to serve 200+ students across multiple NYC schools",
      ],
      longTerm: [
        "Build a compelling application narrative centered on financial democratization, immigrant family values, and entrepreneurial impact",
        "Score 1560+ on SAT and achieve National Merit recognition",
        "Have a published research paper, a functional fintech project, and documented community impact",
        "Apply Early Decision to Wharton with a profile that demonstrates genuine passion, not just resume optimization",
        "Position yourself as a candidate who brings both Wall Street ambition and social impact — the combination Wharton seeks",
      ],
    },
    competitivenessScore: 91,
    collegeRecommendations: {
      reach: ["Wharton/University of Pennsylvania", "Harvard University", "Princeton University", "Columbia University"],
      match: ["NYU Stern School of Business", "Georgetown University McDonough", "University of Michigan Ross", "Cornell University Dyson"],
      safety: ["Baruch College (Honors)", "Rutgers University (Business)", "University of Connecticut", "Fordham University (Gabelli)"],
    },
    essayTopics: [
      "How watching your immigrant parents navigate predatory financial products ignited your mission to democratize financial literacy — and why you founded an investment club to start",
      "The moment your freshman member said your investment club taught her more about money than she ever learned at home — and what that means for financial education equity",
      "Bridging two financial worlds: how your mother's corporate finance expertise and your father's economic theory created your unique perspective on markets",
      "What managing a real portfolio at 16 taught you about risk, patience, and the psychology of money — lessons you can't learn from a textbook",
      "From ECOFIN delegate to financial literacy teacher: how debating monetary policy at Model UN made you realize finance is a tool for global equity",
    ],
    actionPriorities: [
      {
        priority: "High",
        action: "Apply to Goldman Sachs and JP Morgan pre-internship programs",
        deadline: "Within 4 weeks",
        impact: "Wall Street pre-internship experience as a sophomore/junior is the single most differentiating experience for business school applications. These programs also build your professional network early.",
      },
      {
        priority: "High",
        action: "Complete and submit research paper on Fed rate impacts",
        deadline: "Within 6 weeks",
        impact: "A published research paper demonstrates academic rigor beyond grades. Connecting finance interest to genuine scholarly work distinguishes you from students who only have competition results.",
      },
      {
        priority: "High",
        action: "Prepare for DECA State to qualify for ICDC",
        deadline: "Within 8 weeks",
        impact: "DECA ICDC qualification is a nationally recognized business achievement. Top performers at ICDC are heavily recruited by business schools and finance firms.",
      },
      {
        priority: "Medium",
        action: "Formalize financial literacy program for underserved schools",
        deadline: "Within 3 months",
        impact: "Social impact is the missing dimension in your profile. Wharton and Harvard value candidates who use business skills for community benefit, not just personal achievement.",
      },
      {
        priority: "Medium",
        action: "Begin learning advanced financial modeling and Python for finance",
        deadline: "Within 2 months",
        impact: "Technical skills separate serious finance candidates from those with surface-level interest. Being able to build models and analyze data programmatically is impressive at any age.",
      },
    ],
  }

  const passionProjects = [
    {
      title: "FinLit NYC — Financial Literacy for Underserved High Schools",
      description: "Build a structured financial literacy curriculum and deliver it through workshops at Title I high schools across New York City. Cover budgeting, credit, investing basics, student loans, and avoiding predatory financial products. Partner with NYC Department of Education and local credit unions. Create a website with free resources in English, Spanish, and Mandarin.",
      timeCommitment: "8-10 hours/week for 6 months",
      skillsDeveloped: ["Curriculum Design", "Teaching & Public Speaking", "Nonprofit Management", "Community Outreach", "Multilingual Content Creation"],
      applicationImpact: "Demonstrates that your finance passion isn't just about making money — it's about empowering communities. This social impact angle is exactly what Wharton and Harvard look for. The immigrant family financial literacy story makes this deeply authentic.",
      resources: "Partner with Jump$tart Coalition, NFTE alumni network, NYC DOE community schools coordinators, local credit unions for guest speakers. Use Canva for materials, Google Classroom for curriculum delivery.",
    },
    {
      title: "AlphaGen — Student-Run Quantitative Investment Newsletter",
      description: "Launch a weekly investment newsletter combining fundamental analysis, quantitative models, and macroeconomic commentary. Target audience: high school and college students interested in finance. Feature stock picks with detailed DCF analysis, sector rotation strategies, portfolio construction theory, and interviews with finance professionals. Build a subscriber base and monetize through premium tiers.",
      timeCommitment: "5-6 hours/week ongoing",
      skillsDeveloped: ["Financial Analysis & Writing", "Quantitative Modeling", "Newsletter Publishing", "Personal Branding", "Revenue Generation"],
      applicationImpact: "Shows entrepreneurial initiative and deep financial knowledge simultaneously. A newsletter with 1,000+ subscribers demonstrates real audience-building skills. The monetization aspect shows business acumen beyond academics.",
      resources: "Substack for publishing, Bloomberg Terminal access through father's NYU office, Python/pandas for quantitative analysis, Canva for graphics, social media for distribution",
    },
    {
      title: "MicroLend — Peer-to-Peer Lending Platform Prototype for Student Entrepreneurs",
      description: "Design and build a prototype peer-to-peer lending platform that connects student entrepreneurs with micro-investors (friends, family, community members). Students pitch business ideas, set funding goals, and receive micro-loans with structured repayment plans. Include financial literacy modules that borrowers must complete before receiving funds. Present at DECA, NFTE, and Diamond Challenge competitions.",
      timeCommitment: "6-8 hours/week for 4 months",
      skillsDeveloped: ["Fintech Product Design", "Full-Stack Development Basics", "Financial Risk Assessment", "Pitch Deck Creation", "Competition Presentation"],
      applicationImpact: "A tangible fintech product demonstrates the intersection of technology and finance that top business programs prioritize. Even as a prototype, it shows you can execute on ideas, not just theorize about them.",
      resources: "Use Figma for UX design, React/Next.js for frontend, Firebase for backend. Mentor through NFTE network. Present at Diamond Challenge and DECA entrepreneurship events.",
    },
    {
      title: "The Macro Brief — Student Podcast on Global Economics",
      description: "Launch a bi-weekly podcast analyzing major macroeconomic events, Federal Reserve decisions, international trade developments, and their impact on markets and everyday people. Feature interviews with economists, fund managers, fintech founders, and NYU/Columbia professors. Translate complex economic concepts into accessible language for a teen audience.",
      timeCommitment: "4-5 hours/week ongoing",
      skillsDeveloped: ["Economic Analysis", "Interviewing & Journalism", "Audio Production", "Personal Branding", "Professional Networking"],
      applicationImpact: "Demonstrates intellectual curiosity and communication skills beyond competition results. The ability to translate complex finance into accessible content is a skill that investment banks and consulting firms value highly. Building an audience shows marketing and entrepreneurial skills.",
      resources: "Spotify for Podcasters for hosting, Riverside.fm for remote interviews, leverage father's NYU economics network for guests, promote through DECA and Investment Club channels",
    },
  ]

  const academicCourses = {
    apCourses: [
      "AP Calculus BC (11th grade — demonstrates quantitative rigor beyond AB, essential for finance and economics programs)",
      "AP Computer Science A (11th grade — programming skills are increasingly required in finance; Python and Java are industry standards)",
      "AP US History (11th grade — strong humanities balance shows well-roundedness for Ivy League admissions)",
      "AP English Language (11th grade — persuasive writing and analytical reading are critical for business communication)",
      "AP Physics 1 (11th or 12th grade — quantitative science demonstrates STEM capability valued by business schools)",
      "AP Spanish Language (12th grade — trilingual capability in English, Mandarin, and Spanish is a major asset in international finance)",
      "AP Government & Politics (12th grade — understanding regulatory and political landscape is essential for finance careers)",
      "AP Computer Science Principles (if not taking CSA — at minimum, demonstrate computational thinking)",
    ],
    ibCourses: [
      "IB Economics HL (if available — goes deeper than AP and is internationally recognized by business schools)",
      "IB Mathematics: Analysis & Approaches HL (the most rigorous math track, preparing for university-level quantitative courses)",
      "IB Business Management (practical business knowledge complementing theoretical economics)",
    ],
    honorsCourses: [
      "Honors Pre-Calculus / Calculus (if not already in AP track — ensure the strongest possible math foundation)",
      "Honors English 10 — Advanced Composition (business writing and analytical communication)",
      "Honors Physics or Chemistry (demonstrate STEM rigor alongside business focus)",
      "Honors Mandarin Chinese (formalize language skills for international business applications)",
    ],
    electivesRecommended: [
      "Financial Accounting or Business Principles (if offered — direct business knowledge rare at the high school level)",
      "Computer Science / Programming (Python, JavaScript — fintech and quantitative finance require coding skills)",
      "Entrepreneurship or Innovation Lab (hands-on business creation experience that competition results alone don't provide)",
      "Public Speaking or Rhetoric (refine the persuasion skills needed for investment banking pitches and client presentations)",
      "Statistics or Data Science (beyond AP Stats — if available, advanced data analysis is the language of modern finance)",
    ],
  }

  const satActGoals = {
    targetSATScore: "1560+ (target for junior year spring)",
    satSectionGoals: { reading: "780+", math: "800" },
    targetACTScore: "35+",
    actSectionGoals: { english: "35+", math: "36", reading: "35+", science: "35+" },
    prepStrategy: "Leverage strong quantitative foundation from AP Calculus and Statistics — math section should be near-perfect. Focus prep time on Evidence-Based Reading & Writing by reading The Wall Street Journal, The Economist, and Financial Times daily to build reading speed with complex analytical texts. Use Khan Academy for official College Board practice. Take a full-length practice test every 2 weeks starting January of junior year. Consider a tutor for reading section if practice scores are below 750.",
    timeline: "PSAT/NMSQT: October of 10th grade (early baseline + National Merit qualifying attempt). PSAT/NMSQT: October of 11th grade (primary National Merit qualifying attempt — target 1500+ index for NY semifinalist). SAT: March of 11th grade (first attempt). SAT: May of 11th grade (retake if needed). AP Exams: May of each year. SAT Subject Tests in Math 2 and US History if schools still consider them.",
  }

  const researchPubs = {
    researchTopics: [
      "Impact of Federal Reserve interest rate decisions on technology startup valuations (2020-2024) — quantitative analysis using public market data and private funding rounds",
      "Behavioral economics of teen financial decision-making — studying how financial literacy education changes savings and investment behavior among NYC high school students",
      "Cryptocurrency adoption patterns among Gen Z investors — analyzing risk perception, trading behavior, and financial outcomes in the 16-22 demographic",
      "The democratization of investing: how commission-free trading platforms changed retail investor behavior and market dynamics",
      "Income inequality and financial literacy: a quantitative study of the correlation between household income, financial education access, and investment behavior in NYC boroughs",
    ],
    publicationOpportunities: [
      "Journal of Emerging Investigators (JEI) — peer-reviewed journal for high school research; ideal for the Fed rate impact paper",
      "Concord Review — prestigious history journal for high school students; submit an economic history paper on financial crises or market regulation",
      "DECA ICDC written events — research papers on business finance topics are judged at the international level",
      "Columbia Business School Research Symposium — some programs allow exceptional high school students to present",
      "NYU Stern Undergraduate Research Conference — leverage father's NYU connection to present or attend",
      "Wharton Global Youth Program — submit research through their online platform for high school business researchers",
    ],
    mentorshipSuggestions: [
      "NYU Stern School of Business faculty — your father is an economics professor at NYU, making Stern faculty the most accessible mentors. Seek out professors in finance, behavioral economics, or fintech. The Stern Research Lab program occasionally accepts high school researchers.",
      "Columbia Business School — reach out to professors studying fintech, venture capital, or financial inclusion. Columbia's location in NYC makes in-person meetings feasible. The Columbia Entrepreneurship program has student-facing events.",
      "Wharton School of the University of Pennsylvania — Wharton's Global Youth Program actively engages high school students. Reach out to professors in the finance department who study market microstructure, behavioral finance, or entrepreneurship.",
      "Federal Reserve Bank of New York — the NY Fed has educational programs and occasionally hosts high school researchers. Your research on Fed rate impacts makes this connection directly relevant.",
    ],
    timeline: "10th Grade: Complete and submit Fed rate impact paper to JEI. Begin behavioral economics research with NYU connection. 11th Grade: Present at a student research conference; submit to Concord Review or Wharton Global Youth. Begin fintech-related research that can be featured in DECA ICDC written events. 12th Grade: Have 1-2 published or presented papers; feature research prominently in Wharton/Harvard applications.",
  }

  const leadership = {
    clubLeadership: [
      "Continue as DECA Chapter President — target growing membership to 80+ and winning multiple ICDC qualifications from your chapter",
      "Expand Investment Club into an inter-school network — partner with Bronx Science, Brooklyn Tech, and other NYC specialized high schools for joint competitions",
      "Found a Financial Literacy Outreach Club that formalizes the FinLit NYC initiative as a school-recognized organization",
      "Seek to create and lead a Stuyvesant Entrepreneurship Council that sponsors startup pitch competitions and brings in NYC business leaders as speakers",
    ],
    schoolWideRoles: [
      "Run for Junior Class Treasurer or Student Government Finance Chair — demonstrate you can manage real budgets and allocate resources",
      "Propose and organize an annual 'Stuyvesant Business Summit' bringing together finance professionals, entrepreneurs, and students for a full-day conference",
      "Serve as a peer tutor in economics and mathematics — build teaching experience and deepen your own understanding",
      "Lead a school-wide financial literacy initiative during Financial Literacy Month (April) with workshops, speakers, and interactive games",
    ],
    communityLeadership: [
      "Scale FinLit NYC to serve 5+ Title I high schools across New York City with structured financial literacy workshops",
      "Partner with NYC Department of Consumer and Worker Protection's Financial Empowerment Centers for community outreach",
      "Organize teen volunteer cohorts for Habitat for Humanity NYC — connect financial literacy with economic empowerment and housing stability",
      "Create a mentorship program pairing Stuyvesant business students with middle schoolers from underserved NYC neighborhoods interested in finance and entrepreneurship",
    ],
    leadershipDevelopment: [
      "Apply to the Wharton Global Youth Program Leadership in the Business World (LBW) — the premier pre-college business leadership program",
      "Attend DECA International Career Development Conference as a competitor and emerging leader in the NY chapter",
      "Apply to Bank of America Student Leaders program — paid community internship and leadership development summit in Washington, D.C.",
      "Pursue the Congressional Award program — Gold medal achievement demonstrates sustained commitment across community service, personal development, and fitness",
    ],
  }

  const serviceCommunity = {
    localOpportunities: [
      "Deliver financial literacy workshops at Title I high schools in the Bronx, Brooklyn, and Queens — target 200+ students served in the first year with pre/post assessment data",
      "Volunteer with the Financial Clinic NYC — help low-income New Yorkers with tax preparation, budgeting, and credit building through their free clinics",
      "Partner with Chinatown community organizations to provide financial literacy resources in Mandarin and English for immigrant families navigating the US financial system",
      "Organize free FAFSA completion workshops for NYC public school seniors — partner with NYC DOE and college access organizations",
      "Volunteer with Junior Achievement NYC — teach business and financial literacy curricula in elementary and middle schools",
    ],
    nationalPrograms: [
      "Apply to Bank of America Student Leaders — 8-week paid internship at a local nonprofit plus a leadership summit in Washington, D.C. focused on community development",
      "Join NFTE (Network for Teaching Entrepreneurship) as an alumni mentor — help current participants develop business plans and financial projections",
      "Participate in the National Financial Educators Council Youth Advisory Board — contribute to national financial literacy curriculum development",
      "Apply for the Prudential Spirit of Community Awards — recognize youth who have made meaningful contributions to financial empowerment",
    ],
    internationalService: [
      "Connect with Kiva — contribute to microlending campaigns and potentially develop a school-based Kiva lending circle focused on international financial empowerment",
      "Join the Global Financial Literacy Excellence Center (GFLEC) student network — contribute to international financial education research",
      "Participate in virtual financial literacy exchanges with schools in developing countries through programs like iEARN or Global Nomads Group",
      "Volunteer with Junior Achievement Worldwide's international programs — teaching entrepreneurship and financial literacy across borders",
    ],
    sustainedCommitment: [
      "Track all financial literacy workshop participants and measure learning outcomes with pre/post assessments — document that your program actually changes behavior",
      "Build a sustainable model for FinLit NYC by training student facilitators at each partner school who can continue the program after you graduate",
      "Create a comprehensive online curriculum (videos, worksheets, quizzes) available free at finlitnyc.org so the impact extends beyond in-person workshops",
      "Establish partnerships with at least 3 corporate sponsors (banks, fintech companies) to fund program materials and ensure long-term sustainability",
    ],
  }

  const summerPrograms = {
    preFreshmanPrograms: [
      "Wharton Global Youth Program: Leadership in the Business World (LBW) — 4-week summer program at the Wharton School, the most prestigious pre-college business program in the world",
      "Columbia Business School Pre-College Program — Entrepreneurship and Finance tracks available for rising juniors and seniors, located in NYC (home-field advantage)",
      "NYU Stern Pre-College Business Program — leverage your father's NYU connection for this immersive business education experience",
      "LaunchX Entrepreneurship Program at MIT — build a real startup over the summer with mentorship from MIT entrepreneurs",
    ],
    competitivePrograms: [
      "Goldman Sachs Possibilities Summit / Analyst Prep — exclusive pre-internship programs for diverse, high-achieving students interested in finance (apply sophomore/junior year)",
      "JP Morgan Launching Leaders / Advancing Black Pathways — summer pre-internship programs with Wall Street exposure and mentorship",
      "SEO (Sponsors for Educational Opportunity) Career — 15-month program including summer internship at a top financial services firm (apply junior year — extremely competitive)",
      "Bank of America Student Leaders — 8-week paid internship combining community service with professional development in financial services",
    ],
    researchPrograms: [
      "NYU Stern Research Apprenticeship — work directly with Stern faculty on finance or economics research (leverage father's university connections)",
      "Columbia University Summer Research Program for High School Students — pursue economics or business-related research at an Ivy League institution",
      "Federal Reserve Bank of New York High School Engagement Programs — economic education and research opportunities at the NY Fed",
      "Wharton Global Youth Program online courses — take college-level business courses for transcript enrichment throughout the summer",
    ],
    enrichmentPrograms: [
      "NFTE Summer BizCamp — intensive entrepreneurship program culminating in a startup pitch competition with seed funding for winners",
      "Kode With Klossy (if applicable) or coding bootcamp — build fintech development skills over the summer",
      "Bloomberg Market Concepts (BMC) — free self-paced online certification in financial markets used by Wall Street professionals",
      "CFA Institute Investment Foundations Program — free self-paced certification that demonstrates serious commitment to investment knowledge",
    ],
  }

  const sports = {
    varsitySports: [
      "Continue Varsity Soccer at Stuyvesant — aim for team captain by junior or senior year",
      "Soccer demonstrates teamwork, strategic thinking, and physical discipline — all qualities that admissions officers and future employers value",
      "Target selection for NYC Public Schools Athletic League (PSAL) All-Star recognition",
      "The athlete-scholar balance (varsity sport + 4.0 GPA + DECA champion) is a powerful narrative for Ivy League applications",
    ],
    clubSports: [
      "Continue competitive chess (USCF rated 1500+) — participate in NYC scholastic chess tournaments and aim for Expert rating (2000+)",
      "Chess is uniquely valued in finance recruiting — it signals strategic thinking, pattern recognition, and decision-making under pressure",
      "Consider joining a recreational basketball or tennis league for social networking and fitness variety",
      "Participate in charity sports events — soccer tournaments benefiting NYC youth programs combine athletics with community service",
    ],
    recruitingStrategy: [
      "Soccer is unlikely to be a primary recruiting tool for Ivy League, but demonstrating varsity-level athletics powerfully complements the academic and business profile",
      "Chess achievements can be highlighted in applications as evidence of strategic thinking — Wharton and Columbia value this unique intellectual pursuit",
      "Highlight the discipline of maintaining varsity athletics while leading DECA, Investment Club, and Model UN — time management at this level is genuinely impressive",
      "Research whether any target schools have strong club soccer or chess teams — continuing these activities in college supports the 'complete human' narrative",
    ],
    fitnessLeadership: [
      "Organize a charity soccer tournament at Stuyvesant benefiting NYC youth financial literacy programs — combines athletics with your core mission",
      "Start a 'Mind & Body' initiative connecting chess club members with physical fitness — healthy minds require healthy bodies",
      "Lead a peer fitness challenge during exam periods — promote physical activity as a stress management tool for high-achieving students",
      "Write about the parallels between soccer strategy and investment strategy for the school newspaper or your newsletter",
    ],
  }

  const competitions = {
    academicCompetitions: [
      "DECA (Distributive Education Clubs of America) — advance from NY State to ICDC in Financial Consulting, Business Finance, or Entrepreneurship events. Target top 10 at ICDC by junior year. DECA ICDC finalists are heavily recruited by Wharton, Stern, and other top business programs.",
      "National Economics Challenge (CEE/Council for Economic Education) — team-based economics competition covering micro, macro, and international economics. Partner with Stuyvesant's best econ students for a strong NYC team.",
      "Diamond Challenge (University of Delaware) — premier high school entrepreneurship competition. Submit the MicroLend or FinLit NYC concept for judging by business professors and venture capitalists. Winners receive seed funding.",
      "Wharton Global Youth Investment Competition (KWHS) — team-based stock market simulation and investment strategy competition run by the Wharton School. Winning teams present at Wharton campus — incredible for applications.",
      "FBLA (Future Business Leaders of America) — compete in Securities & Investments, Banking & Financial Systems, or Entrepreneurship events at state and national levels.",
    ],
    businessCompetitions: [
      "NFTE (Network for Teaching Entrepreneurship) World Series of Innovation — submit innovative solutions to real-world business challenges with mentorship from Fortune 500 companies",
      "Conrad Challenge — Innovation in Financial Services category. Design a fintech solution addressing financial inclusion or access.",
      "MIT LaunchX Accelerator Demo Day — if accepted to LaunchX summer program, present your startup to investors and mentors",
      "YouthBiz Stars (NFTE) — annual business plan competition with cash prizes and mentorship for young entrepreneurs",
    ],
    artsCompetitions: [
      "Scholastic Art & Writing Awards — submit a personal essay or economics/business writing piece about financial literacy, immigrant family financial struggles, or market analysis",
      "NYS English Council Essay Contest — write about the intersection of literature and economics or the narrative power of financial storytelling",
      "NYC Congressional Art/Essay Competition — submit writing on economic policy or financial inclusion themes",
    ],
    debateSpeech: [
      "Continue Public Forum Debate — target NSDA National Tournament qualification. Economic and policy topics are your strength in PF.",
      "Consider adding Congressional Debate — argue economic policy bills and demonstrate legislative knowledge that complements your finance expertise",
      "National Speech & Debate Association (NSDA) — pursue Academic All-American recognition for combined debate and academic excellence",
      "Model UN continues at the highest level — target HNMUN, YMUN, and NMUN conferences, consistently winning Best Delegate in ECOFIN committees",
    ],
  }

  const studentGov = {
    schoolGovernment: [
      "Run for Junior Class Treasurer — managing real school budgets demonstrates financial leadership in practice, not just theory",
      "Propose a Student Financial Advisory Committee within Student Government — advocate for financial literacy education, transparent student activity fee spending, and financial aid resources",
      "Target Student Government President by senior year — the ultimate school leadership position combined with your business achievements creates a powerful application narrative",
      "Lead a school-wide initiative: organize a 'Stuyvesant Shark Tank' where students pitch business ideas to a panel of NYC entrepreneurs and investors",
    ],
    districtStateRoles: [
      "Apply for the NYC Chancellor's Student Advisory Council — represent Stuyvesant in citywide education policy discussions, particularly around financial literacy curriculum",
      "Attend NYC City Council education committee hearings — advocate for mandatory financial literacy education in NYC public schools",
      "Apply for the Governor's Excelsior Service Program or NY state youth advisory boards focused on economic development",
      "Seek a student representative role on the NYC Department of Education's Career & Technical Education advisory board",
    ],
    youthGovernment: [
      "Participate in YMCA Youth & Government program — write and debate bills on financial regulation, student loan reform, and economic opportunity",
      "Apply for the Congressional Award program — complete Gold medal requirements through sustained community service (FinLit NYC), personal development, physical fitness, and exploration",
      "Apply for Boys State / Girls State (if applicable) — intensive civic engagement and leadership program with connections to political and business leaders",
      "Consider the United States Senate Youth Program (USSYP) — two students per state, $10,000 scholarship, week in Washington with senators and policymakers",
    ],
    advocacyRoles: [
      "Write op-eds for the New York Times, Wall Street Journal student voices, or local NYC publications on teen financial literacy, student debt, and economic opportunity",
      "Partner with NYC Council members on financial literacy legislation — your FinLit NYC data on student outcomes provides compelling evidence for policy advocacy",
      "Organize student testimony at NYC Board of Education hearings advocating for financial literacy as a graduation requirement",
      "Create a student coalition across NYC specialized high schools (Stuyvesant, Bronx Science, Brooklyn Tech) advocating for economics and financial literacy curriculum",
    ],
  }

  const internships = {
    industryInternships: [
      "Goldman Sachs Possibilities Summit / Analyst for a Day — exclusive programs providing inside access to Wall Street operations, trading floors, and networking with analysts and managing directors",
      "JP Morgan Launching Leaders or Sophomore/Junior Pre-Internship — structured Wall Street exposure with mentorship from finance professionals",
      "Morgan Stanley Early Insights Program — diversity-focused pre-internship program for sophomores and juniors interested in financial services",
      "Bloomberg LP — explore internship or shadowing opportunities at Bloomberg's NYC headquarters, combining finance with technology and media",
    ],
    researchInternships: [
      "NYU Stern School of Business — leverage your father's NYU connection to secure a research assistant position with a finance or economics professor",
      "Columbia Business School — reach out to professors studying fintech, behavioral finance, or financial inclusion for summer research opportunities",
      "Federal Reserve Bank of New York — the NY Fed has high school engagement and economic education programs with potential research components",
      "National Bureau of Economic Research (NBER) — while primarily for graduate students, some projects accept high school data assistants, especially in NYC",
    ],
    nonprofitInternships: [
      "Robin Hood Foundation (NYC) — one of the largest poverty-fighting organizations in the US. Intern with their research or programs team to understand the intersection of finance and social impact.",
      "Junior Achievement of New York — intern or volunteer leader position helping design and deliver financial literacy and business education programs to NYC youth",
      "NFTE (Network for Teaching Entrepreneurship) headquarters (NYC) — intern with the program development team that designs entrepreneurship curricula for underserved youth",
      "Financial Clinic NYC — volunteer or intern helping low-income New Yorkers with tax preparation, credit building, and financial coaching",
    ],
    virtualOpportunities: [
      "Wall Street Prep — online financial modeling courses used by actual Wall Street analysts for training. Complete the LBO Modeling, DCF Modeling, and M&A Modeling courses to build real technical skills.",
      "Bloomberg Market Concepts (BMC) — free online certification covering economics, currencies, fixed income, and equities used by finance professionals worldwide",
      "Coursera/edX: Take University of Michigan's Introduction to Finance, Wharton's Financial Markets (Robert Shiller), or MIT's Blockchain and Money course",
      "Virtual internships through platforms like Forage — complete simulated investment banking, asset management, and consulting projects designed by JPMorgan, Goldman Sachs, and BCG",
    ],
  }

  const cultureArts = {
    performingArts: [
      "Use debate and public speaking skills to compete in oratory competitions — Original Oratory or Extemporaneous Speaking on economic topics",
      "Perform at community events — deliver keynote addresses or panel moderations at FinLit NYC workshops and business conferences",
      "Consider joining Stuyvesant's theater program in a business/production management role — producing a show teaches budgeting, fundraising, and project management",
      "Explore spoken word or slam poetry about economic inequality, immigrant financial struggles, or the American Dream — powerful for application essays and community events",
    ],
    visualArts: [
      "Design professional-quality infographics and data visualizations for AlphaGen newsletter and FinLit NYC workshops — data visualization is a critical finance skill",
      "Create a visual brand identity for your ventures (Investment Club, FinLit NYC, AlphaGen) using Canva or Adobe Creative Suite",
      "Enter data visualization competitions — turning complex financial data into compelling visual stories is an art form valued in finance",
      "Develop financial education video content (explainer videos on investing, budgeting, market analysis) for YouTube or TikTok to reach a broader audience",
    ],
    creativeWriting: [
      "Write the AlphaGen investment newsletter with compelling analysis that demonstrates both financial knowledge and strong writing",
      "Submit economics or business essays to the Concord Review (for history/economics) or Scholastic Writing Awards",
      "Write a business column for Stuyvesant's school newspaper covering NYC financial news, economic trends, and student investment strategies",
      "Draft op-eds on financial literacy, economic opportunity, and teen entrepreneurship for NYC media outlets and student publications",
    ],
    culturalClubs: [
      "Join or help lead Stuyvesant's Chinese American Student Association — celebrate Chinese New Year, Lunar Festival, and connect with NYC's vibrant Chinese-American business community",
      "Participate in Chinatown community organizations — volunteer at cultural events while providing financial literacy resources in Mandarin",
      "Attend Chinese-American business networking events in NYC — build connections between your cultural identity and professional ambitions",
      "Explore the intersection of Chinese and American business culture — the role of guanxi (relationships) in finance, US-China trade dynamics, and the growing Chinese fintech ecosystem",
    ],
  }

  const career = {
    jobTitles: [
      "Investment Banking Managing Director at a Bulge Bracket Firm (Goldman Sachs, Morgan Stanley, JP Morgan)",
      "Venture Capital Partner at a Top-Tier Firm (Sequoia, Andreessen Horowitz, Benchmark)",
      "Fintech Startup Founder & CEO — building technology that democratizes financial access",
      "Hedge Fund Portfolio Manager running a multi-billion dollar quantitative or fundamental strategy",
      "Chief Financial Officer of a Fortune 500 Technology Company",
    ],
    blueOceanIndustries: [
      { industry: "Embedded Finance & Banking-as-a-Service", why: "Every company is becoming a fintech company. Embedded finance (integrating financial services into non-financial platforms) is a $7 trillion opportunity. Your combination of finance knowledge and tech interest positions you perfectly for this emerging field." },
      { industry: "AI-Powered Wealth Management & Robo-Advisory", why: "The intersection of artificial intelligence and personal finance is transforming how everyday people invest. Your Python skills and investment knowledge make you ideal for building the next generation of AI-powered financial tools." },
      { industry: "Decentralized Finance (DeFi) & Digital Assets", why: "Despite volatility, blockchain-based financial services are fundamentally reshaping how value is transferred, stored, and managed globally. Understanding both traditional finance and decentralized systems creates a rare dual fluency." },
      { industry: "Financial Inclusion & Impact Investing", why: "The $715 billion impact investing market is growing rapidly as investors seek returns alongside social good. Your FinLit NYC work and immigrant family story position you to lead at the intersection of profit and purpose." },
    ],
    salaryPotential: "Investment banking analysts start at $120K-$200K (base + bonus) out of college, with associates earning $200K-$400K. Vice Presidents earn $400K-$700K, Managing Directors earn $1M-$5M+. Venture capital partners at top firms earn $1M-$10M+ annually through management fees and carried interest. Fintech startup founders' compensation varies wildly — successful exits can reach $10M-$1B+. The finance path offers among the highest earning potential of any career, but also demands long hours (80-100/week in banking) and high performance standards.",
    linkedInBioHeadline: "Aspiring Finance Leader | DECA Champion | Investment Club Founder | Building financial literacy for all | Wharton-bound entrepreneur connecting Wall Street ambition with community impact",
  }

  const collegeRecs = {
    collegeBreakdown: {
      reach: ["Wharton/University of Pennsylvania", "Harvard University", "Princeton University", "Columbia University"],
      target: ["NYU Stern School of Business", "Georgetown University McDonough", "University of Michigan Ross School of Business", "Cornell University Dyson School"],
      safety: ["Baruch College (Honors Program)", "Rutgers University (Business School)", "University of Connecticut (Business)", "Fordham University (Gabelli School of Business)"],
    },
    schoolMatches: [
      { schoolName: "Wharton/University of Pennsylvania", matchScore: 96, why: "Wharton is the #1 undergraduate business school in the world and the top feeder to Wall Street. The curriculum combines finance theory, entrepreneurship, and leadership development. Wharton's Global Youth Program connection, DECA pipeline, and your entrepreneurial profile make this the ideal reach school. The Penn campus in Philadelphia offers access to both NYC and D.C. financial ecosystems." },
      { schoolName: "Harvard University", matchScore: 93, why: "While Harvard doesn't have an undergraduate business school, its economics department and Harvard Business School proximity offer unparalleled resources. Harvard's emphasis on well-rounded leaders who combine intellectual rigor with social impact aligns perfectly with your FinLit NYC work. The Harvard-Wall Street recruiting pipeline is among the strongest in the country." },
      { schoolName: "Columbia University", matchScore: 94, why: "Columbia's NYC location is unbeatable for finance — Wall Street is literally downtown. The Economics department and Columbia Business School proximity provide exceptional resources. The Value Investing Program (modeled on Warren Buffett's approach) is legendary. Being in NYC means you can maintain your FinLit NYC program and all your city-based activities without disruption." },
      { schoolName: "NYU Stern School of Business", matchScore: 92, why: "Stern is a top-5 undergraduate business school located in the heart of NYC's financial district. Your father's NYU connection is a significant advantage. Stern's finance curriculum is among the most rigorous in the country, and its Wall Street placement rate rivals Wharton. The IB Scholars program offers guaranteed admit to Stern's MBA program after a few years of work experience." },
      { schoolName: "Princeton University", matchScore: 88, why: "Princeton's economics department is consistently ranked #1, and its Bendheim Center for Finance offers a specialized undergraduate finance certificate. The small class sizes, thesis requirement, and eating club culture create close relationships. Princeton's Wall Street recruiting is exceptional, and its finance-focused alumni network is among the most loyal." },
      { schoolName: "Georgetown McDonough", matchScore: 87, why: "Georgetown's location in Washington, D.C. offers unique access to financial regulation, policy-making, and international economic institutions (World Bank, IMF). The McDonough School's focus on values-driven business leadership aligns with your FinLit NYC social impact mission. Strong Wall Street recruiting pipeline from the D.C. area." },
    ],
  }

  const mentors = {
    mentors: [
      {
        name: "Professor Jeremy Siegel",
        university: "Wharton School, University of Pennsylvania",
        department: "Department of Finance — Russell E. Palmer Professor of Finance, author of 'Stocks for the Long Run'",
        why: "One of the most renowned finance professors in the world and a regular CNBC/Bloomberg commentator. His research on long-term stock market returns is foundational to modern portfolio theory. Professor Siegel actively engages with talented pre-college students through Wharton's Global Youth Program and is known for being accessible to motivated young people.",
        coldEmailTemplate: "Subject: Aspiring Finance Student and DECA Champion — Inspired by 'Stocks for the Long Run'\n\nDear Professor Siegel,\n\nMy name is Marcus Chen, and I am a sophomore at Stuyvesant High School in New York City. Your book 'Stocks for the Long Run' fundamentally shaped how I think about investing and long-term wealth creation.\n\nI serve as DECA Chapter President, founded our school's Investment Club, and manage a personal portfolio focused on applying the principles I've learned from your research. I'm also building FinLit NYC, a financial literacy program serving Title I schools across New York City.\n\nI'm currently writing a research paper on the impact of Federal Reserve rate decisions on tech startup valuations, and your insights on market cycles and monetary policy have been invaluable to my analysis.\n\nI would be deeply honored by any guidance you might offer on pursuing finance at the highest level, and I am strongly considering Wharton for undergraduate studies.\n\nWith great admiration,\nMarcus Chen\nStuyvesant High School, Class of 2028\nDECA Chapter President & Investment Club Founder",
      },
      {
        name: "Professor Aswath Damodaran",
        university: "NYU Stern School of Business",
        department: "Department of Finance — Kerschner Family Chair in Finance Education, known as the 'Dean of Valuation'",
        why: "The world's leading authority on corporate valuation and one of the most popular finance professors globally (his YouTube channel has millions of views). His free online valuation courses are used by Wall Street professionals. As an NYU professor, he's directly accessible through your father's university network. He's known for mentoring talented students and responding to thoughtful emails.",
        coldEmailTemplate: "Subject: NYU Faculty Son and Student Investor — Seeking Valuation Mentorship\n\nDear Professor Damodaran,\n\nMy name is Marcus Chen. My father, [Name], is an economics professor at NYU, and I have followed your valuation work for the past two years — your YouTube lectures on DCF modeling changed how I analyze my investment portfolio.\n\nI am a sophomore at Stuyvesant High School and serve as DECA Chapter President and Investment Club Founder. I'm currently working on a research paper analyzing Federal Reserve rate impacts on tech valuations and would deeply appreciate your perspective on my methodology.\n\nI am also building a financial literacy program (FinLit NYC) for underserved NYC high schools and am passionate about making valuation and investing concepts accessible to everyone.\n\nWould you have 15 minutes for a brief conversation? I am also very interested in attending NYU Stern and would welcome any advice on the application process.\n\nRespectfully,\nMarcus Chen",
      },
      {
        name: "Professor Kathleen Eisenhardt",
        university: "Stanford Graduate School of Business",
        department: "Department of Management Science & Engineering — W. Ascherman Professor, expert in strategy and entrepreneurship in high-velocity markets",
        why: "A pioneering researcher on how companies make strategic decisions in fast-moving markets — directly relevant to your fintech and VC interests. Her work bridges the academic study of strategy with real-world entrepreneurship. Stanford GSB's connection to Silicon Valley venture capital makes her perspective invaluable for understanding the VC world.",
      },
      {
        name: "Professor Sendhil Mullainathan",
        university: "Columbia Business School (previously MIT, Harvard)",
        department: "Department of Economics — Roman Family University Professor, MacArthur 'Genius Grant' recipient for behavioral economics research",
        why: "His groundbreaking research on how scarcity affects financial decision-making directly connects to your interest in financial literacy for underserved communities. A MacArthur Fellow based at Columbia in NYC, he's one of the most influential behavioral economists alive. His work on AI in financial services bridges your interests in technology and finance.",
      },
    ],
  }

  const wasteOfTime = {
    activities: [
      { activity: "Joining every business club without depth or leadership", whyQuit: "Being a passive member of FBLA, DECA, BPA, and Investment Club simultaneously dilutes your impact. Admissions officers want to see deep commitment and leadership growth, not a list of memberships. Focus your energy on DECA (competition excellence) and Investment Club (entrepreneurial leadership) — go deep, not wide." },
      { activity: "Day-trading or speculative cryptocurrency gambling", whyQuit: "Short-term trading is mostly gambling at your age, and losses will be demoralizing. It also sends the wrong signal about your financial sophistication. Focus on long-term fundamental investing, which demonstrates discipline and analytical thinking. Your 18% annual return through sound analysis is far more impressive than any day-trading story." },
      { activity: "Excessive LinkedIn networking without substance", whyQuit: "Sending 100 connection requests to Wall Street bankers without a clear purpose wastes everyone's time. Instead, build genuine relationships through targeted outreach: reach your father's NYU network, DECA alumni, and specific professionals whose work you've studied. Quality over quantity in networking, just like investing." },
      { activity: "Taking business-light AP courses just for the GPA boost", whyQuit: "AP Human Geography or AP Environmental Science won't differentiate your profile for Wharton. Take the hardest quantitative and analytical courses available: AP Calculus BC, AP Computer Science, AP Physics. Business schools want to see you can handle quantitative rigor, not that you padded your AP count with easy 5s." },
      { activity: "Over-preparing for SAT/ACT at the expense of competitions and projects", whyQuit: "For business school applicants, the difference between a 1540 and a 1580 matters far less than the difference between having DECA ICDC and not having it. Once you're in the competitive score range (1520+), diminishing returns kick in. Redirect that extra prep time to your passion projects and competition preparation." },
    ],
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "10th Grade — Sophomore (Current)",
      focus: "Compete at the highest levels, build your research portfolio, and begin establishing Wall Street connections",
      academics: [
        "Excel in AP Statistics and AP Calculus AB — target 5s on both exams. These quantitative courses are the bedrock of your finance profile.",
        "Maintain 3.95+ unweighted GPA across all courses — Wharton's median admitted GPA is essentially a 4.0",
        "Read beyond coursework: The Wall Street Journal daily, The Economist weekly, and 1-2 finance books per month (Intelligent Investor, Flash Boys, Liar's Poker, Thinking Fast and Slow)",
        "Meet with Stuyvesant's college counselor to map the optimal business school application strategy",
      ],
      extracurriculars: [
        "Lead DECA chapter to strong performance at NY State competition — qualify for ICDC in Financial Consulting or Business Finance",
        "Grow Investment Club to 50+ members with structured weekly analysis sessions and inter-school competitions",
        "Complete the FinLit NYC pilot at 2-3 Title I high schools and document participant outcomes",
        "Continue Model UN success — win Best Delegate at 2+ major conferences in ECOFIN",
        "Maintain varsity soccer and chess team involvement for well-roundedness",
      ],
      testing: [
        "Take PSAT/NMSQT this October to establish a baseline and begin National Merit qualification path",
        "Complete AP Macroeconomics and Microeconomics exams if not already done (aim for 5s)",
        "Take AP Statistics and AP Calculus AB exams in May",
        "Begin light SAT prep using Khan Academy — leverage your strong math foundation",
      ],
      leadership: [
        "Continue as DECA Chapter President with measurable growth goals",
        "Run for a class officer position (preferably Treasurer) in Student Government",
        "Take on Head Delegate role in Model UN for Stuyvesant's delegation",
        "Formalize FinLit NYC as a registered student organization or nonprofit",
      ],
      summerPlan: "Top choice: Goldman Sachs or JP Morgan pre-internship program. Second choice: Wharton Global Youth Program LBW or Columbia Business School Pre-College. Backup: Self-directed summer combining Investment Club expansion, FinLit NYC growth to 5+ schools, research paper completion, and Bloomberg Market Concepts certification.",
    },
    nextYears: [
      {
        grade: "11th Grade — Junior",
        focus: "Peak competition year: DECA ICDC, national recognition, Wall Street internship, and building the Wharton application narrative",
        academics: [
          "Take AP Calculus BC, AP Computer Science A, AP US History, AP English Language — the most rigorous course load demonstrating quantitative and verbal excellence",
          "Target 5s on all AP exams — these validate intellectual intensity for top business schools",
          "Maintain 3.95+ GPA — junior year grades are the most important for college admissions",
          "Consider dual enrollment in a college-level finance or economics course at NYU (leverage father's connection)",
        ],
        extracurriculars: [
          "Compete at DECA ICDC — target top 10 finish in a finance-related event for national recognition",
          "Launch the AlphaGen newsletter or Macro Brief podcast as a tangible content platform with measurable audience growth",
          "Scale FinLit NYC to 10+ schools with documented outcomes and corporate sponsorships",
          "Build the MicroLend prototype and present at Diamond Challenge or Conrad Challenge",
          "Continue Model UN excellence — chair a committee at a major conference to demonstrate senior leadership",
        ],
        testing: [
          "PSAT/NMSQT in October — target 1500+ index for National Merit Semifinalist in New York (top 1%)",
          "SAT in March — first attempt, target 1550+ with realistic stretch of 1580+",
          "SAT retake in May if needed",
          "AP exams: Calculus BC, Computer Science A, US History, English Language",
        ],
        leadership: [
          "Target Student Government Treasurer or Vice President position",
          "Serve as DECA NY State officer or district representative",
          "FinLit NYC should be a recognized nonprofit or student organization with a board of student advisors",
          "Request recommendation letters from AP Economics teacher, Investment Club faculty advisor, and FinLit NYC community partner",
        ],
        summerPlan: "Top choice: SEO Career summer internship at a Wall Street firm. Second choice: Goldman Sachs or JP Morgan pre-internship program. Simultaneously: Begin Wharton Early Decision application essays. Visit Wharton, Columbia, Harvard, Princeton campuses. Complete all DECA preparation for senior year ICDC run.",
      },
      {
        grade: "12th Grade — Senior",
        focus: "Execute applications, maintain excellence, compete at DECA ICDC one final time, and leave a lasting legacy",
        academics: [
          "Take AP Government, AP Spanish Language, and remaining rigorous courses — maintain full academic intensity",
          "Keep 3.95+ GPA through senior year — Ivy League schools track mid-year grades closely",
          "Complete an independent study or capstone project in finance, economics, or entrepreneurship with a Stuyvesant faculty sponsor",
          "Consider a college-level course at NYU if schedule permits",
        ],
        extracurriculars: [
          "Final DECA ICDC competition — target a top-3 national finish as the capstone of your DECA career",
          "Ensure FinLit NYC has a succession plan and trained student leaders to continue after graduation",
          "AlphaGen newsletter or podcast should have a substantial following by now — feature it prominently in applications",
          "Mentor underclassmen in DECA, Investment Club, and Model UN to build your legacy at Stuyvesant",
        ],
        testing: [
          "Submit final SAT scores to all colleges by October-November Early Decision/Early Action deadlines",
          "Complete remaining AP exams in May",
          "No additional testing needed if targets were met junior year",
        ],
        leadership: [
          "Transition leadership roles gracefully — train successors for DECA, Investment Club, and FinLit NYC",
          "Deliver a capstone event: Stuyvesant Business Summit or citywide financial literacy conference",
          "Write thank-you letters to every mentor, teacher, and professional who supported your journey",
          "Apply for national recognition: U.S. Presidential Scholars, DECA Hall of Fame, Congressional Award Gold Medal",
        ],
        summerPlan: "Attend Wharton pre-orientation programs. Connect with Wharton Finance Club, Investment Club, and Entrepreneurship Club before classes begin. Start networking with upperclassmen about Wall Street recruiting timelines. Read foundational texts for your concentration. Celebrate — you've earned admission to the best business school in the world.",
      },
    ],
  }

  const scholarships = {
    scholarships: [
      {
        name: "QuestBridge National College Match",
        organization: "QuestBridge",
        amount: "Full 4-year scholarship to partner schools (UPenn/Wharton, Harvard, Princeton, Columbia, Stanford, etc.)",
        deadline: "September of senior year",
        why: "If you qualify based on financial need, QuestBridge provides full rides to the exact schools on your list. The application also serves as excellent practice for college essays and helps you tell your story compellingly.",
        url: "https://www.questbridge.org/high-school-students/national-college-match",
      },
      {
        name: "Horatio Alger Scholarship",
        organization: "Horatio Alger Association",
        amount: "$25,000 (National Scholar) or $10,000 (State Scholar)",
        deadline: "October of senior year",
        why: "Rewards students who have overcome adversity and demonstrate financial need, academic achievement, and commitment to community service. Your immigrant family story and FinLit NYC work make you a strong candidate.",
        url: "https://scholars.horatioalger.org/",
      },
      {
        name: "NFTE (Network for Teaching Entrepreneurship) Scholarships",
        organization: "NFTE",
        amount: "Various amounts ($1,000-$10,000)",
        deadline: "Varies — typically spring",
        why: "Directly rewards young entrepreneurs. Your Investment Club founding, FinLit NYC, and MicroLend project demonstrate exactly the entrepreneurial spirit NFTE celebrates. As a past NFTE program participant, you have an inside track.",
        url: "https://www.nfte.com/",
      },
      {
        name: "Robert Toigo Foundation Fellowship/Scholarship",
        organization: "Robert Toigo Foundation",
        amount: "Varies — fellowship includes mentorship, networking, and financial support",
        deadline: "Varies (primarily for MBA students, but undergraduate pathways exist)",
        why: "The Toigo Foundation is the premier organization for diverse leaders in finance. While primarily focused on MBA students, their undergraduate pipeline programs and networking events connect talented diverse students with Wall Street firms early.",
        url: "https://toigofoundation.org/",
      },
      {
        name: "Point72 Academy Scholarship / Citadel Datathon",
        organization: "Point72 Asset Management / Citadel",
        amount: "Varies — includes mentorship, internship access, and financial awards",
        deadline: "Varies by program",
        why: "Major hedge funds and asset managers sponsor scholarship and competition programs to identify talented young finance professionals. Point72 Academy and Citadel's Datathon are pipelines to careers at the most prestigious quantitative finance firms.",
        url: "https://www.point72.com/point72-academy/",
      },
      {
        name: "DECA Scholarships (Multiple)",
        organization: "DECA Inc.",
        amount: "$500-$5,000 (multiple awards for ICDC competitors and chapter leaders)",
        deadline: "Varies — typically spring of senior year",
        why: "As DECA Chapter President and ICDC competitor, you qualify for multiple DECA-specific scholarships. These reward both competitive achievement and chapter leadership — areas where you excel.",
        url: "https://www.deca.org/high-school-programs/high-school-scholarships/",
      },
      {
        name: "National Merit Scholarship Program",
        organization: "National Merit Scholarship Corporation",
        amount: "$2,500-$10,000+ (plus university-sponsored full rides for Finalists)",
        deadline: "Automatic — based on PSAT/NMSQT score in October of junior year",
        why: "Scoring in the top 1% on the PSAT in New York (approximately 1500+ index) qualifies you as a National Merit Semifinalist. Many target and safety schools (Fordham, Rutgers, UConn) offer full-ride scholarships to National Merit Finalists, making this essentially free money for strong test performers.",
        url: "https://www.nationalmerit.org/",
      },
      {
        name: "Goldman Sachs / JP Morgan Diversity Scholarships",
        organization: "Goldman Sachs / JP Morgan Chase",
        amount: "Varies — often include tuition assistance, mentorship, and internship guarantees",
        deadline: "Varies by program cycle",
        why: "Major Wall Street firms sponsor diversity scholarship and pipeline programs. As a Chinese-American student from a public school with strong financial credentials and community impact, you fit the profile these programs seek to support.",
        url: "https://www.goldmansachs.com/careers/students/",
      },
    ],
  }

  return {
    student, formData, analysis, passionProjects, academicCourses, satActGoals, researchPubs,
    leadership, serviceCommunity, summerPrograms, sports, competitions, studentGov, internships,
    cultureArts, career, collegeRecs, mentors, wasteOfTime, gradeByGradeRoadmap, scholarships,
  }
}

function getEngineeringDemoData() {
  const student = {
    first_name: "Sofia",
    last_name: "Rodriguez",
    full_name: "Sofia Rodriguez",
    current_grade: "11th",
    parent_email: "parent.demo@thestudentblueprint.com",
  }

  const formData = {
    basicInfo: {
      firstName: "Sofia",
      lastName: "Rodriguez",
      email: "__EMAIL__",
      gradeLevel: "11th",
      schoolName: "KIPP Houston High School",
      parentEmail: "parent.demo@thestudentblueprint.com",
    },
    academicProfile: {
      gpaUnweighted: "3.97",
      gpaWeighted: "4.5",
      classRank: "Top 2%",
      coursesTaken: [
        "AP Physics C: Mechanics",
        "AP Calculus BC",
        "AP Chemistry",
        "AP Computer Science A",
        "Honors English 11",
        "AP US History",
      ],
      favoriteSubjects: ["Physics", "Mathematics", "Computer Science"],
      academicChallenges: "Balancing the most rigorous STEM course load at KIPP Houston with FIRST Robotics build season, Science Olympiad competitions, and independent research at Rice University",
    },
    testingInfo: {
      satScore: "1520 (first attempt — retaking for 1560+)",
      actScore: "",
      apScores: "AP Physics 1: 5, AP Calculus AB: 5, AP Computer Science Principles: 5",
      plannedTests: "SAT retake this spring, AP Physics C, AP Calculus BC, AP Chemistry, AP Computer Science A exams in May",
    },
    extracurriculars: {
      activities: [
        {
          name: "FIRST Robotics Competition (FRC) Team 118 — Robonauts",
          role: "Lead Programmer & Drive Team Operator",
          yearsActive: "3",
          hoursPerWeek: "15",
          description: "Lead programmer for one of the most competitive FRC teams in Texas. Design and implement autonomous navigation algorithms using Java and computer vision. Serve as drive team operator during competitions. Mentor rookie teams across the Houston district. Team consistently qualifies for World Championships.",
        },
        {
          name: "Science Olympiad",
          role: "Team Captain",
          yearsActive: "3",
          hoursPerWeek: "8",
          description: "Captain of KIPP Houston's Science Olympiad team. Compete in engineering events (Mousetrap Vehicle, Helicopter, Wind Power) and science events (Chemistry Lab, Circuit Lab). Led team to Texas state tournament. Personally placed 2nd in Mousetrap Vehicle at state.",
        },
        {
          name: "Solar-Powered Water Purifier Research Project",
          role: "Independent Researcher",
          yearsActive: "2",
          hoursPerWeek: "6",
          description: "Designed and built a solar-powered water purification system using UV-C LED technology and 3D-printed components. Won 1st place at Houston Science & Engineering Fair. Currently refining the design with a Rice University professor to improve efficiency for deployment in communities without clean water access.",
        },
        {
          name: "3D Printing & Maker Club",
          role: "Founder & President",
          yearsActive: "2",
          hoursPerWeek: "5",
          description: "Founded KIPP Houston's first maker space club. Taught 30+ students CAD design (SolidWorks, Fusion 360) and 3D printing techniques. Host weekly build sessions and monthly design challenges. Partnered with Houston Makerspace for advanced equipment access.",
        },
        {
          name: "Varsity Swimming",
          role: "Varsity Swimmer — 200m Freestyle & 4x100 Relay",
          yearsActive: "3",
          hoursPerWeek: "10",
          description: "Varsity swimmer specializing in freestyle events. Qualified for UIL Regional Championships. Swimming builds the discipline and mental toughness needed for intense engineering work. The 4x100 relay demonstrates teamwork and trust.",
        },
      ],
    },
    leadership: {
      positions: "FIRST Robotics Lead Programmer & Drive Team, Science Olympiad Team Captain, 3D Printing Club Founder & President, NASA SEES Program Alumni Ambassador",
      impactDescription: "Led FRC Team 118 programming division to develop autonomous routines that helped qualify for World Championships. Built Science Olympiad team from 8 members to 25 with systematic event preparation. Created maker space that served 30+ students with hands-on engineering skills.",
    },
    competitions: {
      competitions: "FIRST Robotics World Championships Qualifier, Science Olympiad Texas State (Mousetrap Vehicle 2nd Place), Houston Science & Engineering Fair (1st Place), NASA SEES Program Alumni",
      awards: "FIRST Robotics Dean's List Semifinalist, Science Olympiad State Medal, HoustonSEF Grand Prize, AP Scholar with Distinction, KIPP Houston STEM Excellence Award",
    },
    passions: {
      topicsYouLove: ["Mechanical Engineering", "Aerospace Engineering", "Robotics", "Sustainable Energy"],
      industriesCurious: ["Aerospace & Space Exploration", "Renewable Energy", "Robotics & Automation", "Environmental Engineering"],
      uniqueInterests: "Fascinated by Mars colonization and sustainable habitat design, builds custom drones for aerial photography, learning about water access challenges in developing countries through research project",
    },
    careerAspirations: {
      topCareers: ["Aerospace Engineer at NASA or SpaceX", "Robotics/Automation Engineer", "Renewable Energy Systems Designer", "Engineering Professor & Researcher"],
      dreamJobTitle: "Lead Engineer at NASA's Mars mission program who also develops sustainable energy technology for communities without power",
      whyThisPath: "Growing up in Houston with a petroleum engineer father at Shell and a civil engineer mother, I've been surrounded by engineering my entire life. But watching my father's industry contribute to climate change while my mother builds infrastructure that serves communities showed me that engineering can either harm or heal the planet. I want to build the sustainable energy and space exploration systems that will define humanity's future.",
    },
    researchExperience: {
      researchExperience: "Working with Dr. [Name] at Rice University's Department of Materials Science & Nanoengineering on perovskite solar cell materials for improved renewable energy efficiency. Also conducted independent research on solar-powered water purification (UV-C LED system) that won Grand Prize at Houston Science & Engineering Fair. Over 200 hours of research experience across both projects.",
      publications: "Working paper on perovskite solar cell efficiency improvements — planning to submit to Journal of Emerging Investigators. HoustonSEF Grand Prize project documentation being refined for Regeneron STS application.",
    },
    summerPrograms: {
      programs: "Completed NASA SEES (STEM Enhancement in Earth Science) program. Attended Rice University Engineering Summer Camp. Volunteered as FIRST Robotics mentor at Houston-area FRC and FTC events.",
      internships: "Research internship with Rice University professor on renewable energy materials. Shadowed engineers at NASA Johnson Space Center through family connections. Toured Shell Technology Center with father.",
    },
    specialTalents: {
      talents: ["CAD Design (SolidWorks, Fusion 360)", "Python & Java Programming", "Arduino/Raspberry Pi Prototyping", "3D Printing & Fabrication"],
      languages: "English (native), Spanish (fluent — heritage speaker), basic Portuguese",
      athleticsArts: "Varsity Swimming (200m Freestyle, Regional Qualifier), Rock Climbing Club (outdoor bouldering and gym climbing)",
    },
    personality: {
      topStrengths: ["Problem-Solving", "Hands-On Building", "Systems Thinking", "Persistence"],
      archetypes: ["Builder", "Researcher"],
      workStyle: "Thrive on hands-on challenges that require both creative design and analytical rigor. Energized by building tangible prototypes and testing them in the real world. Prefer iterative design processes where failure is data, not defeat.",
    },
    personalStories: {
      lifeChallenge: "Visiting my grandmother's village in rural Mexico, where electricity is unreliable and clean water requires a 2-mile walk, changed everything for me. Seeing how engineering could transform their lives — a solar panel, a water purifier, a simple automation system — made me realize that the most important engineering isn't about building rockets. It's about building solutions for people who need them most.",
      proudMoment: "When my solar-powered water purifier prototype actually produced clean water in testing, I cried. It was the first time something I built with my own hands solved a real problem. Now I'm working with my Rice University mentor to scale the design for actual deployment in communities without clean water access.",
      uniquePerspective: "As a Latina daughter of two engineers — one in petroleum and one in civil — I see both sides of the energy and infrastructure debate every night at dinner. My father's work powers millions of homes; my mother's work builds the roads and bridges communities depend on. I want to combine the best of both: building the infrastructure of the future powered by sustainable energy.",
    },
    timeCommitment: {
      hoursSchoolYear: "25-30",
      hoursSummer: "40-50",
      constraints: "FIRST Robotics build season (January-April) is extremely intensive — 20+ hours/week. Swimming practice daily after school during season. Rice University research requires 2-3 visits per week.",
    },
    collegePreferences: {
      dreamSchools: ["MIT", "Stanford", "Caltech", "Georgia Tech"],
      factors: ["Top mechanical/aerospace engineering program", "Strong undergraduate research opportunities", "Hands-on maker culture", "Connections to NASA and aerospace industry"],
      geography: "Open to anywhere with a world-class engineering program. Would love to stay connected to Houston's aerospace ecosystem but equally excited about MIT's maker culture or Stanford's Silicon Valley energy.",
    },
  }

  const analysis = {
    studentArchetype: "Innovative Engineer",
    archetypeScores: {
      Builder: 96,
      Analyst: 90,
      Researcher: 87,
      Visionary: 84,
      Entrepreneur: 78,
      Artist: 72,
      Advocate: 68,
      Healer: 55,
    },
    strengthsAnalysis: {
      competitiveAdvantages: [
        "Exceptionally strong engineering narrative rooted in family — both parents are engineers (petroleum and civil), providing authentic motivation and understanding of the field from childhood",
        "FIRST Robotics Lead Programmer on Team 118 (Robonauts), one of the most elite FRC teams in the country — World Championship qualifier demonstrates top-tier competitive engineering",
        "Active research with a Rice University professor on renewable energy materials — genuine university-level research experience rare for high school juniors",
        "Built a working solar-powered water purifier that won Grand Prize at Houston Science & Engineering Fair — tangible engineering product that solves a real-world problem",
        "Near-perfect GPA (3.97) in the most rigorous STEM course load available, including AP Physics C and AP Calculus BC simultaneously",
        "Founded the 3D Printing & Maker Club, teaching 30+ students CAD and fabrication — demonstrates entrepreneurial leadership alongside technical excellence",
      ],
      uniqueDifferentiators: [
        "Rare combination of competitive robotics, published-caliber research, and hands-on maker skills at the junior level — most applicants have one, she has all three",
        "Personal story of visiting grandmother's village in rural Mexico provides powerful, authentic motivation for sustainable engineering — not manufactured passion",
        "Fluent in Spanish as a heritage speaker — major asset for engineering careers with international scope, especially in sustainable development",
        "Houston location provides unique access to NASA JSC, Texas Medical Center engineering, and Shell/ExxonMobil STEM programs — she's leveraging all of them",
        "The dual-engineer family creates a compelling narrative: petroleum father (old energy) vs. civil engineer mother (infrastructure) → daughter building sustainable future",
      ],
      alignedActivities: [
        "FIRST Robotics directly validates the 'Builder' archetype — programming autonomous robots is mechanical and software engineering combined",
        "Solar water purifier project perfectly bridges engineering skill with social impact mission — exactly what MIT and Stanford admissions seek",
        "Science Olympiad engineering events (Mousetrap Vehicle, Helicopter, Wind Power) demonstrate breadth across mechanical, aerospace, and energy domains",
        "Rice University research on perovskite solar cells connects classroom physics and chemistry to cutting-edge energy research",
        "3D Printing Club founding shows entrepreneurial leadership — teaching others to build is a multiplier on your own engineering impact",
      ],
    },
    gapAnalysis: {
      missingElements: [
        "No published research paper yet — the perovskite solar cell work needs to be submitted to a journal before Regeneron STS deadline in November",
        "SAT score (1520) is below the median for MIT (1560) and Caltech (1570) — needs to improve to 1560+ on retake",
        "Limited formal internship experience at a major engineering company (NASA, SpaceX, etc.) — shadowing is good but a structured internship would be stronger",
        "No international or national-level Science Olympiad achievement yet — Texas state is strong but nationals would be a major differentiator",
      ],
      activitiesToDeepen: [
        "Push the solar water purifier project toward real-world deployment — partner with an NGO to test it in a community without clean water access",
        "Formalize the Rice University research into a paper for submission to JEI or a materials science conference",
        "Advance Science Olympiad from state to national competition — target event medals at the national invitational level",
        "Apply to Regeneron STS with the perovskite solar cell research — application due November of senior year, so preparation must begin now",
      ],
      skillsToDevelope: [
        "Machine learning and computer vision — increasingly important in robotics and aerospace engineering. Start with Python libraries (TensorFlow, OpenCV)",
        "Advanced CAD and simulation — move beyond SolidWorks to ANSYS or COMSOL for finite element analysis and thermal simulation",
        "Technical writing and research presentation — refine the ability to communicate complex engineering concepts in papers and at conferences",
        "Project management and systems engineering — learn the methodologies (Agile, V-model) used by NASA and aerospace companies to manage complex projects",
      ],
    },
    roadmap: {
      immediate: [
        "Retake SAT this spring — target 1560+ with focused prep on the reading section (math should be 790+)",
        "Submit the perovskite solar cell paper to Journal of Emerging Investigators before end of junior year",
        "Begin Regeneron STS application preparation — the November deadline of senior year requires starting the research narrative now",
        "Apply to summer internships at NASA JSC, SpaceX, and Lockheed Martin for the summer before senior year",
        "Prepare for Science Olympiad nationals — target qualification through Texas state tournament",
      ],
      shortTerm: [
        "Complete the Rice University research project with publication-ready results by end of summer",
        "Advance to Science Olympiad nationals and target event medals in engineering events",
        "Expand the solar water purifier project toward real-world testing — connect with Engineers Without Borders or similar organizations",
        "Build a stronger portfolio of engineering projects for MIT Maker Portfolio (MIT uniquely accepts maker portfolios)",
        "Begin college application essays focusing on the grandmother's village story and sustainable engineering mission",
      ],
      mediumTerm: [
        "Secure a summer internship at NASA JSC, SpaceX, or a major aerospace/energy company in Houston",
        "Submit Regeneron STS application with the strongest possible research narrative and results",
        "Present research at a regional or national engineering conference (ASME, IEEE student events)",
        "Take MIT's online MITx courses in engineering to demonstrate readiness for their curriculum",
        "Visit MIT, Stanford, Caltech, and Georgia Tech campuses and connect with admissions and engineering departments",
      ],
      longTerm: [
        "Build a compelling application narrative centered on sustainable engineering, bridging cultures, and the Builder's mission",
        "Score 1560+ on SAT and achieve National Merit recognition",
        "Have a published paper, a functional engineering product (water purifier), and documented community impact",
        "Apply Early Action to MIT with a portfolio that demonstrates genuine passion for making things",
        "Position yourself as a candidate who brings both technical brilliance and human-centered design thinking",
      ],
    },
    competitivenessScore: 89,
    collegeRecommendations: {
      reach: ["MIT", "Stanford University", "California Institute of Technology", "Georgia Institute of Technology"],
      match: ["Rice University", "UT Austin (Cockrell School of Engineering)", "Purdue University (College of Engineering)", "Virginia Tech"],
      safety: ["Texas A&M University (College of Engineering)", "University of Houston (Cullen College)", "Arizona State University (Fulton Schools)", "Colorado School of Mines"],
    },
    essayTopics: [
      "The moment clean water flowed from your solar-powered purifier — and why that drop of water meant more than any trophy or grade you've ever earned",
      "Two engineers at the dinner table: how your petroleum engineer father and civil engineer mother taught you that engineering is always a moral choice",
      "What programming a robot to navigate autonomously taught you about the difference between intelligence and wisdom — and why human judgment still matters",
      "Visiting your grandmother's village in rural Mexico and seeing the engineering problems that no Silicon Valley startup will ever try to solve",
      "From 3D-printed prototype to real-world deployment: the engineering journey of turning an idea in your head into clean water in someone's cup",
    ],
    actionPriorities: [
      {
        priority: "High",
        action: "Retake SAT and target 1560+",
        deadline: "Within 6 weeks",
        impact: "MIT's median SAT is 1560 and Caltech's is 1570. Moving from 1520 to 1560+ significantly improves competitiveness at reach schools. Focus prep on reading section — math is already strong.",
      },
      {
        priority: "High",
        action: "Submit perovskite solar cell paper to Journal of Emerging Investigators",
        deadline: "Within 8 weeks",
        impact: "A published research paper is a major differentiator for MIT, Caltech, and Stanford applications. JEI has a relatively fast review process and is specifically designed for high school researchers.",
      },
      {
        priority: "High",
        action: "Begin Regeneron STS application preparation",
        deadline: "Start immediately — deadline is November of senior year",
        impact: "Regeneron STS is the most prestigious pre-college science competition. Even Scholar designation (top 300) is a massive admissions boost. Your research at Rice is strong enough to be competitive.",
      },
      {
        priority: "Medium",
        action: "Apply to NASA JSC and SpaceX internships for summer",
        deadline: "Within 4 weeks",
        impact: "A NASA or SpaceX internship before senior year would be the crown jewel of your application. Houston location gives you a geographic advantage for NASA JSC programs.",
      },
      {
        priority: "Medium",
        action: "Build MIT Maker Portfolio",
        deadline: "Within 3 months",
        impact: "MIT is unique in accepting optional Maker Portfolios. With your solar purifier, FIRST Robotics work, 3D printing projects, and Arduino prototypes, you have exceptional material for this portfolio.",
      },
    ],
  }

  const passionProjects = [
    {
      title: "AguaPura — Deployable Solar Water Purification System",
      description: "Evolve the award-winning solar-powered water purifier from a science fair prototype into a deployable, field-tested system. Partner with Engineers Without Borders and NGOs working in rural Mexico and Central America to test the system in communities without clean water access. Design for manufacturability — use locally-sourced materials, 3D-printed components, and open-source documentation so communities can maintain and repair the system themselves.",
      timeCommitment: "10-12 hours/week for 6 months",
      skillsDeveloped: ["Product Engineering & Design for Manufacturing", "Field Testing & Iteration", "International Development", "Open-Source Hardware Design", "Grant Writing & Fundraising"],
      applicationImpact: "A working product that actually delivers clean water to people who need it is the most powerful engineering portfolio piece imaginable. MIT, Stanford, and Caltech admissions officers are looking for students who build things that matter — this is exactly that. The connection to your grandmother's village makes it deeply personal and authentic.",
      resources: "Rice University professor for technical guidance, Engineers Without Borders Houston chapter for field deployment, Houston Makerspace for fabrication, GoFundMe or DonorsChoose for funding initial field tests, open-source documentation on GitHub.",
    },
    {
      title: "RoboMentor — FIRST Robotics Mentorship Program for Title I Schools",
      description: "Create a structured mentorship program pairing experienced FRC team members (from Team 118 and other Houston teams) with students at Title I schools who want to start FIRST Robotics teams but lack resources, mentors, and funding. Provide curriculum, loaned equipment, and weekly mentoring sessions. Help 3-5 new FRC or FTC teams launch in underserved Houston neighborhoods within 2 years.",
      timeCommitment: "6-8 hours/week during school year",
      skillsDeveloped: ["Mentorship & Teaching", "Program Management", "Fundraising & Sponsorship", "Equity in STEM Education", "Community Building"],
      applicationImpact: "Demonstrates that your engineering passion isn't just about personal achievement — it's about opening doors for others. The equity angle (Title I schools lacking robotics access) resonates powerfully with MIT and Stanford's commitment to diversity and access in STEM.",
      resources: "FIRST Robotics district coordinator for Houston, Houston ISD Title I school coordinators, corporate sponsors (Shell, ExxonMobil, Lockheed Martin all have STEM education budgets), Team 118 alumni network for volunteer mentors.",
    },
    {
      title: "SkyView — Custom Drone Platform for Environmental Monitoring",
      description: "Design and build a custom drone platform equipped with sensors for environmental monitoring: air quality (PM2.5, ozone), water quality (pH, turbidity), and thermal imaging. Use the drone to map pollution patterns around Houston's industrial zones and refineries. Publish the data on an open-source platform and partner with local environmental organizations to advocate for cleaner air and water in frontline communities.",
      timeCommitment: "8-10 hours/week for 4 months",
      skillsDeveloped: ["Drone Engineering & Flight Systems", "Sensor Integration", "Environmental Data Collection", "GIS Mapping", "Environmental Advocacy"],
      applicationImpact: "Combines aerospace/mechanical engineering skills with environmental justice — a powerful intersection for Stanford and MIT applications. Building a custom drone from scratch (not just buying one) demonstrates hands-on engineering at a sophisticated level. The environmental justice angle in Houston (petrochemical corridor) adds social impact.",
      resources: "Arduino/Raspberry Pi for flight controller and sensor integration, Houston Makerspace for fabrication, Air Alliance Houston for environmental data partnerships, Rice University GIS lab for mapping support.",
    },
    {
      title: "MakerLab Diaries — Engineering YouTube Channel & Blog",
      description: "Launch a YouTube channel and companion blog documenting your engineering projects from concept to completion. Show the full design process: sketching, CAD modeling, 3D printing, testing, failing, iterating, and final product. Feature tutorials on SolidWorks, Arduino, Raspberry Pi, and 3D printing. Highlight the stories behind engineering — why you build what you build and who it's for.",
      timeCommitment: "4-5 hours/week ongoing",
      skillsDeveloped: ["Technical Communication", "Video Production", "Personal Branding", "Teaching & Curriculum Design", "Audience Building"],
      applicationImpact: "Shows that you can communicate complex engineering concepts to broad audiences — a skill MIT and Stanford value highly. A YouTube channel with real content demonstrates consistency, creativity, and willingness to share knowledge publicly. The engineering portfolio doubles as application supplementary material.",
      resources: "Camera and basic video editing (DaVinci Resolve is free), Substack or personal blog for written content, social media for distribution, Houston Makerspace for filming location.",
    },
  ]

  const academicCourses = {
    apCourses: [
      "AP Physics C: Electricity & Magnetism (12th grade — completes the full physics sequence essential for MIT and Caltech)",
      "AP Computer Science A (already taking — this validates programming skills for engineering applications)",
      "AP Chemistry (already taking — critical for materials science and chemical engineering understanding)",
      "AP Calculus BC (already taking — demonstrates the highest-level math rigor available at KIPP Houston)",
      "AP Environmental Science (12th grade — connects to sustainable energy and environmental engineering interests)",
      "AP English Literature (12th grade — demonstrates humanities breadth; strong writing is essential for research papers and fellowship applications)",
      "AP Spanish Language (12th grade — formalize heritage fluency for international engineering career)",
      "AP Statistics (if not already taken — data analysis is increasingly critical in modern engineering)",
    ],
    ibCourses: [
      "IB Physics HL (if available — goes deeper than AP and is highly regarded by international engineering programs)",
      "IB Mathematics: Analysis & Approaches HL (the most rigorous math track, exceeding AP Calculus BC in some areas)",
      "IB Design Technology (unique course directly relevant to product engineering and design thinking)",
    ],
    honorsCourses: [
      "Honors Linear Algebra or Multivariable Calculus (if offered through dual enrollment — engineering programs use these extensively in freshman year)",
      "Honors Engineering Design or Engineering Principles (hands-on engineering coursework if available)",
      "Honors English — Advanced Composition (technical writing skills are essential for engineering research and communication)",
      "Honors Spanish Literature (deepen heritage language for international engineering career)",
    ],
    electivesRecommended: [
      "Engineering Design or Introduction to Engineering (if offered at KIPP Houston — direct engineering coursework)",
      "Robotics and Automation (formalize the skills you've built through FIRST Robotics)",
      "Computer Science — Data Structures & Algorithms (if offered beyond AP CSA — critical for software engineering in robotics)",
      "Environmental Science or Sustainability Studies (supports the sustainable energy dimension of your profile)",
      "Research Methods or Independent Study (formalize your Rice University research under school credit)",
    ],
  }

  const satActGoals = {
    targetSATScore: "1560+ (retake target — current 1520 needs improvement for MIT/Caltech)",
    satSectionGoals: { reading: "760+", math: "800" },
    targetACTScore: "35+",
    actSectionGoals: { english: "34+", math: "36", reading: "35+", science: "36" },
    prepStrategy: "Your math foundation is exceptional (AP Calculus BC, AP Physics C) — target a perfect 800 math. Focus all prep time on the Evidence-Based Reading & Writing section, which is your growth area. Read challenging nonfiction daily: MIT Technology Review, Nature, Scientific American, and The Economist. Use Khan Academy for targeted practice on passage types you find most challenging. Take a full-length practice test every 2 weeks leading up to the retake.",
    timeline: "SAT Retake: Spring of 11th grade (target March or May administration). PSAT/NMSQT: Already taken — check if score qualifies for National Merit in Texas (approximately 1490+ index). AP Exams: May of 11th grade — Physics C (Mechanics), Calculus BC, Chemistry, Computer Science A. AP Exams: May of 12th grade — Physics C (E&M), Environmental Science, English Literature, Spanish Language.",
  }

  const researchPubs = {
    researchTopics: [
      "Perovskite solar cell efficiency improvements through novel material compositions — collaboration with Rice University Department of Materials Science & Nanoengineering",
      "Design optimization of solar-powered UV-C water purification systems for deployment in resource-limited communities — engineering for social impact",
      "Autonomous navigation algorithms for FIRST Robotics competition robots using computer vision and machine learning — practical applications of AI in mechanical systems",
      "Environmental monitoring using custom drone platforms: correlating air quality data with industrial proximity in Houston's petrochemical corridor",
      "Comparative analysis of 3D printing materials for functional engineering prototypes — mechanical properties, durability, and environmental impact of PLA, PETG, and ABS",
    ],
    publicationOpportunities: [
      "Journal of Emerging Investigators (JEI) — submit the perovskite solar cell paper this spring for peer-reviewed publication",
      "Regeneron Science Talent Search (apply November of senior year) — the most prestigious pre-college science competition in the US. Your Rice University research is competitive.",
      "Houston Science & Engineering Fair → Texas State → Regeneron ISEF pathway — already won Grand Prize at Houston level; advance to state and international",
      "ASME (American Society of Mechanical Engineers) student paper competitions — present engineering research at regional or national ASME student conferences",
      "IEEE student paper competitions — submit robotics or computer vision research to IEEE student events",
      "Rice University Undergraduate Research Symposium — present alongside Rice undergrads (some programs welcome exceptional high school researchers)",
    ],
    mentorshipSuggestions: [
      "Rice University Department of Materials Science & Nanoengineering — you already have an established relationship with your research mentor. Deepen this collaboration and seek introductions to other Rice faculty in mechanical and aerospace engineering.",
      "MIT Department of Mechanical Engineering — reach out to professors working on renewable energy, robotics, or space systems. MIT professors are known for responding to exceptionally motivated high school students, especially those with published research.",
      "Stanford Department of Mechanical Engineering — professors in the Stanford Product Realization Lab (PRL) and the Stanford Solar Car Project share your passion for hands-on engineering with purpose.",
      "NASA Johnson Space Center (Houston) — the JSC Pathways Intern Program and educational partnerships offer connections with engineers working on Artemis, International Space Station, and Mars mission planning. Your Houston location is a major advantage.",
    ],
    timeline: "11th Grade (Current): Submit perovskite paper to JEI, advance HoustonSEF project to Texas state fair, begin Regeneron STS application prep. Summer before 12th Grade: Intensive research at Rice, aim for publication or acceptance. 12th Grade: Submit Regeneron STS application in November, present at ISEF if qualified, feature research prominently in MIT/Stanford applications.",
  }

  const leadership = {
    clubLeadership: [
      "Continue as Lead Programmer on FRC Team 118 — aim for Dean's List Finalist (the highest individual honor in FIRST Robotics) at World Championships",
      "Continue as Science Olympiad Captain — target national qualification and event medals in engineering events",
      "Grow 3D Printing & Maker Club to 50+ members and establish it as KIPP Houston's premier engineering organization",
      "Found a Women in Engineering club at KIPP Houston — create a supportive community and networking pipeline for girls pursuing STEM careers",
    ],
    schoolWideRoles: [
      "Propose and organize an annual 'KIPP Houston Maker Fair' — showcase student engineering projects, invite industry judges from NASA, Shell, and local tech companies",
      "Serve as STEM Ambassador for KIPP Houston — represent the school at district and citywide STEM events",
      "Lead a school-wide sustainability initiative: design and build a solar charging station for student devices using skills from your research",
      "Organize STEM tutoring program pairing AP STEM students with underclassmen who need support in math and science",
    ],
    communityLeadership: [
      "Launch the RoboMentor program to help 3-5 Title I schools start FIRST Robotics teams — this is your community engineering legacy",
      "Partner with Houston Museum of Natural Science for maker workshops targeting middle school students from underserved communities",
      "Organize engineering design challenges at Houston-area Boys & Girls Clubs — introduce kids to problem-solving through hands-on building",
      "Volunteer with Habitat for Humanity Houston — apply engineering skills to actual home construction while serving low-income families",
    ],
    leadershipDevelopment: [
      "Apply for the FIRST Robotics Dean's List Award — the highest individual recognition in FRC, awarded to two students per team per year",
      "Attend the Society of Women Engineers (SWE) National Conference — network with professional engineers and attend student-focused workshops",
      "Apply for the National Center for Women & Information Technology (NCWIT) Award for Aspirations in Computing",
      "Pursue the Congressional Award program — Gold medal demonstrates sustained commitment to service, fitness, and personal development",
    ],
  }

  const serviceCommunity = {
    localOpportunities: [
      "Launch and grow RoboMentor — mentor 3-5 Title I schools in starting FIRST Robotics teams, providing curriculum, equipment loans, and weekly guidance",
      "Volunteer with Engineers Without Borders Houston chapter — participate in sustainable engineering projects in developing communities",
      "Partner with Houston Habitat for Humanity to contribute engineering skills to home construction for low-income families",
      "Organize STEM workshops at East End Houston community centers — teach basic electronics, coding, and 3D printing to middle school students from underserved neighborhoods",
      "Volunteer with Houston Food Bank to design and build automated sorting systems using robotics skills (even a simple conveyor improvement demonstrates engineering for social good)",
    ],
    nationalPrograms: [
      "Apply to the FIRST Robotics Community Impact Award — the most prestigious team award in FRC, recognizing teams that transform their communities through STEM",
      "Join the Society of Women Engineers (SWE) student section — participate in national outreach programs and engineering education initiatives",
      "Participate in National Engineers Week outreach — organize local events showcasing engineering to young students",
      "Apply for the NSBE (National Society of Black Engineers) Pre-College Initiative programs (open to all underrepresented minorities) — engineering outreach and scholarship opportunities",
    ],
    internationalService: [
      "Develop the AguaPura water purifier for real-world deployment in your grandmother's village in rural Mexico — the most personal and impactful community project possible",
      "Connect with Engineers Without Borders for international project participation — contribute engineering analysis and design work remotely",
      "Contribute to open-source engineering projects on GitHub — your water purifier and drone designs can benefit makers and engineers worldwide",
      "Partner with international FIRST Robotics teams through the FRC global community — share code, designs, and mentorship across borders",
    ],
    sustainedCommitment: [
      "Document all community engineering hours and projects in a dedicated portfolio — engineering for social good should be a visible thread throughout your applications",
      "Build sustainability plans for RoboMentor — train student mentors at each partner school to continue after you graduate",
      "Create open-source documentation for all community projects (water purifier, drone platform) so others can replicate and improve your designs",
      "Establish corporate sponsorships (Shell, ExxonMobil, Lockheed Martin) for RoboMentor and STEM outreach — create funding sustainability beyond your personal involvement",
    ],
  }

  const summerPrograms = {
    preFreshmanPrograms: [
      "NASA SEES (STEM Enhancement in Earth Science) — already completed. Leverage alumni status for continued NASA connections and mentorship",
      "Rice University School of Engineering Summer Programs — both research immersion and engineering exploration tracks available for Houston-area students",
      "MIT Launch (Entrepreneurship) or MIT MOSTEC (STEM) — competitive MIT pre-college programs that build direct connections with MIT admissions",
      "Stanford Pre-Collegiate Summer Institutes — engineering and sustainability tracks for rising seniors",
    ],
    competitivePrograms: [
      "Research Science Institute (RSI) at MIT — the most prestigious free summer research program for high school students. Apply senior year if not already accepted. RSI alumni have nearly 100% admission to MIT, Caltech, or Stanford.",
      "NASA Internship Programs (Pathways, OSSI) — paid summer internships at NASA centers including Johnson Space Center in Houston. Your location and SEES alumni status are advantages.",
      "Caltech WAVE Undergraduate Research Fellowship (primarily for undergrads, but some exceptional HS students have participated) — research at Caltech in STEM fields",
      "SpaceX or Blue Origin internships — increasingly offering high school internships and co-ops, especially for students with FIRST Robotics experience",
    ],
    researchPrograms: [
      "Continue and deepen Rice University research internship — this is your strongest existing connection and should culminate in a publishable paper",
      "MIT Lincoln Laboratory Beaver Works Summer Institute — hands-on engineering program focused on autonomous systems, cybersecurity, or medical devices",
      "Stanford Undergraduate Research Institute (SURI) — apply for research assistant positions in mechanical or energy engineering labs",
      "Argonne National Laboratory Science Undergraduate Laboratory Internship (SULI) — DOE-funded research at a national lab (some programs accept rising college freshmen who are still in HS)",
    ],
    enrichmentPrograms: [
      "FIRST Robotics competition mentoring — spend the summer mentoring younger teams and preparing for the next FRC season",
      "Girls Who Code or Code.org advanced programs — strengthen software engineering skills applicable to robotics and AI",
      "National Youth Science Camp (NYSC) — week-long immersive science program for two students per state, focusing on hands-on research and outdoor exploration",
      "Engineering Discovery Days at Texas A&M, UT Austin, or Georgia Tech — explore specific engineering disciplines through hands-on workshops",
    ],
  }

  const sports = {
    varsitySports: [
      "Continue Varsity Swimming at KIPP Houston — target UIL State Championship qualification in 200m Freestyle",
      "Swimming demonstrates the individual discipline, goal-setting, and pain tolerance that engineering programs respect — training is relentless and measurable",
      "Aim for team captain by senior year — leadership in athletics complements technical leadership in robotics and Science Olympiad",
      "The swimmer-engineer combination is a unique narrative: both require precision, efficiency, and the willingness to push through discomfort for marginal improvement",
    ],
    clubSports: [
      "Continue Rock Climbing Club — bouldering and outdoor climbing build problem-solving skills, risk assessment, and physical strength",
      "Rock climbing is an increasingly popular activity in engineering circles (MIT, Stanford, and Caltech all have active climbing communities) — it's a natural connection point for campus life",
      "Consider joining a recreational cycling or running group — cross-training supports swimming performance and reduces injury risk",
      "Participate in adventure races or obstacle course events — the engineer-athlete combination creates a compelling application narrative",
    ],
    recruitingStrategy: [
      "Swimming is unlikely to be a primary recruiting tool for MIT or Caltech, but demonstrating varsity-level athletics while maintaining a near-4.0 GPA and 15+ hours/week in robotics is genuinely extraordinary",
      "Highlight the time management discipline required to balance swimming, FIRST Robotics build season, Science Olympiad, and Rice University research — this is an elite-level juggling act",
      "Research club and intramural swimming at target schools — continuing athletics in college supports the 'well-rounded engineer' narrative",
      "If state qualifying times are achieved, explore whether any target schools would value your athletic contribution to their swim team",
    ],
    fitnessLeadership: [
      "Organize a 'Swim for STEM' charity event benefiting RoboMentor — combine athletics with your engineering outreach mission",
      "Start a fitness-for-STEM-students initiative at KIPP Houston — promote physical activity as essential for cognitive performance during intense STEM coursework",
      "Lead a rock climbing skills workshop for FIRST Robotics team — team building through physical challenge strengthens collaboration",
      "Write about the parallels between swimming training and engineering iteration — both require relentless refinement of technique for marginal gains",
    ],
  }

  const competitions = {
    academicCompetitions: [
      "FIRST Robotics Competition — continue as Lead Programmer on Team 118, target Dean's List Finalist and World Championship medal. FRC is the most respected engineering competition for college admissions.",
      "Science Olympiad — advance to nationals in engineering events (Mousetrap Vehicle, Wind Power, Helicopter). Target event medals at the national level.",
      "Regeneron Science Talent Search — submit the perovskite solar cell research. STS Scholar designation (top 300) or Finalist (top 40) is a massive admissions differentiator.",
      "Regeneron ISEF — advance through HoustonSEF and Texas State to the International Science & Engineering Fair. ISEF is the Olympics of pre-college science.",
      "Physics Olympiad (USAPhO) — take the F=ma exam and target semifinalist status. For MIT and Caltech, physics olympiad performance is highly valued.",
    ],
    businessCompetitions: [
      "Conrad Challenge — Innovation in Energy & Environment category. Submit the AguaPura water purifier or SkyView drone platform concept.",
      "Diamond Challenge — present the RoboMentor program or AguaPura as a social venture with engineering at its core",
      "MIT Solve — global challenge competition for social entrepreneurs. Student teams can submit solutions in categories like Clean Energy and Water & Sanitation.",
      "Samsung Solve for Tomorrow — STEM-focused competition where teams apply STEM to solve community issues. Perfect for the water purifier or environmental monitoring drone.",
    ],
    artsCompetitions: [
      "Scholastic Art & Writing Awards — submit a personal essay or science writing piece about engineering, sustainability, or the grandmother's village story",
      "NCTE (National Council of Teachers of English) Achievement Awards in Writing — demonstrate strong communication skills alongside STEM excellence",
      "Create a technical illustration or engineering visualization portfolio — enter digital art competitions showcasing engineering design aesthetics",
    ],
    debateSpeech: [
      "Consider Original Oratory competition — deliver a speech about the moral imperative of sustainable engineering or the STEM education gap in underserved communities",
      "Present at TEDxYouth Houston — a TED talk about your solar water purifier journey or the future of sustainable engineering would be powerful for applications and personal branding",
      "Participate in STEM-focused pitch competitions — present engineering solutions to panels of professionals and investors",
      "Science communication competitions — some universities and organizations host events where students explain complex STEM concepts to general audiences",
    ],
  }

  const studentGov = {
    schoolGovernment: [
      "Run for Student Government STEM Chair or Technology Committee Lead — advocate for more engineering resources, maker space expansion, and STEM curriculum improvements at KIPP Houston",
      "Propose a school sustainability initiative through Student Government: solar panels for the school, recycling program redesign, or energy audit project",
      "Target Senior Class President or Student Body Vice President — demonstrate school-wide leadership beyond STEM organizations",
      "Lead a school-wide initiative: organize a 'KIPP Innovation Fair' showcasing student projects from all disciplines, with industry judges and community attendance",
    ],
    districtStateRoles: [
      "Apply for the Texas STEM Coalition student advisory board — advocate for increased STEM education funding and resources in Texas public schools",
      "Attend Houston ISD board meetings to advocate for engineering and maker education curriculum — bring data from your 3D Printing Club and RoboMentor program",
      "Apply for the Governor's Honors Program or Texas Governor's Mansion student fellowship — represent KIPP Houston in statewide student leadership",
      "Connect with Texas state legislators on STEM education policy — your RoboMentor data showing the impact of robotics access on Title I schools provides compelling testimony",
    ],
    youthGovernment: [
      "Participate in YMCA Youth & Government program — write and debate bills on STEM education funding, sustainable energy policy, and environmental justice",
      "Apply for the Congressional Award program — Gold medal demonstrates sustained excellence across community service, personal development, fitness, and exploration",
      "Consider the United States Senate Youth Program (USSYP) — two students per state selected for a week in D.C. with a $10,000 scholarship",
      "Attend engineering-specific policy events: National Science Foundation public sessions, DOE clean energy forums, or NASA public engagement events in Houston",
    ],
    advocacyRoles: [
      "Write op-eds for the Houston Chronicle or Texas Tribune on STEM education equity, sustainable engineering, or the importance of maker education in public schools",
      "Advocate for mandatory engineering or computer science education in Texas public high schools — bring evidence from KIPP Houston's programs",
      "Organize student testimony at Houston ISD board meetings about the transformative impact of FIRST Robotics and maker education on student outcomes",
      "Create a student coalition advocating for clean energy transition in Houston — the engineering center of the oil industry is the most powerful place for this advocacy",
    ],
  }

  const internships = {
    industryInternships: [
      "NASA Johnson Space Center (Houston) — Pathways Intern Program or OSSI summer internship. Your SEES alumni status, FIRST Robotics experience, and Houston location make you a strong candidate for robotics, mission operations, or aerospace engineering positions.",
      "SpaceX — increasingly offering internships to high school seniors and rising college freshmen, especially those with FIRST Robotics and programming experience. The Boca Chica (Starbase) facility is in Texas.",
      "Lockheed Martin Space (Houston) — engineering internships in spacecraft systems, mission planning, and satellite technology. Lockheed is one of NASA's primary contractors and has a strong Houston presence.",
      "Shell Technology Center (Houston) — explore the intersection of traditional energy and renewable technology. Your father's Shell connection provides an inside track for learning about energy transition engineering.",
    ],
    researchInternships: [
      "Rice University Department of Materials Science & Nanoengineering — continue and deepen your existing research relationship on perovskite solar cells",
      "UT Austin Cockrell School of Engineering — summer research programs in mechanical, aerospace, and energy engineering for outstanding high school students",
      "Texas A&M Engineering Extension Service (TEEX) — hands-on engineering training programs including robotics, energy, and infrastructure",
      "Argonne National Laboratory or Sandia National Laboratories — DOE-funded research internships in renewable energy, materials science, and advanced manufacturing",
    ],
    nonprofitInternships: [
      "Engineers Without Borders USA (Houston chapter) — participate in sustainable engineering projects designed for developing communities. Your water purifier experience is directly relevant.",
      "Houston Museum of Natural Science — intern with the education department designing STEM exhibits and programs for youth",
      "FIRST Robotics (Houston district) — intern or volunteer coordinator position helping organize FRC and FTC events across the Houston district",
      "Environmental Defense Fund (EDF) Houston office — intern on clean energy and environmental engineering advocacy projects in the energy capital of the world",
    ],
    virtualOpportunities: [
      "MIT OpenCourseWare — take 2.001 (Mechanics & Materials), 6.001 (Introduction to Computer Science), or 2.670 (Mechanical Engineering Tools) to preview MIT's engineering curriculum",
      "Coursera/edX: Take Stanford's Introduction to Robotics, MIT's Circuits and Electronics, or Caltech's The Science of the Solar System",
      "Contribute to open-source engineering projects on GitHub — share your water purifier designs, drone code, and FIRST Robotics algorithms with the global maker community",
      "Virtual internships through STEM programs: NASA STEM Gateway, Oak Ridge Institute for Science and Education (ORISE), or Department of Energy virtual research experiences",
    ],
  }

  const cultureArts = {
    performingArts: [
      "Use engineering skills to support KIPP Houston's performing arts — design and build stage lighting systems, sound equipment, or special effects for school theater productions",
      "Create kinetic art installations that combine engineering and artistic expression — moving sculptures, interactive light displays, or sound-reactive installations",
      "Perform at community events — give technical presentations and demonstrations at Houston Maker Faire and Science Festival events",
      "Explore the art of technical communication — presenting complex engineering concepts to non-technical audiences is itself a performing art",
    ],
    visualArts: [
      "Create professional-quality engineering visualizations — CAD renderings, technical illustrations, and 3D-printed artistic pieces that showcase the beauty of engineering design",
      "Enter design competitions (Core77, IDSA student awards) with product designs that combine engineering function with aesthetic beauty",
      "Build a visual portfolio of engineering projects — professional photography and documentation of your water purifier, drone, and robotics work",
      "Explore generative art using code — Python and Processing can create beautiful algorithmic artwork that bridges your STEM skills with creative expression",
    ],
    creativeWriting: [
      "Write the MakerLab Diaries blog documenting your engineering journey — from concept sketches to working prototypes",
      "Submit personal essays about engineering experiences to Scholastic Writing Awards or teen STEM publications",
      "Write a science column for KIPP Houston's school newspaper covering engineering breakthroughs, sustainability, and student maker projects",
      "Draft op-eds on sustainable engineering, STEM education equity, and the future of energy for Houston publications",
    ],
    culturalClubs: [
      "Join or help lead KIPP Houston's Latino Student Association — celebrate Hispanic Heritage Month, connect with Houston's vibrant Latino engineering community",
      "Participate in the Society of Hispanic Professional Engineers (SHPE) student chapter — network with Latino/a engineers at NASA, Shell, and Houston companies",
      "Attend Houston's Latino cultural events — Fiestas Patrias, Cinco de Mayo celebrations — and organize engineering/STEM activity booths to combine cultural pride with STEM outreach",
      "Explore the intersection of Latin American culture and engineering — from Aztec and Mayan architectural engineering to modern Mexican space program (AEM) and Latin American renewable energy innovations",
    ],
  }

  const career = {
    jobTitles: [
      "Lead Aerospace Engineer at NASA's Mars Mission Program (Jet Propulsion Laboratory or Johnson Space Center)",
      "Senior Robotics Engineer at SpaceX, Boston Dynamics, or a cutting-edge robotics company",
      "Renewable Energy Systems Designer at a top engineering firm or national laboratory",
      "Engineering Professor & Researcher at MIT, Stanford, or Caltech",
      "Founder of a Sustainable Technology Startup building clean energy and water solutions for developing communities",
    ],
    blueOceanIndustries: [
      { industry: "In-Space Manufacturing & Asteroid Mining", why: "The next frontier of engineering. As space becomes more accessible, engineers who can design manufacturing systems for microgravity environments will be in extraordinary demand. Your robotics and mechanical engineering skills position you perfectly for this emerging field." },
      { industry: "Advanced Nuclear & Fusion Energy", why: "Nuclear fusion is moving from theoretical to practical, with companies like Commonwealth Fusion Systems (MIT spinoff) and TAE Technologies raising billions. Your renewable energy research background and physics knowledge make you a natural fit for this transformational energy technology." },
      { industry: "Sustainable Urban Infrastructure & Smart Cities", why: "By 2050, 70% of the world's population will live in cities. Engineers who can design sustainable water, energy, transportation, and building systems for megacities will shape how billions of people live. Your water purifier work and civil engineer mother's influence position you at this intersection." },
      { industry: "Bio-Inspired Robotics & Soft Robotics", why: "The next generation of robots won't be rigid metal machines — they'll be soft, adaptable, and inspired by biological organisms. Your FIRST Robotics experience gives you a strong foundation, and this emerging field combines mechanical engineering, materials science, and biology in fascinating ways." },
    ],
    salaryPotential: "Engineers earn $75K-$150K starting salary depending on field and company. Aerospace engineers at NASA start at $70K-$90K (GS scale) but advance to $150K+ with seniority. SpaceX and tech company engineers earn $120K-$200K+ with equity. Engineering professors at top universities earn $120K-$250K plus research grants that can total millions. Startup founders in clean energy and robotics have uncapped potential — successful clean energy companies have created billionaires (Tesla, Enphase, First Solar). The engineering path offers excellent compensation with the added satisfaction of building tangible things that improve human life.",
    linkedInBioHeadline: "Aspiring Aerospace & Sustainable Energy Engineer | FIRST Robotics Lead Programmer | Rice University Researcher | Building a future where engineering serves both humanity and the planet",
  }

  const collegeRecs = {
    collegeBreakdown: {
      reach: ["Massachusetts Institute of Technology", "Stanford University", "California Institute of Technology", "Georgia Institute of Technology"],
      target: ["Rice University", "UT Austin (Cockrell School of Engineering)", "Purdue University (College of Engineering)", "Virginia Tech"],
      safety: ["Texas A&M University (College of Engineering)", "University of Houston (Cullen College of Engineering)", "Arizona State University (Fulton Schools of Engineering)", "Colorado School of Mines"],
    },
    schoolMatches: [
      { schoolName: "Massachusetts Institute of Technology (MIT)", matchScore: 96, why: "MIT is the ultimate school for a builder. The hands-on culture (MIT Maker Workshops, D-Lab, Media Lab), undergraduate research opportunities, and the famous 'mens et manus' (mind and hand) philosophy perfectly match your engineering ethos. MIT accepts a Maker Portfolio — your water purifier, robotics work, and 3D printing projects are ideal material. MIT's Department of Mechanical Engineering is #1 in the world, and the proximity to Boston's clean energy ecosystem adds career value." },
      { schoolName: "Stanford University", matchScore: 93, why: "Stanford's Product Realization Lab (PRL) and d.school (design thinking) match your hands-on, human-centered approach to engineering. The proximity to Silicon Valley provides unparalleled access to clean energy startups, robotics companies, and venture capital. Stanford's TomKat Center for Sustainable Energy aligns perfectly with your renewable energy research. The Stanford Solar Car Project would love your engineering skills." },
      { schoolName: "California Institute of Technology (Caltech)", matchScore: 90, why: "Caltech is the most research-intensive undergraduate experience in the world — every student conducts original research, and the 3:1 student-to-faculty ratio means personalized mentorship from world-class engineers. NASA's Jet Propulsion Laboratory (JPL) is managed by Caltech and located on the adjacent campus — your aerospace interests would have direct access to Mars mission engineers." },
      { schoolName: "Rice University", matchScore: 94, why: "Rice is your home-field advantage. You already have an established research relationship with a Rice professor, and the campus is minutes from your home. Rice's George R. Brown School of Engineering is ranked among the best in the country, and the small class sizes (undergraduate focus) mean exceptional mentorship. Houston's aerospace ecosystem (NASA JSC, Boeing, Lockheed Martin) is unmatched." },
      { schoolName: "Georgia Institute of Technology", matchScore: 91, why: "Georgia Tech's College of Engineering is top-5 nationally with exceptional strength in mechanical engineering, aerospace, and robotics. The culture is intensely hands-on and collaborative. Georgia Tech's proximity to Atlanta's growing tech scene and its strong cooperative education (co-op) program provide extensive industry experience during college. Strong value proposition with lower tuition than private peers." },
      { schoolName: "UT Austin (Cockrell School)", matchScore: 89, why: "UT's Cockrell School is the top engineering school in Texas, with exceptional programs in mechanical, aerospace, and energy engineering. The Texas location keeps you connected to NASA JSC and the Houston energy ecosystem. UT's undergraduate research programs and the Longhorn Maker Studios provide the hands-on experience you thrive on. In-state tuition makes it an exceptional value." },
    ],
  }

  const mentors = {
    mentors: [
      {
        name: "Your Rice University Research Mentor",
        university: "Rice University",
        department: "Department of Materials Science & Nanoengineering — Professor specializing in perovskite solar cell research",
        why: "You already have the most important mentor relationship an engineering applicant can have — a university professor who knows your research abilities firsthand. This mentor can write you the strongest possible recommendation letter. Continue deepening this relationship and seek their guidance on Regeneron STS, graduate school pathways, and career direction.",
        coldEmailTemplate: "N/A — relationship already established. Continue weekly research meetings, ask for feedback on your paper draft, and request a recommendation letter by September of senior year.",
      },
      {
        name: "Dr. Ayanna Howard",
        university: "Ohio State University (previously Georgia Tech)",
        department: "College of Engineering — Dean and Professor of Electrical and Computer Engineering, robotics and AI researcher",
        why: "One of the most prominent robotics researchers in the country and a passionate advocate for diversity in engineering. Her work on human-robot interaction and assistive robotics aligns with your vision of engineering for social good. As a Latina woman in engineering leadership, she can provide perspective on navigating the field as an underrepresented minority.",
        coldEmailTemplate: "Subject: FIRST Robotics Lead Programmer and Aspiring Aerospace Engineer — Seeking Mentorship\n\nDear Dean Howard,\n\nMy name is Sofia Rodriguez, and I am a junior at KIPP Houston High School. As Lead Programmer for FRC Team 118 (the Robonauts) and an aspiring aerospace engineer, your career in robotics and your advocacy for diversity in engineering deeply inspire me.\n\nI am currently conducting research on perovskite solar cells at Rice University and have built a solar-powered water purifier that won Grand Prize at the Houston Science & Engineering Fair. I'm also passionate about expanding STEM access — I founded my school's 3D Printing Club and am launching a robotics mentorship program for Title I schools.\n\nYour perspective on building a career in robotics while opening doors for underrepresented students would be invaluable to me. I would be grateful for any guidance you might offer.\n\nWith admiration,\nSofia Rodriguez\nKIPP Houston High School, Class of 2027\nFRC Team 118 Lead Programmer",
      },
      {
        name: "Dr. Marcia McNutt",
        university: "National Academy of Sciences (former Director of USGS and Editor-in-Chief of Science)",
        department: "President of the National Academy of Sciences — geophysicist and science policy leader",
        why: "The most powerful scientist in America as President of the National Academy of Sciences. Her career path from geophysics researcher to science policy leader demonstrates how engineering and science skills can translate to global impact. Her advocacy for women in STEM and science-informed policy aligns with your values.",
      },
      {
        name: "NASA Johnson Space Center Engineers",
        university: "NASA Johnson Space Center — Houston, TX",
        department: "Robotics & Autonomous Systems Division / Exploration Mission Planning",
        why: "NASA JSC is in your backyard. The engineers working on Artemis, the International Space Station, and Mars mission planning are among the best in aerospace. Your SEES alumni status gives you a warm connection. Reach out to the JSC educational partnerships office or attend public NASA events in Houston to build relationships with engineers who can mentor you and potentially offer internship opportunities.",
      },
    ],
  }

  const wasteOfTime = {
    activities: [
      { activity: "Joining STEM clubs without hands-on building", whyQuit: "Being a passive member of a science club that only holds meetings and discussions doesn't strengthen your engineering profile. Every activity should involve actually building, coding, or designing something. If a club doesn't produce tangible output, redirect that time to FIRST Robotics, your research, or passion projects." },
      { activity: "Excessive SAT prep beyond the 1560 target", whyQuit: "Once you hit 1560+, additional SAT points have negligible impact on MIT/Caltech admissions. These schools care far more about your Maker Portfolio, research, and FIRST Robotics achievements than the difference between 1560 and 1600. Redirect excessive test prep time to your perovskite paper or Regeneron STS application." },
      { activity: "Taking easy AP courses for the GPA boost", whyQuit: "AP Human Geography or AP Psychology won't impress MIT or Caltech engineering admissions. Take the hardest STEM courses available: AP Physics C (E&M), multivariable calculus (dual enrollment), and any engineering electives. Engineering schools want to see quantitative rigor, not AP count." },
      { activity: "Social media 'inspiration' without building", whyQuit: "Watching engineering YouTube videos and following NASA on Instagram feels productive but doesn't build your skills or portfolio. Set strict time limits on passive consumption and redirect that energy to actually building prototypes, writing code, or drafting your research paper. Makers make — they don't just watch." },
      { activity: "Overcommitting to too many competitions simultaneously", whyQuit: "FIRST Robotics, Science Olympiad, ISEF, Regeneron STS, USAPhO, and every other STEM competition is too many. Pick your top 3 (FRC, Regeneron STS, and Science Olympiad) and compete at the highest possible level in those. Depth beats breadth in engineering admissions — a FRC Dean's List Finalist and Regeneron STS Scholar is worth more than mediocre results in 8 competitions." },
    ],
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "11th Grade — Junior (Current)",
      focus: "Peak performance year: publish research, advance in competitions, nail standardized tests, and build the MIT/Stanford application narrative",
      academics: [
        "Excel in AP Physics C (Mechanics), AP Calculus BC, AP Chemistry, and AP Computer Science A — these are the four pillars of your engineering profile",
        "Target 5s on all four AP exams — these validate your STEM intensity for top engineering schools",
        "Maintain 3.97+ GPA — junior year grades are the most scrutinized by MIT, Stanford, and Caltech admissions",
        "Consider dual enrollment in multivariable calculus or linear algebra at Rice, U of H, or HCC if available — engineering programs use these heavily in freshman year",
      ],
      extracurriculars: [
        "Submit perovskite solar cell paper to Journal of Emerging Investigators before summer — publication is the #1 priority",
        "Lead FRC Team 118 to World Championship qualification and compete for Dean's List Finalist",
        "Advance Science Olympiad to Texas state and target national qualification",
        "Expand 3D Printing Club and launch RoboMentor pilot at 2 Title I schools",
        "Continue swimming — aim for UIL Regional qualification and team captain nomination",
      ],
      testing: [
        "Retake SAT in March or May — target 1560+ (800 Math, 760+ EBRW)",
        "Take AP Physics C (Mechanics), AP Calculus BC, AP Chemistry, AP Computer Science A exams in May",
        "Check PSAT/NMSQT score for National Merit Semifinalist status in Texas",
      ],
      leadership: [
        "Lead FRC Team 118's programming division with documented autonomous navigation improvements",
        "Continue as Science Olympiad Captain with clear team preparation strategy and event assignments",
        "Begin Regeneron STS application prep — application due November of senior year, but the research narrative must be built now",
        "Request recommendation letters from AP Physics teacher, Rice research mentor, and FRC team advisor",
      ],
      summerPlan: "Top choice: NASA JSC Pathways Internship or SpaceX internship. Second choice: Intensive Rice University research to finalize paper and begin Regeneron STS preparation. Simultaneously: Launch AguaPura field testing with Engineers Without Borders, expand RoboMentor to 3+ schools, build MIT Maker Portfolio. Begin college application essays in July — Common App personal statement (grandmother's village story) and school-specific supplements.",
    },
    nextYears: [
      {
        grade: "12th Grade — Senior",
        focus: "Execute applications, compete at the highest level one final time, and leave a lasting engineering legacy at KIPP Houston",
        academics: [
          "Take AP Physics C: E&M, AP Environmental Science, AP English Literature, AP Spanish Language — maintain full academic rigor through senior year",
          "Maintain 3.97+ GPA — MIT, Stanford, and Caltech track mid-year and final grades closely",
          "Complete an independent engineering capstone project — design and build something that synthesizes your skills (solar-powered autonomous system, for example)",
          "Consider dual enrollment in a college-level engineering course at Rice or U of H to demonstrate readiness for university-level work",
        ],
        extracurriculars: [
          "Submit Regeneron STS application in November — this is the capstone of your research career",
          "Final FRC season — compete for World Championship and Dean's List Finalist one last time",
          "Final Science Olympiad season — target nationals and event medals",
          "Ensure RoboMentor, 3D Printing Club, and all organizations have trained successors and sustainability plans",
          "AguaPura water purifier should be in field testing or deployed — document results for applications",
        ],
        testing: [
          "Submit final SAT scores to all colleges by October-November Early Action deadlines",
          "Complete AP Physics C: E&M, AP Environmental Science, AP English Literature, AP Spanish Language exams in May",
          "No additional standardized testing needed if 1560+ target was met",
        ],
        leadership: [
          "Transition all leadership roles gracefully — train successors for FRC programming, Science Olympiad captaincy, and 3D Printing Club presidency",
          "Deliver a capstone event: KIPP Houston Engineering Showcase or Community Maker Fair",
          "Write thank-you letters to every mentor, teacher, and community partner — especially your Rice University research professor",
          "Apply for U.S. Presidential Scholars, FIRST Robotics Dean's List, and SWE/SHPE national awards",
        ],
        summerPlan: "Attend MIT or Stanford pre-orientation engineering programs. Connect with your department, research labs, and maker spaces before classes begin. If attending MIT, explore UROP (Undergraduate Research Opportunities Program) options immediately. Continue AguaPura development as a lifelong project. Rest and celebrate — you've built something extraordinary.",
      },
    ],
  }

  const scholarships = {
    scholarships: [
      {
        name: "Society of Women Engineers (SWE) Scholarships",
        organization: "Society of Women Engineers",
        amount: "$1,000-$15,000 (multiple awards for incoming freshmen and current engineering students)",
        deadline: "Varies — typically February-May",
        why: "SWE is the largest organization for women in engineering, and their scholarship program is one of the most generous. As a Latina woman in mechanical/aerospace engineering with strong research and leadership credentials, you're an ideal candidate. SWE scholarships also provide networking and mentorship beyond the financial award.",
        url: "https://scholarships.swe.org/",
      },
      {
        name: "NSBE (National Society of Black Engineers) / SHPE (Society of Hispanic Professional Engineers) Scholarships",
        organization: "NSBE / SHPE",
        amount: "$1,000-$10,000 (multiple awards)",
        deadline: "Varies by chapter and national program",
        why: "SHPE specifically supports Hispanic/Latino engineering students, and their national conference scholarship program is substantial. Your research background, FIRST Robotics leadership, and community outreach (RoboMentor) make you a strong candidate. SHPE membership also provides invaluable professional networking throughout your career.",
        url: "https://www.shpe.org/students/scholarships",
      },
      {
        name: "Regeneron Science Talent Search Scholar/Finalist",
        organization: "Society for Science & the Public / Regeneron",
        amount: "$25,000 (Scholar), up to $250,000 (Top 10 Finalist)",
        deadline: "November of senior year",
        why: "The most prestigious pre-college science competition in the US. Your perovskite solar cell research with a Rice University mentor is competitive for at minimum Scholar designation. STS recognition is one of the most powerful credentials for MIT, Caltech, and Stanford admissions — and comes with significant financial awards.",
        url: "https://www.societyforscience.org/regeneron-sts/",
      },
      {
        name: "Lockheed Martin STEM Scholarship Program",
        organization: "Lockheed Martin Corporation",
        amount: "$10,000/year (renewable for 4 years = $40,000 total)",
        deadline: "Varies — typically January-March",
        why: "Lockheed Martin is one of NASA's primary contractors and a major Houston employer. Their STEM scholarship specifically supports students pursuing engineering, with preference for underrepresented groups. Your aerospace interest, FIRST Robotics experience, and Houston location make this a natural fit. Winners also receive mentorship from Lockheed Martin engineers.",
        url: "https://www.lockheedmartin.com/en-us/who-we-are/communities/stem-education.html",
      },
      {
        name: "QuestBridge National College Match",
        organization: "QuestBridge",
        amount: "Full 4-year scholarship to partner schools (MIT, Stanford, Caltech, Rice, etc.)",
        deadline: "September of senior year",
        why: "If you qualify based on financial need, QuestBridge provides full rides to the exact engineering powerhouses on your list. MIT, Stanford, Caltech, and Rice are all QuestBridge partners. The application also serves as excellent practice for telling your engineering story.",
        url: "https://www.questbridge.org/high-school-students/national-college-match",
      },
      {
        name: "FIRST Robotics Scholarships (Multiple)",
        organization: "FIRST / Various corporate sponsors",
        amount: "$500-$40,000+ (hundreds of scholarships for FRC participants)",
        deadline: "Varies by scholarship — many are awarded at World Championships",
        why: "FIRST distributes over $80 million in scholarships annually through its corporate sponsor network. As a Lead Programmer and potential Dean's List Finalist on an elite team, you qualify for many of these awards. Some are specific to programming roles, women in engineering, or specific universities.",
        url: "https://www.firstinspires.org/alumni/scholarships",
      },
      {
        name: "National Merit Scholarship Program",
        organization: "National Merit Scholarship Corporation",
        amount: "$2,500-$10,000+ (plus university-sponsored full rides for Finalists)",
        deadline: "Automatic — based on PSAT/NMSQT score in October of junior year",
        why: "Scoring in the top 1% on the PSAT in Texas (approximately 1490+ index) qualifies you as a National Merit Semifinalist. Many safety and target schools (Texas A&M, University of Houston, Arizona State) offer full-ride scholarships to National Merit Finalists.",
        url: "https://www.nationalmerit.org/",
      },
      {
        name: "Dell Scholars Program",
        organization: "Michael & Susan Dell Foundation",
        amount: "$20,000 scholarship + laptop + textbook credits",
        deadline: "December of senior year",
        why: "Dell Scholars specifically supports students who have overcome obstacles and demonstrate grit, determination, and community involvement. As a KIPP student with strong STEM credentials and community impact through RoboMentor, you fit the profile. The program also provides ongoing support through college completion.",
        url: "https://www.dellscholars.org/",
      },
    ],
  }

  return {
    student, formData, analysis, passionProjects, academicCourses, satActGoals, researchPubs,
    leadership, serviceCommunity, summerPrograms, sports, competitions, studentGov, internships,
    cultureArts, career, collegeRecs, mentors, wasteOfTime, gradeByGradeRoadmap, scholarships,
  }
}

/**
 * Elementary demo: Sarah Chen, 3rd grade. Showcases the K-5 parent-facing
 * report with the new sections (parent-guide tab, enrichment recommendations,
 * talent-search eligibility). Most HS-only fields are intentionally empty
 * since the elementary results page only renders archetype + parent-guide +
 * activities tabs.
 */
function getElementaryDemoData() {
  const student = {
    first_name: "Sarah",
    last_name: "Chen",
    full_name: "Sarah Chen",
    current_grade: "3rd Grade",
    parent_email: "parent.demo@thestudentblueprint.com",
  }

  const formData = {
    basicInfo: {
      firstName: "Sarah",
      lastName: "Chen",
      email: "__EMAIL__",
      studentType: "elementary",
      currentGrade: "3rd Grade",
      gradeLevel: "3rd Grade",
      schoolName: "Lincoln Elementary",
      parentName: "Wei Chen",
      parentEmail: "parent.demo@thestudentblueprint.com",
    },
    academicProfile: {
      favoriteSubjects: ["Math", "Reading", "Science"],
      academicAwards: "Reading Star of the Month (Sept), 1st place school spelling bee.",
    },
    extracurriculars: {
      activities: [
        { name: "School Soccer Team", role: "Player", yearsActive: "2", hoursPerWeek: "3", description: "Plays weekly during the fall season; loves being on a team." },
        { name: "Library Reading Club", role: "Member", yearsActive: "1", hoursPerWeek: "1", description: "Saturday morning program at the public library; reads above grade level." },
        { name: "Lego Robotics (after-school)", role: "Builder", yearsActive: "1", hoursPerWeek: "2", description: "Builds with WeDo kits; learning simple block-based programming." },
        { name: "Beginner Piano (private lessons)", role: "Student", yearsActive: "1", hoursPerWeek: "2", description: "Weekly 30-min lessons plus 15-min daily practice." },
      ],
    },
    passions: {
      topicsYouLove: ["building things", "animals", "space"],
      industriesCurious: [],
      hobbiesSkills: "Loves chapter books, building Lego sets above her age range, asking 'why' questions, drawing maps.",
    },
    careerAspirations: {
      career1: "Veterinarian",
      career2: "Engineer who builds robots",
      dreamJobTitle: "Someone who helps animals using cool technology",
    },
    specialTalents: {
      musicalInstruments: "Piano (1 year, beginner level)",
      visualArts: "Drawing maps and animals",
      athletics: "Soccer (defender on school team)",
    },
    familyContext: {
      familyProfessions: "Mother: software engineer; Father: pediatrician.",
    },
    personality: {
      topStrengths: ["Curious", "Patient", "Kind"],
      archetypes: ["Builder", "Researcher"],
      introvertExtrovert: "Ambivert",
    },
  }

  const analysis = {
    studentArchetype: "Curious Builder",
    archetypeScores: { Visionary: 62, Builder: 88, Healer: 70, Analyst: 78, Artist: 55, Advocate: 50, Entrepreneur: 48, Researcher: 80 },
    competitivenessScore: 78,
    strengthsAnalysis: {
      competitiveAdvantages: [
        "Reads chapter books well above 3rd-grade level — sustained attention is a real strength.",
        "Builds complex Lego sets (8+ rated) without losing patience, finishing what she starts.",
        "Asks 'why' and 'what if' questions across many topics — natural intellectual curiosity.",
        "Comfortable in both team settings (soccer) and solo focused work (reading, building) — flexible learner.",
        "Already exposed to introductory robotics — early on-ramp to STEM.",
      ],
      uniqueDifferentiators: [
        "Bridges builder and reader profiles — most 3rd graders lean strongly one way; Sarah has both.",
        "Family environment that models both engineering and healthcare careers gives unusual breadth of role models.",
      ],
      alignedActivities: [
        "Library Reading Club — perfectly matched to her reading drive.",
        "Lego Robotics — perfectly matched to her building and 'why' instincts.",
        "Soccer — provides physical and team-based balance to focused indoor work.",
      ],
    },
    gapAnalysis: {
      missingElements: [
        "No exposure yet to a structured math enrichment program. Try Beast Academy or Khan Kids 30 minutes a few days per week.",
        "No experience with a sustained project (anything that takes 3+ weeks to finish). Pick one: a small garden, a build series, a story she writes a chapter at a time.",
        "Hasn't yet visited a science museum or hands-on STEM workshop. Look for monthly weekend programs at your local children's museum.",
        "No formal music performance opportunity yet. Ask her piano teacher about end-of-year recitals or family-friendly recital groups.",
        "Hasn't tried a writing club or journaling habit; her reading level suggests she'd enjoy creating stories too.",
      ],
      activitiesToDeepen: [
        "Lego Robotics — push toward the FIRST LEGO League Jr. program (age 6-10) for a low-stakes team experience.",
        "Library Reading Club — ask the librarian for a stretch chapter-book series matched to her interests.",
      ],
      skillsToDevelope: [
        "Persistence on hard problems (one challenging puzzle per week, celebrate effort not outcome).",
        "Basic typing fluency (BBC Dance Mat, Typing Club for Kids).",
        "Simple money/time math (let her handle small purchases or plan a Saturday timeline).",
        "Public speaking (have her teach you something she's learned, or join a 'show and tell' habit at home).",
        "Emotional regulation under frustration (model self-talk: 'I can try again').",
      ],
      vulnerabilities: [],
    },
    roadmap: {
      immediate: [
        "Take Sarah to the public library this Saturday and ask the librarian about reading challenges and chapter-book recommendations.",
        "Sign up for Beast Academy (online) or borrow Beast Academy comic books for a math enrichment trial.",
        "Add one weekly 'Family Project Hour' — pick something Sarah leads (Lego challenge, baking experiment, garden bed).",
        "Look up your district's Gifted & Talented identification process and confirm next testing window.",
        "Visit your local children's museum or science center this month — start a habit.",
      ],
      shortTerm: [
        "Register Sarah for the Johns Hopkins CTY talent search testing if she scores in the top 10% on a school standardized test.",
        "Enroll in a Saturday or summer week-long enrichment camp (math, robotics, or creative writing).",
        "Add a 5-minute daily reading-aloud habit so she can practice fluency and expression.",
        "Choose one 6-week project (mini-garden, book she writes herself, build series) and plan it together.",
        "Join the FIRST LEGO League Jr. program if your area has a team for ages 6-10.",
      ],
      mediumTerm: [
        "Pursue district G&T testing if eligible; understand what programs unlock if she qualifies.",
        "Try a week of overnight summer camp by 4th or 5th grade (independence-building).",
        "Begin a passion notebook: she records ideas, sketches, observations weekly.",
      ],
      longTerm: [
        "By 5th grade, Sarah should have one chosen 'depth area' (math, building, reading, sports) plus broad exploration.",
        "Maintain the family habit of museums, libraries, and weekend projects through middle school.",
      ],
    },
    parentCoachingTips: [
      { tip: "Read aloud with Sarah every night, even after she can read alone.", why: "Hearing fluent reading models pacing, vocabulary, and expression that silent reading doesn't teach." },
      { tip: "When she's stuck on a Lego or math problem, count to 60 before helping.", why: "Builders need to feel productive struggle. Quick rescues teach learned helplessness; waiting teaches grit." },
      { tip: "Praise specific effort, not 'smart'. Say 'I noticed you tried three different ways' not 'You're so smart'.", why: "Effort-praised kids take harder challenges. Trait-praised kids avoid them." },
      { tip: "Pick one cooking or baking project a week where Sarah leads.", why: "Real-world math, sequencing, and patience all in one — and the output is delicious feedback." },
      { tip: "Resist over-scheduling. Two structured activities + free time beats five activities.", why: "Builders need unstructured time to invent and explore. Schedules kill creativity at this age." },
      { tip: "Ask 'What's something you noticed today?' instead of 'How was school?'", why: "Trains observation; gets richer answers; signals you care about her thinking." },
    ],
    enrichmentRecommendations: [
      { name: "Beast Academy (Art of Problem Solving)", category: "math", description: "Comic-book style math curriculum for grades 2-5; rigorous and playful. Online subscription or printed books.", ageFit: "Designed for elementary students who are ahead in math; matches Sarah's curiosity and patience.", timeCommitment: "30 min, 3-4 days per week" },
      { name: "Local Public Library Summer Reading Program", category: "literacy", description: "Free; tracks books read, awards prizes, often includes weekly story hours and craft sessions.", ageFit: "Sarah is already a self-motivated reader; this rewards and extends the habit.", timeCommitment: "1-2 hours per week (visits + reading)" },
      { name: "FIRST LEGO League Jr. (Discover or Explore)", category: "science", description: "Beginner robotics and engineering teamwork program for ages 6-10. Local teams meet weekly for a season.", ageFit: "Builds on her existing Lego robotics interest in a team setting.", timeCommitment: "2-3 hours per week, fall-spring season" },
      { name: "Local Children's Museum or Science Center membership", category: "science", description: "Most cities have one. Annual family memberships are usually $80-$150 and include free entry plus discounts on programs.", ageFit: "Hands-on exhibits match her 'why' question style.", timeCommitment: "1-2 visits per month" },
      { name: "Khan Kids (free app)", category: "math", description: "Free, ad-free app with math, reading, and social-emotional games for ages 2-8.", ageFit: "Perfect for short, low-pressure daily practice.", timeCommitment: "15 min, 4-5 days per week" },
      { name: "Scholastic Storyworks Jr. magazine", category: "literacy", description: "Monthly nonfiction + fiction magazine for grades 2-3; comes with read-aloud audio.", ageFit: "Stretches her reading with real-world topics; great for parent-child discussion.", timeCommitment: "30 min per issue" },
      { name: "Local YMCA Swim Lessons or Youth Soccer League", category: "social", description: "Affordable, social, builds physical confidence outside school PE.", ageFit: "Sarah is on a school team; broaden through community-level play.", timeCommitment: "1-2 hours per week" },
      { name: "Junior Music Recital Group (via current piano teacher)", category: "arts", description: "Group performance opportunities — usually 2x per year through Music Teachers National Association local chapters.", ageFit: "Builds performance confidence; gives goal-setting framework for piano practice.", timeCommitment: "Monthly group lessons + recital prep" },
    ],
    talentSearchEligibility: {
      eligible: true,
      programs: [
        { name: "Johns Hopkins CTY (Center for Talented Youth)", whyConsider: "Sarah's reading-above-grade-level and high curiosity profile typically maps to a strong showing on talent-search testing. CTY identifies students through above-grade-level testing and unlocks summer programs, online courses, and a global community.", nextStep: "Visit cty.jhu.edu and search for the 'Talent Search' eligibility criteria for your state. Testing windows usually open in late fall and early spring." },
        { name: "Duke TIP (Duke Identification Program)", whyConsider: "Similar to CTY; Duke TIP also serves K-5 students and offers free family resources even for non-enrolled students. Sarah's profile suggests she'd be in the candidate pool.", nextStep: "Search 'Duke TIP elementary talent search' — eligibility usually requires a top-percentile score on a school standardized test." },
        { name: "District Gifted & Talented (G&T) Program", whyConsider: "Most public districts identify G&T students between 2nd and 4th grade. Eligibility opens access to magnet programs, accelerated math, or pull-out enrichment.", nextStep: "Email Sarah's school counselor this week: ask what G&T identification process the district uses and when the next testing window is." },
      ],
    },
  }

  // Grade-by-grade roadmap through 5th grade
  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "3rd Grade",
      focus: "Build the habit of sustained reading and one structured math enrichment. Begin G&T identification process.",
      academics: ["Maintain reading-above-grade-level habit (chapter books).", "Add 30 min/day of Beast Academy or Khan Kids math.", "Practice handwriting and basic typing fluency.", "Learn multiplication facts up through 12s by year-end."],
      extracurriculars: ["Continue Library Reading Club, Lego Robotics, soccer, piano.", "Add monthly children's museum visits.", "Try one new weekend workshop per quarter."],
      testing: ["Take whatever district standardized test is offered (often a Spring assessment).", "Sign up for Johns Hopkins CTY or Duke TIP talent search testing if eligible."],
      leadership: ["Pick one 'classroom helper' role each week (line leader, supply manager).", "Lead a family project once a month (Sunday Project Hour)."],
      summerPlan: "Library summer reading program + one week-long enrichment camp (math/robotics/writing) + family museum visits. Daily 30-min reading and 30-min Beast Academy.",
    },
    nextYears: [
      {
        grade: "4th Grade",
        focus: "Deepen one chosen 'depth area' while continuing broad exploration.",
        academics: ["Continue accelerated math trajectory.", "Begin reading longer chapter books and short biographies.", "Introduce structured writing (one short story or report per month)."],
        extracurriculars: ["Continue robotics, soccer, piano.", "Add one new sustained project (3-month minimum)."],
        testing: ["G&T testing if not yet completed.", "Continue talent search participation."],
        leadership: ["Try for safety patrol, peer reading buddy, or class representative roles."],
        summerPlan: "Try one CTY/TIP day camp if eligible. Family travel with educational components. First week of overnight camp recommended.",
      },
      {
        grade: "5th Grade",
        focus: "Prepare for middle-school transition. Identify which middle-school enrichment paths matter (math acceleration, gifted humanities).",
        academics: ["Aim to complete pre-algebra concepts by end of year.", "Read at least 20 books across genres.", "Practice structured essay writing (5-paragraph format)."],
        extracurriculars: ["Continue depth area; try one new domain (debate, theater, coding club)."],
        testing: ["Middle-school math placement tests; CTY/TIP if continuing."],
        leadership: ["Run for student council or take a lead on a school project."],
        summerPlan: "Selective summer program (CTY 2-week, university pre-college lite). Begin 'big project' planning for middle school.",
      },
    ],
  }

  return {
    student, formData, analysis, gradeByGradeRoadmap,
    // Empty arrays/objects for HS-shaped fields that don't apply at K-5
    passionProjects: [],
    academicCourses: { apCourses: [], ibCourses: [], curriculumSpecificCourses: { label: "", courses: [] }, honorsCourses: [], electivesRecommended: [] },
    satActGoals: null,
    researchPubs: { researchTopics: [], publicationOpportunities: [], mentorshipSuggestions: [], timeline: "" },
    leadership: { clubLeadership: [], schoolWideRoles: [], communityLeadership: [], leadershipDevelopment: [] },
    serviceCommunity: { localOpportunities: [], nationalPrograms: [], internationalService: [], sustainedCommitment: [] },
    summerPrograms: null,
    sports: { varsitySports: [], clubSports: [], recruitingStrategy: [], fitnessLeadership: [] },
    competitions: { academicCompetitions: [], businessCompetitions: [], artsCompetitions: [], debateSpeech: [] },
    studentGov: { schoolGovernment: [], districtStateRoles: [], youthGovernment: [], advocacyRoles: [] },
    internships: { industryInternships: [], researchInternships: [], nonprofitInternships: [], virtualOpportunities: [] },
    cultureArts: { performingArts: [], visualArts: [], creativeWriting: [], culturalClubs: [] },
    career: null,
    collegeRecs: null,
    mentors: { mentors: [] },
    wasteOfTime: { activities: [] },
    scholarships: { scholarships: [] },
  }
}

/**
 * Middle school demo: Alex Rodriguez, 7th grade. Showcases the 5-tab middle
 * results page with new sections (HS course plan, competition pipeline,
 * summer program ladder).
 */
function getMiddleDemoData() {
  const student = {
    first_name: "Alex",
    last_name: "Rodriguez",
    full_name: "Alex Rodriguez",
    current_grade: "7th Grade",
    parent_email: "parent.demo@thestudentblueprint.com",
  }

  const formData = {
    basicInfo: {
      firstName: "Alex",
      lastName: "Rodriguez",
      email: "__EMAIL__",
      studentType: "middle",
      currentGrade: "7th Grade",
      gradeLevel: "7th Grade",
      schoolName: "Roosevelt Middle School",
      parentName: "Maria Rodriguez",
      parentEmail: "parent.demo@thestudentblueprint.com",
    },
    academicProfile: {
      curriculum: "US Middle School",
      coursesTaken: ["Pre-Algebra (advanced)", "English 7", "Life Science", "World Cultures", "Spanish I"],
      favoriteSubjects: ["Math", "Science", "Music"],
      academicAwards: "MATHCOUNTS school team (5th place at chapter), straight-A honor roll, 1st violin in school orchestra.",
    },
    extracurriculars: {
      activities: [
        { name: "School MATHCOUNTS Team", role: "Team Member", yearsActive: "2", hoursPerWeek: "3", description: "Practices weekly; placed 5th at the chapter competition; aiming for top 10 individual at chapter next year." },
        { name: "Regional Science Olympiad", role: "Team Member (Disease Detectives, Anatomy)", yearsActive: "1", hoursPerWeek: "4", description: "Made the 7th grade competition team; team placed 8th at regional invitational." },
        { name: "School Orchestra (Violin, 1st chair section)", role: "1st Violin", yearsActive: "5", hoursPerWeek: "5", description: "Five years of private lessons + school orchestra. Auditioned into the Youth Symphony track for next year." },
        { name: "Soccer (Travel Team)", role: "Midfielder", yearsActive: "4", hoursPerWeek: "8", description: "Plays for a travel club team; 2-3 tournaments per season." },
      ],
    },
    leadership: {
      positions: "MATHCOUNTS team co-captain (informal), Section leader in orchestra, Soccer team captain at 12U level last season.",
      impactDescription: "Helps newer MATHCOUNTS members with practice problems weekly. Organizes orchestra section sectionals.",
    },
    competitions: {
      competitions: "MATHCOUNTS Chapter (5th, school team 3rd), Science Olympiad Regional (8th), All-State Orchestra audition (made 1st violin section).",
      awards: "MATHCOUNTS school team plaque, Science Olympiad regional medal in Disease Detectives.",
    },
    passions: {
      topicsYouLove: ["Math", "Public health", "Music theory"],
      industriesCurious: ["Medicine", "Tech", "Music"],
      hobbiesSkills: "Loves logic puzzles, watches medical YouTube channels, learning music composition basics.",
    },
    careerAspirations: {
      career1: "Doctor (epidemiologist or surgeon)",
      career2: "Software engineer working on healthcare AI",
      career3: "Concert violinist",
      dreamJobTitle: "A doctor who builds AI tools that catch diseases earlier",
    },
    summerPrograms: {
      programs: "Did a 1-week local STEM day camp last summer. Looking for something more substantive for next summer.",
    },
    specialTalents: {
      musicalInstruments: "Violin (5 years, 1st chair school orchestra, made youth symphony track)",
      athletics: "Soccer (travel team midfielder, 4 years)",
    },
    familyContext: {
      familyProfessions: "Mother: nurse practitioner; Father: high school math teacher.",
    },
    personality: {
      topStrengths: ["Disciplined", "Curious", "Empathetic"],
      topWeaknesses: ["Perfectionist", "Sometimes overcommits", "Avoids failure"],
      archetypes: ["Analyst", "Healer"],
      introvertExtrovert: "Ambivert",
    },
    personalStories: {
      lifeChallenge: "Sister was hospitalized with severe pneumonia last year — sparked Alex's interest in medicine and Disease Detectives Science Olympiad event.",
      proudMoment: "Making the regional MATHCOUNTS team in 7th grade after not making it in 6th.",
    },
    timeCommitment: {
      hoursSchoolYear: "15-20 hours per week across all activities",
      hoursSummer: "Up to 30 hours per week available for programs",
      preferredPace: "Steady Progress (balanced with schoolwork)",
    },
  }

  const analysis = {
    studentArchetype: "Emerging Innovator",
    archetypeScores: { Visionary: 70, Builder: 65, Healer: 80, Analyst: 88, Artist: 72, Advocate: 60, Entrepreneur: 55, Researcher: 82 },
    competitivenessScore: 78,
    strengthsAnalysis: {
      competitiveAdvantages: [
        "Already a competitive MATHCOUNTS team member at 7th grade — most competitors don't qualify until 8th.",
        "5 years of sustained violin study with audition-track progression — rare combination of analytical and artistic depth.",
        "Personal story (sister's hospitalization) gives genuine motivation for medicine that admissions and program reviewers will sense as authentic.",
        "Top of class in math AND making it onto a regional Science Olympiad team — STEM trajectory is on rails.",
      ],
      uniqueDifferentiators: [
        "Bridges hard sciences (MATHCOUNTS, Science Olympiad), arts (violin), and team athletics (soccer) — unusually balanced for a 12-year-old.",
        "Family role models in both medicine (mom) and math/teaching (dad) create unusual intellectual environment.",
      ],
      alignedActivities: [
        "MATHCOUNTS — perfectly matched to analytical strength.",
        "Science Olympiad Disease Detectives — directly aligned with medicine interest sparked by sister's illness.",
        "Violin — sustained discipline that translates to all other domains.",
      ],
    },
    gapAnalysis: {
      missingElements: [
        "No participation yet in a national-level competition — try MATHCOUNTS Chapter podium or USACO Bronze in 8th grade.",
        "No sustained personal project (anything self-initiated, lasting 3+ months). Pick one: a healthcare YouTube channel, a Python tool to track Science Olympiad practice, a community fundraiser.",
        "Hasn't yet attempted a selective summer program (CTY, Stanford EPGY, university math camps). Apply this winter for next summer.",
        "No coding skill yet despite tech career interest. Begin Python via Codecademy or Khan Academy this semester.",
        "No formal high-school course planning yet. Map out the 4-year schedule with the school counselor before 8th grade ends.",
        "Avoidance of failure is showing up (avoids hard problems). Build a deliberate 'try and miss' habit — pick one stretch goal per quarter and accept that some won't work.",
      ],
      activitiesToDeepen: [
        "MATHCOUNTS — push for individual chapter qualification next year, not just team participation.",
        "Science Olympiad — aim to lead one event prep at school.",
      ],
      skillsToDevelope: [
        "Beginner Python coding (start with Khan Academy or Codecademy free tier).",
        "Time management with a written weekly plan.",
        "Public speaking via Toastmasters Youth or school debate.",
        "Writing clarity — keep a weekly journal entry on something Alex learned.",
        "Basic AI fluency: practice using ChatGPT and Perplexity for homework brainstorming (with parent guidance on appropriate use).",
        "Comfort with productive failure — pick one challenge per quarter that's likely to fail.",
        "Music composition basics (Alex has expressed interest) — apps like MuseScore or Soundtrap.",
      ],
      vulnerabilities: [],
    },
    roadmap: {
      immediate: [
        "Sign up for MATHCOUNTS Chapter individual competition (not just team) for next cycle.",
        "Begin Codecademy's free Python track — 30 min, 4 days per week.",
        "Apply to Johns Hopkins CTY summer program (next year's session) — deadline is typically January.",
        "Schedule a meeting with 8th-grade counselor to map out 9th-grade course selection (honors track).",
        "Pick one 3-month personal project and write down a finish date.",
      ],
      shortTerm: [
        "Compete in one regional competition besides MATHCOUNTS and Science Olympiad — try a writing contest or coding competition.",
        "Read one book per month outside of school assignments — start with science memoirs (Sapiens, The Emperor of All Maladies for the medicine interest).",
        "Audition for the Youth Symphony chair role.",
        "Build first small Python project (e.g., a quiz app or a daily-questions tracker).",
      ],
      mediumTerm: [
        "Plan and apply to a selective summer program for the summer after 8th grade.",
        "Take a high-school math course (Algebra I or Geometry) over the summer or as an 8th grader for HS credit if possible.",
        "Start a project that combines two interests (e.g., a music-theory blog, a healthcare data analysis with Python).",
      ],
      longTerm: [
        "Enter 9th grade with: 1 selective summer experience, 1 sustained project, Algebra I/Geometry already done, beginner Python under belt.",
        "Map a 4-year HS plan that lands on AP Calculus BC by 11th grade and APs in Bio/Chem for the medicine interest.",
      ],
    },
    parentTips: [
      "Help Alex find one 3-month project this semester — pick a manageable scope and protect time on the calendar.",
      "Visit your high-school counselor or registrar with Alex before 8th grade ends to map the 4-year course plan.",
      "Encourage Alex to attempt a hard competition where she might not place. Failure stories matter more than wins at this age.",
    ],
    highSchoolCoursePlan: {
      "9th": {
        honors: ["Honors Algebra I or Geometry", "Honors English 9", "Honors Biology", "Honors World History", "Spanish II"],
        regular: ["PE", "Music (Orchestra)", "Health"],
        rationale: "Place out of standard math via the summer-before-9th plan. Lock in the honors track in core subjects. Continue violin via school orchestra.",
      },
      "10th": {
        honors: ["Honors Geometry or Algebra II", "Honors English 10", "Honors Chemistry", "Honors World History II / AP Human Geography", "Spanish III"],
        regular: ["Orchestra (Concertmaster track)", "Computer Science elective"],
        rationale: "Add CS as elective to lock in tech-meets-medicine identity. Maintain orchestra leadership progression.",
      },
      "11th": {
        honors: ["AP Calculus AB or BC", "AP English Language", "AP Biology", "AP US History", "AP Spanish Language"],
        regular: ["Orchestra (leadership role)", "Independent Study or Dual Enrollment"],
        rationale: "Junior year is the most-watched. Stack 4-5 APs aligned with the medicine + tech interest. Concertmaster or section leader in orchestra.",
      },
      "12th": {
        honors: ["AP Calculus BC (if AB taken)", "AP English Literature", "AP Chemistry or AP Physics C", "AP Statistics or AP Computer Science Principles", "Multivariable Calculus (dual enrollment)"],
        regular: ["Orchestra", "Senior project"],
        rationale: "Continue rigor through senior year (no senioritis). Senior project ties together medicine/tech/music threads for college applications.",
      },
    },
    competitionPipeline: {
      local: [
        { name: "School MATHCOUNTS Chapter Round", description: "Individual + team rounds at the chapter level — Alex's existing arena.", whyFit: "Already on the team; aim for individual top-10 next cycle.", deadline: "Late winter every year", difficulty: "intro" },
        { name: "Local Library Math Club / Code Club", description: "Most public libraries run free coding or math enrichment for middle schoolers.", whyFit: "Low-stakes, weekly — perfect place to start Python practice with peers.", deadline: "Rolling enrollment", difficulty: "intro" },
        { name: "Regional Science Olympiad B Division", description: "Continue Disease Detectives + Anatomy events Alex is already doing.", whyFit: "Already on the team; push for top-3 in one event.", deadline: "Spring competition season", difficulty: "intro" },
      ],
      regional: [
        { name: "MATHCOUNTS Chapter Individual Qualifier", description: "Top scorers at chapter advance to state.", whyFit: "Realistic stretch goal in 8th grade with a focused practice plan.", deadline: "February (varies by chapter)", difficulty: "intermediate" },
        { name: "American Mathematics Competition (AMC 8 / AMC 10)", description: "Standardized math competition — top scorers in AMC 10 advance to AIME.", whyFit: "AMC 8 in 7th-8th grade builds toward AMC 10 in HS — directly on the path.", deadline: "November (AMC 8), February (AMC 10)", difficulty: "intermediate" },
        { name: "USACO (USA Computing Olympiad) Bronze Division", description: "After ~6 months of Python practice, Bronze is a realistic target.", whyFit: "Locks in CS competition resume at the start of HS.", deadline: "Quarterly contests, December-March", difficulty: "intermediate" },
      ],
      national: [
        { name: "MATHCOUNTS National Competition", description: "Top 4 from each state advance to the national stage.", whyFit: "Long-shot for 7th grade but a clear North Star — the focus of state-level practice.", deadline: "May (national finals)", difficulty: "advanced" },
        { name: "Science Olympiad National Tournament", description: "State-winning teams advance to Nationals.", whyFit: "Push the Science Olympiad team toward state qualification in 8th grade.", deadline: "May (nationals)", difficulty: "advanced" },
      ],
    },
    summerProgramLadder: {
      intro: [
        { name: "Local Public Library Coding Workshops", description: "Free or under-$50 weekly summer coding workshops at most public libraries.", applicationDeadline: "Rolling, no app needed", cost: "Free", whyFit: "Low-commitment way to start the Python journey before applying to selective programs." },
        { name: "Community College Pre-College Day Camps", description: "Many community colleges run 1-week STEM, music, or writing camps for ages 11-13. ~$200-400.", applicationDeadline: "Spring rolling", cost: "$200-400 per week", whyFit: "Affordable on-ramp to college-style instruction." },
        { name: "MATHCOUNTS Summer Practice Group (school or district)", description: "Free or low-cost MATHCOUNTS prep groups in summer.", applicationDeadline: "May/June", cost: "Free", whyFit: "Keeps competition skills sharp over summer with no app barrier." },
      ],
      intermediate: [
        { name: "Johns Hopkins CTY Summer Program (2-week residential or commuter)", description: "Selective; courses range from intro programming to genetics. Application requires above-grade-level test score.", applicationDeadline: "January-February for summer enrollment", cost: "$2500-4500 (financial aid available)", whyFit: "Alex's MATHCOUNTS profile suggests strong CTY eligibility. Builds national network." },
        { name: "Duke TIP eStudies / Summer Studies", description: "Online or in-person summer courses for talent-identified middle schoolers.", applicationDeadline: "January-March", cost: "$1500-3500", whyFit: "Similar to CTY but often more affordable. Strong fit for the medicine interest (genetics, neuroscience tracks)." },
        { name: "University of Maryland Center for Talented Youth Summer", description: "Local university-hosted advanced math + science programs for middle schoolers.", applicationDeadline: "Spring", cost: "$1000-2500", whyFit: "Regional alternative to CTY/TIP." },
      ],
      advanced: [
        { name: "MathPath (residential, for ages 11-14)", description: "Highly selective month-long residential math camp for top middle-school math students.", applicationDeadline: "March", cost: "$5000+ (need-based aid available)", whyFit: "MATHCOUNTS competitors are exactly MathPath's audience; a strong stretch goal." },
        { name: "AwesomeMath Summer Program (online intensive)", description: "Pre-AMC/AIME prep online program for serious competition math students.", applicationDeadline: "Spring", cost: "$1200-2500", whyFit: "Direct prep for the AMC 10/12 → AIME pipeline starting in HS." },
        { name: "PROMYS Junior or Ross Math Camp Junior (residential, 8th grade)", description: "Top-tier number theory / pure math camps. Highly selective; expect to apply in 8th grade.", applicationDeadline: "March", cost: "$5000+ (significant aid)", whyFit: "Long-shot but on-trajectory — apply in 8th grade for the summer before 9th." },
      ],
    },
    essayBrainstorm: [
      { title: "The Word She Couldn't Spell: Pneumonia", hook: "When my sister was hospitalized last year, I learned a word I'd never spelled before — and a question I couldn't put down.", narrative: "Alex's sister's pneumonia sparks her Disease Detectives interest, which leads to the Science Olympiad team, which connects to her medicine career goals. The arc is genuine.", connectingThreads: ["Sister's illness", "Disease Detectives event", "Family medicine background", "Career interest in epidemiology"], whyItWorks: "Anchored in a real moment, builds outward to current activities and future goals. Most authentic-sounding college essay angle in this profile." },
      { title: "Counting in Two Languages", hook: "Math is supposed to be universal — but my dad teaches it in English and my mom diagnoses in Spanish.", narrative: "Use bilingual / bicultural family as the lens for how Alex processes both technical and human problems differently.", connectingThreads: ["Family", "Math", "Medicine", "Cultural identity"], whyItWorks: "Differentiator. Most STEM-track students don't have this angle." },
      { title: "First Chair, Last Place", hook: "I made first chair in orchestra the same week I came in last at MATHCOUNTS chapter.", narrative: "Story of holding excellence and failure in the same week, and what it taught Alex about identity beyond outcomes.", connectingThreads: ["Violin", "MATHCOUNTS", "Identity", "Productive failure"], whyItWorks: "Failure stories age very well; this one already has the vivid detail." },
      { title: "The Diagnosis That Wasn't on the Worksheet", hook: "In Disease Detectives prep, we study real outbreaks. Then I got home and realized my grandmother had been describing symptoms for two weeks.", narrative: "If Alex has a real story like this, use it. Otherwise, draft from the closest analog.", connectingThreads: ["Science Olympiad", "Family", "Medicine"], whyItWorks: "Concrete and personal." },
      { title: "Why I'm Learning Python in 7th Grade", hook: "Most of my friends think coding is what high schoolers do. I think they're four years late.", narrative: "Frame Alex's early-coding choice as evidence of long-term thinking; tie to AI's role in healthcare's future.", connectingThreads: ["Coding journey", "Medicine + tech vision", "Decision-making"], whyItWorks: "Forward-looking; signals both initiative and self-awareness." },
    ],
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "7th Grade",
      focus: "Build 8th-grade competition readiness, start Python, plan HS course schedule, apply to one selective summer.",
      academics: ["Maintain straight-A track in advanced courses.", "Begin daily Python practice (30 min, 4 days/week).", "Read one book per month outside school assignments."],
      extracurriculars: ["Continue MATHCOUNTS, Science Olympiad, orchestra, soccer.", "Add one library coding club or community math group."],
      testing: ["AMC 8 (November).", "Johns Hopkins CTY talent-search test if not already taken."],
      leadership: ["Lead one Science Olympiad event prep.", "Help newer MATHCOUNTS members with practice problems weekly."],
      summerPlan: "Apply to CTY or Duke TIP for next summer (deadline January). Free library workshops + MATHCOUNTS practice group + read 4-5 books.",
    },
    nextYears: [
      {
        grade: "8th Grade",
        focus: "Push for individual MATHCOUNTS Chapter podium. Take Algebra I (HS credit). Apply to selective summer for the summer-before-9th.",
        academics: ["Algebra I (for HS credit if school allows)", "Take AMC 10 in February.", "Continue Python; build first small project."],
        extracurriculars: ["MATHCOUNTS Chapter individual qualifier.", "Science Olympiad: aim for state qualification."],
        testing: ["AMC 10.", "USACO Bronze attempt.", "AP-style placement tests if district offers."],
        leadership: ["Run for student council or Science Olympiad team captain."],
        summerPlan: "Selective summer program (CTY 2-week, Duke TIP, or local university pre-college). Math practice for AMC 10 retake.",
      },
      {
        grade: "High School Transition (9th Grade)",
        focus: "Land in honors-track everywhere. Begin AMC 10 → AIME pipeline. Continue violin and one sport. Sustain the medicine + tech identity.",
        academics: ["Honors Algebra I or Geometry", "Honors Biology, English, World History", "Spanish II"],
        extracurriculars: ["Find HS MATHCOUNTS / Math Team / Science Olympiad equivalent.", "Continue orchestra (audition for Concert or Wind groups)."],
        testing: ["AMC 10, AIME if eligible.", "PSAT 8/9 in fall."],
        leadership: ["Try out for student council or club leadership in spring."],
        summerPlan: "MathPath, AwesomeMath, or selective university summer. First medical-related volunteer placement.",
      },
    ],
  }

  return {
    student, formData, analysis, gradeByGradeRoadmap,
    passionProjects: [],
    academicCourses: { apCourses: [], ibCourses: [], curriculumSpecificCourses: { label: "", courses: [] }, honorsCourses: [], electivesRecommended: [] },
    satActGoals: null,
    researchPubs: { researchTopics: [], publicationOpportunities: [], mentorshipSuggestions: [], timeline: "" },
    leadership: { clubLeadership: [], schoolWideRoles: [], communityLeadership: [], leadershipDevelopment: [] },
    serviceCommunity: { localOpportunities: [], nationalPrograms: [], internationalService: [], sustainedCommitment: [] },
    summerPrograms: null,
    sports: { varsitySports: [], clubSports: [], recruitingStrategy: [], fitnessLeadership: [] },
    competitions: { academicCompetitions: [], businessCompetitions: [], artsCompetitions: [], debateSpeech: [] },
    studentGov: { schoolGovernment: [], districtStateRoles: [], youthGovernment: [], advocacyRoles: [] },
    internships: { industryInternships: [], researchInternships: [], nonprofitInternships: [], virtualOpportunities: [] },
    cultureArts: { performingArts: [], visualArts: [], creativeWriting: [], culturalClubs: [] },
    career: null,
    collegeRecs: null,
    mentors: { mentors: [] },
    wasteOfTime: { activities: [] },
    scholarships: { scholarships: [] },
  }
}

/**
 * Undergrad demo: Maya Patel, college junior, pre-med pivoting toward MD-PhD.
 * RESULT_TABS_BY_TYPE.undergrad shows: archetype, gaps, projects, career-future,
 * academics, scholarships, activities, essays.
 */
function getUndergradDemoData() {
  const student = {
    first_name: "Maya",
    last_name: "Patel",
    full_name: "Maya Patel",
    current_grade: "Junior (3rd Year)",
    parent_email: "",
  }

  const formData = {
    basicInfo: {
      firstName: "Maya",
      lastName: "Patel",
      email: "__EMAIL__",
      studentType: "undergrad",
      currentGrade: "Junior (3rd Year)",
      collegeYear: "Junior (3rd Year)",
      universityName: "University of Michigan",
      major: "Biology (Pre-Med track)",
      postGradGoal: "MD or MD-PhD",
      schoolName: "University of Michigan",
    },
    academicProfile: {
      gpaScale: "4.0 Scale (Unweighted)",
      gpaUnweighted: "3.85",
      favoriteSubjects: ["Biochemistry", "Genetics", "Public Health"],
      academicAwards: "Dean's List 6 semesters, Honors Biology cohort, undergraduate research grant ($2K).",
    },
    extracurriculars: {
      activities: [
        { name: "Undergraduate Research Lab (Genetics)", role: "Research Assistant", yearsActive: "2", hoursPerWeek: "12", description: "Two summers + one academic year. Co-author on one conference abstract; aiming for first-author submission this year." },
        { name: "Pediatric ER Volunteer", role: "Volunteer", yearsActive: "2", hoursPerWeek: "5", description: "200+ hours at the university hospital pediatric ER. Patient interaction with families." },
        { name: "Pre-Med Society", role: "Vice President", yearsActive: "2", hoursPerWeek: "3", description: "Leads MCAT study cohort; organizes monthly speaker series with med-school admissions officers." },
      ],
    },
    careerAspirations: {
      career1: "Physician (Pediatrician or Pediatric Geneticist)",
      career2: "Physician-Scientist (MD-PhD)",
      dreamJobTitle: "MD-PhD pediatric geneticist running a translational research lab",
    },
    researchExperience: {
      entries: [
        { type: "Research", organization: "U-Michigan Genetics Lab", role: "Undergraduate Researcher", description: "Sub-project on rare pediatric disease variants.", duration: "2 years ongoing" },
      ],
      publicationCount: "0",
      conferencePresentation: "1 poster (regional)",
    },
    personality: {
      topStrengths: ["Disciplined", "Empathetic", "Detail-oriented"],
      archetypes: ["Analyst", "Healer"],
    },
  }

  const analysis = {
    studentArchetype: "Research-Driven Pre-Med",
    archetypeScores: { Visionary: 65, Builder: 60, Healer: 85, Analyst: 88, Artist: 50, Advocate: 70, Entrepreneur: 50, Researcher: 90 },
    competitivenessScore: 81,
    strengthsAnalysis: {
      competitiveAdvantages: [
        "Two-year sustained research lab tenure with abstract submission — rare for an undergrad junior.",
        "200+ clinical volunteer hours give a clinical-rec letter writer ready to vouch for patient interaction.",
        "Pre-Med Society VP role demonstrates leadership AND peer mentorship in academic context.",
        "3.85 GPA in honors biology track puts her in striking range of top-25 medical schools.",
      ],
      uniqueDifferentiators: [
        "Bridges bench (research) and bedside (clinical) — most pre-meds lean one way.",
        "Pediatric focus is specific and consistent across activities — clear narrative.",
      ],
      alignedActivities: ["Genetics Lab", "Pediatric ER Volunteer", "Pre-Med Society leadership"],
    },
    gapAnalysis: {
      missingElements: [
        "No first-author publication yet. Convert lab sub-project to a JEM, JCI Insight, or PLOS ONE submission this year.",
        "MCAT not yet taken. Lock in a January or April test date; target 515+.",
        "Clinical mentor is ad-hoc — replace with one recurring 6-month relationship that produces a strong LOR.",
        "No leadership outside the lab — start a campus health-equity initiative or run a peer-led MCAT cohort.",
      ],
      activitiesToDeepen: ["Research Lab — push for first-author paper.", "Pediatric ER Volunteer — formalize a mentor relationship."],
      skillsToDevelope: [
        "MCAT-grade test-taking endurance.",
        "Scientific writing (paper drafting, peer-review iteration).",
        "Statistical analysis in R or Python for genetics data.",
        "Public speaking (poster presentation, conference Q&A).",
        "Grant-writing fundamentals.",
      ],
      vulnerabilities: [],
    },
    roadmap: {
      immediate: [
        "Lock in MCAT date (January or April) and start UWorld + AAMC full-lengths.",
        "Submit a 1-page sub-project proposal to your PI for first-author paper.",
        "Identify one clinical attending or fellow to ask for a sustained mentorship.",
        "Apply to summer research positions at the Broad, NIH, or top peds research labs.",
      ],
      shortTerm: [
        "Take the MCAT.",
        "Submit research paper to a journal.",
        "Lead the MCAT study cohort through a full prep cycle.",
        "Begin secondary brainstorming — gather 3-5 personal-statement story angles.",
      ],
      mediumTerm: [
        "Apply to medical schools next cycle (June application open).",
        "Decide on MD vs MD-PhD path; if MD-PhD, identify 5-10 program targets.",
      ],
      longTerm: [
        "Match to a top-25 medical school. Decide pediatric subspecialty by 3rd year of med school.",
      ],
    },
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "Junior (3rd Year)",
      focus: "Lock in MCAT, push for first-author paper, secure clinical LOR-track mentor.",
      academics: ["Maintain 3.85+ GPA", "Take Honors Biochemistry II", "Strong showing in upper-division genetics elective"],
      extracurriculars: ["Lab paper push", "Pediatric ER → recurring mentorship", "Pre-Med Society MCAT cohort lead"],
      testing: ["MCAT — January or April"],
      leadership: ["MCAT cohort lead", "Pre-Med Society VP through year-end"],
      summerPlan: "NIH or top-tier research summer + secondary brainstorming + MCAT prep finish.",
    },
    nextYears: [
      {
        grade: "Senior (4th Year)",
        focus: "Apply to medical schools, finalize MCAT/GPA/research story, secure 3 strong LORs.",
        academics: ["Honors thesis defense", "Upper-division electives in genetics, immunology, public health"],
        extracurriculars: ["Continue lab; aim for paper acceptance", "Continue clinical volunteering", "Hand off Pre-Med Society leadership"],
        testing: ["Retake MCAT only if needed for target schools"],
        leadership: ["Senior thesis advisor relationship", "Clinical mentor LOR cultivation"],
        summerPlan: "Summer between graduation and matriculation: apply, interview, decide. Or: gap year with a clinical research coordinator role.",
      },
    ],
  }

  return {
    student, formData, analysis, gradeByGradeRoadmap,
    passionProjects: [
      { title: "Honors Thesis: Pediatric Disease Variant Cataloging", description: "Convert lab sub-project into a senior honors thesis with a defended write-up and faculty advisor signature.", timeCommitment: "9 months", impact: "High", skillsDeveloped: ["Scientific writing", "Statistical analysis", "Peer review iteration"], applicationImpact: "Strong differentiator for MD-PhD applications.", resources: "Lab PI, biostats consult center, university honors program.", implementationSteps: ["Draft proposal", "Collect data", "Statistical analysis in R", "Write 40-60 page thesis", "Defense"] },
    ],
    academicCourses: { apCourses: [], ibCourses: [], curriculumSpecificCourses: { label: "Undergraduate Pre-Med", courses: ["Biochemistry II", "Genetics Lab", "Medical Ethics", "Statistics for Health Sciences"] }, honorsCourses: ["Honors Biology Senior Seminar"], electivesRecommended: ["Public Health Policy", "Genomics", "Medical Anthropology"] },
    satActGoals: null,
    researchPubs: { researchTopics: ["Pediatric variant cataloging", "Translational genetics review", "Health-equity case study"], publicationOpportunities: ["JEM", "JCI Insight", "PLOS ONE", "Pediatrics journal undergraduate track"], mentorshipSuggestions: ["Lab PI", "Honors program advisor", "Clinical attending"], timeline: "Submit by end of senior fall." },
    leadership: { clubLeadership: ["Pre-Med Society VP → President next year option"], schoolWideRoles: ["Honors Society"], communityLeadership: ["Health-equity initiative founding role"], leadershipDevelopment: ["MCAT cohort lead", "Mentor a sophomore pre-med"] },
    serviceCommunity: { localOpportunities: [], nationalPrograms: [], internationalService: [], sustainedCommitment: [{ name: "Pediatric ER Volunteer (sustained 2+ years)", description: "Continue weekly shifts with formal mentor relationship.", dates: "Ongoing", relevance: "Generates strong clinical LOR." }] },
    summerPrograms: { preFreshmanPrograms: [], competitivePrograms: [], researchPrograms: [{ name: "NIH Summer Internship Program", description: "Paid 8-10 week research at NIH labs.", dates: "Apply Feb; program June-Aug", relevance: "Strongest possible MD-PhD signal." }], enrichmentPrograms: [] },
    sports: { varsitySports: [], clubSports: [], recruitingStrategy: [], fitnessLeadership: [] },
    competitions: { academicCompetitions: [], businessCompetitions: [], artsCompetitions: [], debateSpeech: [] },
    studentGov: { schoolGovernment: [], districtStateRoles: [], youthGovernment: [], advocacyRoles: [] },
    internships: { industryInternships: [], researchInternships: [{ name: "NIH IRTA Postbac if gap year", description: "1-2 year postbac IRTA boosts MD-PhD apps.", dates: "Apply Jan", relevance: "Top MD-PhD pipeline." }], nonprofitInternships: [], virtualOpportunities: [] },
    cultureArts: { performingArts: [], visualArts: [], creativeWriting: [], culturalClubs: [] },
    career: { jobTitles: ["Physician (Pediatrics)", "Physician-Scientist (MD-PhD)", "Clinical Research Coordinator (gap year)", "Biotech Industry Analyst"], blueOceanIndustries: [{ industry: "Pediatric rare-disease therapeutics", why: "Family-and-disease-specific therapies are an under-served growth area." }], salaryPotential: "Resident: ~$60K. Attending pediatrician: $200-280K. MD-PhD academic: $130-200K with research time.", linkedInBioHeadline: "Pre-Med | Genetics Researcher | Aspiring Pediatric Physician-Scientist" },
    collegeRecs: null,
    mentors: { mentors: [{ name: "Dr. Sarah Lin", university: "U-Michigan Medical School", department: "Pediatric Genetics", why: "MD-PhD attending, runs a pediatric variant lab — natural mentor for Maya's profile." }] },
    wasteOfTime: { activities: [{ activity: "Generic tutoring center shifts", whyQuit: "High effort, low admissions signal — time better spent on the honors thesis and MCAT prep." }] },
    scholarships: { scholarships: [
      { name: "Goldwater Scholarship", organization: "Goldwater Foundation", amount: "$7,500", deadline: "January", why: "Top STEM undergrad scholarship; Maya's research profile is a strong fit.", url: "https://goldwater.scholarsapply.org/" },
      { name: "Beckman Scholars Program", organization: "Arnold & Mabel Beckman Foundation", amount: "$26,000 over 15 months", deadline: "February (institution-nominated)", why: "Two-summer fully-funded undergraduate research scholarship.", url: "https://www.beckman-foundation.org/" },
      { name: "AMA Foundation Physicians of Tomorrow", organization: "AMA Foundation", amount: "$10,000", deadline: "May", why: "For rising 4th-year medical students; bookmark for next year.", url: "https://amafoundation.org/" },
      { name: "NIH Undergraduate Scholarship Program", organization: "NIH", amount: "Up to $20,000/year", deadline: "March", why: "For students from disadvantaged backgrounds pursuing biomedical research.", url: "https://www.training.nih.gov/" },
    ] },
  }
}

/**
 * Grad demo: James Park, MBA candidate (Year 1) at a top-15 program.
 * RESULT_TABS_BY_TYPE.grad shows: archetype, gaps, career-future, scholarships, essays.
 */
function getGradDemoData() {
  const student = {
    first_name: "James",
    last_name: "Park",
    full_name: "James Park",
    current_grade: "1st Year",
    parent_email: "",
  }

  const formData = {
    basicInfo: {
      firstName: "James",
      lastName: "Park",
      email: "__EMAIL__",
      studentType: "grad",
      currentGrade: "1st Year",
      targetProgramType: "MBA",
      undergradInstitution: "UC Berkeley",
      undergradMajor: "Industrial Engineering",
      workExperienceYears: "5",
      schoolName: "Northwestern Kellogg",
    },
    academicProfile: {
      gpaScale: "4.0 Scale (Unweighted)",
      gpaUnweighted: "3.78",
      favoriteSubjects: ["Strategy", "Behavioral Economics", "Operations"],
      academicAwards: "Berkeley Phi Beta Kappa, Kellogg Forte Fellow.",
    },
    extracurriculars: {
      activities: [
        { name: "Strategy Consulting Club, Kellogg (VP of Recruiting)", role: "VP", yearsActive: "1", hoursPerWeek: "8", description: "Leads recruiting prep for ~80 first-years targeting MBB and Tier-2 firms." },
        { name: "Healthcare Industry Group", role: "Member", yearsActive: "1", hoursPerWeek: "3", description: "Healthcare-focused speaker series, case prep cohort." },
        { name: "Kellogg Marathon Team", role: "Captain", yearsActive: "1", hoursPerWeek: "8", description: "Trains the cohort for Chicago Marathon; 30 participants this year." },
      ],
    },
    careerAspirations: {
      career1: "Healthcare Strategy Consultant (MBB)",
      career2: "Healthcare PE / VC Investor",
      dreamJobTitle: "Partner at a top healthcare-focused private equity firm",
      whyProgramNow: "5 years in operations at a healthcare unicorn made it clear my next move requires the financial fluency and brand of a top MBA.",
      fiveYearGoal: "Senior associate at MBB by year 3 post-MBA, then transition to healthcare PE associate by year 5.",
    },
    researchExperience: { entries: [], publicationCount: "0" },
    personality: {
      topStrengths: ["Strategic thinker", "Operator", "Empathetic leader"],
      archetypes: ["Analyst", "Entrepreneur"],
    },
  }

  const analysis = {
    studentArchetype: "Healthcare Operator",
    archetypeScores: { Visionary: 75, Builder: 78, Healer: 65, Analyst: 88, Artist: 45, Advocate: 60, Entrepreneur: 82, Researcher: 60 },
    competitivenessScore: 82,
    strengthsAnalysis: {
      competitiveAdvantages: [
        "5 years of pre-MBA operating experience at a healthcare unicorn — rare and credible for healthcare-track recruiters.",
        "VP of Strategy Consulting Club at Kellogg gives direct MBB recruiting visibility.",
        "Berkeley Industrial Engineering + healthcare ops creates a distinctive technical-to-strategy story.",
        "Healthcare Industry Group + recruiting role create a coherent post-MBA narrative for healthcare-focused recruiters.",
      ],
      uniqueDifferentiators: [
        "Operator-to-investor pivot is sharper than the typical 'consultant-to-PE' story most MBA candidates pitch.",
        "Marathon Captain demonstrates leadership outside the resume — admissions / firms read this signal.",
      ],
      alignedActivities: ["Strategy Consulting Club VP", "Healthcare Industry Group", "Marathon Captain"],
    },
    gapAnalysis: {
      missingElements: [
        "No formal case-prep practice partner network yet. Lock in 2-3 sparring partners by November.",
        "Healthcare PE firm relationships are thin. Identify 5 target firms and start informational coffees this term.",
        "No PE/VC internship lined up yet. Aim for a healthcare PE summer associate role; backup is MBB healthcare practice.",
        "Public-speaking polish for client-facing partner-track work could improve. Take Kellogg's negotiation + executive presence electives.",
      ],
      activitiesToDeepen: ["Strategy Consulting Club VP — convert into a National Recruiting Director title for senior year.", "Healthcare Industry Group — co-lead one major event."],
      skillsToDevelope: [
        "LBO modeling and PE-style case math.",
        "Investment memo writing (1-2 page deal summaries).",
        "Healthcare market sizing fluency (drug pricing, payer dynamics, regulatory).",
        "Behavioral interview polish for partner-style interviews.",
        "Network management — CRM-style follow-up discipline.",
      ],
      vulnerabilities: [],
    },
    roadmap: {
      immediate: [
        "Identify 5 target healthcare PE firms; book informational coffees with associates.",
        "Lock in case-prep partners and a 12-week prep calendar.",
        "Apply to MBB healthcare practice summer associate roles by November.",
        "Take Kellogg's negotiation elective in winter quarter.",
      ],
      shortTerm: [
        "Land summer internship: ideally healthcare PE associate; backup MBB healthcare.",
        "Build a personal investment memo portfolio (3-5 deals).",
        "Co-lead one major Healthcare Industry Group event.",
      ],
      mediumTerm: [
        "Convert summer offer to full-time post-MBA role.",
        "If MBB: target healthcare practice and 2-year exit to PE associate.",
        "If PE: lock in long-term track at the firm.",
      ],
      longTerm: [
        "Make associate-to-VP within 4-5 years post-MBA.",
        "Build a personal brand on healthcare investing (deal commentary, conference talks).",
      ],
    },
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "1st Year MBA",
      focus: "Land summer healthcare PE or MBB healthcare internship; build PE/VC firm relationships.",
      academics: ["Core MBA curriculum", "Negotiation elective", "Healthcare strategy elective"],
      extracurriculars: ["Strategy Consulting Club VP", "Healthcare Industry Group event lead", "Marathon Captain"],
      testing: ["Already submitted GMAT — no further testing needed"],
      leadership: ["Strategy Club VP", "Marathon Captain"],
      summerPlan: "Summer internship at healthcare PE firm or MBB healthcare practice.",
    },
    nextYears: [
      {
        grade: "2nd Year MBA",
        focus: "Convert summer offer; build personal brand; finalize career trajectory.",
        academics: ["Advanced electives: Private Equity, Healthcare Markets, Executive Presence"],
        extracurriculars: ["Promote to Strategy Club National Recruiting Director", "Co-lead Healthcare Industry Group conference"],
        testing: [],
        leadership: ["Convert recruiting role into a senior leadership story"],
        summerPlan: "Graduate; start full-time role.",
      },
    ],
  }

  return {
    student, formData, analysis, gradeByGradeRoadmap,
    passionProjects: [],
    academicCourses: { apCourses: [], ibCourses: [], curriculumSpecificCourses: { label: "MBA Electives", courses: ["Negotiation", "Healthcare Strategy", "Private Equity", "Executive Presence"] }, honorsCourses: [], electivesRecommended: ["Private Equity II", "Healthcare Markets seminar"] },
    satActGoals: null,
    researchPubs: { researchTopics: [], publicationOpportunities: [], mentorshipSuggestions: ["Healthcare-track Kellogg professor", "Kellogg PE alumni network", "Healthcare PE associate informational coffees"], timeline: "" },
    leadership: { clubLeadership: ["Strategy Consulting Club VP → Director"], schoolWideRoles: [], communityLeadership: ["Marathon Captain — community sport leadership"], leadershipDevelopment: ["Promote to Director", "Co-lead Healthcare conference"] },
    serviceCommunity: { localOpportunities: [], nationalPrograms: [], internationalService: [], sustainedCommitment: [] },
    summerPrograms: null,
    sports: { varsitySports: [], clubSports: [], recruitingStrategy: [], fitnessLeadership: [] },
    competitions: { academicCompetitions: [], businessCompetitions: [], artsCompetitions: [], debateSpeech: [] },
    studentGov: { schoolGovernment: [], districtStateRoles: [], youthGovernment: [], advocacyRoles: [] },
    internships: { industryInternships: [], researchInternships: [], nonprofitInternships: [], virtualOpportunities: [] },
    cultureArts: { performingArts: [], visualArts: [], creativeWriting: [], culturalClubs: [] },
    career: { jobTitles: ["Healthcare Strategy Consultant (MBB)", "Healthcare Private Equity Associate", "Healthcare Investment Banking VP (post-MBB exit)", "Pharma BD/Strategy Director"], blueOceanIndustries: [{ industry: "Healthcare AI / digital health PE", why: "Capital flowing to this category outpaces the supply of healthcare-fluent investors." }], salaryPotential: "Post-MBA: $200-275K all-in for MBB; $250-400K for PE associate; $400K+ at VP/Principal.", linkedInBioHeadline: "MBA Candidate at Kellogg | Healthcare Operations → Strategy & Investing" },
    collegeRecs: null,
    mentors: { mentors: [{ name: "Healthcare PE Associate (5+ years out)", university: "Kellogg alumni network", department: "Healthcare PE", why: "Direct path to recruiter relationships and mock interviews." }] },
    wasteOfTime: { activities: [{ activity: "Joining 5+ clubs without a leadership role", whyQuit: "MBA recruiters look for depth + leadership in 1-2 clubs, not surface-level membership in many." }] },
    scholarships: { scholarships: [
      { name: "Forté Foundation MBA Fellowship", organization: "Forté Foundation", amount: "Partial to full tuition", deadline: "Varies by school", why: "Broadens the candidate's leadership profile through Forté programming.", url: "https://www.fortefoundation.org/" },
      { name: "Consortium Fellowship", organization: "The Consortium", amount: "Full tuition + stipend", deadline: "October", why: "Top diversity MBA fellowship if eligible by background.", url: "https://cgsm.org/" },
      { name: "Toigo MBA Fellowship", organization: "Toigo Foundation", amount: "Multi-year programming + network", deadline: "January", why: "Healthcare PE pipeline support specifically.", url: "https://toigofoundation.org/" },
      { name: "Kellogg Merit Scholarships", organization: "Kellogg School of Management", amount: "Variable, awarded at admit", deadline: "Auto-considered at admit", why: "Already received Forte Fellow status; pursue additional named scholarships.", url: "https://www.kellogg.northwestern.edu/" },
    ] },
  }
}

/**
 * PhD demo: Dr. James Liu, computational biology PhD candidate Year 3.
 * RESULT_TABS_BY_TYPE.phd shows: archetype, gaps, career-future, scholarships, essays.
 */
function getPhdDemoData() {
  const student = {
    first_name: "James",
    last_name: "Liu",
    full_name: "James Liu",
    current_grade: "3rd Year",
    parent_email: "",
  }

  const formData = {
    basicInfo: {
      firstName: "James",
      lastName: "Liu",
      email: "__EMAIL__",
      studentType: "phd",
      currentGrade: "3rd Year",
      currentInstitution: "Stanford University",
      researchField: "Computational Biology / Bioinformatics",
      department: "Department of Bioengineering",
      targetAdvisor: "Dr. A. Khavari (skin disease genomics)",
      dissertationStage: "Proposal complete; data collection in progress",
      schoolName: "Stanford University",
    },
    academicProfile: {
      gpaScale: "4.0 Scale (Unweighted)",
      gpaUnweighted: "3.92",
      favoriteSubjects: ["Machine Learning", "Genomics", "Statistical Methods"],
      academicAwards: "NIH F31 awardee (Year 2), Stanford Bio-X graduate fellow.",
    },
    extracurriculars: {
      activities: [
        { name: "Stanford Computational Biology Journal Club", role: "Co-Organizer", yearsActive: "2", hoursPerWeek: "3", description: "Co-organizes weekly journal club for ~25 grad students; runs the speaker pipeline." },
        { name: "Bay Area ML in Biology Meetup", role: "Co-founder", yearsActive: "1", hoursPerWeek: "4", description: "Co-founded a quarterly meetup with industry researchers from Recursion, Insitro, and Genentech; ~80 attendees." },
      ],
    },
    careerAspirations: {
      dissertationTopicArea: "ML methods for predicting drug-drug interactions in oncology contexts using protein-protein networks.",
      researchQuestionsToAnswer: "Can graph neural networks reduce false-positive rate in DDI prediction by 30%+ vs current methods?",
      academiaVsIndustry: "Open — leaning industry research scientist (Genentech, Insitro, or 23andMe-tier biotech) but keeping faculty option open with 1-2 more first-author papers.",
      dreamJobTitle: "Principal Research Scientist at AI-first biotech (Insitro, Recursion) OR Assistant Professor at R1 Bioengineering department.",
    },
    researchExperience: {
      entries: [
        { type: "Research", organization: "Stanford Bioengineering (current)", role: "PhD Candidate", description: "Dissertation work on GNN-based DDI prediction.", duration: "3 years ongoing" },
        { type: "Internship", organization: "Genentech (summer Year 2)", role: "Computational Biology Intern", description: "10-week summer internship — published paper from this work.", duration: "10 weeks" },
      ],
      publicationCount: "2 first-author + 3 co-author",
      conferencePresentation: "RECOMB poster (Year 2), ISMB talk (Year 3)",
      patents: "1 provisional (filed via Stanford OTL Year 3)",
    },
    personality: {
      topStrengths: ["Methodical", "Collaborative", "Strong scientific writer"],
      archetypes: ["Researcher", "Analyst"],
    },
    timeCommitment: { hoursSchoolYear: "60+ hours per week (research-heavy)", hoursSummer: "Summer is research-only" },
  }

  const analysis = {
    studentArchetype: "Computational Biologist",
    archetypeScores: { Visionary: 70, Builder: 75, Healer: 60, Analyst: 92, Artist: 50, Advocate: 55, Entrepreneur: 65, Researcher: 95 },
    competitivenessScore: 84,
    strengthsAnalysis: {
      competitiveAdvantages: [
        "NIH F31 awardee — major external funding, strongest indicator of faculty placement potential.",
        "2 first-author publications by Year 3 — competitive for top postdoc positions.",
        "Genentech summer internship + paper from it — industry option fully open.",
        "Co-founded the Bay Area ML in Biology Meetup — visibility and network beyond Stanford.",
      ],
      uniqueDifferentiators: [
        "Bridges ML methodology and wet-lab biology — most computational biologists fall on one side.",
        "Provisional patent filed via Stanford OTL — entrepreneurial vector activated; rare for grad students.",
      ],
      alignedActivities: ["Journal Club organizer", "ML in Biology Meetup co-founder"],
    },
    gapAnalysis: {
      missingElements: [
        "Industry vs academia decision is unresolved — needs to be made within 12 months to optimize remaining PhD time.",
        "No K99/R00 application submitted yet — if academia route, file by end of Year 4.",
        "Limited cross-disciplinary collaboration — co-author one paper with a clinical or wet-lab group this year to broaden methods footprint.",
        "Conference visibility could grow — push for RECOMB or ISMB oral talks rather than posters.",
      ],
      activitiesToDeepen: ["Journal Club — organize a special issue or invited speaker series.", "ML in Biology Meetup — convert to a regional symposium with industry sponsors."],
      skillsToDevelope: [
        "Grant-writing at the K99/R00 level.",
        "Faculty job-talk preparation (45-min seminar polish).",
        "Industry technical-interview prep (case studies on biological ML problems).",
        "Lab management fundamentals (if academia track).",
        "Patent portfolio building (if industry/founder track).",
      ],
      vulnerabilities: [],
    },
    roadmap: {
      immediate: [
        "Schedule a 'career path conversation' with PI in next 30 days to align on academia vs industry signal.",
        "Submit RECOMB or ISMB oral talk abstract this cycle (not just poster).",
        "Identify one wet-lab or clinical collaborator and start a co-author project.",
      ],
      shortTerm: [
        "Decide academia vs industry by end of Year 3 / start of Year 4.",
        "If academia: outline K99/R00 application; line up postdoc PI conversations.",
        "If industry: schedule informational interviews with Insitro, Recursion, Genentech.",
        "Write paper #3 (first-author).",
      ],
      mediumTerm: [
        "Submit K99 (if academia) or accept industry offer (if industry route).",
        "Defend dissertation by end of Year 5.",
      ],
      longTerm: [
        "Postdoc → faculty (academia track) OR principal scientist → manager (industry track).",
        "Build a research program around DDI / drug repurposing in cancer.",
      ],
    },
  }

  const gradeByGradeRoadmap = {
    currentGrade: {
      grade: "Year 3 PhD",
      focus: "Decide academia vs industry. Push for one more first-author paper. Build cross-disciplinary collaboration.",
      academics: ["Continue dissertation research", "Audit one wet-lab method course", "Stats methods seminar"],
      extracurriculars: ["Journal Club organizing", "ML in Biology Meetup hosting"],
      testing: ["No further testing required"],
      leadership: ["Mentor a 1st-year PhD in your sub-area", "Lead one journal-club special session"],
      summerPlan: "Either: (a) industry summer at top biotech for offer optionality, or (b) intensive dissertation writing block + paper submission.",
    },
    nextYears: [
      {
        grade: "Year 4 PhD",
        focus: "Lock in path. If academia: K99 submission. If industry: convert summer to full-time offer.",
        academics: ["Dissertation writing", "Defense prep"],
        extracurriculars: ["Continue Meetup leadership", "Conference talks (not just posters)"],
        testing: [],
        leadership: ["Co-author #4-5", "Faculty job-talk prep if academia"],
        summerPlan: "Final dissertation push; postdoc visits; industry interviews if applicable.",
      },
      {
        grade: "Year 5 PhD",
        focus: "Defend. Transition to postdoc (academia) or industry role.",
        academics: ["Defense"],
        extracurriculars: [],
        testing: [],
        leadership: ["Hand off Meetup co-founder role to a junior grad student"],
        summerPlan: "Defend, take a real break, start next role.",
      },
    ],
  }

  return {
    student, formData, analysis, gradeByGradeRoadmap,
    passionProjects: [],
    academicCourses: { apCourses: [], ibCourses: [], curriculumSpecificCourses: { label: "PhD Program", courses: ["Advanced ML for Genomics", "Wet-lab Methods Audit", "Stats Methods seminar"] }, honorsCourses: [], electivesRecommended: [] },
    satActGoals: null,
    researchPubs: { researchTopics: ["GNN for DDI prediction (dissertation)", "Cross-disciplinary co-author project with wet-lab", "Drug repurposing in oncology"], publicationOpportunities: ["RECOMB (oral)", "ISMB (oral)", "Nature Methods", "Cell Systems"], mentorshipSuggestions: ["Lab PI for academia path", "Postdoc PIs at Broad / EBI / Stanford", "Industry hiring manager network"], timeline: "Paper #3 submitted by end of Year 4." },
    leadership: { clubLeadership: ["Journal Club Co-Organizer", "ML in Biology Meetup Co-founder"], schoolWideRoles: [], communityLeadership: ["Bay Area ML in Biology Meetup convener"], leadershipDevelopment: ["Mentor 1st-year PhD", "Lead conference symposium"] },
    serviceCommunity: { localOpportunities: [], nationalPrograms: [], internationalService: [], sustainedCommitment: [] },
    summerPrograms: null,
    sports: { varsitySports: [], clubSports: [], recruitingStrategy: [], fitnessLeadership: [] },
    competitions: { academicCompetitions: [], businessCompetitions: [], artsCompetitions: [], debateSpeech: [] },
    studentGov: { schoolGovernment: [], districtStateRoles: [], youthGovernment: [], advocacyRoles: [] },
    internships: { industryInternships: [{ name: "Insitro / Recursion / Genentech full-time research scientist track", description: "Convert summer internships to full-time offers.", dates: "Year 4 summer for FT conversion", relevance: "Industry path." }], researchInternships: [], nonprofitInternships: [], virtualOpportunities: [] },
    cultureArts: { performingArts: [], visualArts: [], creativeWriting: [], culturalClubs: [] },
    career: { jobTitles: ["Tenure-Track Faculty (R1 Bioengineering)", "Industry Research Scientist (Insitro, Recursion, Genentech)", "Computational Biology Postdoc (Broad / Stanford / EBI)", "AI Biotech Founder"], blueOceanIndustries: [{ industry: "AI-first drug discovery / digital biology", why: "Capital + talent flowing in faster than the supply of PhD-level computational biologists." }], salaryPotential: "Postdoc $60-80K. Tenure-track AP $90-130K starting. Industry research scientist $180-280K total comp.", linkedInBioHeadline: "PhD Candidate, Stanford Bioengineering | Computational Biology | ML for Drug Discovery" },
    collegeRecs: null,
    mentors: { mentors: [{ name: "Dr. A. Khavari", university: "Stanford", department: "Dermatology / Bioengineering", why: "Current advisor; aligned with computational + clinical bridge." }, { name: "Industry hiring manager (Insitro)", university: "Industry", department: "Computational Biology", why: "Direct path for industry-track conversion." }] },
    wasteOfTime: { activities: [{ activity: "Sitting on too many graduate-program committees", whyQuit: "Service is good in moderation; over-committing eats dissertation hours and signals scattered focus to faculty job committees." }] },
    scholarships: { scholarships: [
      { name: "NIH F31 Predoctoral Fellowship (renewal)", organization: "NIH", amount: "$28K stipend + budget", deadline: "Rolling (December cycle)", why: "Already an F31 awardee; consider NRSA F32 for postdoc next.", url: "https://www.nih.gov/" },
      { name: "Hertz Foundation Fellowship", organization: "Hertz Foundation", amount: "$36K + tuition (5 years)", deadline: "October", why: "Top STEM PhD fellowship if eligible.", url: "https://www.hertzfoundation.org/" },
      { name: "Schmidt Science Fellowship", organization: "Schmidt Sciences", amount: "$110K postdoc + programming", deadline: "September (institution-nominated)", why: "Top postdoc fellowship for cross-disciplinary scientists.", url: "https://schmidtsciencefellows.org/" },
      { name: "K99/R00 Pathway to Independence Award", organization: "NIH", amount: "$90K stipend + $750K independent budget", deadline: "October / February / June (3 cycles)", why: "Critical for faculty placement; submit by end of Year 4.", url: "https://www.nih.gov/" },
    ] },
  }
}

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
    const { organizationId, demoType = "healthcare", studentType = "high_school" } = body
    const validTypes = ['elementary', 'middle', 'high_school', 'undergrad', 'grad', 'phd']
    const resolvedStudentType: string = validTypes.includes(studentType) ? studentType : 'high_school'

    // Determine which org to use
    // For non-super admins, always use their own org
    // For super admins, use the specified org or fall back to admin's org, then default org
    let targetOrgId = organizationId
    if (!isSuperAdmin) {
      targetOrgId = admin.organization_id
    } else if (!targetOrgId) {
      targetOrgId = admin.organization_id
    }

    // Get the target organization (fall back to default org since students.organization_id is NOT NULL)
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
    } else {
      const defaultOrg = await getDefaultOrganization()
      if (defaultOrg) {
        org = { id: defaultOrg.id, name: defaultOrg.name, slug: defaultOrg.slug }
      }
    }

    if (!org) {
      return NextResponse.json({ error: "No organization available for demo" }, { status: 400 })
    }

    // Get demo data based on type
    const demoData = getDemoData(demoType)
    const demoStudentEmail = `demo-${Date.now()}@thestudentblueprint.com`

    // Replace email placeholder in form data
    demoData.formData.basicInfo.email = demoStudentEmail
    // Stamp the student_type onto the demo's responses so the AI prompts and
    // result rendering treat this demo as the requested stage. The pre-baked
    // demo content stays HS-shaped, but RESULT_TABS_BY_TYPE will gate which
    // tabs show on the results page, which is enough for visual QA.
    ;(demoData.formData.basicInfo as Record<string, unknown>).studentType = resolvedStudentType

    // Create demo student
    const { data: studentRecord, error: studentError } = await supabase
      .from("students")
      .insert({
        email: demoStudentEmail,
        first_name: demoData.student.first_name,
        last_name: demoData.student.last_name,
        full_name: demoData.student.full_name,
        current_grade: demoData.student.current_grade,
        organization_id: org.id,
        parent_email: demoData.student.parent_email,
      })
      .select()
      .single()

    if (studentError) {
      console.error("[DEMO] Error creating demo student:", studentError)
      return NextResponse.json({ error: "Failed to create demo student" }, { status: 500 })
    }
    // Create the demo assessment with ALL fields populated
    const { data: assessment, error: assessmentError } = await supabase
      .from("assessments")
      .insert({
        student_id: studentRecord.id,
        organization_id: org.id,
        is_demo: true,
        student_type: resolvedStudentType,
        status: "completed",
        responses: demoData.formData,
        scores: {
          competitivenessScore: demoData.analysis.competitivenessScore,
          archetypeScores: demoData.analysis.archetypeScores,
        },
        report_data: demoData.analysis,
        student_archetype: demoData.analysis.studentArchetype,
        archetype_scores: demoData.analysis.archetypeScores,
        competitiveness_score: demoData.analysis.competitivenessScore,
        roadmap_data: demoData.analysis.roadmap,
        grade_by_grade_roadmap: demoData.gradeByGradeRoadmap,
        strengths_analysis: demoData.analysis.strengthsAnalysis,
        gap_analysis: demoData.analysis.gapAnalysis,
        passion_projects: demoData.passionProjects,
        academic_courses_recommendations: demoData.academicCourses,
        sat_act_goals: demoData.satActGoals,
        research_publications_recommendations: demoData.researchPubs,
        leadership_recommendations: demoData.leadership,
        service_community_recommendations: demoData.serviceCommunity,
        summer_ivy_programs_recommendations: demoData.summerPrograms,
        sports_recommendations: demoData.sports,
        competitions_recommendations: demoData.competitions,
        student_government_recommendations: demoData.studentGov,
        internships_recommendations: demoData.internships,
        culture_arts_recommendations: demoData.cultureArts,
        career_recommendations: demoData.career,
        college_recommendations: demoData.collegeRecs,
        mentor_recommendations: demoData.mentors,
        waste_of_time_activities: demoData.wasteOfTime,
        scholarship_recommendations: demoData.scholarships,
        payment_status: "paid",
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (assessmentError) {
      console.error("[DEMO] Error creating demo assessment:", assessmentError)
      // Clean up student if assessment creation fails
      await supabase.from("students").delete().eq("id", studentRecord.id)
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
        student_id: studentRecord.id,
        demo_type: demoType,
      },
    })

    // Build the results URL (relative so it works on any origin — localhost or production)
    const resultsUrl = `/results/${assessment.id}`
    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        studentName: demoData.student.full_name,
        organization: org?.name || "Platform Default",
        competitivenessScore: demoData.analysis.competitivenessScore,
        archetype: demoData.analysis.studentArchetype,
      },
      resultsUrl,
      message: `Demo assessment created successfully for ${demoData.student.full_name} (${demoType}). You can now view the results page.`,
    })
  } catch (error) {
    console.error("Error creating demo:", error)
    return NextResponse.json({ error: "Failed to create demo" }, { status: 500 })
  }
}
