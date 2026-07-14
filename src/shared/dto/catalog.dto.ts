import { z } from "zod";

const slug = z
  .string()
  .trim()
  .min(1)
  .max(140)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a lowercase, hyphenated slug");

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
  description: z.string().trim().max(2000).optional(),
  iconUrl: z.string().url().max(2000).optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema
  .partial()
  .extend({ isActive: z.boolean().optional() });
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const createExpertiseTagSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug,
});
export type CreateExpertiseTagInput = z.infer<typeof createExpertiseTagSchema>;

export const createLanguageSchema = z.object({
  code: z.string().trim().min(2).max(10).toLowerCase(),
  name: z.string().trim().min(2).max(80),
});
export type CreateLanguageInput = z.infer<typeof createLanguageSchema>;
