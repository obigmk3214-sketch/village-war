// ============================================================
// CHARACTER SPRITES — detailed front-facing game art (no emoji)
// Each is a standing character on a 44x58 canvas, feet at y=56.
// Used in the bird's-eye 3D battle, formation grid, and rosters.
// ============================================================

const _C = {
    // shared shadow + outline helpers baked into each sprite
};

// Player troop sprites
const CHAR_SPRITES = {
    warrior: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3" fill="rgba(0,0,0,0.35)"/>
        <rect x="16" y="40" width="5" height="13" rx="2" fill="#6b4a28" stroke="#2a1808" stroke-width="1"/>
        <rect x="23" y="40" width="5" height="13" rx="2" fill="#6b4a28" stroke="#2a1808" stroke-width="1"/>
        <rect x="12" y="23" width="20" height="20" rx="4" fill="#3b6fd6" stroke="#16306e" stroke-width="1.4"/>
        <rect x="12" y="23" width="20" height="5" rx="3" fill="#5d92f5"/>
        <rect x="12" y="37" width="20" height="3.5" fill="#3a2410"/>
        <rect x="20" y="37" width="4" height="3.5" fill="#caa23a"/>
        <circle cx="22" cy="15" r="7.5" fill="#f1c89a" stroke="#a9743c" stroke-width="1"/>
        <path d="M13 15 a9 8 0 0 1 18 0 l-1 -2 -16 0 z" fill="#c2c7cf" stroke="#5a5e66" stroke-width="1.2"/>
        <rect x="12.5" y="11" width="19" height="4.5" rx="2" fill="#d6dae2" stroke="#5a5e66" stroke-width="1.2"/>
        <rect x="20.5" y="12" width="3" height="10" fill="#9aa0a8" stroke="#5a5e66" stroke-width="0.6"/>
        <ellipse cx="8" cy="33" rx="5.5" ry="7.5" fill="#c0392b" stroke="#6e190f" stroke-width="1.4"/>
        <ellipse cx="8" cy="33" rx="2.4" ry="3.4" fill="#e7c24c" stroke="#6e190f" stroke-width="0.8"/>
        <rect x="34" y="9" width="2.8" height="22" rx="1" fill="#e1e5ec" stroke="#5a5e66" stroke-width="1"/>
        <polygon points="34,9 36.8,9 35.4,5" fill="#eef1f6" stroke="#5a5e66" stroke-width="0.8"/>
        <rect x="31.5" y="29" width="8" height="3" rx="1" fill="#3a2410" stroke="#1a0e04" stroke-width="0.6"/>
    </svg>`,

    archer: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="11" ry="3" fill="rgba(0,0,0,0.35)"/>
        <rect x="17" y="41" width="5" height="12" rx="2" fill="#3f5a2a" stroke="#1e2e12" stroke-width="1"/>
        <rect x="23" y="41" width="5" height="12" rx="2" fill="#3f5a2a" stroke="#1e2e12" stroke-width="1"/>
        <path d="M13 24 q9 -5 18 0 l-1 19 -16 0 z" fill="#2f8a3e" stroke="#13491f" stroke-width="1.4"/>
        <path d="M14 24 q8 -4 16 0 l-1 4 -14 0 z" fill="#43ac54"/>
        <path d="M12 22 q10 -10 20 0 l-4 5 -12 0 z" fill="#1f6e2c" stroke="#0c3414" stroke-width="1.2"/>
        <circle cx="22" cy="16" r="6.5" fill="#f1c89a" stroke="#a9743c" stroke-width="1"/>
        <path d="M14 17 q8 -12 16 0 l-3 -1 -10 0 z" fill="#1f6e2c"/>
        <path d="M34 10 q7 12 0 30" fill="none" stroke="#7a4a1e" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M34 10 q7 12 0 30" fill="none" stroke="#a9743c" stroke-width="0.8"/>
        <line x1="34" y1="25" x2="14" y2="25" stroke="#e8e8e8" stroke-width="0.8"/>
        <polygon points="14,25 18,23 18,27" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>
    </svg>`,

    shieldbearer: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="13" ry="3.2" fill="rgba(0,0,0,0.38)"/>
        <rect x="15" y="40" width="6" height="13" rx="2" fill="#4a4038" stroke="#1f1812" stroke-width="1"/>
        <rect x="24" y="40" width="6" height="13" rx="2" fill="#4a4038" stroke="#1f1812" stroke-width="1"/>
        <rect x="11" y="22" width="22" height="21" rx="4" fill="#8a6b3a" stroke="#3f2e16" stroke-width="1.4"/>
        <rect x="11" y="22" width="22" height="5" fill="#a9874f"/>
        <circle cx="22" cy="14" r="7" fill="#f1c89a" stroke="#a9743c" stroke-width="1"/>
        <rect x="14" y="9" width="16" height="6" rx="2" fill="#7a7e86" stroke="#3a3e46" stroke-width="1.2"/>
        <rect x="14" y="13" width="16" height="2.5" fill="#9aa0a8"/>
        <path d="M2 20 q-2 13 0 26 l11 -3 0 -20 z" fill="#7c3aed" stroke="#3f1f6e" stroke-width="1.6"/>
        <path d="M2 20 q-2 13 0 26 l3 -1 0 -24 z" fill="#9b5cff"/>
        <line x1="7" y1="23" x2="7" y2="42" stroke="#e7c24c" stroke-width="1.4"/>
        <line x1="2.5" y1="32" x2="12" y2="31" stroke="#e7c24c" stroke-width="1.4"/>
    </svg>`,

    cavalry: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="16" ry="3.4" fill="rgba(0,0,0,0.38)"/>
        <path d="M6 38 q0 -10 10 -11 l14 0 q8 1 8 10 l0 6 -32 0 z" fill="#6b4a2a" stroke="#2e1c0d" stroke-width="1.4"/>
        <path d="M6 38 q0 -10 10 -11 l14 0 q8 1 8 10" fill="none" stroke="#8a6238" stroke-width="2"/>
        <rect x="8" y="43" width="3" height="10" fill="#3a2410" stroke="#1a0e04" stroke-width="0.8"/>
        <rect x="15" y="43" width="3" height="10" fill="#3a2410" stroke="#1a0e04" stroke-width="0.8"/>
        <rect x="26" y="43" width="3" height="10" fill="#3a2410" stroke="#1a0e04" stroke-width="0.8"/>
        <rect x="33" y="43" width="3" height="10" fill="#3a2410" stroke="#1a0e04" stroke-width="0.8"/>
        <path d="M34 30 l8 -4 -2 8 z" fill="#3a2410" stroke="#1a0e04" stroke-width="1"/>
        <path d="M6 28 l-4 -3 6 -2 z" fill="#5a3a1c"/>
        <rect x="18" y="14" width="9" height="16" rx="3" fill="#c0392b" stroke="#6e190f" stroke-width="1.4"/>
        <rect x="18" y="14" width="9" height="4" fill="#d65a4c"/>
        <circle cx="22.5" cy="10" r="5.5" fill="#f1c89a" stroke="#a9743c" stroke-width="1"/>
        <path d="M16 10 a7 6 0 0 1 13 0 z" fill="#c2c7cf" stroke="#5a5e66" stroke-width="1.2"/>
        <polygon points="22.5,4 24,0 21,0" fill="#dc2626"/>
        <line x1="28" y1="16" x2="40" y2="4" stroke="#d8dce4" stroke-width="2.4" stroke-linecap="round"/>
        <polygon points="40,4 43,2 39,8" fill="#eef1f6" stroke="#5a5e66" stroke-width="0.6"/>
    </svg>`,

    knight: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3.2" fill="rgba(0,0,0,0.38)"/>
        <rect x="16" y="40" width="5.5" height="13" rx="2" fill="#9aa0a8" stroke="#3a3e46" stroke-width="1"/>
        <rect x="23" y="40" width="5.5" height="13" rx="2" fill="#9aa0a8" stroke="#3a3e46" stroke-width="1"/>
        <rect x="12" y="22" width="20" height="21" rx="4" fill="#c2c7cf" stroke="#4a4e56" stroke-width="1.6"/>
        <rect x="12" y="22" width="20" height="6" fill="#dce0e8"/>
        <path d="M22 28 l5 5 -5 9 -5 -9 z" fill="#3b6fd6" stroke="#16306e" stroke-width="1"/>
        <circle cx="22" cy="14" r="7.5" fill="#c2c7cf" stroke="#4a4e56" stroke-width="1.4"/>
        <rect x="14.5" y="12" width="15" height="6" rx="1" fill="#3a3e46"/>
        <rect x="14.5" y="13.5" width="15" height="2" fill="#1a1e26"/>
        <polygon points="22,7 23.5,1 20.5,1" fill="#dc2626"/>
        <path d="M22 7 q3 -5 6 -3 q-2 4 -6 4 z" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.6"/>
        <ellipse cx="7" cy="32" rx="5.5" ry="8" fill="#3b6fd6" stroke="#16306e" stroke-width="1.4"/>
        <polygon points="7,27 8.6,31 10.5,31 9,33.5 9.6,37 7,35 4.4,37 5,33.5 3.5,31 5.4,31" fill="#e7c24c"/>
        <rect x="34" y="6" width="3" height="26" rx="1" fill="#eef1f6" stroke="#5a5e66" stroke-width="1"/>
        <polygon points="34,6 37,6 35.5,2" fill="#fff" stroke="#5a5e66" stroke-width="0.8"/>
        <rect x="31" y="30" width="9" height="3" rx="1" fill="#5a3a1c" stroke="#2a1808" stroke-width="0.6"/>
    </svg>`,

    crossbowman: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="11" ry="3" fill="rgba(0,0,0,0.35)"/>
        <rect x="17" y="41" width="5" height="12" rx="2" fill="#4a3a24" stroke="#22160c" stroke-width="1"/>
        <rect x="23" y="41" width="5" height="12" rx="2" fill="#4a3a24" stroke="#22160c" stroke-width="1"/>
        <rect x="13" y="24" width="18" height="19" rx="4" fill="#8a5a2a" stroke="#42290f" stroke-width="1.4"/>
        <rect x="13" y="24" width="18" height="5" fill="#a8763c"/>
        <rect x="15" y="28" width="14" height="3" fill="#6b4420"/>
        <circle cx="22" cy="16" r="6.5" fill="#f1c89a" stroke="#a9743c" stroke-width="1"/>
        <path d="M15 14 q7 -8 14 0 l-2 -1 -10 0 z" fill="#5a3a1c" stroke="#2a1808" stroke-width="1"/>
        <rect x="8" y="29" width="20" height="3" rx="1" fill="#5a3a1c" stroke="#2a1808" stroke-width="1"/>
        <path d="M9 24 q-3 6 0 12" fill="none" stroke="#3a3e46" stroke-width="2" stroke-linecap="round"/>
        <line x1="9" y1="26" x2="9" y2="34" stroke="#cbd5e1" stroke-width="0.8"/>
        <line x1="9" y1="30" x2="24" y2="30" stroke="#cbd5e1" stroke-width="1"/>
        <polygon points="24,30 28,28.5 28,31.5" fill="#cbd5e1" stroke="#475569" stroke-width="0.4"/>
    </svg>`,

    paladin: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3.2" fill="rgba(0,0,0,0.35)"/>
        <circle cx="22" cy="13" r="13" fill="rgba(255,230,140,0.18)"/>
        <rect x="16" y="40" width="5.5" height="13" rx="2" fill="#e3c878" stroke="#9a7320" stroke-width="1"/>
        <rect x="23" y="40" width="5.5" height="13" rx="2" fill="#e3c878" stroke="#9a7320" stroke-width="1"/>
        <rect x="12" y="22" width="20" height="21" rx="4" fill="#f3e3a8" stroke="#a9842c" stroke-width="1.6"/>
        <rect x="12" y="22" width="20" height="6" fill="#fff3c4"/>
        <rect x="20.5" y="27" width="3" height="14" fill="#caa23a"/>
        <rect x="16" y="32" width="12" height="3" fill="#caa23a"/>
        <circle cx="22" cy="14" r="7.5" fill="#f5e6b0" stroke="#a9842c" stroke-width="1.4"/>
        <rect x="14.5" y="12" width="15" height="5.5" rx="1" fill="#caa23a"/>
        <rect x="14.5" y="13.5" width="15" height="2" fill="#9a7320"/>
        <polygon points="22,7 23.6,2 20.4,2" fill="#fff"/>
        <ellipse cx="7" cy="32" rx="5.5" ry="8" fill="#fbe08a" stroke="#a9842c" stroke-width="1.4"/>
        <rect x="6" y="27.5" width="2" height="9" fill="#fff"/>
        <rect x="3.5" y="30.5" width="7" height="2" fill="#fff"/>
        <rect x="34" y="5" width="3" height="27" rx="1" fill="#fff8d8" stroke="#a9842c" stroke-width="1"/>
        <rect x="31" y="9" width="9" height="2.6" fill="#caa23a"/>
        <polygon points="34,5 37,5 35.5,1" fill="#fff" stroke="#a9842c" stroke-width="0.6"/>
    </svg>`,

    pikeman: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.35)"/>
        <rect x="17" y="42" width="5" height="11" rx="2" fill="#4a4038" stroke="#1f1812" stroke-width="1"/>
        <rect x="23" y="42" width="5" height="11" rx="2" fill="#4a4038" stroke="#1f1812" stroke-width="1"/>
        <rect x="14" y="26" width="16" height="18" rx="3" fill="#6b7280" stroke="#33394a" stroke-width="1.4"/>
        <rect x="14" y="26" width="16" height="5" fill="#8a909e"/>
        <circle cx="22" cy="18" r="6.5" fill="#f1c89a" stroke="#a9743c" stroke-width="1"/>
        <path d="M15 18 a7 7 0 0 1 14 0 l-1 -2 -12 0 z" fill="#7a7e86" stroke="#3a3e46" stroke-width="1.2"/>
        <rect x="14.5" y="14" width="15" height="4" rx="1" fill="#9aa0a8" stroke="#3a3e46" stroke-width="1"/>
        <rect x="9" y="2" width="2.4" height="44" rx="1" fill="#7a4a1e" stroke="#3a2410" stroke-width="0.8"/>
        <polygon points="10.2,2 14,8 6.4,8" fill="#cbd5e1" stroke="#475569" stroke-width="0.8"/>
    </svg>`,

    siege: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="18" ry="3.4" fill="rgba(0,0,0,0.4)"/>
        <rect x="6" y="30" width="32" height="14" rx="2" fill="#7a4a22" stroke="#3a2410" stroke-width="1.6"/>
        <rect x="6" y="30" width="32" height="4" fill="#9a6432"/>
        <path d="M6 30 l4 -10 24 0 4 10 z" fill="#8a5a2a" stroke="#3a2410" stroke-width="1.4"/>
        <ellipse cx="38" cy="40" rx="4" ry="3.5" fill="#3a3e46" stroke="#0a0408" stroke-width="1"/>
        <circle cx="12" cy="46" r="5" fill="#2a1c10" stroke="#0a0408" stroke-width="1.4"/>
        <circle cx="12" cy="46" r="2" fill="#5a3a1c"/>
        <circle cx="32" cy="46" r="5" fill="#2a1c10" stroke="#0a0408" stroke-width="1.4"/>
        <circle cx="32" cy="46" r="2" fill="#5a3a1c"/>
        <line x1="14" y1="24" x2="30" y2="24" stroke="#5a3a1c" stroke-width="2"/>
    </svg>`,

    catapult: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="19" ry="3.4" fill="rgba(0,0,0,0.4)"/>
        <rect x="6" y="40" width="32" height="6" rx="1" fill="#7a4a22" stroke="#3a2410" stroke-width="1.4"/>
        <line x1="10" y1="44" x2="20" y2="26" stroke="#8a5a2a" stroke-width="3.4" stroke-linecap="round"/>
        <line x1="20" y1="26" x2="33" y2="38" stroke="#6b4420" stroke-width="2.6"/>
        <circle cx="20" cy="24" r="5" fill="#3a3e46" stroke="#0a0408" stroke-width="1.2"/>
        <circle cx="11" cy="47" r="5" fill="#2a1c10" stroke="#0a0408" stroke-width="1.4"/>
        <circle cx="11" cy="47" r="2" fill="#5a3a1c"/>
        <circle cx="33" cy="47" r="5" fill="#2a1c10" stroke="#0a0408" stroke-width="1.4"/>
        <circle cx="33" cy="47" r="2" fill="#5a3a1c"/>
    </svg>`
};

