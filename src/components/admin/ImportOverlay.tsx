"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import s from "./ImportOverlay.module.css";

export interface PdfStats {
  pages: number;
  chars: number;
  twoColumnPages: number;
}

interface Props {
  file: string;
  stage: "reading" | "thinking" | "done";
  /** Known once the PDF is read. */
  pdf?: PdfStats;
  onCancel: () => void;
}

/** What the AI works on, shown in turn while it does. A description, not a progress report. */
const HINTS = [
  "sorting your jobs and dates",
  "finding your projects and links",
  "picking your top skills",
  "grouping your stack",
  "writing short highlights",
];
const HINT_SECONDS = 3;

const plural = (n: number, word: string) => `${n.toLocaleString("en")} ${word}${n === 1 ? "" : "s"}`;

/**
 * Covers the editor while a CV is imported: a PDF sheet is scanned, then turns into a page that
 * builds itself. The log below it only states facts (what was read, seconds elapsed); there is no
 * made-up percentage. Cancel or Esc stops the import.
 */
export function ImportOverlay({ file, stage, pdf, onCancel }: Props) {
  const cancel = useRef<HTMLButtonElement>(null);
  const [seconds, setSeconds] = useState(0);

  // A dialog: focus moves in, the page behind stops scrolling, and both come back on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancel.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    if (stage !== "thinking") return;
    const start = Date.now();
    setSeconds(0);
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  const hint = HINTS[Math.floor(seconds / HINT_SECONDS) % HINTS.length];

  return createPortal(
    <div
      className={s.overlay}
      onKeyDown={(e) => {
        if (e.key === "Escape" && stage !== "done") onCancel();
        // The Cancel button is the only control: keep focus inside the dialog.
        if (e.key === "Tab") {
          e.preventDefault();
          cancel.current?.focus();
        }
      }}
    >
      <div className={s.card} role="dialog" aria-modal="true" aria-labelledby="import-title" data-stage={stage}>
        <div className={s.bar}>
          <span className={s.dots} aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span id="import-title" className={s.barTitle}>
            {stage === "done" ? "Your page is ready" : "Importing your CV"}
          </span>
        </div>

        <div className={s.stage} aria-hidden>
          <div className={s.sheet}>
            <b>PDF</b>
            {[92, 70, 84, 58, 78, 48, 88, 64].map((width, i) => (
              <i key={i} style={{ width: `${width}%` }} />
            ))}
            <span className={s.beam} />
          </div>

          <div className={s.flow}>
            <span />
            <span />
            <span />
          </div>

          <div className={s.page}>
            <div className={s.pageBar}>
              <i />
              <i />
              <i />
            </div>
            <div className={s.pageBody}>
              <span className={s.avatar}>
                <span className={s.halo} />
                <span className={s.face} />
              </span>
              <span className={s.name} />
              <span className={s.role} />
              <span className={s.pills}>
                <i />
                <i />
                <i />
              </span>
              <span className={s.lines}>
                <i />
                <i />
              </span>
            </div>
            <span className={s.live}>live</span>
          </div>
        </div>

        <div className={s.log} aria-live="polite">
          <p>
            <span className={s.dollar}>$</span> devtag import {file}
          </p>
          {stage === "reading" ? (
            <p className={s.working}>reading the PDF in your browser</p>
          ) : (
            pdf && (
              <>
                <p className={s.ok}>
                  ✓ read {plural(pdf.pages, "page")} · {plural(pdf.chars, "character")}
                </p>
                {pdf.twoColumnPages > 0 && <p className={s.ok}>✓ two-column layout put in reading order</p>}
              </>
            )
          )}
          {stage === "thinking" && (
            <p className={s.row}>
              <span className={s.working}>{hint}</span>
              <span className={s.time}>{seconds}s</span>
            </p>
          )}
          {stage === "done" && <p className={s.ok}>✓ your page is filled in: check it, then publish</p>}
        </div>

        <div className={s.foot}>
          <span className={s.note}>
            {stage === "done" ? 'Sections filled from your CV are marked "check".' : "Long CVs take a little longer."}
          </span>
          <button ref={cancel} type="button" className={s.cancel} onClick={onCancel} disabled={stage === "done"}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
