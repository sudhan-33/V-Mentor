import type { Request, Response } from "express";
import { Unauthorized } from "../../common/errors.js";
import { ok } from "../../common/http.js";
import type { UpdateStudentProfileInput } from "../../shared/index.js";
import * as service from "./students.service.js";

const uid = (req: Request): string => {
  if (!req.user) throw Unauthorized();
  return req.user.sub;
};

export async function getMe(req: Request, res: Response): Promise<void> {
  ok(res, await service.getMyProfile(uid(req)));
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  ok(res, await service.updateMyProfile(uid(req), req.body as UpdateStudentProfileInput));
}
