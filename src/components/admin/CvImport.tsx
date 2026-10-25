"use client";

import { useRef, useState } from "react";
import type { PortfolioConfig } from "@/lib/types";
import { ImportOverlay, type PdfStats } from "./ImportOverlay";
import s from "./CvImport.module.css";

type Step =
  | { kind: "idle" }
  | { kind: "error"; message: string }
  | { kind: "reading"; file: string }
  | { kind: "thinking"; file: string; pdf: PdfStats }
  | { kind: "done"; file: string; pdf: PdfStats };

/** How long the finished state stays on screen before the overlay closes. */
const DONE_MS = 1600;

/**
 * Drop a CV → pdf.js reads it here in the browser (two-column fix included) → the text goes to
 * /api/cv, where the AI turns it into a page → the editor gets the new config.
 * An overlay covers the editor meanwhile (ImportOverlay); Cancel aborts the request.
 */
export function CvImport({
  replaces,
  onImport,
}: {
  replaces: boolean;
  onImport: (config: PortfolioConfig, file: string) => void;
}) {
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [over, setOver] = useState(false);
  const request = useRef<AbortController>(undefined);
  const busy = step.kind === "reading" || step.kind === "thinking" || step.kind === "done";

  async function load(file: File) {
    if (busy) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return setStep({ kind: "error", message: "That's not a PDF. Export your CV as PDF and drop it here." });
    }
    if (replaces && !confirm("Replace your page with what's in this CV? Your photo and colors stay.")) return;

    const abort = new AbortController();
    request.current = abort;
    setStep({ kind: "reading", file: file.name });
    try {
      const { readPdf } = await import("@/lib/cv/read-pdf");
      const { text, pages, twoColumnPages } = await readPdf(file);
      if (abort.signal.aborted) return;
      if (text.trim().length < 50) {
        return setStep({
          kind: "error",
          message: "This PDF has no text to read (it's probably a scan). Fill in your page below instead.",
        });
      }
      const pdf = { pages, chars: text.length, twoColumnPages };
      setStep({ kind: "thinking", file: file.name, pdf });

      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: abort.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "The import failed. Try again.");
      onImport(data.config, file.name);
      setStep({ kind: "done", file: file.name, pdf });
      window.setTimeout(() => setStep((current) => (current.kind === "done" ? { kind: "idle" } : current)), DONE_MS);
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

  return (
    <label
      className={s.drop}
      data-over={over || undefined}
      data-busy={busy || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const file = e.dataTransfer.files[0];
        if (file) load(file);
      }}
    >
      <input
        type="file"
        accept="application/pdf,.pdf"
        hidden
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) load(file);
          e.target.value = "";
        }}
      />

      <span className={s.icon} aria-hidden>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M12 18v-6M9 15l3-3 3 3" />
        </svg>
      </span>
      <span className={s.title}>Import your CV</span>
      <span className={s.text}>
        Drop a PDF here or <u>choose a file</u>. It's read in your browser; only its text is sent to the AI that fills
        in your page.
      </span>
      {step.kind === "error" && <span className={s.error}>{step.message}</span>}

      {(step.kind === "reading" || step.kind === "thinking" || step.kind === "done") && (
        <ImportOverlay
          file={step.file}
          stage={step.kind}
          pdf={step.kind === "reading" ? undefined : step.pdf}
          onCancel={cancel}
        />
      )}
    </label>
  );
}
