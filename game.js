// ============================================================
// VILLAGE WAR - Complete Game Engine
// ============================================================

const BUILDING_DEFS = {
    townhall: {
        name: 'Town Hall', icon: svgIcon('castle'), category: 'resource',
        desc: 'Heart of your village. Upgrading unlocks new buildings.',
        maxLevel: 10, unique: true,
        baseCost: { coins: 200, wood: 100, food: 120 },
        costMult: 2.2,
        baseHP: 500,
        production: null,
        unlocks: { 2: ['barracks'], 3: ['archertower'], 4: ['cannon'], 5: ['stable'], 7: ['fortress'] }
    },
    goldmine: {
        name: 'Gold Mine', icon: svgIcon('pickaxe'), category: 'resource',
        desc: 'Produces gold over time.',
        maxLevel: 10, unique: false,
        baseCost: { coins: 100, wood: 50 },
        costMult: 1.8,
        baseHP: 200,
        production: { gold: 8 },
        prodMult: 1.5
    },
    ironmine: {
        name: 'Iron Mine', icon: svgIcon('hammer'), category: 'resource',
        desc: 'Produces iron over time. Unlocks at Town Hall Lv2.',
        maxLevel: 10, unique: false,
        baseCost: { coins: 100, wood: 50 },
        costMult: 1.8,
        baseHP: 200,
        production: { iron: 8 },
        prodMult: 1.5,
        reqTH: 2
    },
    lumbermill: {
        name: 'Lumber Mill', icon: svgIcon('pickaxe'), category: 'resource',
        desc: 'Produces wood over time.',
        maxLevel: 10, unique: false,
        baseCost: { coins: 80, gold: 20 },
        costMult: 1.8,
        baseHP: 200,
        production: { wood: 10 },
        prodMult: 1.5
    },
    farm: {
        name: 'Farm', icon: svgIcon('wheat'), category: 'resource',
        desc: 'Produces food to feed your army.',
        maxLevel: 10, unique: false,
        baseCost: { coins: 60, wood: 40 },
        costMult: 1.6,
        baseHP: 150,
        production: { food: 8 },
        prodMult: 1.5
    },
    coinmint: {
        name: 'Coin Mint', icon: svgIcon('bank'), category: 'resource',
        desc: 'Generates coins over time. Basic at first — upgrade it to mint far more.',
        maxLevel: 10, unique: false,
        baseCost: { gold: 80, iron: 40 },
        costMult: 1.8,
        baseHP: 200,
        production: { coins: 10 },  // basic at Lv1; upgrades scale it up fast
        prodMult: 1.6,
        reqTH: 3
    },
    storage: {
        name: 'Storage', icon: svgIcon('crate'), category: 'resource',
        desc: 'Increases maximum resource storage.',
        maxLevel: 10, unique: false,
        baseCost: { coins: 150, wood: 80 },
        costMult: 1.7,
        baseHP: 300,
        production: null,
        storageBonus: 800,
        reqTH: 2
    },
    harbor: {
        name: 'Harbor', icon: svgIcon('boat'), category: 'resource',
        desc: 'Trade ships dock here: the Marketplace, Black Market deals, the Royal Bank vault and the gem sluice — all in one place.',
        maxLevel: 5, unique: true,
        baseCost: { coins: 800, wood: 400 },
        costMult: 1.9,
        baseHP: 600,
        production: null,
        reqTH: 3
    },
    barracks: {
        name: 'Barracks', icon: svgIcon('swords'), category: 'military',
        desc: 'Train warriors and archers. Build more to grow your army!',
        maxLevel: 10, unique: false,
        baseCost: { coins: 200, wood: 120, iron: 50 },
        costMult: 2.0,
        baseHP: 400,
        production: null,
        reqTH: 1,
        troopCapacity: 20,
        capMult: 1.4
    },
    stable: {
        name: 'Stable', icon: '', category: 'military',
        desc: 'Train cavalry units. Each stable grows your army cap.',
        maxLevel: 8, unique: false,
        baseCost: { coins: 500, wood: 200, iron: 100 },
        costMult: 2.0,
        baseHP: 350,
        production: null,
        reqTH: 3,
        troopCapacity: 10,
        capMult: 1.3
    },
    researchlab: {
        name: 'Research Lab', icon: svgIcon('research'), category: 'military',
        desc: 'Unlock research! Discover boosts, new troops, and territory expansions.',
        maxLevel: 5, unique: true,
        baseCost: { coins: 800, gold: 200, iron: 300, wood: 200 },
        costMult: 2.2,
        baseHP: 350,
        production: null,
        reqTH: 2
    },
    fortress: {
        name: 'Fortress', icon: svgIcon('castle'), category: 'military',
        desc: 'Train siege units. Boosts all defenses.',
        maxLevel: 5, unique: true,
        baseCost: { coins: 1000, gold: 500, iron: 300 },
        costMult: 2.5,
        baseHP: 800,
        production: null,
        reqTH: 4,
        defenseBoost: 0.1
    },
    wall: {
        name: 'Wall', icon: '', category: 'defense',
        desc: 'Absorbs damage from attackers.',
        maxLevel: 15, unique: false,
        baseCost: { coins: 50, iron: 30 },
        costMult: 1.5,
        baseHP: 300,
        production: null,
        defense: 20,
        defMult: 1.5
    },
    archertower: {
        name: 'Archer Tower', icon: svgIcon('dagger'), category: 'defense',
        desc: 'Deals damage to attackers.',
        maxLevel: 10, unique: false,
        baseCost: { coins: 200, wood: 100, iron: 50 },
        costMult: 1.8,
        baseHP: 250,
        production: null,
        reqTH: 2,
        defense: 40,
        defMult: 1.6,
        attack: 15
    },
    cannon: {
        name: 'Cannon', icon: '', category: 'defense',
        desc: 'High damage, slow attack.',
        maxLevel: 8, unique: false,
        baseCost: { coins: 400, iron: 200 },
        costMult: 2.0,
        baseHP: 350,
        production: null,
        reqTH: 3,
        defense: 30,
        defMult: 1.5,
        attack: 30
    }
};

const TROOP_DEFS = {
    warrior: {
        name: 'Warrior', icon: svgIcon('dagger'), size: 1,
        desc: 'Basic melee fighter.',
        cost: { coins: 20, food: 10 },
        hp: 100, attack: 15, defense: 10,
        building: 'barracks', reqLevel: 1
    },
    archer: {
        name: 'Archer', icon: svgIcon('dagger'), size: 1,
        desc: 'Ranged fighter. Good vs defenses.',
        cost: { coins: 30, food: 10, wood: 5 },
        hp: 60, attack: 20, defense: 5,
        building: 'barracks', reqLevel: 3
    },
    shieldbearer: {
        name: 'Shield Bearer', icon: svgIcon('shield'), size: 2,
        desc: 'Tanky unit. Absorbs heavy damage.',
        cost: { coins: 50, food: 15, iron: 20 },
        hp: 250, attack: 8, defense: 30,
        building: 'barracks', reqLevel: 5
    },
    cavalry: {
        name: 'Cavalry', icon: '', size: 3,
        desc: 'Fast and powerful.',
        cost: { coins: 80, food: 25, gold: 10 },
        hp: 180, attack: 35, defense: 15,
        building: 'stable', reqLevel: 1
    },
    siege: {
        name: 'Siege Ram', icon: svgIcon('tree'), size: 5,
        desc: 'Destroys buildings fast.',
        cost: { coins: 150, wood: 80, iron: 50 },
        hp: 300, attack: 50, defense: 5,
        building: 'fortress', reqLevel: 1
    },
    // ===== Research-unlocked troops =====
    knight: {
        name: 'Knight', icon: svgIcon('swords'), size: 2,
        desc: 'Heavy elite melee. Plate armor & longsword.',
        cost: { coins: 100, food: 30, iron: 40, gold: 10 },
        hp: 320, attack: 45, defense: 35,
        building: 'barracks', reqLevel: 3,
        requiresResearch: 'r_knight'
    },
    crossbowman: {
        name: 'Crossbowman', icon: svgIcon('dagger'), size: 1,
        desc: 'Ranged powerhouse. Punches through armor.',
        cost: { coins: 80, food: 20, wood: 30, iron: 25 },
        hp: 90, attack: 55, defense: 10,
        building: 'barracks', reqLevel: 2,
        requiresResearch: 'r_crossbow'
    },
    paladin: {
        name: 'Paladin', icon: '', size: 3,
        desc: 'Holy knight. Balanced power and durability.',
        cost: { coins: 200, food: 50, iron: 60, gold: 30 },
        hp: 450, attack: 55, defense: 45,
        building: 'barracks', reqLevel: 5,
        requiresResearch: 'r_paladin'
    },
    catapult: {
        name: 'Catapult', icon: '', size: 6,
        desc: 'Long-range siege. Devastating splash damage.',
        cost: { coins: 250, wood: 150, iron: 100 },
        hp: 250, attack: 90, defense: 5,
        building: 'fortress', reqLevel: 1,
        requiresResearch: 'r_catapult'
    },
    pikeman: {
        name: 'Pikeman', icon: '', size: 1,
        desc: 'Anti-cavalry specialist. Long reach.',
        cost: { coins: 35, food: 15, wood: 10, iron: 10 },
        hp: 130, attack: 25, defense: 18,
        building: 'barracks', reqLevel: 1,
        requiresResearch: 'r_pikeman'
    }
};

// ============================================================
// RESEARCH TREE
// ============================================================

const RESEARCH_NODES = {
    // Production boosts
    r_gold_1: { name: 'Gold Veins',      desc: '+15% gold production',  cost: { coins: 1500, iron: 200 },            effect: { prodMult: { gold: 1.15 } },   reqLab: 1, category: 'economy' },
    r_gold_2: { name: 'Deep Mining',     desc: '+25% more gold',        cost: { coins: 4000, iron: 800, gold: 300 }, effect: { prodMult: { gold: 1.25 } },   reqLab: 3, category: 'economy', requires: 'r_gold_1' },
    r_iron_1: { name: 'Smelting',        desc: '+15% iron production',  cost: { coins: 1500, gold: 200 },            effect: { prodMult: { iron: 1.15 } },   reqLab: 1, category: 'economy' },
    r_iron_2: { name: 'Steel Refinery',  desc: '+25% more iron',        cost: { coins: 4000, gold: 800 },            effect: { prodMult: { iron: 1.25 } },   reqLab: 3, category: 'economy', requires: 'r_iron_1' },
    r_wood_1: { name: 'Lumber Tools',    desc: '+15% wood production',  cost: { coins: 1200, iron: 200 },            effect: { prodMult: { wood: 1.15 } },   reqLab: 1, category: 'economy' },
    r_wood_2: { name: 'Logging Camps',   desc: '+25% more wood',        cost: { coins: 3500, iron: 500 },            effect: { prodMult: { wood: 1.25 } },   reqLab: 3, category: 'economy', requires: 'r_wood_1' },
    r_food_1: { name: 'Crop Rotation',   desc: '+20% food production',  cost: { coins: 1200, wood: 200 },            effect: { prodMult: { food: 1.20 } },   reqLab: 1, category: 'economy' },
    r_food_2: { name: 'Irrigation',      desc: '+30% more food',        cost: { coins: 3500, wood: 500 },            effect: { prodMult: { food: 1.30 } },   reqLab: 3, category: 'economy', requires: 'r_food_1' },
    r_coins_1:{ name: 'Trade Routes',    desc: '+20% coin generation',  cost: { gold: 500, wood: 300, iron: 200 },   effect: { prodMult: { coins: 1.20 } },  reqLab: 2, category: 'economy' },

    // Troop unlocks
    r_pikeman:  { name: 'Polearms',          desc: 'Unlock Pikemen', cost: { coins: 1000, wood: 300, iron: 200 },           effect: { unlockTroop: 'pikeman' },     reqLab: 1, category: 'military' },
    r_crossbow: { name: 'Crossbow Engineering',desc: 'Unlock Crossbowmen', cost: { coins: 2500, wood: 500, iron: 700 },     effect: { unlockTroop: 'crossbowman' }, reqLab: 2, category: 'military' },
    r_knight:   { name: 'Heavy Armor',       desc: 'Unlock Knights', cost: { coins: 4000, iron: 1500, gold: 600 },          effect: { unlockTroop: 'knight' },      reqLab: 2, category: 'military' },
    r_catapult: { name: 'Siege Engineering', desc: 'Unlock Catapults', cost: { coins: 5000, wood: 2000, iron: 2000 },       effect: { unlockTroop: 'catapult' },    reqLab: 3, category: 'military' },
    r_paladin:  { name: 'Holy Order',        desc: 'Unlock Paladins', cost: { coins: 8000, gold: 3000, iron: 1500 },        effect: { unlockTroop: 'paladin' },     reqLab: 4, category: 'military', requires: 'r_knight' },

    // Troop stat upgrades
    r_warrior_atk:  { name: 'Sharper Blades', desc: 'Warriors +20% ATK', cost: { coins: 1200, iron: 400 }, effect: { troopBoost: { warrior: { atk: 1.20 } } }, reqLab: 1, category: 'military' },
    r_archer_atk:   { name: 'Better Bows',    desc: 'Archers +20% ATK', cost: { coins: 1200, wood: 400 }, effect: { troopBoost: { archer: { atk: 1.20 } } }, reqLab: 1, category: 'military' },
    r_shield_def:   { name: 'Reinforced Shields', desc: 'Shield Bearers +25% DEF', cost: { coins: 2000, iron: 800 }, effect: { troopBoost: { shieldbearer: { def: 1.25 } } }, reqLab: 2, category: 'military' },
    r_cavalry_hp:   { name: 'Bred Warhorses', desc: 'Cavalry +25% HP', cost: { coins: 2500, food: 1500 }, effect: { troopBoost: { cavalry: { hp: 1.25 } } }, reqLab: 2, category: 'military' },
    r_all_hp:       { name: 'Battle Hardening', desc: 'All troops +10% HP', cost: { coins: 5000, gold: 1000 }, effect: { troopBoost: { all: { hp: 1.10 } } }, reqLab: 3, category: 'military' },
    r_all_atk:      { name: 'War Doctrines',  desc: 'All troops +10% ATK', cost: { coins: 5000, gold: 1000 }, effect: { troopBoost: { all: { atk: 1.10 } } }, reqLab: 4, category: 'military' },

    // Territory expansion
    r_expand_1: { name: 'Frontier Outpost',   desc: 'Expand territory +20 tiles', cost: { coins: 2000, wood: 800 },              effect: { expand: 20 }, reqLab: 1, category: 'territory' },
    r_expand_2: { name: 'Borderlands',        desc: 'Expand territory +40 tiles', cost: { coins: 5000, wood: 2000, iron: 800 }, effect: { expand: 40 }, reqLab: 2, category: 'territory', requires: 'r_expand_1' },
    r_expand_3: { name: 'Kingdom Claim',      desc: 'Unlock entire map',          cost: { coins: 15000, wood: 5000, gold: 2000 }, effect: { expand: 999 }, reqLab: 4, category: 'territory', requires: 'r_expand_2' }
};

const CPU_CAMPS = [
    // Tier 1 — early game
    { name: 'Goblin Outpost',    icon: 'goblin',    minLvl: 1,  difficulty: 'easy',    level: 1,  troops: { warrior: 5 }, loot: { coins: 200, wood: 100 }, xp: 20 },
    { name: 'Wolf Den',          icon: 'wolf',      minLvl: 1,  difficulty: 'easy',    level: 1,  troops: { warrior: 6 }, loot: { coins: 250, food: 150 }, xp: 25 },
    { name: 'Bandit Camp',       icon: 'pirate',    minLvl: 2,  difficulty: 'easy',    level: 2,  troops: { warrior: 8, archer: 3 }, loot: { coins: 350, gold: 50, wood: 150 }, xp: 35 },
    { name: 'Smuggler\'s Den',   icon: 'crate',     minLvl: 3,  difficulty: 'easy',    level: 2,  troops: { warrior: 10, archer: 4 }, loot: { coins: 450, gold: 80, iron: 60, wood: 120 }, xp: 45 },
    // Tier 2 — mid game
    { name: 'Dark Forest',       icon: 'tree',      minLvl: 4,  difficulty: 'medium',  level: 3,  troops: { warrior: 12, archer: 6 }, loot: { coins: 500, gold: 100, iron: 80, wood: 150 }, xp: 60 },
    { name: 'Cursed Swamp',      icon: 'frog',      minLvl: 5,  difficulty: 'medium',  level: 4,  troops: { warrior: 14, archer: 7, shieldbearer: 2 }, loot: { coins: 650, gold: 150, iron: 120, food: 200 }, xp: 80 },
    { name: 'Orc Stronghold',    icon: 'orc',       minLvl: 6,  difficulty: 'medium',  level: 5,  troops: { warrior: 15, archer: 8, shieldbearer: 3 }, loot: { coins: 800, gold: 200, iron: 150, wood: 200 }, xp: 100 },
    { name: 'Frozen Peak',       icon: 'snowflake', minLvl: 7,  difficulty: 'medium',  level: 6,  troops: { warrior: 18, archer: 10, shieldbearer: 4 }, loot: { coins: 1000, gold: 300, iron: 200, wood: 250 }, xp: 130 },
    // Tier 3 — late game
    { name: 'Dragon\'s Lair',    icon: 'dragon',    minLvl: 9,  difficulty: 'hard',    level: 7,  troops: { warrior: 20, archer: 12, cavalry: 5 }, loot: { coins: 1500, gold: 500, iron: 300, wood: 400 }, xp: 200 },
    { name: 'Pirate Cove',       icon: 'pirate',    minLvl: 10, difficulty: 'hard',    level: 8,  troops: { warrior: 22, archer: 14, cavalry: 6 }, loot: { coins: 2000, gold: 650, iron: 400, wood: 500 }, xp: 270 },
    { name: 'Shadow Citadel',    icon: 'shadow',    minLvl: 12, difficulty: 'hard',    level: 9,  troops: { warrior: 25, archer: 15, shieldbearer: 8, cavalry: 5 }, loot: { coins: 2500, gold: 800, iron: 500, wood: 600 }, xp: 350 },
    { name: 'Volcanic Fortress', icon: 'volcano',   minLvl: 14, difficulty: 'hard',    level: 10, troops: { warrior: 28, archer: 18, shieldbearer: 9, cavalry: 7 }, loot: { coins: 3500, gold: 1000, iron: 700, wood: 700 }, xp: 450 },
    // Tier 4 — endgame
    { name: 'Demon Fortress',    icon: 'demon',     minLvl: 16, difficulty: 'extreme', level: 12, troops: { warrior: 30, archer: 20, shieldbearer: 10, cavalry: 8, siege: 3 }, loot: { coins: 5000, gold: 1500, iron: 1000, wood: 1000 }, xp: 600 },
    { name: 'Lich Tower',        icon: 'skull',     minLvl: 18, difficulty: 'extreme', level: 13, troops: { warrior: 35, archer: 25, shieldbearer: 12, cavalry: 10, siege: 4 }, loot: { coins: 7000, gold: 2200, iron: 1500, wood: 1500 }, xp: 800 },
    { name: 'The Abyss',         icon: 'abyss',     minLvl: 20, difficulty: 'extreme', level: 15, troops: { warrior: 50, archer: 30, shieldbearer: 15, cavalry: 12, siege: 6 }, loot: { coins: 10000, gold: 3000, iron: 2000, wood: 2000, food: 2000 }, xp: 1000 },
    { name: 'Celestial Citadel', icon: 'celestial', minLvl: 25, difficulty: 'extreme', level: 18, troops: { warrior: 70, archer: 50, shieldbearer: 25, cavalry: 20, siege: 10 }, loot: { coins: 20000, gold: 6000, iron: 4000, wood: 4000, food: 4000 }, xp: 1800 },
    // Tier 5 — LEGENDARY (brutal difficulty, enormous rewards)
    { name: 'Frostspire Keep',    icon: 'snowflake', minLvl: 28, difficulty: 'legendary', level: 22, troops: { warrior: 90, archer: 70, shieldbearer: 40, cavalry: 30, siege: 15 }, loot: { coins: 35000, gold: 11000, iron: 7000, wood: 7000, food: 6000 }, xp: 2800 },
    { name: 'Bloodmoon Bastion', icon: 'demon',     minLvl: 32, difficulty: 'legendary', level: 26, troops: { warrior: 120, archer: 90, shieldbearer: 55, cavalry: 45, siege: 22 }, loot: { coins: 55000, gold: 18000, iron: 11000, wood: 10000, food: 9000 }, xp: 4200 },
    { name: 'Throne of Ruin',     icon: 'skull',     minLvl: 36, difficulty: 'legendary', level: 30, troops: { warrior: 160, archer: 120, shieldbearer: 75, cavalry: 60, siege: 30 }, loot: { coins: 85000, gold: 28000, iron: 18000, wood: 16000, food: 14000 }, xp: 6500 },
    { name: 'The God-King\'s Vault', icon: 'celestial', minLvl: 42, difficulty: 'legendary', level: 36, troops: { warrior: 240, archer: 180, shieldbearer: 110, cavalry: 90, siege: 50 }, loot: { coins: 150000, gold: 50000, iron: 32000, wood: 28000, food: 24000 }, xp: 11000 },
    { name: 'Worldbreaker Spire', icon: 'abyss',     minLvl: 50, difficulty: 'legendary', level: 45, troops: { warrior: 400, archer: 300, shieldbearer: 180, cavalry: 150, siege: 90 }, loot: { coins: 300000, gold: 100000, iron: 65000, wood: 55000, food: 50000 }, xp: 20000 }
];

const CLUB_NAMES = [
    'Shadow Legion', 'Iron Wolves', 'Golden Hawks', 'Storm Raiders',
    'Dark Knights', 'Fire Dragons', 'Ice Titans', 'Thunder Bears',
    'Crimson Blades', 'Emerald Vipers', 'Silver Foxes', 'Blood Ravens'
];

const PLAYER_NAMES = [
    'DragonSlayer', 'NightKing', 'StormBorn', 'IronFist', 'DarkLord',
    'ShadowMage', 'WarChief', 'BloodRaven', 'FireBreath', 'GoldHunter',
    'SteelHeart', 'FrostBite', 'ThunderBolt', 'SkullCrusher', 'WolfPack',
    'BattleAxe', 'DeathBringer', 'RuneKnight', 'SilverFang', 'CrimsonKing'
];

// ============================================================
// GAME STATE
// ============================================================

let state = {
    resources: { coins: 1200, gold: 200, iron: 250, wood: 450, food: 350 }, // enough to comfortably afford the whole tutorial (lumber mill + barracks + first troop)
    maxResources: { coins: 2000, gold: 1000, iron: 1000, wood: 1000, food: 1000 },
    buildings: [],
    troops: { warrior: 0, archer: 0, shieldbearer: 0, cavalry: 0, siege: 0 },
    level: 1,
    xp: 0,
    xpNeeded: 100,
    trophies: 0,
    playerName: 'Commander',
    club: null,
    clubWar: null,
    battleLog: [],
    timers: [],
    lastTick: Date.now(),
    raidCooldown: 0,
    attackCooldownEnd: 0,
    heroes: {},
    equippedHeroes: [],
    research: { completed: {} },
    territoryTiles: 60 // initial buildable area
};

// ---------- RESEARCH HELPERS ----------
function isResearched(id) { return !!(state.research && state.research.completed && state.research.completed[id]); }

function getMaxResearchableLab() {
    const lab = getBuilding('researchlab');
    return lab ? lab.level : 0;
}

function getResearchProdMult(resource) {
    let mult = 1;
    for (const id of Object.keys(state.research.completed || {})) {
        const eff = RESEARCH_NODES[id]?.effect?.prodMult;
        if (eff && eff[resource]) mult *= eff[resource];
    }
    return mult;
}

function getResearchTroopBoost(troopType) {
    const out = { hp: 1, atk: 1, def: 1 };
    for (const id of Object.keys(state.research.completed || {})) {
        const tb = RESEARCH_NODES[id]?.effect?.troopBoost;
        if (!tb) continue;
        const slots = [tb.all, tb[troopType]].filter(Boolean);
        for (const s of slots) {
            if (s.hp) out.hp *= s.hp;
            if (s.atk) out.atk *= s.atk;
            if (s.def) out.def *= s.def;
        }
    }
    return out;
}

function isTroopUnlocked(troopType) {
    const def = TROOP_DEFS[troopType];
    if (!def) return false;
    if (!def.requiresResearch) return true;
    return isResearched(def.requiresResearch);
}

function buyResearch(id) {
    const node = RESEARCH_NODES[id];
    if (!node) return;
    if (isResearched(id)) { toast('Already researched.', 'info'); return; }
    if (getMaxResearchableLab() < node.reqLab) { toast(`Requires Research Lab Lv${node.reqLab}`, 'error'); return; }
    if (node.requires && !isResearched(node.requires)) { toast(`Requires: ${RESEARCH_NODES[node.requires].name}`, 'error'); return; }
    if (!canAfford(node.cost)) { toast('Not enough resources!', 'error'); return; }
    spendResources(node.cost);
    state.research.completed[id] = Date.now();
    // Apply territory expansion → raises your land cap
    if (node.effect.expand) {
        ensureLand();
        state.landBonus = (state.landBonus || 0) + (node.effect.expand === 999 ? MAP_TILES : node.effect.expand);
    }
    try { Audio.upgrade(); confetti(30); sparkleBurst(window.innerWidth/2, window.innerHeight/2, 20); } catch(e) {}
    toast(`Research complete: ${node.name}!`, 'success');
    renderResearchView();
    updateResources();
    saveGame();
    updateNotificationBadges();
}

// ---------- TERRITORY (explicit owned tiles, buyable & level-gated) ----------
const MAP_W = 14, MAP_H = 10, MAP_TILES = MAP_W * MAP_H;

