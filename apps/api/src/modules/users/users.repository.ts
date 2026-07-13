import type { PoolClient } from "pg";
import { pool, query } from "../../config/db.js";
import type { UserRole, UserStatus } from "@vmentor/shared";
import type { UserRow } from "./users.types.js";

const COLUMNS = `
  id, email, phone, password_hash, role, full_name, photo_url, status,
  auth_provider, provider_sub, email_verified, phone_verified,
  last_login_at, created_at, updated_at, deleted_at
`;

export async function findByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    `SELECT ${COLUMNS} FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    `SELECT ${COLUMNS} FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return rows[0] ?? null;
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  phone?: string | null;
  status: UserStatus;
}

/** Insert a user; accepts an optional client so it can run inside a transaction. */
export async function createUser(
  input: CreateUserInput,
  client?: PoolClient,
): Promise<UserRow> {
  const runner = client ?? pool;
  const res = await runner.query<UserRow>(
    `INSERT INTO users (email, password_hash, role, full_name, phone, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [input.email, input.passwordHash, input.role, input.fullName, input.phone ?? null, input.status],
  );
  return res.rows[0]!;
}

export async function touchLastLogin(id: string): Promise<void> {
  await query("UPDATE users SET last_login_at = now() WHERE id = $1", [id]);
}
