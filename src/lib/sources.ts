/**
 * Where a visit to the main site came from, for the funnel (admin/stats): the link's ?ref= tag when it has one
 * ("reddit-webdev"), else the referring site ("reddit.com"), else "direct". Visitors coming from a profile page
 * are "page": its footer link is tagged, and so is a referrer on a subdomain.
 */

/** Short links and redirectors, named after the site behind them. */
const ALIASES: Record<string, string> = {
  "lnkd.in": "linkedin.com",
  "t.co": "x.com",
  "twitter.com": "x.com",
};

export function visitSource(ref: unknown, referrer: unknown, rootDomain?: string): string {
  const tag = typeof ref === "string" ? ref.trim().toLowerCase() : "";
  if (/^[a-z0-9-]{1,40}$/.test(tag)) return tag;

  let host: string;
  try {
    host = new URL(String(referrer)).hostname.toLowerCase();
  } catch {
    return "direct";
  }
  if (rootDomain && (host === rootDomain || host.endsWith(`.${rootDomain}`))) {
    return host === rootDomain || host === `www.${rootDomain}` ? "direct" : "page";
  }
  // www.reddit.com, old.reddit.com, out.reddit.com, l.facebook.com… all count as the site itself.
  host = host.replace(/^(www|old|out|m|l|lm)\./, "");
  if (/^google\.[a-z.]+$/.test(host)) return "google";
  return ALIASES[host] ?? host.slice(0, 60);
}
