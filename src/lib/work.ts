import type { PortfolioConfig } from "./types";

/**
 * Seniority and "open to work": the labels, and how they read on the page and in the share image.
 * No server-only imports: the editor uses the labels too.
 */

export const SENIORITY = {
  intern: "Intern",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  lead: "Lead",
  staff: "Staff",
  principal: "Principal",
} as const;

export const JOB_TYPES = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
} as const;

export const WORK_MODES = {
  remote: "Remote",
  hybrid: "Hybrid",
  "on-site": "On-site",
} as const;

export type Seniority = keyof typeof SENIORITY;
export type JobType = keyof typeof JOB_TYPES;
export type WorkMode = keyof typeof WORK_MODES;

/** "Senior · 6+ years", "Senior", "6+ years", or undefined when neither is set. */
export function levelText({ seniority, years }: PortfolioConfig["profile"]) {
  const parts = [
    seniority && SENIORITY[seniority],
    years ? `${years}+ year${years === 1 ? "" : "s"}` : undefined,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : undefined;
}

/** ["Full-time", "Contract"] → "Full-time or contract" */
function either(items: string[]) {
  const words = items.map((item, i) => (i ? item.toLowerCase() : item));
  return words.length > 1 ? `${words.slice(0, -1).join(", ")} or ${words.at(-1)}` : words[0];
}

const thisMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const monthName = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return month ? new Date(year, month - 1).toLocaleString("en", { month: "long", year: "numeric" }) : String(year);
};

/** Whether the page shows "open to work". */
export const isOpenToWork = (config: PortfolioConfig) => Boolean(config.openToWork?.active);

/** The details line: "Full-time or contract · Remote or hybrid · Milan · Available now". */
export function openToWorkDetails(config: PortfolioConfig) {
  const open = config.openToWork;
  if (!open?.active) return [];
  const later = open.from && open.from.padEnd(7, "-01") > thisMonth();
  return [
    open.types?.length ? either(open.types.map((t) => JOB_TYPES[t])) : undefined,
    open.modes?.length ? either(open.modes.map((m) => WORK_MODES[m])) : undefined,
    open.location,
    later ? `From ${monthName(open.from!)}` : "Available now",
  ].filter((part) => part !== undefined);
}