function ensureLand() {
    if (!Array.isArray(state.ownedTiles) || state.ownedTiles.length === 0) {
        // Seed a centered starter block (~28 tiles)
        const cx = 7, cy = 5;
        const cand = [];
        for (let gy = 0; gy < MAP_H; gy++)
            for (let gx = 0; gx < MAP_W; gx++)
                cand.push({ pos: gx + gy * MAP_W, d: Math.abs(gx - cx) + Math.abs(gy - cy) });
        cand.sort((a, b) => a.d - b.d);
        state.ownedTiles = cand.slice(0, 28).map(c => c.pos);
    }
    if (state.landBonus == null) state.landBonus = (state.territoryTiles ? Math.max(0, state.territoryTiles - 60) : 0);
    // Never leave a building stranded on wild land (covers older saves & central start)
    if (Array.isArray(state.buildings)) {
        const set = new Set(state.ownedTiles);
        for (const b of state.buildings) if (!set.has(b.pos)) { state.ownedTiles.push(b.pos); set.add(b.pos); }
    }
}

function ownedSet() { ensureLand(); return new Set(state.ownedTiles); }
function getOwnedTiles() { return ownedSet(); }          // kept for world.js fog
function isTileOwned(pos) { return ownedSet().has(pos); }

// Max land you can OWN — rises as you level up (and via research bonus)
function landCap() {
    ensureLand();
    return Math.min(MAP_TILES, 34 + (state.level - 1) * 4 + (state.landBonus || 0));
}

// Price of the next tile — escalates as you expand
function landPrice() {
    ensureLand();
    const extra = Math.max(0, state.ownedTiles.length - 28);
    return { coins: roundCost(400 * Math.pow(1.35, extra)) };
}

function landAdjacent(pos) {
    const set = ownedSet();
    const gx = pos % MAP_W, gy = Math.floor(pos / MAP_W);
    const nb = [];
    if (gx > 0) nb.push(pos - 1);
    if (gx < MAP_W - 1) nb.push(pos + 1);
    if (gy > 0) nb.push(pos - MAP_W);
    if (gy < MAP_H - 1) nb.push(pos + MAP_W);
    return nb.some(p => set.has(p));
}

// Tiles you may currently BUY (locked, adjacent to owned, under the level cap)
function buyableTiles() {
    ensureLand();
    if (state.ownedTiles.length >= landCap()) return new Set();
    const set = ownedSet();
    const out = new Set();
    for (let pos = 0; pos < MAP_TILES; pos++) {
        if (set.has(pos)) continue;
        if (landAdjacent(pos)) out.add(pos);
    }
    return out;
}

function buyLand(pos) {
    ensureLand();
    if (isTileOwned(pos)) return;
    if (!landAdjacent(pos)) { toast('You can only claim land next to your kingdom.', 'error'); return; }
    if (state.ownedTiles.length >= landCap()) {
        toast(`Land cap reached (${state.ownedTiles.length}/${landCap()}). Level up to claim more!`, 'error');
        try { Audio.error(); } catch(e) {}
        return;
    }
    const price = landPrice();
    if (!canAfford(price)) { toast(`Need ${formatNum(price.coins)} coins to claim this land.`, 'error'); return; }
    spendResources(price);
    state.ownedTiles.push(pos);
    try {
        Audio.coin();
        const grid = document.getElementById('village-grid');
        const el = grid && grid.querySelector(`.buy-tile[data-pos="${pos}"]`);
        if (el) { const r = el.getBoundingClientRect(); sparkleBurst(r.left + r.width/2, r.top + r.height/2, 14); }
    } catch(e) {}
    toast('Land claimed!', 'success');
    renderGrid();
    updateResources();
    saveGame();
}

// ---- Clear trees / rocks for resources ----
function clearDeco(key, type) {
    if (!state.clearedDecos) state.clearedDecos = [];
    const set = new Set(state.clearedDecos);
    if (set.has(key)) return;
    set.add(key);
    state.clearedDecos = [...set];
    // Reward: trees give wood (+ a few coins), rocks give iron (+ coins)
    const reward = type === 'tree' ? { wood: 120, coins: 60 } : { iron: 100, coins: 80 };
    addResources(reward);
    try {
        Audio.coin();
        const grid = document.getElementById('village-grid');
        const el = grid && grid.querySelector(`.deco-clear[data-key="${key}"]`);
        if (el) {
            const r = el.getBoundingClientRect();
            sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 12);
            lootPopups(reward, r.left + r.width / 2, r.top + r.height / 2);
        }
    } catch(e) {}
    if (typeof addGems === 'function' && Math.random() < 0.3) addGems(1 + Math.floor(Math.random() * 3));
    toast(type === 'tree' ? ' Tree cleared! +wood' : '️ Rock cleared! +iron', 'success');
    renderGrid();
    updateResources();
    saveGame();
}

function saveGame() {
    try { localStorage.setItem('villagewar_save', JSON.stringify(state)); } catch(e) {}
}

function loadGame() {
    try {
        const s = localStorage.getItem('villagewar_save');
        if (s) {
            const loaded = JSON.parse(s);
            state = { ...state, ...loaded };
            state.lastTick = Date.now();
        }
    } catch(e) {}
}

// ============================================================
// UTILITY
// ============================================================

let _lastToast = { msg: '', at: 0 };
function toast(msg, type = 'info') {
    // De-dup: the same message twice within 1.5s reads as spam, not feedback.
    const now = Date.now();
    if (msg === _lastToast.msg && now - _lastToast.at < 1500) return;
    _lastToast = { msg, at: now };
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    c.appendChild(t);
    while (c.children.length > 4) c.firstChild.remove();   // never stack a wall of toasts
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
}

function formatNum(n) {
    if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n/1000).toFixed(1) + 'K';
    return Math.floor(n).toString();
}

function canAfford(cost) {
    for (const [r, amt] of Object.entries(cost)) {
        if ((state.resources[r] || 0) < amt) return false;
    }
    return true;
}

function spendResources(cost) {
    for (const [r, amt] of Object.entries(cost)) {
        state.resources[r] -= amt;
    }
    // Feed the "Spend 1000 coins" daily quest (metric was never tracked anywhere,
    // so that quest could never be completed).
    if (cost.coins > 0 && typeof track === 'function') track('coinsSpent', cost.coins);
}

function addResources(loot) {
    for (const [r, amt] of Object.entries(loot)) {
        state.resources[r] = Math.min((state.resources[r] || 0) + amt, state.maxResources[r] || 99999);
    }
}

// Global economy knobs
const BUILD_PRICE_MULT = 2;     // prices stay high, but not so high progression stalls (was 4 — simulated to ~1 upgrade / 3h idle)
const COPY_COST_MULT = 1.7;     // each additional copy of a building costs +70%

// Round costs to clean hundreds (min 100)
function roundCost(x) { return Math.max(100, Math.round(x / 100) * 100); }

function getBuildingCost(type, level) {
    const def = BUILDING_DEFS[type];
    const cost = {};
    for (const [r, base] of Object.entries(def.baseCost)) {
        cost[r] = roundCost(base * BUILD_PRICE_MULT * Math.pow(def.costMult, level - 1));
    }
    return cost;
}

// Cost to place a NEW building of this type — rises with how many you already own.
function getPlaceCost(type) {
    const def = BUILDING_DEFS[type];
    const count = getBuildingCount(type);
    const cost = {};
    for (const [r, base] of Object.entries(def.baseCost)) {
        cost[r] = roundCost(base * BUILD_PRICE_MULT * Math.pow(COPY_COST_MULT, count));
    }
    return cost;
}

function getBuildingCount(type) {
    return state.buildings.filter(b => b.type === type).length;
}

// Town Hall level needed to build the NEXT copy of a building (given current count).
// Town Hall, Research Lab, Fortress = unique (one only). Barracks/Stable unlock
// additional copies at later levels; mines/walls/etc. stay freely buildable.
function nextCopyReqTH(type) {
    const def = BUILDING_DEFS[type];
    const count = getBuildingCount(type);
    if (def.unique) return count >= 1 ? Infinity : (def.reqTH || 1);
    if (type === 'barracks') return 1 + count * 2;   // 1st @TH1, 2nd @TH3, 3rd @TH5...
    if (type === 'stable')   return 3 + count * 2;   // 1st @TH3, 2nd @TH5, 3rd @TH7...
    return def.reqTH || 1;                            // unlimited copies, base requirement
}

function getBuilding(type) {
    return state.buildings.find(b => b.type === type);
}

function getTHLevel() {
    const th = getBuilding('townhall');
    return th ? th.level : 0;
}

function getTotalDefense() {
    let def = 0;
    for (const b of state.buildings) {
        const d = BUILDING_DEFS[b.type];
        if (d.defense) def += d.defense * Math.pow(d.defMult || 1, b.level - 1);
    }
    const fort = getBuilding('fortress');
    if (fort) def *= (1 + BUILDING_DEFS.fortress.defenseBoost * fort.level);
    return Math.floor(def);
}

function getTroopCapacity() {
    let cap = 10;
    for (const b of state.buildings) {
        const d = BUILDING_DEFS[b.type];
        if (d.troopCapacity) cap += Math.floor(d.troopCapacity * Math.pow(d.capMult || 1, b.level - 1));
    }
    return cap;
}

// ============================================================
// INDIVIDUAL SOLDIERS (persistent units, permadeath, Army/Patrol)
// ============================================================
const FORMATION_COLS = 8;
const FORMATION_ROWS = 5;
const FORMATION_CELLS = FORMATION_COLS * FORMATION_ROWS;

function ensureSoldiers() {
    if (!state.soldiers) {
        // Migrate from legacy count-based troops
        state.soldiers = [];
        state._sidCounter = 0;
        if (state.troops) {
            for (const [type, count] of Object.entries(state.troops)) {
                for (let i = 0; i < count; i++) addSoldier(type, i < 12 ? 'army' : 'reserve');
            }
        }
        // Auto-place migrated army soldiers
        autoFillFormation('army');
    }
    if (state._sidCounter == null) state._sidCounter = state.soldiers.reduce((m, s) => Math.max(m, s.id), 0);
    // Veteran migration: name any soldier from an older save and backfill fields.
    ensureMorale();
    for (const s of state.soldiers) {
        if (!s.name) s.name = genSoldierName();
        if (s.kills == null) s.kills = 0;
        if (s.raids == null) s.raids = 0;
        if (s.trait === undefined) s.trait = null;
    }
}

function addSoldier(type, assignment = 'reserve') {
    const def = TROOP_DEFS[type];
    state._sidCounter = (state._sidCounter || 0) + 1;
    const s = { id: state._sidCounter, type, assignment, cell: null,
                name: genSoldierName(), kills: 0, raids: 0, trait: null, born: Date.now() };
    state.soldiers.push(s);
    return s;
}

// ============================================================
// VETERANS & THE MEMORIAL ISLE
// Every soldier has a name, earns ranks by surviving raids, and
// rolls a trait at Veteran. Permadeath already exists — this makes
// each death a story: the fallen are buried on the island's shore.
// ============================================================
const VET_FIRST = ['Aldric','Berta','Cedric','Dunstan','Edda','Falk','Gerd','Hilda','Ivo','Jorunn',
    'Kettil','Leif','Maud','Nils','Osric','Petra','Quen','Rurik','Sigrid','Tove',
    'Ulf','Vera','Wilm','Ysolt','Znorre','Ansel','Brigid','Corin','Dagny','Ebba'];
const VET_LAST = ['Oakhelm','Stonebrook','Ashford','Winterborn','Saltmane','Thornwood','Ironside','Greymoor',
    'Harrowgate','Foxglove','Blackwater','Elderberry','Frostbeard','Mossbank','Ravenhill','Shieldwright',
    'Tidewalker','Understone','Wolfsbane','Yarrow'];
function genSoldierName() {
    const f = VET_FIRST[Math.floor(Math.random() * VET_FIRST.length)];
    const l = VET_LAST[Math.floor(Math.random() * VET_LAST.length)];
    const name = `${f} ${l}`;
    // duplicate among the living? append a numeral
    const dupes = (state.soldiers || []).filter(s => s.name === name || (s.name || '').startsWith(name + ' ')).length;
    return dupes ? `${name} ${['II','III','IV','V','VI'][Math.min(dupes - 1, 4)]}` : name;
}

const VET_RANKS = [
    { raids: 0,  name: 'Recruit', pips: 0 },
    { raids: 1,  name: 'Regular', pips: 1 },
    { raids: 3,  name: 'Veteran', pips: 2 },
    { raids: 7,  name: 'Elite',   pips: 3 },
    { raids: 15, name: 'Legend',  pips: 4 }
];
function rankOf(s) {
    let r = VET_RANKS[0];
    for (const rk of VET_RANKS) if ((s.raids || 0) >= rk.raids) r = rk;
    return r;
}
function rankIndex(s) { return VET_RANKS.indexOf(rankOf(s)); }
// +6% HP/ATK per rank above Recruit (max +24% at Legend)
function vetStatMult(s) { return 1 + 0.06 * rankIndex(s); }

const VET_TRAITS = {
    shieldwall: { name: 'Shieldwall', desc: '-15% damage taken' },
    deadeye:    { name: 'Deadeye',    desc: '+25% damage to defenses' },
    fleetfoot:  { name: 'Fleetfoot',  desc: '+20% move speed' },
    unbroken:   { name: 'Unbroken',   desc: 'Survives the first killing blow each battle at 1 HP' },
    plunderer:  { name: 'Plunderer',  desc: '+4% raid loot while they live (stacks to +12%)' }
};
function rollTrait() {
    const keys = Object.keys(VET_TRAITS);
    return keys[Math.floor(Math.random() * keys.length)];
}

// ---- Morale: a story dial (0..100), gentle ±8% ATK swing ----
function ensureMorale() {
    if (typeof state.morale !== 'number') state.morale = 70;
    if (!Array.isArray(state.memorial)) state.memorial = [];
}
function moraleAtkMult() { ensureMorale(); return 1 + ((state.morale - 50) / 50) * 0.08; }
function moraleWord() {
    ensureMorale();
    const m = state.morale;
    return m >= 85 ? 'Fervent' : m >= 65 ? 'Steady' : m >= 45 ? 'Uneasy' : m >= 25 ? 'Grim' : 'Broken';
}
function adjustMorale(delta) {
    ensureMorale();
    state.morale = Math.max(0, Math.min(100, state.morale + delta));
}

// Record fallen soldiers on the Memorial before they're removed.
function recordFallen(ids, fellTo) {
    ensureMorale();
    if (!ids || !ids.length) return [];
    const set = new Set(ids);
    const fallen = state.soldiers.filter(s => set.has(s.id));
    for (const s of fallen) {
        state.memorial.unshift({
            name: s.name || 'Unknown Soldier', type: s.type, rank: rankOf(s).name,
            kills: s.kills || 0, raids: s.raids || 0, trait: s.trait || null,
            fellTo: fellTo || 'battle', at: Date.now()
        });
        adjustMorale(rankIndex(s) >= 2 ? -6 : -2);
    }
    // Cap at 80: prune oldest non-Legends first, then oldest.
    while (state.memorial.length > 80) {
        let idx = -1;
        for (let i = state.memorial.length - 1; i >= 0; i--) {
            if (state.memorial[i].rank !== 'Legend') { idx = i; break; }
        }
        state.memorial.splice(idx >= 0 ? idx : state.memorial.length - 1, 1);
    }
    return fallen;
}

function openMemorial() {
    ensureMorale();
    const unhonored = state.memorial.filter(m => !m.honored);
    const funeralCost = 100 + unhonored.filter(m => m.rank === 'Veteran' || m.rank === 'Elite' || m.rank === 'Legend').length * 50;
    const rows = state.memorial.map(m => {
        const vet = m.rank === 'Veteran' || m.rank === 'Elite' || m.rank === 'Legend';
        return `<div class="memorial-row" style="display:flex;justify-content:space-between;gap:10px;padding:7px 10px;border-bottom:1px solid var(--border);${vet ? 'color:var(--warning,#fbbf24)' : ''}">
            <span>${vet ? '⚑ ' : ''}${m.name}${m.trait && VET_TRAITS[m.trait] ? ` <i style="opacity:.8">the ${VET_TRAITS[m.trait].name}</i>` : ''}</span>
            <span style="white-space:nowrap;opacity:.85">${m.rank} · ${m.kills} kills · fell to ${m.fellTo}</span>
        </div>`;
    }).join('');
    const html = `
        <h3 class="exp-title">🕯️ The Memorial</h3>
        <p class="exp-hint">${state.memorial.length} soldier${state.memorial.length === 1 ? '' : 's'} rest on the western shore.
            Morale: <b>${moraleWord()}</b> (${state.morale}/100)</p>
        <div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:10px">${rows || '<p class="exp-hint" style="padding:10px">No fallen yet. May it stay that way.</p>'}</div>
        <div class="exp-actions">
            ${unhonored.length ? `<button class="btn btn-primary" onclick="holdFuneral()">Hold Funeral — ${funeralCost} food (+morale)</button>` : ''}
            <button class="btn" onclick="closeExpModal()">Close</button>
        </div>`;
    if (typeof expModal === 'function') expModal(html);
    else { document.getElementById('modal-content').innerHTML = html; document.getElementById('modal-overlay').classList.remove('hidden'); }
}

function holdFuneral() {
    ensureMorale();
    const unhonored = state.memorial.filter(m => !m.honored);
    if (!unhonored.length) return;
    const vets = unhonored.filter(m => m.rank === 'Veteran' || m.rank === 'Elite' || m.rank === 'Legend').length;
    const cost = 100 + vets * 50;
    if ((state.resources.food || 0) < cost) { toast(`The feast requires ${cost} food.`, 'error'); return; }
    spendResources({ food: cost });
    unhonored.forEach(m => m.honored = true);
    adjustMorale(Math.min(20, 10 + vets * 2));
    toast(`The village honors its ${unhonored.length} fallen. Morale: ${moraleWord()}.`, 'success');
    try { Audio.achievement(); sparkleBurst(window.innerWidth / 2, window.innerHeight / 2); } catch (e) {}
    updateResources(); saveGame(); openMemorial();
}

function getSoldiers(assignment) { ensureSoldiers(); return state.soldiers.filter(s => s.assignment === assignment); }
function getDeployed(assignment) { return getSoldiers(assignment).filter(s => s.cell != null); }

function soldierCounts(list) {
    const c = {};
    for (const s of list) c[s.type] = (c[s.type] || 0) + 1;
    return c;
}

// Place a soldier on a formation cell (within its assignment). Swaps if occupied.
function placeSoldier(soldierId, assignment, cell) {
    ensureSoldiers();
    const s = state.soldiers.find(x => x.id === soldierId);
    if (!s) return;
    const occupant = state.soldiers.find(x => x.assignment === assignment && x.cell === cell && x.id !== soldierId);
    if (occupant) { occupant.cell = s.cell; occupant.assignment = assignment; }
    s.assignment = assignment;
    s.cell = cell;
}

function recallSoldier(soldierId) {
    ensureSoldiers();
    const s = state.soldiers.find(x => x.id === soldierId);
    if (s) { s.assignment = 'reserve'; s.cell = null; }
}

// Fill empty formation cells with reserve soldiers automatically
function autoFillFormation(assignment) {
    ensureSoldiers();
    const taken = new Set(getSoldiers(assignment).filter(s => s.cell != null).map(s => s.cell));
    const reserves = getSoldiers('reserve');
    let cell = 0;
    for (const s of reserves) {
        while (cell < FORMATION_CELLS && taken.has(cell)) cell++;
        if (cell >= FORMATION_CELLS) break;
        s.assignment = assignment; s.cell = cell; taken.add(cell); cell++;
    }
}

// Given the soldiers that fought and a {type: lostCount} map, choose which
// specific soldiers die — front rows (lowest cell) fall first.
function pickCasualties(list, lossMap) {
    const killed = [];
    const byType = {};
    for (const s of list) (byType[s.type] = byType[s.type] || []).push(s);
    for (const arr of Object.values(byType)) {
        arr.sort((a, b) => (a.cell ?? 99) - (b.cell ?? 99)); // front first
    }
    for (const [type, lost] of Object.entries(lossMap || {})) {
        const arr = byType[type] || [];
        for (let i = 0; i < lost && i < arr.length; i++) killed.push(arr[i].id);
    }
    return killed;
}

function removeSoldiers(ids, fellTo) {
    if (!ids || !ids.length) return;
    // Every permadeath passes through here → the Memorial never misses a burial.
    recordFallen(ids, fellTo);
    const set = new Set(ids);
    state.soldiers = state.soldiers.filter(s => !set.has(s.id));
}

function getCurrentTroopSize() {
    ensureSoldiers();
    let size = 0;
    for (const s of state.soldiers) size += (TROOP_DEFS[s.type]?.size || 1);
    return size;
}

function getArmyPower(troopsOrList) {
    let power = 0;
    if (Array.isArray(troopsOrList)) {
        for (const s of troopsOrList) {
            const d = TROOP_DEFS[s.type];
            if (d) power += (d.attack + d.defense + d.hp / 10);
        }
    } else {
        for (const [type, count] of Object.entries(troopsOrList)) {
            const d = TROOP_DEFS[type];
            if (d && count > 0) power += count * (d.attack + d.defense + d.hp / 10);
        }
    }
    return Math.floor(power);
}

function addXP(amount) {
    state.xp += amount;
    while (state.xp >= state.xpNeeded) {
        state.xp -= state.xpNeeded;
        state.level++;
        state.xpNeeded = Math.floor(100 * Math.pow(1.5, state.level - 1));
        toast(`Level Up! You are now level ${state.level}!`, 'success');
        try {
            Audio.levelup();
            confetti(50, 2000);
            popup(`LEVEL ${state.level}!`, { big: true, color: '#fbbf24' });
            track('levelReached', 1);
            state.achievements && (state.achievements.metrics.levelReached = state.level);
        } catch(e) {}
    }
}

// Resource icons — coins & gold use crisp gold SVGs (emoji  renders silver)
const RES_ICONS = {
    coins: (typeof COIN_ICON !== 'undefined' ? COIN_ICON : ''),
    gold:  (typeof GOLD_ICON !== 'undefined' ? GOLD_ICON : ''),
    iron:  (typeof IRON_ICON !== 'undefined' ? IRON_ICON : 'iron'),
    wood:  (typeof WOOD_ICON !== 'undefined' ? WOOD_ICON : 'wood'),
    food:  (typeof FOOD_ICON !== 'undefined' ? FOOD_ICON : 'food')
};

function costHTML(cost, check = true) {
    return Object.entries(cost).map(([r, amt]) => {
        const cls = check && (state.resources[r] || 0) < amt ? 'cant-afford' : '';
        return `<span class="${cls}">${RES_ICONS[r] || r}${formatNum(amt)}</span>`;
    }).join('');
}

// ============================================================
// VILLAGE GRID
// ============================================================

function renderGrid() {
    const grid = document.getElementById('village-grid');
    // In true-3D mode the SVG grid is hidden and replaced by a WebGL canvas.
    // Rebuilding innerHTML would destroy the 3D host, so rebuild the 3D scene
    // instead and leave the DOM grid alone.
    if (typeof T3 !== 'undefined' && T3.active) {
        if (typeof t3Rebuild === 'function') t3Rebuild();
        return;
    }
    grid.innerHTML = renderIsoWorld();

    // Collect production on indicator click (highest priority — stop propagation)
    grid.querySelectorAll('.prod-indicator').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const pos = parseInt(el.dataset.pos);
            collectBuilding(pos);
        });
    });

    // Wire up clicks on building groups and empty tiles
    grid.querySelectorAll('.bld').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const pos = parseInt(el.dataset.pos);
            const b = state.buildings.find(b => b.pos === pos);
            if (b) showBuildingInfo(b);
        });
    });
    grid.querySelectorAll('.tile-hit, .placement-tile').forEach(el => {
        el.addEventListener('click', () => {
            const pos = parseInt(el.dataset.pos);
            startPlacement(pos);
        });
    });
    // Claimable land tiles / flags → buy
    grid.querySelectorAll('.buy-tile, .buy-flag').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            buyLand(parseInt(el.dataset.pos));
        });
    });
    // Trees / rocks → clear for resources
    grid.querySelectorAll('.deco-clear').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            clearDeco(el.dataset.key, el.dataset.type);
        });
    });
    // Construction timers → gem finish
    grid.querySelectorAll('.build-timer').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof gemFinish === 'function') gemFinish(parseInt(el.dataset.pos));
        });
    });
    // The Memorial graveyard → roll of honor
    grid.querySelectorAll('.memorial-g').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            openMemorial();
        });
    });
    // Working boats: trade ship → Harbor deals, patrol boat → review the patrol
    grid.querySelectorAll('.trade-ship').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof openHarbor === 'function') openHarbor();
        });
    });
    grid.querySelectorAll('.patrol-boat').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            switchView('army');
            if (typeof switchFormation === 'function') switchFormation('patrol');
        });
    });

    setupCameraControls(grid);
    setupBuildingTooltips(grid);
    if (typeof startVillagerWander === 'function') startVillagerWander(grid);
}

// Camera: DRAG to orbit/tilt the angle, wheel to zoom.
// Shared drag state at module scope so the window-level move/up listeners can be
// attached exactly ONCE (renderGrid re-runs this on every rebuild; re-adding
// window listeners each time leaked handlers and glitched dragging).
const _cam = { svg: null, dragging: false, sx: 0, sy: 0, startSpin: 0, startTilt: 0, moved: false };
function _camBegin(cx, cy) {
    _cam.dragging = true; _cam.moved = false;
    _cam.sx = cx; _cam.sy = cy; _cam.startSpin = VIEW.spin; _cam.startTilt = VIEW.tilt;
    if (_cam.svg) _cam.svg.style.cursor = 'grabbing';
}
function _camMove(cx, cy) {
    if (!_cam.dragging || !_cam.svg) return;
    const dx = cx - _cam.sx, dy = cy - _cam.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) _cam.moved = true;
    VIEW.spin = Math.max(-62, Math.min(62, _cam.startSpin + dx * 0.30));
    VIEW.tilt = Math.max(-8, Math.min(58, _cam.startTilt + dy * 0.28));
    applyView(_cam.svg);
}
function _camEnd() { if (_cam.dragging) { _cam.dragging = false; if (_cam.svg) _cam.svg.style.cursor = 'grab'; } }

