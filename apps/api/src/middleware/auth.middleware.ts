import type { NextFunction, Request, Response } from "express";
import type { AuthTokenPayload } from "@vmentor/shared";
import { Unauthorized } from "../common/errors.js";
import { verifyAccessToken } from "../common/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/** Requires a valid access token; attaches the decoded payload to req.user. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw Unauthorized("Missing bearer token");
  }
  try {
    req.user = verifyAccessToken(header.slice(7));
    next();
  } catch {
    throw Unauthorized("Invalid or expired token");
  }
}
