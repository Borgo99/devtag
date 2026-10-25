"use client";

import { useEffect, useRef, useState } from "react";
import s from "./DemoFrame.module.css";

const WIDTH = 1280;
const HEIGHT = 800;
const STEP = 3500; // ms on each section

/**
 * The demo profile in a browser window, drawn at desktop size and scaled to fit. While it is on
 * screen it tours the page section by section. It's a picture you can't scroll; a click opens the real page.
 * `src` must be on this site (the tour scrolls the frame), `href` is the page's public address.
 */
export function DemoFrame({ src, href, address }: { src: string; href: string; address: string }) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = box.current!;
    const resize = new ResizeObserver(() => setScale(el.clientWidth / WIDTH));
    resize.observe(el);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    if (!scale || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, [scale]);

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
      <div ref={box} className={s.box} style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
        {scale > 0 && (
          <iframe
            ref={frame}
            src={src}
            title="Demo profile page"
            loading="lazy"
            tabIndex={-1}
            style={{ width: WIDTH, height: HEIGHT, scale: String(scale) }}
          />
        )}
      </div>
      {/* The whole window is the link. */}
      <a href={href} target="_blank" rel="noopener noreferrer" className={s.cover} aria-label="Open the demo page" />
    </div>
  );
}
