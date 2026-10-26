import type { PortfolioConfig, Project } from "@/lib/types";
import { projectPath, projectSlug } from "@/lib/projects";
import { initials, paragraphs } from "@/lib/text";
import { themeVars } from "@/lib/theme";
import { Background } from "./Background";
import { StackList } from "./StackList";
import { Footer } from "./Footer";
import s from "./ProjectPage.module.css";

interface Props {
  config: PortfolioConfig;
  project: Project;
  /** See ProfilePage. */
  base: string;
}

/** One page per project, with its own shareable URL and link preview: /projects/<slug> */
export function ProjectPage({ config, project, base }: Props) {
  const slug = projectSlug(project);
  const others = (config.projects ?? []).filter((p) => p !== project);
  const links = [
    project.url && { href: project.url, label: "Live" },
    project.repo && { href: project.repo, label: "Source code" },
  ].filter((link) => !!link);
  // The screenshot, or the preview image read from the live site (lib/portfolio.ts explains the check).
  const image = project.image ?? (project.site?.url === project.url ? project.site?.image : undefined);

  return (
    <div style={themeVars(config)}>
      <Background config={config} />

      <header className={s.top}>
        <a href={base || "/"} className={s.logo} aria-label="Home">
          {initials(config.profile.name)}
          <span className={s.cursor}>_</span>
        </a>
        <a href={`${base || "/"}#projects`} className={s.back}>
          ← cd ..
        </a>
      </header>

      <main className={s.page}>
        <p className={s.command}>
          <span className={s.dollar}>$</span> cat projects/{slug}.md
        </p>
        <h1 className={s.title}>{project.name}</h1>
        <p className={s.lead}>{project.description}</p>

        {(project.year || (project.stack?.length ?? 0) > 0) && (
          <div className={s.meta}>
            {project.year && <span className={s.year}>{project.year}</span>}
            {project.stack && project.stack.length > 0 && <StackList items={project.stack} />}
          </div>
        )}

        {links.length > 0 && (
          <div className={s.links}>
            {links.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={s.button}>
                {link.label} <span aria-hidden>↗</span>
              </a>
            ))}
          </div>
        )}

        {image && <img className={s.image} src={image} alt={`Screenshot of ${project.name}`} />}

        {project.highlights && project.highlights.length > 0 && (
          <ul className={s.highlights}>
            {project.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        )}

        {project.details && (
          <div className={s.details}>
            {paragraphs(project.details).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}

        {others.length > 0 && (
          <nav className={s.more} aria-label="Other projects">
            <h2 className={s.moreTitle}>More projects</h2>
            <ul className={s.others}>
              {others.map((other) => (
                <li key={other.name}>
                  <a href={projectPath(other, base)} className={s.other}>
                    <span className={s.otherName}>{other.name}</span>
                    <span className={s.otherDesc}>{other.description}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>

      <Footer name={config.profile.name} />
    </div>
  );
}
