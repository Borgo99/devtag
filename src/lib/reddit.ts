import { randomUUID } from "node:crypto";

/**
 * Reddit's Conversions API (v3): tells Reddit when someone who clicked one of our ads claims a page, so Ads
 * Manager counts the sign-up. Only Reddit's own click ID is sent: no IP address, browser or email, and nothing
 * is stored in the browser. Off until REDDIT_PIXEL_ID and REDDIT_CONVERSIONS_TOKEN are set.
 */

const PIXEL_ID = process.env.REDDIT_PIXEL_ID;
const TOKEN = process.env.REDDIT_CONVERSIONS_TOKEN;
/** From Reddit's Event Testing: while it's set, events go there instead of to the ads' results. */
const TEST_ID = process.env.REDDIT_TEST_ID;

/** The click ID (`rdt_cid`) from an ad's link, if it looks like one. */
export function redditClickId(value: unknown) {
  return typeof value === "string" && /^[\w.~-]{1,512}$/.test(value) ? value : undefined;
}

export async function sendRedditSignUp(clickId: string) {
  if (!PIXEL_ID || !TOKEN) return;
  const response = await fetch(
    `https://ads-api.reddit.com/api/v3/pixels/${encodeURIComponent(PIXEL_ID)}/conversion_events`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          events: [
            {
              event_at: Date.now(),
              action_source: "WEBSITE",
              click_id: clickId,
              type: { tracking_type: "SIGN_UP" },
              metadata: { conversion_id: randomUUID() },
            },
          ],
          ...(TEST_ID && { test_id: TEST_ID }),
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`Reddit answered ${response.status}: ${await response.text()}`);
}
