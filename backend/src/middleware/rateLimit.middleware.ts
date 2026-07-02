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

/**
 * Rate limiter for the public password-reset endpoints (forgot/reset). Tighter
 * than the auth limiter (max 3 per 15 min per IP) since these can trigger email
 * sends and token guessing — blunts abuse and enumeration attempts.
 */
export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 3, // max requests per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a few minutes.',
    data: null,
    errors: null,
  },
});

/**
 * Rate limiter for the public guest order-lookup endpoint. Since the only gate
 * is phone + order id, this blunts brute-force enumeration attempts.
 */
export const orderLookupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // max lookups per window per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many lookups. Please try again in a few minutes.',
    data: null,
    errors: null,
  },
});
