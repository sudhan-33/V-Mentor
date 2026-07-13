import type { AuthProvider, UserRole, UserStatus } from "../enums.js";

/** Public-safe user shape returned by the API (never includes password_hash). */
export interface PublicUser {
  id: string;
  email: string;
  phone: string | null;
  role: UserRole;
  fullName: string;
  photoUrl: string | null;
  status: UserStatus;
  authProvider: AuthProvider;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

/** Payload encoded inside the access JWT. */
export interface AuthTokenPayload {
  sub: string; // user id
  role: UserRole;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession {
  user: PublicUser;
  tokens: AuthTokens;
}
