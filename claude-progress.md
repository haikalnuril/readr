# Claude Progress Log

Catatan tiap sesi agent. **Sesi terbaru di paling atas.**

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
