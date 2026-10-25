import { getProfile } from "@/lib/store";
import { usernameError } from "@/lib/usernames";

/** GET /api/username?name=andrea → can this name still be claimed? Used by the claim box. */
export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.toLowerCase() ?? "";
  const error = usernameError(name);
  if (error) return Response.json({ available: false, error });
  const taken = Boolean(await getProfile(name));
  return Response.json({ available: !taken, error: taken ? "Already taken." : undefined });
}
