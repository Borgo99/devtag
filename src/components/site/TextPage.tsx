import type { ReactNode } from "react";
import { Background } from "@/components/profile/Background";
import { sample } from "@/components/landing/sample";
import landing from "@/components/landing/Landing.module.css";
import { LogoMark } from "./LogoMark";
import { SiteFooter } from "./SiteFooter";
import s from "./TextPage.module.css";

/** The main site's text pages (companies, privacy, terms): the landing's top bar, a column of text, the footer. */
export function TextPage({ command, title, children }: { command: string; title: string; children: ReactNode }) {
  return (
    <>
      <Background config={sample} />
      <header className={landing.nav}>
        <a href="/" className={landing.logo}>
          <LogoMark />
          devtag<span className={landing.cursor}>_</span>
        </a>
        <span className={s.spacer} />
        <a href="/login" className={landing.signIn}>
          Sign in
        </a>
        <a href="/#claim" className={landing.cta}>
          Claim your page
        </a>
      </header>

      <main className={s.page}>
        <p className={s.command}>
          <span className={s.dollar}>$</span> {command}
        </p>
        <h1 className={s.title}>{title}</h1>
        {children}
      </main>

      <SiteFooter />
    </>
  );
}
