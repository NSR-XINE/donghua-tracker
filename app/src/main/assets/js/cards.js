/**
 * Donghua Tracker - Card Renderer & Lazy Loading Module
 * Generates DOM cards, handles favorites clicks, renders schedule sliders,
 * and compiles the hero countdown banner. Supports lazy loading batches for large databases.
 */
(function(window) {
    const Cards = {};

    const BATCH_SIZE = 30;
    let currentRenderIndex = 0;
    let cachedShowsToRender = [];
    let scrollListenerAttached = false;

    /**
     * Appends the next batch of shows to the grid to optimize rendering performance.
     */
    Cards.renderNextBatch = function() {
        const grid = document.getElementById('shows-grid');
        if (!grid) return;

        const nextBatch = cachedShowsToRender.slice(currentRenderIndex, currentRenderIndex + BATCH_SIZE);
        if (nextBatch.length === 0) return;

        const fragment = document.createDocumentFragment();

        nextBatch.forEach(show => {
            const card = document.createElement('div');
            card.className = `show-card ${show.status}`;
            card.dataset.id = show.id;

            // Generate stable gradient as fallback
            const gradient = App.Utils.getPosterGradient(show.title);
            const posterStyle = show.poster 
                ? `background-image: url('${show.poster}')` 
                : `background: ${gradient}`;

            const schedule = App.Utils.getNextReleaseDate(show.releaseDay, show.releaseTime);
            
            // Build episode progress label
            const totalLabel = show.totalEp > 0 ? `/ ${show.totalEp}` : '';

            card.innerHTML = `
                <div class="card-poster" style="${posterStyle}">
                    <button class="favorite-btn ${show.isFavorite ? 'active' : ''}" title="Toggle Favorite">
                        <i class="${show.isFavorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                    </button>
                    ${show.status === 'ongoing' ? `<div class="card-tag">Ongoing</div>` : ''}
                    ${show.status === 'completed' ? `<div class="card-tag completed">Completed</div>` : ''}
                    ${show.status === 'planned' ? `<div class="card-tag planned">Planned</div>` : ''}
                </div>
                <div class="card-details">
                    <h3 class="card-title">${show.title}</h3>
                    ${show.titleZh ? `<div class="card-title-zh">${show.titleZh}</div>` : ''}
                    <div class="card-meta">
                        <span><i class="fa-solid fa-calendar-day"></i> ${show.releaseDay}</span>
                        <span><i class="fa-solid fa-clock"></i> ${show.releaseTime}</span>
                    </div>
                    
                    ${show.status === 'ongoing' ? `
                        <div class="card-countdown-title">Next Release:</div>
                        <div class="card-countdown" id="cd-${show.id}">
                            <!-- Ticked dynamically -->
                        </div>
                    ` : ''}

                    <div class="card-progress">
                        <div class="progress-info">
                            <span>Episode: <strong class="current-ep-val">${show.currentEp}</strong> ${totalLabel}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${show.totalEp > 0 ? (show.currentEp / show.totalEp * 100) : 100}%"></div>
                        </div>
                    </div>

                    <div class="card-actions">
                        <button class="btn-action btn-minus" title="Decrease Episode"><i class="fa-solid fa-minus"></i></button>
                        <button class="btn-action btn-plus" title="Increase Episode"><i class="fa-solid fa-plus"></i></button>
                        <button class="btn-action edit-btn" title="Edit Show"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn-action delete-btn" title="Delete Show"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;

            fragment.appendChild(card);

            // Register countdown timer node if ongoing
            if (show.status === 'ongoing') {
                const timerNode = card.querySelector(`#cd-${show.id}`);
                if (timerNode) {
                    App.Countdown.registerCard(timerNode, schedule.targetDate);
                }
            }
        });

        grid.appendChild(fragment);
        currentRenderIndex += BATCH_SIZE;
    };

    /**
     * Scroll check to load next batch.
     */
    const handleWindowScroll = function() {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 200) {
            Cards.renderNextBatch();
        }
    };

    /**
     * Triggers complete grid repaint.
     */
    Cards.renderShowsGrid = function(showsList) {
        const grid = document.getElementById('shows-grid');
        if (!grid) return;

        // Reset scroll position and clear elements
        grid.innerHTML = '';
        App.Countdown.clearRegistry();
        
        cachedShowsToRender = showsList || App.Storage.getShows();
        currentRenderIndex = 0;

        if (cachedShowsToRender.length === 0) {
            grid.innerHTML = `
                <div class="glass-card" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
                    <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; color: rgba(255,255,255,0.1)"></i>
                    <p style="margin: 0; font-size: 0.95rem;">No shows matched your active search or filters.</p>
                </div>
            `;
            return;
        }

        // Render initial batch
        Cards.renderNextBatch();

        // Attach infinite scroll listener if not already attached
        if (!scrollListenerAttached) {
            window.addEventListener('scroll', handleWindowScroll);
            scrollListenerAttached = true;
        }
    };

    /**
     * Renders the weekly calendar release slider.
     */
    Cards.renderWeeklySchedule = function() {
        const scheduleGrid = document.getElementById('weekly-schedule-grid');
        if (!scheduleGrid) return;

        scheduleGrid.innerHTML = '';
        const shows = App.Storage.getShows();

        App.Utils.DAYS_ARRAY.forEach(day => {
            const dayShows = shows.filter(s => s.status === 'ongoing' && s.releaseDay === day);
            
            const col = document.createElement('div');
            col.className = 'schedule-col';
            
            let showsHtml = dayShows.map(show => `
                <div class="schedule-item-card" data-id="${show.id}">
                    <div style="font-weight: 600; color: var(--text-primary); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${show.title}</div>
                    <div style="font-size: 0.7rem; color: var(--accent-cyan); display: flex; align-items: center; gap: 0.2rem; margin-top: 2px;">
                        <i class="fa-solid fa-clock"></i> ${show.releaseTime}
                    </div>
                </div>
            `).join('');

            if (dayShows.length === 0) {
                showsHtml = `<div class="schedule-empty">No Airings</div>`;
            }

            col.innerHTML = `
                <div class="schedule-day-header">${day}</div>
                <div class="schedule-items">
                    ${showsHtml}
                </div>
            `;
            scheduleGrid.appendChild(col);
        });
    };

    /**
     * Renders the Hero Banner countdown at the top.
     */
    Cards.renderHeroBanner = function() {
        const banner = document.getElementById('next-up-banner');
        if (!banner) return;

        const shows = App.Storage.getShows().filter(s => s.status === 'ongoing');
        if (shows.length === 0) {
            banner.style.display = 'none';
            return;
        }

        // Find the show with the shortest countdown duration
        let nextShow = null;
        let minDiff = Infinity;

        shows.forEach(show => {
            const schedule = App.Utils.getNextReleaseDate(show.releaseDay, show.releaseTime);
            const diff = schedule.targetDate.getTime() - Date.now();
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                nextShow = show;
            }
        });

        if (!nextShow) {
            banner.style.display = 'none';
            return;
        }

        const schedule = App.Utils.getNextReleaseDate(nextShow.releaseDay, nextShow.releaseTime);
        const gradient = App.Utils.getPosterGradient(nextShow.title);
        const backdropStyle = nextShow.poster 
            ? `background: linear-gradient(0deg, rgba(5,6,10,0.9) 0%, rgba(5,6,10,0.4) 100%), url('${nextShow.poster}') center/cover;`
            : `background: linear-gradient(135deg, rgba(5,6,10,0.95), rgba(5,6,10,0.7)), ${gradient};`;

        banner.style.display = 'block';
        banner.innerHTML = `
            <div class="hero-banner-card" style="${backdropStyle}">
                <div class="hero-badge"><i class="fa-solid fa-fire"></i> Next Releasing</div>
                <div class="hero-details">
                    <h2 class="hero-title">${nextShow.title}</h2>
                    ${nextShow.titleZh ? `<p class="hero-title-zh">${nextShow.titleZh}</p>` : ''}
                    <p class="hero-meta">Airing on ${nextShow.releaseDay} at ${nextShow.releaseTime}</p>
                    
                    <div class="hero-countdown" id="hero-countdown-box">
                        <!-- Ticking countdown boxes -->
                    </div>
                </div>
            </div>
        `;

        const countdownBox = document.getElementById('hero-countdown-box');
        if (countdownBox) {
            App.Countdown.registerBanner(countdownBox, schedule.targetDate);
        }
    };

    window.App = window.App || {};
    window.App.Cards = Cards;
})(window);
