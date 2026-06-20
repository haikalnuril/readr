/**
 * Client-side PDF text extraction using pdfjs-dist.
 *
 * pdfjs is imported dynamically so it never runs during SSR / on the Vercel
 * server bundle — text extraction only happens in the browser after upload.
 * The worker is pinned to the exact installed pdfjs version.
 */
export async function parsePdf(data: ArrayBuffer): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const doc = await pdfjs.getDocument({ data }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push(text);
  }

  await doc.cleanup();
  return pages.join("\n\n").trim();
}
