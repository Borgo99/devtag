import { randomBytes, randomUUID } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { pool } from "./db";
import type { PortfolioConfig } from "./types";

/**
 * Where pages and photos live: the `profiles` table in Neon (db/schema.sql) and the S3 bucket
 * behind CloudFront. Callers validate usernames first (lib/usernames.ts).
 */

export interface Profile {
  userId: string;
  username: string;
  /** What the editor saves as you type. */
  draft: PortfolioConfig;
  /** What the public page shows: a copy of the draft, made by Publish. */
  published?: PortfolioConfig;
  /** Editor sections filled from a CV that the user hasn't checked yet. */
  review: string[];
  updatedAt: string;
  publishedAt?: string;
  /** When the user agreed that we share their page with companies hiring for roles close to it. */
  companiesConsentAt?: string;
  /** Where the user lives, for matching with companies. Never shown on the page. */
  location?: string;
}

interface Row {
  user_id: string;
  username: string;
  draft: PortfolioConfig;
  published: PortfolioConfig | null;
  review: string[];
  updated_at: Date;
  published_at: Date | null;
  companies_consent_at: Date | null;
  location: string | null;
}

const toProfile = (row: Row): Profile => ({
  userId: row.user_id,
  username: row.username,
  draft: row.draft,
  published: row.published ?? undefined,
  review: row.review,
  updatedAt: row.updated_at.toISOString(),
  publishedAt: row.published_at?.toISOString(),
  companiesConsentAt: row.companies_consent_at?.toISOString(),
  location: row.location ?? undefined,
});

async function one(sql: string, params: unknown[]) {
  const { rows } = await pool.query<Row>(sql, params);
  return rows[0] && toProfile(rows[0]);
}

export const getProfile = (username: string) => one("select * from profiles where username = $1", [username]);

export const getProfileOfUser = (userId: string) => one("select * from profiles where user_id = $1", [userId]);

/** Claims `username` for the user. Undefined if the name is taken (or the user already has a page). */
export const createProfile = (userId: string, username: string, draft: PortfolioConfig) =>
  one("insert into profiles (user_id, username, draft) values ($1, $2, $3) on conflict do nothing returning *", [
    userId,
    username,
    draft,
  ]);

export const saveDraft = (userId: string, draft: PortfolioConfig, review: string[]) =>
  one("update profiles set draft = $2, review = $3, updated_at = now() where user_id = $1 returning *", [
    userId,
    draft,
    review,
  ]);

export const publish = (userId: string, published: PortfolioConfig) =>
  one("update profiles set published = $2, published_at = now() where user_id = $1 returning *", [userId, published]);

/** The private settings for companies. Consent keeps the time it was first given, until it's withdrawn. */
export const saveMatching = (userId: string, consent: boolean, location: string | undefined) =>
  one(
    `update profiles
     set companies_consent_at = case when $2 then coalesce(companies_consent_at, now()) end, location = $3
     where user_id = $1 returning *`,
    [userId, consent, location ?? null],
  );

// CV imports

/** Each import is an AI call that costs money: a few per account a day, and a ceiling for the whole site. */
export const CV_IMPORTS_PER_USER = 3;
export const CV_IMPORTS_PER_SITE = 500;

/**
 * Records one CV import for the user if both 24-hour limits allow it, in a single statement so two
 * imports at once can't both slip under the limit. Returns the import's id, or which limit was reached.
 */
export async function takeCvImport(userId: string): Promise<{ id: string } | { limit: "user" | "site" }> {
  const { rows } = await pool.query<{ id: string }>(
    `insert into cv_imports (user_id)
     select $1
     where (select count(*) from cv_imports where user_id = $1 and created_at > now() - interval '24 hours') < $2
       and (select count(*) from cv_imports where created_at > now() - interval '24 hours') < $3
     returning id`,
    [userId, CV_IMPORTS_PER_USER, CV_IMPORTS_PER_SITE],
  );
  if (rows[0]) return { id: rows[0].id };
  const mine = await pool.query<{ n: number }>(
    "select count(*)::int as n from cv_imports where user_id = $1 and created_at > now() - interval '24 hours'",
    [userId],
  );
  return { limit: mine.rows[0].n >= CV_IMPORTS_PER_USER ? "user" : "site" };
}

/** Gives an import back when it failed on our side (the AI didn't answer). */
export async function returnCvImport(id: string) {
  await pool.query("delete from cv_imports where id = $1", [id]);
}

// Page visits

/**
 * Counts a visitor of the user's page, once a day. `visitor` (IP address and browser) is only hashed, with
 * a random salt that changes every day; old salts are deleted, so old hashes can't be linked to anyone.
 */
export async function recordVisit(userId: string, visitor: string) {
  await pool.query("delete from visit_salts where day < current_date");
  await pool.query("insert into visit_salts (day, salt) values (current_date, $1) on conflict do nothing", [
    randomBytes(32),
  ]);
  await pool.query(
    `insert into page_visits (user_id, day, visitor)
     select $1, current_date, sha256(salt || convert_to($1 || $2, 'UTF8')) from visit_salts where day = current_date
     on conflict do nothing`,
    [userId, visitor],
  );
}

/** Visitors of the user's page: all time, and in the last 7 days (today included). */
export async function visitStats(userId: string) {
  const { rows } = await pool.query<{ total: number; week: number }>(
    `select count(*)::int as total, count(*) filter (where day > current_date - 7)::int as week
     from page_visits where user_id = $1`,
    [userId],
  );
  return rows[0];
}

// Photos

const s3 = new S3Client({ region: process.env.AWS_REGION });

/**
 * Saves a photo (a JPEG from lib/photos.ts) in S3 and returns its CloudFront URL. Every upload gets a
 * new name, so a URL never changes content and can be cached forever. Replaced photos stay in the
 * bucket: the live page may still show the old one until the next publish.
 */
export async function savePhoto(userId: string, jpeg: Buffer) {
  const key = `photos/${userId}/${randomUUID()}.jpg`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: jpeg,
      ContentType: "image/jpeg",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${process.env.PHOTOS_URL}/${key}`;
}
