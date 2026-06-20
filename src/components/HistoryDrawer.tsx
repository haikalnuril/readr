"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { HistoryEntry } from "@/lib/types";
import { clearHistory, getHistory, removeFromHistory } from "@/lib/storage";
import { formatRelativeTime, formatSize } from "@/lib/format";
import { FileTypeIcon } from "./FileTypeIcon";
import { CloseIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ open, onClose }: Props) {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Refresh the list whenever the drawer opens.
  useEffect(() => {
    if (open) setEntries(getHistory());
  }, [open]);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function openEntry(id: string) {
    onClose();
    router.push(`/reader/${id}`);
  }

  function remove(id: string) {
    removeFromHistory(id);
    setEntries(getHistory());
  }

  return (
    <div
      data-chrome-ignore
      className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="History"
        aria-modal="true"
        className={`absolute right-0 top-0 flex h-full w-80 max-w-[85vw] flex-col border-l border-border bg-bg shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold text-fg">History</h2>
          <div className="flex items-center gap-1">
            {entries.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearHistory();
                  setEntries([]);
                }}
                className="rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-fg"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history"
              className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-surface hover:text-fg"
            >
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {entries.length === 0 ? (
            <p className="px-1 pt-6 text-center text-sm text-muted">
              No history yet. Files you open will appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-2.5"
                >
                  <FileTypeIcon type={entry.type} />
                  <button
                    type="button"
                    onClick={() => openEntry(entry.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="block truncate text-sm font-medium text-fg">
                      {entry.name}
                    </span>
                    <span className="block text-xs text-muted">
                      {formatRelativeTime(entry.openedAt)} · {formatSize(entry.size)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry.id)}
                    aria-label={`Remove ${entry.name}`}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded text-muted hover:bg-bg hover:text-rose-500"
                  >
                    <CloseIcon width={14} height={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
