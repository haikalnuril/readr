export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Human-friendly relative time: "Just now", "2 hours ago", "Yesterday", "3 days ago". */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  const ms = now.getTime() - then.getTime();
  if (Number.isNaN(ms)) return iso;

  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);

  if (sec < 45) return "Just now";
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  if (hour < 24) return `${hour} hour${hour === 1 ? "" : "s"} ago`;
  if (day === 1) return "Yesterday";
  if (day < 7) return `${day} days ago`;
  return then.toLocaleDateString();
}
