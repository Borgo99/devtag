"use client";

import { useEffect, useRef, useState } from "react";
import s from "./SharePanel.module.css";

interface Props {
  /** "andrea.devtag.io" */
  address: string;
  /** The live page, absolute or a path on this site (local development). */
  pageUrl: string;
  onClose: () => void;
}

/** Shields.io reads "-" and "_" as separators: they're written twice to show as text. */
const badgeText = (text: string) => encodeURIComponent(text.replaceAll("-", "--").replaceAll("_", "__"));

/**
 * Where to put the page once it's live: each place is one copy and one link away. Every place it
 * goes (a LinkedIn profile, a GitHub README) is also where other developers see devtag.
 */
export function SharePanel({ address, pageUrl, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<string>();
  const url = new URL(pageUrl, window.location.origin).href;

  // A native modal: focus stays inside, Esc closes it, the editor behind can't be clicked.
  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(undefined), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  /** For the funnel: which places pages get shared to. `keepalive`: a link may open before it's sent. */
  function track(place: string) {
    fetch("/api/profile/share", { method: "POST", body: JSON.stringify({ place }), keepalive: true }).catch(
      () => undefined,
    );
  }

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text).catch(() => undefined);
    setCopied(id);
    track(id);
  }

  const post = `My portfolio is online: what I've built, the stack I use and how to reach me.\n\n${url}`;
  const badge = `[![Portfolio](https://img.shields.io/badge/portfolio-${badgeText(address)}-4ade80)](${url})`;

  const places = [
    {
      id: "linkedin",
      title: "Your LinkedIn profile",
      how: "Paste it in Contact info → Website, and in Featured → Add a link. Recruiters open it from there.",
      text: url,
      copyLabel: "Copy link",
      link: { href: "https://www.linkedin.com/in/me/", label: "Open LinkedIn" },
    },
    {
      id: "post",
      title: "A LinkedIn post",
      how: "Its preview shows your photo, your role and your top skills.",
      text: post,
      copyLabel: "Copy post text",
      link: {
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        label: "Share on LinkedIn",
      },
    },
    {
      id: "github",
      title: "Your GitHub profile",
      how: "Add this badge to your profile README, and the link to Settings → Website.",
      text: badge,
      copyLabel: "Copy badge",
      link: { href: "https://github.com/settings/profile", label: "Open GitHub" },
    },
    {
      id: "elsewhere",
      title: "Everywhere else",
      how: "Your email signature, the top of your CV, your X or Bluesky bio.",
      text: url,
      copyLabel: "Copy link",
    },
  ];

  return (
    <dialog
      ref={dialog}
      className={s.dialog}
      aria-labelledby="share-title"
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself.
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <div className={s.bar}>
        <span className={s.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span id="share-title" className={s.barTitle}>
          Share your page
        </span>
      </div>

      <div className={s.live}>
        <p>Your page is live. Put the link where people already look for you.</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className={s.address}>
          {address} <span aria-hidden>↗</span>
        </a>
      </div>

      <ul className={s.places}>
        {places.map((place) => (
          <li key={place.id}>
            <div>
              <h3>{place.title}</h3>
              <p>{place.how}</p>
            </div>
            <div className={s.buttons}>
              <button type="button" className={s.copy} onClick={() => copy(place.id, place.text)}>
                {copied === place.id ? "Copied ✓" : place.copyLabel}
              </button>
              {place.link && (
                <a
                  href={place.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.open}
                  onClick={() => track(place.id)}
                >
                  {place.link.label} <span aria-hidden>↗</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className={s.foot}>
        <span className={s.note}>You can open this again from Share, at the top.</span>
        <button type="button" className={s.done} onClick={() => dialog.current?.close()}>
          Done
        </button>
      </div>
    </dialog>
  );
}
