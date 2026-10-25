import { cache } from "react";
import { headers } from "next/headers";
import demo from "@/demo/config";
import { getProfile } from "./store";
import { subdomain } from "./site";
import type { PortfolioConfig } from "./types";

/** The demo profile is part of the code, not of the store. */
export const DEMO = "demo";

/**
 * The live version of a profile page. `version` changes on every publish: it goes in the share image
 * URLs, because LinkedIn, WhatsApp & co. keep an image as long as its URL doesn't change.
 * Cached per request, so the page and its metadata read the store once.
 */
export const publishedProfile = cache(
  async (username: string): Promise<{ config: PortfolioConfig; version: string } | undefined> => {
    if (username === DEMO) return { config: demo, version: "demo" };
    const profile = await getProfile(username);
    if (!profile?.published) return undefined;
    return { config: profile.published, version: String(Date.parse(profile.publishedAt ?? "") || 0) };
  },
);

/** Where a profile's own links start: "" on its subdomain (andrea.devtag.io), "/andrea" on the main site. */
export async function profileBase(username: string) {
  return subdomain((await headers()).get("host")) === username ? "" : `/${username}`;
}

/** "https://andrea.devtag.io": share images and link previews need absolute URLs. */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const protocol = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
