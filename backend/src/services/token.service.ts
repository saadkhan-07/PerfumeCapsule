import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { AppJwtPayload, AuthRole } from '../types/auth.types';

/**
 * Signs a short-lived JWT carrying the account id (`sub`) and role.
 * Expiry always comes from JWT_EXPIRES_IN — tokens are never issued without one.
 */
export const signToken = (sub: string, role: AuthRole): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub, role }, env.JWT_SECRET, options);
};

/**
 * Verifies a JWT and returns a normalized payload.
 * Any failure (expired, malformed, bad signature) becomes a 401.
 */
export const verifyToken = (token: string): AppJwtPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'string' ||
      (decoded.role !== 'user' && decoded.role !== 'admin')
    ) {
      throw new Error('Malformed token payload');
    }

    return { sub: decoded.sub, role: decoded.role };
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
};
