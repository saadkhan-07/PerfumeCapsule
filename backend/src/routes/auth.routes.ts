import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public auth endpoints — rate limited + validated.
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/admin/login', authRateLimiter, validate(loginSchema), authController.adminLogin);

// Password reset (customer accounts only). Tighter rate limit (3 / 15 min / IP).
router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  passwordResetRateLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

// Protected — requires a valid token.
router.get('/me', requireAuth, authController.me);

export default router;
