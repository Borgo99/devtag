import { defineConfig } from "@/lib/types";

/**
 * A made-up profile for the main site's pages: its skills orbit in the landing hero, and the
 * background scrolls it by as source code (see Background.tsx).
 */
export const sample = defineConfig({
  profile: { name: "You", role: "Software Engineer" },
  topSkills: ["TypeScript", "Python", "React", "Go", "Rust"],
  // 12 at most: two rings, so the hero still fits on a laptop screen.
  skills: [
    "Next.js",
    "Node.js",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "AWS",
    "Java",
    "Swift",
    "Kotlin",
    "Svelte",
    "PyTorch",
    "Git",
  ],
  languages: [
    { name: "English", level: "C1" },
    { name: "Italian", level: "Native" },
  ],
  experience: [
    { company: "Your next company", role: "Software Engineer", start: "2027" },
    { company: "Freelance", role: "Full-Stack Developer", start: "2025" },
    { company: "Coding bootcamp", role: "Student", start: "2024" },
  ],
  projects: [
    { name: "you.devtag.io", description: "" },
    { name: "Weekend hackathon app", description: "" },
    { name: "Open source CLI", description: "" },
  ],
});
