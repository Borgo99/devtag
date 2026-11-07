-- devtag's tables. Better Auth creates its own ("user", "session", "account", "verification") next to these.
-- Applied by `npm run db:migrate`; safe to run again.

-- One row per user: the page they edit (draft) and the one visitors see (published).
create table if not exists profiles (
  user_id      text primary key references "user" (id) on delete cascade,
  -- Also the subdomain: lowercase letters, numbers and dashes (checked by the app).
  username     text not null unique,
  draft        jsonb not null,
  published    jsonb,
  -- Editor sections filled from a CV and not checked yet.
  review       text[] not null default '{}',
  updated_at   timestamptz not null default now(),
  published_at timestamptz
);

-- Settings for matching with companies, never shown on the page: when the user agreed that devtag shares
-- their page with companies hiring for roles close to it (null: no consent), and where they live (optional).
alter table profiles add column if not exists companies_consent_at timestamptz;
alter table profiles add column if not exists location text;

-- The phone number shown in the CV as a PDF (made in the editor), never on the page. Optional.
alter table profiles add column if not exists phone text;

-- One row per CV import, to cap them per account and for the whole site (each import costs an AI call).
create table if not exists cv_imports (
  id         bigint generated always as identity primary key,
  user_id    text not null references "user" (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists cv_imports_by_user on cv_imports (user_id, created_at);
create index if not exists cv_imports_by_time on cv_imports (created_at);

-- CV imports without an account (the landing's "drop your CV"). The page made from the CV (`draft`) is kept for a
-- day behind a random cookie (`token`), so its visitor can see it (/preview) and claim it; claiming moves it to the
-- new account and sets `user_id`. After a day the draft is deleted; the row stays, for the limits and the funnel.
-- `visitor` is that day's hash of the visitor, as in site_visits, for the limit per visitor.
create table if not exists guest_imports (
  id         bigint generated always as identity primary key,
  token      text not null unique,
  visitor    bytea,
  draft      jsonb,
  user_id    text references "user" (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists guest_imports_by_time on guest_imports (created_at);

-- One row per site read for a project's preview (api/site-preview), to cap them per account.
create table if not exists site_reads (
  id         bigint generated always as identity primary key,
  user_id    text not null references "user" (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists site_reads_by_user on site_reads (user_id, created_at);

-- Visitors of each published page, each counted once a day. `visitor` hashes the IP address and browser with
-- that day's salt; salts are deleted the next day, so the hashes can't be traced back to anyone afterwards.
create table if not exists page_visits (
  user_id text not null references "user" (id) on delete cascade,
  day     date not null,
  visitor bytea not null,
  primary key (user_id, day, visitor)
);

create table if not exists visit_salts (
  day  date primary key,
  salt bytea not null
);

-- The funnel (admin/stats). When the name was claimed, when the page first went live, and where the user came
-- from: a ?ref= tag or the referring site of their visit to devtag.io that day (null: unknown). Existing rows are
-- filled from the account and the last publish.
alter table profiles add column if not exists created_at timestamptz;
alter table profiles add column if not exists first_published_at timestamptz;
alter table profiles add column if not exists source text;
update profiles p set created_at = u."createdAt" from "user" u where p.user_id = u.id and p.created_at is null;
alter table profiles alter column created_at set default now();
update profiles set first_published_at = published_at where first_published_at is null and published_at is not null;

-- Visitors of the main site (landing and login), each counted once a day, hashed like page_visits. `source` is
-- where their first visit of the day came from.
create table if not exists site_visits (
  day     date not null,
  visitor bytea not null,
  source  text not null,
  primary key (day, visitor)
);
-- Reddit's click ID, when the visit came from a Reddit ad: sent back to Reddit if the visitor claims a page
-- (lib/reddit.ts). Cleared the next day.
alter table site_visits add column if not exists click_id text;
-- The visitor opened the login page that day: where the funnel loses people, before or at sign-in. Counted since
-- 2026-11-07; earlier rows are false.
alter table site_visits add column if not exists reached_login boolean not null default false;

-- One row per click in the editor's share dialog: which place the page was shared to.
create table if not exists shares (
  user_id    text not null references "user" (id) on delete cascade,
  place      text not null,
  created_at timestamptz not null default now()
);

create index if not exists shares_by_user on shares (user_id);
