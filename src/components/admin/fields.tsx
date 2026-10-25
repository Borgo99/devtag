"use client";

import { useId, useState, type ReactNode } from "react";
import type { Skill } from "@/lib/types";
import { skillName } from "@/lib/skills";
import s from "./fields.module.css";

/** Form pieces for the editor. Every field is controlled: the editor holds the whole config. */

interface FieldProps {
  label: string;
  hint?: string;
  /** Shows the field as wrong while its value is filled in and doesn't match. */
  pattern?: RegExp;
  value?: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

function Label({ id, label, hint }: { id: string; label: string; hint?: string }) {
  return (
    <span className={s.labelRow}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      {hint && <span className={s.hint}>{hint}</span>}
    </span>
  );
}

/** `list`: id of a <datalist> with suggestions. `type`: e.g. "month" for the browser's month picker. */
export function Text({
  label,
  hint,
  pattern,
  value = "",
  placeholder,
  onChange,
  list,
  type = "text",
}: FieldProps & { list?: string; type?: string }) {
  const id = useId();
  const invalid = Boolean(value && pattern && !pattern.test(value));
  return (
    <div className={s.field}>
      <Label id={id} label={label} hint={hint} />
      <input
        id={id}
        className={s.input}
        list={list}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function LongText({ label, hint, value = "", placeholder, onChange, rows = 4 }: FieldProps & { rows?: number }) {
  const id = useId();
  return (
    <div className={s.field}>
      <Label id={id} label={label} hint={hint} />
      <textarea
        id={id}
        className={s.input}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** A list of short texts, one per line (highlights, keywords). */
export function Lines({
  label,
  hint = "One per line",
  value = [],
  placeholder,
  onChange,
}: Omit<FieldProps, "value" | "onChange"> & { value?: string[]; onChange: (value: string[]) => void }) {
  return (
    <LongText
      label={label}
      hint={hint}
      rows={Math.max(3, value.length + 1)}
      value={value.join("\n")}
      placeholder={placeholder}
      onChange={(text) => onChange(text.split("\n"))}
    />
  );
}

/** Skills as chips: type and press Enter or comma; pasting "a, b, c" adds three. */
export function Chips({
  label,
  hint,
  value = [],
  max,
  placeholder = "Type a skill and press Enter",
  onChange,
}: {
  label: string;
  hint?: string;
  value?: Skill[];
  max?: number;
  placeholder?: string;
  onChange: (value: Skill[]) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const full = max !== undefined && value.length >= max;

  function add(text: string) {
    const names = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const taken = new Set(value.map((v) => skillName(v).toLowerCase()));
    const fresh = names.filter((n) => !taken.has(n.toLowerCase()));
    if (fresh.length) onChange([...value, ...fresh].slice(0, max));
    setDraft("");
  }

  return (
    <div className={s.field}>
      <Label id={id} label={label} hint={hint ?? (max ? `${value.length}/${max}` : undefined)} />
      <div className={s.chips}>
        {value.map((skill, i) => (
          <span key={i} className={s.chip}>
            {skillName(skill)}
            <button
              type="button"
              aria-label={`Remove ${skillName(skill)}`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </span>
        ))}
        {!full && (
          <input
            id={id}
            value={draft}
            placeholder={value.length ? "" : placeholder}
            onChange={(e) => (e.target.value.includes(",") ? add(e.target.value) : setDraft(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              } else if (e.key === "Backspace" && !draft && value.length) {
                onChange(value.slice(0, -1));
              }
            }}
            onBlur={() => draft && add(draft)}
          />
        )}
      </div>
    </div>
  );
}

/** One choice from a fixed list; the first option is "not set". */
export function Select<K extends string>({
  label,
  hint,
  value,
  options,
  empty = "Not set",
  onChange,
}: {
  label: string;
  hint?: string;
  value?: K;
  options: Record<K, string>;
  empty?: string;
  onChange: (value: K | undefined) => void;
}) {
  const id = useId();
  return (
    <div className={s.field}>
      <Label id={id} label={label} hint={hint} />
      <select
        id={id}
        className={s.input}
        value={value ?? ""}
        onChange={(e) => onChange((e.target.value || undefined) as K | undefined)}
      >
        <option value="">{empty}</option>
        {(Object.entries(options) as [K, string][]).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Several choices from a fixed list, as chips that switch on and off. */
export function Toggles<K extends string>({
  label,
  value = [],
  options,
  onChange,
}: {
  label: string;
  value?: K[];
  options: Record<K, string>;
  onChange: (value: K[]) => void;
}) {
  return (
    <div className={s.field} role="group" aria-label={label}>
      <span className={s.label}>{label}</span>
      <div className={s.toggles}>
        {(Object.entries(options) as [K, string][]).map(([key, text]) => {
          const on = value.includes(key);
          return (
            <button
              key={key}
              type="button"
              className={s.toggle}
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== key) : [...value, key])}
            >
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Check({
  label,
  checked,
  onChange,
}: {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={s.check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** Fields side by side on wide screens. */
export const Row = ({ children }: { children: ReactNode }) => <div className={s.row}>{children}</div>;

/**
 * A list of items (jobs, projects…): each one a card that opens to its fields, with move and delete buttons.
 * New items open right away.
 */
export function List<T>({
  items = [],
  onChange,
  create,
  addLabel,
  title,
  children,
}: {
  items?: T[];
  onChange: (items: T[]) => void;
  create: () => T;
  addLabel: string;
  /** Card title, from the item's fields. */
  title: (item: T) => string;
  children: (item: T, set: (item: T) => void) => ReactNode;
}) {
  const [opened, setOpened] = useState<number>();

  const move = (from: number, to: number) => {
    const next = [...items];
    next.splice(to, 0, ...next.splice(from, 1));
    onChange(next);
    if (opened === from) setOpened(to);
  };

  return (
    <div className={s.list}>
      {items.map((item, i) => (
        <details
          key={i}
          className={s.item}
          open={opened === i}
          onToggle={(e) => {
            const open = e.currentTarget.open;
            setOpened((current) => (open ? i : current === i ? undefined : current));
          }}
        >
          <summary className={s.itemHead}>
            <span className={s.itemTitle}>{title(item) || <em>Untitled</em>}</span>
            <span className={s.itemActions} onClick={(e) => e.preventDefault()}>
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label="Delete"
                className={s.delete}
                onClick={() => {
                  if (!title(item) || confirm(`Delete "${title(item)}"?`)) onChange(items.filter((_, j) => j !== i));
                }}
              >
                ✕
              </button>
            </span>
          </summary>
          <div className={s.itemBody}>
            {children(item, (next) => onChange(items.map((old, j) => (j === i ? next : old))))}
          </div>
        </details>
      ))}
      <button
        type="button"
        className={s.add}
        onClick={() => {
          onChange([...items, create()]);
          setOpened(items.length);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}

/** One section of the editor. `review`: filled from a CV and not checked yet. */
export function Section({
  title,
  count,
  review,
  onReviewed,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  review?: boolean;
  onReviewed?: () => void;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className={s.section} open={defaultOpen || undefined} data-review={review || undefined}>
      <summary className={s.sectionHead}>
        <span className={s.sectionTitle}>{title}</span>
        {count !== undefined && count > 0 && <span className={s.count}>{count}</span>}
        {review && <span className={s.badge}>check</span>}
        <span className={s.chevron} aria-hidden />
      </summary>
      <div className={s.sectionBody}>
        {review && (
          <div className={s.reviewBar}>
            <span>Filled from your CV. The AI can misread things: check it, then</span>
            <button type="button" onClick={onReviewed}>
              Looks right ✓
            </button>
          </div>
        )}
        {children}
      </div>
    </details>
  );
}
