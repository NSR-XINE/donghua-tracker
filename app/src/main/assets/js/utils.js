/**
 * Donghua Tracker - Utilities Module
 * Encapsulates global constants, date arithmetic, and UI gradient helpers.
 */
(function(window) {
    const Utils = {};

    Utils.DAYS_ARRAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    Utils.GRADIENTS = [
        'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
        'linear-gradient(135deg, #b12fc3 0%, #6e0f7c 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
        'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',
        'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)',
        'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)'
    ];

    /**
     * Calculates the next release Date object based on day and local time.
     */
    Utils.getNextReleaseDate = function(releaseDay, releaseTimeStr) {
        const now = new Date();
        const targetDayIdx = Utils.DAYS_ARRAY.indexOf(releaseDay);
        if (targetDayIdx === -1) return { targetDate: now, airingNow: false };

        const [hours, minutes] = releaseTimeStr.split(':').map(Number);
        
        let target = new Date();
        target.setHours(hours, minutes, 0, 0);
        
        // Find next occurance of the day
        let currentDayIdx = now.getDay();
        let daysAhead = targetDayIdx - currentDayIdx;
        
        if (daysAhead < 0) {
            daysAhead += 7;
        } else if (daysAhead === 0) {
            // It is today, check time
            const compareTime = now.getHours() * 60 + now.getMinutes();
            const targetTime = hours * 60 + minutes;
            if (compareTime > targetTime + 45) { // 45 minute buffer before locking next week
                daysAhead = 7;
            }
        }
        
        target.setDate(target.getDate() + daysAhead);
        
        // Airing now window: within 45 minutes after release time on the release day
        const nowTime = now.getTime();
        const targetTimeVal = target.getTime();
        const isToday = now.getDay() === targetDayIdx;
        const compareTime = now.getHours() * 60 + now.getMinutes();
        const targetTime = hours * 60 + minutes;
        
        const airingNow = isToday && (compareTime >= targetTime) && (compareTime <= targetTime + 45);

        return { targetDate: target, airingNow };
    };

    /**
     * Translates target millisecond values into days/hours/minutes/seconds.
     */
    Utils.calculateTimeRemaining = function(targetDate) {
        const diffMs = targetDate.getTime() - new Date().getTime();
        if (diffMs <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true };
        }
        
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        
        return { days, hours, minutes, seconds, elapsed: false };
    };

    /**
     * Returns a stable gradient based on the show's title hash.
     */
    Utils.getPosterGradient = function(title) {
        let hash = 0;
        for (let i = 0; i < title.length; i++) {
            hash = title.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % Utils.GRADIENTS.length;
        return Utils.GRADIENTS[index];
    };

    /**
     * Debounces an input callback function.
     */
    Utils.debounce = function(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    window.App = window.App || {};
    window.App.Utils = Utils;
})(window);
