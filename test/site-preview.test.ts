import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import sharp from "sharp";
import { findAssets, isPublicAddress, logoImage, previewImage, readSite } from "../src/lib/site-preview.ts";

const png = (width: number, height: number, alpha = false) =>
  sharp({
    create: { width, height, channels: alpha ? 4 : 3, background: { r: 30, g: 120, b: 200, alpha: alpha ? 0.4 : 1 } },
  })
    .png()
    .toBuffer();

test("only public internet addresses are allowed", () => {
  for (const ok of ["8.8.8.8", "1.1.1.1", "2606:4700::1111"]) assert.equal(isPublicAddress(ok), true, ok);
  for (const blocked of [
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "192.168.1.1",
    "169.254.169.254", // cloud metadata
    "100.64.0.1",
    "0.0.0.0",
    "255.255.255.255",
    "::1",
    "::",
    "fe80::1",
    "fd00::1",
    "::ffff:127.0.0.1",
    "64:ff9b::a00:1",
    "localhost", // not an address at all
  ])
    assert.equal(isPublicAddress(blocked), false, blocked);
});

test("the page's preview image and icons are found, best icon first, .ico last", () => {
  const html = `<html><head>
    <meta property="og:image" content="/img/share.png?a=1&amp;b=2">
    <link rel="icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="apple-touch-icon" href="https://cdn.example.com/touch.png">
  </head></html>`;
  const found = findAssets(html, new URL("https://example.com/app/"));
  assert.equal(found.image?.href, "https://example.com/img/share.png?a=1&b=2");
  assert.deepEqual(
    found.icons.map((u) => u.href),
    [
      "https://cdn.example.com/touch.png",
      "https://example.com/icon.svg",
      "https://example.com/icon-32.png",
      "https://example.com/apple-touch-icon.png",
      "https://example.com/favicon.ico",
    ],
  );
  const twitter = findAssets(
    `<meta name="twitter:image" content="https://x.example/t.jpg">`,
    new URL("https://a.example"),
  );
  assert.equal(twitter.image?.href, "https://x.example/t.jpg");
});

test("local addresses are refused, also behind a name", async () => {
  const server = http.createServer((_, res) => res.end("<meta property='og:image' content='/x.png'>"));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };
  try {
    await assert.rejects(readSite(new URL(`http://127.0.0.1:${port}/`)), /public address/);
    await assert.rejects(readSite(new URL(`http://localhost:${port}/`)), /public address/);
    await assert.rejects(readSite(new URL(`file:///etc/passwd`)), /web address/);
  } finally {
    server.close();
  }
});

test("a preview image becomes a 1280×800 JPEG; small images are refused", async () => {
  const meta = await sharp(await previewImage(await png(1200, 630))).metadata();
  assert.deepEqual([meta.format, meta.width, meta.height], ["jpeg", 1280, 800]);
  await assert.rejects(previewImage(await png(100, 60)), /usable/);
});

test("icons become 128×128 PNGs; tiny icons and SVGs that load files are refused", async () => {
  const meta = await sharp(await logoImage(await png(180, 180, true))).metadata();
  assert.deepEqual([meta.format, meta.width, meta.height, meta.hasAlpha], ["png", 128, 128, true]);
  await assert.rejects(logoImage(await png(16, 16)), /too small/);

  const svg = (inner: string) =>
    Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`);
  assert.equal((await sharp(await logoImage(svg('<circle cx="12" cy="12" r="10"/>'))).metadata()).width, 128);
  await assert.rejects(logoImage(svg('<image href="file:///etc/passwd" width="24" height="24"/>')), /other content/);
  await assert.rejects(logoImage(svg('<use href="https://evil.example/x.svg#a"/>')), /other content/);
});

/** A .ico file holding one 32-bit bitmap per size, filled with one colour (r, g, b, a). */
function ico(sizes: number[], [r, g, b, a]: number[]) {
  const images = sizes.map((size) => {
    const header = Buffer.alloc(40);
    header.writeUInt32LE(40, 0);
    header.writeInt32LE(size, 4);
    header.writeInt32LE(size * 2, 8); // with the mask
    header.writeUInt16LE(1, 12);
    header.writeUInt16LE(32, 14);
    const pixels = Buffer.alloc(size * size * 4);
    for (let i = 0; i < pixels.length; i += 4) pixels.set([b, g, r, a], i);
    return Buffer.concat([header, pixels, Buffer.alloc(Math.ceil(size / 32) * 4 * size)]);
  });
  const directory = Buffer.alloc(6 + 16 * sizes.length);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  sizes.forEach((size, i) => {
    const entry = 6 + 16 * i;
    directory[entry] = size % 256;
    directory[entry + 1] = size % 256;
    directory.writeUInt32LE(images[i].length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += images[i].length;
  });
  return Buffer.concat([directory, ...images]);
}

test(".ico icons: the biggest bitmap is used, colours kept; too small or damaged ones are refused", async () => {
  const logo = await logoImage(ico([16, 32, 48], [220, 40, 30, 255]));
  const { data, info } = await sharp(logo).raw().toBuffer({ resolveWithObject: true });
  assert.deepEqual([info.width, info.height], [128, 128]);
  assert.deepEqual([...data.subarray((64 * 128 + 64) * 4, (64 * 128 + 64) * 4 + 4)], [220, 40, 30, 255]);
  // Old icons with an empty alpha channel show opaque instead of invisible.
  const old = await sharp(await logoImage(ico([48], [0, 0, 255, 0])))
    .raw()
    .toBuffer();
  assert.equal(old[(64 * 128 + 64) * 4 + 3], 255);
  await assert.rejects(logoImage(ico([16, 32], [1, 2, 3, 255])), /too small/);
  await assert.rejects(logoImage(ico([48], [1, 2, 3, 255]).subarray(0, 200)), /Empty|Damaged|Unsupported/);
});
