# readr — Agent Operating Manual

> Baca file ini **pertama kali** setiap sesi dimulai.

## Apa ini

Web app pembaca file (`.md`, `.txt`, `.pdf`) dengan dark mode / custom theme dan
histori file. Mobile-first, responsive, di-deploy ke **Vercel**.

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v3
- `next-themes` untuk dark mode / custom theme
- `react-markdown` + `remark-gfm` untuk render `.md`
- `pdfjs-dist` untuk parsing `.pdf` (client-side)
- `localStorage` untuk histori (MVP) — Supabase opsional untuk sync
- Vitest + Testing Library untuk test

## Commands

| Command | Fungsi |
|---|---|
| `npm run dev` | start dev server (http://localhost:3000) |
| `npm run build` | production build (yang dijalankan Vercel) |
| `npm run test` | jalankan semua test (Vitest, sekali jalan) |
| `npm run lint` | cek linting (ESLint / next lint) |
| `npm run typecheck` | cek TypeScript (`tsc --noEmit`) |
| `bash init.sh` | setup otomatis: install + verify |

## Urutan Kerja (WAJIB DIIKUTI)

1. Baca file ini (`AGENTS.md`)
2. Jalankan `bash init.sh`
3. Baca `claude-progress.md` (apa yang terjadi sesi sebelumnya?)
4. Baca `feature_list.json`
5. **INTAKE dulu** — kalau user minta fitur/perubahan/refactor baru, **catat ke
   `feature_list.json` SEBELUM menulis kode** (lihat bagian *Intake* di bawah).
6. Pilih **1** entry (`todo`/`in-progress`) dan kerjakan **HANYA** entry itu.
7. Jalankan: `npm run test && npm run lint && npm run typecheck && npm run build`
8. Kalau semua lulus → update `claude-progress.md` + `feature_list.json`
   (status → `done`) + commit.
9. Kalau ada yang gagal → fix dulu, jangan lanjut, jangan klaim selesai.

## Intake — Catat Dulu, Baru Kerjakan (WAJIB)

> Setiap kali user minta **fitur baru**, **perubahan**, atau **refactor**:
> tulis dulu permintaannya ke `feature_list.json`, baru eksekusi. Jangan
> langsung ngoding tanpa entry-nya tercatat.

**Langkah intake:**

1. **Tambah / update entry** di `feature_list.json`:
   - `id` — naik berurutan. Konvensi prefix: `F` = fitur, `R` = refactor,
     `C` = change/perubahan, `B` = bugfix (mis. `F06`, `R01`, `C02`).
   - `name` — ringkas, satu baris.
   - `type` — `"feature" | "refactor" | "change" | "fix"`.
   - `status` — set `"in-progress"` saat mulai.
   - `definition_of_done` — kriteria selesai **yang bisa diverifikasi**
     (apa yang berubah + test/cek apa yang harus lulus).
   - `notes` — opsional (file tersentuh, keputusan, dependensi).
   - Update `last_updated`.
2. Kalau permintaan ambigu / berisiko, konfirmasi singkat ke user **sebelum**
   ngoding (tetap catat entry-nya dulu, status `in-progress`).
3. **Baru kerjakan** sesuai entry itu (HANYA satu entry sekaligus).
4. Verifikasi (`test` + `lint` + `typecheck` + `build`).
5. Kalau lulus → ubah `status` entry ke `"done"`, isi `notes` hasil akhir,
   catat di `claude-progress.md`, lalu commit.

> Refactor = sama prosesnya. *definition_of_done* refactor: perilaku tidak
> berubah (test lama tetap hijau) + tujuan refactor tercapai.

## Deploy (Vercel)

- Project ini native Vercel: framework auto-detect = **Next.js**.
- Build command default `next build`, output default — **tidak perlu diubah**.
- Env vars diatur di Vercel Dashboard → Settings → Environment Variables
  (lihat `.env.example` untuk daftar variabel). MVP tidak butuh env var apa pun.
- Setiap push ke `main` = production deploy; setiap PR = preview deploy.

## LARANGAN

- Jangan kerjakan lebih dari 1 fitur sekaligus.
- Jangan ubah struktur folder tanpa konfirmasi.
- Jangan commit kalau test masih merah.
- Jangan hapus atau overwrite file di `/tests/`.
- Jangan hardcode API key atau credentials — pakai `.env.local`.
- Jangan klaim "selesai" tanpa output verifikasi yang lulus.
