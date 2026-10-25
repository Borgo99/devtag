import { cvToConfig, ImportError } from "@/lib/cv/ai";
import { checkCvText, MAX_CHARS } from "@/lib/cv/input";
import { currentUser } from "@/lib/session";
import { CV_IMPORTS_PER_USER, returnCvImport, takeCvImport } from "@/lib/store";

/** POST { text } (the CV as read in the browser) → { config } filled in by the AI. */

// The JSON around the text, and up to 4 bytes per character.
const MAX_BYTES = MAX_CHARS * 4 + 1_000;

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return fail("Sign in again.", 401);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("Send JSON.", 415);
  // Refuse big bodies before reading them, when the size is announced, and after reading otherwise.
  if (Number(request.headers.get("content-length")) > MAX_BYTES) return fail("This CV is too long.", 413);

  const body = await request.text();
  if (body.length > MAX_BYTES) return fail("This CV is too long.", 413);
  let input: unknown;
  try {
    input = JSON.parse(body);
  } catch {
    return fail("Invalid JSON.", 400);
  }

  const checked = checkCvText((input as { text?: unknown } | null)?.text);
  if ("error" in checked) return fail(checked.error, checked.status);

  // Counted before the AI call; given back below if the AI fails on our side.
  const ticket = await takeCvImport(user.id);
  if ("limit" in ticket) {
    return fail(
      ticket.limit === "user"
        ? `You've used your ${CV_IMPORTS_PER_USER} CV imports for today. Try again tomorrow, or edit your page by hand.`
        : "Too many CV imports on devtag right now. Try again in a few hours.",
      429,
    );
  }

  try {
    return Response.json({ config: await cvToConfig(checked.text, request.signal) });
  } catch (error) {
    // A cancelled import still counts: cancelling can't be used to get around the limit.
    if (request.signal.aborted) return new Response(null, { status: 499 });
    await returnCvImport(ticket.id);
    if (error instanceof ImportError) return fail(error.message, 503);
    // The error only, never the CV text: it's personal data.
    console.error("[cv import]", error);
    return fail("The AI is not answering right now. Try again in a minute.", 502);
  }
}
