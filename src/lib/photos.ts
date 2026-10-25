import sharp from "sharp";

/**
 * Every uploaded profile photo is decoded and re-encoded here, whatever the browser sent: a file
 * that isn't really an image fails to decode, oversized or tiny images are refused, and the result
 * is always a small 512×512 JPEG without metadata (no GPS location, no camera details).
 * JPEG because the share-image renderer (lib/og.tsx) reads only PNG and JPEG.
 * No project imports: the tests run this file directly with Node.
 */

export const PHOTO_SIZE = 512;
/** Below this the photo would look blurry even in the small avatar. */
const MIN_SIDE = 128;
/** Refuse "decompression bombs": tiny files that unpack into gigantic images. 40 MP is a big phone photo. */
const MAX_PIXELS = 40_000_000;
/** What the editor sends (PNG) and what people commonly have. SVG and others are refused. */
const FORMATS = new Set(["jpeg", "png", "webp"]);
/** The page background, behind transparent images. */
const BACKGROUND = "#0b0f14";

/** A problem the user can fix; the message is shown in the editor. */
export class PhotoError extends Error {}

export async function optimizePhoto(input: Buffer) {
  const image = sharp(input, { limitInputPixels: MAX_PIXELS, failOn: "warning", autoOrient: true });
  let meta;
  try {
    meta = await image.metadata();
  } catch (error) {
    // sharp checks the pixel limit as soon as it reads the header, before decoding anything.
    if (/pixel limit/i.test((error as Error).message))
      throw new PhotoError("This image is too large. Try a smaller one.");
    throw new PhotoError("This file isn't an image we can open. Try a JPEG or PNG.");
  }
  if (!meta.format || !FORMATS.has(meta.format)) throw new PhotoError("Use a JPEG, PNG or WebP image.");
  if (!meta.width || !meta.height) throw new PhotoError("This file isn't an image we can open. Try a JPEG or PNG.");
  if (meta.width * meta.height > MAX_PIXELS) throw new PhotoError("This image is too large. Try a smaller one.");
  if (Math.min(meta.width, meta.height) < MIN_SIDE) {
    throw new PhotoError(`This image is too small: use one at least ${MIN_SIDE}×${MIN_SIDE} pixels.`);
  }

  try {
    return await image
      .resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "centre" })
      .flatten({ background: BACKGROUND })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new PhotoError("This image looks damaged. Try another one.");
  }
}
