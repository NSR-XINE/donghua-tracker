let searchSuggestions = [];
let recentSearches = [];

function loadRecentSearches() {
    try {
        const raw = DB.getSetting('recent_searches', '');
        if (raw) recentSearches = JSON.parse(raw);
    } catch(e) { recentSearches = []; }
    if (!Array.isArray(recentSearches)) recentSearches = [];
}

function saveRecentSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return;
    recentSearches = recentSearches.filter(s => s !== q);
    recentSearches.unshift(q);
    if (recentSearches.length > 10) recentSearches = recentSearches.slice(0, 10);
    DB.saveSetting('recent_searches', JSON.stringify(recentSearches));
}

function clearRecentSearches() {
    recentSearches = [];
    DB.saveSetting('recent_searches', '[]');
}

function performSearch(query) {
    const q = (query || '').trim();
    if (!q) return shows;

    loadRecentSearches();
    saveRecentSearch(q);

    const scored = shows.map(show => {
        let score = 0;
        const titleScore = getFuzzyScore(show.title, q);
        const titleZhScore = show.titleZh ? getFuzzyScore(show.titleZh, q) : 0;
        const notesScore = show.notes ? getFuzzyScore(show.notes, q) : 0;
        score = Math.max(titleScore, titleZhScore, notesScore);
        if (fuzzyMatch(show.title, q) || fuzzyMatch(show.titleZh, q)) {
            if (score < 40) score = 40;
        }
        return { show, score };
    }).filter(item => item.score > 0);

    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.show);
}

function getSearchSuggestions(query) {
    loadRecentSearches();
    const q = query.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    const matches = new Set();
    shows.forEach(show => {
        if (show.title.toLowerCase().includes(q)) matches.add(show.title);
        if (show.titleZh && show.titleZh.toLowerCase().includes(q)) matches.add(show.titleZh);
    });
    recentSearches.forEach(s => {
        if (s.includes(q)) matches.add('🔍 ' + s);
    });
    return Array.from(matches).slice(0, 5);
}
