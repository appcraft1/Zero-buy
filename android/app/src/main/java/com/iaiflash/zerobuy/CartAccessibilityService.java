package com.iaiflash.zerobuy;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class CartAccessibilityService extends AccessibilityService {
    private static final String TAG = "ZeroBuyCartReader";
    private static final String PREF_NAME = "SyncedOlshopCart";
    private static final String KEY_ITEMS = "captured_items";

    // Regex 1: Matches strings with Rp or IDR and digits
    private static final Pattern PRICE_WITH_SYMBOL_PATTERN = Pattern.compile(
        "(?:Rp|IDR)\\.?\\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?|[0-9]{4,10})",
        Pattern.CASE_INSENSITIVE
    );

    // Regex 2: Pure number with dots (e.g. 408.000 or 1.250.000)
    private static final Pattern PURE_FORMATTED_PRICE_PATTERN = Pattern.compile(
        "^([0-9]{1,3}(?:\\.[0-9]{3})+)$"
    );

    private long lastProcessTime = 0;

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        try {
            AccessibilityServiceInfo info = getServiceInfo();
            if (info == null) info = new AccessibilityServiceInfo();
            info.eventTypes = AccessibilityEvent.TYPES_ALL_MASK;
            info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
            info.flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
                    | AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
                    | AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
                    | AccessibilityServiceInfo.DEFAULT;
            info.notificationTimeout = 100;
            setServiceInfo(info);
        } catch (Exception e) {
            Log.w(TAG, "Configuring dynamic accessibility service info: " + e.getMessage());
        }
        Log.d(TAG, "Zero Buy Cart Reader terhubung dan aktif (Deep Tree Harvester mode).");
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null) return;

        // Throttling 500ms agar tetap responsif saat scroll tanpa membebani CPU
        long now = System.currentTimeMillis();
        if (now - lastProcessTime < 500) return;
        lastProcessTime = now;

        // Identifikasi platform e-commerce (Tokopedia, Shopee, TikTok Shop, Lazada, Bukalapak, Blibli)
        CharSequence eventPkg = event.getPackageName();
        String platform = (eventPkg != null) ? identifyPlatform(eventPkg.toString().toLowerCase()) : null;

        if (platform == null) {
            AccessibilityNodeInfo activeRoot = getRootInActiveWindow();
            if (activeRoot != null) {
                CharSequence rootPkg = activeRoot.getPackageName();
                if (rootPkg != null) {
                    platform = identifyPlatform(rootPkg.toString().toLowerCase());
                }
                activeRoot.recycle();
            }
        }

        if (platform == null) {
            // Bukan aplikasi target e-commerce
            return;
        }

        List<AccessibilityNodeInfo> rootsToRecycle = new ArrayList<>();
        List<String> flatScreenTexts = new ArrayList<>();

        try {
            boolean gotWindows = false;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                try {
                    List<AccessibilityWindowInfo> windows = getWindows();
                    if (windows != null && !windows.isEmpty()) {
                        for (AccessibilityWindowInfo window : windows) {
                            if (window != null) {
                                AccessibilityNodeInfo root = window.getRoot();
                                if (root != null) {
                                    rootsToRecycle.add(root);
                                    harvestNodeTexts(root, flatScreenTexts);
                                    gotWindows = true;
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            if (!gotWindows) {
                AccessibilityNodeInfo activeRoot = getRootInActiveWindow();
                if (activeRoot != null) {
                    rootsToRecycle.add(activeRoot);
                    harvestNodeTexts(activeRoot, flatScreenTexts);
                }
            }

            if (!flatScreenTexts.isEmpty()) {
                if (isCartScreen(flatScreenTexts, platform)) {
                    parseAndSaveItems(flatScreenTexts, platform);
                } else {
                    Log.d(TAG, "Layar " + platform + " bukan halaman keranjang belanja (diabaikan).");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error saat membaca keranjang olshop: " + e.getMessage());
        } finally {
            for (AccessibilityNodeInfo r : rootsToRecycle) {
                try {
                    r.recycle();
                } catch (Exception ignored) {}
            }
        }
    }

    /**
     * Memverifikasi apakah layar saat ini adalah halaman Keranjang Belanja (Cart).
     * Mencegah penyadapan saat pengguna sedang di Home, Search, Feed, atau Detail Produk.
     */
    private boolean isCartScreen(List<String> flatTexts, String platform) {
        if (flatTexts == null || flatTexts.size() < 3) return false;

        boolean hasCartHeader = false;
        boolean hasCartAction = false;

        // 1. Periksa judul / header keranjang (terutama di 15 elemen pertama)
        int headerLimit = Math.min(flatTexts.size(), 15);
        for (int i = 0; i < headerLimit; i++) {
            String t = flatTexts.get(i).toLowerCase();
            if (t.equals("keranjang") || t.equals("keranjang saya") || t.equals("keranjang belanja")
                    || t.equals("troli") || t.equals("cart") || t.equals("shopping cart")
                    || t.equals("tas belanja") || t.equals("bag")) {
                hasCartHeader = true;
                break;
            }
        }

        // Jika tidak di 15 pertama, cari teks persis di seluruh layar
        if (!hasCartHeader) {
            for (String t : flatTexts) {
                String lower = t.toLowerCase();
                if (lower.equals("keranjang") || lower.equals("keranjang saya") || lower.equals("troli")) {
                    hasCartHeader = true;
                    break;
                }
            }
        }

        // 2. Periksa kontrol aksi khas keranjang (Pilih Semua, Total Tagihan, Beli/Checkout)
        for (String t : flatTexts) {
            String lower = t.toLowerCase();
            if (lower.contains("pilih semua") || lower.contains("select all")
                    || lower.contains("total tagihan") || lower.contains("total pembayaran")
                    || lower.contains("ringkasan belanja") || lower.contains("subtotal")
                    || lower.startsWith("beli (") || lower.startsWith("checkout (")
                    || lower.equals("checkout") || lower.equals("ubah")) {
                hasCartAction = true;
                break;
            }
        }

        return hasCartHeader && hasCartAction;
    }

    private String identifyPlatform(String pkg) {
        if (pkg == null) return null;
        if (pkg.contains("tokopedia")) return "Tokopedia";
        if (pkg.contains("shopee")) return "Shopee";
        if (pkg.contains("tiktok") || pkg.contains("trill") || pkg.contains("musically")) return "TikTok Shop";
        if (pkg.contains("lazada")) return "Lazada";
        if (pkg.contains("bukalapak")) return "Bukalapak";
        if (pkg.contains("blibli")) return "Blibli";
        return null;
    }

    /**
     * Deep Tree Harvester: Mengumpulkan SELURUH teks dari node.getText() dan node.getContentDescription()
     */
    private void harvestNodeTexts(AccessibilityNodeInfo node, List<String> flatTexts) {
        if (node == null || flatTexts.size() > 600) return;

        CharSequence text = node.getText();
        if (text != null) {
            String s = text.toString().trim();
            if (!s.isEmpty() && s.length() < 400) {
                flatTexts.add(s);
            }
        }

        CharSequence desc = node.getContentDescription();
        if (desc != null) {
            String s = desc.toString().trim();
            if (!s.isEmpty() && s.length() < 400) {
                // Hindari duplikasi jika sama persis dengan getText() pada node yang sama
                if (text == null || !s.equals(text.toString().trim())) {
                    flatTexts.add(s);
                }
            }
        }

        int childCount = node.getChildCount();
        for (int i = 0; i < childCount; i++) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child != null) {
                harvestNodeTexts(child, flatTexts);
                child.recycle();
            }
        }
    }

    private static class ExtractedItem {
        final String title;
        final long price;

        ExtractedItem(String title, long price) {
            this.title = title;
            this.price = price;
        }
    }

    /**
     * Logika pencocokan cerdas untuk Tokopedia & Shopee
     */
    private void parseAndSaveItems(List<String> texts, String platform) {
        if (texts.isEmpty()) return;

        List<ExtractedItem> foundThisPass = new ArrayList<>();
        Set<String> titlesFoundThisPass = new HashSet<>();

        for (int i = 0; i < texts.size(); i++) {
            String text = texts.get(i);
            if (text == null || text.isEmpty()) continue;

            // KASUS 1: String mengandung Rp / IDR
            Matcher matcher = PRICE_WITH_SYMBOL_PATTERN.matcher(text);
            if (matcher.find()) {
                long price = parsePrice(matcher.group(1));
                if (price >= 5000 && price <= 1000000000L) {
                    // Subkasus 1A: 1 string panjang (seperti contentDescription Tokopedia)
                    // berisi nama produk sekaligus harga Rp...
                    int priceStart = matcher.start();
                    String beforeInSameText = text.substring(0, priceStart).trim();
                    String cleanTitle = cleanCandidateTitle(beforeInSameText);

                    if (isValidProductTitle(cleanTitle)) {
                        String lowerKey = cleanTitle.toLowerCase();
                        if (!titlesFoundThisPass.contains(lowerKey)) {
                            titlesFoundThisPass.add(lowerKey);
                            foundThisPass.add(new ExtractedItem(cleanTitle, price));
                        }
                        continue;
                    }

                    // Subkasus 1B: Nama produk ada di node sebelumnya dalam flatTexts
                    String titleFromPrev = findPrecedingTitle(texts, i);
                    if (isValidProductTitle(titleFromPrev)) {
                        String lowerKey = titleFromPrev.toLowerCase();
                        if (!titlesFoundThisPass.contains(lowerKey)) {
                            titlesFoundThisPass.add(lowerKey);
                            foundThisPass.add(new ExtractedItem(titleFromPrev, price));
                        }
                        continue;
                    }

                    // Subkasus 1C: Fallback jika nama produk berada tepat setelah harga
                    String titleFromNext = findSucceedingTitle(texts, i);
                    if (isValidProductTitle(titleFromNext)) {
                        String lowerKey = titleFromNext.toLowerCase();
                        if (!titlesFoundThisPass.contains(lowerKey)) {
                            titlesFoundThisPass.add(lowerKey);
                            foundThisPass.add(new ExtractedItem(titleFromNext, price));
                        }
                        continue;
                    }
                }
            }

            // KASUS 2: Node ini adalah angka berformat titik (misal "408.000") dan node sebelumnya "Rp" / "IDR"
            Matcher pureNumMatcher = PURE_FORMATTED_PRICE_PATTERN.matcher(text.trim());
            if (pureNumMatcher.matches()) {
                long price = parsePrice(pureNumMatcher.group(1));
                if (price >= 5000 && price <= 1000000000L) {
                    if (i > 0) {
                        String prevNode = texts.get(i - 1).trim().toLowerCase();
                        if (prevNode.equals("rp") || prevNode.equals("rp.") || prevNode.equals("idr") || prevNode.contains("harga")) {
                            String titleFromPrev = findPrecedingTitle(texts, i - 1);
                            if (isValidProductTitle(titleFromPrev)) {
                                String lowerKey = titleFromPrev.toLowerCase();
                                if (!titlesFoundThisPass.contains(lowerKey)) {
                                    titlesFoundThisPass.add(lowerKey);
                                    foundThisPass.add(new ExtractedItem(titleFromPrev, price));
                                }
                                continue;
                            }
                        }
                    }
                }
            }
        }

        if (foundThisPass.isEmpty()) return;

        Context appContext = getApplicationContext();
        SharedPreferences prefs = appContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        String rawJson = prefs.getString(KEY_ITEMS, "[]");
        JSONArray cartArray;
        try {
            cartArray = new JSONArray(rawJson);
        } catch (Exception e) {
            cartArray = new JSONArray();
        }

        int newItemsCount = 0;
        for (ExtractedItem extracted : foundThisPass) {
            // Cek apakah produk sudah ada di daftar
            boolean exists = false;
            for (int j = 0; j < cartArray.length(); j++) {
                try {
                    JSONObject existing = cartArray.getJSONObject(j);
                    String existingTitle = existing.optString("title", "");
                    if (existingTitle.trim().equalsIgnoreCase(extracted.title.trim())) {
                        exists = true;
                        break;
                    }
                } catch (Exception ignored) {}
            }

            if (!exists) {
                try {
                    JSONObject item = new JSONObject();
                    item.put("id", "cart_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000));
                    item.put("title", extracted.title);
                    item.put("price", extracted.price);
                    item.put("platform", platform);
                    item.put("timestamp", System.currentTimeMillis());

                    // Sisipkan di posisi terdepan (maksimal 30 barang)
                    JSONArray newArray = new JSONArray();
                    newArray.put(item);
                    for (int k = 0; k < cartArray.length() && k < 29; k++) {
                        newArray.put(cartArray.get(k));
                    }
                    cartArray = newArray;
                    newItemsCount++;
                } catch (Exception ignored) {}
            }
        }

        if (newItemsCount > 0) {
            prefs.edit().putString(KEY_ITEMS, cartArray.toString()).apply();
            Log.d(TAG, "Berhasil menyadap " + newItemsCount + " barang baru dari " + platform);

            // Indikator visual real-time Toast di layar HP
            final int count = newItemsCount;
            final String plat = platform;
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    try {
                        String msg = (count == 1)
                            ? "Piko mendeteksi 1 barang dari keranjang " + plat + "!"
                            : "Piko mendeteksi " + count + " barang dari keranjang " + plat + "!";
                        Toast.makeText(appContext, msg, Toast.LENGTH_SHORT).show();
                    } catch (Exception ignored) {}
                }
            });
        }
    }

    private String findPrecedingTitle(List<String> texts, int currentIndex) {
        for (int offset = 1; offset <= 8; offset++) {
            int idx = currentIndex - offset;
            if (idx < 0) break;
            String candidate = texts.get(idx);
            String cleaned = cleanCandidateTitle(candidate);
            if (isValidProductTitle(cleaned)) {
                return cleaned;
            }
        }
        return null;
    }

    private String findSucceedingTitle(List<String> texts, int currentIndex) {
        for (int offset = 1; offset <= 3; offset++) {
            int idx = currentIndex + offset;
            if (idx >= texts.size()) break;
            String candidate = texts.get(idx);
            String cleaned = cleanCandidateTitle(candidate);
            if (isValidProductTitle(cleaned)) {
                return cleaned;
            }
        }
        return null;
    }

    private String cleanCandidateTitle(String s) {
        if (s == null) return "";
        String title = s.trim();

        // Bersihkan prefiks deskriptif
        String lower = title.toLowerCase();
        if (lower.startsWith("produk:") || lower.startsWith("produk ")) {
            title = title.substring(title.indexOf(" ") + 1).trim();
        } else if (lower.startsWith("nama produk:") || lower.startsWith("nama produk ")) {
            title = title.substring(title.indexOf("produk") + 6).trim();
        } else if (lower.startsWith("nama:")) {
            title = title.substring(title.indexOf(":") + 1).trim();
        } else if (lower.startsWith("barang:")) {
            title = title.substring(title.indexOf(":") + 1).trim();
        }

        // Hapus akhiran ", harga", ": harga", "- harga", " rp"
        String lowerEnd = title.toLowerCase();
        if (lowerEnd.endsWith("harga") || lowerEnd.endsWith("harga:") || lowerEnd.endsWith("rp")) {
            int lastSpace = title.lastIndexOf(" ");
            if (lastSpace > 0) {
                title = title.substring(0, lastSpace).trim();
            }
        }

        // Hapus tanda baca pembuka & penutup
        title = title.replaceAll("^[\\-\\,\\.\\:\\;\\|\\s\\\"\\'\\“\\”\\[\\]\\(\\)\\{\\}]+", "");
        title = title.replaceAll("[\\-\\,\\.\\:\\;\\|\\s\\\"\\'\\“\\”\\[\\]\\(\\)\\{\\}]+$", "");
        return title.trim();
    }

    private boolean isValidProductTitle(String s) {
        if (s == null) return false;
        String title = s.trim();
        if (title.length() < 5 || title.length() > 180) return false;

        // Tidak boleh merupakan atau mengandung pola harga
        if (PRICE_WITH_SYMBOL_PATTERN.matcher(title).find()) return false;
        if (PURE_FORMATTED_PRICE_PATTERN.matcher(title).matches()) return false;

        // Tidak boleh hanya berisi angka dan tanda baca
        if (title.matches("^[0-9\\s\\.\\,\\-\\+\\%\\/]+$")) return false;

        String lower = title.toLowerCase();

        // Blacklist kata-kata navigasi, tombol, kupon, checkout, status toko
        String[] blacklist = {
            "gratis ongkir", "voucher", "cashback", "diskon", "promo", "hemat",
            "pilih variasi", "ubah variasi", "variasi", "warna", "ukuran",
            "checkout", "beli sekarang", "tambah ke keranjang", "keranjang", "beli",
            "total tagihan", "total pembayaran", "total harga", "total pesanan", "subtotal", "ringkasan", "total",
            "pilih semua", "semua", "hapus", "ubah", "edit", "tulis catatan", "catatan",
            "ongkos kirim", "pengiriman", "reguler", "kargo", "instan", "same day",
            "toko", "official store", "power merchant", "star seller", "shopee mall", "lazmall",
            "tampilkan lebih", "lihat semua", "rincian", "detail", "informasi",
            "proteksi", "asuransi", "kupon", "koin", "paylater", "spaylater", "gopay", "ovo", "dana",
            "jumlah", "stok", "tersisa", "habis", "masukkan keranjang"
        };

        for (String b : blacklist) {
            if (lower.equals(b)) return false;
            if (b.length() >= 6 && lower.contains(b)) {
                if (lower.length() < b.length() + 8) return false;
            }
        }

        // Reject kata pendek tombol
        if (lower.equals("ok") || lower.equals("ya") || lower.equals("tidak") || lower.equals("batal")
            || lower.equals("simpan") || lower.equals("lanjut") || lower.equals("bayar")) {
            return false;
        }

        return true;
    }

    private long parsePrice(String rawNum) {
        if (rawNum == null) return 0;
        try {
            String cleaned = rawNum.trim();
            if (cleaned.endsWith(",00") || cleaned.endsWith(".00")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.replace(".", "").replace(",", "");
            return Long.parseLong(cleaned);
        } catch (Exception e) {
            return 0;
        }
    }

    @Override
    public void onInterrupt() {
        Log.d(TAG, "Zero Buy Cart Reader interrupted");
    }
}
