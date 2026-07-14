import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { UserRole } from "../../shared/index.js";
import * as controller from "./mentors.controller.js";
import {
  createExperienceSchema,
  mentorSearchQuerySchema,
  setIdsSchema,
  updateExperienceSchema,
  updateMentorProfileSchema,
  verifyMentorSchema,
} from "./mentors.validation.js";

const router: Router = Router();
const mentorOnly = [authenticate, requireRole(UserRole.MENTOR)];
const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

// Public search (literal root)
router.get("/", validate(mentorSearchQuerySchema, "query"), asyncHandler(controller.search));

// Self (role = mentor) — declared before "/:id" so "me" is not captured as an id
router.get("/me", ...mentorOnly, asyncHandler(controller.getMe));
router.patch("/me", ...mentorOnly, validate(updateMentorProfileSchema), asyncHandler(controller.updateMe));
router.post(
  "/me/experiences",
  ...mentorOnly,
  validate(createExperienceSchema),
  asyncHandler(controller.addExperience),
);
router.patch(
  "/me/experiences/:id",
  ...mentorOnly,
  validate(updateExperienceSchema),
  asyncHandler(controller.updateExperience),
);
router.delete("/me/experiences/:id", ...mentorOnly, asyncHandler(controller.deleteExperience));
router.put("/me/categories", ...mentorOnly, validate(setIdsSchema), asyncHandler(controller.setCategories));
router.put("/me/expertise", ...mentorOnly, validate(setIdsSchema), asyncHandler(controller.setExpertise));
router.put("/me/languages", ...mentorOnly, validate(setIdsSchema), asyncHandler(controller.setLanguages));

// Admin (role = admin)
router.get("/pending", ...adminOnly, asyncHandler(controller.listPending));
router.patch(
  "/:id/verification",
  ...adminOnly,
  validate(verifyMentorSchema),
  asyncHandler(controller.verify),
);

// Public detail (param route — declared last)
router.get("/:id", asyncHandler(controller.getById));

export default router;
