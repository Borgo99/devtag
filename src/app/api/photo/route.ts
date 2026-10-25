import { optimizePhoto, PhotoError } from "@/lib/photos";
import { currentUser } from "@/lib/session";
import { savePhoto } from "@/lib/store";

/**
 * POST the image itself as the body (the editor sends the 512×512 square it cropped, as a PNG)
 * → { url } in S3/CloudFront. The server doesn't trust what it receives: lib/photos.ts decodes it,
 * checks it and re-encodes it as a small JPEG before it's stored.
 */

const MAX_BYTES = 2_000_000;

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Sign in again." }, { status: 401 });

  if (!request.headers.get("content-type")?.startsWith("image/")) {
    return Response.json({ error: "Send an image." }, { status: 415 });
  }
  // Refuse big bodies before reading them when the size is announced, and after reading otherwise.
  if (Number(request.headers.get("content-length")) > MAX_BYTES) {
    return Response.json({ error: "The image must be smaller than 2 MB." }, { status: 413 });
  }
  const data = Buffer.from(await request.arrayBuffer());
  if (data.length === 0 || data.length > MAX_BYTES) {
    return Response.json({ error: "The image must be smaller than 2 MB." }, { status: 413 });
  }

  try {
    return Response.json({ url: await savePhoto(user.id, await optimizePhoto(data)) });
  } catch (error) {
    if (error instanceof PhotoError) return Response.json({ error: error.message }, { status: 415 });
    throw error;
  }
}
