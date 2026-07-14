import { z } from "zod";
import { paginationSchema } from "./pagination.dto.js";

/** Public mentor discovery query — filters + sort + pagination. */
export const mentorSearchQuerySchema = paginationSchema.extend({
  category: z.string().trim().optional(), // slug or uuid
  expertise: z.string().trim().optional(), // slug or uuid
  language: z.string().trim().optional(), // code or uuid
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  q: z.string().trim().max(120).optional(),
  sort: z.enum(["rating", "price_asc", "price_desc", "experience"]).default("rating"),
});
export type MentorSearchQuery = z.infer<typeof mentorSearchQuerySchema>;
