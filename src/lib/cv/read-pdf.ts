import { isTwoColumn, pageLines, type TextItem } from "./columns";

export interface PdfText {
  /** All pages, in reading order. Empty when the PDF has no text layer (a scanned CV). */
  text: string;
  pages: number;
  /** Pages read as two columns. */
  twoColumnPages: number;
}

/**
 * Reads a PDF in the browser with pdf.js and returns its text in reading order (see columns.ts).
 * pdf.js is loaded only when a file is dropped, so it stays out of the editor's first load.
 */
export async function readPdf(file: File): Promise<PdfText> {
  const pdfjs = await import("pdfjs-dist");
  // Copied there by scripts/vendor.mjs, from the same pdfjs-dist version.
  pdfjs.GlobalWorkerOptions.workerSrc = "/static/pdf.worker.min.mjs";

  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  const pdf = await task.promise;
  const lines: string[] = [];
  let twoColumnPages = 0;
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const items = (await page.getTextContent()).items
      .filter((i) => "str" in i)
      .map((i): TextItem => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: i.height }));
    const width = page.getViewport({ scale: 1 }).width;
    if (isTwoColumn(items, width)) twoColumnPages++;
    lines.push(...pageLines(items, width));
  }
  const pages = pdf.numPages;
  await task.destroy();
  return { text: lines.join("\n"), pages, twoColumnPages };
}
