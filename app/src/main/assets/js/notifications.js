/**
 * Donghua Tracker - Notifications & Reminders Module
 * Interfaces with the native AlarmManager bridge to request permissions,
 * schedule notifications based on offset options (10m, 30m, 1h, 24h), and cancel alarms.
 */
(function(window) {
    const Notifications = {};

    /**
     * Checks permission and prompts the native dialog if on Android 13+.
     */
    Notifications.ensurePermission = function() {
        if (window.AndroidApp && window.AndroidApp.checkNotificationPermission) {
            const hasPermission = window.AndroidApp.checkNotificationPermission();
            if (!hasPermission) {
                window.AndroidApp.requestNotificationPermission();
            }
            return hasPermission;
        }
        return true;
    };

    /**
     * Schedules a native notification reminder alarm for a show based on the settings offset.
     */
    Notifications.schedule = function(show) {
        if (!window.AndroidApp || !window.AndroidApp.scheduleReminder) return;
        if (show.status !== 'ongoing') return;

        // Cancel any existing reminder for this show first to avoid duplicates
        Notifications.cancel(show);

        const schedule = App.Utils.getNextReleaseDate(show.releaseDay, show.releaseTime);
        const targetMs = schedule.targetDate.getTime();
        
        // Get reminder offset (default: 10 minutes)
        const offsetMin = parseInt(App.Storage.getSetting('settings_reminder_offset', '10'));
        
        // Only schedule if the alarm time is in the future
        const triggerTimeMs = targetMs - (offsetMin * 60 * 1000);
        if (triggerTimeMs > Date.now()) {
            window.AndroidApp.scheduleReminder(show.id, show.title, targetMs, offsetMin);
        }
    };

    /**
     * Cancels scheduled alarms for a show.
     */
    Notifications.cancel = function(show) {
        if (!window.AndroidApp || !window.AndroidApp.cancelReminder) return;

        // Cancel for all supported offsets to be completely safe
        const offsets = [10, 30, 60, 1440];
        offsets.forEach(offset => {
            window.AndroidApp.cancelReminder(show.id, offset);
        });
    };

    /**
     * Re-schedules reminders for all tracked ongoing shows.
     */
    Notifications.syncAll = function() {
        if (!window.AndroidApp || !window.AndroidApp.scheduleReminder) return;
        
        // Make sure notification permissions are checked
        Notifications.ensurePermission();

        const shows = App.Storage.getShows();
        shows.forEach(show => {
            if (show.status === 'ongoing') {
                Notifications.schedule(show);
            } else {
                Notifications.cancel(show);
            }
        });
    };

    window.App = window.App || {};
    window.App.Notifications = Notifications;
})(window);
