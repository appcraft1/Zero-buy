# PRD - ZERO BUY (Should I Buy It? — Anti-Impulsive Decision Engine)
================================================================================
STATUS DOKUMEN: DISETUJUI & SIAP EKSEKUSI ("OKE TERAPKAN - 2026-10-26")
VERSI: 1.1.0 (Final Approved Specification)
MODUL ID: 02-zero-buy
TARGET OUTPUT: Zero Buy.apk (Capacitor 8.x Hybrid Android APK)
ARSITEKTUR DATA: 100% Offline-First IndexedDB + JSON Export/Backup
ESTETIKA VISUAL: Dark Slate (#0f172a / #1e293b) + Mobile-First Fluid UX + Inline SVG
================================================================================

################################################################################
# ZONA ATAS: BLUEPRINT AWAL SPESIFIKASI PRODUK
################################################################################

## 1. PROBLEM STATEMENT & NILAI STRATEGIS
- **Masalah Utama:** Kebiasaan belanja impulsif akibat diskon semu e-commerce, lapar mata saat scrolling media sosial, atau pelampiasan stres sesaat yang menguras kas bulanan tanpa disadari.
- **Dampak Finansial:** Memperlambat pencapaian target pelunasan utang Rp25.6 Juta (Maret 2027) dan roadmap tabungan tunai Rp300 Juta (Desember 2028).
- **Solusi Zero Buy:** Aplikasi penahan nafsu belanja (*impulse blocker*) yang memaksa pengguna mengonversi harga barang menjadi "Berapa jam/hari keringat kerja bebas (*Real Disposable Work Hours*) yang harus dibayar", memberikan skor kelayakan beli lewat kuis psikologi 4 pertanyaan dengan **Aturan Veto Hard-Stop**, dan mengunci barang dalam masa pendinginan (*cooling-off timer* 24–168 jam) sebelum keputusan final dieksekusi, dilengkapi **Money Saved Tracker** untuk merayakan setiap rupiah yang berhasil diselamatkan.

---

## 2. PENGGUNA & PERAN
- **Pengguna Tunggal (Personal Mode):** Komandan Muhammad Asep Solihin (dan publik umum pengguna Android).
- **Peran Sistem:** Penasihat keuangan keras (*tough-love financial coach*) yang objektif, tanpa kompromi, dan anti-impulsive buying.

---

## 3. ARSITEKTUR TEKNIS & STACK TEKNOLOGI
- **Frontend Core:** Vanilla HTML5, Modern CSS (Fluid Typography, CSS Variables, Slate Glassmorphism halus), Vanilla JavaScript ES6+ (Modular & Reactive).
- **Mobile Container:** Capacitor 8.x Android Bridge (`com.iaiflash.zerobuy`).
- **Hardware Native Bridge:**
  - `Haptic Feedback`: Getar peringatan HP saat mendeteksi keputusan belanja berisiko tinggi (🔴 DANGER / Veto Triggered).
  - `Local Notifications`: Pengingat otomatis di status bar HP saat masa pendinginan selesai.
- **Data Engine:** 
  - Primary: IndexedDB (`zero_buy_db`) dengan fallback LocalStorage.
  - Backup & Mobility: Ekspor/Impor data format file JSON lokal (Offline-First).
  - Optional Cloud Sync: Zero-cost webhook ke Google Sheets via Google Apps Script (GAS) / Firebase OTA.

---

## 4. ALUR KERJA PENGGUNA (USER FLOW)

```
[Buka Zero Buy.apk]
        │
        ├─► Profil Belum Ada? ──► [Input Gaji Bulanan, Beban Cicilan/Tabungan, Jam Kerja/Minggu]
        │                                  │
        │                                  ▼
        │                    [Hitung Real Disposable Hourly Rate]
        │
        ▼ (Dashboard Utama)
[Hero Card: Total Uang Selamat (Money Saved Tracker)]
  ├─ Total Akumulasi Rp Uang Selamat dari Barang Dibatalkan
  ├─ Progress Bar Kontribusi Pelunasan Utang (Rp25.6 Juta)
  └─ Progress Bar Kontribusi Roadmap Rp300 Juta
        │
        ▼
[Input Rencana Belanja]
  ├─ Nama Barang (e.g. "Mechanical Keyboard")
  ├─ Harga Barang (e.g. Rp850.000)
  └─ Kategori:
       * Gadget / Elektronik (Default Tunda: 168 Jam / 7 Hari)
       * Fashion / Pakaian (Default Tunda: 72 Jam)
       * Hobi / Gaming (Default Tunda: 72 Jam)
       * FnB Mewah / Nongkrong (Default Tunda: 24 Jam)
       * Perabot Rumah (Default Tunda: 48 Jam)
        │
        ▼
[Kuis Psikologi 4 Pertanyaan (Anti-Lapar Mata)]
  1. "Sudahkah kamu menginginkan barang ini minimal 14 hari yang lalu?" (Ya / Tidak)
  2. "Apakah pembelian ini mengganggu cicilan utang / kas operasionalmu?" (Ya - Terganggu / Tidak - Aman) 
     🚨 ATURAN VETO: Jika dijawab "Ya - Terganggu" ──► HARD STOP AUTO 🔴 DANGER (Skor dikunci Max 40)
  3. "Kamu beli ini murni untuk produktivitas/kebutuhan, atau sekadar gengsi/bosan?" (Fungsi / Gengsi)
  4. "Apakah dana daruratmu saat ini sudah aman minimal 3 bulan pengeluaran?" (Aman / Belum Aman)
        │
        ▼
[Output Kalkulasi & Scoring Keputusan]
  ├─ 🕒 Metrik Jam Kerja: "Barang ini setara dengan X Jam Y Menit kerja keras uang bebasmu!"
  ├─ 📈 Alternatif Investasi: "Jika diinvestasikan ke Reksa Dana/Emas (6% p.a.), uang ini jadi RpZ dlm 1 tahun!"
  ├─ 🚦 Status Keputusan:
  │    * 🟢 SKOR 80 - 100: AMAN / LAYAK DIBELI
  │    * 🟡 SKOR 50 - 79: MERAGUKAN ──► [Aktifkan Cooling-Off Timer 24 - 168 Jam]
  │    * 🔴 SKOR < 50 (atau VETO AKTIF): BAHAYA / BATALKAN! ──► Getar Haptic Peringatan Keras
        │
        ▼
[Tab Daftar Tunda / Cooling-Off Wishlist]
  ├─ Kartu barang dengan hitung mundur real-time (Countdown Timer)
  ├─ Notifikasi HP otomatis saat timer habis
  └─ Evaluasi Akhir:
       * [Tetap Beli] ──► Status berubah jadi BOUGHT
       * [Batalkan & Rayakan] ──► Status SAVED_MONEY ──► Menambah Saldo Hero Card Uang Selamat!
```

---

## 5. FORMULA & LOGIKA BISNIS MATEMATIS

1. **Tarif Upah Per Jam Bersih Bebas (Real Disposable Hourly Rate):**
   $$\text{Real Disposable Income} = \text{monthly\_income} - \text{monthly\_obligations}$$
   $$\text{Real Hourly Rate} = \frac{\max(\text{Real Disposable Income}, 10000)}{\text{work\_hours\_week} \times 4.333}$$
   *(Contoh: Gaji Rp14.000.000, Kewajiban Rp9.000.000 (Cicilan Utang Rp5jt + Tabungan Wajib Rp4jt) $\rightarrow$ Real Disposable Income = Rp5.000.000. Dengan 40 jam/minggu, Real Hourly Rate = Rp5.000.000 / 173.32 = Rp28.848 / jam).*

2. **Ekivalen Jam Kerja Bebas Barang:**
   $$\text{Work Hours} = \frac{\text{Harga Barang}}{\text{Real Hourly Rate}}$$
   *(Contoh: Barang seharga Rp850.000 $\rightarrow$ Setara $\approx 29.5$ Jam Kerja Uang Bebas).*

3. **Bobot Penilaian Skor (Maksimal 100 Poin) & Aturan Veto:**
   - **Aturan Veto Hard-Stop:**
     Jika Q2 dijawab `"Ya - Terganggu"`, maka `is_veto = true`. Total skor **langsung dikunci maksimal di angka 40** (Status: 🔴 **DANGER / BATALKAN**), mengabaikan poin lainnya.
   - **Rasio Beban Jam Kerja Bebas (Maks 35 Poin - Tanpa Celah Desimal):**
     * `work_hours < 4`: 35 Poin
     * `work_hours >= 4 && work_hours <= 10`: 25 Poin
     * `work_hours > 10 && work_hours <= 25`: 15 Poin
     * `work_hours > 25`: 5 Poin
   - **Kuis Psikologi (Maks 40 Poin - @10 Poin per jawaban positif):**
     * Q1 (Niat $\ge 14$ Hari): +10 Poin
     * Q2 (Tidak Ganggu Operasional/Utang): +10 Poin (Jika Terganggu $\rightarrow$ Veto Pemicu DANGER)
     * Q3 (Nilai Fungsi vs Gengsi): +10 Poin
     * Q4 (Dana Darurat $\ge 3$ Bulan Aman): +10 Poin
   - **Kategori Disiplin (Maks 25 Poin):**
     * Kebutuhan Pokok / Perabot: +25 Poin
     * Gadget Produktif: +20 Poin
     * Fashion: +15 Poin
     * Hobi / Gaming: +10 Poin
     * FnB Mewah / Impulsif: +5 Poin

4. **Klasifikasi Keputusan:**
   - Skor $\ge 80$: 🟢 **SAFE (Aman / Layak Beli)**
   - Skor $50 - 79$: 🟡 **COOLING_OFF (Tunda / Meragukan)**
   - Skor $< 50$ atau Veto Aktif: 🔴 **DANGER (Bahaya / Batalkan)**

5. **Simulasi Investasi Alternatif:**
   $$\text{Nilai 1 Tahun} = \text{Harga Barang} \times (1 + 0.06)$$
   $$\text{Nilai 3 Tahun} = \text{Harga Barang} \times (1 + 0.06)^3$$

6. **Hero Card Metric: Money Saved Tracker:**
   $$\text{Total Saved} = \sum_{\text{status} = \text{'SAVED\_MONEY'}} \text{item.price}$$
   $$\text{Progress Utang} = \min\left(100, \frac{\text{Total Saved}}{25.600.000} \times 100\%\right)$$
   $$\text{Progress Milestone 300M} = \min\left(100, \frac{\text{Total Saved}}{300.000.000} \times 100\%\right)$$

---

## 6. SKEMA BASIS DATA (INDEXEDDB: `zero_buy_db`)

### Object Store 1: `user_profile` (Key: `id` = "active_profile")
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | String | "active_profile" |
| `monthly_income` | Number | Gaji bulanan bersih (Rp) |
| `monthly_obligations`| Number | Cicilan utang + tabungan wajib bulanan (Rp) |
| `work_hours_week`| Number | Jam kerja per minggu (default: 40) |
| `hourly_rate` | Number | Nilai Real Disposable Hourly Rate |
| `emergency_fund_months` | Number | Jumlah bulan dana darurat (0 - 12) |
| `updated_at` | String | ISO 8601 Timestamp |

### Object Store 2: `evaluations` (Key: `id` = Auto-increment)
| Field | Tipe | Keterangan |
| :--- | :--- | :--- |
| `id` | Number | ID unik auto-increment |
| `item_name` | String | Nama barang yang ingin dibeli |
| `price` | Number | Nominal harga barang (Rp) |
| `category` | String | Gadget / Fashion / Hobi / FnB / Perabot |
| `work_hours` | Number | Total jam kerja ekivalen (Real Disposable) |
| `quiz_answers` | Object | `{ q1: bool, q2_disruptive: bool, q3_essential: bool, q4_emergency_ok: bool }` |
| `is_veto` | Boolean | True jika Q2 dijawab mengganggu kas/utang |
| `score` | Number | Total skor kelayakan (0 - 100) |
| `decision` | String | "SAFE" / "COOLING_OFF" / "DANGER" |
| `investment_gain_1y` | Number | Nilai masa depan 1 tahun (6% p.a.) |
| `investment_gain_3y` | Number | Nilai masa depan 3 tahun (6% p.a.) |
| `status` | String | "EVALUATED" / "PENDING_TIMER" / "BOUGHT" / "SAVED_MONEY" |
| `cooling_off_hours` | Number | Durasi masa tunda (24 / 48 / 72 / 168 jam) |
| `cooling_off_end` | String | ISO 8601 Timestamp akhir masa tunda |
| `created_at` | String | ISO 8601 Timestamp pembuatan |

---

## 7. ATURAN VALIDASI DATA
1. Nominal gaji bulanan dan harga barang wajib berupa angka bulat positif $> 0$.
2. Beban kewajiban bulanan tidak boleh bernilai negatif ($0 \le \text{obligations} < \text{income}$).
3. Jam kerja per minggu minimal 1 jam, maksimal 112 jam.
4. Nama barang minimal 3 karakter, maksimal 60 karakter.
5. Seluruh 4 pertanyaan kuis wajib dijawab sebelum hasil evaluasi dan rekomendasi diterbitkan.
6. Ekspor data menghasilkan berkas `zero-buy-backup-YYYYMMDD.json` yang valid untuk restore 1-klik.

---

## 8. KRITERIA PENGUJIAN & VALIDASI (ACCEPTANCE CRITERIA)
- [x] Profil gaji & kewajiban dapat dikonfigurasi, menghasilkan Real Disposable Hourly Rate akurat.
- [x] Memasukkan harga barang langsung mengalkulasi ekivalen jam kerja bebas secara real-time.
- [x] Rentang desimal jam kerja tidak memiliki bug celah batas (`< 4`, `>= 4 && <= 10`, `> 10 && <= 25`, `> 25`).
- [x] Jawaban Q2 = "Terganggu" langsung memicu Aturan Veto Hard-Stop: Status 🔴 DANGER, skor dikunci $\le 40$.
- [x] Hero Card "Total Uang Selamat" menampilkan total akumulasi rupiah dari barang `SAVED_MONEY` beserta 2 progress bar (Pelunasan Utang Rp25.6 Juta & Target Rp300 Juta).
- [x] Fitur Cooling-Off mengunci barang ke tab Wishlist Tunda dengan countdown timer real-time.
- [x] Tombol "Batalkan & Rayakan" pada item tunda memindahkan status ke `SAVED_MONEY` dan mengupdate Hero Card secara live.
- [x] Haptic feedback bergetar di ponsel saat keputusan DANGER / Veto terjadi.
- [x] 100% data tersimpan di IndexedDB dan dapat diekspor/diimpor via file JSON lokal.

---

################################################################################
# ZONA BAWAH: LIVING MASTER CONTEXT (STATUS AKTIF & CHANGELOG)
################################################################################

## 1. STATUS ARSITEKTUR AKTIF
- **Status Saat Ini:** DISETUJUI & SIAP EKSEKUSI ("OKE TERAPKAN").
- **Target Folder Proyek:** `01-APK-FACTORY/02-zero-buy/`
- **Asset Directory:** `01-APK-FACTORY/02-zero-buy/src/` (HTML, CSS, JS, Assets)
- **Web Build Output:** `01-APK-FACTORY/02-zero-buy/www/`
- **Native Android Container:** Capacitor 8.x (`com.iaiflash.zerobuy`)
- **Build Scripts:** `build.bat`, `build.js`, `generate-icons.ps1`, `salin-apk.bat`

## 2. SKEMA FORMULA BERJALAN
- Real Hourly Rate: `max(monthly_income - monthly_obligations, 10000) / (work_hours_week * 4.333)`
- Cooling-off Default Durations:
  * FnB Mewah / Nongkrong: 24 Jam
  * Perabot Rumah: 48 Jam
  * Fashion & Hobi / Gaming: 72 Jam
  * Gadget / Elektronik: 168 Jam (7 Hari)
- Aturan Veto Q2: Override Skor ke Max 40 + Status DANGER.
- Investasi Alternatif: 6% p.a. konservatif (1 tahun & 3 tahun).

## 3. OFFICIAL CHANGELOG
- **2026-10-26 (v2.0.0 — Major Upgrade: Cyber-Vault Gamified Edition):**
  1. Rombak total estetika UI/UX: Cyber-Vault Gamified Fintech dengan Glassmorphism, Google Fonts (`'Plus Jakarta Sans'`, `'Space Grotesk'`, `'JetBrains Mono'`), dan Dynamic Ambient Glow reaktif.
  2. Karakter maskot interaktif SVG "ZERO Bot" dengan respons ekspresi real-time terhadap harga dan status kuis psikologi.
  3. Kuis anti-impulsif 4-langkah diubah menjadi Card Wizard bertahap dengan animasi slide-in.
  4. Integrasi langsung Share Target Android (`ACTION_SEND` di `AndroidManifest.xml` & `MainActivity.java`) dan tombol bypass Smart Olshop Link Parser (Shopee, Tokopedia, TikTok Shop, Lazada).
  5. Sistem Kategori Belanja Dinamis (CRUD di IndexedDB `categories`) dengan 4 kategori default.
  6. Sistem Target Finansial & Utang Dinamis (CRUD di IndexedDB `financial_goals`) menghapus angka hardcode pribadi, dilengkapi modal perayaan konfeti dan alokasi instan uang selamat.
  7. Branded splash screen radar perisai Z.E.R.O., proteksi privasi PIN 4-digit dengan keypad numerik futuristik, serta pembuatan logo baru di seluruh mipmap PNG native.
- **2026-10-26 (v1.1.0):** Penyempurnaan 4 logika krusial atas instruksi Komandan:
  1. Penambahan `monthly_obligations` & kalkulasi *Real Disposable Hourly Rate*.
  2. Implementasi Aturan Veto Hard-Stop pada Q2 Kuis Psikologi.
  3. Desain Hero Card "Money Saved Tracker" dengan 2 progress bar sasaran finansial.
  4. Penutupan seluruh celah desimal pada rentang scoring jam kerja.
  5. Pengesahan resmi status: **"OKE TERAPKAN"** untuk perakitan penuh kode & APK.
- **2026-10-25 (v1.0.0):** Inisialisasi blueprint spesifikasi produk `Zero Buy.apk` (Modul 02-zero-buy).
