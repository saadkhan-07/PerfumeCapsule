import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env into process.env before validating.
dotenv.config();

/**
 * Central, validated environment configuration.
 * The app refuses to boot if required variables are missing or malformed,
 * so the rest of the codebase can treat `env` as guaranteed-valid.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),

  // Optional in Phase 2 — required by later phases (Cloudinary, WhatsApp).
  WHATSAPP_NUMBER: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Frontend origin — used to build absolute links (e.g. the password reset URL).
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Email (Resend). Optional so the app still boots without it, but password
  // reset emails will fail to send (logged server-side) until configured.
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('onboarding@resend.dev'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Do not print values — only which fields failed.
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2),
  );
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
