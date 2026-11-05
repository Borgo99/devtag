import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TextPage } from "@/components/site/TextPage";
import { shares, sources, totalAccounts, weeks } from "@/lib/funnel";
import { currentUser } from "@/lib/session";
import s from "./stats.module.css";

export const metadata: Metadata = { title: "Stats — devtag", robots: { index: false } };

/** Who may see the stats: the verified emails in STATS_EMAILS, comma-separated. */
const ALLOWED = (process.env.STATS_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

/** "12 · 40%": a count and its share of the step it comes from. */
function Step({ n, of }: { n: number; of: number }) {
  return (
    <>
      {n}
      {of > 0 && <span className={s.rate}> · {Math.round((n / of) * 100)}%</span>}
    </>
  );
}

/** The funnel, for devtag's own team: anyone else gets a 404. */
export default async function StatsPage() {
  const user = await currentUser();
  if (!user?.emailVerified || !ALLOWED.includes(user.email.toLowerCase())) notFound();

  const [accounts, byWeek, bySource, byPlace] = await Promise.all([totalAccounts(), weeks(), sources(), shares()]);

  return (
    <TextPage command="devtag stats" title="Funnel">
      <p className={s.total}>
        <strong>{accounts}</strong> accounts in total
      </p>
      <h2>By week</h2>
      <p>
        Visitors of the landing and login pages, each once a day. Pages are grouped by the week they were claimed;
        each step after that counts those pages, with its share of the step before (visited: of published).
      </p>
      <div className={s.scroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Week of</th>
              <th>Visitors</th>
              <th>Accounts</th>
              <th>Pages</th>
              <th>Imported</th>
              <th>Published</th>
              <th>Shared</th>
              <th>Visited</th>
            </tr>
          </thead>
          <tbody>
            {byWeek.map((w) => (
              <tr key={w.week}>
                <td>{w.week}</td>
                <td>{w.visitors}</td>
                <td>
                  <Step n={w.accounts} of={w.visitors} />
                </td>
                <td>
                  <Step n={w.claimed} of={w.accounts} />
                </td>
                <td>
                  <Step n={w.imported} of={w.claimed} />
                </td>
                <td>
                  <Step n={w.published} of={w.claimed} />
                </td>
                <td>
                  <Step n={w.shared} of={w.published} />
                </td>
                <td>
                  <Step n={w.visited} of={w.published} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>By source, last 30 days</h2>
      <p>
        A <code>?ref=</code> tag, else the site the visitor came from. A page gets the source of its owner&apos;s
        visit on the day they claimed it; &ldquo;unknown&rdquo; when there was none that day.
      </p>
      <div className={s.scroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Source</th>
              <th>Visitors</th>
              <th>Pages</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {bySource.map((row) => (
              <tr key={row.source}>
                <td>{row.source}</td>
                <td>{row.visitors}</td>
                <td>
                  <Step n={row.claimed} of={row.visitors} />
                </td>
                <td>
                  <Step n={row.published} of={row.claimed} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Shares, last 30 days</h2>
      {byPlace.length ? (
        <div className={s.scroll}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Place</th>
                <th>Clicks</th>
                <th>Users</th>
              </tr>
            </thead>
            <tbody>
              {byPlace.map((row) => (
                <tr key={row.place}>
                  <td>{row.place}</td>
                  <td>{row.clicks}</td>
                  <td>{row.users}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No shares yet.</p>
      )}
    </TextPage>
  );
}
