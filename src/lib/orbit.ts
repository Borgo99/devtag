/**
 * Orbit rings around the avatar.
 * size: fraction of the max horizontal radius
 * lift: how far below the avatar the ring's front passes, in icon sizes (keeps rings from colliding)
 * tilt: degrees, same direction for all rings so they never cross · lap: seconds per turn
 * top: ring of the top skills (bigger icons)
 */
interface Ring {
  size: number;
  lift: number;
  tilt: number;
  lap: number;
  top?: boolean;
}

/** Without top skills, by number of rings. */
const PLAIN: Ring[][] = [
  [{ size: 0.8, lift: 0.3, tilt: -6, lap: 70 }],
  [
    { size: 0.58, lift: 0, tilt: 5, lap: 60 },
    { size: 1, lift: 1.05, tilt: 2, lap: 95 },
  ],
  [
    { size: 0.46, lift: 0, tilt: 6, lap: 55 },
    { size: 0.73, lift: 0.9, tilt: 3, lap: 80 },
    { size: 1, lift: 1.8, tilt: 1, lap: 110 },
  ],
];

/** With top skills: they get the inner ring; the others go on one or two outer rings. */
const WITH_TOP: Ring[][] = [
  [
    { size: 0.55, lift: 0.2, tilt: 5, lap: 60, top: true },
    { size: 1, lift: 1.45, tilt: 2, lap: 95 },
  ],
  [
    { size: 0.45, lift: 0.2, tilt: 6, lap: 55, top: true },
    { size: 0.73, lift: 1.4, tilt: 3, lap: 80 },
    { size: 1, lift: 2.4, tilt: 1, lap: 110 },
  ],
];

/** Splits `count` icons across rings, starting at index `offset`; bigger rings get more icons. */
function fill(rings: Ring[], count: number, offset: number) {
  const total = rings.reduce((sum, r) => sum + r.size, 0);
  let start = offset;
  return rings.map((ring, i) => {
    const n = i === rings.length - 1 ? offset + count - start : Math.round((count * ring.size) / total);
    const slice = { ...ring, start, n };
    start += n;
    return slice;
  });
}

/** Rings for `topCount` top skills followed by `count` other skills, in that order. */
export function orbitLayout(topCount: number, count: number) {
  if (topCount === 0) return fill(PLAIN[count <= 7 ? 0 : count <= 20 ? 1 : 2], count, 0);
  const [inner, ...outer] = WITH_TOP[count <= 12 ? 0 : 1];
  const topRing = { ...inner, start: 0, n: topCount };
  return count === 0 ? [topRing] : [topRing, ...fill(outer, count, topCount)];
}
