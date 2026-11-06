"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { PortfolioConfig } from "@/lib/types";
import { cleanConfig, publishProblems } from "@/lib/clean";
import { isWebAddress } from "@/lib/text";
import { LogoMark } from "@/components/site/LogoMark";
import { CompaniesSection, type Matching } from "./CompaniesSection";
import { CvImport } from "./CvImport";
import { CvPanel } from "./CvPanel";
import { Preview } from "./Preview";
import { Sections, type SectionId } from "./Sections";
import { SharePanel } from "./SharePanel";
import s from "./Editor.module.css";

interface Props {
  /** "andrea.devtag.io" */
  address: string;
  pageUrl: string;
  draft: PortfolioConfig;
  review: string[];
  /** The live page exists and matches the draft. */
  upToDate: boolean;
  everPublished: boolean;
  /** Visitors of the live page: all time, and in the last 7 days. */
  visits?: { total: number; week: number };
  matching: Matching;
  saveMatching: (matching: Matching) => Promise<boolean>;
  /** Only for the CV as a PDF, never on the page. "" if none. */
  phone: string;
  savePhone: (phone: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

type SaveState = "saved" | "saving" | "error";

const SAVE_DELAY = 700;
/** Wait for the address to be typed out before reading the site. */
const SITE_DELAY = 1500;
/** The form's width next to the preview, until the line between them is dragged. */
const FORM_WIDTH = 600;
/** The narrowest each side can be dragged to; the same as in Editor.module.css. 420: room for the phone view. */
const FORM_MIN = 380;
const PREVIEW_MIN = 420;

/**
 * Whether an import would overwrite something the user wrote, so it asks first. The name doesn't count:
 * a new page gets it from the sign-in account, and the CV has it too.
 */
const hasContent = (c: PortfolioConfig) =>
  Boolean(
    c.profile.role ||
    c.profile.about ||
    c.links?.length ||
    c.topSkills?.length ||
    c.skills.length ||
    c.stack?.length ||
    c.languages?.length ||
    c.experience?.length ||
    c.projects?.length ||
    c.education?.length ||
    c.publications?.length,
  );

/** Sections an import filled, to mark them "check". */
function filledSections(c: PortfolioConfig): SectionId[] {
  const filled: Record<SectionId, unknown> = {
    profile: c.profile.name || c.profile.role || c.profile.about,
    links: c.links?.length,
    skills: c.topSkills?.length || c.skills.length,
    stack: c.stack?.length,
    languages: c.languages?.length,
    experience: c.experience?.length,
    projects: c.projects?.length,
    education: c.education?.length,
    publications: c.publications?.length,
  };
  return (Object.keys(filled) as SectionId[]).filter((id) => filled[id]);
}

/**
 * The admin panel: the form on the left, the live preview on the right. Every change is saved as a
 * draft after a short pause; Publish copies the draft to the public page.
 */
export function Editor({
  address,
  pageUrl,
  draft,
  review: initialReview,
  upToDate,
  everPublished,
  visits,
  matching,
  saveMatching,
  phone: initialPhone,
  savePhone,
  signOut,
}: Props) {
  const [config, setConfig] = useState(draft);
  const [review, setReview] = useState(initialReview);
  const [save, setSave] = useState<SaveState>("saved");
  const [live, setLive] = useState({ upToDate, everPublished });
  const [publishing, setPublishing] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [makingPdf, setMakingPdf] = useState(false);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState<string>();
  const [version, setVersion] = useState(0);
  const [view, setView] = useState<"edit" | "preview">("edit");
  // Wide screens: the preview can be hidden to give the form the whole width (narrow ones use the tabs).
  const [showPreview, setShowPreview] = useState(true);
  const [formWidth, setFormWidth] = useState(FORM_WIDTH);
  const [resizing, setResizing] = useState(false);
  const main = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLDivElement>(null);

  /** Dragging the line between the form and the preview: the form follows the pointer, within both minimums. */
  function resize(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    const line = event.currentTarget;
    // From the width shown, which can be less than formWidth after the window got narrower.
    const offset = event.clientX - form.current!.offsetWidth;
    const max = main.current!.clientWidth - line.offsetWidth - PREVIEW_MIN;
    const move = (e: globalThis.PointerEvent) =>
      setFormWidth(Math.round(Math.min(max, Math.max(FORM_MIN, e.clientX - offset))));
    line.setPointerCapture(event.pointerId);
    line.addEventListener("pointermove", move);
    line.addEventListener(
      "lostpointercapture",
      () => {
        line.removeEventListener("pointermove", move);
        setResizing(false);
      },
      { once: true },
    );
    setResizing(true);
  }

  const body = JSON.stringify({ draft: config, review });
  const saved = useRef(body);
  const timer = useRef<number>(undefined);
  // Saves run one after another, so an older one can never land after a newer one.
  const queue = useRef(Promise.resolve(true));

  const persist = useCallback((next: string) => {
    window.clearTimeout(timer.current);
    queue.current = queue.current.then(async () => {
      if (next === saved.current) return true;
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: next,
      }).catch(() => undefined);
      if (!res?.ok) {
        setSave("error");
        return false;
      }
      saved.current = next;
      setSave("saved");
      setLive((l) => ({ ...l, upToDate: false }));
      setVersion((v) => v + 1);
      return true;
    });
    return queue.current;
  }, []);

