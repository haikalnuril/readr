# Claude Progress Log

Catatan tiap sesi agent. **Sesi terbaru di paling atas.**

---

### Sesi 2026-06-21 (f) — B06: deteksi paragraf PDF via indent

**Fitur dikerjakan:** B06 (fix).

**Akar masalah (dari PDF asli user):** novel ini **tidak punya gap vertikal**
antar-paragraf — paragraf hanya dibedakan **indent baris pertama**. Jadi deteksi
berbasis gap (B04/B05) + preset Tight tidak bisa lihat batas paragraf.

**Yang dilakukan:**
- `pdf.ts`: simpan **x kiri** tiap baris. `bodyLeft = min(x)`. Paragraf baru bila
  `(x - bodyLeft) > ~0.5em` (indent) **ATAU** gap besar (cara lama). Wrapped line
  (di margin kiri, gap kecil) tetap digabung.
- Test indent-based di `tests/pdf.test.ts` (8 test pdf, total 29).

**Hasil verifikasi:**
- [x] npm run test  → PASS (29)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. B06 `done`. Sekarang dua gaya paragraf tertangani:
indent-based (novel) dan blank-line-based.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-21 (e) — F08: setting Paragraph spacing (Tight/Normal/Loose)

**Fitur dikerjakan:** F08 (feature). User pilih opsi "preset sederhana, berlaku
saat re-upload" (bukan slider percentile mentah, bukan live re-tuning).

**Yang dilakukan:**
- `types.ParagraphSpacing` = "tight" | "normal" | "loose".
- `storage`: get/setParagraphSpacing (default "normal").
- `pdf.ts`: `pdfTextFromItems(items, factor)` & `parsePdf(data, factor)`.
- `parsers/index.ts`: `parseFile(file, opts)` + map preset→factor
  (tight 1.25 / normal 1.4 / loose 1.7).
- `FileUploader`: baca `getParagraphSpacing()` saat upload.
- `Settings`: section **Reading** → preset pills Tight/Normal/Loose + catatan
  "berlaku untuk PDF yang di-upload setelah diubah (re-upload untuk file lama)".
- Test factor (tight memecah lebih banyak) di `tests/pdf.test.ts`.

**Hasil verifikasi:**
- [x] npm run test  → PASS (28)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. F08 `done`.

**Catatan:** by design preset hanya kena saat parse/upload (konten tersimpan
sebagai teks). Live re-tuning butuh simpan data baris per-PDF — ditolak user.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-21 (d) — B05: PDF paragraf under-segment (refinement B04)

**Fitur dikerjakan:** B05 (fix, lanjutan B04).

**Masalah:** B04 masih menggabung banyak paragraf jadi satu per halaman. Akar:
baseline pakai MEDIAN gap; di prosa dengan paragraf pendek, mayoritas gap adalah
gap antar-paragraf → median tinggi → ambang tak pernah kena.

**Yang dilakukan:**
- `pdf.ts`: baseline leading dari gap kecil — persentil ke-25 gap, di-**clamp**
  ke `[h*0.85, h*1.4]` (h = tinggi font median) supaya halaman berisi paragraf
  1-baris tidak menaikkan ambang. `paragraphGap = leading * 1.4`.
- Tambah test kasus "mayoritas paragraf 1-baris" di `tests/pdf.test.ts`.

**Hasil verifikasi:**
- [x] npm run test  → PASS (27)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. B05 `done`.

**Catatan:** heuristik berbasis gap; PDF yang paragrafnya hanya dibedakan indent
(tanpa spasi vertikal) tetap sulit dipisah — di luar lingkup sekarang.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-21 (c) — B04: paragraf PDF + diskusi gambar PDF

**Fitur dikerjakan:** B04 (fix).

**Masalah:** ekstraksi PDF menggabung semua teks per halaman dengan spasi →
paragraf/baris hilang, jadi satu blok (membingungkan untuk novel/dialog).

**Yang dilakukan:**
- Rewrite `lib/parsers/pdf.ts`: group text item per baris pakai posisi-y
  (`transform[5]`), gabung wrapped line dalam paragraf dengan spasi, dan sisip
  baris kosong saat gap antar-baris > ~1.5x median leading (deteksi paragraf).
- Export `pdfTextFromItems(items)` (fungsi murni) + `tests/pdf.test.ts` (5 test).

**Hasil verifikasi:**
- [x] npm run test  → PASS (26)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. B04 `done`.

