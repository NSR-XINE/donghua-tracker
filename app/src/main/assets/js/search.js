/**
 * Donghua Tracker - Search & Query Processing Module
 * Implements real-time filtering across titles, Chinese alt titles, release days, notes, and status,
 * with debounced inputs to keep UI layouts performant and lag-free.
 */
(function(window) {
    const Search = {};

    let activeQuery = '';

    /**
     * Filters a list of shows based on the active search text.
     */
    Search.filterList = function(shows) {
        if (!activeQuery) return shows;
        
        const q = activeQuery.toLowerCase().trim();
        return shows.filter(show => {
            return (show.title && show.title.toLowerCase().includes(q))
                || (show.titleZh && show.titleZh.toLowerCase().includes(q))
                || (show.releaseDay && show.releaseDay.toLowerCase().includes(q))
                || (show.status && show.status.toLowerCase().includes(q))
                || (show.notes && show.notes.toLowerCase().includes(q));
        });
    };

    /**
     * Executes the filtered rendering based on the search query.
     */
    Search.execute = function() {
        const queryInput = document.getElementById('search-input');
        if (!queryInput) return;

        activeQuery = queryInput.value;

        // Apply filters, sorting, and search in order
        const baseShows = App.Storage.getShows();
        const searched = Search.filterList(baseShows);
        const filtered = App.Filter.applyFilters(searched);
        const sorted = App.Filter.applySorting(filtered);

        App.Cards.renderShowsGrid(sorted);
    };

    /**
     * Initializes the search input listener with a 300ms debounce timer.
     */
    Search.initialize = function() {
        const queryInput = document.getElementById('search-input');
        if (!queryInput) return;

        const debouncedSearch = App.Utils.debounce(() => {
            Search.execute();
        }, 300);

        queryInput.addEventListener('input', debouncedSearch);
    };

    window.App = window.App || {};
    window.App.Search = Search;
})(window);
