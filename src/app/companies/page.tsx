import type { Metadata } from "next";
import { TextPage } from "@/components/site/TextPage";
import landing from "@/components/landing/Landing.module.css";
import { COMPANY } from "@/lib/site";
import s from "./companies.module.css";

export const metadata: Metadata = {
  title: "For companies — devtag",
  description: "Hiring developers? devtag pages show what they've built, the stack they use and when they're free.",
};

/** The email opens with the questions we'd ask anyway. */
const mail = `mailto:${COMPANY.email}?${new URLSearchParams({
  subject: "devtag for companies",
  body: "Hi, we're hiring for:\n\nRole:\nStack:\nLocation or remote:\nCompany:\n",
})
  .toString()
  .replaceAll("+", "%20")}`;

export default function CompaniesPage() {
  return (
    <TextPage command="devtag --for-companies" title="Hiring developers? See what they've built.">
      <p>
        A devtag page shows a developer&apos;s real work, not only their titles: their projects with live links, the
        stack they use, their level, and whether they&apos;re open to work.
      </p>
      <p>
        We&apos;re building devtag for companies too. Tell us which role you&apos;re hiring for, and we&apos;ll reply.
      </p>

      <div className={s.actions}>
        <a href={mail} className={landing.cta}>
          Tell us about the role
        </a>
        <span className={s.email}>or write to {COMPANY.email}</span>
      </div>

      <h2>What a page tells you</h2>
      <ul>
        <li>
          <strong>What they built:</strong> a page for every project, with a link to try it.
        </li>
        <li>
          <strong>What they use:</strong> their stack, with their strongest skills first.
        </li>
        <li>
          <strong>Their level:</strong> seniority and years of experience.
        </li>
        <li>
          <strong>Whether they&apos;re looking:</strong> full-time, contract or freelance; remote, hybrid or on-site;
          where, and from when.
        </li>
      </ul>

      <h2>Developers decide</h2>
      <p>
        A page is public because its owner published it. We never share a developer&apos;s details with a company
        without their consent.
      </p>
    </TextPage>
  );
}