**Keputusan gambar PDF:** user pilih **TEXT-ONLY** (tidak menampilkan
gambar/cover PDF). Alasan: pertahankan fitur teks (search, font size, dark mode,
reflow). Jadi tidak ada kerja render-gambar. Jangan tawarkan lagi kecuali user
berubah pikiran.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-21 (b) — B03: fix tabel overflow di mobile

**Fitur dikerjakan:** B03 (fix). App sudah live di Vercel (readr-*.vercel.app).

**Masalah:** tabel markdown lebih lebar dari layar → mendorong seluruh halaman
geser ke samping di HP.

**Yang dilakukan:**
- `FileReaderView`: override `components.table` react-markdown → bungkus tiap
  `<table>` dengan `<div class="table-scroll">`.
- `globals.css`: `.table-scroll { overflow-x: auto }` (tabel scroll di dalam
  kotaknya sendiri), `table { min-width:100%; width:max-content }`,
  `.markdown-body { overflow-wrap/word-break }`, inline `code` wrap.
- **Sengaja tidak** pakai `overflow-x:hidden` di main supaya tidak jadi
  scroll-container (window-scroll: auto-hide bar + posisi baca tetap jalan).

**Hasil verifikasi:**
- [x] npm run test  → PASS (21)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. B03 `done`.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-21 — F07: cari teks di dokumen + next/prev

**Fitur dikerjakan:** F07 (feature). Juga: entry C04 (rename 'readr') yang sempat
hilang dari feature_list.json di-restore sebagai `done`.

**Yang dilakukan:**
- `ReaderSearch` — search bar di reader (fixed top): input, hitungan `n/total`,
  tombol naik/turun, tombol tutup. Enter = next, Shift+Enter = prev, Esc = tutup.
- Highlight pakai **CSS Custom Highlight API** (`CSS.highlights` + `Highlight`),
  jadi **tidak mengubah DOM** hasil render markdown. Style `::highlight(...)` di
  `globals.css` (semua hasil kuning, hasil aktif oranye). Hasil aktif di-scroll
  ke tengah layar.
- `findRanges` jalan via `TreeWalker` di `contentRef` (membungkus FileReaderView).
- `TopBar` dapat slot `actions`; reader mengisi tombol Search (toggle).
- Guard `supportsHighlight()` → no-op kalau browser tak dukung (navigasi tetap).

**Hasil verifikasi:**
- [x] npm run test  → PASS (21)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS (tipe Highlight API ada di TS 5.8)
- [x] npm run build → PASS

**Status akhir:** selesai. F07 `done`.

**Catatan:**
- Pencarian per text-node (kata yang terpotong antar elemen tidak terhitung) —
  cukup untuk kebutuhan baca biasa.
- Tugas Vercel MCP ditunda atas permintaan user.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-20 (g) — C04: rename app jadi 'readr'

**Fitur dikerjakan:** C04 (change) — intake → rename → verifikasi → `done`.

**Yang dilakukan:**
- Nama app diganti **FileReader → readr** di: logo top bar (lowercase), metadata
  `title`, `package.json`/`package-lock.json` (`name`), `feature_list.json`
  (`app`), `AGENTS.md`, `README.md`, `init.sh`, `.env.example`, komentar
  `storage.ts`.
- **Tidak disentuh:** Web API `FileReader` di `parsers/index.ts` dan komponen
  `FileReaderView` (nama teknis, bukan branding).

**Hasil verifikasi:**
- [x] npm run test  → PASS (21)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS (script jalan sebagai `readr@0.1.0`)

**Status akhir:** selesai. C04 `done`.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-20 (f) — B02: fix bookmark ketimpa + sembunyikan Top di puncak

**Fitur dikerjakan:** B02 (fix) — intake → fix → verifikasi → `done`.

**Akar masalah:**
- Guard "jangan simpan saat scroll programatik" pakai ambang jarak `< 4px`,
  jadi rilis **4px sebelum** sampai puncak. Ekor animasi smooth-scroll (4px→0)
  lalu **menyimpan posisi 0**, menimpa posisi baca asli. Akibatnya saat sudah di
  puncak, "Last read" menunjuk ke 0 → klik tidak berfungsi.

**Yang dilakukan:**
- Guard diganti ke **deteksi scroll-idle**: `programmaticRef` aktif selama
  animasi penuh, baru lepas ~160ms setelah scroll berhenti (`scheduleRelease`).
  Aman untuk halaman panjang & untuk kasus tanpa pergerakan. Posisi tersimpan
  tak pernah ketimpa oleh ekor animasi.
