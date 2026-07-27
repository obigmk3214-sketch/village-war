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
    // Town hall — center upper area
    buildings.push({ type: 'townhall', x: 50, y: 22, hp: Math.round(900 * hpScale), w: 13, th: true });
    // Resource buildings ring
    const resTypes = ['goldmine', 'farm', 'lumbermill', 'storage', 'coinmint', 'ironmine'];
    const nRes = Math.min(7, 3 + Math.floor(lvl / 3));
    for (let i = 0; i < nRes; i++) {
        const a = (i / nRes) * Math.PI * 2 + rnd() * 0.5;
        buildings.push({
            type: resTypes[i % resTypes.length],
            x: 50 + Math.cos(a) * (16 + rnd() * 10),
            y: 26 + Math.sin(a) * (11 + rnd() * 6),
            hp: Math.round(380 * hpScale), w: 9
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
            hp: Math.round(520 * hpScale), w: 8,
            range: isCannon ? 26 : 32,
            dmg: Math.round((isCannon ? 34 : 20) * (1 + lvl * 0.12)),
            cd: isCannon ? 1.6 : 0.9, cdLeft: 0
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

// ---- Spells ----
const LB_SPELLS = [
    { id: 'rage',  icon: svgIcon('rage'), name: 'Rage',      desc: '+60% attack, 8s, area' },
    { id: 'heal',  icon: svgIcon('heal'), name: 'Heal',      desc: 'Restore 50% HP, area' },
    { id: 'bolt',  icon: svgIcon('bolt'), name: 'Lightning', desc: '300 damage, area' }
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
    // permadeath
    removeSoldiers(r.killedIds);
    const victory = r.stars >= 1;
    if (typeof expOnRaid === 'function') expOnRaid(victory);
    if (victory && spec.kind === 'boss' && typeof spec.onWin === 'function') { try { spec.onWin(); } catch(e) {} }
    const lootGained = {};
    if (victory) {
        const mult = 0.3 + 0.7 * r.destruction;
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
    } else {
        if (spec.kind === 'cpu') state.trophies = Math.max(0, (state.trophies || 0) - 5);
    }
    const logEntry = {
        time: Date.now(), type: 'attack', target: spec.name, victory,
        loot: lootGained, losses: r.lossCounts, trophies: 0, xp: 0,
        stars: r.stars, destruction: Math.round(r.destruction * 100), casualtyCount: r.killedIds.length
    };
    state.battleLog.unshift(logEntry);
    if (state.battleLog.length > 50) state.battleLog.pop();
    state.raidCooldown = Date.now() + 15000;

    // Result screen
    const el = document.getElementById('battle-result');
    el.classList.remove('hidden');
    el.innerHTML = `
        <div class="result-inner ${victory ? 'victory' : 'defeat'}">
            <h2>${victory ? 'VICTORY!' : 'DEFEAT!'}</h2>
            <div class="result-stars">${[1,2,3].map(s => `<span class="rstar ${r.stars >= s ? 'lit' : ''}">${svgIcon('star')}</span>`).join('')}</div>
            <p style="color:var(--text2)">${spec.name} — ${Math.round(r.destruction * 100)}% destroyed</p>
            ${victory ? `<div class="loot-gained">${Object.entries(lootGained).filter(([,v]) => v > 0).map(([res, v]) => `<div class="loot-item">${RES_ICONS[res] || res} +${formatNum(v)}</div>`).join('')}</div>` : '<p style="color:var(--danger)">Destroy at least 50% to win loot.</p>'}
            <div class="losses">Fallen soldiers: ${r.killedIds.length ? Object.entries(r.lossCounts).map(([t, v]) => `${v} ${TROOP_DEFS[t]?.name || t}`).join(', ') : 'None'} ${r.killedIds.length ? '(gone forever)' : ''}</div>
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

    // troop templates with research + hero boosts
    const heroB = (typeof getHeroBonus === 'function') ? getHeroBonus() : { all: { atkMult: 1, hpMult: 1 } };
    const mkStats = (type) => {
        const d = TROOP_DEFS[type];
        const rb = (typeof getResearchTroopBoost === 'function') ? getResearchTroopBoost(type) : { hp: 1, atk: 1 };
        return {
            hp: Math.round(d.hp * rb.hp * (heroB.all.hpMult || 1)),
            atk: Math.round(d.attack * rb.atk * (heroB.all.atkMult || 1)),
            speed: type === 'cavalry' ? 20 : (type === 'siege' || type === 'catapult') ? 9 : 13,
            range: isRangedT(type) ? (type === 'catapult' ? 30 : 22) : 4.5
        };
    };

    // group army by type for the deploy tray
    const tray = {};
    for (const s of armyList) (tray[s.type] = tray[s.type] || []).push(s);
    let selectedType = Object.keys(tray)[0];
    const spells = { rage: 1, heal: 1, bolt: 1 };
    let armedSpell = null;

    overlay.innerHTML = `
        <div class="lb-scene">
            <div class="lb-field" id="lb-field">
                <div class="lb-grass"></div>
                <div class="lb-deployzone"></div>
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
            </div>
            <div class="lb-top">
                <span class="lb-title">${svgIcon('swords')}️ ${spec.name}</span>
                <span class="lb-destruction" id="lb-destr">0%</span>
                <span class="lb-starbar" id="lb-stars">${svgIcon('starOutline').repeat(3)}</span>
                <span class="lb-timer" id="lb-timer">20</span>
                <button class="bv-skip" id="lb-end">End Battle</button>
            </div>
            <div class="lb-bottom">
                <div class="lb-tray" id="lb-tray"></div>
                <div class="lb-spells" id="lb-spells">
                    ${LB_SPELLS.map(s => `<button class="lb-spell" data-spell="${s.id}" title="${s.name}: ${s.desc}">${s.icon}<span class="lb-spell-n">1</span></button>`).join('')}
                </div>
            </div>
            <div class="lb-hint" id="lb-hint">Pick a unit below, then TAP the highlighted zone to deploy!</div>
        </div>`;
    document.body.appendChild(overlay);

    const field = overlay.querySelector('#lb-field');
    const troopLayer = overlay.querySelector('#lb-troops');
    const fxLayer = overlay.querySelector('#lb-fx');

    // ---- live entities ----
    const troops = [];     // {id, type, x, y, hp, maxHp, atk, speed, range, el, dead, rageUntil}
    const killedIds = [];
    let destroyedHP = 0, thDown = false, running = true, timeLeft = 20;

    function renderTray() {
        const trayEl = overlay.querySelector('#lb-tray');
        trayEl.innerHTML = Object.entries(tray).map(([t, list]) => `
            <button class="lb-chip ${t === selectedType ? 'sel' : ''}" data-type="${t}" ${list.length === 0 ? 'disabled' : ''}>
                <span class="lb-chip-ico">${(typeof topUnitSVG === 'function') ? topUnitSVG(t, false) : ''}</span>
                <span class="lb-chip-n">${list.length}</span>
            </button>`).join('');
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
        if (y < 62) { flashHint('Deploy in the highlighted zone at the bottom!'); return; }
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
        const st = mkStats(soldier.type);
        const el = document.createElement('div');
        el.className = 'lb-troop';
        el.innerHTML = `<div class="lb-thp"><div class="lb-thpfill"></div></div><div class="lb-tspr">${(typeof topUnitSVG === 'function') ? topUnitSVG(soldier.type, false) : ''}</div>`;
        el.style.left = x + '%'; el.style.top = y + '%';
        troopLayer.appendChild(el);
        troops.push({ id: soldier.id, type: soldier.type, x, y, hp: st.hp, maxHp: st.hp, atk: st.atk, speed: st.speed, range: st.range, el, dead: false, atkCd: 0, rageUntil: 0 });
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
        lbRing(fxLayer, x, y, id === 'rage' ? '#f97316' : id === 'heal' ? '#4ade80' : '#fde047');
        try { Audio.whoosh(); } catch(e) {}
        const inArea = troops.filter(t => !t.dead && Math.hypot(t.x - x, (t.y - y) * 1.4) < 18);
        if (id === 'rage') { const until = performance.now() + 8000; inArea.forEach(t => t.rageUntil = until); }
        if (id === 'heal') inArea.forEach(t => {
            t.hp = Math.min(t.maxHp, t.hp + t.maxHp * 0.5);
            const f = t.el.querySelector('.lb-thpfill');   // keep the HP bar in sync (was only updated on damage)
            if (f) f.style.width = (t.hp / t.maxHp * 100) + '%';
        });
        if (id === 'bolt') {
            try { Audio.attack(); screenShake(6, 250); } catch(e) {}
            damageStructure(boltTarget, 300);
            lbBoom(fxLayer, x, y);
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
            const d = Math.hypot(s.x - x, (s.y - y) * 1.4);
            if (d < bd) { bd = d; best = s; }
        }
        return best;
    }
    function damageStructure(s, dmg) {
        if (s.hp <= 0) return;
        s.hp -= dmg;
        const f = s.el && s.el.querySelector('.lb-bhpfill');
        if (f) { f.style.width = Math.max(0, (s.hp / s.maxHp) * 100) + '%'; if (s.hp / s.maxHp < 0.4) f.classList.add('low'); }
        if (s.hp <= 0) {
            destroyedHP += s.maxHp;
            if (s.th) thDown = true;
            if (s.el) { s.el.classList.add('lb-destroyed'); }
            lbBoom(fxLayer, s.x, s.y);
            try { Audio.attack(); screenShake(4, 200); } catch(e) {}
            updateHUD();
        }
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

        // troops
        for (const t of troops) {
            if (t.dead) continue;
            const target = nearestTarget(t.x, t.y);
            if (!target) continue;
            const dx = target.x - t.x, dy = target.y - t.y;
            const dist = Math.hypot(dx, dy * 1.4);
            if (dist > t.range) {
                const sp = t.speed * dt;
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
                    t.atkCd = 0.5;
                    const raged = performance.now() < t.rageUntil;
                    damageStructure(target, Math.round(t.atk * (raged ? 1.6 : 1)));
                    if (isRangedT(t.type)) lbShot(fxLayer, t.x, t.y, target.x, target.y);
                    else lbSlash(fxLayer, target.x, target.y);
                }
            }
        }
        // defenses fire
        for (const d of structs) {
            if (d.kind !== 'def' || d.hp <= 0) continue;
            d.cdLeft -= dt;
            if (d.cdLeft <= 0) {
                let best = null, bd = d.range;
                for (const t of troops) {
                    if (t.dead) continue;
                    const dist = Math.hypot(t.x - d.x, (t.y - d.y) * 1.4);
                    if (dist < bd) { bd = dist; best = t; }
                }
                if (best) {
                    d.cdLeft = d.cd;
                    lbShot(fxLayer, d.x, d.y, best.x, best.y, true);
                    hurtTroop(best, d.dmg);
                }
            }
        }
    }
    function hurtTroop(t, dmg) {
        if (t.dead) return;
        t.hp -= dmg;
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
        const allGone = aliveStructs().length === 0;
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
        // big star reveal
        const reveal = document.createElement('div');
        reveal.className = 'lb-reveal';
        reveal.innerHTML = `<div class="lb-reveal-stars">${[1,2,3].map(s => `<span class="rstar big ${stars >= s ? 'lit' : ''}" style="animation-delay:${s * 0.25}s">${svgIcon('star')}</span>`).join('')}</div>
            <div class="lb-reveal-pct">${Math.round(destr * 100)}% destroyed</div>`;
        overlay.appendChild(reveal);
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.remove(); onDone({ stars, destruction: destr, killedIds, lossCounts, victory: stars >= 1 }); }, 350);
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
