import { Router } from "express";
import { authRouter } from "./modules/auth/index.js";
import { catalogRouter } from "./modules/catalog/index.js";
import { mentorsRouter } from "./modules/mentors/index.js";
import { studentsRouter } from "./modules/students/index.js";

/** Aggregates every module router under /api. New modules mount here. */
export const apiRouter: Router = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/mentors", mentorsRouter);
apiRouter.use("/students", studentsRouter);
