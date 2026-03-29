# Student Info Collection on Payment Success Page

**Date:** 2026-03-28
**Status:** Draft

## Summary

Modify the payment success page (`/payment/success`) to collect student full name (required), email (required/pre-filled), and phone number (optional) after payment confirmation but before the assessment begins. On submission, create the student record, generate a unique 6-character resume code, display it on-screen, and email it to the student. The collected info auto-fills Section 1 (Basic Info) of the assessment.

## Motivation

Currently, the paid flow only captures email via Stripe checkout. Students arrive at the assessment with no pre-filled info and no resume code until they manually save progress. This change:

1. Captures student identity earlier for better tracking
2. Gives students a resume code upfront so they can return anytime
3. Auto-fills assessment Section 1 fields to reduce friction
4. Unifies the experience across paid, coupon, and free flows

## Design

### Page States

The payment success page (`src/app/payment/success/page.tsx`) transitions through 3 states:

#### State 1: Info Collection Form

After payment verification succeeds, show:
- Green "Payment Successful!" banner (existing confetti + checkmark)
- Below it, a form with:
  - **Full Name** — required text input
  - **Email Address** — pre-filled from Stripe (read-only for paid flow, editable for coupon/free flow)
  - **Phone Number** — optional text input
- "Continue" button (submits the form)

#### State 2: Resume Code Display

After successful form submission:
- Green "You're All Set!" banner
- Resume code displayed prominently in a dashed gold border box (large monospace text, e.g. `K7PH3N`)
- Confirmation message: "We've also emailed this code to jane@email.com"
- "Start Assessment" button → navigates to `/assessment?session_id=X`

#### State 3: Error / Unverified (existing)

If payment verification fails, show existing error UI with "Try Again" button.

### Entry Points

All flows route to `/payment/success` with different query params:

| Flow | URL | Email behavior |
|------|-----|----------------|
| Stripe payment | `/payment/success?session_id=X` | Pre-filled from Stripe, read-only |
| Coupon (100% off) | `/payment/success?coupon=CODE&email=X` | Pre-filled from checkout input, editable |
| Free org | `/payment/success?free=true&org=SLUG` | Empty, editable, required |

### Coupon Flow Changes

Currently, when a valid coupon that makes the transaction free is applied on the checkout page, `handleCouponSubmit()` (line ~247 in `checkout/page.tsx`) redirects directly to `/assessment`, completely bypassing the payment success page and info collection.

**Change:** After successful coupon validation, redirect to `/payment/success?coupon=CODE&email=EMAIL&org=SLUG` instead of `/assessment`. The payment success page detects the `coupon` query param, skips Stripe verification, shows the "Welcome!" variant header (not "Payment Successful!"), and presents the same info collection form with email pre-filled but editable.

Specifically in `handleCouponSubmit()`, replace:
```
router.push(`/assessment${orgParam}`)
```
with:
```
router.push(`/payment/success?coupon=${data.code}&email=${encodeURIComponent(email)}${orgParam ? `&${orgParam.slice(1)}` : ''}`)
```

### Free Org Flow Changes

Currently, free orgs show a "Get Started" form on the checkout page with name/email/phone. This form should be removed. Instead, redirect to `/payment/success?free=true&org=SLUG` where the unified info collection form handles it.

### Backend: New API Route

**`POST /api/student/register`**

Creates the student record and generates the resume code. Separate from `/api/assessment/save` because the student is being created before the assessment starts.

Request body:
```json
{
  "fullName": "Jane Smith",
  "email": "jane@email.com",
  "phone": "(555) 123-4567",
  "sessionId": "cs_xxx",
  "couponCode": "FREE100",
  "organizationSlug": "default"
}
```

Logic:
1. Resolve organization from slug (or default)
2. Check org student limits
3. Look up existing student by email + org, or create new one
4. Set `full_name`, `email`, `phone`, `unique_code` on the student record
5. Create an assessment record with `status: 'in_progress'`, `current_section: 1`, appropriate `payment_status`
6. If coupon provided, validate and apply it
7. Send resume code email to student (via existing email infrastructure or new utility)
8. Return `{ success, studentId, assessmentId, uniqueCode }`

### Backend: Resume Code Email

Use the existing `sendResumeCodeEmail()` function from `src/lib/resend.ts` (Resend API). It already accepts `(to, studentName, uniqueCode)` and sends a branded email with the resume code and instructions. No new email template needed.

### Frontend: Assessment Auto-Fill

When the assessment page loads, it receives `session_id` in the URL. The existing flow already calls `/api/payment/verify` or `/api/assessment/resume` to load data. The student info (name, email, phone) will already be in the assessment's `responses.basicInfo` or on the student record.

Changes needed in `src/app/assessment/page.tsx`:
- On load, if student record has `full_name`, `email`, `phone` → populate `formData.basicInfo.fullName`, `formData.basicInfo.email`, `formData.basicInfo.phone`
- Section 1 still displays normally — fields are pre-filled but editable
- No sections are skipped

### localStorage Updates

On successful student registration (State 1 → State 2 transition), set:
- `studentblueprint_paid_email` — the student's email
- `studentblueprint_student_name` — the student's full name
- `studentblueprint_student_phone` — the student's phone (if provided)
- `studentblueprint_resume_code` — the generated resume code

These are used as fallback for auto-fill if the API-based approach fails.

## Component Structure

The payment success page manages state internally — no new components needed. The existing page gets these new state variables:

```
isVerifying → verified → showForm (State 1) → showResumeCode (State 2)
```

Form validation: name required (min 2 chars), email required (valid format), phone optional.

## Scope Boundaries

**In scope:**
- Modified payment success page (3 states)
- New `/api/student/register` endpoint
- Resume code email sending
- Checkout page changes (coupon redirect, remove free flow form)
- Assessment page auto-fill from student record

**Out of scope:**
- Changing the Stripe checkout flow itself
- Modifying the resume page (`/resume`)
- Changing the existing resume code format (6-char alphanumeric)
- Adding new fields beyond name/email/phone
- Redesigning the assessment sections

## Files to Modify

| File | Change |
|------|--------|
| `src/app/payment/success/page.tsx` | Add info form (State 1), resume code display (State 2) |
| `src/app/checkout/page.tsx` | Redirect coupon/free flows to payment success page |
| `src/app/assessment/page.tsx` | Auto-fill basicInfo from student record on load |
| `src/app/api/student/register/route.ts` | **New** — student creation + resume code generation + email |
| `src/app/api/payment/verify/route.ts` | Possibly return student info if already registered |
