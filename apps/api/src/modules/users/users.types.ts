import type { AuthProvider, PublicUser, UserRole, UserStatus } from "@vmentor/shared";

/** Raw `users` row as returned by PostgreSQL (snake_case). */
export interface UserRow {
  id: string;
  email: string;
  phone: string | null;
  password_hash: string | null;
  role: UserRole;
  full_name: string;
  photo_url: string | null;
  status: UserStatus;
  auth_provider: AuthProvider;
  provider_sub: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Strip sensitive fields → API-safe user. */
export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    role: row.role,
    fullName: row.full_name,
    photoUrl: row.photo_url,
    status: row.status,
    authProvider: row.auth_provider,
    emailVerified: row.email_verified,
    phoneVerified: row.phone_verified,
    createdAt: row.created_at,
  };
}
