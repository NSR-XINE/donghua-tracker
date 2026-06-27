/**
 * Donghua Tracker - Settings & Theme Configuration Module
 * Manages theme toggling (AMOLED black, custom accent classes),
 * reminder settings syncing, countdown formats, and full database wipes.
 */
(function(window) {
    const Settings = {};

    /**
     * Reads saved settings from database and applies them to body classes/elements.
     */
    Settings.applySettings = function() {
        // 1. AMOLED Black Theme
        const amoled = App.Storage.getSetting('theme_amoled', 'false') === 'true';
        const amoledCheck = document.getElementById('setting-amoled');
        if (amoledCheck) amoledCheck.checked = amoled;
        if (amoled) {
            document.body.classList.add('amoled');
        } else {
            document.body.classList.remove('amoled');
        }

        // 2. Accent Color Theme
        const accent = App.Storage.getSetting('theme_accent', 'cyan');
        const accentSelect = document.getElementById('setting-accent');
        if (accentSelect) accentSelect.value = accent;
        
        // Remove old accent classes
        document.body.classList.remove('theme-accent-purple', 'theme-accent-rose', 'theme-accent-emerald', 'theme-accent-gold');
        if (accent !== 'cyan') {
            document.body.classList.add('theme-accent-' + accent);
        }

        // 3. Reminder Offset Selection
        const offset = App.Storage.getSetting('settings_reminder_offset', '10');
        const reminderSelect = document.getElementById('setting-reminder');
        if (reminderSelect) reminderSelect.value = offset;

        // 4. Countdown Format Selection
        const cFormat = App.Storage.getSetting('settings_countdown_format', 'standard');
        const countdownSelect = document.getElementById('setting-countdown-format');
        if (countdownSelect) countdownSelect.value = cFormat;
    };

    /**
     * Initializes listeners for settings controls.
     */
    Settings.initialize = function() {
        // Bind AMOLED switch
        const amoledCheck = document.getElementById('setting-amoled');
        if (amoledCheck) {
            amoledCheck.addEventListener('change', () => {
                const checked = amoledCheck.checked;
                App.Storage.saveSetting('theme_amoled', checked ? 'true' : 'false');
                if (checked) {
                    document.body.classList.add('amoled');
                } else {
                    document.body.classList.remove('amoled');
                }
            });
        }

        // Bind Accent color dropdown
        const accentSelect = document.getElementById('setting-accent');
        if (accentSelect) {
            accentSelect.addEventListener('change', () => {
                const val = accentSelect.value;
                App.Storage.saveSetting('theme_accent', val);
                document.body.classList.remove('theme-accent-purple', 'theme-accent-rose', 'theme-accent-emerald', 'theme-accent-gold');
                if (val !== 'cyan') {
                    document.body.classList.add('theme-accent-' + val);
                }
            });
        }

        // Bind Reminder Offset selector
        const reminderSelect = document.getElementById('setting-reminder');
        if (reminderSelect) {
            reminderSelect.addEventListener('change', () => {
                const val = reminderSelect.value;
                App.Storage.saveSetting('settings_reminder_offset', val);
                // Reschedule all notification reminders
                App.Notifications.syncAll();
            });
        }

        // Bind Countdown format selector
        const countdownSelect = document.getElementById('setting-countdown-format');
        if (countdownSelect) {
            countdownSelect.addEventListener('change', () => {
                const val = countdownSelect.value;
                App.Storage.saveSetting('settings_countdown_format', val);
                App.Cards.renderHeroBanner();
                App.Cards.renderShowsGrid();
            });
        }

        // Bind Database Reset button
        const btnClearDb = document.getElementById('btn-clear-db');
        if (btnClearDb) {
            btnClearDb.addEventListener('click', () => {
                const confirmReset = confirm("WARNING: Are you sure you want to delete all watchlist shows, settings, and watch history? This action is permanent!");
                if (confirmReset) {
                    App.Storage.clearAll();
                    alert("Database reset completed successfully. Reloading...");
                    window.location.reload();
                }
            });
        }
    };

    window.App = window.App || {};
    window.App.Settings = Settings;
})(window);
