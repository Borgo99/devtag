"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { initials } from "@/lib/text";
import avatar from "@/components/profile/Avatar.module.css";
import s from "./YouAvatar.module.css";

/** The address being typed in a claim box, shared with the profile picture at the top of the landing. */
const Typed = createContext<{ name: string; setName: (name: string) => void } | null>(null);

export function TypedNameProvider({ children, initial = "" }: { children: ReactNode; initial?: string }) {
  const [name, setName] = useState(initial);
  return <Typed.Provider value={{ name, setName }}>{children}</Typed.Provider>;
}

/** For the claim boxes; undefined outside the landing. */
export const useSetTypedName = () => useContext(Typed)?.setName;

/** The address being typed; "" outside the landing and /preview. */
export const useTypedName = () => useContext(Typed)?.name ?? "";

/**
 * The landing's profile picture: a silhouette (or the initials of `name`), then the initials of the address
 * being typed ("andrea-rossi" → "AR_"), the way a page without a photo shows them.
 */
export function YouAvatar({ name }: { name?: string }) {
  const words = (useContext(Typed)?.name ?? "").replace(/-+/g, " ").trim() || name;

  if (!words)
    return (
      <span className={`${avatar.fallback} ${s.empty}`} role="img" aria-label="Your photo">
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="9.6" r="4.3" />
          <path d="M3.2 36V25.5c0-5.4 3.9-9.3 8.8-9.3s8.8 3.9 8.8 9.3V36z" />
        </svg>
      </span>
    );

  return (
    <span className={`${avatar.fallback} ${s.initials}`} role="img" aria-label={words}>
      {initials(words)}
      <span className={avatar.cursor}>_</span>
    </span>
  );
}

/** "yourname.devtag.io", with the address being typed in place of "yourname". */
export function TypedAddress({ domain }: { domain: string }) {
  return (
    <>
      <b>{useContext(Typed)?.name || "yourname"}</b>.{domain}
    </>
  );
}
