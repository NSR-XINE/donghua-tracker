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
            showExitConfirmationDialog();
        }
    }

    private void showExitConfirmationDialog() {
        androidx.appcompat.app.AlertDialog dialog = new androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Exit Application")
            .setMessage("Do you want to close Donghua Tracker?")
            .setPositiveButton("Exit", (dialogInterface, i) -> finish())
            .setNegativeButton("Cancel", (dialogInterface, i) -> dialogInterface.dismiss())
            .create();

        dialog.show();

        // Style dialog action button text colors to match our dark neon theme
        dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_POSITIVE)
            .setTextColor(android.graphics.Color.parseColor("#00f2fe")); // Cyan accent
        dialog.getButton(androidx.appcompat.app.AlertDialog.BUTTON_NEGATIVE)
            .setTextColor(android.graphics.Color.parseColor("#a0aec0")); // Muted silver
    }
}
