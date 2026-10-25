import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { loadDraft, PREVIEW_BASE } from "./load";

/** The draft, shown in the editor's preview frame. */

export const metadata: Metadata = { title: "Preview — devtag", robots: { index: false } };

export default async function PreviewPage() {
  const draft = await loadDraft();
  if (!draft) notFound();
  return <ProfilePage config={draft} base={PREVIEW_BASE} />;
}
