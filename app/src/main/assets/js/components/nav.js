let activeTab = 'home';
Object.defineProperty(window, 'activeTab', { get() { return activeTab; }, set(v) { activeTab = v; } });

function switchTab(tabName) {
    if (tabName === 'add') return;
    activeTab = tabName;

    document.body.classList.remove('tab-home', 'tab-airing', 'tab-stopped', 'tab-complete', 'tab-favorites');
    document.body.classList.add(`tab-${tabName}`);

    document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-btn-${tabName}`);
    if (activeBtn) activeBtn.classList.add('active');

    const searchPanel = document.querySelector('.panel-search');
    const scheduleContainer = document.querySelector('.schedule-container');
    const heroBanner = document.getElementById('next-up-banner');
    const sectionsContainer = document.getElementById('shows-sections-container');
    const statsPanel = document.querySelector('.stats-panel');
    const controlPanel = document.querySelector('.control-panel');
    const contentArea = document.querySelector('.content-area');
    const emptyStateEl = document.getElementById('empty-state');

    const isMobile = window.innerWidth <= 1024;
    if (isMobile) {
        [searchPanel, scheduleContainer, heroBanner, sectionsContainer, emptyStateEl].forEach(el => {
            if (el) el.style.setProperty('display', 'none', 'important');
        });
        if (controlPanel) controlPanel.style.setProperty('display', 'none', 'important');
        if (contentArea) contentArea.style.setProperty('display', 'none', 'important');

        if (tabName === 'home') {
            if (contentArea) contentArea.style.setProperty('display', 'block', 'important');
            if (scheduleContainer) scheduleContainer.style.setProperty('display', 'block', 'important');
            if (heroBanner) { heroBanner.style.display = ''; renderHeroBanner(); }
            if (emptyStateEl && shows.length === 0) emptyStateEl.style.setProperty('display', 'flex', 'important');
        } else if (tabName === 'favorites' || tabName === 'airing' || tabName === 'complete' || tabName === 'stopped') {
            if (contentArea) contentArea.style.setProperty('display', 'block', 'important');
            if (sectionsContainer) sectionsContainer.style.setProperty('display', 'block', 'important');
            renderShowsGrid();
        }
    } else {
        [searchPanel, scheduleContainer, sectionsContainer, controlPanel, contentArea].forEach(el => {
            if (el) el.style.display = '';
        });
        renderHeroBanner();
    }

    if (statsPanel) {
        statsPanel.style.setProperty('display', tabName === 'home' ? 'flex' : 'none', 'important');
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
}

function triggerAddModal() {
    openModal();
}

function openDetailsById(showId) {
    const show = getShowById(showId);
    if (show) {
        if (show.status === 'ongoing') switchTab('airing');
        else if (show.status === 'completed') switchTab('complete');
        else if (show.status === 'stopped') switchTab('stopped');
        else switchTab('home');
        openDetailsModal(show);
    }
}
