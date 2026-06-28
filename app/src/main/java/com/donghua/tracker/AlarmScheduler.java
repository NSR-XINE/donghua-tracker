package com.donghua.tracker;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import java.util.Calendar;

public class AlarmScheduler {

    public static void schedule(Context context, String showId, String title, String releaseDay, String releaseTime) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("show_id", showId);
        intent.putExtra("show_title", title);

        PendingIntent pi = PendingIntent.getBroadcast(
                context,
                showId.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        long triggerTime = calculateNextReleaseTime(releaseDay, releaseTime);
        if (triggerTime == 0) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pi);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pi);
            }
        } catch (SecurityException se) {
            // Fallback to inexact alarm if system denies exact scheduling privilege
            am.set(AlarmManager.RTC_WAKEUP, triggerTime, pi);
        }
    }

    public static void cancel(Context context, String showId) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, NotificationReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(
                context,
                showId.hashCode(),
                intent,
                PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0)
        );

        if (pi != null) {
            am.cancel(pi);
            pi.cancel();
        }
    }

    private static long calculateNextReleaseTime(String releaseDay, String releaseTime) {
        try {
            String[] timeParts = releaseTime.split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);

            int dayOfWeek = getDayOfWeekValue(releaseDay);
            if (dayOfWeek == -1) return 0;

            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, hour);
            cal.set(Calendar.MINUTE, minute);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);

            int currentDayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
            int daysUntil = (dayOfWeek - currentDayOfWeek + 7) % 7;

            // If release is today but target time has already elapsed, schedule for next week
            if (daysUntil == 0 && cal.getTimeInMillis() < System.currentTimeMillis()) {
                daysUntil = 7;
            }

            cal.add(Calendar.DAY_OF_YEAR, daysUntil);
            return cal.getTimeInMillis();
        } catch (Exception e) {
            e.printStackTrace();
            return 0;
        }
    }

    private static int getDayOfWeekValue(String dayName) {
        switch (dayName.toLowerCase()) {
            case "sunday": return Calendar.SUNDAY;
            case "monday": return Calendar.MONDAY;
            case "tuesday": return Calendar.TUESDAY;
            case "wednesday": return Calendar.WEDNESDAY;
            case "thursday": return Calendar.THURSDAY;
            case "friday": return Calendar.FRIDAY;
            case "saturday": return Calendar.SATURDAY;
            default: return -1;
        }
    }
}
