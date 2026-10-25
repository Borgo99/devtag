import { readFileSync } from "node:fs";
import { getMigrations } from "better-auth/db/migration";
import { Pool } from "pg";
import { authOptions } from "../src/lib/auth.ts";
import { pool as appPool } from "../src/lib/db.ts";

/**
 * Creates or updates the database tables: Better Auth's own, then ours (db/schema.sql).
 * Run with `npm run db:migrate`. It uses the direct (unpooled) Neon address, as schema changes should.
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED });
try {
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations({ ...authOptions, database: pool });
  const changes = [...toBeCreated.map((t) => `create ${t.table}`), ...toBeAdded.map((t) => `update ${t.table}`)];
  await runMigrations();
  console.log(changes.length ? `Login tables: ${changes.join(", ")}` : "Login tables: up to date");

  await pool.query(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("devtag tables: up to date");
} finally {
  await pool.end();
  await appPool.end();
}
