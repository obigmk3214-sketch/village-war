// ============================================================
// NEW FEATURES MODULE
// Builders & timers · Gems & Shop · Campaign · Leagues · Events
// Daily rewards · Shield & Revenge · Scouting · Clan Hall
// Save codes · Notifications
// ============================================================

// ---------- STATE BOOTSTRAP ----------
function ensureMeta() {
    if (state.gems == null) state.gems = 50;
    if (!state.builders) state.builders = { count: 2 };
    if (!state.campaign) state.campaign = { stars: {} };
    if (!state.daily) state.daily = { last: null, streak: 0 };
    if (state.shieldUntil == null) state.shieldUntil = 0;
    if (!state.clanChat) state.clanChat = [];
    if (state.notifyOn == null) state.notifyOn = false;
}

function addGems(n) {
    ensureMeta();
    state.gems += n;
    updateGemDisplay();
    try { popup(`+${n}`, { color: '#7dd3fc' }); } catch(e) {}
}

function spendGems(n) {
    ensureMeta();
    if (state.gems < n) { toast(`Need ${n} gems!`, 'error'); try { Audio.error(); } catch(e) {} return false; }
    state.gems -= n;
    updateGemDisplay();
    return true;
}

function updateGemDisplay() {
    const el = document.getElementById('res-gems');
    if (el) el.textContent = formatNum(state.gems || 0);
}

// ---------- BUILDERS & TIMED CONSTRUCTION ----------
// A building under construction has b.constructing=true, b.endsAt.
// An upgrading building has b.upgrading = { to, endsAt }.

function buildDuration(type, level) {
    const def = BUILDING_DEFS[type] || {};
    const base = (def.baseCost && def.baseCost.coins) ? def.baseCost.coins : 200;
    // seconds — short enough to be playable, long enough that builders matter
    return Math.min(600, Math.round(12 + base / 40 + level * 14));
}

function busyBuilders() {
    let n = 0;
    for (const b of state.buildings) {
        if (b.constructing) n++;
        if (b.upgrading) n++;
    }
    return n;
}
function freeBuilders() { ensureMeta(); return state.builders.count - busyBuilders(); }

function tickBuilders() {
    ensureMeta();
    const now = Date.now();
    let changed = false;
    for (const b of state.buildings) {
        if (b.constructing && now >= b.endsAt) {
            b.constructing = false; delete b.endsAt;
            changed = true;
            toast(`${BUILDING_DEFS[b.type].name} construction complete!`, 'success');
            try { Audio.upgrade(); track('buildingsBuilt'); track('totalBuilt'); } catch(e) {}
            notifyUser('Construction complete', `${BUILDING_DEFS[b.type].name} is ready!`);
        }
        if (b.upgrading && now >= b.upgrading.endsAt) {
            b.level = b.upgrading.to;
            b.hp = Math.floor(BUILDING_DEFS[b.type].baseHP * Math.pow(1.3, b.level - 1));
            delete b.upgrading;
            changed = true;
            toast(`${BUILDING_DEFS[b.type].name} upgraded to Lv${b.level}!`, 'success');
            try { Audio.upgrade(); track('buildingsUpgraded'); } catch(e) {}
            notifyUser('Upgrade complete', `${BUILDING_DEFS[b.type].name} is now level ${b.level}!`);
        }
    }
    if (changed) {
        updateStorageCaps();
        const v = document.querySelector('#view-village.active');
        if (v) renderGrid();
        updateResources();
        saveGame();
    }
}

function finishCostGems(endsAt) {
    const remain = Math.max(0, endsAt - Date.now()) / 1000;
    return Math.max(1, Math.ceil(remain / 30));
}

