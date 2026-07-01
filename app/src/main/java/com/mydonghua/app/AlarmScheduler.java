package com.mydonghua.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import java.util.Calendar;
import java.util.TimeZone;

public class AlarmScheduler {

    public static void schedule(Context context, String showId, String title, String releaseDay, String releaseTime, int alarmCode) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, NotificationReceiver.class);
        intent.putExtra("show_id", showId);
        intent.putExtra("show_title", title);
        intent.putExtra("release_day", releaseDay);
        intent.putExtra("release_time", releaseTime);
        intent.putExtra("alarm_code", alarmCode);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getBroadcast(context, alarmCode, intent, flags);

        long triggerTime = calculateNextReleaseTime(releaseDay, releaseTime);
        if (triggerTime == 0) return;

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pi);
            } else {
                am.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pi);
            }
        } catch (SecurityException se) {
            am.set(AlarmManager.RTC_WAKEUP, triggerTime, pi);
        }
    }

    public static void cancel(Context context, String showId, int alarmCode) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        Intent intent = new Intent(context, NotificationReceiver.class);
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M ? PendingIntent.FLAG_IMMUTABLE : 0;
        PendingIntent pi = PendingIntent.getBroadcast(context, alarmCode, intent,
                PendingIntent.FLAG_NO_CREATE | flags);

        if (pi != null) {
            am.cancel(pi);
            pi.cancel();
        }
    }

    public static void rescheduleAllAfterBoot(Context context) {
        BootReceiver.rescheduleAlarms(context);
    }

    private static long calculateNextReleaseTime(String releaseDay, String releaseTime) {
        try {
            String[] timeParts = releaseTime.split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);

            int dayOfWeek = getDayOfWeekValue(releaseDay);
            if (dayOfWeek == -1) return 0;

            Calendar now = Calendar.getInstance();
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.HOUR_OF_DAY, hour);
            cal.set(Calendar.MINUTE, minute);
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);

            int currentDayOfWeek = cal.get(Calendar.DAY_OF_WEEK);
            int daysUntil = (dayOfWeek - currentDayOfWeek + 7) % 7;

            boolean isDstTransition = false;
            TimeZone tz = TimeZone.getDefault();
            long currentMillis = now.getTimeInMillis();
            long targetMillis = cal.getTimeInMillis();

            if (tz.useDaylightTime()) {
                int dstOffset = tz.getOffset(targetMillis) - tz.getOffset(currentMillis);
                if (dstOffset != 0) {
                    targetMillis += dstOffset;
                    cal.setTimeInMillis(targetMillis);
                    isDstTransition = true;
                }
            }

            if (daysUntil == 0 && (cal.getTimeInMillis() < currentMillis || isDstTransition)) {
                if (!isDstTransition || cal.getTimeInMillis() < currentMillis) {
                    daysUntil = 7;
                }
            }

            cal.add(Calendar.DAY_OF_YEAR, daysUntil);

            long finalTrigger = cal.getTimeInMillis();
            if (finalTrigger <= currentMillis) {
                cal.add(Calendar.DAY_OF_YEAR, 7);
                finalTrigger = cal.getTimeInMillis();
            }

            return finalTrigger;
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
