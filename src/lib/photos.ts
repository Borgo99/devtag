import sharp from "sharp";

/**
 * Every uploaded image (profile photo, project screenshot) is decoded and re-encoded here, whatever the
 * browser sent: a file that isn't really an image fails to decode, oversized or tiny images are refused,
 * and the result is always a JPEG without metadata (no GPS location, no camera details): a 512×512 photo,
 * or a screenshot at most 1600 px wide.
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

/** Decodes an upload and checks it is an image we accept; `minWidth`/`minHeight`: below this it looks blurry. */
async function open(input: Buffer, minWidth: number, minHeight: number) {
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
  if (meta.width < minWidth || meta.height < minHeight) {
    throw new PhotoError(`This image is too small: use one at least ${minWidth}×${minHeight} pixels.`);
  }
  return { image, width: meta.width, height: meta.height };
}

/** Re-encodes, turning sharp's errors into a message the user can act on. */
async function encode(image: ReturnType<typeof sharp>) {
  try {
    return await image.flatten({ background: BACKGROUND }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  } catch {
    throw new PhotoError("This image looks damaged. Try another one.");
  }
}

export async function optimizePhoto(input: Buffer) {
  const { image } = await open(input, MIN_SIDE, MIN_SIDE);
  return encode(image.resize(PHOTO_SIZE, PHOTO_SIZE, { fit: "cover", position: "centre" }));
}

/** A project screenshot keeps its shape: the card shows its top, the project page all of it. */
export const SCREENSHOT_WIDTH = 1600;
/** Taller (a whole-page capture) keeps its width and loses its bottom: the project page doesn't need a mile of it. */
const SCREENSHOT_MAX_HEIGHT = 4000;

export async function optimizeScreenshot(input: Buffer) {
  const { image, width, height } = await open(input, 400, 250);
  const scale = Math.min(1, SCREENSHOT_WIDTH / width);
  const [w, h] = [Math.round(width * scale), Math.round(height * scale)];
  image.resize(w, h);
  if (h > SCREENSHOT_MAX_HEIGHT) image.extract({ left: 0, top: 0, width: w, height: SCREENSHOT_MAX_HEIGHT });
  return encode(image);
}
