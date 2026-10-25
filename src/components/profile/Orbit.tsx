"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { ResolvedSkill } from "@/lib/icons";
import { orbitLayout } from "@/lib/orbit";
import { SkillIcon } from "./SkillIcon";
import s from "./Orbit.module.css";

/**
 * Skill icons orbiting the avatar on tilted ellipses. Ring sizes come from CSS
 * (see Orbit.module.css); this component only moves the icons along them. Icons
 * on the near half of a ring pass in front of the avatar, the others behind it.
 * The first `topCount` skills are the top skills: inner ring, bigger icons.
 */

const easeOut = (x: number) => 1 - (1 - x) ** 3;

export function Orbit({ skills, topCount }: { skills: ResolvedSkill[]; topCount: number }) {
  const root = useRef<HTMLDivElement>(null);
  const rings = useMemo(() => orbitLayout(topCount, skills.length - topCount), [topCount, skills.length]);

  useEffect(() => {
    const el = root.current!;
    const ringEls = [...el.querySelectorAll<HTMLElement>(`.${s.ring}`)];
    const items = [...el.querySelectorAll<HTMLElement>(`.${s.item}`)];
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => ringEls.map((r) => ({ rx: r.offsetWidth / 2, ry: r.offsetHeight / 2 }));
    let radii = measure();

    const pointer = { x: 0, y: 0 };
    const offset = { x: 0, y: 0 };
    let hovering = false;
    let speed = 1;
    let t = 0;
    const start = performance.now();
    let last = start;
    let raf = 0;

    function draw(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      speed += ((hovering ? 0 : 1) - speed) * 0.08; // ease to a stop while an icon is hovered
      t += dt * speed;
      offset.x += (pointer.x * 28 - offset.x) * 0.05; // gentle parallax towards the mouse
      offset.y += (pointer.y * 18 - offset.y) * 0.05;
      const intro = reduced ? 1 : easeOut(Math.min(1, (now - start) / 1800));

      for (const ring of ringEls) {
        ring.style.translate = `calc(-50% + ${offset.x}px) calc(-50% + ${offset.y}px)`;
      }

      items.forEach((item, i) => {
        const r = Number(item.dataset.ring);
        const ring = rings[r];
        const { rx, ry } = radii[r];
        const direction = r % 2 ? -1 : 1;
        const angle = (Number(item.dataset.slot) / ring.n + direction * (t / ring.lap) + r * 0.13) * Math.PI * 2;
        const tilt = (ring.tilt * Math.PI) / 180;
        const ex = Math.cos(angle) * rx * intro;
        const ey = Math.sin(angle) * ry * intro;
        const depth = Math.sin(angle); // 1 = closest to the viewer, -1 = farthest
        const near = (depth + 1) / 2; // same, as 0…1

        const x = ex * Math.cos(tilt) - ey * Math.sin(tilt) + offset.x;
        const y = ex * Math.sin(tilt) + ey * Math.cos(tilt) + offset.y + (reduced ? 0 : Math.sin(t * 0.9 + i) * 3);
        // Far icons are only slightly smaller and dimmer: enough depth, still clearly readable.
        const scale = (0.8 + 0.2 * near) * (0.4 + 0.6 * intro);

        item.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        item.style.opacity = ((0.8 + 0.2 * near) * intro).toFixed(3);
        item.style.zIndex = depth > 0 && intro > 0.6 ? "3" : "1";
      });
    }

    function tick(now: number) {
      draw(now);
      raf = requestAnimationFrame(tick);
    }

    // Only animate while the hero is on screen.
    const visibility = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (reduced) draw(performance.now());
      else if (entry.isIntersecting) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    visibility.observe(ringEls[ringEls.length - 1]);

    const resize = new ResizeObserver(() => {
      radii = measure();
      if (reduced) draw(performance.now());
    });
    ringEls.forEach((r) => resize.observe(r));

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX / innerWidth - 0.5;
      pointer.y = e.clientY / innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move, { passive: true });

    const enter = () => (hovering = true);
    const leave = () => (hovering = false);
    for (const item of items) {
      item.addEventListener("pointerenter", enter);
      item.addEventListener("pointerleave", leave);
    }

    return () => {
      cancelAnimationFrame(raf);
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener("pointermove", move);
      for (const item of items) {
        item.removeEventListener("pointerenter", enter);
        item.removeEventListener("pointerleave", leave);
      }
    };
  }, [rings]);

  return (
    <div ref={root} className={s.orbit} aria-hidden>
      {rings.map((ring, r) => (
        <div
          key={r}
          className={s.ring}
          style={{ "--size": ring.size, "--lift": ring.lift, rotate: `${ring.tilt}deg` } as CSSProperties}
        />
      ))}
      {rings.flatMap((ring, r) =>
        skills.slice(ring.start, ring.start + ring.n).map((skill, slot) => (
          <div key={`${r}-${slot}`} className={s.item} data-ring={r} data-slot={slot} data-top={ring.top || undefined}>
            <span className={s.chip}>
              <SkillIcon skill={skill} />
            </span>
            <span className={s.label}>{skill.name}</span>
          </div>
        )),
      )}
    </div>
  );
}
