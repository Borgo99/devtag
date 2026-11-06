import { TypedAddress } from "./YouAvatar";
import s from "./BeforeAfter.module.css";

/**
 * One of the landing heroes: Nora's CV next to the page made from it, as in the ads. The address bar shows
 * the name typed in the claim box. Images in public/landing: the page is a screenshot of devtag.io/demo
 * (1440×900), the CV is the one in the ads. Nora is made up.
 */
export function BeforeAfter({ domain }: { domain: string }) {
  return (
    <div className={s.picture} role="img" aria-label="A CV next to the portfolio page made from it">
      <div className={s.window}>
        <div className={s.bar}>
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.address}>
            <TypedAddress domain={domain} />
          </span>
        </div>
        <img
          className={s.shot}
          src="/landing/nora-page-1280.webp"
          srcSet="/landing/nora-page-720.webp 720w, /landing/nora-page-1280.webp 1280w"
          sizes="(max-width: 860px) 100vw, 640px"
          width={1280}
          height={800}
          fetchPriority="high"
          alt=""
        />
      </div>
      <img className={s.cv} src="/landing/nora-cv.webp" width={420} height={594} alt="" />
      <svg className={s.arrow} viewBox="0 0 60 60" fill="none" aria-hidden>
        <defs>
          <linearGradient id="before-after-arrow" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent2)" />
          </linearGradient>
        </defs>
        <path
          d="M6 8 C 34 8, 50 22, 50 48 M38 38 L 50 50 L 58 36"
          stroke="url(#before-after-arrow)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
