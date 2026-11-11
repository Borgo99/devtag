import type { CSSProperties } from "react";
import { resolveSkill } from "@/lib/icons";
import { orbitLayout } from "@/lib/orbit";
import { orbitSkills } from "@/lib/skills";
import { DEMO } from "@/lib/profiles";
import demo from "@/demo/config";
import { DISPLAY_DOMAIN, REPO_URL, profileUrl } from "@/lib/site";
import { Background } from "@/components/profile/Background";
import { Orbit } from "@/components/profile/Orbit";
import { Section } from "@/components/profile/Section";
import { SkillIcon } from "@/components/profile/SkillIcon";
import { RevealObserver } from "@/components/profile/RevealObserver";
import { BeforeAfter } from "@/components/landing/BeforeAfter";
import { ClaimBox } from "@/components/landing/ClaimBox";
import { DemoFrame } from "@/components/landing/DemoFrame";
import { TryCv } from "@/components/landing/TryCv";
import { HiringData } from "@/components/landing/HiringData";
import { TypedNameProvider, YouAvatar } from "@/components/landing/YouAvatar";
import { sample } from "@/components/landing/sample";
import { SiteFooter } from "@/components/site/SiteFooter";
import { LogoMark } from "@/components/site/LogoMark";
import { VisitBeacon } from "@/components/site/VisitBeacon";
import hero from "@/components/profile/Hero.module.css";
import avatar from "@/components/profile/Avatar.module.css";
import s from "@/components/landing/Landing.module.css";

/** The landing page: a hero that shows what you get, then how, why, a demo and the features. */

/**
 * Which hero to show, to compare designs:
 * - "empty-orbit": skills orbiting a silhouette, which turns into the initials of the name being typed
 * - "filled-orbit": Nora's skills orbiting her initials (open to work), with her CV beside them
 * - "before-after": Nora's CV next to the page made from it, as in the ads
 */
const HERO: "empty-orbit" | "filled-orbit" | "before-after" = "before-after";

const TAGLINE = "stand out to recruiters";

const STROKE = {
  page: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4",
  share: "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v14",
  globe:
    "M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3zM12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  palette:
    "M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5c0-4-4-7.2-9-7.2zM7.5 12.5h.01M9.5 8h.01M14.5 8h.01",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
};

function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

