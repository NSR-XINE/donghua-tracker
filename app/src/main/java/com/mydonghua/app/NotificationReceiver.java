package com.mydonghua.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;

public class NotificationReceiver extends BroadcastReceiver {

    public static final String CHANNEL_ID = "donghua_countdown_reminders";

    @Override
    public void onReceive(Context context, Intent intent) {
        String showId = intent.getStringExtra("show_id");
        String title = intent.getStringExtra("show_title");
        int alarmCode = intent.getIntExtra("alarm_code", -1);
        
        if (title == null || title.isEmpty()) {
            title = "A Tracked Donghua";
        }

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        // Create Channel on API 26+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Show Countdown Reminders",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Pushes alerts right before a saved show begins broadcasting.");
            nm.createNotificationChannel(channel);
        }

        // Tap action: Launch MainActivity and pass the show ID target
        Intent activityIntent = new Intent(context, MainActivity.class);
        activityIntent.putExtra("target_show_id", showId);
        activityIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        
        PendingIntent pi = PendingIntent.getActivity(
                context,
                alarmCode != -1 ? alarmCode : (showId != null ? showId.hashCode() : 0),
                activityIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification) // Use clean vector drawable (Bug 10)
                .setContentTitle("New Episode Airing Soon!")
                .setContentText(title + " is about to broadcast its next release.")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(pi);

        int notifyId = alarmCode != -1 ? alarmCode : (showId != null ? Math.abs(showId.hashCode()) : (int) System.currentTimeMillis());
        nm.notify(notifyId, builder.build());

        // Reschedule for the following week automatically (Bug 3)
        String releaseDay = intent.getStringExtra("release_day");
        String releaseTime = intent.getStringExtra("release_time");
        if (showId != null && releaseDay != null && releaseTime != null && alarmCode != -1) {
            AlarmScheduler.schedule(context, showId, title, releaseDay, releaseTime, alarmCode);
        }
    }
}
