import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { cleanConfig } from "@/lib/clean";
import { currentAccount } from "@/lib/session";
import { DISPLAY_DOMAIN, profileUrl } from "@/lib/site";
import { signOutAction } from "./actions";

export const metadata: Metadata = { title: "Editor — devtag", robots: { index: false } };

export default async function AdminPage() {
  const account = await currentAccount();
  if (!account) redirect("/login");
  // Signed in, but no name claimed yet.
  if (!account.profile) redirect("/welcome");
  const { profile } = account;

  // Publishing would change nothing: the live page already shows this draft.
  const upToDate =
    Boolean(profile.published) &&
    JSON.stringify(cleanConfig(profile.draft, { complete: true })) === JSON.stringify(profile.published);

  return (
    <Editor
      address={`${profile.username}.${DISPLAY_DOMAIN}`}
      pageUrl={profileUrl(profile.username)}
      draft={profile.draft}
      review={profile.review}
      upToDate={upToDate}
      everPublished={Boolean(profile.published)}
      signOut={signOutAction}
    />
  );
}
