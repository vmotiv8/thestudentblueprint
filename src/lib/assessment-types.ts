export interface BasicInfo {
  fullName: string
  email: string
  parentName: string
  parentEmail: string
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
  gpaUnweighted?: string
  gpaWeighted?: string
  coursesTaken: string[]
  coursesPlanned: string[]
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
}

export interface SpecialTalents {
  musicInstruments: string
  visualArts: string
  performanceArts: string
  athletics: string
}

export interface FamilyContext {
  familyProfessions: string
  legacyConnections: string
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
    parentName: "",
    parentEmail: "",
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
    gpaUnweighted: "",
    gpaWeighted: "",
    coursesTaken: [],
    coursesPlanned: [],
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
    activities: [{ name: "", role: "", yearsInvolved: "", hoursPerWeek: "", achievements: "" }]
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
    entries: [{ name: "", organization: "", description: "", year: "" }]
  },
  specialTalents: {
    musicInstruments: "",
    visualArts: "",
    performanceArts: "",
    athletics: ""
  },
  familyContext: {
    familyProfessions: "",
    legacyConnections: "",
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

export const PACE_OPTIONS = [
  "Fast-Track (intense, quicker impact)",
  "Steady Progress (balanced with schoolwork)",
  "Flexible (depending on other priorities)"
]

export const CURRICULUM_OPTIONS = [
  "CBSE (India)",
  "ICSE/ISC (India)",
  "Cambridge (IGCSE/A-Levels)",
  "International Baccalaureate (IB)",
  "Advanced Placement (AP/US)",
  "State Board (India)",
  "Other"
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

export const COURSE_CATEGORIES = [
  {
    category: "Mathematics & Computer Science",
    courses: [
      "CBSE Mathematics (Standard/Applied)",
      "CBSE Computer Science / IP",
      "ISC Mathematics",
      "ISC Computer Science",
      "AP Calculus AB",
      "AP Calculus BC",
      "AP Precalculus",
      "AP Statistics",
      "AP Computer Science A",
      "AP Computer Science Principles",
      "IB Mathematics: Analysis & Approaches (HL/SL)",
      "IB Mathematics: Applications & Interpretation (HL/SL)",
      "IB Computer Science (HL/SL)",
      "Honors Mathematics",
      "Honors Computer Science",
      "A-Level Mathematics",
      "A-Level Further Mathematics",
      "A-Level Computer Science"
    ]
  },
  {
    category: "Sciences",
    courses: [
      "CBSE Physics",
      "CBSE Chemistry",
      "CBSE Biology",
      "CBSE Biotechnology",
      "ISC Physics",
      "ISC Chemistry",
      "ISC Biology",
      "AP Biology",
      "AP Chemistry",
      "AP Environmental Science",
      "AP Physics 1: Algebra-Based",
      "AP Physics 2: Algebra-Based",
      "AP Physics C: Electricity & Magnetism",
      "AP Physics C: Mechanics",
      "IB Biology (HL/SL)",
      "IB Chemistry (HL/SL)",
      "IB Physics (HL/SL)",
      "IB Environmental Systems & Societies (HL/SL)",
      "IB Design Technology (HL/SL)",
      "IB Sports, Exercise & Health Science (HL/SL)",
      "Honors Biology",
      "Honors Chemistry",
      "Honors Physics",
      "Honors Earth / Environmental Science",
      "A-Level Physics",
      "A-Level Chemistry",
      "A-Level Biology"
    ]
  },
  {
    category: "English & Languages",
    courses: [
      "CBSE English Core",
      "CBSE English Elective",
      "ISC English",
      "AP English Language & Composition",
      "AP English Literature & Composition",
      "AP Chinese Language & Culture",
      "AP French Language & Culture",
      "AP German Language & Culture",
      "AP Italian Language & Culture",
      "AP Japanese Language & Culture",
      "AP Latin",
      "AP Spanish Language & Culture",
      "AP Spanish Literature & Culture",
      "IB Language A: Language & Literature (HL/SL)",
      "IB Language A: Literature (HL/SL)",
      "IB Language B (HL/SL)",
      "IB Language AB Initio (SL)",
      "Honors English / Literature",
      "Honors Foreign Language (Level 3+)",
      "A-Level English Literature"
    ]
  },
  {
    category: "History & Social Sciences",
    courses: [
      "CBSE Economics",
      "CBSE History",
      "CBSE Political Science",
      "CBSE Geography",
      "CBSE Psychology",
      "CBSE Sociology",
      "CBSE Business Studies",
      "CBSE Accountancy",
      "ISC Economics",
      "ISC History",
      "ISC Commerce",
      "ISC Accounts",
      "AP African American Studies",
      "AP Comparative Government & Politics",
      "AP European History",
      "AP Human Geography",
      "AP Macroeconomics",
      "AP Microeconomics",
      "AP Psychology",
      "AP United States Government & Politics",
      "AP United States History",
      "AP World History: Modern",
      "IB Business Management (HL/SL)",
      "IB Economics (HL/SL)",
      "IB Geography (HL/SL)",
      "IB Global Politics (HL/SL)",
      "IB History (HL/SL)",
      "IB Philosophy (HL/SL)",
      "IB Psychology (HL/SL)",
      "IB Social & Cultural Anthropology (HL/SL)",
      "IB World Religions (SL)",
      "IB Theory of Knowledge (TOK)",
      "Honors World History",
      "Honors US History",
      "Honors Government / Civics",
      "Honors Economics",
      "Honors Psychology",
      "A-Level Economics",
      "A-Level History",
      "A-Level Psychology",
      "A-Level Business",
      "A-Level Politics"
    ]
  },
  {
    category: "Arts & Interdisciplinary",
    courses: [
      "AP Art History",
      "AP Drawing",
      "AP 2-D Art & Design",
      "AP 3-D Art & Design",
      "AP Music Theory",
      "AP Research",
      "AP Seminar",
      "IB Dance (HL/SL)",
      "IB Film (HL/SL)",
      "IB Music (HL/SL)",
      "IB Theatre (HL/SL)",
      "IB Visual Arts (HL/SL)",
      "Honors Arts / Music",
      "Dual Enrollment (College Credit) Course",
      "AS-Level (Advanced Subsidiary) Course"
    ]
  }
]

export const AP_COURSE_OPTIONS = COURSE_CATEGORIES.flatMap(cat => cat.courses)
