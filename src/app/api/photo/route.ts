import { optimizePhoto, optimizeScreenshot, PhotoError } from "@/lib/photos";
import { currentUser } from "@/lib/session";
import { savePhoto } from "@/lib/store";

/**
 * POST the image itself as the body → { url } in S3/CloudFront. The editor sends the profile photo as the
 * 512×512 square it cropped (PNG), and with `?kind=screenshot` a project screenshot it resized (JPEG).
 * The server doesn't trust what it receives: lib/photos.ts decodes it, checks it and re-encodes it as a
 * JPEG before it's stored.
 */

/** Screenshots can be bigger; both stay under Vercel's 4.5 MB request limit. */
const KINDS = {
  photo: { optimize: optimizePhoto, maxBytes: 2_000_000 },
  screenshot: { optimize: optimizeScreenshot, maxBytes: 4_000_000 },
};

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });

  const kind = new URL(request.url).searchParams.get("kind") === "screenshot" ? KINDS.screenshot : KINDS.photo;
  const tooBig = `The image must be smaller than ${kind.maxBytes / 1_000_000} MB.`;

  if (!request.headers.get("content-type")?.startsWith("image/")) {
    return Response.json({ error: "Send an image." }, { status: 415 });
  }
  // Refuse big bodies before reading them when the size is announced, and after reading otherwise.
  if (Number(request.headers.get("content-length")) > kind.maxBytes) {
    return Response.json({ error: tooBig }, { status: 413 });
  }
  const data = Buffer.from(await request.arrayBuffer());
  if (data.length === 0 || data.length > kind.maxBytes) {
    return Response.json({ error: tooBig }, { status: 413 });
  }

  try {
    return Response.json({ url: await savePhoto(user.id, await kind.optimize(data)) });
  } catch (error) {
    if (error instanceof PhotoError) return Response.json({ error: error.message }, { status: 415 });
    throw error;
  }
}
