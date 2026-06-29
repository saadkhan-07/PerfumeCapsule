/**
 * Operational error carrying an HTTP status code and optional field-level errors.
 * Thrown anywhere in the request lifecycle; translated to a response by the
 * global error handler. Keeps controllers/services free of res.status() calls.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errors: unknown[] | null;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, errors: unknown[] | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message: string, errors: unknown[] | null = null): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action'): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static unprocessable(message: string, errors: unknown[] | null = null): ApiError {
    return new ApiError(422, message, errors);
  }
}
