import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async route handlers so that any rejected Promise is forwarded
 * to the Express error middleware instead of crashing the process.
 */
const asyncHandler =
  <T = unknown>(
    requestHandler: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<T>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };

export { asyncHandler };
