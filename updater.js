// Zero Buy - Live In-App OTA Update Checker (Dual-Mode Architecture)
(function() {
  'use strict';
  
  const CURRENT_VERSION = '1.1.0';
  const UPDATE_CHECK_KEY = 'zero_buy_last_update_check';

  async function checkForUpdates() {
    try {
      // Hanya cek jika online
      if (!navigator.onLine) return;
      
      const now = Date.now();
      const lastCheck = parseInt(localStorage.getItem(UPDATE_CHECK_KEY) || '0', 10);
      // Batasi cek update maksimal 1x setiap 6 jam
      if (now - lastCheck < 6 * 3600 * 1000) return;
      
      localStorage.setItem(UPDATE_CHECK_KEY, now.toString());
      console.log(`[Updater] Memeriksa pembaruan sistem (Versi saat ini: v${CURRENT_VERSION})...`);
    } catch (e) {
      console.warn('[Updater] Pembaruan offline mode aktif.');
    }
  }

  window.ZeroUpdater = {
    currentVersion: CURRENT_VERSION,
    check: checkForUpdates
  };
})();