function setupCameraControls(grid) {
    const svg = grid.querySelector('#iso-svg');
    if (!svg) return;
    _cam.svg = svg;                 // always point at the current (freshly rebuilt) svg
    _cam.dragging = false;
    const beginDrag = _camBegin, moveDrag = _camMove, endDrag = _camEnd;

    svg.style.cursor = 'grab';
    svg.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        // Don't start an angle-drag when interacting with a building / tile / flag
        if (e.target.closest('.bld, .prod-indicator, .buy-tile, .buy-flag')) return;
        beginDrag(e.clientX, e.clientY);
    });
    // Window-level move/up wired ONCE for the whole session (they read _cam).
    if (!window._camWindowWired) {
        window._camWindowWired = true;
        window.addEventListener('mousemove', (e) => _camMove(e.clientX, e.clientY));
        window.addEventListener('mouseup', _camEnd);
    }

    svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.12 : 0.9;
        CAM.zoom = Math.max(CAM.minZoom, Math.min(CAM.maxZoom, CAM.zoom * factor));
        applyCamera(svg);
    }, { passive: false });

    // Touch: 1-finger drag = angle, 2-finger pinch = zoom
    let touch = null;
    svg.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { beginDrag(e.touches[0].clientX, e.touches[0].clientY); touch = 'rot'; }
        else if (e.touches.length === 2) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            touch = { pinch: d, zoom: CAM.zoom };
        }
    }, { passive: true });
    svg.addEventListener('touchmove', (e) => {
        if (touch === 'rot' && e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        else if (touch && touch.pinch && e.touches.length === 2) {
            const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            CAM.zoom = Math.max(CAM.minZoom, Math.min(CAM.maxZoom, touch.zoom * (d / touch.pinch)));
            applyCamera(svg);
        }
    }, { passive: true });
    svg.addEventListener('touchend', () => { endDrag(); touch = null; });

    // Reset-view button (added once)
    let resetBtn = document.getElementById('view-reset-btn');
    if (!resetBtn) {
        resetBtn = document.createElement('button');
        resetBtn.id = 'view-reset-btn';
        resetBtn.title = 'Reset view angle';
        resetBtn.textContent = '⟳';
        document.getElementById('view-village').appendChild(resetBtn);
        resetBtn.onclick = () => { VIEW.spin = 0; VIEW.tilt = 0; CAM.zoom = 1; const s = document.querySelector('#iso-svg'); if (s) { applyView(s); applyCamera(s); } };
    }

    applyView(svg);
    applyCamera(svg);
}

// Lightweight per-tick refresh of construction countdowns — updates just the
// timer text nodes in place, avoiding a full grid rebuild.
function updateBuildTimers() {
    const svg = document.getElementById('iso-svg');
    if (!svg) return;
    svg.querySelectorAll('.build-timer').forEach(g => {
        const pos = parseInt(g.dataset.pos);
        const b = state.buildings.find(x => x.pos === pos);
        if (!b) return;
        const job = b.constructing ? b.endsAt : (b.upgrading ? b.upgrading.endsAt : 0);
        if (!job) return;
        const remain = Math.max(0, Math.ceil((job - Date.now()) / 1000));
        const t = g.querySelector('.bt-remain');
        if (t) t.textContent = remain + 's';
    });
}

function applyView(svg) {
    // 3D orbit/tilt of the whole island (parent #village-grid provides perspective)
    svg.style.transform = `rotateX(${VIEW.tilt}deg) rotateZ(${VIEW.spin}deg)`;
}

function applyCamera(svg) {
    const layer = svg.querySelector('.camera-layer');
    if (layer) layer.setAttribute('transform', `translate(${CAM.x}, ${CAM.y}) scale(${CAM.zoom})`);
}

// Tooltip on building hover
function setupBuildingTooltips(grid) {
    let tip = document.getElementById('iso-tooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'iso-tooltip';
        tip.className = 'iso-tooltip hidden';
        document.body.appendChild(tip);
    }
    grid.querySelectorAll('.bld').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const pos = parseInt(el.dataset.pos);
            const b = state.buildings.find(b => b.pos === pos);
            if (!b) return;
            const def = BUILDING_DEFS[b.type];
            let prodLine = '';
            if (def.production) {
                const prod = Object.entries(def.production).map(([r, base]) => {
                    const rate = Math.floor(base * Math.pow(def.prodMult || 1, b.level - 1));
                    return `${RES_ICONS[r]||r}${rate}/min`;
                }).join(' · ');
                prodLine = `<div class="tip-prod">${prod}</div>`;
            }
            tip.innerHTML = `
                <div class="tip-title">${def.name} <span class="tip-level">Lv${b.level}</span></div>
                <div class="tip-desc">${def.desc}</div>
                ${prodLine}
                <div class="tip-hint">Click to manage</div>
            `;
            tip.classList.remove('hidden');
        });
        el.addEventListener('mousemove', (e) => {
            tip.style.left = Math.min(e.clientX + 14, window.innerWidth - 240) + 'px';
            tip.style.top = Math.min(e.clientY + 14, window.innerHeight - 120) + 'px';
        });
        el.addEventListener('mouseleave', () => tip.classList.add('hidden'));
    });
}

let placingBuilding = null;

function startPlacement(pos) {
    if (placingBuilding) {
        placeBuilding(placingBuilding, pos);
        placingBuilding = null;
    }
}

// ---- Multi-tile footprints: big buildings occupy 2x2 ----
const FOOTPRINT_2X2 = { townhall: true, fortress: true, barracks: true };
function buildingFootprint(type, anchorPos) {
    const GW = 14;
    if (!FOOTPRINT_2X2[type]) return [anchorPos];
    const gx = anchorPos % GW, gy = Math.floor(anchorPos / GW);
    const tiles = [anchorPos];
    if (gx + 1 < GW) tiles.push(anchorPos + 1);
    if (gy + 1 < 10) tiles.push(anchorPos + GW);
    if (gx + 1 < GW && gy + 1 < 10) tiles.push(anchorPos + GW + 1);
    return tiles;
}
function tileOccupiedBy(pos) {
    for (const b of state.buildings) {
        if (buildingFootprint(b.type, b.pos).includes(pos)) return b;
    }
    return null;
}

function placeBuilding(type, pos) {
    const def = BUILDING_DEFS[type];
    const foot = buildingFootprint(type, pos);
    for (const p of foot) {
        if (tileOccupiedBy(p)) { toast(FOOTPRINT_2X2[type] ? `${def.name} needs a 2×2 space!` : 'That spot is occupied!', 'error'); return; }
        if (typeof isTileOwned === 'function' && !isTileOwned(p)) {
            toast(FOOTPRINT_2X2[type] ? `${def.name} needs a 2×2 of YOUR land!` : ' Wild territory! Claim it first.', 'error');
            return;
        }
    }
    const cost = getPlaceCost(type);
    if (!canAfford(cost)) {
        toast('Not enough resources!', 'error');
        return;
    }
    if (def.unique && getBuildingCount(type) > 0) {
        toast(`You can only have one ${def.name}!`, 'error');
        return;
    }
    const reqTH = nextCopyReqTH(type);
    if (getTHLevel() < reqTH) {
        toast(getBuildingCount(type) > 0
            ? `Build another ${def.name} at Town Hall Lv${reqTH}!`
            : `Requires Town Hall Lv${reqTH}!`, 'error');
        return;
    }
    // Need a free builder
    if (typeof freeBuilders === 'function' && freeBuilders() <= 0) {
        toast(`All ${state.builders.count} builders are busy! Finish or speed up a job ().`, 'error');
        try { Audio.error(); } catch(e) {}
        return;
    }
    spendResources(cost);
    const dur = (typeof buildDuration === 'function') ? buildDuration(type, 1) : 0;
    state.buildings.push({ type, level: 1, pos, hp: def.baseHP, justPlaced: Date.now(), constructing: dur > 0, endsAt: Date.now() + dur * 1000 });
    updateStorageCaps();
    toast(dur > 0 ? ` ${def.name} under construction (${dur}s)…` : `${def.name} built!`, 'success');
    try { Audio.place(); } catch(e) {}
    renderGrid();
    // Apply drop animation to the newly placed building
    setTimeout(() => {
        const grid = document.getElementById('village-grid');
        const el = grid?.querySelector(`.bld[data-pos="${pos}"]`);
        if (el) {
            el.classList.add('bld-drop');
            // Dust puff at landing
            try {
                const r = el.getBoundingClientRect();
                for (let i = 0; i < 8; i++) sparkleBurst(r.left + r.width/2, r.top + r.height - 8, 1);
            } catch(e) {}
        }
    }, 30);
    updateResources();
    saveGame();
}

function showBuildingInfo(building) {
    const def = BUILDING_DEFS[building.type];
    const panel = document.getElementById('building-info-panel');
    panel.classList.remove('hidden');
    const infoIcon = (typeof buildingIcon === 'function' && buildingIcon(building.type)) ? `<span class="info-ico">${buildingIcon(building.type)}</span>` : def.icon;
    document.getElementById('info-name').innerHTML = `${infoIcon} ${def.name}`;
    document.getElementById('info-level').textContent = `Level ${building.level} / ${def.maxLevel}`;
    document.getElementById('info-desc').textContent = def.desc;

    let prodText = '';
    if (def.production) {
        const prod = {};
        for (const [r, base] of Object.entries(def.production)) {
            prod[r] = Math.floor(base * Math.pow(def.prodMult || 1, building.level - 1));
        }
        prodText = 'Produces: ' + Object.entries(prod).map(([r, v]) => `${v} ${r}/min`).join(', ');
    }
    if (def.defense) {
        const dVal = Math.floor(def.defense * Math.pow(def.defMult || 1, building.level - 1));
        prodText = `Defense: ${dVal}` + (def.attack ? ` | Attack: ${Math.floor(def.attack * Math.pow(1.4, building.level - 1))}` : '');
    }
    if (def.troopCapacity) {
        prodText = `Troop Capacity: +${Math.floor(def.troopCapacity * Math.pow(def.capMult || 1, building.level - 1))}`;
    }
    if (def.storageBonus) {
        prodText = `Storage Bonus: +${def.storageBonus * building.level} per resource`;
    }
    document.getElementById('info-production').textContent = prodText;

    const upgradeDiv = document.getElementById('info-upgrade');
    if (building.level < def.maxLevel) {
        const cost = getBuildingCost(building.type, building.level + 1);
        const nextLvl = building.level + 1;
        const reqLevel = thUpgradeReqLevel(building.type, nextLvl); // 0 if no gate
        const levelLocked = reqLevel > 0 && state.level < reqLevel;
        const thBlockers = building.type === 'townhall' ? townHallUpgradeBlockers(building.level) : [];
        const buildLocked = thBlockers.length > 0;
        const locked = levelLocked || buildLocked;
        const serviceBtn = building.type === 'harbor'
            ? `<button class="btn btn-gold btn-glow" style="width:100%" onclick="openHarbor()">${svgIcon('boat')} Enter the Harbor</button>` : '';
        upgradeDiv.innerHTML = `
            ${serviceBtn}
            <div style="margin-top:0.5rem">
                <p style="font-size:0.8rem;margin-bottom:4px">Upgrade to Lv${nextLvl}:</p>
                <div class="card-cost">${costHTML(cost)}</div>
                ${locked
                    ? `<button class="btn btn-locked" style="margin-top:8px" disabled>${buildLocked ? 'Upgrade buildings first' : 'Reach Level ' + reqLevel}</button>`
                    : `<button class="btn btn-primary" style="margin-top:8px" ${!canAfford(cost) ? 'disabled' : ''} onclick="upgradeBuilding(${building.pos})">Upgrade</button>`}
                ${buildLocked ? `<div class="th-prereq">
                    <p style="font-size:0.74rem;color:var(--gold);margin-top:8px;font-weight:700">Bring these to Lv${building.level} first:</p>
                    <ul style="margin:4px 0 0;padding-left:16px;font-size:0.72rem;color:var(--text2)">${thBlockers.map(b => `<li>${b.name} — Lv${b.have} / ${building.level}</li>`).join('')}</ul>
                </div>` : ''}
                ${(levelLocked && !buildLocked) ? `<p style="font-size:0.72rem;color:var(--danger);margin-top:6px">The Town Hall can only be upgraded once you reach player Level ${reqLevel}.</p>` : ''}
                <button class="btn btn-danger" style="margin-top:8px" onclick="demolishBuilding(${building.pos})">Demolish</button>
            </div>
        `;
    } else {
        const svcMax = building.type === 'harbor'
            ? `<button class="btn btn-gold btn-glow" style="width:100%" onclick="openHarbor()">${svgIcon('boat')} Enter the Harbor</button>` : '';
        upgradeDiv.innerHTML = svcMax + '<p style="color:var(--gold);margin-top:0.5rem">MAX LEVEL</p><button class="btn btn-danger" style="margin-top:8px" onclick="demolishBuilding(' + building.pos + ')">Demolish</button>';
    }
}

// Player-level requirement to upgrade certain buildings. Town Hall to level L
// requires player level L (so the first upgrade, to Lv2, needs player Level 2).
function thUpgradeReqLevel(type, targetLevel) {
    if (type === 'townhall') return targetLevel; // Lv2 needs L2, Lv3 needs L3, ...
    return 0;
}

// Essential buildings whose level must keep pace with the Town Hall. Before the
// Town Hall can go from Lv N to Lv N+1, every one of these that you own must
// already be at least Lv N — so you can't rush the Town Hall without first
// developing the village around it. (Buildings you don't own yet don't block.)
const TH_PREREQ_TYPES = ['goldmine', 'ironmine', 'lumbermill', 'farm', 'coinmint', 'barracks'];
function townHallUpgradeBlockers(currentLevel) {
    const blockers = [];
    for (const type of TH_PREREQ_TYPES) {
        const owned = state.buildings.filter(b => b.type === type);
        if (owned.length === 0) continue; // not built / not unlocked yet — don't gate on it
        const best = Math.max(...owned.map(b => b.level));
        if (best < currentLevel) blockers.push({ type, name: BUILDING_DEFS[type].name, have: best, need: currentLevel });
    }
    return blockers;
}

function upgradeBuilding(pos) {
    const building = state.buildings.find(b => b.pos === pos);
    if (!building) return;
    const def = BUILDING_DEFS[building.type];
    if (building.level >= def.maxLevel) return;
    const reqLevel = thUpgradeReqLevel(building.type, building.level + 1);
    if (reqLevel > 0 && state.level < reqLevel) {
        toast(`Reach player Level ${reqLevel} to upgrade the Town Hall!`, 'error');
        try { Audio.error(); } catch(e) {}
        return;
    }
    if (building.type === 'townhall') {
        const blockers = townHallUpgradeBlockers(building.level);
        if (blockers.length) {
            const names = blockers.map(b => `${b.name} (Lv${b.have}/${building.level})`).join(', ');
            toast(`Upgrade your essential buildings to Lv${building.level} first: ${names}`, 'error');
            try { Audio.error(); } catch(e) {}
            return;
        }
    }
    if (building.constructing || building.upgrading) { toast('Already being worked on!', 'error'); return; }
    if (typeof freeBuilders === 'function' && freeBuilders() <= 0) {
        toast(`All ${state.builders.count} builders are busy!`, 'error');
        try { Audio.error(); } catch(e) {}
        return;
    }
    const cost = getBuildingCost(building.type, building.level + 1);
    if (!canAfford(cost)) { toast('Not enough resources!', 'error'); return; }
    spendResources(cost);
    const dur = (typeof buildDuration === 'function') ? buildDuration(building.type, building.level + 1) : 0;
    if (dur > 0) {
        building.upgrading = { to: building.level + 1, endsAt: Date.now() + dur * 1000 };
        toast(` Upgrading ${def.name} to Lv${building.level + 1} (${dur}s)…`, 'info');
    } else {
        building.level++;
        building.hp = Math.floor(def.baseHP * Math.pow(1.3, building.level - 1));
        toast(`${def.name} upgraded to Lv${building.level}!`, 'success');
    }
    updateStorageCaps();
    if (typeof expOnUpgrade === 'function') expOnUpgrade();
    try { Audio.place(); sparkleBurst(window.innerWidth/2, window.innerHeight/2, 12); } catch(e) {}
    document.getElementById('building-info-panel').classList.add('hidden');
    renderGrid();
    updateResources();
    saveGame();
}

function demolishBuilding(pos) {
    const idx = state.buildings.findIndex(b => b.pos === pos);
    if (idx === -1) return;
    const building = state.buildings[idx];
    const def = BUILDING_DEFS[building.type];
    const refund = {};
    const cost = getBuildingCost(building.type, building.level);
    for (const [r, amt] of Object.entries(cost)) refund[r] = Math.floor(amt * 0.5);
    addResources(refund);
    state.buildings.splice(idx, 1);
    updateStorageCaps();
    document.getElementById('building-info-panel').classList.add('hidden');
    toast(`${def.name} demolished. 50% resources refunded.`, 'warning');
    renderGrid();
    updateResources();
    saveGame();
}

function updateStorageCaps() {
    const baseStorage = 3000;
    let bonus = 0;
    for (const b of state.buildings) {
        if (BUILDING_DEFS[b.type].storageBonus) {
            bonus += BUILDING_DEFS[b.type].storageBonus * b.level;
        }
    }
    // Quartermaster talent: +5% caps per rank. Applied here (not as a one-time
    // mutation in buyTalent) because this function recomputes caps from scratch
    // on every build/upgrade completion and on load — a one-time bump would be
    // wiped almost immediately, wasting the talent point.
    let qm = 1;
    try { if (typeof talentRank === 'function') qm = 1 + 0.05 * talentRank('quartermaster'); } catch (e) {}
    for (const r of Object.keys(state.maxResources)) {
        state.maxResources[r] = Math.round((baseStorage + bonus) * qm);
    }
}

// ============================================================
// BUILD VIEW
// ============================================================

let currentBuildCat = 'resource';

function renderBuildView() {
    const list = document.getElementById('build-list');
    list.innerHTML = '';
    // Show all buildings in this category; lock (grey out) ones whose Town Hall
    // requirement isn't met yet, with a clear "Requires Town Hall Lv X" badge.
    const entries = Object.entries(BUILDING_DEFS)
        .filter(([, def]) => def.category === currentBuildCat)
        .sort((a, b) => (a[1].reqTH || 1) - (b[1].reqTH || 1));

    for (const [type, def] of entries) {
        if (type === 'townhall') continue; // can't build a second town hall
        const count = getBuildingCount(type);
        const reqTH = nextCopyReqTH(type);            // TH level needed for the NEXT copy
        const isMaxed = reqTH === Infinity;            // unique & already built
        const locked = !isMaxed && getTHLevel() < reqTH;
        const cost = getPlaceCost(type);               // escalates with how many you own

        const affordable = canAfford(cost);
        const card = document.createElement('div');
        card.className = 'build-card' + (locked || isMaxed ? ' locked' : (!affordable ? ' unaffordable' : ''));
        card.dataset.type = type;
        const bIcon = (typeof buildingIcon === 'function' && buildingIcon(type)) ? buildingIcon(type) : def.icon;

        // Lock message: distinguish "first build" gate vs "another copy" gate
        const lockMsg = count > 0
            ? ` Build another at Town Hall Lv${reqTH}`
            : ` Requires Town Hall Lv${reqTH}`;

        card.innerHTML = `
            <div class="card-icon">${bIcon}</div>
            <h4>${def.name} ${count > 0 ? `<span style="color:var(--text2);font-size:0.8rem">(${count} built)</span>` : ''}</h4>
            <div class="card-desc">${def.desc}</div>
            ${isMaxed
                ? `<div class="build-lock built-once"> Built (one only) — upgrade from village</div>`
                : locked
                    ? `<div class="build-lock">${lockMsg}</div>`
                    : `<div class="card-cost">${costHTML(cost)}</div>`}
        `;
        if (!locked && !isMaxed) {
            if (affordable) {
                card.onclick = () => {
                    placingBuilding = type;
                    switchView('village');
                    toast('Click an empty tile to place the building', 'info');
                };
            } else {
                // Can't afford it — don't let the player enter placement mode for it.
                card.onclick = () => {
                    toast(`Not enough resources to build ${def.name}!`, 'error');
                    try { Audio.error(); } catch (e) {}
                };
            }
        }
        list.appendChild(card);
    }
}

// ============================================================
// ARMY VIEW
// ============================================================

let currentFormation = 'army';   // 'army' | 'patrol'
let selectedSoldierId = null;

function renderArmyView() {
    ensureSoldiers();
    const cap = getTroopCapacity();
    const cur = getCurrentTroopSize();
    const view = document.getElementById('view-army');
    if (!view) return;

    const armyN = getDeployed('army').length;
    const patrolN = getDeployed('patrol').length;
    const reserveN = getSoldiers('reserve').length;

    view.innerHTML = `
        <h2>️ Forces</h2>
        <div id="army-capacity">
            <span> Total ${cur}/${cap}</span>
            <div class="cap-bar"><div class="cap-fill" style="width:${Math.min(100, cur/cap*100)}%"></div></div>
            <span class="formation-power">️ ${getArmyPower(getDeployed(currentFormation))} pwr</span>
        </div>

        <div class="formation-tabs">
            <button class="formation-tab ${currentFormation==='army'?'active':''}" onclick="switchFormation('army')">
                ️ Army <span class="ft-count">${armyN}</span><small>raids</small>
            </button>
            <button class="formation-tab ${currentFormation==='patrol'?'active':''}" onclick="switchFormation('patrol')">
                ️ Patrol <span class="ft-count">${patrolN}</span><small>defends</small>
            </button>
        </div>

        <p class="formation-hint">${currentFormation === 'army'
            ? 'These soldiers go on <b>raids</b>. Click a reserve below, then click a tile to deploy. Front rows (top) fight first.'
            : 'These soldiers <b>guard your kingdom</b> from CPU attacks. Click a reserve below, then a tile to deploy.'}
            <br>️ <b>Soldiers who die in battle are gone forever.</b>
            <br>Morale: <b>${typeof moraleWord === 'function' ? moraleWord() : 'Steady'}</b>${typeof state.morale === 'number' && state.morale < 45 ? ' — the men speak of the fallen. Hold a funeral at the Memorial.' : ''}
            · Survivors earn ranks: <b>+6% HP &amp; ATK per rank</b>, a trait at Veteran.</p>

        <div class="formation-grid-wrap">
            <div class="enemy-side-label"> Enemy approaches from here </div>
            <div class="formation-grid" id="formation-grid"></div>
        </div>

        <h3 class="hero-section-title">Reserves ${reserveN > 0 ? `<span style="color:var(--text2);font-size:0.75rem">(click one, then click a tile)</span>` : ''}</h3>
        <div id="reserve-roster"></div>

        <h3 class="hero-section-title">Recruit Soldiers</h3>
        <div id="troop-list" class="card-grid"></div>
    `;

    renderFormationGrid();
    renderReserveRoster();
    renderRecruitList();
}

function switchFormation(which) {
    currentFormation = which;
    selectedSoldierId = null;
    renderArmyView();
}

function renderFormationGrid() {
    const grid = document.getElementById('formation-grid');
    if (!grid) return;
    grid.style.gridTemplateColumns = `repeat(${FORMATION_COLS}, 1fr)`;
    const deployed = {};
    for (const s of getDeployed(currentFormation)) deployed[s.cell] = s;
    let html = '';
    for (let c = 0; c < FORMATION_CELLS; c++) {
        const s = deployed[c];
        const rowFromFront = Math.floor(c / FORMATION_COLS); // 0 = front
        const frontClass = rowFromFront === 0 ? 'front-row' : '';
        if (s) {
            const def = TROOP_DEFS[s.type];
            const sel = s.id === selectedSoldierId ? 'selected' : '';
            const rk = (typeof rankOf === 'function') ? rankOf(s) : null;
            const vetTip = rk ? `${s.name} — ${rk.name}${s.trait && VET_TRAITS[s.trait] ? ` (${VET_TRAITS[s.trait].name})` : ''}, ${s.kills || 0} kills, ${s.raids || 0} raids · ` : '';
            html += `<div class="fcell occupied ${frontClass} ${sel}" onclick="onFormationCellClick(${c})" title="${vetTip}${def.name} — click to recall">
                <span class="fcell-ico">${(typeof charSprite==='function' ? charSprite(s.type) : def.icon)}</span>
                ${rk && rk.pips > 0 ? `<span class="fcell-pips">${'<i></i>'.repeat(rk.pips)}</span>` : ''}
            </div>`;
        } else {
            html += `<div class="fcell ${frontClass}" onclick="onFormationCellClick(${c})"></div>`;
        }
    }
    grid.innerHTML = html;
}

function onFormationCellClick(cell) {
    ensureSoldiers();
    const occupant = getDeployed(currentFormation).find(s => s.cell === cell);
    if (selectedSoldierId != null) {
        // Deploy the selected reserve soldier here
        placeSoldier(selectedSoldierId, currentFormation, cell);
        selectedSoldierId = null;
        try { Audio.place(); } catch(e) {}
        renderArmyView();
        saveGame();
    } else if (occupant) {
        // Recall the soldier to reserves
        recallSoldier(occupant.id);
        try { Audio.click(); } catch(e) {}
        renderArmyView();
        saveGame();
    }
}

function selectReserve(soldierId) {
    selectedSoldierId = (selectedSoldierId === soldierId) ? null : soldierId;
    try { Audio.click(); } catch(e) {}
    renderArmyView();
}

