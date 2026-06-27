/* ==========================================================================
   STATE MANAGEMENT & DEFAULT DATA
   ========================================================================== */

// Default mock data to populate local storage on first load
const DEFAULT_DONGHUA = [
    {
        id: "dh-1",
        title: "Soul Land II: The Peerless Tang Clan",
        titleZh: "斗罗大陆II绝世唐门",
        status: "ongoing",
        releaseDay: "Saturday",
        releaseTime: "10:00",
        currentEp: 53,
        totalEp: 104,
        poster: "", // Empty to test auto-gradient posters
        watchUrl: "https://v.qq.com/x/cover/mzc00200u3v9xt3.html",
        notes: "Ten thousand years after the founding of the Tang Sect, it has declined. Huo Yuhao, a young man with a unique Spirit Eye, joins Shrek Academy to revive the sect.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-2",
        title: "Battle Through the Heavens S5",
        titleZh: "斗破苍穹年番",
        status: "ongoing",
        releaseDay: "Sunday",
        releaseTime: "10:00",
        currentEp: 101,
        totalEp: 104,
        poster: "",
        watchUrl: "https://v.qq.com/x/cover/mzc00200n1g0t2u.html",
        notes: "Xiao Yan arrives at Jia Nan Academy to train, obtain new Heavenly Flames, and continue his ultimate quest of defeating the Hall of Souls.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-3",
        title: "A Will Eternal Season 3",
        titleZh: "一念永恒S3",
        status: "ongoing",
        releaseDay: "Wednesday",
        releaseTime: "10:00",
        currentEp: 10,
        totalEp: 52,
        poster: "",
        watchUrl: "https://v.qq.com/x/cover/mzc00200g5t5o7x.html",
        notes: "Bai Xiaochun, a cautious youth obsessed with living forever, continues to stir up trouble in the cultivation world with his unorthodox skills.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-4",
        title: "Link Click Season 3",
        titleZh: "时光代理人S3",
        status: "upcoming",
        releaseDay: "Friday",
        releaseTime: "11:00",
        currentEp: 0,
        totalEp: 12,
        poster: "",
        watchUrl: "",
        notes: "Cheng Xiaoshi and Lu Guang use superpower photos to enter the past and complete requests, but their actions have massive ripple effects.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-5",
        title: "The Daily Life of the Immortal King",
        titleZh: "仙王的日常生活",
        status: "completed",
        releaseDay: "Saturday",
        releaseTime: "12:00",
        currentEp: 12,
        totalEp: 12,
        poster: "",
        watchUrl: "https://www.bilibili.com/",
        notes: "Wang Ling is a cultivation prodigy who attempts to live a quiet life as a regular high school student, but keeps getting dragged into world-ending conflicts.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-6",
        title: "The Demon Hunter",
        titleZh: "沧元图",
        status: "ongoing",
        releaseDay: "Monday",
        releaseTime: "10:00",
        currentEp: 22,
        totalEp: 26,
        poster: "",
        watchUrl: "https://v.qq.com/x/cover/mzc00200m1jdf9u.html",
        notes: "Meng Chuan witnessed his mother die before his eyes, so he trained extremely hard to become a God-Fiend and protect the human race from demon invasions.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-7",
        title: "Martial Universe",
        titleZh: "武动乾坤",
        status: "completed",
        releaseDay: "Tuesday",
        releaseTime: "10:00",
        currentEp: 12,
        totalEp: 12,
        poster: "",
        watchUrl: "",
        notes: "Lin Dong, a youth from a small branch of a great family, discovers a mysterious stone talisman that changes his destiny forever.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-8",
        title: "Throne of Seal",
        titleZh: "神印王座",
        status: "ongoing",
        releaseDay: "Thursday",
        releaseTime: "10:00",
        currentEp: 85,
        totalEp: 104,
        poster: "",
        watchUrl: "",
        notes: "Long Haochen, a kind-hearted boy, joins the Temple Alliance to protect humanity from the demon race and rise to become a legendary divine knight.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-9",
        title: "Perfect World",
        titleZh: "完美世界",
        status: "ongoing",
        releaseDay: "Friday",
        releaseTime: "10:00",
        currentEp: 156,
        totalEp: 180,
        poster: "",
        watchUrl: "",
        notes: "Born in a desolate wilderness, Shi Hao rises through training, battling ancient beasts and rival clans to become a savior of his realm.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-10",
        title: "Record of a Mortal's Journey to Immortality",
        titleZh: "凡人修仙传",
        status: "ongoing",
        releaseDay: "Sunday",
        releaseTime: "11:00",
        currentEp: 92,
        totalEp: 104,
        poster: "",
        watchUrl: "",
        notes: "Han Li, an ordinary village boy, accidentally enters a minor cultivation sect and begins his slow, calculated ascent in a brutal world of gods and demons.",
        lastUpdated: Date.now()
    }
];

