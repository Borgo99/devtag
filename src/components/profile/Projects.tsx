import type { CSSProperties } from "react";
import type { Project } from "@/lib/types";
import { projectPath } from "@/lib/projects";
import { StackList } from "./StackList";
import s from "./Projects.module.css";

const ICONS = {
  folder: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
  code: "m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14",
  external: "M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4",
};

function Icon({ d }: { d: string }) {
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

export function Projects({ projects, base }: { projects: Project[]; base: string }) {
  return (
    <ul className={s.grid}>
      {projects.map((project, i) => (
        <li
          key={project.name}
          className={`${s.card} reveal`}
          style={{ "--delay": `${(i % 2) * 80}ms` } as CSSProperties}
        >
          <div className={s.top}>
            <span className={s.folder}>
              <Icon d={ICONS.folder} />
            </span>
            <div className={s.actions}>
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${project.name} source code`}
                >
                  <Icon d={ICONS.code} />
                </a>
              )}
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${project.name} website`}>
                  <Icon d={ICONS.external} />
                </a>
              )}
            </div>
          </div>

          <h3 className={s.name}>
            {/* The whole card opens the project page; the icons above go to the live site / code. */}
            <a href={projectPath(project, base)} className={s.stretched}>
              {project.name}
            </a>
          </h3>
          <p className={s.description}>{project.description}</p>

          <div className={s.bottom}>
            {project.stack && project.stack.length > 0 && <StackList items={project.stack} />}
            {project.year && <span className={s.year}>{project.year}</span>}
          </div>
        </li>
      ))}
    </ul>
  );
}
