# 东画 Donghua Tracker (Android App)

A sleek, high-aesthetic dark-themed native Android application designed for Chinese anime (Donghua) fans to track watched episodes, view release schedules, follow live countdown clocks, and receive native push notifications.

---

## 📂 Folder Structure

The project assets and native code are organized as follows:

```
donghua-tracker-repo/
├── app/
│   ├── build.gradle                 # Enabled minifyEnabled release ProGuard rules
│   ├── proguard-rules.pro           # Keeps JavaScriptInterface annotations
│   └── src/main/
│       ├── AndroidManifest.xml      # Added AlarmReceiver & POST_NOTIFICATIONS permissions
│       ├── java/com/donghua/tracker/
│       │   ├── MainActivity.java         # WebView settings, lifecycle preservation, JS Bridge
│       │   ├── DatabaseHelper.java       # SQLite database helper and CRUD queries
│       │   └── NotificationReceiver.java # Alarms receiver triggering status bar updates
│       └── assets/
│           ├── index.html           # Main markup structure and custom modal sheets
│           ├── styles.css           # Styling theme system (glassmorphic cards, AMOLED dark)
│           └── js/
│               ├── main.js          # Master coordinator managing load states
│               ├── utils.js         # Math helpers (date calculations, title hash gradients)
│               ├── storage.js       # SQLite bridge with browser LocalStorage fallback
│               ├── countdown.js     # requestAnimationFrame tickers using cached DOM nodes
│               ├── stats.js         # Stats updater compiling total watched hours
│               ├── notifications.js # JS notification bridge mapping reminder offsets
│               ├── scraper.js       # Asynchronous OpenGraph image scraper
│               ├── cards.js         # Lazy-loader appending show cards in chunks
│               ├── modal.js         # Add/Edit input validators
│               ├── search.js        # Debounced (300ms) query processors
│               ├── filter.js        # Status filter and multi-sort handlers
│               └── tracker.js       # Card click action delegators
└── README.md
```

---

## 🗄 SQLite Database Schema

LocalStorage is replaced by a native SQLite database (`donghua_tracker.db`) containing three core tables:

### 1. `shows`
Stores anime details:
* `id` (TEXT PRIMARY KEY) - Unique ID (`dh-[timestamp]`).
* `title` (TEXT NOT NULL) - English / Romaji title.
* `title_zh` (TEXT) - Chinese title.
* `status` (TEXT) - Current status (`ongoing`, `upcoming`, `completed`, `planned`, `onhold`, `dropped`).
* `release_day` (TEXT) - Weekday name (`Monday` - `Sunday`).
* `release_time` (TEXT) - Airing time (`HH:MM`).
* `current_ep` (INTEGER) - Episode number watched.
* `total_ep` (INTEGER) - Total episode count.
* `poster` (TEXT) - Image URL.
* `countdown_url` (TEXT) - AnimeCountdown scraper page link.
* `notes` (TEXT) - User synopsis and reviews.
* `is_favorite` (INTEGER) - Star indicator status (`0` or `1`).
* `rating` (INTEGER) - User score (`0` to `10`).
* `last_updated` (INTEGER) - Action timestamp.
* `date_added` (INTEGER) - Creation timestamp.

### 2. `settings`
Stores user options:
* `key` (TEXT PRIMARY KEY)
* `value` (TEXT)

### 3. `watch_history`
Tracks historical watches:
* `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
* `show_id` (TEXT NOT NULL)
* `episode_num` (INTEGER NOT NULL)
* `watched_timestamp` (INTEGER NOT NULL)

---

## ⏰ Notification Alarm flow

Native push notifications are coordinated through Android's `AlarmManager`:
1. When a show's episode progress is modified or added in the UI, JavaScript schedules a reminder via `App.Notifications.schedule(show)`.
2. This invokes `window.AndroidApp.scheduleReminder` which registers a pending broadcast intent with `AlarmManager`.
3. The alarm triggers at `Release Time - Selected Offset` (10m, 30m, 1h, 24h).
4. `NotificationReceiver.java` receives the broadcast intent, initializes the channel, and pushes a high-priority heads-up status bar notification.
5. Tapping the notification launches the app and passes the `show_id` extra, which automatically opens the show's detail modal.

---

## ⚡ Performance Optimizations

* **Lazy Batch Rendering**: The shows grid renders cards in batches of 30. An infinite scroll listener appends the next batch when the user approaches the page bottom. This enables smooth, stutter-free performance even with **10,000+ shows**.
* **Timer DOM Caching**: Instead of scanning the DOM via query selectors every second, timer nodes are registered in a memory array (`App.Countdown`) when cards are rendered, making clock tick updates extremely light.
* **Debounced Search**: Search query inputs are debounced by `300ms` to avoid reflowing the grid on every fast keystroke.
* **Reflow Minimization**: Incremental episode changes (plus/minus clicks) update only their specific card node's progress elements rather than triggering a complete grid repaint.

---

## 🔄 LocalStorage Migration Guide

On first startup of version `4.0+`, `js/storage.js` checks if legacy LocalStorage keys exist. If found:
1. Legacy watchlists are parsed and inserted into the SQLite database.
2. Saved themes and preferences are migrated into the SQLite `settings` table.
3. An indicator variable `localstorage_migrated = "true"` is saved.
4. Legacy LocalStorage keys are wiped out, ensuring clean memory storage.

---

## 🛠 Compilation and Development

To compile the Android app from source (requires Java JDK and Android SDK):

```bash
# Compile the debug APK
./gradlew assembleDebug

# Compile the release APK (shrunk and minified with R8/ProGuard rules)
./gradlew assembleRelease
```
The output APK will be generated at `app/build/outputs/apk/debug/app-debug.apk` or `release/app-release-unsigned.apk`.
