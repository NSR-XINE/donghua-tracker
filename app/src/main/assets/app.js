/* ==========================================================================
   STATE MANAGEMENT & DEFAULT DATA
   ========================================================================== */

/// Default mock data to populate local storage on first load (empty by default)
const DEFAULT_DONGHUA = [];

// Load shows from SQLite or fallback to localStorage
let shows = [];
try {
    if (window.AndroidApp && window.AndroidApp.dbGetAllShows) {
        const dbData = window.AndroidApp.dbGetAllShows();
        shows = JSON.parse(dbData) || [];
        
        // Auto-migration from localStorage on first launch of SQLite version
        const hasMigrated = window.AndroidApp.dbGetSetting('sqlite_migrated', 'false');
        if (hasMigrated === 'false') {
            const legacyData = localStorage.getItem('donghua_shows');
            if (legacyData) {
                const legacyShows = JSON.parse(legacyData);
                if (Array.isArray(legacyShows) && legacyShows.length > 0) {
                    legacyShows.forEach(s => {
                        window.AndroidApp.dbInsertShow(JSON.stringify(s));
                    });
                    // Reload merged shows from database
                    shows = JSON.parse(window.AndroidApp.dbGetAllShows()) || [];
                }
            }
            window.AndroidApp.dbSaveSetting('sqlite_migrated', 'true');
        }
    } else {
        const saved = localStorage.getItem('donghua_shows');
        shows = saved ? JSON.parse(saved) : [];
    }
    if (!Array.isArray(shows)) shows = [];
} catch (e) {
    console.error("Database load error", e);
    shows = [];
}

// Active filters state
let filters = {
    search: '',
    status: 'all',
    scheduleDay: 'all',
    sortBy: 'countdown'
};

const DAYS_MAP = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6
};

const DAYS_ARRAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Poster Gradients List for custom aesthetic placeholders
const GRADIENTS = [
    "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    "linear-gradient(135deg, #1f4037, #99f2c8)",
    "linear-gradient(135deg, #4b6cb7, #182848)",
    "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
    "linear-gradient(135deg, #00c6ff, #0072ff)",
    "linear-gradient(135deg, #5c258d, #4389a2)",
    "linear-gradient(135deg, #11998e, #38ef7d)",
    "linear-gradient(135deg, #ff0844, #ffb199)",
    "linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)",
    "linear-gradient(135deg, #1e3c72, #2a5298)"
];

/* ==========================================================================
   DATE & COUNTDOWN CALCULATORS
   ========================================================================== */

/**
 * Calculates the next release Date object based on day and time.
 * @param {string} releaseDay - Day of the week (e.g. "Saturday")
 * @param {string} releaseTime - Time of day (e.g. "10:00")
 * @returns {{targetDate: Date, airingNow: boolean}}
 */
function getNextReleaseDate(releaseDay, releaseTime) {
    const now = new Date();
    const [hours, minutes] = releaseTime.split(':').map(Number);
    const targetDayNum = DAYS_MAP[releaseDay];
    const currentDayNum = now.getDay();
    
    // Calculate days until release (0 to 6)
    let daysUntil = (targetDayNum - currentDayNum + 7) % 7;
    
    let targetDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntil
    );
    targetDate.setHours(hours, minutes, 0, 0);

    // If target time is today and has already passed
    if (daysUntil === 0 && now > targetDate) {
        const diffMs = now - targetDate;
        // Keep "Airing Now / Just Released" state active for 90 minutes
        const airDurationMs = 90 * 60 * 1000;
        
        if (diffMs < airDurationMs) {
            return { targetDate, airingNow: true };
        } else {
            // Push to next week
            targetDate.setDate(targetDate.getDate() + 7);
        }
    }
    
    return { targetDate, airingNow: false };
}

/**
 * Formats a date difference into a human readable countdown object.
 * @param {Date} targetDate 
 * @returns {{days: number, hours: number, minutes: number, seconds: number, elapsed: boolean}}
 */
function calculateTimeRemaining(targetDate) {
    const now = new Date();
    const diffMs = targetDate - now;
    
    if (diffMs <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: true };
    }
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, elapsed: false };
}

/**
 * Returns a stable gradient based on the show's title string.
 */
function getPosterGradient(title) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % GRADIENTS.length;
    return GRADIENTS[index];
}

/* ==========================================================================
   UI RENDERING FUNCTIONS
   ========================================================================== */

/**
 * Updates application header statistic badges.
 */
function updateStats() {
    const total = shows.length;
    const ongoing = shows.filter(s => s.status === 'ongoing').length;
    const completed = shows.filter(s => s.status === 'completed').length;
    const totalEpisodes = shows.reduce((sum, s) => sum + (s.currentEp || 0), 0);
    
    document.getElementById('stat-total').innerText = total;
    document.getElementById('stat-watching').innerText = ongoing;
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-episodes').innerText = totalEpisodes;
}

/**
 * Finds the upcoming show that releases the soonest and displays the hero banner.
 */
