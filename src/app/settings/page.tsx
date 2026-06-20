"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FONT_MAX,
  FONT_MIN,
  getFontSize,
  getSaveHistory,
  setFontSize,
  setSaveHistory,
} from "@/lib/storage";
import { ThemePills } from "@/components/ThemePills";
import { Toggle } from "@/components/Toggle";
import { ArrowLeftIcon } from "@/components/icons";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-muted">
      {children}
    </h2>
  );
}

export default function SettingsPage() {
  const [font, setFont] = useState(16);
  const [saveHistory, setSave] = useState(true);

  useEffect(() => {
    setFont(getFontSize());
    setSave(getSaveHistory());
  }, []);

  function handleFont(value: number) {
    setFont(setFontSize(value));
  }

  function handleSave(value: boolean) {
    setSave(value);
    setSaveHistory(value);
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-12">
      <header className="sticky top-0 z-30 -mx-4 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur">
        <Link
          href="/"
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-md text-fg hover:bg-surface"
        >
          <ArrowLeftIcon />
        </Link>
        <h1 className="text-lg font-semibold text-fg">Settings</h1>
      </header>

      {/* Appearance */}
      <SectionLabel>Appearance</SectionLabel>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-medium text-fg">Theme</p>
        <p className="mb-3 text-sm text-muted">Choose your preferred style</p>
        <ThemePills />
      </div>

      <div className="mt-3 rounded-xl border border-border bg-surface p-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-fg">Font size</span>
          <span className="text-xs text-muted" aria-hidden>
            A
          </span>
          <input
            type="range"
            min={FONT_MIN}
            max={FONT_MAX}
            step={1}
            value={font}
            aria-label="Font size"
            onChange={(e) => handleFont(Number(e.target.value))}
            className="flex-1 accent-accent"
          />
          <span className="text-lg text-muted" aria-hidden>
            A
          </span>
        </div>
        <p className="mt-2 text-right text-xs tabular-nums text-muted">{font}px</p>
      </div>

      {/* History */}
      <SectionLabel>History</SectionLabel>

      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-fg">Save history</p>
          <p className="text-sm text-muted">Store in browser (local only)</p>
        </div>
        <Toggle label="Save history" checked={saveHistory} onChange={handleSave} />
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface p-4 opacity-80">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-fg">Sync across devices</p>
          <p className="text-sm text-muted">Needs account + database</p>
        </div>
        <Toggle label="Sync across devices" checked={false} disabled />
      </div>

      <p className="mt-3 text-xs text-muted">
        Sync across devices (F05) belum aktif — butuh Supabase. Lihat
        <code className="mx-1 rounded bg-bg px-1">.env.example</code>.
      </p>
    </main>
  );
}
