// ============================================================
// EXPANSION PACK — a big batch of extra systems
// Lucky Wheel, Crates, Black Market, Marketplace, Bank, Potions,
// Production Boost, Season Pass, Talent Tree, Collection, Profile,
// Clan Wars, Tournaments, World Regions, Boss Raid, Friends,
// Gem Mine, Settings, Daily Challenges, Decorations.
// Self-contained: reads/writes state.exp, persists via saveGame().
// ============================================================

const DAY_MS = 86400000;

function ensureExp() {
    if (typeof ensureMeta === 'function') ensureMeta();
    if (!state.exp) state.exp = {};
    const e = state.exp;
    if (e.talentPoints == null) e.talentPoints = 0;
    if (!e.talents) e.talents = {};
    if (!e.pass) e.pass = { xp: 0, tier: 0, claimed: { free: [], gold: [] }, gold: false };
    if (!e.items) e.items = { build: 1, train: 1, resource: 1, research: 0, shield: 0 };
    if (e.boostUntil == null) e.boostUntil = 0;
    if (e.bank == null) e.bank = { deposited: 0, since: Date.now() };
    if (!e.regions) e.regions = {};
    if (!e.collection) e.collection = {};
    if (!e.stats) e.stats = { raidsWon: 0, raidsLost: 0, troopsTrained: 0, resourcesEarned: 0, bossKills: 0, warWins: 0, spins: 0, cratesOpened: 0 };
    if (!e.settings) e.settings = { sfx: true, music: false, notify: true, lowGfx: false };
    if (e.wheelFreeAt == null) e.wheelFreeAt = 0;
    if (e.gemMineSince == null) e.gemMineSince = Date.now();
    if (e.crates == null) e.crates = 1;
    if (e.talentPointsGrantedAt == null) e.talentPointsGrantedAt = state.level;
    if (!e.clanWar) e.clanWar = null;
    if (!e.tournament) e.tournament = null;
    if (!e.friends) e.friends = defaultFriends();
    if (!e.dayStamp) e.dayStamp = 0;
    if (!e.challenges) e.challenges = [];
    if (!e.decor) e.decor = {};
    if (!e.traderDay) e.traderDay = -1;
    if (!e.trader) e.trader = [];
    refreshDailies();
    // grant 1 talent point per level gained
    if (state.level > e.talentPointsGrantedAt) {
        e.talentPoints += (state.level - e.talentPointsGrantedAt);
        e.talentPointsGrantedAt = state.level;
    }
    return e;
}

function defaultFriends() {
    return [
        { name: 'SirLancelot', th: 5, trophies: 1240, giftReadyAt: 0 },
        { name: 'GwenStrong',  th: 4, trophies: 980,  giftReadyAt: 0 },
        { name: 'IronMordred', th: 6, trophies: 1605, giftReadyAt: 0 },
        { name: 'ArcherQueen',  th: 5, trophies: 1320, giftReadyAt: 0 }
    ];
}

// ---- tiny deterministic RNG keyed by an integer (so dailies are stable) ----
function expRng(seed) {
    let s = (seed * 2654435761) % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function expDay() { return Math.floor(Date.now() / DAY_MS); }

function expGainRes(res, note) {
    for (const k in res) {
        const cap = (state.maxResources && state.maxResources[k]) || 1e15;
        state.resources[k] = Math.min(cap, (state.resources[k] || 0) + res[k]);
        if (state.exp && state.exp.stats) state.exp.stats.resourcesEarned += res[k];
    }
    if (typeof updateResources === 'function') updateResources();
    if (note) toast(note, 'success');
}

function addPassXp(n) {
    ensureExp();
    const p = state.exp.pass;
    p.xp += n;
    while (p.xp >= 100 && p.tier < PASS_TIERS.length - 1) { p.xp -= 100; p.tier++; }
    if (p.tier >= PASS_TIERS.length - 1) p.xp = Math.min(p.xp, 100);
    saveGame();
}

// =====================================================================
// MORE HUB
// =====================================================================
const MORE_CARDS = [
    { id: 'wheel',     icon: 'wheel',      name: 'Lucky Wheel',    desc: 'Free daily spin for prizes', cat: 'rewards' },
    { id: 'crates',    icon: 'crate',      name: 'Mystery Crates',  desc: 'Open crates for loot', cat: 'rewards' },
    { id: 'challenges',icon: 'challenges', name: 'Daily Challenges', desc: '3 tasks, fresh each day', cat: 'rewards' },
    { id: 'pass',      icon: 'pass',       name: 'Season Pass',     desc: 'Tiered seasonal rewards', cat: 'rewards' },
    { id: 'gemmine',   icon: 'gem',        name: 'Gem Mine',        desc: 'Passive gem trickle', cat: 'rewards' },

    { id: 'trader',    icon: 'cart',       name: 'Black Market',    desc: 'Rotating daily deals', cat: 'economy' },
    { id: 'market',    icon: 'scale',      name: 'Marketplace',     desc: 'Trade resources', cat: 'economy' },
    { id: 'bank',      icon: 'bank',       name: 'Royal Bank',      desc: 'Earn interest on coins', cat: 'economy' },
    { id: 'boost',     icon: 'bolt',       name: 'Production Boost', desc: '2× all output', cat: 'economy' },
    { id: 'items',     icon: 'flask',      name: 'Magic Potions',   desc: 'Boost builds, troops & loot', cat: 'economy' },

    { id: 'talents',   icon: 'tree',       name: 'Talent Tree',     desc: 'Permanent account perks', cat: 'progression' },
    { id: 'regions',   icon: 'map',        name: 'World Regions',   desc: 'Conquer for passive bonuses', cat: 'progression' },
    { id: 'decor',     icon: 'flower',     name: 'Decorations',     desc: 'Cosmetics for trophies', cat: 'progression' },
    { id: 'collection',icon: 'book',       name: 'Collection',      desc: 'Troop & hero codex', cat: 'progression' },
    { id: 'profile',   icon: 'profile',    name: 'Profile & Stats', desc: 'Your lifetime record', cat: 'progression' },

    { id: 'boss',      icon: 'dragon',     name: 'Boss Raid',       desc: 'Fight a mighty warlord', cat: 'combat' },
    { id: 'clanwar',   icon: 'swords',     name: 'Clan Wars',       desc: 'War vs a rival clan', cat: 'combat' },
    { id: 'tournament',icon: 'trophy',     name: 'Tournament',      desc: '8-player bracket', cat: 'combat' },
    { id: 'friends',   icon: 'friends',    name: 'Friends',         desc: 'Gift & visit allies', cat: 'combat' },

    { id: 'online',    icon: 'cloud',      name: 'Online',          desc: 'Accounts, cloud saves & real clans', cat: 'system' },
    { id: 'settings',  icon: 'gear',       name: 'Settings',        desc: 'Sound, saves & options', cat: 'system' },
    { id: 'credits',   icon: 'book',       name: 'Credits',         desc: 'Music & art attributions', cat: 'system' }
];
const MORE_SECTIONS = [
    { cat: 'rewards',     icon: 'gift',    title: 'Rewards & Loot',  blurb: 'Free prizes, crates & seasonal tracks' },
    { cat: 'economy',     icon: 'coins',   title: 'Economy & Trade', blurb: 'Grow, trade & boost your resources' },
    { cat: 'progression', icon: 'chart',   title: 'Progression',     blurb: 'Perks, territory & your record' },
    { cat: 'combat',      icon: 'swords',  title: 'Combat & Social', blurb: 'Wars, bosses, brackets & allies' },
    { cat: 'system',      icon: 'sliders', title: 'System',          blurb: 'Game options & saves' }
];
const MORE_OPENERS = {
    wheel: 'openWheel', crates: 'openCrates', trader: 'openTrader', market: 'openMarket',
    bank: 'openBank', items: 'openItems', boost: 'openBoost', pass: 'openPass',
    talents: 'openTalents', challenges: 'openChallenges', regions: 'openRegions',
    boss: 'openBossRaid', clanwar: 'openClanWar', tournament: 'openTournament',
    friends: 'openFriends', gemmine: 'openGemMine', decor: 'openDecor',
    collection: 'openCollection', profile: 'openProfile', settings: 'openSettings',
    online: 'openOnline', credits: 'openCredits'
};

function openCredits() {
    const kml = [
        'Angevin', 'Fiddles McGinty', 'Minstrel Guild', 'Enchanted Journey', 'Thatched Villagers',
        'Master of the Feast', 'Clash Defiant', 'Heroic Age', 'Teller of the Tales',
        'Wizardtorium', 'The Path of the Goblin King', 'Anguish', 'Skye Cuillin'
    ];
    expModal(`
        <h3 class="exp-title">${svgIcon('book')} Credits</h3>
        <div style="text-align:left;max-height:60vh;overflow:auto;font-size:0.85rem;line-height:1.5">
            <p style="color:var(--gold);font-weight:700;margin-top:4px">Music</p>
            <p>Several tracks by <b>Kevin MacLeod</b> (incompetech.com), licensed under
               <b>Creative Commons: By Attribution 4.0</b> —
               creativecommons.org/licenses/by/4.0/ :</p>
            <p style="color:var(--text2);margin:4px 0 8px">${kml.join(' • ')}</p>
            <p>Additional bundled tracks: Village Green, Dancing at the Inn, The Britons,
               Rogue Meadow, Beyond New Horizons, Toward the Mountains.</p>
            <p style="color:var(--gold);font-weight:700;margin-top:10px">Art &amp; Code</p>
            <p>Custom SVG icon set, building &amp; troop sprites, isometric and 3D village
               rendering, UI and all game systems built for <b>Village War</b>.</p>
            <p style="color:var(--text2);font-size:0.78rem;margin-top:10px">Thank you for playing. ⚔</p>
        </div>
        <div class="exp-actions"><button class="btn btn-primary" onclick="closeExpModal()">Close</button></div>`);
}

function renderMoreView() {
    ensureExp();
    const el = document.getElementById('view-more');
    if (!el) return;
    const ic = (typeof svgIcon === 'function') ? svgIcon : () => '';
    el.innerHTML = `
        <h2 class="more-h2">${ic('plus', 'more-h2-ic')} More</h2>
        <p class="more-sub">A whole world of extra systems, organised by type.</p>
        ${MORE_SECTIONS.map(sec => {
            const cards = MORE_CARDS.filter(c => c.cat === sec.cat);
            if (!cards.length) return '';
            return `<section class="more-section more-sec-${sec.cat}">
                <div class="more-section-head">
                    <span class="more-section-ic">${ic(sec.icon)}</span>
                    <h3 class="more-section-title">${sec.title}</h3>
                    <span class="more-section-blurb">${sec.blurb}</span>
                </div>
                <div class="more-grid">
                    ${cards.map(c => `
                        <button class="more-card more-${c.cat}" onclick="${MORE_OPENERS[c.id]}()">
                            <span class="more-ic">${ic(c.icon)}</span>
                            <span class="more-nm">${c.name}</span>
                            <span class="more-ds">${c.desc}</span>
                        </button>`).join('')}
                </div>
            </section>`;
        }).join('')}`;
}

function expModal(html, cls) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    if (!overlay || !content) return;
    content.innerHTML = `<div class="exp-modal ${cls || ''}">${html}</div>`;
    overlay.classList.remove('hidden');
}
function closeExpModal() { document.getElementById('modal-overlay').classList.add('hidden'); }

