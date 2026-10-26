import type { Education, Job, Language, Link, PortfolioConfig, Project, Publication, Skill, StackGroup } from "./types";
import { JOB_TYPES, SENIORITY, WORK_MODES, type JobType, type Seniority, type WorkMode } from "./work.ts"; // with ".ts": the tests run this file directly with Node

/**
 * Turns untrusted JSON (the editor's draft, the AI's answer) into a PortfolioConfig: only known fields,
 * text trimmed, empty values dropped (null included), and only URLs that are safe to put in a link.
 *
 * Drafts keep half-filled items (a job with a company but no role yet) so nothing typed is lost;
 * `complete: true`, used when publishing, drops the items missing a required field.
 */

type Obj = Record<string, unknown>;

const obj = (value: unknown): Obj =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Obj) : {};

const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const text = (value: unknown) => {
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const texts = (value: unknown) =>
  list(value)
    .map(text)
    .filter((t) => t !== undefined);

/** Links: web addresses and paths on this site. "github.com/me" gets its https:// back. */
function url(value: unknown) {
  const s = text(value);
  if (!s) return undefined;
  if (/^(https?:\/\/[^\s]+|\/(?!\/)\S*)$/i.test(s)) return s;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) return `https://${s}`;
  return undefined;
}

const email = (value: unknown) => {
  const s = text(value)?.replace(/^mailto:/i, "");
  return s && /^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(s) ? s : undefined;
};

/** "YYYY-MM" or "YYYY", like the template expects. */
const date = (value: unknown) => {
  const s = text(value);
  return s && /^\d{4}(-(0[1-9]|1[0-2]))?$/.test(s) ? s : undefined;
};

const hex = (value: unknown) => {
  const s = text(value);
  return s && /^#([0-9a-f]{3}){1,2}$/i.test(s) ? s : undefined;
};

/** One of the known keys, e.g. a seniority level. */
const oneOf = <K extends string>(keys: Record<K, string>, value: unknown) =>
  typeof value === "string" && value in keys ? (value as K) : undefined;

const manyOf = <K extends string>(keys: Record<K, string>, value: unknown) =>
  [...new Set(list(value).map((v) => oneOf(keys, v)))].filter((v) => v !== undefined);

/** Whole years, 0 to 60. */
const years = (value: unknown) => {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 60 ? n : undefined;
};

/** A position in the Portfolio section: a whole number from 1. */
const rank = (value: unknown) =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 99 ? value : undefined;

/** What the editor read from a project's site, kept only with the address it was read from. */
function site(value: unknown) {
  const s = obj(value);
  const from = url(s.url);
  return from ? compact({ url: from, image: url(s.image), logo: url(s.logo) }) : undefined;
}

/** A year can be a number in the config; numbers stay numbers. */
const year = (value: unknown) => (typeof value === "number" ? value : text(value));

function skill(value: unknown): Skill | undefined {
  if (typeof value === "string") return text(value);
  const o = obj(value);
  const name = text(o.name);
  if (!name) return undefined;
  const icon = text(o.icon);
  return icon && (/^[a-z0-9-]+$/.test(icon) || url(icon)) ? { name, icon } : name;
}

const skills = (value: unknown) =>
  list(value)
    .map(skill)
    .filter((s) => s !== undefined);

/** Drops undefined fields and empty lists, so stored JSON only has what was filled in. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

/** Keeps an item if it has any content; with `complete`, only if its required fields are filled. */
const keep =
  <T extends object>(required: (keyof T)[], complete: boolean) =>
  (item: T) =>
    complete
      ? required.every((key) => item[key])
      : Object.values(item).some((v) => (Array.isArray(v) ? v.length > 0 : Boolean(v)));

function link(value: unknown): Link | undefined {
  const o = obj(value);
  const type = text(o.type)?.toLowerCase();
  if (!type) return undefined;
  const href = type === "email" ? email(o.url) : url(o.url);
  return compact({ type, url: href ?? "", label: text(o.label) });
}

