/** A username is also a subdomain (andrea.devtag.io) and a path (devtag.io/andrea). */

/** Names the site itself uses, or might need later. */
const RESERVED = new Set([
  "about",
  "account",
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "blog",
  "cdn",
  "dashboard",
  "demo",
  "dev",
  "devtag",
  "docs",
  "email",
  "help",
  "jobs",
  "login",
  "logout",
  "mail",
  "media",
  "new",
  "preview",
  "pricing",
  "privacy",
  "settings",
  "signup",
  "staging",
  "static",
  "status",
  "support",
  "terms",
  "welcome",
  "www",
]);

/** Why a name can't be used, or undefined if it can. */
export function usernameError(name: string) {
  if (name.length < 3 || name.length > 30) return "Use 3 to 30 characters.";
  if (!/^[a-z0-9-]+$/.test(name)) return "Use lowercase letters, numbers and dashes.";
  if (name.startsWith("-") || name.endsWith("-")) return "It can't start or end with a dash.";
  if (RESERVED.has(name)) return "This name is reserved.";
  return undefined;
}
