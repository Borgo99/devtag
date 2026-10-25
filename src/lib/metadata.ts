import type { Metadata } from "next";
import type { PortfolioConfig, Project } from "./types";
import { initials } from "./text";
import { themeColors } from "./theme";
import { orbitSkills, skillName } from "./skills";
import { projectPath } from "./projects";

/** Title, description, favicon and link previews of a profile page and of its project pages. */

interface Where {
  /** See ProfilePage. */
  base: string;
  /** Absolute URLs are needed for the preview images. */
  origin: string;
  /** Changes on every publish, so link previews don't keep showing an old image. */
  version: string;
}

function favicon(config: PortfolioConfig) {
  const { accent } = themeColors(config);
  return (
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0b0f14"/>` +
        `<text x="32" y="42" text-anchor="middle" font-family="monospace" font-weight="700" font-size="26" fill="${accent}">${initials(config.profile.name)}</text></svg>`,
    )
  );
}

function icons(config: PortfolioConfig, { base, version }: Where): Metadata["icons"] {
  const touch = `${base}/apple-touch-icon.png?v=${version}`;
  return {
    // SVG where supported, PNG otherwise (also used for "Add to Home Screen").
    icon: [
      { url: favicon(config), type: "image/svg+xml" },
      { url: touch, type: "image/png", sizes: "180x180" },
    ],
    apple: touch,
  };
}

export function profileMetadata(config: PortfolioConfig, where: Where): Metadata {
  const { profile } = config;
  const title = `${profile.name} — ${profile.role}`;
  // First sentence of the about text, or the main skills.
  const description =
    profile.about?.split(/(?<=\.)\s/)[0] ??
    `${profile.role}. ${Object.values(orbitSkills(config)).flat().slice(0, 8).map(skillName).join(", ")}.`;
  const image = { url: `${where.base}/og.png?v=${where.version}`, width: 1200, height: 630, alt: title };

  return {
    metadataBase: new URL(where.origin),
    title,
    description,
    icons: icons(config, where),
    openGraph: { type: "website", title, description, images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export function projectMetadata(config: PortfolioConfig, project: Project, where: Where): Metadata {
  const title = `${project.name} — ${config.profile.name}`;
  const image = {
    url: `${projectPath(project, where.base)}/og.png?v=${where.version}`,
    width: 1200,
    height: 630,
    alt: title,
  };
  return {
    metadataBase: new URL(where.origin),
    title,
    description: project.description,
    icons: icons(config, where),
    openGraph: { type: "article", title, description: project.description, images: [image] },
    twitter: { card: "summary_large_image", title, description: project.description, images: [image] },
  };
}
