import { Resend } from 'resend';
import { env } from '../config/env';

/**
 * Email delivery via Resend. This is the ONLY module that imports/initializes
 * Resend — every other service goes through the functions exported here.
 *
 * On Resend's free tier without a verified domain, delivery is restricted to the
 * account owner's own address and mail must be sent from `onboarding@resend.dev`.
 * The from-address is env-driven (EMAIL_FROM) so it can be swapped to a branded
 * domain address later with no code change.
 */
const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

const SITE_NAME = 'Perfume Capsules';

/**
 * Send a password-reset email containing a one-time link. Throws if Resend is
 * not configured or the API call fails — callers are responsible for swallowing
 * the error so the API response never reveals whether an email was sent.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!resend) {
    throw new Error('Email service is not configured (RESEND_API_KEY missing)');
  }

  const html = `
  <div style="margin:0;padding:24px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e5e5;border-radius:12px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111111;">${SITE_NAME}</h1>
      <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#444444;">
        You requested a password reset. This link expires in 15 minutes.
      </p>
      <a href="${resetUrl}"
         style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:8px;">
        Reset password
      </a>
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#888888;">
        If the button doesn't work, paste this link into your browser:<br />
        ${resetUrl}
      </p>
      <p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#888888;">
        Didn't request this? You can safely ignore this email — your password won't change.
      </p>
    </div>
  </div>`;

  const text = `${SITE_NAME}
You requested a password reset. This link expires in 15 minutes.
Reset your password: ${resetUrl}

Didn't request this? You can safely ignore this email — your password won't change.`;

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Reset your ${SITE_NAME} password`,
    html,
    text,
  });

  // Resend returns errors in the payload rather than throwing.
  if (error) {
    throw new Error(`Resend failed to send password reset email: ${error.message}`);
  }
}
