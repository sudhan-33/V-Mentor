import { createApp } from "./app.js";
import { closePool } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const app = createApp();
const server = app.listen(env.API_PORT, () => {
  logger.info(`🚀 VMentor API listening on http://localhost:${env.API_PORT}/api/v1`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    await closePool();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
