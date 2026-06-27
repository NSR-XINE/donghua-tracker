package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.lang.ref.WeakReference;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private DatabaseHelper dbHelper;
    private String pendingShowId = null;

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

    private void handleNotificationIntent(Intent intent) {
        if (intent != null && intent.hasExtra(NotificationReceiver.EXTRA_SHOW_ID)) {
            String showId = intent.getStringExtra(NotificationReceiver.EXTRA_SHOW_ID);
            if (showId != null && !showId.isEmpty()) {
                pendingShowId = showId;
                if (webView != null) {
                    webView.evaluateJavascript("window.showNotificationDetail && window.showNotificationDetail(\"" + showId + "\");", null);
                    pendingShowId = null;
                }
            }
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleNotificationIntent(intent);
    }

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Enable immersive full-screen sticky mode (called after contentView inflation to ensure system UI controller is ready)
        setImmersiveFullScreen();

        // Initialize Database Helper
        dbHelper = new DatabaseHelper(this);

        webView = findViewById(R.id.webview);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // If we were launched with a deep-link from a notification tap, dispatch it now
                if (pendingShowId != null) {
                    webView.evaluateJavascript("window.showNotificationDetail && window.showNotificationDetail(\"" + pendingShowId + "\");", null);
                    pendingShowId = null;
                }
            }
            
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Block unknown external URL loads inside the WebView to prevent hijacking
                if (url.startsWith("file://") || url.startsWith("https://animecountdown.com/") || url.startsWith("https://cdn.")) {
                    return false;
                }
                // Open external watch/streaming links in system browser
                try {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, android.net.Uri.parse(url));
                    startActivity(browserIntent);
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return true;
            }
        });

        webView.setWebChromeClient(new android.webkit.WebChromeClient());

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
                                    String responsePayload = (finalHtml == null) ? "null" : org.json.JSONObject.quote(finalHtml);
                                    activity.webView.evaluateJavascript(callbackName + "(" + responsePayload + ");", null);
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

            // SQLite Database Bridge Methods
            @JavascriptInterface
            public String getAllShows() {
                return dbHelper.getAllShowsJson();
            }

            @JavascriptInterface
            public boolean insertShow(String jsonStr) {
                try {
                    JSONObject obj = new JSONObject(jsonStr);
                    return dbHelper.insertShow(obj);
                } catch (Exception e) {
                    e.printStackTrace();
                    return false;
                }
            }

            @JavascriptInterface
            public boolean updateShow(String jsonStr) {
                try {
                    JSONObject obj = new JSONObject(jsonStr);
                    return dbHelper.updateShow(obj);
                } catch (Exception e) {
                    e.printStackTrace();
                    return false;
                }
            }

            @JavascriptInterface
            public boolean deleteShow(String id) {
                return dbHelper.deleteShow(id);
            }

            @JavascriptInterface
            public String getSetting(String key, String defaultVal) {
                return dbHelper.getSetting(key, defaultVal);
            }

            @JavascriptInterface
            public boolean saveSetting(String key, String value) {
                return dbHelper.saveSetting(key, value);
            }

            @JavascriptInterface
            public void addHistoryRecord(String showId, int episodeNum) {
                dbHelper.addHistoryRecord(showId, episodeNum);
            }

            @JavascriptInterface
            public String getHistory() {
                return dbHelper.getHistoryJson();
            }

            @JavascriptInterface
            public void clearDatabase() {
                dbHelper.clearDatabase();
            }

            // Notification Reminders scheduler
            @JavascriptInterface
            public boolean checkNotificationPermission() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    return ContextCompat.checkSelfPermission(
                            MainActivity.this,
                            android.Manifest.permission.POST_NOTIFICATIONS
                    ) == PackageManager.PERMISSION_GRANTED;
                }
                return true;
            }

            @JavascriptInterface
            public void requestNotificationPermission() {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    ActivityCompat.requestPermissions(
                            MainActivity.this,
                            new String[]{android.Manifest.permission.POST_NOTIFICATIONS},
                            101
                    );
                }
            }

            @JavascriptInterface
            public void scheduleReminder(String id, String title, long releaseTimeMs, int reminderOffsetMinutes) {
                try {
                    AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                    if (alarmManager == null) return;

                    Intent intent = new Intent(MainActivity.this, NotificationReceiver.class);
                    intent.putExtra(NotificationReceiver.EXTRA_SHOW_ID, id);
                    intent.putExtra(NotificationReceiver.EXTRA_SHOW_TITLE, title);

                    int requestCode = id.hashCode() + reminderOffsetMinutes;
                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            MainActivity.this,
                            requestCode,
                            intent,
                            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );

                    long triggerTimeMs = releaseTimeMs - ((long) reminderOffsetMinutes * 60 * 1000);
                    if (triggerTimeMs < System.currentTimeMillis()) {
                        return; // Release time passed
                    }

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        if (alarmManager.canScheduleExactAlarms()) {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                        } else {
                            alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                        }
                    } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                    } else {
                        alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTimeMs, pendingIntent);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @JavascriptInterface
            public void cancelReminder(String id, int reminderOffsetMinutes) {
                try {
                    AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                    if (alarmManager == null) return;

                    Intent intent = new Intent(MainActivity.this, NotificationReceiver.class);
                    int requestCode = id.hashCode() + reminderOffsetMinutes;
                    PendingIntent pendingIntent = PendingIntent.getBroadcast(
                            MainActivity.this,
                            requestCode,
                            intent,
                            PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
                    );
                    if (pendingIntent != null) {
                        alarmManager.cancel(pendingIntent);
                        pendingIntent.cancel();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }, "AndroidApp");

        // Load our index.html from assets
        if (savedInstanceState == null) {
            webView.loadUrl("file:///android_asset/index.html");
        } else {
            webView.restoreState(savedInstanceState);
        }

        // Handle deep link notification intent on startup
        handleNotificationIntent(getIntent());
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
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onRestoreInstanceState(Bundle savedInstanceState) {
        super.onRestoreInstanceState(savedInstanceState);
        if (webView != null) {
            webView.restoreState(savedInstanceState);
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
