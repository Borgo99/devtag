import { DISPLAY_DOMAIN, SITE_URL } from "@/lib/site";
import { Background } from "./profile/Background";
import { sample } from "./landing/sample";
import s from "./profile/Lost.module.css";
import u from "./Unclaimed.module.css";

/** Shown at a free address (nobody.devtag.io): the 404 terminal, but with an offer. */
export function Unclaimed({ username }: { username: string }) {
  const address = `${username}.${DISPLAY_DOMAIN}`;
  const claim = `${SITE_URL === "/" ? "" : SITE_URL}/login?username=${encodeURIComponent(username)}`;
  return (
    <>
      <Background config={sample} />
      <main className={s.page}>
        <div className={s.terminal} aria-hidden>
          <div className={s.bar}>
            <span />
            <span />
            <span />
          </div>
          <p>
            <span className={s.prompt}>~ $</span> curl {address}
          </p>
          <p className={u.free}>curl: nobody lives here yet</p>
          <p>
            <span className={s.prompt}>~ $</span> <span className={s.cursor} />
          </p>
        </div>

        <h1 className={u.name}>{username}</h1>
        <p className={s.excuse}>
          <strong className={u.address}>{address}</strong> is free. It could be your developer portfolio, in two
          minutes.
        </p>

        <div className={s.actions}>
          <a href={claim} className={`${s.button} ${u.claim}`}>
            <span className={s.dollar}>$</span> claim {username}
          </a>
        </div>
      </main>
    </>
  );
}
