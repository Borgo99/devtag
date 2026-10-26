import { currentUser } from "@/lib/session";
import { readSite } from "@/lib/site-preview";
import { SITE_READS_PER_USER, savePhoto, takeSiteRead } from "@/lib/store";

/**
 * The editor's site reader: POST { url } with a project's live site; answers { image?, logo? }, the site's
 * preview image and icon, stored in our bucket. 422 when the site can't be opened.
 */

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail("Sign in again.", 401);

  const input = (await request.json().catch(() => undefined)) as { url?: unknown } | undefined;
  const raw = typeof input?.url === "string" ? input.url.trim() : "";
  let address: URL;
  try {
    // Like the page's links: "devtag.io/x" gets its https:// back.
    address = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return fail("This isn't a web address.", 400);
  }
  if (raw.length > 2000) return fail("This address is too long.", 400);

  if (!(await takeSiteRead(user.id)))
    return fail(`You've read ${SITE_READS_PER_USER} sites today. Previews will work again tomorrow.`, 429);

  let site;
  try {
    site = await readSite(address);
  } catch {
    return fail("This site couldn't be opened.", 422);
  }
  const [image, logo] = await Promise.all([
    site.image && savePhoto(user.id, site.image, "jpeg"),
    site.logo && savePhoto(user.id, site.logo, "png"),
  ]);
  return Response.json({ image: image || undefined, logo: logo || undefined });
}
