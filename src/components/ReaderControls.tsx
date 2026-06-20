"use client";

import { useEffect, useRef, useState } from "react";
import { getReadPosition, setReadPosition } from "@/lib/storage";
import { useChrome } from "./ChromeContext";
import { ArrowUpIcon, BookmarkIcon } from "./icons";

function scrollMax(): number {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

/**
 * Floating reader controls (F06 / B01 / B02).
 *  - Show/hide together with the top bar via ChromeContext.
 *  - Persist scroll position (0..1 fraction) per file; restore it on open.
 *  - "Top" scrolls to the start (hidden once already at the top).
 *  - "Last read" jumps back to the saved position.
 *
 * Saving is suppressed for the *entire* duration of any programmatic scroll
 * (restore / Top / Last read) using scroll-idle detection — so the tail of a
 * smooth scroll can never overwrite the saved position (e.g. with 0 after Top).
 */
export function ReaderControls({ entryId }: { entryId: string }) {
  const { visible } = useChrome();
  const savedRef = useRef(0);
  const programmaticRef = useRef(false);
  const releaseTimer = useRef<number | null>(null);
  const [atTop, setAtTop] = useState(true);

  // Release the programmatic guard ~160ms after scrolling settles (works
  // regardless of animation length, and even if no scroll event fires at all).
  function scheduleRelease() {
    if (releaseTimer.current) window.clearTimeout(releaseTimer.current);
    releaseTimer.current = window.setTimeout(() => {
      programmaticRef.current = false;
    }, 160);
  }

  // Restore last-read position on open.
  useEffect(() => {
    const saved = getReadPosition(entryId);
    savedRef.current = saved;
    if (saved <= 0.01) return;
    programmaticRef.current = true;
    scheduleRelease();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        window.scrollTo({ top: saved * scrollMax(), behavior: "auto" });
        scheduleRelease();
      }),
    );
  }, [entryId]);

  // Track scroll: update button state always; persist only genuine user scrolls.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        setAtTop(y < 8);
        if (programmaticRef.current) {
          scheduleRelease();
          return;
        }
        const max = scrollMax();
        const frac = max > 0 ? y / max : 0;
        savedRef.current = frac;
        setReadPosition(entryId, frac);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [entryId]);

  function smoothTo(y: number) {
    programmaticRef.current = true;
    scheduleRelease();
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  const btn =
    "grid h-11 w-11 place-items-center rounded-full border shadow-lg backdrop-blur transition-transform active:scale-95";

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 flex flex-col gap-2.5 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <button
        type="button"
        onClick={() => smoothTo(savedRef.current * scrollMax())}
        aria-label="Jump to last read"
        title="Last read"
        className={`${btn} border-transparent bg-accent text-white`}
      >
        <BookmarkIcon />
      </button>
      {!atTop && (
        <button
          type="button"
          onClick={() => smoothTo(0)}
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
