import type { CSSProperties } from "react";
import s from "./HiringData.module.css";

/**
 * "Why a page": survey data on what hiring managers look for. Every figure was checked against its
 * primary source (October 2026); keep the wording close to the source and the links in place.
 */

const HACKERRANK = "https://www.hackerrank.com/research/developer-skills/2018/";
const HARRIS =
  "https://web.archive.org/web/20241011123946/https://www.expresspros.com/Newsroom/America-Employed/Social-Media-Integral-to-Recruiting-as-Most-Businesses-Use-It-to-Source-and-Research-and-Screen-Candidates.aspx";

/** HackerRank Developer Skills Report 2018, "qualifications employers look for", all company sizes. */
const LOOK_FOR = [
  { label: "Experience", value: 90.6 },
  { label: "Portfolio (e.g. GitHub)", value: 72.7, highlight: true },
  { label: "Education", value: 41.7 },
  { label: "Training (e.g. bootcamps)", value: 23.7 },
  { label: "Personal brand (e.g. skills & endorsements)", value: 8.2 },
];

function Source({ href, children }: { href: string; children: string }) {
  return (
    <a className={s.source} href={href} target="_blank" rel="noopener noreferrer">
      {children} <span aria-hidden>↗</span>
    </a>
  );
}

export function HiringData() {
  return (
    <>
      <div className={s.grid}>
        <figure className={`${s.window} reveal`}>
          <div className={s.bar} aria-hidden>
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
            <span className={s.file}>hiring-managers.csv</span>
          </div>

          {/* A real table: screen readers get the data, the bars are drawn inside its cells. */}
          <table className={s.chart}>
            <caption className={s.caption}>
              <span className={s.title}>What hiring managers look for</span>
              <span className={s.subtitle}>Share who look for each qualification in a candidate</span>
            </caption>
            <tbody>
              {LOOK_FOR.map((row, i) => (
                <tr
                  key={row.label}
                  className={s.row}
                  data-highlight={row.highlight || undefined}
                  style={{ "--i": i } as CSSProperties}
                >
                  <th scope="row" className={s.label}>
                    {row.label}
                  </th>
                  <td className={s.cell}>
                    <span className={s.track} style={{ "--v": `${row.value}%` } as CSSProperties}>
                      <span className={s.mark} />
                      <span className={s.value}>{row.value}%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <figcaption className={s.foot}>
            <Source href={HACKERRANK}>HackerRank Developer Skills Report, 2018</Source>
          </figcaption>
        </figure>

        <div className={`${s.tile} reveal`} style={{ "--delay": "80ms" } as CSSProperties}>
          <p className={s.figure}>84.1%</p>
          <p className={s.text}>
            of executives (founders, CTOs, VPs) look for a portfolio: their <strong>first</strong> criterion, ahead of
            previous experience (71.2%).
          </p>
          <Source href={HACKERRANK}>HackerRank, 2018</Source>
        </div>

        <div className={`${s.tile} reveal`} style={{ "--delay": "160ms" } as CSSProperties}>
          <p className={s.figure}>7 in 10</p>
          <p className={s.text}>
            companies research job candidates on social media. Put your page link on every profile they&apos;ll check.
          </p>
          <Source href={HARRIS}>Harris Poll for Express Employment Professionals, 2023</Source>
        </div>
      </div>

      <p className={`${s.note} reveal`}>
        <span className={s.hash}>#</span> Surveys report what hiring managers say, not guarantees. A page won&apos;t get
        you hired; it makes your work easy to find and easy to check.
      </p>
    </>
  );
}
