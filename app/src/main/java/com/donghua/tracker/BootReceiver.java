package com.donghua.tracker;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import org.json.JSONArray;
import org.json.JSONObject;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            // Run alarm rescheduling asynchronously to prevent ANRs on main thread
            new Thread(() -> {
                DatabaseHelper db = new DatabaseHelper(context);
                try {
                    String showsJsonStr = db.getAllShows();
                    JSONArray showsArray = new JSONArray(showsJsonStr);
                    for (int i = 0; i < showsArray.length(); i++) {
                        JSONObject show = showsArray.getJSONObject(i);
                        String status = show.optString("status", "ongoing");
                        if ("ongoing".equals(status)) {
                            int alarmCode = show.optInt("alarmRequestCode", Math.abs(show.getString("id").hashCode()));
                            AlarmScheduler.schedule(
                                    context,
                                    show.getString("id"),
                                    show.getString("title"),
                                    show.optString("releaseDay", "Sunday"),
                                    show.optString("releaseTime", "10:00"),
                                    alarmCode
                            );
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    db.close();
                }
            }).start();
        }
    }
}
