import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Admin, User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { adminRepository } from '../repositories/admin.repository';
import { passwordResetTokenRepository } from '../repositories/passwordResetToken.repository';
import { signToken } from './token.service';
import { sendPasswordResetEmail } from './email.service';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AuthRole } from '../types/auth.types';
import {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../validators/auth.validator';

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** SHA-256 hex digest — used so only the token HASH is ever stored/queried. */
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex');

// Explicit mappers guarantee the password hash never leaves the service layer.
type PublicUser = Omit<User, 'password'>;
type PublicAdmin = Omit<Admin, 'password'>;

const toPublicUser = (u: User): PublicUser => ({
  id: u.id,
  email: u.email,
  name: u.name,
  phone: u.phone,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

const toPublicAdmin = (a: Admin): PublicAdmin => ({
  id: a.id,
  email: a.email,
  name: a.name,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

export const authService = {
  /** Register a new customer account and issue a token. */
  async register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      password: passwordHash,
      phone: input.phone ?? null,
    });

    return { user: toPublicUser(user), token: signToken(user.id, 'user') };
  },

  /** Authenticate a customer. Uses a generic message to avoid user enumeration. */
  async login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    return { user: toPublicUser(user), token: signToken(user.id, 'user') };
  },

  /** Authenticate the admin account. */
  async adminLogin(input: LoginInput): Promise<{ admin: PublicAdmin; token: string }> {
    const admin = await adminRepository.findByEmail(input.email);
    if (!admin) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const valid = await bcrypt.compare(input.password, admin.password);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    return { admin: toPublicAdmin(admin), token: signToken(admin.id, 'admin') };
  },

  /**
   * Begin a password reset for a CUSTOMER account. Queries the User table ONLY —
   * admins are never looked up, so an admin's email behaves exactly like a
   * non-existent one. Always resolves without revealing whether the email exists;
   * the controller returns an identical generic 200 in every case.
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      // Unknown (or admin) email → do nothing, but respond identically upstream.
      return;
    }

    // Raw token goes only into the emailed link; we persist just its SHA-256 hash.
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);

    // Invalidate any earlier unused links so only the newest one works.
    await passwordResetTokenRepository.deleteUnusedByUserId(user.id);
    await passwordResetTokenRepository.create({
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    // Send without blocking the response: keeps timing uniform vs. the unknown-email
    // path and guarantees a delivery failure still yields the same generic 200.
    // The raw token/link is never logged.
    void sendPasswordResetEmail(user.email, resetUrl).catch((err) => {
      console.error('[auth] Failed to send password reset email:', (err as Error).message);
    });
  },

  /**
   * Complete a password reset. The supplied raw token is SHA-256 hashed and
   * looked up; any failure (not found, expired, or already used) returns the
   * same generic error. On success the password is updated, the token is marked
   * used, and the user's other outstanding tokens are deleted. Does NOT log the
   * user in — they must sign in manually with the new password.
   */
  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);
    const record = await passwordResetTokenRepository.findByTokenHash(tokenHash);

    const isInvalid =
      !record || record.usedAt !== null || record.expiresAt.getTime() < Date.now();
    if (isInvalid) {
      throw ApiError.badRequest('This reset link is invalid or has expired');
    }

    const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
    await passwordResetTokenRepository.consumeAndResetPassword(
      record.id,
      record.userId,
      passwordHash,
    );
  },

  /** Resolve the account behind a verified token (used by GET /auth/me). */
  async getCurrent(
    id: string,
    role: AuthRole,
  ): Promise<{ role: AuthRole; account: PublicUser | PublicAdmin }> {
    if (role === 'admin') {
      const admin = await adminRepository.findById(id);
      if (!admin) {
        throw ApiError.unauthorized('Account no longer exists');
      }
      return { role, account: toPublicAdmin(admin) };
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw ApiError.unauthorized('Account no longer exists');
    }
    return { role, account: toPublicUser(user) };
  },
};
