/**
 * Donghua Tracker - Storage & Database Migration Module
 * Manages database CRUD queries targeting SQLite via Java JavascriptInterface,
 * with standard LocalStorage fallbacks for browser testing and automatic migrations.
 */
(function(window) {
    const Storage = {};

    const IS_NATIVE = !!(window.AndroidApp && window.AndroidApp.getAllShows);

    /**
     * Seed lists from previous session (18 default shows with updated countdownUrl mappings).
     */
    const DEFAULT_DONGHUA_SEEDS = [
        {
            id: "dh-1",
            title: "Swallowed Star",
            titleZh: "吞噬星空",
            status: "ongoing",
            releaseDay: "Wednesday",
            releaseTime: "10:00",
            currentEp: 227,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815156/swallowed-star-2",
            notes: "Luo Feng strives to protect Earth and reach the peak of cosmic cultivation in a post-apocalyptic future.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-2",
            title: "Perfect World",
            titleZh: "完美世界",
            status: "ongoing",
            releaseDay: "Friday",
            releaseTime: "10:00",
            currentEp: 275,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1816738/perfect-world-episode-275",
            notes: "Shi Hao, a cultivation genius born in a desolate wilderness, trains to become the savior of the universe.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-3",
            title: "Throne of Seal",
            titleZh: "神印王座",
            status: "completed",
            releaseDay: "Thursday",
            releaseTime: "10:00",
            currentEp: 104,
            totalEp: 104,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815190/throne-of-seal",
            notes: "Long Haochen rises through the ranks of the Temple Alliance to defeat the Demon Emperor and save humanity.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-4",
            title: "Soul Land 2",
            titleZh: "斗罗大陆II绝世唐门",
            status: "ongoing",
            releaseDay: "Saturday",
            releaseTime: "10:00",
            currentEp: 159,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815191/soul-land-2",
            notes: "Huo Yuhao and a new generation of Shrek Academy students revive the legendary Tang Sect.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-5",
            title: "A Mortal's Journey to Immortality",
            titleZh: "凡人修仙传",
            status: "ongoing",
            releaseDay: "Sunday",
            releaseTime: "11:00",
            currentEp: 176,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1816560/a-mortals-journey-to-immortality-remake",
            notes: "A poor village boy rises in the cultivation world despite having ordinary spiritual roots.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-6",
            title: "Battle through the heavens",
            titleZh: "斗破苍穹",
            status: "ongoing",
            releaseDay: "Sunday",
            releaseTime: "10:00",
            currentEp: 203,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815250/battle-through-the-heavens",
            notes: "Xiao Yan masters flame techniques to reclaim his family honor and climb to the top of the Dou Qi world.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-7",
            title: "Renegade immortal",
            titleZh: "仙逆",
            status: "ongoing",
            releaseDay: "Monday",
            releaseTime: "10:00",
            currentEp: 146,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815480/renegade-immortal",
            notes: "Wang Lin overcomes mortal challenges to seek the supreme path of ruthlessness and immortality.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-8",
            title: "Jade dynasty",
            titleZh: "诛仙",
            status: "completed",
            releaseDay: "Saturday",
            releaseTime: "10:00",
            currentEp: 26,
            totalEp: 26,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815198/jade-dynasty",
            notes: "Zhang Xiaofan gets caught in the conflict between righteous cultivation sects and demonic paths. Completed.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-9",
            title: "Lingwu continent",
            titleZh: "灵武大陆",
            status: "ongoing",
            releaseDay: "Tuesday",
            releaseTime: "10:00",
            currentEp: 1,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815340/lingwu-continent",
            notes: "A young martial artist unlocks dormant ancestral spirits to conquer the spiritual martial universe.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-10",
            title: "Apotheosis",
            titleZh: "百炼成神",
            status: "ongoing",
            releaseDay: "Friday",
            releaseTime: "10:00",
            currentEp: 78,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815192/apotheosis",
            notes: "Luo Zheng refines his body into a weapon to save his sister and discover cosmic truths. Season 3 Episode 26 stopped.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-11",
            title: "A moment but forever",
            titleZh: "念无双",
            status: "completed",
            releaseDay: "Wednesday",
            releaseTime: "10:00",
            currentEp: 24,
            totalEp: 24,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815668/a-moment-but-forever",
            notes: "The high goddess Wu Shuang descends to retrieve divine artifacts and falls in love with a mortal priest. Completed.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-12",
            title: "Over the divine realms",
            titleZh: "傲世九重天",
            status: "completed",
            releaseDay: "Wednesday",
            releaseTime: "10:00",
            currentEp: 12,
            totalEp: 12,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815194/over-the-divine-realms",
            notes: "Chu Yang restarts his life to save his companions and master the Nine Tribulations Sword. Completed.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-13",
            title: "Against the gods",
            titleZh: "逆天邪神",
            status: "ongoing",
            releaseDay: "Friday",
            releaseTime: "10:00",
            currentEp: 43,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815187/against-the-gods",
            notes: "Yun Che reincarnates with the Sky Poison Pearl to fight against fate and cosmic powers. Season 2 Episode 13.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-14",
            title: "Stellars transformation",
            titleZh: "星辰变",
            status: "completed",
            releaseDay: "Monday",
            releaseTime: "10:00",
            currentEp: 84,
            totalEp: 84,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815195/stellars-transformation",
            notes: "Qin Yu transcends physical limits by practicing stellar techniques. Completed Season 7 Episode 12.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-15",
            title: "In the search of gods",
            titleZh: "寻找神仙",
            status: "ongoing",
            releaseDay: "Tuesday",
            releaseTime: "10:00",
            currentEp: 1,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815200/in-search-of-gods",
            notes: "A journey through mythical mountains in search of legendary immortals.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-16",
            title: "The Great Ruler",
            titleZh: "大主宰",
            status: "ongoing",
            releaseDay: "Friday",
            releaseTime: "10:00",
            currentEp: 79,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815188/the-great-ruler",
            notes: "Mu Chen rises from a small spiritual academy to rule over the Great Thousand World.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-17",
            title: "Tomb of the fallen gods",
            titleZh: "神墓",
            status: "ongoing",
            releaseDay: "Saturday",
            releaseTime: "10:00",
            currentEp: 80,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815196/tomb-of-the-fallen-gods",
            notes: "Chen Nan wakes up from a grave in the tomb of gods after ten thousand years. Currently watching Season 3 Episode 48.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        },
        {
            id: "dh-18",
            title: "Shrouding the heavens",
            titleZh: "遮天",
            status: "ongoing",
            releaseDay: "Wednesday",
            releaseTime: "10:00",
            currentEp: 168,
            totalEp: 0,
            poster: "",
            watchUrl: "",
            countdownUrl: "https://animecountdown.com/1815160/shrouding-the-heavens",
            notes: "Ye Fan is pulled into a galactic journey by a casket pulled by nine dragon corpses.",
            lastUpdated: Date.now(),
            dateAdded: Date.now(),
            isFavorite: false,
            rating: 0
        }
    ];

    /**
     * Initializes the DB or LocalStorage, checking and executing migrations.
     */
    Storage.initialize = function() {
        if (IS_NATIVE) {
            // Check if we need to migrate old LocalStorage data
            const migrateFlag = localStorage.getItem('localstorage_migrated');
            if (migrateFlag !== 'true') {
                const legacyData = localStorage.getItem('donghua_shows');
                if (legacyData) {
                    try {
                        const parsed = JSON.parse(legacyData);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            parsed.forEach(show => {
                                window.AndroidApp.insertShow(JSON.stringify(show));
                            });
                        }
                    } catch (e) {
                        console.error("Migration error:", e);
                    }
                }
                
                // Copy settings if present
                const darkState = localStorage.getItem('theme_dark');
                if (darkState) window.AndroidApp.saveSetting('theme_dark', darkState);
                const amoledState = localStorage.getItem('theme_amoled');
                if (amoledState) window.AndroidApp.saveSetting('theme_amoled', amoledState);
                const accentColor = localStorage.getItem('theme_accent');
                if (accentColor) window.AndroidApp.saveSetting('theme_accent', accentColor);
                
                localStorage.setItem('localstorage_migrated', 'true');
                localStorage.removeItem('donghua_shows'); // Wipe legacy cache
            }

            // Verify if SQLite is completely empty, if so, seed default shows
            const nativeShowsStr = window.AndroidApp.getAllShows();
            if (!nativeShowsStr || nativeShowsStr === '[]') {
                DEFAULT_DONGHUA_SEEDS.forEach(show => {
                    window.AndroidApp.insertShow(JSON.stringify(show));
                });
            }
        } else {
            // Browser localstorage fallback init
            let localShows = localStorage.getItem('donghua_shows');
            if (!localShows || localShows === '[]') {
                localStorage.setItem('donghua_shows', JSON.stringify(DEFAULT_DONGHUA_SEEDS));
            }
        }
    };

    /**
     * Fetches all shows list from SQLite or LocalStorage fallback.
     */
    Storage.getShows = function() {
        if (IS_NATIVE) {
            return JSON.parse(window.AndroidApp.getAllShows() || "[]");
        } else {
            return JSON.parse(localStorage.getItem('donghua_shows') || "[]");
        }
    };

    /**
     * Saves or overwrites a show.
     */
    Storage.saveShow = function(show) {
        if (IS_NATIVE) {
            if (show.id && show.id.startsWith('dh-')) {
                // If it exists, update, otherwise insert
                const currentShows = Storage.getShows();
                const exists = currentShows.some(s => s.id === show.id);
                if (exists) {
                    window.AndroidApp.updateShow(JSON.stringify(show));
                } else {
                    window.AndroidApp.insertShow(JSON.stringify(show));
                }
            } else {
                show.id = 'dh-' + Date.now();
                window.AndroidApp.insertShow(JSON.stringify(show));
            }
        } else {
            const currentShows = Storage.getShows();
            if (!show.id) {
                show.id = 'dh-' + Date.now();
                currentShows.push(show);
            } else {
                const idx = currentShows.findIndex(s => s.id === show.id);
                if (idx !== -1) {
                    currentShows[idx] = show;
                } else {
                    currentShows.push(show);
                }
            }
            localStorage.setItem('donghua_shows', JSON.stringify(currentShows));
        }
    };

    /**
     * Deletes a show by id.
     */
    Storage.deleteShow = function(id) {
        if (IS_NATIVE) {
            window.AndroidApp.deleteShow(id);
        } else {
            const currentShows = Storage.getShows();
            const filtered = currentShows.filter(s => s.id !== id);
            localStorage.setItem('donghua_shows', JSON.stringify(filtered));
        }
    };

    /**
     * Saves a setting value.
     */
    Storage.saveSetting = function(key, val) {
        if (IS_NATIVE) {
            window.AndroidApp.saveSetting(key, String(val));
        } else {
            localStorage.setItem(key, String(val));
        }
    };

    /**
     * Retrieves a setting value.
     */
    Storage.getSetting = function(key, defaultVal) {
        if (IS_NATIVE) {
            return window.AndroidApp.getSetting(key, String(defaultVal));
        } else {
            const val = localStorage.getItem(key);
            return val !== null ? val : String(defaultVal);
        }
    };

    /**
     * Logs an episode watched record to history.
     */
    Storage.addHistoryRecord = function(showId, episodeNum) {
        if (IS_NATIVE) {
            window.AndroidApp.addHistoryRecord(showId, episodeNum);
        } else {
            const history = JSON.parse(localStorage.getItem('watch_history') || "[]");
            history.push({
                showId,
                episodeNum,
                timestamp: Date.now()
            });
            localStorage.setItem('watch_history', JSON.stringify(history));
        }
    };

    /**
     * Retrieves entire watch history log.
     */
    Storage.getHistory = function() {
        if (IS_NATIVE) {
            return JSON.parse(window.AndroidApp.getHistory() || "[]");
        } else {
            const history = JSON.parse(localStorage.getItem('watch_history') || "[]");
            const shows = Storage.getShows();
            return history.map(h => {
                const s = shows.find(item => item.id === h.showId);
                return {
                    id: h.timestamp,
                    showId: h.showId,
                    episodeNum: h.episodeNum,
                    timestamp: h.timestamp,
                    title: s ? s.title : "Deleted Show"
                };
            }).sort((a,b) => b.timestamp - a.timestamp);
        }
    };

    /**
     * Wipes database structures completely.
     */
    Storage.clearAll = function() {
        if (IS_NATIVE) {
            window.AndroidApp.clearDatabase();
        } else {
            localStorage.clear();
        }
    };

    window.App = window.App || {};
    window.App.Storage = Storage;
})(window);
