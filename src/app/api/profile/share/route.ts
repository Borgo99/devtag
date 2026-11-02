import { currentAccount } from "@/lib/session";
import { SHARE_PLACES, recordShare } from "@/lib/store";

/** POST { place }: the user shared their page from the editor's share dialog. For the funnel. */
export async function POST(request: Request) {
  const profile = (await currentAccount())?.profile;
  if (!profile) return Response.json({ error: "Sign in again." }, { status: 401 });

  const { place } = await request.json().catch(() => ({}));
  const known = SHARE_PLACES.find((p) => p === place);
  if (!known) return Response.json({ error: "Unknown place." }, { status: 400 });

  await recordShare(profile.userId, known);
  return new Response(null, { status: 204 });
}
