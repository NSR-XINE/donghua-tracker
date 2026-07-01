function renderHeroBanner() {
    const bannerEl = document.getElementById('next-up-banner');
    if (!bannerEl) return;

    const isMobile = window.innerWidth <= 1024;
    if (isMobile && activeTab !== 'home') {
        bannerEl.style.setProperty('display', 'none', 'important');
        return;
    }

    const nextUp = getNextUpShow();
    if (!nextUp) {
        bannerEl.style.display = 'none';
        return;
    }

    bannerEl.style.display = 'flex';
    bannerEl.dataset.id = nextUp.show.id;
    const show = nextUp.show;
    const isAiring = nextUp.airingNow;

    let countdownHtml = '';
    if (isAiring) {
        countdownHtml = `
            <div class="banner-countdown" id="hero-countdown-box">
                <div class="countdown-box" style="border-color: var(--accent-cyan); min-width: 250px;">
                    <div class="num" style="font-size: 1.6rem; animation: pulse 1s infinite;">AIRING NOW</div>
                    <div class="label">Episode ${show.currentEp + 1} Released!</div>
                </div>
            </div>`;
    } else {
        const time = calculateTimeRemaining(nextUp.targetDate);
        countdownHtml = `
            <div class="banner-countdown" id="hero-countdown-box">
                <div class="countdown-box"><div class="num">${String(time.days).padStart(2, '0')}</div><div class="label">Days</div></div>
                <div class="countdown-box"><div class="num">${String(time.hours).padStart(2, '0')}</div><div class="label">Hrs</div></div>
                <div class="countdown-box"><div class="num">${String(time.minutes).padStart(2, '0')}</div><div class="label">Min</div></div>
                <div class="countdown-box"><div class="num">${String(time.seconds).padStart(2, '0')}</div><div class="label">Sec</div></div>
            </div>`;
    }

    const bannerGradient = getPosterGradient(show.title);
    const safePoster = safePosterUrl(show.poster);
    const imageStyle = safePoster
        ? `background-image: url(${safePoster}); background-size: cover; background-position: center; background-repeat: no-repeat;`
        : `background: ${bannerGradient};`;

    bannerEl.innerHTML = `
        <div class="banner-image-wrap" style="${imageStyle}"></div>
        <div class="banner-info-section">
            <div class="banner-details">
                <span class="banner-badge">
                    <i class="fa-solid ${isAiring ? 'fa-satellite-dish' : 'fa-clock'}"></i> 
                    ${isAiring ? 'Live Release' : 'Next Airing'}
                </span>
                <h2 class="banner-title">${show.title}</h2>
                <div class="banner-meta">
                    <span><i class="fa-solid fa-calendar"></i> ${show.releaseDay}s at ${show.releaseTime}</span>
                    <span><i class="fa-solid fa-play"></i> Episode ${show.currentEp + 1} next</span>
                    <span><span onclick="openWatchScreen(getWatchUrlById('${show.id}'))" style="color: var(--accent-cyan); cursor: pointer;"><i class="fa-solid fa-up-right-from-square"></i> Stream Link</span></span>
                </div>
                <div class="banner-ctrls">
                    <button class="ctrl-btn edit-btn" title="Edit show" data-id="${show.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="ctrl-btn favorite-btn" title="${show.isFavorite ? 'Unfavorite' : 'Favorite'}" data-id="${show.id}"><i class="${show.isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
                    <button class="ctrl-btn delete-btn" title="Delete show" data-id="${show.id}"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            ${countdownHtml}
        </div>`;
}
