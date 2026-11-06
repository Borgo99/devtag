"use client";

import { useEffect, useRef, useState } from "react";
import s from "./DemoFrame.module.css";

/** The size the page is drawn at. The window's shape matches it in DemoFrame.module.css. */
const DESKTOP = { width: 1280, height: 800 };
/** On phones a scaled-down desktop page is unreadable: draw the page as a phone shows it. */
const PHONE = { width: 390, height: 680 };
const PHONE_QUERY = "(max-width: 640px)"; // same as DemoFrame.module.css
const STEP = 3500; // ms on each section

/**
 * The demo profile in a browser window, drawn at desktop (or phone) size and scaled to fit. While it is on
 * screen it tours the page section by section. It's a picture you can't scroll; a click opens the real page.
 * `src` must be on this site (the tour scrolls the frame), `href` is the page's public address.
 */
export function DemoFrame({ src, href, address }: { src: string; href: string; address: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [view, setView] = useState<{ width: number; height: number; scale: number }>();

  useEffect(() => {
    const el = box.current!;
    const resize = new ResizeObserver(() => {
      const size = matchMedia(PHONE_QUERY).matches ? PHONE : DESKTOP;
      setView({ ...size, scale: el.clientWidth / size.width });
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    if (!view || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let step = 0;
    const tour = () => {
      const win = frame.current?.contentWindow;
      const stops = [
        0,
        ...[...(win?.document.querySelectorAll<HTMLElement>("main > section[id]") ?? [])].map((el) => el.offsetTop),
      ];
      step = (step + 1) % Math.min(stops.length, 6);
      win?.scrollTo({ top: stops[step], behavior: "smooth" });
    };
    const visible = new IntersectionObserver(([entry]) => {
      clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(tour, STEP);
    });
    visible.observe(box.current!);
    return () => {
      clearInterval(timer);
      visible.disconnect();
    };
  }, [view]);

  return (
    <div className={s.window}>
      <div className={s.bar} aria-hidden>
        <span className={s.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={s.address}>{address}</span>
        <span className={s.open}>open ↗</span>
      </div>
      <div ref={box} className={s.box}>
        {view && (
          <iframe
            ref={frame}
            src={src}
            title="Demo profile page"
            loading="lazy"
            tabIndex={-1}
            style={{ width: view.width, height: view.height, scale: String(view.scale) }}
          />
        )}
      </div>
      {/* The whole window is the link. */}
      <a href={href} target="_blank" rel="noopener noreferrer" className={s.cover} aria-label="Open the demo page" />
    </div>
  );
}
