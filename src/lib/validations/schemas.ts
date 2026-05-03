import { z } from 'zod'

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .transform((val) => val.toLowerCase().trim())

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')

export const uuidSchema = z.string().uuid('Invalid ID format')

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(50, 'Slug must be less than 50 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .transform((val) => val.toLowerCase().trim())

export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format')
  .optional()
  .nullable()

export const otpSchema = z
  .string()
  .length(6, 'OTP must be 6 digits')
  .regex(/^\d+$/, 'OTP must contain only digits')

export const couponCodeSchema = z
  .string()
  .min(1, 'Coupon code is required')
  .max(50, 'Coupon code too long')
  .transform((val) => val.toUpperCase().trim())

// ============================================
// Authentication Schemas
// ============================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
})

export const setupPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
})

// ============================================
// OTP Schemas
// ============================================

export const otpSendSchema = z.object({
  email: emailSchema,
})

export const otpVerifySchema = z.object({
  email: emailSchema,
  otp: otpSchema,
})

// ============================================
// Admin Schemas
// ============================================

export const adminRoleSchema = z.enum([
  'super_admin',
  'owner',
  'admin',
  'viewer',
  'agency_admin',
  'god',
])

export const inviteAdminSchema = z.object({
  email: emailSchema,
  fullName: z.string().max(100).optional(),
  role: adminRoleSchema,
})

export const manageAdminSchema = z.object({
  adminId: uuidSchema,
  action: z.enum(['delete', 'update_role', 'deactivate', 'activate']),
  role: adminRoleSchema.optional(),
})

// ============================================
// Agency Schemas
// ============================================

export const agencySignupSchema = z.object({
  name: z.string().max(100).optional(),
  email: emailSchema,
  password: passwordSchema,
  agency_name: z.string().min(2, 'Agency name is required').max(100),
  slug: slugSchema,
})

export const agencySettingsSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logo_url: z.string().url().optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format').optional(),
  custom_email_from: z.string().max(100).optional().nullable(),
  custom_email_reply_to: emailSchema.optional().nullable(),
  webhook_url: z.string().url().optional().nullable(),
  assessment_price: z.number().min(0).max(10000).optional(),
})

// ============================================
// Student/Assessment Schemas
// ============================================

export const basicInfoSchema = z.object({
  firstName: z.string().max(50).optional(),
  lastName: z.string().max(50).optional(),
  email: emailSchema.optional(),
  phone: phoneSchema,
  gradeLevel: z.string().max(20).optional(),
  schoolName: z.string().max(100).optional(),
  parentEmail: emailSchema.optional().nullable(),
  parentPhone: phoneSchema,
})

export const assessmentSaveSchema = z.object({
  assessmentId: uuidSchema.optional(),
  formData: z.record(z.string(), z.unknown()),
  couponCode: couponCodeSchema.optional().nullable(),
  organization_slug: slugSchema.optional(),
})

export const assessmentSubmitSchema = z.object({
  assessmentId: uuidSchema,
  formData: z.record(z.string(), z.unknown()),
})

export const assessmentResumeSchema = z.object({
  email: emailSchema.optional(),
  code: z.string().max(50).optional(),
}).refine(data => data.email || data.code, {
  message: 'Please provide email or assessment code',
})

// ============================================
// Bulk Invite Schemas
// ============================================

export const bulkInviteSchema = z.object({
  emails: z
    .array(emailSchema)
    .min(1, 'At least one email is required')
    .max(100, 'Maximum 100 emails per batch'),
})

export const v1InviteSchema = z.object({
  emails: z
    .array(
      z.object({
        email: emailSchema,
        firstName: z.string().max(50).optional(),
        lastName: z.string().max(50).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .min(1, 'At least one email is required')
    .max(100, 'Maximum 100 invites per batch'),
  couponCode: couponCodeSchema.optional(),
  customMessage: z.string().max(1000).optional(),
})

// ============================================
// Payment Schemas
// ============================================

export const checkoutSchema = z.object({
  email: emailSchema.optional(),
  organization_slug: slugSchema.optional(),
  referral_code: z.string().min(4).max(10).transform(val => val.toUpperCase().trim()).optional(),
  coupon_code: couponCodeSchema.optional(),
})

export const couponValidateSchema = z.object({
  code: couponCodeSchema,
  organizationId: uuidSchema.optional(),
})

export const paymentVerifySchema = z.object({
  email: emailSchema,
  sessionId: z.string().optional(),
})

// ============================================
// Coupon Management Schemas
// ============================================

export const couponCreateSchema = z.object({
  code: couponCodeSchema,
  discount_type: z.enum(['percentage', 'fixed', 'free']),
  discount_value: z.number().min(0).max(100),
  max_uses: z.number().int().min(1).max(100000).optional(),
  valid_from: z.string().datetime().optional(),
  valid_until: z.string().datetime().optional(),
})

// ============================================
// Organization Schemas
// ============================================

export const organizationCreateSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100),
  slug: slugSchema,
  billing_email: emailSchema,
  plan_type: z.enum(['starter', 'pro', 'enterprise']).default('starter'),
})

export const organizationUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logo_url: z.string().url().optional().nullable(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  plan_type: z.enum(['starter', 'pro', 'enterprise']).optional(),
  max_students: z.number().int().min(-1).optional(),
  max_admins: z.number().int().min(1).optional(),
  assessment_price: z.number().min(0).max(10000).optional(),
})

// ============================================
// CMS Schemas
// ============================================

export const faqSchema = z.object({
  question: z.string().min(1).max(500),
  answer: z.string().min(1).max(5000),
  order: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
})

export const testimonialSchema = z.object({
  name: z.string().min(1).max(100),
  role: z.string().max(100).optional(),
  content: z.string().min(1).max(2000),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().optional(),
})

// ============================================
// Partner Application Schema
// ============================================

export const studentCountRangeSchema = z.enum([
  '1-50',
  '51-100',
  '101-500',
  '500+',
])

export const referralSourceSchema = z.enum([
  'google',
  'linkedin',
  'referral',
  'conference',
  'social_media',
  'other',
])

// ============================================
// Test Email Schema
// ============================================
// Delete Assessment Schema
// ============================================

export const deleteAssessmentSchema = z.object({
  assessmentId: uuidSchema,
})

// ============================================
// Regenerate Report Schema
// ============================================

export const regenerateReportSchema = z.object({
  assessmentId: uuidSchema,
})

// ============================================
// Type Exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type OtpSendInput = z.infer<typeof otpSendSchema>
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>
export type InviteAdminInput = z.infer<typeof inviteAdminSchema>
export type AgencySignupInput = z.infer<typeof agencySignupSchema>
export type AgencySettingsInput = z.infer<typeof agencySettingsSchema>
export type AssessmentSaveInput = z.infer<typeof assessmentSaveSchema>
export type AssessmentSubmitInput = z.infer<typeof assessmentSubmitSchema>
export type BulkInviteInput = z.infer<typeof bulkInviteSchema>
export type V1InviteInput = z.infer<typeof v1InviteSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type CouponValidateInput = z.infer<typeof couponValidateSchema>
export type CouponCreateInput = z.infer<typeof couponCreateSchema>
export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdateInput = z.infer<typeof organizationUpdateSchema>
export type FaqInput = z.infer<typeof faqSchema>
export type TestimonialInput = z.infer<typeof testimonialSchema>
