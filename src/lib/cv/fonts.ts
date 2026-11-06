import { mapTexts, type Cv } from "./document.ts"; // with ".ts": the tests run this file directly with Node

/**
 * The characters the CV's fonts can draw (public/static/fonts/latin-modern-pdf: Latin Modern, subset to Latin
 * scripts), as hex ranges. Read from the regular, bold and italic fonts with fontTools: change it when the
 * fonts change. Anything else (Cyrillic, Greek, Chinese, emoji…) would be missing from the PDF.
 */
const COVERED =
  "20-7e a0-137 139-148 14a-165 168-17f 18e 192 1a0-1a1 1af-1b0 1cd-1d4 1d7-1dd 1e6-1e7 1ea-1eb 1f0 1f4-1f5 " +
  "1fa-201 204-205 208-209 20c-20d 210-211 214-215 218-21b 237 2c6-2c7 2d8-2dd 1e0c-1e0f 1e24-1e27 1e2a-1e2b " +
  "1e2e-1e2f 1e36-1e39 1e42-1e47 1e58-1e5d 1e62-1e63 1e6c-1e6f 1e80-1e85 1e92-1e93 1e97 1ea0-1ef9 2010-2011 " +
  "2013-2014 2016 2018-201a 201c-201e 2020-2022 2026 2030-2031 2039-203a 2044 20ac 2122 2190-2193 2212";

const ranges = COVERED.split(" ").map((r) => {
  const [from, to = from] = r.split("-").map((hex) => parseInt(hex, 16));
  return [from, to] as const;
});

const covered = (char: string) => {
  const code = char.codePointAt(0)!;
  return ranges.some(([from, to]) => code >= from && code <= to);
};

/** Everything a CV prints. */
function texts(cv: Cv) {
  return [
    cv.name,
    ...cv.contacts.map((c) => c.text),
    ...cv.sections.flatMap((s) => [
      s.title,
      ...(s.kind === "entries"
        ? s.entries.flatMap((e) => [e.title, e.tags, e.right, e.subtitle, e.subright, ...e.bullets])
        : s.kind === "lines"
          ? s.lines.flatMap((l) => [l.label, l.text])
          : s.paragraphs),
    ]),
  ];
}

/** The characters of `cv` its fonts can't draw, each once: ["Ж", "ш"]. Spaces and line breaks don't count. */
export function missingCharacters(cv: Cv) {
  const missing = new Set<string>();
  for (const text of texts(cv))
    for (const char of text ?? "") if (!/\s/.test(char) && !covered(char)) missing.add(char);
  return [...missing];
}

/**
 * The CV without the characters its fonts can't draw: left out, rather than drawn as broken glyphs that land
 * on top of each other. The editor says which ones before the PDF is made.
 */
export const drawable = (cv: Cv) =>
  mapTexts(cv, (text) => [...text].filter((char) => /\s/.test(char) || covered(char)).join(""));

/**
 * Longer words may break across lines (react-pdf marks the break with a hyphen); shorter ones never do. Any
 * word up to this length fits even the narrowest place it can be, the left of an entry's line (about 43 bold
 * letters), and react-pdf uses every break it's given to fill lines: a lower limit would cut ordinary links.
 */
const LONG_WORD = 40;

/**
 * Where a long word (an address, an identifier) may break when it doesn't fit on its line: after / . _ ? & =
 * when it has them, and at least every 16 characters. Without this, a word wider than its line runs off the page.
 */
export function wordParts(word: string) {
  if ([...word].length <= LONG_WORD) return [word];
  return word.split(/(?<=[/._?&=])/).flatMap((part) => part.match(/[\s\S]{1,16}/gu) ?? []);
}
