/**
 * Donghua Tracker - Watch Statistics Module
 * Computes tracked counts, total episodes watched, estimated hours,
 * and compiles weekly/monthly progress statistics from user history logs.
 */
(function(window) {
    const Stats = {};

    /**
     * Re-calculates and renders all statistics metrics in the UI.
     */
    Stats.update = function() {
        const shows = App.Storage.getShows();
        const history = App.Storage.getHistory();
        
        const totalCount = shows.length;
        const watchingCount = shows.filter(s => s.status === 'ongoing').length;
        const completedCount = shows.filter(s => s.status === 'completed').length;
        
        // Sum total episodes watched across all shows
        const totalEps = shows.reduce((sum, s) => sum + (s.currentEp || 0), 0);
        
        // Estimate watch time: assume average 20 minutes per episode
        const totalHours = ((totalEps * 20) / 60).toFixed(1);

        // Update home header stats
        const elTotal = document.getElementById('stat-total');
        if (elTotal) elTotal.innerText = totalCount;
        
        const elWatching = document.getElementById('stat-watching');
        if (elWatching) elWatching.innerText = watchingCount;
        
        const elCompleted = document.getElementById('stat-completed');
        if (elCompleted) elCompleted.innerText = completedCount;
        
        const elEpisodes = document.getElementById('stat-episodes');
        if (elEpisodes) elEpisodes.innerText = totalEps;

        // Calculate Airing Today
        const todayName = App.Utils.DAYS_ARRAY[new Date().getDay()];
        const airingToday = shows.filter(s => s.status === 'ongoing' && s.releaseDay === todayName).length;
        
        // Detailed breakdowns
        const plannedCount = shows.filter(s => s.status === 'planned').length;
        const droppedCount = shows.filter(s => s.status === 'dropped' || s.status === 'onhold').length;

        // Render detailed analytics values
        const elHours = document.getElementById('stat-hours-watched');
        if (elHours) elHours.innerText = totalHours + 'h';
        
        const elAiring = document.getElementById('stat-airing-today');
        if (elAiring) elAiring.innerText = airingToday;
        
        const elPlanned = document.getElementById('stat-planned-count');
        if (elPlanned) elPlanned.innerText = plannedCount;
        
        const elDropped = document.getElementById('stat-dropped-count');
        if (elDropped) elDropped.innerText = droppedCount;

        // Compute history progress activity
        const now = Date.now();
        const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
        const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

        let weekEps = 0;
        let monthEps = 0;

        // If history logs are present, count actual logs, otherwise fallback to current watched counts
        if (history && history.length > 0) {
            history.forEach(log => {
                const age = now - log.timestamp;
                if (age <= oneWeekMs) {
                    weekEps++;
                }
                if (age <= oneMonthMs) {
                    monthEps++;
                }
            });
        }

        const elWeek = document.getElementById('stat-week-eps');
        if (elWeek) elWeek.innerText = weekEps + ' eps';
        
        const elMonth = document.getElementById('stat-month-eps');
        if (elMonth) elMonth.innerText = monthEps + ' eps';
    };

    window.App = window.App || {};
    window.App.Stats = Stats;
})(window);
