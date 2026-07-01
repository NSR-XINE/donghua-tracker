let timerInterval = null;

function pauseTimers() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function resumeTimers() {
    if (!timerInterval) { timerInterval = setInterval(updateTimers, 1000); }
}

function updateTimers() {
    const clockEl = document.getElementById('clock-display');
    if (clockEl) {
        const now = new Date();
        clockEl.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + getTodayName() + ')';
    }

    const heroCD = document.getElementById('hero-countdown-box');
    if (heroCD) {
        const nextUp = getNextUpShow();
        if (nextUp && !nextUp.airingNow) {
            const time = calculateTimeRemaining(nextUp.targetDate);
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

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initTheme();

    let source = 'donghuastream';
    if (DB._available) source = DB.getSetting('pref_streaming_source', '') || DB.getLocal('pref_streaming_source') || 'donghuastream';
    else source = DB.getLocal('pref_streaming_source') || 'donghuastream';
    updateSourceUI(source);

    setupResizeObservers();
    updateStats();
    renderWeeklySchedule();
    renderHeroBanner();
    renderShowsGrid();
    resumeTimers();

    document.getElementById('btn-export-data')?.addEventListener('click', exportData);

    setupImportModal();
    setupDetailsModal();
    setupSettingsModal();
    setupFormSubmission();
    setupSearch();
    setupScheduleTabs();
    setupCardActions();
    setupPosterFetch();

    LOADING_MESSAGES.forEach((msg, idx) => {
        setTimeout(() => {
            const el = document.getElementById('loading-status-text');
            if (el) el.innerText = msg;
        }, idx * 300);
    });

    setTimeout(() => {
        const loader = document.getElementById('app-loading-screen');
        if (loader) {
            loader.classList.add('fade-out');
            document.body.classList.remove('loading-active');
            setTimeout(() => loader.remove(), 600);
        }
    }, 1600);

    addSwipeToDismiss('settings-modal', closeSettingsModal);
    addSwipeToDismiss('donghua-modal', closeModal);
    addSwipeToDismiss('import-modal', closeImportModal);
    addSwipeToDismiss('details-modal', closeDetailsModal);
    addSwipeToDismiss('exit-modal', closeExitModal);
    addSwipeToDismiss('history-modal', closeHistoryModal);
    addSwipeToDismiss('stats-modal', closeStatsModal);
    addSwipeToDismiss('calendar-modal', closeCalendarModal);
    addSwipeToDismiss('collections-modal', closeCollectionsModal);

    document.getElementById('btn-open-drawer')?.addEventListener('click', openDrawer);
    document.getElementById('btn-close-drawer')?.addEventListener('click', closeDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeDrawer);

    switchTab('home');

    document.getElementById('btn-close-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-modal')?.addEventListener('click', closeModal);
    document.getElementById('donghua-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'donghua-modal') closeModal();
    });

    document.addEventListener('contextmenu', e => e.preventDefault());

    window.addEventListener('resize', () => switchTab(activeTab));
});

function setupResizeObservers() {
    const header = document.querySelector('.app-header');
    if (header && typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => {
            document.documentElement.style.setProperty('--header-height', header.getBoundingClientRect().height + 'px');
        }).observe(header);
    }
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav && typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(() => {
            const rect = bottomNav.getBoundingClientRect();
            document.documentElement.style.setProperty('--bottom-nav-height', (window.innerHeight - rect.top) + 'px');
        }).observe(bottomNav);
    }
}

