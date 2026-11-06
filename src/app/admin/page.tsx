import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Editor } from "@/components/admin/Editor";
import { cleanConfig } from "@/lib/clean";
import { guestPage } from "@/lib/guest";
import { currentAccount } from "@/lib/session";
import { DISPLAY_DOMAIN, profileUrl } from "@/lib/site";
import { visitStats } from "@/lib/store";
import { endGuestPageAction, saveMatchingAction, savePhoneAction, signOutAction } from "./actions";

export const metadata: Metadata = { title: "Editor — devtag", robots: { index: false } };

interface Props {
  /** `from=cv`: the page was just claimed with the one made from a CV on the landing. */
  searchParams: Promise<{ from?: string }>;
}

export default async function AdminPage({ searchParams }: Props) {
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
      visits={profile.published ? await visitStats(profile.userId) : undefined}
      matching={{ consent: Boolean(profile.companiesConsentAt), location: profile.location ?? "" }}
      saveMatching={saveMatchingAction}
      phone={profile.phone ?? ""}
      savePhone={savePhoneAction}
      fromCv={(await searchParams).from === "cv"}
      // Made from a CV on the landing by someone who already has a page: the editor asks before using it.
      pending={await guestPage()}
      endPending={endGuestPageAction}
      signOut={signOutAction}
    />
  );
}
