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

-- One row per CV import, to cap them per account and for the whole site (each import costs an AI call).
create table if not exists cv_imports (
  id         bigint generated always as identity primary key,
  user_id    text not null references "user" (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists cv_imports_by_user on cv_imports (user_id, created_at);
create index if not exists cv_imports_by_time on cv_imports (created_at);
