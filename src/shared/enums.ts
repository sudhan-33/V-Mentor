/**
 * Enums mirroring the PostgreSQL native enum types defined in the data model
 * (see docs/vmentor.dbml). Kept as `const` objects + union types so they can be
 * used at runtime (validation) and compile time (typing) on both FE and BE.
 */

export const UserRole = {
  STUDENT: "student",
  MENTOR: "mentor",
  ADMIN: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Roles a user is allowed to self-register as (admins are provisioned, not public). */
export const SELF_SIGNUP_ROLES: UserRole[] = [UserRole.STUDENT, UserRole.MENTOR];

export const UserStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AuthProvider = {
  LOCAL: "local",
  GOOGLE: "google",
} as const;
export type AuthProvider = (typeof AuthProvider)[keyof typeof AuthProvider];

export const MentorVerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type MentorVerificationStatus =
  (typeof MentorVerificationStatus)[keyof typeof MentorVerificationStatus];

export const AuthTokenType = {
  REFRESH: "refresh",
  EMAIL_VERIFY: "email_verify",
  PASSWORD_RESET: "password_reset",
  OTP: "otp",
} as const;
export type AuthTokenType = (typeof AuthTokenType)[keyof typeof AuthTokenType];
