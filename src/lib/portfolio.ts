import type { PortfolioConfig, Project, Publication, Skill } from "./types";
import { projectPath } from "./projects.ts"; // with ".ts": the tests run this file directly with Node

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
  /** The site's icon, for the drawing shown when there is no image. */
  logo?: string;
  stack: Skill[];
  /** Plain text tags (a paper's keywords). */
  tags: string[];
}

export const PORTFOLIO_MAX = 6; // two columns of three on desktop

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/** "https://github.com/Borgo99/some-repo" → "github.com/Borgo99" */
const repoOwner = (url: string) => `${host(url)}/${new URL(url).pathname.split("/").filter(Boolean)[0] ?? ""}`;

export type Featured = { type: "project"; item: Project } | { type: "paper"; item: Publication };

/**
 * Projects and publications flagged `portfolio: true`, in the Portfolio section's order: by `portfolioRank`,
 * then the unranked ones, projects before publications, each in list order.
 */
export function featured(config: PortfolioConfig): Featured[] {
  const last = Number.MAX_SAFE_INTEGER;
  return [
    ...(config.projects ?? []).map((item): Featured => ({ type: "project", item })),
    ...(config.publications ?? []).map((item): Featured => ({ type: "paper", item })),
  ]
    .filter(({ item }) => item.portfolio)
    .sort((a, b) => (a.item.portfolioRank ?? last) - (b.item.portfolioRank ?? last));
}

function projectEntry(p: Project, base: string): PortfolioEntry {
  const kind = p.url ? "live" : p.repo ? "code" : "page";
  // What was read from an older address doesn't describe the current one.
  const site = p.site?.url === p.url ? p.site : undefined;
  return {
    key: `project:${p.name}`,
    kind,
    name: p.name,
    description: p.description,
    href: p.url ?? p.repo ?? projectPath(p, base),
    external: kind !== "page",
    label: p.url ? host(p.url) : p.repo ? repoOwner(p.repo) : "read more",
    image: p.image ?? site?.image,
    logo: site?.logo,
    stack: p.stack ?? [],
    tags: [],
  };
}

const paperEntry = (p: Publication): PortfolioEntry => ({
  key: `paper:${p.title}`,
  kind: "paper",
  name: p.title,
  description: p.description ?? p.authors,
  href: p.url,
  external: true,
  label: p.venue ?? String(p.year ?? "paper"),
  stack: [],
  tags: p.keywords ?? [],
});

/** The Portfolio section's cards, at most 6. `base`: see projectPath. */
export function portfolioEntries(config: PortfolioConfig, base: string): PortfolioEntry[] {
  return featured(config)
    .map((f) => (f.type === "project" ? projectEntry(f.item, base) : paperEntry(f.item)))
    .slice(0, PORTFOLIO_MAX);
}
