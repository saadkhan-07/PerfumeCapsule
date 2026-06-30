import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.service';

/**
 * Optional authentication for endpoints that serve both guests and logged-in
 * accounts (e.g. guest checkout). Behavior:
 *
 *  - No `Authorization: Bearer` header  → continue as a guest (`req.auth` stays undefined).
 *  - Valid Bearer token                 → attach `req.auth` and continue.
 *  - Present but INVALID/expired token  → reject with 401 (verifyToken throws).
 *
 * The last case is deliberate: a broken token must NOT silently downgrade a
 * logged-in user to a guest order without them knowing.
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  // No credentials supplied → guest.
  if (!header || !header.startsWith('Bearer ')) {
    return next();
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next();
  }

  // A present token must be valid. verifyToken throws ApiError.unauthorized (401)
  // on any failure; Express forwards the synchronous throw to the error handler.
  const payload = verifyToken(token);
  req.auth = { id: payload.sub, role: payload.role };
  next();
};
