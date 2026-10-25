import fs from "node:fs";
import path from "node:path";
import type { ResolvedSkill } from "./icons";
import type { PortfolioConfig } from "./types";
import { initials } from "./text";
import { themeColors } from "./theme";
import { isOpenToWork } from "./work";

/** Shared pieces for the images rendered on request: link previews and the home screen icon. */

export const OG_SIZE = { width: 1200, height: 630 };

export const BG = "#05070a";
/** "Open to work" green, as --open in globals.css. */
export const OPEN = "#4ade80";
export const TEXT = "#e6edf3";
export const MUTED = "#8b96a5";

const font = (file: string) => fs.readFileSync(path.join(process.cwd(), "node_modules/geist/dist/fonts", file));

export const fonts = () => [
  { name: "Geist", data: font("geist-sans/Geist-Regular.ttf"), weight: 400 as const },
  { name: "Geist", data: font("geist-sans/Geist-Bold.ttf"), weight: 700 as const },
  { name: "Geist Mono", data: font("geist-mono/GeistMono-Regular.ttf"), weight: 400 as const },
  { name: "Geist Mono", data: font("geist-mono/GeistMono-Bold.ttf"), weight: 700 as const },
];

export const dataUri = (mime: string, data: Buffer | string) =>
  `data:${mime};base64,${Buffer.from(data).toString("base64")}`;

/** "#4ade80", 0.2 → "rgba(74, 222, 128, 0.2)" */
export function rgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The two accent glows of the site background. */
export function glow(config: PortfolioConfig) {
  const { accent, accent2 } = themeColors(config);
  return `radial-gradient(circle at 15% 20%, ${rgba(accent, 0.22)}, transparent 45%), radial-gradient(circle at 88% 88%, ${rgba(accent2, 0.2)}, transparent 50%)`;
}

/**
 * The profile photo, if it is a PNG or JPEG (the only formats the image renderer reads): a full URL
 * (uploaded photos are on CloudFront) as it is, a file in /public as a data URI.
 */
export async function profilePhoto(config: PortfolioConfig) {
  const image = config.profile.image;
  if (!image || !/\.(png|jpe?g)$/i.test(image)) return undefined;
  if (/^https?:/.test(image)) return image;
  const file = path.join(process.cwd(), "public", image);
  if (!file.startsWith(path.join(process.cwd(), "public")) || !fs.existsSync(file)) return undefined;
  return dataUri(/\.png$/i.test(image) ? "image/png" : "image/jpeg", fs.readFileSync(file));
}

/** Profile photo in the gradient ring, or the "AB_" avatar. `photo` comes from profilePhoto(). */
export function OgAvatar({ size, config, photo }: { size: number; config: PortfolioConfig; photo?: string }) {
  const { accent, accent2 } = themeColors(config);
  const ring = Math.max(3, Math.round(size / 50));
  const inner = size - ring * 2;
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        padding: ring,
        borderRadius: size / 2,
        // Green when open to work, like the ring on the page.
        backgroundImage: isOpenToWork(config)
          ? `linear-gradient(135deg, ${OPEN}, ${rgba(OPEN, 0.55)})`
          : `linear-gradient(135deg, ${accent}, ${accent2})`,
      }}
    >
      {photo ? (
        <img src={photo} alt="" width={inner} height={inner} style={{ borderRadius: inner / 2, objectFit: "cover" }} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: inner / 2,
            background: "#0b0f14",
            fontFamily: "Geist Mono",
            fontSize: size * 0.32,
            fontWeight: 700,
            color: TEXT,
          }}
        >
          {initials(config.profile.name)}
          <span style={{ color: accent }}>_</span>
        </div>
      )}
    </div>
  );
}

/** Skills worth a tile in an image: those with a logo, or whose badge shows the full name ("SQL", not "YO" for YOLOv5). */
export const withTile = (skills: ResolvedSkill[], max: number) =>
  skills.filter((skill) => skill.svg || skill.text === skill.name).slice(0, max);

/** A skill tile: the logo, or the text badge when there is no logo. */
export function IconTile({ skill, size, accent }: { skill: ResolvedSkill; size: number; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: size * 0.39,
        borderRadius: size * 0.5,
        border: "1px solid rgba(255, 255, 255, 0.12)",
        background: "rgba(22, 28, 36, 0.95)",
      }}
    >
      {skill.svg ? (
        <img src={dataUri("image/svg+xml", skill.svg)} alt="" width={size} height={size} />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: size,
            height: size,
            fontFamily: "Geist Mono",
            fontSize: size * ((skill.text?.length ?? 0) > 2 ? 0.44 : 0.56),
            fontWeight: 700,
            color: accent,
          }}
        >
          {skill.text}
        </div>
      )}
    </div>
  );
}
