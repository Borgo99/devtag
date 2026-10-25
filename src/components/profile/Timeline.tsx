import type { CSSProperties } from "react";
import type { Education, Job, Skill } from "@/lib/types";
import { period } from "@/lib/dates";
import { StackList } from "./StackList";
import s from "./Timeline.module.css";

/** One card on the timeline: a job or a degree. */
interface Entry {
  title: string;
  org: string;
  url?: string;
  /** Has a start date but no end date. */
  current: boolean;
  /** Short facts shown under the title, separated by dots. Empty ones are skipped. */
  meta: (string | undefined)[];
  summary?: string;
  highlights?: string[];
  stack?: Skill[];
}

export function jobEntry(job: Job): Entry {
  const { range, duration } = period(job.start, job.end);
  return {
    title: job.role,
    org: job.company,
    url: job.url,
    current: Boolean(job.start && !job.end),
    meta: [range, duration, job.location],
    summary: job.summary,
    highlights: job.highlights,
    stack: job.stack,
  };
}

export function educationEntry(item: Education): Entry {
  return {
    title: item.degree,
    org: item.school,
    url: item.url,
    current: Boolean(item.start && !item.end),
    meta: [period(item.start, item.end).range, item.grade, item.location],
    highlights: item.highlights,
  };
}

export function Timeline({ entries }: { entries: Entry[] }) {
  return (
    <ol className={s.timeline}>
      {entries.map((entry, i) => (
        <li
          key={`${entry.org}-${entry.title}`}
          className={`${s.entry} reveal`}
          style={{ "--delay": `${i * 60}ms` } as CSSProperties}
        >
          <span className={s.dot} data-current={entry.current || undefined} aria-hidden />
          <article className={s.card}>
            <header>
              <h3 className={s.title}>
                {entry.title} <span className={s.at}>@</span>{" "}
                {entry.url ? (
                  <a className={s.org} href={entry.url} target="_blank" rel="noopener noreferrer">
                    {entry.org}
                  </a>
                ) : (
                  <span className={s.org}>{entry.org}</span>
                )}
              </h3>
              {entry.meta.some(Boolean) && (
                <p className={s.meta}>
                  {entry.meta.filter(Boolean).map((m) => (
                    <span key={m}>{m}</span>
                  ))}
                </p>
              )}
            </header>

            {entry.summary && <p className={s.summary}>{entry.summary}</p>}

            {entry.highlights && entry.highlights.length > 0 && (
              <ul className={s.highlights}>
                {entry.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}

            {entry.stack && entry.stack.length > 0 && <StackList items={entry.stack} />}
          </article>
        </li>
      ))}
    </ol>
  );
}