function renderReserveRoster() {
    const el = document.getElementById('reserve-roster');
    if (!el) return;
    const reserves = getSoldiers('reserve');
    if (reserves.length === 0) {
        el.innerHTML = '<p style="color:var(--text2)">No reserves. Recruit soldiers below, or recall some from the grid.</p>';
        return;
    }
    // Group reserves by type for a compact palette, but each click selects one individual
    const byType = {};
    for (const s of reserves) (byType[s.type] = byType[s.type] || []).push(s);
    let html = '';
    for (const [type, list] of Object.entries(byType)) {
        const def = TROOP_DEFS[type];
        const firstSel = list.find(s => s.id === selectedSoldierId);
        const sel = firstSel ? 'selected' : '';
        const pickId = firstSel ? firstSel.id : list[0].id;
        html += `
            <div class="reserve-item ${sel}" onclick="selectReserve(${pickId})">
                <span class="reserve-ico">${(typeof charSprite==='function' ? charSprite(type) : def.icon)}</span>
                <span class="reserve-count">×${list.length}</span>
                <span class="reserve-name">${def.name}</span>
                <button class="btn btn-success reserve-deploy" onclick="event.stopPropagation(); deployAllOfType('${type}')">Deploy all</button>
            </div>`;
    }
    el.innerHTML = html;
}

function deployAllOfType(type) {
    ensureSoldiers();
    const reserves = getSoldiers('reserve').filter(s => s.type === type);
    const taken = new Set(getDeployed(currentFormation).map(s => s.cell));
    let cell = 0, placed = 0;
    for (const s of reserves) {
        while (cell < FORMATION_CELLS && taken.has(cell)) cell++;
        if (cell >= FORMATION_CELLS) break;
        s.assignment = currentFormation; s.cell = cell; taken.add(cell); cell++; placed++;
    }
    if (placed) { try { Audio.place(); } catch(e) {} toast(`Deployed ${placed} to ${currentFormation}.`, 'success'); }
    else toast('Formation grid is full!', 'error');
    renderArmyView();
    saveGame();
}

function renderRecruitList() {
    const list = document.getElementById('troop-list');
    if (!list) return;
    list.innerHTML = '';
    for (const [type, def] of Object.entries(TROOP_DEFS)) {
        const reqBuilding = getBuilding(def.building);
        if (!reqBuilding) continue;
        if (reqBuilding.level < def.reqLevel) continue;
        const locked = def.requiresResearch && !isResearched(def.requiresResearch);
        const boost = getResearchTroopBoost(type);
        const dispHP = Math.floor(def.hp * boost.hp);
        const dispATK = Math.floor(def.attack * boost.atk);
        const dispDEF = Math.floor(def.defense * boost.def);
        const boostFlag = (boost.hp > 1 || boost.atk > 1 || boost.def > 1) ? ' <span class="boost-tag"></span>' : '';
        const card = document.createElement('div');
        card.className = 'troop-card' + (locked ? ' locked' : '');
        card.innerHTML = `
            <div class="card-icon">${def.icon}</div>
            <h4>${def.name}${boostFlag}</h4>
            <div class="card-desc">${def.desc}<br><small>️${dispHP} ️${dispATK} ️${dispDEF}</small></div>
            <div class="card-cost">Each: ${costHTML(def.cost)}</div>
            ${locked ? `
                <div class="train-controls"><button class="btn btn-locked" disabled style="width:100%"> ${RESEARCH_NODES[def.requiresResearch]?.name || '?'}</button></div>
            ` : `
                <div class="train-controls">
                    <input type="number" min="1" max="50" value="1" id="train-${type}">
                    <button class="btn btn-primary" onclick="trainTroops('${type}')">Recruit</button>
                </div>
            `}
        `;
        list.appendChild(card);
    }
}

function trainTroops(type) {
    const def = TROOP_DEFS[type];
    if (def.requiresResearch && !isResearched(def.requiresResearch)) {
        toast(`Unlock via Research Lab: ${RESEARCH_NODES[def.requiresResearch]?.name || def.requiresResearch}`, 'error');
        return;
    }
    const input = document.getElementById(`train-${type}`);
    const count = parseInt(input && input.value) || 1;
    const cap = getTroopCapacity();
    const cur = getCurrentTroopSize();
    const maxCanTrain = Math.floor((cap - cur) / def.size);
    if (maxCanTrain <= 0) { toast('Army is full!', 'error'); return; }
    const actual = Math.min(count, maxCanTrain);
    const totalCost = {};
    for (const [r, c] of Object.entries(def.cost)) totalCost[r] = c * actual;
    if (!canAfford(totalCost)) { toast('Not enough resources!', 'error'); return; }
    spendResources(totalCost);
    ensureSoldiers();
    for (let i = 0; i < actual; i++) addSoldier(type, 'reserve');
    if (state.troops) state.troops[type] = (state.troops[type] || 0) + actual; // keep legacy mirror
    toast(`Recruited ${actual} ${def.name}${actual > 1 ? 's' : ''}! Deploy them to Army or Patrol.`, 'success');
    try { Audio.train(); track('troopsTrained', actual); } catch(e) {}
    if (typeof expOnTrain === 'function') expOnTrain(actual);
    renderArmyView();
    updateResources();
    updateNotificationBadges();
    saveGame();
}

// ============================================================
// BATTLE SYSTEM
// ============================================================

function simulateBattle(attackerTroops, defenderTroops, defenderDefense, isPlayerAttacking = true) {
    const heroBonus = isPlayerAttacking ? getHeroBonus() : { all: { atkMult: 1, hpMult: 1, defMult: 1, critChance: 0 }, troops: {}, bonusHP: 0, bonusATK: 0, bonusDEF: 0 };
    let atkHP = heroBonus.bonusHP, atkATK = heroBonus.bonusATK;
    const atkCounts = { ...attackerTroops };
    for (const [type, count] of Object.entries(atkCounts)) {
        const d = TROOP_DEFS[type];
        if (d && count > 0) {
            const tBonus = heroBonus.troops[type] || { atkMult: 1, hpMult: 1 };
            const researchBoost = isPlayerAttacking ? getResearchTroopBoost(type) : { hp: 1, atk: 1, def: 1 };
            atkHP += count * d.hp * tBonus.hpMult * heroBonus.all.hpMult * researchBoost.hp;
            atkATK += count * d.attack * tBonus.atkMult * heroBonus.all.atkMult * researchBoost.atk;
        }
    }
    if (heroBonus.all.critChance > 0 && Math.random() < heroBonus.all.critChance) {
        atkATK *= 1.5;
    }

    const defHeroBonus = !isPlayerAttacking ? getHeroBonus() : { all: { atkMult: 1, hpMult: 1, defMult: 1, critChance: 0 }, troops: {}, bonusHP: 0, bonusATK: 0, bonusDEF: 0 };
    let defHP = defHeroBonus.bonusHP, defATK = defHeroBonus.bonusATK;
    const defCounts = { ...defenderTroops };
    for (const [type, count] of Object.entries(defCounts)) {
        const d = TROOP_DEFS[type];
        if (d && count > 0) {
            const tBonus = defHeroBonus.troops[type] || { atkMult: 1, hpMult: 1 };
            defHP += count * d.hp * tBonus.hpMult * defHeroBonus.all.hpMult;
            defATK += count * d.attack * tBonus.atkMult * defHeroBonus.all.atkMult;
        }
    }
    defHP += defenderDefense * 5 * defHeroBonus.all.defMult;
    defATK += defenderDefense * 0.5;

    const totalAtkHP = atkHP;
    const totalDefHP = defHP;
    let rounds = 0;
    while (atkHP > 0 && defHP > 0 && rounds < 50) {
        defHP -= atkATK * (0.8 + Math.random() * 0.4);
        atkHP -= defATK * (0.8 + Math.random() * 0.4);
        rounds++;
    }

    // Decide the outcome. A 50-round cap can leave BOTH armies alive (large, evenly
    // matched forces); that's a stalemate, not a free attacker win — resolve it by
    // who holds the greater share of their starting HP, and let the defender hold ties.
    let victory;
    if (defHP <= 0 && atkHP > 0) victory = true;                        // defender wiped out
    else if (atkHP <= 0 && defHP <= 0) victory = atkATK > defATK;       // mutual destruction → higher dps wins
    else if (atkHP <= 0) victory = false;                              // attacker wiped out
    else victory = (atkHP / totalAtkHP) > (defHP / totalDefHP);        // round-cap stalemate
    const atkSurvival = Math.max(0, atkHP / totalAtkHP);
    const defSurvival = Math.max(0, defHP / totalDefHP);

    const atkLosses = {};
    for (const [type, count] of Object.entries(atkCounts)) {
        if (count > 0) atkLosses[type] = Math.floor(count * (1 - atkSurvival) * (0.7 + Math.random() * 0.3));
    }
    const defLosses = {};
    for (const [type, count] of Object.entries(defCounts)) {
        if (count > 0) defLosses[type] = Math.floor(count * (1 - defSurvival) * (0.7 + Math.random() * 0.3));
    }

    return { victory, atkLosses, defLosses, atkSurvival, rounds };
}

// ============================================================
// RAID VIEW
// ============================================================

let currentRaidTab = 'cpu';
let playerTargets = [];

function generatePlayerTargets() {
    playerTargets = [];
    for (let i = 0; i < 5; i++) {
        const lvl = Math.max(1, state.level + Math.floor(Math.random() * 5) - 2);
        const power = Math.floor(50 * lvl * (0.8 + Math.random() * 0.4));
        const troops = {};
        const troopTypes = Object.keys(TROOP_DEFS);
        const numTypes = Math.min(troopTypes.length, 1 + Math.floor(lvl / 2));
        for (let j = 0; j < numTypes; j++) {
            const t = troopTypes[j];
            troops[t] = Math.floor(Math.random() * lvl * 3) + 1;
        }
        const defense = Math.floor(20 * lvl * (0.5 + Math.random() * 0.5));
        const trophies = 10 + Math.floor(lvl * 3 * (0.8 + Math.random() * 0.4));
        const loot = {
            coins: Math.floor(200 * lvl * (0.5 + Math.random())),
            gold: Math.floor(50 * lvl * (0.5 + Math.random())),
            iron: Math.floor(40 * lvl * (0.5 + Math.random())),
            wood: Math.floor(60 * lvl * (0.5 + Math.random()))
        };
        playerTargets.push({
            name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)] + (Math.random() > 0.5 ? Math.floor(Math.random() * 99) : ''),
            level: lvl,
            troops,
            defense,
            trophies,
            loot,
            icon: svgIcon('home'),
            difficulty: lvl <= state.level - 2 ? 'easy' : lvl <= state.level + 1 ? 'medium' : lvl <= state.level + 3 ? 'hard' : 'extreme'
        });
    }
}

function renderRaidView() {
    const targets = document.getElementById('raid-targets');
    targets.innerHTML = '';

    // Boss Raid lives with the other fights now (was buried in the More hub)
    const bossReady = !(state.exp && Date.now() - (state.exp.bossDoneAt || 0) < 86400000);
    const bossBanner = `
        <button class="boss-banner ${bossReady ? '' : 'done'}" onclick="openBossRaid()">
            <span class="boss-banner-ico">${svgIcon('dragon')}</span>
            <span class="boss-banner-txt"><b>Boss Raid — Warlord Grimfang</b>
            <small>${bossReady ? 'Huge loot, gems & a crate · once a day' : 'Defeated! He returns tomorrow.'}</small></span>
            <span class="boss-banner-cta">${bossReady ? 'FIGHT' : '✓'}</span>
        </button>`;

    if (state.raidCooldown > Date.now()) {
        const secs = Math.ceil((state.raidCooldown - Date.now()) / 1000);
        targets.innerHTML = bossBanner + `<div class="club-card"><p> Raid cooldown: ${secs}s remaining</p></div>`;
        return;
    }
    targets.insertAdjacentHTML('beforeend', bossBanner);

    if (currentRaidTab === 'cpu') {
        for (let i = 0; i < CPU_CAMPS.length; i++) {
            const camp = CPU_CAMPS[i];
            const locked = state.level < (camp.minLvl || 1);
            const card = document.createElement('div');
            card.className = `raid-card ${locked ? 'locked' : ''} ${camp.difficulty === 'legendary' ? 'legendary-card' : ''}`;
            card.innerHTML = `
                <span class="difficulty ${camp.difficulty}">${camp.difficulty}</span>
                <div class="raid-card-header">
                    ${campIconHTML(camp.icon)}
                    <div>
                        <h4>${camp.name}</h4>
                        <div class="raid-meta">Lv${camp.level} · Min Lv${camp.minLvl || 1}</div>
                    </div>
                </div>
                <div class="enemy-forces">${Object.entries(camp.troops).map(([t, c]) => `<span class="troop-chip"><span class="troop-chip-ico">${(typeof charSprite==='function'?charSprite(t):'')}</span>${c}</span>`).join('')}</div>
                <div class="loot-preview">${costHTML(camp.loot, false)}</div>
                <div class="xp-pill">+${camp.xp} XP</div>
                ${locked
                    ? `<button class="btn btn-locked" disabled> Unlocks at Lv${camp.minLvl}</button>`
                    : `<button class="btn btn-danger btn-glow" onclick="launchRaid('cpu', ${i})"><span class="btn-icon">️</span> Attack</button>
                       <button class="btn btn-primary" style="margin-left:6px" onclick="scoutCamp(${i})"> Scout</button>`
                }
            `;
            targets.appendChild(card);
        }
    } else {
        if (playerTargets.length === 0) generatePlayerTargets();
        for (let i = 0; i < playerTargets.length; i++) {
            const p = playerTargets[i];
            const card = document.createElement('div');
            card.className = 'raid-card';
            card.innerHTML = `
                <span class="difficulty ${p.difficulty}">${p.difficulty}</span>
                <h4>${p.icon} ${p.name} <span style="color:var(--text2);font-size:0.8rem">Lv${p.level}</span></h4>
                <div class="enemy-forces">Defense: ${p.defense} | Power: ${getArmyPower(p.troops)}</div>
                <div class="loot-preview">Loot: ${costHTML(p.loot, false)}</div>
                <div style="font-size:0.75rem;color:var(--gold);margin-bottom:0.5rem"> ${p.trophies} trophies</div>
                <button class="btn btn-danger" onclick="launchRaid('player', ${i})">️ Attack</button>
            `;
            targets.appendChild(card);
        }
        targets.innerHTML += '<div style="margin-top:0.5rem"><button class="btn btn-primary" onclick="generatePlayerTargets();renderRaidView()"> Find New Targets</button></div>';
    }
}

function launchRaid(type, index) {
    ensureSoldiers();
    const armySoldiers = getDeployed('army');
    if (armySoldiers.length === 0) {
        toast('Deploy soldiers to your ARMY formation first! (Forces tab)', 'error');
        switchView('army');
        currentFormation = 'army';
        renderArmyView();
        return;
    }

    let target, defTroops, defDef, loot, xpReward, trophyReward;
    if (type === 'cpu') {
        target = CPU_CAMPS[index];
        // LIVE DEPLOYMENT BATTLE — you command the attack in real time
        if (!tutorialActive && typeof runLiveRaid === 'function') {
            runLiveRaid({ name: target.name, level: target.level, troops: target.troops, loot: target.loot, xp: target.xp, kind: 'cpu', campIndex: index });
            return;
        }
        defTroops = { ...target.troops };
        defDef = target.level * 10;
        loot = { ...target.loot };
        xpReward = target.xp;
        trophyReward = 0;
    } else {
        target = playerTargets[index];
        // Player villages fight in the live battle too — same veteran pipeline.
        if (!tutorialActive && typeof runLiveRaid === 'function') {
            runLiveRaid({ name: target.name, level: target.level, troops: target.troops, loot: target.loot,
                          xp: Math.floor(target.level * 15), kind: 'player', trophyReward: target.trophies });
            return;
        }
        defTroops = { ...target.troops };
        defDef = target.defense;
        loot = { ...target.loot };
        xpReward = Math.floor(target.level * 15);
        trophyReward = target.trophies;
    }

    // The army that marches in = deployed army soldiers (snapshot list before deaths)
    const attackerList = armySoldiers.slice();
    const attackerCounts = soldierCounts(attackerList);

    let result = simulateBattle(attackerCounts, defTroops, defDef);

    // Tutorial guarantee: first raid during tutorial is always a flawless win
    if (tutorialActive && type === 'cpu') {
        result = { victory: true, atkLosses: {}, defLosses: defTroops, atkSurvival: 1, rounds: 3 };
        toast('Tutorial raid — guaranteed victory!', 'info');
    }

    // PERMADEATH: pick specific soldiers to kill (front rows die first)
    const killedIds = pickCasualties(attackerList, result.atkLosses);

    const logEntry = {
        time: Date.now(),
        type: 'attack',
        target: target.name,
        victory: result.victory,
        loot: {},
        losses: result.atkLosses,
        trophies: 0,
        xp: 0
    };

    if (result.victory) {
        const lootMult = 0.5 + result.atkSurvival * 0.5;
        const actualLoot = {};
        for (const [r, amt] of Object.entries(loot)) actualLoot[r] = Math.floor(amt * lootMult);
        addResources(actualLoot);
        addXP(xpReward);
        state.trophies += trophyReward;
        logEntry.loot = actualLoot;
        logEntry.trophies = trophyReward;
        logEntry.xp = xpReward;

        try { track('raidsWon'); track('totalRaidsWon'); track('coinsLooted', actualLoot.coins || 0); } catch(e) {}
        if (typeof expOnRaid === 'function') expOnRaid(true);

        if (state.club && state.clubWar) {
            state.clubWar.myScore += Math.floor(xpReward / 2) + trophyReward;
            updateClubWarScores();
        }
    } else {
        if (trophyReward > 0) {
            state.trophies = Math.max(0, state.trophies - Math.floor(trophyReward / 2));
        }
        if (typeof expOnRaid === 'function') expOnRaid(false);
    }

    state.battleLog.unshift(logEntry);
    if (state.battleLog.length > 50) state.battleLog.pop();
    state.raidCooldown = Date.now() + 45000;

    logEntry.casualtyCount = killedIds.length;

    const finishRaid = () => {
        // Apply permadeath now (after the player has watched the battle)
        removeSoldiers(killedIds, target.name);
        showBattleResult(result, target, logEntry);
        if (result.victory && Object.keys(logEntry.loot).length) {
            setTimeout(() => lootPopups(logEntry.loot, window.innerWidth/2, window.innerHeight/2 - 100), 100);
        }
        updateNotificationBadges();
        saveGame();
    };

    try {
        playBirdseyeBattle({
            attackerList, defenderCounts: defTroops, target, result, killedIds,
            isDefense: false, onDone: finishRaid
        });
    } catch(e) {
        console.error(e);
        finishRaid();
    }
    if (type === 'player') generatePlayerTargets();
    updateResources();
    saveGame();
}

function showBattleResult(result, target, logEntry) {
    const el = document.getElementById('battle-result');
    el.classList.remove('hidden');
    el.innerHTML = `
        <div class="result-inner ${result.victory ? 'victory' : 'defeat'}">
            <h2>${result.victory ? '️ VICTORY!' : ' DEFEAT!'}</h2>
            <p style="color:var(--text2);margin-bottom:1rem">Battle against ${target.name} (${result.rounds} rounds)</p>
            ${result.victory ? `
                <div class="loot-gained">
                    ${Object.entries(logEntry.loot).filter(([,v]) => v > 0).map(([r, v]) => {
                        return `<div class="loot-item">${RES_ICONS[r] || r} +${formatNum(v)}</div>`;
                    }).join('')}
                </div>
                ${logEntry.trophies > 0 ? `<p style="color:var(--gold)"> +${logEntry.trophies} trophies</p>` : ''}
                ${logEntry.xp > 0 ? `<p style="color:var(--blue)"> +${logEntry.xp} XP</p>` : ''}
            ` : `
                <p style="color:var(--danger);margin-bottom:1rem">Your army was defeated!</p>
                ${logEntry.trophies ? `<p style="color:var(--text2)"> -${Math.floor(logEntry.trophies / 2)} trophies</p>` : ''}
            `}
            <div class="losses">
                Losses: ${Object.entries(logEntry.losses).filter(([,v]) => v > 0).map(([t, v]) => `<span class="troop-chip"><span class="troop-chip-ico">${(typeof charSprite==='function'?charSprite(t):'')}</span>${v}</span>`).join(' ') || 'None'}
            </div>
            <button class="btn btn-primary" onclick="document.getElementById('battle-result').classList.add('hidden')">Continue</button>
        </div>
    `;
}

// ============================================================
// CPU ATTACKS (Defense)
// ============================================================

function cpuAttack() {
    if (state.buildings.length < 3) return;
    if (Date.now() < state.attackCooldownEnd) return;
    if (typeof hasShield === 'function' && hasShield()) return;  // ️ shield blocks attacks

    const intensity = Math.min(state.level, 10);
    const troops = {};
    const types = Object.keys(TROOP_DEFS);
    const numTypes = Math.min(types.length, 1 + Math.floor(intensity / 3));
    for (let i = 0; i < numTypes; i++) {
        troops[types[i]] = Math.floor(Math.random() * intensity * 2) + 2;
    }

    const attackerName = ['Goblin Horde', 'Bandit Raiders', 'Orc Warband', 'Dark Army', 'Dragon Cult'][Math.floor(Math.random() * 5)];
    const myDefense = getTotalDefense();

    ensureSoldiers();
    const patrolList = getDeployed('patrol');
    const patrolCounts = soldierCounts(patrolList);
    // result.victory here means the ATTACKER (cpu) won; we defend with patrol
    const result = simulateBattle(troops, patrolCounts, myDefense, false);
    const defended = !result.victory;  // we win if attacker loses

    // Permadeath among patrol soldiers
    const killedIds = pickCasualties(patrolList, result.defLosses || {});

    const logEntry = {
        time: Date.now(),
        type: 'defense',
        target: attackerName,
        victory: defended,
        loot: {},
        losses: result.defLosses || {},
        trophies: 0,
        xp: 0,
        casualtyCount: killedIds.length
    };

    if (!defended) {
        const stolenLoot = {};
        for (const r of Object.keys(state.resources)) {
            const stolen = Math.floor(state.resources[r] * (0.05 + Math.random() * 0.1));
            stolenLoot[r] = stolen;
            state.resources[r] = Math.max(0, state.resources[r] - stolen);
        }
        logEntry.loot = stolenLoot;
        if (typeof grantShield === 'function') grantShield(10);   // ️ post-attack shield
        if (typeof notifyUser === 'function') notifyUser('You were attacked!', `${attackerName} raided your village.`);
    } else {
        const xp = intensity * 10;
        addXP(xp);
        logEntry.xp = xp;
        try { track('defensesWon'); } catch(e) {}
    }

    state.battleLog.unshift(logEntry);
    if (state.battleLog.length > 50) state.battleLog.pop();
    state.attackCooldownEnd = Date.now() + 60000 + Math.random() * 120000;

    // Show alert, then play the bird's-eye defense battle
    const alert = document.getElementById('attack-alert');
    alert.classList.remove('hidden');
    document.getElementById('attack-alert-info').textContent =
        `${attackerName} attacks with ${getArmyPower(troops)} power! Your patrol: ${patrolList.length} soldiers.`;
    const watchBtn = document.getElementById('attack-watch-btn');
    const startDefense = () => {
        alert.classList.add('hidden');
        const finishDef = () => {
            removeSoldiers(killedIds, `${attackerName}'s raid`);
            try { screenShake(6, 400); } catch(e) {}
            if (defended) toast(`Defended against ${attackerName}!`, 'success');
            else toast(`${attackerName} breached your defenses!`, 'error');
            showBattleResult(
                { victory: defended, atkLosses: result.defLosses || {}, rounds: result.rounds },
                { name: attackerName }, logEntry
            );
            updateResources();
            updateNotificationBadges();
            saveGame();
        };
        try {
            // Defender's view: patrol defends (shown as "your" army), cpu attacks
            playBirdseyeBattle({
                attackerList: patrolList, defenderCounts: troops, target: { name: attackerName },
                result: { victory: defended, atkLosses: result.defLosses || {}, defLosses: troops, rounds: result.rounds },
                killedIds, isDefense: true, onDone: finishDef
            });
        } catch(e) { console.error(e); finishDef(); }
    };
    watchBtn.onclick = startDefense;
    setTimeout(() => { if (!alert.classList.contains('hidden')) startDefense(); }, 4500);

    updateResources();
    saveGame();
}

// ============================================================
// CLUB SYSTEM
// ============================================================

// War Room + Allies — clan-flavored features live WITH the clan tab now,
// not scattered across the More hub.
function clubExtrasHTML() {
    return `
        <h3 class="hero-section-title" style="margin-top:18px">War Room</h3>
        <div class="harbor-grid">
            <button class="harbor-tile" onclick="openClanWar()"><span class="harbor-ico">${svgIcon('swords')}</span><span class="harbor-name">Clan War</span><span class="harbor-desc">Best-of-5 against a rival clan</span></button>
            <button class="harbor-tile" onclick="openTournament()"><span class="harbor-ico">${svgIcon('trophy')}</span><span class="harbor-name">Tournament</span><span class="harbor-desc">Daily 8-fighter bracket</span></button>
        </div>
        <h3 class="hero-section-title">Allies</h3>
        <div class="harbor-grid">
            <button class="harbor-tile" onclick="openFriends()"><span class="harbor-ico">${svgIcon('friends')}</span><span class="harbor-name">Friends</span><span class="harbor-desc">Daily gifts & visits</span></button>
            <button class="harbor-tile" onclick="openOnline()"><span class="harbor-ico">${svgIcon('cloud')}</span><span class="harbor-name">Go Online</span><span class="harbor-desc">Real clans, chat & leaderboard</span></button>
        </div>`;
}

