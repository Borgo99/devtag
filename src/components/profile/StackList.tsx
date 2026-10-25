import type { Skill } from "@/lib/types";
import { resolveSkill } from "@/lib/icons";
import { SkillIcon } from "./SkillIcon";
import s from "./StackList.module.css";

/** "Icon + name" pills. Skills without an icon (e.g. "Machine Learning") show just the name. */
export function StackList({ items, large = false }: { items: Skill[]; large?: boolean }) {
  return (
    <ul className={`${s.list} ${large ? s.large : ""}`}>
      {items
        .map((item) => resolveSkill(item))
        .map((skill) => (
          <li key={skill.name} className={s.pill}>
            {(skill.svg || skill.src) && (
              <span className={s.icon}>
                <SkillIcon skill={skill} />
              </span>
            )}
            {skill.name}
          </li>
        ))}
    </ul>
  );
}
