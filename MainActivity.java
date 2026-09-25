package com.rishabh.wishlist;

import android.content.Intent;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

/** Opens the app and passes along links shared from other apps (Share → Wishlist). */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(ShareInboxPlugin.class);
        super.onCreate(savedInstanceState);
        handleShare(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleShare(intent);
    }

    private void handleShare(Intent intent) {
        if (intent == null || !Intent.ACTION_SEND.equals(intent.getAction())) return;
        String text = intent.getStringExtra(Intent.EXTRA_TEXT);
        if (text == null) {
            CharSequence cs = intent.getCharSequenceExtra(Intent.EXTRA_TEXT);
            if (cs != null) text = cs.toString();
        }
        intent.setAction(Intent.ACTION_MAIN); // so the same share isn't handled twice
        ShareInboxPlugin.deliver(text);
    }
}
