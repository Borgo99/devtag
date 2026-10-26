import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
// With ".ts": scripts/migrate.ts runs this file directly with Node.
import { pool } from "./db.ts";

/**
 * Login with Better Auth, running inside the app: GitHub, Google and LinkedIn, sessions in the Neon database.
 * BETTER_AUTH_SECRET signs the session cookies; BETTER_AUTH_URL is this site's address, which providers
 * send users back to (/api/auth/callback/github, /google, /linkedin). Signing in with another provider
 * under the same verified email opens the same account.
 */

/** In the order of the login page's buttons. */
export const PROVIDERS = ["github", "google", "linkedin"] as const;
export type Provider = (typeof PROVIDERS)[number];

/** A provider is on when both its keys are set: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET, and so on. */
function keys(provider: Provider) {
  const clientId = process.env[`${provider.toUpperCase()}_CLIENT_ID`];
  const clientSecret = process.env[`${provider.toUpperCase()}_CLIENT_SECRET`];
  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}

export const enabledProviders = PROVIDERS.filter((provider) => keys(provider));

export const authOptions = {
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: { github: keys("github"), google: keys("google"), linkedin: keys("linkedin") },
  // Lets server actions set cookies; it must stay the last plugin.
  plugins: [nextCookies()],
} satisfies BetterAuthOptions;

export const auth = betterAuth(authOptions);