function gemFinish(pos) {
    const b = state.buildings.find(x => x.pos === pos);
    if (!b) return;
    const endsAt = b.constructing ? b.endsAt : (b.upgrading ? b.upgrading.endsAt : 0);
    if (!endsAt) return;
    const cost = finishCostGems(endsAt);
    if (!spendGems(cost)) return;
    if (b.constructing) b.endsAt = Date.now() - 1;
    if (b.upgrading) b.upgrading.endsAt = Date.now() - 1;
    tickBuilders();
    try { Audio.coin(); } catch(e) {}
}

// ---------- SHOP ----------
const SHOP_ITEMS = [
    { id: 'coins_s',  name: 'Pouch of Coins',  desc: '+5,000 coins',  gems: 20,  give: { coins: 5000 } },
    { id: 'coins_l',  name: 'Chest of Coins',  desc: '+25,000 coins', gems: 80,  give: { coins: 25000 } },
    { id: 'gold_s',   name: 'Gold Crate',      desc: '+2,000 gold',   gems: 30,  give: { gold: 2000 } },
    { id: 'mats',     name: 'Builder Pack',    desc: '+3,000 wood & iron', gems: 35, give: { wood: 3000, iron: 3000 } },
    { id: 'finish',   name: 'Finish All Work', desc: 'Complete all builds/upgrades instantly', gems: 0, dynamic: true },
    { id: 'builder3', name: 'Hire 3rd Builder', desc: 'Permanent extra builder', gems: 200, builder: true }
];

function openShop() {
    ensureMeta();
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    const finishGems = state.buildings.reduce((s, b) => {
        const e = b.constructing ? b.endsAt : (b.upgrading ? b.upgrading.endsAt : 0);
        return s + (e ? finishCostGems(e) : 0);
    }, 0);
    content.innerHTML = `
        <h3 class="shop-title">${svgIcon('gem')} Gem Shop <span class="shop-gems">${formatNum(state.gems)} gems</span></h3>
        <p class="shop-hint">Earn gems from achievements, quests, daily rewards, campaign stars & clearing obstacles.</p>
        <div class="shop-grid">
            ${SHOP_ITEMS.map(it => {
                let g = it.gems, dis = '';
                if (it.dynamic) { g = finishGems; if (g === 0) dis = 'disabled'; }
                if (it.builder && state.builders.count >= 3) dis = 'disabled';
                return `<div class="shop-item">
                    <div class="shop-item-name">${it.name}</div>
                    <div class="shop-item-desc">${it.builder && state.builders.count >= 3 ? 'Already hired' : it.desc}</div>
                    <button class="btn btn-unlock" ${dis} onclick="buyShopItem('${it.id}')">${svgIcon('gem')} ${g}</button>
                </div>`;
            }).join('')}
        </div>`;
    overlay.classList.remove('hidden');
}

function buyShopItem(id) {
    const it = SHOP_ITEMS.find(x => x.id === id);
    if (!it) return;
    if (it.dynamic) {
        const total = state.buildings.reduce((s, b) => {
            const e = b.constructing ? b.endsAt : (b.upgrading ? b.upgrading.endsAt : 0);
            return s + (e ? finishCostGems(e) : 0);
        }, 0);
        if (total === 0) { toast('Nothing under construction.', 'info'); return; }
        if (!spendGems(total)) return;
        for (const b of state.buildings) {
            if (b.constructing) b.endsAt = Date.now() - 1;
            if (b.upgrading) b.upgrading.endsAt = Date.now() - 1;
        }
        tickBuilders();
    } else if (it.builder) {
        if (state.builders.count >= 3) return;
        if (!spendGems(it.gems)) return;
        state.builders.count = 3;
        toast('Third builder hired!', 'success');
    } else {
        if (!spendGems(it.gems)) return;
        addResources(it.give);
        toast(`Purchased ${it.name}!`, 'success');
        try { Audio.coin(); } catch(e) {}
    }
    updateResources();
    saveGame();
    openShop(); // refresh
}

