# 东画 Donghua Tracker

A sleek, high-aesthetic dark-themed application designed for Chinese anime (Donghua) fans to track watched episodes, view release schedules, and follow live countdown clocks.

This project is structured as a unified repository containing both the standalone Web interface and the native Android wrapper project.

---

## 🌟 Key Features

1. **Live Episode Release Countdowns**: Real-time ticker counting down to the exact day, hour, and minute of release.
2. **"Airing Now" Live Banner**: Dynamic status changing to a pulsing cyan badge when an episode is currently broadcasting (stays active for 90 minutes post-airing).
3. **Weekly Broadcast Schedule**: Group shows by their airing day (Monday–Sunday) to view your daily schedule.
4. **Auto-Generated Posters**: Dynamic gradient generator that prints the title initials and Chinese character watermark for a premium card aesthetic if no custom poster URL is provided.
5. **Quick Stats Counter**: Displays total watched episodes, total shows, active shows, and completed series.
6. **Local Browser Storage**: Automatically persists all user additions, edits, and deletions locally.

---

## 📂 Repository Structure

* **`web/`**: Standalone web application (HTML5, Vanilla CSS3, ES6+ Javascript). Can be hosted on GitHub Pages or run locally.
  * `index.html` - Core layout structure.
  * `styles.css` - Custom-crafted theme stylesheet.
  * `app.js` - Data stores, countdown formulas, and UI render scripts.
* **`android/`**: Native Android wrapper project.
  * `app/src/main/java/com/donghua/tracker/MainActivity.java` - Android controller enabling DOM LocalStorage and managing navigation stack.
  * `app/src/main/assets/` - Bundled compilation copy of the web assets.
* **`donghua-tracker.apk`**: Pre-compiled, installable Android package.

---

## 📲 How to Install the Android App

The repository includes a pre-compiled, lightweight APK (`donghua-tracker.apk`) in the root folder for direct installation.

1. Download **`donghua-tracker.apk`** to your phone.
2. Open your device's **Files** or **Downloads** app.
3. Tap on the APK.
4. If prompted to allow installing unknown apps, tap **Settings**, enable **Allow from this source**, and press back.
5. Tap **Install** and launch it!

---

## 🛠 Compilation and Development

### Running the Web Version Locally
To host the web version locally:
```bash
cd web
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000`.

### Compiling the Android APK
To compile the Android app from source (requires Java JDK and Android SDK):
```bash
cd android
./gradlew assembleDebug
```
The output APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`.
