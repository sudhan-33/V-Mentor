import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors.js";
import { fail } from "../common/http.js";
import { logger } from "../config/logger.js";

/** 404 for unmatched routes. */
export function notFound(_req: Request, res: Response): void {
  fail(res, 404, "NOT_FOUND", "Route not found");
}

/** Map common PostgreSQL SQLSTATE codes to clean HTTP responses. */
const PG_ERROR_MAP: Record<string, { status: number; code: string; message: string }> = {
  "22P02": { status: 400, code: "INVALID_INPUT", message: "Invalid identifier format" },
  "23505": { status: 409, code: "CONFLICT", message: "Resource already exists" },
  "23503": { status: 400, code: "INVALID_REFERENCE", message: "Related resource does not exist" },
  "23502": { status: 400, code: "MISSING_FIELD", message: "A required field is missing" },
};

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

  // Translate known PostgreSQL driver errors (e.g. a malformed UUID path param)
  // into clean 4xx responses instead of a generic 500.
  const pgCode = (err as { code?: unknown })?.code;
  if (typeof pgCode === "string" && PG_ERROR_MAP[pgCode]) {
    const mapped = PG_ERROR_MAP[pgCode];
    fail(res, mapped.status, mapped.code, mapped.message);
    return;
  }

  logger.error({ err }, "Unhandled error");
  fail(res, 500, "INTERNAL", "Something went wrong");
}
