import { initials } from "@/lib/text";
import s from "./Avatar.module.css";

/**
 * Round profile picture with a spinning gradient halo. Without an image it shows "AB_" in terminal style.
 * `open`: open to work, the halo turns green and carries a tag.
 */
export function Avatar({ name, image, open = false }: { name: string; image?: string; open?: boolean }) {
  return (
    <div className={s.avatar} data-open={open || undefined}>
      <div className={s.halo} />
      <div className={s.face}>
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span className={s.fallback} role="img" aria-label={name}>
            {initials(name)}
            <span className={s.cursor}>_</span>
          </span>
        )}
      </div>
      {open && (
        <span className={s.tag} aria-hidden>
          open to work
        </span>
      )}
    </div>
  );
}
