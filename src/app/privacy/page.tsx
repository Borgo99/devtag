import type { Metadata } from "next";
import { TextPage } from "@/components/site/TextPage";
import { CV_IMPORTS_PER_USER } from "@/lib/store";
import { COMPANY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy — devtag",
  description: "Which personal data devtag processes, why, for how long, and who helps us.",
};

/** Keep this in step with what the code does: sign-in, the store, photos, the CV import. */
export default function PrivacyPage() {
  const email = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

  return (
    <TextPage command="cat privacy.md" title="Privacy policy">
      <p>Effective date: 25 October 2026</p>
      <p>
        devtag (devtag.io) is run by <strong>{COMPANY.name}</strong>, {COMPANY.address}, the data controller. This
        policy explains which personal data we process, why, for how long, and who helps us. Words like &ldquo;personal
        data&rdquo; and &ldquo;processing&rdquo; mean what they mean in the EU General Data Protection Regulation
        (GDPR).
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <strong>Your account:</strong> the name, email address and profile picture of the account you sign in with
          (GitHub, Google or LinkedIn), and the identifiers it returns to keep you signed in.
        </li>
        <li>
          <strong>Your page:</strong> what you write in the editor, such as your role, skills, experience, education,
          projects, links, seniority and open-to-work preferences. Once you publish, your page is public: anyone can
          read it, and search engines and link previews may show it.
        </li>
        <li>
          <strong>Your photo:</strong> we convert it to a 512×512 image and remove its metadata, such as location and
          camera details.
        </li>
        <li>
          <strong>Your CV:</strong> the PDF is read in your browser and never uploaded. Only its text is sent to our
          server and to OpenAI, to fill in your page, and we don&apos;t store it. We record that an import happened
          (your account and the time) to apply the limit of {CV_IMPORTS_PER_USER} imports a day.
        </li>
        <li>
          <strong>Your choices for companies:</strong> whether and when you agreed that we share your page with
          companies and, if you add it, where you live. They are private: they&apos;re not on your page.
        </li>
        <li>
          <strong>Visits to your page:</strong> we count the visitors of each published page, each once a day. To tell
          visitors apart, we hash their IP address and browser with a random key that changes every day and is deleted
          the next day, so we keep no IP addresses. No cookies are used, and the page&apos;s owner only sees totals.
        </li>
        <li>
          <strong>Technical data:</strong> our hosting provider logs requests (IP address, browser, time) to run and
          protect the service, and keeps them for a short time.
        </li>
      </ul>

      <h2>2. Cookies</h2>
      <p>
        We use one cookie to keep you signed in, plus short-lived ones while you sign in. They are strictly necessary,
        so we don&apos;t ask for consent. There are no analytics or advertising cookies.
      </p>

      <h2>3. Why, and on what legal basis</h2>
      <ul>
        <li>
          <strong>Running your account and publishing your page:</strong> the contract with you (Art. 6(1)(b) GDPR).
        </li>
        <li>
          <strong>Filling in your page from your CV,</strong> when you ask: the contract with you (Art. 6(1)(b)).
        </li>
        <li>
          <strong>Sharing your page with companies hiring for roles close to your profile,</strong> and using where you
          live to find them: your consent (Art. 6(1)(a)). You can withdraw it at any time in the editor&apos;s Companies
          section.
        </li>
        <li>
          <strong>Counting the visitors of your page,</strong> to show you how many people see it: our legitimate
          interest (Art. 6(1)(f)).
        </li>
        <li>
          <strong>Security, preventing abuse and applying limits:</strong> our legitimate interest (Art. 6(1)(f)).
        </li>
        <li>
          <strong>Answering your emails:</strong> our legitimate interest (Art. 6(1)(f)).
        </li>
      </ul>
      <p>
        The CV import uses AI to suggest the content of your page. You check it and decide what to publish: we make no
        automated decisions about you.
      </p>

      <h2>4. How long we keep it</h2>
      <ul>
        <li>Your account, page and photos: until you delete your account.</li>
        <li>Photos you replaced may stay in storage until then.</li>
        <li>
          Your CV text: we don&apos;t keep it. OpenAI keeps data sent to its API for up to 30 days to detect abuse, and
          doesn&apos;t use it to train its models.
        </li>
        <li>Records of CV imports: with your account.</li>
        <li>Your choices for companies: until you change them or delete your account.</li>
        <li>Visit counts: with the page owner&apos;s account. The daily keys are deleted the next day.</li>
      </ul>

      <h2>5. Who helps us</h2>
      <p>These providers process data for us, only to run devtag:</p>
      <ul>
        <li>
          <strong>Vercel</strong> (USA): hosts the website.
        </li>
        <li>
          <strong>Neon</strong>: the database, in Frankfurt, Germany.
        </li>
        <li>
          <strong>Amazon Web Services</strong>: stores photos in Frankfurt and delivers them worldwide (S3 and
          CloudFront).
        </li>
        <li>
          <strong>GitHub, Google and LinkedIn</strong>: sign-in, with the account you choose.
        </li>
        <li>
          <strong>OpenAI</strong> (USA): turns your CV text into your page, when you ask.
        </li>
      </ul>
      <p>
        When data leaves the European Economic Area, we rely on the safeguards of Articles 44&ndash;49 GDPR: the
        EU&ndash;US Data Privacy Framework or the European Commission&apos;s Standard Contractual Clauses.
      </p>
      <p>
        We don&apos;t sell your data. We share your page with a company only if you agreed to it, and only for roles
        close to your profile. Where you live helps us find those roles, and stays with us. Your published page is
        public, so anyone can read it, recruiters included.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can access, correct or delete your data, restrict or object to its processing, and ask for a copy in a
        portable format. You can edit your page at any time in the editor. To delete your account, your page and your
        photos, email us at {email} from the address you sign in with.
      </p>
      <p>
        You can also complain to a data protection authority: in Italy, the{" "}
        <a href="https://www.garanteprivacy.it">Garante per la protezione dei dati personali</a>.
      </p>

      <h2>7. Age</h2>
      <p>devtag is for people aged 16 or older.</p>

      <h2>8. Changes</h2>
      <p>If we change this policy, we&apos;ll publish the new version here with a new effective date.</p>

      <h2>9. Contact</h2>
      <p>
        {COMPANY.name}, {COMPANY.address}. For anything about your data, write to {email}. {COMPANY.name} is not
        required to appoint a Data Protection Officer.
      </p>
    </TextPage>
  );
}
