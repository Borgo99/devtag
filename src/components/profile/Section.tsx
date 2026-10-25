import type { ReactNode } from "react";
import s from "./Section.module.css";

interface Props {
  id: string;
  index: number;
  /** Terminal-style line above the title, e.g. "cat experience.log". */
  command: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, index, command, title, children }: Props) {
  return (
    <section id={id} className={s.section}>
      <header className={`${s.header} reveal`}>
        <p className={s.command}>
          <span className={s.index}>{String(index).padStart(2, "0")}</span>
          <span className={s.dollar}>$</span> {command}
        </p>
        <h2 className={s.title}>{title}</h2>
      </header>
      {children}
    </section>
  );
}