// ---------- EVENTS (weekly rotation) ----------
const WEEKLY_EVENTS = [
    { id: 'coinrush',  name: 'Coin Rush',      desc: '+50% coins from raids',  lootMult: { coins: 1.5 } },
    { id: 'goldrush',  name: 'Gold Rush',      desc: '+50% gold from raids',   lootMult: { gold: 1.5 } },
    { id: 'warweek',   name: '️ War Week',       desc: '+50% XP from battles',   xpMult: 1.5 },
    { id: 'harvest',   name: 'Harvest Fest',   desc: '+50% food & wood loot',  lootMult: { food: 1.5, wood: 1.5 } }
];
function activeEvent() {
    const week = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
    return WEEKLY_EVENTS[week % WEEKLY_EVENTS.length];
}
function eventLootMult(res) {
    const ev = activeEvent();
    return (ev.lootMult && ev.lootMult[res]) || 1;
}
function eventXpMult() { return activeEvent().xpMult || 1; }

// ---------- LEAGUES ----------
const LEAGUES = [
    { name: 'Bronze',   icon: svgIcon('medal'), min: 0 },
    { name: 'Silver',   icon: svgIcon('medal'), min: 200 },
    { name: 'Gold',     icon: svgIcon('medal'), min: 500 },
    { name: 'Crystal',  icon: '', min: 1000 },
    { name: 'Master',   icon: '', min: 2000 },
    { name: 'Champion', icon: svgIcon('trophy'), min: 3500 },
    { name: 'Legend',   icon: svgIcon('star'), min: 5500 }
];
function currentLeague() {
    const t = state.trophies || 0;
    let l = LEAGUES[0];
    for (const x of LEAGUES) if (t >= x.min) l = x;
    return l;
}
function leaderboardRows() {
    const t = state.trophies || 0;
    const names = ['DragonSlayer', 'NightKing', 'IronFist', 'ShadowMage', 'WarChief', 'GoldHunter', 'FrostBite', 'SkullCrusher', 'RuneKnight'];
    const rows = names.map((n, i) => ({ name: n + (37 + i * 13) % 90, trophies: Math.max(0, t + Math.round((4 - i) * (24 + (i * 17) % 31))) }));
    rows.push({ name: state.playerName + ' (You)', trophies: t, you: true });
    rows.sort((a, b) => b.trophies - a.trophies);
    return rows;
}

