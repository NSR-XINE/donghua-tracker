let recentSearches = [];

function loadRecentSearches() {
    try {
        const raw = DB.getSetting('recent_searches', '');
        if (raw) recentSearches = JSON.parse(raw);
    } catch(e) { recentSearches = []; }
    if (!Array.isArray(recentSearches)) recentSearches = [];
}

function getSearchSuggestions(query) {
    loadRecentSearches();
    const q = query.trim().toLowerCase();
    if (!q || q.length < 1) return [];
    const matches = new Set();
    shows.forEach(show => {
        if (show.title.toLowerCase().includes(q)) matches.add(show.title);
        if (show.titleZh && show.titleZh.toLowerCase().includes(q)) matches.add(show.titleZh);
        if (show.notes && show.notes.toLowerCase().includes(q)) matches.add(show.title);
    });
    recentSearches.forEach(s => {
        if (s.includes(q)) matches.add('🔍 ' + s);
    });
    return Array.from(matches).slice(0, 5);
}

function updateSearchSuggestions(suggestions) {
    let container = document.getElementById('search-suggestions');
    if (!container) {
        container = document.createElement('div');
        container.id = 'search-suggestions';
        container.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;z-index:1000;max-height:200px;overflow-y:auto;margin-top:4px;';
        document.querySelector('.search-box')?.appendChild(container);
    }
    if (!suggestions || suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'block';
    container.innerHTML = suggestions.map(s => `<div style="padding:0.5rem 0.8rem;cursor:pointer;font-size:0.85rem;color:var(--text-secondary);border-bottom:1px solid var(--border-color);transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'" onclick="document.getElementById('search-input').value='${escapeHtml(s.replace('🔍 ', '')).replace(/'/g, "\\'")}'; document.getElementById('search-input').dispatchEvent(new Event('input')); this.parentElement.style.display='none'">${escapeHtml(s)}</div>`).join('');
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const debouncedSearch = debounce(() => {
        filters.search = searchInput.value;
        renderShowsGrid();
        renderHeroBanner();
    }, 200);

    searchInput.addEventListener('input', debouncedSearch);
    const debouncedSuggestions = debounce(() => {
        const suggestions = getSearchSuggestions(searchInput.value);
        updateSearchSuggestions(suggestions);
    }, 150);
    searchInput.addEventListener('input', debouncedSuggestions);
}
