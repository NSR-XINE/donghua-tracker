# 东画 My Donghua (Android App)

A sleek, high-aesthetic dark-themed native Android application designed for Chinese anime (Donghua) fans to track watched episodes, view release schedules, follow live countdown clocks, and receive native push notifications.

---

## Folder Structure

```
donghua-tracker-repo/
├── app/
│   ├── build.gradle
│   ├── proguard-rules.pro
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/mydonghua/app/
│       │   ├── MainActivity.java         # WebView settings, lifecycle, JS Bridge, back gesture
│       │   ├── WatchActivity.java        # YouTube-style player with fullscreen
│       │   ├── AlarmScheduler.java       # Alarm scheduling and permission handling
│       │   ├── BootReceiver.java         # Re-schedules alarms after device reboot
│       │   ├── DatabaseHelper.java       # SQLite database CRUD operations
│       │   ├── NotificationReceiver.java # Push notification channel and handler
│       └── assets/
│           ├── index.html           # Main markup with custom modal sheets
│           ├── styles.css           # Full dark theme (glassmorphic, AMOLED, light)
│           └── app.js               # All application logic (SPA)
└── README.md
```

---

## Features

- **Track shows** by status: Airing, Completed, Hiatus
- **Hero countdown banner** for the next releasing show
- **Weekly schedule calendar** with day tabs
- **Live countdown clocks** on every show card
- **Native push notifications** via Android AlarmManager
- **Poster auto-fetch** from DonghuaStream, AnimeCountdown, and Jikan API
- **Export/Import** watchlist as JSON backup
- **Multiple themes**: Dark, AMOLED, Light
- **Bottom navigation** with Home, Airing, Complete, Stopped tabs
- **Swipe-back gesture** to close modals (settings, add/edit)
- **SQLite storage** with LocalStorage fallback

---

## SQLite Database Schema

LocalStorage is replaced by a native SQLite database (`mydonghua.db`) containing three core tables:

### 1. `shows`
* `id` (TEXT PRIMARY KEY)
* `title` (TEXT NOT NULL)
* `title_zh` (TEXT)
* `status` (TEXT) — `ongoing`, `completed`, `stopped`
* `release_day` (TEXT) — `Monday` – `Sunday`
* `release_time` (TEXT) — `HH:MM`
* `current_ep` (INTEGER)
* `total_ep` (INTEGER)
* `poster` (TEXT)
* `watch_url` (TEXT)
* `countdown_url` (TEXT)
* `notes` (TEXT)
* `last_updated` (INTEGER)

### 2. `settings`
* `key` (TEXT PRIMARY KEY)
* `value` (TEXT)

### 3. `watch_history`
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `show_id` (TEXT NOT NULL)
* `episode_num` (INTEGER NOT NULL)
* `watched_timestamp` (INTEGER NOT NULL)

---

## Notification Alarm Flow

1. Episode progress changes trigger alarm scheduling via JS.
2. Calls `window.AndroidApp.scheduleReminder` → registers `AlarmManager` intent.
3. Alarm fires at `Release Time - Selected Offset` (10m, 30m, 1h, 24h).
4. `NotificationReceiver.java` pushes a high-priority heads-up notification.
5. Tapping notification opens the app and auto-opens the show's detail modal.

---

## Compilation

```bash
./gradlew assembleDebug
./gradlew assembleRelease
```

Output at `app/build/outputs/apk/debug/app-debug.apk` or `release/app-release-unsigned.apk`.
