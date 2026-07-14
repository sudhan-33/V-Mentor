import type { Request, Response } from "express";
import { ok } from "../../common/http.js";
import type {
  CreateCategoryInput,
  CreateExpertiseTagInput,
  CreateLanguageInput,
  UpdateCategoryInput,
} from "../../shared/index.js";
import * as service from "./catalog.service.js";

// ---- Categories ---------------------------------------------------------

export async function listCategories(req: Request, res: Response): Promise<void> {
  const activeOnly = req.query.active === "true";
  ok(res, await service.listCategories(activeOnly));
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  ok(res, await service.createCategory(req.body as CreateCategoryInput), 201);
}

export async function updateCategory(req: Request, res: Response): Promise<void> {
  ok(res, await service.updateCategory(req.params.id!, req.body as UpdateCategoryInput));
}

export async function deactivateCategory(req: Request, res: Response): Promise<void> {
  ok(res, await service.deactivateCategory(req.params.id!));
}

// ---- Expertise tags -----------------------------------------------------

export async function listExpertiseTags(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  ok(res, await service.listExpertiseTags(q));
}

export async function createExpertiseTag(req: Request, res: Response): Promise<void> {
  ok(res, await service.createExpertiseTag(req.body as CreateExpertiseTagInput), 201);
}

export async function deleteExpertiseTag(req: Request, res: Response): Promise<void> {
  await service.deleteExpertiseTag(req.params.id!);
  ok(res, { deleted: true });
}

// ---- Languages ----------------------------------------------------------

export async function listLanguages(_req: Request, res: Response): Promise<void> {
  ok(res, await service.listLanguages());
}

export async function createLanguage(req: Request, res: Response): Promise<void> {
  ok(res, await service.createLanguage(req.body as CreateLanguageInput), 201);
}
