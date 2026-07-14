import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../constants.js";
import { SELF_SIGNUP_ROLES, UserRole } from "../enums.js";

/** Roles allowed at public signup (student | mentor). */
export const signupRoleSchema = z.enum(
  SELF_SIGNUP_ROLES as [UserRole, ...UserRole[]],
);

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Name is too short").max(150),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .max(128),
  role: signupRoleSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});
export type RefreshInput = z.infer<typeof refreshSchema>;
