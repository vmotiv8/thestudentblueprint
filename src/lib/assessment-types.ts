export interface BasicInfo {
  fullName: string
  email: string
  phone?: string
  parentName: string
  parentEmail: string
  parentPhone: string
  dateOfBirth: string
  currentGrade: string
  schoolName: string
  address?: string
  city: string
  state: string
  country: string
  targetCollegeYear: number
  gender?: string
  ethnicity?: string
  dreamSchools?: string[]
  studyAbroad?: boolean
  targetCountries?: string[]
  curriculum?: string
}

export interface AcademicProfile {
  curriculum?: string
  gpaScale?: string
  gpaUnweighted?: string
  gpaWeighted?: string
  coursesTaken: string[]
  coursesPlanned: string[]
  regularCoursesTaken: string[]
  regularCoursesPlanned: string[]
  classRank?: string
  favoriteSubjects: string[]
  leastFavoriteSubjects: string[]
  academicAwards: string
}

export interface TestingInfo {
  psatScore?: string
  psatMath?: string
  psatReading?: string
  satScore?: string
  actScore?: string
  testingTimeline: string
  apScores: string
  preferredTestFormat: string
  satMath?: string
  satReading?: string
  actEnglish?: string
  actMath?: string
  actReading?: string
  actScience?: string
  notTakenYet?: boolean
}

export interface Activity {
  name: string
  role: string
  yearsInvolved: string
  hoursPerWeek: string
  achievements: string
}

export interface Extracurriculars {
  activities: Activity[]
  noExtracurriculars?: boolean
}

export interface LeadershipEntry {
  position: string
  organization: string
  awards: string
  scale: string
}

export interface Leadership {
  positions: string
  organizations: string
  awards: string
  scale: string
  noLeadershipExperience?: boolean
  entries?: LeadershipEntry[]
}

export interface CompetitionEntry {
  competition: string
  recognition: string
}

export interface Competitions {
  competitions: string
  recognitions: string
  noCompetitions?: boolean
  entries?: CompetitionEntry[]
}

export interface Passions {
  topicsYouLove: string[]
  industriesCurious: string[]
  topic1?: string
  topic2?: string
  topic3?: string
  topic4?: string
  topic5?: string
  industry1?: string
  industry2?: string
  industry3?: string
  hobbiesSkills: string
  worldProblem: string
}

export interface CareerAspirations {
  career1: string
  career2: string
  career3: string
  dreamJobTitle: string
  bestFitStatement: string
}

export interface ResearchEntry {
  type: "Research" | "Shadowing" | "Internship" | "Job" | "Other"
  organization: string
  role: string
  description: string
  duration: string
}

export interface ResearchExperience {
  researchExperience: string
  shadowingExperience: string
  internships: string
  noResearchExperience?: boolean
  entries?: ResearchEntry[]
}

export interface SummerProgramEntry {
  name: string
  organization: string
  description: string
  year: string
}

export interface SummerPrograms {
  programs: string
  entries?: SummerProgramEntry[]
  noSummerPrograms?: boolean
}

export interface SpecialTalents {
  musicInstruments: string
  visualArts: string
  performanceArts: string
  athletics: string
}

export interface LegacyEntry {
  college: string
  relation: string
}

export interface FamilyContext {
  familyProfessions: string
  fatherProfession?: string
  motherProfession?: string
  siblingProfessions?: string
  legacyConnections: string
  legacyEntries?: LegacyEntry[]
  annualFamilyIncome?: string
  financialAidNeeded: boolean
  meritScholarshipInterest: boolean
}

export interface Personality {
  topStrengths: string[]
  topWeaknesses: string[]
  strength1?: string
  strength2?: string
  strength3?: string
  weakness1?: string
  weakness2?: string
  weakness3?: string
  archetypes: string[]
  introvertExtrovert: string
}

export interface PersonalStories {
  lifeChallenge: string
  leadershipMoment: string
  failureLesson: string
  proudMoment: string
}

export interface TimeCommitment {
  hoursSchoolYear: string
  hoursSummer: string
  preferredPace: string
}

export interface AssessmentData {
  basicInfo: BasicInfo
  academicProfile: AcademicProfile
  testingInfo: TestingInfo
  extracurriculars: Extracurriculars
  leadership: Leadership
  competitions: Competitions
  passions: Passions
  careerAspirations: CareerAspirations
  researchExperience: ResearchExperience
  summerPrograms: SummerPrograms
  specialTalents: SpecialTalents
  familyContext: FamilyContext
  personality: Personality
  personalStories: PersonalStories
  timeCommitment: TimeCommitment
}

export const initialFormData: AssessmentData = {
  basicInfo: {
    fullName: "",
    email: "",
    phone: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    dateOfBirth: "",
    currentGrade: "",
    schoolName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    targetCollegeYear: new Date().getFullYear() + 4,
    gender: "",
    ethnicity: "",
    dreamSchools: ["", "", ""],
    studyAbroad: false,
    targetCountries: [],
    curriculum: ""
  },
  academicProfile: {
    curriculum: "",
    gpaScale: "",
    gpaUnweighted: "",
    gpaWeighted: "",
    coursesTaken: [],
    coursesPlanned: [],
    regularCoursesTaken: [],
    regularCoursesPlanned: [],
    classRank: "",
    favoriteSubjects: [],
    leastFavoriteSubjects: [],
    academicAwards: ""
  },
  testingInfo: {
    psatScore: "",
    psatMath: "",
    psatReading: "",
    satScore: "",
    actScore: "",
    testingTimeline: "",
    apScores: "",
    preferredTestFormat: "",
    satMath: "",
    satReading: "",
    actEnglish: "",
    actMath: "",
    actReading: "",
    actScience: "",
    notTakenYet: false
  },
  extracurriculars: {
    activities: [{ name: "", role: "", yearsInvolved: "", hoursPerWeek: "", achievements: "" }],
    noExtracurriculars: false
  },
  leadership: {
    positions: "",
    organizations: "",
    awards: "",
    scale: "",
    noLeadershipExperience: false,
    entries: [{ position: "", organization: "", awards: "", scale: "" }]
  },
  competitions: {
    competitions: "",
    recognitions: "",
    noCompetitions: false,
    entries: [{ competition: "", recognition: "" }]
  },
  passions: {
    topicsYouLove: [],
    industriesCurious: [],
    topic1: "",
    topic2: "",
    topic3: "",
    topic4: "",
    topic5: "",
    industry1: "",
    industry2: "",
    industry3: "",
    hobbiesSkills: "",
    worldProblem: ""
  },
  careerAspirations: {
    career1: "",
    career2: "",
    career3: "",
    dreamJobTitle: "",
    bestFitStatement: ""
  },
  researchExperience: {
    researchExperience: "",
    shadowingExperience: "",
    internships: "",
    noResearchExperience: false,
    entries: [{ type: "Research", organization: "", role: "", description: "", duration: "" }]
  },
  summerPrograms: {
    programs: "",
    entries: [{ name: "", organization: "", description: "", year: "" }],
    noSummerPrograms: false
  },
  specialTalents: {
    musicInstruments: "",
    visualArts: "",
    performanceArts: "",
    athletics: ""
  },
  familyContext: {
    familyProfessions: "",
    fatherProfession: "",
    motherProfession: "",
    siblingProfessions: "",
    legacyConnections: "",
    legacyEntries: [{ college: "", relation: "" }],
    annualFamilyIncome: "",
    financialAidNeeded: false,
    meritScholarshipInterest: false
  },
  personality: {
    topStrengths: [],
    topWeaknesses: [],
    strength1: "",
    strength2: "",
    strength3: "",
    weakness1: "",
    weakness2: "",
    weakness3: "",
    archetypes: [],
    introvertExtrovert: ""
  },
  personalStories: {
    lifeChallenge: "",
    leadershipMoment: "",
    failureLesson: "",
    proudMoment: ""
  },
  timeCommitment: {
    hoursSchoolYear: "",
    hoursSummer: "",
    preferredPace: ""
  }
}