- Tambah state `atTop` (scrollY < 8) → tombol **Top disembunyikan saat di puncak**.
  Bookmark tetap tampil mengikuti visibilitas chrome.

**Hasil verifikasi:**
- [x] npm run test  → PASS (21)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. B02 `done`.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-20 (e) — B01: tombol FAB ikut visibilitas top bar

**Fitur dikerjakan:** B01 (fix) — dicatat dulu di `feature_list.json`, fix, verifikasi, `done`.

**Bug yang diperbaiki:**
- Tombol "Last read" hilang saat di puncak & tombol "Top" muncul berdasarkan
  posisi scroll. User mau keduanya muncul/hilang **bersama top bar** (toggle saat
  tap, muncul saat scroll ke atas).

**Yang dilakukan:**
- `ChromeContext` baru jadi satu sumber kebenaran visibilitas chrome (scroll
  hide/show + tap toggle). `TopBar` & `ReaderControls` sama-sama baca `visible`
  dari sini — jadi sinkron. Logika scroll/tap dipindah dari TopBar ke provider.
- `TopBar` tidak lagi punya prop `autoHide`; reader dibungkus `<ChromeProvider>`.
  Halaman lain (home/settings) tanpa provider → bar selalu tampil (default).
- `HistoryDrawer` dapat `data-chrome-ignore` supaya klik backdrop/panel drawer
  tidak ikut men-toggle chrome.
- `ReaderControls`: visibilitas dari context (bukan ambang scroll). Guard simpan
  posisi diganti ke **target-distance** (bukan timeout) → scroll otomatis (restore/
  Top/Last read) tidak menimpa posisi baca tersimpan, walau halaman panjang.

**Hasil verifikasi:**
- [x] npm run test  → PASS (21)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. B01 `done`.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-20 (d) — C03 ikon Settings + F06 resume baca

**Fitur dikerjakan:** C03 (change) & F06 (feature) — dicatat dulu di
`feature_list.json` (`in-progress`), dikoding, diverifikasi, lalu di-set `done`.

**Yang dilakukan:**
- **C03:** `SettingsIcon` di `components/icons.tsx` diganti path gear yang
  lengkap (sebelumnya path terpotong → terlihat rusak). Tambah `ArrowUpIcon` &
  `BookmarkIcon`.
- **F06:** `storage.ts` + `getReadPosition`/`setReadPosition` (simpan **fraction
  0..1** per id, robust terhadap perubahan font), dibersihkan saat entri/histori
  dihapus. Komponen `ReaderControls` (FAB di reader):
  - **Resume otomatis** ke posisi baca terakhir saat file dibuka lagi (termasuk
    setelah keluar-masuk app, selama Save history ON → id file stabil).
  - Tombol **Top** (ke atas) dan **Last read** (balik ke posisi terakhir, muncul
    setelah lompat ke atas). Scroll programatik tidak menimpa posisi tersimpan.

**Hasil verifikasi:**
- [x] npm run test  → PASS (21)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. C03 & F06 `done`.

**Yang perlu diketahui sesi berikutnya:**
- Resume bergantung pada id file yang stabil → butuh Save history ON. Kalau Save
  history OFF dan app ditutup (sessionStorage hilang), file yang di-upload ulang
  dapat id baru sehingga posisi lama tak ter-resume (by design).

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-20 (c) — C02: Auto-hide top bar (manga reader)

**Fitur dikerjakan:** C02 (type `change`) — mengikuti aturan Intake: dicatat dulu
di `feature_list.json` (`in-progress`) baru dikoding, lalu di-set `done`.

**Yang dilakukan:**
- `TopBar` dapat prop `autoHide`. Saat aktif: bar **sembunyi waktu scroll ke
  bawah**, **muncul waktu scroll ke atas**, selalu muncul dekat puncak (<64px),
  dan **tap/klik area baca men-toggle** bar (immersive). Tap pada
  link/tombol/header/drawer diabaikan.
- Diaktifkan di `/reader/[id]` (`<TopBar … autoHide />`). Halaman lain tidak.

**Hasil verifikasi:**
- [x] npm run test  → PASS (18)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai. C02 `done`.

**Yang perlu diketahui sesi berikutnya:**
- Logika murni interaksi DOM (scroll + click) di `TopBar`, jadi belum ada unit
  test khusus — diverifikasi lewat build + manual.

