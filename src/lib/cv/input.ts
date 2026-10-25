/**
 * Server-side check of the CV text sent to /api/cv. The browser already cleans it (columns.ts),
 * but anyone can call the API directly, so the text is cleaned and checked again here before
 * it reaches the AI. No imports: the tests run this file directly with Node.
 */

export const MIN_CHARS = 50;
export const MAX_CHARS = 30_000; // a long CV is ~10,000
/** Below this many words it isn't a CV. */
const MIN_WORDS = 20;

/** Control characters except tab and newline. */
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g;
/** Zero-width and text-direction characters: invisible, and able to hide or reorder text. */
const INVISIBLE = /[\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g;
/** Icon fonts (phone, mail, pin glyphs…) map their symbols to the Unicode private use areas. */
const ICON_GLYPHS = /[\uE000-\uF8FF]|[\u{F0000}-\u{FFFFD}]|[\u{100000}-\u{10FFFD}]/gu;

export type CvInput = { text: string } | { error: string; status: 400 | 413 };

export function checkCvText(value: unknown): CvInput {
  if (typeof value !== "string") return { error: "No CV text received.", status: 400 };
  // Cheap check first, so oversized input isn't processed at all.
  if (value.length > MAX_CHARS * 2) return { error: "This CV is too long.", status: 413 };

  const text = value
    .normalize("NFKC")
    .replace(CONTROL, "")
    .replace(INVISIBLE, "")
    .replace(ICON_GLYPHS, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length < MIN_CHARS) return { error: "This CV has too little text to read.", status: 400 };
  if (text.length > MAX_CHARS) return { error: "This CV is too long.", status: 413 };
  // Real text is mostly words; a base64 blob or a string of symbols is not.
  const tokens = text.split(/\s+/);
  const words = tokens.filter(
    (t) => t.length <= 30 && (t.match(/\p{L}/gu)?.length ?? 0) >= Math.max(2, t.length * 0.6),
  );
  if (words.length < MIN_WORDS || words.length < tokens.length * 0.3) {
    return { error: "This doesn't look like the text of a CV.", status: 400 };
  }
  return { text };
}
