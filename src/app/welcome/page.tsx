import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Background } from "@/components/profile/Background";
import { sample } from "@/components/landing/sample";
import { currentAccount } from "@/lib/session";
import { DISPLAY_DOMAIN } from "@/lib/site";
import { claimAction } from "./actions";
import s from "../login/login.module.css";

/** After the first sign-in: the user picks the address of their page. */

export const metadata: Metadata = { title: "Pick your address — devtag", robots: { index: false } };

interface Props {
  searchParams: Promise<{ username?: string; error?: string }>;
}

export default async function WelcomePage({ searchParams }: Props) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (account.profile) redirect("/admin");

  const { username = "", error } = await searchParams;
  const firstName = account.user.name?.split(" ")[0];

  return (
    <>
      <Background config={sample} />
      <main className={s.page}>
        <a href="/" className={s.logo}>
          devtag<span className={s.cursor}>_</span>
        </a>

        <form action={claimAction} className={s.card}>
          <div className={s.bar} aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className={s.command}>
            <span className={s.dollar}>$</span> devtag init
          </p>

          <h1 className={s.heading}>{firstName ? `Welcome, ${firstName}!` : "Welcome!"}</h1>
          <label className={s.label} htmlFor="username">
            Pick the address of your page
          </label>
          <div className={s.field} data-invalid={error ? true : undefined}>
            <input
              id="username"
              name="username"
              defaultValue={username}
              placeholder="yourname"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              required
              autoFocus
            />
            <span className={s.domain}>.{DISPLAY_DOMAIN}</span>
          </div>
          <p className={error ? s.error : s.hint}>{error ?? "Lowercase letters, numbers and dashes."}</p>

          <button className={s.submit}>Claim it →</button>
        </form>
      </main>
    </>
  );
}