// ---------- CAMPAIGN ----------
const CAMPAIGN_MISSIONS = [
    { name: 'Outskirts Skirmish', level: 1,  troops: { warrior: 4 },                                   loot: { coins: 400, wood: 200 } },
    { name: 'Bandit Toll Road',   level: 2,  troops: { warrior: 7, archer: 2 },                        loot: { coins: 700, gold: 100 } },
    { name: 'Riverside Ambush',   level: 3,  troops: { warrior: 9, archer: 4 },                        loot: { coins: 1000, iron: 200 } },
    { name: 'The Old Watchtower', level: 4,  troops: { warrior: 12, archer: 6 },                       loot: { coins: 1400, gold: 250 } },
    { name: 'Goblin Warrens',     level: 5,  troops: { warrior: 15, archer: 7, shieldbearer: 2 },      loot: { coins: 1900, wood: 600 } },
    { name: 'Marsh of Whispers',  level: 6,  troops: { warrior: 18, archer: 9, shieldbearer: 3 },      loot: { coins: 2500, gold: 450 } },
    { name: 'Ironfang Keep',      level: 8,  troops: { warrior: 22, archer: 11, shieldbearer: 5 },     loot: { coins: 3400, iron: 900 } },
    { name: 'The Burned Vale',    level: 10, troops: { warrior: 26, archer: 14, cavalry: 4 },          loot: { coins: 4600, gold: 800 } },
    { name: 'Wolfsblood Pass',    level: 12, troops: { warrior: 32, archer: 17, cavalry: 6 },          loot: { coins: 6200, wood: 1800 } },
    { name: 'Citadel of Ash',     level: 15, troops: { warrior: 40, archer: 22, shieldbearer: 9, cavalry: 7 }, loot: { coins: 8500, gold: 1500 } },
    { name: 'The Black Gate',     level: 18, troops: { warrior: 52, archer: 28, shieldbearer: 12, cavalry: 9 }, loot: { coins: 12000, gold: 2400 } },
    { name: "Tyrant's Throne",    level: 22, troops: { warrior: 70, archer: 38, shieldbearer: 16, cavalry: 12, siege: 4 }, loot: { coins: 18000, gold: 4000 } },
    // ---- Act II: The Northern Campaign ----
    { name: 'Frostgate Outpost',  level: 25, troops: { warrior: 84, archer: 46, shieldbearer: 20, cavalry: 14, siege: 5 },  loot: { coins: 24000, iron: 6000 } },
    { name: 'The Frozen March',   level: 28, troops: { warrior: 100, archer: 56, shieldbearer: 24, cavalry: 18, siege: 6 }, loot: { coins: 31000, gold: 6500 } },
    { name: 'Direwood Hollow',    level: 31, troops: { warrior: 120, archer: 68, shieldbearer: 30, cavalry: 22, siege: 8 }, loot: { coins: 40000, wood: 12000 } },
    { name: 'Stormhold Bastion',  level: 34, troops: { warrior: 145, archer: 82, shieldbearer: 36, cavalry: 28, siege: 10 }, loot: { coins: 52000, gold: 11000 } },
    { name: 'The Shattered Spire', level: 38, troops: { warrior: 175, archer: 100, shieldbearer: 44, cavalry: 34, siege: 12 }, loot: { coins: 68000, iron: 18000 } },
    { name: 'Vale of the Fallen', level: 42, troops: { warrior: 210, archer: 122, shieldbearer: 54, cavalry: 42, siege: 15 }, loot: { coins: 88000, gold: 18000 } },
    // ---- Act III: The Warlord's End ----
    { name: 'Bloodmoon Fortress', level: 46, troops: { warrior: 255, archer: 148, shieldbearer: 66, cavalry: 52, siege: 18 }, loot: { coins: 115000, gold: 26000 } },
    { name: 'The Obsidian Keep',  level: 50, troops: { warrior: 310, archer: 180, shieldbearer: 82, cavalry: 64, siege: 22 }, loot: { coins: 150000, iron: 40000 } },
    { name: "Dragon's Roost",     level: 55, troops: { warrior: 380, archer: 220, shieldbearer: 100, cavalry: 80, siege: 28 }, loot: { coins: 200000, gold: 45000 } },
    { name: 'Gates of the North', level: 60, troops: { warrior: 470, archer: 275, shieldbearer: 124, cavalry: 100, siege: 36 }, loot: { coins: 275000, gold: 65000 } },
    { name: "The Usurper's Host", level: 66, troops: { warrior: 580, archer: 340, shieldbearer: 154, cavalry: 124, siege: 46 }, loot: { coins: 380000, iron: 90000 } },
    { name: 'The Iron Throne',    level: 72, troops: { warrior: 720, archer: 430, shieldbearer: 190, cavalry: 156, siege: 60 }, loot: { coins: 520000, gold: 120000 } }
];

// Town Hall gate: you may only complete 2 campaign missions per Town Hall level.
// Mission i (0-indexed) needs Town Hall level ceil((i+1)/2): missions 1-2 → TH1,
// 3-4 → TH2, 5-6 → TH3 … so finishing the campaign means grinding the TH to Lv6.
function missionReqTH(i) { return Math.ceil((i + 1) / 2); }
function getCampaignTHLevel() { return (typeof getTHLevel === 'function') ? getTHLevel() : 1; }

function missionUnlocked(i) {
    const prevDone = i === 0 || (state.campaign.stars[i - 1] || 0) >= 1;
    const thOk = getCampaignTHLevel() >= missionReqTH(i);
    return prevDone && thOk;
}

