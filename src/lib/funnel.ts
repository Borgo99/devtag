import { pool } from "./db";

/**
 * The numbers behind admin/stats: how visitors of the main site become published, shared pages. Pages are
 * grouped by the week their name was claimed, so a stage counts that week's sign-ups that ever reached it.
 */

export interface Week {
  /** Monday, "2026-11-02". */
  week: string;
  visitors: number;
  /** CV imports without an account (the landing's), cancelled ones included. */
  tried: number;
  /** Visitors who opened the login page (counted since 2026-11-07). */
  login: number;
  /** Accounts created: signed in for the first time. */
  accounts: number;
  /** Names claimed: the page exists. */
  claimed: number;
  imported: number;
  published: number;
  shared: number;
  /** Pages with at least one visitor (the owner's own visits count too). */
  visited: number;
}

export async function weeks(count = 8) {
  const { rows } = await pool.query<Week>(
    `with weeks as (
       select generate_series(date_trunc('week', now()) - ($1 - 1) * interval '1 week', date_trunc('week', now()),
                              interval '1 week')::date as week
     ),
     visits as (
       select date_trunc('week', day)::date as week, count(*)::int as visitors,
         count(*) filter (where reached_login)::int as login
       from site_visits group by 1
     ),
     tries as (select date_trunc('week', created_at)::date as week, count(*)::int as tried from guest_imports group by 1),
     accounts as (select date_trunc('week', "createdAt")::date as week, count(*)::int as accounts from "user" group by 1),
     pages as (
       select date_trunc('week', p.created_at)::date as week,
         count(*)::int as claimed,
         count(*) filter (
           where exists (select 1 from cv_imports i where i.user_id = p.user_id)
             or exists (select 1 from guest_imports g where g.user_id = p.user_id)
         )::int as imported,
         count(*) filter (where p.first_published_at is not null)::int as published,
         count(*) filter (where exists (select 1 from shares s where s.user_id = p.user_id))::int as shared,
         count(*) filter (where exists (select 1 from page_visits v where v.user_id = p.user_id))::int as visited
       from profiles p group by 1
     )
     select to_char(week, 'YYYY-MM-DD') as week, coalesce(visitors, 0) as visitors, coalesce(tried, 0) as tried,
       coalesce(login, 0) as login,
       coalesce(accounts, 0) as accounts,
       coalesce(claimed, 0) as claimed, coalesce(imported, 0) as imported, coalesce(published, 0) as published,
       coalesce(shared, 0) as shared, coalesce(visited, 0) as visited
     from weeks left join visits using (week) left join tries using (week) left join accounts using (week)
       left join pages using (week)
     order by week desc`,
    [count],
  );
  return rows;
}

export interface Source {
  source: string;
  visitors: number;
  login: number;
  claimed: number;
  published: number;
}

/** Visitors and sign-ups of the last `days` days by where they came from; "unknown": no visit matched. */
export async function sources(days = 30) {
  const { rows } = await pool.query<Source>(
    `with v as (
       select source, count(*)::int as visitors, count(*) filter (where reached_login)::int as login
       from site_visits where day > current_date - $1::int group by 1
     ),
     p as (
       select coalesce(source, 'unknown') as source, count(*)::int as claimed,
         count(*) filter (where first_published_at is not null)::int as published
       from profiles where created_at > now() - $1 * interval '1 day' group by 1
     )
     select source, coalesce(visitors, 0) as visitors, coalesce(login, 0) as login, coalesce(claimed, 0) as claimed,
       coalesce(published, 0) as published
     from v full join p using (source)
     order by visitors desc, claimed desc`,
    [days],
  );
  return rows;
}

/** Accounts ever created: everyone who has signed in at least once. */
export async function totalAccounts() {
  const { rows } = await pool.query<{ n: number }>(`select count(*)::int as n from "user"`);
  return rows[0].n;
}

/** Clicks in the share dialog in the last `days` days, by place. */
export async function shares(days = 30) {
  const { rows } = await pool.query<{ place: string; clicks: number; users: number }>(
    `select place, count(*)::int as clicks, count(distinct user_id)::int as users
     from shares where created_at > now() - $1 * interval '1 day' group by 1 order by clicks desc`,
    [days],
  );
  return rows;
}