// =====================================================================
// LUCKY WHEEL
// =====================================================================
const WHEEL_PRIZES = [
    { label: '500c',  color: '#f4b740', give: () => expGainRes({ coins: 500 }, ' +500 coins') },
    { label: '5',   color: '#7dd3fc', give: () => { addGems(5); } },
    { label: '300g',  color: '#fcd34d', give: () => expGainRes({ gold: 300 }, ' +300 gold') },
    { label: 'Crate', color: '#a78bfa', give: () => { state.exp.crates++; toast('+1 Mystery Crate', 'success'); } },
    { label: '1500c', color: '#f59e0b', give: () => expGainRes({ coins: 1500 }, ' +1500 coins') },
    { label: '20',  color: '#38bdf8', give: () => { addGems(20); } },
    { label: 'Potion',color: '#4ade80', give: () => { state.exp.items.resource++; toast('+1 Resource Potion', 'success'); } },
    { label: '400i',  color: '#cbd5e1', give: () => expGainRes({ iron: 400 }, '️ +400 iron') }
];
function openWheel() {
    ensureExp();
    const free = Date.now() >= state.exp.wheelFreeAt;
    const seg = 360 / WHEEL_PRIZES.length;
    expModal(`
        <h3 class="exp-title">${svgIcon('wheel')} Lucky Wheel</h3>
        <p class="exp-hint">${free ? 'You have a FREE spin today!' : 'Free spin used — spin again for 20.'}</p>
        <div class="wheel-wrap">
            <div class="wheel-pointer"></div>
            <div id="wheel" class="wheel" style="background:conic-gradient(${WHEEL_PRIZES.map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(',')})">
                ${WHEEL_PRIZES.map((p, i) => `<span class="wheel-lbl" style="transform:rotate(${i * seg + seg / 2}deg)"><b style="transform:rotate(90deg)">${p.label}</b></span>`).join('')}
            </div>
        </div>
        <div class="exp-actions">
            <button class="btn btn-primary btn-glow" onclick="spinWheel()">${free ? ' FREE Spin' : ' Spin (20)'}</button>
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
let _wheelSpinning = false;
function spinWheel() {
    ensureExp();
    if (_wheelSpinning) return;
    const free = Date.now() >= state.exp.wheelFreeAt;
    if (!free && !spendGems(20)) return;
    if (free) state.exp.wheelFreeAt = Date.now() + DAY_MS;
    state.exp.stats.spins++;
    challengeProgress('spin', 1);
    _wheelSpinning = true;
    const idx = Math.floor(expRng(state.exp.stats.spins * 97 + Date.now() % 1000)() * WHEEL_PRIZES.length);
    const seg = 360 / WHEEL_PRIZES.length;
    const wheel = document.getElementById('wheel');
    const turns = 5 * 360;
    const dest = turns + (360 - (idx * seg + seg / 2));
    if (wheel) { wheel.style.transition = 'transform 3.4s cubic-bezier(0.16,1,0.3,1)'; wheel.style.transform = `rotate(${dest}deg)`; }
    addPassXp(15);
    setTimeout(() => {
        _wheelSpinning = false;
        WHEEL_PRIZES[idx].give();
        toast(`You won: ${WHEEL_PRIZES[idx].label}!`, 'success');
        saveGame();
        openWheel();
    }, 3500);
}

// =====================================================================
// MYSTERY CRATES
// =====================================================================
const CRATE_TYPES = [
    { id: 'wood',  name: 'Wooden Crate',  cost: 0,  gems: 0,  rolls: 2 },
    { id: 'iron',  name: 'Iron Crate',    cost: 0,  gems: 15, rolls: 3 },
    { id: 'gold',  name: 'Golden Crate',  cost: 0,  gems: 40, rolls: 4 }
];
function crateRoll(mult) {
    const r = expRng(Math.floor(Date.now()) + state.exp.stats.cratesOpened * 31 + Math.floor(Math.random() * 1e6))();
    if (r < 0.35) return { t: 'coins', n: Math.round(400 * mult), give: () => expGainRes({ coins: 400 * mult }) };
    if (r < 0.6)  return { t: 'gold',  n: Math.round(250 * mult), give: () => expGainRes({ gold: 250 * mult }) };
    if (r < 0.8)  return { t: 'iron',  n: Math.round(300 * mult), give: () => expGainRes({ iron: 300 * mult }) };
    if (r < 0.93) return { t: 'gems',  n: Math.round(8 * mult),   give: () => addGems(Math.round(8 * mult)) };
    return { t: 'potion', n: 1, give: () => { state.exp.items.build++; } };
}
function openCrates() {
    ensureExp();
    expModal(`
        <h3 class="exp-title">${svgIcon('gift')} Mystery Crates</h3>
        <p class="exp-hint">You own <b>${state.exp.crates}</b> free crate(s). Win more from the Wheel & battles.</p>
        <div class="crate-grid">
            ${CRATE_TYPES.map((c, i) => `
                <div class="crate-card">
                    <div class="crate-emoji">${svgIcon('gift')}</div>
                    <div class="crate-name">${c.name}</div>
                    <div class="crate-meta">${c.rolls} rewards</div>
                    <button class="btn btn-primary" onclick="openCrate(${i})">
                        ${c.gems ? c.gems + '' : (state.exp.crates > 0 ? 'Open Free' : 'Need crate')}
                    </button>
                </div>`).join('')}
        </div>
        <div id="crate-loot" class="crate-loot"></div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function openCrate(i) {
    ensureExp();
    const c = CRATE_TYPES[i];
    if (c.gems) { if (!spendGems(c.gems)) return; }
    else { if (state.exp.crates <= 0) { toast('No free crates left — win one from the Wheel!', 'error'); return; } state.exp.crates--; }
    const mult = i === 0 ? 1 : i === 1 ? 1.8 : 3;
    const loot = [];
    for (let k = 0; k < c.rolls; k++) { const roll = crateRoll(mult); roll.give(); loot.push(roll); }
    state.exp.stats.cratesOpened++;
    challengeProgress('crate', 1);
    addPassXp(10);
    saveGame();
    const box = document.getElementById('crate-loot');
    if (box) box.innerHTML = `<div class="loot-pop">${loot.map(l => `<span class="loot-chip loot-${l.t}">${l.t === 'gems' ? '' : l.t === 'potion' ? '' : ''}${formatNum(l.n)} ${l.t}</span>`).join('')}</div>`;
    // refresh counts after a beat
    setTimeout(() => { const h = document.querySelector('.exp-modal .exp-hint'); if (h) h.innerHTML = `You own <b>${state.exp.crates}</b> free crate(s). Win more from the Wheel & battles.`; }, 50);
}

// =====================================================================
// BLACK MARKET (rotating daily deals)
// =====================================================================
function buildTraderDeals(day) {
    const rng = expRng(day * 7919 + 13);
    const deals = [];
    const pool = [
        () => ({ name: 'Coin Bundle', cost: { gold: 200 }, give: { coins: 1200 }, label: '1200 coins for 200 gold' }),
        () => ({ name: 'Iron Shipment', cost: { coins: 600 }, give: { iron: 900 }, label: '900 iron for 600 coins' }),
        () => ({ name: 'Lumber Haul', cost: { coins: 500 }, give: { wood: 1000 }, label: '1000 wood for 500 coins' }),
        () => ({ name: 'Gem Trade', gems: 10, give: { gold: 800 }, label: '800 gold for 10' }),
        () => ({ name: 'Feast Supplies', cost: { gold: 150 }, give: { food: 1400 }, label: '1400 food for 150 gold' }),
        () => ({ name: 'Builder Potion', gems: 18, item: 'build', label: '1 Builder Potion for 18' })
    ];
    for (let i = 0; i < 4; i++) { const f = pool[Math.floor(rng() * pool.length)]; deals.push(f()); }
    return deals;
}
function openTrader() {
    ensureExp();
    const day = expDay();
    if (state.exp.traderDay !== day) { state.exp.traderDay = day; state.exp.trader = buildTraderDeals(day).map(d => ({ ...d, bought: false })); saveGame(); }
    const deals = state.exp.trader;
    expModal(`
        <h3 class="exp-title">${svgIcon('cart')} Black Market</h3>
        <p class="exp-hint">Deals refresh every day. Stock is limited to one each.</p>
        <div class="trader-list">
            ${deals.map((d, i) => `
                <div class="trader-row ${d.bought ? 'sold' : ''}">
                    <div><div class="trader-name">${d.name}</div><div class="trader-desc">${d.label}</div></div>
                    <button class="btn btn-primary" ${d.bought ? 'disabled' : ''} onclick="buyTraderDeal(${i})">${d.bought ? 'Sold' : 'Buy'}</button>
                </div>`).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function buyTraderDeal(i) {
    ensureExp();
    const d = state.exp.trader[i];
    if (!d || d.bought) return;
    if (d.gems) { if (!spendGems(d.gems)) return; }
    else if (d.cost) { if (!canAfford(d.cost)) { toast('Not enough resources!', 'error'); return; } spendResources(d.cost); }
    if (d.give) expGainRes(d.give);
    if (d.item) { state.exp.items[d.item] = (state.exp.items[d.item] || 0) + 1; }
    d.bought = true;
    toast(`Bought ${d.name}!`, 'success');
    saveGame(); updateResources(); openTrader();
}

// =====================================================================
// MARKETPLACE (resource conversion)
// =====================================================================
const MARKET_RES = ['coins', 'gold', 'iron', 'wood', 'food'];
function openMarket() {
    ensureExp();
    expModal(`
        <h3 class="exp-title">${svgIcon('scale')}️ Marketplace</h3>
        <p class="exp-hint">Convert surplus resources. Rate: 2 in → 1 out (10% royal tax).</p>
        <div class="market-row">
            <label>Trade <select id="mk-from">${MARKET_RES.map(r => `<option value="${r}">${r}</option>`).join('')}</select>
            → <select id="mk-to">${MARKET_RES.map((r, i) => `<option value="${r}" ${i === 1 ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
        </div>
        <div class="market-row"><label>Amount in: <input id="mk-amt" type="number" value="200" min="10" step="10"></label></div>
        <div class="exp-actions">
            <button class="btn btn-primary btn-glow" onclick="marketTrade()">Trade</button>
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function marketTrade() {
    ensureExp();
    const from = document.getElementById('mk-from').value;
    const to = document.getElementById('mk-to').value;
    const amt = Math.max(10, Math.floor(+document.getElementById('mk-amt').value || 0));
    if (from === to) { toast('Pick two different resources.', 'error'); return; }
    if ((state.resources[from] || 0) < amt) { toast(`Not enough ${from}!`, 'error'); return; }
    const out = Math.floor(amt / 2 * 0.9);
    state.resources[from] -= amt;
    expGainRes({ [to]: out }, `Traded ${amt} ${from} → ${out} ${to}`);
    saveGame();
}

// =====================================================================
// ROYAL BANK (interest on deposits)
// =====================================================================
const BANK_RATE_PER_HR = 0.005; // 0.5% / hour, capped
function bankAccrued() {
    const b = state.exp.bank;
    const hrs = (Date.now() - b.since) / 3600000;
    return Math.floor(b.deposited * Math.min(0.15, BANK_RATE_PER_HR * hrs));
}
function openBank() {
    ensureExp();
    const acc = bankAccrued();
    expModal(`
        <h3 class="exp-title">${svgIcon('bank')} Royal Bank</h3>
        <p class="exp-hint">Deposited coins earn 0.5%/hr interest (max +15% per cycle). Withdraw to collect.</p>
        <div class="bank-stat"><span>Deposited</span><b>${formatNum(state.exp.bank.deposited)} ${svgIcon('coins')}</b></div>
        <div class="bank-stat"><span>Interest ready</span><b class="bank-int">+${formatNum(acc)} ${svgIcon('coins')}</b></div>
        <div class="market-row"><label>Amount: <input id="bk-amt" type="number" value="500" min="50" step="50"></label></div>
        <div class="exp-actions">
            <button class="btn btn-primary" onclick="bankDeposit()">Deposit</button>
            <button class="btn btn-glow" onclick="bankWithdraw()">Withdraw all + interest</button>
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function bankDeposit() {
    ensureExp();
    const amt = Math.max(50, Math.floor(+document.getElementById('bk-amt').value || 0));
    if ((state.resources.coins || 0) < amt) { toast('Not enough coins!', 'error'); return; }
    // collect existing interest first, then add
    const acc = bankAccrued();
    state.resources.coins -= amt;
    state.exp.bank.deposited += amt + acc;
    state.exp.bank.since = Date.now();
    toast(`Deposited ${amt} coins.`, 'success');
    saveGame(); updateResources(); openBank();
}
function bankWithdraw() {
    ensureExp();
    const acc = bankAccrued();
    const total = state.exp.bank.deposited + acc;
    if (total <= 0) { toast('Nothing to withdraw.', 'info'); return; }
    expGainRes({ coins: total }, `Withdrew ${formatNum(total)} coins (incl. +${formatNum(acc)} interest)`);
    state.exp.bank.deposited = 0; state.exp.bank.since = Date.now();
    saveGame(); openBank();
}

// =====================================================================
// MAGIC POTIONS
// =====================================================================
const POTIONS = {
    build:    { name: 'Builder Potion',   icon: svgIcon('hammer'), desc: 'Instantly finish ALL builds & upgrades' },
    train:    { name: 'Training Potion',  icon: svgIcon('swords'), desc: 'Instantly train a warrior, archer & cavalry' },
    resource: { name: 'Resource Potion',  icon: svgIcon('coins'), desc: '+2000 coins, +1000 gold, +1000 iron' },
    research: { name: 'Research Potion',  icon: svgIcon('research'), desc: '+250 pass XP and +25 (knowledge!)' },
    shield:   { name: 'Shield Potion',    icon: svgIcon('shield'), desc: 'Activate a 3-hour shield' }
};
function openItems() {
    ensureExp();
    const it = state.exp.items;
    expModal(`
        <h3 class="exp-title">${svgIcon('flask')} Magic Potions</h3>
        <p class="exp-hint">Win potions from crates, the wheel & the market.</p>
        <div class="pot-grid">
            ${Object.entries(POTIONS).map(([id, p]) => `
                <div class="pot-card">
                    <span class="pot-ic">${p.icon}</span>
                    <div class="pot-name">${p.name} <b class="pot-ct">×${it[id] || 0}</b></div>
                    <div class="pot-desc">${p.desc}</div>
                    <button class="btn btn-primary" ${(it[id] || 0) <= 0 ? 'disabled' : ''} onclick="useItem('${id}')">Use</button>
                </div>`).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function useItem(id) {
    ensureExp();
    if ((state.exp.items[id] || 0) <= 0) return;
    state.exp.items[id]--;
    if (id === 'build') {
        let n = 0;
        (state.buildings || []).forEach(b => {
            if (b.constructing) { b.constructing = false; n++; }
            if (b.upgrading) {
                b.level = b.upgrading.to;
                // Recompute HP the same way the normal completion path does — otherwise
                // a potion-finished building keeps its old (lower) HP until re-upgraded.
                if (typeof BUILDING_DEFS !== 'undefined' && BUILDING_DEFS[b.type]) {
                    b.hp = Math.floor(BUILDING_DEFS[b.type].baseHP * Math.pow(1.3, b.level - 1));
                }
                b.upgrading = null; n++;
            }
        });
        if (typeof updateStorageCaps === 'function') updateStorageCaps();
        toast(n ? `Finished ${n} job(s)!` : 'Nothing was building.', 'success');
        if (typeof renderGrid === 'function') renderGrid();
    } else if (id === 'train') {
        ['warrior', 'archer', 'cavalry'].forEach(t => { if (typeof trainTroop === 'function') { try { trainTroop(t, true); } catch (e) { state.troops[t] = (state.troops[t] || 0) + 1; } } else state.troops[t] = (state.troops[t] || 0) + 1; });
        state.exp.stats.troopsTrained += 3;
        toast('️ Trained a warrior, archer & cavalry!', 'success');
    } else if (id === 'resource') {
        expGainRes({ coins: 2000, gold: 1000, iron: 1000 }, ' Resources granted!');
    } else if (id === 'research') {
        addPassXp(250); addGems(25); toast('+250 pass XP, +25', 'success');
    } else if (id === 'shield') {
        if (typeof grantShield === 'function') grantShield(180);
        toast('️ 3-hour shield active!', 'success');
    }
    saveGame(); updateResources(); openItems();
}

// =====================================================================
// PRODUCTION BOOST
// =====================================================================
function boostActive() { return state.exp && Date.now() < state.exp.boostUntil; }
function boostRemaining() { return Math.max(0, Math.ceil((state.exp.boostUntil - Date.now()) / 60000)); }
function openBoost() {
    ensureExp();
    const active = boostActive();
    expModal(`
        <h3 class="exp-title">${svgIcon('bolt')} Production Boost</h3>
        <p class="exp-hint">Doubles all resource production while active.</p>
        <div class="boost-status ${active ? 'on' : ''}">${active ? `${svgIcon('fire')} ACTIVE — ${boostRemaining()} min left` : 'Inactive'}</div>
        <div class="exp-actions">
            <button class="btn btn-primary" onclick="buyBoost(30)">30 min · 15${svgIcon('gem')}</button>
            <button class="btn btn-primary btn-glow" onclick="buyBoost(120)">2 hr · 40${svgIcon('gem')}</button>
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function buyBoost(mins) {
    ensureExp();
    const cost = mins === 30 ? 15 : 40;
    if (!spendGems(cost)) return;
    const base = boostActive() ? state.exp.boostUntil : Date.now();
    state.exp.boostUntil = base + mins * 60000;
    toast(`Production boosted for ${mins} min!`, 'success');
    saveGame(); openBoost();
}

// =====================================================================
// SEASON PASS
// =====================================================================
const PASS_TIERS = [
    { free: { coins: 500 },  gold: { gems: 10 } },
    { free: { gold: 300 },   gold: { coins: 2000 } },
    { free: { crate: 1 },    gold: { gems: 15 } },
    { free: { iron: 500 },   gold: { potion: 'build' } },
    { free: { coins: 1500 }, gold: { gems: 25 } },
    { free: { potion: 'resource' }, gold: { coins: 5000 } },
    { free: { gold: 800 },   gold: { gems: 40 } },
    { free: { crate: 1 },    gold: { potion: 'shield' } },
    { free: { coins: 3000 }, gold: { gems: 60 } },
    { free: { gems: 20 },    gold: { coins: 10000 } }
];
function passRewardLabel(r) {
    const k = Object.keys(r)[0], v = r[k];
    if (k === 'crate') return ' Crate';
    if (k === 'potion') return ' ' + (POTIONS[v] ? POTIONS[v].name : v);
    if (k === 'gems') return ' ' + v;
    return formatNum(v) + ' ' + k;
}
function grantPassReward(r) {
    const k = Object.keys(r)[0], v = r[k];
    if (k === 'crate') state.exp.crates += v;
    else if (k === 'potion') state.exp.items[v] = (state.exp.items[v] || 0) + 1;
    else if (k === 'gems') addGems(v);
    else expGainRes({ [k]: v });
}
function openPass() {
    ensureExp();
    const p = state.exp.pass;
    expModal(`
        <h3 class="exp-title">${svgIcon('medal')}️ Season Pass <span class="pass-tier">Tier ${p.tier + 1}/${PASS_TIERS.length}</span></h3>
        <p class="exp-hint">Earn pass XP from battles, spins & crates. ${p.gold ? '<b style="color:#fbbf24">Gold Pass active</b>' : `<button class="link-btn" onclick="buyGoldPass()">Unlock Gold Pass (120${svgIcon('gem')})</button>`}</p>
        <div class="pass-xpbar"><div class="pass-xpfill" style="width:${p.tier >= PASS_TIERS.length - 1 ? 100 : p.xp}%"></div><span>${p.tier >= PASS_TIERS.length - 1 ? 'MAX' : p.xp + '/100 XP'}</span></div>
        <div class="pass-track">
            ${PASS_TIERS.map((t, i) => {
                const unlocked = i <= p.tier;
                const fc = p.claimed.free.includes(i), gc = p.claimed.gold.includes(i);
                return `<div class="pass-col ${unlocked ? 'unlocked' : ''}">
                    <div class="pass-no">${i + 1}</div>
                    <button class="pass-rw free ${fc ? 'claimed' : ''}" ${unlocked && !fc ? '' : 'disabled'} onclick="claimPass(${i},'free')">${fc ? '' : passRewardLabel(t.free)}</button>
                    <button class="pass-rw gold ${gc ? 'claimed' : ''}" ${unlocked && p.gold && !gc ? '' : 'disabled'} onclick="claimPass(${i},'gold')">${gc ? '' : ' ' + passRewardLabel(t.gold)}</button>
                </div>`;
            }).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function buyGoldPass() { ensureExp(); if (!spendGems(120)) return; state.exp.pass.gold = true; toast('️ Gold Pass unlocked!', 'success'); saveGame(); openPass(); }
function claimPass(i, track) {
    ensureExp();
    const p = state.exp.pass;
    if (i > p.tier) return;
    if (track === 'gold' && !p.gold) { toast('Unlock the Gold Pass first.', 'error'); return; }
    if (p.claimed[track].includes(i)) return;
    grantPassReward(PASS_TIERS[i][track]);
    p.claimed[track].push(i);
    toast('️ Reward claimed!', 'success');
    saveGame(); updateResources(); openPass();
}

// =====================================================================
// TALENT TREE
// =====================================================================
const TALENTS = {
    industry:  { name: 'Industry',     icon: '', max: 5, desc: '+3 coins & gold/min per rank', tier: 0 },
    forester:  { name: 'Forestry',     icon: svgIcon('tree'), max: 5, desc: '+3 wood & iron/min per rank', tier: 0 },
    mason:     { name: 'Master Mason', icon: '', max: 3, desc: 'Each rank: instant +1000 coins now', tier: 0 },
    quartermaster: { name: 'Quartermaster', icon: svgIcon('crate'), max: 3, desc: 'Each rank: +5% storage caps', tier: 1 },
    warlord:   { name: 'Warlord',      icon: svgIcon('dagger'), max: 3, desc: 'Each rank: instant +2 trophies & +1 troop', tier: 1 },
    alchemist: { name: 'Alchemist',    icon: '', max: 2, desc: 'Each rank: +1 Builder & +1 Resource potion now', tier: 2 },
    financier: { name: 'Financier',    icon: '', max: 2, desc: 'Each rank: instant +25', tier: 2 }
};
function talentRank(id) { return (state.exp.talents[id] || 0); }
function openTalents() {
    ensureExp();
    const tiers = [0, 1, 2];
    expModal(`
        <h3 class="exp-title">${svgIcon('tree')} Talent Tree <span class="tp-badge">${state.exp.talentPoints} pts</span></h3>
        <p class="exp-hint">Earn 1 talent point each level. Passive talents trickle resources every few seconds.</p>
        ${tiers.map(tr => `
            <div class="talent-tier">
                <div class="talent-tier-h">Tier ${tr + 1}</div>
                <div class="talent-row">
                ${Object.entries(TALENTS).filter(([, t]) => t.tier === tr).map(([id, t]) => {
                    const rk = talentRank(id), maxed = rk >= t.max;
                    return `<div class="talent-node ${maxed ? 'maxed' : ''}">
                        <span class="talent-ic">${t.icon}</span>
                        <div class="talent-nm">${t.name}</div>
                        <div class="talent-rk">${rk}/${t.max}</div>
                        <div class="talent-ds">${t.desc}</div>
                        <button class="btn btn-primary" ${maxed || state.exp.talentPoints <= 0 ? 'disabled' : ''} onclick="buyTalent('${id}')">${maxed ? 'MAX' : 'Learn (1pt)'}</button>
                    </div>`;
                }).join('')}
                </div>
            </div>`).join('')}
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function buyTalent(id) {
    ensureExp();
    const t = TALENTS[id];
    if (talentRank(id) >= t.max || state.exp.talentPoints <= 0) return;
    state.exp.talentPoints--;
    state.exp.talents[id] = talentRank(id) + 1;
    // immediate effects
    if (id === 'mason') expGainRes({ coins: 1000 });
    if (id === 'quartermaster') { if (typeof updateStorageCaps === 'function') updateStorageCaps(); }
    if (id === 'warlord') { state.trophies += 2; const tt = ['warrior', 'archer', 'cavalry'][Math.floor(Math.random() * 3)]; state.troops[tt] = (state.troops[tt] || 0) + 1; }
    if (id === 'alchemist') { state.exp.items.build++; state.exp.items.resource++; }
    if (id === 'financier') addGems(25);
    toast(`Learned ${t.name}!`, 'success');
    saveGame(); updateResources(); openTalents();
}

// =====================================================================
// DAILY CHALLENGES
// =====================================================================
function refreshDailies() {
    const day = expDay();
    if (state.exp.dayStamp === day && state.exp.challenges.length) return;
    state.exp.dayStamp = day;
    const rng = expRng(day * 5701 + 3);
    const pool = [
        { id: 'collect', text: 'Collect resources 5 times', goal: 5, reward: { coins: 800 } },
        { id: 'raid',    text: 'Win 2 raids', goal: 2, reward: { gold: 400 } },
        { id: 'train',   text: 'Train 4 troops', goal: 4, reward: { iron: 500 } },
        { id: 'spin',    text: 'Spin the Lucky Wheel', goal: 1, reward: { gems: 8 } },
        { id: 'upgrade', text: 'Upgrade a building', goal: 1, reward: { coins: 1200 } },
        { id: 'crate',   text: 'Open a Mystery Crate', goal: 1, reward: { gold: 600 } }
    ];
    const picks = [];
    const used = {};
    while (picks.length < 3) { const c = pool[Math.floor(rng() * pool.length)]; if (!used[c.id]) { used[c.id] = 1; picks.push({ ...c, prog: 0, claimed: false }); } }
    state.exp.challenges = picks;
}
function challengeProgress(id, amt) {
    if (!state.exp || !state.exp.challenges) return;
    let changed = false;
    state.exp.challenges.forEach(c => { if (c.id === id && !c.claimed && c.prog < c.goal) { c.prog = Math.min(c.goal, c.prog + (amt || 1)); changed = true; } });
    if (changed) saveGame();
}
function openChallenges() {
    ensureExp();
    expModal(`
        <h3 class="exp-title">${svgIcon('check')} Daily Challenges</h3>
        <p class="exp-hint">Fresh tasks every day. Complete them as you play.</p>
        <div class="chal-list">
            ${state.exp.challenges.map((c, i) => {
                const done = c.prog >= c.goal;
                return `<div class="chal-row ${done ? 'done' : ''}">
                    <div class="chal-info"><div class="chal-text">${c.text}</div>
                        <div class="chal-bar"><div class="chal-fill" style="width:${Math.round(c.prog / c.goal * 100)}%"></div></div>
                        <div class="chal-meta">${c.prog}/${c.goal} · reward ${passRewardLabel(c.reward)}</div></div>
                    <button class="btn btn-primary" ${done && !c.claimed ? '' : 'disabled'} onclick="claimChallenge(${i})">${c.claimed ? '' : 'Claim'}</button>
                </div>`;
            }).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function claimChallenge(i) {
    ensureExp();
    const c = state.exp.challenges[i];
    if (!c || c.claimed || c.prog < c.goal) return;
    grantPassReward(c.reward); c.claimed = true; addPassXp(20);
    toast('Challenge reward claimed!', 'success');
    saveGame(); updateResources(); openChallenges();
}

// =====================================================================
// WORLD REGIONS (conquer for passive bonus)
// =====================================================================
const REGIONS = [
    { id: 'meadow',  name: 'Green Meadows',  icon: svgIcon('wheat'), cost: { coins: 2000, food: 500 },  bonus: '+7.5 food/min', need: 1 },
    { id: 'forest',  name: 'Darkwood',       icon: svgIcon('tree'), cost: { coins: 3000, wood: 800 },  bonus: '+7.5 wood/min', need: 2 },
    { id: 'hills',   name: 'Iron Hills',     icon: '', cost: { coins: 4000, iron: 800 },  bonus: '+7.5 iron/min', need: 3 },
    { id: 'mines',   name: 'Gold Mines',     icon: '', cost: { coins: 6000, gold: 1000 }, bonus: '+15 gold/min', need: 4 },
    { id: 'capital', name: 'Old Capital',    icon: svgIcon('castle'), cost: { coins: 10000, gold: 2000 },bonus: '+15 coins/min & +50 trophies', need: 5 }
];
function regionOwned(id) { return !!(state.exp.regions && state.exp.regions[id]); }
function openRegions() {
    ensureExp();
    const thLvl = (typeof getBuilding === 'function' && getBuilding('townhall')) ? getBuilding('townhall').level : 1;
    expModal(`
        <h3 class="exp-title">${svgIcon('map')}️ World Regions</h3>
        <p class="exp-hint">Conquer regions for permanent passive bonuses. Higher regions need a bigger Town Hall.</p>
        <div class="region-list">
            ${REGIONS.map(r => {
                const owned = regionOwned(r.id);
                const locked = thLvl < r.need;
                return `<div class="region-row ${owned ? 'owned' : ''}">
                    <span class="region-ic">${r.icon}</span>
                    <div class="region-info"><div class="region-nm">${r.name} ${owned ? '<b class="region-flag">CONQUERED</b>' : ''}</div>
                    <div class="region-bonus">${r.bonus}</div>
                    <div class="region-cost">${owned ? 'Active' : Object.entries(r.cost).map(([k, v]) => `${formatNum(v)} ${k}`).join(' · ')}</div></div>
                    <button class="btn btn-primary" ${owned || locked ? 'disabled' : ''} onclick="conquerRegion('${r.id}')">${owned ? '' : locked ? ' TH ' + r.need : 'Conquer'}</button>
                </div>`;
            }).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function conquerRegion(id) {
    ensureExp();
    const r = REGIONS.find(x => x.id === id);
    if (!r || regionOwned(id)) return;
    if (!canAfford(r.cost)) { toast('Not enough resources to conquer!', 'error'); return; }
    spendResources(r.cost);
    state.exp.regions[id] = true;
    if (id === 'capital') state.trophies += 50;
    addPassXp(40);
    toast(`Conquered ${r.name}!`, 'success');
    saveGame(); updateResources(); openRegions();
}
function regionTrickle() {
    const t = { coins: 0, gold: 0, iron: 0, wood: 0, food: 0 };
    // Per 2s tick — keep these small: 0.25/tick = 7.5/min. The old whole-number
    // values out-produced entire buildings invisibly.
    if (regionOwned('meadow')) t.food += 0.25;
    if (regionOwned('forest')) t.wood += 0.25;
    if (regionOwned('hills')) t.iron += 0.25;
    if (regionOwned('mines')) t.gold += 0.5;
    if (regionOwned('capital')) t.coins += 0.5;
    return t;
}

// =====================================================================
// BOSS RAID (uses the live battle if available)
// =====================================================================
function openBossRaid() {
    ensureExp();
    const bossLvl = Math.max(3, (state.level || 1) + 2);
    expModal(`
        <h3 class="exp-title">${svgIcon('dragon')} Boss Raid</h3>
        <p class="exp-hint">A fearsome warlord guards a hoard. Defeat him for huge loot, gems & a crate.</p>
        <div class="boss-card">
            <div class="boss-emoji">${svgIcon('dragon')}</div>
            <div class="boss-name">Warlord Grimfang · Lv ${bossLvl}</div>
            <div class="boss-reward">Rewards: ${svgIcon('coins')}5000 · ${svgIcon('coin')}2500 · ${svgIcon('gem')}15 · ${svgIcon('gift')} Crate</div>
        </div>
        <div class="exp-actions">
            <button class="btn btn-danger btn-glow" onclick="startBossRaid(${bossLvl})">${svgIcon('swords')}️ Attack Boss</button>
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function startBossRaid(bossLvl) {
    ensureExp();
    // Once per day — this was an infinitely repeatable gem/resource faucet.
    if (Date.now() - (state.exp.bossDoneAt || 0) < DAY_MS) {
        toast('The warlord has fled. He returns tomorrow!', 'info');
        return;
    }
    closeExpModal();
    const reward = () => { state.exp.bossDoneAt = Date.now(); expGainRes({ coins: 5000, gold: 2500 }); addGems(15); state.exp.crates++; state.exp.stats.bossKills++; addPassXp(60); toast('Boss defeated! Loot claimed.', 'success'); saveGame(); };
    if (typeof runLiveRaid === 'function' && typeof getDeployed === 'function' && getDeployed('army') && getDeployed('army').length) {
        runLiveRaid({ name: 'Warlord Grimfang', level: bossLvl, loot: { coins: 5000, gold: 2500 }, xp: 120, kind: 'boss', onWin: reward });
        // also reward on win via outcome hook fallback
        setTimeout(() => {}, 0);
    } else {
        // fallback: quick simulated fight based on army size
        const power = (state.soldiers ? state.soldiers.length : 0) + Object.values(state.troops || {}).reduce((a, b) => a + b, 0);
        if (power >= bossLvl * 2) { reward(); }
        else { state.exp.stats.raidsLost++; toast('Your army was too weak! Train more troops.', 'error'); saveGame(); }
    }
}

// =====================================================================
// CLAN WARS (simulated)
// =====================================================================
function openClanWar() {
    ensureExp();
    let w = state.exp.clanWar;
    if (!w || w.over) {
        expModal(`
            <h3 class="exp-title">${svgIcon('swords')}️ Clan Wars</h3>
            <p class="exp-hint">Declare war on a rival clan. Win 3 of 5 attacks to claim victory.</p>
            <div class="war-foes">
                <div class="war-foe">${svgIcon('shield')}️ Your Clan<br><b>${(state.club && state.club.name) || 'Lone Wolves'}</b></div>
                <div class="war-vs">VS</div>
                <div class="war-foe">${svgIcon('fire')} Iron Vipers<br><b>5 warriors</b></div>
            </div>
            <div class="exp-actions">
                <button class="btn btn-danger btn-glow" onclick="startClanWar()">${svgIcon('swords')}️ Declare War</button>
                <button class="btn" onclick="closeExpModal()">Close</button>
            </div>`);
    } else { renderClanWar(); }
}
function startClanWar() {
    ensureExp();
    // One war per 12h — back-to-back restarts were an unbounded reward loop.
    if (Date.now() - (state.exp.warDoneAt || 0) < DAY_MS / 2) { toast('The clans rest. Next war in a few hours.', 'info'); return; }
    state.exp.clanWar = { round: 0, wins: 0, losses: 0, over: false, log: [] }; saveGame(); renderClanWar();
}
function renderClanWar() {
    const w = state.exp.clanWar;
    expModal(`
        <h3 class="exp-title">${svgIcon('swords')}️ Clan War — Battle ${Math.min(w.round + 1, 5)}/5</h3>
        <div class="war-score"><span class="war-win">${w.wins} won</span> · <span class="war-loss">${w.losses} lost</span></div>
        <div class="war-log">${w.log.map(l => `<div class="war-line ${l.win ? 'w' : 'l'}">${l.win ? '' : ''} ${l.text}</div>`).join('') || '<div class="war-line">Attack to begin!</div>'}</div>
        <div class="exp-actions">
            ${w.over ? '' : `<button class="btn btn-danger btn-glow" onclick="clanWarAttack()">${svgIcon('swords')}️ Send Attack</button>`}
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function clanWarAttack() {
    const w = state.exp.clanWar;
    if (w.over) return;
    const power = (state.soldiers ? state.soldiers.length * 3 : 0) + (state.trophies || 0) / 50 + (state.level || 1);
    const enemy = 6 + w.round * 2 + Math.random() * 6;
    const win = power + Math.random() * 8 > enemy;
    w.round++;
    if (win) { w.wins++; w.log.push({ win: true, text: `Battle ${w.round}: victory! (${Math.round(power)} vs ${Math.round(enemy)})` }); }
    else { w.losses++; w.log.push({ win: false, text: `Battle ${w.round}: defeat. (${Math.round(power)} vs ${Math.round(enemy)})` }); }
    if (w.wins >= 3 || w.losses >= 3 || w.round >= 5) {
        w.over = true;
        state.exp.warDoneAt = Date.now();
        if (w.wins > w.losses) { expGainRes({ coins: 4000, gold: 2000 }); addGems(15); state.exp.stats.warWins++; addPassXp(50); w.log.push({ win: true, text: 'WAR WON! +4000c +2000g +15' }); }
        else { w.log.push({ win: false, text: 'War lost. Regroup and try again.' }); }
    }
    saveGame(); updateResources(); renderClanWar();
}

// =====================================================================
// TOURNAMENT (8-player bracket, simulated)
// =====================================================================
const TOURNEY_NAMES = ['You', 'Borin', 'Vex', 'Mira', 'Drogan', 'Sela', 'Korr', 'Thane'];
function openTournament() {
    ensureExp();
    let t = state.exp.tournament;
    if (!t || t.over) {
        expModal(`
            <h3 class="exp-title">${svgIcon('trophy')} Tournament</h3>
            <p class="exp-hint">An 8-fighter knockout bracket. Win it all for 50${svgIcon('gem')} and glory.</p>
            <div class="exp-actions">
                <button class="btn btn-primary btn-glow" onclick="startTournament()">Enter (free)</button>
                <button class="btn" onclick="closeExpModal()">Close</button>
            </div>`);
    } else renderTournament();
}
function startTournament() {
    ensureExp();
    // One bracket per day — restart-on-loss made this an infinite gem loop.
    if (Date.now() - (state.exp.tourneyDoneAt || 0) < DAY_MS) { toast('The arena is being swept. Next tournament tomorrow!', 'info'); return; }
    state.exp.tournament = { round: 0, alive: TOURNEY_NAMES.slice(), over: false, out: false }; saveGame(); renderTournament();
}
function renderTournament() {
    const t = state.exp.tournament;
    const roundName = ['Quarter-finals', 'Semi-finals', 'Final', 'Champion!'][Math.min(t.round, 3)];
    expModal(`
        <h3 class="exp-title">${svgIcon('trophy')} Tournament — ${roundName}</h3>
        <p class="exp-hint">${t.out ? 'You were knocked out.' : t.over ? ' You are the champion!' : `${t.alive.length} fighters remain.`}</p>
        <div class="tourney-bracket">${t.alive.map(n => `<span class="tourney-chip ${n === 'You' ? 'you' : ''}">${n}</span>`).join('')}</div>
        <div class="exp-actions">
            ${(!t.over && !t.out) ? `<button class="btn btn-primary btn-glow" onclick="tourneyFight()">${svgIcon('swords')}️ Fight Round</button>` : ''}
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function tourneyFight() {
    const t = state.exp.tournament;
    if (t.over || t.out) return;
    // pair up, you win with probability scaling on your power
    const power = 0.45 + Math.min(0.4, (state.level || 1) * 0.02 + (state.soldiers ? state.soldiers.length : 0) * 0.01);
    const survivors = [];
    // you fight first
    const youWin = Math.random() < power;
    if (!youWin) { t.out = true; state.exp.tourneyDoneAt = Date.now(); toast('Knocked out of the tournament.', 'info'); }
    else survivors.push('You');
    // others
    const others = t.alive.filter(n => n !== 'You');
    for (let i = 0; i < others.length; i += 2) {
        if (i + 1 < others.length) survivors.push(Math.random() < 0.5 ? others[i] : others[i + 1]);
        else survivors.push(others[i]);
    }
    // trim to half (excluding you handled)
    t.alive = survivors.slice(0, Math.max(1, Math.ceil(t.alive.length / 2)));
    if (t.out) { t.alive = t.alive.filter(n => n !== 'You'); }
    t.round++;
    if (!t.out && t.alive.length <= 1 && t.alive[0] === 'You') {
        t.over = true; state.exp.tourneyDoneAt = Date.now(); expGainRes({ coins: 3000 }); addGems(30); addPassXp(50);
        toast('Tournament WON! +30', 'success');
    }
    saveGame(); updateResources(); renderTournament();
}

// =====================================================================
// FRIENDS
// =====================================================================
function openFriends() {
    ensureExp();
    expModal(`
        <h3 class="exp-title">${svgIcon('handshake')} Friends</h3>
        <p class="exp-hint">Send daily gifts to receive rewards back. Visiting earns a little XP.</p>
        <div class="friend-list">
            ${state.exp.friends.map((f, i) => {
                const ready = Date.now() >= f.giftReadyAt;
                return `<div class="friend-row">
                    <span class="friend-av">${f.name[0]}</span>
                    <div class="friend-info"><div class="friend-nm">${f.name}</div><div class="friend-meta">${svgIcon('castle')} TH${f.th} · ${svgIcon('trophy')} ${f.trophies}</div></div>
                    <div class="friend-acts">
                        <button class="btn btn-primary" ${ready ? '' : 'disabled'} onclick="giftFriend(${i})">${ready ? ' Gift' : 'Sent'}</button>
                        <button class="btn" ${Date.now() >= (f.visitReadyAt || 0) ? '' : 'disabled'} onclick="visitFriend(${i})">${Date.now() >= (f.visitReadyAt || 0) ? 'Visit' : 'Visited'}</button>
                    </div>
                </div>`;
            }).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function giftFriend(i) {
    ensureExp();
    const f = state.exp.friends[i];
    if (Date.now() < f.giftReadyAt) return;
    f.giftReadyAt = Date.now() + DAY_MS;
    const back = { coins: 300 + Math.round(f.trophies / 4) };
    expGainRes(back, `${svgIcon('gift')} ${f.name} sent ${formatNum(back.coins)} coins back!`);
    challengeProgress('gift', 1);
    saveGame(); openFriends();
}
function visitFriend(i) {
    ensureExp();
    const f = state.exp.friends[i];
    // Daily cooldown per friend — without it, spam-clicking Visit farmed unlimited
    // Season Pass XP and unlocked every tier's rewards for free.
    if (Date.now() < (f.visitReadyAt || 0)) { toast(`You've already visited ${f.name} today.`, 'info'); return; }
    f.visitReadyAt = Date.now() + DAY_MS;
    addPassXp(5);
    toast(`You visited ${f.name}'s village. +5 pass XP`, 'info');
    saveGame(); openFriends();
}

// =====================================================================
// GEM MINE (passive trickle)
// =====================================================================
const GEM_MINE_PER_HR = 1;
const GEM_MINE_CAP = 12;
function gemMineReady() {
    const hrs = (Date.now() - state.exp.gemMineSince) / 3600000;
    return Math.min(GEM_MINE_CAP, Math.floor(hrs * GEM_MINE_PER_HR));
}
function openGemMine() {
    ensureExp();
    const r = gemMineReady();
    expModal(`
        <h3 class="exp-title">${svgIcon('gem')} Gem Mine</h3>
        <p class="exp-hint">Produces ${GEM_MINE_PER_HR}${svgIcon('gem')}/hour, storing up to ${GEM_MINE_CAP}. Collect anytime.</p>
        <div class="gemmine-box"><div class="gemmine-amt">${svgIcon('gem')} ${r}</div><div class="gemmine-cap">/ ${GEM_MINE_CAP} stored</div></div>
        <div class="exp-actions">
            <button class="btn btn-primary btn-glow" ${r <= 0 ? 'disabled' : ''} onclick="collectGemMine()">Collect ${r}${svgIcon('gem')}</button>
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`);
}
function collectGemMine() {
    ensureExp();
    const r = gemMineReady();
    if (r <= 0) return;
    addGems(r); state.exp.gemMineSince = Date.now();
    toast(`Collected ${r} gems from the mine!`, 'success');
    saveGame(); openGemMine();
}

// =====================================================================
// DECORATIONS
// =====================================================================
const DECOR = [
    { id: 'fountain', name: 'Fountain',     icon: '', cost: { coins: 1500 }, trophies: 10 },
    { id: 'statue',   name: 'Hero Statue',  icon: '', cost: { coins: 3000, iron: 500 }, trophies: 25 },
    { id: 'garden',   name: 'Royal Garden', icon: svgIcon('flower'), cost: { coins: 2000, food: 800 }, trophies: 15 },
    { id: 'banner',   name: 'War Banner',   icon: svgIcon('flag'), cost: { gold: 1000 }, trophies: 20 },
    { id: 'fire',     name: 'Great Brazier', icon: svgIcon('fire'), cost: { coins: 5000, gold: 1500 }, trophies: 40 }
];
function openDecor() {
    ensureExp();
    expModal(`
        <h3 class="exp-title">${svgIcon('flower')} Decorations</h3>
        <p class="exp-hint">Cosmetic pride pieces — each grants a one-time trophy boost.</p>
        <div class="decor-grid">
            ${DECOR.map(d => {
                const owned = !!state.exp.decor[d.id];
                return `<div class="decor-card ${owned ? 'owned' : ''}">
                    <span class="decor-ic">${d.icon}</span>
                    <div class="decor-nm">${d.name}</div>
                    <div class="decor-tr">+${d.trophies} ${svgIcon('trophy')}</div>
                    <div class="decor-cost">${owned ? 'Owned' : Object.entries(d.cost).map(([k, v]) => `${formatNum(v)} ${k}`).join(' · ')}</div>
                    <button class="btn btn-primary" ${owned ? 'disabled' : ''} onclick="buyDecor('${d.id}')">${owned ? '' : 'Buy'}</button>
                </div>`;
            }).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function buyDecor(id) {
    ensureExp();
    const d = DECOR.find(x => x.id === id);
    if (!d || state.exp.decor[id]) return;
    if (!canAfford(d.cost)) { toast('Not enough resources!', 'error'); return; }
    spendResources(d.cost);
    state.exp.decor[id] = true;
    state.trophies += d.trophies;
    toast(`Placed ${d.name}! +${d.trophies} trophies`, 'success');
    saveGame(); updateResources(); openDecor();
}

// =====================================================================
// COLLECTION / CODEX
// =====================================================================
function openCollection() {
    ensureExp();
    const troops = (typeof TROOP_DEFS !== 'undefined') ? Object.entries(TROOP_DEFS) : [];
    const heroes = (typeof HERO_DEFS !== 'undefined') ? Object.entries(HERO_DEFS) : ((typeof HEROES !== 'undefined') ? Object.entries(HEROES) : []);
    const ownedHero = state.heroes || {};
    expModal(`
        <h3 class="exp-title">${svgIcon('book')} Collection</h3>
        <p class="exp-hint">Every troop and hero in the realm. Heroes you own are highlighted.</p>
        <h4 class="codex-h">Troops</h4>
        <div class="codex-grid">
            ${troops.map(([id, d]) => `<div class="codex-card">
                <div class="codex-nm">${d.name || id}</div>
                <div class="codex-stat">${d.hp ? ' ' + d.hp : ''} ${d.attack || d.atk ? '️ ' + (d.attack || d.atk) : ''}</div>
            </div>`).join('') || '<div class="codex-empty">—</div>'}
        </div>
        <h4 class="codex-h">Heroes</h4>
        <div class="codex-grid">
            ${heroes.map(([id, d]) => {
                const owned = !!ownedHero[id];
                return `<div class="codex-card ${owned ? 'codex-owned' : 'codex-locked'}">
                    <div class="codex-nm">${owned ? (d.name || id) : '???'}</div>
                    <div class="codex-stat">${d.rarity || ''}</div>
                </div>`;
            }).join('') || '<div class="codex-empty">—</div>'}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}

// =====================================================================
// PROFILE & STATS
// =====================================================================
function openProfile() {
    ensureExp();
    const s = state.exp.stats;
    const owned = (state.buildings || []).length;
    const rows = [
        [' Trophies', formatNum(state.trophies || 0)],
        [' Level', state.level || 1],
        [' Buildings', owned],
        ['️ Regions conquered', Object.keys(state.exp.regions).length],
        ['️ Raids won', s.raidsWon],
        [' Raids lost', s.raidsLost],
        [' Boss kills', s.bossKills],
        ['️ Clan wars won', s.warWins],
        [' Wheel spins', s.spins],
        [' Crates opened', s.cratesOpened],
        [' Troops trained', s.troopsTrained],
        [' Total resources earned', formatNum(s.resourcesEarned)],
        [' Talent points spent', Object.values(state.exp.talents).reduce((a, b) => a + b, 0)]
    ];
    expModal(`
        <h3 class="exp-title">‍ ${state.playerName || 'Commander'}</h3>
        <p class="exp-hint">Your lifetime record across the realm.</p>
        <div class="profile-grid">
            ${rows.map(([k, v]) => `<div class="profile-stat"><span>${k}</span><b>${v}</b></div>`).join('')}
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}

// =====================================================================
// SETTINGS
// =====================================================================
function openSettings() {
    ensureExp();
    const s = state.exp.settings;
    expModal(`
        <h3 class="exp-title">${svgIcon('gear')}️ Settings</h3>
        <div class="set-row" style="gap:8px">
            <span>${svgIcon('castle')} Commander name</span>
            <span style="display:flex;gap:6px;flex:1;justify-content:flex-end">
                <input id="set-name" value="${(state.playerName || 'Commander').replace(/"/g, '&quot;')}" maxlength="16" style="max-width:150px;padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">
                <button class="btn btn-primary btn-small" onclick="renamePlayer()">Save</button>
            </span>
        </div>
        <div class="settings-list">
            <label class="set-row"><span> Sound effects</span><input type="checkbox" ${s.sfx ? 'checked' : ''} onchange="toggleSetting('sfx',this.checked)"></label>
            <label class="set-row"><span> Music</span><input type="checkbox" ${s.music ? 'checked' : ''} onchange="toggleSetting('music',this.checked)"></label>
            <label class="set-row"><span> Notifications</span><input type="checkbox" ${s.notify ? 'checked' : ''} onchange="toggleSetting('notify',this.checked)"></label>
            <label class="set-row"><span> Low-graphics mode</span><input type="checkbox" ${s.lowGfx ? 'checked' : ''} onchange="toggleSetting('lowGfx',this.checked)"></label>
        </div>
        <div class="settings-actions">
            <button class="btn btn-primary" onclick="exportSave()"> Export Save</button>
            <button class="btn btn-primary" onclick="importSave()"> Import Save</button>
            <button class="btn btn-danger" onclick="confirmHardReset()">️ Reset Game</button>
        </div>
        <div class="exp-actions"><button class="btn" onclick="closeExpModal()">Close</button></div>`);
}
function renamePlayer() {
    const inp = document.getElementById('set-name');
    const name = (inp && inp.value || '').trim().slice(0, 16);
    if (name.length < 2) { toast('Name must be at least 2 characters.', 'error'); return; }
    state.playerName = name;
    if (state.club) { const me = state.club.members.find(m => m.isPlayer); if (me) me.name = name; }
    saveGame();
    if (typeof cloudSaveNow === 'function') cloudSaveNow();
    toast(`You are now Commander ${name}!`, 'success');
}
function toggleSetting(k, v) {
    ensureExp();
    state.exp.settings[k] = v;
    if (k === 'notify' && typeof state.notifyOn !== 'undefined') state.notifyOn = v;
    if (k === 'music') { const mb = document.getElementById('music-btn'); if (mb) mb.click(); }
    saveGame();
    toast(`${k} ${v ? 'on' : 'off'}`, 'info');
}
function confirmHardReset() {
    if (!confirm('Really reset ALL progress? This cannot be undone.')) return;
    try { localStorage.removeItem('villagewar_save'); } catch (e) {}
    location.reload();
}

// =====================================================================
// TICK + INTEGRATION HOOKS
// =====================================================================
let _expAccum = { coins: 0, gold: 0, iron: 0, wood: 0, food: 0 };
function expTick() {
    if (!state.exp) return;
    // passive trickle: talents + regions (+ boost doubles it)
    const mult = boostActive() ? 2 : 1;
    const ind = talentRank('industry'), fore = talentRank('forester');
    const add = regionTrickle();
    // 0.1/tick per rank = 3/min per rank — a perk, not a shadow economy.
    add.coins += ind * 0.1; add.gold += ind * 0.1;
    add.wood += fore * 0.1; add.iron += fore * 0.1;
    let any = false;
    for (const k in add) {
        const v = add[k] * mult;
        if (v > 0) { _expAccum[k] += v; any = true; }
        if (_expAccum[k] >= 1) {
            const whole = Math.floor(_expAccum[k]); _expAccum[k] -= whole;
            const cap = (state.maxResources && state.maxResources[k]) || 1e15;
            state.resources[k] = Math.min(cap, (state.resources[k] || 0) + whole);
        }
    }
    if (any && typeof updateResources === 'function') updateResources();
}

// Hooks other systems can call (safe no-ops if exp absent)
function expOnRaid(won) {
    if (!state.exp) return;
    if (won) { state.exp.stats.raidsWon++; addPassXp(10); challengeProgress('raid', 1); }
    else state.exp.stats.raidsLost++;
    saveGame();
}
function expOnTrain(n) { if (state.exp) { state.exp.stats.troopsTrained += (n || 1); challengeProgress('train', n || 1); saveGame(); } }
function expOnCollect() { if (state.exp) challengeProgress('collect', 1); }
function expOnUpgrade() { if (state.exp) challengeProgress('upgrade', 1); }
