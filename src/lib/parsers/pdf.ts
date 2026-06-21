/**
 * Client-side PDF text extraction using pdfjs-dist.
 *
 * pdfjs is imported dynamically so it never runs during SSR / on the Vercel
 * server bundle — text extraction only happens in the browser after upload.
 * The worker is pinned to the exact installed pdfjs version.
 *
 * Paragraph structure is reconstructed from each text run's position: runs on
 * the same line are merged, wrapped lines within a paragraph are joined with a
 * space, and a new paragraph is started when EITHER the vertical gap is clearly
 * larger than the line leading (B04 — blank-line style) OR the line is indented
 * relative to the body's left margin (B06 — first-line-indent style, common in
 * novels that have no blank line between paragraphs).
 */

interface RawItem {
  str?: string;
  transform?: number[];
  height?: number;
}

interface Line {
  y: number;
  x: number;
  height: number;
  text: string;
}

/**
 * Turns one page's text items into text with paragraphs preserved.
 * `factor` controls how aggressively paragraphs split: a gap larger than
 * `leading * factor` starts a new paragraph (smaller factor → more breaks).
 */
export function pdfTextFromItems(items: readonly unknown[], factor = 1.4): string {
  const lines: Line[] = [];
  let current: Line | null = null;

  for (const raw of items) {
    const item = raw as RawItem;
    if (typeof item.str !== "string" || !item.transform) continue;
    if (item.str.length === 0) continue;

    const y = item.transform[5];
    const x = item.transform[4];
    const height = item.height || Math.abs(item.transform[3]) || 12;

    if (current && Math.abs(y - current.y) <= Math.max(2, current.height * 0.5)) {
      // Same visual line (the first run's x stays as the line's left edge).
      current.text += ` ${item.str}`;
      current.height = Math.max(current.height, height);
    } else {
      if (current) lines.push(current);
      current = { y, x, height, text: item.str };
    }
  }
  if (current) lines.push(current);

  const clean = lines
    .map((l) => ({ ...l, text: l.text.replace(/\s+/g, " ").trim() }))
    .filter((l) => l.text.length > 0);
  if (clean.length === 0) return "";

  // Estimate the *within-paragraph* line spacing from the smaller gaps, not the
  // median: in prose with short paragraphs most gaps are paragraph gaps, so the
  // median is too high. The 25th-percentile gap approximates the real leading,
  // and clamping it to the font height stops single-line-heavy pages (where even
  // p25 is a paragraph gap) from inflating the threshold. A gap clearly larger
  // than this leading marks a new paragraph.
  const gaps: number[] = [];
  for (let i = 1; i < clean.length; i++) {
    const gap = clean[i - 1].y - clean[i].y;
    if (gap > 0) gaps.push(gap);
  }
  const heights = clean.map((l) => l.height).sort((a, b) => a - b);
  const medianHeight = heights[Math.floor(heights.length / 2)] || 12;

  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const p25 = sortedGaps.length
    ? sortedGaps[Math.floor(sortedGaps.length * 0.25)]
    : medianHeight;
  const leading = Math.min(Math.max(p25, medianHeight * 0.85), medianHeight * 1.4);
  const paragraphGap = leading * factor;

  // Body left margin = the leftmost line start. A line indented past it by ~half
  // an em starts a new paragraph (handles novels with no blank line between
  // paragraphs, only a first-line indent).
  const bodyLeft = clean.reduce((min, l) => Math.min(min, l.x), Infinity);
  const indentMargin = Math.max(medianHeight * 0.5, 4);

  let out = clean[0].text;
  for (let i = 1; i < clean.length; i++) {
    const gap = clean[i - 1].y - clean[i].y;
    const indented = clean[i].x - bodyLeft > indentMargin;
    if (gap <= 0 || gap > paragraphGap || indented) {
      out += `\n\n${clean[i].text}`;
    } else {
      out += ` ${clean[i].text}`;
    }
  }
  return out;
}

export async function parsePdf(data: ArrayBuffer, factor = 1.4): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    pages.push(pdfTextFromItems(content.items, factor));
    page.cleanup();
  }

  await doc.cleanup();
  return pages.join("\n\n").trim();
}
