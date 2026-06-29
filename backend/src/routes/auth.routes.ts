import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Public auth endpoints — rate limited + validated.
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/admin/login', authRateLimiter, validate(loginSchema), authController.adminLogin);

// Protected — requires a valid token.
router.get('/me', requireAuth, authController.me);

export default router;