function renderClubView() {
    const content = document.getElementById('club-content');

    if (!state.club) {
        content.innerHTML = `
            <div class="club-card">
                <h3>Join or Create a Club</h3>
                <p style="color:var(--text2);margin-bottom:1rem">Local clubs compete against AI rivals in groups of 4 — a training league for the real thing.
                    For live clans with real players, use <b>Go Online</b> below.</p>
                <div style="margin-bottom:1rem">
                    <input id="club-name-input" placeholder="Enter club name..." style="padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);width:200px">
                    <button class="btn btn-gold" onclick="createClub()">Create Club ( 500)</button>
                </div>
                <h3>Available Clubs</h3>
                <div id="available-clubs"></div>
            </div>
        `;
        content.insertAdjacentHTML('beforeend', clubExtrasHTML());
        renderAvailableClubs();
        return;
    }

    let warHTML = '';
    if (state.clubWar) {
        const war = state.clubWar;
        const sorted = [...war.groups].sort((a, b) => b.score - a.score);
        warHTML = `
            <div class="club-war-group">
                <h4>️ Club War - ${war.name}</h4>
                <p style="font-size:0.8rem;color:var(--text2);margin-bottom:0.5rem">Compete for the best rewards! Raid to earn points.</p>
                ${sorted.map((g, i) => `
                    <div class="war-opponent ${g.isPlayer ? 'you' : ''}">
                        <span style="font-weight:700;color:${i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text2)'};min-width:24px">#${i + 1}</span>
                        <span style="flex:1;margin-left:8px">${g.name} ${g.isPlayer ? '(YOU)' : ''}</span>
                        <span style="color:var(--gold);font-weight:600">${g.score} pts</span>
                    </div>
                `).join('')}
                <div class="war-rewards">
                    <div class="reward-tier first"> 1st<br>5000 1000</div>
                    <div class="reward-tier second"> 2nd<br>3000 500</div>
                    <div class="reward-tier third"> 3rd<br>1500 200</div>
                    <div class="reward-tier fourth">4th<br>500</div>
                </div>
                <button class="btn btn-primary" style="margin-top:0.75rem" onclick="collectWarRewards()">Collect Rewards & Start New War</button>
            </div>
        `;
    } else {
        warHTML = `<button class="btn btn-gold" style="margin-bottom:1rem" onclick="startClubWar()">️ Start Club War</button>`;
    }

    content.innerHTML = `
        <div class="club-card">
            <h3>️ ${state.club.name}</h3>
            <p style="color:var(--text2)">Members: ${state.club.members.length}/20 | Total Trophies: ${state.club.members.reduce((s, m) => s + m.trophies, 0)} </p>
        </div>
        ${warHTML}
        <h3>Members</h3>
        <div class="club-card">
            ${state.club.members.sort((a, b) => b.trophies - a.trophies).map((m, i) => `
                <div class="club-member">
                    <span class="rank">#${i + 1}</span>
                    <span class="member-name">${m.name} ${m.isPlayer ? '(You)' : ''}</span>
                    <span class="member-trophies"> ${m.trophies}</span>
                </div>
            `).join('')}
        </div>
        <button class="btn btn-danger" style="margin-top:0.5rem" onclick="leaveClub()">Leave Club</button>
        ${clubExtrasHTML()}
    `;
}

function renderAvailableClubs() {
    const el = document.getElementById('available-clubs');
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 5; i++) {
        const name = CLUB_NAMES[Math.floor(Math.random() * CLUB_NAMES.length)];
        const members = 5 + Math.floor(Math.random() * 15);
        const trophies = Math.floor(Math.random() * 5000);
        el.innerHTML += `
            <div class="club-card" style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <strong>️ ${name}</strong><br>
                    <span style="font-size:0.8rem;color:var(--text2)">${members}/20 members |  ${trophies}</span>
                </div>
                <button class="btn btn-success" onclick="joinClub('${name}', ${members}, ${trophies})">Join</button>
            </div>
        `;
    }
}

function createClub() {
    const name = document.getElementById('club-name-input')?.value?.trim();
    if (!name) { toast('Enter a club name!', 'error'); return; }
    if (!canAfford({ coins: 500 })) { toast('Need 500 coins!', 'error'); return; }
    spendResources({ coins: 500 });

    const botMembers = [];
    const numBots = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numBots; i++) {
        botMembers.push({
            name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
            trophies: Math.floor(Math.random() * 500),
            isPlayer: false
        });
    }

    state.club = {
        name,
        members: [
            { name: state.playerName, trophies: state.trophies, isPlayer: true },
            ...botMembers
        ]
    };
    toast(`Created club "${name}"!`, 'success');
    renderClubView();
    updateResources();
    saveGame();
}

function joinClub(name, memberCount, trophies) {
    const botMembers = [];
    for (let i = 0; i < memberCount; i++) {
        botMembers.push({
            name: PLAYER_NAMES[Math.floor(Math.random() * PLAYER_NAMES.length)],
            trophies: Math.floor(Math.random() * (trophies / memberCount * 2)),
            isPlayer: false
        });
    }

    state.club = {
        name,
        members: [
            { name: state.playerName, trophies: state.trophies, isPlayer: true },
            ...botMembers
        ]
    };
    toast(`Joined "${name}"!`, 'success');
    renderClubView();
    saveGame();
}

function leaveClub() {
    state.club = null;
    state.clubWar = null;
    toast('Left the club.', 'warning');
    renderClubView();
    saveGame();
}

function startClubWar() {
    if (!state.club) return;
    const groups = [
        { name: state.club.name, score: 0, isPlayer: true },
        { name: CLUB_NAMES[Math.floor(Math.random() * CLUB_NAMES.length)], score: Math.floor(Math.random() * 100), isPlayer: false },
        { name: CLUB_NAMES[Math.floor(Math.random() * CLUB_NAMES.length)], score: Math.floor(Math.random() * 100), isPlayer: false },
        { name: CLUB_NAMES[Math.floor(Math.random() * CLUB_NAMES.length)], score: Math.floor(Math.random() * 100), isPlayer: false }
    ];

    state.clubWar = {
        name: `War Season ${Math.floor(Math.random() * 100)}`,
        groups,
        myScore: 0,
        startTime: Date.now()
    };
    toast('Club War started! Raid to earn points!', 'success');
    renderClubView();
    saveGame();
}

function updateClubWarScores() {
    if (!state.clubWar) return;
    for (const g of state.clubWar.groups) {
        if (g.isPlayer) {
            g.score = state.clubWar.myScore;
        } else {
            g.score += Math.floor(Math.random() * 20);
        }
    }
}

function collectWarRewards() {
    if (!state.clubWar) return;
    const sorted = [...state.clubWar.groups].sort((a, b) => b.score - a.score);
    const myRank = sorted.findIndex(g => g.isPlayer) + 1;

    const rewards = {
        1: { coins: 5000, gold: 1000 },
        2: { coins: 3000, gold: 500 },
        3: { coins: 1500, gold: 200 },
        4: { coins: 500 }
    };

    const reward = rewards[myRank] || rewards[4];
    addResources(reward);
    addXP(myRank === 1 ? 500 : myRank === 2 ? 300 : myRank === 3 ? 150 : 50);
    toast(`Club War ended! You placed #${myRank}! Rewards collected!`, 'success');
    try { if (myRank === 1) { track('clubWarsWon'); confetti(100, 3000); Audio.victory(); } } catch(e) {}
    state.clubWar = null;
    renderClubView();
    updateResources();
    saveGame();
}

// ============================================================
// RESEARCH VIEW
// ============================================================

function renderResearchView() {
    const el = document.getElementById('view-research');
    if (!el) return;
    const lab = getBuilding('researchlab');
    if (!lab) {
        el.innerHTML = `
            <h2> Research</h2>
            <div class="club-card" style="text-align:center;padding:2rem">
                <div style="font-size:3rem;margin-bottom:1rem"></div>
                <h3 style="color:var(--gold);margin-bottom:0.5rem">Build a Research Lab first!</h3>
                <p style="color:var(--text2);margin-bottom:1rem">Construct a Research Lab from the Build menu (Military tab) to unlock research that boosts production, unlocks new troops, and expands your territory.</p>
                <button class="btn btn-gold" onclick="switchView('build')">Open Build Menu</button>
            </div>
        `;
        return;
    }

    const categories = ['economy', 'military', 'territory'];
    const catTitles = { economy: ' Economy', military: '️ Military', territory: '️ Territory' };

    const buildSection = (cat) => {
        const nodes = Object.entries(RESEARCH_NODES).filter(([, n]) => n.category === cat);
        const cards = nodes.map(([id, n]) => {
            const done = isResearched(id);
            const prereqMet = !n.requires || isResearched(n.requires);
            const labOK = lab.level >= n.reqLab;
            const canBuy = !done && prereqMet && labOK && canAfford(n.cost);
            const statusClass = done ? 'researched' : !prereqMet || !labOK ? 'locked' : '';

            const effHTML = n.effect.prodMult ? Object.entries(n.effect.prodMult).map(([r, m]) => `<span class="effect-pill">+${Math.round((m - 1) * 100)}% ${r}</span>`).join('')
                : n.effect.unlockTroop ? `<span class="effect-pill effect-unlock"> Unlock ${TROOP_DEFS[n.effect.unlockTroop]?.name || n.effect.unlockTroop}</span>`
                : n.effect.troopBoost ? Object.entries(n.effect.troopBoost).map(([t, b]) => {
                    const tName = t === 'all' ? 'All troops' : TROOP_DEFS[t]?.name || t;
                    return Object.entries(b).map(([s, v]) => `<span class="effect-pill">${tName} +${Math.round((v - 1) * 100)}% ${s.toUpperCase()}</span>`).join('');
                }).join('')
                : n.effect.expand ? `<span class="effect-pill effect-unlock">️ +${n.effect.expand === 999 ? 'MAX' : n.effect.expand} tiles</span>`
                : '';

            return `
                <div class="research-card ${statusClass}">
                    <div class="research-header">
                        <strong>${n.name}</strong>
                        ${done ? '<span class="done-badge"> DONE</span>' : `<span class="lab-badge">Lab ${n.reqLab}+</span>`}
                    </div>
                    <div class="research-desc">${n.desc}</div>
                    <div class="research-effects">${effHTML}</div>
                    ${!done && n.requires ? `<div class="research-prereq">Requires: ${RESEARCH_NODES[n.requires].name}${prereqMet ? ' ' : ' '}</div>` : ''}
                    ${done ? '' : `
                        <div class="card-cost" style="margin:6px 0">${costHTML(n.cost)}</div>
                        <button class="btn ${canBuy ? 'btn-unlock' : 'btn-locked'}" ${!canBuy ? 'disabled' : ''} onclick="buyResearch('${id}')">
                            ${!labOK ? ` Lab Lv${n.reqLab}` : !prereqMet ? ' Locked' : !canAfford(n.cost) ? 'Too expensive' : ' Research'}
                        </button>
                    `}
                </div>
            `;
        }).join('');
        return `
            <h3 class="hero-section-title">${catTitles[cat]}</h3>
            <div class="research-grid">${cards}</div>
        `;
    };

    const done = Object.keys(state.research.completed || {}).length;
    const total = Object.keys(RESEARCH_NODES).length;

    el.innerHTML = `
        <h2> Research</h2>
        <div class="research-summary">
            <span>️ Lab Level <strong>${lab.level}/${BUILDING_DEFS.researchlab.maxLevel}</strong></span>
            <span> Researched <strong>${done}/${total}</strong></span>
            <span>️ Land <strong>${state.ownedTiles.length}/${landCap()}</strong> tiles (cap rises with level)</span>
        </div>
        ${categories.map(buildSection).join('')}
    `;
}

// ============================================================
// HEROES
// ============================================================

function renderHeroesView() {
    const equipDiv = document.getElementById('equipped-heroes');
    equipDiv.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const heroId = state.equippedHeroes[i];
        const slot = document.createElement('div');
        if (heroId && HERO_DEFS[heroId]) {
            const h = HERO_DEFS[heroId];
            slot.className = 'equipped-slot filled';
            slot.innerHTML = `
                ${h.portrait}
                <button class="unequip-btn" onclick="unequipHero(${i})" title="Unequip"></button>
                <div class="equipped-name">${h.name.split(' ')[0]}</div>
            `;
        } else {
            slot.className = 'equipped-slot';
            slot.innerHTML = `<div>Empty<br>Slot ${i + 1}</div>`;
        }
        equipDiv.appendChild(slot);
    }

    const roster = document.getElementById('hero-roster');
    roster.innerHTML = '';
    for (const [id, def] of Object.entries(HERO_DEFS)) {
        const owned = state.heroes[id];
        const equipped = state.equippedHeroes.includes(id);
        const canUnlock = state.level >= def.unlockLevel && canAfford(def.unlockCost);

        const card = document.createElement('div');
        card.className = `hero-card ${!owned ? 'locked' : ''} ${equipped ? 'equipped' : ''}`;
        const heroLevel = owned ? owned.level : 1;
        const stats = getHeroStats(id, heroLevel);

        card.innerHTML = `
            <div class="hero-portrait">
                ${def.portrait}
                <span class="hero-rarity-badge" style="color:${RARITY_COLORS[def.rarity]}">${def.rarity}</span>
                ${owned ? `<div class="hero-level-badge">${heroLevel}</div>` : ''}
            </div>
            <div class="hero-info">
                <div class="hero-name">${def.name}</div>
                <div class="hero-title">${def.title}</div>
                <div class="hero-stats">
                    <span>️ ${stats.hp}</span>
                    <span>️ ${stats.attack}</span>
                    <span>️ ${stats.defense}</span>
                </div>
                <div class="hero-ability">
                    <strong>${def.ability}</strong>
                    ${def.abilityDesc}
                </div>
                ${owned ? renderHeroActions(id, def, equipped, heroLevel) : ''}
            </div>
            ${!owned ? `
                <div class="lock-overlay">
                    <div class="lock-icon"></div>
                    <div class="lock-req">
                        Requires Lv${def.unlockLevel}<br>
                        ${Object.keys(def.unlockCost).length ? Object.entries(def.unlockCost).map(([r, v]) => {
                            return `${(typeof RES_ICONS!=='undefined' && RES_ICONS[r]) || r}${formatNum(v)}`;
                        }).join(' ') : 'Free'}
                    </div>
                    ${state.level < def.unlockLevel
                        ? `<button class="btn btn-locked" style="margin-top:0.75rem;pointer-events:auto" disabled>Reach Lv${def.unlockLevel}</button>`
                        : `<button class="btn btn-unlock ${canUnlock ? 'btn-glow' : ''}" style="margin-top:0.75rem;pointer-events:auto" ${!canUnlock ? 'disabled' : ''} onclick="unlockHero('${id}')"> Unlock</button>`}
                </div>
            ` : ''}
        `;
        roster.appendChild(card);
    }
}

function renderHeroActions(id, def, equipped, level) {
    const upgradeCost = { coins: 200 * level, gold: 50 * level };
    const canUpgrade = level < 10 && canAfford(upgradeCost);
    return `
        <button class="btn ${equipped ? 'btn-danger' : 'btn-success'} hero-action" onclick="${equipped ? `unequipHero(${state.equippedHeroes.indexOf(id)})` : `equipHero('${id}')`}">
            ${equipped ? 'Unequip' : 'Equip'}
        </button>
        ${level < 10 ? `<button class="btn btn-primary hero-action" style="margin-top:4px" ${!canUpgrade ? 'disabled' : ''} onclick="upgradeHero('${id}')">
            Upgrade (${formatNum(upgradeCost.coins)} ${formatNum(upgradeCost.gold)})
        </button>` : '<div style="text-align:center;color:var(--gold);font-size:0.75rem;margin-top:4px">MAX LEVEL</div>'}
    `;
}

function getHeroStats(id, level) {
    const def = HERO_DEFS[id];
    const mult = 1 + (level - 1) * 0.15;
    return {
        hp: Math.floor(def.baseStats.hp * mult),
        attack: Math.floor(def.baseStats.attack * mult),
        defense: Math.floor(def.baseStats.defense * mult)
    };
}

function unlockHero(id) {
    const def = HERO_DEFS[id];
    if (state.level < def.unlockLevel) { toast(`Reach level ${def.unlockLevel} first!`, 'error'); return; }
    if (!canAfford(def.unlockCost)) { toast('Not enough resources!', 'error'); return; }
    spendResources(def.unlockCost);
    state.heroes[id] = { level: 1 };
    toast(`Hero unlocked: ${def.name}!`, 'success');
    try { Audio.victory(); confetti(50, 2000); track('heroAction'); track('heroesUnlocked'); } catch(e) {}
    renderHeroesView();
    updateResources();
    saveGame();
}

function upgradeHero(id) {
    const hero = state.heroes[id];
    if (!hero || hero.level >= 10) return;
    const cost = { coins: 200 * hero.level, gold: 50 * hero.level };
    if (!canAfford(cost)) { toast('Not enough resources!', 'error'); return; }
    spendResources(cost);
    hero.level++;
    toast(`${HERO_DEFS[id].name} upgraded to Lv${hero.level}!`, 'success');
    try { Audio.upgrade(); track('heroAction'); } catch(e) {}
    renderHeroesView();
    updateResources();
    saveGame();
}

function equipHero(id) {
    if (state.equippedHeroes.length >= 3) {
        toast('Max 3 heroes equipped! Unequip one first.', 'error');
        return;
    }
    if (state.equippedHeroes.includes(id)) return;
    state.equippedHeroes.push(id);
    toast(`${HERO_DEFS[id].name} equipped!`, 'success');
    renderHeroesView();
    saveGame();
}

function unequipHero(slot) {
    if (slot < 0 || slot >= state.equippedHeroes.length) return;
    const id = state.equippedHeroes[slot];
    state.equippedHeroes.splice(slot, 1);
    if (id) toast(`${HERO_DEFS[id].name} unequipped.`, 'info');
    renderHeroesView();
    saveGame();
}

function getHeroBonus() {
    const bonus = { all: { atkMult: 1, hpMult: 1, defMult: 1, critChance: 0 } };
    const troopBonuses = {};
    let bonusHP = 0, bonusATK = 0, bonusDEF = 0;

    for (const id of state.equippedHeroes) {
        const hero = state.heroes[id];
        const def = HERO_DEFS[id];
        if (!hero || !def) continue;
        const stats = getHeroStats(id, hero.level);
        bonusHP += stats.hp;
        bonusATK += stats.attack;
        bonusDEF += stats.defense;

        for (const [target, mods] of Object.entries(def.bonus || {})) {
            if (target === 'all') {
                bonus.all.atkMult *= (mods.atkMult || 1);
                bonus.all.hpMult *= (mods.hpMult || 1);
                bonus.all.defMult *= (mods.defMult || 1);
                bonus.all.critChance += (mods.critChance || 0);
            } else {
                if (!troopBonuses[target]) troopBonuses[target] = { atkMult: 1, hpMult: 1, defMult: 1 };
                troopBonuses[target].atkMult *= (mods.atkMult || 1);
                troopBonuses[target].hpMult *= (mods.hpMult || 1);
                troopBonuses[target].defMult *= (mods.defMult || 1);
            }
        }
    }
    return { all: bonus.all, troops: troopBonuses, bonusHP, bonusATK, bonusDEF };
}

// ============================================================
// BATTLE LOG
// ============================================================

function renderBattleLog() {
    const el = document.getElementById('battle-log');
    if (state.battleLog.length === 0) {
        el.innerHTML = '<p style="color:var(--text2)">No battles yet. Go raid some villages!</p>';
        return;
    }
    el.innerHTML = state.battleLog.map((entry, idx) => {
        const isAttack = entry.type === 'attack';
        const icon = isAttack ? (entry.victory ? '️' : '') : (entry.victory ? '️' : '');
        const cls = isAttack ? (entry.victory ? 'victory' : 'defeat') : (entry.victory ? 'defense victory' : 'defense defeat');
        const time = new Date(entry.time);
        const timeStr = time.toLocaleTimeString();
        const stars = entry.stars != null ? ` <span class="log-stars">${svgIcon('star').repeat(entry.stars)}${svgIcon('starOutline').repeat(3 - entry.stars)}</span>` : '';
        const destr = entry.destruction != null ? ` <span style="color:var(--text2);font-size:0.78rem">${entry.destruction}%</span>` : '';

        return `
            <div class="log-entry ${cls}">
                <span class="log-icon">${icon}</span>
                <div class="log-text">
                    <strong>${isAttack ? 'Attacked' : 'Defended against'} ${entry.target}</strong>${stars}${destr}
                    <span style="color:${entry.victory ? 'var(--success)' : 'var(--danger)'}">${entry.victory ? 'Victory' : 'Defeat'}</span>
                    ${entry.victory && Object.keys(entry.loot).length > 0 ? `<div style="font-size:0.8rem;color:var(--text2)">Loot: ${Object.entries(entry.loot).filter(([,v])=>v>0).map(([r,v])=>`${r}:${formatNum(v)}`).join(', ')}</div>` : ''}
                    ${!entry.victory && entry.type === 'defense' ? `<div style="font-size:0.8rem;color:var(--danger)">Resources stolen!</div>` : ''}
                </div>
                ${entry.type === 'defense' && !entry.victory ? `<button class="btn btn-danger" style="padding:4px 12px;font-size:0.72rem" onclick="revengeRaid(${idx})"> Revenge</button>` : ''}
                <span class="log-time">${timeStr}</span>
            </div>
        `;
    }).join('');
}

// ============================================================
// UI & NAVIGATION
// ============================================================

// ============================================================
// FEATURE GATING — the game reveals itself as your Town Hall grows.
// Professional pacing: a new player sees 4 tabs, not 11.
// ============================================================
const FEATURE_GATES = {
    village: 1, build: 1, army: 1, raid: 1, log: 1,
    heroes: 2, research: 2, quests: 2,
    world: 3, more: 3,
    club: 4
};
function featureUnlocked(view) {
    return getTHLevel() >= (FEATURE_GATES[view] || 1);
}
let _gateTH = null;
function updateNavGates() {
    const th = getTHLevel();
    if (_gateTH != null && th > _gateTH) announceUnlocks(_gateTH, th);
    _gateTH = th;
    document.querySelectorAll('.nav-btn').forEach(b => {
        const v = b.dataset.view;
        const need = FEATURE_GATES[v] || 1;
        const locked = th < need;
        b.classList.toggle('nav-locked', locked);
        let tag = b.querySelector('.nav-lock');
        if (locked && !tag) {
            tag = document.createElement('span');
            tag.className = 'nav-lock';
            tag.innerHTML = svgIcon('lock');
            b.appendChild(tag);
            b.title = `Unlocks at Town Hall ${need}`;
        } else if (!locked && tag) {
            tag.remove();
            b.title = '';
        }
    });
}
function announceUnlocks(prevTH, newTH) {
    const names = { heroes: 'Heroes', research: 'Research', quests: 'the Journal', world: 'the World map', more: 'the Guild Hall extras', club: 'Clubs' };
    for (const [view, need] of Object.entries(FEATURE_GATES)) {
        if (need > prevTH && need <= newTH && names[view]) {
            toast(`🔓 Unlocked: ${names[view]}!`, 'success');
            try { Audio.achievement(); } catch (e) {}
        }
    }
}

function switchView(view) {
    if (!featureUnlocked(view)) {
        toast(`Unlocks at Town Hall ${FEATURE_GATES[view]} — keep building!`, 'info');
        return;
    }
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`view-${view}`).classList.add('active');
    document.querySelector(`.nav-btn[data-view="${view}"]`).classList.add('active');
    document.getElementById('building-info-panel').classList.add('hidden');

    if (view === 'village') renderGrid();
    else if (view === 'build') renderBuildView();
    else if (view === 'army') renderArmyView();
    else if (view === 'raid') renderRaidView();
    else if (view === 'club') renderClubView();
    else if (view === 'heroes') renderHeroesView();
    else if (view === 'research') renderResearchView();
    else if (view === 'quests') renderQuestsView();
    else if (view === 'world') renderWorldView();
    else if (view === 'more') renderMoreView();
    else if (view === 'log') renderBattleLog();
    setTimeout(updateNotificationBadges, 50);
}

function updateResources() {
    for (const r of ['coins', 'gold', 'iron', 'wood', 'food']) {
        const el = document.getElementById(`res-${r}`);
        if (el) el.textContent = formatNum(state.resources[r]);
    }
    if (typeof updateGemDisplay === 'function') updateGemDisplay();
    document.getElementById('player-level').textContent = `Level ${state.level}`;
    const xpPct = (state.xp / state.xpNeeded) * 100;
    document.getElementById('player-xp-fill').style.width = xpPct + '%';
    try {
        state.achievements && (state.achievements.metrics.maxCoinsHeld = Math.max(state.achievements.metrics.maxCoinsHeld || 0, state.resources.coins));
        state.achievements && (state.achievements.metrics.trophiesPeak = Math.max(state.achievements.metrics.trophiesPeak || 0, state.trophies));
        state.achievements && (state.achievements.metrics.troopCap = Math.max(state.achievements.metrics.troopCap || 0, getTroopCapacity()));
    } catch(e) {}
}

// ============================================================
// GAME LOOP
// ============================================================

function gameTick() {
    const now = Date.now();
    const delta = (now - state.lastTick) / 60000;
    state.lastTick = now;

    let anyReady = false;
    for (const b of state.buildings) {
        const def = BUILDING_DEFS[b.type];
        if (def.production) {
            for (const [r, base] of Object.entries(def.production)) {
                const researchMult = getResearchProdMult(r);
                const rate = base * Math.pow(def.prodMult || 1, b.level - 1) * researchMult;
                // Accumulate in collectReady (capped) — player taps to collect
                b.collectReady = Math.min((b.collectReady || 0) + rate * delta, 350 + 150 * b.level);
                if (b.collectReady >= 5) anyReady = true;
            }
        }
    }
    // Re-render iso world if any new collectables appeared/disappeared
    const visible = document.querySelector('#view-village.active');
    if (visible && anyReady && Math.random() < 0.5) {
        renderGrid();
    }

    if (state.club) {
        const me = state.club.members.find(m => m.isPlayer);
        if (me) me.trophies = state.trophies;
        for (const m of state.club.members) {
            if (!m.isPlayer) m.trophies += Math.floor(Math.random() * 2);
        }
    }

    if (state.clubWar) updateClubWarScores();

    if (Math.random() < 0.003 && Date.now() > state.attackCooldownEnd) {
        cpuAttack();
    }

    if (typeof expTick === 'function') expTick();

    updateResources();
    updateDayNight();
    if (typeof tickBuilders === 'function') {
        tickBuilders();
        // keep construction countdowns ticking on screen — update ONLY the timer
        // text, never a full grid rebuild (rebuilding mid-drag/animation glitches
        // the whole island). tickBuilders() does a full render on completion.
        if (state.buildings.some(b => b.constructing || b.upgrading) && document.querySelector('#view-village.active')) updateBuildTimers();
    }

    if (++tickCount % 30 === 0) saveGame();
}

