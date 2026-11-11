import type { Metadata } from "next";
import { TextPage } from "@/components/site/TextPage";
import { summarize, TOP, type Ranked, type Row } from "@/lib/report";
import { requireTeam } from "@/lib/session";
import { reportPages } from "@/lib/store";
import s from "../stats/stats.module.css";

export const metadata: Metadata = { title: "Report — devtag", robots: { index: false } };

/** "12 · 40%": a count and its share of the column's pages. */
function Share({ n, of }: { n: number; of: number }) {
  return (
    <>
      {n}
      {of > 0 && <span className={s.rate}> · {Math.round((n / of) * 100)}%</span>}
    </>
  );
}

/** One table: a row per value, each count with its share of `of` (all pages, or those open to work). */
function Table({ title, rows, of }: { title: string; rows: Row[]; of: Row }) {
  return (
    <div className={s.scroll}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>{title}</th>
            <th>All pages</th>
            <th>Published</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>
                <Share n={row.pages} of={of.pages} />
              </td>
              <td>
                <Share n={row.published} of={of.published} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** "42 different roles, as typed (capitals aside); the 20 most common." */
const typed = ({ distinct }: Ranked, noun: string) =>
  `${distinct} different ${noun}${distinct === 1 ? "" : "s"}, as typed (capitals aside)` +
  (distinct > TOP ? `; the ${TOP} most common.` : ".");

/** Who is on devtag, from what their pages say, for devtag's own team: anyone else gets a 404. */
export default async function ReportPage() {
  await requireTeam();
  const r = summarize(await reportPages());

  return (
    <TextPage command="devtag report" title="Pages">
      <p className={s.total}>
        <strong>{r.total.pages}</strong> pages, <strong>{r.total.published}</strong> published
      </p>
      <p>
        All pages: what their owners last saved in the editor, published or not. Published: what visitors see now,
        which can be older than the draft. Each count shows its share of the column&apos;s pages.
      </p>

      <h2>Looking for work</h2>
      <p>
        Open to work: switched on in the editor, so the page shows it. Agreed: devtag may share their page with
        companies hiring for roles close to it (the editor&apos;s private Companies section); only published pages can
        be shared. Job types, work modes and availability count the pages open to work, as shares of them: a page can
        pick several types and modes, or none.
      </p>
      <Table title="Owner" rows={r.looking} of={r.total} />
      <Table title="Job type" rows={r.jobTypes} of={r.openToWork} />
      <Table title="Work mode" rows={r.workModes} of={r.openToWork} />
      <Table title="Available" rows={r.available} of={r.openToWork} />

      <h2>Roles</h2>
      <p>{typed(r.roles, "role")}</p>
      <Table title="Role" rows={r.roles.rows} of={r.total} />

      <h2>Experience</h2>
      <Table title="Seniority" rows={r.seniority} of={r.total} />
      <Table title="Years" rows={r.years} of={r.total} />

      <h2>Where they live</h2>
      <p>
        Where they live, from the Companies section, if they gave it and still agree to be shared; else where
        they&apos;re based, from the page. {typed(r.places, "place")}
      </p>
      <Table title="Place" rows={r.places.rows} of={r.total} />

      <h2>Skills</h2>
      <p>
        The top skills and the orbit&apos;s. A page has several, so the shares add up to more than 100%.{" "}
        {typed(r.skills, "skill")}
      </p>
      <Table title="Skill" rows={r.skills.rows} of={r.total} />
    </TextPage>
  );
}
