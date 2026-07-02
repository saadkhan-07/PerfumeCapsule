import { z } from 'zod'
import { PAKISTAN_CITIES } from './pakistanCities'

/**
 * Pakistani mobile number. Accepts local `03XXXXXXXXX` or international
 * `+923XXXXXXXXX` / `923XXXXXXXXX`. Spaces and dashes are stripped before testing.
 */
const PK_PHONE = /^(?:\+?92|0)3\d{9}$/

const normalizePhone = (v: string) => v.replace(/[\s-]/g, '')

export const phoneField = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .refine((v) => PK_PHONE.test(normalizePhone(v)), {
    message: 'Enter a valid Pakistani mobile number (e.g. 03001234567)',
  })

export const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .pipe(z.email('Enter a valid email address'))

/** Shared password rule — reused by registration and password reset so the
 *  live validation UX is identical across both forms. */
export const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72)

// ── Auth schemas ──────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: emailField,
  phone: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || PK_PHONE.test(normalizePhone(v)), {
      message: 'Enter a valid Pakistani mobile number (e.g. 03001234567)',
    }),
  password: passwordField,
})

// ── Password reset schemas ──────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: emailField,
})

export const resetPasswordSchema = z
  .object({
    newPassword: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ── Single-page checkout schema ─────────────────────────────────────────────
// First/last name are combined into `customerName` at submit time to match the
// Order schema. `contact` collects an email or phone for both guest and
// logged-in flows (UI only — not yet wired to any backend logic).
export const checkoutSchema = z.object({
  contact: z.string().trim().min(3, 'Enter your email or phone number').max(100),
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  address: z.string().trim().min(5, 'Street address is required').max(300),
  // Must be an exact match from the predefined list — never a free-typed string.
  city: z.string().refine((val) => PAKISTAN_CITIES.includes(val), {
    message: 'Please select a valid city from the list',
  }),
  phone: phoneField,
})

// ── Guest order tracking schema ─────────────────────────────────────────────
export const trackOrderSchema = z.object({
  orderId: z.string().trim().min(1, 'Order ID is required'),
  phone: phoneField,
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type CheckoutValues = z.infer<typeof checkoutSchema>
export type TrackOrderValues = z.infer<typeof trackOrderSchema>