function setupImportModal() {
    const importModal = document.getElementById('import-modal');
    const btnTriggerImport = document.getElementById('btn-trigger-import');
    const btnCloseImport = document.getElementById('btn-close-import');
    const btnCancelImport = document.getElementById('btn-cancel-import');
    const btnSubmitImport = document.getElementById('btn-submit-import');
    const importFileInput = document.getElementById('import-file-input');
    const importFileName = document.getElementById('import-file-name');

    importFileInput?.addEventListener('change', () => {
        const file = importFileInput.files[0];
        if (!file) return;
        if (importFileName) importFileName.textContent = file.name;
        if (btnSubmitImport) {
            btnSubmitImport.disabled = false;
            btnSubmitImport.style.opacity = '1';
            btnSubmitImport.style.cursor = 'pointer';
        }
    });

    btnTriggerImport?.addEventListener('click', () => {
        if (importFileInput) importFileInput.value = '';
        if (importFileName) importFileName.textContent = 'No file selected';
        if (btnSubmitImport) {
            btnSubmitImport.disabled = true;
            btnSubmitImport.style.opacity = '0.5';
            btnSubmitImport.style.cursor = 'not-allowed';
        }
        if (importModal) { importModal.style.display = 'flex'; document.body.classList.add('modal-open'); }
    });

    if (btnCloseImport) btnCloseImport.addEventListener('click', closeImportModal);
    if (btnCancelImport) btnCancelImport.addEventListener('click', closeImportModal);
    if (importModal) importModal.addEventListener('click', (e) => { if (e.target.id === 'import-modal') closeImportModal(); });

    btnSubmitImport?.addEventListener('click', () => {
        const file = importFileInput?.files[0];
        if (!file) { alert('Please select a .json backup file first.'); return; }
        const reader = new FileReader();
        reader.onload = (e) => { if (importData(e.target.result)) closeImportModal(); };
        reader.onerror = () => alert('Failed to read file. Please try again.');
        reader.readAsText(file);
    });
}

function setupDetailsModal() {
    const detailsModal = document.getElementById('details-modal');
    const btnCloseDetails = document.getElementById('btn-close-details');

    btnCloseDetails?.addEventListener('click', closeDetailsModal);
    if (detailsModal) detailsModal.addEventListener('click', (e) => { if (e.target.id === 'details-modal') closeDetailsModal(); });
}

function setupSettingsModal() {
    const settingsModal = document.getElementById('settings-modal');
    if (settingsModal) settingsModal.addEventListener('click', (e) => { if (e.target.id === 'settings-modal') closeSettingsModal(); });
    document.getElementById('btn-open-settings')?.addEventListener('click', openSettingsModal);
}

function setupFormSubmission() {
    document.getElementById('btn-fetch-poster')?.addEventListener('click', () => {
        const title = document.getElementById('show-title')?.value.trim();
        fetchShowDetails(title, false);
    });

    document.getElementById('show-title')?.addEventListener('change', (e) => {
        const title = e.target.value.trim();
        fetchShowDetails(title, true);
    });

    document.getElementById('donghua-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const showId = document.getElementById('show-id')?.value;
        const newShowData = {
            title: document.getElementById('show-title')?.value?.trim() || '',
            titleZh: document.getElementById('show-title-zh')?.value?.trim() || '',
            status: document.getElementById('show-status')?.value || 'ongoing',
            watchUrl: document.getElementById('show-watch-url')?.value?.trim() || '',
            countdownUrl: document.getElementById('show-countdown-url')?.value?.trim() || '',
            releaseDay: document.getElementById('show-release-day')?.value || 'Sunday',
            releaseTime: document.getElementById('show-release-time')?.value || '10:00',
            currentEp: parseInt(document.getElementById('show-current-ep')?.value) || 0,
            totalEp: parseInt(document.getElementById('show-total-ep')?.value) || 0,
            poster: document.getElementById('show-poster')?.value?.trim() || '',
            collection: document.getElementById('show-collection')?.value?.trim() || '',
            notes: document.getElementById('show-notes')?.value?.trim() || '',
            lastUpdated: Date.now()
        };

        if (showId) {
            const idx = shows.findIndex(s => s.id === showId);
            if (idx !== -1) {
                newShowData.id = showId;
                newShowData.dateAdded = shows[idx].dateAdded || Date.now();
                Object.assign(shows[idx], newShowData);
            }
        } else {
            newShowData.id = 'dh-' + Date.now();
            newShowData.dateAdded = Date.now();
            shows.push(newShowData);
        }

        persistState();
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
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const debouncedSearch = debounce(() => {
        filters.search = searchInput.value;
        renderShowsGrid();
        renderHeroBanner();
    }, 200);

    searchInput.addEventListener('input', debouncedSearch);
    searchInput.addEventListener('input', () => {
        const suggestions = getSearchSuggestions(searchInput.value);
        updateSearchSuggestions(suggestions);
    });
}

function updateSearchSuggestions(suggestions) {
    let container = document.getElementById('search-suggestions');
    if (!container) {
        container = document.createElement('div');
        container.id = 'search-suggestions';
        container.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;z-index:1000;max-height:200px;overflow-y:auto;margin-top:4px;';
        document.querySelector('.search-box')?.appendChild(container);
    }
    if (!suggestions || suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';
    container.innerHTML = suggestions.map(s => `<div style="padding:0.5rem 0.8rem;cursor:pointer;font-size:0.85rem;color:var(--text-secondary);border-bottom:1px solid var(--border-color);transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'" onclick="document.getElementById('search-input').value='${escapeHtml(s.replace('🔍 ', ''))}'; document.getElementById('search-input').dispatchEvent(new Event('input')); this.parentElement.style.display='none'">${s}</div>`).join('');
}

function setupScheduleTabs() {
    document.getElementById('schedule-tabs')?.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('#schedule-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            scheduleDayFilter = e.target.dataset.day;
            renderWeeklySchedule();
        }
    });
}