**Commit:** (belum commit — menunggu instruksi user)

---

### Sesi 2026-06-20 (b) — UI redesign + nav baru

**Fitur dikerjakan:** UI/UX (tetap F01–F04, tanpa ubah scope)

**Yang dilakukan:**
- Redesign tampilan agar sesuai mockup: kartu upload (ikon cloud, pill format
  `.md/.txt/.pdf`, tombol "Choose file"), daftar "Recent files" pakai ikon tipe
  file berwarna + waktu relatif, halaman **Settings** (`/settings`) dengan pill
  tema + slider font + toggle.
- **Navigasi diubah:** bottom navbar dihapus. **History** dipindah ke tombol di
  **top bar**; saat diklik membuka **sidebar geser dari kanan** (`HistoryDrawer`,
  backdrop + animasi translate, tutup via Esc/backdrop/X). **Settings** jadi ikon
  gear di top bar.
- Komponen baru: `TopBar`, `HistoryDrawer`, `ThemePills`, `Toggle`, `FileTypeIcon`,
  `icons.tsx`, helper `lib/format.ts`. Hapus `ThemeSelector` & `FontSizeAdjuster`.
- `lib/storage.ts` ditambah: preferensi **Save history** (`getSaveHistory`/
  `setSaveHistory`) + cache dokumen di **sessionStorage** supaya reader tetap jalan
  walau histori persist dimatikan. Toggle "Sync across devices" sengaja disabled (F05).

**Hasil verifikasi:**
- [x] npm run test  → PASS (18 test)
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS (5 route, +`/settings`)

**Status akhir:** selesai. Scope fitur tidak berubah (F05 masih `todo`).

**Yang perlu diketahui sesi berikutnya:**
- Drawer & top bar dipakai bersama oleh `/` dan `/reader/[id]` lewat `TopBar`.
- "Save history" OFF: dokumen aktif tetap bisa dibaca via sessionStorage (per-tab),
  tapi tidak masuk daftar Recent yang persist.

**Commit:** (lihat `git log`)

---

### Sesi 2026-06-20 — Bootstrap + F01–F04

**Fitur dikerjakan:** F01, F02, F03, F04 (MVP penuh, localStorage-based)

**Yang dilakukan:**
- Scaffold Next.js 15 (App Router) + TypeScript + Tailwind v3, siap deploy Vercel.
- Pasang harness: `AGENTS.md`, `CLAUDE.md`, `init.sh`, `feature_list.json`, log ini.
- F01 — `lib/parsers` (md/txt/pdf, PDF via `pdfjs-dist` client-side) + `FileUploader`.
- F02 — `next-themes` + `ThemeSelector` + 4 tema (light/dark/sepia/midnight) via CSS vars.
- F03 — `lib/storage.ts` adapter `localStorage` + `HistoryList` (dedupe, persist).
- F04 — `FontSizeAdjuster` (12–24px, persist di localStorage).
- Halaman: `/` (upload + histori) dan `/reader/[id]` (baca file).
- Test Vitest: `tests/storage.test.ts`, `tests/parsers.test.ts`.

**Hasil verifikasi:**
- [x] npm run test  → PASS
- [x] npm run lint  → PASS
- [x] npm run typecheck → PASS
- [x] npm run build → PASS

**Status akhir:** selesai (F01–F04). F05 (Supabase sync) masih `todo`.

**Yang perlu diketahui sesi berikutnya:**
- F05 butuh proyek Supabase + env var (`NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Lihat `.env.example`.
- `lib/storage.ts` sengaja dibuat sebagai adapter agar backend mudah ditambah
  tanpa mengubah komponen UI.
- PDF worker dipin ke versi `pdfjs-dist` yang terinstall (lihat `lib/parsers/pdf.ts`).

**Commit:** (lihat `git log`)

---

## Template per sesi (copy ke atas untuk sesi baru)

```markdown
### Sesi [TANGGAL] — [judul singkat]

**Fitur dikerjakan:** F0X — [nama]

**Yang dilakukan:**
- ...

**Hasil verifikasi:**
- [ ] npm run test  → PASS / FAIL
- [ ] npm run lint  → PASS / FAIL
- [ ] npm run typecheck → PASS / FAIL

**Status akhir:** selesai / belum selesai

**Yang perlu diketahui sesi berikutnya:**
- ...

**Commit:** [hash atau "belum commit"]
```
