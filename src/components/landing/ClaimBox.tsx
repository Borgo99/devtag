"use client";

import { useEffect, useState } from "react";
import s from "./ClaimBox.module.css";

type Check = { state: "empty" } | { state: "checking" } | { state: "done"; available: boolean; error?: string };

/** "https:// [yourname] .devtag.io [Claim →]": checks the name as you type, then goes to sign-up. */
export function ClaimBox({ domain }: { domain: string }) {
  const [name, setName] = useState("");
  const [check, setCheck] = useState<Check>({ state: "empty" });

  useEffect(() => {
    if (!name) return setCheck({ state: "empty" });
    setCheck({ state: "checking" });
    let current = true;
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/username?name=${encodeURIComponent(name)}`).catch(() => undefined);
      const data = await res?.json().catch(() => undefined);
      if (current) setCheck(data ? { state: "done", ...data } : { state: "empty" });
    }, 300);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [name]);

  const available = check.state === "done" && check.available;

  return (
    <div className={s.wrap}>
      <form
        className={s.box}
        data-available={available || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          if (available) window.location.href = `/login?username=${encodeURIComponent(name)}`;
        }}
      >
        <label className={s.address}>
          <span className={s.protocol}>https://</span>
          <input
            value={name}
            // As wide as the text (monospace), so the name and the domain read as one address.
            style={{ width: `calc(${(name || "yourname").length}ch + 2px)` }}
            maxLength={30}
            placeholder="yourname"
            aria-label="Your name"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
          />
          <span className={s.domain}>.{domain}</span>
        </label>
        <button className={s.button} disabled={!available}>
          Claim it →
        </button>
      </form>
      <p
        className={s.status}
        data-state={check.state === "done" ? (available ? "ok" : "no") : check.state}
        aria-live="polite"
      >
        {check.state === "empty" && "Pick your address. You can fill in the page right after."}
        {check.state === "checking" && "checking…"}
        {check.state === "done" && (available ? `✓ ${name}.${domain} is free` : check.error)}
      </p>
    </div>
  );
}
