/** "Andrea Borghesi" → "AB" */
export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  return (words.length > 1 ? words[0][0] + words[words.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

/** Last word of the name, used to highlight it in author lists. */
export function surname(name: string) {
  return name.trim().split(/\s+/).pop() ?? name;
}

/** "Connect 4–style board game" → "connect-4-style-board-game" */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // drop accents: "é" → "e"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Splits config text into paragraphs on blank lines. */
export const paragraphs = (text: string) => text.split(/\n\s*\n/);

/** A site the editor can read a preview from: "https://…", or a bare domain like "devtag.io/demo". */
export const isWebAddress = (text: string) => /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(:\d+)?([/?#]\S*)?$/i.test(text.trim());
