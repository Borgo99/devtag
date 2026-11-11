import { guestPage } from "@/lib/guest";

/** The page made from a CV without an account, with stand-ins like the editor's preview (admin/preview/load.ts). */
export async function loadGuestPage() {
  const draft = await guestPage();
  if (!draft) return undefined;
  return {
    ...draft,
    profile: { ...draft.profile, name: draft.profile.name || "Your Name", role: draft.profile.role || "Your role" },
  };
}

/** Links inside the preview stay inside the preview. */
export const GUEST_PREVIEW_BASE = "/preview/page";
