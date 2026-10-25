"use client";

import { useEffect } from "react";

/**
 * Fades in `.reveal` elements when they scroll into view. Only elements still below
 * the screen get hidden, and only once this script runs: if it never runs (blocked,
 * failed, JavaScript off), everything simply stays visible.
 */
export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          delete (entry.target as HTMLElement).dataset.pending;
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of document.querySelectorAll<HTMLElement>(".reveal")) {
      if (el.getBoundingClientRect().top < window.innerHeight) continue; // already on screen
      el.dataset.pending = "";
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return null;
}