function renderHeroBanner() {
    const ongoingShows = shows.filter(s => s.status === 'ongoing');
    const bannerEl = document.getElementById('next-up-banner');
    
    // Check mobile viewport and active tab
    const isMobile = window.innerWidth <= 1024;
    if (isMobile && activeTab !== 'home') {
        if (bannerEl) bannerEl.style.setProperty('display', 'none', 'important');
        return;
    }
    
    if (ongoingShows.length === 0) {
        if (bannerEl) bannerEl.style.display = 'none';
        return;
    }
    
    // Sort ongoing shows by soonest release time
    const computedShows = ongoingShows.map(show => {
        const schedule = getNextReleaseDate(show.releaseDay, show.releaseTime);
        return {
            show,
            targetDate: schedule.targetDate,
            airingNow: schedule.airingNow,
            timeDiff: schedule.targetDate - new Date()
        };
    });
    
    // Prioritize shows that are airing right now, otherwise sort by soonest release
    computedShows.sort((a, b) => {
        if (a.airingNow && !b.airingNow) return -1;
        if (!a.airingNow && b.airingNow) return 1;
        return a.timeDiff - b.timeDiff;
    });
    
    const nextUp = computedShows[0];
    const show = nextUp.show;
    const isAiring = nextUp.airingNow;
    
    bannerEl.style.display = 'flex';
    
    let countdownHtml = '';
    if (isAiring) {
        countdownHtml = `
            <div class="banner-countdown">
                <div class="countdown-box" style="border-color: var(--accent-cyan); min-width: 250px;">
                    <div class="num" style="font-size: 1.6rem; animation: pulse 1s infinite;">AIRING NOW</div>
                    <div class="label">Episode ${show.currentEp + 1} Released!</div>
                </div>
            </div>
        `;
    } else {
        const time = calculateTimeRemaining(nextUp.targetDate);
        countdownHtml = `
            <div class="banner-countdown">
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
            </div>
        `;
    }
    
    const bannerGradient = getPosterGradient(show.title);
    if (show.poster) {
        bannerEl.style.background = `linear-gradient(135deg, rgba(10, 12, 20, 0.75), rgba(5, 6, 10, 0.95)), url(${show.poster}) center/cover no-repeat`;
    } else {
        bannerEl.style.background = `linear-gradient(135deg, rgba(20, 26, 38, 0.9), rgba(10, 12, 20, 0.98)), ${bannerGradient}`;
    }
    
    bannerEl.setAttribute('data-id', show.id);
    bannerEl.innerHTML = `
        <div class="banner-details">
            <span class="banner-badge">
                <i class="fa-solid ${isAiring ? 'fa-satellite-dish' : 'fa-clock'}"></i> 
                ${isAiring ? 'Live Release' : 'Next Airing'}
            </span>
            <h2 class="banner-title">${show.title}</h2>
            <div class="banner-meta">
                <span><i class="fa-solid fa-calendar"></i> ${show.releaseDay}s at ${show.releaseTime}</span>
                <span><i class="fa-solid fa-play"></i> Episode ${show.currentEp + 1} next</span>
                ${show.watchUrl ? `<span><a href="${show.watchUrl}" target="_blank" style="color: var(--accent-cyan); text-decoration: none;"><i class="fa-solid fa-up-right-from-square"></i> Stream Link</a></span>` : ''}
            </div>
        </div>
        ${countdownHtml}
    `;
}

/**
 * Asynchronously fetches a show's page HTML via Native Java bridge,
 * parses out the OpenGraph banner image (og:image), and caches it.
 */
function fetchShowBanner(showId, countdownUrl) {
    if (!window.AndroidApp || !window.AndroidApp.fetchUrl) return;
    if (!countdownUrl || !countdownUrl.startsWith('http')) return;
    
    // Generate unique callback
    const callbackName = "cb_banner_" + showId.replace(/[^a-zA-Z0-9]/g, '') + "_" + Math.floor(Math.random() * 1000000);
    
    // Safety timeout to clean up callback if native call fails completely
    const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
            delete window[callbackName];
        }
    }, 30000);

    window[callbackName] = function(html) {
        delete window[callbackName];
        clearTimeout(timeoutId);
        if (!html) return;
        
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Try og:image first
            const ogImage = doc.querySelector('meta[property="og:image"]');
            let imageUrl = ogImage ? ogImage.getAttribute('content') : null;
            
            // If not found, try twitter:image
            if (!imageUrl) {
                const twImage = doc.querySelector('meta[name="twitter:image"]');
                imageUrl = twImage ? twImage.getAttribute('content') : null;
            }
            
            // Fallback: check other standard image fields
            if (!imageUrl) {
                const itemImg = doc.querySelector('img[src*="posters/"], img[src*="fanart/"], .poster-img');
                imageUrl = itemImg ? itemImg.src : null;
            }
            
            if (imageUrl) {
                // Ensure image uses HTTPS
                if (imageUrl.startsWith('//')) {
                    imageUrl = 'https:' + imageUrl;
                }
                
                const idx = shows.findIndex(s => s.id === showId);
                if (idx !== -1 && shows[idx].poster !== imageUrl) {
                    shows[idx].poster = imageUrl;
                    localStorage.setItem('donghua_shows', JSON.stringify(shows));
                    
                    // Re-render display
                    updateStats();
                    renderWeeklySchedule();
                    renderHeroBanner();
                    renderShowsGrid();
                }
            }
        } catch (e) {
            console.error("Failed to parse banner HTML for ID: " + showId, e);
        }
    };
    
    window.AndroidApp.fetchUrl(countdownUrl, callbackName);
}

/**
 * Fetches cover posters from Jikan API v4 based on the show's title.
 */
function fetchPosterFromJikan(showId, title) {
    if (!window.AndroidApp || !window.AndroidApp.fetchUrl) return;
    const query = encodeURIComponent(title);
    const url = 'https://api.jikan.moe/v4/anime?q=' + query + '&limit=1';
    const callbackName = 'cb_jikan_' + showId.replace(/[^a-zA-Z0-9]/g, '') + '_' + Date.now();

    window[callbackName] = function(json) {
        delete window[callbackName];
        if (!json) return;
        try {
            const data = JSON.parse(json);
            const entry = data && data.data && data.data[0];
            if (!entry) return;
            const imageUrl = entry.images && entry.images.jpg && entry.images.jpg.large_image_url;
            if (!imageUrl) return;
            const idx = shows.findIndex(s => s.id === showId);
            if (idx !== -1 && shows[idx].poster !== imageUrl) {
                shows[idx].poster = imageUrl;
                localStorage.setItem('donghua_shows', JSON.stringify(shows));
                updateStats();
                renderWeeklySchedule();
                renderHeroBanner();
                renderShowsGrid();
            }
        } catch(e) {
            console.error('Jikan parse error', e);
        }
    };
    window.AndroidApp.fetchUrl(url, callbackName);
}

/**
 * Renders the weekly schedule calendar sidebar.
 */
