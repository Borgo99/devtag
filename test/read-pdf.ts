import { readFileSync } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { pageLines, type TextItem } from "../src/lib/cv/columns.ts";

/** Node version of src/lib/cv/read-pdf.ts, for the tests: a PDF file as lines in reading order. */
export async function readPdf(file: string) {
  const pdf = await getDocument({ data: new Uint8Array(readFileSync(file)) }).promise;
  const out: string[] = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const items = (await page.getTextContent()).items
      .filter((i) => "str" in i)
      .map((i): TextItem => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: i.height }));
    out.push(...pageLines(items, page.getViewport({ scale: 1 }).width));
  }
  return out;
}
