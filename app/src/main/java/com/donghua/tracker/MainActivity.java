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
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    WebView webView;
    private DatabaseHelper dbHelper;

    private static final String[] ALLOWED_PREFIXES = {
        "https://animecountdown.com/",
        "https://api.jikan.moe/",
        "https://donghuastream.org/",
        "https://www.donghuastream.org/",
        "https://luciferdonghua.org/",
        "https://www.luciferdonghua.org/",
        "https://cdn.",
        "https://img."
    };

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String targetShowId = intent.getStringExtra("target_show_id");
        if (targetShowId != null && webView != null) {
            webView.evaluateJavascript("setTimeout(function() { if (typeof openDetailsById === 'function') { openDetailsById('" + targetShowId + "'); } }, 500);", null);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setStatusBarColor(android.graphics.Color.parseColor("#05060a"));
            getWindow().setNavigationBarColor(android.graphics.Color.parseColor("#05060a"));
        }

        dbHelper = new DatabaseHelper(this);

        webView = findViewById(R.id.webview);
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                String targetShowId = getIntent().getStringExtra("target_show_id");
                if (targetShowId != null) {
                    webView.evaluateJavascript("setTimeout(function() { if (typeof openDetailsById === 'function') { openDetailsById('" + targetShowId + "'); } }, 800);", null);
                    getIntent().removeExtra("target_show_id");
                }
            }
        });

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
        webSettings.setDomStorageEnabled(true); // Required for LocalStorage fallback
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
                    } catch (Throwable t) {
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
                    } catch (Throwable t) {
                        android.util.Log.e("DonghuaTracker", "Failed to start WatchActivity", t);
                        android.widget.Toast.makeText(MainActivity.this, "Error starting player: " + t.getMessage(), android.widget.Toast.LENGTH_LONG).show();
                    }
                });
            }

            @JavascriptInterface
            public void shareText(final String text) {
                runOnUiThread(() -> {
                    try {
                        Intent intent = new Intent(Intent.ACTION_SEND);
                        intent.setType("text/plain");
                        intent.putExtra(Intent.EXTRA_TEXT, text);
                        intent.putExtra(Intent.EXTRA_SUBJECT, "Donghua Tracker Backup");
                        startActivity(Intent.createChooser(intent, "Export Backup"));
                    } catch (Throwable t) {
                        android.util.Log.e("DonghuaTracker", "Share failed", t);
                    }
                });
            }

            // ==========================================
            // NATIVE SQLITE DATABASE BRIDGE
            // ==========================================

            @JavascriptInterface
            public String dbGetAllShows() {
                try {
                    return dbHelper.getAllShows();
                } catch (Throwable t) {
                    t.printStackTrace();
                    return "[]";
                }
            }

            @JavascriptInterface
            public boolean dbInsertShow(final String showJsonStr) {
                try {
                    JSONObject obj = new JSONObject(showJsonStr);
                    return dbHelper.insertShow(obj);
                } catch (Throwable t) {
                    t.printStackTrace();
                    return false;
                }
            }

            @JavascriptInterface
            public boolean dbDeleteShow(final String showId) {
                try {
                    return dbHelper.deleteShow(showId);
                } catch (Throwable t) {
                    t.printStackTrace();
                    return false;
                }
            }

            @JavascriptInterface
            public void dbAddWatchHistory(final String showId, final int episodeNum) {
                try {
                    dbHelper.addWatchHistory(showId, episodeNum);
                } catch (Throwable t) {
                    t.printStackTrace();
                }
            }

            @JavascriptInterface
            public String dbGetWatchHistory() {
                try {
                    return dbHelper.getWatchHistory();
                } catch (Throwable t) {
                    t.printStackTrace();
                    return "[]";
                }
            }

            @JavascriptInterface
            public void dbSaveSetting(final String key, final String value) {
                try {
                    dbHelper.saveSetting(key, value);
                } catch (Throwable t) {
                    t.printStackTrace();
                }
            }

            @JavascriptInterface
            public String dbGetSetting(final String key, final String defaultVal) {
                try {
                    return dbHelper.getSetting(key, defaultVal);
                } catch (Throwable t) {
                    t.printStackTrace();
                    return defaultVal;
                }
            }

            // ==========================================
            // ALARM REMINDER CONTROLS
            // ==========================================

            @JavascriptInterface
            public void scheduleReminder(final String id, final String title, final String releaseDay, final String releaseTime) {
                runOnUiThread(() -> {
                    try {
                        AlarmScheduler.schedule(MainActivity.this, id, title, releaseDay, releaseTime);
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                });
            }

            @JavascriptInterface
            public void cancelReminder(final String id) {
                runOnUiThread(() -> {
                    try {
                        AlarmScheduler.cancel(MainActivity.this, id);
                    } catch (Throwable t) {
                        t.printStackTrace();
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