  useEffect(() => {
    if (body === saved.current) return;
    setSave("saving");
    timer.current = window.setTimeout(() => persist(body), SAVE_DELAY);
    return () => window.clearTimeout(timer.current);
  }, [body, persist]);

  // A project's live site is read once for its preview image and logo (api/site-preview). `site.url`
  // records the address that was read, so a changed address is read again; failures aren't retried.
  const reading = useRef(new Set<string>());
  useEffect(() => {
    const address = config.projects?.find(
      (p) => p.url && isWebAddress(p.url) && p.site?.url !== p.url && !reading.current.has(p.url),
    )?.url;
    if (!address) return;
    const timer = window.setTimeout(async () => {
      reading.current.add(address);
      const res = await fetch("/api/site-preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: address }),
      }).catch(() => undefined);
      const data = await res?.json().catch(() => ({}));
      if (res?.status === 429) setMessage(data.error);
      const found = res?.ok ? { image: data.image, logo: data.logo } : {};
      reading.current.delete(address);
      setConfig((c) => ({
        ...c,
        projects: c.projects?.map((p) =>
          p.url === address && p.site?.url !== address ? { ...p, site: { url: address, ...found } } : p,
        ),
      }));
    }, SITE_DELAY);
    return () => window.clearTimeout(timer);
  }, [config.projects]);

  // Don't lose the last keystrokes when the tab closes.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (save !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [save]);

  const update = (patch: Partial<PortfolioConfig>) => setConfig((c) => ({ ...c, ...patch }));

  const problems = publishProblems(cleanConfig(config, { complete: true }));

  async function publish() {
    setPublishing(true);
    setMessage(undefined);
    try {
      if (!(await persist(body))) throw new Error("Your last changes aren't saved yet. Try again.");
      const res = await fetch("/api/profile/publish", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Publishing failed. Try again.");
      setLive({ upToDate: true, everPublished: true });
      // The first time the page goes live is when it's worth sharing.
      if (!live.everPublished) setSharing(true);
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setPublishing(false);
    }
  }

  function imported(next: PortfolioConfig, file: string) {
    // Things a CV doesn't say, or that are the user's choice, stay as they are.
    setConfig({
      ...next,
      profile: {
        ...next.profile,
        basedIn: next.profile.basedIn ?? config.profile.basedIn,
        image: config.profile.image,
        seniority: config.profile.seniority,
        years: config.profile.years,
      },
      openToWork: config.openToWork,
      theme: config.theme,
      portfolioStyle: config.portfolioStyle,
    });
    setReview(filledSections(next));
    setMessage(`Filled in from ${file}. Check the sections marked "check", then publish.`);
  }

  const status = {
    saving: "Saving…",
    error: "Not saved: check your connection",
    saved: live.upToDate ? "Published" : live.everPublished ? "Unpublished changes" : "Draft saved: not published yet",
  }[save];

  return (
    <div className={s.shell}>
      <header className={s.top}>
        <a href="/" className={s.logo}>
          <LogoMark />
          devtag<span className={s.cursor}>_</span>
        </a>
        <a
          className={s.address}
          href={live.everPublished ? pageUrl : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!live.everPublished || undefined}
          title={live.everPublished ? "Open your live page" : "Publish to put your page online"}
        >
          {address}
          {live.everPublished && <span aria-hidden> ↗</span>}
        </a>
        <span className={s.status} data-state={save === "saved" && live.upToDate ? "live" : save}>
          {status}
        </span>
        {visits && (
          <span className={s.visits} title="Visitors of your live page, each counted once a day. Bots are left out.">
            {visits.total} {visits.total === 1 ? "visitor" : "visitors"} · {visits.week} this week
          </span>
        )}
        <div className={s.actions}>
          <button
            type="button"
            className={s.togglePreview}
            aria-pressed={!showPreview}
            onClick={() => setShowPreview((shown) => !shown)}
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <div className={s.tabs} role="group" aria-label="View">
            {(["edit", "preview"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => {
                  setView(v);
                  if (v === "preview") setShowPreview(true);
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <button type="button" className={s.share} onClick={() => setMakingPdf(true)}>
            PDF
          </button>
          {live.everPublished && (
            <button type="button" className={s.share} onClick={() => setSharing(true)}>
              Share
            </button>
          )}
          <button
            type="button"
            className={s.publish}
            disabled={publishing || problems.length > 0 || (live.upToDate && save === "saved")}
            title={problems.join(" ") || undefined}
            onClick={publish}
          >
            {publishing ? "Publishing…" : "Publish"}
          </button>
          <form action={signOut}>
            <button className={s.signOut}>Sign out</button>
          </form>
        </div>
      </header>

      <div
        ref={main}
        className={s.main}
        data-view={view}
        data-preview={showPreview ? undefined : "hidden"}
        data-resizing={resizing || undefined}
        style={{ "--form-width": `${formWidth}px` } as CSSProperties}
      >
        <div ref={form} className={s.form}>
          {(message || problems.length > 0) && (
            <p className={s.message}>{message ?? `${problems.join(" ")} Then you can publish.`}</p>
          )}
          <CvImport replaces={hasContent(config)} onImport={imported} />
          <Sections
            config={config}
            update={update}
            review={review}
            reviewed={(id) => setReview((r) => r.filter((x) => x !== id))}
            companies={<CompaniesSection initial={matching} save={saveMatching} />}
          />
        </div>
        {/* Hidden, it's not rendered at all: no reloads on every save. */}
        {showPreview && (
          <>
            <div className={s.divider} onPointerDown={resize} title="Drag to resize" aria-hidden />
            <div className={s.previewPane}>
              <Preview version={version} address={address} />
            </div>
          </>
        )}
      </div>
      {sharing && <SharePanel address={address} pageUrl={pageUrl} onClose={() => setSharing(false)} />}
      {makingPdf && (
        <CvPanel
          config={config}
          pageUrl={live.everPublished && pageUrl.startsWith("http") ? pageUrl : undefined}
          phone={phone}
          savePhone={async (next) => {
            const ok = await savePhone(next);
            if (ok) setPhone(next);
            return ok;
          }}
          onClose={() => setMakingPdf(false)}
        />
      )}
    </div>
  );
}
