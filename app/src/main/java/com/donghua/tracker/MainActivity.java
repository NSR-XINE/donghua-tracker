package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private long backPressedTime;
    private android.widget.Toast backToast;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        webView.setWebViewClient(new WebViewClient());

        // Mask WebView initialization latency with dark theme color to prevent white flashes
        webView.setBackgroundColor(android.graphics.Color.parseColor("#05060a"));

        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true); // Required for LocalStorage
        webSettings.setAllowFileAccess(true);    // Allow reading assets/files
        webSettings.setAllowContentAccess(true);
        webSettings.setDatabaseEnabled(true);

        // Lock zoom levels and disable user scaling to make it feel native
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);

        // Force WebView to respect the HTML viewport meta tag and scale to screen size
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);

        // Disable WebView long click to prevent text selection and context menu popups
        webView.setOnLongClickListener(v -> true);
        webView.setLongClickable(false);

        // Load our index.html from assets
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            if (backPressedTime + 2000 > System.currentTimeMillis()) {
                if (backToast != null) {
                    backToast.cancel();
                }
                super.onBackPressed();
                return;
            } else {
                backToast = android.widget.Toast.makeText(getBaseContext(), "Press back again to exit", android.widget.Toast.LENGTH_SHORT);
                backToast.show();
            }
            backPressedTime = System.currentTimeMillis();
        }
    }
}
