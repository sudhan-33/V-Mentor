import { Router } from "express";
import { authRouter } from "./modules/auth/index.js";

/** Aggregates every module router under /api. New modules mount here. */
export const apiRouter: Router = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

apiRouter.use("/auth", authRouter);
// apiRouter.use("/mentors", mentorRouter);   ← future modules
// apiRouter.use("/bookings", bookingRouter);
