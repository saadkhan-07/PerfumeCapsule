import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/token.service';
import { ApiError } from '../utils/ApiError';

/**
 * Requires a valid `Authorization: Bearer <token>` header. On success it attaches
 * the trusted identity to `req.auth`. Apply to every non-public route.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  const payload = verifyToken(token);
  req.auth = { id: payload.sub, role: payload.role };
  next();
};

/**
 * Requires an admin identity. Must run AFTER requireAuth. Non-admins get 403.
 */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.auth) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (req.auth.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
};
