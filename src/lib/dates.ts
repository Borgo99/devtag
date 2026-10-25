/** Dates in the config are "YYYY-MM" or "YYYY". "Present" is the build date. */

function parse(value: string) {
  const [year, month] = value.split("-").map(Number);
  return { year, month: month || 1, hasMonth: Boolean(month) };
}

function label(value: string) {
  const d = parse(value);
  if (!d.hasMonth) return String(d.year);
  return new Date(d.year, d.month - 1).toLocaleString("en", { month: "short", year: "numeric" });
}

/** Only when both ends have a month: "2023 – 2025" could be anything from 1 to 3 years. */
function duration(start: string, end?: string) {
  const a = parse(start);
  const now = new Date();
  const b = end ? parse(end) : { year: now.getFullYear(), month: now.getMonth() + 1, hasMonth: true };
  if (!a.hasMonth || !b.hasMonth) return "";
  const months = (b.year - a.year) * 12 + (b.month - a.month) + 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

export function period(start?: string, end?: string) {
  if (!start) return { range: "", duration: "" };
  return {
    range: `${label(start)} — ${end ? label(end) : "Present"}`,
    duration: duration(start, end),
  };
}
