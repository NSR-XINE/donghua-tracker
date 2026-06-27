/* ==========================================================================
   STATE MANAGEMENT & DEFAULT DATA
   ========================================================================== */

// Default mock data to populate local storage on first load
const DEFAULT_DONGHUA = [
    {
        id: "dh-1",
        title: "Swallowed Star",
        titleZh: "吞噬星空",
        status: "ongoing",
        releaseDay: "Wednesday",
        releaseTime: "10:00",
        currentEp: 227,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Luo Feng strives to protect Earth and reach the peak of cosmic cultivation in a post-apocalyptic future.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-2",
        title: "Perfect World",
        titleZh: "完美世界",
        status: "ongoing",
        releaseDay: "Friday",
        releaseTime: "10:00",
        currentEp: 275,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Shi Hao, a cultivation genius born in a desolate wilderness, trains to become the savior of the universe.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-3",
        title: "Throne of Seal",
        titleZh: "神印王座",
        status: "completed",
        releaseDay: "Thursday",
        releaseTime: "10:00",
        currentEp: 104,
        totalEp: 104,
        poster: "",
        watchUrl: "",
        notes: "Long Haochen rises through the ranks of the Temple Alliance to defeat the Demon Emperor and save humanity.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-4",
        title: "Soul Land 2",
        titleZh: "斗罗大陆II绝世唐门",
        status: "ongoing",
        releaseDay: "Saturday",
        releaseTime: "10:00",
        currentEp: 159,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Huo Yuhao and a new generation of Shrek Academy students revive the legendary Tang Sect.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-5",
        title: "A Mortal's Journey to Immortality",
        titleZh: "凡人修仙传",
        status: "ongoing",
        releaseDay: "Sunday",
        releaseTime: "11:00",
        currentEp: 176,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Han Li, an ordinary village boy, uses his cunning and a mysterious bottle to survive the cutthroat world of cultivators.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-6",
        title: "Battle Through the Heavens",
        titleZh: "斗破苍穹年番",
        status: "ongoing",
        releaseDay: "Sunday",
        releaseTime: "10:00",
        currentEp: 203,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Xiao Yan works to obtain Heavenly Flames and defeat the sinister Hall of Souls.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-7",
        title: "Renegade Immortal",
        titleZh: "仙逆",
        status: "ongoing",
        releaseDay: "Monday",
        releaseTime: "10:00",
        currentEp: 146,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Wang Lin cultivates ruthlessly to seek vengeance and forge his own path of immortality.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-8",
        title: "Jade Dynasty",
        titleZh: "诛仙",
        status: "completed",
        releaseDay: "Saturday",
        releaseTime: "10:00",
        currentEp: 26,
        totalEp: 26,
        poster: "",
        watchUrl: "",
        notes: "Zhang Xiaofan gets caught in the tragic conflict between the righteous sects and the demonic faction.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-9",
        title: "Lingwu Continent",
        titleZh: "灵武大陆",
        status: "ongoing",
        releaseDay: "Tuesday",
        releaseTime: "10:00",
        currentEp: 1,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "A young cultivator battles through adversity to become the sovereign of the Lingwu Continent.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-10",
        title: "Apotheosis",
        titleZh: "百炼成神",
        status: "ongoing",
        releaseDay: "Friday",
        releaseTime: "10:00",
        currentEp: 104,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Luo Zheng trains his physical body to become a supreme weapon to rescue his sister. Stopped at Season 3 Episode 26.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-11",
        title: "A Moment But Forever",
        titleZh: "念无双",
        status: "completed",
        releaseDay: "Wednesday",
        releaseTime: "10:00",
        currentEp: 12,
        totalEp: 12,
        poster: "",
        watchUrl: "",
        notes: "The emotional connection and battles of immortals spanning across realms.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-12",
        title: "Over the Divine Realms",
        titleZh: "跨界神域",
        status: "completed",
        releaseDay: "Thursday",
        releaseTime: "10:00",
        currentEp: 12,
        totalEp: 12,
        poster: "",
        watchUrl: "",
        notes: "Legendary warriors break through boundaries and rule across divine boundaries.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-13",
        title: "Against the Gods",
        titleZh: "逆天邪神",
        status: "ongoing",
        releaseDay: "Friday",
        releaseTime: "10:00",
        currentEp: 43,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Yun Che rises from a crippled state to defy the heavens using ancient artifacts. Currently watching Season 2 Episode 13.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-14",
        title: "Stellar Transformation",
        titleZh: "星辰变",
        status: "completed",
        releaseDay: "Monday",
        releaseTime: "10:00",
        currentEp: 84,
        totalEp: 84,
        poster: "",
        watchUrl: "",
        notes: "Qin Yu transcends physical limits by practicing stellar techniques. Completed Season 7 Episode 12.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-15",
        title: "In the Search of Gods",
        titleZh: "寻找神仙",
        status: "ongoing",
        releaseDay: "Tuesday",
        releaseTime: "10:00",
        currentEp: 1,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "A journey through mythical mountains in search of legendary immortals.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-16",
        title: "The Great Ruler",
        titleZh: "大主宰",
        status: "ongoing",
        releaseDay: "Friday",
        releaseTime: "10:00",
        currentEp: 79,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Mu Chen rises from a small spiritual academy to rule over the Great Thousand World.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-17",
        title: "Tomb of the Fallen Gods",
        titleZh: "神墓",
        status: "ongoing",
        releaseDay: "Saturday",
        releaseTime: "10:00",
        currentEp: 80,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Chen Nan wakes up from a grave in the tomb of gods after ten thousand years. Currently watching Season 3 Episode 48.",
        lastUpdated: Date.now()
    },
    {
        id: "dh-18",
        title: "Shrouding the Heavens",
        titleZh: "遮天",
        status: "ongoing",
        releaseDay: "Wednesday",
        releaseTime: "10:00",
        currentEp: 168,
        totalEp: 0,
        poster: "",
        watchUrl: "",
        notes: "Ye Fan is pulled into a galactic journey by a casket pulled by nine dragon corpses.",
        lastUpdated: Date.now()
    }
];

