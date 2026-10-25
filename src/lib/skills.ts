import type { PortfolioConfig, Skill } from "./types";

export const skillName = (skill: Skill) => (typeof skill === "string" ? skill : skill.name);

/** Skills for the orbit: the top ones (max 5), then the others minus duplicates. */
export function orbitSkills(config: PortfolioConfig) {
  const top = (config.topSkills ?? []).filter((s): s is Skill => s !== undefined).slice(0, 5);
  const taken = new Set(top.map((s) => skillName(s).toLowerCase()));
  const rest = config.skills.filter((s) => !taken.has(skillName(s).toLowerCase()));
  return { top, rest };
}
