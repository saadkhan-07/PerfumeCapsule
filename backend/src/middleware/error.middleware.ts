import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { isProduction } from '../config/env';

/** Catch-all for unmatched routes → 404 in the standard envelope. */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler. Translates any thrown value into the consistent error
 * envelope. Never leaks stack traces or raw Prisma errors in production.
 * Must be registered LAST and keep all four parameters so Express recognizes it.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errors: unknown[] | null = null;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Map common Prisma errors without exposing internals.
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Resource not found';
    } else {
      statusCode = 400;
      message = 'Invalid database request';
    }
  } else if (err instanceof Error && !isProduction) {
    // In non-production, surface the real message to aid debugging.
    message = err.message;
  }

  // Log full details server-side for unexpected (5xx) errors only.
  if (statusCode >= 500) {
    console.error(err);
  }

  const payload: Record<string, unknown> = {
    success: false,
    message,
    data: null,
    errors,
  };

  // Stack traces are NEVER included in production responses.
  if (!isProduction && statusCode >= 500 && err instanceof Error) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
