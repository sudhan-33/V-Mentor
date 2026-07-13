import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as controller from "./auth.controller.js";
import { loginSchema, refreshSchema, registerSchema } from "./auth.validation.js";

const router: Router = Router();

router.post("/register", validate(registerSchema), asyncHandler(controller.register));
router.post("/login", validate(loginSchema), asyncHandler(controller.login));
router.post("/refresh", validate(refreshSchema), asyncHandler(controller.refresh));
router.post("/logout", authenticate, asyncHandler(controller.logout));
router.get("/me", authenticate, asyncHandler(controller.me));

export default router;
