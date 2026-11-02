import { test } from "node:test";
import assert from "node:assert/strict";
import { visitSource } from "../src/lib/sources.ts";

test("a ?ref= tag wins, lowercased; odd tags are ignored", () => {
  assert.equal(visitSource("Reddit-WebDev", "https://www.reddit.com/"), "reddit-webdev");
  assert.equal(visitSource("<script>", "https://news.ycombinator.com/"), "news.ycombinator.com");
  assert.equal(visitSource("x".repeat(41), ""), "direct");
});

test("referrers are named after their site", () => {
  assert.equal(visitSource("", "https://old.reddit.com/r/webdev/"), "reddit.com");
  assert.equal(visitSource(null, "https://www.google.it/"), "google");
  assert.equal(visitSource(undefined, "https://lnkd.in/abc"), "linkedin.com");
  assert.equal(visitSource("", "https://t.co/xyz"), "x.com");
});

test("no referrer is direct; our own subdomains are profile pages", () => {
  assert.equal(visitSource("", ""), "direct");
  assert.equal(visitSource("", "https://devtag.io/companies", "devtag.io"), "direct");
  assert.equal(visitSource("", "https://andrea.devtag.io/", "devtag.io"), "page");
});
