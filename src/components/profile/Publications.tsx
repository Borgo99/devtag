import type { CSSProperties } from "react";
import type { Publication } from "@/lib/types";
import { Tags } from "./Tags";
import s from "./Publications.module.css";

/** Wraps every occurrence of `name` in <strong>. */
function highlight(text: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "i")).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

export function Publications({ publications, author }: { publications: Publication[]; author: string }) {
  return (
    <ol className={s.list}>
      {publications.map((pub, i) => (
        <li key={pub.title} className={`${s.item} reveal`} style={{ "--delay": `${i * 60}ms` } as CSSProperties}>
          <span className={s.year}>{pub.year}</span>
          <div className={s.body}>
            <h3 className={s.title}>
              {pub.url ? (
                <a href={pub.url} target="_blank" rel="noopener noreferrer">
                  {pub.title}
                  <span className={s.arrow} aria-hidden>
                    ↗
                  </span>
                </a>
              ) : (
                pub.title
              )}
            </h3>
            {pub.description && <p className={s.description}>{pub.description}</p>}
            {pub.authors && <p className={s.authors}>{highlight(pub.authors, author)}</p>}
            {pub.venue && <p className={s.venue}>{pub.venue}</p>}
            {pub.keywords && pub.keywords.length > 0 && <Tags items={pub.keywords} />}
          </div>
        </li>
      ))}
    </ol>
  );
}
