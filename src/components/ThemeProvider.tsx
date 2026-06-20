"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "sepia", label: "Sepia" },
  { id: "midnight", label: "Midnight" },
] as const;

export const THEME_IDS = THEMES.map((t) => t.id);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem={false}
      themes={THEME_IDS as unknown as string[]}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
