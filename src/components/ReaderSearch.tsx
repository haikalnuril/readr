"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "./icons";

const HL = "readr-search";
const HL_CURRENT = "readr-search-current";

function supportsHighlight(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as { Highlight?: unknown }).Highlight !== "undefined" &&
    typeof CSS !== "undefined" &&
    "highlights" in CSS
  );
}

function collectTextNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.nodeValue && node.nodeValue.trim().length > 0
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  const nodes: Text[] = [];
  let n = walker.nextNode();
  while (n) {
    nodes.push(n as Text);
    n = walker.nextNode();
  }
  return nodes;
}

function findRanges(root: HTMLElement, query: string): Range[] {
  const q = query.toLowerCase();
  const ranges: Range[] = [];
  for (const node of collectTextNodes(root)) {
    const text = (node.nodeValue ?? "").toLowerCase();
    let idx = text.indexOf(q);
    while (idx !== -1) {
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + q.length);
      ranges.push(range);
      idx = text.indexOf(q, idx + q.length);
    }
  }
  return ranges;
}

function setHighlight(name: string, ranges: Range[]): void {
  if (!supportsHighlight()) return;
  const reg = CSS.highlights;
  if (ranges.length === 0) {
    reg.delete(name);
    return;
  }
  reg.set(name, new Highlight(...ranges));
}

function clearHighlights(): void {
  if (!supportsHighlight()) return;
  CSS.highlights.delete(HL);
  CSS.highlights.delete(HL_CURRENT);
}

function scrollToRange(range: Range): void {
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;
  const top = window.scrollY + rect.top - window.innerHeight / 2;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

interface Props {
  open: boolean;
  onClose: () => void;
  containerRef: RefObject<HTMLElement | null>;
  /** Recompute matches when this changes (file id / font size). */
  resetKey: string;
}

export function ReaderSearch({ open, onClose, containerRef, resetKey }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Range[]>([]);
  const [current, setCurrent] = useState(0);

  function focusMatch(index: number, ranges: Range[]) {
    const range = ranges[index];
    if (!range) return;
    setHighlight(HL_CURRENT, [range]);
    scrollToRange(range);
  }

  // Focus the input when the bar opens; reset/clear when it closes.
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      clearHighlights();
      setQuery("");
      setMatches([]);
      setCurrent(0);
    }
  }, [open]);

  // Recompute matches on query / content change.
  useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    const q = query.trim();
    if (!root || q.length === 0) {
      setMatches([]);
      setCurrent(0);
      clearHighlights();
      return;
    }
    const ranges = findRanges(root, q);
    setMatches(ranges);
    setCurrent(0);
    setHighlight(HL, ranges);
    if (ranges.length > 0) {
      focusMatch(0, ranges);
    } else {
      setHighlight(HL_CURRENT, []);
    }
  }, [query, open, resetKey, containerRef]);

  function go(delta: number) {
    if (matches.length === 0) return;
    const next = (current + delta + matches.length) % matches.length;
    setCurrent(next);
    focusMatch(next, matches);
  }

  if (!open) return null;

  const iconBtn =
    "grid h-8 w-8 shrink-0 place-items-center rounded-md text-fg hover:bg-surface disabled:opacity-40 disabled:hover:bg-transparent";

  return (
    <div
      data-chrome-ignore
      className="fixed inset-x-0 top-0 z-40 flex items-center gap-1.5 border-b border-border bg-bg px-3 py-2"
    >
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            go(e.shiftKey ? -1 : 1);
          } else if (e.key === "Escape") {
            onClose();
          }
        }}
        placeholder="Search in document…"
        className="min-w-0 flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-fg outline-none focus:border-accent"
      />
      <span className="w-12 shrink-0 text-center text-xs tabular-nums text-muted">
        {matches.length > 0 ? `${current + 1}/${matches.length}` : query ? "0/0" : ""}
      </span>
      <button
        type="button"
        onClick={() => go(-1)}
        disabled={matches.length === 0}
        aria-label="Previous match"
        className={iconBtn}
      >
        <ChevronUpIcon width={18} height={18} />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        disabled={matches.length === 0}
        aria-label="Next match"
        className={iconBtn}
      >
        <ChevronDownIcon width={18} height={18} />
      </button>
      <button type="button" onClick={onClose} aria-label="Close search" className={iconBtn}>
        <CloseIcon width={18} height={18} />
      </button>
    </div>
  );
}
