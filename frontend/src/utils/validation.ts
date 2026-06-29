import { z } from 'zod'

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
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

// ── Checkout shipping schema ────────────────────────────────────────────────
export const shippingSchema = z.object({
  name: z.string().trim().min(2, 'Full name is required').max(100),
  phone: phoneField,
  address: z.string().trim().min(5, 'Street address is required').max(300),
  city: z.string().trim().min(2, 'City is required').max(100),
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ShippingValues = z.infer<typeof shippingSchema>
