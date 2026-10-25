import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPage } from "@/components/profile/ProjectPage";
import { projectMetadata } from "@/lib/metadata";
import { profileBase, publishedProfile, requestOrigin } from "@/lib/profiles";
import { findProject } from "@/lib/projects";

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

async function load(params: Props["params"]) {
  const { username, slug } = await params;
  const published = await publishedProfile(username);
  const project = published && findProject(published.config, slug);
  return project && { ...published, project, base: await profileBase(username) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  return projectMetadata(found.config, found.project, {
    base: found.base,
    origin: await requestOrigin(),
    version: found.version,
  });
}

export default async function UserProjectPage({ params }: Props) {
  const found = await load(params);
  if (!found) notFound();
  return <ProjectPage config={found.config} project={found.project} base={found.base} />;
}
