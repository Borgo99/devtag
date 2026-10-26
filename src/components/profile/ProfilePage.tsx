import type { ReactNode } from "react";
import type { PortfolioConfig } from "@/lib/types";
import { resolveSkill } from "@/lib/icons";
import { initials, surname } from "@/lib/text";
import { orbitSkills } from "@/lib/skills";
import { portfolioEntries } from "@/lib/portfolio";
import { themeVars } from "@/lib/theme";
import { Background } from "./Background";
import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Section } from "./Section";
import { About } from "./About";
import { Timeline, jobEntry, educationEntry } from "./Timeline";
import { Portfolio } from "./Portfolio";
import { PortfolioCompact } from "./PortfolioCompact";
import { Projects } from "./Projects";
import { Stack } from "./Stack";
import { Publications } from "./Publications";
import { Footer } from "./Footer";
import { RevealObserver } from "./RevealObserver";

interface SectionDef {
  id: string;
  /** Label in the top menu. */
  nav: string;
  command: string;
  title: string;
  content: ReactNode;
}

interface Props {
  config: PortfolioConfig;
  /** Where the profile's links start: "" on its subdomain, "/andrea" on the main site, "/admin/preview" in the editor. */
  base: string;
}

/** A user's page: the portfolio template, filled from their config. */
export function ProfilePage({ config, base }: Props) {
  const { profile, experience = [], projects = [], stack = [], education = [], publications = [] } = config;
  const orbit = orbitSkills(config);
  const portfolio = portfolioEntries(config, base);

  // Sections without content are skipped; numbering and menu follow what is shown.
  const sections: SectionDef[] = [
    portfolio.length > 0 && {
      id: "portfolio",
      nav: "Portfolio",
      command: "ls ~/portfolio",
      title: "Portfolio",
      content:
        config.portfolioStyle === "large" ? (
          <Portfolio entries={portfolio} />
        ) : (
          <PortfolioCompact entries={portfolio} />
        ),
    },
    profile.about && {
      id: "about",
      nav: "About",
      command: "cat about.md",
      title: "About me",
      content: <About text={profile.about} />,
    },
    experience.length > 0 && {
      id: "experience",
      nav: "Experience",
      command: "cat experience.log",
      title: "Experience",
      content: <Timeline entries={experience.map(jobEntry)} />,
    },
    projects.length > 0 && {
      id: "projects",
      nav: "Projects",
      command: "ls ~/projects",
      title: "Projects",
      content: <Projects projects={projects} base={base} />,
    },
    stack.length > 0 && {
      id: "stack",
      nav: "Stack",
      command: "cat package.json",
      title: "Stack",
      content: <Stack groups={stack} />,
    },
    education.length > 0 && {
      id: "education",
      nav: "Education",
      command: "history | grep study",
      title: "Education",
      content: <Timeline entries={education.map(educationEntry)} />,
    },
    publications.length > 0 && {
      id: "publications",
      nav: "Publications",
      command: "cat publications.bib",
      title: "Publications",
      content: <Publications publications={publications} author={surname(profile.name)} />,
    },
  ].filter((section) => !!section);

  // The theme colors are set here rather than on <html>: the root layout is shared by every page of the site.
  return (
    <div style={themeVars(config)}>
      <Background config={config} />
      <Nav initials={initials(profile.name)} links={sections.map(({ id, nav }) => ({ id, label: nav }))} />
      <main>
        <Hero
          config={config}
          topSkills={orbit.top.map((skill) => resolveSkill(skill))}
          skills={orbit.rest.map((skill) => resolveSkill(skill))}
          next={sections[0]?.id}
        />
        {sections.map((section, i) => (
          <Section key={section.id} id={section.id} index={i + 1} command={section.command} title={section.title}>
            {section.content}
          </Section>
        ))}
      </main>
      <Footer name={profile.name} />
      <RevealObserver />
    </div>
  );
}
