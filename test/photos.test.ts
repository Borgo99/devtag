import { test } from "node:test";
import assert from "node:assert/strict";
import { crc32 } from "node:zlib";
import sharp from "sharp";
import { optimizePhoto, optimizeScreenshot, PHOTO_SIZE, SCREENSHOT_WIDTH } from "../src/lib/photos.ts";

const image = (width: number, height: number, alpha = false) =>
  sharp({
    create: { width, height, channels: alpha ? 4 : 3, background: { r: 200, g: 80, b: 40, alpha: alpha ? 0.5 : 1 } },
  });

const rejects = (input: Buffer, message: RegExp) => assert.rejects(optimizePhoto(input), message);

test("a large PNG with transparency becomes a small 512×512 JPEG", async () => {
  const input = await image(2000, 1500, true).png().toBuffer();
  const output = await optimizePhoto(input);
  const meta = await sharp(output).metadata();
  assert.equal(meta.format, "jpeg");
  assert.equal(meta.width, PHOTO_SIZE);
  assert.equal(meta.height, PHOTO_SIZE);
  assert.equal(meta.hasAlpha, false);
  assert.ok(output.length < 60_000, `${output.length} bytes`);
});

test("metadata is removed: no GPS location, no camera details", async () => {
  const input = await image(800, 600)
    .jpeg()
    .withExif({
      IFD0: { Make: "PhoneMaker", Model: "Phone 15" },
      IFD3: { GPSLatitudeRef: "N", GPSLatitude: "45/1 28/1 0/1" },
    })
    .toBuffer();
  assert.ok((await sharp(input).metadata()).exif, "the test image should carry EXIF");
  const meta = await sharp(await optimizePhoto(input)).metadata();
  assert.equal(meta.exif, undefined);
});

test("files that aren't usable images are refused", async () => {
  await rejects(Buffer.from("<html><script>alert(1)</script></html>"), /isn't an image/);
  await rejects(
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300"/></svg>',
    ),
    /JPEG, PNG or WebP/,
  );
  await rejects(await image(64, 64).png().toBuffer(), /too small/);
});

test("a decompression bomb (tiny file, huge declared size) is refused before decoding", async () => {
  // A real 200×200 PNG whose header is rewritten to claim 100,000×100,000 pixels.
  const png = Buffer.from(await image(200, 200).png().toBuffer());
  png.writeUInt32BE(100_000, 16);
  png.writeUInt32BE(100_000, 20);
  png.writeUInt32BE(crc32(png.subarray(12, 29)), 29);
  await rejects(png, /too large/);
});

test("screenshots keep their shape, at most 1600 px wide; whole-page captures lose their bottom", async () => {
  const wide = await sharp(await optimizeScreenshot(await image(3000, 2000).png().toBuffer())).metadata();
  assert.deepEqual([wide.format, wide.width, wide.height], ["jpeg", SCREENSHOT_WIDTH, 1067]);
  const small = await sharp(await optimizeScreenshot(await image(800, 500).png().toBuffer())).metadata();
  assert.deepEqual([small.width, small.height], [800, 500]); // never enlarged
  const page = await sharp(await optimizeScreenshot(await image(1440, 9000).jpeg().toBuffer())).metadata();
  assert.deepEqual([page.width, page.height], [1440, 4000]);
  await assert.rejects(optimizeScreenshot(await image(300, 200).png().toBuffer()), /too small/);
});
