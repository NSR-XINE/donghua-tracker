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
    return computeStats();
}
