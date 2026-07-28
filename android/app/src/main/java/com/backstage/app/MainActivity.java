package com.backstage.app;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            String userAgent = settings.getUserAgentString();
            
            if (BuildConfig.FLAVOR.equals("fan")) {
                settings.setUserAgentString(userAgent + " BackstageFlavor/User");
            } else if (BuildConfig.FLAVOR.equals("ops")) {
                settings.setUserAgentString(userAgent + " BackstageFlavor/Ops");
            }
        }
    }
}
