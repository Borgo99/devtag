"use client";

import { useEffect, useRef, useState } from "react";
import { useSetTypedName } from "./YouAvatar";
import s from "./ClaimBox.module.css";

type Check = { state: "empty" } | { state: "checking" } | { state: "done"; available: boolean; error?: string };

interface Props {
  domain: string;
  className?: string;
  /** The name already in the box: /preview suggests one from the CV. */
  initial?: string;
  /** Under the box while it's empty. */
  hint?: string;
  /** The address as a text field above the button, with a pencil: /preview's panel, where it comes filled in. */
  field?: boolean;
}

/** "https:// [yourname] .devtag.io [Claim →]": checks the name as you type, then goes to sign-up. */
export function ClaimBox({
  domain,
  className = "",
  initial = "",
  hint = "Pick your address, then fill in the page.",
  field = false,
}: Props) {
  const [name, setName] = useState(initial);
  const [check, setCheck] = useState<Check>({ state: "empty" });
  const input = useRef<HTMLInputElement>(null);
  // On the landing, the profile picture at the top shows the initials of what's typed here.
  const setTypedName = useSetTypedName();

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
    <div className={`${s.wrap} ${field ? s.field : ""} ${className}`}>
      <form
        className={s.box}
        data-available={available || undefined}
        onSubmit={(e) => {
          e.preventDefault();
          // The button never looks disabled: without a free name, it sends you to the field.
          if (available) window.location.href = `/login?username=${encodeURIComponent(name)}`;
          else input.current?.focus();
        }}
      >
        <label className={s.address}>
          <span className={s.protocol}>https://</span>
          <input
            ref={input}
            value={name}
            // As wide as the text (monospace), so the name and the domain read as one address.
            style={{ width: `calc(${(name || "yourname").length}ch + 2px)` }}
            maxLength={30}
            placeholder="yourname"
            aria-label="Your name"
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              const next = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
              setName(next);
              setTypedName?.(next);
            }}
          />
          <span className={s.domain}>.{domain}</span>
          {field && (
            <svg
              className={s.edit}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          )}
        </label>
        <button className={s.button}>Claim it →</button>
      </form>
      <p
        className={s.status}
        data-state={check.state === "done" ? (available ? "ok" : "no") : check.state}
        aria-live="polite"
      >
        {check.state === "empty" && hint}
        {check.state === "checking" && "checking…"}
        {check.state === "done" && (available ? `✓ ${name}.${domain} is free` : check.error)}
      </p>
    </div>
  );
}
