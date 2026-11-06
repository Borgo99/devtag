import { cvToConfig, ImportError } from "@/lib/cv/ai";
import { readCvRequest } from "@/lib/cv/input";
import { keepGuestToken } from "@/lib/guest";
import { GUEST_IMPORTS_PER_VISITOR, returnGuestImport, saveGuestDraft, takeGuestImport } from "@/lib/store";
import { visitor } from "@/lib/visits";

/**
 * POST { text }: the landing's CV import, without an account. Like /api/cv, but the page it makes is kept for a
 * day behind a cookie (lib/guest.ts) and shown at /preview, where the visitor can claim it.
 */

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(request: Request) {
  // Each try is an AI call: only for people in a browser, counted per visitor.
  const who = await visitor();
  if (!who) return fail("Open devtag in your browser to try it.", 403);
  const checked = await readCvRequest(request);
  if ("error" in checked) return fail(checked.error, checked.status);

  const ticket = await takeGuestImport(who);
  if ("limit" in ticket) {
    return fail(
      ticket.limit === "visitor"
        ? `That's ${GUEST_IMPORTS_PER_VISITOR} tries today. Claim your page to import again from the editor.`
        : "Lots of people are trying devtag right now. Try again in a few hours, or claim your page first.",
      429,
    );
  }

  try {
    await saveGuestDraft(ticket.id, await cvToConfig(checked.text, request.signal));
    await keepGuestToken(ticket.token);
    return Response.json({ ok: true });
  } catch (error) {
    // A cancelled try still counts, as in /api/cv.
    if (request.signal.aborted) return new Response(null, { status: 499 });
    await returnGuestImport(ticket.id);
    if (error instanceof ImportError) return fail(error.message, 503);
    // The error only, never the CV text: it's personal data.
    console.error("[cv guest import]", error);
    return fail("The AI is not answering right now. Try again in a minute.", 502);
  }
}
