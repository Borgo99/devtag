import type { ResolvedSkill } from "@/lib/icons";
import s from "./SkillIcon.module.css";

/** Renders a resolved skill icon: inline SVG, custom image, or a text badge. */
export function SkillIcon({ skill }: { skill: ResolvedSkill }) {
  if (skill.svg) return <span className={s.icon} dangerouslySetInnerHTML={{ __html: skill.svg }} />;
  if (skill.src) return <img className={s.icon} src={skill.src} alt="" />;
  return (
    <span className={s.text} data-long={(skill.text?.length ?? 0) > 2 || undefined}>
      {skill.text}
    </span>
  );
}
