import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
// With ".ts": scripts/migrate.ts runs this file directly with Node.
import { pool } from "./db.ts";

/**
 * Login with Better Auth, running inside the app: Google only, sessions in the Neon database.
 * BETTER_AUTH_SECRET signs the session cookies; BETTER_AUTH_URL is this site's address, which
 * Google sends users back to (/api/auth/callback/google).
 */
export const authOptions = {
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  // Lets server actions set cookies; it must stay the last plugin.
  plugins: [nextCookies()],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);
