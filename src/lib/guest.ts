import { cookies } from "next/headers";
import { claimGuestDraft, dropGuestDraft, guestDraft } from "./store";

/**
 * Trying devtag without an account: the landing's CV import (api/cv/guest) keeps the page it made for a day
 * (lib/store.ts), and this cookie holds the random token that finds it. Only this site reads it: no subdomains.
 */
const COOKIE = "devtag_preview";
const DAY = 24 * 60 * 60;

/** This browser's page from a try, if it's still there. */
export async function guestPage() {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? guestDraft(token) : undefined;
}

/** After a try: the browser keeps its token, and an earlier try's page is deleted. */
export async function keepGuestToken(token: string) {
  const jar = await cookies();
  const earlier = jar.get(COOKIE)?.value;
  if (earlier) await dropGuestDraft(earlier);
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DAY,
  });
}

/** The page has moved to the user's account, or they turned it down: it's deleted, and so is the cookie. */
export async function endGuestPage(userId: string) {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await claimGuestDraft(token, userId);
  jar.delete(COOKIE);
}
