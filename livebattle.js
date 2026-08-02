// ============================================================
// LIVE DEPLOYMENT BATTLE
// Tap to drop troops onto the enemy base · troop AI & targeting
// Defenses fire back · spells · traps · stars + destruction %
// ============================================================

// ---- Enemy base generation (deterministic per camp) ----
function _lbSeed(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }

function generateEnemyBase(camp) {
    const rnd = _lbSeed(camp.name + (camp.level || 1));
    const lvl = camp.level || 1;
    const buildings = [];
    const hpScale = 1 + lvl * 0.25;
    // Battles now run 50s (was 20): structures are ~55% tougher so the fight
    // fills the clock with decisions, not a blitz.
    // Town hall — center upper area
    buildings.push({ type: 'townhall', x: 50, y: 22, hp: Math.round(1400 * hpScale), w: 13, th: true });
    // Resource buildings ring
    const resTypes = ['goldmine', 'farm', 'lumbermill', 'storage', 'coinmint', 'ironmine'];
    const nRes = Math.min(7, 3 + Math.floor(lvl / 3));
    for (let i = 0; i < nRes; i++) {
        const a = (i / nRes) * Math.PI * 2 + rnd() * 0.5;
        buildings.push({
            type: resTypes[i % resTypes.length],
            x: 50 + Math.cos(a) * (16 + rnd() * 10),
            y: 26 + Math.sin(a) * (11 + rnd() * 6),
            hp: Math.round(600 * hpScale), w: 9
        });
    }
    // Defenses — towers & cannons that FIGHT BACK
    const defenses = [];
    const nDef = Math.min(6, 1 + Math.floor(lvl / 2));
    for (let i = 0; i < nDef; i++) {
        const a = (i / nDef) * Math.PI * 2 + 0.7 + rnd() * 0.4;
        const isCannon = i % 2 === 1;
        defenses.push({
            type: isCannon ? 'cannon' : 'archertower',
            x: Math.max(8, Math.min(92, 50 + Math.cos(a) * (24 + rnd() * 8))),
            y: Math.max(8, Math.min(46, 25 + Math.sin(a) * (14 + rnd() * 5))),
            hp: Math.round(800 * hpScale), w: 8,
            range: isCannon ? 26 : 32,
            dmg: Math.round((isCannon ? 34 : 20) * (1 + lvl * 0.12)),
            cd: isCannon ? 1.6 : 0.9, cdLeft: 0
        });
    }
    // Mortars (lvl 5+, max 2): long range, splash on clustered troops, but a
    // minRange dead zone — deploy tight under their skirts or spread out wide.
    const nMortar = lvl >= 5 ? Math.min(2, 1 + Math.floor(lvl / 9)) : 0;
    for (let i = 0; i < nMortar; i++) {
        defenses.push({
            type: 'mortar',
            x: 34 + i * 30 + rnd() * 6, y: 14 + rnd() * 8,
            hp: Math.round(650 * hpScale), w: 9,
            range: 45, minRange: 14,
            dmg: Math.round(26 * (1 + lvl * 0.10)),
            cd: 4, cdLeft: 2
        });
    }
    // Hidden traps
    const traps = [];
    const nTraps = Math.min(4, Math.floor(lvl / 3));
    for (let i = 0; i < nTraps; i++) {
        traps.push({ x: 14 + rnd() * 72, y: 42 + rnd() * 16, dmg: 90 + lvl * 10, armed: true });
    }
    return { buildings, defenses, traps, garrison: camp.troops || {} };
}

// ---- Unit roles: who they hunt & how they fight ----
// tank: soaks — towers prefer them, -20% damage taken
// sniper: hunts defenses anywhere on the field
// siege: hits the biggest building, ignores defenses; catapult splashes
// raider: hunts resource buildings; each one razed = +3% raid loot
// line: fights whatever is nearest; pikemen skewer guards (2x)
const TROOP_ROLES = {
    warrior: 'line', pikeman: 'line',
    shieldbearer: 'tank', knight: 'tank', paladin: 'tank',
    archer: 'sniper', crossbowman: 'sniper',
    siege: 'siege', catapult: 'siege',
    cavalry: 'raider'
};
const RESOURCE_BLD = { goldmine: 1, farm: 1, lumbermill: 1, storage: 1, coinmint: 1, ironmine: 1 };

// ---- Spells ----
const LB_SPELLS = [
    { id: 'rage',   icon: svgIcon('rage'),   name: 'Rage',           desc: '+60% attack & +30% speed, 8s, area' },
    { id: 'heal',   icon: svgIcon('heal'),   name: 'Healing Rain',   desc: 'Zone that heals 12%/s for 8s — cast ahead of the push' },
    { id: 'bolt',   icon: svgIcon('bolt'),   name: 'Chain Lightning',desc: '300 dmg + chains to 2 nearby structures, stuns defenses' },
    { id: 'banner', icon: svgIcon('flag'),   name: 'War Banner',     desc: 'Plant a banner defenses must shoot (600 HP, 6s). Needs a Fortress.' }
];

// ---- Main entry ----
// spec: { name, level, troops (garrison counts), loot, xp, kind, missionIndex? , campIndex? }
function runLiveRaid(spec) {
    ensureSoldiers();
    const army = getDeployed('army');
    if (army.length === 0) { toast('Deploy soldiers to your ARMY formation first!', 'error'); switchView('army'); return; }
    breakShield && breakShield();
    const base = generateEnemyBase(spec);
    startLiveBattle({ armyList: army.slice(), base, spec, onDone: (r) => applyRaidOutcome(spec, r) });
}

