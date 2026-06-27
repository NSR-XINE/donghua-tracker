package com.donghua.tracker;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class NotificationReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID = "donghua_reminders";
    public static final String EXTRA_SHOW_ID = "show_id";
    public static final String EXTRA_SHOW_TITLE = "show_title";

    @Override
    public void onReceive(Context context, Intent intent) {
        String showId = intent.getStringExtra(EXTRA_SHOW_ID);
        String showTitle = intent.getStringExtra(EXTRA_SHOW_TITLE);

        if (showTitle == null) {
            showTitle = "A tracked Donghua";
        }

        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (notificationManager == null) return;

        // Register Notification Channel for API 26+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Donghua Release Reminders",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Reminders for scheduled ongoing releases");
            notificationManager.createNotificationChannel(channel);
        }

        // Create Intent to open MainActivity and target the show ID
        Intent clickIntent = new Intent(context, MainActivity.class);
        clickIntent.putExtra(EXTRA_SHOW_ID, showId);
        clickIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        // Generate unique request code
        int requestCode = showId != null ? showId.hashCode() : (int) System.currentTimeMillis();
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                requestCode,
                clickIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm) // Using generic alarm icon
                .setContentTitle(showTitle + " Airing Soon!")
                .setContentText("Your tracked show is about to air a new episode. Tune in!")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent);

        notificationManager.notify(requestCode, builder.build());
    }
}
