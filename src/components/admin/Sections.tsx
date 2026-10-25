"use client";

import type { Education, Job, Link, PortfolioConfig, Project, Publication } from "@/lib/types";
import { PORTFOLIO_MAX } from "@/lib/portfolio";
import { slugify } from "@/lib/text";
import { JOB_TYPES, SENIORITY, WORK_MODES } from "@/lib/work";
import { Check, Chips, Lines, List, LongText, Row, Section, Select, Text, Toggles } from "./fields";
import { PhotoInput } from "./PhotoInput";
import s from "./Editor.module.css";

/** The editor's sections, in the order of the page. Each one edits a part of the config. */

/** Ids of the sections the CV import can fill, for the "check" badges. */
export type SectionId =
  "profile" | "links" | "skills" | "stack" | "languages" | "experience" | "projects" | "education" | "publications";

interface Props {
  config: PortfolioConfig;
  update: (patch: Partial<PortfolioConfig>) => void;
  review: string[];
  reviewed: (id: SectionId) => void;
}

const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const YEARS = /^\d{1,2}$/;
const LINK_TYPES = ["github", "linkedin", "email", "website", "cv", "x", "gitlab", "youtube", "orcid", "googlescholar"];

const at = (role?: string, org?: string) => [role, org].filter(Boolean).join(" @ ");

