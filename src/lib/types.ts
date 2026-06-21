export type FileType = "md" | "txt" | "pdf";

/** How aggressively PDF paragraphs are split during text extraction. */
export type ParagraphSpacing = "tight" | "normal" | "loose";

export interface ParsedFile {
  /** Plain-text/markdown content extracted from the file. */
  content: string;
  /** Detected file kind. */
  type: FileType;
}

export interface HistoryEntry {
  id: string;
  name: string;
  type: FileType;
  /** Size in bytes of the original uploaded file. */
  size: number;
  /** Extracted content (markdown/plain text). */
  content: string;
  /** ISO timestamp of when the file was last opened. */
  openedAt: string;
}