function startCampaignMission(i) {
    ensureMeta();
    const m = CAMPAIGN_MISSIONS[i];
    if (!m) return;
    if (!missionUnlocked(i)) {
        const prevDone = i === 0 || (state.campaign.stars[i - 1] || 0) >= 1;
        if (!prevDone) { toast('Beat the previous mission first!', 'error'); return; }
        // blocked by the Town Hall gate
        toast(`Upgrade your Town Hall to Lv${missionReqTH(i)} to take on this mission! (2 missions per Town Hall level)`, 'error');
        try { Audio.error(); } catch (e) {}
        return;
    }
    const army = getDeployed('army');
    if (army.length === 0) { toast('Deploy soldiers to your ARMY first!', 'error'); switchView('army'); return; }
    runLiveRaid({
        name: m.name, level: m.level, troops: m.troops, loot: m.loot, xp: 40 + m.level * 18,
        kind: 'campaign', missionIndex: i
    });
}

// ---------- SHIELD & REVENGE ----------
function hasShield() { ensureMeta(); return Date.now() < state.shieldUntil; }
function grantShield(mins) {
    ensureMeta();
    state.shieldUntil = Date.now() + mins * 60000;
    toast(`Shield active for ${mins} minutes — no attacks can reach you.`, 'info');
}
function breakShield() { if (hasShield()) { state.shieldUntil = 0; toast('Your shield dropped (you attacked someone).', 'warning'); } }

function revengeRaid(logIndex) {
    const entry = state.battleLog[logIndex];
    if (!entry || entry.type !== 'defense') return;
    const army = getDeployed('army');
    if (army.length === 0) { toast('Deploy soldiers to your ARMY first!', 'error'); switchView('army'); return; }
    const lvl = Math.max(2, Math.min(20, state.level));
    runLiveRaid({
        name: entry.target + ' (Revenge)', level: lvl,
        troops: { warrior: 8 + lvl * 2, archer: 4 + lvl },
        loot: { coins: 300 * lvl, gold: 50 * lvl, iron: 40 * lvl },
        xp: 30 + lvl * 12, kind: 'revenge'
    });
}

// ---------- SCOUTING ----------
function scoutCamp(index) {
    const camp = CPU_CAMPS[index];
    if (!camp) return;
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    const base = generateEnemyBase(camp);
    const defs = base.defenses.length, blds = base.buildings.length, traps = base.traps.length;
    content.innerHTML = `
        <h3 class="shop-title"> Scouting: ${camp.name}</h3>
        <div class="scout-map">
            ${base.buildings.map(b => `<div class="scout-dot scout-bld" style="left:${b.x}%;top:${b.y}%" title="${b.type}"></div>`).join('')}
            ${base.defenses.map(d => `<div class="scout-dot scout-def" style="left:${d.x}%;top:${d.y}%" title="defense"></div>`).join('')}
        </div>
        <div class="scout-info">
            <span>${svgIcon('home')} ${blds} buildings</span><span>${svgIcon('dagger')} ${defs} defenses</span><span> ~${traps} traps (hidden)</span>
        </div>
        <div class="scout-info">Garrison: ${Object.entries(camp.troops).map(([t, c]) => `${c} ${TROOP_DEFS[t]?.name || t}`).join(', ')}</div>
        <p class="shop-hint">Defenses (red) will fire at your troops. Deploy from the bottom edge. Destroy 50% for 1${svgIcon('star')}, the Town Hall for 2${svgIcon('star')}, everything for 3${svgIcon('star')}.</p>
        <button class="btn btn-danger btn-glow" onclick="document.getElementById('modal-overlay').classList.add('hidden'); launchRaid('cpu', ${index})">${svgIcon('swords')}️ Attack Now</button>`;
    overlay.classList.remove('hidden');
}

