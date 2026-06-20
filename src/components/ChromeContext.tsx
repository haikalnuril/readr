"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ChromeState {
  /** Whether the reading chrome (top bar + floating controls) is shown. */
  visible: boolean;
}

const ChromeContext = createContext<ChromeState>({ visible: true });

export function useChrome(): ChromeState {
  return useContext(ChromeContext);
}

// Taps on these never toggle the chrome (controls, links, the bar, the drawer).
const INTERACTIVE =
  "a, button, input, select, textarea, label, [role=dialog], header, [data-chrome-ignore]";

/**
 * Webtoon/manga-style reading chrome. A single source of truth so the top bar
 * AND the floating reader controls appear/disappear together:
 *  - scroll down  → hide
 *  - scroll up    → show
 *  - tap the page → toggle
 *  - near the top → always show
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 64) setVisible(true);
      else if (y > lastY + 6) setVisible(false);
      else if (y < lastY - 6) setVisible(true);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (el?.closest(INTERACTIVE)) return;
      setVisible((v) => !v);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <ChromeContext.Provider value={{ visible }}>{children}</ChromeContext.Provider>;
}
