# readr — dibangun dengan Harness Engineering

**readr** adalah web app pembaca file (`.md`, `.txt`, `.pdf`) yang mobile-first, punya dark mode /
custom theme, histori file, dan pengalaman baca ala webtoon/manga reader.
Dibangun pakai **Next.js 15** dan di-deploy ke **Vercel** — serta dikembangkan
memakai prinsip **Harness Engineering** supaya AI coding agent bisa lanjut kerja
secara reliable dari sesi ke sesi.

> Repo ini **publik**. Tidak ada secret yang di-commit. MVP berjalan sepenuhnya
> di browser (tanpa backend), jadi tidak butuh env var apa pun.

---

## ✅ Status

Semua diverifikasi dengan `test` + `lint` + `typecheck` + `build` lulus.
Sumber kebenaran status ada di [`feature_list.json`](./feature_list.json).

| ID | Fitur / Perubahan | Status |
|----|-------------------|--------|
| F01 | Upload & baca `.md` / `.txt` / `.pdf` (PDF di-parse client-side) | ✅ done |
| F02 | Tema light / dark / sepia / midnight (persist via `next-themes`) | ✅ done |
| F03 | Histori file di `localStorage` (dedupe, persist) | ✅ done |
| F04 | Pengatur ukuran font 12–24px (persist) | ✅ done |
| F05 | Sync histori lintas device (Supabase) | ⏳ todo |
| F06 | Resume posisi baca + tombol **Top** & **Last read** | ✅ done |
| C01 | Redesign UI + History jadi **sidebar geser** dari top bar | ✅ done |
| C02 | Auto-hide top bar saat baca (gaya manga/webtoon) | ✅ done |
| C03 | Ikon Settings diperbaiki | ✅ done |

---

## ✨ Fitur (sisi pengguna)

- **Upload** lewat tombol atau **drag & drop**; format `.md`, `.txt`, `.pdf`.
- **Markdown** dirender penuh (GFM: tabel, list, code, dll); `.txt`/`.pdf` tampil
  sebagai teks. PDF diekstrak teksnya **di browser** (tanpa server).
- **Tema**: light / dark / sepia / midnight — lewat CSS variables, tersimpan.
- **Histori** file di `localStorage`, plus toggle **Save history** (local only).
  Dibuka lewat **sidebar geser** dari ikon History di top bar.
- **Halaman Settings**: tema, ukuran font, dan kontrol histori.
- **Pengalaman baca ala webtoon**:
  - Top bar **auto-hide** saat scroll ke bawah, muncul saat scroll ke atas, dan
    **toggle saat halaman di-tap** (immersive reading).
  - Tombol melayang **Top** (ke atas) & **Last read** (balik ke posisi terakhir),
    ikut tampil/sembunyi bersama top bar.
  - **Resume otomatis**: buka lagi file dari histori → kembali ke posisi baca
    terakhir (disimpan sebagai fraction per file).

---

## 🚀 Menjalankan & Deploy

### Lokal

```bash
bash init.sh     # install deps + typecheck + lint + test
npm run dev      # http://localhost:3000
```

Perintah lain: `npm run build`, `npm run test`, `npm run lint`, `npm run typecheck`.

### Deploy ke Vercel

1. Push repo ini ke GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import repo.
3. Framework auto-detect **Next.js** — biarkan semua setting default
   (build `next build`, root `/`). Tidak ada konfigurasi tambahan.
4. **Deploy.** Push ke `main` = production; tiap PR = preview deploy otomatis.

> **Env vars:** MVP (F01–F04, F06) **tidak butuh env var**. Variabel hanya untuk
> F05 (Supabase) — lihat [`.env.example`](./.env.example), lalu set di
> Vercel → Settings → Environment Variables. `.env.local` di-gitignore.

---

## 🧱 Keputusan Arsitektur

| Kebutuhan | Solusi |
|---|---|
| Responsive di semua HP | Next.js 15 (App Router) + Tailwind CSS v3 |
| Baca `.md` | `react-markdown` + `remark-gfm` |
| Baca `.pdf` | `pdfjs-dist` (ekstraksi teks di client) |
| Baca `.txt` | `FileReader` (Web API) |
| Dark mode / custom theme | `next-themes` + CSS variables |
| Histori (1 device) | `localStorage` (adapter di `lib/storage.ts`) |
| Resume baca | scroll-fraction per file di `localStorage` |
| Sync lintas device (F05) | Supabase (PostgreSQL + Auth) — belum dipasang |
| Test | Vitest + Testing Library (jsdom) |

`lib/storage.ts` sengaja dibuat sebagai **adapter** supaya backend (Supabase)
bisa ditambahkan tanpa mengubah komponen UI.

---

## 📁 Struktur Project

