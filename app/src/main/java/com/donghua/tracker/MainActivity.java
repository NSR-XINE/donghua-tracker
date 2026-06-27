package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import java.lang.ref.WeakReference;

public class MainActivity extends AppCompatActivity {

    private WebView webView;

    private void setImmersiveFullScreen() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            android.view.WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(android.view.WindowInsets.Type.statusBars() | android.view.WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            // Deprecated fallback flag list for Android versions below API 30
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

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Enable immersive full-screen sticky mode
        setImmersiveFullScreen();

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
            @JavascriptInterface
            public void exitApp() {
                runOnUiThread(() -> finish());
            }

            @JavascriptInterface
            public void fetchUrl(final String url, final String callbackName) {
                // Security Check: Prefix validation for allowed domains
                if (url == null || !(url.startsWith("https://animecountdown.com/") || url.startsWith("https://cdn."))) {
                    runOnUiThread(() -> webView.evaluateJavascript(callbackName + "(null);", null));
                    return;
                }

                // Prevent memory leak with a WeakReference to the host Activity
                final WeakReference<MainActivity> activityRef = new WeakReference<>(MainActivity.this);
                new Thread(new Runnable() {
                    @Override
                    public void run() {
                        String fetchedHtml = null;
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
                            fetchedHtml = response.toString();
                        } catch (Exception e) {
                            fetchedHtml = null;
                        }

                        final String finalHtml = fetchedHtml;
                        MainActivity activity = activityRef.get();
                        if (activity != null && !activity.isFinishing() && !activity.isDestroyed()) {
                            activity.runOnUiThread(new Runnable() {
                                @Override
                                public void run() {
                                    activity.webView.evaluateJavascript(callbackName + "(" + org.json.JSONObject.quote(finalHtml) + ");", null);
                                }
                            });
                        }
                    }
                }).start();
            }

            @JavascriptInterface
            public void shareText(final String text) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            Intent sendIntent = new Intent();
                            sendIntent.setAction(Intent.ACTION_SEND);
                            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
                            sendIntent.setType("text/plain");
                            Intent shareIntent = Intent.createChooser(sendIntent, "Export Donghua Backup");
                            startActivity(shareIntent);
                        } catch (Exception e) {
                            // Suppress exceptions
                        }
                    }
                });
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
            setImmersiveFullScreen();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.evaluateJavascript("window.pauseTimers && window.pauseTimers();", null);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.evaluateJavascript("window.resumeTimers && window.resumeTimers();", null);
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        // Keep active states when screen orientation or UI theme mode changes
    }
}
