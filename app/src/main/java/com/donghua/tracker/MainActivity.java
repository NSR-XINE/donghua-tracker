package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import androidx.appcompat.app.AppCompatActivity;
import java.lang.ref.WeakReference;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    WebView webView;
    private DatabaseHelper dbHelper;
    private float statusBarHeightDp = 0f;
    private float navBarHeightDp = 0f;
    private float safeAreaLeftDp = 0f;
    private float safeAreaRightDp = 0f;

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
            // Sanitize: show IDs are alphanumeric + hyphens only; reject anything else to prevent JS injection
            if (targetShowId.matches("[a-zA-Z0-9\\-]+")) {
                webView.evaluateJavascript(
                    "setTimeout(function() { if (typeof openDetailsById === 'function') { openDetailsById(" +
                    org.json.JSONObject.quote(targetShowId) + "); } }, 500);", null);
            }
            getIntent().removeExtra("target_show_id");
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            );
            getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
            getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH) {
            getWindow().getDecorView().setOnApplyWindowInsetsListener((view, insets) -> {
                int topInset = insets.getSystemWindowInsetTop();
                int bottomInset = insets.getSystemWindowInsetBottom();
                int leftInset = insets.getSystemWindowInsetLeft();
                int rightInset = insets.getSystemWindowInsetRight();
                
                float density = getResources().getDisplayMetrics().density;
                statusBarHeightDp = topInset / density;
                navBarHeightDp = bottomInset / density;
                safeAreaLeftDp = leftInset / density;
                safeAreaRightDp = rightInset / density;
                
                updateWebViewInsets();
                return insets;
            });
        }

        dbHelper = new DatabaseHelper(this);

        webView = findViewById(R.id.webview);
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    if (request != null && request.getUrl() != null) {
                        String url = request.getUrl().toString();
                        if (url.startsWith("http://") || url.startsWith("https://")) {
                            return false; // Allow standard web links to load natively
                        }
                    }
                }
                return true; // Block malicious redirects / custom schemes
            }

            @SuppressWarnings("deprecation")
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    return false; // Allow standard web links to load natively
                }
                return true; // Block malicious redirects / custom schemes
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                updateWebViewInsets();
                String targetShowId = getIntent().getStringExtra("target_show_id");
                if (targetShowId != null) {
                    // Sanitize: reject IDs with characters outside alphanumeric + hyphen to prevent JS injection
                    if (targetShowId.matches("[a-zA-Z0-9\\-]+")) {
                        webView.evaluateJavascript(
                            "setTimeout(function() { if (typeof openDetailsById === 'function') { openDetailsById(" +
                            org.json.JSONObject.quote(targetShowId) + "); } }, 800);", null);
                    }
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
        webSettings.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.clearCache(true);

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
            public void setSystemThemeMode(final String themeMode) {
                runOnUiThread(() -> {
                    try {
                        boolean isLight = "light".equalsIgnoreCase(themeMode);
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                            android.view.Window w = getWindow();
                            android.view.WindowInsetsController controller = w.getInsetsController();
                            if (controller != null) {
                                int appearance = 0;
                                if (isLight) {
                                    appearance = android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | 
                                                 android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS;
                                }
                                controller.setSystemBarsAppearance(
                                    appearance,
                                    android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | 
                                    android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
                                );
                            }
                        } else {
                            // Legacy pre-R flag toggling
                            int flags = getWindow().getDecorView().getSystemUiVisibility();
                            if (isLight) {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                                }
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                                }
                            } else {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                                }
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                                }
                            }
                            getWindow().getDecorView().setSystemUiVisibility(flags);
                        }
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                });
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
            public void shareJsonFile(final String jsonContent) {
                runOnUiThread(() -> {
                    try {
                        // Write JSON to a named file in the app's cache/backups directory
                        java.io.File backupDir = new java.io.File(getCacheDir(), "backups");
                        if (!backupDir.exists()) backupDir.mkdirs();

                        String fileName = "donghua_backup_" +
                            new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US)
                                .format(new java.util.Date()) + ".json";
                        java.io.File backupFile = new java.io.File(backupDir, fileName);

                        java.io.FileWriter writer = new java.io.FileWriter(backupFile, false);
                        writer.write(jsonContent);
                        writer.close();

                        // Get a content:// URI via FileProvider so other apps can read the file
                        android.net.Uri fileUri = androidx.core.content.FileProvider.getUriForFile(
                            MainActivity.this,
                            "com.donghua.tracker.fileprovider",
                            backupFile
                        );

                        Intent intent = new Intent(Intent.ACTION_SEND);
                        intent.setType("application/json");
                        intent.putExtra(Intent.EXTRA_STREAM, fileUri);
                        intent.putExtra(Intent.EXTRA_SUBJECT, "Donghua Tracker Backup");
                        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(Intent.createChooser(intent, "Export Backup"));
                    } catch (Throwable t) {
                        android.util.Log.e("DonghuaTracker", "Share file failed", t);
                        android.widget.Toast.makeText(MainActivity.this,
                            "Export failed: " + t.getMessage(), android.widget.Toast.LENGTH_LONG).show();
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
            public boolean dbUpdateShow(final String showJsonStr) {
                try {
                    JSONObject obj = new JSONObject(showJsonStr);
                    return dbHelper.updateShow(obj);
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
            public void scheduleReminder(final String id, final String title, final String releaseDay, final String releaseTime, final int alarmCode) {
                runOnUiThread(() -> {
                    try {
                        AlarmScheduler.schedule(MainActivity.this, id, title, releaseDay, releaseTime, alarmCode);
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                });
            }

            @JavascriptInterface
            public void cancelReminder(final String id, final int alarmCode) {
                runOnUiThread(() -> {
                    try {
                        AlarmScheduler.cancel(MainActivity.this, id, alarmCode);
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                });
            }

            @JavascriptInterface
            public void syncAllAlarms() {
                // Read the database on a background thread to avoid blocking the UI thread,
                // then dispatch each AlarmScheduler call back onto the main thread.
                new Thread(() -> {
                    try {
                        String showsJson = dbHelper.getAllShows();
                        org.json.JSONArray arr = new org.json.JSONArray(showsJson);
                        for (int i = 0; i < arr.length(); i++) {
                            org.json.JSONObject show = arr.getJSONObject(i);
                            String id = show.getString("id");
                            String title = show.getString("title");
                            String status = show.optString("status", "ongoing");
                            int alarmCode = show.optInt("alarmRequestCode", Math.abs(id.hashCode()));

                            final String fId = id;
                            final String fTitle = title;
                            final String fStatus = status;
                            final int fAlarmCode = alarmCode;
                            final String fDay = show.optString("releaseDay", "Sunday");
                            final String fTime = show.optString("releaseTime", "10:00");

                            runOnUiThread(() -> {
                                if ("ongoing".equals(fStatus)) {
                                    AlarmScheduler.schedule(MainActivity.this, fId, fTitle, fDay, fTime, fAlarmCode);
                                } else {
                                    AlarmScheduler.cancel(MainActivity.this, fId, fAlarmCode);
                                }
                            });
                        }
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                }).start();
            }
        }, "AndroidApp");

        // Load our index.html from assets
        webView.loadUrl("file:///android_asset/index.html?v=" + System.currentTimeMillis());
    }

    private void updateWebViewInsets() {
        if (webView != null) {
            webView.post(() -> {
                webView.evaluateJavascript(
                    "document.documentElement.style.setProperty('--status-bar-height', '" + statusBarHeightDp + "px');" +
                    "document.documentElement.style.setProperty('--navigation-bar-height', '" + navBarHeightDp + "px');" +
                    "document.documentElement.style.setProperty('--safe-area-left', '" + safeAreaLeftDp + "px');" +
                    "document.documentElement.style.setProperty('--safe-area-right', '" + safeAreaRightDp + "px');",
                    null
                );
            });
        }
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
    protected void onDestroy() {
        super.onDestroy();
        if (dbHelper != null) {
            dbHelper.close();
        }
    }

    @Override
    public void onConfigurationChanged(android.content.res.Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }
}
