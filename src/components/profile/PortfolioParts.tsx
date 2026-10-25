import type { ReactNode } from "react";
import type { PortfolioEntry, PortfolioKind } from "@/lib/portfolio";
import s from "./PortfolioParts.module.css";

/** Pieces shared by both Portfolio looks (large and compact). */

const BADGES: Record<PortfolioKind, string> = { live: "live", code: "code", paper: "paper", page: "project" };

export function KindBadge({ kind }: { kind: PortfolioKind }) {
  return (
    <span className={s.badge} data-kind={kind}>
      {BADGES[kind]}
    </span>
  );
}

/** The browser-window preview is only for items that open a site, a repo or a paper elsewhere. */
export const opensLink = (entry: PortfolioEntry) => Boolean(entry.external && entry.href);

/** The whole card is a link, unless the item has nowhere to go (a paper without URL). */
export function CardLink({
  entry,
  className,
  children,
}: {
  entry: PortfolioEntry;
  className: string;
  children: ReactNode;
}) {
  if (!entry.href) return <div className={className}>{children}</div>;
  const external = entry.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a href={entry.href} className={className} {...external}>
      {children}
    </a>
  );
}

/** 16:10 preview: the screenshot if there is one, otherwise a drawing that fits the kind of item. */
export function Thumb({ entry }: { entry: PortfolioEntry }) {
  return (
    <div className={s.thumb} data-thumb>
      {entry.image ? (
        <img className={s.image} src={entry.image} alt="" width={1280} height={800} loading="lazy" />
      ) : entry.kind === "paper" ? (
        <Paper />
      ) : entry.kind === "code" ? (
        <Code seed={entry.name} />
      ) : (
        <span className={s.placeholder}>{entry.label}</span>
      )}
    </div>
  );
}

/** A mini code editor. Line lengths come from the name, so every repo looks a bit different. */
function Code({ seed }: { seed: string }) {
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  const random = () => (h = (Math.imul(h, 1103515245) + 12345) >>> 0) / 2 ** 32;
  const lines = Array.from({ length: 9 }, () => ({
    indent: Math.floor(random() * 3),
    tokens: Array.from({ length: 1 + Math.floor(random() * 3) }, () => ({
      width: 8 + random() * 20,
      color: Math.floor(random() * 3),
    })),
  }));

  return (
    <div className={s.code} aria-hidden>
      {lines.map((line, i) => (
        <div key={i} className={s.line}>
          <span className={s.number}>{i + 1}</span>
          <span style={{ width: `${line.indent * 5}%` }} />
          {line.tokens.map((token, j) => (
            <i key={j} data-color={token.color} style={{ width: `${token.width}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** A paper page: title, authors, then two columns of text. */
function Paper() {
  return (
    <div className={s.paper} aria-hidden>
      <div className={s.sheet}>
        <i className={s.title} />
        <i className={s.title} style={{ width: "62%" }} />
        <i className={s.authors} />
        <div className={s.columns}>
          {[0, 1].map((column) => (
            <div key={column}>
              {[96, 88, 100, 92, 70, 100, 84, 96, 60].map((width, i) => (
                <i key={i} style={{ width: `${width}%` }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