// Enemy sprites — distinct menacing characters
const ENEMY_SPRITES = {
    goblin: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.38)"/>
        <rect x="17" y="40" width="5" height="13" rx="2" fill="#3a4a22" stroke="#1a240f" stroke-width="1"/>
        <rect x="23" y="40" width="5" height="13" rx="2" fill="#3a4a22" stroke="#1a240f" stroke-width="1"/>
        <rect x="14" y="25" width="16" height="18" rx="4" fill="#5e7a30" stroke="#2c3a14" stroke-width="1.4"/>
        <rect x="14" y="25" width="16" height="5" fill="#7a9a44"/>
        <circle cx="22" cy="16" r="8" fill="#6e9a3e" stroke="#2c3a14" stroke-width="1.4"/>
        <polygon points="13,13 9,9 16,12" fill="#6e9a3e" stroke="#2c3a14" stroke-width="1"/>
        <polygon points="31,13 35,9 28,12" fill="#6e9a3e" stroke="#2c3a14" stroke-width="1"/>
        <ellipse cx="19" cy="15" rx="2" ry="2.4" fill="#fde047"/>
        <ellipse cx="25" cy="15" rx="2" ry="2.4" fill="#fde047"/>
        <circle cx="19" cy="15.5" r="0.9" fill="#000"/>
        <circle cx="25" cy="15.5" r="0.9" fill="#000"/>
        <path d="M18 20 l8 0 -2 2 -4 0 z" fill="#2c3a14"/>
        <polygon points="19,20 20,22 21,20" fill="#fff"/>
        <polygon points="23,20 24,22 25,20" fill="#fff"/>
        <line x1="32" y1="36" x2="40" y2="22" stroke="#7a4a1e" stroke-width="2"/>
        <polygon points="40,22 43,20 39,26" fill="#9aa0a8" stroke="#3a3e46" stroke-width="0.6"/>
    </svg>`,

    orc: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="13" ry="3.3" fill="rgba(0,0,0,0.4)"/>
        <rect x="15" y="40" width="6" height="13" rx="2" fill="#3a3e2a" stroke="#191c10" stroke-width="1"/>
        <rect x="24" y="40" width="6" height="13" rx="2" fill="#3a3e2a" stroke="#191c10" stroke-width="1"/>
        <rect x="10" y="22" width="24" height="21" rx="4" fill="#5a7038" stroke="#28341a" stroke-width="1.6"/>
        <rect x="10" y="22" width="24" height="6" fill="#728c48"/>
        <rect x="10" y="22" width="24" height="3" fill="#3a4a22"/>
        <circle cx="22" cy="13" r="8.5" fill="#6a8442" stroke="#28341a" stroke-width="1.6"/>
        <ellipse cx="18" cy="12" rx="2.2" ry="2.6" fill="#dc2626"/>
        <ellipse cx="26" cy="12" rx="2.2" ry="2.6" fill="#dc2626"/>
        <circle cx="18" cy="12.5" r="1" fill="#000"/>
        <circle cx="26" cy="12.5" r="1" fill="#000"/>
        <path d="M16 17 l12 0 -1 2 -10 0 z" fill="#28341a"/>
        <polygon points="17,19 18,15 19,19" fill="#fff"/>
        <polygon points="25,19 26,15 27,19" fill="#fff"/>
        <line x1="33" y1="36" x2="42" y2="20" stroke="#5a3a1c" stroke-width="2.6"/>
        <rect x="38" y="16" width="7" height="7" rx="1" fill="#3a3e46" stroke="#0a0408" stroke-width="1"/>
    </svg>`,

    skeleton: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.38)"/>
        <rect x="18" y="40" width="3.5" height="13" fill="#e8e6dc" stroke="#9a988c" stroke-width="1"/>
        <rect x="23.5" y="40" width="3.5" height="13" fill="#e8e6dc" stroke="#9a988c" stroke-width="1"/>
        <rect x="16" y="24" width="12" height="18" rx="3" fill="#d8d6cc" stroke="#9a988c" stroke-width="1.2"/>
        <line x1="16" y1="29" x2="28" y2="29" stroke="#9a988c" stroke-width="1"/>
        <line x1="16" y1="33" x2="28" y2="33" stroke="#9a988c" stroke-width="1"/>
        <line x1="16" y1="37" x2="28" y2="37" stroke="#9a988c" stroke-width="1"/>
        <circle cx="22" cy="16" r="7.5" fill="#f0eee4" stroke="#9a988c" stroke-width="1.2"/>
        <ellipse cx="19" cy="16" rx="2.2" ry="2.6" fill="#1a1a1a"/>
        <ellipse cx="25" cy="16" rx="2.2" ry="2.6" fill="#1a1a1a"/>
        <circle cx="19" cy="16" r="0.8" fill="#dc2626"/>
        <circle cx="25" cy="16" r="0.8" fill="#dc2626"/>
        <line x1="20" y1="20" x2="20" y2="22" stroke="#9a988c"/>
        <line x1="22" y1="20" x2="22" y2="22.5" stroke="#9a988c"/>
        <line x1="24" y1="20" x2="24" y2="22" stroke="#9a988c"/>
        <line x1="33" y1="36" x2="40" y2="10" stroke="#b8b6aa" stroke-width="2.2" stroke-linecap="round"/>
        <polygon points="40,10 42,7 38,14" fill="#cbd5e1" stroke="#475569" stroke-width="0.6"/>
    </svg>`,

    ogre: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="16" ry="3.6" fill="rgba(0,0,0,0.42)"/>
        <rect x="13" y="38" width="7" height="15" rx="2.5" fill="#6b5838" stroke="#332810" stroke-width="1"/>
        <rect x="25" y="38" width="7" height="15" rx="2.5" fill="#6b5838" stroke="#332810" stroke-width="1"/>
        <rect x="7" y="20" width="30" height="22" rx="6" fill="#8a7a5a" stroke="#403218" stroke-width="1.8"/>
        <rect x="7" y="20" width="30" height="7" fill="#a3936e"/>
        <circle cx="22" cy="13" r="9.5" fill="#94855f" stroke="#403218" stroke-width="1.8"/>
        <ellipse cx="17" cy="12" rx="2.4" ry="2" fill="#fff"/>
        <ellipse cx="27" cy="12" rx="2.4" ry="2" fill="#fff"/>
        <circle cx="17" cy="12" r="1.1" fill="#000"/>
        <circle cx="27" cy="12" r="1.1" fill="#000"/>
        <path d="M16 18 q6 4 12 0 l-2 3 -8 0 z" fill="#3a2c14"/>
        <polygon points="17,18 18,21 19,18" fill="#fff"/>
        <polygon points="25,18 26,21 27,18" fill="#fff"/>
        <line x1="35" y1="40" x2="44" y2="14" stroke="#5a3a1c" stroke-width="3.4" stroke-linecap="round"/>
        <ellipse cx="44" cy="12" rx="5" ry="6" fill="#6b4a28" stroke="#2e1c0d" stroke-width="1.2"/>
        <circle cx="42" cy="10" r="1.2" fill="#3a2410"/>
        <circle cx="46" cy="13" r="1.2" fill="#3a2410"/>
    </svg>`,

    demon: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3.3" fill="rgba(0,0,0,0.4)"/>
        <rect x="16" y="40" width="5.5" height="13" rx="2" fill="#7a1818" stroke="#3a0808" stroke-width="1"/>
        <rect x="23" y="40" width="5.5" height="13" rx="2" fill="#7a1818" stroke="#3a0808" stroke-width="1"/>
        <rect x="12" y="23" width="20" height="20" rx="4" fill="#b02828" stroke="#5a1010" stroke-width="1.6"/>
        <rect x="12" y="23" width="20" height="5" fill="#d04040"/>
        <circle cx="22" cy="15" r="8" fill="#c83838" stroke="#5a1010" stroke-width="1.6"/>
        <polygon points="14,9 11,3 18,8" fill="#7a1818" stroke="#3a0808" stroke-width="1"/>
        <polygon points="30,9 33,3 26,8" fill="#7a1818" stroke="#3a0808" stroke-width="1"/>
        <ellipse cx="18.5" cy="14.5" rx="2.2" ry="2.6" fill="#fde047"/>
        <ellipse cx="25.5" cy="14.5" rx="2.2" ry="2.6" fill="#fde047"/>
        <circle cx="18.5" cy="15" r="0.9" fill="#000"/>
        <circle cx="25.5" cy="15" r="0.9" fill="#000"/>
        <path d="M17 19 q5 4 10 0 l-2 2.5 -6 0 z" fill="#3a0808"/>
        <polygon points="18,19 19,21.5 20,19" fill="#fff"/>
        <polygon points="24,19 25,21.5 26,19" fill="#fff"/>
        <line x1="33" y1="36" x2="42" y2="20" stroke="#3a0808" stroke-width="2.4"/>
        <polygon points="42,20 45,17 40,25" fill="#dc2626" stroke="#7f1d1d" stroke-width="0.6"/>
    </svg>`,

    darksoldier: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="11" ry="3.1" fill="rgba(0,0,0,0.4)"/>
        <rect x="16" y="40" width="5.5" height="13" rx="2" fill="#2a2e38" stroke="#0a0c12" stroke-width="1"/>
        <rect x="23" y="40" width="5.5" height="13" rx="2" fill="#2a2e38" stroke="#0a0c12" stroke-width="1"/>
        <rect x="12" y="22" width="20" height="21" rx="4" fill="#3a3e4a" stroke="#13161e" stroke-width="1.6"/>
        <rect x="12" y="22" width="20" height="6" fill="#4e5360"/>
        <path d="M22 28 l4 5 -4 9 -4 -9 z" fill="#7c3aed" stroke="#3f1f6e" stroke-width="0.8"/>
        <circle cx="22" cy="14" r="7.5" fill="#2a2e38" stroke="#13161e" stroke-width="1.4"/>
        <path d="M14.5 14 a8 7 0 0 1 15 0 l-1 -2 -13 0 z" fill="#4a4e5a" stroke="#13161e" stroke-width="1.2"/>
        <rect x="15" y="13" width="14" height="2.6" fill="#7c3aed"/>
        <ellipse cx="18.5" cy="14" rx="1.4" ry="1.8" fill="#a78bfa"/>
        <ellipse cx="25.5" cy="14" rx="1.4" ry="1.8" fill="#a78bfa"/>
        <line x1="34" y1="9" x2="34" y2="32" stroke="#5a5e6a" stroke-width="2.6" stroke-linecap="round"/>
        <polygon points="34,9 36,5 32,9" fill="#7c3aed"/>
        <rect x="31" y="30" width="8" height="3" rx="1" fill="#13161e"/>
    </svg>`
};

