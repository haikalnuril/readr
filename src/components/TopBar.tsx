"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useChrome } from "./ChromeContext";
import { HistoryDrawer } from "./HistoryDrawer";
import { ArrowLeftIcon, ClockIcon, SettingsIcon } from "./icons";

interface Props {
  /** When set, shows a back button + this title instead of the app logo. */
  title?: string;
  backHref?: string;
  /** Optional extra buttons rendered before History (e.g. the reader search). */
  actions?: ReactNode;
}

export function TopBar({ title, backHref = "/", actions }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // visible is always true unless rendered inside a <ChromeProvider> (the reader).
  const { visible } = useChrome();

  return (
    <>
      <header
        className={`sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur transition-transform duration-300 will-change-transform ${
          visible ? "translate-y-0" : "-translate-y-full"
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
          <Link href="/" className="flex-1 text-xl font-bold lowercase tracking-tight text-fg">
            readr
          </Link>
        )}

        {actions}

        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-fg hover:border-accent"
        >
          <ClockIcon width={16} height={21} />
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
