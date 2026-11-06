import type { CSSProperties } from "react";
import s from "./HiringData.module.css";

/**
 * "Why a page": what hiring managers look for, and how fast they look. Every figure was checked against its
 * primary source (October and November 2026); keep the wording close to the source and the links in place.
 */

const HACKERRANK = "https://www.hackerrank.com/research/developer-skills/2018/";
const HARRIS =
  "https://web.archive.org/web/20241011123946/https://www.expresspros.com/Newsroom/America-Employed/Social-Media-Integral-to-Recruiting-as-Most-Businesses-Use-It-to-Source-and-Research-and-Screen-Candidates.aspx";

const LADDERS =
  "https://www.prnewswire.com/news-releases/ladders-updates-popular-recruiter-eye-tracking-study-with-new-key-insights-on-how-job-seekers-can-improve-their-resumes-300744217.html";
const RESUME_TEMPLATES =
  "https://www.resumetemplates.com/3-in-4-hiring-managers-pass-on-qualified-candidates-with-bad-resumes/";

/**
 * The big window. HackerRank 2018, "qualifications employers look for", all company sizes: portfolio 72.7%,
 * education 41.7%. Ladders 2018: average initial screening time and what the best and worst resumes looked
 * like. ResumeTemplates, January 2024, 781 US respondents involved in hiring: "always (9%) or often (27%)".
 */
const STATS = [
  {
    figure: "72.7%",
    text: "of hiring managers look for a portfolio (e.g. GitHub) in a candidate, far more than for education (41.7%).",
    href: HACKERRANK,
    source: "HackerRank Developer Skills Report, 2018",
  },
  {
    figure: "7.4s",
    text: "is how long a recruiter's first look at a resume lasts. Simple layouts with clear headers held their attention; cluttered ones didn't.",
    href: LADDERS,
    source: "Ladders eye-tracking study, 2018",
  },
  {
    figure: "36%",
    text: "of hiring managers often or always pass on a candidate when they can't quickly find key information on the resume.",
    href: RESUME_TEMPLATES,
    source: "ResumeTemplates survey of 781 US hiring managers, 2024",
  },
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
        <div className={`${s.window} reveal`}>
          <div className={s.bar} aria-hidden>
            <span className={s.dots}>
              <i />
              <i />
              <i />
            </span>
            <span className={s.file}>hiring-managers.csv</span>
          </div>

          <ul className={s.stats}>
            {STATS.map((stat) => (
              <li key={stat.figure} className={s.stat}>
                <p className={s.figure}>{stat.figure}</p>
                <div className={s.statBody}>
                  <p className={s.text}>{stat.text}</p>
                  <Source href={stat.href}>{stat.source}</Source>
                </div>
              </li>
            ))}
          </ul>
        </div>

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
