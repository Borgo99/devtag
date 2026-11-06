"use client";

import { useEffect } from "react";

/**
 * Counts this visit to the main site and where it came from (api/hit), for the funnel. Nothing is stored in
 * the browser: the server tells visitors apart with a hash that changes every day. `login`: on the login page.
 */
export function VisitBeacon({ login = false }: { login?: boolean }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // rdt_cid: the click ID Reddit adds to the links of its ads.
    const body = { ref: params.get("ref"), clickId: params.get("rdt_cid"), referrer: document.referrer, login };
    navigator.sendBeacon("/api/hit", JSON.stringify(body));
  }, [login]);
  return null;
}
