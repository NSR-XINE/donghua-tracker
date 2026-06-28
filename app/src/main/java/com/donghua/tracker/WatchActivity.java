package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.*;
import android.os.Build;
import android.view.View;
import android.widget.FrameLayout;
import androidx.appcompat.app.AppCompatActivity;

public class WatchActivity extends AppCompatActivity {

    private WebView playerView;
    private FrameLayout fullscreenContainer;
    private WebChromeClient.CustomViewCallback customViewCallback;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            // Fullscreen immersive
            applyImmersiveMode();

            // Lock to landscape for video (Guarded in a separate block in case the system rejects requested orientation changes)
            try {
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
            } catch (Throwable t) {
                android.util.Log.w("DonghuaTracker", "Could not lock screen orientation: " + t.getMessage());
            }

            FrameLayout rootLayout = new FrameLayout(this);
            rootLayout.setLayoutParams(new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT));

            playerView = new WebView(this);
            // Force hardware acceleration layer on the WebView for video rendering stability
            playerView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            playerView.setLayoutParams(new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT));
            playerView.setBackgroundColor(android.graphics.Color.BLACK);
            rootLayout.addView(playerView);

            fullscreenContainer = new FrameLayout(this);
            fullscreenContainer.setLayoutParams(new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT));
            fullscreenContainer.setVisibility(View.GONE);
            fullscreenContainer.setBackgroundColor(android.graphics.Color.BLACK);
            rootLayout.addView(fullscreenContainer);

            setContentView(rootLayout);

            WebSettings s = playerView.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setDatabaseEnabled(true);
            s.setJavaScriptCanOpenWindowsAutomatically(false); // Disable popups/redirects
            s.setMediaPlaybackRequiresUserGesture(false);
            s.setAllowFileAccess(false);
            s.setSupportZoom(true);
            s.setBuiltInZoomControls(true);
            s.setDisplayZoomControls(false);
            s.setUseWideViewPort(true);
            s.setLoadWithOverviewMode(true);
            s.setUserAgentString("Mozilla/5.0 (Linux; Android 11; Pixel 5) "
                + "AppleWebkit/537.36 (KHTML, like Gecko) "
                + "Chrome/120.0.0.0 Mobile Safari/537.36");

            // Allow mixed content so HTTP video links can load properly on HTTPS sites
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                s.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
                try {
                    CookieManager cookieManager = CookieManager.getInstance();
                    if (cookieManager != null) {
                        cookieManager.setAcceptThirdPartyCookies(playerView, true);
                    }
                } catch (Throwable t) {
                    android.util.Log.w("DonghuaTracker", "CookieManager init failed: " + t.getMessage());
                }
            }

            playerView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        if (request != null && request.getUrl() != null) {
                            String url = request.getUrl().toString();
                            if (url.startsWith("http://") || url.startsWith("https://")) {
                                view.loadUrl(url);
                            }
                        }
                    }
                    return true;
                }

                @SuppressWarnings("deprecation")
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                        view.loadUrl(url);
                    }
                    return true;
                }
            });
            playerView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onShowCustomView(View view, CustomViewCallback callback) {
                    customViewCallback = callback;
                    if (fullscreenContainer != null) {
                        fullscreenContainer.addView(view);
                        fullscreenContainer.setVisibility(View.VISIBLE);
                        if (playerView != null) {
                            playerView.setVisibility(View.GONE);
                        }
                    }
                }
                @Override
                public void onHideCustomView() {
                    if (fullscreenContainer != null) {
                        fullscreenContainer.setVisibility(View.GONE);
                        fullscreenContainer.removeAllViews();
                        if (playerView != null) {
                            playerView.setVisibility(View.VISIBLE);
                        }
                    }
                    if (customViewCallback != null) {
                        customViewCallback.onCustomViewHidden();
                        customViewCallback = null;
                    }
                }
            });

            Intent intent = getIntent();
            String url = null;
            if (intent != null) {
                url = intent.getStringExtra("watch_url");
            }
            if (url != null && !url.isEmpty()) {
                playerView.loadUrl(url);
            } else {
                finish();
            }
        } catch (Throwable t) {
            android.util.Log.e("DonghuaTracker", "Crash in WatchActivity onCreate", t);
            android.widget.Toast.makeText(this, "Crash starting player: " + t.getMessage(), android.widget.Toast.LENGTH_LONG).show();
            finish();
        }
    }

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
                View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            );
        }
    }

    @Override
    public void onBackPressed() {
        if (playerView.canGoBack()) {
            playerView.goBack();
        } else {
            finish();
        }
    }
}
