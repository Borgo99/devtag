import type { PortfolioConfig, Skill } from "./types";
import { JOB_TYPES, SENIORITY, WORK_MODES } from "./work.ts"; // with ".ts": the tests run this file directly with Node

/**
 * The numbers behind admin/report: what the pages say about their owners (role, level, where they live, skills),
 * and who is looking for work or agreed to be shared with companies. Each count is made twice: over every page
 * as its owner last saved it, published or not, and over the published ones as visitors see them.
 */

/** The parts of a page the report reads: about the developer, not their projects. */
export type Facts = Pick<PortfolioConfig, "profile" | "openToWork" | "topSkills" | "skills">;

/** One page, as lib/store.ts reads it for the report. */
export interface PageFacts {
  /** What the owner last saved in the editor. */
  draft: Facts;
  /** What visitors see; null until the first publish. */
  published: Facts | null;
  /** The owner agreed that devtag shares their page with companies. */
  agreed: boolean;
  /** Where they live, from the editor's Companies section: null unless they gave it and still agree. */
  location: string | null;
}

/** A line of the report: how many pages have the value in their draft, and how many in their published version. */
export interface Row {
  label: string;
  pages: number;
  published: number;
}

/** Values typed freely (roles, places, skills): the most common ones, and how many different ones there are. */
export interface Ranked {
  rows: Row[];
  distinct: number;
}

/** How many of the most common typed values the report lists. */
export const TOP = 20;

const YEARS = ["Under 2", "2–4", "5–9", "10+"];

const yearsRange = (years: number | undefined) =>
  years === undefined ? undefined : YEARS[years < 2 ? 0 : years < 5 ? 1 : years < 10 ? 2 : 3];

const skillName = (skill: Skill | null | undefined) => (typeof skill === "string" ? skill : skill?.name);

/**
 * How many pages have each value: `values` lists a version's values (several for skills), each counted once per
 * page. Capitals and extra spaces don't make a new value; the first spelling seen names the row.
 */
function tally(pages: PageFacts[], values: (facts: Facts, page: PageFacts) => (string | undefined)[]) {
  const rows = new Map<string, Row>();
  for (const page of pages) {
    for (const column of ["pages", "published"] as const) {
      const facts = column === "pages" ? page.draft : page.published;
      if (!facts) continue;
      const seen = new Set<string>();
      for (const value of values(facts, page)) {
        const label = value?.replace(/\s+/g, " ").trim();
        if (!label) continue;
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const row = rows.get(key) ?? { label, pages: 0, published: 0 };
        row[column] += 1;
        rows.set(key, row);
      }
    }
  }
  return rows;
}

/** The rows of a fixed list (seniority levels, job types…), in its order, empty ones included. */
const ordered = (counts: Map<string, Row>, labels: string[]) =>
  labels.map((label) => counts.get(label.toLowerCase()) ?? { label, pages: 0, published: 0 });

/** The most common values first. */
const top = (counts: Map<string, Row>) =>
  [...counts.values()]
    .sort((a, b) => b.pages - a.pages || b.published - a.published || a.label.localeCompare(b.label))
    .slice(0, TOP);

/** For a field with one value per page: the pages that left it empty, which no other row counts. */
function notSet(counts: Map<string, Row>, total: Row): Row {
  const rows = [...counts.values()];
  return {
    label: "Not set",
    pages: total.pages - rows.reduce((n, row) => n + row.pages, 0),
    published: total.published - rows.reduce((n, row) => n + row.published, 0),
  };
}

/** `month`: this month, "YYYY-MM", to tell who is available now from who is available later. */
export function summarize(pages: PageFacts[], month = new Date().toISOString().slice(0, 7)) {
  /** The pages for which `test` holds, in each column. */
  const count = (label: string, test: (facts: Facts, page: PageFacts) => boolean): Row => ({
    label,
    pages: pages.filter((page) => test(page.draft, page)).length,
    published: pages.filter((page) => page.published && test(page.published, page)).length,
  });
  const open = (facts: Facts) => (facts.openToWork?.active ? facts.openToWork : undefined);

  const total = count("Pages", () => true);
  const openToWork = count("Open to work", (facts) => Boolean(open(facts)));

  const seniority = tally(pages, ({ profile }) => [profile.seniority && SENIORITY[profile.seniority]]);
  const years = tally(pages, ({ profile }) => [yearsRange(profile.years)]);
  const roles = tally(pages, ({ profile }) => [profile.role]);
  const places = tally(pages, ({ profile }, page) => [page.location ?? profile.basedIn]);
  const skills = tally(pages, (facts) => [...(facts.topSkills ?? []), ...facts.skills].map(skillName));

  return {
    total,
    openToWork,
    looking: [
      openToWork,
      count("Agreed to be shared with companies", (_, page) => page.agreed),
      count("Open to work and agreed", (facts, page) => Boolean(open(facts)) && page.agreed),
    ],
    jobTypes: ordered(
      tally(pages, (facts) => open(facts)?.types?.map((type) => JOB_TYPES[type]) ?? []),
      Object.values(JOB_TYPES),
    ),
    workModes: ordered(
      tally(pages, (facts) => open(facts)?.modes?.map((mode) => WORK_MODES[mode]) ?? []),
      Object.values(WORK_MODES),
    ),
    // Like the page's pill (lib/work.ts): a month still to come is "later", an empty or past one is "now".
    available: ordered(
      tally(pages, (facts) => {
        const from = open(facts)?.from;
        return [open(facts) && (from && from.padEnd(7, "-01") > month ? "Later" : "Now")];
      }),
      ["Now", "Later"],
    ),
    seniority: [...ordered(seniority, Object.values(SENIORITY)), notSet(seniority, total)],
    years: [...ordered(years, YEARS), notSet(years, total)],
    roles: { rows: [...top(roles), notSet(roles, total)], distinct: roles.size } satisfies Ranked,
    places: { rows: [...top(places), notSet(places, total)], distinct: places.size } satisfies Ranked,
    skills: { rows: top(skills), distinct: skills.size } satisfies Ranked,
  };
}
