# 东画 Donghua Tracker (Android App)

A sleek, high-aesthetic dark-themed native Android application designed for Chinese anime (Donghua) fans to track watched episodes, view release schedules, and follow live countdown clocks.

This repository contains the source code for the native Android wrapper project.

---

## 🌟 Key Features

1. **Live Episode Release Countdowns**: Real-time ticker counting down to the exact day, hour, and minute of release.
2. **"Airing Now" Live Banner**: Dynamic status changing to a pulsing cyan badge when an episode is currently broadcasting (stays active for 90 minutes post-airing).
3. **Weekly Broadcast Schedule**: Group shows by their airing day (Monday–Sunday) to view your daily schedule.
4. **Auto-Generated Posters**: Dynamic gradient generator that prints the title initials and Chinese character watermark for a premium card aesthetic if no custom poster URL is provided.
5. **Quick Stats Counter**: Displays total watched episodes, total shows, active shows, and completed series.
6. **Local Browser Storage**: Automatically persists all user additions, edits, and deletions locally.
7. **Offline Capability**: Calculated countdowns operate 100% offline using your local system clock.

---

## 📂 Repository Structure

* **`app/`**: Android application module source code.
  * `src/main/java/com/donghua/tracker/MainActivity.java` - Android controller enabling DOM LocalStorage and managing navigation stack.
  * `src/main/assets/` - Bundled web assets (HTML, CSS, JS) that run inside the app wrapper.
* **`build.gradle`, `settings.gradle`, `gradlew`**: Gradle build configurations.

---

## 🛠 Compilation and Development

To compile the Android app from source (requires Java JDK and Android SDK):

```bash
# Compile the debug APK
./gradlew assembleDebug
```

The output APK will be generated at `app/build/outputs/apk/debug/app-debug.apk`.