function applyRaidOutcome(spec, r) {
    // Capture the fallen (with names/ranks) before permadeath removes them.
    const killedSet = new Set(r.killedIds);
    const fallenNamed = state.soldiers.filter(s => killedSet.has(s.id));
    removeSoldiers(r.killedIds, spec.name);
    const victory = r.stars >= 1;
    if (victory && typeof adjustMorale === 'function') adjustMorale(3);
    if (typeof expOnRaid === 'function') expOnRaid(victory);
    if (victory && spec.kind === 'boss' && typeof spec.onWin === 'function') { try { spec.onWin(); } catch(e) {} }
    const lootGained = {};
    if (victory) {
        // Plunderer trait: +4% loot per surviving Plunderer in the army (cap +12%)
        const plunderers = getDeployed('army').filter(s => s.trait === 'plunderer').length;
        const plunderMult = 1 + Math.min(0.12, plunderers * 0.04);
        // Raider bonus: +3% loot per resource building razed by cavalry (cap +9%)
        const raiderMult = 1 + Math.min(0.09, (r.raiderRazes || 0) * 0.03);
        const mult = (0.25 + 0.5 * r.destruction) * plunderMult * raiderMult;
        for (const [res, amt] of Object.entries(spec.loot || {})) {
            lootGained[res] = Math.floor(amt * mult * (typeof eventLootMult === 'function' ? eventLootMult(res) : 1));
        }
        addResources(lootGained);
        const xp = Math.round((spec.xp || 50) * (0.5 + 0.5 * r.destruction) * (typeof eventXpMult === 'function' ? eventXpMult() : 1));
        addXP(xp);
        try { track('raidsWon'); track('totalRaidsWon'); track('coinsLooted', lootGained.coins || 0); } catch(e) {}
        if (state.club && state.clubWar) { state.clubWar.myScore += 20 + r.stars * 15; updateClubWarScores(); }
        // Campaign stars + first-clear gems
        if (spec.kind === 'campaign') {
            const prev = state.campaign.stars[spec.missionIndex] || 0;
            if (r.stars > prev) {
                state.campaign.stars[spec.missionIndex] = r.stars;
                const gemGain = (r.stars - prev) * 5;
                addGems(gemGain);
                toast(`Mission ${spec.missionIndex + 1}: ${r.stars}— +${gemGain} gems!`, 'success');
            }
            if (typeof syncAchievements === 'function') syncAchievements();
        }
        if (spec.kind === 'cpu' || spec.kind === 'revenge') {
            // small trophy gain by stars
            state.trophies = (state.trophies || 0) + r.stars * 4;
        }
        if (spec.kind === 'player' && spec.trophyReward) {
            state.trophies = (state.trophies || 0) + spec.trophyReward;
        }
    } else {
        if (spec.kind === 'cpu') state.trophies = Math.max(0, (state.trophies || 0) - 5);
        if (spec.kind === 'player' && spec.trophyReward) state.trophies = Math.max(0, (state.trophies || 0) - Math.floor(spec.trophyReward / 2));
    }
    const logEntry = {
        time: Date.now(), type: 'attack', target: spec.name, victory,
        loot: lootGained, losses: r.lossCounts, trophies: 0, xp: 0,
        stars: r.stars, destruction: Math.round(r.destruction * 100), casualtyCount: r.killedIds.length
    };
    state.battleLog.unshift(logEntry);
    if (state.battleLog.length > 50) state.battleLog.pop();
    state.raidCooldown = Date.now() + 45000;

    // Result screen
    const el = document.getElementById('battle-result');
    el.classList.remove('hidden');
    el.innerHTML = `
        <div class="result-inner ${victory ? 'victory' : 'defeat'}">
            <h2>${victory ? 'VICTORY!' : 'DEFEAT!'}</h2>
            <div class="result-stars">${[1,2,3].map(s => `<span class="rstar ${r.stars >= s ? 'lit' : ''}">${svgIcon('star')}</span>`).join('')}</div>
            <p style="color:var(--text2)">${spec.name} — ${Math.round(r.destruction * 100)}% destroyed</p>
            ${victory ? `<div class="loot-gained">${Object.entries(lootGained).filter(([,v]) => v > 0).map(([res, v]) => `<div class="loot-item">${RES_ICONS[res] || res} +${formatNum(v)}</div>`).join('')}</div>` : '<p style="color:var(--danger)">Destroy at least 50% to win loot.</p>'}
            <div class="losses">${fallenNamed.length ? `Fallen: ${fallenNamed.length <= 4
                    ? fallenNamed.map(s => s.name).join(', ')
                    : fallenNamed.slice(0, 3).map(s => s.name).join(', ') + ` and ${fallenNamed.length - 3} more`} <span style="opacity:.75">(buried at the Memorial)</span>`
                : 'Fallen soldiers: None'}</div>
            ${fallenNamed.filter(s => typeof rankIndex === 'function' && rankIndex(s) >= 2).map(s =>
                `<div class="losses" style="color:var(--warning,#fbbf24)">⚑ ${s.name} the ${rankOf(s).name} — ${s.kills} kills, ${s.raids} raids. Gone forever.</div>`).join('')}
            <button class="btn btn-primary" onclick="document.getElementById('battle-result').classList.add('hidden')">Continue</button>
        </div>`;
    if (victory) { try { Audio.victory(); confetti(60); } catch(e) {} } else { try { Audio.defeat(); } catch(e) {} }
    updateResources(); updateNotificationBadges(); saveGame();
    const av = document.querySelector('#view-army.active'); if (av) renderArmyView();
}

