// ============================================================
// NETCODE — real backend client (accounts, cloud saves,
// real global leaderboard, real shared clans + chat).
// Talks to server.py on the same origin. Degrades gracefully
// to offline/localStorage when the API isn't reachable.
// ============================================================

const VWNet = {
    token: null,
    player: null,
    online: false,
    _saveTimer: null,
    _clanPoll: null
};

// API base: same-origin by default. On a static host (e.g. GitHub Pages) you can
// point at a separately-hosted backend by setting window.VW_API_BASE before this
// script loads (see config.js), otherwise the online layer simply stays offline.
const VW_API_BASE = (typeof window !== 'undefined' && window.VW_API_BASE) ? window.VW_API_BASE.replace(/\/$/, '') : '';

function _vwApi(path, method, body) {
    const opts = { method: method || 'GET', headers: {} };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(VW_API_BASE + path, opts).then(r => r.json().then(j => {
        if (!r.ok) throw new Error(j.error || ('HTTP ' + r.status));
        return j;
    }));
}

function vwNetInit() {
    VWNet.token = localStorage.getItem('vw_token');
    // probe the API so we know whether we're served by server.py or a plain file server
    _vwApi('/api/leaderboard').then(() => {
        VWNet.online = true;
        if (VWNet.token) {
            _vwApi('/api/load?token=' + encodeURIComponent(VWNet.token))
                .then(j => { VWNet.player = j.player; updateAccountChip(); })
                .catch(() => { VWNet.token = null; localStorage.removeItem('vw_token'); updateAccountChip(); });
        }
        updateAccountChip();
    }).catch(() => { VWNet.online = false; updateAccountChip(); });
}

// Keys for the progress-safety layer below.
const VW_SKIP_KEY = 'vw_save_prompt_skipped';
const VW_BACKUP_KEY = 'vw_last_backup_at';

function updateAccountChip() {
    const el = document.getElementById('account-chip');
    if (!el) return;
    // This used to hide itself whenever the backend was unreachable - which is
    // every player on the static site, i.e. everyone. They were left with no way
    // to save progress off the device and no hint that it was at risk. The entry
    // point is now always offered; what it opens adapts to what's reachable.
    el.style.display = '';
    if (VWNet.player) {
        el.classList.remove('chip-warn');
        el.title = `Signed in as ${VWNet.player.name} — progress syncs to your account`;
        el.innerHTML = `${svgIcon('cloud')}<span>${VWNet.player.name}</span>`;
        return;
    }
    const safe = !!localStorage.getItem(VW_BACKUP_KEY);
    el.classList.toggle('chip-warn', !safe);
    el.title = safe
        ? 'Progress backed up — open to back up again or restore'
        : 'Your progress is only on this device — open to save it';
    el.innerHTML = `${svgIcon('cloud')}<span>${safe ? 'Progress' : 'Save progress'}</span>`;
}

// ============================================================
// PROGRESS SAFETY — an account if the backend is up, a portable
// backup code if it isn't, and a standing way back to either.
//
// A save lives in one browser's localStorage. Clearing site data,
// a private window, a new phone or a different browser all lose
// it outright, and nothing in the game ever said so.
// ============================================================

function vwProgressSafe() { return !!VWNet.player || !!localStorage.getItem(VW_BACKUP_KEY); }

