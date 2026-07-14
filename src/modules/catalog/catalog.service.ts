import { Conflict, NotFound } from "../../common/errors.js";
import type {
  Category,
  CreateCategoryInput,
  CreateExpertiseTagInput,
  CreateLanguageInput,
  ExpertiseTag,
  Language,
  UpdateCategoryInput,
} from "../../shared/index.js";
import * as repo from "./catalog.repository.js";
import { toCategory, toExpertiseTag, toLanguage } from "./catalog.types.js";

// ---- Categories ---------------------------------------------------------

export async function listCategories(activeOnly: boolean): Promise<Category[]> {
  return (await repo.listCategories(activeOnly)).map(toCategory);
}

export async function createCategory(input: CreateCategoryInput): Promise<Category> {
  if (await repo.findCategoryBySlug(input.slug)) {
    throw Conflict(`Category slug "${input.slug}" already exists`);
  }
  if (input.parentId && !(await repo.findCategoryById(input.parentId))) {
    throw NotFound("Parent category not found");
  }
  return toCategory(await repo.insertCategory(input));
}

export async function updateCategory(
  id: string,
  patch: UpdateCategoryInput,
): Promise<Category> {
  if (!(await repo.findCategoryById(id))) throw NotFound("Category not found");
  if (patch.slug) {
    const bySlug = await repo.findCategoryBySlug(patch.slug);
    if (bySlug && bySlug.id !== id) throw Conflict(`Category slug "${patch.slug}" already exists`);
  }
  const updated = await repo.updateCategory(id, patch);
  if (!updated) throw NotFound("Category not found");
  return toCategory(updated);
}

/** Deactivate (hide) a category without deleting its historical data. */
export async function deactivateCategory(id: string): Promise<Category> {
  const row = await repo.deactivateCategory(id);
  if (!row) throw NotFound("Category not found");
  return toCategory(row);
}

// ---- Expertise tags -----------------------------------------------------

export async function listExpertiseTags(q?: string): Promise<ExpertiseTag[]> {
  return (await repo.listExpertiseTags(q)).map(toExpertiseTag);
}

export async function createExpertiseTag(
  input: CreateExpertiseTagInput,
): Promise<ExpertiseTag> {
  if (await repo.findExpertiseTagBySlug(input.slug)) {
    throw Conflict(`Expertise tag slug "${input.slug}" already exists`);
  }
  return toExpertiseTag(await repo.insertExpertiseTag(input));
}

export async function deleteExpertiseTag(id: string): Promise<void> {
  if (!(await repo.deleteExpertiseTag(id))) throw NotFound("Expertise tag not found");
}

// ---- Languages ----------------------------------------------------------

export async function listLanguages(): Promise<Language[]> {
  return (await repo.listLanguages()).map(toLanguage);
}

export async function createLanguage(input: CreateLanguageInput): Promise<Language> {
  if (await repo.findLanguageByCode(input.code)) {
    throw Conflict(`Language code "${input.code}" already exists`);
  }
  return toLanguage(await repo.insertLanguage(input));
}
