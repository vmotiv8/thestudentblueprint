# B2C Families Homepage — Design Spec

## Overview

Restructure the site so the main homepage (`/`) is a B2C marketing page targeting families and students who want to take the assessment directly (no agency middleman). The current B2B agency homepage moves to `/b2b`. A shared navbar component is extracted and used across both pages.

## Navigation

**Shared navbar** extracted from inline nav in `page.tsx` into a reusable component.

**Desktop:** Logo (graduation cap + "TheStudentBlueprint") | [spacer] | B2B Self-Service | Login | Resume | Start Assessment (CTA button)

**Mobile:** Logo + hamburger → dropdown with all links + CTA button

**Link destinations:**
| Nav Item | Destination |
|---|---|
| B2B Self-Service | `/b2b` |
| Login | `/login` |
| Resume | `/resume` |
| Start Assessment | `/checkout` |

## Route Changes

| Route | Before | After |
|---|---|---|
| `/` | B2B agency homepage | **B2C families homepage (new)** |
| `/b2b` | N/A | **B2B agency homepage (moved from `/`)** |
| `/get-started` | Agency onboarding | Unchanged (linked from `/b2b`) |

## B2C Homepage Sections (`/`)

### Section 1 — Hero

- **Eyebrow:** "Clarity is the unfair advantage."
- **Headline (Oswald):** "YOUR CHILD'S PATH TO THE IVY LEAGUE, MAPPED OUT."
- **Subheadline:** "Your child's GPA, test scores, extracurriculars, and goals analyzed against real admissions data from 150k data points and over 1,200+ accepted students. You walk away with a custom grade-by-grade plan: what to take, what to build, what to skip, and exactly when to do it. It's a detailed roadmap that works."
- **Tagline (Oswald):** "TURN AMBITION INTO ADMISSION."
- **Primary CTA:** "Get My Child's Roadmap →" → `/checkout`
- **Secondary CTA:** "How It Works ↓" → scroll to #methodology
- **Price anchor:** "One-time investment: $497 · Full report in minutes"

### Section 2 — Parent Quote (kept from current homepage)

Full-screen scroll-driven opacity animation:
- "Every Parent Says The Same Thing:"
- "I WISH WE STARTED EARLIER."

### Section 3 — Clock Transition (kept from current homepage)

Animated clock visual transition element — unchanged.

### Section 4 — Stats (reframed for B2C)

Three stat cards:
| Stat | Label | Sub |
|---|---|---|
| 150K+ | Data Points | Real admissions data |
| 1,200+ | Accepted Students | Analyzed & benchmarked |
| 20+ | Report Sections | Personalized to your child |

### Section 5 — How It Works (rewritten for B2C)

Heading: "Three Steps to Your Child's Roadmap"

Three dark cards:
1. **Take** — "The Assessment" — 15 sections covering academics, activities, goals, personality, and more. ~60 minutes.
2. **Analyze** — "AI Does The Work" — Your child's profile is benchmarked against 150K+ data points and 1,200+ accepted students.
3. **Receive** — "Your Roadmap" — A 40+ page personalized report with a grade-by-grade plan, college matches, and actionable next steps.

### Section 6 — What's In Your Report (new, 9 cards)

Heading: "Inside Your Report"

Grid layout with 9 cards on dark backgrounds:

1. **Student Archetype & Competitiveness Score** (double-wide featured card)
   - Unique applicant identity (e.g., "Analytical Entrepreneur")
   - 0-100 competitiveness score with tier table:
     - 90-100: Exceptional (green) — ISEF finalist, published researcher, 1550+ SAT, clear "spike"
     - 80-89: Very Competitive (blue) — State-level winner, 1450+ SAT, strong T20 shot
     - 70-79: Competitive (amber) — 1350+ SAT, good GPA, needs a standout "spike"
     - Below 70: Developing (red) — Time to build your story, testing & leadership need attention

2. **Gap Analysis** — Blind spots admissions officers will notice, with specific actions to close each gap.

3. **Projects & Research** — Tailored passion project ideas and research opportunities with step-by-step plans, mentor suggestions, and timeline.

4. **Career Pathways** — Career recommendations aligned to strengths, with salary potential, internship ideas, and major suggestions.

5. **Academics** — Course recommendations by grade (AP, IB, Honors, electives), GPA targets, SAT/ACT prep strategy.

6. **Scholarships** — Matched scholarship opportunities based on profile, interests, and demographics.

7. **Activities & Leadership** — Which clubs, competitions, and leadership roles to pursue — and which to drop. Prioritized by admissions impact.

8. **College Match List** — Reach, Target, and Safety schools with match scores and explanations.

9. **Essay Strategy** — Narrative themes and personal story angles drawn from experiences — foundation for standout application essays.

### Section 7 — Testimonials (placeholder)

Heading: "What Families Are Saying"

Three placeholder testimonial cards (to be replaced with real stories):
- Jennifer M., Parent, Class of 2025
- David & Sarah K., Parents, Class of 2026
- Maria L., Parent, Class of 2027

Uses same carousel component style as current B2B page.

### Section 8 — FAQ (filtered for families)

Same accordion style as current page, fetches from CMS (`/api/cms/faqs`).

**Remove** agency-specific FAQs:
- "How does this integrate with my tutoring agency?"
- "Is there an agency partner program?"
- "How do agencies collect payments from their students?"

**Keep** all student/family-relevant FAQs (assessment details, report contents, data privacy, pricing, grade levels, etc.)

### Section 9 — Final CTA

- **Headline (Oswald):** "DON'T LET THEM FALL BEHIND."
- **Subtext:** "The students getting into top schools aren't smarter. They started with a plan. Give your child the same advantage."
- **CTA:** "Get My Child's Roadmap →" → `/checkout`
- **No pricing** in this section.

## B2B Page (`/b2b`)

The current homepage content moves here with minimal changes:
- Same hero, features, testimonials, stats, How It Works, FAQ, and CTA
- Navbar updated to shared component (same nav as B2C page)
- All existing agency CTAs continue to point to `/get-started`

## Branding & Styling

No changes to branding:
- **Colors:** #FFFAF0 (cream bg), #1E2849 (navy text), #af8f5b (gold accent), #1b2034 (dark cards)
- **Fonts:** Oswald (headings), Montserrat (body)
- **Animations:** Framer Motion fade-up, scroll-driven opacity (same patterns as current page)
- **Components:** Radix UI accordion, Embla carousel, existing Button component

## Technical Approach

1. **Extract shared Navbar** — New component `src/components/Navbar.tsx` pulled from the inline nav in `page.tsx`
2. **New B2C homepage** — `src/app/page.tsx` rewritten with B2C content
3. **Move B2B page** — Current homepage content moves to `src/app/b2b/page.tsx`
4. **Both pages** import the shared Navbar component

## Pricing

- B2C: $497 flat rate, single assessment
- "Get My Child's Roadmap →" CTA links to `/checkout`
- B2B: Unchanged (bulk pricing via `/get-started`)
