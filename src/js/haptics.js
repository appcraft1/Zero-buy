/**
 * Zero Buy - Haptic Feedback Bridge
 * Mendukung Capacitor Haptics Native Plugin & Web Vibration API Fallback
 */

(function(window) {
  'use strict';

  const CapacitorHaptics = window.Capacitor?.Plugins?.Haptics;

  async function impactLight() {
    try {
      if (CapacitorHaptics) {
        await CapacitorHaptics.impact({ style: 'LIGHT' });
      } else if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (e) {
      // Ignored
    }
  }

  async function impactMedium() {
    try {
      if (CapacitorHaptics) {
        await CapacitorHaptics.impact({ style: 'MEDIUM' });
      } else if (navigator.vibrate) {
        navigator.vibrate(60);
      }
    } catch (e) {
      // Ignored
    }
  }

  async function warning() {
    try {
      if (CapacitorHaptics) {
        await CapacitorHaptics.notification({ type: 'WARNING' });
      } else if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {
      // Ignored
    }
  }

  // Getar keras saat VETO atau DANGER
  async function dangerVeto() {
    try {
      if (CapacitorHaptics) {
        await CapacitorHaptics.notification({ type: 'ERROR' });
        setTimeout(async () => {
          await CapacitorHaptics.vibrate({ duration: 300 });
        }, 150);
      } else if (navigator.vibrate) {
        navigator.vibrate([150, 80, 200, 80, 300]);
      }
    } catch (e) {
      // Ignored
    }
  }

  // Pola getar ceria saat membatalkan belanja (Uang Selamat!)
  async function celebrate() {
    try {
      if (CapacitorHaptics) {
        await CapacitorHaptics.notification({ type: 'SUCCESS' });
      } else if (navigator.vibrate) {
        navigator.vibrate([50, 50, 100, 50, 150]);
      }
    } catch (e) {
      // Ignored
    }
  }

  window.ZeroHaptics = {
    impactLight,
    impactMedium,
    warning,
    dangerVeto,
    celebrate
  };
})(window);
