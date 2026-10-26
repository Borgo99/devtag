import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Background } from "@/components/profile/Background";
import { sample } from "@/components/landing/sample";
import { enabledProviders } from "@/lib/auth";
import { currentAccount } from "@/lib/session";
import { DISPLAY_DOMAIN } from "@/lib/site";
import { SignInButtons } from "./SignInButtons";
import { LogoMark } from "@/components/site/LogoMark";
import s from "./login.module.css";

export const metadata: Metadata = { title: "Sign in — devtag", robots: { index: false } };

interface Props {
  /** `username`: the name typed in a claim box. `error`: set by Better Auth when sign-in fails. */
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
          <LogoMark />
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

          <SignInButtons providers={enabledProviders} callbackURL={welcome} />
          {error && <p className={s.error}>Sign-in didn&apos;t work ({error}). Try again.</p>}

          <p className={s.note}>
            We only get your name, email and picture, and never post anything. By signing in you accept the{" "}
            <a href="/terms">terms</a> and the <a href="/privacy">privacy policy</a>.
          </p>
        </div>
      </main>
    </>
  );
}
