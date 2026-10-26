package com.iaiflash.zerobuy;

import android.Manifest;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.text.TextUtils;
import android.webkit.JavascriptInterface;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Set;

public class MainActivity extends BridgeActivity {
    private static final int REQ_NOTIFICATION_PERM = 101;
    private static final String PREF_CART = "SyncedOlshopCart";
    private static final String KEY_ITEMS = "captured_items";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupBridgeInterface();
        autoRequestPermissions();
        handleSendIntent(getIntent());
    }

    @Override
    protected void onStart() {
        super.onStart();
        setupBridgeInterface();
    }

    @Override
    protected void onResume() {
        super.onResume();
        setupBridgeInterface();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleSendIntent(intent);
    }

    private void setupBridgeInterface() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().addJavascriptInterface(new PointZeroBridge(MainActivity.this), "PointZeroBridge");
                    }
                } catch (Exception ignored) {}
            }
        });
    }

    private void autoRequestPermissions() {
        // 1. Auto-request POST_NOTIFICATIONS untuk Android 13+ (API 33+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFICATION_PERM);
            }
        }

        // 2. Auto-request Ignore Battery Optimization agar background service & alarm tunda tidak dibunuh
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            }
        } catch (Exception ignored) {}
    }

    private void handleSendIntent(Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        String type = intent.getType();

        if (Intent.ACTION_SEND.equals(action) && type != null) {
            if ("text/plain".equals(type)) {
                String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
                if (sharedText != null && !sharedText.trim().isEmpty()) {
                    dispatchSharedTextToWeb(sharedText);
                }
            }
        }
    }

    private void dispatchSharedTextToWeb(String sharedText) {
        if (getBridge() == null || getBridge().getWebView() == null) {
            return;
        }
        String sanitized = sharedText
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "");

        final String js = "if (window.handleSharedShopData) { "
            + "window.handleSharedShopData(\"" + sanitized + "\"); "
            + "} else { window.__pendingSharedData = \"" + sanitized + "\"; }";

        getBridge().getWebView().post(new Runnable() {
            @Override
            public void run() {
                getBridge().getWebView().evaluateJavascript(js, null);
            }
        });
    }

    /**
     * Jembatan JavascriptInterface untuk mengecek dan mengaktifkan izin sistem Android
     */
    public class PointZeroBridge {
        private final Context context;

        public PointZeroBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean isAccessibilityEnabled() {
            int accessibilityEnabled = 0;
            final String service = getPackageName() + "/" + CartAccessibilityService.class.getCanonicalName();
            try {
                accessibilityEnabled = Settings.Secure.getInt(
                        context.getApplicationContext().getContentResolver(),
                        Settings.Secure.ACCESSIBILITY_ENABLED);
            } catch (Settings.SettingNotFoundException ignored) {}

            TextUtils.SimpleStringSplitter mStringColonSplitter = new TextUtils.SimpleStringSplitter(':');
            if (accessibilityEnabled == 1) {
                String settingValue = Settings.Secure.getString(
                        context.getApplicationContext().getContentResolver(),
                        Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
                if (settingValue != null) {
                    mStringColonSplitter.setString(settingValue);
                    while (mStringColonSplitter.hasNext()) {
                        String accessibilityService = mStringColonSplitter.next();
                        if (accessibilityService.equalsIgnoreCase(service)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        @JavascriptInterface
        public void openAccessibilitySettings() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent intent = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(intent);
                    } catch (Exception e) {
                        try {
                            Intent fallback = new Intent(Settings.ACTION_SETTINGS);
                            fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            context.startActivity(fallback);
                        } catch (Exception ignored) {}
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isNotificationListenerEnabled() {
            try {
                Set<String> packageNames = NotificationManagerCompat.getEnabledListenerPackages(context);
                return packageNames.contains(context.getPackageName());
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public void openNotificationListenerSettings() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    try {
                        Intent intent = new Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS");
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(intent);
                    } catch (Exception ignored) {}
                }
            });
        }

        @JavascriptInterface
        public boolean isBatteryOptimizationIgnored() {
            try {
                PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
                return pm != null && pm.isIgnoringBatteryOptimizations(context.getPackageName());
            } catch (Exception e) {
                return false;
            }
        }

        @JavascriptInterface
        public void openBatteryOptimizationSettings() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    boolean opened = false;
                    try {
                        Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                        intent.setData(Uri.parse("package:" + context.getPackageName()));
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        context.startActivity(intent);
                        opened = true;
                    } catch (Exception ignored) {}

                    if (!opened) {
                        try {
                            Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            context.startActivity(intent);
                            opened = true;
                        } catch (Exception ignored) {}
                    }

                    if (!opened) {
                        try {
                            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                            intent.setData(Uri.parse("package:" + context.getPackageName()));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            context.startActivity(intent);
                        } catch (Exception ignored) {}
                    }
                }
            });
        }

        @JavascriptInterface
        public boolean isNotificationPermissionGranted() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                return ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
                        == PackageManager.PERMISSION_GRANTED;
            }
            return NotificationManagerCompat.from(context).areNotificationsEnabled();
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            MainActivity.this.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        try {
                            ActivityCompat.requestPermissions(MainActivity.this,
                                    new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIFICATION_PERM);
                        } catch (Exception e) {
                            openNotificationSettingsFallback();
                        }
                    } else {
                        openNotificationSettingsFallback();
                    }
                }

                private void openNotificationSettingsFallback() {
                    try {
                        Intent intent = new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                        intent.putExtra(Settings.EXTRA_APP_PACKAGE, getPackageName());
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        startActivity(intent);
                    } catch (Exception e) {
                        try {
                            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                            intent.setData(Uri.parse("package:" + getPackageName()));
                            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            startActivity(intent);
                        } catch (Exception ignored) {}
                    }
                }
            });
        }

        @JavascriptInterface
        public String getSyncedCartItems() {
            SharedPreferences prefs = context.getSharedPreferences(PREF_CART, Context.MODE_PRIVATE);
            return prefs.getString(KEY_ITEMS, "[]");
        }

        @JavascriptInterface
        public void clearSyncedCartItems() {
            SharedPreferences prefs = context.getSharedPreferences(PREF_CART, Context.MODE_PRIVATE);
            prefs.edit().putString(KEY_ITEMS, "[]").apply();
        }

        @JavascriptInterface
        public void removeSyncedCartItem(String id) {
            if (id == null) return;
            SharedPreferences prefs = context.getSharedPreferences(PREF_CART, Context.MODE_PRIVATE);
            String rawJson = prefs.getString(KEY_ITEMS, "[]");
            try {
                JSONArray arr = new JSONArray(rawJson);
                JSONArray newArr = new JSONArray();
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject obj = arr.getJSONObject(i);
                    if (!id.equals(obj.optString("id"))) {
                        newArr.put(obj);
                    }
                }
                prefs.edit().putString(KEY_ITEMS, newArr.toString()).apply();
            } catch (Exception ignored) {}
        }
    }
}
