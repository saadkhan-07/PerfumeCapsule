import bcrypt from 'bcrypt';
import { Admin, User } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';
import { adminRepository } from '../repositories/admin.repository';
import { signToken } from './token.service';
import { ApiError } from '../utils/ApiError';
import { AuthRole } from '../types/auth.types';
import { LoginInput, RegisterInput } from '../validators/auth.validator';

const SALT_ROUNDS = 12;

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
