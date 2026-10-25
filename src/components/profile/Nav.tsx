"use client";

import { useEffect, useRef, useState } from "react";
import s from "./Nav.module.css";

interface Props {
  initials: string;
  links: { id: string; label: string }[];
}

/** Sticky menu: slides in after the hero and highlights the section being read. */
export function Nav({ initials, links }: Props) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState<string>();
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // The active section is the one crossing the middle of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );
    for (const { id } of links) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [links]);

  // On small screens the links scroll sideways: keep the active one in view.
  useEffect(() => {
    const el = list.current;
    const link = el?.querySelector<HTMLElement>("[aria-current]");
    if (!el || !link || el.scrollWidth <= el.clientWidth) return;
    el.scrollTo({ left: link.offsetLeft - el.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <header className={s.nav} data-visible={visible || undefined} inert={!visible}>
      <div className={s.bar}>
        <a href="#" className={s.logo} aria-label="Back to top">
          {initials}
          <span className={s.cursor}>_</span>
        </a>
        <nav className={s.menu} aria-label="Sections">
          <ul ref={list} className={s.links}>
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className={s.link} aria-current={active === link.id ? "location" : undefined}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
