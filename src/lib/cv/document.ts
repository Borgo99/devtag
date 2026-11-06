import type { Education, Job, Link, PortfolioConfig, Project, Publication, Skill } from "../types";
import { dateLabel } from "../dates.ts"; // with ".ts": the tests run this file directly with Node
import { skillName } from "../skills.ts";

/**
 * What goes in the CV as a PDF (components/cv/CvPdf), laid out like Jake's Resume: the name and a line of
 * contacts, then sections of entries (two lines with text on both sides, then bullets) and lines of skills.
 * "one": the essentials, to fit one page (the PDF also shrinks the text a little when needed).
 * "full": everything, on as many pages as it takes.
 */

export type CvLength = "one" | "full";

/** A phone number as people write it, with at least 6 digits: "+39 333 123 4567", "(555) 123-4567". */
export const PHONE = /^(?=(?:\D*\d){6})\+?[\d\s().\-/]{6,24}$/;

export interface Contact {
  text: string;
  href?: string;
}

/** Jake's subheading: `title` and `right` on the first line, `subtitle` and `subright` in italics below. */
export interface Entry {
  title: string;
  /** Projects: the stack, after the name. */
  tags?: string;
  href?: string;
  right?: string;
  subtitle?: string;
  subright?: string;
  bullets: string[];
}

export type Section = { title: string } & (
  | { kind: "entries"; entries: Entry[] }
  | { kind: "lines"; lines: { label: string; text: string }[] }
  | { kind: "text"; paragraphs: string[] }
);

export interface Cv {
  name: string;
  contacts: Contact[];
  sections: Section[];
}

/** How much a one-page CV keeps: the first ones, in the user's order. Projects and papers: the featured ones. */
const ONE_PAGE = { jobBullets: 3, projects: 3, projectBullets: 2, educationBullets: 2, publications: 2 };

/** "Aug 2018 – May 2021", "Jun 2020 – Present", or just the end: "2021". */
const range = (start?: string, end?: string) =>
  start ? `${dateLabel(start)} – ${end ? dateLabel(end) : "Present"}` : end ? dateLabel(end) : undefined;

