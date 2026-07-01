-keepclassmembers class com.mydonghua.app.MainActivity$* {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class com.mydonghua.app.WatchActivity { *; }
-keep class com.mydonghua.app.MainActivity { *; }
-keep class com.mydonghua.app.DatabaseHelper { *; }
-keep class com.mydonghua.app.AlarmScheduler { *; }
-keep class com.mydonghua.app.NotificationReceiver { *; }
-keep class com.mydonghua.app.BootReceiver { *; }
