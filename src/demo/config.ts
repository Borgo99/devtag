import { defineConfig } from "@/lib/types";

// The demo profile shown on the landing page (devtag.io/demo). Nora is made up: the companies are the
// fictional ones from Microsoft's sample code (Contoso, Northwind, Fabrikam), the email is on the reserved
// example.com domain, and the GitHub links point to the devtag-demo account, never to a real person.

const GITHUB = "https://github.com/devtag-demo";

export default defineConfig({
  profile: {
    name: "Nora Lindqvist",
    role: "Full-Stack Developer",
    seniority: "mid",
    years: 4,
    about: `I'm a full-stack developer who builds fast, accessible web apps with TypeScript, React and Node.js. Before code I spent four years as an architect, so I care about how things are structured and how people move through them.

I switched careers through a coding bootcamp in 2022 and have shipped production features ever since: from a booking flow used by 40,000 patients a month to the dashboard a logistics team plans its routes with.`,
  },

  openToWork: {
    active: true,
    types: ["full-time", "contract"],
    modes: ["remote", "hybrid"],
    location: "Milan",
  },

  links: [
    { type: "github", url: GITHUB },
    { type: "email", url: "nora@example.com" },
  ],

  topSkills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Python"],

  skills: ["Next.js", "Tailwind CSS", "Docker", "AWS", "GraphQL", "Figma", "Vitest", "Git"],

  stack: [
    { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL"] },
    { group: "Front-end", items: ["React", "Next.js", "Tailwind CSS", "Three.js"] },
    { group: "Back-end", items: ["Node.js", "Express", "GraphQL", "PostgreSQL", "Redis"] },
    { group: "Cloud & tools", items: ["Docker", "AWS", "Vercel", "GitHub Actions", "Figma"] },
    { group: "Testing", items: ["Vitest", "Playwright"] },
  ],

  languages: [
    { name: "Swedish", level: "Native" },
    { name: "English", level: "Fluent" },
    { name: "Italian", level: "B1" },
  ],

  experience: [
    {
      company: "Contoso Health",
      role: "Full-Stack Developer",
      start: "2024-03",
      location: "Remote",
      summary: "Building the patient booking platform of a network of 30 clinics.",
      highlights: [
        "Rebuilt the booking flow in Next.js: page load down from 4.1 s to 1.2 s.",
        "Designed the appointments API in Node.js and PostgreSQL, now handling 40,000 bookings a month.",
        "Set up end-to-end tests with Playwright, halving the bugs found after release.",
      ],
      stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Playwright", "AWS"],
    },
    {
      company: "Northwind Traders",
      role: "Junior Front-End Developer",
      start: "2022-09",
      end: "2024-02",
      location: "Milan",
      highlights: [
        "Built the route-planning dashboard used by 60 dispatchers every day.",
        "Moved the design system from plain CSS to Tailwind CSS components.",
      ],
      stack: ["React", "TypeScript", "Tailwind CSS", "GraphQL"],
    },
    {
      company: "Fabrikam Architects",
      role: "Architectural Designer",
      start: "2018-01",
      end: "2022-04",
      location: "Stockholm",
      highlights: [
        "Designed housing and school projects, from first sketch to construction drawings.",
        "Wrote Python scripts to check floor plans automatically: how I got into programming.",
      ],
      stack: ["Python"],
    },
  ],

  portfolioStyle: "large",

  projects: [
    {
      name: "Floorplan 3D",
      description: "Turns a 2D floor plan into a 3D model you can walk through in the browser.",
      year: 2024,
      repo: `${GITHUB}/floorplan-3d`,
      stack: ["Three.js", "TypeScript", "React"],
      highlights: [
        "Detects walls, doors and windows from an uploaded image.",
        "Runs entirely in the browser, at 60 fps on a mid-range laptop.",
      ],
      portfolio: true,
    },
    {
      name: "Shelfie",
      description: "Reading tracker: scan a book's barcode, log your pages, see your year in books.",
      year: 2023,
      repo: `${GITHUB}/shelfie`,
      stack: ["Next.js", "PostgreSQL", "Tailwind CSS"],
      highlights: ["Installable on phones as a web app, and works offline."],
      portfolio: true,
    },
    {
      name: "pg-snapshot",
      description: "Command-line tool that saves and restores local PostgreSQL databases in one command.",
      year: 2024,
      repo: `${GITHUB}/pg-snapshot`,
      stack: ["Node.js", "PostgreSQL", "Docker"],
      portfolio: true,
    },
    {
      name: "Tablemate",
      description: "Restaurant booking app, built in two weeks with a team of four as the bootcamp's final project.",
      year: 2022,
      stack: ["React", "Express", "MongoDB"],
      highlights: ["Presented live on demo day to a panel of local tech companies."],
      portfolio: true,
    },
    {
      name: "Commute heatmap",
      description: "Map of how long it takes to reach Milan's center by public transport, from every street.",
      year: 2023,
      repo: `${GITHUB}/commute-heatmap`,
      stack: ["Python", "pandas", "Mapbox"],
      portfolio: true,
    },
  ],

  education: [
    {
      degree: "Full-Stack Web Development Bootcamp",
      school: "Northwind Academy",
      start: "2022-04",
      end: "2022-07",
      location: "Milan",
      highlights: ["12-week full-time program: JavaScript, React, Node.js, SQL and team projects."],
    },
    {
      degree: "Master of Architecture",
      school: "Contoso University",
      start: "2013",
      end: "2018",
      location: "Stockholm",
    },
  ],

  theme: {
    accent: "#a78bfa",
    accent2: "#22d3ee",
  },
});
