package com.iaiflash.zerobuy;

import android.accessibilityservice.AccessibilityService;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CartAccessibilityService extends AccessibilityService {
    private static final String TAG = "ZeroBuyCartReader";
    private static final String PREF_NAME = "SyncedOlshopCart";
    private static final String KEY_ITEMS = "captured_items";
    private static final Pattern PRICE_PATTERN = Pattern.compile("(?:Rp|IDR)\\.?\\s*([0-9]{1,3}(?:[\\.,][0-9]{3})*(?:[\\.,][0-9]{2})?)", Pattern.CASE_INSENSITIVE);
    private long lastProcessTime = 0;

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;
        long now = System.currentTimeMillis();
        // Batasi frekuensi pemindaian setiap 1.5 detik agar tidak membebani performa
        if (now - lastProcessTime < 1500) return;
        lastProcessTime = now;

        CharSequence pkg = event.getPackageName();
        if (pkg == null) return;
        String pkgName = pkg.toString();

        String platform = "Olshop";
        if (pkgName.contains("shopee")) platform = "Shopee";
        else if (pkgName.contains("tokopedia")) platform = "Tokopedia";
        else if (pkgName.contains("trill") || pkgName.contains("tiktok")) platform = "TikTok Shop";
        else if (pkgName.contains("lazada")) platform = "Lazada";
        else if (pkgName.contains("bukalapak")) platform = "Bukalapak";

        AccessibilityNodeInfo rootNode = getRootInActiveWindow();
        if (rootNode == null) return;

        try {
            List<String> textNodes = new ArrayList<>();
            collectTextNodes(rootNode, textNodes);
            parseAndSaveItems(textNodes, platform);
        } catch (Exception e) {
            Log.e(TAG, "Error saat membaca keranjang olshop: " + e.getMessage());
        } finally {
            rootNode.recycle();
        }
    }

    private void collectTextNodes(AccessibilityNodeInfo node, List<String> texts) {
        if (node == null || texts.size() > 80) return;
        CharSequence cs = node.getText();
        if (cs != null) {
            String t = cs.toString().trim();
            if (!t.isEmpty() && t.length() < 200) {
                texts.add(t);
            }
        }
        int count = node.getChildCount();
        for (int i = 0; i < count; i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                collectTextNodes(child, texts);
                child.recycle();
            }
        }
    }

    private void parseAndSaveItems(List<String> texts, String platform) {
        if (texts.isEmpty()) return;

        SharedPreferences prefs = getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String rawJson = prefs.getString(KEY_ITEMS, "[]");
        JSONArray cartArray;
        try {
            cartArray = new JSONArray(rawJson);
        } catch (Exception e) {
            cartArray = new JSONArray();
        }

        boolean updated = false;

        for (int i = 0; i < texts.size(); i++) {
            String text = texts.get(i);
            Matcher m = PRICE_PATTERN.matcher(text);
            if (m.find()) {
                String rawNum = m.group(1).replace(".", "").replace(",", "");
                long price = 0;
                try {
                    price = Long.parseLong(rawNum);
                } catch (Exception ignored) {}

                if (price >= 10000 && price <= 500000000) { // Rentang harga wajar produk
                    // Cari nama produk terdekat (sebelum atau sesudah harga)
                    String candidateTitle = "";
                    for (int offset = -3; offset <= 3; offset++) {
                        if (offset == 0) continue;
                        int idx = i + offset;
                        if (idx >= 0 && idx < texts.size()) {
                            String c = texts.get(idx);
                            if (isValidProductTitle(c)) {
                                candidateTitle = c;
                                break;
                            }
                        }
                    }

                    if (!candidateTitle.isEmpty()) {
                        // Cek apakah produk ini sudah ada dalam daftar
                        boolean exists = false;
                        for (int j = 0; j < cartArray.length(); j++) {
                            try {
                                JSONObject obj = cartArray.getJSONObject(j);
                                if (obj.getString("title").equalsIgnoreCase(candidateTitle)) {
                                    exists = true;
                                    break;
                                }
                            } catch (Exception ignored) {}
                        }

                        if (!exists) {
                            try {
                                JSONObject item = new JSONObject();
                                item.put("id", "cart_" + System.currentTimeMillis() + "_" + (int)(Math.random()*1000));
                                item.put("title", candidateTitle);
                                item.put("price", price);
                                item.put("platform", platform);
                                item.put("timestamp", System.currentTimeMillis());

                                // Sisipkan di depan
                                JSONArray newArray = new JSONArray();
                                newArray.put(item);
                                for (int k = 0; k < cartArray.length() && k < 19; k++) {
                                    newArray.put(cartArray.get(k));
                                }
                                cartArray = newArray;
                                updated = true;
                            } catch (Exception ignored) {}
                        }
                    }
                }
            }
        }

        if (updated) {
            prefs.edit().putString(KEY_ITEMS, cartArray.toString()).apply();
            Log.d(TAG, "Sinkronisasi item keranjang baru berhasil: total " + cartArray.length() + " item.");
        }
    }

    private boolean isValidProductTitle(String s) {
        if (s == null) return false;
        String lower = s.toLowerCase();
        if (s.length() < 7 || s.length() > 120) return false;
        if (lower.contains("gratis ongkir") || lower.contains("voucher") || lower.contains("cashback")
                || lower.contains("diskon") || lower.contains("pilih variasi") || lower.contains("checkout")
                || lower.contains("keranjang") || lower.contains("total pembayaran") || lower.contains("belanja")
                || lower.contains("toko") || lower.contains("terjual") || lower.contains("ongkos kirim")) {
            return false;
        }
        // Pastikan bukan sekadar angka atau harga
        if (PRICE_PATTERN.matcher(s).find()) return false;
        return true;
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Zero Buy Cart Reader interrupted");
    }
}