function renderWeeklySchedule() {
    const listEl = document.getElementById('schedule-list');
    const ongoingShows = shows.filter(s => s.status === 'ongoing');
    const selectedDay = filters.scheduleDay;
    
    // Filter shows based on active tab
    const scheduledShows = ongoingShows.filter(s => {
        if (selectedDay === 'all') return true;
        return s.releaseDay === selectedDay;
    });
    
    if (scheduledShows.length === 0) {
        listEl.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem 0;">
                No shows scheduled
            </div>
        `;
        return;
    }
    
    const todayName = DAYS_ARRAY[new Date().getDay()];
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysToRender = selectedDay === 'all' ? daysOrder : [selectedDay];
    
    let html = '';
    daysToRender.forEach(day => {
        const dayShows = scheduledShows.filter(s => s.releaseDay === day);
        if (dayShows.length === 0) return; // Skip days with no releases
        
        // Sort shows chronologically for this specific day
        dayShows.sort((a, b) => a.releaseTime.localeCompare(b.releaseTime));
        
        const isToday = day === todayName;
        
        html += `
            <div class="day-schedule-group" style="margin-bottom: 1.2rem;">
                <div class="day-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem; padding: 0 0.2rem;">
                    <span style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; color: ${isToday ? 'var(--accent-purple)' : 'var(--text-secondary)'}; display: flex; align-items: center; gap: 0.4rem;">
                        ${isToday ? '<i class="fa-solid fa-circle" style="font-size: 0.5rem; color: var(--accent-purple);"></i>' : ''}
                        ${day} ${isToday ? '(Today)' : ''}
                    </span>
                    <span style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); font-size: 0.65rem; padding: 0.1rem 0.4rem; border-radius: 10px; color: var(--text-muted);">
                        ${dayShows.length} show${dayShows.length === 1 ? '' : 's'}
                    </span>
                </div>
                <div class="day-schedule-list" style="display: flex; flex-direction: column; gap: 0.4rem;">
        `;
        
        html += dayShows.map(show => {
            return `
                <div class="schedule-item" style="${isToday ? 'border-color: rgba(157, 78, 221, 0.3); background: rgba(157,78,221,0.02)' : ''}">
                    <div class="schedule-item-name">
                        ${isToday ? '<i class="fa-solid fa-circle-play" style="color: var(--accent-purple); font-size: 0.75rem; animation: pulse 1.5s infinite"></i>' : ''}
                        <span>${show.title}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem">
                        <span class="schedule-item-time" style="font-size: 0.75rem; color: var(--text-secondary);"><i class="fa-regular fa-clock" style="color: var(--accent-purple); margin-right: 0.2rem;"></i> ${show.releaseTime}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        html += `
                </div>
            </div>
        `;
    });
    
    listEl.innerHTML = html;
}

/**
 * Renders the main grid of shows based on searches, filters, and sorting.
 */
