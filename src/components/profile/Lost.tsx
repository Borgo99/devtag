"use client";

import { useEffect, useState } from "react";
import s from "./Lost.module.css";

/** A different excuse on every visit. */
const EXCUSES = [
  "This page was never merged into main.",
  "It works on my machine.",
  "Someone deployed on a Friday afternoon.",
  "This route is still stuck in code review.",
  "I turned it off and on again. Still nothing.",
  "The page is in another branch. Probably feature/final-final-v2.",
  "404: page not found. 200: excuse found.",
  "git blame says it was me. git blame is right.",
];

/** Body of the 404 page: a terminal failing to `cd` into the requested URL. */
export function Lost() {
  // Static HTML can't know the URL; it's filled in once the page loads.
  const [path, setPath] = useState("/this-page");
  const [excuse, setExcuse] = useState(EXCUSES[0]);

  useEffect(() => {
    setPath(decodeURIComponent(window.location.pathname));
    setExcuse(EXCUSES[Math.floor(Math.random() * EXCUSES.length)]);
  }, []);

  return (
    <main className={s.page}>
      <div className={s.terminal} aria-hidden>
        <div className={s.bar}>
          <span />
          <span />
          <span />
        </div>
        <p>
          <span className={s.prompt}>~ $</span> cd {path}
        </p>
        <p className={s.error}>bash: cd: {path}: No such file or directory</p>
        <p>
          <span className={s.prompt}>~ $</span> <span className={s.cursor} />
        </p>
      </div>

      <h1 className={s.code} data-text="404">
        404
      </h1>
      <p className={s.excuse}>{excuse}</p>

      <div className={s.actions}>
        <a href="/" className={s.button}>
          <span className={s.dollar}>$</span> cd ~
        </a>
      </div>
    </main>
  );
}
