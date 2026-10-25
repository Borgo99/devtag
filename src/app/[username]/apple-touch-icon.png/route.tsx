import { ImageResponse } from "next/og";
import { publishedProfile } from "@/lib/profiles";
import { initials } from "@/lib/text";
import { themeColors } from "@/lib/theme";
import { TEXT, fonts, rgba } from "@/lib/og";

/**
 * Icon for "Add to Home Screen" on phones, and the PNG favicon for browsers without SVG favicons (Safari).
 * Phones round the corners themselves, so it is a full square.
 */

export async function GET(_request: Request, { params }: { params: Promise<{ username: string }> }) {
  const published = await publishedProfile((await params).username);
  if (!published) return new Response("Not found", { status: 404 });
  const { config } = published;
  const { accent, accent2 } = themeColors(config);
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#0b0f14",
        backgroundImage: `radial-gradient(circle at 20% 15%, ${rgba(accent, 0.35)}, transparent 60%), radial-gradient(circle at 85% 90%, ${rgba(accent2, 0.3)}, transparent 55%)`,
        color: TEXT,
        fontFamily: "Geist Mono",
        fontSize: 64,
        fontWeight: 700,
        letterSpacing: "-0.04em",
      }}
    >
      {initials(config.profile.name)}
      <span style={{ color: accent }}>_</span>
    </div>,
    { width: 180, height: 180, fonts: fonts() },
  );
}
