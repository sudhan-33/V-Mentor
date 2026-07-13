/** Application error carrying an HTTP status + machine-readable code. */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const BadRequest = (msg = "Bad request", details?: unknown) =>
  new AppError(400, "BAD_REQUEST", msg, details);

export const Unauthorized = (msg = "Not authenticated") =>
  new AppError(401, "UNAUTHORIZED", msg);

export const Forbidden = (msg = "Not allowed") =>
  new AppError(403, "FORBIDDEN", msg);

export const NotFound = (msg = "Not found") =>
  new AppError(404, "NOT_FOUND", msg);

export const Conflict = (msg = "Already exists") =>
  new AppError(409, "CONFLICT", msg);
