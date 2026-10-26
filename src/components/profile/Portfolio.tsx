import type { CSSProperties } from "react";
import type { PortfolioEntry } from "@/lib/portfolio";
import { StackList } from "./StackList";
import { Tags } from "./Tags";
import { CardLink, KindBadge, Thumb, opensLink } from "./PortfolioParts";
import s from "./Portfolio.module.css";

/** Large version of the Portfolio section (portfolioStyle: "large"): big preview in a little browser window, for items with a link. */
export function Portfolio({ entries }: { entries: PortfolioEntry[] }) {
  // Cards with a preview first, in pairs; cards with nothing to open follow, one full-width row each,
  // so a short card never has to stretch next to a tall one.
  const ordered = [...entries.filter(opensLink), ...entries.filter((entry) => !opensLink(entry))];
  return (
    <ul className={s.grid}>
      {ordered.map((entry, i) => (
        <li
          key={entry.key}
          className="reveal"
          data-plain={!opensLink(entry) || undefined}
          style={{ "--delay": `${(i % 2) * 80}ms` } as CSSProperties}
        >
          <CardLink entry={entry} className={s.card}>
            {opensLink(entry) && (
              <div className={s.window}>
                <div className={s.bar} aria-hidden>
                  <span className={s.dots}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={s.address}>{entry.label}</span>
                  <span className={s.open}>↗</span>
                </div>
                <Thumb entry={entry} />
              </div>
            )}

            <div className={s.body}>
              <div className={s.head}>
                <h3 className={s.name}>{entry.name}</h3>
                <KindBadge kind={entry.kind} />
              </div>
              {entry.description && <p className={s.description}>{entry.description}</p>}
              {entry.stack.length > 0 && <StackList items={entry.stack} />}
              {entry.tags.length > 0 && <Tags items={entry.tags} />}
            </div>
          </CardLink>
        </li>
      ))}
    </ul>
  );
}