// Maps a player troop type -> sprite key (fallback to warrior)
function charSprite(type) { return CHAR_SPRITES[type] || CHAR_SPRITES.warrior; }
// Rotating enemy variety
const ENEMY_KEYS = ['goblin', 'orc', 'skeleton', 'darksoldier', 'ogre', 'demon'];
function enemySpriteByIndex(i) { return ENEMY_SPRITES[ENEMY_KEYS[i % ENEMY_KEYS.length]]; }

// ============================================================
// BUILDING ICONS — flat custom art for build cards & info panel
// ============================================================
const BUILDING_ICON = {
    townhall: `<svg viewBox="0 0 48 48"><polygon points="6,20 24,6 42,20" fill="#e8b94a" stroke="#7a5410" stroke-width="2"/><rect x="10" y="20" width="28" height="20" fill="#e8d8b8" stroke="#5a4520" stroke-width="2"/><rect x="13" y="24" width="4" height="16" fill="#b8a878"/><rect x="22" y="24" width="4" height="16" fill="#b8a878"/><rect x="31" y="24" width="4" height="16" fill="#b8a878"/><circle cx="24" cy="14" r="3" fill="#fbbf24" stroke="#7a5410"/></svg>`,
    goldmine: `<svg viewBox="0 0 48 48"><polygon points="6,40 14,16 26,10 38,18 42,40" fill="#9c8870" stroke="#3a2818" stroke-width="2"/><path d="M16 40 v-8 a8 8 0 0 1 16 0 v8 z" fill="#1a0f08"/><circle cx="20" cy="36" r="2" fill="#fbc536"/><circle cx="27" cy="37" r="2" fill="#fbc536"/></svg>`,
    ironmine: `<svg viewBox="0 0 48 48"><polygon points="6,40 14,14 26,8 38,16 42,40" fill="#6a7080" stroke="#1a1e28" stroke-width="2"/><path d="M16 40 v-8 a8 8 0 0 1 16 0 v8 z" fill="#0a0a14"/><polygon points="19,36 23,34 25,38 21,40" fill="#cbd5e1"/></svg>`,
    lumbermill: `<svg viewBox="0 0 48 48"><polygon points="8,18 24,8 40,18" fill="#c89a40" stroke="#5a3010" stroke-width="2"/><rect x="11" y="18" width="26" height="22" fill="#a87d4a" stroke="#3a2010" stroke-width="2"/><circle cx="33" cy="28" r="6" fill="#cbd5e1" stroke="#1a1408" stroke-width="1.5"/><circle cx="33" cy="28" r="1.5" fill="#1a1408"/></svg>`,
    farm: `<svg viewBox="0 0 48 48"><polygon points="24,8 40,16 8,16" fill="#a02818" stroke="#5a0808" stroke-width="2"/><rect x="10" y="16" width="28" height="24" fill="#c0392b" stroke="#5a0808" stroke-width="2"/><path d="M20 40 v-12 a4 4 0 0 1 8 0 v12 z" fill="#3a2010"/><polygon points="24,20 25.5,23 28,23 26,25 27,28 24,26 21,28 22,25 20,23 22.5,23" fill="#fff"/></svg>`,
    coinmint: `<svg viewBox="0 0 48 48"><polygon points="6,18 24,8 42,18" fill="#e8b94a" stroke="#7a5410" stroke-width="2"/><rect x="10" y="18" width="28" height="22" fill="#f0ead8" stroke="#5a4818" stroke-width="2"/><rect x="14" y="22" width="4" height="14" fill="#d4c898"/><rect x="22" y="22" width="4" height="14" fill="#d4c898"/><rect x="30" y="22" width="4" height="14" fill="#d4c898"/><circle cx="24" cy="14" r="4" fill="#fbc536" stroke="#7a5410"/><text x="24" y="17" text-anchor="middle" font-size="6" font-weight="900" fill="#7a5410">$</text></svg>`,
    storage: `<svg viewBox="0 0 48 48"><polygon points="6,18 24,8 42,18" fill="#6b4520" stroke="#3a2010" stroke-width="2"/><rect x="10" y="18" width="28" height="22" fill="#a87d4a" stroke="#3a2010" stroke-width="2"/><rect x="18" y="24" width="12" height="16" fill="#2a1808"/><line x1="24" y1="24" x2="24" y2="40" stroke="#5a3818" stroke-width="1.5"/></svg>`,
    barracks: `<svg viewBox="0 0 48 48"><rect x="8" y="20" width="32" height="20" fill="#a89e8e" stroke="#1a1408" stroke-width="2"/><rect x="6" y="14" width="10" height="26" fill="#9c948a" stroke="#1a1408" stroke-width="2"/><rect x="32" y="14" width="10" height="26" fill="#9c948a" stroke="#1a1408" stroke-width="2"/><path d="M18 40 v-8 a6 6 0 0 1 12 0 v8 z" fill="#3a2010"/><line x1="18" y1="14" x2="30" y2="24" stroke="#cbd5e1" stroke-width="2.5"/><line x1="30" y1="14" x2="18" y2="24" stroke="#cbd5e1" stroke-width="2.5"/></svg>`,
    stable: `<svg viewBox="0 0 48 48"><polygon points="8,18 24,8 40,18" fill="#c89a40" stroke="#5a3010" stroke-width="2"/><rect x="11" y="18" width="26" height="22" fill="#a87d4a" stroke="#3a2010" stroke-width="2"/><ellipse cx="24" cy="30" rx="5" ry="7" fill="#5a3818"/><ellipse cx="22" cy="24" rx="3" ry="4" fill="#5a3818"/></svg>`,
    researchlab: `<svg viewBox="0 0 48 48"><rect x="10" y="14" width="28" height="26" rx="3" fill="#1e3a5a" stroke="#0a1a2e" stroke-width="2"/><path d="M20 18 v6 l-5 10 a2 2 0 0 0 2 3 h14 a2 2 0 0 0 2 -3 l-5 -10 v-6 z" fill="#5fb0f0" stroke="#0a1a2e" stroke-width="1.5"/><circle cx="22" cy="32" r="1.6" fill="#fff"/><circle cx="26" cy="35" r="1.2" fill="#fff"/></svg>`,
    fortress: `<svg viewBox="0 0 48 48"><rect x="6" y="22" width="36" height="18" fill="#5e5448" stroke="#0a0408" stroke-width="2"/><rect x="4" y="12" width="11" height="28" fill="#4e4438" stroke="#0a0408" stroke-width="2"/><rect x="33" y="12" width="11" height="28" fill="#5e5448" stroke="#0a0408" stroke-width="2"/><rect x="18" y="8" width="12" height="32" fill="#a89e8e" stroke="#0a0408" stroke-width="2"/><path d="M20 40 v-8 a4 4 0 0 1 8 0 v8 z" fill="#1a0808"/></svg>`,
    wall: `<svg viewBox="0 0 48 48"><rect x="6" y="18" width="36" height="22" fill="#9c948a" stroke="#1a1408" stroke-width="2"/><rect x="6" y="12" width="7" height="6" fill="#9c948a" stroke="#1a1408" stroke-width="1.5"/><rect x="16" y="12" width="7" height="6" fill="#9c948a" stroke="#1a1408" stroke-width="1.5"/><rect x="26" y="12" width="7" height="6" fill="#9c948a" stroke="#1a1408" stroke-width="1.5"/><rect x="36" y="12" width="6" height="6" fill="#9c948a" stroke="#1a1408" stroke-width="1.5"/><line x1="6" y1="28" x2="42" y2="28" stroke="#5a5448" stroke-width="1.5"/><line x1="24" y1="18" x2="24" y2="28" stroke="#5a5448" stroke-width="1.5"/></svg>`,
    archertower: `<svg viewBox="0 0 48 48"><polygon points="14,16 24,4 34,16" fill="#a02818" stroke="#5a0808" stroke-width="2"/><rect x="16" y="16" width="16" height="24" fill="#9c948a" stroke="#1a1408" stroke-width="2"/><rect x="20" y="22" width="3" height="8" fill="#0a0408"/><rect x="25" y="22" width="3" height="8" fill="#0a0408"/><path d="M18 20 q6 -4 12 0" stroke="#5a3818" stroke-width="2" fill="none"/></svg>`,
    cannon: `<svg viewBox="0 0 48 48"><rect x="6" y="30" width="36" height="10" fill="#5e5448" stroke="#0a0408" stroke-width="2"/><ellipse cx="22" cy="26" rx="16" ry="6" fill="#2a2418" stroke="#000" stroke-width="2"/><ellipse cx="38" cy="26" rx="3" ry="5" fill="#000"/><circle cx="12" cy="38" r="5" fill="#2a1c10" stroke="#000" stroke-width="1.5"/><circle cx="34" cy="38" r="5" fill="#2a1c10" stroke="#000" stroke-width="1.5"/></svg>`,
    mortar: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="40" rx="17" ry="4" fill="rgba(0,0,0,0.35)"/><path d="M 10 38 L 38 38 L 34 30 L 14 30 Z" fill="#4e4438" stroke="#0a0408" stroke-width="2"/><path d="M 17 32 Q 14 18 24 12 Q 34 18 31 32 Z" fill="#2a2418" stroke="#000" stroke-width="2"/><ellipse cx="24" cy="13" rx="7" ry="3.4" fill="#000"/><ellipse cx="24" cy="13" rx="4.5" ry="2" fill="#1a1408"/><circle cx="13" cy="35" r="2.2" fill="#7a4818" stroke="#000"/><circle cx="35" cy="35" r="2.2" fill="#7a4818" stroke="#000"/></svg>`
};
function buildingIcon(type) { return BUILDING_ICON[type] || ''; }

// ============================================================
// TOP-DOWN BATTLE TOKENS — clean bird's-eye unit art
// viewBox 0 0 40 40, facing "up" (toward the enemy). Enemies are rotated 180°.
// ============================================================
const TOP_WEAPON = {
    warrior:'sword', knight:'sword', paladin:'goldsword', archer:'bow', crossbowman:'crossbow',
    shieldbearer:'shield', pikeman:'spear', cavalry:'mounted', siege:'siege', catapult:'siege'
};

function _topWeapon(w) {
    switch (w) {
        case 'sword': return `<ellipse cx="9" cy="19" rx="4" ry="5" fill="#c0392b" stroke="#6e190f" stroke-width="1"/>
            <rect x="28" y="4" width="2.6" height="16" rx="1.2" fill="#e6eaf1" stroke="#5a5e66" stroke-width="0.6"/>
            <rect x="26.3" y="19" width="6" height="2" rx="1" fill="#7a5a30"/>`;
        case 'goldsword': return `<ellipse cx="9" cy="19" rx="4" ry="5" fill="#e0b020" stroke="#9a7320" stroke-width="1"/>
            <rect x="28" y="3" width="2.8" height="17" rx="1.2" fill="#fff8d8" stroke="#a9842c" stroke-width="0.6"/>
            <rect x="26" y="19" width="7" height="2" rx="1" fill="#caa23a"/>`;
        case 'bow': return `<path d="M10 9 Q20 2 30 9" stroke="#7a4a1e" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <line x1="10" y1="9" x2="30" y2="9" stroke="#f0f0f0" stroke-width="0.7"/>
            <line x1="20" y1="2" x2="20" y2="13" stroke="#cbd5e1" stroke-width="1.6"/>
            <polygon points="20,1 17.5,5 22.5,5" fill="#cbd5e1"/>`;
        case 'crossbow': return `<rect x="11" y="7" width="18" height="3" rx="1.5" fill="#5a3a1c" stroke="#2a1808" stroke-width="0.5"/>
            <rect x="18.6" y="5" width="2.8" height="15" rx="1" fill="#3a2410"/>
            <line x1="20" y1="3" x2="20" y2="9" stroke="#cbd5e1" stroke-width="1.4"/>`;
        case 'shield': return `<path d="M9 12 Q20 3 31 12 L29 18 Q20 12 11 18 Z" fill="#7c3aed" stroke="#3f1f6e" stroke-width="1.2"/>
            <line x1="20" y1="7" x2="20" y2="16" stroke="#e7c24c" stroke-width="1"/>
            <line x1="13" y1="12" x2="27" y2="12" stroke="#e7c24c" stroke-width="1"/>`;
        case 'spear': return `<rect x="18.9" y="-2" width="2.2" height="24" rx="1" fill="#7a4a1e"/>
            <polygon points="20,-3 16.5,4 23.5,4" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>`;
        case 'club': return `<rect x="27" y="6" width="4" height="14" rx="2" fill="#5a3a1c" stroke="#2e1c0d" stroke-width="0.6"/>
            <ellipse cx="29" cy="5" rx="5" ry="5.5" fill="#6b4520" stroke="#2e1c0d" stroke-width="1"/>
            <circle cx="27" cy="3.5" r="1" fill="#3a2410"/><circle cx="31" cy="6" r="1" fill="#3a2410"/>`;
        default: return '';
    }
}

function topUnitSVG(type, isEnemy, variant) {
    const allyPal = { base: '#62a4f7', baseDark: '#1e4fa0', body: '#3b6fd6', bodyDark: '#163a78', skin: '#f1c89a' };
    const enemyPals = [
        { base: '#e35d5d', baseDark: '#7e1818', body: '#b23434', bodyDark: '#6e1414', skin: '#7e9a4e' }, // goblin/orc
        { base: '#c9c4b6', baseDark: '#7a766a', body: '#d8d4c8', bodyDark: '#9a968a', skin: '#eceadf' },  // skeleton
        { base: '#b070e0', baseDark: '#5a2a8a', body: '#8a4ec0', bodyDark: '#4a1f7a', skin: '#caa0f0' },  // demon/mage
        { base: '#9a8a5a', baseDark: '#5a4a28', body: '#8a7a4a', bodyDark: '#403218', skin: '#94855f' }   // ogre
    ];
    const pal = isEnemy ? enemyPals[(variant || 0) % enemyPals.length] : allyPal;
    let weapon;
    if (isEnemy) weapon = ((variant || 0) % 4 === 3) ? 'club' : 'sword';
    else weapon = TOP_WEAPON[type] || 'sword';

    if (weapon === 'mounted') {
        return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="27" rx="14" ry="6" fill="rgba(0,0,0,0.32)"/>
            <g ${isEnemy ? 'transform="rotate(180 20 20)"' : ''}>
                <ellipse cx="20" cy="22" rx="9" ry="14" fill="#6b4a2a" stroke="#2e1c0d" stroke-width="1.4"/>
                <ellipse cx="20" cy="9" rx="4" ry="5" fill="#6b4a2a" stroke="#2e1c0d" stroke-width="1"/>
                <circle cx="20" cy="20" r="7" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="2"/>
                <circle cx="20" cy="19" r="3.6" fill="${pal.skin}" stroke="#a9743c" stroke-width="0.8"/>
                <rect x="27" y="6" width="2.4" height="14" rx="1" fill="#e6eaf1" stroke="#5a5e66" stroke-width="0.5"/>
            </g>
        </svg>`;
    }
    if (weapon === 'siege') {
        return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="30" rx="16" ry="5" fill="rgba(0,0,0,0.35)"/>
            <rect x="8" y="11" width="24" height="20" rx="2" fill="#7a4a22" stroke="#3a2010" stroke-width="1.6"/>
            <polygon points="8,11 32,11 27,4 13,4" fill="#8a5a2a" stroke="#3a2010" stroke-width="1"/>
            <circle cx="11" cy="31" r="3.4" fill="#2a1c10" stroke="#0a0408"/><circle cx="29" cy="31" r="3.4" fill="#2a1c10" stroke="#0a0408"/>
            <ellipse cx="20" cy="7" rx="3.6" ry="2.6" fill="#3a3328" stroke="#000" stroke-width="0.6"/>
        </svg>`;
    }
    const ranged = weapon === 'bow' || weapon === 'crossbow';
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="27" rx="11" ry="4.5" fill="rgba(0,0,0,0.32)"/>
        <g ${isEnemy ? 'transform="rotate(180 20 20)"' : ''}>
            ${ranged ? '' : `<!-- round shield on the left arm -->
            <circle cx="10.5" cy="21" r="5" fill="#c79a4e" stroke="#4a2f14" stroke-width="1.5"/>
            <circle cx="10.5" cy="21" r="2" fill="#e9cd86" stroke="#7a5320" stroke-width="0.8"/>`}
            <!-- armored shoulders -->
            <circle cx="13" cy="16" r="4.2" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.5"/>
            <circle cx="27" cy="16" r="4.2" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.5"/>
            <!-- torso / chestplate -->
            <path d="M12.5 16 Q20 13.5 27.5 16 L26 25.5 Q20 28.5 14 25.5 Z" fill="${pal.body}" stroke="${pal.bodyDark}" stroke-width="1.5"/>
            <path d="M20 16.5 V26" stroke="${pal.bodyDark}" stroke-width="0.9" opacity="0.45"/>
            <path d="M14 18 Q20 16.5 26 18" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
            <!-- helmet + face -->
            <circle cx="20" cy="15.5" r="6.2" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.8"/>
            <path d="M14.2 13.5 Q20 11 25.8 13.5" fill="none" stroke="${pal.baseDark}" stroke-width="1.6"/>
            <ellipse cx="20" cy="16.3" rx="3.4" ry="3.8" fill="${pal.skin}" stroke="#8a5a2a" stroke-width="0.9"/>
            <line x1="20" y1="13" x2="20" y2="19.5" stroke="rgba(0,0,0,0.25)" stroke-width="0.7"/>
            ${_topWeapon(weapon)}
        </g>
    </svg>`;
}
