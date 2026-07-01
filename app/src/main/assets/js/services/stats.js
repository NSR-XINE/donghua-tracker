function computeStats() {
    const total = shows.length;
    const airing = shows.filter(s => s.status === 'ongoing').length;
    const completed = shows.filter(s => s.status === 'completed').length;
    const stopped = shows.filter(s => s.status === 'stopped').length;
    const totalEpisodes = shows.reduce((sum, s) => sum + (s.currentEp || 0), 0);
    const favorites = shows.filter(s => s.isFavorite).length;
    const hoursWatched = Math.round((totalEpisodes * 24) / 60);
    return { total, airing, completed, stopped, totalEpisodes, favorites, hoursWatched };
}

function updateStats() {
    const stats = computeStats();
    const el = (id) => document.getElementById(id);
    if (el('stat-total')) el('stat-total').innerText = stats.total;
    if (el('stat-watching')) el('stat-watching').innerText = stats.airing;
    if (el('stat-completed')) el('stat-completed').innerText = stats.completed;
    if (el('stat-episodes')) el('stat-episodes').innerText = stats.totalEpisodes;
    if (el('stat-favorites')) el('stat-favorites').innerText = stats.favorites;
    if (el('stat-hours')) el('stat-hours').innerText = stats.hoursWatched;
    return stats;
}
