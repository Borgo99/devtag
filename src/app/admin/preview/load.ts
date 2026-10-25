import { currentAccount } from "@/lib/session";

/** The signed-in user's draft, with stand-ins for the name and role so an empty page still looks like one. */
export async function loadDraft() {
  const draft = (await currentAccount())?.profile?.draft;
  if (!draft) return undefined;
  return {
    ...draft,
    profile: { ...draft.profile, name: draft.profile.name || "Your Name", role: draft.profile.role || "Your role" },
  };
}

/** Links inside the preview stay inside the preview. */
export const PREVIEW_BASE = "/admin/preview";