// Day/night cycle — full cycle every 4 minutes of real time
function updateDayNight() {
    const t = (Date.now() / 1000 / 240) % 1; // 0..1 over 4 minutes
    // Sun position 0..1 (day) to 1..2 (night)
    const phase = t * 2 * Math.PI;
    const sun = (Math.sin(phase) + 1) / 2; // 0=night, 1=midday

    const bg = document.getElementById('sky-bg');
    if (bg) {
        // Day sky: bright blue, Sunset: orange, Night: deep purple
        let bgColor;
        if (sun > 0.7) bgColor = 'radial-gradient(ellipse at top, #6cb8ff 0%, #4596e6 30%, #2a6cbf 60%, #1a2e4f 100%)';
        else if (sun > 0.4) bgColor = 'radial-gradient(ellipse at top, #ffb87a 0%, #ff7a55 30%, #a04a3a 60%, #3a1a2a 100%)';
        else bgColor = 'radial-gradient(ellipse at top, #1a2e54 0%, #0e1e3a 50%, #050818 100%)';
        bg.style.background = bgColor;
    }

    // Grade the iso world by time of day — but GENTLY. This used to paint a 55%
    // navy wash at night and 35% orange at dusk, which desaturated the art into
    // mud for most of the cycle. Shipped games keep this grading subtle so the
    // colours stay vibrant; it should read as atmosphere, never as a filter.
    const overlay = document.querySelector('.day-night-overlay');
    if (overlay) {
        let tint = 'rgba(0,0,0,0)';
        if (sun < 0.4) tint = `rgba(28,42,96,${(0.18 * (0.4 - sun) / 0.4).toFixed(3)})`;
        else if (sun < 0.7) tint = `rgba(255,168,110,${(0.10 * (0.7 - sun) / 0.3).toFixed(3)})`;
        overlay.setAttribute('fill', tint);
    }
}

let tickCount = 0;

// ============================================================
// DAILY QUESTS & ACHIEVEMENTS
// ============================================================

const QUEST_POOL = [
    { id: 'raid3',   text: 'Win 3 raids',           goal: 3,  metric: 'raidsWon',     reward: { coins: 500, gold: 100 } },
    { id: 'train10', text: 'Train 10 troops',       goal: 10, metric: 'troopsTrained',reward: { coins: 400, food: 200 } },
    { id: 'build2',  text: 'Build 2 buildings',     goal: 2,  metric: 'buildingsBuilt',reward:{ coins: 600, wood: 200 } },
    { id: 'upgrade3',text: 'Upgrade 3 buildings',   goal: 3,  metric: 'buildingsUpgraded',reward:{ gold: 200, iron: 150 } },
    { id: 'spendK',  text: 'Spend 1000 coins',      goal: 1000,metric: 'coinsSpent',  reward: { gold: 300 } },
    { id: 'defend1', text: 'Successfully defend',   goal: 1,  metric: 'defensesWon',  reward: { coins: 800, iron: 300 } },
    { id: 'hero1',   text: 'Unlock or upgrade a hero', goal: 1, metric: 'heroAction', reward: { gold: 500 } },
    { id: 'looty',   text: 'Loot 5000 coins total', goal: 5000,metric: 'coinsLooted', reward: { gold: 400, iron: 300 } }
];

const ACHIEVEMENTS = [
    { id: 'first_build',  name: 'Master Builder',   icon: svgIcon('hammer'), desc: 'Build 5 buildings',          goal: 5,   metric: 'totalBuilt',    reward: { coins: 1000 } },
    { id: 'first_raid',   name: 'First Blood',      icon: svgIcon('swords'), desc: 'Win your first raid',        goal: 1,   metric: 'totalRaidsWon', reward: { gold: 200 } },
    { id: 'raid_10',      name: 'Conqueror',        icon: svgIcon('trophy'), desc: 'Win 10 raids',               goal: 10,  metric: 'totalRaidsWon', reward: { gold: 500 } },
    { id: 'raid_50',      name: 'Warlord',          icon: svgIcon('crown'), desc: 'Win 50 raids',               goal: 50,  metric: 'totalRaidsWon', reward: { gold: 2500 } },
    { id: 'hero_3',       name: 'Champion Roster',  icon: svgIcon('medal'), desc: 'Unlock 3 heroes',           goal: 3,   metric: 'heroesUnlocked',reward: { gold: 1000 } },
    { id: 'level_5',      name: 'Rising Lord',      icon: svgIcon('star'), desc: 'Reach player level 5',       goal: 5,   metric: 'levelReached',  reward: { coins: 2000, gold: 300 } },
    { id: 'level_10',     name: 'Noble Champion',   icon: svgIcon('star'), desc: 'Reach player level 10',      goal: 10,  metric: 'levelReached',  reward: { coins: 5000, gold: 1000 } },
    { id: 'level_20',     name: 'Legendary',        icon: '', desc: 'Reach player level 20',      goal: 20,  metric: 'levelReached',  reward: { coins: 20000, gold: 5000 } },
    { id: 'army_50',      name: 'Big Army',         icon: svgIcon('hammer'), desc: 'Have 50 troop capacity',     goal: 50,  metric: 'troopCap',      reward: { coins: 2000 } },
    { id: 'rich',         name: 'Wealthy',          icon: svgIcon('coins'), desc: 'Hold 10,000 coins at once',  goal: 10000,metric: 'maxCoinsHeld', reward: { gold: 500 } },
    { id: 'trophy_500',   name: 'Champion',         icon: svgIcon('medal'), desc: 'Earn 500 trophies',          goal: 500, metric: 'trophiesPeak',  reward: { gold: 1500 } },
    { id: 'club_war_win', name: 'Club Champion',    icon: svgIcon('shield'), desc: 'Win a club war (#1 place)', goal: 1,   metric: 'clubWarsWon',   reward: { coins: 10000, gold: 2000 } },
    // ---- Extended milestones ----
    { id: 'build_15',     name: 'Architect',        icon: svgIcon('hammer'), desc: 'Build 15 buildings',        goal: 15,  metric: 'totalBuilt',    reward: { coins: 4000, gold: 400 } },
    { id: 'build_30',     name: 'City Planner',     icon: svgIcon('castle'), desc: 'Build 30 buildings',        goal: 30,  metric: 'totalBuilt',    reward: { coins: 12000, gold: 1200 } },
    { id: 'raid_150',     name: 'Destroyer',        icon: svgIcon('fire'),   desc: 'Win 150 raids',             goal: 150, metric: 'totalRaidsWon', reward: { gold: 8000 } },
    { id: 'raid_500',     name: 'Scourge of Kings', icon: svgIcon('skull'),  desc: 'Win 500 raids',             goal: 500, metric: 'totalRaidsWon', reward: { gold: 30000 } },
    { id: 'level_30',     name: 'Grand Marshal',    icon: svgIcon('crown'),  desc: 'Reach player level 30',     goal: 30,  metric: 'levelReached',  reward: { coins: 50000, gold: 12000 } },
    { id: 'level_50',     name: 'Ascendant',        icon: svgIcon('crown'),  desc: 'Reach player level 50',     goal: 50,  metric: 'levelReached',  reward: { coins: 150000, gold: 40000 } },
    { id: 'army_150',     name: 'Great Host',       icon: svgIcon('swords'), desc: 'Have 150 troop capacity',   goal: 150, metric: 'troopCap',      reward: { coins: 8000, gold: 800 } },
    { id: 'army_300',     name: 'Endless Legion',   icon: svgIcon('swords'), desc: 'Have 300 troop capacity',   goal: 300, metric: 'troopCap',      reward: { coins: 25000, gold: 3000 } },
    { id: 'rich_100k',    name: 'Baron of Coin',    icon: svgIcon('coins'),  desc: 'Hold 100,000 coins at once',goal: 100000, metric: 'maxCoinsHeld',reward: { gold: 4000 } },
    { id: 'rich_1m',      name: 'Kingdom Treasury', icon: svgIcon('bank'),   desc: 'Hold 1,000,000 coins',      goal: 1000000, metric: 'maxCoinsHeld',reward: { gold: 25000 } },
    { id: 'trophy_1500',  name: 'Gladiator',        icon: svgIcon('medal'),  desc: 'Earn 1,500 trophies',       goal: 1500, metric: 'trophiesPeak', reward: { gold: 6000 } },
    { id: 'trophy_3000',  name: 'Grand Champion',   icon: svgIcon('trophy'), desc: 'Earn 3,000 trophies',       goal: 3000, metric: 'trophiesPeak', reward: { gold: 20000 } },
    { id: 'stars_15',     name: 'Campaigner',       icon: svgIcon('star'),   desc: 'Earn 15 campaign stars',    goal: 15,  metric: 'campaignStars', reward: { coins: 10000, gold: 1000 } },
    { id: 'stars_45',     name: 'War Hero',         icon: svgIcon('medal'),  desc: 'Earn 45 campaign stars',    goal: 45,  metric: 'campaignStars', reward: { coins: 40000, gold: 8000 } },
    { id: 'stars_all',    name: 'Liberator',        icon: svgIcon('crown'),  desc: 'Three-star every campaign mission', goal: 72, metric: 'campaignStars', reward: { coins: 200000, gold: 50000 } },
    { id: 'hero_all',     name: 'Legendary Roster', icon: svgIcon('medal'),  desc: 'Unlock all 6 heroes',       goal: 6,   metric: 'heroesUnlocked',reward: { gold: 8000 } }
];

function ensureQuestState() {
    if (!state.quests) state.quests = { date: null, list: [], progress: {} };
    if (!state.achievements) state.achievements = { earned: {}, metrics: {} };
    if (!state.stats) state.stats = {};
    const today = new Date().toDateString();
    if (state.quests.date !== today) {
        // Pick 3 random quests
        const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
        state.quests.date = today;
        state.quests.list = shuffled.slice(0, 3).map(q => ({ ...q, claimed: false }));
        state.quests.progress = {};
    }
}

function track(metric, amount = 1) {
    ensureQuestState();
    state.stats[metric] = (state.stats[metric] || 0) + amount;
    state.achievements.metrics[metric] = Math.max(state.achievements.metrics[metric] || 0, state.stats[metric]);

    // Quest progress
    for (const q of state.quests.list) {
        if (q.metric === metric && !q.claimed) {
            const before = state.quests.progress[q.id] || 0;
            state.quests.progress[q.id] = before + amount;
            // Only announce on the transition to ready — otherwise every further
            // action past the goal (4th raid win, 11th troop…) re-chimes until claimed.
            if (before < q.goal && state.quests.progress[q.id] >= q.goal) {
                if (typeof Audio !== 'undefined') Audio.achievement();
                toast(`Quest ready: ${q.text}!`, 'success');
            }
        }
    }

    // Achievement check (metric-specific fast path)
    awardAchievements(metric);
    updateNotificationBadges();
    saveGame();
}

// Award any not-yet-earned achievement whose metric value has reached its goal.
// Pass a metric to check only that one, or omit to check all.
function awardAchievements(onlyMetric) {
    if (!state.achievements) return;
    for (const a of ACHIEVEMENTS) {
        if (state.achievements.earned[a.id]) continue;
        if (onlyMetric && a.metric !== onlyMetric) continue;
        const val = state.achievements.metrics[a.metric] || 0;
        if (val >= a.goal) {
            state.achievements.earned[a.id] = Date.now();
            addResources(a.reward);
            if (typeof addGems === 'function') addGems(10);
            if (typeof Audio !== 'undefined') Audio.achievement();
            if (typeof confetti !== 'undefined') confetti(40, 1500);
            toast(`Achievement unlocked: ${a.name}! (+10 gems)`, 'success');
        }
    }
}

// Recompute all derived (state-based) metrics and award anything newly earned.
// Called periodically and after key events so milestones never get stuck.
function syncAchievements() {
    ensureQuestState();
    const m = state.achievements.metrics;
    m.levelReached  = Math.max(m.levelReached || 0, state.level || 0);
    m.totalBuilt    = Math.max(m.totalBuilt || 0, (state.buildings || []).length);
    m.maxCoinsHeld  = Math.max(m.maxCoinsHeld || 0, (state.resources && state.resources.coins) || 0);
    m.trophiesPeak  = Math.max(m.trophiesPeak || 0, state.trophies || 0);
    if (typeof getTroopCapacity === 'function') m.troopCap = Math.max(m.troopCap || 0, getTroopCapacity());
    // Campaign stars (stars stored per mission index, array or object)
    let stars = 0;
    if (state.campaign && state.campaign.stars) {
        for (const k in state.campaign.stars) stars += (state.campaign.stars[k] || 0);
    }
    m.campaignStars = stars;
    awardAchievements();
    updateNotificationBadges();
}

function claimQuest(id) {
    const q = state.quests.list.find(q => q.id === id);
    if (!q || q.claimed) return;
    if ((state.quests.progress[q.id] || 0) < q.goal) return;
    q.claimed = true;
    addResources(q.reward);
    if (typeof addGems === 'function') addGems(2);
    if (typeof Audio !== 'undefined') Audio.coin();
    if (typeof confetti !== 'undefined') confetti(30, 1500);
    toast(`Reward claimed!`, 'success');
    renderQuestsView();
    updateResources();
    updateNotificationBadges();
    saveGame();
}

function renderQuestsView() {
    ensureQuestState();
    const el = document.getElementById('view-quests');
    if (!el) return;
    const qList = state.quests.list.map(q => {
        const prog = Math.min(q.goal, state.quests.progress[q.id] || 0);
        const pct = (prog / q.goal) * 100;
        const ready = prog >= q.goal && !q.claimed;
        return `
            <div class="quest-card ${q.claimed ? 'claimed' : ''} ${ready ? 'ready' : ''}">
                <div class="quest-info">
                    <div class="quest-text">${q.text}</div>
                    <div class="quest-progress-bar"><div class="quest-progress-fill" style="width:${pct}%"></div></div>
                    <div class="quest-progress-text">${prog} / ${q.goal}</div>
                </div>
                <div class="quest-reward">
                    <div class="quest-reward-items">${costHTML(q.reward, false)}</div>
                    ${q.claimed
                        ? `<button class="btn btn-locked" disabled> Claimed</button>`
                        : ready
                            ? `<button class="btn btn-gold btn-glow" onclick="claimQuest('${q.id}')">CLAIM</button>`
                            : `<button class="btn btn-locked" disabled>In Progress</button>`
                    }
                </div>
            </div>
        `;
    }).join('');

    const earnedCount = Object.keys(state.achievements.earned).length;
    const aList = ACHIEVEMENTS.map(a => {
        const earned = !!state.achievements.earned[a.id];
        const val = Math.min(a.goal, state.achievements.metrics[a.metric] || 0);
        const pct = (val / a.goal) * 100;
        return `
            <div class="ach-card ${earned ? 'earned' : ''}">
                <div class="ach-icon">${a.icon}</div>
                <div class="ach-info">
                    <div class="ach-name">${a.name}</div>
                    <div class="ach-desc">${a.desc}</div>
                    <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${pct}%"></div></div>
                    <div class="ach-meta">${val} / ${a.goal} · Reward: ${costHTML(a.reward, false)}</div>
                </div>
                ${earned ? '<div class="ach-check"></div>' : ''}
            </div>
        `;
    }).join('');

    // The Journal: every goal & reward track on ONE surface —
    // daily quests + challenges (Today), the Season Pass, and Milestones.
    const streak = (state.daily && state.daily.streak) || 1;
    const chalRows = (typeof challengeRowsHTML === 'function') ? challengeRowsHTML() : '';
    const passHTML = (typeof passTrackHTML === 'function') ? passTrackHTML() : '';
    const passTier = (state.exp && state.exp.pass) ? state.exp.pass.tier + 1 : 1;
    el.innerHTML = `
        <h2>${svgIcon('scroll')} Journal</h2>
        <p class="exp-hint" style="margin-top:-6px">🔥 Login streak: <b>${streak} day${streak === 1 ? '' : 's'}</b> · everything you can earn today, in one place.</p>
        <h3 class="hero-section-title">Today <span style="font-size:0.7rem;color:var(--text2);font-weight:normal">(resets at midnight)</span></h3>
        <div class="quests-grid">${qList}</div>
        ${chalRows ? `<div class="chal-list" style="margin-top:10px">${chalRows}</div>` : ''}
        <h3 class="hero-section-title">Season Pass <span style="font-size:0.7rem;color:var(--text2);font-weight:normal">Tier ${passTier}/${typeof PASS_TIERS !== 'undefined' ? PASS_TIERS.length : 10}</span></h3>
        ${passHTML}
        <h3 class="hero-section-title">Milestones (${earnedCount}/${ACHIEVEMENTS.length})</h3>
        <div class="ach-grid">${aList}</div>
    `;
}

// ============================================================
// NOTIFICATION BADGES
// ============================================================

// ============================================================
// OBJECTIVE ADVISOR — a quiet "Next:" chip on the village view
// that always knows your best next move. First matching rule wins.
// ============================================================
function nextObjective() {
    ensureSoldiers();
    const th = getBuilding('townhall');
    const thLvl = th ? th.level : 1;
    const idleBuilder = (typeof freeBuilders === 'function') ? freeBuilders() > 0 : true;
    // 1. No troops at all → recruit
    if (!state.soldiers.length) return { text: 'Recruit your first troops', view: 'army' };
    // 2. Nothing deployed to the army formation → deploy
    if (state.soldiers.length && getDeployed('army').length === 0)
        return { text: 'Deploy soldiers to your Army formation', view: 'army' };
    // 3. Town Hall upgrade available and affordable → the big one
    if (th && th.level < BUILDING_DEFS.townhall.maxLevel && !th.upgrading) {
        const cost = getBuildingCost('townhall', th.level + 1);
        const lvlOK = state.level >= thUpgradeReqLevel('townhall', th.level + 1);
        const blockers = townHallUpgradeBlockers(th.level);
        if (lvlOK && !blockers.length && canAfford(cost) && idleBuilder)
            return { text: `Upgrade the Town Hall to Lv${th.level + 1}!`, view: 'village' };
    }
    // 4. A production building type you can build but haven't → build it
    for (const t of ['goldmine', 'lumbermill', 'farm', 'ironmine', 'coinmint', 'harbor', 'researchlab']) {
        const def = BUILDING_DEFS[t];
        if (!def || (def.reqTH || 1) > thLvl) continue;
        if (!state.buildings.some(b => b.type === t) && canAfford(getBuildingCost(t, 1)) && idleBuilder)
            return { text: `Build a ${def.name}`, view: 'build' };
    }
    // 5. Storage nearly full → spend or expand
    const nearCap = Object.keys(state.resources).filter(r => (state.resources[r] || 0) >= 0.92 * (state.maxResources[r] || 1));
    if (nearCap.length >= 2) return { text: 'Storage almost full — upgrade or spend!', view: 'build' };
    // 6. Raid ready → go fight
    if (state.raidCooldown <= Date.now() && getDeployed('army').length > 0)
        return { text: 'Your army is ready — raid a camp!', view: 'raid' };
    // 7. Idle builder + any affordable upgrade → keep builders busy
    if (idleBuilder) {
        for (const b of state.buildings) {
            const def = BUILDING_DEFS[b.type];
            if (b.level < def.maxLevel && !b.upgrading && !b.constructing && canAfford(getBuildingCost(b.type, b.level + 1)))
                return { text: `Builders are idle — upgrade your ${def.name}`, view: 'village' };
        }
    }
    // 8. Journal has claimables
    const ready = state.quests.list.some(q => !q.claimed && (state.quests.progress[q.id] || 0) >= q.goal);
    if (ready && featureUnlocked('quests')) return { text: 'Journal rewards are ready to claim!', view: 'quests' };
    return null;
}
function updateAdvisor() {
    const host = document.getElementById('view-village');
    if (!host) return;
    let chip = document.getElementById('advisor-chip');
    const obj = (state.tutorialDone || state.tutorialSeen) ? nextObjective() : null;
    if (!obj) { if (chip) chip.remove(); return; }
    if (!chip) {
        chip = document.createElement('button');
        chip.id = 'advisor-chip';
        chip.style.cssText = 'position:absolute;top:14px;left:50%;transform:translateX(-50%);z-index:30;'
            + 'display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;cursor:pointer;'
            + 'background:linear-gradient(160deg,rgba(20,30,48,0.92),rgba(14,23,38,0.95));color:#e8e2d0;'
            + 'border:1px solid rgba(244,196,77,0.55);box-shadow:0 4px 14px rgba(0,0,0,0.4);'
            + 'font-size:0.8rem;font-weight:700;backdrop-filter:blur(4px)';
        host.appendChild(chip);
    }
    if (chip.dataset.text !== obj.text) {
        chip.dataset.text = obj.text;
        chip.innerHTML = `<span style="color:#f4c44d">Next:</span> ${obj.text}`;
        chip.onclick = () => { switchView(obj.view); };
    }
}

function updateNotificationBadges() {
    ensureQuestState();
    updateNavGates();   // keep tab locks in sync with Town Hall level
    try { updateAdvisor(); } catch (e) {}
    // Quests ready to claim
    const questsReady = state.quests.list.filter(q => !q.claimed && (state.quests.progress[q.id] || 0) >= q.goal).length;
    setBadge('quests', questsReady);

    // Heroes available to unlock
    let heroAvail = 0;
    for (const [id, def] of Object.entries(HERO_DEFS)) {
        if (state.heroes[id]) continue;
        if (state.level >= def.unlockLevel && canAfford(def.unlockCost)) heroAvail++;
    }
    setBadge('heroes', heroAvail);

    // Army idle (no troops)
    ensureSoldiers();
    const reserveCount = getSoldiers('reserve').length;
    setBadge('army', reserveCount > 0 ? reserveCount : (getCurrentTroopSize() === 0 && getBuilding('barracks') ? 1 : 0));

    // Club ready
    setBadge('club', state.club && state.clubWar ? 0 : (state.club ? 1 : 0));
}

function setBadge(view, count) {
    const btn = document.querySelector(`.nav-btn[data-view="${view}"]`);
    if (!btn) return;
    let badge = btn.querySelector('.nav-badge');
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'nav-badge';
            btn.appendChild(badge);
        }
        badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) badge.remove();
}

// ============================================================
// ANIMATED BATTLE VIEWER
// ============================================================

// ============================================================
// TOP-DOWN BATTLE — bird's-eye, your trained units, projectiles, HP bars
// ============================================================

