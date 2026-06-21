import type { FileType, ParagraphSpacing, ParsedFile } from "../types";

/** Threshold multipliers for PDF paragraph detection (see pdf.ts). */
const PARAGRAPH_FACTORS: Record<ParagraphSpacing, number> = {
  tight: 1.25,
  normal: 1.4,
  loose: 1.7,
};

export interface ParseOptions {
  /** Affects PDF paragraph splitting; ignored for md/txt. */
  paragraphSpacing?: ParagraphSpacing;
}

/** Reads a Blob as UTF-8 text. Uses FileReader so it works in browsers and jsdom. */
function readAsText(file: Blob): Promise<string> {
  if (typeof (file as Blob).text === "function") {
    return (file as Blob).text();
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Gagal membaca file"));
    reader.readAsText(file);
  });
}

export const SUPPORTED_EXTENSIONS = ["md", "txt", "pdf"] as const;
export const ACCEPT_ATTR = ".md,.markdown,.txt,.text,.pdf,text/markdown,text/plain,application/pdf";

/**
 * Detects the FileType from a filename (preferred) or MIME type.
 * Returns null when the file is not supported.
 */
export function detectType(name: string, mime = ""): FileType | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "txt" || ext === "text") return "txt";
  if (ext === "pdf") return "pdf";

  if (mime === "text/markdown") return "md";
  if (mime === "text/plain") return "txt";
  if (mime === "application/pdf") return "pdf";

  return null;
}

export function isSupported(name: string, mime = ""): boolean {
  return detectType(name, mime) !== null;
}

/**
 * Reads and parses an uploaded File into plain text / markdown.
 * Throws if the file type is unsupported.
 */
export async function parseFile(file: File, opts: ParseOptions = {}): Promise<ParsedFile> {
  const type = detectType(file.name, file.type);
  if (!type) {
    throw new Error(`Format file tidak didukung: ${file.name}`);
  }

  if (type === "pdf") {
    const { parsePdf } = await import("./pdf");
    const buffer = await file.arrayBuffer();
    const factor = PARAGRAPH_FACTORS[opts.paragraphSpacing ?? "normal"];
    return { type, content: await parsePdf(buffer, factor) };
  }

  // md & txt are read as UTF-8 text.
  const content = await readAsText(file);
  return { type, content };
}
