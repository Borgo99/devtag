import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanConfig } from "../src/lib/clean.ts";

test("unsafe links are dropped, bare domains get https", () => {
  const config = cleanConfig({
    profile: { name: "Ada", role: "Dev" },
    links: [
      { type: "github", url: "github.com/ada" },
      { type: "website", url: "javascript:alert(1)" },
      { type: "email", url: "mailto:ada@example.com" },
    ],
    projects: [{ name: "X", description: "Y", url: "data:text/html,hi", repo: "https://github.com/ada/x" }],
  });
  assert.deepEqual(config.links, [
    { type: "github", url: "https://github.com/ada" },
    { type: "website", url: "" },
    { type: "email", url: "ada@example.com" },
  ]);
  assert.deepEqual(config.projects, [{ name: "X", description: "Y", repo: "https://github.com/ada/x" }]);
});

test("nulls from the AI and empty values disappear; skills is always there", () => {
  const config = cleanConfig({
    profile: { name: " Ada ", role: "Dev", about: null },
    experience: [{ company: "Acme", role: "Dev", start: "2023-04", end: null, highlights: [], url: null }],
    theme: { accent: "red" },
  });
  assert.deepEqual(config, {
    profile: { name: "Ada", role: "Dev" },
    experience: [{ company: "Acme", role: "Dev", start: "2023-04" }],
    theme: {},
    skills: [],
  });
});

test("drafts keep half-filled items, publishing drops them", () => {
  const draft = { profile: { name: "Ada", role: "Dev" }, experience: [{ company: "Acme" }, {}] };
  assert.equal(cleanConfig(draft).experience?.length, 1);
  assert.equal(cleanConfig(draft, { complete: true }).experience, undefined);
});

test("dates must be YYYY or YYYY-MM, at most 5 top skills", () => {
  const config = cleanConfig({
    profile: { name: "Ada", role: "Dev" },
    education: [{ degree: "MSc", school: "Polimi", start: "Sept 2019", end: "2021-07" }],
    topSkills: ["a", "b", "c", "d", "e", "f"],
  });
  assert.deepEqual(config.education, [{ degree: "MSc", school: "Polimi", end: "2021-07" }]);
  assert.equal(config.topSkills?.length, 5);
});

test("seniority, years and open to work keep only known values", () => {
  const config = cleanConfig({
    profile: { name: "Ada", role: "Dev", seniority: "wizard", years: "6" },
    openToWork: { active: true, types: ["full-time", "astronaut", "full-time"], modes: ["remote"], from: "soon" },
  });
  assert.deepEqual(config.profile, { name: "Ada", role: "Dev", years: 6 });
  assert.deepEqual(config.openToWork, { active: true, types: ["full-time"], modes: ["remote"] });
  assert.equal(cleanConfig({ profile: { name: "A", role: "B", years: 99 } }).profile.years, undefined);
});

test("site previews and portfolio positions keep only safe values", () => {
  const config = cleanConfig({
    profile: { name: "Ada", role: "Dev" },
    projects: [
      {
        name: "A",
        description: "a",
        url: "https://a.dev",
        site: { url: "https://a.dev", logo: "javascript:x", image: "https://cdn/x.jpg" },
        portfolio: true,
        portfolioRank: 2,
      },
      { name: "B", description: "b", site: { image: "https://cdn/y.jpg" }, portfolio: true, portfolioRank: 0 },
    ],
    publications: [{ title: "P", portfolio: true, portfolioRank: 1.5 }],
  });
  assert.deepEqual(config.projects?.[0].site, { url: "https://a.dev", image: "https://cdn/x.jpg" });
  assert.equal(config.projects?.[0].portfolioRank, 2);
  // Without the address it was read from, a preview means nothing; ranks are whole numbers from 1.
  assert.equal(config.projects?.[1].site, undefined);
  assert.equal(config.projects?.[1].portfolioRank, undefined);
  assert.equal(config.publications?.[0].portfolioRank, undefined);
});
