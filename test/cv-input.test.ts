import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { checkCvText, MAX_CHARS } from "../src/lib/cv/input.ts";
import { readPdf } from "./read-pdf.ts";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${"abc"[i % 3]}`).join(" ");

test("the text of every test CV is accepted", async () => {
  // private/ holds real CVs, kept out of the repo: used when present.
  const files = ["grid.pdf", "rows.pdf", "dates.pdf", "private/portfolio.pdf"].filter((f) =>
    existsSync(`test/cvs/${f}`),
  );
  for (const file of files) {
    const result = checkCvText((await readPdf(`test/cvs/${file}`)).join("\n"));
    assert.ok("text" in result, `${file} was refused: ${"error" in result && result.error}`);
  }
});

test("anything but a string is refused", () => {
  for (const value of [undefined, null, 42, ["text"], { text: "x" }]) {
    assert.deepEqual(checkCvText(value), { error: "No CV text received.", status: 400 });
  }
});

test("too short, too long", () => {
  assert.deepEqual(checkCvText("Mario Rossi, developer"), {
    error: "This CV has too little text to read.",
    status: 400,
  });
  const long = checkCvText(words(MAX_CHARS / 5));
  assert.ok("error" in long && long.status === 413);
  const huge = checkCvText("a".repeat(MAX_CHARS * 3));
  assert.ok("error" in huge && huge.status === 413);
});

test("control, invisible and icon-font characters are removed, spacing is tidied", () => {
  const raw = `Mario\u0000 Rossi\u200B\u202E\uF0E0  \t Developer\n\n\n\n${words(25)}\r`;
  const result = checkCvText(raw);
  assert.ok("text" in result);
  assert.ok(result.text.startsWith("Mario Rossi Developer\n\nworda"), JSON.stringify(result.text.slice(0, 40)));
  assert.doesNotMatch(result.text, /[\u0000\u200B\u202E\uF0E0\r]/u);
});

test("text that isn't a CV is refused: a base64 blob, symbols, numbers", () => {
  for (const junk of [
    randomBytes(3000)
      .toString("base64")
      .replace(/(.{76})/g, "$1\n"),
    "#$%^&*()_+{}|:<>?~".repeat(20),
    "1234 5678 9012 3456 ".repeat(30),
  ]) {
    const result = checkCvText(junk);
    assert.ok("error" in result && result.status === 400, `accepted: ${junk.slice(0, 30)}…`);
  }
});
