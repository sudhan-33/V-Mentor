import type { PaginatedResult } from "../shared/index.js";

/** SQL OFFSET for a 1-based page. */
export const offset = (page: number, pageSize: number): number => (page - 1) * pageSize;

/** Wrap items + total count into the standard paginated envelope. */
export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