export const SECTION_TITLES = [
  "Basic Information",
  "Academic Profile",
  "Standardized Testing",
  "Extracurricular Activities",
  "Leadership Experience",
  "Competitions & Recognitions",
  "Passions & Interests",
  "Career Aspirations",
  "Research & Internship Exposure",
  "Summer Programs",
  "Special Talents",
  "Family Context",
  "Personality Insights",
  "Personal Storytelling",
  "Time Commitment"
]

export const GRADE_OPTIONS = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade (Freshman)",
  "10th Grade (Sophomore)",
  "11th Grade (Junior)",
  "12th Grade (Senior)"
]

export const SUBJECT_OPTIONS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "History",
  "Economics",
  "Psychology",
  "Art",
  "Music",
  "Foreign Languages",
  "Physical Education"
]

export const ARCHETYPE_OPTIONS = [
  "Visionary",
  "Builder",
  "Healer",
  "Analyst",
  "Artist",
  "Advocate",
  "Entrepreneur",
  "Researcher"
]

export const CAREER_STATEMENT_OPTIONS = [
  "I love solving problems with logic.",
  "I love helping people directly.",
  "I love creating beautiful or powerful things.",
  "I love building businesses and making things grow."
]

export const PHONE_COUNTRY_CODES = [
  { code: "+1", country: "US", flag: "\u{1F1FA}\u{1F1F8}", label: "United States" },
  { code: "+1", country: "CA", flag: "\u{1F1E8}\u{1F1E6}", label: "Canada" },
  { code: "+44", country: "GB", flag: "\u{1F1EC}\u{1F1E7}", label: "United Kingdom" },
  { code: "+91", country: "IN", flag: "\u{1F1EE}\u{1F1F3}", label: "India" },
  { code: "+61", country: "AU", flag: "\u{1F1E6}\u{1F1FA}", label: "Australia" },
  { code: "+65", country: "SG", flag: "\u{1F1F8}\u{1F1EC}", label: "Singapore" },
  { code: "+971", country: "AE", flag: "\u{1F1E6}\u{1F1EA}", label: "UAE" },
  { code: "+86", country: "CN", flag: "\u{1F1E8}\u{1F1F3}", label: "China" },
  { code: "+82", country: "KR", flag: "\u{1F1F0}\u{1F1F7}", label: "South Korea" },
  { code: "+81", country: "JP", flag: "\u{1F1EF}\u{1F1F5}", label: "Japan" },
  { code: "+49", country: "DE", flag: "\u{1F1E9}\u{1F1EA}", label: "Germany" },
  { code: "+33", country: "FR", flag: "\u{1F1EB}\u{1F1F7}", label: "France" },
  { code: "+55", country: "BR", flag: "\u{1F1E7}\u{1F1F7}", label: "Brazil" },
  { code: "+52", country: "MX", flag: "\u{1F1F2}\u{1F1FD}", label: "Mexico" },
  { code: "+234", country: "NG", flag: "\u{1F1F3}\u{1F1EC}", label: "Nigeria" },
  { code: "+27", country: "ZA", flag: "\u{1F1FF}\u{1F1E6}", label: "South Africa" },
  { code: "+254", country: "KE", flag: "\u{1F1F0}\u{1F1EA}", label: "Kenya" },
  { code: "+966", country: "SA", flag: "\u{1F1F8}\u{1F1E6}", label: "Saudi Arabia" },
  { code: "+974", country: "QA", flag: "\u{1F1F6}\u{1F1E6}", label: "Qatar" },
  { code: "+968", country: "OM", flag: "\u{1F1F4}\u{1F1F2}", label: "Oman" },
  { code: "+973", country: "BH", flag: "\u{1F1E7}\u{1F1ED}", label: "Bahrain" },
  { code: "+965", country: "KW", flag: "\u{1F1F0}\u{1F1FC}", label: "Kuwait" },
  { code: "+60", country: "MY", flag: "\u{1F1F2}\u{1F1FE}", label: "Malaysia" },
  { code: "+66", country: "TH", flag: "\u{1F1F9}\u{1F1ED}", label: "Thailand" },
  { code: "+62", country: "ID", flag: "\u{1F1EE}\u{1F1E9}", label: "Indonesia" },
  { code: "+63", country: "PH", flag: "\u{1F1F5}\u{1F1ED}", label: "Philippines" },
  { code: "+84", country: "VN", flag: "\u{1F1FB}\u{1F1F3}", label: "Vietnam" },
  { code: "+92", country: "PK", flag: "\u{1F1F5}\u{1F1F0}", label: "Pakistan" },
  { code: "+880", country: "BD", flag: "\u{1F1E7}\u{1F1E9}", label: "Bangladesh" },
  { code: "+94", country: "LK", flag: "\u{1F1F1}\u{1F1F0}", label: "Sri Lanka" },
  { code: "+977", country: "NP", flag: "\u{1F1F3}\u{1F1F5}", label: "Nepal" },
  { code: "+64", country: "NZ", flag: "\u{1F1F3}\u{1F1FF}", label: "New Zealand" },
  { code: "+353", country: "IE", flag: "\u{1F1EE}\u{1F1EA}", label: "Ireland" },
  { code: "+41", country: "CH", flag: "\u{1F1E8}\u{1F1ED}", label: "Switzerland" },
  { code: "+31", country: "NL", flag: "\u{1F1F3}\u{1F1F1}", label: "Netherlands" },
  { code: "+46", country: "SE", flag: "\u{1F1F8}\u{1F1EA}", label: "Sweden" },
  { code: "+47", country: "NO", flag: "\u{1F1F3}\u{1F1F4}", label: "Norway" },
  { code: "+45", country: "DK", flag: "\u{1F1E9}\u{1F1F0}", label: "Denmark" },
  { code: "+358", country: "FI", flag: "\u{1F1EB}\u{1F1EE}", label: "Finland" },
  { code: "+39", country: "IT", flag: "\u{1F1EE}\u{1F1F9}", label: "Italy" },
  { code: "+34", country: "ES", flag: "\u{1F1EA}\u{1F1F8}", label: "Spain" },
  { code: "+351", country: "PT", flag: "\u{1F1F5}\u{1F1F9}", label: "Portugal" },
  { code: "+48", country: "PL", flag: "\u{1F1F5}\u{1F1F1}", label: "Poland" },
  { code: "+43", country: "AT", flag: "\u{1F1E6}\u{1F1F9}", label: "Austria" },
  { code: "+32", country: "BE", flag: "\u{1F1E7}\u{1F1EA}", label: "Belgium" },
  { code: "+30", country: "GR", flag: "\u{1F1EC}\u{1F1F7}", label: "Greece" },
  { code: "+90", country: "TR", flag: "\u{1F1F9}\u{1F1F7}", label: "Turkey" },
  { code: "+972", country: "IL", flag: "\u{1F1EE}\u{1F1F1}", label: "Israel" },
  { code: "+20", country: "EG", flag: "\u{1F1EA}\u{1F1EC}", label: "Egypt" },
  { code: "+7", country: "RU", flag: "\u{1F1F7}\u{1F1FA}", label: "Russia" },
  { code: "+380", country: "UA", flag: "\u{1F1FA}\u{1F1E6}", label: "Ukraine" },
  { code: "+40", country: "RO", flag: "\u{1F1F7}\u{1F1F4}", label: "Romania" },
  { code: "+36", country: "HU", flag: "\u{1F1ED}\u{1F1FA}", label: "Hungary" },
  { code: "+420", country: "CZ", flag: "\u{1F1E8}\u{1F1FF}", label: "Czech Republic" },
  { code: "+56", country: "CL", flag: "\u{1F1E8}\u{1F1F1}", label: "Chile" },
  { code: "+57", country: "CO", flag: "\u{1F1E8}\u{1F1F4}", label: "Colombia" },
  { code: "+54", country: "AR", flag: "\u{1F1E6}\u{1F1F7}", label: "Argentina" },
  { code: "+51", country: "PE", flag: "\u{1F1F5}\u{1F1EA}", label: "Peru" },
  { code: "+852", country: "HK", flag: "\u{1F1ED}\u{1F1F0}", label: "Hong Kong" },
  { code: "+886", country: "TW", flag: "\u{1F1F9}\u{1F1FC}", label: "Taiwan" },
]

