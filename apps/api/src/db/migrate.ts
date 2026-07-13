import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../config/db.js";
import { logger } from "../config/logger.js";

/**
 * Lightweight SQL applier — runs every committed script under db/sql in order.
 * There is NO migration-tracking table; scripts are written to be idempotent
 * (CREATE ... IF NOT EXISTS, CREATE OR REPLACE, guarded enum creation) so they
 * can be re-run safely. Commit the .sql files; run this to apply them.
 *
 * Order: functions/  →  migrations/  →  views/
 */
const here = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(here, "sql");

function readSqlFiles(folder: string): { name: string; sql: string }[] {
  const dir = join(sqlDir, folder);
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return []; // folder may not exist yet
  }
  return files.map((name) => ({ name, sql: readFileSync(join(dir, name), "utf8") }));
}

async function apply(): Promise<void> {
  const client = await pool.connect();
  try {
    for (const folder of ["functions", "migrations", "views"] as const) {
      for (const { name, sql } of readSqlFiles(folder)) {
        await client.query(sql);
        logger.info(`applied ${folder}/${name}`);
      }
    }
    logger.info("✅ all SQL scripts applied");
  } finally {
    client.release();
  }
}

try {
  await apply();
} catch (err) {
  logger.error({ err }, "applying SQL scripts failed");
  process.exitCode = 1;
} finally {
  await pool.end();
}