/** "https://www.github.com/ada/" → "github.com/ada" */
const bare = (url: string) =>
  url
    .replace(/^[a-z]+:(\/\/)?/i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");

const texts = (items: (string | undefined)[]) =>
  items.map((item) => item?.trim()).filter((item): item is string => Boolean(item));

const names = (skills: (Skill | undefined)[] = []) =>
  skills
    .filter((s): s is Skill => s !== undefined)
    .map(skillName)
    .join(", ");

/** The featured items by their position (one page), else the first ones; everything for the full CV. */
function pick<T extends { portfolio?: boolean; portfolioRank?: number }>(
  items: T[] = [],
  length: CvLength,
  max: number,
) {
  if (length === "full") return items;
  const last = Number.MAX_SAFE_INTEGER;
  const starred = items
    .filter((item) => item.portfolio)
    .sort((a, b) => (a.portfolioRank ?? last) - (b.portfolioRank ?? last));
  return (starred.length ? starred : items).slice(0, max);
}

function contacts(links: Link[], basedIn?: string, phone?: string, pageUrl?: string): Contact[] {
  const type = (link: Link) => link.type.toLowerCase();
  const page = pageUrl && bare(pageUrl);
  return (
    [
      phone ? { text: phone } : undefined,
      ...links.filter((l) => type(l) === "email").map((l) => ({ text: bare(l.url), href: `mailto:${bare(l.url)}` })),
      basedIn ? { text: basedIn } : undefined,
      page ? { text: page, href: pageUrl } : undefined,
      // "cv": a link to their own CV file, which this is.
      ...links
        .filter((l) => !["email", "cv"].includes(type(l)) && bare(l.url) !== page)
        .map((l) => ({ text: bare(l.url), href: l.url })),
    ]
      // The same address twice (a link added twice) is shown once.
      .filter((c, i, all): c is Contact => c !== undefined && all.findIndex((d) => d?.text === c.text) === i)
  );
}

const job = (j: Job, length: CvLength): Entry => ({
  title: j.role,
  right: range(j.start, j.end),
  subtitle: j.company,
  subright: j.location,
  bullets:
    length === "one"
      ? (j.highlights?.length ? texts(j.highlights) : texts([j.summary])).slice(0, ONE_PAGE.jobBullets)
      : texts([j.summary, ...(j.highlights ?? [])]),
});

const school = (e: Education, length: CvLength): Entry => ({
  title: e.school,
  right: e.location,
  subtitle: texts([e.degree, e.grade]).join(", "),
  subright: range(e.start, e.end),
  bullets: texts(e.highlights ?? []).slice(0, length === "one" ? ONE_PAGE.educationBullets : undefined),
});

const project = (p: Project, length: CvLength): Entry => ({
  title: p.name,
  tags: names(p.stack) || undefined,
  href: p.url ?? p.repo,
  right: p.year?.toString(),
  bullets: texts([p.description, ...(p.highlights ?? [])]).slice(
    0,
    length === "one" ? ONE_PAGE.projectBullets : undefined,
  ),
});

const paper = (p: Publication): Entry => ({
  title: p.title,
  href: p.url,
  right: p.year?.toString(),
  subtitle: p.authors,
  subright: p.venue,
  bullets: texts([p.description]),
});

/**
 * The CV of a page. `config`: cleaned for publishing (complete items, safe links). `pageUrl`: the live page,
 * when there is one. `phone`: only ever shown here, never on the page.
 */
export function cvDocument(
  config: PortfolioConfig,
  { length, phone, pageUrl }: { length: CvLength; phone?: string; pageUrl?: string },
): Cv {
  const entries = (title: string, list: Entry[]): Section[] =>
    list.length ? [{ title, kind: "entries", entries: list }] : [];

  const about = length === "full" ? texts((config.profile.about ?? "").split(/\n\s*\n/)) : [];
  const summary: Section[] = about.length ? [{ title: "Summary", kind: "text", paragraphs: about }] : [];
  const experience = entries(
    "Experience",
    (config.experience ?? []).map((j) => job(j, length)),
  );
  const education = entries(
    "Education",
    (config.education ?? []).map((e) => school(e, length)),
  );
  const projects = entries(
    "Projects",
    pick(config.projects, length, ONE_PAGE.projects).map((p) => project(p, length)),
  );
  const papers = entries("Publications", pick(config.publications, length, ONE_PAGE.publications).map(paper));

  const stack = (config.stack ?? []).map((g) => ({ label: g.group, text: names(g.items) })).filter((line) => line.text);
  const skills = stack.length
    ? stack
    : [{ label: "Skills", text: names([...(config.topSkills ?? []), ...config.skills]) }];
  const languages = (config.languages ?? []).map((l) => (l.level ? `${l.name} (${l.level})` : l.name)).join(", ");
  const lines = [...skills, { label: "Languages", text: languages }].filter((line) => line.text);
  const skillSection: Section[] = lines.length ? [{ title: "Skills", kind: "lines", lines }] : [];

  // Still studying, or just graduated: education comes first, as for students.
  const year = new Date().getFullYear();
  const studying =
    config.profile.seniority === "intern" ||
    (config.education ?? []).some((e) => (e.end ? Number(e.end.slice(0, 4)) >= year : Boolean(e.start)));

  return printable({
    name: config.profile.name || "Your Name",
    contacts: contacts(config.links ?? [], config.profile.basedIn, phone, pageUrl),
    sections: [
      ...summary,
      ...(studying ? [...education, ...experience] : experience),
      ...projects,
      ...(studying ? [] : education),
      ...papers,
      ...skillSection,
    ],
  });
}

/**
 * Text as pasted from anywhere, made safe to print: tabs and the other spaces (thin, em, narrow no-break…)
 * become plain spaces, runs of spaces one, Windows line ends "\n"; invisible characters (soft hyphens, zero-width
 * spaces, direction marks, byte order marks) and control characters go. The fonts have no glyph for them.
 */
export const printableText = (text: string) =>
  text
    .replace(/\r\n?/g, "\n")
    .replace(/[\t\v\f  -   　]/g, " ")
    .replace(/[­​-‏‪-‮⁠-⁤﻿]|[^\P{Cc}\n]/gu, "")
    .replace(/ {2,}/g, " ");

/** `change` applied to every text of a CV (or part of one); links stay as they are. */
export function mapTexts<T>(value: T, change: (text: string) => string): T {
  if (typeof value === "string") return change(value) as T;
  if (Array.isArray(value)) return value.map((v) => mapTexts(v, change)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, key === "href" ? v : mapTexts(v, change)]),
    ) as T;
  }
  return value;
}

const printable = (cv: Cv) => mapTexts(cv, printableText);
