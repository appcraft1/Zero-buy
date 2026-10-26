package com.iaiflash.zerobuy;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AccessibilityControlReceiver extends BroadcastReceiver {
    public static final String ACTION_DISABLE_ACCESSIBILITY = "com.iaiflash.zerobuy.ACTION_DISABLE_ACCESSIBILITY";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (ACTION_DISABLE_ACCESSIBILITY.equals(action)) {
            CartAccessibilityService service = CartAccessibilityService.getInstance();
            if (service != null) {
                service.manualDisableFromNotification();
            }
        }
    }
}
