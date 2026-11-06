import { test } from "node:test";
import assert from "node:assert/strict";
import { cvDocument, PHONE, printableText, type Entry, type Section } from "../src/lib/cv/document.ts";
import { drawable, missingCharacters, wordParts } from "../src/lib/cv/fonts.ts";
import type { Job, PortfolioConfig, Project } from "../src/lib/types.ts";

const job = (role: string, highlights: string[], summary?: string): Job => ({
  role,
  company: "Acme",
  start: "2021-03",
  highlights,
  summary,
});

const base: PortfolioConfig = {
  profile: { name: "Ada Lovelace", role: "Developer", about: "First paragraph.\n\nSecond one." },
  skills: ["TypeScript", "Go"],
  experience: [job("Engineer", ["a", "b", "c", "d"], "The whole job."), job("Intern", [], "Only a summary.")],
  education: [{ school: "Uni", degree: "BSc", grade: "110/110", start: "2015", end: "2019" }],
};

const titles = (sections: Section[]) => sections.map((s) => s.title);
const entries = (sections: Section[], title: string): Entry[] => {
  const section = sections.find((s) => s.title === title);
  return section?.kind === "entries" ? section.entries : [];
};

test("one page keeps each job's top three points; everything keeps the summary and all points", () => {
  const one = cvDocument(base, { length: "one" });
  assert.deepEqual(
    entries(one.sections, "Experience").map((e) => e.bullets),
    [["a", "b", "c"], ["Only a summary."]],
  );
  const full = cvDocument(base, { length: "full" });
  assert.deepEqual(entries(full.sections, "Experience")[0].bullets, ["The whole job.", "a", "b", "c", "d"]);
});

test("one page shows the featured projects in their order, else the first three", () => {
  const p = (name: string, extra: Partial<Project> = {}): Project => ({ name, description: `${name}.`, ...extra });
  const many = [p("A"), p("B"), p("C"), p("D")];
  const names = (config: PortfolioConfig, length: "one" | "full") =>
    entries(cvDocument(config, { length }).sections, "Projects").map((e) => e.title);

  assert.deepEqual(names({ ...base, projects: many }, "one"), ["A", "B", "C"]);
  const featured = [
    p("A"),
    p("B", { portfolio: true, portfolioRank: 2 }),
    p("C", { portfolio: true, portfolioRank: 1 }),
  ];
  assert.deepEqual(names({ ...base, projects: featured }, "one"), ["C", "B"]);
  assert.deepEqual(names({ ...base, projects: many }, "full"), ["A", "B", "C", "D"]);
});

test("contacts: phone, email, where they're based, the page, then the other links", () => {
  const cv = cvDocument(
    {
      ...base,
      profile: { ...base.profile, basedIn: "Milan, Italy" },
      links: [
        { type: "github", url: "https://github.com/ada/" },
        { type: "email", url: "mailto:ada@example.com" },
        { type: "cv", url: "https://example.com/cv.pdf" },
        { type: "website", url: "https://ada.devtag.io" },
      ],
    },
    { length: "one", phone: "+39 333 123 4567", pageUrl: "https://ada.devtag.io" },
  );
  assert.deepEqual(cv.contacts, [
    { text: "+39 333 123 4567" },
    { text: "ada@example.com", href: "mailto:ada@example.com" },
    { text: "Milan, Italy" },
    { text: "ada.devtag.io", href: "https://ada.devtag.io" },
    { text: "github.com/ada", href: "https://github.com/ada/" },
  ]);
  const twice = { type: "github", url: "https://github.com/ada" };
  assert.equal(cvDocument({ ...base, links: [twice, twice] }, { length: "one" }).contacts.length, 1);
});

test("sections: experience first, education first while studying, the summary only in the full CV", () => {
  assert.deepEqual(titles(cvDocument(base, { length: "one" }).sections), ["Experience", "Education", "Skills"]);
  assert.deepEqual(titles(cvDocument(base, { length: "full" }).sections), [
    "Summary",
    "Experience",
    "Education",
    "Skills",
  ]);
  const studying = { ...base, education: [{ school: "Uni", degree: "MSc", start: "2024" }] };
  assert.deepEqual(titles(cvDocument(studying, { length: "one" }).sections), ["Education", "Experience", "Skills"]);
});

