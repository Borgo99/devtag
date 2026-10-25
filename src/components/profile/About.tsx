import { paragraphs } from "@/lib/text";
import s from "./About.module.css";

/** The about text. A blank line in the config starts a new paragraph. */
export function About({ text }: { text: string }) {
  return (
    <div className={`${s.about} reveal`}>
      {paragraphs(text).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
