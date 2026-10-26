import type { JobType, Seniority, WorkMode } from "./work";

/**
 * Content of one profile page: what the editor saves and the page renders. Every optional section is hidden when empty.
 */

/** A skill name ("TypeScript", "Next.js", "C#"…), or an object to force a specific icon. */
export type Skill =
  | string
  | {
      name: string;
      /** Icon slug from simpleicons.org or devicon.dev, or an image URL. */
      icon?: string;
    };

export interface Link {
  /** Picks the icon. Any Simple Icons / Devicon slug works too (e.g. "youtube", "orcid"). */
  type: "github" | "linkedin" | "email" | "website" | "cv" | "x" | "gitlab" | (string & {});
  /** For email you can write just the address. */
  url: string;
  /** Text shown next to the icon. Defaults to the icon name. */
  label?: string;
}

export interface Language {
  name: string;
  /** Free text: "Native", "C1", "Fluent"… */
  level: string;
}

export interface Job {
  company: string;
  role: string;
  /** "YYYY-MM" or "YYYY". Leave out to hide the dates. */
  start?: string;
  /** "YYYY-MM" or "YYYY". Leave out for a current job. */
  end?: string;
  location?: string;
  /** Company website. */
  url?: string;
  summary?: string;
  highlights?: string[];
  stack?: Skill[];
}

export interface Education {
  degree: string;
  school: string;
  /** "YYYY-MM" or "YYYY" */
  start?: string;
  /** "YYYY-MM" or "YYYY". Leave out if you are still studying. */
  end?: string;
  location?: string;
  /** School website. */
  url?: string;
  /** "110/110 with honours" */
  grade?: string;
  /** Thesis, main courses, awards… */
  highlights?: string[];
}

export interface StackGroup {
  /** "Languages", "Back-end"… */
  group: string;
  items: Skill[];
}

export interface Project {
  name: string;
  /** One or two sentences, shown on the card and in link previews. */
  description: string;
  year?: string | number;
  /** Live demo / product page. */
  url?: string;
  /** Source code. */
  repo?: string;
  stack?: Skill[];
  /** Key points, shown on the project page. */
  highlights?: string[];
  /** Longer text for the project page. A blank line starts a new paragraph. */
  details?: string;
  /** Screenshot URL (16:10 works best). Used in the Portfolio section and on the project page. */
  image?: string;
  /**
   * What the editor read from `url` (api/site-preview): the site's own preview image and its icon, stored
   * by devtag. Used when there is no `image`. `url` is the address they were read from.
   */
  site?: { url: string; image?: string; logo?: string };
  /** Also show it in the Portfolio section at the top (max 6 items in total). */
  portfolio?: boolean;
  /** Position in the Portfolio section, 1 first (set in the editor). Unranked items follow, in list order. */
  portfolioRank?: number;
  /** Last part of the project page URL. Defaults to the name: "Dog breed detector" → /projects/dog-breed-detector */
  slug?: string;
}

export interface Publication {
  title: string;
  /** One sentence about it. */
  description?: string;
  /** Your surname is highlighted automatically. */
  authors?: string;
  venue?: string;
  year?: string | number;
  url?: string;
  /** Shown as tags in the list and on its Portfolio card. */
  keywords?: string[];
  /** Also show it in the Portfolio section at the top (max 6 items in total). */
  portfolio?: boolean;
  /** Position in the Portfolio section, like a project's `portfolioRank`. */
  portfolioRank?: number;
}

export interface PortfolioConfig {
  profile: {
    name: string;
    role: string;
    /** Photo URL. Leave out to use the generated avatar. */
    image?: string;
    /** Short paragraph for the About section. */
    about?: string;
    /** Career level, shown as a badge next to the role. */
    seniority?: Seniority;
    /** Years of professional experience: "6+ years". */
    years?: number;
  };
  /** "Open to work": a green ring on the photo, and a pill with the details. */
  openToWork?: {
    /** Shown on the page only when on; the details are kept when it's switched off. */
    active: boolean;
    types?: JobType[];
    modes?: WorkMode[];
    /** "Milan", "EU time zones"… */
    location?: string;
    /** "YYYY-MM": available from then. Empty or past: available now. */
    from?: string;
  };
  links?: Link[];
  /** Up to 5 core skills, shown bigger and glowing on the ring closest to the profile image. */
  topSkills?: [Skill?, Skill?, Skill?, Skill?, Skill?];
  /** Your other main skills, orbiting further out. Looks best with 6–12 items. */
  skills: Skill[];
  /** Everything you work with, grouped, for the Stack section. */
  stack?: StackGroup[];
  languages?: Language[];
  experience?: Job[];
  /** Look of the Portfolio section (items flagged with `portfolio: true`): "compact" small cards (default) · "large" big previews. */
  portfolioStyle?: "large" | "compact";
  projects?: Project[];
  education?: Education[];
  publications?: Publication[];
  theme?: {
    /** Main color (hex). */
    accent?: string;
    /** Second color for gradients (hex). */
    accent2?: string;
  };
}

/** Identity helper that gives autocomplete and type checks in a config written as code (the demo profile). */
export function defineConfig(config: PortfolioConfig): PortfolioConfig {
  return config;
}
