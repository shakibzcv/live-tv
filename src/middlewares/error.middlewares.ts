import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import logger from '../logger/winston.logger';
import { ApiError } from '../utils/ApiError';

/**
 * Central error handler middleware.
 * Catches errors forwarded via next(err) or thrown inside asyncHandler wrappers.
 * Returns a consistent JSON error shape.
 */
const errorHandler: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let error: ApiError;

  if (err instanceof ApiError) {
    error = err;
  } else {
    const maybeErr = err as Partial<{
      statusCode: number;
      message: string;
      errors: unknown[];
      stack: string;
    }>;

    const statusCode = maybeErr?.statusCode ? 400 : 500;
    const message = maybeErr?.message ?? 'Something went wrong';

    error = new ApiError(
      statusCode,
      message,
      maybeErr?.errors ?? [],
      maybeErr?.stack
    );
  }

  const response: Record<string, unknown> = {
    ...error,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  logger.error(`[ErrorHandler] ${error.statusCode} — ${error.message}`);

  return res.status(error.statusCode).json(response);
};

export { errorHandler };
