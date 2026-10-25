import { ImageResponse } from "next/og";
import { resolveSkill } from "@/lib/icons";
import { publishedProfile } from "@/lib/profiles";
import { findProject } from "@/lib/projects";
import { themeColors } from "@/lib/theme";
import { BG, IconTile, MUTED, OG_SIZE, OgAvatar, TEXT, fonts, glow, profilePhoto, withTile } from "@/lib/og";

/** Link preview image of a project page: /<username>/projects/<slug>/og.png */

export async function GET(_request: Request, { params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const published = await publishedProfile(username);
  const project = published && findProject(published.config, slug);
  if (!published || !project) return new Response("Not found", { status: 404 });
  const { config } = published;
  const { profile } = config;
  const { accent, accent2 } = themeColors(config);
  const photo = await profilePhoto(config);
  const icons = withTile(
    (project.stack ?? []).map((skill) => resolveSkill(skill)),
    7,
  );

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        padding: "64px 80px",
        background: BG,
        backgroundImage: glow(config),
        color: TEXT,
        fontFamily: "Geist",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: "Geist Mono", fontSize: 24, color: MUTED }}>
          <span style={{ color: accent2, marginRight: 12 }}>$</span>
          {`cat projects/${slug}.md`}
        </div>
        <div style={{ marginTop: 18, fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.04em" }}>
          {project.name}
        </div>
        <div style={{ display: "block", marginTop: 24, fontSize: 30, lineHeight: 1.4, color: MUTED, lineClamp: 3 }}>
          {project.description}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <OgAvatar size={72} config={config} photo={photo} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 26, fontWeight: 700 }}>{profile.name}</div>
            <div style={{ fontFamily: "Geist Mono", fontSize: 20, color: MUTED }}>{profile.role}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {icons.map((icon) => (
            <IconTile key={icon.name} skill={icon} size={32} accent={accent} />
          ))}
        </div>
      </div>
    </div>,
    { ...OG_SIZE, fonts: fonts() },
  );
}
