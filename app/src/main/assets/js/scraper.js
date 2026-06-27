/**
 * Donghua Tracker - Banner Scraper Module
 * Asynchronously scrapes AnimeCountdown pages for OpenGraph image tags to preload high-res banners.
 */
(function(window) {
    const Scraper = {};

    /**
     * Scrapes cover banners from AnimeCountdown using the native HTTP downloader.
     */
    Scraper.fetchShowBanner = function(showId, countdownUrl) {
        if (!window.AndroidApp || !window.AndroidApp.fetchUrl) return;
        if (!countdownUrl || !countdownUrl.startsWith('http')) return;

        // Generate unique callback
        const callbackName = "cb_banner_" + showId.replace(/[^a-zA-Z0-9]/g, '') + "_" + Math.floor(Math.random() * 1000000);
        
        // Safety timeout to clean up callback if native call fails completely
        const timeoutId = setTimeout(() => {
            if (window[callbackName]) {
                delete window[callbackName];
            }
        }, 30000);

        window[callbackName] = function(html) {
            clearTimeout(timeoutId);
            delete window[callbackName];
            if (!html) return;
            
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Query OpenGraph Image Tag
                const ogImage = doc.querySelector('meta[property="og:image"]');
                const imageUrl = ogImage ? ogImage.getAttribute('content') : null;
                
                if (imageUrl) {
                    const shows = App.Storage.getShows();
                    const idx = shows.findIndex(s => s.id === showId);
                    if (idx !== -1 && shows[idx].poster !== imageUrl) {
                        shows[idx].poster = imageUrl;
                        App.Storage.saveShow(shows[idx]);
                        
                        // Re-render UI layouts
                        App.Cards.renderHeroBanner();
                        App.Cards.renderShowsGrid();
                    }
                }
            } catch (err) {
                console.error("Banner parse failure:", err);
            }
        };

        window.AndroidApp.fetchUrl(countdownUrl, callbackName);
    };

    window.App = window.App || {};
    window.App.Scraper = Scraper;
})(window);
