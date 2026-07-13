import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@vmentor/shared";
import { Forbidden, Unauthorized } from "../common/errors.js";

/** Restricts a route to one of the given roles. Use after `authenticate`. */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) throw Unauthorized();
    if (!roles.includes(req.user.role)) {
      throw Forbidden(`Requires role: ${roles.join(" | ")}`);
    }
    next();
  };
}