export function Sections({ config, update, review, reviewed }: Props) {
  const { profile } = config;
  const featured = [...(config.projects ?? []), ...(config.publications ?? [])].filter((p) => p.portfolio).length;
  const section = (id: SectionId) => ({ review: review.includes(id), onReviewed: () => reviewed(id) });
  const open = config.openToWork ?? { active: false };
  const setOpen = (patch: Partial<typeof open>) => update({ openToWork: { ...open, ...patch } });

  return (
    <>
      <Section title="Profile" defaultOpen {...section("profile")}>
        <PhotoInput
          value={profile.image}
          name={profile.name}
          onChange={(image) => update({ profile: { ...profile, image } })}
        />
        <Row>
          <Text label="Name" value={profile.name} onChange={(name) => update({ profile: { ...profile, name } })} />
          <Text
            label="Role"
            hint="Keep it short"
            placeholder="Full-Stack Developer"
            value={profile.role}
            onChange={(role) => update({ profile: { ...profile, role } })}
          />
        </Row>
        <Row>
          <Select
            label="Seniority"
            hint="Badge next to your role"
            options={SENIORITY}
            value={profile.seniority}
            onChange={(seniority) => update({ profile: { ...profile, seniority } })}
          />
          <Text
            label="Years of experience"
            placeholder="6"
            pattern={YEARS}
            value={profile.years?.toString()}
            onChange={(value) => {
              const years = value.replace(/\D/g, "").slice(0, 2);
              update({ profile: { ...profile, years: years ? Number(years) : undefined } });
            }}
          />
        </Row>
        <LongText
          label="About"
          hint="A blank line starts a paragraph"
          rows={6}
          placeholder="The first sentence is also your page's description on Google and in link previews."
          value={profile.about}
          onChange={(about) => update({ profile: { ...profile, about } })}
        />
      </Section>

      <Section title="Open to work">
        <Check
          label="Show that I'm open to work: a green ring on my photo, and the details below"
          checked={open.active}
          onChange={(active) => setOpen({ active })}
        />
        {open.active && (
          <>
            <Toggles
              label="Job types"
              options={JOB_TYPES}
              value={open.types}
              onChange={(types) => setOpen({ types })}
            />
            <Toggles
              label="Work mode"
              options={WORK_MODES}
              value={open.modes}
              onChange={(modes) => setOpen({ modes })}
            />
            <Row>
              <Text
                label="Location"
                placeholder="Milan, EU time zones"
                value={open.location}
                onChange={(location) => setOpen({ location: location || undefined })}
              />
              <Text
                label="Available from"
                hint="Empty: now"
                type="month"
                placeholder="2027-03"
                pattern={DATE}
                value={open.from}
                onChange={(from) => setOpen({ from: from || undefined })}
              />
            </Row>
          </>
        )}
      </Section>

      <Section title="Links" count={config.links?.length} {...section("links")}>
        <datalist id="link-types">
          {LINK_TYPES.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
        <List<Link>
          items={config.links}
          onChange={(links) => update({ links })}
          create={() => ({ type: "", url: "" })}
          addLabel="Add link"
          title={(l) => [l.type, l.url].filter(Boolean).join(" · ")}
        >
          {(link, set) => (
            <Row>
              <Text
                label="Type"
                hint="Picks the icon"
                placeholder="github"
                list="link-types"
                value={link.type}
                onChange={(type) => set({ ...link, type })}
              />
              <Text
                label={link.type === "email" ? "Address" : "URL"}
                placeholder={link.type === "email" ? "you@mail.com" : "https://"}
                value={link.url}
                onChange={(url) => set({ ...link, url })}
              />
              <Text
                label="Label"
                hint="Optional"
                value={link.label}
                onChange={(label) => set({ ...link, label: label || undefined })}
              />
            </Row>
          )}
        </List>
        <p className={s.note}>
          Type: github, linkedin, email, website, cv, x, gitlab, or any icon name from simpleicons.org.
        </p>
      </Section>

      <Section title="Skills" count={(config.topSkills?.length ?? 0) + config.skills.length} {...section("skills")}>
        <Chips
          label="Top skills"
          hint={`Up to 5, closest to your photo · ${config.topSkills?.length ?? 0}/5`}
          max={5}
          value={config.topSkills?.filter((skill) => skill !== undefined)}
          onChange={(topSkills) => update({ topSkills: topSkills as PortfolioConfig["topSkills"] })}
        />
        <Chips
          label="Other skills"
          hint="Orbiting further out · 6 to 12 look best"
          value={config.skills}
          onChange={(skills) => update({ skills })}
        />
        <p className={s.note}>Logos are found by name (3,500+): TypeScript, k8s, golang, C#… Others show as text.</p>
      </Section>

      <Section title="Stack" count={config.stack?.length} {...section("stack")}>
        <List
          items={config.stack}
          onChange={(stack) => update({ stack })}
          create={() => ({ group: "", items: [] })}
          addLabel="Add group"
          title={(g) => g.group}
        >
          {(group, set) => (
            <>
              <Text
                label="Group"
                placeholder="Databases"
                value={group.group}
                onChange={(name) => set({ ...group, group: name })}
              />
              <Chips label="Items" value={group.items} onChange={(items) => set({ ...group, items })} />
            </>
          )}
        </List>
      </Section>

      <Section title="Languages" count={config.languages?.length} {...section("languages")}>
        <List
          items={config.languages}
          onChange={(languages) => update({ languages })}
          create={() => ({ name: "", level: "" })}
          addLabel="Add language"
          title={(l) => [l.name, l.level].filter(Boolean).join(" · ")}
        >
          {(language, set) => (
            <Row>
              <Text label="Language" value={language.name} onChange={(name) => set({ ...language, name })} />
              <Text
                label="Level"
                placeholder="Native, C1…"
                value={language.level}
                onChange={(level) => set({ ...language, level })}
              />
            </Row>
          )}
        </List>
      </Section>

      <Section title="Experience" count={config.experience?.length} {...section("experience")}>
        <List<Job>
          items={config.experience}
          onChange={(experience) => update({ experience })}
          create={() => ({ company: "", role: "" })}
          addLabel="Add job"
          title={(j) => at(j.role, j.company)}
        >
          {(job, set) => (
            <>
              <Row>
                <Text label="Role" value={job.role} onChange={(role) => set({ ...job, role })} />
                <Text label="Company" value={job.company} onChange={(company) => set({ ...job, company })} />
              </Row>
              <Row>
                <Text
                  label="Start"
                  placeholder="2023-04"
                  pattern={DATE}
                  value={job.start}
                  onChange={(start) => set({ ...job, start })}
                />
                <Text
                  label="End"
                  hint="Empty: current"
                  placeholder="2025"
                  pattern={DATE}
                  value={job.end}
                  onChange={(end) => set({ ...job, end })}
                />
                <Text
                  label="Location"
                  placeholder="Milan · Remote"
                  value={job.location}
                  onChange={(location) => set({ ...job, location })}
                />
              </Row>
              <Text
                label="Company website"
                placeholder="https://"
                value={job.url}
                onChange={(url) => set({ ...job, url })}
              />
              <Text
                label="Summary"
                hint="One sentence"
                value={job.summary}
                onChange={(summary) => set({ ...job, summary })}
              />
              <Lines label="Highlights" value={job.highlights} onChange={(highlights) => set({ ...job, highlights })} />
              <Chips label="Stack" value={job.stack} onChange={(stack) => set({ ...job, stack })} />
            </>
          )}
        </List>
      </Section>

      <Section title="Projects" count={config.projects?.length} {...section("projects")}>
        <List<Project>
          items={config.projects}
          onChange={(projects) => update({ projects })}
          create={() => ({ name: "", description: "" })}
          addLabel="Add project"
          title={(p) => p.name}
        >
          {(project, set) => (
            <>
              <Row>
                <Text label="Name" value={project.name} onChange={(name) => set({ ...project, name })} />
                <Text
                  label="Year"
                  placeholder="2025"
                  value={project.year?.toString()}
                  onChange={(year) => set({ ...project, year })}
                />
              </Row>
              <LongText
                label="Description"
                hint="One or two sentences"
                rows={2}
                value={project.description}
                onChange={(description) => set({ ...project, description })}
              />
              <Row>
                <Text
                  label="Live site"
                  placeholder="https://"
                  value={project.url}
                  onChange={(url) => set({ ...project, url })}
                />
                <Text
                  label="Source code"
                  placeholder="https://github.com/…"
                  value={project.repo}
                  onChange={(repo) => set({ ...project, repo })}
                />
              </Row>
              <Chips label="Stack" value={project.stack} onChange={(stack) => set({ ...project, stack })} />
              <Lines
                label="Highlights"
                hint="On the project page · one per line"
                value={project.highlights}
                onChange={(highlights) => set({ ...project, highlights })}
              />
              <LongText
                label="Details"
                hint="Longer text for the project page"
                value={project.details}
                onChange={(details) => set({ ...project, details })}
              />
              <Row>
                <Text
                  label="Screenshot URL"
                  hint="16:10"
                  placeholder="https://"
                  value={project.image}
                  onChange={(image) => set({ ...project, image })}
                />
                <Text
                  label="Page address"
                  hint="Keeps old links working if you rename it"
                  placeholder={slugify(project.name) || "my-project"}
                  value={project.slug}
                  onChange={(slug) => set({ ...project, slug: slug || undefined })}
                />
              </Row>
              <Check
                label={`Feature it in the Portfolio section at the top (${featured}/${PORTFOLIO_MAX})`}
                checked={Boolean(project.portfolio)}
                onChange={(portfolio) => set({ ...project, portfolio: portfolio || undefined })}
              />
            </>
          )}
        </List>
      </Section>

      <Section title="Education" count={config.education?.length} {...section("education")}>
        <List<Education>
          items={config.education}
          onChange={(education) => update({ education })}
          create={() => ({ degree: "", school: "" })}
          addLabel="Add degree"
          title={(e) => at(e.degree, e.school)}
        >
          {(item, set) => (
            <>
              <Row>
                <Text label="Degree" value={item.degree} onChange={(degree) => set({ ...item, degree })} />
                <Text label="School" value={item.school} onChange={(school) => set({ ...item, school })} />
              </Row>
              <Row>
                <Text
                  label="Start"
                  placeholder="2021-09"
                  pattern={DATE}
                  value={item.start}
                  onChange={(start) => set({ ...item, start })}
                />
                <Text
                  label="End"
                  hint="Empty: still studying"
                  placeholder="2025-03"
                  pattern={DATE}
                  value={item.end}
                  onChange={(end) => set({ ...item, end })}
                />
                <Text
                  label="Grade"
                  placeholder="110/110"
                  value={item.grade}
                  onChange={(grade) => set({ ...item, grade })}
                />
              </Row>
              <Row>
                <Text label="Location" value={item.location} onChange={(location) => set({ ...item, location })} />
                <Text
                  label="School website"
                  placeholder="https://"
                  value={item.url}
                  onChange={(url) => set({ ...item, url })}
                />
              </Row>
              <Lines
                label="Highlights"
                hint="Thesis, main courses, awards · one per line"
                value={item.highlights}
                onChange={(highlights) => set({ ...item, highlights })}
              />
            </>
          )}
        </List>
      </Section>

      <Section title="Publications" count={config.publications?.length} {...section("publications")}>
        <List<Publication>
          items={config.publications}
          onChange={(publications) => update({ publications })}
          create={() => ({ title: "" })}
          addLabel="Add publication"
          title={(p) => p.title}
        >
          {(pub, set) => (
            <>
              <LongText label="Title" rows={2} value={pub.title} onChange={(title) => set({ ...pub, title })} />
              <Text
                label="Description"
                hint="One sentence"
                value={pub.description}
                onChange={(description) => set({ ...pub, description })}
              />
              <Row>
                <Text
                  label="Authors"
                  hint="Your surname is shown in bold"
                  value={pub.authors}
                  onChange={(authors) => set({ ...pub, authors })}
                />
                <Text
                  label="Venue"
                  placeholder="ICEC 2024 · Conference paper"
                  value={pub.venue}
                  onChange={(venue) => set({ ...pub, venue })}
                />
              </Row>
              <Row>
                <Text label="Year" value={pub.year?.toString()} onChange={(year) => set({ ...pub, year })} />
                <Text label="URL" placeholder="https://" value={pub.url} onChange={(url) => set({ ...pub, url })} />
              </Row>
              <Chips
                label="Keywords"
                placeholder="Type a keyword and press Enter"
                value={pub.keywords}
                onChange={(keywords) => set({ ...pub, keywords: keywords as string[] })}
              />
              <Check
                label={`Feature it in the Portfolio section at the top (${featured}/${PORTFOLIO_MAX})`}
                checked={Boolean(pub.portfolio)}
                onChange={(portfolio) => set({ ...pub, portfolio: portfolio || undefined })}
              />
            </>
          )}
        </List>
      </Section>

      <Section title="Look">
        <div className={s.choice} role="radiogroup" aria-label="Portfolio section">
          <span className={s.choiceLabel}>Portfolio section</span>
          {(["large", "compact"] as const).map((style) => (
            <label key={style} className={s.option}>
              <input
                type="radio"
                name="portfolioStyle"
                checked={(config.portfolioStyle ?? "large") === style}
                onChange={() => update({ portfolioStyle: style })}
              />
              {style === "large" ? "Large previews" : "Compact cards"}
            </label>
          ))}
        </div>
        <Row>
          {(["accent", "accent2"] as const).map((key, i) => {
            const value = config.theme?.[key] ?? (i ? "#38bdf8" : "#4ade80");
            return (
              <label key={key} className={s.color}>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => update({ theme: { ...config.theme, [key]: e.target.value } })}
                />
                <span>
                  {i ? "Second color" : "Main color"}
                  <code>{value}</code>
                </span>
              </label>
            );
          })}
        </Row>
      </Section>
    </>
  );
}
