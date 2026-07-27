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

function updateAccountChip() {
    const el = document.getElementById('account-chip');
    if (!el) return;
    if (!VWNet.online) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = VWNet.player
        ? `${svgIcon('cloud')}<span>${VWNet.player.name}</span>`
        : `${svgIcon('cloud')}<span>Sign in</span>`;
}

// ---------- AUTH ----------
function openOnline() {
    if (!VWNet.online) {
        expModal(`<h3 class="exp-title">${svgIcon('cloud')} Online</h3>
            <p class="exp-hint">The online backend isn't running. Start it with:</p>
            <pre class="code-line">python3 server.py</pre>
            <p class="exp-hint">(replaces the plain file server — serves the game <b>and</b> the API on port 3456). Then reload.</p>
            <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
        return;
    }
    if (VWNet.player) return openOnlineHub();
    openAuthForm('login');
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
function queueCloudSave() {
    if (!VWNet.online || !VWNet.token) return;
    clearTimeout(VWNet._saveTimer);
    VWNet._saveTimer = setTimeout(cloudSaveNow, 4000);
}
function cloudSaveNow() {
    if (!VWNet.online || !VWNet.token || typeof state === 'undefined') return;
    _vwApi('/api/save', 'POST', { token: VWNet.token, state })
        .then(() => { if (VWNet.player) { VWNet.player.trophies = state.trophies; VWNet.player.level = state.level; } })
        .catch(() => {});
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
