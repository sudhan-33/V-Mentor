import type { Request, Response } from "express";
import type { LoginInput, RefreshInput, RegisterInput } from "@vmentor/shared";
import { Unauthorized } from "../../common/errors.js";
import { ok } from "../../common/http.js";
import * as authService from "./auth.service.js";

export async function register(req: Request, res: Response): Promise<void> {
  const session = await authService.register(req.body as RegisterInput);
  ok(res, session, 201);
}

export async function login(req: Request, res: Response): Promise<void> {
  const session = await authService.login(req.body as LoginInput);
  ok(res, session);
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshInput;
  const tokens = await authService.refresh(refreshToken);
  ok(res, tokens);
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (!req.user) throw Unauthorized();
  await authService.logout(req.user.sub);
  ok(res, { loggedOut: true });
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) throw Unauthorized();
  const user = await authService.me(req.user.sub);
  ok(res, user);
}
