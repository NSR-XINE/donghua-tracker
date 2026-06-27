/**
 * Donghua Tracker - Countdown & Timer Scheduler Module
 * Manages clock ticks, countdown registrations, and background app pauses.
 */
(function(window) {
    const Countdown = {};

    let activeCountdowns = [];  // Caches card countdown nodes
    let bannerCountdown = null;  // Caches hero banner countdown node
    let tickerInterval = null;

    /**
     * Registers a card countdown element and its target date into the cache.
     */
    Countdown.registerCard = function(element, targetDate) {
        activeCountdowns.push({ element, targetDate });
    };

    /**
     * Registers the banner countdown element and its target date into the cache.
     */
    Countdown.registerBanner = function(element, targetDate) {
        bannerCountdown = { element, targetDate };
    };

    /**
     * Wipes the active DOM countdown registries.
     */
    Countdown.clearRegistry = function() {
        activeCountdowns = [];
        bannerCountdown = null;
    };

    /**
     * Standard clock tick handler. Updates DOM elements using cached references.
     */
    Countdown.tick = function() {
        // Wrap rendering updates inside requestAnimationFrame to prevent layout stutters
        window.requestAnimationFrame(() => {
            const now = new Date();

            // 1. Update Card timers
            for (let i = 0; i < activeCountdowns.length; i++) {
                const item = activeCountdowns[i];
                if (!item.element) continue;

                const time = App.Utils.calculateTimeRemaining(item.targetDate);
                if (time.elapsed) {
                    item.element.innerHTML = `
                        <div class="c-item" style="width: 100%">
                            <div class="c-val" style="font-size: 0.92rem; animation: pulse 1s infinite; color: var(--accent-cyan);">AIRING NOW / RELEASED</div>
                        </div>
                    `;
                } else {
                    item.element.innerHTML = `
                        <div class="c-item">
                            <div class="c-val">${String(time.days).padStart(2, '0')}</div>
                            <div class="c-lbl">D</div>
                        </div>
                        <div class="c-item">
                            <div class="c-val">${String(time.hours).padStart(2, '0')}</div>
                            <div class="c-lbl">H</div>
                        </div>
                        <div class="c-item">
                            <div class="c-val">${String(time.minutes).padStart(2, '0')}</div>
                            <div class="c-lbl">M</div>
                        </div>
                        <div class="c-item">
                            <div class="c-val">${String(time.seconds).padStart(2, '0')}</div>
                            <div class="c-lbl">S</div>
                        </div>
                    `;
                }
            }

            // 2. Update Banner countdown
            if (bannerCountdown && bannerCountdown.element) {
                const time = App.Utils.calculateTimeRemaining(bannerCountdown.targetDate);
                if (time.elapsed) {
                    bannerCountdown.element.innerHTML = `
                        <div class="countdown-box" style="border-color: var(--accent-cyan); min-width: 250px;">
                            <div class="num" style="font-size: 1.6rem; animation: pulse 1s infinite; color: var(--accent-cyan);">AIRING NOW</div>
                            <div class="label">Episode Released!</div>
                        </div>
                    `;
                } else {
                    bannerCountdown.element.innerHTML = `
                        <div class="countdown-box">
                            <div class="num">${String(time.days).padStart(2, '0')}</div>
                            <div class="label">Days</div>
                        </div>
                        <div class="countdown-box">
                            <div class="num">${String(time.hours).padStart(2, '0')}</div>
                            <div class="label">Hrs</div>
                        </div>
                        <div class="countdown-box">
                            <div class="num">${String(time.minutes).padStart(2, '0')}</div>
                            <div class="label">Min</div>
                        </div>
                        <div class="countdown-box">
                            <div class="num">${String(time.seconds).padStart(2, '0')}</div>
                            <div class="label">Sec</div>
                        </div>
                    `;
                }
            }

            // 3. Update top clock display
            const clockEl = document.getElementById('clock-display');
            if (clockEl) {
                clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + App.Utils.DAYS_ARRAY[now.getDay()] + ')';
            }
        });
    };

    /**
     * Pauses the clock updates.
     */
    Countdown.pause = function() {
        if (tickerInterval) {
            clearInterval(tickerInterval);
            tickerInterval = null;
        }
    };

    /**
     * Resumes the clock updates.
     */
    Countdown.resume = function() {
        if (!tickerInterval) {
            tickerInterval = setInterval(Countdown.tick, 1000);
            Countdown.tick(); // Immediate initial draw
        }
    };

    // Expose lifecycle hooks on window for MainActivity callbacks
    window.pauseTimers = Countdown.pause;
    window.resumeTimers = Countdown.resume;

    window.App = window.App || {};
    window.App.Countdown = Countdown;
})(window);
