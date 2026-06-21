"use client";

import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { HistoryEntry } from "@/lib/types";

interface Props {
  entry: HistoryEntry;
  fontSize: number;
}

// Wrap wide tables so they scroll horizontally inside their own box instead of
// pushing the whole page off-screen on mobile.
const components: Components = {
  table: ({ node, ...props }) => (
    <div className="table-scroll">
      <table {...props} />
    </div>
  ),
};

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
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {entry.content}
        </Markdown>
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
