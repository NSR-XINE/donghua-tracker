-keepclassmembers class com.donghua.tracker.MainActivity$* {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.donghua.tracker.WatchActivity { *; }
-keep class com.donghua.tracker.MainActivity { *; }
-keep class com.donghua.tracker.DatabaseHelper { *; }
-keep class com.donghua.tracker.AlarmScheduler { *; }
-keep class com.donghua.tracker.NotificationReceiver { *; }
-keep class com.donghua.tracker.BootReceiver { *; }
