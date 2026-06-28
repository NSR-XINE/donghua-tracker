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
                try {
                    DatabaseHelper db = new DatabaseHelper(context);
                    String showsJsonStr = db.getAllShows();
                    JSONArray showsArray = new JSONArray(showsJsonStr);
                    for (int i = 0; i < showsArray.length(); i++) {
                        JSONObject show = showsArray.getJSONObject(i);
                        String status = show.optString("status", "ongoing");
                        if ("ongoing".equals(status)) {
                            AlarmScheduler.schedule(
                                    context,
                                    show.getString("id"),
                                    show.getString("title"),
                                    show.optString("releaseDay", "Sunday"),
                                    show.optString("releaseTime", "10:00")
                            );
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }).start();
        }
    }
}
