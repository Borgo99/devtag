import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize, TOP, type Facts, type PageFacts } from "../src/lib/report.ts";

const facts = (profile: Partial<Facts["profile"]> = {}, more: Partial<Facts> = {}): Facts => ({
  profile: { name: "Ada", role: "", ...profile },
  skills: [],
  ...more,
});

const page = (draft: Facts, published: Facts | null = null, agreed = false, location: string | null = null) =>
  ({ draft, published, agreed, location }) satisfies PageFacts;

const row = (label: string, pages: number, published: number) => ({ label, pages, published });

test("drafts count in all pages, live versions in published", () => {
  const r = summarize([
    page(facts({ seniority: "senior" }), facts({ seniority: "mid" })),
    page(facts({ seniority: "senior" })),
    page(facts()),
  ]);
  assert.deepEqual(r.total, row("Pages", 3, 1));
  assert.deepEqual(r.seniority.find((x) => x.label === "Senior"), row("Senior", 2, 0));
  assert.deepEqual(r.seniority.find((x) => x.label === "Mid-level"), row("Mid-level", 0, 1));
  assert.deepEqual(r.seniority.at(-1), row("Not set", 1, 0));
});

test("roles that differ only in capitals and spaces are one, named by the first spelling", () => {
  const r = summarize([
    page(facts({ role: "Full Stack Developer" })),
    page(facts({ role: " full stack  developer" })),
    page(facts({ role: "Designer" })),
    page(facts()),
  ]);
  assert.deepEqual(r.roles, {
    rows: [row("Full Stack Developer", 2, 0), row("Designer", 1, 0), row("Not set", 1, 0)],
    distinct: 2,
  });
});

test("typed values list the most common only, and still count every page left empty", () => {
  const roles = Array.from({ length: TOP + 5 }, (_, i) => page(facts({ role: `Role ${i}` })));
  const r = summarize([...roles, page(facts()), page(facts())]);
  assert.equal(r.roles.rows.length, TOP + 1);
  assert.equal(r.roles.distinct, TOP + 5);
  assert.deepEqual(r.roles.rows.at(-1), row("Not set", 2, 0));
});

test("years of experience go in ranges", () => {
  const r = summarize([...[0, 1, 2, 4, 5, 9, 10, 30].map((years) => page(facts({ years }))), page(facts())]);
  assert.deepEqual(
    r.years.map((x) => [x.label, x.pages]),
    [
      ["Under 2", 2],
      ["2–4", 2],
      ["5–9", 2],
      ["10+", 2],
      ["Not set", 1],
    ],
  );
});

test("open to work counts only when switched on, with its types, modes and when", () => {
  const r = summarize(
    [
      page(
        facts({}, { openToWork: { active: true, types: ["full-time", "contract"], modes: ["remote"], from: "2026-12" } }),
        null,
        true,
      ),
      page(facts({}, { openToWork: { active: true, from: "2026-11" } })),
      // Switched off: the details are kept in the draft, but they don't count.
      page(facts({}, { openToWork: { active: false, types: ["freelance"] } }), null, true),
    ],
    "2026-11",
  );
  assert.deepEqual(r.openToWork, row("Open to work", 2, 0));
  assert.deepEqual(r.looking, [
    row("Open to work", 2, 0),
    row("Agreed to be shared with companies", 2, 0),
    row("Open to work and agreed", 1, 0),
  ]);
  assert.deepEqual(
    r.jobTypes.filter((x) => x.pages).map((x) => x.label),
    ["Full-time", "Contract"],
  );
  assert.deepEqual(r.workModes, [row("Remote", 1, 0), row("Hybrid", 0, 0), row("On-site", 0, 0)]);
  assert.deepEqual(r.available, [row("Now", 1, 0), row("Later", 1, 0)]);
});

test("where they live for companies comes before where they're based", () => {
  const r = summarize([
    page(facts({ basedIn: "Milan, Italy" }), facts({ basedIn: "Milan, Italy" }), true, "Turin"),
    page(facts({ basedIn: "milan, italy" })),
    page(facts()),
  ]);
  assert.deepEqual(r.places.rows, [row("Turin", 1, 1), row("milan, italy", 1, 0), row("Not set", 1, 0)]);
});

test("skills count once a page, from the top skills and the orbit, as names or with an icon", () => {
  const r = summarize([
    page(facts({}, { topSkills: ["TypeScript", { name: "React", icon: "react" }], skills: ["typescript", "Go"] })),
    page(facts({}, { skills: ["React"] })),
  ]);
  assert.deepEqual(r.skills, { rows: [row("React", 2, 0), row("Go", 1, 0), row("TypeScript", 1, 0)], distinct: 3 });
});
