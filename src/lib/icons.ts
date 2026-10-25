import * as simpleIcons from "simple-icons";
import devicons from "./devicons.generated.json";
import type { Link, Skill } from "./types";

/**
 * Server-side icon lookup. Only server components import this file, so the icon
 * libraries never reach the browser: the page only embeds the icons it uses.
 *
 * Search order: explicit `icon` → nicknames → Simple Icons (~3.5k) → Devicon (~600).
 * Anything not found falls back to a text badge ("SQL", "ML"…).
 */

export interface ResolvedSkill {
  name: string;
  /** Inline <svg> markup. */
  svg?: string;
  /** Image URL, when the config points to a custom file. */
  src?: string;
  /** Badge text when no icon exists. */
  text?: string;
}

export interface ResolvedLink {
  href: string;
  label: string;
  svg?: string;
}

type SimpleIcon = { title: string; slug: string; hex: string; path: string };
/** One Devicon entry, as scripts/vendor.mjs saves it: `colored` only when it differs from `flat`. */
type Devicon = { name: string; altnames: string[]; color: string; flat: string; colored?: string };

const LIGHT = "#e6edf3";

/** Nicknames people actually write → icon slug. */
const ALIASES: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  next: "nextdotjs",
  nextjs: "nextdotjs",
  reactjs: "react",
  reactnative: "react", // same logo
  vue: "vuedotjs",
  vuejs: "vuedotjs",
  expressjs: "express",
  nest: "nestjs",
  "c#": "csharp",
  "f#": "fsharp",
  golang: "go",
  postgres: "postgresql",
  mongo: "mongodb",
  mssql: "microsoftsqlserver",
  sqlserver: "microsoftsqlserver",
  k8s: "kubernetes",
  aws: "amazonwebservices",
  gcp: "googlecloud",
  html: "html5",
  tailwind: "tailwindcss",
  sklearn: "scikitlearn",
  bash: "gnubash",
  shell: "gnubash",
  kafka: "apachekafka",
  spark: "apachespark",
  airflow: "apacheairflow",
  rails: "rubyonrails",
};

/** Simple stroke icons for links that are not brands. */
const stroke = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

const LINK_ICONS: Record<string, string> = {
  email: stroke('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  website: stroke(
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  ),
  cv: stroke(
    '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  ),
};

const LINK_LABELS: Record<string, string> = { email: "Email", website: "Website", cv: "CV", linkedin: "LinkedIn" };

// ---------------------------------------------------------------------------

const compact = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9+#]/g, "");

/** Same rule Simple Icons uses to build slugs from titles ("Next.js" → "nextdotjs"). */
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\./g, "dot")
    .replace(/&/g, "and")
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "");

const siBySlug = new Map<string, SimpleIcon>();
const siByTitle = new Map<string, SimpleIcon>();
for (const icon of Object.values(simpleIcons) as SimpleIcon[]) {
  if (!icon?.slug) continue;
  siBySlug.set(icon.slug, icon);
  siByTitle.set(compact(icon.title), icon);
}

const devByName = new Map<string, Devicon>();
for (const entry of devicons as Devicon[]) {
  for (const key of [entry.name, ...entry.altnames]) {
    if (!devByName.has(key)) devByName.set(key, entry);
  }
}

function find(query: string) {
  const keys = [ALIASES[compact(query)], query.toLowerCase(), slugify(query), compact(query)];
  for (const key of keys) {
    if (!key) continue;
    const si = siBySlug.get(key) ?? siByTitle.get(key);
    if (si) return { si };
    const dev = devByName.get(key);
    if (dev) return { dev };
  }
  return undefined;
}

/** Relative luminance (0 = black, 1 = white). */
function luminance(hex: string) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** "#336699", 0.3 → the same color 30% closer to white. */
function lighten(hex: string, amount: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const channels = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `#${channels
    .map((c) =>
      Math.round(c + (255 - c) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Brand colors on the dark background: near-black becomes light gray, dim ones get lighter. */
function visible(hex: string) {
  const l = luminance(hex);
  if (l < 0.08) return LIGHT;
  if (l < 0.2) return lighten(hex, 0.3);
  return hex;
}

function simpleIconSvg(icon: SimpleIcon, mono: boolean) {
  const fill = mono ? "currentColor" : visible(`#${icon.hex}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${fill}"><path d="${icon.path}"/></svg>`;
}

function deviconSvg(entry: Devicon, mono: boolean) {
  // Multi-color logos read well as-is; dark ones and mono use the flat variant, recolored.
  const flat = mono || luminance(entry.color) < 0.08;
  const svg = (flat ? entry.flat : (entry.colored ?? entry.flat))
    // Devicon reuses short ids ("a", "b"…): namespace them so inlined icons don't clash.
    .replace(/id="([^"]+)"/g, `id="${entry.name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${entry.name}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${entry.name}-$1"`);

  if (flat) {
    return svg
      .replace(/\sfill="(?!none)[^"]*"/g, "")
      .replace(/fill:\s*#[0-9a-f]{3,8}\s*;?/gi, "")
      .replace("<svg", `<svg fill="${mono ? "currentColor" : LIGHT}"`);
  }
  // Multi-color logos can still have dark parts (e.g. the "aws" text).
  return svg.replace(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi, (hex) => visible(hex));
}

function iconSvg(query: string, mono: boolean) {
  const hit = find(query);
  if (hit?.si) return { svg: simpleIconSvg(hit.si, mono), title: hit.si.title };
  if (hit?.dev) return { svg: deviconSvg(hit.dev, mono), title: hit.dev.name };
  return undefined;
}

/** "SQL" stays "SQL", "Machine Learning" becomes "ML". */
function badgeText(name: string) {
  if (name.length <= 4) return name;
  const words = name.split(/[\s\-_/]+/).filter(Boolean);
  return (words.length > 1 ? words.map((w) => w[0]).join("") : name.slice(0, 2)).slice(0, 3).toUpperCase();
}

export function resolveSkill(skill: Skill): ResolvedSkill {
  const { name, icon } = typeof skill === "string" ? { name: skill, icon: undefined } : skill;

  if (icon && /^(\/|https?:)/.test(icon)) return { name, src: icon };

  const found = iconSvg(icon ?? name, false);
  if (found) return { name, svg: found.svg };
  return { name, text: badgeText(name) };
}

export function resolveLink(link: Link): ResolvedLink {
  const type = link.type.toLowerCase();
  const href = type === "email" && !link.url.startsWith("mailto:") ? `mailto:${link.url}` : link.url;
  const brand = LINK_ICONS[type] ? undefined : iconSvg(type, true);
  return {
    href,
    label: link.label ?? LINK_LABELS[type] ?? brand?.title ?? link.type,
    svg: LINK_ICONS[type] ?? brand?.svg,
  };
}
