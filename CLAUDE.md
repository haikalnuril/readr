# CLAUDE.md

Instruksi spesifik untuk Claude Code di repo ini. **Lihat `AGENTS.md`** untuk
operating manual lengkap (tech stack, commands, urutan kerja, larangan).

## Ringkas

- App: pembaca file `.md` / `.txt` / `.pdf` + dark mode + histori (`localStorage`).
- Stack: Next.js 15 App Router, TypeScript, Tailwind v3, di-deploy ke Vercel.
- Harness: `AGENTS.md` (manual), `feature_list.json` (scope), `claude-progress.md`
  (state), `init.sh` (lifecycle), test + lint + typecheck (verification).

## Alur tiap sesi

1. `bash init.sh` → pastikan environment sehat.
2. Baca `claude-progress.md` lalu `feature_list.json`.
3. **Intake dulu:** kalau user minta fitur/perubahan/refactor baru, **catat dulu
   ke `feature_list.json`** (entry baru `status: "in-progress"`, ada `type` &
   `definition_of_done`) **sebelum menulis kode**. Lihat bagian *Intake* di
   `AGENTS.md`.
4. Ambil **satu** entry `todo`/`in-progress`, kerjakan sampai *definition_of_done*.
5. Verifikasi: `npm run test && npm run lint && npm run typecheck && npm run build`.
6. Set `status` entry → `done`, update `claude-progress.md` + `feature_list.json`,
   lalu commit.

> Aturan inti: **request → catat di `feature_list.json` → baru kerjakan**.
> Berlaku untuk fitur baru maupun refactor/perubahan. Jangan ngoding tanpa entry.

## Konvensi kode

- Komponen React di `src/components`, satu file per komponen, PascalCase.
- Logika non-UI di `src/lib` (parsers, storage, types).
- Komponen yang pakai `localStorage`/browser API harus `"use client"`.
- Akses `localStorage`/`window` selalu di-guard (`typeof window !== "undefined"`)
  supaya aman saat SSR / build Vercel.
- Tailwind untuk styling; tema lewat CSS variables di `src/app/globals.css`.

## Jangan

- Jangan bikin server route yang butuh secret untuk fitur MVP — semua client-side.
- Jangan commit `.env.local`. `.env.example` boleh (hanya placeholder).
