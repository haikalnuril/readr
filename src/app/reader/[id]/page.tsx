"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types";
import { addToHistory, getFontSize, getHistoryEntry } from "@/lib/storage";
import { FileReaderView } from "@/components/FileReaderView";
import { ReaderControls } from "@/components/ReaderControls";
import { TopBar } from "@/components/TopBar";

type LoadState =
  | { status: "loading" }
  | { status: "notfound" }
  | { status: "ready"; entry: HistoryEntry };

export default function ReaderPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [font, setFont] = useState<number>(16);

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
    <div className="min-h-dvh">
      <TopBar title={state.status === "ready" ? state.entry.name : "Reader"} autoHide />

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
            <FileReaderView entry={state.entry} fontSize={font} />
            <ReaderControls entryId={state.entry.id} />
          </>
        )}
      </main>
    </div>
  );
}
