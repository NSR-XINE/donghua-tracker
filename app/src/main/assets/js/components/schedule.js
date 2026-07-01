let scheduleDayFilter = 'all';
Object.defineProperty(window, 'scheduleDayFilter', { get() { return scheduleDayFilter; }, set(v) { scheduleDayFilter = v; } });

function renderWeeklySchedule() {
    const listEl = document.getElementById('schedule-list');
    if (!listEl) return;

    const ongoingShows = getOngoingShows();
    const allSchedulable = [...ongoingShows];
    const scheduledShows = allSchedulable.filter(s => {
        if (scheduleDayFilter === 'all') return true;
        return s.releaseDay === scheduleDayFilter;
    });

    if (scheduledShows.length === 0) {
        const msg = scheduleDayFilter === 'all' ? 'No shows scheduled' : `No shows scheduled for ${scheduleDayFilter}`;
        listEl.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem 0;">${msg}</div>`;
        return;
    }

    const todayName = getTodayName();
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysToRender = scheduleDayFilter === 'all' ? daysOrder : [scheduleDayFilter];

    let html = '';
    daysToRender.forEach(day => {
        const dayShows = scheduledShows.filter(s => s.releaseDay === day);
        if (dayShows.length === 0) return;
        dayShows.sort((a, b) => a.releaseTime.localeCompare(b.releaseTime));
        const isToday = day === todayName;

        html += `<div class="day-schedule-group">
            <div class="day-header">
                <span style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; color: ${isToday ? 'var(--accent-purple)' : 'var(--text-secondary)'}; display: flex; align-items: center; gap: 0.4rem;">
                    ${isToday ? '<i class="fa-solid fa-circle" style="font-size: 0.5rem; color: var(--accent-purple);"></i>' : ''}
                    ${day} ${isToday ? '(Today)' : ''}
                </span>
                <span style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 10px; color: var(--text-muted);">${dayShows.length} show${dayShows.length === 1 ? '' : 's'}</span>
            </div>
            <div class="day-schedule-list">`;

        html += dayShows.map(show => {
            return `<div class="schedule-item" onclick="openDetailsById('${String(show.id).replace(/'/g, "\\'")}')" style="cursor: pointer; ${isToday ? 'border-color: rgba(157, 78, 221, 0.3); background: rgba(157,78,221,0.02)' : ''}">
                <div class="schedule-item-name">
                    ${isToday ? '<i class="fa-solid fa-circle-play" style="color: var(--accent-purple); font-size: 0.75rem; animation: pulse 1.5s infinite"></i>' : ''}
                    <span>${show.title}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <span class="schedule-item-time"><i class="fa-regular fa-clock" style="color: var(--accent-purple); margin-right: 0.2rem;"></i> ${show.releaseTime}</span>
                </div>
            </div>`;
        }).join('');

        html += `</div></div>`;
    });

    listEl.innerHTML = html;
}
