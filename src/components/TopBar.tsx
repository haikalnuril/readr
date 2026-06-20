"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HistoryDrawer } from "./HistoryDrawer";
import { ArrowLeftIcon, ClockIcon, SettingsIcon } from "./icons";

interface Props {
  /** When set, shows a back button + this title instead of the app logo. */
  title?: string;
  backHref?: string;
  /**
   * Manga/webtoon-style chrome: hide the bar while scrolling down, reveal it on
   * scroll up, and toggle it by tapping the page. Used on the reader.
   */
  autoHide?: boolean;
}

// Don't treat taps on interactive UI as a "toggle the chrome" gesture.
const INTERACTIVE = "a, button, input, select, textarea, label, [role=dialog], header";

export function TopBar({ title, backHref = "/", autoHide = false }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Hide on scroll-down, show on scroll-up, always show near the top.
  useEffect(() => {
    if (!autoHide) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 64) setHidden(false);
      else if (y > lastY + 6) setHidden(true);
      else if (y < lastY - 6) setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [autoHide]);

  // Tap the reading area to toggle the chrome (ignore taps on controls/links).
  useEffect(() => {
    if (!autoHide) return;
    const onClick = (e: MouseEvent) => {
      if (drawerOpen) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest(INTERACTIVE)) return;
      setHidden((h) => !h);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [autoHide, drawerOpen]);

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur transition-transform duration-300 will-change-transform ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {title ? (
          <>
            <Link
              href={backHref}
              aria-label="Back"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-fg hover:bg-surface"
            >
              <ArrowLeftIcon />
            </Link>
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-fg">
              {title}
            </h1>
          </>
        ) : (
          <Link href="/" className="flex-1 text-xl font-bold text-fg">
            FileReader
          </Link>
        )}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg hover:border-accent"
        >
          <ClockIcon width={16} height={16} />
          <span className="hidden sm:inline">History</span>
        </button>

        <Link
          href="/settings"
          aria-label="Settings"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface text-fg hover:border-accent"
        >
          <SettingsIcon width={18} height={18} />
        </Link>
      </header>

      <HistoryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