export function cleanConfig(input: unknown, { complete = false } = {}): PortfolioConfig {
  const c = obj(input);
  const profile = obj(c.profile);
  const theme = obj(c.theme);
  const open = obj(c.openToWork);

  const links = list(c.links)
    .map(link)
    .filter((l) => l !== undefined)
    .filter(keep<Link>(["url"], complete));

  const stack = list(c.stack)
    .map((g): StackGroup => compact({ group: text(obj(g).group) ?? "", items: skills(obj(g).items) }))
    .filter(keep<StackGroup>(["group", "items"], complete));

  const languages = list(c.languages)
    .map((l): Language => ({ name: text(obj(l).name) ?? "", level: text(obj(l).level) ?? "" }))
    .filter(keep<Language>(["name"], complete));

  const experience = list(c.experience)
    .map(obj)
    .map((j): Job =>
      compact({
        company: text(j.company) ?? "",
        role: text(j.role) ?? "",
        start: date(j.start),
        end: date(j.end),
        location: text(j.location),
        url: url(j.url),
        summary: text(j.summary),
        highlights: texts(j.highlights),
        stack: skills(j.stack),
      }),
    )
    .filter(keep<Job>(["company", "role"], complete));

  const projects = list(c.projects)
    .map(obj)
    .map((p): Project =>
      compact({
        name: text(p.name) ?? "",
        description: text(p.description) ?? "",
        year: year(p.year),
        url: url(p.url),
        repo: url(p.repo),
        stack: skills(p.stack),
        highlights: texts(p.highlights),
        details: text(p.details),
        image: url(p.image),
        site: site(p.site),
        portfolio: p.portfolio === true || undefined,
        portfolioRank: rank(p.portfolioRank),
        slug:
          text(p.slug)
            ?.toLowerCase()
            .replace(/[^a-z0-9-]/g, "") || undefined,
      }),
    )
    .filter(keep<Project>(["name", "description"], complete));

  const education = list(c.education)
    .map(obj)
    .map((e): Education =>
      compact({
        degree: text(e.degree) ?? "",
        school: text(e.school) ?? "",
        start: date(e.start),
        end: date(e.end),
        location: text(e.location),
        url: url(e.url),
        grade: text(e.grade),
        highlights: texts(e.highlights),
      }),
    )
    .filter(keep<Education>(["degree", "school"], complete));

  const publications = list(c.publications)
    .map(obj)
    .map((p): Publication =>
      compact({
        title: text(p.title) ?? "",
        description: text(p.description),
        authors: text(p.authors),
        venue: text(p.venue),
        year: year(p.year),
        url: url(p.url),
        keywords: texts(p.keywords),
        portfolio: p.portfolio === true || undefined,
        portfolioRank: rank(p.portfolioRank),
      }),
    )
    .filter(keep<Publication>(["title"], complete));

  const config = compact({
    profile: compact({
      name: text(profile.name) ?? "",
      role: text(profile.role) ?? "",
      image: url(profile.image),
      about: text(profile.about),
      seniority: oneOf<Seniority>(SENIORITY, profile.seniority),
      years: years(profile.years),
    }),
    openToWork:
      Object.keys(open).length > 0
        ? compact({
            active: open.active === true,
            types: manyOf<JobType>(JOB_TYPES, open.types),
            modes: manyOf<WorkMode>(WORK_MODES, open.modes),
            location: text(open.location),
            from: date(open.from),
          })
        : undefined,
    links,
    topSkills: skills(c.topSkills).slice(0, 5) as PortfolioConfig["topSkills"],
    stack,
    languages,
    experience,
    portfolioStyle: c.portfolioStyle === "compact" || c.portfolioStyle === "large" ? c.portfolioStyle : undefined,
    projects,
    education,
    publications,
    theme: Object.keys(theme).length ? compact({ accent: hex(theme.accent), accent2: hex(theme.accent2) }) : undefined,
  } as Omit<PortfolioConfig, "skills">);
  // `skills` is required by the type (the template reads it directly), so it stays even when empty.
  return { ...config, skills: skills(c.skills) };
}

/** What still blocks publishing, as short messages for the editor. */
export function publishProblems(config: PortfolioConfig) {
  return [!config.profile.name && "Add your name.", !config.profile.role && "Add your role."].filter(
    (p) => typeof p === "string",
  );
}
