import type { Metadata } from "next";
import { TextPage } from "@/components/site/TextPage";
import { CV_IMPORTS_PER_USER } from "@/lib/store";
import { COMPANY, DISPLAY_DOMAIN, REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms — devtag",
  description: "The terms for using devtag: your account, your page, and what's not allowed.",
};

export default function TermsPage() {
  const email = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

  return (
    <TextPage command="cat terms.md" title="Terms">
      <p>Effective date: 25 October 2026</p>
      <p>
        These terms cover your use of devtag at {DISPLAY_DOMAIN} (the &ldquo;service&rdquo;), run by{" "}
        <strong>{COMPANY.name}</strong>, a company registered in Italy at {COMPANY.address} (&ldquo;we&rdquo;). By
        signing in you accept them, together with our <a href="/privacy">privacy policy</a>.
      </p>

      <h2>1. The service</h2>
      <p>
        devtag lets you build a portfolio page and publish it at your own address, such as yourname.{DISPLAY_DOMAIN}. It
        is free. We may change, add or remove features over time.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be 16 or older.</li>
        <li>You sign in with GitHub, Google or LinkedIn, and you are responsible for what happens in your account.</li>
        <li>Each account has one page.</li>
      </ul>

      <h2>3. Your address</h2>
      <p>
        Addresses are first come, first served. We may take back an address that impersonates someone, uses a name or
        trademark that isn&apos;t yours, or is offensive. Some names are reserved for the site itself.
      </p>

      <h2>4. Your content</h2>
      <ul>
        <li>What you put on your page stays yours.</li>
        <li>
          You allow us to store it, show it, and share it in link previews and to search engines, only to run the
          service and only until you delete it. This license is free and non-exclusive.
        </li>
        <li>
          You must have the right to publish everything on your page (photos, images, logos, texts), and what it says
          about you must be true.
        </li>
      </ul>

      <h2>5. CV import</h2>
      <p>
        The CV import uses AI and can get things wrong. Check every section before you publish: you are responsible for
        what your page says. Each account can import up to {CV_IMPORTS_PER_USER} CVs a day.
      </p>

      <h2>6. What&apos;s not allowed</h2>
      <ul>
        <li>Pretending to be someone else, or publishing false information about yourself or others.</li>
        <li>Illegal, hateful or sexual content, or content that infringes someone else&apos;s rights.</li>
        <li>Links to malware, phishing or scams, and spam.</li>
        <li>Collecting data from the service in bulk (scraping).</li>
        <li>Getting around the import limits, or attacking or overloading the service.</li>
      </ul>

      <h2>7. Reporting a page</h2>
      <p>
        If a page breaks the law or these terms, email {email} with its link and the reason. We may remove pages and
        suspend accounts that break these terms or the law.
      </p>

      <h2>8. Open-source code</h2>
      <p>
        devtag&apos;s code is open source under the <a href={`${REPO_URL}/blob/main/LICENSE`}>AGPL-3.0 license</a>.
        These terms cover the service we run at {DISPLAY_DOMAIN}. The devtag name and logo are not part of that license.
      </p>

      <h2>9. Ending</h2>
      <p>
        You can stop at any time: to delete your account, your page and your photos, email {email} from the address you
        sign in with. If we ever close the service, we&apos;ll let you know in advance where we can.
      </p>

      <h2>10. Liability</h2>
      <p>
        The service is provided as it is, without guarantees that it will always be available or free of errors. As far
        as the law allows, we aren&apos;t liable for indirect damages or for losses caused by content that users
        publish. Nothing in these terms limits rights you have as a consumer that can&apos;t be excluded by law.
      </p>

      <h2>11. Changes</h2>
      <p>
        If we change these terms, we&apos;ll publish the new version here with a new effective date. If the changes are
        important, we&apos;ll tell you by email before they take effect.
      </p>

      <h2>12. Law</h2>
      <p>
        These terms are governed by Italian law, without affecting the consumer protections of the country you live in,
        including your right to go to court where you live.
      </p>

      <h2>13. Contact</h2>
      <p>
        {COMPANY.name}, {COMPANY.address}. Write to {email}.
      </p>
    </TextPage>
  );
}
