"use client";

import { useRef, useState } from "react";
import { initials } from "@/lib/text";
import s from "./PhotoInput.module.css";

const SIZE = 512;

/**
 * The photo is cropped to a centered square and resized in the browser, so even a big phone photo
 * uploads quickly. It's sent as a lossless PNG: the server compresses it once, into the final JPEG.
 */
async function squarePng(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      SIZE,
      SIZE,
    );
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob"))), "image/png"),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PhotoInput({
  value,
  name,
  onChange,
}: {
  value?: string;
  name: string;
  onChange: (url?: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function upload(file: File) {
    setBusy(true);
    setError(undefined);
    try {
      const body = await squarePng(file).catch(() => {
        throw new Error("Couldn't open this image. Try a JPEG or PNG.");
      });
      const res = await fetch("/api/photo", { method: "POST", headers: { "content-type": "image/png" }, body });
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
    <div className={s.photo}>
      <div className={s.face}>{value ? <img src={value} alt="" /> : <span>{initials(name || "?")}</span>}</div>
      <div className={s.side}>
        <div className={s.buttons}>
          <button type="button" className={s.button} disabled={busy} onClick={() => input.current?.click()}>
            {busy ? "Uploading…" : value ? "Change photo" : "Upload photo"}
          </button>
          {value && (
            <button type="button" className={s.link} onClick={() => onChange(undefined)}>
              Remove
            </button>
          )}
        </div>
        <p className={error ? s.error : s.hint}>
          {error ?? "Square works best. Without a photo, your initials are shown."}
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
