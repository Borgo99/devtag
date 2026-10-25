import type { CSSProperties } from "react";
import type { PortfolioConfig } from "@/lib/types";
import { resolveLink, type ResolvedSkill } from "@/lib/icons";
import { orbitLayout } from "@/lib/orbit";
import { isOpenToWork, levelText, openToWorkDetails } from "@/lib/work";
import { Avatar } from "./Avatar";
import { Orbit } from "./Orbit";
import s from "./Hero.module.css";

interface Props {
  config: PortfolioConfig;
  /** Up to 5, shown bigger on the inner ring. */
  topSkills: ResolvedSkill[];
  skills: ResolvedSkill[];
  /** Id of the first section below, for the scroll hint. */
  next?: string;
}

export function Hero({ config, topSkills, skills, next }: Props) {
  const { profile, languages = [] } = config;
  const links = (config.links ?? []).map(resolveLink);
  const allSkills = [...topSkills, ...skills];
  const outerRing = orbitLayout(topSkills.length, skills.length).at(-1)!;
  const level = levelText(profile);
  const open = isOpenToWork(config);

  return (
    <section className={s.hero} style={{ "--lift-max": outerRing.lift } as CSSProperties}>
      <div className={s.center}>
        <Orbit skills={allSkills} topCount={topSkills.length} />
        <Avatar name={profile.name} image={profile.image} open={open} />
      </div>

      <div className={s.below}>
        <div className={s.identity}>
          <h1 className={s.name}>{profile.name}</h1>

          <p className={s.role}>
            <span className={s.prompt} aria-hidden>
              &gt;
            </span>
            <span className={s.typed} style={{ "--chars": profile.role.length } as CSSProperties}>
              {profile.role}
            </span>
            <span className={s.caret} aria-hidden />
            {level && <span className={s.seniority}>{level}</span>}
          </p>

          {open && (
            <p className={s.open}>
              <span className={s.openDot} aria-hidden />
              <strong className={s.openTitle}>Open to work</strong>
              <span className={s.openDetails}>{openToWorkDetails(config).join(" · ")}</span>
            </p>
          )}

          {links.length > 0 && (
            <ul className={s.links}>
              {links.map((link) => {
                const external = link.href.startsWith("http");
                return (
                  <li key={link.href}>
                    <a
                      className={s.link}
                      href={link.href}
                      aria-label={link.label}
                      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.svg && <span className={s.linkIcon} dangerouslySetInnerHTML={{ __html: link.svg }} />}
                      <span className={s.linkLabel}>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {languages.length > 0 && (
            <ul className={s.languages} aria-label="Spoken languages">
              {languages.map((language, i) => (
                <li key={language.name} className={s.language} style={{ "--i": i } as CSSProperties}>
                  {language.name}
                  <span className={s.level}>{language.level}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* The orbit is decorative and moving; this list is what screen readers and search engines get. */}
      <ul className="sr-only" aria-label="Skills">
        {allSkills.map((skill) => (
          <li key={skill.name}>{skill.name}</li>
        ))}
      </ul>

      {next && (
        <a href={`#${next}`} className={s.scroll} aria-label="Scroll to content">
          <span className={s.mouse} aria-hidden>
            <span className={s.wheel} />
          </span>
          scroll
        </a>
      )}
    </section>
  );
}