```
readr/
├── AGENTS.md                 ← operating manual untuk AI agent (+ aturan Intake)
├── CLAUDE.md                 ← instruksi spesifik Claude Code
├── init.sh                   ← setup: install + typecheck + lint + test
├── feature_list.json         ← scope: daftar fitur/perubahan + status
├── claude-progress.md        ← state: catatan tiap sesi agent
├── vercel.json               ← deklarasi framework (Next.js)
├── .env.example              ← daftar env var (hanya untuk F05)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                ← root layout + ThemeProvider
│   │   ├── page.tsx                  ← Home (upload + recent files)
│   │   ├── settings/page.tsx         ← Settings (tema, font, histori)
│   │   ├── reader/[id]/page.tsx      ← halaman baca
│   │   └── globals.css               ← Tailwind + token tema + style markdown
│   ├── components/
│   │   ├── TopBar.tsx                ← top bar + tombol History/Settings
│   │   ├── ChromeContext.tsx         ← visibilitas chrome (auto-hide + tap)
│   │   ├── HistoryDrawer.tsx         ← sidebar histori geser
│   │   ├── HistoryList.tsx           ← daftar "Recent files" di Home
│   │   ├── FileUploader.tsx          ← kartu upload (drag & drop)
│   │   ├── FileReaderView.tsx        ← render md / txt / pdf
│   │   ├── ReaderControls.tsx        ← tombol melayang Top & Last read
│   │   ├── ThemeProvider.tsx         ← wrapper next-themes
│   │   ├── ThemePills.tsx            ← pemilih tema (pill)
│   │   ├── Toggle.tsx                ← switch on/off
│   │   ├── FileTypeIcon.tsx          ← badge tipe file (MD/TXT/PDF)
│   │   └── icons.tsx                 ← ikon SVG
│   └── lib/
│       ├── parsers/index.ts          ← deteksi tipe + parse file
│       ├── parsers/pdf.ts            ← ekstraksi teks PDF (client-only)
│       ├── storage.ts                ← localStorage: histori, font, posisi baca
│       ├── format.ts                 ← format ukuran & waktu relatif
│       └── types.ts                  ← tipe bersama
│
├── tests/                    ← storage / parsers / format (Vitest)
├── package.json
└── next.config.mjs · tailwind.config.ts · tsconfig.json · vitest.config.ts
```

---

## 🧠 Harness Engineering

> *"The model is smart, the harness makes it reliable."*

**Harness Engineering** adalah praktik membangun *lingkungan* di sekitar AI coding
agent agar bekerja konsisten, tidak overreach, dan tidak "pura-pura selesai".
Repo ini memakai 5 subsistem:

| Subsistem | Fungsi | File |
|---|---|---|
| **Instructions** | Apa yang dikerjakan, urutannya, apa yang dibaca lebih dulu | [`AGENTS.md`](./AGENTS.md), [`CLAUDE.md`](./CLAUDE.md) |
| **State** | Apa yang sudah/sedang/berikutnya dikerjakan | [`claude-progress.md`](./claude-progress.md), `git log` |
| **Verification** | Bukti nyata fitur jalan (bukan klaim) | `npm run test` / `lint` / `typecheck` / `build` |
| **Scope** | Satu entry sekaligus, ada definisi "selesai" jelas | [`feature_list.json`](./feature_list.json) |
| **Session Lifecycle** | Init di awal, handoff untuk sesi berikutnya | [`init.sh`](./init.sh) |

Aturan kerja lengkap untuk agent — termasuk **Intake** (catat tiap request ke
`feature_list.json` *sebelum* ngoding) dan konvensi `id` — ada di
[`AGENTS.md`](./AGENTS.md). Dari sisi proyek, intinya: **scope dikelola lewat
`feature_list.json`, dan tidak ada kode tanpa entry-nya tercatat.**

### Siklus tiap sesi

```
1. Baca AGENTS.md / CLAUDE.md
2. bash init.sh                         (install + verify)
3. Baca claude-progress.md              (sesi lalu ngapain?)
4. Baca feature_list.json               (pilih 1 entry todo/in-progress)
   └─ Ada request baru? → catat dulu sebagai entry (INTAKE)
5. Kerjakan HANYA 1 entry itu
6. Verifikasi: npm run test && lint && typecheck && build
   ├─ GAGAL → fix, ulangi
   └─ LULUS → lanjut
7. Update claude-progress.md + feature_list.json (status → done)
8. Commit
```

---

## 🗃️ Schema Database (opsional — untuk F05, sync lintas device)

Belum dipasang. Untuk MVP cukup `localStorage`. Kalau F05 dikerjakan dengan
Supabase:

```sql
CREATE TABLE file_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,        -- 'md' | 'txt' | 'pdf'
  file_size   INTEGER,              -- bytes
  content     TEXT,                 -- isi file (opsional, bisa besar)
  opened_at   TIMESTAMPTZ DEFAULT NOW(),
  theme       TEXT DEFAULT 'light'
);

CREATE INDEX ON file_history(user_id, opened_at DESC);
```

---

## 📚 Referensi

- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [next-themes](https://github.com/pacocoursey/next-themes) · [PDF.js](https://mozilla.github.io/pdf.js/) · [react-markdown](https://github.com/remarkjs/react-markdown)
- [Next.js di Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
