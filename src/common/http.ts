import type { Response } from "express";

/** Standard success envelope: { success: true, data }. */
export function ok<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json({ success: true, data });
}

/** Standard failure envelope: { success: false, error: { code, message, details? } }. */
export function fail(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): Response {
  return res.status(status).json({ success: false, error: { code, message, details } });
}
