# DOKUMEN REVISI: ZERO BUY (UPGRADE MAJOR v4.0 — POINT.ZERO COMMERCIAL EDITION)
================================================================================
STATUS REVISI: SELESAI DITERAPKAN ("OKE TERAPKAN - 2026-10-26")
MODUL ID: 02-zero-buy
TARGET: Zero Buy.apk (v4.0 — Point.Zero Commercial Edition with Piko & Cart Reader)
================================================================================

## 1. LATAR BELAKANG & TUJUAN UPGRADE KOMERSIAL
Aplikasi `Zero Buy.apk` dipersiapkan sebagai produk komersial unggulan dalam ekosistem katalog web SaaS **"Point.Zero"** (di mana pengguna melihat katalog web Point.Zero, membeli lisensi akses, login akun, lalu memakai APK ini). Versi 4.0 menghadirkan 5 aturan mutlak:
1. **Larangan Keras Emoji:** 100% menggunakan pure inline Duotone SVG dengan gradasi halus, stroke presisi, dan nol emoji.
2. **Karakter Maskot 2D Piko:** Mengganti robot kaku dengan maskot kucing oranye lucu ("Piko si Kucing Penjaga Dompet") yang memiliki 5 ekspresi dinamis (*happy*, *detective*, *shock*, *strict*, *party*) dan animasi telinga/ekor bergerak.
3. **Layar Kuis 100% Full-Screen:** Menghilangkan form kuis di bawah halaman utama, beralih menjadi 1 layar penuh mandiri ala Duolingo dengan progress bar bersegmen dan layar Verdict 1 layar penuh.
4. **Pembaca Keranjang Olshop Otomatis:** Integrasi native `CartAccessibilityService.java` (`AccessibilityService`) yang memantau Shopee, Tokopedia, TikTok Shop, dan Lazada, menyimpan barang ke `SharedPreferences`, dan menampilkan tab baru **"Keranjang Olshop"**.
5. **Multi-User Auth & Wawancara Onboarding Wajib:** Mendukung login akun Point.Zero & koneksi Supabase, serta wizard onboarding 4 tahap (Frekuensi Pendapatan, Jam Kerja, Beban Kewajiban, dan Target Finansial Pertama).
6. **Pusat Aktivasi Izin Sistem Otomatis:** Method `@JavascriptInterface` pada `MainActivity.java` (`PointZeroBridge`) untuk mengecek dan membuka pengaturan Notifikasi, Abaikan Optimasi Baterai, dan Aksesibilitas dengan 1 klik.

---

## 2. CHECKLIST EKSEKUSI
- [x] Pembersihan total seluruh emoji dari `.html`, `.css`, dan `.js` (100% Duotone SVG).
- [x] Pembuatan generator ilustrasi maskot 2D Chibi Piko 5 pose di [src/js/piko.js](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/src/js/piko.js).
- [x] Pembangunan sistem tema ganda: Warm Light Mode (Default) & Dark Mode bergaya Duolingo / Bank Jago dengan kartu membulat 24px dan tombol 3D Tactile di [src/css/style.css](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/src/css/style.css).
- [x] Implementasi arsitektur multi-user, Supabase cloud sync, dan hybrid IndexedDB di [src/js/db.js](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/src/js/db.js).
- [x] Engine konversi pendapatan multi-frekuensi (per jam, hari, minggu, bulan), perhitungan upah jam bebas, Veto hard-stop, dan parser olshop di [src/js/engine.js](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/src/js/engine.js).
- [x] Implementasi Layar Kuis 100% Full-Screen, Layar Verdict Full-Screen, Onboarding Wizard, dan Tab Keranjang di [src/index.html](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/src/index.html) & [src/js/app.js](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/src/js/app.js).
- [x] Layanan native Android pembaca keranjang olshop di [CartAccessibilityService.java](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/android/app/src/main/java/com/iaiflash/zerobuy/CartAccessibilityService.java) & [accessibility_service_config.xml](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/android/app/src/main/res/xml/accessibility_service_config.xml).
- [x] Implementasi `PointZeroBridge` JavascriptInterface dan auto-prompt permissions di [MainActivity.java](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/android/app/src/main/java/com/iaiflash/zerobuy/MainActivity.java).
- [x] Pendaftaran izin dan service di [AndroidManifest.xml](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/android/app/src/main/AndroidManifest.xml).
- [x] Pembaruan versi ke v4.0.0 (versionCode 4) di [package.json](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/package.json) dan [android/app/build.gradle](file:///c:/Users/Asep/Documents/ZERO/01-APK-FACTORY/02-zero-buy/android/app/build.gradle).
