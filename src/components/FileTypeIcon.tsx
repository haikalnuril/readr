import type { FileType } from "@/lib/types";

const STYLES: Record<FileType, { label: string; className: string }> = {
  md: { label: "MD", className: "bg-emerald-500/15 text-emerald-500" },
  pdf: { label: "PDF", className: "bg-rose-500/15 text-rose-500" },
  txt: { label: "TXT", className: "bg-slate-500/15 text-slate-400" },
};

export function FileTypeIcon({ type, className = "" }: { type: FileType; className?: string }) {
  const style = STYLES[type];
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[10px] font-bold tracking-wide ${style.className} ${className}`}
      aria-hidden
    >
      {style.label}
    </span>
  );
}
