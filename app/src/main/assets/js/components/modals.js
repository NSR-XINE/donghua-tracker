function openDetailsModal(show) {
    const detailsModal = document.getElementById('details-modal');
    const detailsTitle = document.getElementById('details-modal-title');
    const detailsContent = document.getElementById('details-modal-content');
    if (!detailsModal || !detailsContent) return;

    detailsTitle.innerText = show.title;
    const maxEps = show.totalEp && show.totalEp > 0 ? show.totalEp : Math.min(Math.max(12, show.currentEp + 10), 150);

    let posterHtml = '';
    const safePoster = safePosterUrl(show.poster);
    if (safePoster) {
        posterHtml = `<img src="${safePoster}" style="width: 90px; height: 130px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.5);" alt="${show.title}" loading="lazy">`;
    } else {
        const gradient = getPosterGradient(show.title);
        const initials = getInitials(show.title);
        posterHtml = `<div style="width: 90px; height: 130px; background: ${gradient}; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
            <div style="font-size: 1.4rem; font-weight: 800; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); z-index: 2;">${initials}</div>
            ${show.titleZh ? `<div style="position: absolute; bottom: 4px; right: 4px; font-size: 1.6rem; font-weight: 800; color: rgba(255,255,255,0.06); pointer-events: none; z-index: 1;">${show.titleZh[0]}</div>` : ''}
        </div>`;
    }

    let epPills = '';
    for (let i = 1; i <= maxEps; i++) {
        const isWatched = i <= show.currentEp;
        const activeStyle = isWatched ? 'background: linear-gradient(135deg, var(--accent-cyan), var(--accent-purple)); border: none; color: #fff; font-weight: bold;' : 'background: var(--bg-input); border: 1px solid var(--border-color); color: var(--text-secondary);';
        epPills += `<button class="ep-pill-btn" data-ep="${i}" style="padding: 0.5rem; border-radius: 6px; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; ${activeStyle}">${i}</button>`;
    }

    const statusText = getStatusDisplayName(show.status).toUpperCase();

    detailsContent.innerHTML = `
        <div style="display: flex; gap: 1rem; align-items: flex-start;">
            ${posterHtml}
            <div style="flex: 1; display: flex; flex-direction: column; gap: 0.4rem;">
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
                    <span class="status-badge ${show.status}" style="padding: 0.2rem 0.5rem; font-size: 0.65rem; border-radius: 4px; text-transform: uppercase;">${statusText}</span>
                    ${show.isFavorite ? '<span style="font-size:0.65rem;color:var(--accent-rose);"><i class="fa-solid fa-heart"></i> Favorite</span>' : ''}
                    ${show.status === 'completed' ? '<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-circle-check"></i> Series Complete</span>'
                    : `<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-regular fa-calendar"></i> ${show.releaseDay}s at ${show.releaseTime}</span>`}
                    ${show.totalEp ? `<span style="font-size: 0.75rem; color: var(--text-muted);"><i class="fa-solid fa-film"></i> ${show.totalEp} eps total</span>` : ''}
                </div>
                <h3 style="font-size: 1rem; color: #fff; margin: 0.2rem 0 0 0; font-family: var(--font-heading); font-weight: 700;">${show.title}</h3>
                ${show.titleZh ? `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">${show.titleZh}</div>` : ''}
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.4rem;">
                    Watched: <strong style="color: var(--accent-cyan);">${show.currentEp}</strong> episodes
                </div>
            </div>
        </div>
        <div>
            <h4 style="font-size: 0.8rem; color: #fff; margin: 0 0 0.4rem 0; text-transform: uppercase; letter-spacing: 0.5px;">Synopsis</h4>
            <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4; margin: 0;">
                ${show.notes ? show.notes : '<span style="color: var(--text-muted); font-style: italic;">No synopsis added.</span>'}
            </p>
        </div>
        <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <h4 style="font-size: 0.8rem; color: #fff; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">Episodes ${show.totalEp ? `<span style="font-weight:400; color: var(--text-muted);">(${show.currentEp}/${show.totalEp})</span>` : ''}</h4>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Tap to update progress</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 0.4rem; max-height: 200px; overflow-y: auto; padding-right: 0.2rem;">
                ${epPills}
            </div>
        </div>`;

    detailsContent.querySelectorAll('.ep-pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const newEp = parseInt(btn.dataset.ep, 10);
            if (newEp === show.currentEp) {
                show.currentEp = Math.max(0, newEp - 1);
            } else {
                if (newEp > show.currentEp) {
                    for (let ep = show.currentEp + 1; ep <= newEp; ep++) {
                        if (DB._available) DB.addWatchHistory(show.id, ep);
                    }
                }
                show.currentEp = newEp;
            }
            show.lastUpdated = Date.now();
            persistState();
            openDetailsModal(show);
        });
    });

    detailsModal.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function openModal(showData) {
    const modalEl = document.getElementById('donghua-modal');
    const formEl = document.getElementById('donghua-form');
    const statusSelect = document.getElementById('show-status');
    if (!modalEl || !formEl) return;

    if (statusSelect) {
        statusSelect.innerHTML = `<option value="ongoing">Airing</option><option value="completed">Completed</option><option value="stopped">Stopped / Hiatus</option>`;
    }

    formEl.reset();
    document.getElementById('show-id').value = '';

    if (showData) {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Donghua';
        setFormValue('show-id', showData.id);
        setFormValue('show-title', showData.title);
        setFormValue('show-title-zh', showData.titleZh || '');
        setFormValue('show-status', showData.status);
        setFormValue('show-watch-url', showData.watchUrl || '');
        setFormValue('show-countdown-url', showData.countdownUrl || '');
        setFormValue('show-release-day', showData.releaseDay);
        setFormValue('show-release-time', showData.releaseTime);
        setFormValue('show-current-ep', showData.currentEp);
        setFormValue('show-total-ep', showData.totalEp || 0);
        setFormValue('show-poster', showData.poster || '');
        setFormValue('show-collection', showData.collection || '');
        setFormValue('show-notes', showData.notes || '');
    } else {
        document.getElementById('modal-title').innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add New Donghua';
        const todayDay = getTodayName();
        setFormValue('show-release-day', todayDay);
        setFormValue('show-release-time', '10:00');
        setFormValue('show-current-ep', 0);
        setFormValue('show-total-ep', 0);
    }

    modalEl.style.display = 'flex';
    document.body.classList.add('modal-open');
}

function setFormValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}

function closeModal() {
    const el = document.getElementById('donghua-modal');
    if (el) el.style.display = 'none';
    document.body.classList.remove('modal-open');
}

function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        document.body.classList.add('modal-open');
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        document.body.classList.remove('modal-open');
    }
}

function showExitModal() {
    const modal = document.getElementById('exit-modal');
    if (modal) {
        modal.style.setProperty('display', 'flex', 'important');
        document.body.classList.add('modal-open');
    }
}

function closeExitModal() {
    const modal = document.getElementById('exit-modal');
    if (modal) {
        modal.style.setProperty('display', 'none', 'important');
        document.body.classList.remove('modal-open');
    }
}

function confirmExitApp() {
    if (DB._available && typeof AndroidApp.exitApp === 'function') {
        AndroidApp.exitApp();
    } else {
        closeExitModal();
    }
}

function closeTopModal() {
    const drawer = document.getElementById('right-drawer');
    if (drawer && drawer.classList.contains('open')) { closeDrawer(); return; }
    const modalIds = ['history-modal', 'stats-modal', 'calendar-modal', 'collections-modal', 'settings-modal', 'donghua-modal', 'import-modal', 'details-modal', 'exit-modal'];
    for (let i = modalIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(modalIds[i]);
        if (el && el.style.display === 'flex') {
            if (modalIds[i] === 'history-modal') closeHistoryModal();
            else if (modalIds[i] === 'stats-modal') closeStatsModal();
            else if (modalIds[i] === 'calendar-modal') closeCalendarModal();
            else if (modalIds[i] === 'collections-modal') closeCollectionsModal();
            else if (modalIds[i] === 'settings-modal') closeSettingsModal();
            else if (modalIds[i] === 'donghua-modal') closeModal();
            else if (modalIds[i] === 'import-modal') closeImportModal();
            else if (modalIds[i] === 'details-modal') closeDetailsModal();
            else if (modalIds[i] === 'exit-modal') closeExitModal();
            return;
        }
    }
}

function closeDetailsModal() {
    const modal = document.getElementById('details-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function closeImportModal() {
    const importModal = document.getElementById('import-modal');
    if (importModal) {
        importModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && settingsModal.style.display === 'flex') {
            document.body.classList.add('modal-open');
        }
    }
}

function handleBackPress() {
    const modalIds = ['history-modal', 'stats-modal', 'calendar-modal', 'collections-modal', 'settings-modal', 'donghua-modal', 'import-modal', 'details-modal', 'exit-modal'];
    for (let i = modalIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(modalIds[i]);
        if (el && el.style.display === 'flex') {
            closeTopModal();
            return;
        }
    }
    showExitModal();
}

function openDrawer() {
    const drawer = document.getElementById('right-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) {
        drawer.classList.add('open');
        setupDrawerSwipe(drawer);
    }
    if (overlay) { overlay.style.display = 'block'; setTimeout(() => overlay.classList.add('open'), 10); }
    document.body.classList.add('modal-open');
}

let drawerSwipeInitialized = false;
function setupDrawerSwipe(drawer) {
    if (drawerSwipeInitialized) return;
    drawerSwipeInitialized = true;
    let startX = 0, isDragging = false;
    const onStart = (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        drawer.style.transition = 'none';
    };
    const onMove = (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        if (dx > 0) { isDragging = false; return; }
        drawer.style.transform = `translateX(${Math.max(dx, -drawer.offsetWidth)}px)`;
    };
    const onEnd = (e) => {
        if (!isDragging) return;
        isDragging = false;
        const dx = e.changedTouches[0].clientX - startX;
        drawer.style.transition = 'transform 0.25s ease';
        if (Math.abs(dx) > 60) {
            drawer.style.transform = `translateX(-100%)`;
            setTimeout(closeDrawer, 220);
        } else {
            drawer.style.transform = '';
            setTimeout(() => drawer.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 250);
        }
    };
    drawer.addEventListener('touchstart', onStart, { passive: true });
    drawer.addEventListener('touchmove', onMove, { passive: true });
    drawer.addEventListener('touchend', onEnd, { passive: true });
}

function closeDrawer() {
    const drawer = document.getElementById('right-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) {
        overlay.classList.remove('open');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
    document.body.classList.remove('modal-open');
}

function addSwipeToDismiss(modalOverlayId, closeFn) {
    const overlay = document.getElementById(modalOverlayId);
    if (!overlay) return;
    const panel = overlay.querySelector('.modal-content');
    if (!panel) return;

    let startX = 0, startY = 0, isDragging = false;
    const THRESHOLD = 80;

    panel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        panel.style.transition = 'none';
    }, { passive: true });

    panel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        if (Math.abs(dy) > Math.abs(dx)) return;
        panel.style.transform = `translateX(${dx}px)`;
        panel.style.opacity = `${1 - Math.min(Math.abs(dx) / 250, 0.5)}`;
    }, { passive: true });

    panel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const dx = e.changedTouches[0].clientX - startX;
        panel.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
        if (Math.abs(dx) >= THRESHOLD) {
            panel.style.transform = `translateX(${dx > 0 ? '110%' : '-110%'})`;
            panel.style.opacity = '0';
            setTimeout(() => {
                closeFn();
                panel.style.transition = 'none';
                panel.style.transform = '';
                panel.style.opacity = '';
            }, 220);
        } else {
            panel.style.transform = '';
            panel.style.opacity = '';
        }
    }, { passive: true });
}
