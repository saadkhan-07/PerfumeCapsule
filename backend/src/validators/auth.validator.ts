import { z } from 'zod';

/**
 * Email is trimmed + lowercased before format validation so callers can't
 * create duplicate accounts that differ only by case/whitespace.
 */
const emailField = z.preprocess(
  (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
  z.email({ message: 'A valid email address is required' }),
);

/**
 * bcrypt only uses the first 72 bytes of a password, so we cap length there.
 */
const passwordField = z
  .string({ message: 'Password is required' })
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

// strictObject rejects any unexpected fields → 422 (security rule).
export const registerSchema = z.object({
  body: z.strictObject({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
    email: emailField,
    password: passwordField,
    phone: z.string().trim().min(7).max(20).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.strictObject({
    email: emailField,
    password: z.string().min(1, 'Password is required'),
  }),
});

// Request a reset link. Only an email is accepted.
export const forgotPasswordSchema = z.object({
  body: z.strictObject({
    email: emailField,
  }),
});

// Consume a reset link. `newPassword` reuses the exact registration rules.
export const resetPasswordSchema = z.object({
  body: z.strictObject({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: passwordField,
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