// ---- The live battle itself ----
function startLiveBattle({ armyList, base, spec, onDone }) {
    try { Audio.setBattleMusic && Audio.setBattleMusic(true); } catch (e) {}
    const overlay = document.createElement('div');
    overlay.className = 'battle-viewer';
    const totalHP = base.buildings.reduce((s, b) => s + b.hp, 0) + base.defenses.reduce((s, d) => s + d.hp, 0);
    const isRangedT = (t) => t === 'archer' || t === 'crossbowman' || t === 'catapult';

    // troop templates with research + hero boosts + veteran rank/trait/morale
    const heroB = (typeof getHeroBonus === 'function') ? getHeroBonus() : { all: { atkMult: 1, hpMult: 1 } };
    const moraleM = (typeof moraleAtkMult === 'function') ? moraleAtkMult() : 1;
    const mkStats = (soldier) => {
        const type = soldier.type || soldier; // tolerate a bare type string
        const d = TROOP_DEFS[type];
        const rb = (typeof getResearchTroopBoost === 'function') ? getResearchTroopBoost(type) : { hp: 1, atk: 1 };
        const vet = (soldier.type && typeof vetStatMult === 'function') ? vetStatMult(soldier) : 1;
        const trait = soldier.trait || null;
        let speed = type === 'cavalry' ? 17 : (type === 'siege' || type === 'catapult') ? 8 : 11;
        if (trait === 'fleetfoot') speed *= 1.2;
        return {
            hp: Math.round(d.hp * rb.hp * (heroB.all.hpMult || 1) * vet),
            atk: Math.round(d.attack * rb.atk * (heroB.all.atkMult || 1) * vet * moraleM),
            speed,
            range: isRangedT(type) ? (type === 'catapult' ? 30 : 22) : 4.5
        };
    };

    // group army by type for the deploy tray
    const tray = {};
    for (const s of armyList) (tray[s.type] = tray[s.type] || []).push(s);
    let selectedType = Object.keys(tray)[0];
    const thLvl = (typeof getTHLevel === 'function') ? getTHLevel() : 1;
    const hasFortress = (typeof getBuilding === 'function') && !!getBuilding('fortress');
    const spells = { rage: thLvl >= 5 ? 2 : 1, heal: 1, bolt: 1 };
    if (hasFortress) spells.banner = 1;   // War Banner unlocks with the Fortress
    const healZones = [];                 // {x, y, until}
    const banners = [];                   // {x, y, hp, until, el} — War Banner decoys
    let armedSpell = null;

    overlay.innerHTML = `
        <div class="lb-scene">
            <div class="lb-field" id="lb-field">
                <div class="lb-sea"></div>
                <div class="lb-sand"></div>
                <div class="lb-grass"></div>
                <div class="lb-deployzone"></div>
                <div class="lb-deployzone lb-dz-west" title="Flanking cove — +15% attack surge"></div>
                <div class="lb-deployzone lb-dz-east" title="Flanking cove — +15% attack surge"></div>
                <div class="lb-decor" aria-hidden="true">
                    <svg class="lb-dirtpath" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M50 98 C40 86 62 76 54 64 C47 54 57 42 50 30" fill="none" stroke="#7e5f36" stroke-width="6" stroke-linecap="round" opacity="0.45"/>
                        <path d="M50 98 C40 86 62 76 54 64 C47 54 57 42 50 30" fill="none" stroke="#c9a56a" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
                        <path d="M50 98 C40 86 62 76 54 64 C47 54 57 42 50 30" fill="none" stroke="#e6c68d" stroke-width="1.1" stroke-dasharray="2.5 3.5" stroke-linecap="round" opacity="0.55"/>
                    </svg>
                    <svg class="lb-dec" style="left:13.5%;top:44%;width:6%" viewBox="0 0 40 48"><ellipse cx="20" cy="45" rx="13" ry="3" fill="rgba(20,30,10,0.3)"/><rect x="17.5" y="30" width="5" height="14" rx="2" fill="#6b4a2a"/><circle cx="20" cy="18" r="12" fill="#3e6f2e"/><circle cx="12" cy="24" r="8" fill="#356328"/><circle cx="28" cy="24" r="8" fill="#468036"/><circle cx="24" cy="12" r="7" fill="#5a9a42"/><circle cx="26" cy="10" r="4" fill="#95c96e" opacity="0.85"/></svg>
                    <svg class="lb-dec" style="left:79%;top:5.5%;width:5%" viewBox="0 0 40 48"><ellipse cx="20" cy="45" rx="13" ry="3" fill="rgba(20,30,10,0.3)"/><rect x="17.5" y="30" width="5" height="14" rx="2" fill="#6b4a2a"/><circle cx="20" cy="18" r="12" fill="#3e6f2e"/><circle cx="12" cy="24" r="8" fill="#356328"/><circle cx="28" cy="24" r="8" fill="#468036"/><circle cx="24" cy="12" r="7" fill="#5a9a42"/><circle cx="26" cy="10" r="4" fill="#95c96e" opacity="0.85"/></svg>
                    <svg class="lb-dec" style="left:74.5%;top:49%;width:5.5%" viewBox="0 0 40 48"><ellipse cx="20" cy="45" rx="13" ry="3" fill="rgba(20,30,10,0.3)"/><rect x="17.5" y="30" width="5" height="14" rx="2" fill="#6b4a2a"/><circle cx="20" cy="18" r="12" fill="#436f2e"/><circle cx="12" cy="24" r="8" fill="#3a6328"/><circle cx="28" cy="24" r="8" fill="#4c8036"/><circle cx="24" cy="12" r="7" fill="#619a42"/><circle cx="26" cy="10" r="4" fill="#9bc96e" opacity="0.85"/></svg>
                    <svg class="lb-dec" style="left:24%;top:59%;width:4%" viewBox="0 0 40 24"><ellipse cx="20" cy="21" rx="15" ry="3" fill="rgba(0,0,0,0.2)"/><path d="M6 20 L10 8 L20 4 L32 9 L34 20 Z" fill="#8b8f96"/><path d="M10 8 L20 4 L22 20 L6 20 Z" fill="#a7abb2"/><path d="M20 4 L32 9 L30 14 L22 8 Z" fill="#cdd1d8" opacity="0.75"/></svg>
                    <svg class="lb-dec" style="left:63%;top:57.5%;width:3.4%" viewBox="0 0 40 24"><ellipse cx="20" cy="21" rx="15" ry="3" fill="rgba(0,0,0,0.2)"/><path d="M6 20 L10 8 L20 4 L32 9 L34 20 Z" fill="#8b8f96"/><path d="M10 8 L20 4 L22 20 L6 20 Z" fill="#a7abb2"/><path d="M20 4 L32 9 L30 14 L22 8 Z" fill="#cdd1d8" opacity="0.75"/></svg>
                    <svg class="lb-dec" style="left:4.5%;top:28%;width:3.6%" viewBox="0 0 40 24"><ellipse cx="20" cy="21" rx="15" ry="3" fill="rgba(0,0,0,0.18)"/><path d="M6 20 L10 8 L20 4 L32 9 L34 20 Z" fill="#9a927e"/><path d="M10 8 L20 4 L22 20 L6 20 Z" fill="#b3ab96"/><path d="M20 4 L32 9 L30 14 L22 8 Z" fill="#d6cdb4" opacity="0.75"/></svg>
                    <svg class="lb-dec" style="left:30%;top:14%;width:2.4%" viewBox="0 0 20 14"><path d="M4 13 C4 8 2 6 3 3 M8 13 C8 7 8 5 7 2 M12 13 C12 7 13 5 14 2 M16 13 C16 9 18 7 17 4" stroke="#3f7a2e" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
                    <svg class="lb-dec" style="left:68%;top:39%;width:2.4%" viewBox="0 0 20 14"><path d="M4 13 C4 8 2 6 3 3 M8 13 C8 7 8 5 7 2 M12 13 C12 7 13 5 14 2 M16 13 C16 9 18 7 17 4" stroke="#3f7a2e" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
                    <svg class="lb-dec" style="left:21%;top:31%;width:2.2%" viewBox="0 0 20 14"><path d="M4 13 C4 8 2 6 3 3 M8 13 C8 7 8 5 7 2 M12 13 C12 7 13 5 14 2 M16 13 C16 9 18 7 17 4" stroke="#46862f" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
                    <svg class="lb-dec" style="left:58%;top:11%;width:2.2%" viewBox="0 0 20 14"><path d="M4 13 C4 8 2 6 3 3 M8 13 C8 7 8 5 7 2 M12 13 C12 7 13 5 14 2 M16 13 C16 9 18 7 17 4" stroke="#46862f" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
                    <svg class="lb-dec" style="left:40%;top:52%;width:2.4%" viewBox="0 0 20 14"><path d="M4 13 C4 8 2 6 3 3 M8 13 C8 7 8 5 7 2 M12 13 C12 7 13 5 14 2 M16 13 C16 9 18 7 17 4" stroke="#3f7a2e" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
                </div>
                <div class="lb-cloudshadow"></div>
                ${base.buildings.map((b, i) => `
                    <div class="lb-bld ${b.th ? 'lb-th' : ''}" id="lbb-${i}" style="left:${b.x}%;top:${b.y}%;width:${b.w}%">
                        <div class="lb-bhp"><div class="lb-bhpfill"></div></div>
                        ${(typeof buildingIcon === 'function' && buildingIcon(b.type)) || ''}
                    </div>`).join('')}
                ${base.defenses.map((d, i) => `
                    <div class="lb-bld lb-def" id="lbd-${i}" style="left:${d.x}%;top:${d.y}%;width:${d.w}%">
                        <div class="lb-bhp"><div class="lb-bhpfill"></div></div>
                        ${(typeof buildingIcon === 'function' && buildingIcon(d.type)) || ''}
                        <div class="lb-range" style="width:${d.range * 2}%;"></div>
                    </div>`).join('')}
                <div class="lb-troops" id="lb-troops"></div>
                <div class="lb-fx" id="lb-fx"></div>
                <div class="lb-vign"></div>
            </div>
            <div class="lb-top">
                <span class="lb-title">${svgIcon('swords')}️ ${spec.name}</span>
                <span class="lb-destruction" id="lb-destr">0%</span>
                <span class="lb-starbar" id="lb-stars">${svgIcon('starOutline').repeat(3)}</span>
                <span class="lb-timer" id="lb-timer">50</span>
                <button class="bv-skip" id="lb-end">End Battle</button>
            </div>
            <div class="lb-bottom">
                <div class="lb-tray" id="lb-tray"></div>
                <div class="lb-spells" id="lb-spells">
                    ${LB_SPELLS.filter(s => spells[s.id] != null).map(s => `<button class="lb-spell" data-spell="${s.id}" title="${s.name}: ${s.desc}">${s.icon}<span class="lb-spell-n">1</span></button>`).join('')}
                </div>
            </div>
            <div class="lb-hint" id="lb-hint">Pick a unit, then TAP a beach — south shore, or the flanking coves for a +15% surge!</div>
        </div>`;
    document.body.appendChild(overlay);

    const field = overlay.querySelector('#lb-field');
    const troopLayer = overlay.querySelector('#lb-troops');
    const fxLayer = overlay.querySelector('#lb-fx');

    // ---- live entities ----
    const troops = [];     // {id, type, x, y, hp, maxHp, atk, speed, range, el, dead, rageUntil}
    const killedIds = [];
    let destroyedHP = 0, thDown = false, running = true, timeLeft = 50;
    let overtimeUsed = false;

    function renderTray() {
        const trayEl = overlay.querySelector('#lb-tray');
        trayEl.innerHTML = Object.entries(tray).map(([t, list]) => {
            const bestPips = (typeof rankIndex === 'function') ? list.reduce((m, s) => Math.max(m, rankIndex(s)), 0) : 0;
            return `
            <button class="lb-chip ${t === selectedType ? 'sel' : ''}" data-type="${t}" ${list.length === 0 ? 'disabled' : ''}>
                ${bestPips > 0 ? `<span class="lb-chip-pips">${'<i></i>'.repeat(bestPips)}</span>` : ''}
                <span class="lb-chip-ico">${(typeof topUnitSVG === 'function') ? topUnitSVG(t, false) : ''}</span>
                <span class="lb-chip-n">${list.length}</span>
            </button>`;
        }).join('');
        trayEl.querySelectorAll('.lb-chip').forEach(ch => ch.onclick = () => { selectedType = ch.dataset.type; armedSpell = null; renderTray(); updateSpellUI(); });
    }
    function updateSpellUI() {
        overlay.querySelectorAll('.lb-spell').forEach(b => {
            const id = b.dataset.spell;
            b.querySelector('.lb-spell-n').textContent = spells[id];
            b.classList.toggle('armed', armedSpell === id);
            b.disabled = spells[id] <= 0;
        });
    }
    renderTray(); updateSpellUI();
    overlay.querySelectorAll('.lb-spell').forEach(b => b.onclick = () => {
        const id = b.dataset.spell;
        if (spells[id] <= 0) return;
        armedSpell = (armedSpell === id) ? null : id;
        updateSpellUI();
        document.getElementById('lb-hint').textContent = armedSpell ? `Tap anywhere to cast ${LB_SPELLS.find(s => s.id === armedSpell).name}!` : 'Pick a unit, tap the zone to deploy.';
    });

    // ---- deploy / cast on tap ----
    field.addEventListener('pointerdown', (e) => {
        if (!running) return;
        const r = field.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        if (armedSpell) { castSpell(armedSpell, x, y); return; }
        // Beach landings: the south shore plus two flanking coves. Flank landings
        // start outside most tower arcs and surge (+15% ATK for 6s) — but it's a
        // longer march past the defenses' kill zone.
        const onBeach = y > 62 || x < 12 || x > 88;
        if (!onBeach) { flashHint('Land on a beach — south shore or the flanking coves!'); return; }
        const list = tray[selectedType];
        if (!list || list.length === 0) { flashHint('No more of that unit — pick another!'); return; }
        const soldier = list.shift();
        spawnTroop(soldier, x, y);
        renderTray();
        try { Audio.train(); } catch(err) {}
    });

    function flashHint(msg) {
        const h = document.getElementById('lb-hint');
        h.textContent = msg; h.classList.add('flash');
        setTimeout(() => h.classList.remove('flash'), 700);
    }

    function spawnTroop(soldier, x, y) {
        const st = mkStats(soldier);
        const pips = (typeof rankIndex === 'function') ? rankIndex(soldier) : 0;
        const el = document.createElement('div');
        el.className = 'lb-troop';
        el.innerHTML = `<div class="lb-thp"><div class="lb-thpfill"></div></div>
            ${pips > 0 ? `<div class="lb-tpips" title="${(typeof rankOf === 'function') ? rankOf(soldier).name : ''} ${soldier.name || ''}">${'<span class="lb-pip"></span>'.repeat(pips)}</div>` : ''}
            <div class="lb-tspr">${(typeof topUnitSVG === 'function') ? topUnitSVG(soldier.type, false) : ''}</div>`;
        el.style.left = x + '%'; el.style.top = y + '%';
        troopLayer.appendChild(el);
        troops.push({ id: soldier.id, type: soldier.type, soldier, x, y, hp: st.hp, maxHp: st.hp, atk: st.atk, speed: st.speed, range: st.range, el, dead: false, atkCd: 0, rageUntil: 0,
                      trait: soldier.trait || null, unbrokenUsed: false, battleKills: 0,
                      flankUntil: (x < 14 || x > 86) ? performance.now() + 6000 : 0 });   // beach-landing surge
        // trap check happens during movement
    }

    function castSpell(id, x, y) {
        if (spells[id] <= 0) return;
        // Lightning only lands on a structure — don't silently waste the charge
        // when the player taps empty ground with none in range.
        let boltTarget = null;
        if (id === 'bolt') {
            boltTarget = nearestTarget(x, y, 16);
            if (!boltTarget) { flashHint('No building in range — aim the bolt at a structure!'); return; }
        }
        spells[id]--; armedSpell = null; updateSpellUI();
        lbRing(fxLayer, x, y, id === 'rage' ? '#f97316' : id === 'heal' ? '#4ade80' : id === 'banner' ? '#60a5fa' : '#fde047');
        try { Audio.whoosh(); } catch(e) {}
        const inArea = troops.filter(t => !t.dead && Math.hypot(t.x - x, (t.y - y) * 1.4) < 18);
        if (id === 'rage') { const until = performance.now() + 8000; inArea.forEach(t => t.rageUntil = until); }
        if (id === 'heal') {
            // Healing Rain: a persistent zone — cast AHEAD of the push, not in panic
            healZones.push({ x, y, until: performance.now() + 8000 });
            const z = document.createElement('div');
            z.className = 'lb-healzone';
            z.style.left = x + '%'; z.style.top = y + '%';
            fxLayer.appendChild(z);
            setTimeout(() => z.remove(), 8000);
        }
        if (id === 'bolt') {
            // Chain Lightning: full hit, then arcs to the 2 nearest structures; stuns defenses
            try { Audio.attack(); screenShake(6, 250); } catch(e) {}
            const hit = (s, dmg) => {
                damageStructure(s, dmg);
                if (s.kind === 'def') s.stunUntil = performance.now() + 2500;
                lbBoom(fxLayer, s.x, s.y);
            };
            hit(boltTarget, 300);
            const others = aliveStructs().filter(s => s !== boltTarget && !s.mobile)
                .map(s => ({ s, d: Math.hypot(s.x - boltTarget.x, (s.y - boltTarget.y) * 1.4) }))
                .sort((a, b) => a.d - b.d).slice(0, 2);
            others.forEach((o, i) => {
                lbShot(fxLayer, boltTarget.x, boltTarget.y, o.s.x, o.s.y);
                hit(o.s, i === 0 ? 150 : 75);
            });
        }
        if (id === 'banner') {
            // War Banner: defenses in range must shoot it — buy your snipers 6 seconds
            const el = document.createElement('div');
            el.className = 'lb-banner';
            el.innerHTML = svgIcon('flag');
            el.style.left = x + '%'; el.style.top = y + '%';
            fxLayer.appendChild(el);
            const bn = { x, y, hp: 600, until: performance.now() + 6000, el };
            banners.push(bn);
            setTimeout(() => { if (el.parentNode) el.remove(); }, 6000);
        }
        document.getElementById('lb-hint').textContent = 'Pick a unit, tap the zone to deploy.';
    }

    // ---- structures (buildings + defenses unified for targeting) ----
    const structs = [
        ...base.buildings.map((b, i) => ({ ...b, kind: 'bld', el: overlay.querySelector('#lbb-' + i), maxHp: b.hp })),
        ...base.defenses.map((d, i) => ({ ...d, kind: 'def', el: overlay.querySelector('#lbd-' + i), maxHp: d.hp }))
    ];
    function aliveStructs() { return structs.filter(s => s.hp > 0); }
    function nearestTarget(x, y, maxDist) {
        let best = null, bd = maxDist || 1e9;
        for (const s of aliveStructs()) {
            if (s.mobile) continue;   // spells & generic checks ignore guards
            const d = Math.hypot(s.x - x, (s.y - y) * 1.4);
            if (d < bd) { bd = d; best = s; }
        }
        return best;
    }
    // Role-based target selection with caching (re-pick only when the target dies)
    function pickTarget(t) {
        if (t.target && t.target.hp > 0) return t.target;
        const role = TROOP_ROLES[t.type] || 'line';
        const alive = aliveStructs();
        if (!alive.length) return null;
        let pool = alive;
        if (role === 'sniper') {
            const defs = alive.filter(s => s.kind === 'def' && !s.mobile);
            if (defs.length) pool = defs;
        } else if (role === 'siege') {
            // biggest building, town hall weighted; never distracted by defenses/guards
            const blds = alive.filter(s => s.kind === 'bld');
            if (blds.length) {
                let best = null, bs = -1;
                for (const s of blds) { const sc = s.maxHp * (s.th ? 1.5 : 1); if (sc > bs) { bs = sc; best = s; } }
                t.target = best; return best;
            }
            pool = alive.filter(s => !s.mobile);
            if (!pool.length) pool = alive;
        } else if (role === 'raider') {
            const res = alive.filter(s => s.kind === 'bld' && RESOURCE_BLD[s.type]);
            if (res.length) pool = res;
        }
        let best = null, bd = 1e9;
        for (const s of pool) {
            const d = Math.hypot(s.x - t.x, (s.y - t.y) * 1.4);
            if (d < bd) { bd = d; best = s; }
        }
        t.target = best;
        return best;
    }
    let guardsSpawned = false, raiderRazes = 0;
    function damageStructure(s, dmg, attacker) {
        if (s.hp <= 0) return;
        s.hp -= dmg;
        // Guards muster when the Town Hall is bloodied
        if (s.th && !guardsSpawned && s.hp < s.maxHp * 0.5) spawnGuards();
        const f = s.el && s.el.querySelector('.lb-bhpfill');
        if (f) { f.style.width = Math.max(0, (s.hp / s.maxHp) * 100) + '%'; if (s.hp / s.maxHp < 0.4) f.classList.add('low'); }
        if (s.hp <= 0) {
            // Guards don't count toward destruction % — stars stay honest
            if (!s.mobile) destroyedHP += s.maxHp;
            if (attacker && !attacker.dead) {
                attacker.battleKills++;   // last hit claims the kill
                // Raider bonus: cavalry razing resource buildings fattens the loot
                if (attacker.type === 'cavalry' && s.kind === 'bld' && RESOURCE_BLD[s.type]) raiderRazes++;
            }
            if (s.th) thDown = true;
            if (s.el) { s.el.classList.add(s.mobile ? 'lb-tdead' : 'lb-destroyed'); if (s.mobile) setTimeout(() => s.el.remove(), 600); }
            lbBoom(fxLayer, s.x, s.y);
            try { Audio.attack(); screenShake(4, 200); } catch(e) {}
            updateHUD();
        }
    }
    function spawnGuards() {
        guardsSpawned = true;
        const lvl = spec.level || 1;
        const n = 2 + Math.floor(lvl / 4);
        const hpScale = 1 + lvl * 0.25;
        for (let i = 0; i < n; i++) {
            const el = document.createElement('div');
            el.className = 'lb-troop lb-guard';
            el.innerHTML = `<div class="lb-bhp"><div class="lb-bhpfill" style="background:#ef4444"></div></div>
                <div class="lb-tspr">${(typeof topUnitSVG === 'function') ? topUnitSVG('warrior', true) : ''}</div>`;
            const gx = 44 + i * (12 / Math.max(1, n - 1)), gy = 20;
            el.style.left = gx + '%'; el.style.top = gy + '%';
            troopLayer.appendChild(el);
            structs.push({ kind: 'def', type: 'guard', mobile: true, x: gx, y: gy,
                hp: Math.round(220 * hpScale), maxHp: Math.round(220 * hpScale),
                speed: 11, range: 4.5, dmg: Math.round(16 * (1 + lvl * 0.1)), cd: 0.8, cdLeft: 0, el });
        }
        flashHint('⚔️ The garrison sallies out — guards defend the Town Hall!');
        try { Audio.attack(); } catch (e) {}
    }
    function updateHUD() {
        const destr = Math.min(1, destroyedHP / totalHP);
        document.getElementById('lb-destr').textContent = Math.round(destr * 100) + '%';
        const stars = calcStars(destr);
        document.getElementById('lb-stars').innerHTML = svgIcon('star').repeat(stars) + svgIcon('starOutline').repeat(3 - stars);
    }
    function calcStars(destr) {
        let s = 0;
        if (destr >= 0.5) s++;
        if (thDown) s++;
        if (destr >= 0.999) s++;
        return Math.min(3, s);
    }

    // ---- main loop ----
    let last = performance.now();
    let projPool = [];
    function loop(now) {
        if (!running) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;

        const now2 = performance.now();
        // healing rain zones: steady regen for troops standing in the rain
        for (const z of healZones) {
            if (now2 > z.until) continue;
            for (const t of troops) {
                if (t.dead || t.hp >= t.maxHp) continue;
                if (Math.hypot(t.x - z.x, (t.y - z.y) * 1.4) < 14) {
                    t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.12 * dt);
                    const f = t.el.querySelector('.lb-thpfill');
                    if (f) f.style.width = (t.hp / t.maxHp * 100) + '%';
                }
            }
        }
        // troops
        for (const t of troops) {
            if (t.dead) continue;
            const target = pickTarget(t);
            if (!target) continue;
            const dx = target.x - t.x, dy = target.y - t.y;
            const dist = Math.hypot(dx, dy * 1.4);
            const raged = now2 < t.rageUntil;
            if (dist > t.range) {
                const sp = t.speed * (raged ? 1.3 : 1) * dt;   // rage also quickens the step
                t.x += (dx / dist) * sp; t.y += (dy / dist) * sp;
                t.el.style.left = t.x + '%'; t.el.style.top = t.y + '%';
                // trap trigger
                for (const tr of base.traps) {
                    if (tr.armed && Math.hypot(tr.x - t.x, (tr.y - t.y) * 1.4) < 5) {
                        tr.armed = false;
                        lbBoom(fxLayer, tr.x, tr.y);
                        try { Audio.attack(); screenShake(5, 220); } catch(e) {}
                        hurtTroop(t, tr.dmg);
                    }
                }
            } else {
                t.atkCd -= dt;
                if (t.atkCd <= 0) {
                    const isCata = t.type === 'catapult';
                    t.atkCd = isCata ? 1.4 : 0.5;   // catapults: big, slow hits
                    const deadeye = (t.trait === 'deadeye' && target.kind === 'def') ? 1.25 : 1;
                    const flank = (t.flankUntil && now2 < t.flankUntil) ? 1.15 : 1;      // beach-landing surge
                    const vsGuard = (t.type === 'pikeman' && target.mobile) ? 2 : 1;     // pikes skewer sallies
                    const dmg = Math.round(t.atk * (raged ? 1.6 : 1) * deadeye * flank * vsGuard * (isCata ? 2.8 : 1));
                    damageStructure(target, dmg, t);
                    if (isCata) {
                        // splash: 40% to structures near the impact
                        for (const s of aliveStructs()) {
                            if (s === target || s.mobile) continue;
                            if (Math.hypot(s.x - target.x, (s.y - target.y) * 1.4) < 8) damageStructure(s, Math.round(dmg * 0.4), t);
                        }
                    }
                    if (isRangedT(t.type)) lbShot(fxLayer, t.x, t.y, target.x, target.y);
                    else lbSlash(fxLayer, target.x, target.y);
                }
            }
        }
        // defenses fire (guards handled separately below)
        for (const d of structs) {
            if (d.kind !== 'def' || d.hp <= 0 || d.mobile) continue;
            if (d.stunUntil && now2 < d.stunUntil) continue;   // chain lightning stun
            d.cdLeft -= dt;
            if (d.cdLeft <= 0) {
                // War Banner decoy: any active banner in range MUST be shot first
                let banner = null;
                for (const bn of banners) {
                    if (bn.hp > 0 && now2 < bn.until && Math.hypot(bn.x - d.x, (bn.y - d.y) * 1.4) < d.range) { banner = bn; break; }
                }
                if (banner) {
                    d.cdLeft = d.cd;
                    lbShot(fxLayer, d.x, d.y, banner.x, banner.y, true);
                    banner.hp -= d.dmg;
                    if (banner.hp <= 0 && banner.el) { lbBoom(fxLayer, banner.x, banner.y); banner.el.remove(); }
                    continue;
                }
                if (d.type === 'mortar') {
                    // Mortar: lob at the biggest cluster outside its dead zone; splash on landing
                    let best = null, bestScore = -1;
                    for (const t of troops) {
                        if (t.dead) continue;
                        const dist = Math.hypot(t.x - d.x, (t.y - d.y) * 1.4);
                        if (dist > d.range || dist < d.minRange) continue;
                        let neighbors = 0;
                        for (const o of troops) { if (!o.dead && Math.hypot(o.x - t.x, (o.y - t.y) * 1.4) < 8) neighbors++; }
                        if (neighbors > bestScore) { bestScore = neighbors; best = t; }
                    }
                    if (best) {
                        d.cdLeft = d.cd;
                        const lx = best.x, ly = best.y;   // dumb lead: shells land where you WERE
                        lbShot(fxLayer, d.x, d.y, lx, ly, true);
                        setTimeout(() => {
                            if (!running) return;
                            lbBoom(fxLayer, lx, ly);
                            try { screenShake(5, 200); } catch (e) {}
                            for (const t2 of troops) {
                                if (!t2.dead && Math.hypot(t2.x - lx, (t2.y - ly) * 1.4) < 7) hurtTroop(t2, d.dmg);
                            }
                        }, 900);
                    }
                } else {
                    // Towers & cannons: tanks taunt — they get locked first
                    let best = null, bd = 1e9;
                    for (const t of troops) {
                        if (t.dead) continue;
                        const dist = Math.hypot(t.x - d.x, (t.y - d.y) * 1.4);
                        if (dist > d.range) continue;
                        const score = dist - ((TROOP_ROLES[t.type] === 'tank') ? 10 : 0);
                        if (score < bd) { bd = score; best = t; }
                    }
                    if (best) {
                        d.cdLeft = d.cd;
                        lbShot(fxLayer, d.x, d.y, best.x, best.y, true);
                        hurtTroop(best, d.dmg);
                    }
                }
            }
        }
        // guards: chase the nearest attacker and melee
        for (const g of structs) {
            if (!g.mobile || g.hp <= 0) continue;
            let best = null, bd = 1e9;
            for (const t of troops) {
                if (t.dead) continue;
                const dist = Math.hypot(t.x - g.x, (t.y - g.y) * 1.4);
                if (dist < bd) { bd = dist; best = t; }
            }
            if (!best) continue;
            if (bd > g.range) {
                const sp = g.speed * dt;
                g.x += (best.x - g.x) / bd * sp; g.y += (best.y - g.y) / bd * sp;
                if (g.el) { g.el.style.left = g.x + '%'; g.el.style.top = g.y + '%'; }
            } else {
                g.cdLeft -= dt;
                if (g.cdLeft <= 0) {
                    g.cdLeft = g.cd;
                    lbSlash(fxLayer, best.x, best.y);
                    hurtTroop(best, g.dmg);
                }
            }
        }
    }
    function hurtTroop(t, dmg) {
        if (t.dead) return;
        if (t.trait === 'shieldwall') dmg *= 0.85;
        t.hp -= dmg;
        if (t.hp <= 0 && t.trait === 'unbroken' && !t.unbrokenUsed) {
            // Unbroken: the first killing blow each battle leaves them at 1 HP
            t.unbrokenUsed = true;
            t.hp = 1;
            lbRing(fxLayer, t.x, t.y, '#fbbf24');
        }
        const f = t.el.querySelector('.lb-thpfill');
        if (f) { f.style.width = Math.max(0, (t.hp / t.maxHp) * 100) + '%'; }
        if (t.hp <= 0) {
            t.dead = true;
            killedIds.push(t.id);
            t.el.classList.add('lb-tdead');
            setTimeout(() => t.el.remove(), 600);
        }
    }
    // Drive the simulation with requestAnimationFrame for smooth 60fps in the
    // foreground, but fall back to a setInterval pump when the tab is hidden
    // (browsers freeze rAF on hidden/background tabs). The fallback only steps
    // when rAF has stalled, so the two drivers never double-advance the sim.
    last = performance.now();
    function rafTick(now) {
        if (!running) return;
        loop(now);
        requestAnimationFrame(rafTick);
    }
    requestAnimationFrame(rafTick);
    const pumpIv = setInterval(() => {
        if (!running) return;
        // Only step from the pump when the tab is actually hidden (rAF is frozen).
        // Gating on document.hidden — not just an elapsed-time threshold — prevents
        // the pump from firing alongside a live-but-janky rAF frame and briefly
        // double-advancing the sim on a visible tab.
        if (!document.hidden) return;
        const now = performance.now();
        if (now - last > 120) loop(now); // rAF stalled (hidden tab) → keep sim alive
    }, 80);

    // ---- timer & end conditions ----
    const timerIv = setInterval(() => {
        if (!running) return;
        timeLeft--;
        document.getElementById('lb-timer').textContent = timeLeft;
        const allDead = troops.length > 0 && troops.every(t => t.dead) && Object.values(tray).every(l => l.length === 0);
        // guards don't hold the battle open — only real structures count
        const allGone = aliveStructs().filter(s => !s.mobile).length === 0;
        if (timeLeft <= 0 && !allGone && !allDead && !overtimeUsed && Math.min(1, destroyedHP / totalHP) >= 0.45) {
            // OVERTIME: one clutch push when you're close
            overtimeUsed = true;
            timeLeft = 10;
            document.getElementById('lb-timer').textContent = timeLeft;
            flashHint('⚡ PUSH! +10 seconds!');
            try { Audio.achievement(); screenShake(4, 250); } catch (e) {}
            return;
        }
        if (timeLeft <= 0 || allGone || allDead) endBattle();
    }, 1000);

    function endBattle() {
        if (!running) return;
        running = false;
        try { Audio.setBattleMusic && Audio.setBattleMusic(false); } catch (e) {}
        clearInterval(timerIv);
        clearInterval(pumpIv);
        const destr = Math.min(1, destroyedHP / totalHP);
        const stars = calcStars(destr);
        const lossCounts = {};
        for (const id of killedIds) {
            const t = troops.find(x => x.id === id);
            if (t) lossCounts[t.type] = (lossCounts[t.type] || 0) + 1;
        }
        // ---- Veteran write-back: survivors log the raid, claim kills, rank up ----
        const promotions = [];
        const killedSet = new Set(killedIds);
        for (const t of troops) {
            const s = t.soldier;
            if (!s || killedSet.has(t.id)) continue;
            const beforeRank = (typeof rankIndex === 'function') ? rankIndex(s) : 0;
            s.raids = (s.raids || 0) + 1;
            s.kills = (s.kills || 0) + (t.battleKills || 0);
            const afterRank = (typeof rankIndex === 'function') ? rankIndex(s) : 0;
            if (afterRank > beforeRank) {
                if (afterRank >= 2 && !s.trait && typeof rollTrait === 'function') s.trait = rollTrait();
                const traitNote = (s.trait && afterRank === 2 && typeof VET_TRAITS !== 'undefined')
                    ? ` Trait: ${VET_TRAITS[s.trait].name}.` : '';
                promotions.push(`${s.name} is now a ${rankOf(s).name}!${traitNote}`);
            }
        }
        // big star reveal
        const reveal = document.createElement('div');
        reveal.className = 'lb-reveal';
        reveal.innerHTML = `<div class="lb-reveal-stars">${[1,2,3].map(s => `<span class="rstar big ${stars >= s ? 'lit' : ''}" style="animation-delay:${s * 0.25}s">${svgIcon('star')}</span>`).join('')}</div>
            <div class="lb-reveal-pct">${Math.round(destr * 100)}% destroyed</div>`;
        overlay.appendChild(reveal);
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
                onDone({ stars, destruction: destr, killedIds, lossCounts, victory: stars >= 1, raiderRazes });
                // announce promotions after the result lands, staggered
                promotions.forEach((msg, i) => setTimeout(() => {
                    toast(`⚔️ ${msg}`, 'success');
                    try { Audio.achievement(); } catch (e) {}
                }, 600 + i * 900));
            }, 350);
        }, 1700);
    }
    overlay.querySelector('#lb-end').onclick = endBattle;
}

