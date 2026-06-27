/**
 * Donghua Tracker - Filtering & Sorting Module
 * Manages active status filters, special criteria states (favorites, airings),
 * and sorting routines (release time count, A-Z titles, updates, progress levels, rating scales).
 */
(function(window) {
    const Filter = {};

    Filter.activeStatus = 'all';
    Filter.activeSpecials = []; // Can contain 'favorites', 'airing-today'

    /**
     * Filters the given show array based on active status and special filters.
     */
    Filter.applyFilters = function(shows) {
        let result = [...shows];

        // 1. Filter by Status
        if (Filter.activeStatus !== 'all') {
            result = result.filter(s => s.status === Filter.activeStatus);
        }

        // 2. Filter by Specials (Multiple allowed)
        if (Filter.activeSpecials.includes('favorites')) {
            result = result.filter(s => s.isFavorite === true);
        }

        if (Filter.activeSpecials.includes('airing-today')) {
            const today = App.Utils.DAYS_ARRAY[new Date().getDay()];
            result = result.filter(s => s.status === 'ongoing' && s.releaseDay === today);
        }

        return result;
    };

    /**
     * Sorts the show array based on the active selection value.
     */
    Filter.applySorting = function(shows) {
        const sortSelect = document.getElementById('sort-select');
        const sortVal = sortSelect ? sortSelect.value : 'countdown';
        
        let result = [...shows];

        if (sortVal === 'alphabetical') {
            result.sort((a, b) => a.title.localeCompare(b.title));
        } 
        else if (sortVal === 'last-updated') {
            result.sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
        } 
        else if (sortVal === 'date-added') {
            result.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
        } 
        else if (sortVal === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } 
        else if (sortVal === 'progress') {
            result.sort((a, b) => {
                const aProg = a.totalEp > 0 ? (a.currentEp / a.totalEp) : 0;
                const bProg = b.totalEp > 0 ? (b.currentEp / b.totalEp) : 0;
                return bProg - aProg;
            });
        } 
        else if (sortVal === 'countdown') {
            // Sort ongoing releases by shortest remaining countdown time, then push non-ongoing to end
            result.sort((a, b) => {
                if (a.status === 'ongoing' && b.status === 'ongoing') {
                    const timeA = App.Utils.getNextReleaseDate(a.releaseDay, a.releaseTime).targetDate.getTime();
                    const timeB = App.Utils.getNextReleaseDate(b.releaseDay, b.releaseTime).targetDate.getTime();
                    return timeA - timeB;
                }
                if (a.status === 'ongoing') return -1;
                if (b.status === 'ongoing') return 1;
                return (b.lastUpdated || 0) - (a.lastUpdated || 0); // Fallback for completed/planned
            });
        }

        return result;
    };

    /**
     * Executes the combined filtering, search, and sorting render cycle.
     */
    Filter.executeRender = function() {
        const baseShows = App.Storage.getShows();
        const searched = App.Search.filterList(baseShows);
        const filtered = Filter.applyFilters(searched);
        const sorted = Filter.applySorting(filtered);
        App.Cards.renderShowsGrid(sorted);
    };

    /**
     * Binds filter chips and sort selector listeners.
     */
    Filter.initialize = function() {
        // Status chips click binding
        const statusChips = document.querySelectorAll('#filter-status .filter-chip');
        statusChips.forEach(chip => {
            chip.addEventListener('click', () => {
                statusChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                Filter.activeStatus = chip.dataset.value;
                Filter.executeRender();
            });
        });

        // Special filter chips click binding (supports multiple selections)
        const specialChips = document.querySelectorAll('#filter-special .filter-chip');
        specialChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const val = chip.dataset.value;
                if (chip.classList.contains('active')) {
                    chip.classList.remove('active');
                    Filter.activeSpecials = Filter.activeSpecials.filter(v => v !== val);
                } else {
                    chip.classList.add('active');
                    Filter.activeSpecials.push(val);
                }
                Filter.executeRender();
            });
        });

        // Sort select change binding
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                Filter.executeRender();
            });
        }
    };

    window.App = window.App || {};
    window.App.Filter = Filter;
})(window);
