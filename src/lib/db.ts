import { Pool } from "pg";

/**
 * The Neon Postgres connection pool, shared by the whole server (login and profiles). DATABASE_URL is
 * Neon's pooled address, made for many short-lived serverless connections.
 * Kept on globalThis in development, so hot reloads don't open a new pool each time.
 */

const saved = globalThis as unknown as { devtagPool?: Pool };

export const pool = saved.devtagPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== "production") saved.devtagPool = pool;
