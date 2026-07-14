import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updateStudentProfileSchema, UserRole } from "../../shared/index.js";
import * as controller from "./students.controller.js";

const router: Router = Router();
const studentOnly = [authenticate, requireRole(UserRole.STUDENT)];

router.get("/me", ...studentOnly, asyncHandler(controller.getMe));
router.patch(
  "/me",
  ...studentOnly,
  validate(updateStudentProfileSchema),
  asyncHandler(controller.updateMe),
);

export default router;
