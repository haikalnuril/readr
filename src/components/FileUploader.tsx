"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ACCEPT_ATTR, isSupported, parseFile } from "@/lib/parsers";
import { addToHistory, getParagraphSpacing } from "@/lib/storage";
import { CloudUploadIcon } from "./icons";

const FORMAT_PILLS = [
  { label: ".md", className: "bg-emerald-500/15 text-emerald-500" },
  { label: ".txt", className: "bg-slate-500/15 text-slate-400" },
  { label: ".pdf", className: "bg-rose-500/15 text-rose-500" },
];

export function FileUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickFile() {
    inputRef.current?.click();
  }

  async function handleFile(file: File) {
    setError(null);
    if (!isSupported(file.name, file.type)) {
      setError("Unsupported format. Please use .md, .txt, or .pdf.");
      return;
    }

    setBusy(true);
    try {
      const parsed = await parseFile(file, { paragraphSpacing: getParagraphSpacing() });
      const entry = addToHistory({
        name: file.name,
        type: parsed.type,
        size: file.size,
        content: parsed.content,
      });
      router.push(`/reader/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file.");
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <div
        onClick={pickFile}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging ? "border-accent bg-accent/10" : "border-border bg-surface"
        } ${busy ? "opacity-60" : "hover:border-accent"}`}
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/10 text-accent">
          <CloudUploadIcon width={26} height={26} />
        </span>

        <p className="font-medium text-fg">
          {busy ? "Reading file…" : "Tap to upload or drag your file here"}
        </p>

        <div className="flex items-center gap-2">
          {FORMAT_PILLS.map((p) => (
            <span
              key={p.label}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.className}`}
            >
              {p.label}
            </span>
          ))}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            pickFile();
          }}
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          Choose file
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}
