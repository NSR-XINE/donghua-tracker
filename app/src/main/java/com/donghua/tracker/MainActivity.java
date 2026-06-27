package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable immersive full-screen sticky mode
        getWindow().getDecorView().setSystemUiVisibility(
            android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
            | android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        );

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

        webView.setOnLongClickListener(v -> true);
        webView.setLongClickable(false);

        // Add JavascriptInterface to allow web pages to trigger native actions
        webView.addJavascriptInterface(new Object() {
            @android.webkit.JavascriptInterface
            public void exitApp() {
                runOnUiThread(() -> finish());
            }

            @android.webkit.JavascriptInterface
            public void fetchUrl(final String url, final String callbackName) {
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            java.net.URL urlObj = new java.net.URL(url);
                            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) urlObj.openConnection();
                            conn.setRequestMethod("GET");
                            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                            conn.setConnectTimeout(10000);
                            conn.setReadTimeout(10000);
                            
                            java.io.InputStream inStream = conn.getInputStream();
                            java.io.BufferedReader in = new java.io.BufferedReader(new java.io.InputStreamReader(inStream, "UTF-8"));
                            StringBuilder response = new StringBuilder();
                            String inputLine;
                            while ((inputLine = in.readLine()) != null) {
                                response.append(inputLine).append("\n");
                            }
                            in.close();
                            
                            final String html = response.toString();
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    webView.evaluateJavascript(callbackName + "(" + org.json.JSONObject.quote(html) + ");", null);
                                }
                            });
                        } catch (final Exception e) {
                            runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    webView.evaluateJavascript(callbackName + "(null);", null);
                                }
                            });
                        }
                    }
                }).start();
            }
        }, "AndroidApp");

        // Load our index.html from assets
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            webView.evaluateJavascript("showExitModal();", null);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            getWindow().getDecorView().setSystemUiVisibility(
                android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
                | android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Keep active states when screen orientation or UI theme mode changes
    }
}