// Load shows from localStorage or default
let shows = JSON.parse(localStorage.getItem('donghua_shows'));
if (!shows || shows.length === 0) {
    shows = DEFAULT_DONGHUA;
    localStorage.setItem('donghua_shows', JSON.stringify(shows));
} else {
    // If the user already has data, check if we need to auto-append newly added defaults
    let updated = false;
    DEFAULT_DONGHUA.forEach(defaultShow => {
        if (!shows.some(s => s.title === defaultShow.title)) {
            shows.push(defaultShow);
            updated = true;
        }
    });
    if (updated) {
        localStorage.setItem('donghua_shows', JSON.stringify(shows));
    }
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
    
    if (ongoingShows.length === 0) {
        bannerEl.style.display = 'none';
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
    bannerEl.style.background = `linear-gradient(135deg, rgba(20, 26, 38, 0.9), rgba(10, 12, 20, 0.98)), ${bannerGradient}`;
    
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
    
    // Sort schedule shows chronologically (Day of week index, then release time)
    scheduledShows.sort((a, b) => {
        const dayA = DAYS_MAP[a.releaseDay];
        const dayB = DAYS_MAP[b.releaseDay];
        if (dayA !== dayB) return dayA - dayB;
        return a.releaseTime.localeCompare(b.releaseTime);
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
    
    listEl.innerHTML = scheduledShows.map(show => {
        const isToday = show.releaseDay === todayName;
        return `
            <div class="schedule-item" style="${isToday ? 'border-color: rgba(157, 78, 221, 0.4); background: rgba(157,78,221,0.03)' : ''}">
                <div class="schedule-item-name">
                    ${isToday ? '<i class="fa-solid fa-circle-play" style="color: var(--accent-purple); font-size: 0.75rem; animation: pulse 1.5s infinite"></i>' : ''}
                    <span>${show.title}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    ${selectedDay === 'all' ? `<span class="schedule-item-day">${show.releaseDay.slice(0, 3)}</span>` : ''}
                    <span class="schedule-item-time"><i class="fa-regular fa-clock"></i> ${show.releaseTime}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renders the main grid of shows based on searches, filters, and sorting.
 */
function renderShowsGrid() {
    const gridEl = document.getElementById('shows-grid');
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
    
    // Update Grid count
    document.getElementById('grid-count').innerText = `${filteredShows.length} show${filteredShows.length === 1 ? '' : 's'}`;
    
    if (filteredShows.length === 0) {
        gridEl.innerHTML = '';
        emptyStateEl.style.display = 'flex';
        return;
    }
    
    emptyStateEl.style.display = 'none';
    
    const todayName = DAYS_ARRAY[new Date().getDay()];
    
    gridEl.innerHTML = filteredShows.map(show => {
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
                        ${show.watchUrl ? `
                            <a class="watch-link" href="${show.watchUrl}" target="_blank" rel="noopener noreferrer">
                                <i class="fa-solid fa-circle-play"></i> Watch Now
                            </a>
                        ` : `
                            <span class="watch-link" style="opacity: 0.3; cursor: not-allowed;">
                                <i class="fa-solid fa-circle-play"></i> No Stream Link
                            </span>
                        `}
                        <div class="card-ctrls">
                            <button class="ctrl-btn edit-btn" title="Edit show"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="ctrl-btn delete-btn" title="Delete show"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join('');
}

/**
 * Triggers re-render for UI parts that do not require full updates.
 * Keeps running timers synchronized smoothly.
 */
function updateTimers() {
    renderHeroBanner();
    renderShowsGrid();
    
    // Update live clock
    const clockEl = document.getElementById('clock-display');
    const localNow = new Date();
    clockEl.innerText = localNow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + DAYS_ARRAY[localNow.getDay()] + ')';
}

/* ==========================================================================
   EVENT HANDLERS & INITIALIZATION
   ========================================================================== */

/**
 * Saves the current shows list state to LocalStorage and triggers layout updates.
 */
function saveState() {
    localStorage.setItem('donghua_shows', JSON.stringify(shows));
    updateStats();
    renderWeeklySchedule();
    renderHeroBanner();
    renderShowsGrid();
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
        document.getElementById('show-release-day').value = showData.releaseDay;
        document.getElementById('show-release-time').value = showData.releaseTime;
        document.getElementById('show-current-ep').value = showData.currentEp;
        document.getElementById('show-total-ep').value = showData.totalEp;
        document.getElementById('show-poster').value = showData.poster || '';
        document.getElementById('show-notes').value = showData.notes || '';
    } else {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Donghua';
        // Set default release day based on today
        const todayDay = DAYS_ARRAY[new Date().getDay()];
        document.getElementById('show-release-day').value = todayDay;
        document.getElementById('show-release-time').value = "10:00";
        document.getElementById('show-current-ep').value = 0;
        document.getElementById('show-total-ep').value = 12;
    }
    
    modalEl.style.display = 'flex';
}

function closeModal() {
    document.getElementById('donghua-modal').style.display = 'none';
}

// Bind Global UI Listeners
document.addEventListener('DOMContentLoaded', () => {
    
    // Update basic stats immediately
    updateStats();
    renderWeeklySchedule();
    renderHeroBanner();
    renderShowsGrid();
    
    // Clock/Timer Loop
    setInterval(updateTimers, 1000);
    
    // Modal Open Buttons
    document.getElementById('btn-add-show').addEventListener('click', () => openModal());
    
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
    });
    
    // Search box listener
    document.getElementById('search-input').addEventListener('input', (e) => {
        filters.search = e.target.value;
        renderShowsGrid();
    });
    
    // Status filters chips
    document.getElementById('filter-status').addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-chip')) {
            // Remove active from others
            document.querySelectorAll('#filter-status .filter-chip').forEach(c => c.classList.remove('active'));
            // Set active to clicked
            e.target.classList.add('active');
            
            filters.status = e.target.dataset.value;
            renderShowsGrid();
        }
    });
    
    // Sort dropdown change
    document.getElementById('sort-select').addEventListener('change', (e) => {
        filters.sortBy = e.target.value;
        renderShowsGrid();
    });
    
    // Reset filters button in Empty State
    document.getElementById('btn-reset-filters').addEventListener('click', () => {
        filters.search = '';
        filters.status = 'all';
        document.getElementById('search-input').value = '';
        document.querySelectorAll('#filter-status .filter-chip').forEach(c => {
            if (c.dataset.value === 'all') c.classList.add('active');
            else c.classList.remove('active');
        });
        renderShowsGrid();
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
    document.getElementById('shows-grid').addEventListener('click', (e) => {
        const card = e.target.closest('.show-card');
        if (!card) return;
        
        const showId = card.dataset.id;
        const showIdx = shows.findIndex(s => s.id === showId);
        if (showIdx === -1) return;
        const show = shows[showIdx];
        
        // Plus button clicked
        if (e.target.closest('.btn-plus')) {
            e.stopPropagation();
            if (show.totalEp === 0 || show.currentEp < show.totalEp) {
                show.currentEp++;
                show.lastUpdated = Date.now();
                
                // If it hits total episodes, automatically prompt or transition to completed status
                if (show.totalEp > 0 && show.currentEp === show.totalEp) {
                    show.status = 'completed';
                }
                saveState();
            }
        }
        
        // Minus button clicked
        else if (e.target.closest('.btn-minus')) {
            e.stopPropagation();
            if (show.currentEp > 0) {
                show.currentEp--;
                show.lastUpdated = Date.now();
                // If they reduce below total episode, transition back to ongoing if it was completed
                if (show.status === 'completed' && show.currentEp < show.totalEp) {
                    show.status = 'ongoing';
                }
                saveState();
            }
        }
        
        // Edit button clicked
        else if (e.target.closest('.edit-btn')) {
            e.stopPropagation();
            openModal(show);
        }
        
        // Delete button clicked
        else if (e.target.closest('.delete-btn')) {
            e.stopPropagation();
            const confirmDelete = confirm(`Are you sure you want to remove "${show.title}" from your list?`);
            if (confirmDelete) {
                shows.splice(showIdx, 1);
                saveState();
            }
        }
    });
});
