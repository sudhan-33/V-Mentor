import { Pool } from "pg";
import { env } from "./env.js";

/** Shared PostgreSQL connection pool (singleton). */
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (err) => {
  // eslint-disable-next-line no-console
  console.error("Unexpected error on idle PG client", err);
});

/** Small typed query helper. */
export async function query<T = unknown>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const res = await pool.query(text, params as never);
  return res.rows as T[];
}

export async function closePool(): Promise<void> {
  await pool.end();
}
