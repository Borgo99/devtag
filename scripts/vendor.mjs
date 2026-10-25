import fs from "node:fs";
import path from "node:path";

/**
 * Copies what the app needs from node_modules, before `next dev` and `next build`:
 * - Devicon ships 100 MB of SVG files, too big for a Vercel function. Only the two variants
 *   src/lib/icons.ts can pick for each icon (flat and colored) are kept, in one JSON file.
 * - The pdf.js worker, served from /static so its version always matches the library.
 */

const root = path.join(import.meta.dirname, "..");
const modules = path.join(root, "node_modules");

const DEVICON = path.join(modules, "devicon");
const FLAT = ["plain", "original", "plain-wordmark", "original-wordmark"];
const COLOR = ["original", "plain", "original-wordmark", "plain-wordmark"];

const pick = (order, versions) => order.find((v) => versions.includes(v)) ?? versions[0];
const read = (name, variant) =>
  fs
    .readFileSync(path.join(DEVICON, "icons", name, `${name}-${variant}.svg`), "utf8")
    .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, "")
    .trim();

const devicons = JSON.parse(fs.readFileSync(path.join(DEVICON, "devicon.json"), "utf8")).map((entry) => {
  const flat = pick(FLAT, entry.versions.svg);
  const color = pick(COLOR, entry.versions.svg);
  return {
    name: entry.name,
    altnames: entry.altnames,
    color: entry.color,
    flat: read(entry.name, flat),
    ...(color !== flat && { colored: read(entry.name, color) }),
  };
});
fs.writeFileSync(path.join(root, "src/lib/devicons.generated.json"), JSON.stringify(devicons));

fs.copyFileSync(
  path.join(modules, "pdfjs-dist/build/pdf.worker.min.mjs"),
  path.join(root, "public/static/pdf.worker.min.mjs"),
);
