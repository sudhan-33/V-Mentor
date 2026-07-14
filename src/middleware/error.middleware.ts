import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors.js";
import { fail } from "../common/http.js";
import { logger } from "../config/logger.js";

/** 404 for unmatched routes. */
export function notFound(_req: Request, res: Response): void {
  fail(res, 404, "NOT_FOUND", "Route not found");
}

/** Central error handler — converts thrown errors into the standard failure envelope. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    fail(res, err.statusCode, err.code, err.message, err.details);
    return;
  }
  logger.error({ err }, "Unhandled error");
  fail(res, 500, "INTERNAL", "Something went wrong");
}
