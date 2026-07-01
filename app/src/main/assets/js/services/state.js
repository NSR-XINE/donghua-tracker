let shows = [];
const existingShowIds = new Set();
const filters = { search: '', status: 'all', scheduleDay: 'all', sortBy: 'countdown' };
Object.defineProperty(window, 'shows', { get() { return shows; }, set(v) { shows = v; } });
Object.defineProperty(window, 'existingShowIds', { get() { return existingShowIds; } });
Object.defineProperty(window, 'filters', { get() { return filters; } });

function loadState() {
    try {
        if (DB._available) {
            const dbData = DB.getAllShows();
            shows = JSON.parse(dbData) || [];
            const hasMigrated = DB.getSetting('sqlite_migrated', 'false');
            if (hasMigrated === 'false') {
                const legacyData = DB.getLocal(LS_KEYS.SHOWS);
                if (legacyData) {
                    const legacyShows = JSON.parse(legacyData);
                    if (Array.isArray(legacyShows) && legacyShows.length > 0) {
                        legacyShows.forEach(s => {
                            DB.insertShow(JSON.stringify(s));
                        });
                        shows = JSON.parse(DB.getAllShows()) || [];
                    }
                }
                DB.saveSetting('sqlite_migrated', 'true');
            }
        } else {
            const saved = DB.getLocal(LS_KEYS.SHOWS);
            shows = saved ? JSON.parse(saved) : [];
        }
        if (!Array.isArray(shows)) shows = [];
    } catch (e) {
        console.error("Database load error", e);
        shows = [];
    }
    existingShowIds.clear();
    shows.forEach(s => existingShowIds.add(s.id));
    applyStatusMigrations();
}

function applyStatusMigrations() {
    let changed = false;
    shows.forEach(show => {
        if (show.status === 'upcoming') {
            show.status = 'stopped';
            show.lastUpdated = Date.now();
            changed = true;
        }
        if (show.status === 'ongoing' && show.totalEp && show.totalEp > 0 && show.currentEp >= show.totalEp) {
            show.status = 'completed';
            show.lastUpdated = Date.now();
            changed = true;
        }
        if (!VALID_STATUSES.has(show.status)) {
            show.status = 'ongoing';
            show.lastUpdated = Date.now();
            changed = true;
        }
    });
    if (changed) {
        persistState();
    }
}

function persistState(fullRender = true) {
    let sqliteOk = true;
    if (DB._available) {
        shows.forEach(show => {
            const json = JSON.stringify(show);
            if (existingShowIds.has(show.id)) {
                const ok = DB.updateShow(json);
                if (!ok) sqliteOk = false;
            } else {
                const ok = DB.insertShow(json);
                if (ok) {
                    existingShowIds.add(show.id);
                } else {
                    sqliteOk = false;
                }
            }
        });
        DB.syncAllAlarms();
    }
    if (!sqliteOk || !DB._available) {
        DB.setLocal(LS_KEYS.SHOWS, JSON.stringify(shows));
    }
    if (fullRender) {
        updateStats();
        renderWeeklySchedule();
        renderHeroBanner();
        renderShowsGrid();
    }
}

function getShowById(id) {
    return shows.find(s => s.id === id || String(s.id) === String(id));
}

function getOngoingShows() {
    return shows.filter(s => s.status === 'ongoing');
}

function deleteShow(showId) {
    const idx = shows.findIndex(s => s.id === showId);
    if (idx === -1) return false;
    const show = shows[idx];
    shows.splice(idx, 1);
    existingShowIds.delete(showId);
    if (DB._available) {
        DB.deleteShow(showId);
        DB.cancelReminder(showId, show.alarmRequestCode || hashCode(showId));
    }
    persistState();
    return true;
}

function incrementEpisode(showId) {
    const show = getShowById(showId);
    if (!show) return null;
    show.currentEp++;
    show.lastUpdated = Date.now();
    if (DB._available) {
        DB.addWatchHistory(showId, show.currentEp);
    }
    if (show.totalEp && show.totalEp > 0 && show.currentEp >= show.totalEp) {
        show.status = 'completed';
    }
    persistState();
    return show;
}

function decrementEpisode(showId) {
    const show = getShowById(showId);
    if (!show || show.currentEp <= 0) return null;
    show.currentEp--;
    show.lastUpdated = Date.now();
    if (show.status === 'completed' && show.currentEp < (show.totalEp || Infinity)) {
        show.status = 'ongoing';
    }
    persistState();
    return show;
}

function toggleFavorite(showId) {
    const show = getShowById(showId);
    if (!show) return false;
    show.isFavorite = !show.isFavorite;
    show.lastUpdated = Date.now();
    persistState();
    return show.isFavorite;
}
