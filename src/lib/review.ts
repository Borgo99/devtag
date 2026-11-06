import type { SectionId } from "@/components/admin/Sections";
import type { PortfolioConfig } from "./types";

/** Sections an import filled, to mark them "check" in the editor. */
export function filledSections(c: PortfolioConfig): SectionId[] {
  const filled: Record<SectionId, unknown> = {
    profile: c.profile.name || c.profile.role || c.profile.about,
    links: c.links?.length,
    skills: c.topSkills?.length || c.skills.length,
    stack: c.stack?.length,
    languages: c.languages?.length,
    experience: c.experience?.length,
    projects: c.projects?.length,
    education: c.education?.length,
    publications: c.publications?.length,
  };
  return (Object.keys(filled) as SectionId[]).filter((id) => filled[id]);
}
