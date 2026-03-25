export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  domain_verified?: boolean;
  domain_verified_at?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  billing_email?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_connect_account_id?: string;
  subscription_status: 'trial' | 'active' | 'past_due' | 'canceled' | 'suspended';
  billing_type: 'subscription' | 'one_time';
  plan_type: 'starter' | 'pro' | 'enterprise';
  max_students: number;
  max_admins: number;
  current_students_count: number;
  assessment_price: number;
  plan_price?: number | null;
  free_assessments: boolean;
  settings: OrganizationSettings;
  custom_email_from?: string;
  custom_email_reply_to?: string;
  remove_branding?: boolean;
  webhook_url?: string;
  api_key?: string;
  features?: Record<string, boolean>;
  onboarding_completed?: boolean;
  enabled_sections?: number[];
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSettings {
  isDefault?: boolean;
  platformOwner?: boolean;
  customEmailTemplate?: string;
  sendParentEmails?: boolean;
  sendStudentEmails?: boolean;
  enabledSections?: number[];
  customQuestions?: Question[];
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'viewer';
  invited_by?: string;
  created_at: string;
}

export interface Student {
  id: string;
  organization_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  unique_code?: string;
  current_grade?: string;
  target_college_year?: string;
  phone?: string;
  grade_level?: string;
  school_name?: string;
  parent_email?: string;
  parent_phone?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  organization_id: string;
  student_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  payment_status: 'unpaid' | 'paid' | 'refunded' | 'free';
  payment_intent_id?: string;
  coupon_code?: string;
  amount_paid?: number;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;
  responses: Record<string, unknown>;
  scores: AssessmentScores;
  report_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  student?: Student;
}

export interface AssessmentScores {
  overall?: number;
  sections?: Record<string, number>;
  categories?: Record<string, number>;
}

export interface Coupon {
  id: string;
  organization_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free';
  discount_value: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  organization_id?: string;
  user_id?: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  role: 'god' | 'super_admin' | 'agency_admin' | 'agency_owner' | 'owner' | 'admin' | 'viewer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  organization?: Organization;
}

export interface AuditLog {
  id: string;
  organization_id?: string;
  admin_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface CmsFaq {
  id: string;
  organization_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsTestimonial {
  id: string;
  organization_id: string;
  author_name: string;
  author_title?: string;
  content: string;
  rating: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: 'owner' | 'admin' | 'viewer';
  token: string;
  invited_by?: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'scale' | 'text';
  options?: string[];
  category?: string;
}

export interface TenantContext {
  organization: Organization;
  admin?: Admin;
  isSuperAdmin: boolean;
}
