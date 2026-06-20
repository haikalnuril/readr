"use client";

import { useEffect, useRef, useState } from "react";
import { getReadPosition, setReadPosition } from "@/lib/storage";
import { ArrowUpIcon, BookmarkIcon } from "./icons";

function scrollMax(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/**
 * Floating reader controls (F06):
 *  - Persists the scroll position (as a 0..1 fraction) per file and restores it
 *    when the file is reopened — so you resume exactly where you left off.
 *  - "Top" button scrolls to the start.
 *  - "Last read" button jumps back to the saved position (handy after Top).
 */
export function ReaderControls({ entryId }: { entryId: string }) {
  const programmatic = useRef(false);
  const [scrollFrac, setScrollFrac] = useState(0);
  const [savedFrac, setSavedFrac] = useState(0);

  // Restore last-read position on open.
  useEffect(() => {
    const saved = getReadPosition(entryId);
    setSavedFrac(saved);
    if (saved > 0.01) {
      programmatic.current = true;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          window.scrollTo({ top: saved * scrollMax(), behavior: "auto" });
          window.setTimeout(() => {
            programmatic.current = false;
          }, 150);
        }),
      );
    }
  }, [entryId]);

  // Track scroll for button visibility, and persist real (non-programmatic) scrolls.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = scrollMax();
        const frac = max > 0 ? window.scrollY / max : 0;
        setScrollFrac(frac);
        if (!programmatic.current) {
          setReadPosition(entryId, frac);
          setSavedFrac(frac);
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [entryId]);

  function scrollToFraction(frac: number) {
    programmatic.current = true;
    window.scrollTo({ top: frac * scrollMax(), behavior: "smooth" });
    window.setTimeout(() => {
      programmatic.current = false;
    }, 700);
  }

  const showTop = scrollFrac > 0.12;
  const showLastRead = savedFrac > 0.05 && Math.abs(scrollFrac - savedFrac) > 0.08;

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border shadow-lg backdrop-blur transition-transform active:scale-95";

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
      {showLastRead && (
        <button
          type="button"
          onClick={() => scrollToFraction(getReadPosition(entryId))}
          aria-label="Jump to last read"
          title="Last read"
          className={`${btn} border-transparent bg-accent text-white`}
        >
          <BookmarkIcon />
        </button>
      )}
      {showTop && (
        <button
          type="button"
          onClick={() => scrollToFraction(0)}
          aria-label="Scroll to top"
          title="Top"
          className={`${btn} border-border bg-surface/90 text-fg`}
        >
          <ArrowUpIcon />
        </button>
      )}
    </div>
  );
}
