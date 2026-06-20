# FileReader App — dengan Harness Engineering

> Ringkasan session: ide aplikasi pembaca file (`.md`, `.txt`, `.pdf`) dengan dark mode/custom theme, dibangun menggunakan prinsip Harness Engineering agar AI coding agent bisa bekerja secara reliable dari awal sampai selesai.

---

## ✅ Status Implementasi

MVP sudah **terbangun dan terverifikasi** (`test` + `lint` + `typecheck` + `build` lulus):

- **F01** Upload & baca `.md` / `.txt` / `.pdf` (PDF di-parse client-side) ✅
- **F02** Tema light / dark / sepia / midnight (persist via `next-themes`) ✅
- **F03** Histori file di `localStorage` (dedupe, persist) ✅
- **F04** Pengatur ukuran font 12–24px (persist) ✅
- **F05** Sync lintas device (Supabase) — masih `todo` (lihat `feature_list.json`)

### Jalankan lokal

```bash
bash init.sh          # install + typecheck + lint + test
npm run dev           # http://localhost:3000
```

Verifikasi manual: `npm run test`, `npm run lint`, `npm run typecheck`, `npm run build`.

### Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Di [vercel.com](https://vercel.com) → **Add New → Project** → import repo ini.
3. Framework otomatis terdeteksi **Next.js** — biarkan semua setting default
   (build `next build`, root `/`). Tidak ada langkah konfigurasi tambahan.
4. **Deploy.** Push ke `main` = production; setiap PR = preview deploy otomatis.

> **Env vars:** MVP (F01–F04) **tidak butuh env var apa pun**. Variabel hanya
> diperlukan untuk F05 (Supabase) — lihat `.env.example`, lalu set di
> Vercel → Settings → Environment Variables. `.env.local` di-gitignore.

---

## 💡 Ide Aplikasi

Sebuah web app yang:
- Bisa dibuka di semua ukuran HP (mobile-first, responsive)
- Membaca file `.md`, `.txt`, dan `.pdf` yang diupload user
- Menampilkan konten dengan **dark mode** atau custom theme (sepia, midnight, dsb.)
- Menyimpan **histori file** yang pernah dibuka

### Keputusan Arsitektur

| Kebutuhan | Solusi |
|---|---|
| Responsive di semua HP | Next.js 15 + Tailwind CSS |
| Baca `.md` | `react-markdown` |
| Baca `.pdf` | PDF.js / `pdf-parse` |
| Baca `.txt` | Native File API |
| Dark mode / custom theme | `next-themes` + CSS variables |
| Histori file (1 device) | `localStorage` |
| Histori sync lintas device | Supabase (PostgreSQL + Auth) |

---

## 🧠 Apa itu Harness Engineering?

> *"The model is smart, the harness makes it reliable."*

**Harness Engineering** adalah praktik membangun *lingkungan* di sekitar AI coding agent agar bisa bekerja secara konsisten, tidak overreach, dan tidak "pura-pura selesai."

Tanpa harness, AI agent cenderung:
- Skip langkah penting
- Break test lalu bilang "done"
- Mulai dari nol di setiap sesi (tidak ada memory antar sesi)
- Mengerjakan terlalu banyak hal sekaligus tapi tidak ada yang selesai

Dengan harness, agent:
- Tahu persis harus mengerjakan apa dan urutannya
- Melanjutkan dari titik terakhir di setiap sesi baru
- Tidak bisa klaim "selesai" tanpa verifikasi yang lulus
- Fokus pada satu fitur sekaligus

---

## 🏗️ 5 Subsistem Harness

```
┌──────────────────────────────────────────────┐
│                  THE HARNESS                 │
│                                              │
│  1. Instructions   → AGENTS.md / CLAUDE.md  │
│  2. State          → progress.md            │
│  3. Verification   → tests + lint           │
│  4. Scope          → feature_list.json      │
│  5. Session        → init.sh / cleanup      │
│                                              │
└──────────────────────────────────────────────┘
```

| Subsistem | Fungsi | File |
|---|---|---|
| **Instructions** | Apa yang harus dikerjakan, urutannya, apa yang dibaca pertama | `AGENTS.md`, `CLAUDE.md` |
| **State** | Apa yang sudah selesai, sedang berjalan, berikutnya | `progress.md`, `git log` |
| **Verification** | Bukti nyata bahwa fitur berjalan (bukan cuma klaim) | `tests`, `lint`, `type-check` |
| **Scope** | Satu fitur sekaligus, ada definisi "selesai" yang jelas | `feature_list.json` |
| **Session Lifecycle** | Init di awal, bersih di akhir, handoff untuk sesi berikutnya | `init.sh` |

