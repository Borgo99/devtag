import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { GuestPreview } from "@/components/landing/GuestPreview";
import { guestPage } from "@/lib/guest";
import { DISPLAY_DOMAIN } from "@/lib/site";
import { slugify } from "@/lib/text";
import type { PortfolioConfig } from "@/lib/types";
import { usernameError } from "@/lib/usernames";

/** The page made from a CV on the landing, before signing in: see it, then claim it. */

export const metadata: Metadata = { title: "Your page — devtag", robots: { index: false } };

const count = (n = 0, word: string) => (n > 0 ? `${n} ${word}${n === 1 ? "" : "s"}` : "");

/** What the import found, the way the landing shows it: "4 jobs · 2 degrees". */
function found(c: PortfolioConfig) {
  const skills = new Set(
    [...(c.topSkills ?? []), ...c.skills, ...(c.stack ?? []).flatMap((group) => group.items)].flatMap((skill) =>
      skill ? [(typeof skill === "string" ? skill : skill.name).toLowerCase()] : [],
    ),
  );
  return [
    [count(c.experience?.length, "job"), count(c.education?.length, "degree")],
    [count(skills.size, "skill"), count(c.projects?.length, "project")],
    [count(c.publications?.length, "publication")],
  ]
    .map((line) => line.filter(Boolean).join(" · "))
    .filter(Boolean);
}

/** "Ada Lovelace" → "ada-lovelace", if that's a valid address. */
function suggestion(name: string) {
  const slug = slugify(name).slice(0, 30).replace(/-+$/, "");
  return usernameError(slug) ? "" : slug;
}

export default async function PreviewPage() {
  const draft = await guestPage();
  if (!draft) redirect("/#claim");
  return <GuestPreview domain={DISPLAY_DOMAIN} suggestion={suggestion(draft.profile.name)} found={found(draft)} />;
}