// ---- battle FX (particles) ----
function lbBoom(fx, x, y) {
    for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'lb-part';
        const a = Math.random() * Math.PI * 2, d = 20 + Math.random() * 36;
        p.style.left = x + '%'; p.style.top = y + '%';
        p.style.setProperty('--px', Math.cos(a) * d + 'px');
        p.style.setProperty('--py', Math.sin(a) * d + 'px');
        p.style.background = ['#fde047', '#f97316', '#9ca3af', '#78350f'][i % 4];
        fx.appendChild(p);
        setTimeout(() => p.remove(), 650);
    }
    const fl = document.createElement('div');
    fl.className = 'bt-impact'; fl.style.left = x + '%'; fl.style.top = y + '%';
    fl.style.width = '34px'; fl.style.height = '34px'; fl.style.margin = '-17px 0 0 -17px';
    fx.appendChild(fl);
    setTimeout(() => fl.remove(), 380);
}
function lbShot(fx, x1, y1, x2, y2, hostile) {
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const w = document.createElement('div');
    w.className = 'lb-proj' + (hostile ? ' hostile' : '');
    w.style.left = x1 + '%'; w.style.top = y1 + '%';
    w.style.setProperty('--ang', ang + 'deg');
    fx.appendChild(w);
    w.style.transition = 'left 0.24s linear, top 0.24s linear';
    requestAnimationFrame(() => { w.style.left = x2 + '%'; w.style.top = y2 + '%'; });
    setTimeout(() => w.remove(), 270);
}
function lbSlash(fx, x, y) {
    const s = document.createElement('div');
    s.className = 'bt-slash';
    s.style.left = x + '%'; s.style.top = y + '%';
    fx.appendChild(s);
    setTimeout(() => s.remove(), 360);
}
function lbRing(fx, x, y, color) {
    const r = document.createElement('div');
    r.className = 'lb-ring';
    r.style.left = x + '%'; r.style.top = y + '%';
    r.style.borderColor = color;
    fx.appendChild(r);
    setTimeout(() => r.remove(), 700);
}
