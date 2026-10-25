"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import s from "./Preview.module.css";

const DESKTOP = 1280;
const PHONE = 390;

/**
 * The draft as visitors will see it (/admin/preview), reloaded after every save. Desktop is drawn
 * at 1280px and scaled down to fit; phone at its real width.
 */
export function Preview({ version, address }: { version: number; address: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [chosen, setMode] = useState<"desktop" | "phone">();
  // Until one is picked: phone when the pane is too narrow for a readable desktop.
  const mode = chosen ?? (size.width < 700 ? "phone" : "desktop");

  useLayoutEffect(() => {
    const el = box.current!;
    const observer = new ResizeObserver(() => setSize({ width: el.clientWidth, height: el.clientHeight }));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reload on save, then put the visitor back where they were reading.
  useEffect(() => {
    const win = frame.current?.contentWindow;
    if (!version || !win) return;
    const y = win.scrollY;
    frame.current!.addEventListener(
      "load",
      () => frame.current?.contentWindow?.scrollTo({ top: y, behavior: "instant" }),
      {
        once: true,
      },
    );
    win.location.reload();
  }, [version]);

  const scale = mode === "desktop" ? Math.min(1, size.width / DESKTOP) : 1;
  const style: CSSProperties =
    mode === "desktop"
      ? { width: DESKTOP, height: size.height / scale, scale: String(scale) }
      : { width: Math.min(PHONE, size.width), height: size.height };

  return (
    <div className={s.preview}>
      <div className={s.bar}>
        <span className={s.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className={s.address}>{address}</span>
        <span className={s.draft}>draft</span>
        <div className={s.modes} role="group" aria-label="Preview size">
          {(["desktop", "phone"] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
              {m}
            </button>
          ))}
        </div>
      </div>
      <div ref={box} className={s.box} data-mode={mode}>
        {size.width > 0 && <iframe ref={frame} src="/admin/preview" title="Preview of your page" style={style} />}
      </div>
    </div>
  );
}