export const GPA_SCALE_OPTIONS = [
  { label: "4.0 Scale (Unweighted)", value: "4.0_uw" },
  { label: "5.0 Scale (Weighted)", value: "5.0_w" },
  { label: "6.0 Scale (Weighted)", value: "6.0_w" },
  { label: "100-Point Scale (Percentage)", value: "100_point" },
  { label: "10.0 CGPA (India)", value: "10.0_cgpa" },
  { label: "7.0 Scale (Australia)", value: "7.0_australia" },
  { label: "4.33 Scale (Canada)", value: "4.33_canada" },
  { label: "4.0 Scale (UK)", value: "4.0_uk" },
  { label: "5.0 Scale (South Korea)", value: "5.0_korea" },
  { label: "4.0 Scale (Singapore)", value: "4.0_singapore" },
  { label: "20-Point Scale (France)", value: "20_france" },
  { label: "15-Point Scale (Germany)", value: "15_germany" },
  { label: "IB 7-Point Scale", value: "7.0_ib" },
  { label: "Other", value: "other" },
]

export const PACE_OPTIONS = [
  "Fast-Track (intense, quicker impact)",
  "Steady Progress (balanced with schoolwork)",
  "Flexible (depending on other priorities)"
]

export const COUNTRY_OPTIONS = [
  "United States",
  "India",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "United Arab Emirates",
  "China",
  "South Korea",
  "Germany",
  "France",
  "Brazil",
  "Japan",
  "Switzerland",
  "Netherlands",
  "Ireland",
  "Other"
]

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
  "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
  "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
  "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
  "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
  "District of Columbia"
]

export const CURRICULUM_OPTIONS = [
  { category: "International", curriculums: ["IB (International Baccalaureate)", "IGCSE (Cambridge)", "A-Levels (Cambridge)", "AP (Advanced Placement)"] },
  { category: "Indian National", curriculums: ["CBSE", "ICSE / ISC", "NIOS"] },
  { category: "European National", curriculums: ["French Baccalaureate", "German Abitur", "European Baccalaureate", "Scottish Highers", "Swiss/Italian Maturit\u00E0"] },
  { category: "North American", curriculums: ["US High School Diploma", "OSSD (Ontario, Canada)", "BC Curriculum (Canada)"] },
  { category: "Oceania", curriculums: ["Australian State Certs", "NCEA (New Zealand)"] },
  { category: "Vocational / Alt", curriculums: ["BTEC (UK)", "IPC / IMYC", "Montessori / Waldorf"] },
  { category: "Other National", curriculums: ["Gaokao (China)", "Other"] }
]

// Curriculum tags used for filtering courses
// Each course is tagged with the curriculum systems it belongs to
export type CurriculumTag = "AP" | "IB" | "A-Level" | "IGCSE" | "CBSE" | "ICSE" | "NIOS" | "US" | "Honors" | "French_Bac" | "German_Abitur" | "European_Bac" | "Scottish" | "Swiss_Matura" | "Italian_Matura" | "OSSD" | "BC" | "Australian" | "NCEA" | "BTEC" | "Gaokao" | "Universal"

export interface TaggedCourse {
  name: string
  tags: CurriculumTag[]
}

export interface TaggedCourseCategory {
  category: string
  courses: TaggedCourse[]
}

