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
    private static final int DATABASE_VERSION = 1;

    // Table names
    public static final String TABLE_SHOWS = "shows";
    public static final String TABLE_SETTINGS = "settings";
    public static final String TABLE_HISTORY = "watch_history";

    // Show Columns
    public static final String COL_SHOW_ID = "id";
    public static final String COL_SHOW_TITLE = "title";
    public static final String COL_SHOW_TITLE_ZH = "title_zh";
    public static final String COL_SHOW_STATUS = "status";
    public static final String COL_SHOW_RELEASE_DAY = "release_day";
    public static final String COL_SHOW_RELEASE_TIME = "release_time";
    public static final String COL_SHOW_CURRENT_EP = "current_ep";
    public static final String COL_SHOW_TOTAL_EP = "total_ep";
    public static final String COL_SHOW_POSTER = "poster";
    public static final String COL_SHOW_COUNTDOWN_URL = "countdown_url";
    public static final String COL_SHOW_NOTES = "notes";
    public static final String COL_SHOW_FAVORITE = "is_favorite";
    public static final String COL_SHOW_RATING = "rating";
    public static final String COL_SHOW_LAST_UPDATED = "last_updated";
    public static final String COL_SHOW_DATE_ADDED = "date_added";

    // Settings Columns
    public static final String COL_SETTING_KEY = "key";
    public static final String COL_SETTING_VAL = "value";

    // History Columns
    public static final String COL_HIST_ID = "id";
    public static final String COL_HIST_SHOW_ID = "show_id";
    public static final String COL_HIST_EP = "episode_num";
    public static final String COL_HIST_TIME = "watched_timestamp";

    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create Shows Table
        String createShowsTable = "CREATE TABLE " + TABLE_SHOWS + " ("
                + COL_SHOW_ID + " TEXT PRIMARY KEY, "
                + COL_SHOW_TITLE + " TEXT NOT NULL, "
                + COL_SHOW_TITLE_ZH + " TEXT, "
                + COL_SHOW_STATUS + " TEXT, "
                + COL_SHOW_RELEASE_DAY + " TEXT, "
                + COL_SHOW_RELEASE_TIME + " TEXT, "
                + COL_SHOW_CURRENT_EP + " INTEGER DEFAULT 0, "
                + COL_SHOW_TOTAL_EP + " INTEGER DEFAULT 0, "
                + COL_SHOW_POSTER + " TEXT, "
                + COL_SHOW_COUNTDOWN_URL + " TEXT, "
                + COL_SHOW_NOTES + " TEXT, "
                + COL_SHOW_FAVORITE + " INTEGER DEFAULT 0, "
                + COL_SHOW_RATING + " INTEGER DEFAULT 0, "
                + COL_SHOW_LAST_UPDATED + " INTEGER, "
                + COL_SHOW_DATE_ADDED + " INTEGER"
                + ");";
        db.execSQL(createShowsTable);

        // Create Settings Table
        String createSettingsTable = "CREATE TABLE " + TABLE_SETTINGS + " ("
                + COL_SETTING_KEY + " TEXT PRIMARY KEY, "
                + COL_SETTING_VAL + " TEXT"
                + ");";
        db.execSQL(createSettingsTable);

        // Create History Table
        String createHistoryTable = "CREATE TABLE " + TABLE_HISTORY + " ("
                + COL_HIST_ID + " INTEGER PRIMARY KEY AUTOINCREMENT, "
                + COL_HIST_SHOW_ID + " TEXT NOT NULL, "
                + COL_HIST_EP + " INTEGER NOT NULL, "
                + COL_HIST_TIME + " INTEGER NOT NULL"
                + ");";
        db.execSQL(createHistoryTable);
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // Upgrade migrations if needed
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SHOWS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_SETTINGS);
        db.execSQL("DROP TABLE IF EXISTS " + TABLE_HISTORY);
        onCreate(db);
    }

    // CRUD Methods
    public synchronized String getAllShowsJson() {
        SQLiteDatabase db = this.getReadableDatabase();
        JSONArray jsonArray = new JSONArray();
        Cursor cursor = null;
        try {
            cursor = db.query(TABLE_SHOWS, null, null, null, null, null, COL_SHOW_LAST_UPDATED + " DESC");
            if (cursor != null && cursor.moveToFirst()) {
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
                    obj.put("countdownUrl", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_COUNTDOWN_URL)));
                    obj.put("notes", cursor.getString(cursor.getColumnIndexOrThrow(COL_SHOW_NOTES)));
                    obj.put("isFavorite", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_FAVORITE)) == 1);
                    obj.put("rating", cursor.getInt(cursor.getColumnIndexOrThrow(COL_SHOW_RATING)));
                    obj.put("lastUpdated", cursor.getLong(cursor.getColumnIndexOrThrow(COL_SHOW_LAST_UPDATED)));
                    obj.put("dateAdded", cursor.getLong(cursor.getColumnIndexOrThrow(COL_SHOW_DATE_ADDED)));
                    jsonArray.put(obj);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }
        return jsonArray.toString();
    }

    public synchronized boolean insertShow(JSONObject show) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            ContentValues values = new ContentValues();
            String id = show.getString("id");
            values.put(COL_SHOW_ID, id);
            values.put(COL_SHOW_TITLE, show.getString("title"));
            values.put(COL_SHOW_TITLE_ZH, show.optString("titleZh", ""));
            values.put(COL_SHOW_STATUS, show.optString("status", "ongoing"));
            values.put(COL_SHOW_RELEASE_DAY, show.optString("releaseDay", "Monday"));
            values.put(COL_SHOW_RELEASE_TIME, show.optString("releaseTime", "10:00"));
            values.put(COL_SHOW_CURRENT_EP, show.optInt("currentEp", 0));
            values.put(COL_SHOW_TOTAL_EP, show.optInt("totalEp", 0));
            values.put(COL_SHOW_POSTER, show.optString("poster", ""));
            values.put(COL_SHOW_COUNTDOWN_URL, show.optString("countdownUrl", ""));
            values.put(COL_SHOW_NOTES, show.optString("notes", ""));
            values.put(COL_SHOW_FAVORITE, show.optBoolean("isFavorite", false) ? 1 : 0);
            values.put(COL_SHOW_RATING, show.optInt("rating", 0));
            
            long now = System.currentTimeMillis();
            values.put(COL_SHOW_LAST_UPDATED, show.optLong("lastUpdated", now));
            values.put(COL_SHOW_DATE_ADDED, show.optLong("dateAdded", now));

            long result = db.insertWithOnConflict(TABLE_SHOWS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
            return result != -1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public synchronized boolean updateShow(JSONObject show) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            String id = show.getString("id");
            ContentValues values = new ContentValues();
            values.put(COL_SHOW_TITLE, show.getString("title"));
            values.put(COL_SHOW_TITLE_ZH, show.optString("titleZh", ""));
            values.put(COL_SHOW_STATUS, show.optString("status", "ongoing"));
            values.put(COL_SHOW_RELEASE_DAY, show.optString("releaseDay", "Monday"));
            values.put(COL_SHOW_RELEASE_TIME, show.optString("releaseTime", "10:00"));
            values.put(COL_SHOW_CURRENT_EP, show.optInt("currentEp", 0));
            values.put(COL_SHOW_TOTAL_EP, show.optInt("totalEp", 0));
            values.put(COL_SHOW_POSTER, show.optString("poster", ""));
            values.put(COL_SHOW_COUNTDOWN_URL, show.optString("countdownUrl", ""));
            values.put(COL_SHOW_NOTES, show.optString("notes", ""));
            values.put(COL_SHOW_FAVORITE, show.optBoolean("isFavorite", false) ? 1 : 0);
            values.put(COL_SHOW_RATING, show.optInt("rating", 0));
            values.put(COL_SHOW_LAST_UPDATED, show.optLong("lastUpdated", System.currentTimeMillis()));

            int rows = db.update(TABLE_SHOWS, values, COL_SHOW_ID + "=?", new String[]{id});
            return rows > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public synchronized boolean deleteShow(String id) {
        SQLiteDatabase db = this.getWritableDatabase();
        int rows = db.delete(TABLE_SHOWS, COL_SHOW_ID + "=?", new String[]{id});
        db.delete(TABLE_HISTORY, COL_HIST_SHOW_ID + "=?", new String[]{id});
        return rows > 0;
    }

    // Settings operations
    public synchronized String getSetting(String key, String defaultVal) {
        SQLiteDatabase db = this.getReadableDatabase();
        Cursor cursor = null;
        String val = defaultVal;
        try {
            cursor = db.query(TABLE_SETTINGS, new String[]{COL_SETTING_VAL}, COL_SETTING_KEY + "=?", new String[]{key}, null, null, null);
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

    public synchronized boolean saveSetting(String key, String value) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            ContentValues values = new ContentValues();
            values.put(COL_SETTING_KEY, key);
            values.put(COL_SETTING_VAL, value);
            long result = db.insertWithOnConflict(TABLE_SETTINGS, null, values, SQLiteDatabase.CONFLICT_REPLACE);
            return result != -1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // History operations
    public synchronized void addHistoryRecord(String showId, int episodeNum) {
        SQLiteDatabase db = this.getWritableDatabase();
        try {
            ContentValues values = new ContentValues();
            values.put(COL_HIST_SHOW_ID, showId);
            values.put(COL_HIST_EP, episodeNum);
            values.put(COL_HIST_TIME, System.currentTimeMillis());
            db.insert(TABLE_HISTORY, null, values);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public synchronized String getHistoryJson() {
        SQLiteDatabase db = this.getReadableDatabase();
        JSONArray jsonArray = new JSONArray();
        Cursor cursor = null;
        try {
            cursor = db.rawQuery("SELECT h.*, s.title FROM " + TABLE_HISTORY + " h JOIN " + TABLE_SHOWS + " s ON h.show_id = s.id ORDER BY h.watched_timestamp DESC", null);
            if (cursor != null && cursor.moveToFirst()) {
                do {
                    JSONObject obj = new JSONObject();
                    obj.put("id", cursor.getInt(cursor.getColumnIndexOrThrow(COL_HIST_ID)));
                    obj.put("showId", cursor.getString(cursor.getColumnIndexOrThrow(COL_HIST_SHOW_ID)));
                    obj.put("episodeNum", cursor.getInt(cursor.getColumnIndexOrThrow(COL_HIST_EP)));
                    obj.put("timestamp", cursor.getLong(cursor.getColumnIndexOrThrow(COL_HIST_TIME)));
                    obj.put("title", cursor.getString(cursor.getColumnIndexOrThrow("title")));
                    jsonArray.put(obj);
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (cursor != null) cursor.close();
        }
        return jsonArray.toString();
    }

    public synchronized void clearDatabase() {
        SQLiteDatabase db = this.getWritableDatabase();
        db.delete(TABLE_SHOWS, null, null);
        db.delete(TABLE_SETTINGS, null, null);
        db.delete(TABLE_HISTORY, null, null);
    }
}
