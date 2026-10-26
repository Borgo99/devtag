import { test } from "node:test";
import assert from "node:assert/strict";
import { featured, portfolioEntries } from "../src/lib/portfolio.ts";
import type { PortfolioConfig } from "../src/lib/types.ts";

const config = (extra: Partial<PortfolioConfig>): PortfolioConfig => ({
  profile: { name: "Ada", role: "Dev" },
  skills: [],
  ...extra,
});

test("featured items follow their positions; unranked ones follow, projects before publications", () => {
  const c = config({
    projects: [
      { name: "One", description: "", portfolio: true },
      { name: "Two", description: "", portfolio: true, portfolioRank: 2 },
      { name: "Hidden", description: "" },
    ],
    publications: [{ title: "Paper", portfolio: true, portfolioRank: 1 }],
  });
  assert.deepEqual(
    featured(c).map((f) => (f.type === "project" ? f.item.name : f.item.title)),
    ["Paper", "Two", "One"],
  );
});

test("a live site's card uses the image and logo read from its current address only", () => {
  const entry = (site: object) =>
    portfolioEntries(
      config({ projects: [{ name: "X", description: "", url: "https://x.dev", portfolio: true, site } as never] }),
      "",
    )[0];
  assert.deepEqual(
    [
      entry({ url: "https://x.dev", image: "https://cdn/i.jpg", logo: "https://cdn/l.png" }).image,
      entry({ url: "https://x.dev", logo: "https://cdn/l.png" }).logo,
    ],
    ["https://cdn/i.jpg", "https://cdn/l.png"],
  );
  const stale = entry({ url: "https://old.dev", image: "https://cdn/i.jpg", logo: "https://cdn/l.png" });
  assert.deepEqual([stale.image, stale.logo], [undefined, undefined]);
});
