/**
 * Zero Buy v4.0 — Point.Zero Commercial Edition
 * Module: piko.js (2D Chibi Mascot "Piko si Kucing Penjaga Dompet" & Duotone SVG Library)
 * 100% Pure Inline SVG — Absolutely Zero Emojis
 */

(function(window) {
  'use strict';

  // --- 1. KOLEKSI IKON DUOTONE VEKTOR PROFESIONAL ---
  const ICONS = {
    shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.15"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    zap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    cart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><circle cx="9" cy="21" r="1" fill="currentColor"/><circle cx="20" cy="21" r="1" fill="currentColor"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    wallet: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M16 3H4a2 2 0 0 0-2 2v2h18V5a2 2 0 0 0-2-2z" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="14" r="1.5" fill="currentColor"/></svg>`,
    timer: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
    history: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M3.05 11a9 9 0 1 1 .5 4m-.5-4v-5m0 5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    user: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7" r="4" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/></svg>`,
    sun: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><circle cx="12" cy="12" r="5" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2"/><line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/><line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/><line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/></svg>`,
    moon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    check: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    alert: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="currentColor" fill-opacity="0.18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/></svg>`,
    arrowRight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="duo-icon"><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><polyline points="12 5 19 12 12 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    arrowLeft: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="duo-icon"><line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><polyline points="12 19 5 12 12 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    trash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="duo-icon"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/></svg>`,
    plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="duo-icon"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
    settings: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" stroke-width="1.8"/></svg>`,
    battery: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><rect x="1" y="6" width="18" height="12" rx="2" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><line x1="23" y1="11" x2="23" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="10" x2="13" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="14" x2="9" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    bell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" stroke-width="2"/></svg>`,
    accessibility: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M19 13v-2a7 7 0 0 0-14 0v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M12 11v10" stroke="currentColor" stroke-width="2"/><path d="M8 21l4-4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    shopee: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="store-icon"><rect width="24" height="24" rx="6" fill="#EE4D2D"/><path d="M8 8a4 4 0 0 1 8 0v2h-8V8z" stroke="#FFFFFF" stroke-width="1.8" fill="none"/><rect x="5" y="10" width="14" height="10" rx="2" fill="#FFFFFF"/><path d="M10 14c0 1.1.9 2 2 2s2-.9 2-2" stroke="#EE4D2D" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    tokopedia: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="store-icon"><rect width="24" height="24" rx="6" fill="#03AC0E"/><circle cx="9" cy="11" r="3" fill="#FFFFFF"/><circle cx="15" cy="11" r="3" fill="#FFFFFF"/><circle cx="9" cy="11" r="1.5" fill="#03AC0E"/><circle cx="15" cy="11" r="1.5" fill="#03AC0E"/><path d="M8 16c1.5 1.5 6.5 1.5 8 0" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    tiktok: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="store-icon"><rect width="24" height="24" rx="6" fill="#000000"/><path d="M14 6v7.5a2.5 2.5 0 1 1-2.5-2.5h1V8h-1a5.5 5.5 0 1 0 5.5 5.5V9.5a4 4 0 0 0 2.5.5V7a3.5 3.5 0 0 1-2.5-1h-3z" fill="#00F2FE"/><path d="M15 5v7.5a2.5 2.5 0 1 1-2.5-2.5h1V7h-1a5.5 5.5 0 1 0 5.5 5.5V8.5a4 4 0 0 0 2.5.5V6a3.5 3.5 0 0 1-2.5-1h-3z" fill="#FE2C55" style="mix-blend-mode: screen;"/></svg>`,
    lazada: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="store-icon"><rect width="24" height="24" rx="6" fill="#0F146D"/><path d="M12 7l4 5-4 5-4-5 4-5z" fill="#F36F21"/><path d="M8 12l4 4 4-4" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/></svg>`,
    vault: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="duo-icon"><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><line x1="12" y1="5" x2="12" y2="7" stroke="currentColor" stroke-width="2"/><line x1="12" y1="17" x2="12" y2="19" stroke="currentColor" stroke-width="2"/><line x1="5" y1="12" x2="7" y2="12" stroke="currentColor" stroke-width="2"/><line x1="17" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/></svg>`,
    calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><rect x="3" y="4" width="18" height="18" rx="3" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/><rect x="7" y="14" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/></svg>`,
    tool: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    heart: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    sparkle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="duo-icon"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`
  };

  // --- 2. ILUSTRASI MASKOT 2D: "PIKO SI KUCING PENJAGA DOMPET" ---
  // Menghasilkan SVG 2D Chibi Piko dengan 5 Pose Ekspresi Dinamis
  function getPikoSvg(pose = 'happy', size = 120) {
    let specificPoseElements = '';

    switch (pose) {
      case 'detective':
        // Pose Detective: Memakai kacamata bulat dan memegang kaca pembesar
        specificPoseElements = `
          <!-- Kacamata Detektif -->
          <circle cx="40" cy="56" r="11" fill="none" stroke="#334155" stroke-width="2.5"/>
          <circle cx="68" cy="56" r="11" fill="none" stroke="#334155" stroke-width="2.5"/>
          <line x1="51" y1="56" x2="57" y2="56" stroke="#334155" stroke-width="2.5"/>
          <!-- Kaca Pembesar di Tangan -->
          <g transform="translate(68, 62) rotate(25)">
            <circle cx="14" cy="14" r="10" fill="rgba(56, 189, 248, 0.25)" stroke="#0284C7" stroke-width="2.5"/>
            <line x1="21" y1="21" x2="30" y2="30" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round"/>
            <path d="M8 12 a6 6 0 0 1 6-6" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" fill="none"/>
          </g>
          <!-- Mata Fokus -->
          <circle cx="40" cy="56" r="5" fill="#1E293B"/>
          <circle cx="42" cy="54" r="2" fill="#FFFFFF"/>
          <circle cx="68" cy="56" r="5" fill="#1E293B"/>
          <circle cx="70" cy="54" r="2" fill="#FFFFFF"/>
          <!-- Mulut Penasaran -->
          <circle cx="54" cy="67" r="2" fill="#EA580C"/>
        `;
        break;

      case 'shock':
        // Pose Shock: Mata melotot, mulut terbuka kaget, tetesan keringat dingin
        specificPoseElements = `
          <!-- Mata Melotot Kaget -->
          <ellipse cx="38" cy="55" rx="8" ry="10" fill="#FFFFFF" stroke="#EA580C" stroke-width="2"/>
          <circle cx="38" cy="55" r="3" fill="#1E293B"/>
          <ellipse cx="70" cy="55" rx="8" ry="10" fill="#FFFFFF" stroke="#EA580C" stroke-width="2"/>
          <circle cx="70" cy="55" r="3" fill="#1E293B"/>
          <!-- Mulut Kaget Terbuka -->
          <ellipse cx="54" cy="69" rx="5" ry="7" fill="#7C2D12"/>
          <ellipse cx="54" cy="73" rx="3" ry="3" fill="#F43F5E"/>
          <!-- Tetesan Keringat Dingin Beranimasi -->
          <g class="piko-sweat">
            <path d="M 84,40 C 84,36 88,32 88,32 C 88,32 92,36 92,40 C 92,43 90,45 88,45 C 86,45 84,43 84,40 Z" fill="#38BDF8"/>
          </g>
          <!-- Kedua Tangan di Pipi -->
          <circle cx="28" cy="66" r="6" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
          <circle cx="80" cy="66" r="6" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
        `;
        break;

      case 'strict':
        // Pose Strict Judge: Ikat kepala merah, tanda silang STOP, alis tegas
        specificPoseElements = `
          <!-- Ikat Kepala Merah (Hachimaki) -->
          <path d="M 18,44 Q 54,47 90,44 L 89,37 Q 54,40 19,37 Z" fill="#EF4444"/>
          <!-- Ujung Pita Ikat Kepala -->
          <path d="M 19,41 L 10,48 L 12,41 L 8,36 Z" fill="#DC2626"/>
          <!-- Alis Tegas Marah -->
          <line x1="32" y1="48" x2="44" y2="52" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/>
          <line x1="76" y1="48" x2="64" y2="52" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/>
          <!-- Mata Tegas Menatap Tajam -->
          <ellipse cx="38" cy="56" rx="5" ry="6" fill="#1E293B"/>
          <circle cx="39" cy="54" r="1.5" fill="#FFFFFF"/>
          <ellipse cx="70" cy="56" rx="5" ry="6" fill="#1E293B"/>
          <circle cx="71" cy="54" r="1.5" fill="#FFFFFF"/>
          <!-- Mulut Datar Tegas -->
          <line x1="48" y1="68" x2="60" y2="68" stroke="#7C2D12" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Tanda Silang Merah STOP di Depan Dada -->
          <g transform="translate(42, 74)">
            <circle cx="12" cy="12" r="12" fill="#FEE2E2" stroke="#EF4444" stroke-width="2"/>
            <line x1="7" y1="7" x2="17" y2="17" stroke="#DC2626" stroke-width="2.8" stroke-linecap="round"/>
            <line x1="17" y1="7" x2="7" y2="17" stroke="#DC2626" stroke-width="2.8" stroke-linecap="round"/>
          </g>
        `;
        break;

      case 'party':
        // Pose Party: Winking ceria, melempar koin emas & konfeti
        specificPoseElements = `
          <!-- Mata Kiri Kedip (Wink) -->
          <path d="M 32,56 Q 38,50 44,56" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
          <!-- Mata Kanan Berbinar Bintang -->
          <circle cx="70" cy="55" r="7" fill="#1E293B"/>
          <polygon points="70,51 72,55 76,55 73,57 74,61 70,58 66,61 67,57 64,55 68,55" fill="#FDE047"/>
          <circle cx="73" cy="53" r="2" fill="#FFFFFF"/>
          <!-- Mulut Tertawa Ceria -->
          <path d="M 48,65 Q 54,75 60,65 Z" fill="#F43F5E" stroke="#EA580C" stroke-width="1.8"/>
          <!-- Tangan Terangkat Melempar Koin -->
          <circle cx="26" cy="62" r="6" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
          <circle cx="82" cy="62" r="6" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
          <!-- Koin Emas Melayang -->
          <circle cx="20" cy="38" r="7" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
          <text x="17.5" y="42" font-family="'JetBrains Mono'" font-size="9" font-weight="700" fill="#FFF">$</text>
          <circle cx="88" cy="38" r="7" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"/>
          <text x="85.5" y="42" font-family="'JetBrains Mono'" font-size="9" font-weight="700" fill="#FFF">$</text>
          <!-- Konfeti Bintang & Lingkaran -->
          <circle cx="14" cy="24" r="2.5" fill="#10B981"/>
          <circle cx="94" cy="24" r="2.5" fill="#6366F1"/>
          <polygon points="54,12 56,16 60,16 57,18 58,22 54,20 50,22 51,18 48,16 52,16" fill="#EC4899"/>
        `;
        break;

      case 'happy':
      default:
        // Pose Happy (Default): Memegang perisai koin emas, mata anime berbinar
        specificPoseElements = `
          <!-- Mata Anime Berbinar -->
          <ellipse cx="38" cy="55" rx="6" ry="7" fill="#1E293B"/>
          <circle cx="40" cy="53" r="2.5" fill="#FFFFFF"/>
          <circle cx="36" cy="57" r="1.2" fill="#FFFFFF"/>
          <ellipse cx="70" cy="55" rx="6" ry="7" fill="#1E293B"/>
          <circle cx="72" cy="53" r="2.5" fill="#FFFFFF"/>
          <circle cx="68" cy="57" r="1.2" fill="#FFFFFF"/>
          <!-- Senyum Kucing Ceria (:3) -->
          <path d="M 47,65 Q 51,69 54,66 Q 57,69 61,65" stroke="#7C2D12" stroke-width="2" stroke-linecap="round" fill="none"/>
          <!-- Perisai Koin Emas di Dada -->
          <g transform="translate(42, 68)">
            <path d="M 12,2 L 21,5 C 21,14 17,20 12,24 C 7,20 3,14 3,5 Z" fill="#F59E0B" stroke="#D97706" stroke-width="1.8"/>
            <circle cx="12" cy="12" r="5" fill="#FEF08A"/>
            <path d="M 10,12 L 11.5,13.5 L 14.5,10.5" stroke="#B45309" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </g>
        `;
        break;
    }

    return `
      <svg class="piko-svg piko-pose-${pose}" viewBox="0 0 108 108" width="${size}" height="${size}">
        <!-- Ekor Beranimasi -->
        <path class="piko-tail" d="M 76,82 C 92,86 102,74 96,62 C 92,54 84,60 84,66" 
              fill="none" stroke="#F97316" stroke-width="7" stroke-linecap="round"/>
        <path class="piko-tail" d="M 76,82 C 92,86 102,74 96,62 C 92,54 84,60 84,66" 
              fill="none" stroke="#EA580C" stroke-width="3" stroke-linecap="round"/>

        <!-- Tubuh Bulat Piko -->
        <ellipse cx="54" cy="78" rx="28" ry="22" fill="#F97316" stroke="#EA580C" stroke-width="3"/>
        <!-- Perut Putih Krem -->
        <ellipse cx="54" cy="79" rx="18" ry="14" fill="#FEF3C7"/>

        <!-- Kaki Depan Kiri & Kanan -->
        <ellipse cx="38" cy="94" rx="7" ry="5" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
        <ellipse cx="70" cy="94" rx="7" ry="5" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>

        <!-- Telinga Kiri Beranimasi -->
        <polygon class="piko-ear-left" points="26,44 18,18 42,32" fill="#F97316" stroke="#EA580C" stroke-width="3" stroke-linejoin="round"/>
        <polygon class="piko-ear-left" points="26,41 22,23 38,33" fill="#F472B6"/>

        <!-- Telinga Kanan Beranimasi -->
        <polygon class="piko-ear-right" points="82,44 90,18 66,32" fill="#F97316" stroke="#EA580C" stroke-width="3" stroke-linejoin="round"/>
        <polygon class="piko-ear-right" points="82,41 86,23 70,33" fill="#F472B6"/>

        <!-- Kepala Bulat Chibi -->
        <circle cx="54" cy="56" r="32" fill="#F97316" stroke="#EA580C" stroke-width="3.2"/>

        <!-- Corak Belang Kucing di Dahi -->
        <polygon points="54,28 50,38 58,38" fill="#C2410C"/>
        <polygon points="44,32 42,40 48,39" fill="#C2410C"/>
        <polygon points="64,32 66,40 60,39" fill="#C2410C"/>

        <!-- Area Wajah Putih Krem Bawah -->
        <path d="M 32,56 C 32,74 76,74 76,56 C 76,50 32,50 32,56 Z" fill="#FFFBEB"/>

        <!-- Pipi Merona Pink (Blush) -->
        <ellipse cx="28" cy="62" rx="4" ry="2.5" fill="#F472B6" fill-opacity="0.6"/>
        <ellipse cx="80" cy="62" rx="4" ry="2.5" fill="#F472B6" fill-opacity="0.6"/>

        <!-- Hidung Segitiga Mungil -->
        <polygon points="54,61 51,58 57,58" fill="#F43F5E"/>

        <!-- Kumis Kiri & Kanan -->
        <line x1="28" y1="59" x2="16" y2="57" stroke="#7C2D12" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="27" y1="63" x2="15" y2="65" stroke="#7C2D12" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="80" y1="59" x2="92" y2="57" stroke="#7C2D12" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="81" y1="63" x2="93" y2="65" stroke="#7C2D12" stroke-width="1.6" stroke-linecap="round"/>

        <!-- Elemen Spesifik Tiap Pose -->
        ${specificPoseElements}
      </svg>
    `;
  }

  window.Piko = {
    render: getPikoSvg,
    icon: (name) => ICONS[name] || ICONS.shield,
    icons: ICONS
  };

})(window);
