import { beforeEach, describe, expect, it } from "vitest";
import {
  FONT_DEFAULT,
  FONT_MAX,
  FONT_MIN,
  addToHistory,
  clampFontSize,
  clearHistory,
  getFontSize,
  getHistory,
  getHistoryEntry,
  getReadPosition,
  getSaveHistory,
  removeFromHistory,
  setFontSize,
  setReadPosition,
  setSaveHistory,
} from "@/lib/storage";

const sample = {
  name: "notes.md",
  type: "md" as const,
  size: 1234,
  content: "# Hello",
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("history (F03)", () => {
  it("adds an entry and reads it back after a fresh read (persist)", () => {
    const entry = addToHistory(sample);
    expect(entry.id).toBeTruthy();
    expect(entry.openedAt).toBeTruthy();

    const all = getHistory();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("notes.md");
    expect(getHistoryEntry(entry.id)?.content).toBe("# Hello");
  });

  it("keeps three different files in history", () => {
    addToHistory({ ...sample, name: "a.md", size: 1 });
    addToHistory({ ...sample, name: "b.txt", type: "txt", size: 2 });
    addToHistory({ ...sample, name: "c.pdf", type: "pdf", size: 3 });
    expect(getHistory()).toHaveLength(3);
  });

  it("dedupes the same file (name+size+type) and moves it to the top", () => {
    const first = addToHistory(sample);
    addToHistory({ ...sample, name: "other.txt", type: "txt", size: 9 });
    const again = addToHistory({ ...sample, content: "# Updated" });

    const all = getHistory();
    expect(all).toHaveLength(2);
    expect(again.id).toBe(first.id);
    expect(all[0].id).toBe(first.id);
    expect(all[0].content).toBe("# Updated");
  });

  it("removes a single entry and clears all", () => {
    const a = addToHistory({ ...sample, name: "a.md", size: 1 });
    addToHistory({ ...sample, name: "b.md", size: 2 });
    removeFromHistory(a.id);
    expect(getHistory()).toHaveLength(1);

    clearHistory();
    expect(getHistory()).toHaveLength(0);
  });
});

describe("save-history preference (Settings)", () => {
  it("defaults to enabled and persists files to the visible list", () => {
    expect(getSaveHistory()).toBe(true);
    addToHistory(sample);
    expect(getHistory()).toHaveLength(1);
  });

  it("when disabled: nothing in visible history, but reader can still load it", () => {
    setSaveHistory(false);
    expect(getSaveHistory()).toBe(false);

    const entry = addToHistory(sample);
    // Not in the persisted, visible recent list…
    expect(getHistory()).toHaveLength(0);
    // …but still resolvable for the reader via the session cache.
    expect(getHistoryEntry(entry.id)?.content).toBe(sample.content);
  });

  it("turning it off forgets the previously persisted list", () => {
    addToHistory(sample);
    expect(getHistory()).toHaveLength(1);
    setSaveHistory(false);
    expect(getHistory()).toHaveLength(0);
  });
});

describe("reading position (F06)", () => {
  it("defaults to 0 and persists a clamped fraction", () => {
    expect(getReadPosition("x")).toBe(0);
    setReadPosition("x", 0.42);
    expect(getReadPosition("x")).toBeCloseTo(0.42);

    setReadPosition("x", 5);
    expect(getReadPosition("x")).toBe(1);
    setReadPosition("x", -1);
    expect(getReadPosition("x")).toBe(0);
  });

  it("is removed when its history entry is removed", () => {
    const entry = addToHistory(sample);
    setReadPosition(entry.id, 0.5);
    expect(getReadPosition(entry.id)).toBeCloseTo(0.5);

    removeFromHistory(entry.id);
    expect(getReadPosition(entry.id)).toBe(0);
  });

  it("is wiped when history is cleared", () => {
    const entry = addToHistory(sample);
    setReadPosition(entry.id, 0.7);
    clearHistory();
    expect(getReadPosition(entry.id)).toBe(0);
  });
});

describe("font size (F04)", () => {
  it("clamps values into the supported range", () => {
    expect(clampFontSize(2)).toBe(FONT_MIN);
    expect(clampFontSize(999)).toBe(FONT_MAX);
    expect(clampFontSize(18)).toBe(18);
    expect(clampFontSize(Number.NaN)).toBe(FONT_DEFAULT);
  });

  it("defaults when nothing is stored and persists when set", () => {
    expect(getFontSize()).toBe(FONT_DEFAULT);
    const stored = setFontSize(20);
    expect(stored).toBe(20);
    expect(getFontSize()).toBe(20);
  });

  it("persisted out-of-range values are clamped on read", () => {
    setFontSize(100);
    expect(getFontSize()).toBe(FONT_MAX);
  });
});
