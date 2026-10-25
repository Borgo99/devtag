/**
 * Where profile pages live. With NEXT_PUBLIC_ROOT_DOMAIN set (e.g. "devtag.io", which needs a
 * wildcard domain on Vercel), each profile gets a subdomain: andrea.devtag.io. Without it
 * (local development, *.vercel.app deployments) profiles are paths on the same site: /andrea.
 */

export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || undefined;

/** The domain shown in texts like "yourname.devtag.io". */
export const DISPLAY_DOMAIN = ROOT_DOMAIN ?? "devtag.io";

const protocol = ROOT_DOMAIN?.startsWith("localhost") ? "http" : "https";

/** The main site: landing, login and editor. */
export const SITE_URL = ROOT_DOMAIN ? `${protocol}://${ROOT_DOMAIN}` : "/";

export const profileUrl = (username: string) =>
  ROOT_DOMAIN ? `${protocol}://${username}.${ROOT_DOMAIN}` : `/${username}`;

/** "andrea.devtag.io" → "andrea". The main domain, "www" and other hosts → undefined. */
export function subdomain(host: string | null) {
  if (!ROOT_DOMAIN || !host?.endsWith(`.${ROOT_DOMAIN}`)) return undefined;
  const name = host.slice(0, -ROOT_DOMAIN.length - 1);
  return name === "www" || name.includes(".") ? undefined : name;
}
