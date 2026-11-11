"use client";

import { Preview } from "@/components/admin/Preview";
import { LogoMark } from "@/components/site/LogoMark";
import { ClaimBox } from "./ClaimBox";
import { TypedNameProvider, useTypedName } from "./YouAvatar";
import s from "./GuestPreview.module.css";

interface Props {
  domain: string;
  /** An address from the name in the CV, "" if none fits. */
  suggestion: string;
  /** What the import found: "4 jobs · 2 degrees". */
  found: string[];
}

/**
 * /preview: the page made from the CV, as recruiters will see it, beside the box to claim its address (the same
 * flow as the landing's: sign in, pick the name, then the editor). The frame's address follows the name typed.
 */
export function GuestPreview({ domain, suggestion, found }: Props) {
  return (
    <TypedNameProvider initial={suggestion}>
      <div className={s.shell}>
        <aside className={s.panel}>
          <a href="/" className={s.logo}>
            <LogoMark />
            devtag<span className={s.cursor}>_</span>
          </a>

          <div className={s.body}>
            <p className={s.kicker}>✓ made from your CV</p>
            <h1 className={s.title}>Your page is ready</h1>
            <p className={s.lead}>This is how recruiters will see it. Claim your address to keep it.</p>
            {found.length > 0 && (
              <div className={s.log} aria-label="Found in your CV">
                {found.map((line) => (
                  <p key={line}>
                    <span aria-hidden>✓</span> {line}
                  </p>
                ))}
              </div>
            )}
            <div className={s.claim}>
              <p className={s.label}>
                Your address <span>type to change it</span>
              </p>
              <ClaimBox domain={domain} initial={suggestion} hint="Pick the address of your page." field />
            </div>
            {/* What happens after claiming: the page isn't final, and nothing goes public by itself. */}
            <ol className={s.steps} aria-label="Next">
              <li>
                <strong>Claim it</strong>
                <span>free: sign in with GitHub, Google or LinkedIn</span>
              </li>
              <li>
                <strong>Edit anything</strong>
                <span>texts, photo, colors and sections, in the editor</span>
              </li>
              <li>
                <strong>Publish</strong>
                <span>nothing is public until you do</span>
              </li>
            </ol>
          </div>

          <p className={s.foot}>
            Not saved yet: kept for 24 hours. <a href="/#claim">Try another CV</a> · <a href="/login">Sign in</a>
          </p>
        </aside>

        <main className={s.frame}>
          <Frame domain={domain} />
        </main>
      </div>
    </TypedNameProvider>
  );
}

function Frame({ domain }: { domain: string }) {
  const name = useTypedName();
  return <Preview version={0} address={`${name || "yourname"}.${domain}`} src="/preview/page" />;
}