// Load shows from localStorage or default
let shows = JSON.parse(localStorage.getItem('donghua_shows'));
const FORCE_SEED_VERSION = 5;
if (localStorage.getItem('force_seed_version') !== String(FORCE_SEED_VERSION) || !shows || shows.length === 0) {
    shows = DEFAULT_DONGHUA;
    localStorage.setItem('donghua_shows', JSON.stringify(shows));
    localStorage.setItem('force_seed_version', String(FORCE_SEED_VERSION));
} else {
    // Check if defaults are missing
    let updated = false;
    DEFAULT_DONGHUA.forEach(defaultShow => {
        if (!shows.some(s => s.title.toLowerCase() === defaultShow.title.toLowerCase())) {
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
    
    if (filteredShows.length === 0) {
        containerEl.innerHTML = '';
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
    setInterval(updateTimers, 1000);
    
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
    document.getElementById('shows-sections-container').addEventListener('click', (e) => {
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

    // Disable context menu for a fully native app feel
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Initialize mobile navigation tab state
    switchTab('home');

    // Dismiss App Loading Splash Overlay after initializing systems
    setTimeout(() => {
        const loader = document.getElementById('app-loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
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
    const filtersPanel = document.querySelector('.panel-filters');
    const devPanel = document.querySelector('.panel-dev-info');
    const scheduleContainer = document.querySelector('.schedule-container');
    const heroBanner = document.getElementById('next-up-banner');
    const sectionsContainer = document.getElementById('shows-sections-container');
    const statsPanel = document.querySelector('.stats-panel');
    
    // Mobile Viewport Check (corresponds to CSS max-width: 1024px)
    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        // Hide all major areas first
        if (searchPanel) searchPanel.style.setProperty('display', 'none', 'important');
        if (filtersPanel) filtersPanel.style.setProperty('display', 'none', 'important');
        if (devPanel) devPanel.style.setProperty('display', 'none', 'important');
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
        } else if (tabName === 'filters') {
            if (searchPanel) searchPanel.style.setProperty('display', 'block', 'important');
            if (filtersPanel) filtersPanel.style.setProperty('display', 'block', 'important');
        } else if (tabName === 'info') {
            if (devPanel) devPanel.style.setProperty('display', 'block', 'important');
        }
    } else {
        // Desktop Viewport: Restore standard styles and clear important display sets
        if (searchPanel) searchPanel.style.display = '';
        if (filtersPanel) filtersPanel.style.display = '';
        if (devPanel) devPanel.style.display = '';
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
