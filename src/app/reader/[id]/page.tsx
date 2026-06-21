"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types";
import { addToHistory, getFontSize, getHistoryEntry } from "@/lib/storage";
import { ChromeProvider } from "@/components/ChromeContext";
import { FileReaderView } from "@/components/FileReaderView";
import { ReaderControls } from "@/components/ReaderControls";
import { ReaderSearch } from "@/components/ReaderSearch";
import { TopBar } from "@/components/TopBar";
import { SearchIcon } from "@/components/icons";

type LoadState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; entry: HistoryEntry };

export default function ReaderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [font, setFont] = useState<number>(16);
  const [searchOpen, setSearchOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFont(getFontSize());
    if (!id) {
      setState({ status: "notfound" });
      return;
    }
    const entry = getHistoryEntry(id);
    if (!entry) {
      setState({ status: "notfound" });
      return;
    }
    // Re-opening bumps the entry to the top of history.
    addToHistory({
      name: entry.name,
      type: entry.type,
      size: entry.size,
      content: entry.content,
    });
    setState({ status: "ready", entry });
  }, [id]);

  return (
    <ChromeProvider>
      <div className="min-h-dvh">
        <TopBar
          title={state.status === "ready" ? state.entry.name : "Reader"}
          actions={
            state.status === "ready" ? (
              <button
                type="button"
                onClick={() => setSearchOpen((o) => !o)}
                aria-label="Search in document"
                aria-pressed={searchOpen}
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-md border bg-surface text-fg hover:border-accent ${
                  searchOpen ? "border-accent text-accent" : "border-border"
                }`}
              >
                <SearchIcon width={18} height={18} />
              </button>
            ) : undefined
          }
        />

        {state.status === "ready" && (
          <ReaderSearch
            open={searchOpen}
            onClose={() => setSearchOpen(false)}
            containerRef={contentRef}
            resetKey={`${state.entry.id}:${font}`}
          />
        )}

        <main className="mx-auto w-full max-w-3xl px-4 py-6">
        {state.status === "loading" && <p className="text-muted">Loading…</p>}

        {state.status === "notfound" && (
          <div className="space-y-3 rounded-xl border border-border bg-surface p-6 text-center">
            <p className="text-fg">This file isn’t in your history.</p>
            <p className="text-sm text-muted">
              History is stored only in this browser — the file may have been opened on
              another device or the history was cleared.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Upload a new file
            </Link>
          </div>
        )}

        {state.status === "ready" && (
          <>
            <div ref={contentRef}>
              <FileReaderView entry={state.entry} fontSize={font} />
            </div>
            <ReaderControls entryId={state.entry.id} />
          </>
        )}
        </main>
      </div>
    </ChromeProvider>
  );
}
