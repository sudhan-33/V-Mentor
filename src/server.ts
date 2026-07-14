import type { Server } from "node:http";
import { createApp } from "./app.js";
import { closePool, verifyConnection } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

let server: Server;

async function start(): Promise<void> {
  try {
    await verifyConnection();
    logger.info("[OK] Database connected");
  } catch (err) {
    logger.error({ err }, "[FAIL] Could not connect to the database");
    process.exit(1);
  }

  const app = createApp();
  server = app.listen(env.API_PORT, () => {
    logger.info(`[OK] VMentor backend running at http://localhost:${env.API_PORT}/api`);
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received - shutting down`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

void start();
