/**
 * Donghua Tracker - Master Coordinator Module
 * Orchestrates application startup, layout bootstrapping, event delegations,
 * native deep-linking handlers, and loading overlay dismissals.
 */
(function(window) {
    
    // Bind main lifecycle load event
    document.addEventListener('DOMContentLoaded', () => {
        
        // 1. Initialize Storage & SQLite database schemas
        App.Storage.initialize();
        
        // 2. Load and apply settings configurations (AMOLED, accents)
        App.Settings.applySettings();
        App.Settings.initialize();
        
        // 3. Render header stats and card structures
        App.Stats.update();
        App.Cards.renderWeeklySchedule();
        App.Cards.renderHeroBanner();
        App.Cards.renderShowsGrid();

        // 4. Initialize search and filtering controls
        App.Search.initialize();
        App.Filter.initialize();

        // 5. Start live countdown clock loop
        App.Countdown.resume();

        // 6. Native Alarm Notifications Sync (runs once on launch)
        App.Notifications.syncAll();

        // 7. Auto-scrape missing cover art from AnimeCountdown pages
        setTimeout(() => {
            const shows = App.Storage.getShows();
            shows.forEach(show => {
                if (show.countdownUrl && !show.poster) {
                    App.Scraper.fetchShowBanner(show.id, show.countdownUrl);
                }
            });
        }, 1500);

        // 8. Bind global UI event listeners
        
        // Modal buttons
        const btnCloseModal = document.getElementById('btn-close-modal');
        if (btnCloseModal) btnCloseModal.addEventListener('click', App.Modal.close);
        
        const btnCancelModal = document.getElementById('btn-cancel-modal');
        if (btnCancelModal) btnCancelModal.addEventListener('click', App.Modal.close);
        
        const modalOverlay = document.getElementById('donghua-modal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'donghua-modal') App.Modal.close();
            });
        }

        // Form Submit
        const formEl = document.getElementById('donghua-form');
        if (formEl) {
            formEl.addEventListener('submit', App.Modal.submit);
        }

        // Add Show Buttons
        const btnAddShow = document.getElementById('btn-add-show');
        if (btnAddShow) {
            btnAddShow.addEventListener('click', () => App.Modal.open());
        }

        const btnAddShortcut = document.getElementById('nav-btn-add');
        if (btnAddShortcut) {
            btnAddShortcut.addEventListener('click', () => App.Modal.open());
        }

        // Action grid click delegation (episode adjustments, edits, deletes, favorites)
        const grid = document.getElementById('shows-grid');
        if (grid) {
            grid.addEventListener('click', App.Tracker.handleActionClick);
        }

        // Mobile Nav Tabs switcher delegation
        const navItems = document.querySelectorAll('.bottom-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                if (tab) switchTab(tab);
            });
        });

        // 9. Wipe loading splash overlay
        setTimeout(() => {
            const loader = document.getElementById('app-loading-screen');
            if (loader) {
                loader.classList.add('fade-out');
                setTimeout(() => loader.remove(), 600);
            }
        }, 1600);
    });

    /**
     * Mobile Navigation View Tab Controller
     */
    window.switchTab = function(tabName) {
        if (tabName === 'add') return;
        
        // Update nav items active states
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`.bottom-nav .nav-item[data-tab="${tabName}"]`);
        if (activeBtn) activeBtn.classList.add('active');
        
        // Target main container elements
        const searchPanel = document.querySelector('.panel-search');
        const filtersPanel = document.querySelector('.panel-filters');
        const devPanel = document.querySelector('.panel-dev-info');
        const backupPanel = document.querySelector('.panel-backup-info');
        const analyticsPanel = document.querySelector('.panel-detailed-stats');
        const settingsPanel = document.querySelector('.panel-settings');
        const scheduleContainer = document.querySelector('.schedule-container');
        const heroBanner = document.getElementById('next-up-banner');
        const sectionsContainer = document.getElementById('shows-sections-container');
        const statsPanel = document.querySelector('.stats-panel');
        
        const isMobile = window.innerWidth <= 1024;
        if (isMobile) {
            // Hide all areas
            if (searchPanel) searchPanel.style.setProperty('display', 'none', 'important');
            if (filtersPanel) filtersPanel.style.setProperty('display', 'none', 'important');
            if (devPanel) devPanel.style.setProperty('display', 'none', 'important');
            if (backupPanel) backupPanel.style.setProperty('display', 'none', 'important');
            if (analyticsPanel) analyticsPanel.style.setProperty('display', 'none', 'important');
            if (settingsPanel) settingsPanel.style.setProperty('display', 'none', 'important');
            if (scheduleContainer) scheduleContainer.style.setProperty('display', 'none', 'important');
            if (heroBanner) heroBanner.style.setProperty('display', 'none', 'important');
            if (sectionsContainer) sectionsContainer.style.setProperty('display', 'none', 'important');
            if (statsPanel) statsPanel.style.setProperty('display', 'none', 'important');
            
            // Show only target tab
            if (tabName === 'home') {
                if (sectionsContainer) sectionsContainer.style.setProperty('display', 'block', 'important');
                if (statsPanel) statsPanel.style.setProperty('display', 'flex', 'important');
                if (heroBanner) {
                    heroBanner.style.display = '';
                    App.Cards.renderHeroBanner();
                }
            } else if (tabName === 'schedule') {
                if (scheduleContainer) scheduleContainer.style.setProperty('display', 'block', 'important');
            } else if (tabName === 'filters') {
                if (searchPanel) searchPanel.style.setProperty('display', 'block', 'important');
                if (filtersPanel) filtersPanel.style.setProperty('display', 'block', 'important');
            } else if (tabName === 'info') {
                if (devPanel) devPanel.style.setProperty('display', 'block', 'important');
                if (backupPanel) backupPanel.style.setProperty('display', 'block', 'important');
                if (analyticsPanel) analyticsPanel.style.setProperty('display', 'block', 'important');
                if (settingsPanel) settingsPanel.style.setProperty('display', 'block', 'important');
            }
        } else {
            // Desktop viewport default sets
            if (searchPanel) searchPanel.style.display = '';
            if (filtersPanel) filtersPanel.style.display = '';
            if (devPanel) devPanel.style.display = '';
            if (backupPanel) backupPanel.style.display = '';
            if (analyticsPanel) analyticsPanel.style.display = '';
            if (settingsPanel) settingsPanel.style.display = '';
            if (scheduleContainer) scheduleContainer.style.display = '';
            if (heroBanner) {
                heroBanner.style.display = '';
                App.Cards.renderHeroBanner();
            }
            if (sectionsContainer) sectionsContainer.style.display = '';
            if (statsPanel) statsPanel.style.display = '';
        }
    };

    /**
     * Native deep-link notification tap handler.
     */
    window.showNotificationDetail = function(showId) {
        if (!showId) return;
        const shows = App.Storage.getShows();
        const targetShow = shows.find(s => s.id === showId);
        if (targetShow) {
            // Switch view to home first to draw the modal correctly
            window.switchTab('home');
            // Open target edit details modal
            App.Modal.open(targetShow);
        }
    };

    /**
     * Native back-press dialog handlers.
     */
    window.showExitModal = function() {
        const exitDialog = document.getElementById('exit-modal');
        if (exitDialog) {
            exitDialog.style.display = 'flex';
        }
    };

    window.closeExitModal = function() {
        const exitDialog = document.getElementById('exit-modal');
        if (exitDialog) {
            exitDialog.style.display = 'none';
        }
    };

    window.confirmExitApp = function() {
        if (window.AndroidApp && window.AndroidApp.exitApp) {
            window.AndroidApp.exitApp();
        }
    };

    window.triggerAddModal = function() {
        App.Modal.open();
    };

})(window);