export const COURSE_CATEGORIES: TaggedCourseCategory[] = [
  {
    category: "Mathematics & Computer Science",
    courses: [
      // AP
      { name: "AP Calculus AB", tags: ["AP", "US"] },
      { name: "AP Calculus BC", tags: ["AP", "US"] },
      { name: "AP Precalculus", tags: ["AP", "US"] },
      { name: "AP Statistics", tags: ["AP", "US"] },
      { name: "AP Computer Science A", tags: ["AP", "US"] },
      { name: "AP Computer Science Principles", tags: ["AP", "US"] },
      // IB
      { name: "IB Mathematics: Analysis & Approaches (HL/SL)", tags: ["IB"] },
      { name: "IB Mathematics: Applications & Interpretation (HL/SL)", tags: ["IB"] },
      { name: "IB Computer Science (HL/SL)", tags: ["IB"] },
      // A-Level
      { name: "A-Level Mathematics", tags: ["A-Level"] },
      { name: "A-Level Further Mathematics", tags: ["A-Level"] },
      { name: "A-Level Computer Science", tags: ["A-Level"] },
      // IGCSE
      { name: "IGCSE Mathematics", tags: ["IGCSE"] },
      { name: "IGCSE Additional Mathematics", tags: ["IGCSE"] },
      { name: "IGCSE Computer Science", tags: ["IGCSE"] },
      { name: "IGCSE Information & Communication Technology", tags: ["IGCSE"] },
      // CBSE
      { name: "CBSE Mathematics", tags: ["CBSE"] },
      { name: "CBSE Applied Mathematics", tags: ["CBSE"] },
      { name: "CBSE Computer Science", tags: ["CBSE"] },
      { name: "CBSE Informatics Practices", tags: ["CBSE"] },
      // ICSE / ISC
      { name: "ISC Mathematics", tags: ["ICSE"] },
      { name: "ISC Computer Science", tags: ["ICSE"] },
      // NIOS
      { name: "NIOS Mathematics", tags: ["NIOS"] },
      { name: "NIOS Computer Science", tags: ["NIOS"] },
      // French Bac
      { name: "Mathematics (Sp\u00E9cialit\u00E9)", tags: ["French_Bac"] },
      { name: "Advanced Mathematics (Expert)", tags: ["French_Bac"] },
      { name: "Complementary Mathematics", tags: ["French_Bac"] },
      { name: "Computer Science & Digital Sciences (NSI)", tags: ["French_Bac"] },
      // German Abitur
      { name: "Mathematik (Mathematics)", tags: ["German_Abitur"] },
      { name: "Informatik (Computer Science)", tags: ["German_Abitur"] },
      // European Bac
      { name: "Mathematics (3 periods)", tags: ["European_Bac"] },
      { name: "Advanced Mathematics (5 periods)", tags: ["European_Bac"] },
      // Scottish
      { name: "Higher Mathematics", tags: ["Scottish"] },
      { name: "Advanced Higher Mathematics", tags: ["Scottish"] },
      { name: "Higher Computing Science", tags: ["Scottish"] },
      { name: "Higher Applications of Mathematics", tags: ["Scottish"] },
      // Swiss Matura
      { name: "Mathematics (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Physics & Applied Mathematics (Schwerpunktfach)", tags: ["Swiss_Matura"] },
      // Italian Matura
      { name: "Matematica (Mathematics)", tags: ["Italian_Matura"] },
      { name: "Informatica (Computer Science)", tags: ["Italian_Matura"] },
      // OSSD (Ontario)
      { name: "Functions (MCR3U)", tags: ["OSSD"] },
      { name: "Advanced Functions (MHF4U)", tags: ["OSSD"] },
      { name: "Calculus & Vectors (MCV4U)", tags: ["OSSD"] },
      { name: "Data Management (MDM4U)", tags: ["OSSD"] },
      { name: "Computer Science (ICS3U/4U)", tags: ["OSSD"] },
      // BC
      { name: "Pre-calculus 11", tags: ["BC"] },
      { name: "Pre-calculus 12", tags: ["BC"] },
      { name: "Calculus 12", tags: ["BC"] },
      { name: "Foundations of Mathematics 11/12", tags: ["BC"] },
      { name: "Computer Programming 11/12", tags: ["BC"] },
      // Australian
      { name: "Mathematical Methods", tags: ["Australian"] },
      { name: "Specialist Mathematics", tags: ["Australian"] },
      { name: "General Mathematics", tags: ["Australian"] },
      { name: "Applied Computing", tags: ["Australian"] },
      // NCEA
      { name: "Mathematics & Statistics (NCEA)", tags: ["NCEA"] },
      { name: "Digital Technologies (NCEA)", tags: ["NCEA"] },
      // BTEC
      { name: "BTEC Computing", tags: ["BTEC"] },
      { name: "BTEC Information Technology", tags: ["BTEC"] },
      // Gaokao
      { name: "Mathematics (Gaokao)", tags: ["Gaokao"] },
      // Honors / US
      { name: "Honors Mathematics", tags: ["Honors", "US"] },
      { name: "Honors Computer Science", tags: ["Honors", "US"] },
    ]
  },
  {
    category: "Sciences",
    courses: [
      // AP
      { name: "AP Biology", tags: ["AP", "US"] },
      { name: "AP Chemistry", tags: ["AP", "US"] },
      { name: "AP Environmental Science", tags: ["AP", "US"] },
      { name: "AP Physics 1: Algebra-Based", tags: ["AP", "US"] },
      { name: "AP Physics 2: Algebra-Based", tags: ["AP", "US"] },
      { name: "AP Physics C: Electricity & Magnetism", tags: ["AP", "US"] },
      { name: "AP Physics C: Mechanics", tags: ["AP", "US"] },
      // IB
      { name: "IB Biology (HL/SL)", tags: ["IB"] },
      { name: "IB Chemistry (HL/SL)", tags: ["IB"] },
      { name: "IB Physics (HL/SL)", tags: ["IB"] },
      { name: "IB Environmental Systems & Societies (SL)", tags: ["IB"] },
      { name: "IB Design Technology (HL/SL)", tags: ["IB"] },
      { name: "IB Sports, Exercise & Health Science (HL/SL)", tags: ["IB"] },
      // A-Level
      { name: "A-Level Biology", tags: ["A-Level"] },
      { name: "A-Level Chemistry", tags: ["A-Level"] },
      { name: "A-Level Physics", tags: ["A-Level"] },
      { name: "A-Level Environmental Management", tags: ["A-Level"] },
      { name: "A-Level Marine Science", tags: ["A-Level"] },
      // IGCSE
      { name: "IGCSE Biology", tags: ["IGCSE"] },
      { name: "IGCSE Chemistry", tags: ["IGCSE"] },
      { name: "IGCSE Physics", tags: ["IGCSE"] },
      { name: "IGCSE Combined Science", tags: ["IGCSE"] },
      { name: "IGCSE Co-ordinated Sciences", tags: ["IGCSE"] },
      { name: "IGCSE Environmental Management", tags: ["IGCSE"] },
      // CBSE
      { name: "CBSE Physics", tags: ["CBSE"] },
      { name: "CBSE Chemistry", tags: ["CBSE"] },
      { name: "CBSE Biology", tags: ["CBSE"] },
      { name: "CBSE Biotechnology", tags: ["CBSE"] },
      // ICSE / ISC
      { name: "ISC Physics", tags: ["ICSE"] },
      { name: "ISC Chemistry", tags: ["ICSE"] },
      { name: "ISC Biology", tags: ["ICSE"] },
      { name: "ISC Biotechnology", tags: ["ICSE"] },
      { name: "ISC Environmental Science", tags: ["ICSE"] },
      // NIOS
      { name: "NIOS Physics", tags: ["NIOS"] },
      { name: "NIOS Chemistry", tags: ["NIOS"] },
      { name: "NIOS Biology", tags: ["NIOS"] },
      // French Bac
      { name: "Physics-Chemistry (Sp\u00E9cialit\u00E9)", tags: ["French_Bac"] },
      { name: "Life & Earth Sciences / SVT (Sp\u00E9cialit\u00E9)", tags: ["French_Bac"] },
      { name: "Engineering Sciences (Sp\u00E9cialit\u00E9)", tags: ["French_Bac"] },
      // German Abitur
      { name: "Physik (Physics)", tags: ["German_Abitur"] },
      { name: "Chemie (Chemistry)", tags: ["German_Abitur"] },
      { name: "Biologie (Biology)", tags: ["German_Abitur"] },
      // European Bac
      { name: "Biology (European Bac)", tags: ["European_Bac"] },
      { name: "Chemistry (European Bac)", tags: ["European_Bac"] },
      { name: "Physics (European Bac)", tags: ["European_Bac"] },
      // Scottish
      { name: "Higher Biology", tags: ["Scottish"] },
      { name: "Higher Chemistry", tags: ["Scottish"] },
      { name: "Higher Physics", tags: ["Scottish"] },
      { name: "Higher Human Biology", tags: ["Scottish"] },
      { name: "Higher Environmental Science", tags: ["Scottish"] },
      // Swiss Matura
      { name: "Physics (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Chemistry (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Biology (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Biology & Chemistry (Schwerpunktfach)", tags: ["Swiss_Matura"] },
      // Italian Matura
      { name: "Fisica (Physics)", tags: ["Italian_Matura"] },
      { name: "Scienze Naturali (Natural Sciences)", tags: ["Italian_Matura"] },
      // OSSD
      { name: "Biology (SBI3U/4U)", tags: ["OSSD"] },
      { name: "Chemistry (SCH3U/4U)", tags: ["OSSD"] },
      { name: "Physics (SPH3U/4U)", tags: ["OSSD"] },
      { name: "Earth & Space Science (SES4U)", tags: ["OSSD"] },
      { name: "Environmental Science (SVN3M)", tags: ["OSSD"] },
      // BC
      { name: "Life Sciences 11", tags: ["BC"] },
      { name: "Chemistry 11/12", tags: ["BC"] },
      { name: "Physics 11/12", tags: ["BC"] },
      { name: "Anatomy & Physiology 12", tags: ["BC"] },
      { name: "Environmental Science 11/12", tags: ["BC"] },
      // Australian
      { name: "Biology (VCE/HSC)", tags: ["Australian"] },
      { name: "Chemistry (VCE/HSC)", tags: ["Australian"] },
      { name: "Physics (VCE/HSC)", tags: ["Australian"] },
      { name: "Psychology (VCE/HSC)", tags: ["Australian"] },
      { name: "Environmental Science (VCE)", tags: ["Australian"] },
      // NCEA
      { name: "Biology (NCEA)", tags: ["NCEA"] },
      { name: "Chemistry (NCEA)", tags: ["NCEA"] },
      { name: "Physics (NCEA)", tags: ["NCEA"] },
      { name: "Earth & Space Science (NCEA)", tags: ["NCEA"] },
      // BTEC
      { name: "BTEC Applied Science", tags: ["BTEC"] },
      { name: "BTEC Applied Human Biology", tags: ["BTEC"] },
      { name: "BTEC Forensic & Criminal Investigation", tags: ["BTEC"] },
      // Gaokao
      { name: "Physics (Gaokao)", tags: ["Gaokao"] },
      { name: "Chemistry (Gaokao)", tags: ["Gaokao"] },
      { name: "Biology (Gaokao)", tags: ["Gaokao"] },
      // Honors / US
      { name: "Honors Biology", tags: ["Honors", "US"] },
      { name: "Honors Chemistry", tags: ["Honors", "US"] },
      { name: "Honors Physics", tags: ["Honors", "US"] },
      { name: "Honors Earth / Environmental Science", tags: ["Honors", "US"] },
    ]
  },
  {
    category: "English & Languages",
    courses: [
      // AP
      { name: "AP English Language & Composition", tags: ["AP", "US"] },
      { name: "AP English Literature & Composition", tags: ["AP", "US"] },
      { name: "AP Chinese Language & Culture", tags: ["AP", "US"] },
      { name: "AP French Language & Culture", tags: ["AP", "US"] },
      { name: "AP German Language & Culture", tags: ["AP", "US"] },
      { name: "AP Italian Language & Culture", tags: ["AP", "US"] },
      { name: "AP Japanese Language & Culture", tags: ["AP", "US"] },
      { name: "AP Latin", tags: ["AP", "US"] },
      { name: "AP Spanish Language & Culture", tags: ["AP", "US"] },
      { name: "AP Spanish Literature & Culture", tags: ["AP", "US"] },
      // IB
      { name: "IB Language A: Language & Literature (HL/SL)", tags: ["IB"] },
      { name: "IB Language A: Literature (HL/SL)", tags: ["IB"] },
      { name: "IB Language B (HL/SL)", tags: ["IB"] },
      { name: "IB Language AB Initio (SL)", tags: ["IB"] },
      { name: "IB Classical Languages: Latin / Greek (HL/SL)", tags: ["IB"] },
      // A-Level
      { name: "A-Level English Language", tags: ["A-Level"] },
      { name: "A-Level English Literature", tags: ["A-Level"] },
      { name: "A-Level French", tags: ["A-Level"] },
      { name: "A-Level Spanish", tags: ["A-Level"] },
      { name: "A-Level German", tags: ["A-Level"] },
      { name: "A-Level Arabic", tags: ["A-Level"] },
      { name: "A-Level Chinese", tags: ["A-Level"] },
      { name: "A-Level Hindi", tags: ["A-Level"] },
      { name: "A-Level Urdu", tags: ["A-Level"] },
      // IGCSE
      { name: "IGCSE English (First Language)", tags: ["IGCSE"] },
      { name: "IGCSE English (Second Language)", tags: ["IGCSE"] },
      { name: "IGCSE French (Foreign Language)", tags: ["IGCSE"] },
      { name: "IGCSE Spanish (Foreign Language)", tags: ["IGCSE"] },
      { name: "IGCSE German (Foreign Language)", tags: ["IGCSE"] },
      { name: "IGCSE Arabic (Foreign Language)", tags: ["IGCSE"] },
      { name: "IGCSE Chinese (Mandarin)", tags: ["IGCSE"] },
      // CBSE
      { name: "CBSE English Core", tags: ["CBSE"] },
      { name: "CBSE English Elective", tags: ["CBSE"] },
      { name: "CBSE Hindi Core / Elective", tags: ["CBSE"] },
      { name: "CBSE Sanskrit", tags: ["CBSE"] },
      { name: "CBSE French / German / Japanese / Spanish", tags: ["CBSE"] },
      // ICSE / ISC
      { name: "ISC English (Compulsory)", tags: ["ICSE"] },
      { name: "ISC Hindi / Regional Language", tags: ["ICSE"] },
      { name: "ISC French / German / Spanish", tags: ["ICSE"] },
      // NIOS
      { name: "NIOS English", tags: ["NIOS"] },
      { name: "NIOS Hindi", tags: ["NIOS"] },
      // French Bac
      { name: "French Language & Literature", tags: ["French_Bac"] },
      { name: "Foreign Languages & Cultures (LLCE)", tags: ["French_Bac"] },
      { name: "Literature, Languages & Cultures of Antiquity (LLCA)", tags: ["French_Bac"] },
      // German Abitur
      { name: "Deutsch (German Language)", tags: ["German_Abitur"] },
      { name: "Englisch (English)", tags: ["German_Abitur"] },
      { name: "Franz\u00F6sisch (French)", tags: ["German_Abitur"] },
      { name: "Latein (Latin)", tags: ["German_Abitur"] },
      { name: "Spanisch (Spanish)", tags: ["German_Abitur"] },
      // European Bac
      { name: "Language 1 (Mother Tongue)", tags: ["European_Bac"] },
      { name: "Language 2 (First Foreign Language)", tags: ["European_Bac"] },
      { name: "Language 3 / Language 4 (Elective)", tags: ["European_Bac"] },
      { name: "Latin / Ancient Greek (European Bac)", tags: ["European_Bac"] },
      // Scottish
      { name: "Higher English", tags: ["Scottish"] },
      { name: "Higher French", tags: ["Scottish"] },
      { name: "Higher Spanish", tags: ["Scottish"] },
      { name: "Higher German", tags: ["Scottish"] },
      { name: "Higher Latin", tags: ["Scottish"] },
      { name: "Higher Gaelic / G\u00E0idhlig", tags: ["Scottish"] },
      // Swiss Matura
      { name: "First Language (German / French / Italian)", tags: ["Swiss_Matura"] },
      { name: "Second National Language", tags: ["Swiss_Matura"] },
      { name: "Third Language (English / Classical)", tags: ["Swiss_Matura"] },
      // Italian Matura
      { name: "Italiano (Italian Language & Literature)", tags: ["Italian_Matura"] },
      { name: "Lingua Straniera (Foreign Language)", tags: ["Italian_Matura"] },
      { name: "Latino (Latin)", tags: ["Italian_Matura"] },
      { name: "Greco Antico (Ancient Greek)", tags: ["Italian_Matura"] },
      // OSSD
      { name: "English (ENG3U/4U)", tags: ["OSSD"] },
      { name: "The Writer's Craft (EWC4U)", tags: ["OSSD"] },
      { name: "Core French (FSF3U/4U)", tags: ["OSSD"] },
      { name: "French Immersion (FIF3U/4U)", tags: ["OSSD"] },
      // BC
      { name: "English Studies 12", tags: ["BC"] },
      { name: "Literary Studies 11/12", tags: ["BC"] },
      { name: "Creative Writing 11/12", tags: ["BC"] },
      { name: "English First Peoples 11/12", tags: ["BC"] },
      { name: "French 11/12", tags: ["BC"] },
      { name: "Spanish 11/12", tags: ["BC"] },
      { name: "Mandarin 11/12", tags: ["BC"] },
      { name: "Japanese 11/12", tags: ["BC"] },
      // Australian
      { name: "English (VCE/HSC)", tags: ["Australian"] },
      { name: "English Language (VCE)", tags: ["Australian"] },
      { name: "Literature (VCE/HSC)", tags: ["Australian"] },
      { name: "French (VCE/HSC)", tags: ["Australian"] },
      { name: "Japanese (VCE/HSC)", tags: ["Australian"] },
      { name: "Chinese (VCE/HSC)", tags: ["Australian"] },
      // NCEA
      { name: "English (NCEA)", tags: ["NCEA"] },
      { name: "Te Reo M\u0101ori (NCEA)", tags: ["NCEA"] },
      { name: "French (NCEA)", tags: ["NCEA"] },
      { name: "Spanish (NCEA)", tags: ["NCEA"] },
      { name: "Japanese (NCEA)", tags: ["NCEA"] },
      // Gaokao
      { name: "Chinese Language & Literature (Gaokao)", tags: ["Gaokao"] },
      { name: "Foreign Language \u2014 English (Gaokao)", tags: ["Gaokao"] },
      { name: "Foreign Language \u2014 Japanese / French / German / Spanish / Russian (Gaokao)", tags: ["Gaokao"] },
      // Honors / US
      { name: "Honors English / Literature", tags: ["Honors", "US"] },
      { name: "Honors Foreign Language (Level 3+)", tags: ["Honors", "US"] },
    ]
  },
  {
    category: "History & Social Sciences",
    courses: [
      // AP
      { name: "AP African American Studies", tags: ["AP", "US"] },
      { name: "AP Comparative Government & Politics", tags: ["AP", "US"] },
      { name: "AP European History", tags: ["AP", "US"] },
      { name: "AP Human Geography", tags: ["AP", "US"] },
      { name: "AP Macroeconomics", tags: ["AP", "US"] },
      { name: "AP Microeconomics", tags: ["AP", "US"] },
      { name: "AP Psychology", tags: ["AP", "US"] },
      { name: "AP United States Government & Politics", tags: ["AP", "US"] },
      { name: "AP United States History", tags: ["AP", "US"] },
      { name: "AP World History: Modern", tags: ["AP", "US"] },
      // IB
      { name: "IB Business Management (HL/SL)", tags: ["IB"] },
      { name: "IB Economics (HL/SL)", tags: ["IB"] },
      { name: "IB Geography (HL/SL)", tags: ["IB"] },
      { name: "IB Global Politics (HL/SL)", tags: ["IB"] },
      { name: "IB History (HL/SL)", tags: ["IB"] },
      { name: "IB Philosophy (HL/SL)", tags: ["IB"] },
      { name: "IB Psychology (HL/SL)", tags: ["IB"] },
      { name: "IB Social & Cultural Anthropology (HL/SL)", tags: ["IB"] },
      { name: "IB Digital Society (HL/SL)", tags: ["IB"] },
      { name: "IB World Religions (SL)", tags: ["IB"] },
      { name: "IB Theory of Knowledge (TOK)", tags: ["IB"] },
      // A-Level
      { name: "A-Level Economics", tags: ["A-Level"] },
      { name: "A-Level History", tags: ["A-Level"] },
      { name: "A-Level Psychology", tags: ["A-Level"] },
      { name: "A-Level Business", tags: ["A-Level"] },
      { name: "A-Level Law", tags: ["A-Level"] },
      { name: "A-Level Sociology", tags: ["A-Level"] },
      { name: "A-Level Geography", tags: ["A-Level"] },
      { name: "A-Level Accounting", tags: ["A-Level"] },
      { name: "A-Level Global Perspectives & Research", tags: ["A-Level"] },
      { name: "A-Level Thinking Skills", tags: ["A-Level"] },
      // IGCSE
      { name: "IGCSE History", tags: ["IGCSE"] },
      { name: "IGCSE Economics", tags: ["IGCSE"] },
      { name: "IGCSE Geography", tags: ["IGCSE"] },
      { name: "IGCSE Business Studies", tags: ["IGCSE"] },
      { name: "IGCSE Accounting", tags: ["IGCSE"] },
      { name: "IGCSE Sociology", tags: ["IGCSE"] },
      { name: "IGCSE Global Perspectives", tags: ["IGCSE"] },
      // CBSE
      { name: "CBSE History", tags: ["CBSE"] },
      { name: "CBSE Geography", tags: ["CBSE"] },
      { name: "CBSE Political Science", tags: ["CBSE"] },
      { name: "CBSE Economics", tags: ["CBSE"] },
      { name: "CBSE Psychology", tags: ["CBSE"] },
      { name: "CBSE Sociology", tags: ["CBSE"] },
      { name: "CBSE Business Studies", tags: ["CBSE"] },
      { name: "CBSE Accountancy", tags: ["CBSE"] },
      { name: "CBSE Legal Studies", tags: ["CBSE"] },
      { name: "CBSE Entrepreneurship", tags: ["CBSE"] },
      // ICSE / ISC
      { name: "ISC History", tags: ["ICSE"] },
      { name: "ISC Political Science", tags: ["ICSE"] },
      { name: "ISC Geography", tags: ["ICSE"] },
      { name: "ISC Economics", tags: ["ICSE"] },
      { name: "ISC Psychology", tags: ["ICSE"] },
      { name: "ISC Sociology", tags: ["ICSE"] },
      { name: "ISC Accounts", tags: ["ICSE"] },
      { name: "ISC Commerce", tags: ["ICSE"] },
      { name: "ISC Business Studies", tags: ["ICSE"] },
      { name: "ISC Legal Studies", tags: ["ICSE"] },
      // NIOS
      { name: "NIOS History", tags: ["NIOS"] },
      { name: "NIOS Geography", tags: ["NIOS"] },
      { name: "NIOS Political Science", tags: ["NIOS"] },
      { name: "NIOS Economics", tags: ["NIOS"] },
      { name: "NIOS Psychology", tags: ["NIOS"] },
      { name: "NIOS Business Studies", tags: ["NIOS"] },
      { name: "NIOS Accountancy", tags: ["NIOS"] },
      // French Bac
      { name: "History-Geography", tags: ["French_Bac"] },
      { name: "Economic & Social Sciences (SES)", tags: ["French_Bac"] },
      { name: "History, Geography, Geopolitics & Political Science (HGGSP)", tags: ["French_Bac"] },
      { name: "Humanities, Literature & Philosophy (HLP)", tags: ["French_Bac"] },
      { name: "Philosophy (Terminale \u2014 compulsory)", tags: ["French_Bac"] },
      // German Abitur
      { name: "Geschichte (History)", tags: ["German_Abitur"] },
      { name: "Geographie (Geography)", tags: ["German_Abitur"] },
      { name: "Politik / Sozialkunde (Politics / Social Studies)", tags: ["German_Abitur"] },
      { name: "Wirtschaft (Economics)", tags: ["German_Abitur"] },
      { name: "Philosophie (Philosophy)", tags: ["German_Abitur"] },
      { name: "P\u00E4dagogik (Education / Pedagogy)", tags: ["German_Abitur"] },
      // European Bac
      { name: "History (European Bac)", tags: ["European_Bac"] },
      { name: "Geography (European Bac)", tags: ["European_Bac"] },
      { name: "Philosophy (European Bac)", tags: ["European_Bac"] },
      { name: "Economics (European Bac)", tags: ["European_Bac"] },
      { name: "Sociology (European Bac)", tags: ["European_Bac"] },
      // Scottish
      { name: "Higher History", tags: ["Scottish"] },
      { name: "Higher Geography", tags: ["Scottish"] },
      { name: "Higher Modern Studies", tags: ["Scottish"] },
      { name: "Higher Economics", tags: ["Scottish"] },
      { name: "Higher Psychology", tags: ["Scottish"] },
      { name: "Higher Philosophy", tags: ["Scottish"] },
      { name: "Higher Politics", tags: ["Scottish"] },
      { name: "Higher Business Management", tags: ["Scottish"] },
      { name: "Higher Accounting", tags: ["Scottish"] },
      // Swiss Matura
      { name: "History (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Geography (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Economics & Law (Grundlagenfach)", tags: ["Swiss_Matura"] },
      // Italian Matura
      { name: "Storia (History)", tags: ["Italian_Matura"] },
      { name: "Filosofia (Philosophy)", tags: ["Italian_Matura"] },
      { name: "Diritto ed Economia (Law & Economics)", tags: ["Italian_Matura"] },
      { name: "Scienze Umane (Human Sciences)", tags: ["Italian_Matura"] },
      // OSSD
      { name: "World History (CHY4U)", tags: ["OSSD"] },
      { name: "Canadian History (CHI4U)", tags: ["OSSD"] },
      { name: "Canadian & International Law (CLN4U)", tags: ["OSSD"] },
      { name: "Canadian & International Politics (CPW4U)", tags: ["OSSD"] },
      { name: "Economics (CIA4U)", tags: ["OSSD"] },
      { name: "Challenge & Change in Society (HSB4U)", tags: ["OSSD"] },
      { name: "World Issues: Geographic Analysis (CGW4U)", tags: ["OSSD"] },
      // BC
      { name: "20th Century World History 12", tags: ["BC"] },
      { name: "Law Studies 12", tags: ["BC"] },
      { name: "Political Studies 12", tags: ["BC"] },
      { name: "Economic Theory 12", tags: ["BC"] },
      { name: "Philosophy 12", tags: ["BC"] },
      { name: "Social Justice 12", tags: ["BC"] },
      { name: "Human Geography 12", tags: ["BC"] },
      // Australian
      { name: "History (VCE/HSC)", tags: ["Australian"] },
      { name: "Geography (VCE/HSC)", tags: ["Australian"] },
      { name: "Economics (VCE/HSC)", tags: ["Australian"] },
      { name: "Legal Studies (VCE/HSC)", tags: ["Australian"] },
      { name: "Business Management (VCE)", tags: ["Australian"] },
      { name: "Accounting (VCE/HSC)", tags: ["Australian"] },
      { name: "Society & Culture (HSC)", tags: ["Australian"] },
      // NCEA
      { name: "History (NCEA)", tags: ["NCEA"] },
      { name: "Geography (NCEA)", tags: ["NCEA"] },
      { name: "Economics (NCEA)", tags: ["NCEA"] },
      { name: "Classical Studies (NCEA)", tags: ["NCEA"] },
      { name: "Legal Studies (NCEA)", tags: ["NCEA"] },
      // BTEC
      { name: "BTEC Business", tags: ["BTEC"] },
      { name: "BTEC Enterprise & Entrepreneurship", tags: ["BTEC"] },
      { name: "BTEC Applied Law", tags: ["BTEC"] },
      { name: "BTEC Applied Psychology", tags: ["BTEC"] },
      // Gaokao
      { name: "History (Gaokao)", tags: ["Gaokao"] },
      { name: "Political Science / Ideology & Politics (Gaokao)", tags: ["Gaokao"] },
      { name: "Geography (Gaokao)", tags: ["Gaokao"] },
      // Honors / US
      { name: "Honors World History", tags: ["Honors", "US"] },
      { name: "Honors US History", tags: ["Honors", "US"] },
      { name: "Honors Government / Civics", tags: ["Honors", "US"] },
      { name: "Honors Economics", tags: ["Honors", "US"] },
      { name: "Honors Psychology", tags: ["Honors", "US"] },
    ]
  },
  {
    category: "Arts & Interdisciplinary",
    courses: [
      // AP
      { name: "AP Art History", tags: ["AP", "US"] },
      { name: "AP Drawing", tags: ["AP", "US"] },
      { name: "AP 2-D Art & Design", tags: ["AP", "US"] },
      { name: "AP 3-D Art & Design", tags: ["AP", "US"] },
      { name: "AP Music Theory", tags: ["AP", "US"] },
      { name: "AP Research", tags: ["AP", "US"] },
      { name: "AP Seminar", tags: ["AP", "US"] },
      // IB
      { name: "IB Visual Arts (HL/SL)", tags: ["IB"] },
      { name: "IB Music (HL/SL)", tags: ["IB"] },
      { name: "IB Theatre (HL/SL)", tags: ["IB"] },
      { name: "IB Film (HL/SL)", tags: ["IB"] },
      { name: "IB Dance (HL/SL)", tags: ["IB"] },
      // A-Level
      { name: "A-Level Art & Design", tags: ["A-Level"] },
      { name: "A-Level Music", tags: ["A-Level"] },
      { name: "A-Level Drama", tags: ["A-Level"] },
      { name: "A-Level Media Studies", tags: ["A-Level"] },
      // IGCSE
      { name: "IGCSE Art & Design", tags: ["IGCSE"] },
      { name: "IGCSE Music", tags: ["IGCSE"] },
      { name: "IGCSE Drama", tags: ["IGCSE"] },
      // CBSE
      { name: "CBSE Fine Arts (Painting / Graphics / Sculpture)", tags: ["CBSE"] },
      { name: "CBSE Music (Hindustani / Carnatic)", tags: ["CBSE"] },
      // ICSE / ISC
      { name: "ISC Art", tags: ["ICSE"] },
      { name: "ISC Music (Indian / Western)", tags: ["ICSE"] },
      // French Bac
      { name: "Arts (Visual Arts / Cinema / Music / Theatre / Dance)", tags: ["French_Bac"] },
      // German Abitur
      { name: "Kunst (Art)", tags: ["German_Abitur"] },
      { name: "Musik (Music)", tags: ["German_Abitur"] },
      { name: "Darstellendes Spiel (Theatre)", tags: ["German_Abitur"] },
      // European Bac
      { name: "Art (European Bac)", tags: ["European_Bac"] },
      { name: "Music (European Bac)", tags: ["European_Bac"] },
      // Scottish
      { name: "Higher Art & Design", tags: ["Scottish"] },
      { name: "Higher Music", tags: ["Scottish"] },
      { name: "Higher Drama", tags: ["Scottish"] },
      { name: "Higher Photography", tags: ["Scottish"] },
      { name: "Higher Dance", tags: ["Scottish"] },
      { name: "Higher Music Technology", tags: ["Scottish"] },
      // Swiss Matura
      { name: "Visual Arts / Music (Grundlagenfach)", tags: ["Swiss_Matura"] },
      { name: "Visual Arts (Schwerpunktfach)", tags: ["Swiss_Matura"] },
      { name: "Music (Schwerpunktfach)", tags: ["Swiss_Matura"] },
      // Italian Matura
      { name: "Storia dell'Arte (Art History)", tags: ["Italian_Matura"] },
      { name: "Discipline Artistiche (Artistic Disciplines)", tags: ["Italian_Matura"] },
      // OSSD
      { name: "Visual Arts (AVI3M/4M)", tags: ["OSSD"] },
      { name: "Music (AMU3M/4M)", tags: ["OSSD"] },
      { name: "Drama (ADA3M/4M)", tags: ["OSSD"] },
      { name: "Media Arts (ASM4M)", tags: ["OSSD"] },
      // BC
      { name: "Art Studio 11/12", tags: ["BC"] },
      { name: "Drama 11/12", tags: ["BC"] },
      { name: "Film & Television 11/12", tags: ["BC"] },
      { name: "Music (Choral/Instrumental) 11/12", tags: ["BC"] },
      { name: "Photography 11/12", tags: ["BC"] },
      { name: "Dance 11/12", tags: ["BC"] },
      // Australian
      { name: "Visual Arts (VCE/HSC)", tags: ["Australian"] },
      { name: "Music (VCE/HSC)", tags: ["Australian"] },
      { name: "Drama (VCE/HSC)", tags: ["Australian"] },
      { name: "Dance (VCE/HSC)", tags: ["Australian"] },
      { name: "Media (VCE/HSC)", tags: ["Australian"] },
      // NCEA
      { name: "Visual Arts (NCEA)", tags: ["NCEA"] },
      { name: "Music (NCEA)", tags: ["NCEA"] },
      { name: "Drama (NCEA)", tags: ["NCEA"] },
      { name: "Dance (NCEA)", tags: ["NCEA"] },
      { name: "Media Studies (NCEA)", tags: ["NCEA"] },
      // BTEC
      { name: "BTEC Art & Design", tags: ["BTEC"] },
      { name: "BTEC Performing Arts", tags: ["BTEC"] },
      { name: "BTEC Music / Music Technology", tags: ["BTEC"] },
      { name: "BTEC Creative Digital Media Production", tags: ["BTEC"] },
      // Universal
      { name: "Dual Enrollment (College Credit) Course", tags: ["Universal"] },
      { name: "Honors Arts / Music", tags: ["Honors", "US"] },
    ]
  },
  {
    category: "Career, Technical & Other",
    courses: [
      // AP
      { name: "AP Business with Personal Finance", tags: ["AP", "US"] },
      { name: "AP Cybersecurity", tags: ["AP", "US"] },
      // CBSE
      { name: "CBSE Physical Education", tags: ["CBSE"] },
      { name: "CBSE Home Science", tags: ["CBSE"] },
      { name: "CBSE Engineering Graphics", tags: ["CBSE"] },
      // ICSE
      { name: "ISC Physical Education", tags: ["ICSE"] },
      { name: "ISC Home Science", tags: ["ICSE"] },
      { name: "ISC Fashion Designing", tags: ["ICSE"] },
      { name: "ISC Hospitality Management", tags: ["ICSE"] },
      // NIOS
      { name: "NIOS Home Science", tags: ["NIOS"] },
      { name: "NIOS Data Entry Operations", tags: ["NIOS"] },
      // French Bac
      { name: "Physical Education, Sport Practices & Cultures (EPPCS)", tags: ["French_Bac"] },
      { name: "Moral & Civic Education (EMC)", tags: ["French_Bac"] },
      // German Abitur
      { name: "Religion / Ethik (Religion / Ethics)", tags: ["German_Abitur"] },
      { name: "Sport (Physical Education)", tags: ["German_Abitur"] },
      // European Bac
      { name: "Religion / Ethics (European Bac)", tags: ["European_Bac"] },
      { name: "Physical Education (European Bac)", tags: ["European_Bac"] },
      // Scottish
      { name: "Higher Physical Education", tags: ["Scottish"] },
      { name: "Higher Design & Manufacture", tags: ["Scottish"] },
      { name: "Higher Engineering Science", tags: ["Scottish"] },
      { name: "Higher Health & Food Technology", tags: ["Scottish"] },
      // IGCSE
      { name: "IGCSE Design & Technology", tags: ["IGCSE"] },
      { name: "IGCSE Physical Education", tags: ["IGCSE"] },
      { name: "IGCSE Food & Nutrition", tags: ["IGCSE"] },
      { name: "IGCSE Travel & Tourism", tags: ["IGCSE"] },
      // OSSD
      { name: "Financial Accounting (BAF3M/BAT4M)", tags: ["OSSD"] },
      { name: "Business Leadership (BOH4M)", tags: ["OSSD"] },
      { name: "International Business (BBB4M)", tags: ["OSSD"] },
      { name: "Healthy Active Living (PPL3O/4O)", tags: ["OSSD"] },
      { name: "Kinesiology (PSK4U)", tags: ["OSSD"] },
      // BC
      { name: "Engineering 11/12", tags: ["BC"] },
      { name: "Food Studies 11/12", tags: ["BC"] },
      { name: "Entrepreneurship 12", tags: ["BC"] },
      { name: "Active Living 11/12", tags: ["BC"] },
      // Australian
      { name: "Health & Human Development (VCE)", tags: ["Australian"] },
      { name: "Physical Education (VCE/HSC)", tags: ["Australian"] },
      { name: "Food Studies (VCE)", tags: ["Australian"] },
      { name: "Design & Technologies (VCE/HSC)", tags: ["Australian"] },
      // NCEA
      { name: "Health (NCEA)", tags: ["NCEA"] },
      { name: "Physical Education (NCEA)", tags: ["NCEA"] },
      { name: "Technology (NCEA)", tags: ["NCEA"] },
      // BTEC
      { name: "BTEC Health & Social Care", tags: ["BTEC"] },
      { name: "BTEC Sport & Exercise Science", tags: ["BTEC"] },
      { name: "BTEC Engineering", tags: ["BTEC"] },
      { name: "BTEC Travel & Tourism", tags: ["BTEC"] },
      { name: "BTEC Esports", tags: ["BTEC"] },
    ]
  }
]

