"use client";

import { useState } from "react";
import type { PortfolioConfig } from "@/lib/types";
import { ImportOverlay } from "./ImportOverlay";
import { useCvImport } from "./useCvImport";
import s from "./CvImport.module.css";

/** How long the finished state stays on screen before the overlay closes. */
const DONE_MS = 1600;

/**
 * The editor's CV import (useCvImport, with /api/cv): the editor gets the new config. An overlay covers the editor
 * meanwhile (ImportOverlay); Cancel aborts the request.
 */
export function CvImport({
  replaces,
  onImport,
}: {
  replaces: boolean;
  onImport: (config: PortfolioConfig, file: string) => void;
}) {
  const [over, setOver] = useState(false);
  const { step, busy, load, cancel } = useCvImport({
    endpoint: "/api/cv",
    ask: () => !replaces || confirm("Replace your page with what's in this CV? Your photo and colors stay."),
    noText: "Fill in your page below instead.",
    onImport: (data, file) => onImport((data as { config: PortfolioConfig }).config, file),
    closeAfter: DONE_MS,
  });

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
