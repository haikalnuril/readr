import { describe, expect, it } from "vitest";
import { formatRelativeTime, formatSize } from "@/lib/format";

describe("formatSize", () => {
  it("formats bytes, KB and MB", () => {
    expect(formatSize(512)).toBe("512 B");
    expect(formatSize(12 * 1024)).toBe("12.0 KB");
    expect(formatSize(4.2 * 1024 * 1024)).toBe("4.2 MB");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-06-20T12:00:00Z");
  const ago = (ms: number) => new Date(now.getTime() - ms).toISOString();

  it("describes recent times", () => {
    expect(formatRelativeTime(ago(10 * 1000), now)).toBe("Just now");
    expect(formatRelativeTime(ago(2 * 60 * 1000), now)).toBe("2 minutes ago");
    expect(formatRelativeTime(ago(2 * 60 * 60 * 1000), now)).toBe("2 hours ago");
    expect(formatRelativeTime(ago(26 * 60 * 60 * 1000), now)).toBe("Yesterday");
    expect(formatRelativeTime(ago(3 * 24 * 60 * 60 * 1000), now)).toBe("3 days ago");
  });
});
