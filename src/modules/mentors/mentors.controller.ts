import type { Request, Response } from "express";
import { Unauthorized } from "../../common/errors.js";
import { ok } from "../../common/http.js";
import type {
  CreateExperienceInput,
  MentorSearchQuery,
  SetIdsInput,
  UpdateExperienceInput,
  UpdateMentorProfileInput,
  VerifyMentorInput,
} from "../../shared/index.js";
import * as service from "./mentors.service.js";

const uid = (req: Request): string => {
  if (!req.user) throw Unauthorized();
  return req.user.sub;
};

// ---- Self ---------------------------------------------------------------

export async function getMe(req: Request, res: Response): Promise<void> {
  ok(res, await service.getMyProfile(uid(req)));
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  ok(res, await service.updateMyProfile(uid(req), req.body as UpdateMentorProfileInput));
}

export async function addExperience(req: Request, res: Response): Promise<void> {
  ok(res, await service.addExperience(uid(req), req.body as CreateExperienceInput), 201);
}

export async function updateExperience(req: Request, res: Response): Promise<void> {
  ok(res, await service.updateExperience(uid(req), req.params.id!, req.body as UpdateExperienceInput));
}

export async function deleteExperience(req: Request, res: Response): Promise<void> {
  await service.deleteExperience(uid(req), req.params.id!);
  ok(res, { deleted: true });
}

export async function setCategories(req: Request, res: Response): Promise<void> {
  ok(res, await service.setCategories(uid(req), (req.body as SetIdsInput).ids));
}

export async function setExpertise(req: Request, res: Response): Promise<void> {
  ok(res, await service.setExpertise(uid(req), (req.body as SetIdsInput).ids));
}

export async function setLanguages(req: Request, res: Response): Promise<void> {
  ok(res, await service.setLanguages(uid(req), (req.body as SetIdsInput).ids));
}

// ---- Public -------------------------------------------------------------

export async function search(req: Request, res: Response): Promise<void> {
  // Query already validated + coerced by the `validate(..., "query")` middleware.
  ok(res, await service.searchMentors(req.query as unknown as MentorSearchQuery));
}

export async function getById(req: Request, res: Response): Promise<void> {
  ok(res, await service.getMentorById(req.params.id!));
}

// ---- Admin --------------------------------------------------------------

export async function listPending(_req: Request, res: Response): Promise<void> {
  ok(res, await service.listPending());
}

export async function verify(req: Request, res: Response): Promise<void> {
  ok(res, await service.verifyMentor(req.params.id!, req.body as VerifyMentorInput));
}
