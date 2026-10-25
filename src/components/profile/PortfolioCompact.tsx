import type { CSSProperties } from "react";
import type { PortfolioEntry } from "@/lib/portfolio";
import { resolveSkill } from "@/lib/icons";
import { SkillIcon } from "./SkillIcon";
import { Tags } from "./Tags";
import { CardLink, KindBadge, Thumb, opensLink } from "./PortfolioParts";
import s from "./PortfolioCompact.module.css";

/** Compact version of the Portfolio section (portfolioStyle: "compact"): small thumbnail for items with a link, text beside it. */
export function PortfolioCompact({ entries }: { entries: PortfolioEntry[] }) {
  return (
    <ul className={s.grid}>
      {entries.map((entry, i) => {
        // Logos only, to stay small: skills without one, and repeated logos (React / React Native), are left out.
        const icons = entry.stack
          .map((skill) => resolveSkill(skill))
          .filter((skill) => skill.svg || skill.src)
          .filter((skill, index, all) => all.findIndex((o) => (o.svg ?? o.src) === (skill.svg ?? skill.src)) === index);
        return (
          <li key={entry.key} className="reveal" style={{ "--delay": `${(i % 2) * 80}ms` } as CSSProperties}>
            <CardLink entry={entry} className={s.card}>
              {opensLink(entry) && (
                <div className={s.thumb} aria-hidden>
                  <div className={s.bar}>
                    <i />
                    <i />
                    <i />
                  </div>
                  <Thumb entry={entry} />
                </div>
              )}

              <div className={s.body}>
                <div className={s.head}>
                  {/* Floated: only the first line of a long title makes room for it. */}
                  <KindBadge kind={entry.kind} />
                  <h3 className={s.name}>{entry.name}</h3>
                </div>
                {entry.description && <p className={s.description}>{entry.description}</p>}
                {entry.tags.length > 0 && (
                  <div className={s.tags}>
                    <Tags items={entry.tags} />
                  </div>
                )}
                <div className={s.foot}>
                  <span className={s.domain}>
                    {entry.label} {entry.href && <span aria-hidden>↗</span>}
                  </span>
                  {icons.length > 0 && (
                    <span className={s.icons}>
                      {icons.map((icon) => (
                        <span key={icon.name} className={s.icon} title={icon.name}>
                          <SkillIcon skill={icon} />
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
            </CardLink>
          </li>
        );
      })}
    </ul>
  );
}
