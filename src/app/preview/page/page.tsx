import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { GUEST_PREVIEW_BASE, loadGuestPage } from "../load";

/** The page made from a CV without an account, shown in /preview's frame. */

export const metadata: Metadata = { title: "Preview — devtag", robots: { index: false } };

export default async function GuestPreviewPage() {
  const draft = await loadGuestPage();
  if (!draft) notFound();
  return <ProfilePage config={draft} base={GUEST_PREVIEW_BASE} />;
}
