import { slugify } from "./text.ts"; // with ".ts": the tests run this file directly with Node
import type { PortfolioConfig, Project } from "./types";

export const projectSlug = (project: Project) => project.slug ?? slugify(project.name);

/** `base` is where the profile's pages start: "" on its subdomain, "/andrea" on the main domain. */
export const projectPath = (project: Project, base: string) => `${base}/projects/${projectSlug(project)}`;

export const findProject = (config: PortfolioConfig, slug: string) =>
  (config.projects ?? []).find((p) => projectSlug(p) === slug);
