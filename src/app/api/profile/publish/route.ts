import { cleanConfig, publishProblems } from "@/lib/clean";
import { currentAccount } from "@/lib/session";
import { publish } from "@/lib/store";

/** POST: the saved draft becomes the live page, without its half-filled items. */
export async function POST() {
  const profile = (await currentAccount())?.profile;
  if (!profile) return Response.json({ error: "Sign in again." }, { status: 401 });

  const published = cleanConfig(profile.draft, { complete: true });
  const problems = publishProblems(published);
  if (problems.length) return Response.json({ error: problems.join(" ") }, { status: 400 });

  const saved = await publish(profile.userId, published);
  return Response.json({ publishedAt: saved?.publishedAt });
}
