import dotenv from "dotenv";
import { z } from "zod";

// Load the monorepo-root .env (scripts run from apps/api, so ../../ is the root).
// Any real process env vars already set take precedence over the file.
dotenv.config({ path: "../../.env" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  BCRYPT_ROUNDS: z.coerce.number().default(10),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
