import { after } from "next/server";
import { redditClickId } from "@/lib/reddit";
import { ROOT_DOMAIN } from "@/lib/site";
import { visitSource } from "@/lib/sources";
import { recordSiteVisit } from "@/lib/store";
import { visitor } from "@/lib/visits";

/**
 * POST { ref, clickId, referrer }: a visit to the landing or login page, sent by VisitBeacon once the page has
 * loaded, so bots that don't run scripts are left out too. Counted once a day per visitor, for the funnel.
 */
export async function POST(request: Request) {
  const who = await visitor();
  if (who) {
    const { ref, clickId, referrer } = await request.json().catch(() => ({}));
    const source = visitSource(ref, referrer, ROOT_DOMAIN);
    const click = redditClickId(clickId);
    after(() => recordSiteVisit(who, source, click).catch((error) => console.error("[hit]", error)));
  }
  return new Response(null, { status: 204 });
}
