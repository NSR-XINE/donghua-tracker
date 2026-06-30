package com.donghua.tracker;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import org.json.JSONArray;
import org.json.JSONObject;

public class DatabaseHelper extends SQLiteOpenHelper {

    private static final String DATABASE_NAME = "donghua_tracker.db";
    private static final int DATABASE_VERSION = 2;

    // Table names
    public static final String TABLE_SHOWS = "shows";
    public static final String TABLE_HISTORY = "watch_history";
    public static final String TABLE_SETTINGS = "settings";

    // Shows Columns
    public static final String COL_SHOW_ID = "id";
    public static final String COL_SHOW_TITLE = "title";
    public static final String COL_SHOW_TITLE_ZH = "title_zh";
    public static final String COL_SHOW_STATUS = "status";
    public static final String COL_SHOW_RELEASE_DAY = "release_day";
    public static final String COL_SHOW_RELEASE_TIME = "release_time";
    public static final String COL_SHOW_CURRENT_EP = "current_ep";
    public static final String COL_SHOW_TOTAL_EP = "total_ep";
    public static final String COL_SHOW_POSTER = "poster";
    public static final String COL_SHOW_WATCH_URL = "watch_url";
    public static final String COL_SHOW_COUNTDOWN_URL = "countdown_url";
    public static final String COL_SHOW_NOTES = "notes";
    public static final String COL_SHOW_SEASON_START = "season_start_date";
    public static final String COL_SHOW_SEASON_END = "season_end_date";
    public static final String COL_SHOW_IS_FAVORITE = "is_favorite";
    public static final String COL_SHOW_RATING = "rating";
    public static final String COL_SHOW_LAST_UPDATED = "last_updated";
    public static final String COL_SHOW_DATE_ADDED = "date_added";
    public static final String COL_SHOW_ALARM_CODE = "alarm_request_code"; // Bug 4 stable alarm identifier

    // Watch History Columns
    public static final String COL_HIST_ID = "id";
    public static final String COL_HIST_SHOW_ID = "show_id";
    public static final String COL_HIST_EPISODE = "episode_num";
    public static final String COL_HIST_TIMESTAMP = "watched_timestamp";

    // Settings Columns
    public static final String COL_SET_KEY = "key";
    public static final String COL_SET_VAL = "value";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create Shows Table
        String createShowsTable = "CREATE TABLE " + TABLE_SHOWS + " (" +
                COL_SHOW_ID + " TEXT PRIMARY KEY, " +
                COL_SHOW_TITLE + " TEXT NOT NULL, " +
                COL_SHOW_TITLE_ZH + " TEXT, " +
                COL_SHOW_STATUS + " TEXT, " +
                COL_SHOW_RELEASE_DAY + " TEXT, " +
                COL_SHOW_RELEASE_TIME + " TEXT, " +
                COL_SHOW_CURRENT_EP + " INTEGER DEFAULT 0, " +
                COL_SHOW_TOTAL_EP + " INTEGER DEFAULT 0, " +
                COL_SHOW_POSTER + " TEXT, " +
                COL_SHOW_WATCH_URL + " TEXT, " +
                COL_SHOW_COUNTDOWN_URL + " TEXT, " +
                COL_SHOW_NOTES + " TEXT, " +
                COL_SHOW_SEASON_START + " TEXT, " +
                COL_SHOW_SEASON_END + " TEXT, " +
                COL_SHOW_IS_FAVORITE + " INTEGER DEFAULT 0, " +
                COL_SHOW_RATING + " INTEGER DEFAULT 0, " +
                COL_SHOW_LAST_UPDATED + " INTEGER, " +
                COL_SHOW_DATE_ADDED + " INTEGER, " +
                COL_SHOW_ALARM_CODE + " INTEGER" +
                ")";
        db.execSQL(createShowsTable);

        // Create History Table
        String createHistoryTable = "CREATE TABLE " + TABLE_HISTORY + " (" +
                COL_HIST_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                COL_HIST_SHOW_ID + " TEXT NOT NULL, " +
                COL_HIST_EPISODE + " INTEGER, " +
                COL_HIST_TIMESTAMP + " INTEGER" +
                ")";
        db.execSQL(createHistoryTable);

