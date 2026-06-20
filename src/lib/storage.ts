import type { HistoryEntry } from "./types";

/**
 * Storage adapter for the readr app.
 *
 * Two layers, both swappable for a remote backend later (F05) without touching UI:
 *  - localStorage `filereader:history` → the persisted, user-visible recent list.
 *  - sessionStorage `filereader:active` → a per-tab cache of opened documents so
 *    the reader always has content to show, even when "Save history" is OFF.
 */

const HISTORY_KEY = "filereader:history";
const ACTIVE_KEY = "filereader:active";
const FONT_KEY = "filereader:fontSize";
const SAVE_KEY = "filereader:saveHistory";
const POS_PREFIX = "filereader:pos:";

const MAX_HISTORY = 50;
const MAX_ACTIVE = 20;
export const FONT_MIN = 12;
export const FONT_MAX = 24;
export const FONT_DEFAULT = 16;

function local(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function session(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.sessionStorage) return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readList(store: Storage | null, key: string): HistoryEntry[] {
  if (!store) return [];
  try {
    const raw = store.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeList(store: Storage | null, key: string, entries: HistoryEntry[], cap: number): void {
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(entries.slice(0, cap)));
  } catch {
    // Quota exceeded / unavailable — history is best-effort.
  }
}

// ── Save-history preference (F03 / Settings) ────────────────────────────────

export function getSaveHistory(): boolean {
  const s = local();
  if (!s) return true;
  return s.getItem(SAVE_KEY) !== "false";
}

export function setSaveHistory(enabled: boolean): void {
  const s = local();
  if (!s) return;
  s.setItem(SAVE_KEY, enabled ? "true" : "false");
  // Turning it off forgets the persisted list (privacy intent of "local only").
  if (!enabled) s.removeItem(HISTORY_KEY);
}

// ── History ────────────────────────────────────────────────────────────────

type HistoryInput = Omit<HistoryEntry, "id" | "openedAt">;

function sameFile(input: HistoryInput) {
  return (e: HistoryEntry) =>
    e.name === input.name && e.size === input.size && e.type === input.type;
}

function findExistingId(input: HistoryInput): string | undefined {
  return (
    readList(local(), HISTORY_KEY).find(sameFile(input))?.id ??
    readList(session(), ACTIVE_KEY).find(sameFile(input))?.id
  );
}

/**
 * Records an opened file. Always cached in the session (so the reader can load
 * it), and additionally persisted to the visible history when "Save history" is
 * ON. Re-opening the same file (name + size + type) refreshes it in place.
 */
export function addToHistory(input: HistoryInput): HistoryEntry {
  const entry: HistoryEntry = {
    id: findExistingId(input) ?? uuid(),
    name: input.name,
    type: input.type,
    size: input.size,
    content: input.content,
    openedAt: new Date().toISOString(),
  };

  const active = readList(session(), ACTIVE_KEY).filter((e) => e.id !== entry.id);
  writeList(session(), ACTIVE_KEY, [entry, ...active], MAX_ACTIVE);

  if (getSaveHistory()) {
    const hist = readList(local(), HISTORY_KEY).filter((e) => e.id !== entry.id);
    writeList(local(), HISTORY_KEY, [entry, ...hist], MAX_HISTORY);
  }

  return entry;
}

/** The persisted, user-visible recent list. */
export function getHistory(): HistoryEntry[] {
  return readList(local(), HISTORY_KEY);
}

/** Looks up a document for the reader: persisted history first, then session cache. */
export function getHistoryEntry(id: string): HistoryEntry | null {
  return (
    readList(local(), HISTORY_KEY).find((e) => e.id === id) ??
    readList(session(), ACTIVE_KEY).find((e) => e.id === id) ??
    null
  );
}

export function removeFromHistory(id: string): void {
  writeList(local(), HISTORY_KEY, getHistory().filter((e) => e.id !== id), MAX_HISTORY);
  writeList(
    session(),
    ACTIVE_KEY,
    readList(session(), ACTIVE_KEY).filter((e) => e.id !== id),
    MAX_ACTIVE,
  );
  local()?.removeItem(POS_PREFIX + id);
}

export function clearHistory(): void {
  const s = local();
  if (s) {
    s.removeItem(HISTORY_KEY);
    for (let i = s.length - 1; i >= 0; i--) {
      const key = s.key(i);
      if (key && key.startsWith(POS_PREFIX)) s.removeItem(key);
    }
  }
  session()?.removeItem(ACTIVE_KEY);
}

// ── Reading position / resume (F06) ─────────────────────────────────────────
// Stored as a scroll fraction (0..1) per file id, so it survives font changes
// and persists across visits as long as the file stays in history (stable id).

export function getReadPosition(id: string): number {
  const s = local();
  if (!s) return 0;
  const raw = s.getItem(POS_PREFIX + id);
  if (raw === null) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
}

export function setReadPosition(id: string, fraction: number): void {
  const s = local();
  if (!s) return;
  const f = Number.isFinite(fraction) ? Math.min(1, Math.max(0, fraction)) : 0;
  try {
    s.setItem(POS_PREFIX + id, String(f));
  } catch {
    // best-effort
  }
}

// ── Font size (F04) ──────────────────────────────────────────────────────────

export function clampFontSize(size: number): number {
  if (Number.isNaN(size)) return FONT_DEFAULT;
  return Math.min(FONT_MAX, Math.max(FONT_MIN, Math.round(size)));
}

export function getFontSize(): number {
  const s = local();
  if (!s) return FONT_DEFAULT;
  const raw = s.getItem(FONT_KEY);
  if (raw === null) return FONT_DEFAULT;
  return clampFontSize(Number(raw));
}

export function setFontSize(size: number): number {
  const clamped = clampFontSize(size);
  local()?.setItem(FONT_KEY, String(clamped));
  return clamped;
}
