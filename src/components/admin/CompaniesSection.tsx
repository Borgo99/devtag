"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Section, Text } from "./fields";
import s from "./Editor.module.css";

export interface Matching {
  consent: boolean;
  location: string;
}

const SAVE_DELAY = 700;

/**
 * Private settings for the company side: never on the page, so they save on their own, without Publish.
 * `save` is a server action (app/admin/actions.ts).
 */
export function CompaniesSection({
  initial,
  save,
}: {
  initial: Matching;
  save: (matching: Matching) => Promise<boolean>;
}) {
  const [matching, setMatching] = useState(initial);
  const [failed, setFailed] = useState(false);
  const saved = useRef(JSON.stringify(initial));

  useEffect(() => {
    const next = JSON.stringify(matching);
    if (next === saved.current) return;
    const timer = window.setTimeout(async () => {
      const ok = await save(matching).catch(() => false);
      if (ok) saved.current = next;
      setFailed(!ok);
    }, SAVE_DELAY);
    return () => window.clearTimeout(timer);
  }, [matching, save]);

  return (
    <Section title="Companies">
      <Check
        label="devtag can share my page with companies hiring for roles close to my profile"
        checked={matching.consent}
        onChange={(consent) => setMatching((m) => ({ ...m, consent }))}
      />
      {matching.consent && (
        <Text
          label="Where you live"
          hint="Optional · to match roles near you"
          placeholder="Milan, Italy"
          value={matching.location}
          onChange={(location) => setMatching((m) => ({ ...m, location }))}
        />
      )}
      <p className={s.note}>
        {failed
          ? "Not saved: check your connection and try again."
          : "Private: only devtag sees this section, it's not on your page. You can change your mind at any time."}
      </p>
    </Section>
  );
}
