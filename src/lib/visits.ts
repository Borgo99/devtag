import { headers } from "next/headers";
import { after } from "next/server";
import { recordVisit } from "./store";

/** Crawlers, link-preview fetchers (LinkedIn, WhatsApp, Slack…) and scripts: not people. */
const BOTS =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|skype|vkshare|pinterest|headless|lighthouse|curl|wget|python|axios|node-fetch|go-http|java\/|okhttp/i;

/**
 * Counts a visit to a published page once the response has been sent, so the page doesn't wait for it.
 * Prefetches and bots are left out; each visitor counts once a day (lib/store.ts recordVisit).
 */
export async function countVisit(userId: string) {
  const h = await headers();
  const agent = h.get("user-agent") ?? "";
  const prefetch = h.has("next-router-prefetch") || /prefetch/i.test(h.get("sec-purpose") ?? h.get("purpose") ?? "");
  if (!agent || BOTS.test(agent) || prefetch) return;
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "";
  after(() => recordVisit(userId, `${ip} ${agent}`).catch((error) => console.error("[visits]", error)));
}
