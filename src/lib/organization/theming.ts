/**
 * Organization Theming System
 *
 * Provides dynamic CSS variable injection and color utilities
 * for white-label branding across the platform.
 */

export interface ThemeColors {
  primary: string
  secondary: string
  primaryForeground?: string
  secondaryForeground?: string
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

/**
 * Calculate relative luminance for WCAG contrast
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Determine if text should be light or dark for contrast
 */
export function getContrastColor(hexColor: string): 'light' | 'dark' {
  const rgb = hexToRgb(hexColor)
  if (!rgb) return 'dark'

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  return luminance > 0.179 ? 'dark' : 'light'
}

/**
 * Get the appropriate text color for a background
 */
export function getTextColorForBackground(hexColor: string): string {
  return getContrastColor(hexColor) === 'light' ? '#1a1a1a' : '#ffffff'
}

/**
 * Lighten a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const factor = percent / 100
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor))
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor))
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Darken a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex

  const factor = 1 - percent / 100
  const r = Math.max(0, Math.round(rgb.r * factor))
  const g = Math.max(0, Math.round(rgb.g * factor))
  const b = Math.max(0, Math.round(rgb.b * factor))

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Generate CSS variables for organization theming
 */
export function generateThemeCssVariables(colors: ThemeColors): Record<string, string> {
  const primaryRgb = hexToRgb(colors.primary)
  const secondaryRgb = hexToRgb(colors.secondary)

  const primaryFg = colors.primaryForeground || getTextColorForBackground(colors.primary)
  const secondaryFg = colors.secondaryForeground || getTextColorForBackground(colors.secondary)

  return {
    // Primary colors
    '--org-primary': colors.primary,
    '--org-primary-rgb': primaryRgb ? `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}` : '30, 58, 95',
    '--org-primary-foreground': primaryFg,
    '--org-primary-light': lightenColor(colors.primary, 20),
    '--org-primary-lighter': lightenColor(colors.primary, 40),
    '--org-primary-dark': darkenColor(colors.primary, 20),
    '--org-primary-darker': darkenColor(colors.primary, 40),

    // Secondary colors
    '--org-secondary': colors.secondary,
    '--org-secondary-rgb': secondaryRgb ? `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}` : '201, 162, 39',
    '--org-secondary-foreground': secondaryFg,
    '--org-secondary-light': lightenColor(colors.secondary, 20),
    '--org-secondary-lighter': lightenColor(colors.secondary, 40),
    '--org-secondary-dark': darkenColor(colors.secondary, 20),
    '--org-secondary-darker': darkenColor(colors.secondary, 40),

    // Semantic mappings
    '--org-accent': colors.secondary,
    '--org-accent-foreground': secondaryFg,
    '--org-header-bg': colors.primary,
    '--org-header-text': primaryFg,
    '--org-button-bg': colors.primary,
    '--org-button-text': primaryFg,
    '--org-button-hover': darkenColor(colors.primary, 10),
    '--org-link': colors.secondary,
    '--org-focus-ring': colors.secondary,
  }
}

/**
 * Generate inline style string for CSS variables
 */
export function generateThemeStyleString(colors: ThemeColors): string {
  const variables = generateThemeCssVariables(colors)
  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

/**
 * Default theme colors (The Student Blueprint brand)
 */
export const DEFAULT_THEME: ThemeColors = {
  primary: '#1e3a5f',
  secondary: '#c9a227',
}

/**
 * Preset themes for quick selection
 */
export const PRESET_THEMES: Record<string, ThemeColors> = {
  'student-blueprint': {
    primary: '#1e3a5f',
    secondary: '#c9a227',
  },
  'ocean-blue': {
    primary: '#0077b6',
    secondary: '#00b4d8',
  },
  'forest-green': {
    primary: '#2d6a4f',
    secondary: '#95d5b2',
  },
  'royal-purple': {
    primary: '#5a189a',
    secondary: '#c77dff',
  },
  'sunset-orange': {
    primary: '#dc2f02',
    secondary: '#ffba08',
  },
  'professional-gray': {
    primary: '#2b2d42',
    secondary: '#8d99ae',
  },
  'coral-pink': {
    primary: '#e63946',
    secondary: '#f4a261',
  },
  'midnight': {
    primary: '#0a192f',
    secondary: '#64ffda',
  },
}

/**
 * Validate a hex color
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color)
}

/**
 * Ensure a color is in proper hex format
 */
export function normalizeHexColor(color: string): string {
  if (!color) return DEFAULT_THEME.primary

  // Remove any whitespace
  color = color.trim()

  // Add # if missing
  if (!color.startsWith('#')) {
    color = '#' + color
  }

  // Validate
  if (!isValidHexColor(color)) {
    return DEFAULT_THEME.primary
  }

  return color.toLowerCase()
}
