package com.donghua.tracker;

import android.annotation.SuppressLint;
import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.*;
import android.os.Build;
import android.view.View;
import androidx.appcompat.app.AppCompatActivity;

public class WatchActivity extends AppCompatActivity {

    private WebView playerView;

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

            playerView = new WebView(this);
            // Force hardware acceleration layer on the WebView for video rendering stability
            playerView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            setContentView(playerView);
            playerView.setBackgroundColor(android.graphics.Color.BLACK);

            WebSettings s = playerView.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
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
            }

            playerView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    view.loadUrl(request.getUrl().toString());
                    return true;
                }
            });
            playerView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onShowCustomView(View view, CustomViewCallback callback) {
                    // Allow full-screen video player inside the activity
                    setContentView(view);
                }
                @Override
                public void onHideCustomView() {
                    setContentView(playerView);
                }
            });

            String url = getIntent().getStringExtra("watch_url");
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
