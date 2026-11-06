"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioConfig } from "@/lib/types";
import { cleanConfig } from "@/lib/clean";
import { cvDocument, PHONE, type CvLength } from "@/lib/cv/document";
import { missingCharacters } from "@/lib/cv/fonts";
import { Text } from "./fields";
import s from "./SharePanel.module.css";
import c from "./CvPanel.module.css";

interface Props {
  /** The editor's draft, as it is now: the PDF doesn't wait for it to be saved. */
  config: PortfolioConfig;
  /** The live page, once there is one: its address goes in the CV's contacts. */
  pageUrl?: string;
  /** The saved phone number, "" if none. */
  phone: string;
  savePhone: (phone: string) => Promise<boolean>;
  onClose: () => void;
}

const LENGTHS: { id: CvLength; title: string; text: string; sheets: number }[] = [
  { id: "one", title: "One page", text: "The essentials, sized to fit one page.", sheets: 1 },
  { id: "full", title: "Everything", text: "All your sections and points, on more pages if needed.", sheets: 3 },
];

/** "Ada Lovelace" → Ada-Lovelace-CV.pdf */
const fileName = (name: string) =>
  `${name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[\\/:*?"<>|]/g, "")}-CV.pdf`;

/**
 * The CV as a PDF, made in this browser (components/cv/CvPdf, loaded when the panel opens) in a classic
 * one-column layout. The panel shows the top of the CV, so a phone number reads as something to put on it,
 * never as something asked to download it. The number is kept for next time, and never shown on the page.
 */
export function CvPanel({ config, pageUrl, phone: initial, savePhone, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pdfModule = useRef<Promise<typeof import("@/components/cv/CvPdf")>>(undefined);
  const saved = useRef(initial);
  const [length, setLength] = useState<CvLength>("one");
  const [phone, setPhone] = useState(initial);
  const [addingPhone, setAddingPhone] = useState(Boolean(initial));
  const [making, setMaking] = useState(false);
  const [note, setNote] = useState<{ text: string; error?: boolean }>();

  // A native modal: focus stays inside, Esc closes it, the editor behind can't be clicked. The PDF code
  // starts loading now, so it's there by the time "Download" is clicked.
  useEffect(() => {
    dialog.current?.showModal();
    pdfModule.current = import("@/components/cv/CvPdf");
  }, []);

  const number = phone.trim();
  const validPhone = !number || PHONE.test(number);
  const clean = useMemo(() => cleanConfig(config, { complete: true }), [config]);
  const cv = cvDocument(clean, { length, phone: validPhone ? number || undefined : undefined, pageUrl });
  const missing = missingCharacters(cv);

  /** Saves the number if it changed. False: it couldn't be saved. */
  async function keepPhone() {
    if (!validPhone || number === saved.current) return true;
    if (!(await savePhone(number).catch(() => false))) return false;
    saved.current = number;
    return true;
  }

  async function download() {
    if (!validPhone) return setNote({ text: "That doesn't look like a phone number.", error: true });
    setMaking(true);
    setNote(undefined);
    let pages: number;
    try {
      const { makeCvPdf } = await (pdfModule.current ??= import("@/components/cv/CvPdf"));
      const made = await makeCvPdf(cv, length);
      pages = made.pages;
      const url = URL.createObjectURL(made.blob);
      // Inside the dialog: while it's open, the rest of the page is inert.
      const link = Object.assign(document.createElement("a"), { href: url, download: fileName(cv.name) });
      dialog.current?.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error("[cv pdf]", error);
      // A failed load stays failed: the next try loads the PDF code again.
      pdfModule.current = undefined;
      return setNote({ text: "The PDF couldn't be made. Check your connection and try again.", error: true });
    } finally {
      setMaking(false);
    }
    const kept = await keepPhone();
    setNote(
      !kept
        ? { text: "Downloaded, but your phone number wasn't saved for next time.", error: true }
        : length === "one" && pages > 1
          ? { text: `Downloaded on ${pages} pages: it doesn't fit on one, even smaller. Shorten some points.` }
          : { text: "Downloaded. Check your downloads folder." },
    );
  }

  function addPhone() {
    setAddingPhone(true);
    // The field appears on the next render.
    window.setTimeout(() => dialog.current?.querySelector<HTMLInputElement>("input[type=tel]")?.focus());
  }

  return (
    <dialog
      ref={dialog}
      className={s.dialog}
      aria-labelledby="cv-title"
      onClose={() => {
        keepPhone();
        onClose();
      }}
      // A click on the backdrop lands on the dialog itself.
      onClick={(e) => e.target === dialog.current && dialog.current.close()}
    >
      <div className={s.bar}>
        <span className={s.dots} aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span id="cv-title" className={s.barTitle}>
          Your CV as a PDF
        </span>
      </div>

      <div className={`${s.live} ${c.intro}`}>
        <p>A classic one-column CV made from your page: the layout recruiters and job sites read best.</p>
      </div>

      <fieldset className={c.part}>
        <legend className={c.label}>Length</legend>
        <div className={c.cards}>
          {LENGTHS.map((option) => (
            <label key={option.id} className={c.card} data-checked={length === option.id || undefined}>
              <input
                type="radio"
                className="sr-only"
                name="cv-length"
                checked={length === option.id}
                onChange={() => setLength(option.id)}
              />
              <span className={c.sheets} aria-hidden>
                {Array.from({ length: option.sheets }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
              <strong>{option.title}</strong>
              <span className={c.cardText}>{option.text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <section className={c.part} aria-labelledby="cv-top">
        <h3 id="cv-top" className={c.label}>
          The top of your CV
        </h3>
        <div className={c.paper}>
          <p className={c.paperName}>{cv.name}</p>
          {cv.contacts.length > 0 && (
            <p className={c.paperContacts}>
              {cv.contacts.map((contact, i) => (
                <Fragment key={contact.text}>
                  {i > 0 && " | "}
                  {contact.text === number ? (
                    <mark>{contact.text}</mark>
                  ) : contact.href ? (
                    <u>{contact.text}</u>
                  ) : (
                    contact.text
                  )}
                </Fragment>
              ))}
            </p>
          )}
        </div>
        {addingPhone ? (
          <>
            <div className={c.phone}>
              <Text
                label="Phone number"
                hint="Optional"
                type="tel"
                placeholder="+39 333 123 4567"
                pattern={PHONE}
                value={phone}
                onChange={setPhone}
              />
              <button
                type="button"
                className={c.textButton}
                onClick={() => {
                  setPhone("");
                  setAddingPhone(false);
                }}
              >
                Remove
              </button>
            </div>
            <p className={c.phoneNote}>Only on your CV, never on your page. Kept for your next PDF.</p>
          </>
        ) : (
          <button type="button" className={c.textButton} onClick={addPhone}>
            + Add a phone number
          </button>
        )}
      </section>

      {missing.length > 0 && (
        <p className={c.warning}>
          The PDF&apos;s font only has Latin letters, so {missing.slice(0, 8).join(" ")}
          {missing.length > 8 ? "…" : ""} will be missing from your CV.
        </p>
      )}

      <div className={s.foot}>
        <span className={note?.error ? c.error : s.note} role="status">
          {note?.text ?? "From your page as it is now."}
        </span>
        <div className={c.actions}>
          <button type="button" className={s.done} onClick={() => dialog.current?.close()}>
            Close
          </button>
          <button type="button" className={s.copy} onClick={download} disabled={making}>
            {making ? "Making…" : "Download PDF"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
