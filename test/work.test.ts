import { test } from "node:test";
import assert from "node:assert/strict";
import type { PortfolioConfig } from "../src/lib/types.ts";
import { openToWorkDetails } from "../src/lib/work.ts";

const page = (basedIn: string | undefined, location: string | undefined): PortfolioConfig => ({
  profile: { name: "Ada", role: "Dev", basedIn },
  openToWork: { active: true, location },
  skills: [],
});

test("open to work shows where they'd work, unless it's where they're based", () => {
  assert.deepEqual(openToWorkDetails(page("Milan, Italy", "Berlin")), ["Berlin", "Available now"]);
  assert.deepEqual(openToWorkDetails(page("Milan", "milan")), ["Available now"]);
  assert.deepEqual(openToWorkDetails(page(undefined, "Milan")), ["Milan", "Available now"]);
  assert.deepEqual(openToWorkDetails(page("Milan", undefined)), ["Available now"]);
});
