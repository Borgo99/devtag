import s from "./Tags.module.css";

/** Plain text tags, like a paper's keywords: "#computer-chess" style. */
export function Tags({ items }: { items: string[] }) {
  return (
    <ul className={s.tags}>
      {items.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}