test("education: the grade after the degree, and the dates", () => {
  const [school] = entries(cvDocument(base, { length: "one" }).sections, "Education");
  assert.equal(school.subtitle, "BSc, 110/110");
  assert.equal(school.subright, "2015 – 2019");
  assert.equal(entries(cvDocument(base, { length: "one" }).sections, "Experience")[0].right, "Mar 2021 – Present");
});

test("skills: one line per stack group, else all the skills; then the languages", () => {
  const lines = (config: PortfolioConfig) => {
    const section = cvDocument(config, { length: "one" }).sections.find((s) => s.title === "Skills");
    return section?.kind === "lines" ? section.lines : [];
  };
  assert.deepEqual(lines({ ...base, languages: [{ name: "Italian", level: "Native" }] }), [
    { label: "Skills", text: "TypeScript, Go" },
    { label: "Languages", text: "Italian (Native)" },
  ]);
  assert.deepEqual(lines({ ...base, stack: [{ group: "Back-end", items: ["Go", { name: "PostgreSQL" }] }] }), [
    { label: "Back-end", text: "Go, PostgreSQL" },
  ]);
});

test("phone numbers as people write them", () => {
  for (const ok of ["+39 333 123 4567", "(555) 123-4567", "0331.123456", "+44 20 7946 0958"])
    assert.ok(PHONE.test(ok), ok);
  for (const bad of ["abc", "12345", "------", "+39 333 abc", "1".repeat(30)]) assert.ok(!PHONE.test(bad), bad);
});

test("characters the PDF's fonts can't draw are found, each once", () => {
  const cv = (name: string, bullet: string) =>
    cvDocument({ ...base, profile: { ...base.profile, name }, experience: [job("Dev", [bullet])] }, { length: "one" });
  assert.deepEqual(missingCharacters(cv("Zoë Łukasz Nguyễn", "Led a team – 40% faster, “quoted” • ok")), []);
  assert.deepEqual(missingCharacters(cv("Олена", "Built 数据 tools 🚀")), ["О", "л", "е", "н", "а", "数", "据", "🚀"]);
});

test("pasted spacing and invisible characters become printable text, links stay as they are", () => {
  assert.equal(printableText("Data\tEngineer"), "Data Engineer");
  assert.equal(printableText("10 000 hours a year, em space"), "10 000 hours a year, em space");
  assert.equal(printableText("zero​width, soft­hyphen, bell\u0007, mark‎"), "zerowidth, softhyphen, bell, mark");
  assert.equal(printableText("two\r\nlines, many    spaces"), "two\nlines, many spaces");
  assert.equal(printableText("no break"), "no break");
  const cv = cvDocument(
    { ...base, links: [{ type: "website", url: "https://ada.dev/a\tb" }], experience: [job("Dev\tOps", ["x​y"])] },
    { length: "one" },
  );
  const [entry] = cv.sections[0].kind === "entries" ? cv.sections[0].entries : [];
  assert.equal(entry.title, "Dev Ops");
  assert.deepEqual(entry.bullets, ["xy"]);
  assert.equal(cv.contacts[0].href, "https://ada.dev/a\tb");
});

test("characters the fonts can't draw are left out of the PDF, the rest stays", () => {
  const cv = cvDocument(
    { ...base, profile: { ...base.profile, name: "Zoë Олена" }, experience: [job("Dev", ["Fast 🚀 builds"])] },
    {
      length: "one",
    },
  );
  const out = drawable(cv);
  assert.equal(out.name, "Zoë ");
  assert.deepEqual(out.sections[0].kind === "entries" && out.sections[0].entries[0].bullets, ["Fast  builds"]);
});

test("only words too long for any line may break, at / . _ ? & = and at least every 16 characters", () => {
  assert.deepEqual(wordParts("linkedin.com/in/ada-lovelace-1815"), ["linkedin.com/in/ada-lovelace-1815"]);
  assert.deepEqual(wordParts("Supercalifragilisticexpialidocious"), ["Supercalifragilisticexpialidocious"]);
  const url = "https://github.com/organization/repository-with-a-long-name/blob/main/README.md";
  const parts = wordParts(url);
  assert.equal(parts.join(""), url);
  assert.ok(parts.every((p) => p.length <= 16));
  assert.ok(parts.includes("organization/"));
  const word = "A".repeat(50);
  assert.deepEqual(wordParts(word), ["A".repeat(16), "A".repeat(16), "A".repeat(16), "AA"]);
});
