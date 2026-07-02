import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/ApiError';
import { authService } from '../services/auth.service';

/**
 * Thin controllers: parse the (already-validated) request, delegate to the
 * service, and shape the response. No business logic here.
 */

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, 201, 'Account created successfully', result);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 200, 'Logged in successfully', result);
});

export const adminLogin = asyncHandler(async (req, res) => {
  const result = await authService.adminLogin(req.body);
  sendSuccess(res, 200, 'Logged in successfully', result);
});

// Generic message returned for EVERY forgot-password request (exists or not) —
// prevents email enumeration.
const FORGOT_PASSWORD_MESSAGE =
  'If an account exists with this email, a reset link has been sent.';

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body);
  sendSuccess(res, 200, FORGOT_PASSWORD_MESSAGE);
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, 200, 'Your password has been reset. You can now log in.');
});

export const me = asyncHandler(async (req, res) => {
  if (!req.auth) {
    throw ApiError.unauthorized('Authentication required');
  }
  const result = await authService.getCurrent(req.auth.id, req.auth.role);
  sendSuccess(res, 200, 'Current account', result);
});