function vwBackupCode() {
    // Same envelope the Settings export has always produced, so codes made by
    // either route restore through the other.
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

function vwMarkBackedUp() {
    try { localStorage.setItem(VW_BACKUP_KEY, String(Date.now())); } catch (e) {}
    updateAccountChip();
}

function vwCopyBackup() {
    try {
        const code = vwBackupCode();
        const ta = document.getElementById('vw-backup-code');
        if (ta) { ta.value = code; ta.select(); }
        const done = () => { vwMarkBackedUp(); toast('Backup code copied — paste it somewhere safe.', 'success'); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(done, () => {
                // Clipboard is blocked on insecure origins and in some embedded
                // views; the textarea is already selected, so say what to press.
                toast('Press Ctrl/Cmd+C to copy the selected code.', 'info');
                vwMarkBackedUp();
            });
        } else { document.execCommand && document.execCommand('copy'); done(); }
    } catch (e) { toast('Could not build a backup code.', 'error'); }
}

function vwDownloadBackup() {
    try {
        const blob = new Blob([vwBackupCode()], { type: 'text/plain' });
        const a = document.createElement('a');
        const when = new Date().toISOString().slice(0, 10);
        a.href = URL.createObjectURL(blob);
        a.download = `village-war-${when}.vwsave`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        vwMarkBackedUp();
        toast('Backup file saved. Keep it — it restores your village anywhere.', 'success');
    } catch (e) { toast('Could not save the backup file.', 'error'); }
}

function vwRestoreSubmit() {
    const el = document.getElementById('vw-restore-code');
    const err = document.getElementById('vw-restore-err');
    const raw = el ? el.value.trim() : '';
    const fail = m => { if (err) err.textContent = m; else toast(m, 'error'); };
    if (!raw) return fail('Paste a backup code first.');
    let data;
    try { data = JSON.parse(decodeURIComponent(escape(atob(raw)))); }
    catch (e) { return fail("That doesn't look like a Village War backup code."); }
    // A backup code is untrusted input exactly like a save file is.
    if (!data || typeof data !== 'object' || !data.resources || !Array.isArray(data.buildings)) {
        return fail('That code is missing a village — it may be truncated.');
    }
    if (!confirm('Restore this backup? It replaces the village on this device.')) return;
    try {
        localStorage.setItem('villagewar_save', JSON.stringify(data));
        toast('Backup restored — reloading…', 'success');
        setTimeout(() => location.reload(), 800);
    } catch (e) { fail('Could not write the save to this browser.'); }
}

function openRestoreForm() {
    expModal(`
        <h3 class="exp-title">${svgIcon('cloud')} Restore a backup</h3>
        <p class="exp-hint">Paste a backup code from another device. This replaces the village on <b>this</b> device.</p>
        <textarea id="vw-restore-code" class="vw-code-box" rows="4" placeholder="Paste your backup code here…"></textarea>
        <div id="vw-restore-err" class="auth-err"></div>
        <div class="exp-actions">
            <button class="btn btn-primary btn-glow" onclick="vwRestoreSubmit()">Restore</button>
            <button class="btn" onclick="openSaveProgress()">Back</button>
        </div>`);
}

// `firstRun` is the one-time nudge; it adds "Skip for now" and remembers the
// answer, so the game asks once rather than nagging every session.
function openSaveProgress(firstRun) {
    const skip = firstRun
        ? `<button class="btn" onclick="vwSkipAccount()">Skip for now</button>`
        : `<button class="btn" onclick="closeExpModal()">Close</button>`;
    const backupBlock = `
        <div class="vw-save-opt">
            <div class="vw-save-opt-h">${svgIcon('crate')} Backup code</div>
            <p class="exp-hint">Works with no server. Save the file (or copy the code) and you can bring this
               village back on any device, any browser.</p>
            <textarea id="vw-backup-code" class="vw-code-box" rows="2" readonly placeholder="Your code appears here when you copy it"></textarea>
            <div class="vw-save-actions">
                <button class="btn btn-primary" onclick="vwDownloadBackup()">Download backup file</button>
                <button class="btn" onclick="vwCopyBackup()">Copy code</button>
                <button class="btn" onclick="openRestoreForm()">Restore a backup</button>
            </div>
        </div>`;

    const accountBlock = VWNet.online ? `
        <div class="vw-save-opt vw-save-opt-primary">
            <div class="vw-save-opt-h">${svgIcon('cloud')} Account <span class="vw-save-tag">recommended</span></div>
            <p class="exp-hint">Your village saves to the server by itself, and follows you to any device you sign in on.
               It also puts you on the real leaderboard and lets you join clans.</p>
            <div class="vw-save-actions">
                <button class="btn btn-primary btn-glow" onclick="openAuthForm('register')">Create account</button>
                <button class="btn" onclick="openAuthForm('login')">I already have one</button>
            </div>
        </div>` : `
        <div class="vw-save-opt vw-save-opt-off">
            <div class="vw-save-opt-h">${svgIcon('cloud')} Account <span class="vw-save-tag vw-save-tag-off">offline</span></div>
            <p class="exp-hint">Accounts need the game's server running, and this copy is served as plain files,
               so there's nothing to sign in to right now. The backup code below does the important part —
               it keeps your progress safe off this device.</p>
        </div>`;

    expModal(`
        <h3 class="exp-title">${svgIcon('cloud')} Save your progress</h3>
        <p class="exp-hint">${firstRun
            ? 'Your village is doing well — worth making sure you keep it.'
            : 'Keep your village safe from a cleared browser or a lost device.'}
           Right now it exists <b>only in this browser</b>, so clearing site data or switching device loses it.</p>
        ${accountBlock}
        ${backupBlock}
        <div class="exp-actions">${skip}</div>`, 'exp-modal-wide');
}

function vwSkipAccount() {
    try { localStorage.setItem(VW_SKIP_KEY, '1'); } catch (e) {}
    closeExpModal();
    // The ask is dropped, not the offer: say where it lives so skipping isn't a
    // dead end, and leave the top-bar chip and More > Account standing.
    toast(navWordSafe('No problem — it\'s in {NAV} under “Account & Saves” whenever you want it.'), 'info');
    updateAccountChip();
}

// game.js owns navWord(); netcode.js loads before it in some orders, so fall
// back rather than throwing inside a toast.
function navWordSafe(text) {
    return (typeof navWord === 'function') ? navWord(text) : text.replace('{NAV}', 'the menu');
}

// Called from saveGame(). Guarded so it asks once, after the player has actually
// built something, and never over the tutorial.
function maybeOfferAccount() {
    if (VWNet._offered || VWNet.player) return;
    // saveGame() runs on every meaningful action, so don't touch storage each
    // time; a few seconds' lag on a once-per-player prompt costs nothing.
    const now = Date.now();
    if (VWNet._offerCheck && now - VWNet._offerCheck < 5000) return;
    VWNet._offerCheck = now;
    if (localStorage.getItem(VW_SKIP_KEY) || localStorage.getItem(VW_BACKUP_KEY)) return;
    if (typeof tutorialActive !== 'undefined' && tutorialActive) return;
    if (typeof state === 'undefined' || !Array.isArray(state.buildings)) return;
    if (state.buildings.length < 3) return;
    const overlay = document.getElementById('modal-overlay');
    if (overlay && !overlay.classList.contains('hidden')) return;  // don't stack on another modal
    VWNet._offered = true;
    openSaveProgress(true);
}

// ---------- AUTH ----------
function openOnline() {
    // Signed in: straight to the hub. Otherwise the save-progress panel, which
    // offers an account when the backend is up and a portable backup when it
    // isn't. It used to answer an offline player with "run python3 server.py",
    // which is not something a player of a web game can act on.
    if (VWNet.player) return openOnlineHub();
    openSaveProgress();
}

function openAuthForm(mode) {
    const isLogin = mode !== 'register';
    expModal(`
        <h3 class="exp-title">${svgIcon('cloud')} ${isLogin ? 'Sign In' : 'Create Account'}</h3>
        <p class="exp-hint">Cloud saves, a real global leaderboard & real clans with other players.</p>
        <div class="auth-tabs">
            <button class="auth-tab ${isLogin ? 'active' : ''}" onclick="openAuthForm('login')">Sign In</button>
            <button class="auth-tab ${!isLogin ? 'active' : ''}" onclick="openAuthForm('register')">Register</button>
        </div>
        <div class="auth-form">
            <input id="auth-name" placeholder="Player name (3-16)" maxlength="16" autocomplete="off">
            <input id="auth-pass" placeholder="Password (4+)" type="password" maxlength="40">
            <div id="auth-err" class="auth-err"></div>
            <button class="btn btn-primary btn-glow" onclick="submitAuth('${isLogin ? 'login' : 'register'}')">${isLogin ? 'Sign In' : 'Create Account'}</button>
        </div>
        <p class="exp-hint" style="margin-top:10px">Note: use a throwaway password — this is a hobby server, not a bank.</p>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Cancel</button></div>`);
}

function submitAuth(mode) {
    const name = document.getElementById('auth-name').value.trim();
    const password = document.getElementById('auth-pass').value;
    const err = document.getElementById('auth-err');
    err.textContent = '';
    _vwApi('/api/' + mode, 'POST', { name, password }).then(j => {
        VWNet.token = j.token; VWNet.player = j.player;
        localStorage.setItem('vw_token', j.token);
        toast(`Signed in as ${j.player.name}!`, 'success');
        updateAccountChip();
        // offer to pull cloud save if one exists
        if (mode === 'login') {
            _vwApi('/api/load?token=' + encodeURIComponent(j.token)).then(l => {
                if (l.state && l.state.buildings) {
                    if (confirm('Load your cloud save? (replaces the game on this device)')) {
                        localStorage.setItem('villagewar_save', JSON.stringify(l.state));
                        location.reload();
                        return;
                    }
                }
                openOnlineHub();
            }).catch(openOnlineHub);
        } else { openOnlineHub(); }
    }).catch(e => { err.textContent = e.message; });
}

function vwLogout() {
    VWNet.token = null; VWNet.player = null;
    localStorage.removeItem('vw_token');
    updateAccountChip();
    toast('Signed out.', 'info');
    closeExpModal();
}

// ---------- CLOUD SAVE (debounced, wraps saveGame) ----------
// Debounce WITH a maximum wait. A plain debounce could not work here: the game
// autosaves about every 2s, which is faster than the 4s delay, so every call
// cleared the pending timer and cloudSaveNow() never fired at all. Measured on
// a running game - 5 saveGame() calls in 10s, 0 POSTs to /api/save. An account
// only ever synced if the player found the "Save now" button by hand, which is
// the opposite of what signing in promises.
const VW_SAVE_DEBOUNCE = 4000;
const VW_SAVE_MAX_WAIT = 20000;

function queueCloudSave() {
    if (!VWNet.online || !VWNet.token) return;
    const now = Date.now();
    if (!VWNet._savePending) VWNet._savePending = now;
    // Been waiting long enough - let this one through rather than deferring again.
    if (now - VWNet._savePending >= VW_SAVE_MAX_WAIT) return cloudSaveNow();
    clearTimeout(VWNet._saveTimer);
    VWNet._saveTimer = setTimeout(cloudSaveNow, VW_SAVE_DEBOUNCE);
}
function cloudSaveNow() {
    clearTimeout(VWNet._saveTimer);
    VWNet._savePending = 0;
    if (!VWNet.online || !VWNet.token || typeof state === 'undefined') return;
    _vwApi('/api/save', 'POST', { token: VWNet.token, state })
        .then(() => { if (VWNet.player) { VWNet.player.trophies = state.trophies; VWNet.player.level = state.level; } })
        .catch(() => {});
}

// Closing the tab is the normal way to stop playing, and it can land inside the
// debounce window - so the last minutes of a session would never reach the
// account. A regular fetch is cancelled during unload; sendBeacon is handed to
// the browser to deliver after the page is gone.
function flushCloudSave() {
    if (!VWNet.online || !VWNet.token || typeof state === 'undefined') return;
    try {
        const body = JSON.stringify({ token: VWNet.token, state });
        if (navigator.sendBeacon) {
            navigator.sendBeacon(VW_API_BASE + '/api/save', new Blob([body], { type: 'application/json' }));
            VWNet._savePending = 0;
        } else {
            cloudSaveNow();
        }
    } catch (e) {}
}
if (typeof document !== 'undefined') {
    // 'hidden' covers switching tabs and, on phones, leaving the browser - where
    // 'pagehide'/'unload' often never run at all.
    document.addEventListener('visibilitychange', () => { if (document.hidden) flushCloudSave(); });
    window.addEventListener('pagehide', flushCloudSave);
}

// ---------- ONLINE HUB (account + real leaderboard + real clan) ----------
function openOnlineHub() {
    if (!VWNet.player) return openAuthForm('login');
    Promise.all([
        _vwApi('/api/leaderboard').catch(() => ({ rows: [] })),
        _vwApi('/api/clan?token=' + encodeURIComponent(VWNet.token)).catch(() => ({ clan: null }))
    ]).then(([lb, clan]) => {
        const me = VWNet.player.name;
        const lbRows = (lb.rows || []).map((r, i) => `
            <div class="olb-row ${r.name === me ? 'you' : ''}">
                <span class="olb-rank">${i + 1}</span>
                <span class="olb-name">${escapeHTMLNet(r.name)}${r.clan ? ` <i class="olb-clan">[${escapeHTMLNet(r.clan)}]</i>` : ''}</span>
                <span class="olb-tr">${formatNum(r.trophies)} ${svgIcon('trophy')}</span>
            </div>`).join('') || '<p class="exp-hint">No players yet — you could be #1!</p>';
        expModal(`
            <h3 class="exp-title">${svgIcon('cloud')} Online <span class="online-as">as ${me}</span></h3>
            <div class="online-actions">
                <button class="btn btn-primary" onclick="cloudSaveNow();toast('Saved to cloud!','success')"> Save now</button>
                <button class="btn" onclick="vwLogout()">Sign out</button>
            </div>
            <h4 class="codex-h">${svgIcon('trophy')} Global Leaderboard <span class="exp-hint" style="font-size:.7rem">(real players)</span></h4>
            <div class="olb-list">${lbRows}</div>
            <h4 class="codex-h">${svgIcon('shield')} Clan</h4>
            <div id="online-clan">${renderOnlineClan(clan)}</div>
            <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
        startClanPoll();
    });
}

function renderOnlineClan(data) {
    if (!data || !data.clan) {
        return `<p class="exp-hint">You're not in a clan. Join an existing one or found your own.</p>
            <div class="online-actions">
                <input id="clan-new-name" placeholder="New clan name" maxlength="20">
                <button class="btn btn-primary" onclick="onlineCreateClan()">Found Clan</button>
                <button class="btn" onclick="onlineBrowseClans()">Browse Clans</button>
            </div>
            <div id="clan-browse"></div>`;
    }
    const chat = (data.chat || []).map(m => `<div class="chat-line"><b>${escapeHTMLNet(m.author)}:</b> ${escapeHTMLNet(m.msg)}</div>`).join('')
        || '<div class="chat-line" style="opacity:.6">No messages yet — say hello!</div>';
    const members = (data.members || []).map(m => `<div class="clan-mem"><span>${m.name}</span><span>${formatNum(m.trophies)} ${svgIcon('trophy')} · Lv${m.level}</span></div>`).join('');
    return `
        <div class="clan-head"><b>${escapeHTMLNet(data.clan.name)}</b> · ${data.members.length} member(s)
            <button class="btn btn-small" onclick="onlineLeaveClan()">Leave</button></div>
        <div class="clan-members">${members}</div>
        <div class="clan-chat" id="online-clan-chat">${chat}</div>
        <div class="chat-send">
            <input id="online-chat-input" placeholder="Message your clan…" maxlength="200" onkeydown="if(event.key==='Enter')onlineSendChat()">
            <button class="btn btn-primary" onclick="onlineSendChat()">Send</button>
        </div>`;
}

function refreshOnlineClan() {
    if (!VWNet.token) return;
    _vwApi('/api/clan?token=' + encodeURIComponent(VWNet.token)).then(c => {
        const host = document.getElementById('online-clan');
        if (host) host.innerHTML = renderOnlineClan(c);
    }).catch(() => {});
}
function onlineCreateClan() {
    const name = (document.getElementById('clan-new-name') || {}).value || '';
    _vwApi('/api/clan/create', 'POST', { token: VWNet.token, name: name.trim() })
        .then(() => { toast('Clan founded!', 'success'); refreshOnlineClan(); })
        .catch(e => toast(e.message, 'error'));
}
function onlineBrowseClans() {
    _vwApi('/api/clan/list').then(j => {
        const host = document.getElementById('clan-browse');
        if (!host) return;
        host.innerHTML = (j.clans || []).map(c => `
            <div class="clan-browse-row">
                <span>${escapeHTMLNet(c.name)} · ${c.members} member(s) · ${formatNum(c.trophies)} ${svgIcon('trophy')}</span>
                <button class="btn btn-small btn-primary" onclick="onlineJoinClan(${c.id})">Join</button>
            </div>`).join('') || '<p class="exp-hint">No clans yet.</p>';
    });
}
function onlineJoinClan(id) {
    _vwApi('/api/clan/join', 'POST', { token: VWNet.token, clanId: id })
        .then(() => { toast('Joined clan!', 'success'); refreshOnlineClan(); })
        .catch(e => toast(e.message, 'error'));
}
function onlineLeaveClan() {
    _vwApi('/api/clan/leave', 'POST', { token: VWNet.token })
        .then(() => { toast('Left clan.', 'info'); refreshOnlineClan(); });
}
function onlineSendChat() {
    const inp = document.getElementById('online-chat-input');
    if (!inp || !inp.value.trim()) return;
    const msg = inp.value.trim(); inp.value = '';
    _vwApi('/api/clan/chat', 'POST', { token: VWNet.token, msg })
        .then(() => refreshOnlineClan()).catch(e => toast(e.message, 'error'));
}
function startClanPoll() {
    clearInterval(VWNet._clanPoll);
    VWNet._clanPoll = setInterval(() => {
        // only poll while the online modal with a clan chat is open
        if (document.getElementById('online-clan-chat')) refreshOnlineClan();
        else clearInterval(VWNet._clanPoll);
    }, 5000);
}

function escapeHTMLNet(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// ---------- wire cloud-save into the game's saveGame ----------
(function wrapSave() {
    function attach() {
        if (typeof window.saveGame === 'function' && !window.saveGame._vwWrapped) {
            const orig = window.saveGame;
            window.saveGame = function () { const r = orig.apply(this, arguments); queueCloudSave(); return r; };
            window.saveGame._vwWrapped = true;
        }
    }
    attach();
    document.addEventListener('DOMContentLoaded', () => { attach(); vwNetInit(); });
    if (document.readyState !== 'loading') { attach(); vwNetInit(); }
})();
