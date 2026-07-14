import { z } from "zod";

export const updateStudentProfileSchema = z.object({
  headline: z.string().trim().max(200).optional(),
  goals: z.string().trim().max(5000).optional(),
  interests: z.string().trim().max(5000).optional(),
});
export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
