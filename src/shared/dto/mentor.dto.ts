import { z } from "zod";

export const updateMentorProfileSchema = z.object({
  designation: z.string().trim().max(150).optional(),
  company: z.string().trim().max(150).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(80).optional(),
  bio: z.string().trim().max(5000).optional(),
  baseSessionPrice: z.coerce.number().min(0).max(1_000_000).optional(),
  currency: z.string().trim().length(3).toUpperCase().optional(),
  defaultSessionMinutes: z.coerce.number().int().min(15).max(480).optional(),
  timezone: z.string().trim().max(64).optional(),
  isAcceptingBookings: z.boolean().optional(),
});
export type UpdateMentorProfileInput = z.infer<typeof updateMentorProfileSchema>;

export const createExperienceSchema = z.object({
  title: z.string().trim().min(1).max(150),
  company: z.string().trim().max(150).optional(),
  location: z.string().trim().max(150).optional(),
  startDate: z.string().date().optional(), // YYYY-MM-DD
  endDate: z.string().date().optional(),
  description: z.string().trim().max(2000).optional(),
});
export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;

export const updateExperienceSchema = createExperienceSchema.partial();
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;

/** Replace-set the mentor's linked category/expertise/language ids. */
export const setIdsSchema = z.object({
  ids: z.array(z.string().uuid()).max(50),
});
export type SetIdsInput = z.infer<typeof setIdsSchema>;

export const verifyMentorSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});
export type VerifyMentorInput = z.infer<typeof verifyMentorSchema>;
