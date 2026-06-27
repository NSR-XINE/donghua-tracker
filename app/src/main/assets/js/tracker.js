/**
 * Donghua Tracker - Action Controller Module
 * Handles click actions on show cards (episode increments, favorite stars, deletions, edit modals).
 * Log history records natively to SQLite on episode changes.
 */
(function(window) {
    const Tracker = {};

    /**
     * Delegates actions from grid click event targets.
     */
    Tracker.handleActionClick = function(e) {
        const card = e.target.closest('.show-card');
        if (!card) return;

        const id = card.dataset.id;
        const shows = App.Storage.getShows();
        const showIdx = shows.findIndex(s => s.id === id);
        if (showIdx === -1) return;

        const show = shows[showIdx];

        // 1. Favorite Toggle Clicked
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.stopPropagation();
            show.isFavorite = !show.isFavorite;
            show.lastUpdated = Date.now();
            App.Storage.saveShow(show);
            
            // Fast repaint of the favorite icon state instead of full grid refresh
            const icon = favBtn.querySelector('i');
            if (icon) {
                if (show.isFavorite) {
                    favBtn.classList.add('active');
                    icon.className = 'fa-solid fa-star';
                } else {
                    favBtn.classList.remove('active');
                    icon.className = 'fa-regular fa-star';
                }
            }
            App.Stats.update();
            return;
        }

        // 2. Plus Button Clicked
        const plusBtn = e.target.closest('.btn-plus');
        if (plusBtn) {
            e.stopPropagation();
            if (show.totalEp === 0 || show.currentEp < show.totalEp) {
                show.currentEp++;
                show.lastUpdated = Date.now();

                // If they hit total episodes, transition status to completed
                if (show.totalEp > 0 && show.currentEp === show.totalEp) {
                    show.status = 'completed';
                    App.Notifications.cancel(show); // Cancel alarms if completed
                }

                App.Storage.saveShow(show);
                App.Storage.addHistoryRecord(show.id, show.currentEp); // Log to watch history
                
                // Repaint UI
                Tracker.refreshRow(card, show);
                App.Stats.update();
            }
            return;
        }

        // 3. Minus Button Clicked
        const minusBtn = e.target.closest('.btn-minus');
        if (minusBtn) {
            e.stopPropagation();
            if (show.currentEp > 0) {
                show.currentEp--;
                show.lastUpdated = Date.now();

                // If decreased below total, set status back to ongoing
                if (show.status === 'completed' && show.currentEp < show.totalEp) {
                    show.status = 'ongoing';
                    App.Notifications.schedule(show); // Re-enable alarm reminders
                }

                App.Storage.saveShow(show);
                
                // Repaint UI
                Tracker.refreshRow(card, show);
                App.Stats.update();
            }
            return;
        }

        // 4. Edit Button Clicked
        const editBtn = e.target.closest('.edit-btn');
        if (editBtn) {
            e.stopPropagation();
            App.Modal.open(show);
            return;
        }

        // 5. Delete Button Clicked
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) {
            e.stopPropagation();
            const confirmDelete = confirm(`Are you sure you want to remove "${show.title}" from your tracker list?`);
            if (confirmDelete) {
                App.Storage.deleteShow(show.id);
                App.Notifications.cancel(show);
                
                // Repaint full grid and stats
                App.Stats.update();
                App.Cards.renderWeeklySchedule();
                App.Cards.renderHeroBanner();
                App.Cards.renderShowsGrid();
            }
            return;
        }
    };

    /**
     * Refreshes just the progress text/bar of a single card to avoid full grid reflows.
     */
    Tracker.refreshRow = function(cardEl, show) {
        const curEpVal = cardEl.querySelector('.current-ep-val');
        if (curEpVal) curEpVal.innerText = show.currentEp;

        const progressFill = cardEl.querySelector('.progress-fill');
        if (progressFill) {
            const ratio = show.totalEp > 0 ? (show.currentEp / show.totalEp * 100) : 100;
            progressFill.style.width = ratio + '%';
        }

        // If status changed (e.g. to completed), we should update class and tag
        if (show.status === 'completed') {
            cardEl.className = 'show-card completed';
            const tag = cardEl.querySelector('.card-tag');
            if (tag) {
                tag.className = 'card-tag completed';
                tag.innerText = 'Completed';
            }
            // Hide countdown if any
            const cd = cardEl.querySelector('.card-countdown');
            if (cd) cd.style.display = 'none';
        }
    };

    window.App = window.App || {};
    window.App.Tracker = Tracker;
})(window);
