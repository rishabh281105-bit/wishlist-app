package com.rishabh.wishlist;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** Hands shared links to the app screen: live if the app is open, or kept until it asks. */
@CapacitorPlugin(name = "ShareInbox")
public class ShareInboxPlugin extends Plugin {

    private static String pending = null;
    private static ShareInboxPlugin instance = null;

    @Override
    public void load() {
        instance = this;
    }

    static void deliver(String text) {
        if (text == null || text.trim().isEmpty()) return;
        ShareInboxPlugin p = instance;
        if (p != null && p.hasListeners("shared")) {
            JSObject data = new JSObject();
            data.put("text", text);
            p.notifyListeners("shared", data);
        } else {
            pending = text;
        }
    }

    @PluginMethod
    public void take(PluginCall call) {
        JSObject ret = new JSObject();
        if (pending != null) ret.put("text", pending);
        pending = null;
        call.resolve(ret);
    }
}
