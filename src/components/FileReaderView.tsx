"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  entry: HistoryEntry;
  fontSize: number;
}

export function FileReaderView({ entry, fontSize }: Props) {
  if (entry.content.trim().length === 0) {
    return (
      <p className="text-muted">
        Tidak ada teks yang bisa ditampilkan dari file ini
        {entry.type === "pdf" ? " (mungkin PDF hasil scan/gambar)." : "."}
      </p>
    );
  }

  if (entry.type === "md") {
    return (
      <article className="markdown-body" style={{ fontSize }}>
        <Markdown remarkPlugins={[remarkGfm]}>{entry.content}</Markdown>
      </article>
    );
  }

  // txt & pdf → plain text, preserve whitespace/line breaks.
  return (
    <pre
      className="whitespace-pre-wrap break-words font-sans leading-relaxed text-fg"
      style={{ fontSize }}
    >
      {entry.content}
    </pre>
  );
}
