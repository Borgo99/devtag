import type { PortfolioConfig, Skill } from "./types";
import { projectPath } from "./projects";

/** live: website or app · code: repository · paper: publication · page: project with only its own page */
export type PortfolioKind = "live" | "code" | "paper" | "page";

export interface PortfolioEntry {
  key: string;
  kind: PortfolioKind;
  name: string;
  description?: string;
  /** Where the card links; papers without a URL are not links. */
  href?: string;
  external: boolean;
  /** Short text for the address bar / footer: domain, repo owner or venue. */
  label: string;
  image?: string;
  stack: Skill[];
  /** Plain text tags (a paper's keywords). */
  tags: string[];
}

export const PORTFOLIO_MAX = 6; // two columns of three on desktop

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/** "https://github.com/Borgo99/some-repo" → "github.com/Borgo99" */
const repoOwner = (url: string) => `${host(url)}/${new URL(url).pathname.split("/").filter(Boolean)[0] ?? ""}`;

/** Everything flagged `portfolio: true` (projects first, then publications), at most 6. `base`: see projectPath. */
export function portfolioEntries(config: PortfolioConfig, base: string): PortfolioEntry[] {
  const projects = (config.projects ?? [])
    .filter((p) => p.portfolio)
    .map((p): PortfolioEntry => {
      const kind = p.url ? "live" : p.repo ? "code" : "page";
      return {
        key: `project:${p.name}`,
        kind,
        name: p.name,
        description: p.description,
        href: p.url ?? p.repo ?? projectPath(p, base),
        external: kind !== "page",
        label: p.url ? host(p.url) : p.repo ? repoOwner(p.repo) : "read more",
        image: p.image,
        stack: p.stack ?? [],
        tags: [],
      };
    });

  const papers = (config.publications ?? [])
    .filter((p) => p.portfolio)
    .map((p): PortfolioEntry => ({
      key: `paper:${p.title}`,
      kind: "paper",
      name: p.title,
      description: p.description ?? p.authors,
      href: p.url,
      external: true,
      label: p.venue ?? String(p.year ?? "paper"),
      stack: [],
      tags: p.keywords ?? [],
    }));

  return [...projects, ...papers].slice(0, PORTFOLIO_MAX);
}
