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
        String releaseDay = intent.getStringExtra("release_day");
        String releaseTime = intent.getStringExtra("release_time");
        int alarmCode = intent.getIntExtra("alarm_code", -1);

        if (title == null || title.isEmpty()) {
            title = "A Tracked Donghua";
        }

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Show Countdown Reminders",
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Alerts when a saved show is about to broadcast.");
            channel.setShowBadge(true);
            nm.createNotificationChannel(channel);
        }

        Intent activityIntent = new Intent(context, MainActivity.class);
        activityIntent.putExtra("target_show_id", showId);
        activityIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        int requestCode = alarmCode > 0 ? alarmCode : (showId != null ? showId.hashCode() : (int) System.currentTimeMillis());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getActivity(context, requestCode, activityIntent, flags);

        String episodeText = " is about to broadcast its next release.";
        android.database.sqlite.SQLiteDatabase db = null;
        try {
            DatabaseHelper helper = new DatabaseHelper(context);
            String showJson = helper.getShowsByStatus("ongoing");
            org.json.JSONArray arr = new org.json.JSONArray(showJson);
            for (int i = 0; i < arr.length(); i++) {
                org.json.JSONObject s = arr.getJSONObject(i);
                if (s.getString("id").equals(showId)) {
                    int nextEp = s.optInt("currentEp", 0) + 1;
                    episodeText = " Episode " + nextEp + " is airing now!";
                    break;
                }
            }
            helper.close();
        } catch (Exception ignored) {}

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(title)
                .setContentText(episodeText)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(pi)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);

        int notifyId = alarmCode > 0 ? alarmCode : (showId != null ? Math.abs(showId.hashCode()) : (int) System.currentTimeMillis());
        nm.notify(notifyId, builder.build());

        if (showId != null && releaseDay != null && releaseTime != null && alarmCode > 0) {
            AlarmScheduler.schedule(context, showId, title, releaseDay, releaseTime, alarmCode);
        }
    }
}