export default function Landing() {
  const filled = HERO === "filled-orbit";
  const orbit = orbitSkills(filled ? demo : sample);
  const top = orbit.top.map(resolveSkill);
  const rest = orbit.rest.map(resolveSkill);
  const outerRing = orbitLayout(top.length, rest.length).at(-1)!;
  const logos = ["TypeScript", "Kubernetes", "Go", "Python", "Rust", "PostgreSQL", "Swift"].map(resolveSkill);
  const you = `you.${DISPLAY_DOMAIN}`;

  // The words of the ads first: what you drop, what you get, that it's free.
  const copy = (
    <>
      <p className={`${hero.role} ${s.tagline}`}>
        <span className={hero.prompt} aria-hidden>
          &gt;
        </span>
        <span className={hero.typed} style={{ "--chars": TAGLINE.length } as CSSProperties}>
          {TAGLINE}
        </span>
        <span className={hero.caret} aria-hidden />
      </p>
      <h1 className={s.title}>
        <span className={s.nowrap}>Drop your CV.</span> <span className={s.grad}>Get a cool website.</span>
      </h1>
      <p className={s.lead}>
        See it filled in from your PDF before you sign up. Like it? Claim <strong>{you}</strong>.
      </p>
      <TryCv className={s.claim} />
      <p className={s.trust}>
        Free and{" "}
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          open source ↗
        </a>{" "}
        · <a href="#demo">see an example ↓</a>
      </p>
    </>
  );

  return (
    <>
      <Background config={sample} />

      <header className={s.nav}>
        <a href="#" className={s.logo} aria-label="devtag, back to top">
          <LogoMark />
          devtag<span className={s.cursor}>_</span>
        </a>
        <nav className={s.menu} aria-label="Sections">
          <a href="#how">How it works</a>
          <a href="#why">Why</a>
          <a href="#demo">Demo</a>
          <a href="#features">Features</a>
          <a href="/companies">For companies</a>
        </nav>
        <a href="/login" className={s.signIn}>
          Sign in
        </a>
        <a href="#claim" className={s.cta}>
          Claim your page
        </a>
      </header>

      <TypedNameProvider>
        <main>
          {HERO === "before-after" ? (
            <section className={s.split}>
              <div className={s.splitCopy} id="claim">
                {copy}
              </div>
              <BeforeAfter domain={DISPLAY_DOMAIN} />
            </section>
          ) : (
            <section className={`${hero.hero} ${s.hero}`} style={{ "--lift-max": outerRing.lift } as CSSProperties}>
              <div className={hero.center}>
                <Orbit skills={[...top, ...rest]} topCount={top.length} />
                <div className={avatar.avatar} data-open={filled || undefined}>
                  <div className={avatar.halo} />
                  <div className={avatar.face}>
                    <YouAvatar name={filled ? demo.profile.name : undefined} />
                  </div>
                  {filled && (
                    <span className={avatar.tag} aria-hidden>
                      open to work
                    </span>
                  )}
                </div>
                {filled && (
                  <span className={s.cvChip} aria-hidden>
                    <img src="/landing/nora-cv.webp" width={420} height={594} alt="" />
                    <svg viewBox="0 0 40 30" fill="none">
                      <path
                        d="M3 6 C 18 2, 30 8, 35 22 M27 18 L 35 24 L 38 14"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </div>

              <div className={hero.below}>
                <div className={`${hero.identity} ${s.identity}`} id="claim">
                  {copy}
                </div>
              </div>
            </section>
          )}

          <Section id="how" index={1} command="devtag import cv.pdf" title="From PDF to page in one minute">
            <ol className={s.steps}>
              <li className={`${s.step} reveal`}>
                <div className={`${s.visual} ${s.dropVisual}`} aria-hidden>
                  <span className={s.zone}>drop your CV here</span>
                  <span className={s.file}>
                    <b>PDF</b>
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
                <h3>Drop your CV</h3>
                <p>
                  Any PDF with text, sidebars and two-column layouts included. Your browser reads it; the file stays
                  with you.
                </p>
              </li>
              <li className={`${s.step} reveal`} style={{ "--delay": "80ms" } as CSSProperties}>
                <div className={`${s.visual} ${s.term}`} aria-hidden>
                  <p>
                    <span className={s.dollar}>$</span> devtag import cv.pdf
                  </p>
                  <p className={s.line}>✓ 2 pages · two columns</p>
                  <p className={s.line}>✓ 4 jobs · 2 degrees</p>
                  <p className={s.line}>✓ 18 skills · 6 projects</p>
                </div>
                <h3>Your page fills itself in</h3>
                <p>An AI sorts the text into jobs, projects, education and skills, and every skill finds its logo.</p>
              </li>
              <li className={`${s.step} reveal`} style={{ "--delay": "160ms" } as CSSProperties}>
                <div className={`${s.visual} ${s.site}`} aria-hidden>
                  <span className={s.siteBar}>
                    <i />
                    <i />
                    <i />
                    <span>{you}</span>
                  </span>
                  <span className={s.siteBody}>
                    <span className={s.miniAvatar} />
                    <span className={s.miniName} />
                    <span className={s.miniRole} />
                    <span className={s.miniPills}>
                      <i />
                      <i />
                      <i />
                    </span>
                  </span>
                  <span className={s.live}>live</span>
                </div>
                <h3>Check it, then publish</h3>
                <p>Fix anything in the editor with a live preview beside it. One click and it&apos;s online.</p>
              </li>
            </ol>
          </Section>

          <Section
            id="why"
            index={2}
            command="grep portfolio hiring-managers.csv"
            title="Your work speaks louder than your degree"
          >
            <HiringData />
          </Section>

          <Section id="demo" index={3} command={`open demo.${DISPLAY_DOMAIN}`} title="See a page in action">
            <div className="reveal">
              <DemoFrame src={`/${DEMO}`} href={profileUrl(DEMO)} address={`demo.${DISPLAY_DOMAIN}`} />
            </div>
            <p className={s.caption}>
              Nora is made up; the page is real: the same template every profile gets. Click to explore it.
            </p>
          </Section>

          <Section id="features" index={4} command="ls features/" title="Everything a recruiter clicks on">
            <ul className={s.features}>
              <li className={`${s.feature} reveal`}>
                <span className={s.logos} aria-hidden>
                  {logos.map((logo) => (
                    <span key={logo.name}>
                      <SkillIcon skill={logo} />
                    </span>
                  ))}
                </span>
                <h3>3,500+ logos, found by name</h3>
                <p>Type TypeScript, k8s or golang: the logo joins the orbit around your photo.</p>
              </li>
              {[
                {
                  icon: STROKE.page,
                  title: "A page for every project",
                  text: "Each project gets its own link to share, with its stack, highlights and screenshot.",
                },
                {
                  icon: STROKE.share,
                  title: "Link previews that sell",
                  text: "Share your page and it shows a card with your photo, role and top skills.",
                },
                {
                  icon: STROKE.globe,
                  title: `yourname.${DISPLAY_DOMAIN}`,
                  text: "A short address to put on your CV, your GitHub and your LinkedIn.",
                },
                {
                  icon: STROKE.palette,
                  title: "Your colors",
                  text: "Pick two colors: every glow, gradient and preview image follows.",
                },
                {
                  icon: STROKE.bolt,
                  title: "Fast and accessible",
                  text: "Rendered on the server, readable without JavaScript, calm for people who prefer less motion.",
                },
              ].map((feature, i) => (
                <li
                  key={feature.title}
                  className={`${s.feature} reveal`}
                  style={{ "--delay": `${((i + 1) % 3) * 80}ms` } as CSSProperties}
                >
                  <span className={s.icon} aria-hidden>
                    <Glyph d={feature.icon} />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.text}</p>
                </li>
              ))}
            </ul>
          </Section>

          <section className={`${s.final} reveal`}>
            <p className={s.command}>
              <span className={s.dollar}>$</span> whoami
            </p>
            <h2 className={s.finalTitle}>Your name is still free.</h2>
            <ClaimBox domain={DISPLAY_DOMAIN} />
          </section>
        </main>
      </TypedNameProvider>

      <SiteFooter />

      <RevealObserver />
      <VisitBeacon />
    </>
  );
}