// ---------- DAILY LOGIN REWARDS ----------
const DAILY_REWARDS = [
    { coins: 500 }, { coins: 800, gems: 5 }, { gold: 300 }, { coins: 1500, gems: 8 },
    { iron: 800, wood: 800 }, { gold: 800, gems: 10 }, { coins: 5000, gems: 25 }
];
function checkDailyReward() {
    ensureMeta();
    // Never pop a blocking modal over the tutorial — its overlay would swallow
    // the player's taps and the tutorial could never be completed. Wait it out.
    if ((typeof tutorialActive !== 'undefined' && tutorialActive) ||
        (document.getElementById('tutorial-overlay') && !document.getElementById('tutorial-overlay').classList.contains('hidden'))) {
        setTimeout(checkDailyReward, 2500);
        return;
    }
    const today = new Date().toDateString();
    if (state.daily.last === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    state.daily.streak = (state.daily.last === yesterday) ? (state.daily.streak + 1) : 1;
    state.daily.last = today;
    const day = ((state.daily.streak - 1) % 7);
    const reward = DAILY_REWARDS[day];
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <h3 class="shop-title"> Daily Reward — Day ${day + 1}</h3>
        <p class="shop-hint">Login streak: ${state.daily.streak} day${state.daily.streak > 1 ? 's' : ''}. Come back tomorrow for more!</p>
        <div class="daily-strip">
            ${DAILY_REWARDS.map((r, i) => {
                const cls = i === day ? 'today' : i < day ? 'past' : '';
                const rewards = Object.entries(r).map(([k, v]) =>
                    `<div class="dc-reward"><span class="dc-ico">${k === 'gems' ? svgIcon('gem') : (RES_ICONS[k] || k)}</span><span class="dc-amt">${formatNum(v)}</span></div>`
                ).join('');
                return `<div class="daily-cell ${cls}">
                    <div class="dc-day">Day ${i + 1}</div>
                    <div class="dc-rewards">${rewards}</div>
                </div>`;
            }).join('')}
        </div>
        <p class="shop-hint" style="margin-top:10px">Today's reward:</p>
        <div class="loot-gained" style="margin:6px 0 12px">
            ${Object.entries(reward).map(([k, v]) => `<div class="loot-item">${k === 'gems' ? svgIcon('gem') : (RES_ICONS[k] || k)} +${formatNum(v)}</div>`).join('')}
        </div>
        <button class="btn btn-gold btn-glow" onclick="claimDaily()">Claim!</button>`;
    overlay.classList.remove('hidden');
    window.__dailyReward = reward;
}
function claimDaily() {
    const r = window.__dailyReward || {};
    if (r.gems) addGems(r.gems);
    const res = { ...r }; delete res.gems;
    addResources(res);
    try { Audio.coin(); confetti(30, 1500); } catch(e) {}
    document.getElementById('modal-overlay').classList.add('hidden');
    updateResources(); saveGame();
}

// ---------- CLAN HALL (donations + chat) ----------
const CLAN_BOT_LINES = [
    'Anyone up for a war this weekend?', 'Just 3-starred a level 12 base ', 'Donating archers, who needs?',
    'gg everyone, nice season', 'Upgrading my fortress, 2 days left...', 'Welcome to the new members!',
    'Tip: put shieldbearers in your front row', 'Who attacked WolfPack42? nice one'
];
function requestClanTroops() {
    if (!state.club) { toast('Join a club first!', 'error'); return; }
    toast('Troop request sent to your club...', 'info');
    setTimeout(() => {
        const types = ['warrior', 'archer', 'shieldbearer'];
        const t = types[Math.floor(Math.random() * types.length)];
        ensureSoldiers();
        addSoldier(t, 'reserve');
        const donor = state.club.members.find(m => !m.isPlayer);
        toast(`${donor ? donor.name : 'A clanmate'} donated a ${TROOP_DEFS[t].name}!`, 'success');
        clanChatPush(donor ? donor.name : 'Clanmate', `Sent you a ${TROOP_DEFS[t].name}!`);
        updateNotificationBadges();
        saveGame();
        const wv = document.querySelector('#view-world.active'); if (wv) renderWorldView();
    }, 4000 + Math.random() * 5000);
}
function clanChatPush(who, msg) {
    ensureMeta();
    state.clanChat.push({ who, msg, t: Date.now() });
    if (state.clanChat.length > 30) state.clanChat.shift();
}
function sendClanChat() {
    const inp = document.getElementById('clan-chat-input');
    if (!inp || !inp.value.trim()) return;
    clanChatPush('You', inp.value.trim());
    inp.value = '';
    saveGame();
    renderWorldView();
    // bot reply sometimes
    if (Math.random() < 0.6) setTimeout(() => {
        const who = state.club ? (state.club.members.find(m => !m.isPlayer)?.name || 'Clanmate') : 'Wanderer';
        clanChatPush(who, CLAN_BOT_LINES[Math.floor(Math.random() * CLAN_BOT_LINES.length)]);
        const wv = document.querySelector('#view-world.active'); if (wv) renderWorldView();
    }, 2500 + Math.random() * 4000);
}

// ---------- SAVE CODES (export / import) ----------
function exportSave() {
    try {
        const code = btoa(unescape(encodeURIComponent(JSON.stringify(state))));
        navigator.clipboard && navigator.clipboard.writeText(code);
        prompt('Your save code (copied to clipboard). Keep it safe:', code.slice(0, 60) + '…  [full code copied]');
        toast('Save code copied to clipboard!', 'success');
    } catch(e) { toast('Export failed.', 'error'); }
}
function importSave() {
    const code = prompt('Paste your save code:');
    if (!code) return;
    try {
        const data = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
        if (!data || !data.resources) throw new Error('bad');
        localStorage.setItem('villagewar_save', JSON.stringify(data));
        toast('Save imported! Reloading…', 'success');
        setTimeout(() => location.reload(), 800);
    } catch(e) { toast('Invalid save code.', 'error'); }
}

// ---------- NOTIFICATIONS ----------
function notifyUser(title, body) {
    ensureMeta();
    if (!state.notifyOn) return;
    try {
        if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
            new Notification('Village War — ' + title, { body });
        }
    } catch(e) {}
}
function toggleNotifications() {
    ensureMeta();
    if (state.notifyOn) { state.notifyOn = false; toast('Notifications off.', 'info'); renderWorldView(); saveGame(); return; }
    if (!('Notification' in window)) { toast('Browser does not support notifications.', 'error'); return; }
    Notification.requestPermission().then(p => {
        state.notifyOn = (p === 'granted');
        toast(state.notifyOn ? ' Notifications on!' : 'Permission denied.', state.notifyOn ? 'success' : 'error');
        renderWorldView(); saveGame();
    });
}

// ---------- WORLD VIEW ----------
function renderWorldView() {
    ensureMeta();
    const el = document.getElementById('view-world');
    if (!el) return;
    const ev = activeEvent();
    const lg = currentLeague();
    const rows = leaderboardRows();
    const shieldLeft = Math.max(0, state.shieldUntil - Date.now());
    const thLevel = getCampaignTHLevel();
    const missions = CAMPAIGN_MISSIONS.map((m, i) => {
        const stars = state.campaign.stars[i] || 0;
        const unlocked = missionUnlocked(i);
        const prevDone = i === 0 || (state.campaign.stars[i - 1] || 0) >= 1;
        const thGated = prevDone && !unlocked;   // previous done, but Town Hall too low
        const reqTH = missionReqTH(i);
        return `<div class="mission-node ${unlocked ? '' : 'locked'} ${thGated ? 'th-gated' : ''} ${stars > 0 ? 'done' : ''}" onclick="startCampaignMission(${i})">
            <div class="mission-num">${i + 1}</div>
            <div class="mission-name">${m.name}</div>
            <div class="mission-stars">${svgIcon('star').repeat(stars)}${svgIcon('starOutline').repeat(3 - stars)}</div>
            ${thGated
                ? `<div class="mission-req">${svgIcon('lock')} Town Hall Lv${reqTH}</div>`
                : `<div class="mission-lv">Lv${m.level}</div>`}
            ${unlocked ? '' : '<div class="mission-lock"></div>'}
        </div>`;
    }).join('');

    el.innerHTML = `
        <h2>${svgIcon('globe')} World</h2>

        <div class="world-row">
            <div class="world-card event-card">
                <h3>${ev.name} <span class="event-live">LIVE THIS WEEK</span></h3>
                <p>${ev.desc}</p>
            </div>
            <div class="world-card league-card">
                <h3>${lg.icon} ${lg.name} League</h3>
                <p>${svgIcon('trophy')} ${state.trophies || 0} trophies${shieldLeft > 0 ? ` · ${svgIcon('shield')}️ shield ${Math.ceil(shieldLeft / 60000)}m` : ''}</p>
                <div class="lb-rows">
                    ${rows.slice(0, 6).map((r, i) => `<div class="lb-row ${r.you ? 'you' : ''}"><span>#${i + 1}</span><span>${r.name}</span><span>${svgIcon('trophy')}${r.trophies}</span></div>`).join('')}
                </div>
            </div>
        </div>

        <h3 class="hero-section-title">${svgIcon('swords')}️ Campaign</h3>
        <p class="campaign-note">${svgIcon('castle')} You can clear <b>2 missions per Town Hall level</b>. You're at Town Hall <b>Lv${thLevel}</b> — upgrade it to unlock more.</p>
        <div class="mission-map">${missions}</div>

        <h3 class="hero-section-title">${svgIcon('castle')} Clan Hall</h3>
        <div class="world-card">
            ${state.club ? `
                <p><b>${state.club.name}</b> — ${state.club.members.length} members</p>
                <button class="btn btn-success" onclick="requestClanTroops()"> Request Troops</button>
                <div class="clan-chat">
                    ${(state.clanChat.slice(-8)).map(c => `<div class="chat-line"><b>${c.who}:</b> ${c.msg}</div>`).join('') || '<div class="chat-line" style="opacity:0.6">No messages yet…</div>'}
                </div>
                <div class="chat-send">
                    <input id="clan-chat-input" placeholder="Message your clan…" onkeydown="if(event.key==='Enter')sendClanChat()">
                    <button class="btn btn-primary" onclick="sendClanChat()">Send</button>
                </div>
            ` : `<p>Join a club (Club tab) to unlock troop donations & clan chat.</p>`}
        </div>

        <h3 class="hero-section-title">${svgIcon('gear')}️ Account</h3>
        <div class="world-card account-row">
            <button class="btn btn-primary" onclick="exportSave()">${svgIcon('upload')} Export Save Code</button>
            <button class="btn btn-primary" onclick="importSave()">${svgIcon('download')} Import Save Code</button>
            <button class="btn ${state.notifyOn ? 'btn-success' : 'btn-primary'}" onclick="toggleNotifications()">${state.notifyOn ? ' Notifications ON' : ' Enable Notifications'}</button>
            <button class="btn btn-gold" onclick="openShop()">${svgIcon('gem')} Gem Shop</button>
        </div>
    `;
}

// ---------- Bot chat seeding ----------
setInterval(() => {
    try {
        if (state && state.club && Math.random() < 0.18) {
            const who = state.club.members.find(m => !m.isPlayer)?.name || 'Clanmate';
            clanChatPush(who, CLAN_BOT_LINES[Math.floor(Math.random() * CLAN_BOT_LINES.length)]);
            const wv = document.querySelector('#view-world.active'); if (wv) renderWorldView();
        }
    } catch(e) {}
}, 45000);
