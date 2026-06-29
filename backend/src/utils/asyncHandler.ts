import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async controller so any rejected promise is forwarded to Express's
 * error-handling middleware instead of crashing the process or hanging.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };
