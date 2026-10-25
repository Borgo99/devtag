import type { PortfolioConfig } from "@/lib/types";
import { orbitSkills, skillName } from "@/lib/skills";
import { Spotlight } from "./Spotlight";
import s from "./Background.module.css";

/** Fixed backdrop: glow, dot grid, cursor spotlight and the config itself scrolling by as source code. */
export function Background({ config }: { config: PortfolioConfig }) {
  const { left, right } = sourceCode(config);
  return (
    <div className={s.root} aria-hidden>
      <div className={s.glow} />
      <div className={s.grid} />
      <Spotlight className={s.spotlight} />
      <Code lines={left} className={s.left} />
      <Code lines={right} className={s.right} />
    </div>
  );
}

function Code({ lines, className }: { lines: string[]; className: string }) {
  // Repeat to fill the column, then render twice so the scroll loops seamlessly.
  const filled = Array.from({ length: Math.ceil(70 / lines.length) }, () => lines).flat();
  const block = filled.map((line, i) => <div key={i}>{highlight(line)}</div>);
  return (
    <div className={`${s.code} ${className}`}>
      <div className={s.scroll}>
        <div>{block}</div>
        <div>{block}</div>
      </div>
    </div>
  );
}

function highlight(line: string) {
  if (!line) return "\u00a0"; // keeps empty lines from collapsing
  return line.split(/("[^"]*"|\/\/.*$|\b(?:export|const)\b)/).map((part, i) => {
    if (part.startsWith('"'))
      return (
        <span key={i} className={s.str}>
          {part}
        </span>
      );
    if (part.startsWith("//"))
      return (
        <span key={i} className={s.comment}>
          {part}
        </span>
      );
    if (part === "export" || part === "const")
      return (
        <span key={i} className={s.keyword}>
          {part}
        </span>
      );
    return part;
  });
}

function sourceCode(config: PortfolioConfig) {
  const q = JSON.stringify;
  const { top, rest } = orbitSkills(config);

  const left = [
    "// whoami.ts",
    "export const dev = {",
    `  name: ${q(config.profile.name)},`,
    `  role: ${q(config.profile.role)},`,
    ...(config.profile.seniority ? [`  level: ${q(config.profile.seniority)},`] : []),
    ...(config.openToWork?.active ? ["  openToWork: true,"] : []),
    ...(top.length ? ["  top: [", ...top.map((s) => `    ${q(skillName(s))},`), "  ],"] : []),
    "  skills: [",
    ...rest.map((s) => `    ${q(skillName(s))},`),
    "  ],",
    "  speaks: {",
    ...(config.languages ?? []).map((l) => `    ${l.name}: ${q(l.level)},`),
    "  },",
    "};",
    "",
  ];

  const right = [
    "// experience.ts",
    "export const jobs = [",
    ...(config.experience ?? []).flatMap((j) => [
      "  {",
      `    company: ${q(j.company)},`,
      `    role: ${q(j.role)},`,
      ...(j.start ? [`    since: ${q(j.start)},`] : []),
      "  },",
    ]),
    "];",
    "",
    "// projects.ts",
    "export const projects = [",
    ...(config.projects ?? []).map((p) => `  ${q(p.name)},`),
    "];",
    "",
  ];

  return { left, right };
}
