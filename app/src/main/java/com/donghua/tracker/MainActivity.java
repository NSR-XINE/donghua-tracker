package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import java.lang.ref.WeakReference;

public class MainActivity extends AppCompatActivity {

    WebView webView;

    private static final String[] ALLOWED_PREFIXES = {
        "https://animecountdown.com/",
        "https://api.jikan.moe/",
        "https://donghuastream.org/",
        "https://www.donghuastream.org/",
        "https://cdn.",
        "https://img."
    };

    private void applyImmersiveMode() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController ctrl = getWindow().getInsetsController();
            if (ctrl != null) {
                ctrl.hide(WindowInsets.Type.systemBars());
                ctrl.setSystemBarsBehavior(
                    WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        applyImmersiveMode();

        webView = findViewById(R.id.webview);
        webView.setWebViewClient(new WebViewClient());

        webView.setWebChromeClient(new android.webkit.WebChromeClient() {
            @Override
            public boolean onJsConfirm(WebView view, String url, String message,
                                        final android.webkit.JsResult result) {
                new android.app.AlertDialog.Builder(MainActivity.this)
                    .setMessage(message)
                    .setPositiveButton("OK", (d, w) -> result.confirm())
                    .setNegativeButton("Cancel", (d, w) -> result.cancel())
                    .setCancelable(false)
                    .show();
                return true;
            }
            @Override
            public boolean onJsAlert(WebView view, String url, String message,
                                      final android.webkit.JsResult result) {
                new android.app.AlertDialog.Builder(MainActivity.this)
                    .setMessage(message)
                    .setPositiveButton("OK", (d, w) -> result.confirm())
                    .setCancelable(false)
                    .show();
                return true;
            }
        });

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
                boolean allowed = false;
                if (url != null) {
                    for (String prefix : ALLOWED_PREFIXES) {
                        if (url.startsWith(prefix)) {
                            allowed = true;
                            break;
                        }
                    }
                }
                if (!allowed) {
                    webView.evaluateJavascript(callbackName + "(null);", null);
                    return;
                }

                final WeakReference<MainActivity> weakActivity = new WeakReference<>(MainActivity.this);
                new Thread(() -> {
                    MainActivity activity = weakActivity.get();
                    if (activity == null) return;
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
                        activity.runOnUiThread(() -> {
                            MainActivity a = weakActivity.get();
                            if (a == null) return;
                            a.webView.evaluateJavascript(callbackName + "("
                                + org.json.JSONObject.quote(html) + ");", null);
                        });
                    } catch (Exception e) {
                        activity.runOnUiThread(() -> {
                            MainActivity a = weakActivity.get();
                            if (a == null) return;
                            a.webView.evaluateJavascript(callbackName + "(null);", null);
                        });
                    }
                }).start();
            }

            @JavascriptInterface
            public void openWatchScreen(final String url) {
                runOnUiThread(() -> {
                    try {
                        Intent intent = new Intent(MainActivity.this, WatchActivity.class);
                        intent.putExtra("watch_url", url);
                        startActivity(intent);
                    } catch (Exception e) {
                        android.util.Log.e("DonghuaTracker", "Failed to start WatchActivity", e);
                        android.widget.Toast.makeText(MainActivity.this, "Error starting player: " + e.getMessage(), android.widget.Toast.LENGTH_LONG).show();
                    }
                });
            }

            @JavascriptInterface
            public void shareText(final String text) {
                runOnUiThread(() -> {
                    Intent intent = new Intent(Intent.ACTION_SEND);
                    intent.setType("text/plain");
                    intent.putExtra(Intent.EXTRA_TEXT, text);
                    intent.putExtra(Intent.EXTRA_SUBJECT, "Donghua Tracker Backup");
                    startActivity(Intent.createChooser(intent, "Export Backup"));
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
            applyImmersiveMode();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.evaluateJavascript("pauseTimers();", null);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.evaluateJavascript("resumeTimers();", null);
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }
}
