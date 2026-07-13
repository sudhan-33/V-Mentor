import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  UserRole,
  UserStatus,
  type AuthSession,
  type AuthTokens,
  type LoginInput,
  type PublicUser,
  type RegisterInput,
} from "@vmentor/shared";
import { Conflict, Forbidden, NotFound, Unauthorized } from "../../common/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/jwt.js";
import { env } from "../../config/env.js";
import * as users from "../users/users.repository.js";
import { toPublicUser } from "../users/users.types.js";
import * as authRepo from "./auth.repository.js";

async function issueTokens(user: {
  id: string;
  role: UserRole;
  email: string;
}): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });

  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: user.id, jti });
  const decoded = jwt.decode(refreshToken) as { exp: number };
  await authRepo.storeRefreshToken(user.id, refreshToken, new Date(decoded.exp * 1000));

  return { accessToken, refreshToken };
}

/** Register a student or mentor (the admin role is never self-registered). */
export async function register(input: RegisterInput): Promise<AuthSession> {
  if (input.role === UserRole.ADMIN) throw Forbidden("Cannot self-register as admin");

  const existing = await users.findByEmail(input.email);
  if (existing) throw Conflict("An account with this email already exists");

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);

  const row = await authRepo.withTransaction(async (client) => {
    const created = await users.createUser(
      {
        email: input.email,
        passwordHash,
        role: input.role,
        fullName: input.fullName,
        phone: input.phone || null,
        // students are active immediately; mentors stay pending until admin verifies
        status: input.role === UserRole.MENTOR ? UserStatus.PENDING : UserStatus.ACTIVE,
      },
      client,
    );
    await authRepo.createRoleProfile(created.id, input.role, client);
    return created;
  });

  const tokens = await issueTokens(row);
  return { user: toPublicUser(row), tokens };
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const row = await users.findByEmail(input.email);
  if (!row || !row.password_hash) throw Unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(input.password, row.password_hash);
  if (!valid) throw Unauthorized("Invalid email or password");

  if (row.status === UserStatus.SUSPENDED) throw Forbidden("Account is suspended");

  await users.touchLastLogin(row.id);
  const tokens = await issueTokens(row);
  return { user: toPublicUser(row), tokens };
}

/** Rotate a refresh token: validate + consume the old one, issue a fresh pair. */
export async function refresh(refreshToken: string): Promise<AuthTokens> {
  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw Unauthorized("Invalid refresh token");
  }

  const active = await authRepo.findActiveRefreshToken(payload.sub, refreshToken);
  if (!active) throw Unauthorized("Refresh token expired or revoked");

  const row = await users.findById(payload.sub);
  if (!row) throw Unauthorized("User no longer exists");

  await authRepo.consumeRefreshToken(active.id);
  return issueTokens(row);
}

export async function logout(userId: string): Promise<void> {
  await authRepo.revokeAllRefreshTokens(userId);
}

export async function me(userId: string): Promise<PublicUser> {
  const row = await users.findById(userId);
  if (!row) throw NotFound("User not found");
  return toPublicUser(row);
}
