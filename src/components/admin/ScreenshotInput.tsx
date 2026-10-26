"use client";

import { useRef, useState } from "react";
import photo from "./PhotoInput.module.css";
import s from "./ScreenshotInput.module.css";

/** Same as the server's limits (lib/photos.ts): the browser does the heavy resizing before the upload. */
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 4000;

/**
 * The screenshot is resized in the browser (at most 1600 px wide, a whole-page capture cut at 4000 px)
 * and sent as a high-quality JPEG, so even a big Retina capture uploads quickly. The server re-encodes it.
 */
async function resized(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, MAX_WIDTH / image.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.min(Math.round(image.naturalHeight * scale), MAX_HEIGHT);
    canvas.getContext("2d")!.drawImage(image, 0, 0, image.naturalWidth * scale, image.naturalHeight * scale);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/jpeg", 0.92),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** A project's screenshot: shown at the top of its card (16:10) and whole on the project page. */
export function ScreenshotInput({ value, onChange }: { value?: string; onChange: (url?: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(file: File) {
    setBusy(true);
    setError(undefined);
    try {
      const body = await resized(file).catch(() => {
        throw new Error("Couldn't open this image. Try a JPEG or PNG.");
      });
      const res = await fetch("/api/photo?kind=screenshot", {
        method: "POST",
        headers: { "content-type": "image/jpeg" },
        body,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      onChange(data.url);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s.screenshot}>
      <div className={s.preview}>{value ? <img src={value} alt="" /> : <span>no screenshot</span>}</div>
      <div className={photo.side}>
        <div className={photo.buttons}>
          <button type="button" className={photo.button} disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : value ? "Change screenshot" : "Upload screenshot"}
          </button>
          {value && (
            <button type="button" className={photo.link} onClick={() => onChange(undefined)}>
              Remove
            </button>
          )}
        </div>
        <p className={error ? photo.error : photo.hint}>
          {error ?? "Optional. The card shows its top, at 16:10. Without one, the site's preview image is used."}
        </p>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
