import type { CorsOptions } from "cors";
import { env } from "./env.js";

const allowed = env.CORS_ORIGIN.split(",").map((o) => o.trim());

export const corsOptions: CorsOptions = {
  origin: allowed.length === 1 ? allowed[0] : allowed,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};
