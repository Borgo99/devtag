import s from "./LogoMark.module.css";

/** The devtag tag, in front of the name wherever the logo appears on the main site. */
export function LogoMark() {
  return <img src="/brand/icon.svg" alt="" width={27} height={20} className={s.mark} />;
}
