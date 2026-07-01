let timerInterval = null;

function pauseTimers() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function resumeTimers() {
    if (!timerInterval) { timerInterval = setInterval(updateTimers, 1000); }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseTimers();
    else resumeTimers();
});

function updateTimers() {
    const clockEl = document.getElementById('clock-display');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + getTodayName() + ')';
    }

    const heroCD = document.getElementById('hero-countdown-box');
    if (heroCD) {
        const heroBanner = document.getElementById('next-up-banner');
        const heroShowId = heroBanner ? heroBanner.dataset.id : null;
        if (heroShowId) {
            const show = getShowById(heroShowId);
            if (show && show.status === 'ongoing') {
                const sched = getNextReleaseDate(show.releaseDay, show.releaseTime);
                if (!sched.airingNow) {
                    const time = calculateTimeRemaining(sched.targetDate);
                    if (time.elapsed) { renderHeroBanner(); return; }
                    const nums = heroCD.querySelectorAll('.num');
                    if (nums.length >= 4) {
                        nums[0].innerText = String(time.days).padStart(2, '0');
                        nums[1].innerText = String(time.hours).padStart(2, '0');
                        nums[2].innerText = String(time.minutes).padStart(2, '0');
                        nums[3].innerText = String(time.seconds).padStart(2, '0');
                    }
                }
            }
        }
    }

    shows.forEach(show => {
        const cardEl = document.querySelector(`.show-card[data-id="${show.id}"]`);
        if (!cardEl) return;
        const cdEl = cardEl.querySelector('.card-countdown');
        if (!cdEl) return;

        if (show.status === 'ongoing') {
            const schedule = getNextReleaseDate(show.releaseDay, show.releaseTime);
            if (schedule.airingNow) {
                const isAlreadyAiring = cdEl.querySelector('.c-val') && cdEl.querySelector('.c-val').innerText === "AIRING NOW / RELEASED";
                if (!isAlreadyAiring) { renderShowsGrid(); renderHeroBanner(); }
            } else {
                const time = calculateTimeRemaining(schedule.targetDate);
                if (time.elapsed) { renderShowsGrid(); renderHeroBanner(); }
                else {
                    const valEls = cdEl.querySelectorAll('.c-val');
                    if (valEls.length === 4) {
                        valEls[0].innerText = String(time.days).padStart(2, '0');
                        valEls[1].innerText = String(time.hours).padStart(2, '0');
                        valEls[2].innerText = String(time.minutes).padStart(2, '0');
                        valEls[3].innerText = String(time.seconds).padStart(2, '0');
                    } else {
                        cdEl.innerHTML = `<div class="c-item"><div class="c-val">${String(time.days).padStart(2, '0')}</div><div class="c-lbl">D</div></div><div class="c-item"><div class="c-val">${String(time.hours).padStart(2, '0')}</div><div class="c-lbl">H</div></div><div class="c-item"><div class="c-val">${String(time.minutes).padStart(2, '0')}</div><div class="c-lbl">M</div></div><div class="c-item"><div class="c-val">${String(time.seconds).padStart(2, '0')}</div><div class="c-lbl">S</div></div>`;
                    }
                }
            }
        }
    });
}
