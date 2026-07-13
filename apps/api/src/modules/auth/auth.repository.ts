import { createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { pool, query } from "../../config/db.js";
import { AuthTokenType, UserRole } from "@vmentor/shared";

export const hashToken = (raw: string): string =>
  createHash("sha256").update(raw).digest("hex");

/** Create the role-specific profile row inside the given transaction. */
export async function createRoleProfile(
  userId: string,
  role: UserRole,
  client: PoolClient,
): Promise<void> {
  if (role === UserRole.STUDENT) {
    await client.query("INSERT INTO student_profiles (user_id) VALUES ($1)", [userId]);
  } else if (role === UserRole.MENTOR) {
    await client.query("INSERT INTO mentor_profiles (user_id) VALUES ($1)", [userId]);
  }
  // admins have no extra profile table
}

/** Run a function inside a DB transaction, committing on success. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function storeRefreshToken(
  userId: string,
  rawToken: string,
  expiresAt: Date,
): Promise<void> {
  await query(
    `INSERT INTO auth_tokens (user_id, token_hash, type, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, hashToken(rawToken), AuthTokenType.REFRESH, expiresAt.toISOString()],
  );
}

/** Returns the active (unconsumed, unexpired) refresh token row, if any. */
export async function findActiveRefreshToken(userId: string, rawToken: string) {
  const rows = await query<{ id: string }>(
    `SELECT id FROM auth_tokens
      WHERE user_id = $1 AND type = $2 AND token_hash = $3
        AND consumed_at IS NULL AND expires_at > now()`,
    [userId, AuthTokenType.REFRESH, hashToken(rawToken)],
  );
  return rows[0] ?? null;
}

export async function consumeRefreshToken(id: string): Promise<void> {
  await query("UPDATE auth_tokens SET consumed_at = now() WHERE id = $1", [id]);
}

/** Revoke all of a user's refresh tokens (logout everywhere). */
export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await query(
    `UPDATE auth_tokens SET consumed_at = now()
      WHERE user_id = $1 AND type = $2 AND consumed_at IS NULL`,
    [userId, AuthTokenType.REFRESH],
  );
}
