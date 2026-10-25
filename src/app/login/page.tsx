import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Background } from "@/components/profile/Background";
import { sample } from "@/components/landing/sample";
import { currentAccount } from "@/lib/session";
import { DISPLAY_DOMAIN } from "@/lib/site";
import { GoogleButton } from "./GoogleButton";
import s from "./login.module.css";

export const metadata: Metadata = { title: "Sign in — devtag", robots: { index: false } };

interface Props {
  /** `username`: the name typed in a claim box. `error`: set by Better Auth when Google sign-in fails. */
  searchParams: Promise<{ username?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { username = "", error } = await searchParams;
  const welcome = `/welcome${username ? `?${new URLSearchParams({ username })}` : ""}`;

  const account = await currentAccount();
  if (account) redirect(account.profile ? "/admin" : welcome);

  return (
    <>
      <Background config={sample} />
      <main className={s.page}>
        <a href="/" className={s.logo}>
          devtag<span className={s.cursor}>_</span>
        </a>

        <div className={s.card}>
          <div className={s.bar} aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <p className={s.command}>
            <span className={s.dollar}>$</span> devtag login
          </p>

          <h1 className={s.heading}>
            {username ? (
              <>
                Claim <span className={s.address}>{`${username}.${DISPLAY_DOMAIN}`}</span>
              </>
            ) : (
              "Sign in to your page"
            )}
          </h1>
          <p className={s.hint}>New here? Signing in creates your account; you pick your address next.</p>

          <GoogleButton callbackURL={welcome} />
          {error && <p className={s.error}>Google sign-in didn&apos;t work ({error}). Try again.</p>}

          <p className={s.note}>We only get your name and email from Google, and never post anything.</p>
        </div>
      </main>
    </>
  );
}