function renderShowsGrid() {
    const containerEl = document.getElementById('shows-sections-container');
    const emptyStateEl = document.getElementById('empty-state');
    
    // Apply search and status filters
    let filteredShows = shows.filter(show => {
        const matchesSearch = show.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                             (show.titleZh && show.titleZh.toLowerCase().includes(filters.search.toLowerCase())) ||
                             (show.notes && show.notes.toLowerCase().includes(filters.search.toLowerCase()));
                             
        const matchesStatus = filters.status === 'all' ? true : show.status === filters.status;
        
        return matchesSearch && matchesStatus;
    });
    
    // Sort array
    filteredShows.sort((a, b) => {
        if (filters.sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title);
        } else if (filters.sortBy === 'progress') {
            const pctA = a.totalEp > 0 ? (a.currentEp / a.totalEp) : 0;
            const pctB = b.totalEp > 0 ? (b.currentEp / b.totalEp) : 0;
            return pctB - pctA; // Descending order
        } else if (filters.sortBy === 'last-updated') {
            return (b.lastUpdated || 0) - (a.lastUpdated || 0);
        } else {
            // Default: 'countdown' sort
            // Ongoing shows with active countdowns first, then upcoming, then completed
            const getPriority = (s) => {
                if (s.status === 'ongoing') return 1;
                if (s.status === 'upcoming') return 2;
                return 3; // completed
            };
            
            if (getPriority(a) !== getPriority(b)) {
                return getPriority(a) - getPriority(b);
            }
            
            // If both ongoing, sort by soonest release time
            if (a.status === 'ongoing') {
                const schedA = getNextReleaseDate(a.releaseDay, a.releaseTime);
                const schedB = getNextReleaseDate(b.releaseDay, b.releaseTime);
                return (schedA.targetDate - new Date()) - (schedB.targetDate - new Date());
            }
            
            return a.title.localeCompare(b.title);
        }
    });
    
    if (shows.length === 0) {
        containerEl.innerHTML = '';
        emptyStateEl.innerHTML = `
            <i class="fa-solid fa-compass" style="font-size: 3rem; color: var(--accent-cyan); margin-bottom: 1rem; opacity: 0.8;"></i>
            <h3>Track Your First Donghua</h3>
            <p>Your watchlist is empty. Click the search input above to query shows, or tap <strong>Add Show</strong> to create a custom tracker!</p>
            <button class="btn btn-primary" id="btn-reset-filters" style="background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 0.5rem; color: #fff;" onclick="openModal()">
                <i class="fa-solid fa-plus"></i> Add Donghua
            </button>
        `;
        emptyStateEl.style.display = 'flex';
        return;
    }

    if (filteredShows.length === 0) {
        containerEl.innerHTML = '';
        emptyStateEl.innerHTML = `
            <i class="fa-solid fa-seedling" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem; opacity: 0.5;"></i>
            <h3>No Matches Found</h3>
            <p>We couldn't find any shows matching your current search or status filter.</p>
            <button class="btn btn-secondary" id="btn-reset-filters" style="margin-top: 0.5rem;">Reset Filters</button>
        `;
        // Re-bind the reset filters button click handler
        const resetBtn = emptyStateEl.querySelector('#btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                filters.search = '';
                filters.status = 'all';
                filters.scheduleDay = 'all';
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
                const tabAll = document.querySelector('.filter-tab[data-status="all"]');
                if (tabAll) {
                    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                    tabAll.classList.add('active');
                }
                saveState();
            });
        }
        emptyStateEl.style.display = 'flex';
        return;
    }
    
    emptyStateEl.style.display = 'none';
    
    // Group into sections
    const groups = [
        {
            id: 'ongoing',
            title: '📺 Ongoing / Watching',
            shows: filteredShows.filter(s => s.status === 'ongoing')
        },
        {
            id: 'upcoming',
            title: '🚀 Upcoming Releases',
            shows: filteredShows.filter(s => s.status === 'upcoming')
        },
        {
            id: 'completed',
            title: '✅ Completed Series',
            shows: filteredShows.filter(s => s.status === 'completed')
        }
    ];
    
    const todayName = DAYS_ARRAY[new Date().getDay()];
    
    let html = '';
    groups.forEach(group => {
        if (group.shows.length === 0) return;
        
        // Render section title and count badge
        html += `
            <div class="shows-section" id="section-${group.id}" style="margin-bottom: 2.5rem;">
                <div class="section-title-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                    <h2 style="font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--text-primary);">${group.title}</h2>
                    <span class="count-tag" style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.2rem 0.6rem; font-size: 0.75rem; border-radius: 20px; color: var(--text-secondary);">${group.shows.length} show${group.shows.length === 1 ? '' : 's'}</span>
                </div>
                <div class="shows-grid">
        `;
        
        // Render each card inside the section grid
        html += group.shows.map(show => {
            const progressPct = show.totalEp > 0 ? Math.min(100, Math.round((show.currentEp / show.totalEp) * 100)) : 0;
            const progressDisplay = show.totalEp > 0 ? `${show.currentEp}/${show.totalEp}` : `${show.currentEp}/?`;
            
            const isReleasingToday = show.status === 'ongoing' && show.releaseDay === todayName;
            
            // Poster Image or Gradient Placeholder
            let posterHtml = '';
            if (show.poster) {
                posterHtml = `<img class="card-poster" src="${show.poster}" alt="${show.title} Poster" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">`;
            }
            
            // Text watermark for gradient poster
            const initials = show.title.split(' ').map(w => w[0]).slice(0, 3).join('').toUpperCase();
            const firstChineseChar = show.titleZh ? show.titleZh.slice(0, 2) : '';
            const gradientBg = getPosterGradient(show.title);
            
            const placeholderHtml = `
                <div class="poster-placeholder" style="background: ${gradientBg}">
                    <div class="placeholder-symbol"><i class="fa-solid fa-dragon"></i></div>
                    <div class="placeholder-text">${initials}</div>
                    ${firstChineseChar ? `<div class="placeholder-zh">${firstChineseChar}</div>` : ''}
                </div>
            `;
            
            // Countdown Clock Section HTML
            let clockHtml = '';
            if (show.status === 'completed') {
                clockHtml = `
                    <div class="card-countdown completed-state">
                        <i class="fa-solid fa-circle-check"></i> Series Completed
                    </div>
                `;
            } else if (show.status === 'upcoming') {
                clockHtml = `
                    <div class="card-countdown upcoming-state">
                        <i class="fa-solid fa-calendar-days"></i> Upcoming Release
                    </div>
                `;
            } else {
                // Ongoing
                const schedule = getNextReleaseDate(show.releaseDay, show.releaseTime);
                if (schedule.airingNow) {
                    clockHtml = `
                        <div class="card-countdown" style="background: rgba(0, 242, 254, 0.1); border-color: rgba(0, 242, 254, 0.3)">
                            <div class="c-item" style="width: 100%">
                                <div class="c-val" style="font-size: 0.95rem; animation: pulse 1s infinite">AIRING NOW / RELEASED</div>
                            </div>
                        </div>
                    `;
                } else {
                    const time = calculateTimeRemaining(schedule.targetDate);
                    clockHtml = `
                        <div class="card-countdown">
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
                        </div>
                    `;
                }
            }
            
            return `
                <article class="show-card ${isReleasingToday ? 'releasing-today' : ''}" data-id="${show.id}">
                    <!-- Poster -->
                    <div class="card-header">
                        <div class="card-badges">
                            <span class="status-badge ${show.status}">${show.status}</span>
                            ${isReleasingToday ? '<span class="status-badge" style="background: rgba(157, 78, 221, 0.2); color: var(--accent-purple); border: 1px solid rgba(157, 78, 221, 0.4)">Airs Today</span>' : ''}
                        </div>
                        ${posterHtml}
                        ${placeholderHtml}
                        <div class="card-overlay"></div>
                    </div>
                    
                    <!-- Body -->
                    <div class="card-body">
                        <div class="card-title-block">
                            <h3 class="card-title" title="${show.title}">${show.title}</h3>
                            ${show.titleZh ? `<div class="card-title-zh">${show.titleZh}</div>` : ''}
                        </div>
                        
                        <!-- Countdown Clock -->
                        ${clockHtml}
                        
                        <!-- Schedule Info -->
                        <div class="card-schedule-info">
                            <i class="fa-regular fa-calendar"></i>
                            <span>${show.releaseDay} at ${show.releaseTime}</span>
                        </div>
                        
                        <!-- Progress Section -->
                        <div class="card-progress-section">
                            <div class="progress-header">
                                <div class="ep-counter">Watched: <span>${progressDisplay}</span></div>
                                <div class="ep-buttons">
                                    <button class="ep-btn btn-minus" title="Decrease episode"><i class="fa-solid fa-minus"></i></button>
                                    <button class="ep-btn btn-plus" title="Increase episode"><i class="fa-solid fa-plus"></i></button>
                                </div>
                            </div>
                            <div class="progress-bar-container">
                                <div class="progress-bar-fill" style="width: ${progressPct}%"></div>
                            </div>
                        </div>
                        
                        <!-- Notes / Synopsis -->
                        <p class="card-notes" title="${show.notes || ''}">
                            ${show.notes ? show.notes : '<span style="color: var(--text-muted); font-style: italic;">No synopsis added.</span>'}
                        </p>
                        
                        <!-- Card Footer Actions -->
                        <div class="card-actions">
                            <button class="watch-link watch-btn" data-watch-url="${show.watchUrl || 'https://donghuastream.org/?s=' + encodeURIComponent(show.title)}" onclick="openWatchScreen(this.getAttribute('data-watch-url'))">
                                <i class="fa-solid fa-circle-play"></i> Stream
                            </button>

                            <a class="countdown-link" href="${show.countdownUrl || `https://www.google.com/search?q=site:animecountdown.com+` + encodeURIComponent(show.title)}" target="_blank" rel="noopener noreferrer">
                                <i class="fa-solid fa-hourglass-half"></i> Countdown
                            </a>

                            <div class="card-ctrls">
                                <button class="ctrl-btn edit-btn" title="Edit show"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button class="ctrl-btn delete-btn" title="Delete show"><i class="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
        
        // Close grid and section tags
        html += `
                </div>
            </div>
        `;
    });
    
    containerEl.innerHTML = html;
}

/**
 * Triggers re-render for UI parts that do not require full updates.
 * Keeps running timers synchronized smoothly.
 */
function updateTimers() {
    // 1. Update the clock-display
    const clockEl = document.getElementById('clock-display');
    const localNow = new Date();
    if (clockEl) {
        clockEl.innerText = localNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + DAYS_ARRAY[localNow.getDay()] + ')';
    }

    // 2. Update the Hero Banner countdown in-place
    const heroCountdownBox = document.getElementById('hero-countdown-box');
    if (heroCountdownBox) {
        const heroCard = document.querySelector('.hero-banner-card');
        const heroShowId = heroCard ? heroCard.dataset.id : null;
        if (heroShowId) {
            const show = shows.find(s => s.id === heroShowId);
            if (show && show.status === 'ongoing') {
                const schedule = getNextReleaseDate(show.releaseDay, show.releaseTime);
                const time = calculateTimeRemaining(schedule.targetDate);
                if (time.elapsed) {
                    renderHeroBanner();
                } else {
                    const numEls = heroCountdownBox.querySelectorAll('.num');
                    if (numEls.length === 4) {
                        numEls[0].innerText = String(time.days).padStart(2, '0');
                        numEls[1].innerText = String(time.hours).padStart(2, '0');
                        numEls[2].innerText = String(time.minutes).padStart(2, '0');
                        numEls[3].innerText = String(time.seconds).padStart(2, '0');
                    }
                }
            }
        }
    }

    // 3. Update each show card's countdown in-place
    shows.forEach(show => {
        if (show.status !== 'ongoing') return;
        const cardEl = document.querySelector(`.show-card[data-id="${show.id}"]`);
        if (!cardEl) return;

        const cdEl = cardEl.querySelector('.card-countdown');
        if (!cdEl) return;

        const schedule = getNextReleaseDate(show.releaseDay, show.releaseTime);
        if (schedule.airingNow) {
            const isAlreadyAiring = cdEl.querySelector('.c-val') && cdEl.querySelector('.c-val').innerText === "AIRING NOW / RELEASED";
            if (!isAlreadyAiring) {
                renderShowsGrid();
                renderHeroBanner();
            }
        } else {
            const time = calculateTimeRemaining(schedule.targetDate);
            if (time.elapsed) {
                renderShowsGrid();
                renderHeroBanner();
            } else {
                const valEls = cdEl.querySelectorAll('.c-val');
                if (valEls.length === 4) {
                    valEls[0].innerText = String(time.days).padStart(2, '0');
                    valEls[1].innerText = String(time.hours).padStart(2, '0');
                    valEls[2].innerText = String(time.minutes).padStart(2, '0');
                    valEls[3].innerText = String(time.seconds).padStart(2, '0');
                } else {
                    cdEl.innerHTML = `
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
        }
    });
}

/* ==========================================================================
   EVENT HANDLERS & INITIALIZATION
   ========================================================================== */

let timerInterval = null;

function pauseTimers() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resumeTimers() {
    if (!timerInterval) {
        timerInterval = setInterval(updateTimers, 1000);
    }
}

window.pauseTimers = pauseTimers;
window.resumeTimers = resumeTimers;

function openWatchScreen(url) {
    if (!url) return;
    if (window.AndroidApp && window.AndroidApp.openWatchScreen) {
        window.AndroidApp.openWatchScreen(url);
    } else {
        window.open(url, '_blank');
    }
}

function exportData() {
    const json = localStorage.getItem('donghua_shows');
    if (!json) { alert('No data to export.'); return; }
    
    // File download trigger (creates a local .json file download)
    try {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'donghua_backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("Blob download failed", e);
    }

    if (window.AndroidApp && window.AndroidApp.shareText) {
        window.AndroidApp.shareText(json);
    } else {
        navigator.clipboard.writeText(json).then(() => {
            alert('Backup JSON copied to clipboard.');
        }).catch(err => {
            console.error("Clipboard write failed", err);
        });
    }
}

function importData(jsonString) {
    let json = jsonString;
    if (!json) {
        json = prompt('Paste your backup JSON here:');
    }
    if (!json) return false;
    try {
        const parsed = JSON.parse(json);
        if (!Array.isArray(parsed)) throw new Error('Invalid format: root must be a JSON array');
        
        // Simple schema verification
        for (const item of parsed) {
            if (!item.title || !item.id) {
                throw new Error("Missing 'title' or 'id' fields in backup item");
            }
        }
        
        shows = parsed;
        localStorage.setItem('donghua_shows', JSON.stringify(shows));
        saveState();
        alert('Import successful! ' + shows.length + ' shows loaded.');
        return true;
    } catch(e) {
        alert('Failed to import backup: ' + e.message);
        return false;
    }
}

/**
 * Synchronizes native alarm manager states for a specific show countdown.
 * @param {Object} show
 */
function syncAlarm(show) {
    if (window.AndroidApp && window.AndroidApp.scheduleReminder) {
        if (show.status === 'ongoing') {
            window.AndroidApp.scheduleReminder(show.id, show.title, show.releaseDay, show.releaseTime);
        } else {
            window.AndroidApp.cancelReminder(show.id);
        }
    }
}

/**
 * Saves the current shows list state to LocalStorage and triggers layout updates.
 */
function saveState() {
    if (window.AndroidApp && window.AndroidApp.dbInsertShow) {
        shows.forEach(show => {
            window.AndroidApp.dbInsertShow(JSON.stringify(show));
            syncAlarm(show);
        });
    } else {
        localStorage.setItem('donghua_shows', JSON.stringify(shows));
    }
    updateStats();
    renderWeeklySchedule();
    renderHeroBanner();
    renderShowsGrid();
}

/**
 * Opens the details and episodes modal.
 * @param {Object} show - The show data to display.
 */
function openDetailsModal(show) {
    const detailsModal = document.getElementById('details-modal');
    const detailsTitle = document.getElementById('details-modal-title');
    const detailsContent = document.getElementById('details-modal-content');
    if (!detailsModal || !detailsContent) return;

    detailsTitle.innerText = show.title;

    // Compute status badge
    let statusClass = show.status;
    let statusText = show.status.toUpperCase();

    // Compute total/current episodes
    const maxEps = show.totalEp > 0 ? show.totalEp : Math.max(12, show.currentEp + 10);
    
    // Poster or placeholder
    let posterHtml = '';
    if (show.poster) {
        posterHtml = `<img src="${show.poster}" style="width: 90px; height: 130px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);" alt="${show.title}">`;
    } else {
        const hash = [...show.title].reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const gradient = GRADIENTS[hash % GRADIENTS.length];
        const initials = show.title.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
        posterHtml = `
            <div style="width: 90px; height: 130px; background: ${gradient}; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
                <div style="font-size: 1.4rem; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 2;">${initials}</div>
                ${show.titleZh ? `<div style="position: absolute; bottom: 4px; right: 4px; font-size: 1.6rem; font-weight: 800; color: rgba(255,255,255,0.06); pointer-events: none; z-index: 1;">${show.titleZh[0]}</div>` : ''}
            </div>
        `;
    }

    // Build episode pills
    let epPills = '';
    for (let i = 1; i <= maxEps; i++) {
        const isWatched = i <= show.currentEp;
        const activeStyle = isWatched ? 'background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); border: none; color: #fff; font-weight: bold;' : 'background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); color: var(--text-secondary);';
        epPills += `
            <button class="ep-pill-btn" data-ep="${i}" style="padding: 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; ${activeStyle}">
                ${i}
            </button>
        `;
    }

    detailsContent.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
            ${posterHtml}
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                    <span class="status-badge ${statusClass}" style="padding: 0.2rem 0.5rem; font-size: 0.65rem; border-radius: 4px; text-transform: uppercase;">${statusText}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-regular fa-calendar" style="margin-right: 0.2rem;"></i> ${show.releaseDay} at ${show.releaseTime}</span>
                </div>
                <h3 style="font-size: 1rem; color: #fff; margin: 0.2rem 0 0 0; font-family: var(--font-heading); font-weight: 700;">${show.title}</h3>
                ${show.titleZh ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">${show.titleZh}</div>` : ''}
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.4rem;">
                    Watched: <strong style="color: var(--accent-cyan);">${show.currentEp}</strong> / ${show.totalEp > 0 ? show.totalEp : '?'} episodes
                </div>
            </div>
        </div>

        <div>
            <h4 style="font-size: 0.8rem; color: #fff; margin: 0 0 0.4rem 0; text-transform: uppercase; letter-spacing: 0.5px;">Synopsis</h4>
            <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                ${show.notes ? show.notes : '<span style="color: var(--text-muted); font-style: italic;">No synopsis added.</span>'}
            </p>
        </div>

        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="font-size: 0.8rem; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Episodes</h4>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Click to update progress</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 0.4rem; max-height: 200px; overflow-y: auto; padding-right: 0.2rem;">
                ${epPills}
            </div>
        </div>
    `;

    // Add click listeners to the episode buttons inside details modal
    detailsContent.querySelectorAll('.ep-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newEp = parseInt(btn.dataset.ep, 10);
            
            // Toggle logic: if clicking on current episode, toggle to X - 1 watched
            if (newEp === show.currentEp) {
                show.currentEp = Math.max(0, newEp - 1);
            } else {
                if (newEp > show.currentEp) {
                    for (let ep = show.currentEp + 1; ep <= newEp; ep++) {
                        if (window.AndroidApp && window.AndroidApp.dbAddWatchHistory) {
                            window.AndroidApp.dbAddWatchHistory(show.id, ep);
                        }
                    }
                }
                show.currentEp = newEp;
            }
            
            show.lastUpdated = Date.now();
            
            // Handle completed transition
            if (show.totalEp > 0 && show.currentEp === show.totalEp) {
                show.status = 'completed';
            } else if (show.status === 'completed' && show.currentEp < show.totalEp) {
                show.status = 'ongoing';
            }
            
            saveState();
            openDetailsModal(show); // Refresh modal view
        });
    });

    detailsModal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

/**
 * Opens the add/edit modal.
 * @param {Object} [showData=null] - The show data if editing, null if adding new.
 */
function openModal(showData = null) {
    const modalEl = document.getElementById('donghua-modal');
    const formEl = document.getElementById('donghua-form');
    
    // Reset Form
    formEl.reset();
    document.getElementById('show-id').value = '';
    
    if (showData) {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Donghua';
        document.getElementById('show-id').value = showData.id;
        document.getElementById('show-title').value = showData.title;
        document.getElementById('show-title-zh').value = showData.titleZh || '';
        document.getElementById('show-status').value = showData.status;
        document.getElementById('show-watch-url').value = showData.watchUrl || '';
        document.getElementById('show-countdown-url').value = showData.countdownUrl || '';
        document.getElementById('show-release-day').value = showData.releaseDay;
        document.getElementById('show-release-time').value = showData.releaseTime;
        document.getElementById('show-current-ep').value = showData.currentEp;
        document.getElementById('show-total-ep').value = showData.totalEp;
        document.getElementById('show-poster').value = showData.poster || '';
        document.getElementById('show-notes').value = showData.notes || '';
    } else {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Donghua';
        document.getElementById('show-watch-url').value = '';
        document.getElementById('show-countdown-url').value = '';
        // Set default release day based on today
        const todayDay = DAYS_ARRAY[new Date().getDay()];
        document.getElementById('show-release-day').value = todayDay;
        document.getElementById('show-release-time').value = "10:00";
        document.getElementById('show-current-ep').value = 0;
        document.getElementById('show-total-ep').value = 12;
    }
    
    modalEl.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function closeModal() {
    document.getElementById('donghua-modal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

// Bind Global UI Listeners
document.addEventListener('DOMContentLoaded', () => {
    
    // Update basic stats immediately
    updateStats();
    renderWeeklySchedule();
    renderHeroBanner();
    renderShowsGrid();
    
    // Clock/Timer Loop
    resumeTimers();
    
    // Export Data Trigger
    const btnExport = document.getElementById('btn-export-data');
    if (btnExport) {
        btnExport.addEventListener('click', exportData);
    }
    
    // Import Modal Triggers
    const importModal = document.getElementById('import-modal');
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const btnCloseImport = document.getElementById('btn-close-import');
    const btnCancelImport = document.getElementById('btn-cancel-import');
    const btnSubmitImport = document.getElementById('btn-submit-import');
    const importTextarea = document.getElementById('import-json-textarea');
    
    if (btnTriggerImport && importModal) {
        btnTriggerImport.addEventListener('click', () => {
            if (importTextarea) importTextarea.value = '';
            importModal.style.display = 'flex';
            document.body.classList.add('modal-open');
        });
    }
    
    const closeImportModal = () => {
        if (importModal) {
            importModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    };
    
    if (btnCloseImport) btnCloseImport.addEventListener('click', closeImportModal);
    if (btnCancelImport) btnCancelImport.addEventListener('click', closeImportModal);
    if (importModal) {
        importModal.addEventListener('click', (e) => {
            if (e.target.id === 'import-modal') closeImportModal();
        });
    }

    // Details Modal Triggers
    const detailsModal = document.getElementById('details-modal');
    const btnCloseDetails = document.getElementById('btn-close-details');
    
    const closeDetailsModal = () => {
        if (detailsModal) {
            detailsModal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    };
    
    if (btnCloseDetails) btnCloseDetails.addEventListener('click', closeDetailsModal);
    if (detailsModal) {
        detailsModal.addEventListener('click', (e) => {
            if (e.target.id === 'details-modal') closeDetailsModal();
        });
    }
    
    if (btnSubmitImport && importTextarea) {
        btnSubmitImport.addEventListener('click', () => {
            const rawJson = importTextarea.value.trim();
            if (!rawJson) {
                alert("Please paste your JSON backup data first.");
                return;
            }
            const success = importData(rawJson);
            if (success) {
                closeImportModal();
            }
        });
    }
    
    // Auto-fetch missing posters from multiple sources (donghuastream.org, animecountdown.com, Jikan API)
    setTimeout(() => {
        shows.forEach(show => {
            if (!show.poster) {
                if (show.watchUrl && show.watchUrl.startsWith('https://donghuastream.org/')) {
                    fetchShowBanner(show.id, show.watchUrl);
                } else if (show.countdownUrl && show.countdownUrl.startsWith('https://animecountdown.com/')) {
                    fetchShowBanner(show.id, show.countdownUrl);
                } else {
                    // Fall back to Jikan API v4 search
                    setTimeout(() => fetchPosterFromJikan(show.id, show.title),
                        shows.indexOf(show) * 800);
                }
            }
        });
    }, 2000);

    // Fetch poster from title in the edit modal
    document.getElementById('btn-fetch-poster').addEventListener('click', () => {
        const title = document.getElementById('show-title').value.trim();
        const showId = document.getElementById('show-id').value;
        if (!title) { alert('Enter a title first.'); return; }
        if (!window.AndroidApp) { alert('Only works in the Android app.'); return; }
        const query = encodeURIComponent(title);
        const url = 'https://api.jikan.moe/v4/anime?q=' + query + '&limit=1';
        const cbName = 'cb_modal_poster_' + Date.now();
        window[cbName] = function(json) {
            delete window[cbName];
            if (!json) { alert('Could not fetch poster.'); return; }
            try {
                const data = JSON.parse(json);
                const entry = data && data.data && data.data[0];
                const imgUrl = entry && entry.images && entry.images.jpg && entry.images.jpg.large_image_url;
                if (imgUrl) {
                    document.getElementById('show-poster').value = imgUrl;
                } else {
                    alert('No poster found for this title.');
                }
            } catch(e) { alert('Error parsing response.'); }
        };
        window.AndroidApp.fetchUrl(url, cbName);
    });
    
    // Modal Close buttons
    document.getElementById('btn-close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeModal);
    document.getElementById('donghua-modal').addEventListener('click', (e) => {
        if (e.target.id === 'donghua-modal') closeModal();
    });
    
    // Form Submission
    document.getElementById('donghua-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const showId = document.getElementById('show-id').value;
        const newShowData = {
            title: document.getElementById('show-title').value.trim(),
            titleZh: document.getElementById('show-title-zh').value.trim(),
            status: document.getElementById('show-status').value,
            watchUrl: document.getElementById('show-watch-url').value.trim(),
            countdownUrl: document.getElementById('show-countdown-url').value.trim(),
            releaseDay: document.getElementById('show-release-day').value,
            releaseTime: document.getElementById('show-release-time').value,
            currentEp: parseInt(document.getElementById('show-current-ep').value) || 0,
            totalEp: parseInt(document.getElementById('show-total-ep').value) || 0,
            poster: document.getElementById('show-poster').value.trim(),
            notes: document.getElementById('show-notes').value.trim(),
            lastUpdated: Date.now()
        };
        
        if (showId) {
            // Update existing show
            const idx = shows.findIndex(s => s.id === showId);
            if (idx !== -1) {
                // Preserving id
                newShowData.id = showId;
                shows[idx] = newShowData;
            }
        } else {
            // Add new show
            newShowData.id = 'dh-' + Date.now();
            shows.push(newShowData);
        }
        
        saveState();
        closeModal();
        
        if (!newShowData.poster) {
            if (newShowData.watchUrl && newShowData.watchUrl.startsWith('https://donghuastream.org/')) {
                setTimeout(() => fetchShowBanner(newShowData.id, newShowData.watchUrl), 200);
            } else if (newShowData.countdownUrl && newShowData.countdownUrl.startsWith('https://animecountdown.com/')) {
                setTimeout(() => fetchShowBanner(newShowData.id, newShowData.countdownUrl), 200);
            } else {
                setTimeout(() => fetchPosterFromJikan(newShowData.id, newShowData.title), 200);
            }
        }
    });
    
    // Search box listener
    document.getElementById('search-input').addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderShowsGrid();
    });
    
    // Status filters chips (guarded if layout element exists)
    const filterStatusEl = document.getElementById('filter-status');
    if (filterStatusEl) {
        filterStatusEl.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-chip')) {
                document.querySelectorAll('#filter-status .filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                filters.status = e.target.dataset.value;
                renderShowsGrid();
            }
        });
    }
    
    // Sort dropdown change (guarded if layout element exists)
    const sortSelectEl = document.getElementById('sort-select');
    if (sortSelectEl) {
        sortSelectEl.addEventListener('change', (e) => {
            filters.sortBy = e.target.value;
            renderShowsGrid();
        });
    }
    
    // Reset filters button in Empty State (guarded if layout element exists)
    const btnResetFiltersEl = document.getElementById('btn-reset-filters');
    if (btnResetFiltersEl) {
        btnResetFiltersEl.addEventListener('click', () => {
            filters.search = '';
            filters.status = 'all';
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            const chips = document.querySelectorAll('#filter-status .filter-chip');
            if (chips) {
                chips.forEach(c => {
                    if (c.dataset.value === 'all') c.classList.add('active');
                    else c.classList.remove('active');
                });
            }
            renderShowsGrid();
        });
    }

    // Intercept clicks on streaming source buttons to open natively in player activity
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.stream-source-btn');
        if (btn) {
            const url = btn.getAttribute('data-watch-url');
            if (url && window.AndroidApp && window.AndroidApp.openWatchScreen) {
                e.preventDefault();
                window.AndroidApp.openWatchScreen(url);
            }
        }
    });
    
    // Weekly Schedule Tab selection
    document.getElementById('schedule-tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('#schedule-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            filters.scheduleDay = e.target.dataset.day;
            renderWeeklySchedule();
        }
    });
    
    // Grid Card Action Delegations (increment, decrement, edit, delete)
    document.getElementById('shows-sections-container').addEventListener('click', (e) => {
        const card = e.target.closest('.show-card');
        if (!card) return;
        
        // Action buttons check
        const isPlus = e.target.closest('.btn-plus');
        const isMinus = e.target.closest('.btn-minus');
        const isEdit = e.target.closest('.edit-btn');
        const isDelete = e.target.closest('.delete-btn');
        const isStream = e.target.closest('.watch-btn');
        const isCountdown = e.target.closest('.countdown-link');
        
        const showId = card.dataset.id;
        const showIdx = shows.findIndex(s => s.id === showId);
        if (showIdx === -1) return;
        const show = shows[showIdx];
        
        if (isPlus) {
            if (show.totalEp === 0 || show.currentEp < show.totalEp) {
                show.currentEp++;
                show.lastUpdated = Date.now();
                if (show.totalEp > 0 && show.currentEp === show.totalEp) {
                    show.status = 'completed';
                }
                saveState();
            }
        } else if (isMinus) {
            if (show.currentEp > 0) {
                show.currentEp--;
                show.lastUpdated = Date.now();
                if (show.status === 'completed' && show.currentEp < show.totalEp) {
                    show.status = 'ongoing';
                }
                saveState();
            }
        } else if (isEdit) {
            openModal(show);
        } else if (isDelete) {
            const confirmDelete = confirm(`Are you sure you want to remove "${show.title}" from your list?`);
            if (confirmDelete) {
                const showId = show.id;
                shows.splice(showIdx, 1);
                if (window.AndroidApp && window.AndroidApp.dbDeleteShow) {
                    window.AndroidApp.dbDeleteShow(showId);
                    window.AndroidApp.cancelReminder(showId);
                }
                saveState();
            }
        } else if (isStream || isCountdown) {
            // Let watch screen / countdown trigger target behaviors
            return;
        } else {
            // Opened by touching details/body of the card
            openDetailsModal(show);
        }
    });

    // Disable context menu for a fully native app feel
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Initialize mobile navigation tab state
    switchTab('home');

    // Dynamic loading status messages
    const statusEl = document.getElementById('loading-status-text');
    if (statusEl) {
        const messages = [
            "Initializing SQLite database...",
            "Connecting notification receiver...",
            "Migrating user preferences...",
            "Drawing schedule calendars...",
            "Starting tracker engines..."
        ];
        messages.forEach((msg, idx) => {
            setTimeout(() => {
                if (statusEl) statusEl.innerText = msg;
            }, idx * 300);
        });
    }

    // Dismiss App Loading Splash Overlay after initializing systems
    setTimeout(() => {
        const loader = document.getElementById('app-loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
            document.body.classList.remove('loading-active');
            setTimeout(() => loader.remove(), 600);
        }
    }, 1600);
});

// Mobile Navigation View Controller
let activeTab = 'home';

function switchTab(tabName) {
    if (tabName === 'add') return;
    activeTab = tabName;
    
    // Update nav items class states
    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`nav-btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Target main container elements
    const searchPanel = document.querySelector('.panel-search');
    const sourcesPanel = document.querySelector('.panel-sources');
    const devPanel = document.querySelector('.panel-dev-info');
    const backupPanel = document.querySelector('.panel-backup-info');
    const scheduleContainer = document.querySelector('.schedule-container');
    const heroBanner = document.getElementById('next-up-banner');
    const sectionsContainer = document.getElementById('shows-sections-container');
    const statsPanel = document.querySelector('.stats-panel');
    
    // Mobile Viewport Check (corresponds to CSS max-width: 1024px)
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        // Hide all major areas first
        if (searchPanel) searchPanel.style.setProperty('display', 'none', 'important');
        if (sourcesPanel) sourcesPanel.style.setProperty('display', 'none', 'important');
        if (devPanel) devPanel.style.setProperty('display', 'none', 'important');
        if (backupPanel) backupPanel.style.setProperty('display', 'none', 'important');
        if (scheduleContainer) scheduleContainer.style.setProperty('display', 'none', 'important');
        if (heroBanner) heroBanner.style.setProperty('display', 'none', 'important');
        if (sectionsContainer) sectionsContainer.style.setProperty('display', 'none', 'important');
        if (statsPanel) statsPanel.style.setProperty('display', 'none', 'important');
        
        // Show only the selected tab
        if (tabName === 'home') {
            if (sectionsContainer) sectionsContainer.style.setProperty('display', 'block', 'important');
            if (statsPanel) statsPanel.style.setProperty('display', 'flex', 'important');
            if (heroBanner) {
                heroBanner.style.display = ''; // Clear important override
                renderHeroBanner();
            }
        } else if (tabName === 'schedule') {
            if (scheduleContainer) scheduleContainer.style.setProperty('display', 'block', 'important');
        } else if (tabName === 'sources') {
            if (sourcesPanel) sourcesPanel.style.setProperty('display', 'block', 'important');
        } else if (tabName === 'info') {
            if (devPanel) devPanel.style.setProperty('display', 'block', 'important');
            if (backupPanel) backupPanel.style.setProperty('display', 'block', 'important');
        }
    } else {
        // Desktop Viewport: Restore standard styles and clear important display sets
        if (searchPanel) searchPanel.style.display = '';
        if (sourcesPanel) sourcesPanel.style.display = '';
        if (devPanel) devPanel.style.display = '';
        if (backupPanel) backupPanel.style.display = '';
        if (scheduleContainer) scheduleContainer.style.display = '';
        if (heroBanner) heroBanner.style.display = '';
        if (sectionsContainer) sectionsContainer.style.display = '';
        if (statsPanel) statsPanel.style.display = '';
    }
}

function triggerAddModal() {
    openModal();
}

// Re-evaluate layouts on window size changes
window.addEventListener('resize', () => {
    switchTab(activeTab);
});

// Exit Confirmation Modal Controllers
function showExitModal() {
    const modal = document.getElementById('exit-modal');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        document.body.classList.add('modal-open');
    }
}

function closeExitModal() {
    const modal = document.getElementById('exit-modal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        document.body.classList.remove('modal-open');
    }
}

function confirmExitApp() {
    if (window.AndroidApp && window.AndroidApp.exitApp) {
        window.AndroidApp.exitApp();
    } else {
        // Fallback for non-android environments
        closeExitModal();
        console.log("App Exited");
    }
}

// Global target launcher called from native intents (e.g. notifications)
function openDetailsById(showId) {
    const show = shows.find(s => s.id === showId);
    if (show) {
        switchTab('home');
        openDetailsModal(show);
    }
}
window.openDetailsById = openDetailsById;
