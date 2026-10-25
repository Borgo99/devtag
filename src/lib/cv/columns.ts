/**
 * Puts the text of a PDF page in reading order. pdf.js returns text in the order the file stores
 * it, which can mix two columns line by line, so this uses the position of each piece instead.
 * No imports: the tests run this file directly with Node.
 */

/** A piece of text from pdf.js: x/y of its baseline start (y grows upwards), its width and height. */
export interface TextItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const chars = (items: TextItem[]) => items.reduce((n, i) => n + i.str.length, 0);

/**
 * The x of the empty vertical strip between two columns, if the page has two.
 * Candidates lie between 15% and 85% of the width. The page splits only if almost no text crosses
 * the strip (≤10% of the items) and the smaller side holds ≥20% of the text: the second rule stops
 * a column of right-aligned dates from being read as a column.
 */
export function findGutter(items: TextItem[], pageWidth: number) {
  let best: { x: number; cross: number } | undefined;
  for (let x = pageWidth * 0.15; x <= pageWidth * 0.85; x += 2) {
    let cross = 0;
    let left = 0;
    let right = 0;
    for (const i of items) {
      if (i.x + i.w <= x) left++;
      else if (i.x >= x) right++;
      else cross++;
    }
    const enough = items.length * 0.15;
    if (left > enough && right > enough && (!best || cross < best.cross)) best = { x, cross };
  }
  if (!best || best.cross > items.length * 0.1) return undefined;

  const smaller = Math.min(chars(items.filter((i) => i.x + i.w <= best.x)), chars(items.filter((i) => i.x >= best.x)));
  return smaller >= chars(items) * 0.2 ? best.x : undefined;
}

/** Icon fonts (phone, mail, pin glyphs…) map their symbols to the Unicode private use areas. */
const ICON_GLYPHS = /[\uE000-\uF8FF]|[\u{F0000}-\u{FFFFD}]|[\u{100000}-\u{10FFFD}]/gu;

/**
 * Items on the same baseline, left to right, as lines of text. Pieces that touch are joined without a
 * space: PDFs often store a ligature ("fi") as its own piece, which would otherwise read "fi xed".
 */
function lines(items: TextItem[]) {
  const rows: TextItem[][] = [];
  for (const item of [...items].sort((a, b) => b.y - a.y || a.x - b.x)) {
    const row = rows.at(-1);
    if (row && Math.abs(row[0].y - item.y) < Math.max(2, item.h * 0.4)) row.push(item);
    else rows.push([item]);
  }
  return rows.map((row) => {
    row.sort((a, b) => a.x - b.x);
    let line = "";
    row.forEach((item, k) => {
      const prev = row[k - 1];
      const touching = prev && item.x - (prev.x + prev.w) < Math.max(item.h, prev.h) * 0.1;
      line += !prev || touching || /\s$/.test(line) ? item.str : ` ${item.str}`;
    });
    return line;
  });
}

/** Ligature characters ("ﬁ") become letters, Unicode hyphens become "-", icon glyphs go. */
const clean = (line: string) =>
  line
    .normalize("NFKC")
    .replace(ICON_GLYPHS, "")
    .replace(/[\u2010\u2011]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

/** Pieces with real text: empty ones and lone icon-font glyphs take no part in finding the columns. */
const visible = (items: TextItem[]) => items.filter((i) => i.str.replace(ICON_GLYPHS, "").trim());

/** Whether the page is read as two columns. */
export const isTwoColumn = (pageItems: TextItem[], pageWidth: number) =>
  findGutter(visible(pageItems), pageWidth) !== undefined;

/** One page as lines in reading order: a full-width header first, then the left column, then the right one. */
export function pageLines(pageItems: TextItem[], pageWidth: number): string[] {
  const items = visible(pageItems);
  const gutter = findGutter(items, pageWidth);

  let ordered: string[];
  if (gutter === undefined) {
    ordered = lines(items);
  } else {
    const left = items.filter((i) => i.x + i.w <= gutter);
    const right = items.filter((i) => i.x >= gutter);
    const across = items.filter((i) => i.x < gutter && i.x + i.w > gutter);
    const columnsTop = Math.max(...[...left, ...right].map((i) => i.y));
    ordered = [
      ...lines(across.filter((i) => i.y > columnsTop)),
      ...lines(left),
      ...lines(right),
      ...lines(across.filter((i) => i.y <= columnsTop)),
    ];
  }
  return ordered.map(clean).filter(Boolean);
}