export const AP_COURSE_OPTIONS = COURSE_CATEGORIES.flatMap(cat => cat.courses.map(c => c.name))

// Regular/standard courses — shown for all curriculums as universal options
export const REGULAR_COURSE_CATEGORIES = [
  {
    category: "Mathematics",
    courses: [
      "General Mathematics",
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Pre-Calculus",
      "Calculus",
      "Statistics",
      "Applied Mathematics",
      "Financial Literacy / Consumer Math"
    ]
  },
  {
    category: "Sciences",
    courses: [
      "General Science",
      "Biology",
      "Chemistry",
      "Physics",
      "Earth Science",
      "Environmental Science",
      "Anatomy & Physiology"
    ]
  },
  {
    category: "Language & Literature",
    courses: [
      "Native Language (Literature / Composition)",
      "Second / Foreign Language",
      "Creative Writing",
      "Speech & Communication"
    ]
  },
  {
    category: "Social Sciences & Humanities",
    courses: [
      "World History",
      "National History",
      "Geography",
      "Economics",
      "Psychology",
      "Sociology",
      "Philosophy",
      "Political Science / Civics",
      "Religious Studies / Ethics"
    ]
  },
  {
    category: "Arts",
    courses: [
      "Visual Arts / Drawing",
      "Painting",
      "Sculpture / Ceramics",
      "Music (Vocal / Instrumental)",
      "Theatre / Drama",
      "Dance",
      "Film / Media Studies",
      "Photography",
      "Digital Art / Graphic Design"
    ]
  },
  {
    category: "Technology & Career",
    courses: [
      "Introduction to Computer Science",
      "Web Design / Digital Literacy",
      "Design & Technology",
      "Business Studies",
      "Accounting"
    ]
  },
  {
    category: "Physical Education & Health",
    courses: [
      "Physical Education",
      "Health Education"
    ]
  }
]
