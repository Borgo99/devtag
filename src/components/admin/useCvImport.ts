"use client";

import { useRef, useState } from "react";
import type { PdfStats } from "./ImportOverlay";

export type ImportStep =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "reading"; file: string }
  | { kind: "thinking"; file: string; pdf: PdfStats }
  | { kind: "done"; file: string; pdf: PdfStats };

interface Options {
  /** POST { text } here: /api/cv in the editor, /api/cv/guest on the landing. */
  endpoint: string;
  /** Asked before the import starts; false stops it. */
  ask?: () => boolean;
  /** What to do instead, when the PDF has no text. */
  noText: string;
  /** The endpoint's answer, once the import worked. */
  onImport: (data: unknown, file: string) => void;
  /** Back to idle this long after it's done; without it, the overlay stays (the landing moves on to /preview). */
  closeAfter?: number;
}

/**
 * Drop a CV → pdf.js reads it here in the browser (two-column fix included) → the text goes to the endpoint, where
 * the AI turns it into a page. `step` drives the ImportOverlay meanwhile; cancel() aborts the request.
 */
export function useCvImport({ endpoint, ask, noText, onImport, closeAfter }: Options) {
  const [step, setStep] = useState<ImportStep>({ kind: "idle" });
  const request = useRef<AbortController>(undefined);
  const busy = step.kind === "reading" || step.kind === "thinking" || step.kind === "done";

  async function load(file: File) {
    if (busy) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return setStep({ kind: "error", message: "That's not a PDF. Export your CV as PDF and drop it here." });
    }
    if (ask && !ask()) return;

    const abort = new AbortController();
    request.current = abort;
    setStep({ kind: "reading", file: file.name });
    try {
      const { readPdf } = await import("@/lib/cv/read-pdf");
      const { text, pages, twoColumnPages } = await readPdf(file);
      if (abort.signal.aborted) return;
      if (text.trim().length < 50) {
        return setStep({ kind: "error", message: `This PDF has no text to read (it's probably a scan). ${noText}` });
      }
      const pdf = { pages, chars: text.length, twoColumnPages };
      setStep({ kind: "thinking", file: file.name, pdf });

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "The import failed. Try again.");
      onImport(data, file.name);
      setStep({ kind: "done", file: file.name, pdf });
      if (closeAfter) {
        window.setTimeout(
          () => setStep((current) => (current.kind === "done" ? { kind: "idle" } : current)),
          closeAfter,
        );
      }
    } catch (e) {
      if (abort.signal.aborted) return; // cancelled: cancel() has already reset the state
      const message = (e as Error).name === "InvalidPDFException" ? "This PDF looks damaged." : (e as Error).message;
      setStep({ kind: "error", message });
    }
  }

  function cancel() {
    request.current?.abort();
    setStep({ kind: "idle" });
  }

  return { step, busy, load, cancel };
}
