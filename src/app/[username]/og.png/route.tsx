import { ImageResponse } from "next/og";
import { resolveSkill } from "@/lib/icons";
import { publishedProfile } from "@/lib/profiles";
import { orbitSkills } from "@/lib/skills";
import { themeColors } from "@/lib/theme";
import { isOpenToWork, levelText } from "@/lib/work";
import {
  BG,
  IconTile,
  MUTED,
  OG_SIZE,
  OPEN,
  OgAvatar,
  TEXT,
  fonts,
  glow,
  profilePhoto,
  rgba,
  withTile,
} from "@/lib/og";

/**
 * Preview image shown when a profile link is shared (LinkedIn, WhatsApp, X…): /<username>/og.png
 * (the folder name gives the file its extension). The page links it with ?v=<publish time>.
 */

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const published = await publishedProfile((await params).username);
  if (!published) return new Response("Not found", { status: 404 });
  const { config } = published;
  const { profile } = config;
  const { accent, accent2 } = themeColors(config);
  const photo = await profilePhoto(config);
  const { top, rest } = orbitSkills(config);
  const level = levelText(profile);
  const open = isOpenToWork(config);
  const chip = { display: "flex", alignItems: "center", gap: 12, padding: "8px 20px", borderRadius: 999, fontSize: 24 };
  const icons = withTile(
    [...top, ...rest].map((skill) => resolveSkill(skill)),
    9,
  );

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 64,
        width: "100%",
        height: "100%",
        padding: "0 80px",
        background: BG,
        backgroundImage: glow(config),
        color: TEXT,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 26, color: MUTED }}>
          <span style={{ color: accent2, marginRight: 14 }}>$</span>whoami
        </div>
        <div style={{ marginTop: 16, fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
          {profile.name}
        </div>
        <div style={{ display: "flex", marginTop: 22, fontFamily: "Geist Mono", fontSize: 32, color: MUTED }}>
          <span style={{ color: accent, marginRight: 16 }}>&gt;</span>
          {profile.role}
        </div>
        {(open || level) && (
          <div style={{ display: "flex", gap: 14, marginTop: 28, fontFamily: "Geist Mono" }}>
            {open && (
              <div style={{ ...chip, border: `2px solid ${rgba(OPEN, 0.5)}`, background: rgba(OPEN, 0.12) }}>
                <div style={{ width: 12, height: 12, borderRadius: 6, background: OPEN }} />
                Open to work
              </div>
            )}
            {level && (
              <div style={{ ...chip, border: "2px solid rgba(255, 255, 255, 0.14)", color: MUTED }}>{level}</div>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 14, marginTop: open || level ? 40 : 56 }}>
          {icons.map((icon) => (
            <IconTile key={icon.name} skill={icon} size={36} accent={accent} />
          ))}
        </div>
      </div>

      <OgAvatar size={300} config={config} photo={photo} />
    </div>,
    { ...OG_SIZE, fonts: fonts() },
  );
}