---

## 📁 Struktur Project

```
filereader-app/
├── AGENTS.md                  ← operating manual untuk AI agent
├── CLAUDE.md                  ← instruksi spesifik untuk Claude Code
├── init.sh                    ← setup otomatis: install + verify + dev server
├── feature_list.json          ← daftar fitur + status (done/in-progress/todo)
├── claude-progress.md         ← catatan tiap sesi agent
│
├── src/
│   ├── app/                   ← Next.js App Router
│   │   ├── page.tsx           ← halaman utama (upload + histori)
│   │   └── reader/[id]/       ← halaman baca file
│   ├── components/
│   │   ├── FileUploader.tsx
│   │   ├── FileReader.tsx
│   │   ├── ThemeSelector.tsx
│   │   └── HistoryList.tsx
│   ├── lib/
│   │   ├── parsers/           ← md, txt, pdf parser
│   │   └── storage.ts         ← localStorage / Supabase adapter
│   └── styles/
│       └── themes.css         ← CSS variables untuk setiap tema
│
├── tests/                     ← unit + integration tests
├── package.json
└── .env.local
```

---

## 📄 Template File Harness

### `AGENTS.md`

```markdown
# FileReader App — Agent Operating Manual

## Baca ini pertama kali setiap sesi dimulai

## Tech Stack
- Next.js 15, TypeScript, Tailwind CSS
- next-themes untuk dark mode
- react-markdown, PDF.js untuk parsing
- localStorage untuk histori (MVP), Supabase untuk sync

## Commands
- `npm run dev`        → start dev server (localhost:3000)
- `npm run test`       → jalankan semua test
- `npm run lint`       → cek linting
- `npm run typecheck`  → cek TypeScript

## Urutan Kerja (WAJIB DIIKUTI)
1. Baca file ini (AGENTS.md)
2. Jalankan init.sh
3. Baca claude-progress.md (sesi sebelumnya)
4. Baca feature_list.json (pilih 1 fitur yang belum selesai)
5. Kerjakan HANYA fitur itu
6. Jalankan: npm run test && npm run lint && npm run typecheck
7. Kalau semua lulus → update progress.md + feature_list.json + commit
8. Kalau ada yang gagal → fix dulu, jangan lanjut

## LARANGAN
- Jangan kerjakan lebih dari 1 fitur sekaligus
- Jangan ubah struktur folder tanpa konfirmasi
- Jangan commit kalau test masih merah
- Jangan hapus atau overwrite file di /tests/
- Jangan hardcode API key atau credentials
```

---

### `feature_list.json`

```json
{
  "app": "FileReader App",
  "last_updated": "2026-06-20",
  "features": [
    {
      "id": "F01",
      "name": "Upload file (.md, .txt, .pdf)",
      "status": "todo",
      "definition_of_done": "User bisa upload file, konten tampil di reader. Test: upload masing-masing format, konten terbaca dengan benar."
    },
    {
      "id": "F02",
      "name": "Dark mode toggle",
      "status": "todo",
      "definition_of_done": "User bisa switch light/dark/sepia/midnight. Preferensi tersimpan di localStorage. Test: toggle persists setelah refresh."
    },
    {
      "id": "F03",
      "name": "Histori file (localStorage)",
      "status": "todo",
      "definition_of_done": "File yang pernah dibuka muncul di list histori. Test: buka 3 file berbeda, tutup browser, buka lagi → histori masih ada."
    },
    {
      "id": "F04",
      "name": "Font size adjuster",
      "status": "todo",
      "definition_of_done": "Slider font size 12-20px, tersimpan di localStorage."
    },
    {
      "id": "F05",
      "name": "Sync histori lintas device (Supabase)",
      "status": "todo",
      "definition_of_done": "User bisa login, histori sinkron antar device. Test: login di 2 browser berbeda, histori sama."
    }
  ]
}
```

---

### `claude-progress.md`

