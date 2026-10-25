import { cleanConfig } from "@/lib/clean";
import { currentAccount } from "@/lib/session";
import { saveDraft } from "@/lib/store";

/** The editor's autosave: PUT { draft, review } stores the draft. The live page changes only on publish. */

const MAX_BYTES = 200_000;

export async function PUT(request: Request) {
  const profile = (await currentAccount())?.profile;
  if (!profile) return Response.json({ error: "Sign in again." }, { status: 401 });

  const body = await request.text();
  if (body.length > MAX_BYTES) return Response.json({ error: "This page is too long to save." }, { status: 413 });
  let input: { draft?: unknown; review?: unknown };
  try {
    input = JSON.parse(body);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const review = Array.isArray(input.review) ? input.review.filter((r) => typeof r === "string") : [];
  const saved = await saveDraft(profile.userId, cleanConfig(input.draft), review);
  return Response.json({ updatedAt: saved?.updatedAt });
}
