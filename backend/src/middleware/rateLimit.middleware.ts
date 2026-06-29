import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication endpoints (register/login) to blunt
 * brute-force and credential-stuffing attempts. Responses keep the standard
 * API envelope shape.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max attempts per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a few minutes.',
    data: null,
    errors: null,
  },
});