function playBirdseyeBattle({ attackerList, defenderCounts, target, result, killedIds, isDefense, onDone }) {
    const playerWon = !!result.victory;
    const killedSet = new Set(killedIds || []);
    const overlay = document.createElement('div');
    overlay.className = 'battle-viewer';

    const COLS = 8;
    const isRanged = (t) => t === 'archer' || t === 'crossbowman';

    // ---- YOUR units from the formation (bottom of the field) ----
    const mine = attackerList.slice(0, FORMATION_CELLS).map((s) => {
        const cell = s.cell != null ? s.cell : 0;
        const col = cell % FORMATION_COLS;
        const rank = Math.floor(cell / FORMATION_COLS);
        const x = 12 + (col / (FORMATION_COLS - 1)) * 76;       // 12%..88%
        const y = 62 + rank * 8;                                 // bottom half
        return { side: 'mine', id: s.id, type: s.type, x, y, ranged: isRanged(s.type), dies: killedSet.has(s.id) };
    });

    // ---- ENEMY units from counts (top of the field) ----
    const enemyTotal = Object.values(defenderCounts).reduce((a, b) => a + b, 0) || 1;
    const enemyShown = Math.min(24, Math.max(5, Math.round(enemyTotal / 3.2)));
    const enemyTypeList = [];
    for (const [type, c] of Object.entries(defenderCounts)) {
        const n = Math.max(1, Math.round((c / enemyTotal) * enemyShown));
        for (let i = 0; i < n; i++) enemyTypeList.push(type);
    }
    while (enemyTypeList.length > enemyShown) enemyTypeList.pop();
    const enemyDieFrac = playerWon ? (0.82 + Math.random() * 0.18) : (0.25 + Math.random() * 0.22);
    const enemyDieCount = Math.round(enemyTypeList.length * enemyDieFrac);
    const enemy = enemyTypeList.map((type, i) => {
        const col = i % COLS, rank = Math.floor(i / COLS);
        const x = 14 + (col / (COLS - 1)) * 72;
        const y = 34 - rank * 8;                                 // top half
        return { side: 'enemy', id: 'e' + i, type, variant: i % 4, x, y, ranged: isRanged(type), dies: i < enemyDieCount };
    });

    const unitHTML = (u) => {
        const spr = u.side === 'mine' ? topUnitSVG(u.type, false) : topUnitSVG(u.type, true, u.variant);
        const big = (u.type === 'siege' || u.type === 'catapult' || u.variant === 3) ? ' bt-big' : '';
        return `<div class="bt-unit ${u.side === 'mine' ? 'bt-mine' : 'bt-enemy'}${big} ${u.dies ? 'will-die' : ''}"
            data-uid="${u.id}" style="left:${u.x}%; top:${u.y}%; z-index:${Math.round(u.y * 3)};">
            <div class="bt-hp"><div class="bt-hpfill"></div></div>
            <div class="bt-sprite">${spr}</div>
        </div>`;
    };

    overlay.innerHTML = `
        <div class="bt-scene">
            <div class="bt-field" id="bt-field">
                <div class="bt-grass"></div>
                <div class="bt-noman"></div>
                <div class="bt-units">${enemy.map(unitHTML).join('')}${mine.map(unitHTML).join('')}</div>
                <div class="bt-fx" id="bt-fx"></div>
            </div>
            <div class="bt-banner">${isDefense ? '️ DEFENDING' : '️ RAID'} · ${target.name || target}</div>
            <div class="bt-label bt-label-top">${isDefense ? 'Invaders' : (target.name || 'Enemy')}</div>
            <div class="bt-label bt-label-bot">${isDefense ? 'Your Patrol' : 'Your Army'} · ${mine.length}</div>
            <div class="bt-status" id="bt-status">CHARGE!</div>
            <button class="bv-skip" id="bt-skip">Skip</button>
        </div>`;
    document.body.appendChild(overlay);
    const field = overlay.querySelector('#bt-field');
    const fx = overlay.querySelector('#bt-fx');

    let finished = false;
    const timers = [];
    const T = (fn, ms) => timers.push(setTimeout(fn, ms));
    try { Audio.whoosh(); } catch (e) {}

    // ---- Phase 1: advance toward the centre ----
    T(() => field.classList.add('bt-advancing'), 300);

    // ---- Ranged units fire projectiles during the approach + clash ----
    const rangedMine = mine.filter(u => u.ranged && !u.dies).concat(mine.filter(u => u.ranged && u.dies));
    const rangedEnemy = enemy.filter(u => u.ranged);
    const fireVolley = () => {
        rangedMine.slice(0, 6).forEach((u, k) => {
            const tgt = enemy[(k * 3) % enemy.length];
            if (tgt) T(() => fireArrow(fx, u.x, u.y - 4, tgt.x, tgt.y, 'arrow', false), Math.random() * 250);
        });
        rangedEnemy.slice(0, 5).forEach((u, k) => {
            const tgt = mine[(k * 3) % mine.length];
            if (tgt) T(() => fireArrow(fx, u.x, u.y + 4, tgt.x, tgt.y, 'arrow', true), Math.random() * 250);
        });
    };
    T(fireVolley, 600);
    T(fireVolley, 1150);
    T(fireVolley, 1750);

    // siege boulders
    const siegeMine = mine.filter(u => (u.type === 'siege' || u.type === 'catapult'));
    siegeMine.slice(0, 2).forEach((u, k) => T(() => {
        const tgt = enemy[(k * 5) % enemy.length] || enemy[0];
        if (tgt) fireArrow(fx, u.x, u.y, tgt.x, tgt.y, 'boulder', false);
    }, 1300 + k * 500));

    // ---- Phase 2: melee clash ----
    const COMBAT_START = 1100, COMBAT_END = 3100;
    T(() => { field.classList.add('bt-fighting'); try { Audio.attack(); screenShake(5, 220); } catch (e) {} }, COMBAT_START);
    [1400, 1900, 2400, 2850].forEach(ms => T(() => { try { Audio.attack(); } catch (e) {} btSlashes(fx); }, ms));

    // ---- HP drain + deaths ----
    const els = Array.from(field.querySelectorAll('.bt-unit'));
    els.forEach((el) => {
        const willDie = el.classList.contains('will-die');
        const fill = el.querySelector('.bt-hpfill');
        const t = COMBAT_START + 150 + Math.random() * (COMBAT_END - COMBAT_START - 350);
        const dur = t - COMBAT_START;
        if (fill) {
            fill.style.transition = `width ${dur}ms linear, background ${dur}ms linear`;
            T(() => { fill.style.width = willDie ? '0%' : (30 + Math.random() * 45) + '%'; if (willDie) fill.classList.add('low'); }, COMBAT_START + 40);
        }
        if (willDie) T(() => { el.classList.add('bt-dead'); btBlood(fx, el); }, t);
    });

    // ---- Resolve ----
    T(() => {
        const st = overlay.querySelector('#bt-status');
        st.textContent = playerWon ? ' VICTORY!' : ' DEFEAT';
        st.className = 'bt-status ' + (playerWon ? 'victory' : 'defeat');
        field.classList.remove('bt-fighting');
        field.classList.add(playerWon ? 'bt-won' : 'bt-lost');
        try { playerWon ? (Audio.victory(), confetti(70)) : Audio.defeat(); } catch (e) {}
    }, COMBAT_END + 150);

    const finish = () => {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.remove(); onDone && onDone(); }, 350);
    };
    T(finish, COMBAT_END + 1150);
    overlay.querySelector('#bt-skip').onclick = finish;
}

// Projectile flying from (x1%,y1%) to (x2%,y2%) on the fx layer
function fireArrow(fx, x1, y1, x2, y2, kind, isEnemy) {
    if (!fx) return;
    const ang = Math.atan2((y2 - y1), (x2 - x1) * 1.4) * 180 / Math.PI + 90;
    const wrap = document.createElement('div');
    wrap.className = 'bt-proj';
    wrap.style.left = x1 + '%';
    wrap.style.top = y1 + '%';
    const inner = document.createElement('div');
    inner.className = 'bt-proj-inner' + (kind === 'boulder' ? ' boulder' : '');
    inner.style.transform = `rotate(${ang}deg)`;
    inner.innerHTML = kind === 'boulder'
        ? `<div class="bt-boulder"></div>`
        : `<div class="bt-arrow" style="background:${isEnemy ? '#fca5a5' : '#fde68a'}"></div>`;
    wrap.appendChild(inner);
    fx.appendChild(wrap);
    const dur = kind === 'boulder' ? 750 : 520;
    wrap.style.transition = `left ${dur}ms linear, top ${dur}ms linear`;
    inner.style.animation = `btArc ${dur}ms ease-out`;
    requestAnimationFrame(() => { wrap.style.left = x2 + '%'; wrap.style.top = y2 + '%'; });
    setTimeout(() => {
        // impact spark
        const sp = document.createElement('div');
        sp.className = 'bt-impact';
        sp.style.left = x2 + '%'; sp.style.top = y2 + '%';
        fx.appendChild(sp);
        setTimeout(() => sp.remove(), 350);
        wrap.remove();
    }, dur);
}

function btSlashes(fx) {
    if (!fx) return;
    for (let i = 0; i < 4; i++) {
        const s = document.createElement('div');
        s.className = 'bt-slash';
        s.style.left = (30 + Math.random() * 40) + '%';
        s.style.top = (40 + Math.random() * 18) + '%';
        fx.appendChild(s);
        setTimeout(() => s.remove(), 360);
    }
}
function btBlood(fx, el) {
    if (!fx) return;
    const b = document.createElement('div');
    b.className = 'bt-blood';
    b.style.left = el.style.left; b.style.top = el.style.top;
    fx.appendChild(b);
    setTimeout(() => b.remove(), 700);
}

// ---- Unit sprite art (50px tall inline SVGs) ----
const BV_SPRITES = {
    warrior: `<svg viewBox="-16 -28 32 38"><ellipse cx="0" cy="8" rx="9" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-5" y="-4" width="10" height="14" fill="#3b82f6" stroke="#1e3a8a"/><rect x="-5" y="-4" width="10" height="3" fill="#60a5fa"/><circle cx="0" cy="-9" r="4" fill="#f5d6a8" stroke="#5a3818"/><rect x="-4" y="-14" width="8" height="5" fill="#94a3b8" stroke="#1a1408"/><g class="wpn"><line x1="6" y1="-2" x2="14" y2="-14" stroke="#cbd5e1" stroke-width="2.5"/></g><rect x="-8" y="-2" width="3" height="9" fill="#7a3818"/></svg>`,
    archer: `<svg viewBox="-16 -28 32 38"><ellipse cx="0" cy="8" rx="8" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-4" y="-3" width="8" height="13" fill="#15803d" stroke="#0a4520"/><circle cx="0" cy="-8" r="3.5" fill="#f5d6a8" stroke="#5a3818"/><path d="M -2 -12 L 2 -12 L 0 -16 Z" fill="#5a3818"/><path d="M 6 -11 Q 13 -2 6 7" stroke="#5a3818" stroke-width="2" fill="none"/><line x1="6" y1="-11" x2="6" y2="7" stroke="#fff" stroke-width="0.6"/></svg>`,
    shieldbearer: `<svg viewBox="-16 -28 32 38"><ellipse cx="0" cy="9" rx="10" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-6" y="-3" width="12" height="14" fill="#92400e" stroke="#3a1a08"/><circle cx="0" cy="-8" r="4" fill="#f5d6a8" stroke="#5a3818"/><rect x="-4" y="-13" width="8" height="5" fill="#5a5448" stroke="#1a1408"/><path class="wpn" d="M -11 -3 Q -13 4 -11 11 L -6 11 L -6 -3 Z" fill="#7c3aed" stroke="#3a1f5a"/><line x1="-8.5" y1="-3" x2="-8.5" y2="11" stroke="#fbbf24" stroke-width="0.6"/></svg>`,
    cavalry: `<svg viewBox="-18 -30 36 42"><ellipse cx="0" cy="10" rx="14" ry="3" fill="rgba(0,0,0,0.4)"/><ellipse cx="0" cy="3" rx="11" ry="6" fill="#5a3818" stroke="#1a0808"/><rect x="-9" y="7" width="2.5" height="6" fill="#3a2010"/><rect x="-3" y="7" width="2.5" height="6" fill="#3a2010"/><rect x="4" y="7" width="2.5" height="6" fill="#3a2010"/><path d="M 9 0 L 15 -4 L 15 3 Z" fill="#3a2010"/><rect x="-3" y="-11" width="6" height="9" fill="#dc2626" stroke="#7f1d1d"/><circle cx="0" cy="-14" r="3.2" fill="#f5d6a8" stroke="#5a3818"/><g class="wpn"><line x1="5" y1="-7" x2="15" y2="-16" stroke="#cbd5e1" stroke-width="2"/></g></svg>`,
    siege: `<svg viewBox="-20 -24 40 36"><ellipse cx="0" cy="11" rx="16" ry="3" fill="rgba(0,0,0,0.4)"/><rect x="-15" y="-4" width="30" height="14" fill="#5a3818" stroke="#1a0808"/><path d="M -17 -4 L 17 -4 L 14 -11 L -14 -11 Z" fill="#7a4818" stroke="#3a2010"/><ellipse cx="15" cy="-7" rx="4" ry="3" fill="#3a3328" stroke="#000"/><circle cx="-10" cy="11" r="3" fill="#1a0808"/><circle cx="10" cy="11" r="3" fill="#1a0808"/></svg>`,
    knight: `<svg viewBox="-16 -30 32 40"><ellipse cx="0" cy="9" rx="9" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-6" y="-5" width="12" height="15" fill="#94a3b8" stroke="#475569"/><rect x="-6" y="-5" width="12" height="4" fill="#cbd5e1"/><rect x="-5" y="-15" width="10" height="10" fill="#cbd5e1" stroke="#1a1408"/><rect x="-3" y="-12" width="6" height="2.5" fill="#1a1408"/><polygon points="-2,-15 2,-15 0,-22" fill="#dc2626"/><g class="wpn"><line x1="6" y1="-4" x2="16" y2="-18" stroke="#e8e8e8" stroke-width="3"/></g><path d="M -11 -3 Q -13 4 -11 10 L -7 10 L -7 -3 Z" fill="#3b82f6" stroke="#1e3a8a"/></svg>`,
    crossbowman: `<svg viewBox="-16 -28 32 38"><ellipse cx="0" cy="8" rx="8" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-4" y="-3" width="8" height="13" fill="#7c5018" stroke="#3a2408"/><circle cx="0" cy="-8" r="3.5" fill="#f5d6a8" stroke="#5a3818"/><rect x="-4" y="-12" width="8" height="3" fill="#3a2408"/><g class="wpn"><line x1="2" y1="-7" x2="12" y2="-7" stroke="#3a2010" stroke-width="2"/><line x1="9" y1="-11" x2="9" y2="-3" stroke="#5a3818" stroke-width="1.5"/></g></svg>`,
    paladin: `<svg viewBox="-17 -32 34 44"><ellipse cx="0" cy="10" rx="10" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-7" y="-5" width="14" height="16" fill="#f0e0b0" stroke="#a88838"/><rect x="-7" y="-5" width="14" height="4" fill="#fff3c0"/><rect x="-5" y="-16" width="10" height="11" fill="#f5f0d8" stroke="#a88838"/><rect x="-3" y="-13" width="6" height="2.5" fill="#1a1408"/><polygon points="-3,-16 3,-16 0,-24" fill="#fbbf24"/><g class="wpn"><line x1="7" y1="-5" x2="17" y2="-20" stroke="#fff8d0" stroke-width="3"/><line x1="12" y1="-10" x2="15" y2="-13" stroke="#fbbf24" stroke-width="2"/></g><path d="M -12 -3 Q -14 5 -12 11 L -8 11 L -8 -3 Z" fill="#fbbf24" stroke="#a88838"/><line x1="-10" y1="2" x2="-10" y2="8" stroke="#fff" stroke-width="1"/><line x1="-12" y1="5" x2="-8" y2="5" stroke="#fff" stroke-width="1"/></svg>`,
    catapult: `<svg viewBox="-22 -26 44 38"><ellipse cx="0" cy="12" rx="18" ry="3" fill="rgba(0,0,0,0.4)"/><rect x="-16" y="2" width="32" height="8" fill="#5a3818" stroke="#1a0808"/><circle cx="-11" cy="11" r="3.5" fill="#1a0808"/><circle cx="11" cy="11" r="3.5" fill="#1a0808"/><g class="wpn"><line x1="-10" y1="6" x2="10" y2="-14" stroke="#7a4818" stroke-width="3"/><circle cx="11" cy="-15" r="4" fill="#3a3328" stroke="#000"/></g></svg>`,
    pikeman: `<svg viewBox="-16 -32 32 42"><ellipse cx="0" cy="8" rx="7" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-4" y="-3" width="8" height="13" fill="#6b7280" stroke="#374151"/><circle cx="0" cy="-8" r="3.5" fill="#f5d6a8" stroke="#5a3818"/><rect x="-4" y="-12" width="8" height="3" fill="#475569"/><g class="wpn"><line x1="4" y1="6" x2="9" y2="-26" stroke="#5a3818" stroke-width="1.5"/><polygon points="9,-26 6,-22 12,-22" fill="#cbd5e1"/></g></svg>`
};

function bvEnemySprite(type) {
    if (type === 0) return `<svg viewBox="-16 -22 32 32"><ellipse cx="0" cy="8" rx="8" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-4" y="-2" width="8" height="12" fill="#4a5e2e" stroke="#1a2810"/><circle cx="0" cy="-7" r="4" fill="#6e8a3e" stroke="#1a2810"/><circle cx="-1.5" cy="-7" r="0.9" fill="#dc2626"/><circle cx="1.5" cy="-7" r="0.9" fill="#dc2626"/><path d="M -2 -4 L 0 -2 L 2 -4" stroke="#1a2810" stroke-width="0.7" fill="none"/><g class="wpn"><line x1="-5" y1="-2" x2="-13" y2="-9" stroke="#cbd5e1" stroke-width="2"/></g></svg>`;
    if (type === 1) return `<svg viewBox="-18 -26 36 36"><ellipse cx="0" cy="9" rx="10" ry="2.5" fill="rgba(0,0,0,0.4)"/><rect x="-5" y="-3" width="10" height="14" fill="#7f1d1d" stroke="#3a0808"/><circle cx="0" cy="-8" r="4.5" fill="#5a3818" stroke="#1a0808"/><path d="M -5 -12 L 5 -12 L 7 -16 L -7 -16 Z" fill="#3a2010"/><line x1="-3" y1="-8" x2="-3" y2="-6" stroke="#fde047" stroke-width="1.5"/><line x1="3" y1="-8" x2="3" y2="-6" stroke="#fde047" stroke-width="1.5"/><g class="wpn"><line x1="-6" y1="-2" x2="-15" y2="-10" stroke="#94a3b8" stroke-width="2"/><polygon points="-15,-10 -13,-13 -11,-9" fill="#cbd5e1"/></g></svg>`;
    if (type === 2) return `<svg viewBox="-16 -26 32 36"><ellipse cx="0" cy="9" rx="10" ry="2.5" fill="rgba(0,0,0,0.4)"/><ellipse cx="0" cy="-2" rx="10" ry="12" fill="#581c87" stroke="#2a0a4a"/><circle cx="-3" cy="-5" r="1.6" fill="#a78bfa"/><circle cx="3" cy="-5" r="1.6" fill="#a78bfa"/><path d="M -4 1 L 0 4 L 4 1" stroke="#000" stroke-width="0.9" fill="none"/><polygon points="-10,-12 -14,-16 -8,-12" fill="#581c87"/><polygon points="10,-12 14,-16 8,-12" fill="#581c87"/></svg>`;
    // type 3 — ogre brute
    return `<svg viewBox="-20 -30 40 42"><ellipse cx="0" cy="11" rx="13" ry="3" fill="rgba(0,0,0,0.45)"/><rect x="-9" y="-6" width="18" height="18" fill="#5a6e3a" stroke="#26330f"/><circle cx="0" cy="-12" r="6" fill="#7e9a4e" stroke="#26330f"/><circle cx="-2.5" cy="-12" r="1.2" fill="#dc2626"/><circle cx="2.5" cy="-12" r="1.2" fill="#dc2626"/><polygon points="-3,-7 -1,-9 1,-7" fill="#fff"/><polygon points="3,-7 1,-9 -1,-7" fill="#fff"/><g class="wpn"><line x1="9" y1="-2" x2="20" y2="-14" stroke="#5a3818" stroke-width="4"/><rect x="16" y="-18" width="8" height="8" fill="#3a3328" stroke="#000"/></g></svg>`;
}

// Build a roster of up to `max` sprite slots representing the army composition,
// returning array of {type} and how many of them should die (casualties).
function bvBuildRoster(troops, lossMap, max, isEnemy) {
    const entries = Object.entries(troops).filter(([, c]) => c > 0);
    const total = entries.reduce((s, [, c]) => s + c, 0) || 1;
    const slots = [];
    if (isEnemy) {
        // enemy types are numeric variety 0..3 distributed
        const n = Math.min(max, Math.max(5, Math.round(total / 4)));
        for (let i = 0; i < n; i++) slots.push({ kind: 'enemy', variant: i % 4 });
        const lossTotal = Object.values(lossMap || {}).reduce((s, c) => s + c, 0);
        const dieCount = Math.round(n * Math.min(1, lossTotal / total));
        return { slots, dieCount };
    }
    // attacker: proportional representation by type
    let remaining = max;
    const typeCounts = [];
    for (const [type, c] of entries) {
        const share = Math.max(1, Math.round((c / total) * max));
        typeCounts.push([type, share, c]);
    }
    for (const [type, share] of typeCounts) {
        for (let i = 0; i < share && slots.length < max; i++) slots.push({ kind: type });
    }
    // casualties proportional to overall losses
    const lossTotal = Object.values(lossMap || {}).reduce((s, c) => s + c, 0);
    const dieCount = Math.round(slots.length * Math.min(1, lossTotal / total));
    return { slots, dieCount };
}

function playBattleAnimation(attackerTroops, defenderTroops, target, result, callback) {
    const isVictory = result.victory;
    const overlay = document.createElement('div');
    overlay.className = 'battle-viewer';

    const sceneW = 860, sceneH = 420;
    const ROWS = 4;          // rows in each army block
    const DEPTH = 3;         // depth columns in each army block
    const groundTop = 196;   // px where ground starts within field

    // Build rosters — a 3-deep x 4-tall block (12) per side
    const atk = bvBuildRoster(attackerTroops, result.atkLosses, 12, false);
    const def = bvBuildRoster(defenderTroops, result.defLosses, 12, true);

    // Lay out each army as a BLOCK on its own side of the field.
    // col 0 = front line (near centre), higher cols recede toward each edge.
    const layout = (slots, isAtk) => slots.map((s, i) => {
        const row = i % ROWS;                 // vertical position 0..3
        const col = Math.floor(i / ROWS);     // depth 0 (front) .. 2 (back)
        const depthScale = 1 - col * 0.12;    // back ranks a touch smaller (perspective)
        const rowStagger = (col % 2) * 16;    // brick-lay rows so they don't line up
        const laneY = groundTop + 18 + row * 38 - col * 10 + (isAtk ? 0 : 4);
        // Front columns sit near the centre; the army extends back toward its own edge
        const lineX = isAtk ? (sceneW * 0.44 - col * 64 - rowStagger)
                            : (sceneW * 0.56 + col * 64 + rowStagger);
        const startX = isAtk ? (-90 - col * 60 - row * 8) : (sceneW + 90 + col * 60 + row * 8);
        // Draw order: lower on screen = closer = on top; front column above its own reserves
        const z = 10 + row * 3 + (DEPTH - col);
        return { ...s, i, row, col, laneY, lineX, startX, isAtk, depthScale, z };
    });
    const atkUnits = layout(atk.slots, true);
    const defUnits = layout(def.slots, false);

    // Casualties: front-line units fall first
    const markDeaths = (units, dieCount) => {
        const order = [...units].sort((a, b) => Math.abs(b.lineX - sceneW/2) - Math.abs(a.lineX - sceneW/2));
        for (let i = 0; i < dieCount && i < order.length; i++) order[i].dies = true;
    };
    markDeaths(atkUnits, isVictory ? Math.min(atk.dieCount, atkUnits.length - 1) : atkUnits.length);
    markDeaths(defUnits, isVictory ? defUnits.length : Math.min(def.dieCount, defUnits.length - 1));

    const renderUnit = (u) => {
        const sprite = u.isAtk ? (BV_SPRITES[u.kind] || BV_SPRITES.warrior) : bvEnemySprite(u.variant);
        const flipped = !u.isAtk ? 'bv-flip' : '';
        const sizeClass = (u.kind === 'siege' || u.kind === 'catapult' || u.variant === 3) ? 'bv-big' : '';
        const startPct = (u.startX / sceneW) * 100;
        const linePct = (u.lineX / sceneW) * 100;
        const topPct = (u.laneY / sceneH) * 100;
        return `<div class="bv-unit ${u.isAtk ? 'bv-atkunit' : 'bv-defunit'} ${flipped} ${sizeClass} ${u.dies ? 'bv-dies' : ''}"
            style="--startX:${startPct.toFixed(2)}%; --lineX:${linePct.toFixed(2)}%; --scale:${u.depthScale}; top:${topPct.toFixed(2)}%; z-index:${u.z}; --d:${(u.row * 0.04 + u.col * 0.12).toFixed(2)}s">
            ${sprite}
        </div>`;
    };

    overlay.innerHTML = `
        <div class="battle-scene-iso" style="--scene-w:${sceneW}px">
            <svg viewBox="0 0 ${sceneW} ${sceneH}" xmlns="http://www.w3.org/2000/svg" class="bv-bg" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="bvSky" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#fbbf6a"/><stop offset="0.35" stop-color="#c2410c"/>
                        <stop offset="0.7" stop-color="#7a1818"/><stop offset="1" stop-color="#2a0808"/>
                    </linearGradient>
                    <linearGradient id="bvGround" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="#8a6030"/><stop offset="1" stop-color="#241404"/>
                    </linearGradient>
                </defs>
                <rect width="${sceneW}" height="${groundTop}" fill="url(#bvSky)"/>
                <circle cx="${sceneW*0.5}" cy="60" r="40" fill="#ffd99a" opacity="0.5"/>
                <polygon points="0,${groundTop} 130,${groundTop-70} 240,${groundTop-30} 380,${groundTop-80} 520,${groundTop-40} 680,${groundTop-72} ${sceneW},${groundTop-30} ${sceneW},${groundTop}" fill="#3a1a08" opacity="0.7"/>
                <polygon points="0,${groundTop} 90,${groundTop-34} 210,${groundTop-56} 330,${groundTop-28} 470,${groundTop-60} 620,${groundTop-32} 760,${groundTop-54} ${sceneW},${groundTop} " fill="#2a1208" opacity="0.85"/>
                <ellipse cx="120" cy="${groundTop-8}" rx="22" ry="9" fill="#ff6b00" opacity="0.55"><animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.4s" repeatCount="indefinite"/></ellipse>
                <ellipse cx="740" cy="${groundTop-10}" rx="26" ry="11" fill="#ff6b00" opacity="0.6"><animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.8s" repeatCount="indefinite"/></ellipse>
                <rect y="${groundTop}" width="${sceneW}" height="${sceneH-groundTop}" fill="url(#bvGround)"/>
                <ellipse cx="220" cy="300" rx="70" ry="8" fill="rgba(0,0,0,0.25)"/>
                <ellipse cx="560" cy="330" rx="90" ry="9" fill="rgba(0,0,0,0.25)"/>
            </svg>
            <div class="bv-field" id="bv-field">
                ${atkUnits.map(renderUnit).join('')}
                ${defUnits.map(renderUnit).join('')}
            </div>
            <div class="bv-banner">️ Assault on ${target.name || target}</div>
            <div class="bv-status" id="bv-status">CHARGE!</div>
            <button class="bv-skip" id="bv-skip">Skip</button>
        </div>
    `;
    document.body.appendChild(overlay);
    const field = overlay.querySelector('#bv-field');

    // ---- Combat choreography ----
    let finished = false;
    const timers = [];
    const T = (fn, ms) => timers.push(setTimeout(fn, ms));

    // Phase sounds
    Audio.whoosh();
    T(() => Audio.attack(), 900);

    // Clash begins ~1.1s — start fighting class, sparks, projectiles
    T(() => {
        field.classList.add('bv-clashing');
        Audio.attack();
        screenShake(6, 300);
        spawnClashFx(field, sceneW, groundTop);
    }, 1100);
    T(() => { Audio.attack(); spawnClashFx(field, sceneW, groundTop); }, 1700);
    T(() => { Audio.attack(); screenShake(8, 400); spawnClashFx(field, sceneW, groundTop); }, 2300);

    // Archers fire arrows during clash
    T(() => fireProjectiles(field, atkUnits, defUnits, sceneW), 1300);
    T(() => fireProjectiles(field, atkUnits, defUnits, sceneW), 1900);

    // Casualties fall ~1.6s–3.2s (staggered)
    field.querySelectorAll('.bv-dies').forEach((el, idx) => {
        T(() => {
            el.classList.add('bv-falling');
            spawnHitSpark(field, el);
        }, 1500 + idx * 110);
    });

    // Resolution
    T(() => {
        const status = document.getElementById('bv-status');
        status.textContent = isVictory ? ' VICTORY!' : ' DEFEATED';
        status.className = 'bv-status ' + (isVictory ? 'victory' : 'defeat');
        field.classList.remove('bv-clashing');
        field.classList.add(isVictory ? 'bv-won' : 'bv-lost');
        if (isVictory) { Audio.victory(); confetti(70); }
        else Audio.defeat();
    }, 3400);

    const finish = () => {
        if (finished) return;
        finished = true;
        timers.forEach(clearTimeout);
        overlay.style.opacity = '0';
        setTimeout(() => { overlay.remove(); callback && callback(); }, 350);
    };
    T(finish, 4600);
    overlay.querySelector('#bv-skip').onclick = finish;
}

