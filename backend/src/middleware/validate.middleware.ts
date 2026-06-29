import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError';

/**
 * Validates (and sanitizes) the incoming request against a Zod schema shaped as
 * `{ body, query, params }` before it reaches the controller/service layer.
 * On failure it produces a 422 with field-level messages. On success it writes
 * the parsed `body` back so downstream code sees normalized values.
 *
 * Note: in Express 5 `req.query`/`req.params` are read-only getters, so only
 * `body` is reassigned.
 */
export const validate =
  (schema: z.ZodType) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.').replace(/^body\./, '') || 'body',
        message: issue.message,
      }));
      return next(ApiError.unprocessable('Validation failed', errors));
    }

    const data = result.data as { body?: unknown };
    if (data.body !== undefined) {
      req.body = data.body;
    }
    next();
  };
