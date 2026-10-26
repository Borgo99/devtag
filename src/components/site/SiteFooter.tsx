import { DEMO } from "@/lib/profiles";
import { COMPANY, REPO_URL, profileUrl } from "@/lib/site";
import { LogoMark } from "./LogoMark";
import s from "./SiteFooter.module.css";

/** The main site's footer (landing, companies and legal pages). Profile pages have their own. */

const COLUMNS = [
  {
    title: "product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Demo", href: profileUrl(DEMO) },
      { label: "Claim your page", href: "/#claim" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "companies",
    links: [
      { label: "For companies", href: "/companies" },
      { label: "Contact us", href: `mailto:${COMPANY.email}` },
    ],
  },
  {
    title: "open-source",
    links: [
      { label: "Source code", href: REPO_URL },
      { label: "License (AGPL-3.0)", href: `${REPO_URL}/blob/main/LICENSE` },
      { label: "Report a vulnerability", href: `${REPO_URL}/security/advisories/new` },
    ],
  },
  {
    title: "legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.top}>
        <div className={s.brand}>
          {/* "#top" scrolls to the top on the landing, and leads there from other pages. */}
          <a href="/#top" className={s.logo}>
            <LogoMark />
            devtag<span className={s.cursor}>_</span>
          </a>
          <p>Your portfolio in two minutes.</p>
          <p>Made in Italy by {COMPANY.name}.</p>
        </div>

        <nav className={s.columns} aria-label="Footer">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className={s.title}>
                <span className={s.path}>~/</span>
                {column.title}
              </p>
              <ul className={s.links}>
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <p className={s.company}>
        © {new Date().getFullYear()} {COMPANY.name}
      </p>
    </footer>
  );
}
