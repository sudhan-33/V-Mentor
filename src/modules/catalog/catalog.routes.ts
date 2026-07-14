import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { UserRole } from "../../shared/index.js";
import * as controller from "./catalog.controller.js";
import {
  createCategorySchema,
  createExpertiseTagSchema,
  createLanguageSchema,
  updateCategorySchema,
} from "./catalog.validation.js";

const router: Router = Router();
const adminOnly = [authenticate, requireRole(UserRole.ADMIN)];

// Public reads
router.get("/categories", asyncHandler(controller.listCategories));
router.get("/expertise-tags", asyncHandler(controller.listExpertiseTags));
router.get("/languages", asyncHandler(controller.listLanguages));

// Admin writes
router.post(
  "/categories",
  ...adminOnly,
  validate(createCategorySchema),
  asyncHandler(controller.createCategory),
);
router.patch(
  "/categories/:id",
  ...adminOnly,
  validate(updateCategorySchema),
  asyncHandler(controller.updateCategory),
);
router.delete("/categories/:id", ...adminOnly, asyncHandler(controller.deactivateCategory));

router.post(
  "/expertise-tags",
  ...adminOnly,
  validate(createExpertiseTagSchema),
  asyncHandler(controller.createExpertiseTag),
);
router.delete("/expertise-tags/:id", ...adminOnly, asyncHandler(controller.deleteExpertiseTag));

router.post(
  "/languages",
  ...adminOnly,
  validate(createLanguageSchema),
  asyncHandler(controller.createLanguage),
);

export default router;
