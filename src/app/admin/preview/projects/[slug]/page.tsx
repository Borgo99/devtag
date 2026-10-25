import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/profile/ProjectPage";
import { findProject } from "@/lib/projects";
import { loadDraft, PREVIEW_BASE } from "../../load";

export const metadata: Metadata = { title: "Preview — devtag", robots: { index: false } };

export default async function PreviewProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const draft = await loadDraft();
  const project = draft && findProject(draft, (await params).slug);
  if (!draft || !project) notFound();
  return <ProjectPage config={draft} project={project} base={PREVIEW_BASE} />;
}