function setupCardActions() {
    document.getElementById('shows-sections-container')?.addEventListener('click', (e) => {
        const card = e.target.closest('.show-card');
        if (!card) return;

        const isPlus = e.target.closest('.btn-plus');
        const isMinus = e.target.closest('.btn-minus');
        const isEdit = e.target.closest('.edit-btn');
        const isDelete = e.target.closest('.delete-btn');
        const isFavorite = e.target.closest('.favorite-btn');
        const isStream = e.target.closest('.watch-btn');
        const isCountdown = e.target.closest('.countdown-link');

        const showId = card.dataset.id;
        const show = getShowById(showId);
        if (!show) return;

        if (isPlus) { incrementEpisode(showId); }
        else if (isMinus) { decrementEpisode(showId); }
        else if (isEdit) { openModal(show); }
        else if (isFavorite) {
            toggleFavorite(showId);
            renderShowsGrid();
            const btn = document.querySelector(`.show-card[data-id="${showId}"] .favorite-btn`);
            if (btn) { btn.classList.add('animate'); setTimeout(() => btn.classList.remove('animate'), 500); }
        }
        else if (isDelete) {
            if (confirm(`Are you sure you want to remove "${show.title}" from your list?`)) {
                deleteShow(showId);
            }
        }
        else if (isStream || isCountdown) { return; }
        else { openDetailsModal(show); }
    });
}

function setupPosterFetch() {
    autoFetchPosters();
}

window.pauseTimers = pauseTimers;
window.resumeTimers = resumeTimers;
window.getWatchUrl = getWatchUrl;
window.getWatchUrlById = getWatchUrlById;
window.selectPreferredSource = selectPreferredSource;
window.updateSourceUI = updateSourceUI;
window.openWatchScreen = openWatchScreen;
window.exportData = exportData;
window.importData = importData;
window.syncAlarm = syncAlarm;
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;
window.hashCode = hashCode;
window.openDetailsModal = openDetailsModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.openSettingsModal = openSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.showExitModal = showExitModal;
window.closeExitModal = closeExitModal;
window.confirmExitApp = confirmExitApp;
window.openDetailsById = openDetailsById;
window.setThemeMode = setThemeMode;
window.handleBackPress = handleBackPress;
window.closeTopModal = closeTopModal;
window.switchTab = switchTab;
window.triggerAddModal = triggerAddModal;
window.renderShowsGrid = renderShowsGrid;
window.renderHeroBanner = renderHeroBanner;
window.renderWeeklySchedule = renderWeeklySchedule;
