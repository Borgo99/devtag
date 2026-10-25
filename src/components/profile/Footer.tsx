import { SITE_URL } from "@/lib/site";
import s from "./Footer.module.css";

export function Footer({ name }: { name: string }) {
  return (
    <footer className={s.footer}>
      <a href="#" className={s.top}>
        <span className={s.dollar}>$</span> cd ~
      </a>
      <p>
        © {new Date().getFullYear()} {name}
      </p>
      {/* Every page advertises the site. */}
      <a href={SITE_URL} className={s.built}>
        built with <span className={s.brand}>devtag</span>
        <span className={s.cursor}>_</span>
      </a>
    </footer>
  );
}
