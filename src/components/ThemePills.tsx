"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { THEMES } from "./ThemeProvider";

export function ThemePills() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const active = mounted ? theme : "light";

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => {
        const selected = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(t.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-fg hover:border-accent"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
