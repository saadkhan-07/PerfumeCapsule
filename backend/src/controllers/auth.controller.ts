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

export const me = asyncHandler(async (req, res) => {
  if (!req.auth) {
    throw ApiError.unauthorized('Authentication required');
  }
  const result = await authService.getCurrent(req.auth.id, req.auth.role);
  sendSuccess(res, 200, 'Current account', result);
});