```markdown
# Claude Progress Log

## Template per sesi (copy-paste setiap sesi baru)

---

### Sesi [TANGGAL]

**Fitur dikerjakan:** F0X — [nama fitur]

**Yang dilakukan:**
- ...

**Hasil verifikasi:**
- [ ] npm run test  → PASS / FAIL
- [ ] npm run lint  → PASS / FAIL
- [ ] npm run typecheck → PASS / FAIL

**Status akhir:** selesai / belum selesai

**Yang masih perlu dikerjakan / diketahui sesi berikutnya:**
- ...

**Commit:** [hash atau "belum commit"]

---
```

---

### `init.sh`

```bash
#!/bin/bash
set -e

echo "=== FileReader App — Init ==="

# 1. Install dependencies
echo "→ Installing dependencies..."
npm install

# 2. Cek environment
echo "→ Checking environment..."
if [ ! -f .env.local ]; then
  echo "⚠️  .env.local tidak ditemukan. Copy dari .env.example"
  cp .env.example .env.local
fi

# 3. Jalankan type check
echo "→ Running typecheck..."
npm run typecheck

# 4. Jalankan lint
echo "→ Running lint..."
npm run lint

# 5. Jalankan test
echo "→ Running tests..."
npm run test

echo ""
echo "✅ Init selesai. Environment sehat."
echo "📋 Baca claude-progress.md untuk status sesi terakhir."
echo "📋 Baca feature_list.json untuk fitur yang belum selesai."
echo ""
```

---

## 🔄 Siklus Sesi Agent (Wajib Diikuti)

```
MULAI SESI
    │
    ▼
1. Baca AGENTS.md / CLAUDE.md
    │
    ▼
2. Jalankan init.sh
    │
    ▼
3. Baca claude-progress.md
   (apa yang terjadi sesi lalu?)
    │
    ▼
4. Baca feature_list.json
   (pilih 1 fitur status "todo")
    │
    ▼
5. Kerjakan HANYA fitur itu
    │
    ▼
6. Jalankan verifikasi
   npm test && npm run lint && npm run typecheck
    │
    ├── GAGAL → fix, ulangi langkah 6
    │
    └── LULUS ▼
    │
    ▼
7. Update claude-progress.md
   Update feature_list.json (ubah status → "done")
    │
    ▼
8. Commit
   git add . && git commit -m "feat: [nama fitur]"
    │
    ▼
SELESAI SESI — siap dilanjutkan kapan saja
```

---

## 🗃️ Schema Database (Opsional — untuk sync lintas device)

Kalau pakai Supabase:

```sql
-- Tabel user histori file
CREATE TABLE file_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,        -- 'md' | 'txt' | 'pdf'
  file_size   INTEGER,              -- bytes
  content     TEXT,                 -- isi file (opsional, bisa besar)
  opened_at   TIMESTAMPTZ DEFAULT NOW(),
  theme       TEXT DEFAULT 'light'  -- tema terakhir dipakai
);

-- Index untuk performa
CREATE INDEX ON file_history(user_id, opened_at DESC);
```

> **Catatan:** Untuk MVP, cukup pakai `localStorage` — tidak perlu database. Tambahkan Supabase hanya kalau fitur "sync lintas device" masuk `feature_list.json` dan statusnya sudah waktunya dikerjakan.

---

## 🚀 Cara Mulai Build dengan Claude Code

1. Buat folder project baru
2. Copy semua file harness (`AGENTS.md`, `CLAUDE.md`, `init.sh`, `feature_list.json`, `claude-progress.md`) ke root folder
3. Buka Claude Code di folder tersebut
4. Ketik: `"Baca AGENTS.md, jalankan init.sh, lalu mulai kerjakan fitur pertama di feature_list.json"`
5. Agent akan mengikuti harness — tidak perlu jelasin ulang konteks setiap sesi

---

## 📚 Referensi

- [Learn Harness Engineering — walkinglabs](https://github.com/walkinglabs/learn-harness-engineering)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [OpenAI: Harness engineering with Codex](https://openai.com/index/harness-engineering/)
- [next-themes documentation](https://github.com/pacocoursey/next-themes)
- [PDF.js](https://mozilla.github.io/pdf.js/)

---

*README ini dibuat sebagai panduan implementasi — mulai dari ide, arsitektur, hingga harness engineering yang memastikan AI agent bisa build app ini secara reliable dari awal sampai selesai.*