        // Create Settings Table
        String createSettingsTable = "CREATE TABLE " + TABLE_SETTINGS + " (" +
                COL_SET_KEY + " TEXT PRIMARY KEY, " +
                COL_SET_VAL + " TEXT" +
                ")";
        db.execSQL(createSettingsTable);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        if (oldVersion < 2) {
            try {
                db.execSQL("ALTER TABLE " + TABLE_SHOWS + " ADD COLUMN " + COL_SHOW_SEASON_START + " TEXT");
            } catch (Exception e) { e.printStackTrace(); }
            try {
                db.execSQL("ALTER TABLE " + TABLE_SHOWS + " ADD COLUMN " + COL_SHOW_SEASON_END + " TEXT");
            } catch (Exception e) { e.printStackTrace(); }
        }
    }

    // ==========================================
    // SHOWS CRUD METHODS
    // ==========================================

    public synchronized boolean insertShow(JSONObject showJson) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        try {
            values.put(COL_SHOW_ID, showJson.getString("id"));
            values.put(COL_SHOW_TITLE, showJson.getString("title"));
            values.put(COL_SHOW_TITLE_ZH, showJson.optString("titleZh", ""));
            values.put(COL_SHOW_STATUS, showJson.optString("status", "ongoing"));
            values.put(COL_SHOW_RELEASE_DAY, showJson.optString("releaseDay", "Sunday"));
            values.put(COL_SHOW_RELEASE_TIME, showJson.optString("releaseTime", "10:00"));
            values.put(COL_SHOW_CURRENT_EP, showJson.optInt("currentEp", 0));
            values.put(COL_SHOW_TOTAL_EP, showJson.optInt("totalEp", 0));
            values.put(COL_SHOW_POSTER, showJson.optString("poster", ""));
            values.put(COL_SHOW_WATCH_URL, showJson.optString("watchUrl", ""));
            values.put(COL_SHOW_COUNTDOWN_URL, showJson.optString("countdownUrl", ""));
            values.put(COL_SHOW_NOTES, showJson.optString("notes", ""));
            values.put(COL_SHOW_SEASON_START, showJson.optString("seasonStartDate", ""));
            values.put(COL_SHOW_SEASON_END, showJson.optString("seasonEndDate", ""));
            values.put(COL_SHOW_IS_FAVORITE, showJson.optBoolean("isFavorite", false) ? 1 : 0);
            values.put(COL_SHOW_RATING, showJson.optInt("rating", 0));
            values.put(COL_SHOW_LAST_UPDATED, showJson.optLong("lastUpdated", System.currentTimeMillis()));
            values.put(COL_SHOW_DATE_ADDED, showJson.optLong("dateAdded", System.currentTimeMillis()));

            // Assign stable request code integer for Notification Alarm identifiers (Bug 4)
            int alarmCode = showJson.optInt("alarmRequestCode", -1);
            if (alarmCode == -1) {
                Cursor cursor = null;
                try {
                    cursor = db.rawQuery("SELECT MAX(" + COL_SHOW_ALARM_CODE + ") FROM " + TABLE_SHOWS, null);
                    if (cursor != null && cursor.moveToFirst()) {
                        alarmCode = cursor.getInt(0) + 1;
                    } else {
                        alarmCode = 1;
                    }
                } catch (Exception e) {
                    alarmCode = 1;
                } finally {
                    if (cursor != null) cursor.close();
                }
            }
            values.put(COL_SHOW_ALARM_CODE, alarmCode);

            long result = db.insertWithOnConflict(TABLE_SHOWS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
            return result != -1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public synchronized boolean updateShow(JSONObject showJson) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        try {
            String id = showJson.getString("id");
            values.put(COL_SHOW_TITLE, showJson.getString("title"));
            values.put(COL_SHOW_TITLE_ZH, showJson.optString("titleZh", ""));
            values.put(COL_SHOW_STATUS, showJson.optString("status", "ongoing"));
            values.put(COL_SHOW_RELEASE_DAY, showJson.optString("releaseDay", "Sunday"));
            values.put(COL_SHOW_RELEASE_TIME, showJson.optString("releaseTime", "10:00"));
            values.put(COL_SHOW_CURRENT_EP, showJson.optInt("currentEp", 0));
            values.put(COL_SHOW_TOTAL_EP, showJson.optInt("totalEp", 0));
            values.put(COL_SHOW_POSTER, showJson.optString("poster", ""));
            values.put(COL_SHOW_WATCH_URL, showJson.optString("watchUrl", ""));
            values.put(COL_SHOW_COUNTDOWN_URL, showJson.optString("countdownUrl", ""));
            values.put(COL_SHOW_NOTES, showJson.optString("notes", ""));
            values.put(COL_SHOW_SEASON_START, showJson.optString("seasonStartDate", ""));
            values.put(COL_SHOW_SEASON_END, showJson.optString("seasonEndDate", ""));
            values.put(COL_SHOW_IS_FAVORITE, showJson.optBoolean("isFavorite", false) ? 1 : 0);
            values.put(COL_SHOW_RATING, showJson.optInt("rating", 0));
            values.put(COL_SHOW_LAST_UPDATED, showJson.optLong("lastUpdated", System.currentTimeMillis()));
            
            if (showJson.has("alarmRequestCode")) {
                values.put(COL_SHOW_ALARM_CODE, showJson.getInt("alarmRequestCode"));
            }

            int result = db.update(TABLE_SHOWS, values, COL_SHOW_ID + " = ?", new String[]{id});
            return result > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public synchronized boolean deleteShow(String showId) {
        SQLiteDatabase db = this.getWritableDatabase();
        int result = db.delete(TABLE_SHOWS, COL_SHOW_ID + " = ?", new String[]{showId});
        db.delete(TABLE_HISTORY, COL_HIST_SHOW_ID + " = ?", new String[]{showId});
        return result > 0;
    }

    public synchronized String getAllShows() {
        JSONArray arr = new JSONArray();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = null;
        try {
            cursor = db.rawQuery("SELECT * FROM " + TABLE_SHOWS, null);
            if (cursor.moveToFirst()) {
                do {
                    JSONObject obj = new JSONObject();
                    obj.put("id", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_ID)));
                    obj.put("title", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_TITLE)));
                    obj.put("titleZh", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_TITLE_ZH)));
                    obj.put("status", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_STATUS)));
                    obj.put("releaseDay", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_RELEASE_DAY)));
                    obj.put("releaseTime", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_RELEASE_TIME)));
                    obj.put("currentEp", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_CURRENT_EP)));
                    obj.put("totalEp", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_TOTAL_EP)));
                    obj.put("poster", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_POSTER)));
                    obj.put("watchUrl", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_WATCH_URL)));
                    obj.put("countdownUrl", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_COUNTDOWN_URL)));
                    obj.put("notes", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_NOTES)));
                    obj.put("seasonStartDate", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_SEASON_START)));
                    obj.put("seasonEndDate", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_SEASON_END)));
                    obj.put("isFavorite", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_IS_FAVORITE)) == 1);
                    obj.put("rating", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_RATING)));
                    obj.put("lastUpdated", cursor.getLong(cursor.getColumnIndexOrThrow(COL_SHOW_LAST_UPDATED)));
                    obj.put("dateAdded", cursor.getLong(cursor.getColumnIndexOrThrow(COL_SHOW_DATE_ADDED)));
                    obj.put("alarmRequestCode", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_ALARM_CODE)));
                    arr.put(obj);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }
        return arr.toString();
    }

    // ==========================================
    // HISTORY CRUD METHODS
    // ==========================================

    public synchronized void addWatchHistory(String showId, int episodeNum) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_HIST_SHOW_ID, showId);
        values.put(COL_HIST_EPISODE, episodeNum);
        values.put(COL_HIST_TIMESTAMP, System.currentTimeMillis());
        db.insert(TABLE_HISTORY, null, values);

        // Prune logs keeping only the 200 most recent items to avoid unbounded growth (Bug 6)
        try {
            db.execSQL("DELETE FROM " + TABLE_HISTORY + " WHERE " + COL_HIST_SHOW_ID + " = ? AND " +
                    COL_HIST_ID + " NOT IN (SELECT " + COL_HIST_ID + " FROM " + TABLE_HISTORY +
                    " WHERE " + COL_HIST_SHOW_ID + " = ? ORDER BY " + COL_HIST_TIMESTAMP + " DESC LIMIT 200)",
                    new Object[]{showId, showId});
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public synchronized String getWatchHistory() {
        JSONArray arr = new JSONArray();
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = null;
        try {
            cursor = db.rawQuery("SELECT h.*, s.title FROM " + TABLE_HISTORY + " h " +
                    "LEFT JOIN " + TABLE_SHOWS + " s ON h.show_id = s.id ORDER BY h.watched_timestamp DESC", null);
            if (cursor.moveToFirst()) {
                do {
                    JSONObject obj = new JSONObject();
                    obj.put("id", cursor.getInt(cursor.getColumnIndexOrThrow(COL_HIST_ID)));
                    obj.put("showId", cursor.getString(cursor.getColumnIndexOrThrow(COL_HIST_SHOW_ID)));
                    obj.put("title", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_TITLE)));
                    obj.put("episodeNum", cursor.getInt(cursor.getColumnIndexOrThrow(COL_HIST_EPISODE)));
                    obj.put("timestamp", cursor.getLong(cursor.getColumnIndexOrThrow(COL_HIST_TIMESTAMP)));
                    arr.put(obj);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }
        return arr.toString();
    }

    // ==========================================
    // SETTINGS CRUD METHODS
    // ==========================================

    public synchronized void saveSetting(String key, String value) {
        SQLiteDatabase db = this.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(COL_SET_KEY, key);
        values.put(COL_SET_VAL, value);
        db.insertWithOnConflict(TABLE_SETTINGS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
    }

    public synchronized String getSetting(String key, String defaultVal) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = null;
        String val = defaultVal;
        try {
            cursor = db.query(TABLE_SETTINGS, new String[]{COL_SET_VAL}, COL_SET_KEY + " = ?", new String[]{key}, null, null, null);
            if (cursor != null && cursor.moveToFirst()) {
                val = cursor.getString(0);
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }
        return val;
    }
}
