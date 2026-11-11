"use client";

import { useEffect, useRef, useState } from "react";
import { ImportOverlay } from "@/components/admin/ImportOverlay";
import { useCvImport } from "@/components/admin/useCvImport";
import s from "./TryCv.module.css";

/**
 * The landing's call to action: drop your CV or choose it, and see your page at /preview, without an account. Read
 * in the browser like the editor's import; /api/cv/guest makes the page. A file dropped anywhere on the landing
 * counts too, so a near miss doesn't open the PDF in the browser instead.
 */
export function TryCv({ className = "" }: { className?: string }) {
  const [over, setOver] = useState(false);
  const { step, busy, load, cancel } = useCvImport({
    endpoint: "/api/cv/guest",
    noText: "Claim your address at the bottom of this page and fill in your page by hand.",
    onImport: () => window.location.assign("/preview"),
  });

  // A file dragged over the page lights the box up; dropped anywhere, it's imported. Subscribed once, so the
  // timer that turns the light off survives renders; `latest` is the current load().
  const latest = useRef(load);
  useEffect(() => {
    latest.current = load;
  });
  useEffect(() => {
    let timer: number | undefined;
    const hasFile = (e: DragEvent) => e.dataTransfer?.types.includes("Files");
    const dragover = (e: DragEvent) => {
      if (!hasFile(e)) return;
      e.preventDefault();
      setOver(true);
      // dragover repeats while the file is over the page: when it stops, the file has left.
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setOver(false), 150);
    };
    const drop = (e: DragEvent) => {
      if (!hasFile(e)) return;
      e.preventDefault();
      window.clearTimeout(timer);
      setOver(false);
      const file = e.dataTransfer?.files[0];
      if (file) latest.current(file);
    };
    window.addEventListener("dragover", dragover);
    window.addEventListener("drop", drop);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("dragover", dragover);
      window.removeEventListener("drop", drop);
    };
  }, []);

  return (
    <div className={`${s.wrap} ${className}`}>
      <label className={s.box} data-over={over || undefined} data-busy={busy || undefined}>
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
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
        <span className={s.text}>
          <strong>{over ? "Drop it to see your page" : "Drop your CV here"}</strong>
          <span>PDF, read in your browser</span>
        </span>
        <span className={s.button}>
          Choose your CV<span className={s.format}> (PDF)</span> →
        </span>
      </label>
      <p className={s.status} data-state={step.kind === "error" ? "error" : undefined} aria-live="polite">
        {step.kind === "error" ? (
          step.message
        ) : (
          <>
            By choosing a CV you accept the <a href="/terms">terms</a> and the <a href="/privacy">privacy policy</a>.
          </>
        )}
      </p>

      {(step.kind === "reading" || step.kind === "thinking" || step.kind === "done") && (
        <ImportOverlay
          file={step.file}
          stage={step.kind}
          pdf={step.kind === "reading" ? undefined : step.pdf}
          onCancel={cancel}
          guest
        />
      )}
    </div>
  );
}
