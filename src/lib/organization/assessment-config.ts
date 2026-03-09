/**
 * Assessment Customization Configuration System
 *
 * Allows organizations to customize which assessment sections are enabled
 * and optionally add custom questions.
 */

import { SECTION_TITLES } from '@/lib/assessment-types'

export interface AssessmentSectionConfig {
  id: number
  title: string
  description: string
  required: boolean
  enabled: boolean
}

export interface CustomQuestion {
  id: string
  sectionId: number
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'checkbox'
  label: string
  placeholder?: string
  options?: string[]
  required: boolean
  order: number
}

export interface AssessmentConfig {
  enabledSections: number[]
  customQuestions: CustomQuestion[]
  welcomeMessage?: string
  completionMessage?: string
}

/**
 * Default section descriptions for the UI
 */
export const SECTION_DESCRIPTIONS: Record<number, string> = {
  1: 'Basic student and parent contact information, school details',
  2: 'GPA, course load, academic honors and awards',
  3: 'SAT, ACT, PSAT scores and testing timeline',
  4: 'Clubs, sports, activities, and time commitment',
  5: 'Leadership positions and organizational roles',
  6: 'Academic competitions, contests, and recognitions',
  7: 'Topics of interest, hobbies, and passion areas',
  8: 'Career goals, dream jobs, and professional interests',
  9: 'Research, internships, shadowing, and work experience',
  10: 'Summer camps, programs, and enrichment activities',
  11: 'Music, arts, athletics, and unique abilities',
  12: 'Family background, legacy connections, financial context',
  13: 'Personality traits, strengths, and archetypes',
  14: 'Life challenges, leadership moments, personal growth',
  15: 'Available hours and preferred pace of activities',
}

/**
 * Sections that are always required (cannot be disabled)
 */
export const REQUIRED_SECTIONS = [1] // Basic Info is always required

/**
 * Get default assessment configuration with all sections enabled
 */
export function getDefaultAssessmentConfig(): AssessmentConfig {
  return {
    enabledSections: Array.from({ length: 15 }, (_, i) => i + 1),
    customQuestions: [],
    welcomeMessage: undefined,
    completionMessage: undefined,
  }
}

/**
 * Get section configuration from enabled sections list
 */
export function getSectionConfigs(enabledSections: number[]): AssessmentSectionConfig[] {
  return SECTION_TITLES.map((title, index) => {
    const sectionId = index + 1
    return {
      id: sectionId,
      title,
      description: SECTION_DESCRIPTIONS[sectionId] || '',
      required: REQUIRED_SECTIONS.includes(sectionId),
      enabled: enabledSections.includes(sectionId),
    }
  })
}

/**
 * Validate that required sections are enabled
 */
export function validateSectionConfig(enabledSections: number[]): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check required sections
  for (const requiredSection of REQUIRED_SECTIONS) {
    if (!enabledSections.includes(requiredSection)) {
      errors.push(`Section "${SECTION_TITLES[requiredSection - 1]}" is required and cannot be disabled`)
    }
  }

  // Check for at least a minimum number of sections
  if (enabledSections.length < 3) {
    errors.push('At least 3 sections must be enabled')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Filter section indices for the assessment form
 * Returns an array mapping original section numbers to display indices
 */
export function getEnabledSectionIndices(enabledSections: number[]): Map<number, number> {
  const sorted = [...enabledSections].sort((a, b) => a - b)
  const indexMap = new Map<number, number>()

  sorted.forEach((sectionId, displayIndex) => {
    indexMap.set(sectionId, displayIndex + 1)
  })

  return indexMap
}

/**
 * Get total number of enabled sections for progress calculation
 */
export function getEnabledSectionCount(enabledSections: number[]): number {
  return enabledSections.length
}

/**
 * Check if a section is enabled for an organization
 */
export function isSectionEnabled(sectionId: number, enabledSections: number[]): boolean {
  return enabledSections.includes(sectionId)
}

/**
 * Get the next enabled section after the current one
 */
export function getNextEnabledSection(
  currentSection: number,
  enabledSections: number[]
): number | null {
  const sorted = [...enabledSections].sort((a, b) => a - b)
  const currentIndex = sorted.indexOf(currentSection)

  if (currentIndex === -1 || currentIndex === sorted.length - 1) {
    return null
  }

  return sorted[currentIndex + 1]
}

/**
 * Get the previous enabled section before the current one
 */
export function getPreviousEnabledSection(
  currentSection: number,
  enabledSections: number[]
): number | null {
  const sorted = [...enabledSections].sort((a, b) => a - b)
  const currentIndex = sorted.indexOf(currentSection)

  if (currentIndex <= 0) {
    return null
  }

  return sorted[currentIndex - 1]
}

/**
 * Default section presets for different use cases
 */
export const SECTION_PRESETS = {
  full: {
    name: 'Full Assessment',
    description: 'All 15 sections enabled for comprehensive analysis',
    sections: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  },
  quick: {
    name: 'Quick Assessment',
    description: 'Core sections only for faster completion (8 sections)',
    sections: [1, 2, 3, 4, 7, 8, 13, 15],
  },
  academic: {
    name: 'Academic Focus',
    description: 'Emphasis on academics, testing, and research (10 sections)',
    sections: [1, 2, 3, 4, 6, 8, 9, 10, 13, 15],
  },
  extracurricular: {
    name: 'Extracurricular Focus',
    description: 'Emphasis on activities, leadership, and talents (10 sections)',
    sections: [1, 2, 4, 5, 6, 7, 10, 11, 13, 14],
  },
  holistic: {
    name: 'Holistic Review',
    description: 'Balanced assessment for well-rounded applications (12 sections)',
    sections: [1, 2, 3, 4, 5, 7, 8, 9, 11, 13, 14, 15],
  },
}

export type SectionPresetKey = keyof typeof SECTION_PRESETS
