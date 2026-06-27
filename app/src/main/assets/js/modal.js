/**
 * Donghua Tracker - Form Modal & Data Entry Module
 * Controls opening/closing the add/edit dialogs, form validation,
 * and saving show records (merging status transitions, rating scales, and custom banner links).
 */
(function(window) {
    const Modal = {};

    /**
     * Opens the add/edit dialog.
     */
    Modal.open = function(showData = null) {
        const modalEl = document.getElementById('donghua-modal');
        const formEl = document.getElementById('donghua-form');
        if (!modalEl || !formEl) return;

        formEl.reset();
        document.getElementById('show-id').value = '';
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Donghua';

        if (showData) {
            document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Donghua';
            document.getElementById('show-id').value = showData.id || '';
            document.getElementById('show-title').value = showData.title || '';
            document.getElementById('show-title-zh').value = showData.titleZh || '';
            document.getElementById('show-status').value = showData.status || 'ongoing';
            document.getElementById('show-watch-url').value = showData.watchUrl || '';
            document.getElementById('show-countdown-url').value = showData.countdownUrl || '';
            document.getElementById('show-release-day').value = showData.releaseDay || 'Monday';
            document.getElementById('show-release-time').value = showData.releaseTime || '10:00';
            document.getElementById('show-current-ep').value = showData.currentEp !== undefined ? showData.currentEp : 0;
            document.getElementById('show-total-ep').value = showData.totalEp !== undefined ? showData.totalEp : 0;
            document.getElementById('show-poster').value = showData.poster || '';
            document.getElementById('show-notes').value = showData.notes || '';
        }

        modalEl.style.display = 'flex';
        document.body.classList.add('modal-open');
    };

    /**
     * Closes the dialog.
     */
    Modal.close = function() {
        const modalEl = document.getElementById('donghua-modal');
        if (modalEl) {
            modalEl.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    };

    /**
     * Processes form submission and saves state.
     */
    Modal.submit = function(e) {
        e.preventDefault();

        const id = document.getElementById('show-id').value.trim();
        const title = document.getElementById('show-title').value.trim();
        const titleZh = document.getElementById('show-title-zh').value.trim();
        const status = document.getElementById('show-status').value;
        const watchUrl = document.getElementById('show-watch-url').value.trim();
        const countdownUrl = document.getElementById('show-countdown-url').value.trim();
        const releaseDay = document.getElementById('show-release-day').value;
        const releaseTime = document.getElementById('show-release-time').value;
        const currentEp = parseInt(document.getElementById('show-current-ep').value) || 0;
        const totalEp = parseInt(document.getElementById('show-total-ep').value) || 0;
        const poster = document.getElementById('show-poster').value.trim();
        const notes = document.getElementById('show-notes').value.trim();

        if (!title) {
            alert('Title is required!');
            return;
        }

        // Fetch existing show to preserve dateAdded, isFavorite, rating
        let existingShow = null;
        if (id) {
            const shows = App.Storage.getShows();
            existingShow = shows.find(s => s.id === id);
        }

        const show = {
            id: id || null,
            title,
            titleZh,
            status,
            watchUrl,
            countdownUrl,
            releaseDay,
            releaseTime,
            currentEp,
            totalEp,
            poster,
            notes,
            isFavorite: existingShow ? existingShow.isFavorite : false,
            rating: existingShow ? existingShow.rating : 0,
            dateAdded: existingShow ? existingShow.dateAdded : Date.now(),
            lastUpdated: Date.now()
        };

        // If completed status is chosen, lock current episode to total episodes (if greater than 0)
        if (show.status === 'completed' && show.totalEp > 0) {
            show.currentEp = show.totalEp;
        }

        App.Storage.saveShow(show);

        // Sync Alarm Reminders
        if (show.status === 'ongoing') {
            App.Notifications.schedule(show);
        } else {
            App.Notifications.cancel(show);
        }

        // Trigger background banner scraper if poster is missing and link is present
        if (show.countdownUrl && !show.poster && window.App.Scraper) {
            window.App.Scraper.fetchShowBanner(show.id, show.countdownUrl);
        }

        // Close modal and refresh UI
        Modal.close();
        
        // Refresh grids and stats
        App.Stats.update();
        App.Cards.renderWeeklySchedule();
        App.Cards.renderHeroBanner();
        App.Cards.renderShowsGrid();
    };

    window.App = window.App || {};
    window.App.Modal = Modal;
})(window);
