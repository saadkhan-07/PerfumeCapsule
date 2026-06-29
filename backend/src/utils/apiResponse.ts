import { Response } from 'express';

/**
 * The single, consistent success envelope used by every endpoint.
 * Error responses are produced by the global error handler.
 */
export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T | null = null,
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  });
};
