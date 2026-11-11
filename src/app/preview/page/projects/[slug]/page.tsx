import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/profile/ProjectPage";
import { findProject } from "@/lib/projects";
import { GUEST_PREVIEW_BASE, loadGuestPage } from "../../../load";

export const metadata: Metadata = { title: "Preview — devtag", robots: { index: false } };

export default async function GuestPreviewProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const draft = await loadGuestPage();
  const project = draft && findProject(draft, (await params).slug);
  if (!draft || !project) notFound();
  return <ProjectPage config={draft} project={project} base={GUEST_PREVIEW_BASE} />;
}
