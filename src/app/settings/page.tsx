"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FONT_MAX,
  FONT_MIN,
  getFontSize,
  getParagraphSpacing,
  getSaveHistory,
  setFontSize,
  setParagraphSpacing,
  setSaveHistory,
} from "@/lib/storage";
import type { ParagraphSpacing } from "@/lib/types";
import { ThemePills } from "@/components/ThemePills";
import { Toggle } from "@/components/Toggle";
import { ArrowLeftIcon } from "@/components/icons";

const SPACING_OPTIONS: { id: ParagraphSpacing; label: string }[] = [
  { id: "tight", label: "Tight" },
  { id: "normal", label: "Normal" },
  { id: "loose", label: "Loose" },
];

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
  const [spacing, setSpacing] = useState<ParagraphSpacing>("normal");

  useEffect(() => {
    setFont(getFontSize());
    setSave(getSaveHistory());
    setSpacing(getParagraphSpacing());
  }, []);

  function handleFont(value: number) {
    setFont(setFontSize(value));
  }

  function handleSave(value: boolean) {
    setSave(value);
    setSaveHistory(value);
  }

  function handleSpacing(value: ParagraphSpacing) {
    setSpacing(value);
    setParagraphSpacing(value);
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

      {/* Reading */}
      <SectionLabel>Reading</SectionLabel>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="font-medium text-fg">Paragraph spacing</p>
        <p className="mb-3 text-sm text-muted">
          How aggressively PDF paragraphs are split
        </p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Paragraph spacing">
          {SPACING_OPTIONS.map((opt) => {
            const selected = spacing === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => handleSpacing(opt.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  selected
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface text-fg hover:border-accent"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted">
          Applies to PDFs you upload after changing this — re-upload a file to re-apply.
        </p>
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
