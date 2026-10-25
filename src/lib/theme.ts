import type { CSSProperties } from "react";
import type { PortfolioConfig } from "./types";

/** Theme colors from the config, with defaults. */
export const themeColors = (config: PortfolioConfig) => ({
  accent: config.theme?.accent ?? "#4ade80",
  accent2: config.theme?.accent2 ?? "#38bdf8",
});

/** The colors as the CSS variables the page styles use. */
export function themeVars(config: PortfolioConfig) {
  const { accent, accent2 } = themeColors(config);
  return { "--accent": accent, "--accent2": accent2 } as CSSProperties;
}
