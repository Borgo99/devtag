"use client";

import { useEffect } from "react";

/**
 * Counts this visit to the main site and where it came from (api/hit), for the funnel. Nothing is stored in
 * the browser: the server tells visitors apart with a hash that changes every day.
 */
export function VisitBeacon() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    navigator.sendBeacon("/api/hit", JSON.stringify({ ref, referrer: document.referrer }));
  }, []);
  return null;
}
