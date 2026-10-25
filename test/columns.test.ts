import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { pageLines, type TextItem } from "../src/lib/cv/columns.ts";
import { readPdf } from "./read-pdf.ts";

const before = (lines: string[], a: string, b: string) => {
  const i = lines.findIndex((l) => l.includes(a));
  const j = lines.findIndex((l) => l.includes(b));
  assert.ok(i >= 0 && j >= 0, `missing "${a}" or "${b}"`);
  assert.ok(i < j, `"${a}" should come before "${b}"`);
};

test("sidebar CV: header, then the left column, then the right one", async () => {
  const lines = await readPdf("test/cvs/grid.pdf");
  assert.equal(lines[0], "MARIO ROSSI");
  before(lines, "Full-stack developer", "CONTACT");
  before(lines, "English (C1)", "EXPERIENCE");
  assert.ok(lines.includes("Led the rewrite of the billing platform in Next.js."));
});

test("same sidebar CV with its text stored line by line across both columns", async () => {
  const lines = await readPdf("test/cvs/rows.pdf");
  before(lines, "PostgreSQL", "EXPERIENCE");
  assert.ok(!lines.some((l) => l.includes("TypeScript") && l.includes("Senior")), "columns mixed on one line");
});

test("single column with right-aligned dates is not split", async () => {
  const lines = await readPdf("test/cvs/dates.pdf");
  assert.ok(lines.includes("Senior Developer – Acme SRL 2022 – Present"));
});

// A real CV, kept out of the repo (test/cvs/private/ is git-ignored): skipped where it isn't present.
const PRIVATE_CV = "test/cvs/private/portfolio.pdf";

test(
  "a real one-column CV reads top to bottom",
  { skip: !existsSync(PRIVATE_CV) && "private CV not present" },
  async () => {
    const lines = await readPdf(PRIVATE_CV);
    before(lines, "Work Experience", "Education");
    before(lines, "Education", "Skills");
    assert.ok(lines.includes("Founder & Full-Stack Product Engineer Italy"));
  },
);

// A few words on a wide page: all within the left 15%, where no column gap is looked for.
const item = (str: string, x: number, w: number): TextItem => ({ str, x, y: 700, w, h: 10 });
const line = (...items: TextItem[]) => pageLines(items, 2000);

test("touching pieces join without a space, separate words keep one", () => {
  assert.deepEqual(line(item("fi", 10, 5), item("xed", 15, 12)), ["fixed"]);
  assert.deepEqual(line(item("Built", 10, 20), item("APIs", 33, 16)), ["Built APIs"]);
});

test("icon-font symbols and ligature characters are cleaned up", () => {
  assert.deepEqual(line(item("\uF0E0", 0, 8), item(" mario@example.com", 10, 80)), ["mario@example.com"]);
  assert.deepEqual(line(item("eﬃcient", 10, 40)), ["efficient"]);
});
