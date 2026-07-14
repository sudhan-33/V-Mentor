import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { BadRequest } from "../common/errors.js";

type Source = "body" | "query" | "params";

/** Validates + coerces a request part against a zod schema, replacing it with the parsed value. */
export function validate(schema: ZodTypeAny, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      throw BadRequest("Validation failed", result.error.flatten().fieldErrors);
    }
    // Replace body with the parsed value; merge into query/params (which some
    // Express versions expose as read-only getters).
    if (source === "body") req.body = result.data;
    else Object.assign(req[source], result.data);
    next();
  };
}
