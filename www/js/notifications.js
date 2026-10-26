/**
 * Zero Buy - Local Notification Bridge
 * Mendukung Capacitor LocalNotifications & Web Notification Fallback
 */

(function(window) {
  'use strict';

  const LocalNotifications = window.Capacitor?.Plugins?.LocalNotifications;

  async function requestPermission() {
    try {
      if (LocalNotifications) {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } else if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    } catch (e) {
      console.warn('[Notification] Permintaan izin notifikasi gagal:', e);
    }
    return false;
  }

  async function scheduleCoolingOffReminder(item) {
    try {
      const scheduledDate = new Date(item.cooling_off_end || item.coolingEnd);
      if (isNaN(scheduledDate.getTime())) return;

      const title = `❄️ Waktu Tunda Habis: ${item.item_name || item.itemName}`;
      const body = `Masa pendinginan untuk "${item.item_name || item.itemName}" telah selesai. Apakah kamu masih benar-benar butuh membelinya?`;

      if (LocalNotifications) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Number(item.id) || Math.floor(Math.random() * 100000),
              schedule: { at: scheduledDate },
              sound: 'beep.wav',
              smallIcon: 'ic_stat_icon_config_sample',
              extra: { itemId: item.id }
            }
          ]
        });
        console.log(`[Notification] Notifikasi lokal dijadwalkan pada ${scheduledDate.toLocaleString()}`);
      } else if ('Notification' in window && Notification.permission === 'granted') {
        const delay = scheduledDate.getTime() - Date.now();
        if (delay > 0 && delay < 2147483647) {
          setTimeout(() => {
            new Notification(title, {
              body,
              icon: 'assets/icon.svg'
            });
          }, delay);
        }
      }
    } catch (e) {
      console.warn('[Notification] Gagal menjadwalkan notifikasi:', e);
    }
  }

  async function showInstantNotification(title, body) {
    try {
      if (LocalNotifications) {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 100000),
              schedule: { at: new Date(Date.now() + 500) }
            }
          ]
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: 'assets/icon.svg'
        });
      }
    } catch (e) {
      // Ignored
    }
  }

  window.ZeroNotify = {
    requestPermission,
    scheduleCoolingOffReminder,
    showInstantNotification
  };
})(window);