// Visual FX helpers for battle (percentage-based to match responsive field)
function spawnClashFx(field, sceneW, groundTop) {
    const sceneH = 380;
    for (let i = 0; i < 4; i++) {
        const s = document.createElement('div');
        s.className = 'bv-spark';
        s.textContent = ['','','',''][i % 4];
        s.style.left = (50 + (Math.random() - 0.5) * 36) + '%';
        s.style.top = ((groundTop + 20 + Math.random() * 90) / sceneH * 100) + '%';
        field.appendChild(s);
        setTimeout(() => s.remove(), 600);
    }
}
function spawnHitSpark(field, unitEl) {
    const s = document.createElement('div');
    s.className = 'bv-spark bv-spark-hit';
    s.textContent = '';
    s.style.left = unitEl.style.getPropertyValue('--lineX');
    s.style.top = unitEl.style.top;
    field.appendChild(s);
    setTimeout(() => s.remove(), 500);
}
function fireProjectiles(field, atkUnits, defUnits, sceneW) {
    const sceneH = 380;
    const archers = atkUnits.filter(u => u.kind === 'archer' || u.kind === 'crossbowman');
    archers.slice(0, 4).forEach((a, i) => {
        const p = document.createElement('div');
        p.className = 'bv-arrow';
        p.style.top = ((a.laneY - 8) / sceneH * 100) + '%';
        p.style.setProperty('--fromX', (a.lineX / sceneW * 100) + '%');
        p.style.setProperty('--toX', '60%');
        field.appendChild(p);
        setTimeout(() => p.remove(), 700);
    });
}

// ============================================================
// TUTORIAL
// ============================================================

const TUTORIAL_STEPS = [
    // Welcome — manual advance
    {
        intro: true,
        title: "Welcome, Commander! ",
        text: "I'll teach you how to play Village War in 60 seconds. Follow the gold arrows and tap what they point to.",
        cta: "Let's go!"
    },
    // 1. Tap Build
    {
        action: "TAP",
        label: "the Build button",
        hint: "It's on the left sidebar — looks like a crane ️",
        target: '.nav-btn[data-view="build"]',
        position: 'right'
    },
    // 2. Tap Lumber Mill card (a basic resource — wood)
    {
        action: "TAP",
        label: "the Lumber Mill card",
        hint: "Lumber Mills are one of the most basic resources — they produce wood over time.",
        target: '.build-card[data-type="lumbermill"]',
        position: 'bottom',
        autoSwitch: 'build'
    },
    // 3. Place on tile
    {
        action: "TAP",
        label: "any empty grass tile",
        hint: "Click any empty spot in your village to place the lumber mill.",
        target: '.tile-hit',
        position: 'top',
        autoSwitch: 'village'
    },
    {
        confirm: true,
        title: "How resources work",
        text: "Your buildings make resources over time (coins, gold, iron, wood, food). When a building is ready, a glowing badge floats above it — TAP the badge to collect. You spend resources to build & train, and earn lots more by raiding enemy camps. Let's collect some now!",
        cta: "Show me"
    },
    // 3b. Collect resources from a building (badges are forced to appear for this step)
    {
        action: "TAP",
        label: "a glowing resource badge above a building",
        hint: "Tap the round glowing badge floating over any building to collect its resources.",
        target: '.prod-indicator',
        position: 'top',
        autoSwitch: 'village',
        forceCollectables: true
    },
    // 3c. Build a Gold Mine (gold)
    {
        action: "TAP",
        label: "Build",
        hint: "Every village needs gold. Let's build a Gold Mine.",
        target: '.nav-btn[data-view="build"]',
        position: 'right'
    },
    {
        action: "TAP",
        label: "the Gold Mine card",
        hint: "Gold Mines produce gold — used for upgrades and better troops.",
        target: '.build-card[data-type="goldmine"]',
        position: 'bottom',
        autoSwitch: 'build'
    },
    {
        action: "TAP",
        label: "any empty tile",
        hint: "Place your Gold Mine anywhere on the island.",
        target: '.tile-hit',
        position: 'top',
        autoSwitch: 'village'
    },
    // 3d. Build a Farm (food)
    {
        action: "TAP",
        label: "Build",
        hint: "Your army needs food. One more: a Farm.",
        target: '.nav-btn[data-view="build"]',
        position: 'right'
    },
    {
        action: "TAP",
        label: "the Farm card",
        hint: "Farms produce food, which feeds the soldiers you'll train.",
        target: '.build-card[data-type="farm"]',
        position: 'bottom',
        autoSwitch: 'build'
    },
    {
        action: "TAP",
        label: "any empty tile",
        hint: "Place your Farm.",
        target: '.tile-hit',
        position: 'top',
        autoSwitch: 'village'
    },
    // 4. Build menu again
    {
        action: "TAP",
        label: "Build again",
        hint: "Time to build a barracks — that lets you train soldiers.",
        target: '.nav-btn[data-view="build"]',
        position: 'right'
    },
    // 5. Military tab
    {
        action: "TAP",
        label: "Military",
        hint: "Military buildings let you train an army.",
        target: '.cat-btn[data-cat="military"]',
        position: 'bottom',
        autoSwitch: 'build'
    },
    // 6. Barracks card
    {
        action: "TAP",
        label: "the Barracks",
        hint: "Barracks let you train warriors and archers.",
        target: '.build-card[data-type="barracks"]',
        position: 'bottom'
    },
    // 7. Place barracks
    {
        action: "TAP",
        label: "any empty tile",
        hint: "Place your barracks on the map.",
        target: '.tile-hit',
        position: 'top',
        autoSwitch: 'village'
    },
    // 8. Army view
    {
        action: "TAP",
        label: "the Army button",
        hint: "Now let's train soldiers.",
        target: '.nav-btn[data-view="army"]',
        position: 'right'
    },
    // 9. Train troops
    {
        action: "TAP",
        label: "the Train button",
        hint: "Train your first warrior! He'll fight for you.",
        target: '.troop-card .btn-primary',
        position: 'left',
        autoSwitch: 'army'
    },
    // 10. Raid view
    {
        action: "TAP",
        label: "the Raid button",
        hint: "Time to attack! Loot enemy camps for resources.",
        target: '.nav-btn[data-view="raid"]',
        position: 'right'
    },
    // 11. Attack
    {
        action: "TAP",
        label: "any Attack button",
        hint: "Start your first raid! You'll see an animated battle.",
        target: '.raid-card .btn-danger',
        position: 'top',
        autoSwitch: 'raid'
    },
    // Final
    {
        intro: true,
        title: "You're ready! ",
        text: "Build production buildings → upgrade them → train an army → raid camps and players → unlock heroes → win Club Wars in groups of 4.\n\nDaily quests and achievements give bonus rewards. Have fun, Commander!",
        cta: "Play!"
    }
];

let tutorialActive = false;
let tutorialStep = 0;
let tutorialDelegateAttached = false;

// Map step targets to extra selectors that should also count
const TUTORIAL_TARGET_ALIASES = {
    '.tile-hit': '.tile-hit, .placement-tile',
    '.placement-tile': '.tile-hit, .placement-tile'
};

function tutorialDocClickHandler(e) {
    if (!tutorialActive) return;
    const step = TUTORIAL_STEPS[tutorialStep];
    if (!step || step.intro || step.confirm || !step.target) return;
    const sel = TUTORIAL_TARGET_ALIASES[step.target] || step.target;
    const matched = e.target.closest(sel);
    if (matched) {
        flashTarget(matched);
        try { Audio.coin(); } catch(e) {}
        // Advance after a brief moment so the user sees the flash and the action completes
        setTimeout(advanceTutorial, 400);
    }
}

function startTutorial() {
    tutorialActive = true;
    tutorialStep = 0;
    state.tutorialDone = false;
    // Mark the tutorial as SEEN the moment it first opens, so it never auto-opens
    // again — even if the player abandons it without finishing. Stored both on the
    // device (localStorage) and in the saved game (so it follows the person/account).
    state.tutorialSeen = true;
    try { localStorage.setItem('villagewar_tutorial_done', '1'); } catch (e) {}
    // Guarantee enough resources to finish the whole tutorial (lumber mill +
    // barracks + first troop). Math.max never reduces what you already have, and
    // the cost is still really deducted as you build — you just can't run dry.
    state.resources.coins = Math.max(state.resources.coins || 0, 2000);
    state.resources.wood = Math.max(state.resources.wood || 0, 700);
    state.resources.iron = Math.max(state.resources.iron || 0, 400);
    state.resources.gold = Math.max(state.resources.gold || 0, 300);
    state.resources.food = Math.max(state.resources.food || 0, 500);
    try { updateResources(); } catch (e) {}
    try { saveGame(); } catch (e) {}
    if (!tutorialDelegateAttached) {
        document.addEventListener('click', tutorialDocClickHandler, true);
        tutorialDelegateAttached = true;
    }
    document.getElementById('tutorial-overlay').classList.remove('hidden');
    showTutorialStep();
}

function showTutorialStep() {
    if (!tutorialActive || tutorialStep >= TUTORIAL_STEPS.length) {
        endTutorial();
        return;
    }
    const step = TUTORIAL_STEPS[tutorialStep];

    if (step.autoSwitch) switchView(step.autoSwitch);

    // For the "collect resources" step, make sure a collectable badge is actually
    // showing so the player has something to tap.
    if (step.forceCollectables) {
        let any = false;
        for (const b of state.buildings) {
            const def = BUILDING_DEFS[b.type];
            if (def && def.production) { b.collectReady = Math.max(b.collectReady || 0, 50); any = true; }
        }
        if (any && typeof renderGrid === 'function') renderGrid();
    }

    // Wait for the DOM to update if we switched view
    setTimeout(() => renderTutorialStep(step), step.autoSwitch ? 280 : 30);
}

function renderTutorialStep(step) {
    const tip = document.getElementById('tutorial-tip');
    const spotlight = document.getElementById('tutorial-spotlight');
    const arrow = document.getElementById('tutorial-arrow');
    const ring = document.getElementById('tutorial-ring');

    const total = TUTORIAL_STEPS.filter(s => !s.intro && !s.confirm).length;
    const stepNum = TUTORIAL_STEPS.slice(0, tutorialStep + 1).filter(s => !s.intro && !s.confirm).length;
    const progressHTML = step.intro || step.confirm ? '' : `<div id="tutorial-progress" class="tutorial-progress-pill">Step ${stepNum} of ${total}</div>`;

    // ----- Intro / Confirm screens (centered modal-style) -----
    if (step.intro || step.confirm) {
        spotlight.style.display = 'none';
        arrow.style.display = 'none';
        ring.style.display = 'none';
        tip.classList.add('center-modal');
        tip.style.left = '50%';
        tip.style.top = '50%';
        tip.innerHTML = `
            ${progressHTML}
            <div class="tutorial-tip-content">
                <div class="tutorial-title">${step.title}</div>
                <div class="tutorial-text">${step.text.replace(/\n/g, '<br>')}</div>
                <button class="btn btn-gold btn-glow tutorial-cta">${step.cta || 'Continue'}</button>
                <button class="tutorial-skip-link">Skip tutorial</button>
            </div>
        `;
        tip.querySelector('.tutorial-cta').onclick = advanceTutorial;
        tip.querySelector('.tutorial-skip-link').onclick = skipTutorial;
        return;
    }

    // ----- Action step: spotlight + arrow + tip near target -----
    tip.classList.remove('center-modal');
    const target = step.target ? document.querySelector(step.target) : null;
    if (!target) {
        // Show generic continue tip
        spotlight.style.display = 'none';
        arrow.style.display = 'none';
        ring.style.display = 'none';
        tip.style.left = '50%';
        tip.style.top = '50%';
        tip.classList.add('center-modal');
        tip.innerHTML = `
            ${progressHTML}
            <div class="tutorial-tip-content">
                <div class="tutorial-title">Hmm…</div>
                <div class="tutorial-text">Target not visible right now. Click Continue.</div>
                <button class="btn btn-gold tutorial-cta">Continue →</button>
                <button class="tutorial-skip-link">Skip tutorial</button>
            </div>
        `;
        tip.querySelector('.tutorial-cta').onclick = advanceTutorial;
        tip.querySelector('.tutorial-skip-link').onclick = skipTutorial;
        return;
    }

    const rect = target.getBoundingClientRect();

    // Spotlight cutout
    spotlight.style.display = 'block';
    spotlight.style.left = (rect.left - 10) + 'px';
    spotlight.style.top = (rect.top - 10) + 'px';
    spotlight.style.width = (rect.width + 20) + 'px';
    spotlight.style.height = (rect.height + 20) + 'px';

    // Pulse ring around target
    ring.style.display = 'block';
    const ringSize = Math.max(rect.width, rect.height) + 30;
    ring.style.left = (rect.left + rect.width / 2 - ringSize / 2) + 'px';
    ring.style.top = (rect.top + rect.height / 2 - ringSize / 2) + 'px';
    ring.style.width = ringSize + 'px';
    ring.style.height = ringSize + 'px';

    // Tip content
    tip.innerHTML = `
        ${progressHTML}
        <div class="tutorial-tip-content">
            <div class="tutorial-step-action"><span class="tutorial-action-verb">${step.action}</span> ${step.label}</div>
            <div class="tutorial-step-hint">${step.hint || ''}</div>
            <div class="tutorial-step-arrow-note">↓ Look for the bouncing arrow ↓</div>
            <button class="tutorial-skip-link">Skip tutorial</button>
        </div>
    `;
    tip.querySelector('.tutorial-skip-link').onclick = skipTutorial;

    // Position tip near target — but never covering it
    const tipW = 340, tipH = 160;
    let tx = rect.left + rect.width / 2 - tipW / 2;
    let ty = rect.bottom + 40;  // default below
    if (step.position === 'right') { tx = rect.right + 30; ty = rect.top + rect.height / 2 - tipH / 2; }
    else if (step.position === 'left') { tx = rect.left - tipW - 30; ty = rect.top + rect.height / 2 - tipH / 2; }
    else if (step.position === 'top') { tx = rect.left + rect.width / 2 - tipW / 2; ty = rect.top - tipH - 40; }

    // Clamp + auto-flip if it would overlap target
    tx = Math.max(14, Math.min(window.innerWidth - tipW - 14, tx));
    ty = Math.max(14, Math.min(window.innerHeight - tipH - 14, ty));

    // Check overlap; if overlapping, try alt position
    const tipRect = { left: tx, top: ty, right: tx + tipW, bottom: ty + tipH };
    if (overlaps(tipRect, rect)) {
        // Try below
        ty = rect.bottom + 40;
        if (ty + tipH > window.innerHeight - 14) ty = rect.top - tipH - 40;
        ty = Math.max(14, Math.min(window.innerHeight - tipH - 14, ty));
    }

    tip.style.left = tx + 'px';
    tip.style.top = ty + 'px';

    // Bouncing arrow positioned beside the target, pointing AT it. Uses an SVG
    // arrow (the default points DOWN) rotated toward the target.
    arrow.style.display = 'flex';
    let ax = rect.left + rect.width / 2 - 26;
    let ay = rect.top - 60;
    let rot = 0; // 0 = point down (arrow sits above target)
    if (tx >= rect.right + 10) { ax = rect.right + 8; ay = rect.top + rect.height / 2 - 26; rot = 90; }       // arrow on the right → point left
    else if (tx + tipW <= rect.left - 10) { ax = rect.left - 60; ay = rect.top + rect.height / 2 - 26; rot = -90; } // arrow on the left → point right
    else if (ty > rect.bottom) { ax = rect.left + rect.width / 2 - 26; ay = rect.bottom + 4; rot = 180; }      // arrow below → point up
    else { ax = rect.left + rect.width / 2 - 26; ay = rect.top - 60; rot = 0; }                                 // arrow above → point down

    arrow.innerHTML = (typeof svgIcon === 'function') ? svgIcon('tutArrow') : '';
    const arrowSvg = arrow.querySelector('svg');
    if (arrowSvg) arrowSvg.style.transform = `rotate(${rot}deg)`;
    arrow.style.left = ax + 'px';
    arrow.style.top = ay + 'px';

    // Click handling is now done via tutorialDocClickHandler (document delegation)
    // — handles ALL matching elements, including dynamically created ones like .placement-tile
}

function overlaps(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function flashTarget(el) {
    const r = el.getBoundingClientRect();
    const flash = document.createElement('div');
    flash.className = 'tutorial-flash';
    flash.style.left = r.left + 'px';
    flash.style.top = r.top + 'px';
    flash.style.width = r.width + 'px';
    flash.style.height = r.height + 'px';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 600);
    try { Audio.coin(); } catch(e) {}
}

function advanceTutorial() {
    tutorialStep++;
    showTutorialStep();
}

function endTutorial() {
    tutorialActive = false;
    state.tutorialDone = true;
    try { localStorage.setItem('villagewar_tutorial_done', '1'); } catch(e) {}  // persists even if save is wiped
    document.getElementById('tutorial-overlay').classList.add('hidden');
    saveGame();
    toast('Tutorial complete! Have fun!', 'success');
}

function skipTutorial() {
    state.tutorialDone = true;
    try { localStorage.setItem('villagewar_tutorial_done', '1'); } catch(e) {}
    endTutorial();
}

// ============================================================
// INIT
// ============================================================

function initGame() {
    loadGame();
    ensureSoldiers();

    // Inject crisp gold coin/ingot icons into the resource bar
    const setIco = (id, svg) => { const el = document.getElementById(id); if (el && svg) el.innerHTML = svg; };
    setIco('ico-coins', typeof COIN_ICON !== 'undefined' ? COIN_ICON : '');
    setIco('ico-gold',  typeof GOLD_ICON !== 'undefined' ? GOLD_ICON : '');
    setIco('ico-iron',  typeof IRON_ICON !== 'undefined' ? IRON_ICON : '');
    setIco('ico-wood',  typeof WOOD_ICON !== 'undefined' ? WOOD_ICON : '');
    setIco('ico-food',  typeof FOOD_ICON !== 'undefined' ? FOOD_ICON : '');

    if (state.buildings.length === 0) {
        // Central positions (all within the starter owned block around (7,5)).
        const GW = 14;
        // Nothing starts pre-built EXCEPT the Town Hall (the heart of the island —
        // everything anchors on it and it can't be built from the menu). Every
        // resource & military building is built by the player during the tutorial.
        state.buildings.push({ type: 'townhall',   level: 1, pos: 7 + 4 * GW, hp: 500 }); // (7,4)
        saveGame();
    }

    updateStorageCaps();
    renderGrid();
    updateResources();

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => switchView(btn.dataset.view);
    });

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBuildCat = btn.dataset.cat;
            renderBuildView();
        };
    });

    document.querySelectorAll('.raid-tab').forEach(tab => {
        tab.onclick = () => {
            document.querySelectorAll('.raid-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRaidTab = tab.dataset.raid;
            renderRaidView();
        };
    });

    document.getElementById('close-info').onclick = () => {
        document.getElementById('building-info-panel').classList.add('hidden');
    };

    document.getElementById('modal-close').onclick = () => {
        document.getElementById('modal-overlay').classList.add('hidden');
    };

    const tSkip = document.getElementById('tutorial-skip');
    if (tSkip) tSkip.onclick = skipTutorial;
    document.getElementById('restart-tutorial-btn').onclick = startTutorial;

    // Music is OFF by default. SFX is ON.
    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) muteBtn.onclick = () => { const m = Audio.toggleSfx(); muteBtn.textContent = m ? '' : ''; };

    const musicBtn = document.getElementById('music-btn');
    const musicPlayer = document.getElementById('music-player');
    const musicTitle = document.getElementById('music-title');
    const musicPrev = document.getElementById('music-prev');
    const musicNext = document.getElementById('music-next');
    if (musicBtn) {
        musicBtn.onclick = () => {
            const on = Audio.toggleMusic();
            updateMusicButtonUI(on);
            toast(on ? 'Music on — live medieval score that rises into battle' : 'Music: off', 'info');
        };
    }
    if (musicPrev) musicPrev.onclick = () => Audio.prevTrack();
    if (musicNext) musicNext.onclick = () => Audio.nextTrack();
    if (musicTitle && Audio.onTrackChange) {
        Audio.onTrackChange((title, idx) => {
            if (musicTitle) musicTitle.textContent = title || '—';
            if (title) toast(` Now playing: ${title}`, 'info');
        });
    }

    // Seed achievement metrics
    ensureQuestState();
    state.achievements.metrics.levelReached = Math.max(state.achievements.metrics.levelReached || 0, state.level);
    state.achievements.metrics.totalBuilt = Math.max(state.achievements.metrics.totalBuilt || 0, state.buildings.length);
    state.achievements.metrics.troopCap = getTroopCapacity();
    syncAchievements();
    updateNotificationBadges();

    // Tutorial trigger — auto-opens ONLY the very first time this person opens the
    // game. `tutorialSeen` lives in the save (follows the account/cloud), and the
    // localStorage flag covers the device even if the save is wiped.
    let tutorialEverDone = false;
    try { tutorialEverDone = localStorage.getItem('villagewar_tutorial_done') === '1'; } catch(e) {}
    if (!state.tutorialSeen && !state.tutorialDone && !tutorialEverDone) {
        setTimeout(() => startTutorial(), 600);
    }

    // Re-render tutorial on resize
    window.addEventListener('resize', () => {
        if (tutorialActive) showTutorialStep();
    });

    // Robust persistence — progress is saved for this person no matter what:
    // periodically, and whenever the tab is closed/hidden. (Writes to localStorage
    // always; the cloud too when signed in, via the saveGame wrapper.)
    if (!window._vwAutosave) {
        window._vwAutosave = setInterval(() => { try { syncAchievements(); saveGame(); } catch (e) {} }, 20000);
        window.addEventListener('beforeunload', () => { try { saveGame(); } catch (e) {} });
        document.addEventListener('visibilitychange', () => { if (document.hidden) { try { saveGame(); } catch (e) {} } });
    }

    // New meta systems
    if (typeof ensureMeta === 'function') {
        ensureMeta();
        updateGemDisplay();
        setTimeout(() => { try { checkDailyReward(); } catch(e) {} }, 1200);
    }
    if (typeof ensureExp === 'function') { try { ensureExp(); } catch(e) {} }
    // 3D view toggle button
    if (!document.getElementById('btn-3d')) {
        const b3 = document.createElement('button');
        b3.id = 'btn-3d';
        b3.textContent = ' 3D';
        b3.title = 'Toggle true 3D view (WebGL)';
        b3.onclick = () => { try { toggle3D(); } catch(e) { toast('3D unavailable.', 'error'); } };
        document.getElementById('view-village').appendChild(b3);
    }

    setInterval(gameTick, 2000);
    setInterval(() => {
        const view = document.querySelector('.view.active')?.id?.replace('view-', '');
        if (view === 'raid') renderRaidView();
    }, 1000);
}

function setupSplash() {
    const splash = document.getElementById('splash-screen');
    const playBtn = document.getElementById('splash-play');
    if (!splash || !playBtn) return;

    // Start buffering the first music track while the player is on the title
    // screen, so the recorded theme begins instantly when they hit Play.
    try { Audio.preloadMusic(); } catch (e) {}

    // Simulate a brief "loading" then show Play
    const fill = splash.querySelector('.splash-loading-fill');
    const text = splash.querySelector('.splash-loading-text');
    const loadingArea = splash.querySelector('.splash-loading-area');

    let pct = 0;
    const tick = setInterval(() => {
        pct += 8 + Math.random() * 12;
        if (pct >= 100) {
            pct = 100;
            clearInterval(tick);
            setTimeout(() => {
                if (loadingArea) loadingArea.style.display = 'none';
                playBtn.classList.remove('hidden');
            }, 200);
        }
        if (fill) fill.style.width = pct + '%';
        if (text && pct < 100) text.textContent = pct < 30 ? 'Loading kingdom…' : pct < 70 ? 'Recruiting villagers…' : 'Sharpening swords…';
        if (text && pct >= 100) text.textContent = 'Ready!';
    }, 220);

    // Every button in the game gives a soft tactile tick (delegated once here).
    if (!window._sfxClickWired) {
        window._sfxClickWired = true;
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn, .nav-btn, .cat-btn, .raid-tab, .formation-tab, .harbor-tile, .lb-chip, .lb-spell, .more-card, .close-btn')) {
                try { Audio.click(); } catch (err) {}
            }
        }, true);
    }

    playBtn.onclick = () => {
        // Entering the game — play the quick fanfare theme and turn music ON.
        // (This click is a user gesture, so the browser allows audio to start.)
        try {
            Audio.fanfare();
            Audio.enableMusic();
            Audio.startAmbient && Audio.startAmbient();   // soft surf + distant gulls under everything
            updateMusicButtonUI(true);
        } catch (e) {}
        splash.classList.add('splash-fade');
        setTimeout(() => splash.style.display = 'none', 700);
    };
}

// Keep the music button + mini-player in sync with the music on/off state.
function updateMusicButtonUI(on) {
    const musicBtn = document.getElementById('music-btn');
    const musicPlayer = document.getElementById('music-player');
    if (musicBtn) {
        musicBtn.innerHTML = '<span class="nav-ic" data-ic="music"></span><span class="audio-state' + (on ? ' on' : '') + '">' + (on ? 'on' : 'off') + '</span>';
        musicBtn.classList.toggle('active', !!on);
        if (typeof hydrateIcons === 'function') hydrateIcons(musicBtn);
    }
    if (musicPlayer) musicPlayer.classList.toggle('hidden', !on);
}

document.addEventListener('DOMContentLoaded', () => {
    setupSplash();
    initGame();
});
