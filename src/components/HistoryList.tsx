"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HistoryEntry } from "@/lib/types";
import { getHistory } from "@/lib/storage";
import { formatRelativeTime, formatSize } from "@/lib/format";
import { FileTypeIcon } from "./FileTypeIcon";
import { ChevronRightIcon } from "./icons";

export function HistoryList() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    setEntries(getHistory());
  }, []);

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">
        Recent files
      </h2>

      {entries === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
          No files opened yet. Upload a file above to get started.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/reader/${entry.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent"
              >
                <FileTypeIcon type={entry.type} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-fg">{entry.name}</span>
                  <span className="block text-xs text-muted">
                    {formatRelativeTime(entry.openedAt)} · {formatSize(entry.size)}
                  </span>
                </span>
                <ChevronRightIcon className="shrink-0 text-muted" width={18} height={18} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
