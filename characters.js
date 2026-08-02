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
        <!-- sword -->
        <rect x="33.3" y="7.5" width="3.2" height="21.5" rx="1.4" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34.1" y="8.2" width="0.9" height="20" fill="#f3f6fb"><animate attributeName="opacity" values="0.35;1;0.35" dur="2.8s" repeatCount="indefinite"/></rect>
        <polygon points="33.3,7.5 36.5,7.5 34.9,2.8" fill="#dfe4ec" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="30.6" y="28.6" width="8.6" height="2.9" rx="1.3" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="33.8" y="31.2" width="2.4" height="4" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="35" cy="36.4" r="1.7" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- legs + boots -->
        <rect x="15.6" y="39" width="5.4" height="12" rx="2.4" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23" y="39" width="5.4" height="12" rx="2.4" fill="#3c2a18" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="14.6" y="49.6" width="6.8" height="4.2" rx="1.9" fill="#6b4a26" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.6" y="49.6" width="6.8" height="4.2" rx="1.9" fill="#59391c" stroke="#2a1a0e" stroke-width="1"/>
        <!-- sword arm -->
        <path d="M29.5 26.5 Q34.5 28 34.6 32.5" stroke="#2a1a0e" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M29.5 26.5 Q34.5 28 34.6 32.5" stroke="#2f5cb8" stroke-width="4.2" fill="none" stroke-linecap="round"/>
        <circle cx="34.7" cy="33.2" r="2.4" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- torso: blue tunic, lit from upper-left -->
        <path d="M12.6 24.5 q9.4 -3.6 18.8 0 l0.5 15 q-9.9 3.4 -19.8 0 z" fill="#2f5cb8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M13.2 25 q4.4 -1.7 8.8 -1.7 l-0.2 16.6 q-4.4 -0.2 -8.4 -1.5 z" fill="#4a7ce0"/>
        <path d="M14.2 26.6 q3 -1.1 5.4 -1.2" stroke="#7fa6f2" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <rect x="12.4" y="36.6" width="19.4" height="3.4" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="20" y="36.2" width="4.2" height="4.2" rx="0.9" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- pauldrons -->
        <circle cx="13.5" cy="25.5" r="3.4" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M10.7 24.2 a3.4 3.4 0 0 1 3.4 -2" stroke="#f0f3f8" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <circle cx="30.5" cy="25.5" r="3.4" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="1"/>
        <!-- head -->
        <circle cx="22" cy="15" r="7" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.4 18.6 a7 7 0 0 0 11.2 0 q-2.6 1.7 -5.6 1.7 q-3 0 -5.6 -1.7z" fill="#e5b988" opacity="0.75"/>
        <circle cx="19.6" cy="16.4" r="0.85" fill="#2a1a0e"/>
        <circle cx="24.4" cy="16.4" r="0.85" fill="#2a1a0e"/>
        <path d="M20.6 19 q1.4 1 2.8 0" stroke="#8a5a2a" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <!-- steel helm -->
        <path d="M14.7 14.6 a7.3 7.3 0 0 1 14.6 0 l0 0.6 -14.6 0 z" fill="#b9c0cc" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M15.7 12.4 a7 7 0 0 1 5.9 -4.8 l0.1 3 q-3.6 0.3 -6 1.8z" fill="#e2e7ef"/>
        <rect x="14.2" y="12.8" width="15.6" height="2.9" rx="1.4" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="20.9" y="13.4" width="2.2" height="5.6" rx="1" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="22" cy="7.4" r="1.3" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- round shield -->
        <circle cx="8.6" cy="32" r="6.4" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M3.6 28.6 a6.4 6.4 0 0 1 6.4 -3 l-0.3 3.4 q-3.3 -0.6 -6.1 -0.4z" fill="#d05540"/>
        <circle cx="8.6" cy="32" r="4.1" fill="none" stroke="#e7c24c" stroke-width="1.1"/>
        <circle cx="8.6" cy="32" r="1.9" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="8" cy="31.4" r="0.6" fill="#ffffff"/>
    </svg>`,

    archer: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="11" ry="3" fill="rgba(0,0,0,0.35)"/>
        <!-- quiver on back -->
        <g transform="rotate(16 33 25)">
            <rect x="30.6" y="19" width="5.2" height="12.5" rx="2.2" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1"/>
            <rect x="30.6" y="19" width="2.2" height="12.5" rx="1.5" fill="#94602f"/>
            <line x1="32.2" y1="19.4" x2="32.6" y2="13.8" stroke="#8a5a26" stroke-width="1.1"/>
            <line x1="34.4" y1="19.4" x2="35.2" y2="14.4" stroke="#6b4420" stroke-width="1.1"/>
            <polygon points="32.7,11.6 30.9,15.2 34.3,15" fill="#d24a3a" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="35.4,12.4 33.7,15.8 37,15.6" fill="#e0e4ea" stroke="#2a1a0e" stroke-width="0.6"/>
        </g>
        <!-- legs + boots -->
        <rect x="16" y="39.5" width="5.2" height="11" rx="2.3" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="39.5" width="5.2" height="11" rx="2.3" fill="#3c2a18" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="15" y="49.4" width="6.6" height="4.2" rx="1.9" fill="#6b4a26" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.4" y="49.4" width="6.6" height="4.2" rx="1.9" fill="#59391c" stroke="#2a1a0e" stroke-width="1"/>
        <!-- tunic: forest green, lit upper-left -->
        <path d="M13.6 25 q8.4 -3.2 16.8 0 l0.5 14.2 q-8.9 3 -17.8 0 z" fill="#2f8a3e" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M14.2 25.5 q4 -1.5 7.8 -1.5 l-0.2 15.6 q-3.9 -0.2 -7.4 -1.4 z" fill="#46ab58"/>
        <line x1="15.2" y1="26.4" x2="28.6" y2="37.6" stroke="#5a3a1c" stroke-width="2.3"/>
        <rect x="13.4" y="36.4" width="17.4" height="3.2" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="20.2" y="36" width="3.8" height="4" rx="0.8" fill="#b78a3c" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- shoulder cape -->
        <path d="M13.2 25.2 q8.8 -4.6 17.6 0 l-1.2 4.2 q-7.6 -3.2 -15.2 0 z" fill="#1f6e2c" stroke="#2a1a0e" stroke-width="1"/>
        <!-- head + hood -->
        <circle cx="22" cy="15.5" r="6.6" fill="#e8b98a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.8 18.8 a6.6 6.6 0 0 0 10.4 0 q-2.4 1.5 -5.2 1.5 q-2.8 0 -5.2 -1.5z" fill="#d6a274" opacity="0.75"/>
        <circle cx="19.8" cy="16.2" r="0.8" fill="#2a1a0e"/>
        <circle cx="24.2" cy="16.2" r="0.8" fill="#2a1a0e"/>
        <path d="M20.7 18.8 q1.3 0.9 2.6 0" stroke="#8a5a2a" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <path d="M14.7 17.2 q-1.2 -11.4 7.3 -12 q8.5 0.6 7.3 12 q-1.5 -3.6 -7.3 -3.6 q-5.8 0 -7.3 3.6z" fill="#1f6e2c" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M16.2 13 q1.3 -5.4 5.6 -6.2 l0.1 2.6 q-3.5 0.7 -5.7 3.6z" fill="#339142"/>
        <path d="M27.6 9.4 q3.4 -3 5.6 -2.2 q-1.4 3.4 -4.6 4.4z" fill="#d24a3a" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- longbow, drawn -->
        <path d="M8.5 11 Q2.5 26 8.5 41" fill="none" stroke="#2a1a0e" stroke-width="4" stroke-linecap="round"/>
        <path d="M8.5 11 Q2.5 26 8.5 41" fill="none" stroke="#8a5a26" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M8.5 11 Q2.5 26 8.5 41" fill="none" stroke="#b57c3e" stroke-width="1"/>
        <polyline points="8.5,11 15.5,26 8.5,41" fill="none" stroke="#efe9da" stroke-width="0.8"/>
        <line x1="15.5" y1="26" x2="2.4" y2="26" stroke="#9a6a30" stroke-width="1.2"/>
        <polygon points="1.2,26 5.6,24.2 5.6,27.8" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.6"/>
        <polygon points="15.5,26 13.2,23.9 13.2,28.1" fill="#d24a3a"/>
        <path d="M16.5 27.2 Q11 28.4 7 27" stroke="#2a1a0e" stroke-width="5.2" fill="none" stroke-linecap="round"/>
        <path d="M16.5 27.2 Q11 28.4 7 27" stroke="#2f8a3e" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <circle cx="6.4" cy="26.8" r="2" fill="#e8b98a" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="15.5" cy="26" r="2.1" fill="#e8b98a" stroke="#2a1a0e" stroke-width="0.9"/>
    </svg>`,

    shieldbearer: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="13" ry="3.2" fill="rgba(0,0,0,0.38)"/>
        <!-- mace in right hand -->
        <rect x="34.2" y="16" width="2.6" height="18" rx="1.2" fill="#7a4a22" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="35.5" cy="13.5" r="4" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M32.4 11.8 a4 4 0 0 1 3.4 -2.2" stroke="#dfe4ec" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <polygon points="35.5,7.6 34.4,10.2 36.6,10.2" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.7"/>
        <polygon points="40.6,12.4 37.8,12.6 38.8,14.6" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.7"/>
        <polygon points="30.4,12.4 33.2,12.6 32.2,14.6" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- legs + boots -->
        <rect x="15.4" y="39" width="6" height="12" rx="2.5" fill="#4a4038" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23.6" y="39" width="6" height="12" rx="2.5" fill="#3c332c" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="14.4" y="49.4" width="7.4" height="4.4" rx="2" fill="#5a4028" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23" y="49.4" width="7.4" height="4.4" rx="2" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <!-- mace arm -->
        <path d="M29.5 26 Q34.8 27.5 35.4 31" stroke="#2a1a0e" stroke-width="6.2" fill="none" stroke-linecap="round"/>
        <path d="M29.5 26 Q34.8 27.5 35.4 31" stroke="#8a6b3a" stroke-width="4.4" fill="none" stroke-linecap="round"/>
        <circle cx="35.5" cy="31.6" r="2.4" fill="#c98d5a" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- bronze cuirass -->
        <path d="M11.8 24 q10.2 -3.8 20.4 0 l0.6 15.4 q-10.8 3.6 -21.6 0 z" fill="#8a6b3a" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M12.4 24.6 q4.8 -1.8 9.6 -1.8 l-0.2 17 q-4.8 -0.2 -9.2 -1.6 z" fill="#ab8a50"/>
        <path d="M13.6 26.2 q3.2 -1.2 5.8 -1.3" stroke="#cfae6e" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <rect x="11.6" y="36.8" width="20.8" height="3.4" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="20" y="36.4" width="4.4" height="4.2" rx="0.9" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="30.6" cy="25.6" r="3.6" fill="#7b8290" stroke="#2a1a0e" stroke-width="1"/>
        <!-- head -->
        <circle cx="22" cy="15" r="7" fill="#c98d5a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.4 18.6 a7 7 0 0 0 11.2 0 q-2.6 1.7 -5.6 1.7 q-3 0 -5.6 -1.7z" fill="#b0743f" opacity="0.75"/>
        <circle cx="19.6" cy="16.4" r="0.85" fill="#2a1a0e"/>
        <circle cx="24.4" cy="16.4" r="0.85" fill="#2a1a0e"/>
        <path d="M20.6 19.2 l2.8 0" stroke="#7a4a22" stroke-width="0.9" stroke-linecap="round"/>
        <!-- kettle helm -->
        <path d="M15.4 13.2 a6.8 6.8 0 0 1 13.2 0 l0 1 -13.2 0 z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M16.4 11.4 a6.4 6.4 0 0 1 5.2 -4.3 l0.1 2.8 q-3.2 0.3 -5.3 1.5z" fill="#c7ccd6"/>
        <ellipse cx="22" cy="14.2" rx="9.2" ry="2.4" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="1"/>
        <ellipse cx="18.6" cy="13.6" rx="3.4" ry="1" fill="#dfe4ec"/>
        <!-- tower shield -->
        <path d="M2.6 18.5 h10.8 q1.4 0 1.4 1.5 l0 24.5 q0 1.5 -1.4 1.5 l-4 1.6 -4 -1.6 q-1.4 0 -1.4 -1.5 l-1.4 -24.5 q0 -1.5 1.4 -1.5z" fill="#6d2fd8" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M3.2 19.4 h5 l-0.2 26.2 -2.6 -1.1 q-1.2 0 -1.2 -1.4 l-1.2 -22.4 q0 -1.3 1.2 -1.3z" fill="#9b5cff"/>
        <path d="M4.2 20.6 q2 -0.3 3.6 -0.3" stroke="#c4a1ff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <rect x="3.6" y="27.4" width="10" height="2.2" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="7.2" y="20.6" width="2.2" height="22" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="4.6" cy="21.4" r="0.7" fill="#3f1f6e"/>
        <circle cx="12" cy="21.4" r="0.7" fill="#3f1f6e"/>
        <circle cx="4.9" cy="42.6" r="0.7" fill="#3f1f6e"/>
        <circle cx="11.9" cy="42.6" r="0.7" fill="#3f1f6e"/>
    </svg>`,

    cavalry: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="16" ry="3.4" fill="rgba(0,0,0,0.38)"/>
        <!-- lance (behind rider) -->
        <line x1="9" y1="36" x2="40" y2="5" stroke="#2a1a0e" stroke-width="3.2" stroke-linecap="round"/>
        <line x1="9" y1="36" x2="40" y2="5" stroke="#8a5a26" stroke-width="2" stroke-linecap="round"/>
        <line x1="10.5" y1="34" x2="30" y2="14.5" stroke="#b57c3e" stroke-width="0.8"/>
        <polygon points="41.8,3.2 36.6,5.4 39.6,8.4" fill="#dfe4ec" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="33,12 36.6,8.4 38.4,10.2 34.8,13.8" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- horse tail -->
        <path d="M6.6 34 q-4.6 3 -3.6 9.6 q3.6 -1.4 5.4 -6.6z" fill="#4a2f16" stroke="#2a1a0e" stroke-width="1"/>
        <!-- horse legs -->
        <rect x="8.6" y="42" width="3" height="9.6" rx="1.3" fill="#6b4526" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="14.2" y="43" width="3" height="8.6" rx="1.3" fill="#59391e" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="25" y="43" width="3" height="8.6" rx="1.3" fill="#59391e" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="30.6" y="42" width="3" height="9.6" rx="1.3" fill="#6b4526" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="8.4" y="50.4" width="3.4" height="2.4" rx="1" fill="#2f2013"/>
        <rect x="14" y="50.6" width="3.4" height="2.2" rx="1" fill="#2f2013"/>
        <rect x="24.8" y="50.6" width="3.4" height="2.2" rx="1" fill="#2f2013"/>
        <rect x="30.4" y="50.4" width="3.4" height="2.4" rx="1" fill="#2f2013"/>
        <!-- horse body + neck + head -->
        <path d="M6.4 38.6 q-0.6 -7.8 8 -8.6 l12.6 0 q5.4 0.4 7 4.2 l1.6 -8 q0.4 -3.4 3.4 -4 l2.6 2 q1.2 0.8 0.6 2.6 l-2.2 2 -1.4 8.6 q-0.6 6.6 -8.2 6.8 l-15.4 0 q-8 -0.4 -8.6 -5.6z" fill="#8a5a30" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M7.4 37.6 q0 -6 7.2 -6.8 l7 0 -0.4 10.8 -7.4 0 q-6 -0.4 -6.4 -4z" fill="#a5713d"/>
        <path d="M35.4 22.4 q2.6 -3.6 4.2 -2.8" stroke="#2a1a0e" stroke-width="0.9" fill="none"/>
        <polygon points="36.2,21.6 35.2,18.2 38,20.2" fill="#8a5a30" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="38.6" cy="24.2" r="0.9" fill="#2a1a0e"/>
        <ellipse cx="41" cy="27.4" rx="1.8" ry="1.3" fill="#59391e"/>
        <path d="M34.6 21.8 q-3.2 1.6 -3.8 8.4" stroke="#4a2f16" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <!-- saddle + strap -->
        <path d="M15.4 30.2 q6.6 -2 12.4 0 l-0.8 4.6 q-5.4 -1.4 -10.8 0z" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="21.4" y1="34.4" x2="21.4" y2="42.4" stroke="#3a2410" stroke-width="1.8"/>
        <!-- rider legs -->
        <path d="M17 30 q-1.6 5.4 1 8.4" stroke="#2a1a0e" stroke-width="4.6" fill="none" stroke-linecap="round"/>
        <path d="M17 30 q-1.6 5.4 1 8.4" stroke="#8a3226" stroke-width="3" fill="none" stroke-linecap="round"/>
        <!-- rider torso: crimson tabard -->
        <path d="M16.6 17.4 q5.4 -2.2 10.6 0 l0.6 12.6 q-6 2 -11.8 0 z" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M17.2 18 q2.6 -1 5 -1 l-0.2 13.4 q-2.6 -0.2 -4.8 -1 z" fill="#d05540"/>
        <rect x="16.4" y="27.2" width="11.4" height="2.6" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="17.4" cy="18.8" r="2.6" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- lance arm -->
        <path d="M25.8 19.6 Q29.4 21.4 30.4 24.6" stroke="#2a1a0e" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M25.8 19.6 Q29.4 21.4 30.4 24.6" stroke="#8a3226" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <circle cx="30.8" cy="25.4" r="2.1" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- rider head + helm -->
        <circle cx="21.6" cy="11" r="5.4" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="19.9" cy="12" r="0.75" fill="#2a1a0e"/>
        <circle cx="23.5" cy="12" r="0.75" fill="#2a1a0e"/>
        <path d="M20.6 14.2 q1 0.8 2 0" stroke="#8a5a2a" stroke-width="0.7" fill="none" stroke-linecap="round"/>
        <path d="M16 10.6 a5.7 5.7 0 0 1 11.2 0 l0 0.6 -11.2 0 z" fill="#b9c0cc" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.9 9 a5.4 5.4 0 0 1 4.2 -3.6 l0.1 2.4 q-2.7 0.3 -4.3 1.2z" fill="#e2e7ef"/>
        <path d="M21.6 5 q0.4 -3.4 2.6 -4.4 q1.6 2.6 0.2 5.2z" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.8"/>
    </svg>`,

    knight: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3.2" fill="rgba(0,0,0,0.38)"/>
        <!-- longsword -->
        <rect x="33.6" y="5" width="3.2" height="24" rx="1.4" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34.4" y="5.8" width="0.9" height="22.4" fill="#f6f9fd"/>
        <polygon points="33.6,5 36.8,5 35.2,0.8" fill="#e8ecf3" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="30.8" y="28.8" width="9" height="3" rx="1.3" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34.1" y="31.6" width="2.4" height="4" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="35.3" cy="36.8" r="1.8" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- plate legs -->
        <rect x="15.6" y="39" width="5.6" height="12" rx="2.5" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23" y="39" width="5.6" height="12" rx="2.5" fill="#949bab" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="18.4" cy="44" r="1.5" fill="#dfe4ec" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="25.8" cy="44" r="1.5" fill="#c3c9d5" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="14.6" y="49.6" width="7" height="4.2" rx="1.9" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="49.6" width="7" height="4.2" rx="1.9" fill="#7b8290" stroke="#2a1a0e" stroke-width="1"/>
        <!-- sword arm -->
        <path d="M29.8 26.5 Q35 28.2 35.1 33" stroke="#2a1a0e" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M29.8 26.5 Q35 28.2 35.1 33" stroke="#a4abba" stroke-width="4.2" fill="none" stroke-linecap="round"/>
        <circle cx="35.2" cy="33.6" r="2.3" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- cuirass -->
        <path d="M12.4 24.2 q9.6 -3.8 19.2 0 l0.6 15.2 q-10.2 3.6 -20.4 0 z" fill="#b9c0cc" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M13 24.8 q4.6 -1.8 9 -1.8 l-0.2 16.8 q-4.6 -0.2 -8.6 -1.6 z" fill="#dce2ea"/>
        <path d="M14.2 26.4 q3.2 -1.2 5.8 -1.3" stroke="#f6f9fd" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <path d="M22 25 l4.6 4.4 -4.6 8.4 -4.6 -8.4 z" fill="#2f5cb8" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M22 26.6 l2.9 2.9 -2.9 5.2 -2.9 -5.2 z" fill="#4a7ce0"/>
        <rect x="12.2" y="37" width="19.8" height="3.2" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="20" y="36.6" width="4.2" height="4" rx="0.9" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- pauldrons -->
        <path d="M9.6 26.8 a4.4 4.4 0 0 1 8 -2.6 l-1.2 4.6 z" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M34.4 26.8 a4.4 4.4 0 0 0 -8 -2.6 l1.2 4.6 z" fill="#9aa1b0" stroke="#2a1a0e" stroke-width="1"/>
        <!-- great helm -->
        <path d="M14.8 9.2 q0 -6 7.2 -6.2 q7.2 0.2 7.2 6.2 l0 8.4 q0 3.6 -3.6 3.8 l-7.2 0 q-3.6 -0.2 -3.6 -3.8 z" fill="#b9c0cc" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M15.6 9.4 q0 -5.2 6 -5.6 l0.1 17 -2.3 0 q-3.8 -0.2 -3.8 -3.4 z" fill="#dce2ea"/>
        <rect x="14.8" y="12.2" width="14.4" height="2.6" rx="1.2" fill="#1c222c"/>
        <circle cx="18.6" cy="13.5" r="0.7" fill="#5fa8ff" opacity="0.9"/>
        <circle cx="25.4" cy="13.5" r="0.7" fill="#5fa8ff" opacity="0.9"/>
        <line x1="22" y1="15.6" x2="22" y2="20" stroke="#7b8290" stroke-width="1"/>
        <line x1="19" y1="16.4" x2="19" y2="19.6" stroke="#7b8290" stroke-width="0.8"/>
        <line x1="25" y1="16.4" x2="25" y2="19.6" stroke="#7b8290" stroke-width="0.8"/>
        <!-- plume -->
        <path d="M22 3.2 q0.6 -3 3 -3.2 q2.8 2.6 1 5.4 q-2.4 1 -4 -0.6z" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- heater shield -->
        <path d="M2 24 h11 l0 9 q0 6.6 -5.5 9.4 q-5.5 -2.8 -5.5 -9.4 z" fill="#2f5cb8" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M2.8 24.8 h4.6 l-0.1 15.8 q-4.5 -2.8 -4.5 -8z" fill="#4a7ce0"/>
        <polygon points="7.5,27 8.9,30.4 12.5,30.6 9.8,32.9 10.7,36.4 7.5,34.4 4.3,36.4 5.2,32.9 2.5,30.6 6.1,30.4" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.6"/>
    </svg>`,

    crossbowman: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="11" ry="3" fill="rgba(0,0,0,0.35)"/>
        <!-- legs + boots -->
        <rect x="16" y="39.5" width="5.2" height="11" rx="2.3" fill="#4a3a24" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="39.5" width="5.2" height="11" rx="2.3" fill="#3c2e1c" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="15" y="49.4" width="6.6" height="4.2" rx="1.9" fill="#5a4028" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.4" y="49.4" width="6.6" height="4.2" rx="1.9" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <!-- padded gambeson, lit upper-left -->
        <path d="M13.4 24.6 q8.6 -3.4 17.2 0 l0.5 14.6 q-9.1 3.2 -18.2 0 z" fill="#8a5a2a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M14 25.2 q4.1 -1.6 8 -1.6 l-0.2 16 q-4 -0.2 -7.6 -1.4 z" fill="#a8763c"/>
        <path d="M14 29.2 q8 -2 16.2 0 M13.8 33 q8.2 -2 16.6 0" stroke="#6b4420" stroke-width="0.9" fill="none"/>
        <rect x="13.2" y="36.4" width="17.8" height="3.2" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="24.4" y="36" width="4.6" height="4" rx="0.9" fill="#7b8290" stroke="#2a1a0e" stroke-width="0.8"/>
        <line x1="25.4" y1="37" x2="25.4" y2="39.2" stroke="#cfd5df" stroke-width="0.8"/>
        <line x1="27" y1="37" x2="27" y2="39.2" stroke="#cfd5df" stroke-width="0.8"/>
        <!-- head -->
        <circle cx="22" cy="15.5" r="6.6" fill="#e8b98a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.8 18.8 a6.6 6.6 0 0 0 10.4 0 q-2.4 1.5 -5.2 1.5 q-2.8 0 -5.2 -1.5z" fill="#d6a274" opacity="0.75"/>
        <circle cx="19.8" cy="16.4" r="0.8" fill="#2a1a0e"/>
        <circle cx="24.2" cy="16.4" r="0.8" fill="#2a1a0e"/>
        <path d="M20.7 19 l2.6 0" stroke="#8a5a2a" stroke-width="0.8" stroke-linecap="round"/>
        <path d="M18.4 20.4 q3.6 2 7.2 0 l-0.4 1.8 q-3.2 1.4 -6.4 0z" fill="#7a4a22"/>
        <!-- kettle hat -->
        <path d="M16 13.6 a6.6 6.6 0 0 1 12.8 0 l0 0.8 -12.8 0 z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M17 11.8 a6.2 6.2 0 0 1 5 -4.2 l0.1 2.8 q-3.1 0.3 -5.1 1.4z" fill="#c7ccd6"/>
        <ellipse cx="22" cy="14.4" rx="9.4" ry="2.5" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="1"/>
        <ellipse cx="18.4" cy="13.8" rx="3.5" ry="1" fill="#dfe4ec"/>
        <!-- crossbow held level -->
        <rect x="5.5" y="27.6" width="22.5" height="3.4" rx="1.5" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="6.2" y="28.2" width="20" height="1" fill="#7a5028"/>
        <path d="M8 22.2 q-4.4 7 0 14" fill="none" stroke="#2a1a0e" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M8 22.2 q-4.4 7 0 14" fill="none" stroke="#8f97a5" stroke-width="2.2" stroke-linecap="round"/>
        <polyline points="8,22.2 21.5,29.3 8,36.2" fill="none" stroke="#efe9da" stroke-width="0.8"/>
        <line x1="3.6" y1="29.3" x2="21" y2="29.3" stroke="#9a6a30" stroke-width="1.3"/>
        <polygon points="1.6,29.3 5.6,27.6 5.6,31" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="20.4" y="26.4" width="2.6" height="6" rx="1" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- hands on stock -->
        <path d="M25.5 26.2 Q24 27.6 24.4 29.4" stroke="#2a1a0e" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M25.5 26.2 Q24 27.6 24.4 29.4" stroke="#8a5a2a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
        <circle cx="24.6" cy="30" r="2.1" fill="#e8b98a" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="12.4" cy="30.6" r="2.1" fill="#e8b98a" stroke="#2a1a0e" stroke-width="0.9"/>
    </svg>`,

    paladin: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3.2" fill="rgba(0,0,0,0.35)"/>
        <!-- holy glow -->
        <circle cx="22" cy="13" r="12.5" fill="rgba(255,230,140,0.2)"><animate attributeName="opacity" values="0.55;1;0.55" dur="3s" repeatCount="indefinite"/></circle>
        <!-- radiant sword -->
        <rect x="33.6" y="4" width="3.2" height="25" rx="1.4" fill="#fff3c4" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34.4" y="4.8" width="0.9" height="23.4" fill="#ffffff"/>
        <polygon points="33.6,4 36.8,4 35.2,-0.4" fill="#fff8d8" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="30.6" y="28.8" width="9.2" height="3" rx="1.3" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34.1" y="31.6" width="2.4" height="4" fill="#a9842c" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="35.3" cy="36.8" r="1.8" fill="#fff3c4" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- legs + boots: white-gold plate -->
        <rect x="15.6" y="39" width="5.6" height="12" rx="2.5" fill="#f2e6c2" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23" y="39" width="5.6" height="12" rx="2.5" fill="#e0cf9e" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="14.6" y="49.6" width="7" height="4.2" rx="1.9" fill="#d9ab35" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="49.6" width="7" height="4.2" rx="1.9" fill="#c39a2e" stroke="#2a1a0e" stroke-width="1"/>
        <!-- sword arm -->
        <path d="M29.8 26.5 Q35 28.2 35.1 33" stroke="#2a1a0e" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M29.8 26.5 Q35 28.2 35.1 33" stroke="#eadfb6" stroke-width="4.2" fill="none" stroke-linecap="round"/>
        <circle cx="35.2" cy="33.6" r="2.3" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- white cuirass with gold cross -->
        <path d="M12.4 24.2 q9.6 -3.8 19.2 0 l0.6 15.2 q-10.2 3.6 -20.4 0 z" fill="#f5ecd2" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M13 24.8 q4.6 -1.8 9 -1.8 l-0.2 16.8 q-4.6 -0.2 -8.6 -1.6 z" fill="#fffae8"/>
        <rect x="20.6" y="26" width="2.8" height="12" rx="1" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="16.4" y="29.4" width="11.2" height="2.8" rx="1" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="12.2" y="37" width="19.8" height="3.2" fill="#a9842c" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- winged pauldrons -->
        <path d="M9.4 27 a4.6 4.6 0 0 1 8.2 -2.8 l-1.2 4.8 z" fill="#f2e6c2" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M34.6 27 a4.6 4.6 0 0 0 -8.2 -2.8 l1.2 4.8 z" fill="#dcc98e" stroke="#2a1a0e" stroke-width="1"/>
        <!-- head -->
        <circle cx="22" cy="14.6" r="7" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.4 18.2 a7 7 0 0 0 11.2 0 q-2.6 1.7 -5.6 1.7 q-3 0 -5.6 -1.7z" fill="#e5b988" opacity="0.75"/>
        <circle cx="19.6" cy="16" r="0.85" fill="#2a1a0e"/>
        <circle cx="24.4" cy="16" r="0.85" fill="#2a1a0e"/>
        <path d="M20.6 18.6 q1.4 1 2.8 0" stroke="#8a5a2a" stroke-width="0.8" fill="none" stroke-linecap="round"/>
        <!-- gold winged helm -->
        <path d="M14.7 14.2 a7.3 7.3 0 0 1 14.6 0 l0 0.6 -14.6 0 z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M15.7 12 a7 7 0 0 1 5.9 -4.8 l0.1 3 q-3.6 0.3 -6 1.8z" fill="#f7dd85"/>
        <rect x="14.2" y="12.6" width="15.6" height="2.7" rx="1.3" fill="#f2d066" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M14.4 12.6 q-4.4 -1.6 -5.6 -5.4 q4.2 -0.4 6.8 2.6z" fill="#fffdf0" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M29.6 12.6 q4.4 -1.6 5.6 -5.4 q-4.2 -0.4 -6.8 2.6z" fill="#f2e6c2" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- shield: white with gold cross -->
        <path d="M2 24 h11 l0 9 q0 6.6 -5.5 9.4 q-5.5 -2.8 -5.5 -9.4 z" fill="#f5ecd2" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M2.8 24.8 h4.6 l-0.1 15.8 q-4.5 -2.8 -4.5 -8z" fill="#fffdf0"/>
        <rect x="6.4" y="26.4" width="2.2" height="11.6" rx="0.9" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="3.4" y="29.2" width="8.2" height="2.2" rx="0.9" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.6"/>
    </svg>`,

    pikeman: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.35)"/>
        <!-- legs + boots -->
        <rect x="16" y="40" width="5.2" height="10.5" rx="2.3" fill="#4a4038" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="40" width="5.2" height="10.5" rx="2.3" fill="#3c332c" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="15" y="49.4" width="6.6" height="4.2" rx="1.9" fill="#5a4028" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.4" y="49.4" width="6.6" height="4.2" rx="1.9" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <!-- grey breastplate -->
        <path d="M13.6 26 q8.4 -3.4 16.8 0 l0.5 13.4 q-8.9 3 -17.8 0 z" fill="#6b7280" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M14.2 26.6 q4 -1.6 7.8 -1.6 l-0.2 14.6 q-3.9 -0.2 -7.4 -1.3 z" fill="#8a919e"/>
        <path d="M15.2 28 q3 -1.1 5.4 -1.2" stroke="#aab0bc" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M17 30.6 q5 -1.4 10 0 M17 33.6 q5 -1.4 10 0" stroke="#4d5462" stroke-width="0.9" fill="none"/>
        <rect x="13.4" y="37" width="17.4" height="3" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="20.2" y="36.6" width="3.8" height="3.8" rx="0.8" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="29.2" cy="27.2" r="3.1" fill="#7b8290" stroke="#2a1a0e" stroke-width="1"/>
        <!-- head -->
        <circle cx="22" cy="17.5" r="6.6" fill="#c98d5a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M16.8 20.8 a6.6 6.6 0 0 0 10.4 0 q-2.4 1.5 -5.2 1.5 q-2.8 0 -5.2 -1.5z" fill="#b0743f" opacity="0.75"/>
        <circle cx="19.8" cy="18.4" r="0.8" fill="#2a1a0e"/>
        <circle cx="24.2" cy="18.4" r="0.8" fill="#2a1a0e"/>
        <path d="M20.7 21 l2.6 0" stroke="#7a4a22" stroke-width="0.9" stroke-linecap="round"/>
        <!-- morion helmet with comb -->
        <path d="M15.8 15.6 a6.6 6.6 0 0 1 12.4 0 l0 0.8 -12.4 0 z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M16.8 13.8 a6.2 6.2 0 0 1 4.8 -4.1 l0.1 2.7 q-3 0.3 -4.9 1.4z" fill="#c7ccd6"/>
        <path d="M13.2 16.6 q8.8 -2.6 17.6 0 q-1.6 1.8 -3.4 1.2 q-5.4 -1.4 -10.8 0 q-1.8 0.6 -3.4 -1.2z" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M19.4 9.6 q2.6 -4.6 5.2 0 l-0.6 2.4 q-2 -1 -4 0z" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- pike arms -->
        <path d="M15.4 27.6 Q12 29.4 10.8 32.4" stroke="#2a1a0e" stroke-width="5.4" fill="none" stroke-linecap="round"/>
        <path d="M15.4 27.6 Q12 29.4 10.8 32.4" stroke="#6b7280" stroke-width="3.8" fill="none" stroke-linecap="round"/>
        <!-- towering pike -->
        <rect x="8.9" y="6.5" width="2.5" height="42" rx="1.2" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="9.6" y1="8" x2="9.6" y2="46" stroke="#b57c3e" stroke-width="0.7"/>
        <path d="M10.1 0.6 q2.9 3 0 7.4 q-2.9 -4.4 0 -7.4z" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="10.1" y1="1.8" x2="10.1" y2="6.8" stroke="#f6f9fd" stroke-width="0.6"/>
        <path d="M8.2 8.6 q1.9 1.6 3.8 0 l-0.6 3.4 q-1.3 0.8 -2.6 0z" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="10.1" cy="30.6" r="2.2" fill="#c98d5a" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="10.1" cy="36.6" r="2.2" fill="#b0743f" stroke="#2a1a0e" stroke-width="0.9"/>
    </svg>`,

    siege: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="18" ry="3.4" fill="rgba(0,0,0,0.4)"/>
        <!-- ram log protruding front -->
        <rect x="27" y="36.4" width="13" height="4.6" rx="2.2" fill="#8a5a26" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="28" y="37.2" width="10" height="1.2" fill="#b57c3e"/>
        <path d="M39.2 35.8 q4 1.4 3.4 5.6 l-3.6 -0.4z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1"/>
        <!-- carriage -->
        <rect x="5" y="31" width="28" height="13" rx="1.6" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1.4"/>
        <line x1="10" y1="31.6" x2="10" y2="43.4" stroke="#5a3a1c" stroke-width="1"/>
        <line x1="16" y1="31.6" x2="16" y2="43.4" stroke="#5a3a1c" stroke-width="1"/>
        <line x1="22" y1="31.6" x2="22" y2="43.4" stroke="#5a3a1c" stroke-width="1"/>
        <line x1="28" y1="31.6" x2="28" y2="43.4" stroke="#5a3a1c" stroke-width="1"/>
        <rect x="5" y="31" width="28" height="3" fill="#9a6432"/>
        <!-- gabled plank roof, lit left slope -->
        <path d="M3.6 31 L19 18.6 L34.4 31 z" fill="#8a5a2a" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M5.8 30 L19 19.6 L19 30.8 z" fill="#a5713d"/>
        <path d="M7.6 29.4 L19 20.6 M12 30.4 L21.6 22.8 M25.8 30.4 L17.2 23.6" stroke="#5a3a1c" stroke-width="0.8" fill="none"/>
        <rect x="17.4" y="16.6" width="3.2" height="3.4" rx="0.8" fill="#6b4420" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M19 16.6 l0 -4.4 5 1.4 -5 1.6" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- chains from frame to ram -->
        <line x1="30" y1="33" x2="31.6" y2="37" stroke="#4d5462" stroke-width="1.1" stroke-dasharray="1.4 0.9"/>
        <line x1="35.6" y1="33.6" x2="36.4" y2="36.6" stroke="#4d5462" stroke-width="1.1" stroke-dasharray="1.4 0.9"/>
        <!-- iron-banded wheels with spokes -->
        <circle cx="11" cy="46.5" r="5.6" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M6.2 44 a5.6 5.6 0 0 1 4.6 -3" stroke="#8a5a26" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <line x1="11" y1="41.6" x2="11" y2="51.4" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="6.1" y1="46.5" x2="15.9" y2="46.5" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="11" cy="46.5" r="1.6" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="29" cy="46.5" r="5.6" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M24.2 44 a5.6 5.6 0 0 1 4.6 -3" stroke="#8a5a26" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <line x1="29" y1="41.6" x2="29" y2="51.4" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="24.1" y1="46.5" x2="33.9" y2="46.5" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="29" cy="46.5" r="1.6" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.8"/>
    </svg>`,

    catapult: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="19" ry="3.4" fill="rgba(0,0,0,0.4)"/>
        <!-- throwing arm with boulder -->
        <line x1="30" y1="41" x2="10" y2="12" stroke="#2a1a0e" stroke-width="4.6" stroke-linecap="round"/>
        <line x1="30" y1="41" x2="10" y2="12" stroke="#8a5a26" stroke-width="3" stroke-linecap="round"/>
        <line x1="28" y1="38" x2="14" y2="17.6" stroke="#b57c3e" stroke-width="0.9"/>
        <path d="M4.6 10.6 a5.8 4.6 0 0 0 11 -1 z" fill="#6b4420" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="10" cy="7.6" r="4.3" fill="#7b8290" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M6.6 6 a4.3 4.3 0 0 1 3.6 -2.4" stroke="#c7ccd6" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <circle cx="8.6" cy="8.6" r="0.8" fill="#4d5462"/>
        <circle cx="11.8" cy="6.4" r="0.6" fill="#4d5462"/>
        <!-- A-frame + crossbar -->
        <path d="M14 42 L22 24 L30 42" fill="none" stroke="#2a1a0e" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 42 L22 24 L30 42" fill="none" stroke="#7a4a22" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 41 L22 25.4" stroke="#9a6432" stroke-width="1" fill="none"/>
        <rect x="15.4" y="32.2" width="13.2" height="2.8" rx="1" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- torsion coil + winch -->
        <circle cx="30" cy="41" r="3" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="30" cy="41" r="1.2" fill="#b57c3e"/>
        <rect x="33.4" y="36.8" width="5.4" height="5.4" rx="1" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="34.2" y1="39.5" x2="38" y2="39.5" stroke="#e8dcc0" stroke-width="1"/>
        <line x1="36.1" y1="37.6" x2="36.1" y2="41.4" stroke="#e8dcc0" stroke-width="1"/>
        <!-- base sled -->
        <rect x="4.6" y="43.4" width="34.8" height="5.6" rx="1.4" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1.4"/>
        <rect x="4.6" y="43.4" width="34.8" height="1.8" fill="#9a6432"/>
        <line x1="12" y1="43.8" x2="12" y2="48.6" stroke="#5a3a1c" stroke-width="1"/>
        <line x1="22" y1="43.8" x2="22" y2="48.6" stroke="#5a3a1c" stroke-width="1"/>
        <line x1="32" y1="43.8" x2="32" y2="48.6" stroke="#5a3a1c" stroke-width="1"/>
        <!-- spoked wheels -->
        <circle cx="10.5" cy="48.8" r="5" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M6.4 46.6 a5 5 0 0 1 4.1 -2.8" stroke="#8a5a26" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <line x1="10.5" y1="44.4" x2="10.5" y2="53.2" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="6.1" y1="48.8" x2="14.9" y2="48.8" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="10.5" cy="48.8" r="1.5" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="33.5" cy="48.8" r="5" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M29.4 46.6 a5 5 0 0 1 4.1 -2.8" stroke="#8a5a26" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <line x1="33.5" y1="44.4" x2="33.5" y2="53.2" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="29.1" y1="48.8" x2="37.9" y2="48.8" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="33.5" cy="48.8" r="1.5" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.8"/>
    </svg>`
};

// Enemy sprites — distinct menacing characters
const ENEMY_SPRITES = {
    goblin: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.38)"/>
        <!-- jagged dagger -->
        <path d="M37.2 20 l2.4 2 -1.2 3 1.6 2.6 -1.6 3 1 2.6 -2.6 1.4 -1.6 -14z" fill="#9aa2b0" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="37.6" y1="21.6" x2="38.2" y2="32.4" stroke="#dfe4ec" stroke-width="0.8"/>
        <rect x="35" y="34.2" width="4.6" height="2.4" rx="1" fill="#7a4a22" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- bandy legs -->
        <rect x="16.4" y="40" width="5" height="10.5" rx="2.2" fill="#4a5426" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="40" width="5" height="10.5" rx="2.2" fill="#3c4520" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M15 50.2 h7 l1 2.6 q0.2 1.2 -1.4 1.2 h-5.6 q-1.6 0 -1.6 -1.4z" fill="#6b4a26" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M22.4 50.2 h7 l1 2.6 q0.2 1.2 -1.4 1.2 h-5.6 q-1.6 0 -1.6 -1.4z" fill="#59391c" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- dagger arm -->
        <path d="M28.6 27.6 Q34 29.6 36.4 33.6" stroke="#2a1a0e" stroke-width="5.2" fill="none" stroke-linecap="round"/>
        <path d="M28.6 27.6 Q34 29.6 36.4 33.6" stroke="#6e9a3e" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <circle cx="36.8" cy="34.6" r="2.1" fill="#87b350" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- ragged leather vest -->
        <path d="M14.2 26.4 q7.8 -3 15.6 0 l0.5 13 -2 -1 -1.8 1.6 -2.4 -1.2 -2.4 1.2 -2.4 -1.2 -2 1 -1.9 -1.4 -2 0.8 z" fill="#7a5a30" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M14.8 27 q3.7 -1.4 7.2 -1.4 l-0.2 13.6 -2.2 -1 -2 1 -1.9 -1.2 -1.7 0.6 z" fill="#94703c"/>
        <line x1="16.2" y1="27.6" x2="27.6" y2="37.2" stroke="#4a3420" stroke-width="1.8"/>
        <circle cx="21.4" cy="32" r="1" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.5"/>
        <!-- big head, huge ears -->
        <polygon points="12.6,14.8 4.6,10.4 13.4,11.2" fill="#6e9a3e" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="31.4,14.8 39.4,10.4 30.6,11.2" fill="#5c8232" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="6.6,11 9.8,10.8 12.8,12.4" fill="#87b350"/>
        <circle cx="22" cy="16" r="8" fill="#6e9a3e" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M15.6 12.6 a8 8 0 0 1 6.2 -4.5 l0.1 3.2 q-3.9 0.4 -6.3 2.4z" fill="#87b350"/>
        <path d="M15.8 20.4 a8 8 0 0 0 12.4 0 q-3 1.9 -6.2 1.9 q-3.2 0 -6.2 -1.9z" fill="#567a2c" opacity="0.8"/>
        <!-- sly face -->
        <ellipse cx="18.8" cy="14.8" rx="2.1" ry="2.5" fill="#fde047"/>
        <ellipse cx="25.2" cy="14.8" rx="2.1" ry="2.5" fill="#fde047"/>
        <circle cx="19.2" cy="15.3" r="1" fill="#2a1a0e"/>
        <circle cx="24.8" cy="15.3" r="1" fill="#2a1a0e"/>
        <path d="M16.6 12 l4 1.4 M27.4 12 l-4 1.4" stroke="#2c3a14" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M21.2 16.6 q0.8 1.6 -0.6 2.6" stroke="#2c3a14" stroke-width="0.9" fill="none"/>
        <path d="M17.4 20.2 q4.6 3 9.2 0 l-1 2.4 q-3.6 1.6 -7.2 0z" fill="#3a2c14" stroke="#2a1a0e" stroke-width="0.7"/>
        <polygon points="18.6,20.6 19.6,22.6 20.6,20.9" fill="#f5f0dc"/>
        <polygon points="25.4,20.6 24.4,22.6 23.4,20.9" fill="#f5f0dc"/>
    </svg>`,

    orc: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="13" ry="3.3" fill="rgba(0,0,0,0.4)"/>
        <!-- cleaver -->
        <line x1="34" y1="34" x2="40" y2="20" stroke="#2a1a0e" stroke-width="3.6" stroke-linecap="round"/>
        <line x1="34" y1="34" x2="40" y2="20" stroke="#7a4a22" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M36.6 20.6 l7 -0.6 q1.6 5.4 -1.6 9.4 l-3.6 -1.4z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M37.6 21.2 l4.8 -0.4 q0.6 2.4 0 4.2l-4.2 -1z" fill="#c7ccd6"/>
        <circle cx="41.8" cy="26.6" r="0.7" fill="#2a1a0e"/>
        <!-- massive legs -->
        <rect x="14.4" y="39.5" width="6.4" height="11" rx="2.7" fill="#3f4429" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23.4" y="39.5" width="6.4" height="11" rx="2.7" fill="#343821" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="13.2" y="49.4" width="8" height="4.4" rx="2" fill="#5a4028" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="49.4" width="8" height="4.4" rx="2" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <!-- cleaver arm -->
        <path d="M29.8 25.4 Q33.6 28 34.6 32" stroke="#2a1a0e" stroke-width="6.4" fill="none" stroke-linecap="round"/>
        <path d="M29.8 25.4 Q33.6 28 34.6 32" stroke="#6a8442" stroke-width="4.6" fill="none" stroke-linecap="round"/>
        <circle cx="34.8" cy="33" r="2.5" fill="#7d9a50" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- hulking torso with spiked pauldron -->
        <path d="M10.4 23.4 q11.6 -4.4 23.2 0 l0.6 15.8 q-12.2 4 -24.4 0 z" fill="#5a7038" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M11 24 q5.5 -2 10.8 -2 l-0.2 17.4 q-5.5 -0.3 -10.4 -1.8 z" fill="#728c48"/>
        <path d="M12.4 25.8 q3.6 -1.4 6.6 -1.5" stroke="#8ba65c" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path d="M13.6 24.4 l4.4 4.8 M19.4 23 l3.6 5.4" stroke="#3a4a22" stroke-width="1.2"/>
        <rect x="10.2" y="36.6" width="24" height="3.6" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="22.2" cy="38.4" r="2.2" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M8.2 26.8 a5.4 5.4 0 0 1 9.4 -3.4 l-1.6 5.4 z" fill="#4d5462" stroke="#2a1a0e" stroke-width="1.1"/>
        <polygon points="8.6,23.2 7,19.4 10.8,21.6" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="12.4,21.6 12.2,17.6 15.2,20.8" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- brute head with tusks -->
        <circle cx="22" cy="13.5" r="8.5" fill="#6a8442" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M15.2 9.8 a8.5 8.5 0 0 1 6.6 -4.7 l0.1 3.4 q-4.1 0.4 -6.7 2.5z" fill="#82a054"/>
        <path d="M15.4 18.2 a8.5 8.5 0 0 0 13.2 0 q-3.2 2 -6.6 2 q-3.4 0 -6.6 -2z" fill="#526b2c" opacity="0.8"/>
        <ellipse cx="18.2" cy="12.4" rx="2" ry="2.3" fill="#e8452f"/>
        <ellipse cx="25.8" cy="12.4" rx="2" ry="2.3" fill="#e8452f"/>
        <circle cx="18.4" cy="12.8" r="0.95" fill="#2a1a0e"/>
        <circle cx="25.6" cy="12.8" r="0.95" fill="#2a1a0e"/>
        <path d="M15.4 9.8 l4.4 1.2 M28.6 9.8 l-4.4 1.2" stroke="#28341a" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M16.6 17.4 q5.4 2.6 10.8 0 l-0.8 2.4 q-4.6 1.8 -9.2 0z" fill="#3a2c14" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="17.4,18.2 18.2,14.2 19.6,18.6" fill="#f5f0dc" stroke="#2a1a0e" stroke-width="0.5"/>
        <polygon points="26.6,18.2 25.8,14.2 24.4,18.6" fill="#f5f0dc" stroke="#2a1a0e" stroke-width="0.5"/>
        <!-- topknot -->
        <path d="M21 5.2 q1 -2.6 2.4 -3.4 q1.2 1.8 0.6 3.6z" fill="#2c3a14" stroke="#2a1a0e" stroke-width="0.7"/>
    </svg>`,

    skeleton: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="10" ry="3" fill="rgba(0,0,0,0.38)"/>
        <!-- rusty scimitar -->
        <path d="M33.6 31 q7.4 -8.6 5.6 -20.6 q5.4 8.8 -1.6 20.2 q-1.8 1.8 -4 0.4z" fill="#9aa2b0" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M35 29 q5.2 -7 4.4 -16.4" stroke="#dfe4ec" stroke-width="0.8" fill="none"/>
        <circle cx="37.8" cy="17.4" r="0.8" fill="#8a5a26"/>
        <circle cx="36.4" cy="23.8" r="0.7" fill="#8a5a26"/>
        <rect x="31.6" y="31.4" width="4.6" height="2.4" rx="1" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- bone legs -->
        <rect x="17.8" y="39.5" width="3.4" height="12" rx="1.6" fill="#e8e4d4" stroke="#8a8474" stroke-width="1"/>
        <rect x="23.2" y="39.5" width="3.4" height="12" rx="1.6" fill="#d6d2c2" stroke="#8a8474" stroke-width="1"/>
        <circle cx="19.5" cy="45.4" r="1.7" fill="#f2efe2" stroke="#8a8474" stroke-width="0.8"/>
        <circle cx="24.9" cy="45.4" r="1.7" fill="#e0dccc" stroke="#8a8474" stroke-width="0.8"/>
        <path d="M16.6 51 h6 v2.6 h-7.4z" fill="#e8e4d4" stroke="#8a8474" stroke-width="0.9"/>
        <path d="M22.6 51 h6 l1.4 2.6 h-7.4z" fill="#d6d2c2" stroke="#8a8474" stroke-width="0.9"/>
        <!-- sword arm (bone) -->
        <path d="M28.4 26.4 Q32.4 28.6 33.6 32" stroke="#2a1a0e" stroke-width="4.6" fill="none" stroke-linecap="round"/>
        <path d="M28.4 26.4 Q32.4 28.6 33.6 32" stroke="#e0dccc" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="33.9" cy="32.6" r="2" fill="#f2efe2" stroke="#8a8474" stroke-width="0.9"/>
        <!-- tattered dark tunic + rib cage -->
        <path d="M14.8 25 q7.2 -2.8 14.4 0 l0.5 13.6 -2.2 -1.2 -2 1.8 -2.5 -1.4 -2.5 1.4 -2 -1.8 -2.2 1.2 z" fill="#3f3a4a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M15.4 25.6 q3.4 -1.3 6.6 -1.3 l-0.2 14 -1.8 -1.2 -1.8 1.4 -1.7 -1.2 z" fill="#54506a"/>
        <path d="M22 24.4 l0 12" stroke="#e8e4d4" stroke-width="1.6"/>
        <path d="M17 27.4 q5 2.2 10 0 M17 30.6 q5 2.2 10 0 M17.4 33.8 q4.6 2 9.2 0" stroke="#e8e4d4" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <!-- shoulder bones -->
        <circle cx="14.8" cy="25.8" r="2.6" fill="#e8e4d4" stroke="#8a8474" stroke-width="1"/>
        <circle cx="29.2" cy="25.8" r="2.6" fill="#d6d2c2" stroke="#8a8474" stroke-width="1"/>
        <!-- skull -->
        <path d="M14.6 14.6 a7.4 7.4 0 0 1 14.8 0 q0 4.6 -3 6 l0 2.6 q-4.4 1.6 -8.8 0 l0 -2.6 q-3 -1.4 -3 -6z" fill="#f0eee0" stroke="#8a8474" stroke-width="1.2"/>
        <path d="M15.6 12.2 a7 7 0 0 1 5.8 -4.6 l0.1 3 q-3.5 0.3 -5.9 1.6z" fill="#fbfaf2"/>
        <ellipse cx="18.9" cy="15.2" rx="2.3" ry="2.7" fill="#1c1a22"/>
        <ellipse cx="25.1" cy="15.2" rx="2.3" ry="2.7" fill="#1c1a22"/>
        <circle cx="19.2" cy="15.6" r="0.85" fill="#e8452f"><animate attributeName="opacity" values="1;0.35;1" dur="2.4s" repeatCount="indefinite"/></circle>
        <circle cx="24.8" cy="15.6" r="0.85" fill="#e8452f"/>
        <path d="M13.8 15.4 q-1.6 -1.2 -1.6 -3.2 M30.2 15.4 q1.6 -1.2 1.6 -3.2" stroke="#8a8474" stroke-width="1" fill="none"/>
        <polygon points="22,17.6 20.9,19.8 23.1,19.8" fill="#c8c4b4"/>
        <path d="M18.6 21 l6.8 0" stroke="#8a8474" stroke-width="1"/>
        <line x1="20" y1="20.4" x2="20" y2="22.6" stroke="#8a8474" stroke-width="0.9"/>
        <line x1="22" y1="20.4" x2="22" y2="23" stroke="#8a8474" stroke-width="0.9"/>
        <line x1="24" y1="20.4" x2="24" y2="22.6" stroke="#8a8474" stroke-width="0.9"/>
        <path d="M16 11.4 l3.6 -1 M28 11.4 l-3.6 -1" stroke="#8a8474" stroke-width="0.8"/>
        <!-- crack -->
        <path d="M26.8 8.6 l1.2 2 -0.8 1.8" stroke="#8a8474" stroke-width="0.8" fill="none"/>
    </svg>`,

    ogre: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="16" ry="3.6" fill="rgba(0,0,0,0.42)"/>
        <!-- spiked club -->
        <line x1="35" y1="38" x2="41.6" y2="17" stroke="#2a1a0e" stroke-width="4.6" stroke-linecap="round"/>
        <line x1="35" y1="38" x2="41.6" y2="17" stroke="#7a4a22" stroke-width="3.2" stroke-linecap="round"/>
        <path d="M37.8 16.6 a4.9 6 0 0 1 7.6 -1.2 q1.8 4.2 -1 8 a4.9 6 0 0 1 -6.6 -6.8z" fill="#6b4a28" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M38.8 15.4 q2 -1.8 4.2 -1.2 l-0.6 3 q-2 -0.8 -3.6 0z" fill="#8a6238"/>
        <polygon points="38,12.4 38.8,15.6 36.4,15.2" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.7"/>
        <polygon points="44.2,11.6 43.6,14.8 41.6,13.4" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- tree-trunk legs -->
        <rect x="12.6" y="38" width="7.4" height="13" rx="3" fill="#6b5838" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="24.2" y="38" width="7.4" height="13" rx="3" fill="#59482c" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M11.4 49.6 h9 v2.4 q0 1.6 -1.8 1.6 h-5.8 q-1.8 0 -1.6 -1.8z" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M23.2 49.6 h9 l0.2 2.2 q0.2 1.8 -1.6 1.8 h-5.8 q-1.8 0 -1.8 -1.6z" fill="#3c2a18" stroke="#2a1a0e" stroke-width="1"/>
        <!-- club arm -->
        <path d="M31 24.6 Q35 28.8 35.4 34" stroke="#2a1a0e" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M31 24.6 Q35 28.8 35.4 34" stroke="#94855f" stroke-width="5" fill="none" stroke-linecap="round"/>
        <circle cx="35.4" cy="35.4" r="2.8" fill="#a3936e" stroke="#2a1a0e" stroke-width="1"/>
        <!-- massive belly torso -->
        <path d="M7.6 24 q14.4 -6 28.8 0 l1 12.4 q0.4 6 -6.4 6.4 l-18 0 q-6.8 -0.4 -6.4 -6.4 z" fill="#8a7a5a" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M8.4 24.8 q7 -2.8 13.6 -2.6 l-0.3 20.4 -8.9 0 q-5.8 -0.4 -5.4 -5.6 z" fill="#a3936e"/>
        <path d="M10.2 26.6 q4.4 -1.8 8.2 -1.9" stroke="#bcac82" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- fur loincloth + belt -->
        <path d="M12.6 38.4 q9.4 3 18.8 0 l-1 4.8 -2.4 -1.6 -2.6 2.2 -2.8 -1.8 -2.8 1.8 -2.6 -2.2 -2.4 1.6z" fill="#5a4028" stroke="#2a1a0e" stroke-width="1.1"/>
        <ellipse cx="22" cy="33.4" rx="2" ry="1.2" fill="#6f603f"/>
        <path d="M14 22.6 l3.4 3.8 M29.6 22.2 l-3.2 4" stroke="#6f603f" stroke-width="1.2"/>
        <!-- small head, underbite -->
        <circle cx="22" cy="13.5" r="9" fill="#94855f" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M14.6 9.6 a9 9 0 0 1 7 -5 l0.1 3.6 q-4.3 0.4 -7.1 2.7z" fill="#ab9c74"/>
        <path d="M14.8 18.4 a9 9 0 0 0 14.4 0 q-3.6 2.2 -7.2 2.2 q-3.6 0 -7.2 -2.2z" fill="#77683f" opacity="0.8"/>
        <ellipse cx="17.4" cy="12.2" rx="2.2" ry="1.9" fill="#f5f0dc"/>
        <ellipse cx="26.6" cy="12.2" rx="2.2" ry="1.9" fill="#f5f0dc"/>
        <circle cx="17.8" cy="12.5" r="1.1" fill="#2a1a0e"/>
        <circle cx="26.2" cy="12.5" r="1.1" fill="#2a1a0e"/>
        <path d="M14.6 9.6 l4.6 1 M29.4 9.6 l-4.6 1" stroke="#403218" stroke-width="1.3" stroke-linecap="round"/>
        <ellipse cx="22" cy="15.4" rx="1.6" ry="1.1" fill="#77683f"/>
        <path d="M15.8 17.8 q6.2 3.6 12.4 0 l-1.6 3.2 q-4.6 2 -9.2 0z" fill="#3a2c14" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="17.2,18.6 18.2,21.6 19.6,19.2" fill="#f5f0dc" stroke="#2a1a0e" stroke-width="0.5"/>
        <polygon points="26.8,18.6 25.8,21.6 24.4,19.2" fill="#f5f0dc" stroke="#2a1a0e" stroke-width="0.5"/>
        <!-- ear nubs -->
        <circle cx="13.2" cy="13" r="1.7" fill="#847550" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="30.8" cy="13" r="1.7" fill="#847550" stroke="#2a1a0e" stroke-width="0.9"/>
    </svg>`,

    demon: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="12" ry="3.3" fill="rgba(0,0,0,0.4)"/>
        <!-- ragged wings behind -->
        <path d="M12.8 24 q-9 -3 -11 -11 q6.6 0.6 9.4 4.6 l-1 2.4 2 1.6z" fill="#521010" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M31.2 24 q9 -3 11 -11 q-6.6 0.6 -9.4 4.6 l1 2.4 -2 1.6z" fill="#3f0c0c" stroke="#2a1a0e" stroke-width="1.1"/>
        <!-- flame sword -->
        <path d="M35.6 30.4 q-3.4 -7.4 0.4 -13.6 q0.6 3 2.4 4.4 q-0.6 -5.4 3 -9.8 q0.4 4.4 2.2 6.8 q1.6 6 -2.4 12 q-2.8 2 -5.6 0.2z" fill="#f59e0b" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M37.4 28.6 q-2 -4.8 0.6 -9.2 q0.4 2.2 1.8 3.4 q-0.4 -3 1.2 -5.8 q1.6 6.2 -0.6 11.4 q-1.6 1.2 -3 0.2z" fill="#fde047"><animate attributeName="opacity" values="1;0.55;1" dur="1.6s" repeatCount="indefinite"/></path>
        <rect x="34.4" y="30.8" width="5.6" height="2.4" rx="1" fill="#521010" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- legs -->
        <rect x="16" y="39.5" width="5.4" height="11" rx="2.4" fill="#8a1c1c" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23" y="39.5" width="5.4" height="11" rx="2.4" fill="#701414" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M15 49.6 h7 l-0.6 3 q-0.4 1.2 -1.8 1.2 l-3.4 0 q-1.6 0 -1.4 -1.6z" fill="#521010" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M22.4 49.6 h7 l0.4 2.6 q0.2 1.6 -1.4 1.6 l-3.4 0 q-1.4 0 -1.8 -1.2z" fill="#3f0c0c" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- sword arm -->
        <path d="M29.4 26.6 Q34.4 28.4 36 32" stroke="#2a1a0e" stroke-width="5.6" fill="none" stroke-linecap="round"/>
        <path d="M29.4 26.6 Q34.4 28.4 36 32" stroke="#c83838" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="36.6" cy="32.6" r="2.3" fill="#d95050" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- muscular torso with dark chest plate -->
        <path d="M12.4 24.2 q9.6 -3.8 19.2 0 l0.6 15 q-10.2 3.6 -20.4 0 z" fill="#b02828" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M13 24.8 q4.6 -1.8 9 -1.8 l-0.2 16.6 q-4.6 -0.2 -8.6 -1.6 z" fill="#d04040"/>
        <path d="M14.2 26.4 q3.2 -1.2 5.8 -1.3" stroke="#e86a5a" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        <path d="M16.4 28 q5.6 2.4 11.2 0 l0.4 6.4 q-6 2.2 -12 0z" fill="#2e2430" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="22" cy="31.2" r="1.6" fill="#fde047"/>
        <circle cx="21.5" cy="30.7" r="0.5" fill="#fff8dc"/>
        <rect x="12.2" y="37" width="19.8" height="3" fill="#3a0c0c" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- spiked shoulders -->
        <path d="M9.8 26.6 a4.2 4.2 0 0 1 7.6 -2.6 l-1.2 4.4 z" fill="#8a1c1c" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="10,23.4 8.6,19.8 12.4,21.8" fill="#2e2430" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M34.2 26.6 a4.2 4.2 0 0 0 -7.6 -2.6 l1.2 4.4 z" fill="#701414" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="34,23.4 35.4,19.8 31.6,21.8" fill="#2e2430" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- horned head -->
        <path d="M14.6 10.4 q-4 -2.6 -4.4 -7.8 q4.8 1 6.8 5.4z" fill="#2e2430" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M29.4 10.4 q4 -2.6 4.4 -7.8 q-4.8 1 -6.8 5.4z" fill="#241c26" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="22" cy="15" r="8" fill="#c83838" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M15.8 11.4 a8 8 0 0 1 6.2 -4.4 l0.1 3.2 q-3.9 0.4 -6.3 2.4z" fill="#d95050"/>
        <path d="M15.8 19.4 a8 8 0 0 0 12.4 0 q-3 1.9 -6.2 1.9 q-3.2 0 -6.2 -1.9z" fill="#8a1c1c" opacity="0.8"/>
        <ellipse cx="18.6" cy="14.4" rx="2.1" ry="2.5" fill="#fde047"/>
        <ellipse cx="25.4" cy="14.4" rx="2.1" ry="2.5" fill="#fde047"/>
        <circle cx="18.9" cy="14.9" r="0.95" fill="#2a1a0e"/>
        <circle cx="25.1" cy="14.9" r="0.95" fill="#2a1a0e"/>
        <path d="M16.2 11.6 l4.2 1.4 M27.8 11.6 l-4.2 1.4" stroke="#521010" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M17.2 19 q4.8 3.4 9.6 0 l-1.4 2.6 q-3.4 1.8 -6.8 0z" fill="#3a0808" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="18.4,19.6 19.4,21.8 20.4,19.9" fill="#f5f0dc"/>
        <polygon points="25.6,19.6 24.6,21.8 23.6,19.9" fill="#f5f0dc"/>
    </svg>`,

    darksoldier: `<svg viewBox="0 0 44 58" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="55" rx="11" ry="3.1" fill="rgba(0,0,0,0.4)"/>
        <!-- dark greatsword with violet edge -->
        <rect x="33.4" y="6" width="3.4" height="23" rx="1.5" fill="#3a3e4a" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34.3" y="6.8" width="1" height="21.4" fill="#a78bfa"><animate attributeName="opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite"/></rect>
        <polygon points="33.4,6 36.8,6 35.1,1.4" fill="#4e5360" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M30.4 29 l9.4 0 -1.6 2.8 -6.2 0z" fill="#241c30" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="34" y="31.6" width="2.2" height="3.8" fill="#13161e" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="35.1" cy="36.6" r="1.7" fill="#7c3aed" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- legs -->
        <rect x="15.8" y="39" width="5.6" height="12" rx="2.5" fill="#3a3e4a" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="23" y="39" width="5.6" height="12" rx="2.5" fill="#2a2e38" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="18.6" cy="44" r="1.4" fill="#5a5f6e" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="25.8" cy="44" r="1.4" fill="#4a4e5a" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="14.8" y="49.6" width="7" height="4.2" rx="1.9" fill="#2e3340" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="22.8" y="49.6" width="7" height="4.2" rx="1.9" fill="#232732" stroke="#2a1a0e" stroke-width="1"/>
        <!-- sword arm -->
        <path d="M29.6 26.4 Q34.8 28.2 35 32.6" stroke="#2a1a0e" stroke-width="6" fill="none" stroke-linecap="round"/>
        <path d="M29.6 26.4 Q34.8 28.2 35 32.6" stroke="#3f4453" stroke-width="4.2" fill="none" stroke-linecap="round"/>
        <circle cx="35" cy="33.2" r="2.3" fill="#4a4e5a" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- black cuirass with violet sigil -->
        <path d="M12.4 24 q9.6 -3.8 19.2 0 l0.6 15.2 q-10.2 3.6 -20.4 0 z" fill="#383d4a" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M13 24.6 q4.6 -1.8 9 -1.8 l-0.2 16.8 q-4.6 -0.2 -8.6 -1.6 z" fill="#4a505f"/>
        <path d="M14.2 26.2 q3.2 -1.2 5.8 -1.3" stroke="#6b7182" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M22 26.6 l4.2 4.8 -4.2 7.6 -4.2 -7.6 z" fill="#7c3aed" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M22 28.6 l2.5 2.9 -2.5 4.4 -2.5 -4.4 z" fill="#9b6cf5"/>
        <rect x="12.2" y="37" width="19.8" height="3" fill="#181b24" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- horned pauldrons -->
        <path d="M9.6 26.6 a4.4 4.4 0 0 1 8 -2.6 l-1.2 4.6 z" fill="#454a58" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="9.8,23.6 8,20 12.2,21.8" fill="#232732" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M34.4 26.6 a4.4 4.4 0 0 0 -8 -2.6 l1.2 4.6 z" fill="#343947" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="34.2,23.6 36,20 31.8,21.8" fill="#232732" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- horned helm with glowing visor -->
        <path d="M14.8 9.6 q0 -6.2 7.2 -6.4 q7.2 0.2 7.2 6.4 l0 7.8 q0 3.8 -3.8 4 l-6.8 0 q-3.8 -0.2 -3.8 -4 z" fill="#3a3e4a" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M15.6 9.8 q0 -5.4 6 -5.8 l0.1 17 -2.1 0 q-4 -0.2 -4 -3.6 z" fill="#4e5360"/>
        <path d="M14.6 8.2 q-4.6 -1.2 -6.4 -5.6 q5 -0.2 7.6 3.2z" fill="#232732" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M29.4 8.2 q4.6 -1.2 6.4 -5.6 q-5 -0.2 -7.6 3.2z" fill="#1b1f28" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="15.4" y="12" width="13.2" height="3" rx="1.4" fill="#12081f"/>
        <ellipse cx="18.8" cy="13.5" rx="1.3" ry="1" fill="#a78bfa"/>
        <ellipse cx="25.2" cy="13.5" rx="1.3" ry="1" fill="#a78bfa"/>
        <line x1="22" y1="15.8" x2="22" y2="20.6" stroke="#232732" stroke-width="1.1"/>
        <line x1="18.8" y1="16.4" x2="18.8" y2="20" stroke="#232732" stroke-width="0.9"/>
        <line x1="25.2" y1="16.4" x2="25.2" y2="20" stroke="#232732" stroke-width="0.9"/>
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
    townhall: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="19" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="3.5" y="19" width="9" height="24" fill="#b0a68e" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="3.5" y="19" width="3.8" height="24" fill="#cfc5ac"/>
        <polygon points="2.5,19.5 13.5,19.5 8,12.5" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1.2"/>
        <polygon points="4.6,19 8,14.6 8,19" fill="#d05540"/>
        <rect x="35.5" y="19" width="9" height="24" fill="#a0967e" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="35.5" y="19" width="3.4" height="24" fill="#bcb298"/>
        <polygon points="34.5,19.5 45.5,19.5 40,12.5" fill="#9c3223" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="11" y="22" width="26" height="21" fill="#c9bfa6" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="11" y="22" width="10" height="21" fill="#ddd3ba"/>
        <polygon points="9.5,22 38.5,22 24,10.5" fill="#e0b23e" stroke="#2a1a0e" stroke-width="1.3"/>
        <polygon points="13.4,21.2 24,12.6 24,21.2" fill="#f2cf6a"/>
        <line x1="24" y1="11" x2="24" y2="5" stroke="#5a3a1c" stroke-width="1.4"/>
        <polygon points="24,4.6 31,6.8 24,9.2" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M20.5 43 v-8.5 a3.5 3.5 0 0 1 7 0 V43 z" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M21.6 43 v-8 a2.4 2.4 0 0 1 2.4 -2.3 l0 10.3z" fill="#7a5028"/>
        <rect x="13.5" y="26" width="4" height="5.5" rx="1" fill="#ffdf8a" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="30.5" y="26" width="4" height="5.5" rx="1" fill="#f0c85a" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="6" y="24" width="3.2" height="4.6" rx="0.8" fill="#ffdf8a" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="38.6" y="24" width="3.2" height="4.6" rx="0.8" fill="#e8bd4e" stroke="#2a1a0e" stroke-width="0.8"/></svg>`,
    goldmine: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <polygon points="4,42 14,14 25,8 37,16 44,42" fill="#8d7c66" stroke="#2a1a0e" stroke-width="1.4"/>
        <polygon points="6.8,40.5 15,17 25,11.4 25,40.5" fill="#a5947c"/>
        <polygon points="14,14 25,8 30,11.4 20,17.4" fill="#bcab90"/>
        <path d="M19 21 l4 3 -2 4 M32 21 l3 5" stroke="#6f6050" stroke-width="1" fill="none"/>
        <path d="M15.5 42 v-9.5 a8.5 8.5 0 0 1 17 0 V42 z" fill="#241507" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M16.6 41 v-8 a7.4 7.4 0 0 1 5 -6.6 l0.1 14.6z" fill="#3d2812"/>
        <rect x="13.6" y="30.4" width="20.8" height="2.6" fill="#7a4a22" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="14.4" y="33" width="2.2" height="9" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="31.4" y="33" width="2.2" height="9" fill="#6b4420" stroke="#2a1a0e" stroke-width="0.8"/>
        <circle cx="21" cy="38.8" r="2.3" fill="#fbc536" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="20.3" cy="38.1" r="0.7" fill="#fff3b0"/>
        <circle cx="26.6" cy="40" r="1.9" fill="#f0b52a" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="39" cy="40.4" r="2.1" fill="#fbc536" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="38.4" cy="39.8" r="0.6" fill="#fff3b0"/></svg>`,
    ironmine: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <polygon points="4,42 13,13 25,7 38,15 44,42" fill="#6d7482" stroke="#2a1a0e" stroke-width="1.4"/>
        <polygon points="6.8,40.5 14,16 25,10.4 25,40.5" fill="#858c9c"/>
        <polygon points="13,13 25,7 30,10.4 19,16.6" fill="#9aa2b0"/>
        <path d="M18 21 l4 3 -2 4 M33 20 l3 5" stroke="#555b68" stroke-width="1" fill="none"/>
        <path d="M15.5 42 v-9.5 a8.5 8.5 0 0 1 17 0 V42 z" fill="#10131c" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M16.6 41 v-8 a7.4 7.4 0 0 1 5 -6.6 l0.1 14.6z" fill="#232838"/>
        <rect x="13.6" y="30.4" width="20.8" height="2.6" fill="#5f666f" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="14.4" y="33" width="2.2" height="9" fill="#6f7680" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="31.4" y="33" width="2.2" height="9" fill="#4d545e" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="19.4,37.4 23.4,35.6 25.6,39 21.6,41" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="20.4,37.6 22.8,36.6 23.6,38" fill="#eef1f6"/>
        <polygon points="37,38.4 40.6,37.2 41.8,40.6 38.4,41.6" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="30" y1="43" x2="40" y2="30" stroke="#8a5a26" stroke-width="1.6"/>
        <path d="M38.6 28.6 q4 -0.8 6 2.4 q-3.4 1.6 -6.6 0z" fill="#9aa2b0" stroke="#2a1a0e" stroke-width="0.9"/></svg>`,
    lumbermill: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <ellipse cx="8" cy="39.6" rx="4" ry="3.6" fill="#a9743c" stroke="#2a1a0e" stroke-width="1.1"/>
        <ellipse cx="8" cy="39.6" rx="1.8" ry="1.6" fill="none" stroke="#7a5028" stroke-width="1"/>
        <ellipse cx="10.6" cy="34" rx="4" ry="3.6" fill="#bd864a" stroke="#2a1a0e" stroke-width="1.1"/>
        <ellipse cx="10.6" cy="34" rx="1.8" ry="1.6" fill="none" stroke="#7a5028" stroke-width="1"/>
        <rect x="15" y="20" width="27" height="23" fill="#9c7444" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="15" y="20" width="10" height="23" fill="#b78a52"/>
        <path d="M15.4 25.6 h26 M15.4 31.2 h26 M15.4 36.8 h26" stroke="#6b4420" stroke-width="0.9"/>
        <polygon points="13,20.5 44,20.5 28.5,9" fill="#c89a40" stroke="#2a1a0e" stroke-width="1.3"/>
        <polygon points="17,19.6 28.5,11.2 28.5,19.6" fill="#e0b45a"/>
        <circle cx="35" cy="30" r="7" fill="#cfd5df" stroke="#2a1a0e" stroke-width="1.2" stroke-dasharray="2.6 1.5"/>
        <circle cx="35" cy="30" r="4.6" fill="#e6eaf1" stroke="#8a919e" stroke-width="0.9"/>
        <path d="M31.4 27 a4.9 4.9 0 0 1 3.8 -1.9" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <circle cx="35" cy="30" r="1.6" fill="#4d5462" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="18.4" y="33" width="6.4" height="10" rx="1" fill="#4a2f14" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="19.4" y="34" width="2.2" height="9" fill="#6b4420"/></svg>`,
    farm: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <path d="M8.5 19 L24 9 L39.5 19 L39.5 24 L8.5 24 z" fill="#a02818" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M11.4 18.6 L24 10.8 L24 18.6 z" fill="#c74534"/>
        <rect x="9.5" y="24" width="29" height="17" fill="#c0392b" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="9.5" y="24" width="11" height="17" fill="#d6564a"/>
        <path d="M10 28.4 h28 M10 33 h28" stroke="#8f2418" stroke-width="0.8"/>
        <rect x="19.5" y="28" width="9" height="13" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M19.5 28 l9 13 M28.5 28 l-9 13" stroke="#f2ead6" stroke-width="1.6"/>
        <rect x="12" y="26.5" width="4.4" height="4.4" rx="0.8" fill="#ffdf8a" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="31.6" y="26.5" width="4.4" height="4.4" rx="0.8" fill="#f0c85a" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="21.6,14.6 26.4,14.6 26.4,18.4 24,17 21.6,18.4" fill="#f2ead6" stroke="#2a1a0e" stroke-width="0.8"/>
        <g stroke="#c9a227" stroke-width="1.2" fill="none" stroke-linecap="round">
            <path d="M6 43.5 q-0.6 -3.5 1 -6 M9.5 43.5 q0.6 -3.5 -1 -6"/>
            <path d="M40 43.5 q-0.6 -3.5 1 -6 M43.5 43.5 q0.6 -3.5 -1 -6"/>
        </g>
        <ellipse cx="7" cy="36.6" rx="1.7" ry="2.6" fill="#f0c850" stroke="#2a1a0e" stroke-width="0.7"/>
        <ellipse cx="42" cy="36.6" rx="1.7" ry="2.6" fill="#f0c850" stroke="#2a1a0e" stroke-width="0.7"/></svg>`,
    coinmint: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="19" ry="3" fill="rgba(0,0,0,0.3)"/>
        <polygon points="5,19.5 24,9.5 43,19.5 43,22.5 5,22.5" fill="#e6ddc2" stroke="#2a1a0e" stroke-width="1.3"/>
        <polygon points="9.5,19 24,11.4 24,19" fill="#f5efdc"/>
        <rect x="7" y="22.5" width="34" height="16.5" fill="#ddd2b2" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="10.5" y="24.5" width="4.6" height="14.5" fill="#f2ead4" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="10.5" y="24.5" width="1.8" height="14.5" fill="#fffaea"/>
        <rect x="21.7" y="24.5" width="4.6" height="14.5" fill="#efe6cc" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="21.7" y="24.5" width="1.8" height="14.5" fill="#fdf6e2"/>
        <rect x="32.9" y="24.5" width="4.6" height="14.5" fill="#e8dec2" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="32.9" y="24.5" width="1.8" height="14.5" fill="#f8f0da"/>
        <rect x="5" y="39" width="38" height="4" fill="#c9bc98" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="5" y="39" width="15" height="1.6" fill="#e0d5b2"/>
        <circle cx="24" cy="15.8" r="4.6" fill="#fbc536" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="24" cy="15.8" r="3" fill="none" stroke="#a86d06" stroke-width="0.9"/>
        <ellipse cx="22.4" cy="13.9" rx="1.5" ry="0.9" fill="#fff3b0" transform="rotate(-28 22.4 13.9)"/>
        <path d="M24 13.6 v4.4 M22.7 14.6 h2.2 q1 0 1 1 q0 1 -1 1 h-1.8 q-1 0 -1 1 q0 1 1 1 h2.4" stroke="#8a5a06" stroke-width="0.8" fill="none"/></svg>`,
    storage: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="8" y="19" width="32" height="23" fill="#a87d4a" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="8" y="19" width="12" height="23" fill="#c2955c"/>
        <path d="M8.4 24 h31 M8.4 29 h31" stroke="#7a5028" stroke-width="0.9"/>
        <polygon points="6,19.5 42,19.5 24,8.5" fill="#6b4520" stroke="#2a1a0e" stroke-width="1.3"/>
        <polygon points="10.4,18.6 24,10.4 24,18.6" fill="#855a2c"/>
        <rect x="17.5" y="26" width="13" height="16" fill="#3c2a18" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="18.6" y="27" width="4.8" height="15" fill="#59391c"/>
        <line x1="24" y1="26.4" x2="24" y2="42" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="21" cy="34" r="0.9" fill="#e7c24c"/>
        <rect x="33" y="33.5" width="7.5" height="8.5" fill="#8a5a26" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="33" y="33.5" width="3" height="8.5" fill="#a5713d"/>
        <path d="M33.2 36.4 h7 M33.2 39.2 h7" stroke="#5a3a1c" stroke-width="0.8"/>
        <path d="M7 42 q2.6 -5 5.6 0z" fill="#c9a227" stroke="#2a1a0e" stroke-width="0.9"/></svg>`,
    barracks: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="4.5" y="14" width="10" height="29" fill="#948a78" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="4.5" y="14" width="4" height="29" fill="#aca28e"/>
        <path d="M4 14.5 h2.6 v-3.4 h2.6 v3.4 h2.6 v-3.4 h2.6 v3.4" fill="#948a78" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="33.5" y="14" width="10" height="29" fill="#877d6b" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="33.5" y="14" width="3.6" height="29" fill="#9c927e"/>
        <path d="M33 14.5 h2.6 v-3.4 h2.6 v3.4 h2.6 v-3.4 h2.6 v3.4" fill="#877d6b" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="12" y="21" width="24" height="22" fill="#a89e8e" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="12" y="21" width="9" height="22" fill="#beb4a2"/>
        <path d="M11.5 21.5 h3 v-3 h3.2 v3 h4.6 v-3 h3.2 v3 h4.6 v-3 h3.2 v3 h3.2" fill="none" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M18.5 43 v-7.5 a5.5 5.5 0 0 1 11 0 V43 z" fill="#3c2a18" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M19.8 43 v-7 a4.2 4.2 0 0 1 4.2 -4.1 l0 11.1z" fill="#59391c"/>
        <rect x="6.6" y="18.5" width="2.2" height="6" rx="1" fill="#241a10"/>
        <rect x="38.6" y="18.5" width="2.2" height="6" rx="1" fill="#241a10"/>
        <g transform="translate(24 27)">
            <line x1="-4.6" y1="-4.6" x2="4.6" y2="4.6" stroke="#2a1a0e" stroke-width="2.8"/>
            <line x1="4.6" y1="-4.6" x2="-4.6" y2="4.6" stroke="#2a1a0e" stroke-width="2.8"/>
            <line x1="-4.6" y1="-4.6" x2="4.6" y2="4.6" stroke="#dfe4ec" stroke-width="1.5"/>
            <line x1="4.6" y1="-4.6" x2="-4.6" y2="4.6" stroke="#c7ccd6" stroke-width="1.5"/>
        </g>
        <polygon points="14,10.5 14,3.5 20.5,6 14,8.5" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="14" y1="3.5" x2="14" y2="14" stroke="#5a3a1c" stroke-width="1.3"/></svg>`,
    stable: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="20" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="9" y="20" width="30" height="22" fill="#a87d4a" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="9" y="20" width="11" height="22" fill="#c2955c"/>
        <path d="M9.4 25.6 h29 M9.4 31 h29" stroke="#7a5028" stroke-width="0.9"/>
        <polygon points="7,20.5 41,20.5 24,9" fill="#c89a40" stroke="#2a1a0e" stroke-width="1.3"/>
        <polygon points="11.4,19.6 24,11.2 24,19.6" fill="#e0b45a"/>
        <rect x="15" y="26.5" width="18" height="15.5" fill="#4a3420" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M15 34.4 h18" stroke="#8a5a26" stroke-width="1.6"/>
        <path d="M15.5 27 l17 15 M32.5 27 l-17 15" stroke="#8a5a26" stroke-width="1.4"/>
        <!-- horse looking out -->
        <path d="M20.5 34.2 q0 -4.4 3.6 -4.6 q2.6 0 3.4 2.2 l1.8 4.6 q0.4 1.6 -1.2 1.6 l-6 0 q-1.6 0 -1.6 -1.8z" fill="#6b4526" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M21.3 33.8 q0.2 -3.4 2.8 -3.6 l0 3.8z" fill="#82562f"/>
        <path d="M23.6 29.8 q-0.4 -2.2 1 -3.6 l1.4 2.6 M26.6 30.6 q1.4 -1.6 3 -1.4 l-0.6 2.6" fill="none" stroke="#2a1a0e" stroke-width="1"/>
        <ellipse cx="27.8" cy="37" rx="1.9" ry="1.4" fill="#4a2f16"/>
        <circle cx="24.6" cy="33.4" r="0.8" fill="#2a1a0e"/>
        <path d="M22.2 30.4 q-1.8 2 -1.4 4.6" stroke="#3c2413" stroke-width="1.6" fill="none"/>
        <path d="M35 17 q3.2 -1.4 4.4 1 q-2 1.8 -4.6 0.8z" fill="#c9a227" stroke="#2a1a0e" stroke-width="0.8"/></svg>`,
    researchlab: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="18" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="10" y="15" width="28" height="27" rx="2.5" fill="#274a6e" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="10" y="15" width="10.5" height="27" rx="2.5" fill="#33628e"/>
        <path d="M8.5 15.5 h31 l-3 -5.5 h-25z" fill="#1c3652" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M11.6 14.8 l1.9 -4 h9 l-1 4z" fill="#28527c"/>
        <circle cx="24" cy="7" r="2.6" fill="#5fb0f0" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="23.2" cy="6.2" r="0.8" fill="#d6ecff"/>
        <!-- glowing flask -->
        <path d="M20.5 19 v6 l-5.5 10.5 a2.4 2.4 0 0 0 2.2 3.5 h13.6 a2.4 2.4 0 0 0 2.2 -3.5 L27.5 25 v-6 z" fill="#79c3f7" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M17.6 31 q6.4 -2.6 12.8 0 l2.4 4.6 a2 2 0 0 1 -1.8 2.6 h-14 a2 2 0 0 1 -1.8 -2.6z" fill="#3ddc84"/>
        <path d="M18.6 30.4 q3 -1.2 5.4 -1.3 l-0.1 8 -5.5 0 a1.6 1.6 0 0 1 -1.5 -2.2z" fill="#6ee8a5"/>
        <circle cx="22.4" cy="33.6" r="1.5" fill="#eafff2"><animate attributeName="cy" values="34;31.6;34" dur="2.2s" repeatCount="indefinite"/></circle>
        <circle cx="26" cy="35.6" r="1" fill="#d2f7e2"/>
        <rect x="19.4" y="17.6" width="9.2" height="2.2" rx="1" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M21.4 19.8 l0.6 4.6 -1.6 3.4" stroke="#e7f5ff" stroke-width="1" fill="none" opacity="0.8"/>
        <circle cx="33.8" cy="20.6" r="1.1" fill="#8fd0ff"/>
        <circle cx="14.4" cy="22.8" r="0.9" fill="#8fd0ff"/></svg>`,
    fortress: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="21" ry="3" fill="rgba(0,0,0,0.3)"/>
        <rect x="2.5" y="14" width="11" height="29" fill="#5e5448" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="2.5" y="14" width="4.4" height="29" fill="#786c5c"/>
        <path d="M2 14.5 h2.8 v-3.6 h2.8 v3.6 h2.8 v-3.6 h2.8 v3.6" fill="#5e5448" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="34.5" y="14" width="11" height="29" fill="#514a3e" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="34.5" y="14" width="4" height="29" fill="#675c4e"/>
        <path d="M34 14.5 h2.8 v-3.6 h2.8 v3.6 h2.8 v-3.6 h2.8 v3.6" fill="#514a3e" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="11" y="24" width="26" height="19" fill="#6e6455" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="11" y="24" width="9.5" height="19" fill="#867a68"/>
        <path d="M10.5 24.5 h3.2 v-3 h3.4 v3 h4.8 v-3 h3.4 v3 h4.8 v-3 h3.4 v3 h3.5" fill="none" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="17.5" y="6.5" width="13" height="21" fill="#a89e8e" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="17.5" y="6.5" width="5" height="21" fill="#c2b8a6"/>
        <path d="M17 7 h3 v-3.4 h3 v3.4 h2 v-3.4 h3 v3.4 h3" fill="none" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="22.6" y="11" width="2.8" height="7" rx="1.3" fill="#241a10"/>
        <path d="M19.5 43 v-7 a4.5 4.5 0 0 1 9 0 V43 z" fill="#241207" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M20.6 43 v-6.6 a3.4 3.4 0 0 1 3.4 -3.3 l0 9.9z" fill="#3d2812"/>
        <rect x="20" y="34.6" width="8" height="1.6" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="20" y="38.2" width="8" height="1.6" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="6" y="19" width="2.4" height="6.5" rx="1.1" fill="#241a10"/>
        <rect x="38.6" y="19" width="2.4" height="6.5" rx="1.1" fill="#241a10"/>
        <line x1="31" y1="6" x2="31" y2="1" stroke="#5a3a1c" stroke-width="1.2"/>
        <polygon points="31,1 37,2.8 31,4.8" fill="#2f5cb8" stroke="#2a1a0e" stroke-width="0.8"/></svg>`,
    wall: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.4" rx="21" ry="2.8" fill="rgba(0,0,0,0.3)"/>
        <path d="M4.5 18.5 h6 v-5 h6.5 v5 h7 v-5 h6.5 v5 h7 v-5 h6 v29 h-39z" fill="#9c948a" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M5.2 19.2 h5 v-4.8 h4.9 v27.8 h-9.9z" fill="#b5ac9e"/>
        <path d="M4.8 24.5 h38.4" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M4.8 31 h38.4 M4.8 37.5 h38.4" stroke="#6f6659" stroke-width="1"/>
        <path d="M14 24.5 v6.5 M31 24.5 v6.5 M9 31 v6.5 M24 31 v6.5 M38 31 v6.5 M14 37.5 v6.5 M31 37.5 v6.5" stroke="#6f6659" stroke-width="1"/>
        <path d="M15.5 27 l3 2.4 M33 33.6 l2.6 2.2" stroke="#7d7466" stroke-width="0.8"/>
        <ellipse cx="16.6" cy="21.6" rx="1.4" ry="1" fill="#847a6c"/>
        <ellipse cx="34" cy="28" rx="1.3" ry="0.9" fill="#847a6c"/>
        <path d="M7 46.4 q1.6 -3 3.4 0 M36 46.4 q1.6 -3 3.4 0" fill="#4f7a34" stroke="#2a1a0e" stroke-width="0.8"/></svg>`,
    archertower: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="43.6" rx="16" ry="3" fill="rgba(0,0,0,0.3)"/>
        <polygon points="12,15.5 24,3.5 36,15.5" fill="#a02818" stroke="#2a1a0e" stroke-width="1.3"/>
        <polygon points="15.4,14.6 24,6 24,14.6" fill="#c74534"/>
        <path d="M13.5 15.5 h21 l-2 3.5 h-17z" fill="#7a5028" stroke="#2a1a0e" stroke-width="1.1"/>
        <rect x="15.5" y="19" width="17" height="24" fill="#9c948a" stroke="#2a1a0e" stroke-width="1.3"/>
        <rect x="15.5" y="19" width="6.5" height="24" fill="#b5ac9e"/>
        <path d="M16 25 h16 M16 31.5 h16 M16 38 h16" stroke="#6f6659" stroke-width="0.9"/>
        <path d="M22 25 v6.5 M27 31.5 v6.5 M22 38 v5" stroke="#6f6659" stroke-width="0.9"/>
        <rect x="20.4" y="21.5" width="2.6" height="7.5" rx="1.2" fill="#241a10" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="25" y="21.5" width="2.6" height="7.5" rx="1.2" fill="#241a10" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- archer silhouette with bow in window -->
        <path d="M28.8 33.6 q-3.6 5 0 10" fill="none" stroke="#5a3a1c" stroke-width="1.4"/>
        <line x1="28.8" y1="33.6" x2="28.8" y2="43.6" stroke="#e8dcc0" stroke-width="0.7"/>
        <line x1="24" y1="9" x2="24" y2="3.5" stroke="#5a3a1c" stroke-width="1.1"/>
        <polygon points="24,2.2 29,3.8 24,5.6" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.8"/></svg>`,
    cannon: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="42.6" rx="20" ry="3.2" fill="rgba(0,0,0,0.32)"/>
        <!-- carriage -->
        <path d="M8 38.5 L40 38.5 L36 31 L12 31 z" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M13 31.8 L34.8 31.8 L36.6 35 L11.4 35z" fill="#9a6432"/>
        <!-- barrel angled up-right -->
        <g transform="rotate(-18 24 26)">
            <path d="M6 22.5 q16 -4.5 32 0 l0 7 q-16 4.5 -32 0 z" fill="#2e3340" stroke="#2a1a0e" stroke-width="1.4"/>
            <path d="M7.4 23 q14.6 -3.8 29.2 -0.2 l0 2.4 q-14.6 -3.4 -29.2 0.2z" fill="#4d5462"/>
            <path d="M9 23.4 q6 -1.6 11 -1.9" stroke="#7b8290" stroke-width="1.1" fill="none" stroke-linecap="round"/>
            <ellipse cx="38.6" cy="26" rx="2.8" ry="4.2" fill="#171a22" stroke="#2a1a0e" stroke-width="1.2"/>
            <rect x="30.5" y="20.4" width="2.4" height="11.2" rx="1.1" fill="#3f4453" stroke="#2a1a0e" stroke-width="0.8"/>
            <circle cx="6.8" cy="26" r="2" fill="#3f4453" stroke="#2a1a0e" stroke-width="0.9"/>
        </g>
        <!-- wheel with spokes -->
        <circle cx="20" cy="37" r="6.6" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M14.4 34 a6.6 6.6 0 0 1 5.4 -3.5" stroke="#8a5a26" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <line x1="20" y1="31.2" x2="20" y2="42.8" stroke="#2a1a0e" stroke-width="1.1"/>
        <line x1="14.2" y1="37" x2="25.8" y2="37" stroke="#2a1a0e" stroke-width="1.1"/>
        <line x1="16" y1="33" x2="24" y2="41" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="24" y1="33" x2="16" y2="41" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="20" cy="37" r="1.9" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- cannonball stack -->
        <circle cx="38" cy="40" r="2.6" fill="#232732" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="43" cy="40" r="2.6" fill="#2e3340" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="40.5" cy="36" r="2.6" fill="#3a3f4e" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="39.7" cy="35.2" r="0.7" fill="#7b8290"/></svg>`,
    mortar: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="41.6" rx="17" ry="3.6" fill="rgba(0,0,0,0.35)"/>
        <!-- base platform -->
        <path d="M9 39 L39 39 L35 30.5 L13 30.5 z" fill="#4e4438" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M14 31.3 L33.6 31.3 L35.4 35 L12.2 35z" fill="#675c4a"/>
        <!-- squat tube -->
        <path d="M16.6 32.5 Q13 17.5 24 11.5 Q35 17.5 31.4 32.5 z" fill="#2e3340" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M18 31.5 Q15.4 18.6 23 13 l0.2 3.4 q-4.6 5.4 -3.6 15.1z" fill="#4d5462"/>
        <path d="M19.6 27 q-0.4 -7.4 3.4 -11.4" stroke="#7b8290" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <ellipse cx="24" cy="12.6" rx="7.4" ry="3.5" fill="#171a22" stroke="#2a1a0e" stroke-width="1.3"/>
        <ellipse cx="24" cy="12.4" rx="4.6" ry="2" fill="#000a12"/>
        <ellipse cx="24" cy="14.8" rx="8.6" ry="2.6" fill="none" stroke="#8f97a5" stroke-width="1.4"/>
        <!-- side bolts + trunnions -->
        <circle cx="14.4" cy="34.8" r="2.3" fill="#8a5a26" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="33.6" cy="34.8" r="2.3" fill="#6b4420" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="13.8" cy="34.2" r="0.7" fill="#c9a25a"/>
        <!-- shell beside -->
        <circle cx="8.6" cy="38.2" r="2.8" fill="#232732" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="7.8" cy="37.4" r="0.8" fill="#7b8290"/>
        <path d="M37.6 38.6 q2.4 -3.4 5 -1.2 q-1.4 2.8 -5 2.6z" fill="#c9a227" stroke="#2a1a0e" stroke-width="0.8"/></svg>`
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
        case 'sword': return `<circle cx="9.5" cy="19" r="4.6" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1.1"/>
            <path d="M6 16.4 a4.6 4.6 0 0 1 4.4 -1.9" stroke="#d05540" stroke-width="1.3" fill="none" stroke-linecap="round"/>
            <circle cx="9.5" cy="19" r="1.7" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.7"/>
            <rect x="28.5" y="3.5" width="2.8" height="15.5" rx="1.3" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="0.8"/>
            <rect x="29.2" y="4.2" width="0.8" height="14" fill="#f6f9fd"/>
            <polygon points="28.5,3.5 31.3,3.5 29.9,0.4" fill="#e8ecf3" stroke="#2a1a0e" stroke-width="0.7"/>
            <rect x="26.4" y="18.6" width="7" height="2.2" rx="1" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.7"/>
            <circle cx="29.9" cy="22.4" r="1.3" fill="#e7c24c" stroke="#2a1a0e" stroke-width="0.6"/>`;
        case 'goldsword': return `<circle cx="9.5" cy="19" r="4.6" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1.1"/>
            <path d="M6 16.4 a4.6 4.6 0 0 1 4.4 -1.9" stroke="#f7dd85" stroke-width="1.3" fill="none" stroke-linecap="round"/>
            <rect x="7.6" y="16" width="1.6" height="6" fill="#fffdf0"/><rect x="6.5" y="18.2" width="6" height="1.6" fill="#fffdf0"/>
            <rect x="28.5" y="2.5" width="3" height="16.5" rx="1.4" fill="#f2d066" stroke="#2a1a0e" stroke-width="0.8"/>
            <rect x="29.3" y="3.2" width="0.8" height="15" fill="#fffdf0"/>
            <polygon points="28.5,2.5 31.5,2.5 30,-0.6" fill="#fff8d8" stroke="#2a1a0e" stroke-width="0.7"/>
            <rect x="26.2" y="18.6" width="7.6" height="2.2" rx="1" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.7"/>
            <circle cx="30" cy="22.6" r="1.3" fill="#fff3c4" stroke="#2a1a0e" stroke-width="0.6"/>`;
        case 'bow': return `<path d="M9 10 Q20 0.5 31 10" stroke="#2a1a0e" stroke-width="3.8" fill="none" stroke-linecap="round"/>
            <path d="M9 10 Q20 0.5 31 10" stroke="#8a5a26" stroke-width="2.4" fill="none" stroke-linecap="round"/>
            <path d="M10.5 9.2 Q20 2.2 27 6.4" stroke="#b57c3e" stroke-width="0.9" fill="none"/>
            <line x1="9" y1="10" x2="31" y2="10" stroke="#efe9da" stroke-width="0.8"/>
            <line x1="20" y1="1.6" x2="20" y2="13.4" stroke="#9a6a30" stroke-width="1.4"/>
            <polygon points="20,0 17.2,4.4 22.8,4.4" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="20,13.4 18.4,11 21.6,11" fill="#d24a3a"/>`;
        case 'crossbow': return `<rect x="18.5" y="3.6" width="3" height="16" rx="1.3" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.8"/>
            <rect x="19.3" y="4.2" width="0.8" height="14.5" fill="#8a5a26"/>
            <path d="M11 10.5 q9 -7.4 18 0" stroke="#2a1a0e" stroke-width="3.4" fill="none" stroke-linecap="round"/>
            <path d="M11 10.5 q9 -7.4 18 0" stroke="#8f97a5" stroke-width="2" fill="none" stroke-linecap="round"/>
            <line x1="11" y1="10.5" x2="29" y2="10.5" stroke="#efe9da" stroke-width="0.8"/>
            <line x1="20" y1="2" x2="20" y2="10.5" stroke="#9a6a30" stroke-width="1.3"/>
            <polygon points="20,0.6 17.6,4.4 22.4,4.4" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.6"/>`;
        case 'shield': return `<path d="M7.5 13.5 Q20 3.5 32.5 13.5 L31 20.5 Q20 13.5 9 20.5 Z" fill="#6d2fd8" stroke="#2a1a0e" stroke-width="1.3"/>
            <path d="M9.2 13.2 Q14.5 9 20 8.2 L20 12 Q14 13 10.4 16z" fill="#9b5cff"/>
            <line x1="20" y1="6.4" x2="20" y2="15.6" stroke="#e7c24c" stroke-width="1.4"/>
            <path d="M12.5 13.4 q7.5 -4.6 15 0" stroke="#e7c24c" stroke-width="1.2" fill="none"/>
            <circle cx="10.4" cy="15.4" r="0.8" fill="#c4a1ff"/>
            <circle cx="29.6" cy="15.4" r="0.8" fill="#3f1f6e"/>`;
        case 'spear': return `<rect x="18.8" y="1.5" width="2.4" height="22" rx="1.1" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.8"/>
            <line x1="19.5" y1="2.5" x2="19.5" y2="22" stroke="#b57c3e" stroke-width="0.7"/>
            <path d="M20 -3 q2.6 2.8 0 6.8 q-2.6 -4 0 -6.8z" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="0.8"/>
            <path d="M18.2 4.4 q1.8 1.4 3.6 0 l-0.5 2.8 q-1.3 0.7 -2.6 0z" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.6"/>`;
        case 'club': return `<rect x="27.2" y="8" width="3.6" height="13" rx="1.7" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.8"/>
            <ellipse cx="29" cy="6" rx="5" ry="5.6" fill="#6b4a28" stroke="#2a1a0e" stroke-width="1.1"/>
            <path d="M25.2 3.6 a5 5.6 0 0 1 3.6 -3.1" stroke="#8a6238" stroke-width="1.3" fill="none" stroke-linecap="round"/>
            <polygon points="29,-1 28,1.6 30.2,1.6" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="34.4,4.4 31.8,4.8 32.8,6.8" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="23.6,4.4 26.2,4.8 25.2,6.8" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="0.6"/>`;
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
                <!-- horse from above -->
                <ellipse cx="20" cy="22" rx="8.6" ry="13.6" fill="#6b4a28" stroke="#2a1a0e" stroke-width="1.4"/>
                <path d="M13.6 15 a8.6 13.6 0 0 1 6 -5.8 l0.1 5 q-3.4 0.8 -5.2 3.4z" fill="#8a6238"/>
                <path d="M20 8.6 q-2.4 3 -2.2 7" stroke="#3c2413" stroke-width="2.2" fill="none" stroke-linecap="round"/>
                <ellipse cx="20" cy="7.6" rx="3.6" ry="4.6" fill="#6b4a28" stroke="#2a1a0e" stroke-width="1.1"/>
                <ellipse cx="20" cy="5" rx="2" ry="1.7" fill="#4a2f16"/>
                <polygon points="17.4,9.4 15.8,6.4 18.6,7.4" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.7"/>
                <polygon points="22.6,9.4 24.2,6.4 21.4,7.4" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="0.7"/>
                <path d="M18.2 34.4 q1.8 2.6 3.6 0" stroke="#4a2f16" stroke-width="2" fill="none" stroke-linecap="round"/>
                <!-- saddle blanket -->
                <path d="M13 17.8 q7 -2.4 14 0 l-0.8 8.4 q-6.2 2.2 -12.4 0z" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1"/>
                <path d="M13.9 18.4 q3.2 -1 6.1 -1.1 l-0.1 9 q-2.9 -0.1 -5.4 -0.9z" fill="#d05540"/>
                <!-- rider shoulders + helm -->
                <circle cx="14.6" cy="20.6" r="3.1" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.3"/>
                <circle cx="25.4" cy="20.6" r="3.1" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.3"/>
                <circle cx="20" cy="20" r="5.4" fill="${pal.body}" stroke="${pal.bodyDark}" stroke-width="1.4"/>
                <path d="M15.4 18 a5.4 5.4 0 0 1 4.4 -3.3" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
                <circle cx="20" cy="19.6" r="2.9" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.1"/>
                <line x1="20" y1="16.7" x2="20" y2="22.5" stroke="${pal.baseDark}" stroke-width="0.8"/>
                <!-- lance -->
                <rect x="27.8" y="4" width="2.2" height="16" rx="1" fill="#8a5a26" stroke="#2a1a0e" stroke-width="0.8"/>
                <polygon points="28.9,0.8 27.2,4.6 30.6,4.6" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="0.7"/>
            </g>
        </svg>`;
    }
    if (weapon === 'siege') {
        return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="30" rx="16" ry="5" fill="rgba(0,0,0,0.35)"/>
            <!-- wheels -->
            <circle cx="10.6" cy="13" r="3.2" fill="#3c2413" stroke="#2a1a0e" stroke-width="1"/>
            <circle cx="29.4" cy="13" r="3.2" fill="#3c2413" stroke="#2a1a0e" stroke-width="1"/>
            <circle cx="10.6" cy="29" r="3.2" fill="#3c2413" stroke="#2a1a0e" stroke-width="1"/>
            <circle cx="29.4" cy="29" r="3.2" fill="#3c2413" stroke="#2a1a0e" stroke-width="1"/>
            <!-- hull -->
            <rect x="8" y="10" width="24" height="21" rx="2.4" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1.5"/>
            <rect x="9.2" y="11" width="9" height="19" rx="1.8" fill="#9a6432"/>
            <path d="M12 11.4 v18.4 M17 11.4 v18.4 M22 11.4 v18.4 M27 11.4 v18.4" stroke="#5a3a1c" stroke-width="0.9"/>
            <path d="M8.6 20.5 h22.8" stroke="#5a3a1c" stroke-width="1.1"/>
            <circle cx="10.4" cy="12.6" r="0.7" fill="#c7ccd6"/>
            <circle cx="29.6" cy="12.6" r="0.7" fill="#c7ccd6"/>
            <circle cx="10.4" cy="28.6" r="0.7" fill="#c7ccd6"/>
            <circle cx="29.6" cy="28.6" r="0.7" fill="#c7ccd6"/>
            <!-- ram beam pointing forward -->
            <rect x="17.8" y="1.6" width="4.4" height="12" rx="2" fill="#8a5a26" stroke="#2a1a0e" stroke-width="1"/>
            <rect x="18.8" y="2.4" width="1" height="10.5" fill="#b57c3e"/>
            <path d="M17.4 1.8 a2.8 2.8 0 0 1 5.2 0 l-0.6 2 -4 0z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="0.9"/>
        </svg>`;
    }
    const ranged = weapon === 'bow' || weapon === 'crossbow';
    return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="20" cy="27" rx="11" ry="4.5" fill="rgba(0,0,0,0.32)"/>
        <g ${isEnemy ? 'transform="rotate(180 20 20)"' : ''}>
            ${(weapon === 'spear' || weapon === 'club') ? `<!-- round shield on the left arm -->
            <circle cx="10" cy="20.5" r="5" fill="#c79a4e" stroke="#2a1a0e" stroke-width="1.3"/>
            <path d="M6.2 17.8 a5 5 0 0 1 4.6 -2.2" stroke="#e9cd86" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <circle cx="10" cy="20.5" r="3.1" fill="none" stroke="#7a5320" stroke-width="0.8"/>
            <circle cx="10" cy="20.5" r="1.6" fill="#cfd5df" stroke="#2a1a0e" stroke-width="0.6"/>` : ''}
            <!-- pauldrons -->
            <circle cx="13" cy="16.2" r="4.2" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.4"/>
            <path d="M9.6 14.2 a4.2 4.2 0 0 1 3.4 -2.1" stroke="rgba(255,255,255,0.45)" stroke-width="1.2" fill="none" stroke-linecap="round"/>
            <circle cx="27" cy="16.2" r="4.2" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.4"/>
            <path d="M23.6 14.2 a4.2 4.2 0 0 1 3.4 -2.1" stroke="rgba(255,255,255,0.3)" stroke-width="1.1" fill="none" stroke-linecap="round"/>
            <circle cx="13" cy="16.2" r="1.4" fill="none" stroke="${pal.bodyDark}" stroke-width="0.7" opacity="0.5"/>
            <circle cx="27" cy="16.2" r="1.4" fill="none" stroke="${pal.bodyDark}" stroke-width="0.7" opacity="0.5"/>
            <!-- torso / chestplate -->
            <path d="M12.5 16 Q20 13.2 27.5 16 L26.2 25.8 Q20 28.8 13.8 25.8 Z" fill="${pal.body}" stroke="${pal.bodyDark}" stroke-width="1.4"/>
            <path d="M13.6 16.6 Q16.8 15.4 20 15.2 L19.6 27 Q16.4 26.8 14.4 25.4z" fill="rgba(255,255,255,0.18)"/>
            <path d="M20 16.5 V26.5" stroke="${pal.bodyDark}" stroke-width="1" opacity="0.5"/>
            <path d="M14.2 18.2 Q20 16.6 25.8 18.2" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
            <path d="M14.6 23.6 Q20 25.6 25.4 23.6" fill="none" stroke="${pal.bodyDark}" stroke-width="0.8" opacity="0.5"/>
            <!-- helmet (no face: top-down) -->
            <circle cx="20" cy="15.5" r="6.2" fill="${pal.base}" stroke="${pal.baseDark}" stroke-width="1.7"/>
            <path d="M15.2 12.4 a6.2 6.2 0 0 1 4.6 -3" stroke="rgba(255,255,255,0.5)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
            <path d="M20 9.3 V21.7" stroke="${pal.baseDark}" stroke-width="1.4"/>
            <ellipse cx="20" cy="17.8" rx="3.2" ry="2.6" fill="${pal.skin}" stroke="${pal.baseDark}" stroke-width="0.8"/>
            <circle cx="16.6" cy="14.4" r="0.7" fill="${pal.baseDark}" opacity="0.6"/>
            <circle cx="23.4" cy="14.4" r="0.7" fill="${pal.baseDark}" opacity="0.6"/>
            ${_topWeapon(weapon)}
        </g>
    </svg>`;
}

// ============================================================
// HERO PORTRAITS — hand-drawn vector busts (override assets.js)
// viewBox 0 0 64 64, light from upper-left, warm outlines
// ============================================================
const HERO_ART = {
    knight: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#8f97a5" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#b9c0cc"/>
        <circle cx="15" cy="57.5" r="3.6" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="1.2"/>
        <circle cx="49" cy="57.5" r="3.6" fill="#9aa1b0" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="28" y="41" width="8" height="8" fill="#e8bd8e" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11.5" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23 36 a11.5 11.5 0 0 0 18 0 q-4.4 2.8 -9 2.8 q-4.6 0 -9 -2.8z" fill="#e5b988" opacity="0.75"/>
        <circle cx="27.6" cy="31.8" r="1.3" fill="#2a1a0e"/>
        <circle cx="36.4" cy="31.8" r="1.3" fill="#2a1a0e"/>
        <path d="M25.2 29 l4.2 -1 M38.8 29 l-4.2 -1" stroke="#2a1a0e" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M29.6 37.8 q2.4 1.6 4.8 0" stroke="#8a5a2a" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M20.4 28.5 a11.6 11.6 0 0 1 23.2 0 l0 1 -23.2 0z" fill="#b9c0cc" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.8 25 a11 11 0 0 1 9.4 -7.6 l0.1 4.6 q-5.8 0.5 -9.5 3z" fill="#e2e7ef"/>
        <rect x="19.6" y="26.6" width="24.8" height="4" rx="1.8" fill="#d3d8e2" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M20.6 30.4 l0 6.6 q0 3 3 3.4 l2.4 0.4 -0.8 -10.4z" fill="#b9c0cc" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M43.4 30.4 l0 6.6 q0 3 -3 3.4 l-2.4 0.4 0.8 -10.4z" fill="#9aa1b0" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="30.6" y="28.4" width="2.8" height="7" rx="1.2" fill="#aeb5c2" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M32 17.4 q0.8 -6.4 5.4 -8.6 q3.6 5 0.6 10.4 q-3.4 1.6 -6 -1.8z" fill="#c0392b" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M22 57 l4.4 3.4 -4.4 4.6" fill="none" stroke="#2f5cb8" stroke-width="2" stroke-linecap="round"/>`,
    squire: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#7d6338" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#987a46"/>
        <path d="M18 52 q14 -5 28 0 l-1.4 4.6 q-12.6 -4 -25.2 0z" fill="#2f5cb8" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="28" y="41" width="8" height="8" fill="#e8bd8e" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11.5" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23 36 a11.5 11.5 0 0 0 18 0 q-4.4 2.8 -9 2.8 q-4.6 0 -9 -2.8z" fill="#e5b988" opacity="0.75"/>
        <circle cx="27.6" cy="31.4" r="1.4" fill="#2a1a0e"/>
        <circle cx="36.4" cy="31.4" r="1.4" fill="#2a1a0e"/>
        <circle cx="27.2" cy="31" r="0.45" fill="#fff"/>
        <circle cx="36" cy="31" r="0.45" fill="#fff"/>
        <path d="M25.4 28.2 l4 -0.6 M38.6 28.2 l-4 -0.6" stroke="#2a1a0e" stroke-width="1" stroke-linecap="round"/>
        <path d="M28.8 37.4 q3.2 2.4 6.4 0" stroke="#8a5a2a" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <circle cx="24" cy="34.6" r="1.6" fill="#e88a6a" opacity="0.45"/>
        <circle cx="40" cy="34.6" r="1.6" fill="#e88a6a" opacity="0.45"/>
        <path d="M20.8 27 q-1.4 -8.4 6.2 -10.6 q-1.8 2.4 -1.2 4.4 q3 -4.6 9.4 -4.2 q-1.4 1.8 -1.6 3.6 q3.6 -1.8 7.6 0.4 q3.4 2.4 2 6.6 q-2.6 -3 -6.4 -3.4 q1.4 1.4 1.6 3.2 q-5.4 -3.4 -11 -1.4 q-3.8 1.2 -6.6 1.4z" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M22.4 24.6 q0 -4.6 4.6 -6.8" stroke="#9a6432" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M14 55 l5 -1.4 1.6 5 -5 1.6z" fill="#c7ccd6" stroke="#2a1a0e" stroke-width="1.1"/>`,
    archerqueen: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#1f6e2c" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#2f8a3e"/>
        <line x1="44" y1="48" x2="58" y2="62" stroke="#8a5a26" stroke-width="2.6" stroke-linecap="round"/>
        <line x1="45.6" y1="49.6" x2="55" y2="59" stroke="#b57c3e" stroke-width="0.9"/>
        <rect x="28" y="41" width="8" height="8" fill="#dfae7c" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#e8b98a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23.4 35.6 a11 11 0 0 0 17.2 0 q-4.2 2.7 -8.6 2.7 q-4.4 0 -8.6 -2.7z" fill="#d6a274" opacity="0.75"/>
        <path d="M26 31.2 a2 1.5 0 0 1 3.4 0 M34.6 31.2 a2 1.5 0 0 1 3.4 0" stroke="#2a1a0e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M25.6 28.6 l4 -0.8 M38.4 28.6 l-4 -0.8" stroke="#4a2f14" stroke-width="1" stroke-linecap="round"/>
        <path d="M30 37.4 q2 1.4 4 0" stroke="#a0522d" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M40.4 36 q3.4 5.4 2 12 l-4.4 -1.6 q1.6 -5.6 0.4 -9.2z" fill="#c0552f" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M20 29.6 q-2.4 -12.6 12 -12.8 q14.4 0.2 12 12.8 q-1.6 -4.6 -5.4 -6 q1 1.8 0.8 3.8 q-3.4 -3.4 -7.4 -3.4 q-4 0 -7.4 3.4 q-0.2 -2 0.8 -3.8 q-3.8 1.4 -5.4 6z" fill="#1f6e2c" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.6 25 q1 -4.6 5.6 -6.4 l0.4 2.6 q-3.8 1.2 -6 3.8z" fill="#339142"/>
        <path d="M22.6 21.4 q9.4 -3.4 18.8 0 l-0.6 2 q-8.8 -3 -17.6 0z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M32 18.6 l1.3 2.8 -1.3 2.4 -1.3 -2.4z" fill="#3ddc84" stroke="#2a1a0e" stroke-width="0.8"/>`,
    berserker: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#6b4a28" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M10 64 l3.4 -5 3 4.6 3.4 -6 3.2 5.4 -1 3z M54 64 l-3.4 -5 -3 4.6 -3.4 -6 -3.2 5.4 1 3z" fill="#8a6238" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="28" y="41" width="8" height="8" fill="#e0a877" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11.5" fill="#e8b98a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M27 25.4 l10 3.6" stroke="#b03a2a" stroke-width="2.2" opacity="0.6" stroke-linecap="round"/>
        <circle cx="27.4" cy="31" r="1.4" fill="#2a1a0e"/>
        <circle cx="36.6" cy="31" r="1.4" fill="#2a1a0e"/>
        <path d="M24.6 28.8 l4.6 0.6 M39.4 28.8 l-4.6 0.6" stroke="#7a2a1a" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M22.8 35 q-1.2 9.4 4.4 11.6 q-0.6 -3.4 0.6 -5.4 q0.6 3.8 4.2 5.8 q3.6 -2 4.2 -5.8 q1.2 2 0.6 5.4 q5.6 -2.2 4.4 -11.6 q-2.2 3 -4.6 3.4 l-4.6 -2 -4.6 2 q-2.4 -0.4 -4.6 -3.4z" fill="#b3502a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M24.4 36.6 q1.4 5.6 3.2 7.4" stroke="#d97440" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M29.4 36.8 q2.6 1.6 5.2 0 l-0.8 2.2 -3.6 0z" fill="#3a2410" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M20.6 28 a11.6 11.6 0 0 1 22.8 0 l0 1.4 -22.8 0z" fill="#7b8290" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M22 24.6 a11 11 0 0 1 9.2 -7.2 l0.1 4.4 q-5.6 0.4 -9.3 2.8z" fill="#aeb5c2"/>
        <rect x="19.8" y="27" width="24.4" height="3.4" rx="1.6" fill="#8a5a26" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="23" cy="28.7" r="0.7" fill="#e7c24c"/>
        <circle cx="41" cy="28.7" r="0.7" fill="#e7c24c"/>
        <path d="M19.6 27.6 q-6 -1.6 -8 -8.4 q6.6 0 9.6 4.6z" fill="#f2ead6" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M44.4 27.6 q6 -1.6 8 -8.4 q-6.6 0 -9.6 4.6z" fill="#e0d6be" stroke="#2a1a0e" stroke-width="1.1"/>`,
    valkyrie: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#8fa3c8" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#b6c6e4"/>
        <circle cx="15" cy="57.5" r="3.6" fill="#c9d5ec" stroke="#2a1a0e" stroke-width="1.2"/>
        <circle cx="49" cy="57.5" r="3.6" fill="#8296bc" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M40 47 q4.6 6 3.4 15 l-4.6 -1 q1.6 -8 -1 -12z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M40.6 50 l2 2 M40.9 54 l2.2 1.6 M40.6 58 l2.4 1.2" stroke="#a9842c" stroke-width="0.9"/>
        <rect x="28" y="41" width="8" height="8" fill="#eec89c" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23.4 35.6 a11 11 0 0 0 17.2 0 q-4.2 2.7 -8.6 2.7 q-4.4 0 -8.6 -2.7z" fill="#e5b988" opacity="0.7"/>
        <path d="M26 31 a2 1.5 0 0 1 3.4 0 M34.6 31 a2 1.5 0 0 1 3.4 0" stroke="#2a1a0e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M25.6 28.4 l4 -0.8 M38.4 28.4 l-4 -0.8" stroke="#4a2f14" stroke-width="1" stroke-linecap="round"/>
        <path d="M30 37 q2 1.4 4 0" stroke="#a0522d" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M20.8 28.4 a11.3 11.3 0 0 1 22.4 0 l0 1 -22.4 0z" fill="#c9d3e6" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M22.2 25 a10.7 10.7 0 0 1 9 -7.2 l0.1 4.4 q-5.5 0.5 -9.1 2.8z" fill="#e8eef8"/>
        <rect x="20" y="27" width="24" height="3.6" rx="1.7" fill="#dde5f2" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M20.4 26.6 q-7.4 -0.8 -10.4 -8 q7.4 -0.6 11.4 4.6z" fill="#f6f9fd" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M43.6 26.6 q7.4 -0.8 10.4 -8 q-7.4 -0.6 -11.4 4.6z" fill="#dce4f0" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M32 18.4 l1.2 3 -1.2 2.6 -1.2 -2.6z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M41.6 34 q3.2 4 2.6 10.4 q-2.8 -1 -3.8 -3.2 q0.8 -4 -0.4 -6z" fill="#e8c96a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M42 36.4 l2 1.4 M42.4 39.6 l2 1.4" stroke="#a9842c" stroke-width="0.8"/>`,
    healer: `
        <ellipse cx="32" cy="14.5" rx="12" ry="3.4" fill="none" stroke="#ffe9a0" stroke-width="2.4" opacity="0.95"/>
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#e8dcc0" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#f7efdc"/>
        <path d="M30.4 50 h3.2 v3.6 h3.6 v3.2 h-3.6 v3.6 h-3.2 v-3.6 h-3.6 v-3.2 h3.6z" fill="#d9ab35" stroke="#2a1a0e" stroke-width="0.9"/>
        <rect x="28" y="41" width="8" height="8" fill="#eec89c" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#f5d6a8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23.4 35.6 a11 11 0 0 0 17.2 0 q-4.2 2.7 -8.6 2.7 q-4.4 0 -8.6 -2.7z" fill="#e5b988" opacity="0.7"/>
        <path d="M25.8 31.6 q1.8 -1.6 3.6 0 M34.6 31.6 q1.8 -1.6 3.6 0" stroke="#2a1a0e" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M29.6 37 q2.4 1.8 4.8 0" stroke="#a0522d" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <circle cx="24.4" cy="34" r="1.7" fill="#e88a6a" opacity="0.4"/>
        <circle cx="39.6" cy="34" r="1.7" fill="#e88a6a" opacity="0.4"/>
        <path d="M19.8 32 q-2.6 -14.6 12.2 -14.8 q14.8 0.2 12.2 14.8 l-2.4 -1.2 q1.4 -10.6 -9.8 -10.8 q-11.2 0.2 -9.8 10.8z" fill="#f2e6c8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.2 26.4 q1.6 -6.2 7.4 -7.6 l0.3 2.8 q-4.7 1.4 -6.5 5.6z" fill="#fdf8ea"/>
        <path d="M20.2 30.4 q0.4 6 3.2 8.6 l1.8 -2.6 q-2 -2.6 -2.2 -6.4z" fill="#f2e6c8" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M43.8 30.4 q-0.4 6 -3.2 8.6 l-1.8 -2.6 q2 -2.6 2.2 -6.4z" fill="#e3d3ac" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M24.8 20.6 q7.2 -2.6 14.4 0" stroke="#d9ab35" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    dragonrider: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#8f2d18" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#b8402a"/>
        <path d="M14 58 l4.4 -5.4 3 4.6 -3.4 4.8z" fill="#e08a2e" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M50 58 l-4.4 -5.4 -3 4.6 3.4 4.8z" fill="#c06a1e" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="28" y="41" width="8" height="8" fill="#e0a877" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#e8b98a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23.4 35.6 a11 11 0 0 0 17.2 0 q-4.2 2.7 -8.6 2.7 q-4.4 0 -8.6 -2.7z" fill="#d6a274" opacity="0.75"/>
        <path d="M24 33.4 l4.6 1.2 M40 33.4 l-4.6 1.2" stroke="#e05c20" stroke-width="1.8" opacity="0.7" stroke-linecap="round"/>
        <circle cx="27.6" cy="31.2" r="1.4" fill="#2a1a0e"/>
        <circle cx="36.4" cy="31.2" r="1.4" fill="#2a1a0e"/>
        <path d="M25 28.8 l4.4 -0.2 M39 28.8 l-4.4 -0.2" stroke="#6e2410" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M29.8 37.4 q2.2 1.4 4.4 0" stroke="#a0522d" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M20.6 28.6 a11.4 11.4 0 0 1 22.8 0 l0 1 -22.8 0z" fill="#a8341e" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M22 25.2 a10.8 10.8 0 0 1 9.1 -7.3 l0.1 4.4 q-5.6 0.5 -9.2 2.9z" fill="#cf4a2c"/>
        <rect x="19.8" y="27.2" width="24.4" height="3.4" rx="1.6" fill="#c2472a" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M21.6 26 q-3.2 -6.4 0.6 -12 q3.4 3.6 3.2 8.6z" fill="#3c2413" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M42.4 26 q3.2 -6.4 -0.6 -12 q-3.4 3.6 -3.2 8.6z" fill="#2f1c0e" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M28.2 21.4 q3.8 -2.6 7.6 0 l-1 2.2 q-2.8 -1.6 -5.6 0z" fill="#f0a03a" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M30.2 55.6 q1.8 -3.6 1.8 -6.6 q1.6 2.6 1 5.2 q1.6 -1 2.2 -2.8 q1.6 4.4 -1.6 6.8 q-2.4 0.6 -3.4 -2.6z" fill="#f59e0b" stroke="#2a1a0e" stroke-width="0.9"/>`,
    frostmage: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#3a6d94" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#4f89b4"/>
        <path d="M18 52 q14 -4.6 28 0" stroke="#bfe2f2" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path d="M32 52 l1.6 3 3 0.6 -2.2 2.2 0.4 3.2 -2.8 -1.6 -2.8 1.6 0.4 -3.2 -2.2 -2.2 3 -0.6z" fill="#dff2fc" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="28" y="41" width="8" height="8" fill="#e8d3c2" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#f2e2d4" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23.4 35.6 a11 11 0 0 0 17.2 0 q-4.2 2.7 -8.6 2.7 q-4.4 0 -8.6 -2.7z" fill="#ddc4b2" opacity="0.75"/>
        <circle cx="27.6" cy="31.4" r="1.3" fill="#2b6a92"/>
        <circle cx="36.4" cy="31.4" r="1.3" fill="#2b6a92"/>
        <path d="M25.6 28.8 l4 -0.8 M38.4 28.8 l-4 -0.8" stroke="#3a4a5a" stroke-width="1" stroke-linecap="round"/>
        <path d="M30 37.2 q2 1.2 4 0" stroke="#a06a58" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M21 32.6 q-1.6 6 1.2 9.4 q1.6 -2.2 1.6 -4.6z M43 32.6 q1.6 6 -1.2 9.4 q-1.6 -2.2 -1.6 -4.6z" fill="#eef4f8" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M19.6 30.2 q-1.8 -10.4 12.4 -10.6 q14.2 0.2 12.4 10.6 l-3.4 -1.4 q0.6 -6.6 -9 -6.8 q-9.6 0.2 -9 6.8z" fill="#4f89b4" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.4 25.6 q2 -4.8 8 -5.6 l0.3 2.6 q-4.9 0.8 -6.9 4z" fill="#74a8cc"/>
        <path d="M23 20.6 q4 -8.4 9 -14.6 q5 6.2 9 14.6 l-3.2 1.6 q-2.8 -6.4 -5.8 -10.4 q-3 4 -5.8 10.4z" fill="#3a6d94" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M24.8 19.4 q3.2 -6.6 7.2 -11.6 l0.2 3.2 q-3.2 4.2 -5.2 9.6z" fill="#4f89b4"/>
        <circle cx="32" cy="5.2" r="2.3" fill="#dff2fc" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M25.2 22.4 q6.8 -2.2 13.6 0" stroke="#bfe2f2" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
    shadowassassin: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#3a2a52" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#4d3a6a"/>
        <path d="M20 51 l6 4.6 -3 3.4z M44 51 l-6 4.6 3 3.4z" fill="#2a1e3c" stroke="#2a1a0e" stroke-width="1"/>
        <line x1="47" y1="50" x2="56" y2="63" stroke="#8f97a5" stroke-width="2.2" stroke-linecap="round"/>
        <line x1="47.6" y1="51" x2="53.6" y2="59.6" stroke="#dfe4ec" stroke-width="0.8"/>
        <rect x="28" y="42" width="8" height="7" fill="#2a1e3c" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#4d3a6a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.4 26 q10.6 -4.4 21.2 0 l-0.6 8 q-10 -3.6 -20 0z" fill="#38284e"/>
        <path d="M24.6 31.8 q3 -2.6 6 0 q-3 1.6 -6 0z" fill="#a78bfa"/>
        <path d="M39.4 31.8 q-3 -2.6 -6 0 q3 1.6 6 0z" fill="#a78bfa"/>
        <path d="M24.9 31.5 q2.7 -2 5.4 0" stroke="#e9d5ff" stroke-width="0.9" fill="none"/>
        <path d="M24 29.4 l5.6 0.4 M40 29.4 l-5.6 0.4" stroke="#1c1230" stroke-width="1.4" stroke-linecap="round"/>
        <path d="M22.4 35 q9.6 3.6 19.2 0 l-0.5 5.4 q-9.1 3 -18.2 0z" fill="#221836" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M26 37.4 h3.4 M30.8 38.2 h3.4 M35.6 37.4 h3.4" stroke="#4d3a6a" stroke-width="0.9"/>
        <path d="M19.8 30.4 q-2.4 -12.4 12.2 -12.6 q14.6 0.2 12.2 12.6 q-1.8 -4.2 -5 -5.8 q0.8 1.6 0.6 3.4 q-3.2 -3 -7.8 -3 q-4.6 0 -7.8 3 q-0.2 -1.8 0.6 -3.4 q-3.2 1.6 -5 5.8z" fill="#38284e" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.4 25.2 q1.6 -4.6 6.4 -6.2 l0.3 2.6 q-3.9 1.2 -5.5 4.4z" fill="#4d3a6a"/>`,
    warmage: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#1e4a68" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#2b6084"/>
        <rect x="28" y="41" width="8" height="8" fill="#e8c9a8" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#f0d8ba" stroke="#2a1a0e" stroke-width="1.2"/>
        <circle cx="27.6" cy="30.6" r="1.3" fill="#38bdf8"/>
        <circle cx="36.4" cy="30.6" r="1.3" fill="#38bdf8"/>
        <path d="M24.8 28.2 q2.6 -1.6 4.8 -0.4 M39.2 28.2 q-2.6 -1.6 -4.8 -0.4" stroke="#e8ecf3" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path d="M20.8 35 q-1 12.6 6.4 15.4 q-1 -3.6 -0.2 -6 q1.4 4.4 5 6.6 q3.6 -2.2 5 -6.6 q0.8 2.4 -0.2 6 q7.4 -2.8 6.4 -15.4 q-2.8 3.4 -6 3.8 q-2.6 -1.6 -5.2 -1.6 q-2.6 0 -5.2 1.6 q-3.2 -0.4 -6 -3.8z" fill="#e8ecf3" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M22.6 37.4 q0.6 7.4 3.6 10.4" stroke="#ffffff" stroke-width="1.2" fill="none" stroke-linecap="round"/>
        <path d="M28.4 35.4 q3.6 2 7.2 0 l-1 2.6 q-2.6 1.2 -5.2 0z" fill="#c9cfd9" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M18.6 29 q-1.2 -7.6 6.2 -9.4 l14.4 0 q7.4 1.8 6.2 9.4 l-2.8 -0.6 q0.4 -5.4 -4.6 -6 l-12 0 q-5 0.6 -4.6 6z" fill="#2b6084" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M16 24.8 q-1.6 -3 1.6 -4.4 q1.2 -8.4 11 -9.6 l6.8 0 q9.8 1.2 11 9.6 q3.2 1.4 1.6 4.4 q-8 -3.2 -16 -3.2 q-8 0 -16 3.2z" fill="#1e4a68" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M18.6 21.4 q1.4 -7.6 9.4 -8.8 l0.4 3 q-6.2 1 -7.4 6.6z" fill="#2b6084"/>
        <path d="M31 10.8 q1.4 -4.6 4.6 -6.8 q0.4 3.6 -1.2 6.4 l2.6 -0.8 q-1.4 3 -4.6 3.6z" fill="#38bdf8" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M20.4 19.2 q11.6 -3.8 23.2 0" stroke="#e6c04a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path d="M34 22.8 l-2.6 3.8 2 0.6 -3 4 4.2 -3 -1.8 -0.8 3 -3.8z" fill="#ffe9a0" stroke="#2a1a0e" stroke-width="0.6"/>`,
    warlord: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#3a3025" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#4f4335"/>
        <path d="M8 62 q6 -10 14 -12 l-2 5 q-6 2.6 -9 9z" fill="#8f2d18" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M56 62 q-6 -10 -14 -12 l2 5 q6 2.6 9 9z" fill="#6e2210" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="16" cy="57" r="3.8" fill="#4d5462" stroke="#2a1a0e" stroke-width="1.2"/>
        <polygon points="16,52.6 17,55.4 14.9,55.4" fill="#8f97a5"/>
        <circle cx="48" cy="57" r="3.8" fill="#3f4453" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="28" y="41" width="8" height="8" fill="#d8a878" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11.5" fill="#e0b284" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M23 36 a11.5 11.5 0 0 0 18 0 q-4.4 2.8 -9 2.8 q-4.6 0 -9 -2.8z" fill="#c99a6a" opacity="0.75"/>
        <path d="M36 24.6 l2.2 8.6" stroke="#a05a3a" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="27.4" cy="31.4" r="1.4" fill="#2a1a0e"/>
        <circle cx="36.6" cy="31.4" r="1.4" fill="#2a1a0e"/>
        <path d="M24.6 29 l4.6 0.2 M39.4 29 l-4.6 0.2" stroke="#3a2410" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M29.4 38 l5.2 -0.6" stroke="#7a4a2a" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M26.6 40.6 q5.4 3 10.8 0 l-0.6 4.8 q-4.8 2.2 -9.6 0z" fill="#3c2f22" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M20.4 28.6 a11.6 11.6 0 0 1 23.2 0 l0 1.2 -23.2 0z" fill="#4d5462" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M21.8 25.2 a11 11 0 0 1 9.3 -7.4 l0.1 4.5 q-5.7 0.5 -9.4 2.9z" fill="#6b7280"/>
        <path d="M20 29 l2.6 -6 2.8 4 3 -6.6 3.6 5.4 3.6 -5.4 3 6.6 2.8 -4 2.6 6z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="32" cy="22.4" r="1.4" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.7"/>`,
    celestial: `
        <ellipse cx="32" cy="12" rx="13" ry="3.6" fill="none" stroke="#ffedb0" stroke-width="2.6"/>
        <path d="M12 58 q-6 -14 2 -26 q2 8 8 12 q-6 6 -6 14z" fill="#f6ecd2" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M52 58 q6 -14 -2 -26 q-2 8 -8 12 q6 6 6 14z" fill="#e8d9b4" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#e8d59e" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#f6e8bc"/>
        <circle cx="32" cy="54" r="3" fill="#fff6d8" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="28" y="41" width="8" height="8" fill="#f2ddba" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="32" cy="30" r="11" fill="#f8e8c8" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M24.6 31.6 q3 -2.2 5.6 0 q-2.8 1.8 -5.6 0z" fill="#fffdf2"/>
        <path d="M39.4 31.6 q-3 -2.2 -5.6 0 q2.8 1.8 5.6 0z" fill="#fffdf2"/>
        <path d="M25 29.2 l4.6 -0.6 M39 29.2 l-4.6 -0.6" stroke="#a9842c" stroke-width="1" stroke-linecap="round"/>
        <path d="M30 37.2 q2 1.4 4 0" stroke="#c09a50" stroke-width="1.1" fill="none" stroke-linecap="round"/>
        <path d="M20.6 28.6 a11.4 11.4 0 0 1 22.8 0 l0 1 -22.8 0z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M22 25.2 a10.8 10.8 0 0 1 9.1 -7.3 l0.1 4.4 q-5.6 0.5 -9.2 2.9z" fill="#f7dd85"/>
        <rect x="19.8" y="27.4" width="24.4" height="3.2" rx="1.5" fill="#f2d066" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M19.8 27.2 q-6.4 -1.8 -8.4 -8.2 q6.8 0.2 9.6 5z" fill="#fffdf0" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M44.2 27.2 q6.4 -1.8 8.4 -8.2 q-6.8 0.2 -9.6 5z" fill="#f2e6c2" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M32 16.6 l1 2.6 -1 2.2 -1 -2.2z" fill="#fffdf0" stroke="#2a1a0e" stroke-width="0.7"/>`,
    dragonemperor: `
        <path d="M8 66 q3 -17 24 -17 q21 0 24 17 z" fill="#6e1a10" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M11 66 q3.5 -14 15.5 -15.4 l0.4 15.4z" fill="#8f2d18"/>
        <path d="M18 53 l4 -6 3 5 -3.4 5z M46 53 l-4 -6 -3 5 3.4 5z" fill="#e08a2e" stroke="#2a1a0e" stroke-width="1"/>
        <!-- draconic head -->
        <path d="M20 34 q-3 -12 6 -17 q2.6 -3.6 6 -3.6 q3.4 0 6 3.6 q9 5 6 17 q-1.4 6.4 -6.6 8.6 l-10.8 0 q-5.2 -2.2 -6.6 -8.6z" fill="#a8341e" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M21.6 30.4 q-1.6 -8.8 5.4 -12.6 l1.2 3.4 q-4.8 3.2 -4.4 9.2z" fill="#cf4a2c"/>
        <path d="M22.4 13.8 q-4.4 -4.4 -4.2 -10.2 q5.6 1.8 7.6 7.4z" fill="#3c2413" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M41.6 13.8 q4.4 -4.4 4.2 -10.2 q-5.6 1.8 -7.6 7.4z" fill="#2f1c0e" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M25.4 27 q1.6 -2.6 4.6 -1.4 l-0.4 2.8 q-2.2 -0.8 -4.2 -1.4z" fill="#fde047" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M38.6 27 q-1.6 -2.6 -4.6 -1.4 l0.4 2.8 q2.2 -0.8 4.2 -1.4z" fill="#fde047" stroke="#2a1a0e" stroke-width="0.9"/>
        <ellipse cx="27.6" cy="26.9" rx="0.8" ry="1.3" fill="#2a1a0e"/>
        <ellipse cx="36.4" cy="26.9" rx="0.8" ry="1.3" fill="#2a1a0e"/>
        <path d="M23.6 24 l4.6 1 M40.4 24 l-4.6 1" stroke="#521010" stroke-width="1.5" stroke-linecap="round"/>
        <!-- snout -->
        <path d="M26.4 31 q5.6 -2.4 11.2 0 l1.2 6 q-1.2 3.6 -6.8 3.8 q-5.6 -0.2 -6.8 -3.8z" fill="#c2472a" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M27.4 31.6 q2.6 -1 5 -1.1 l-0.1 8.8 q-4.2 -0.3 -5.2 -3z" fill="#d95f3c"/>
        <ellipse cx="29.6" cy="33.8" rx="1" ry="1.4" fill="#521010"/>
        <ellipse cx="34.4" cy="33.8" rx="1" ry="1.4" fill="#521010"/>
        <path d="M26.8 38.2 l2 2.6 1.6 -2.2 M37.2 38.2 l-2 2.6 -1.6 -2.2" fill="none" stroke="#f5f0dc" stroke-width="1.3" stroke-linecap="round"/>
        <!-- crown -->
        <path d="M22.6 17.4 l2.4 -5 2.6 3.6 4.4 -6 4.4 6 2.6 -3.6 2.4 5z" fill="#e6c04a" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="32" cy="13.4" r="1.3" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.7"/>
        <path d="M28 44 q4 2.4 8 0" stroke="#f59e0b" stroke-width="1.4" fill="none" stroke-linecap="round"/>`
};

// Overrides assets.js version: same markup contract, pure vector art instead of remote images.
function heroPortraitHTML(id) {
    const h = (typeof HERO_DEFS !== 'undefined' && HERO_DEFS[id]) ? HERO_DEFS[id] : { bgGradient: '#2a2a3a', name: id };
    const art = HERO_ART[id] || HERO_ART.knight;
    return `
        <div class="hero-portrait-inner" style="background: ${h.bgGradient}">
            <div class="hero-portrait-shimmer"></div>
            <svg class="hero-img" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${h.name}">${art}</svg>
        </div>
    `;
}

// ============================================================
// CAMP / RAID TARGET ICONS — vector emblems (override assets.js)
// viewBox 0 0 48 48
// ============================================================
const CAMP_ART = {
    goblin: `<circle cx="24" cy="25" r="13" fill="#6e9a3e" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M13.6 19.6 a13 13 0 0 1 10 -7.4 l0.1 5 q-6.2 0.6 -10.1 2.4z" fill="#87b350"/>
        <polygon points="9.2,22 -0.5,15.4 10.4,16.2" fill="#6e9a3e" stroke="#2a1a0e" stroke-width="1.3" transform="translate(3 0)"/>
        <polygon points="38.8,22 48.5,15.4 37.6,16.2" fill="#5c8232" stroke="#2a1a0e" stroke-width="1.3" transform="translate(-3 0)"/>
        <ellipse cx="19" cy="23" rx="3" ry="3.6" fill="#fde047"/>
        <ellipse cx="29" cy="23" rx="3" ry="3.6" fill="#fde047"/>
        <circle cx="19.6" cy="23.7" r="1.4" fill="#2a1a0e"/>
        <circle cx="28.4" cy="23.7" r="1.4" fill="#2a1a0e"/>
        <path d="M15.4 19 l5.6 2 M32.6 19 l-5.6 2" stroke="#2c3a14" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M17 31 q7 4.4 14 0 l-1.6 3.6 q-5.4 2.4 -10.8 0z" fill="#3a2c14" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="18.8,31.6 20.2,34.6 21.8,32.1" fill="#f5f0dc"/>
        <polygon points="29.2,31.6 27.8,34.6 26.2,32.1" fill="#f5f0dc"/>`,
    wolf: `<path d="M13 14 l-3 -9 8 5z M35 14 l3 -9 -8 5z" fill="#5b6470" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M24 8 q11 0 13 10 q1.6 7.4 -4 12 l-4 8 q-2 3.6 -5 3.6 q-3 0 -5 -3.6 l-4 -8 q-5.6 -4.6 -4 -12 q2 -10 13 -10z" fill="#6f7887" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M13.4 17.6 q2 -7.4 9.4 -8.2 l0.2 4.6 q-5.6 0.8 -7.6 5.8z" fill="#8b94a3"/>
        <path d="M24 26 q-6 0 -8.4 -4 l4.4 8.4 q2 3 4 3 q2 0 4 -3 l4.4 -8.4 q-2.4 4 -8.4 4z" fill="#dfe3ea"/>
        <path d="M17 20.6 q2.4 -1.8 4.6 0 q-2.2 1.6 -4.6 0z" fill="#fde047"/>
        <path d="M31 20.6 q-2.4 -1.8 -4.6 0 q2.2 1.6 4.6 0z" fill="#fde047"/>
        <circle cx="19.2" cy="20.5" r="0.9" fill="#2a1a0e"/>
        <circle cx="28.8" cy="20.5" r="0.9" fill="#2a1a0e"/>
        <path d="M14.6 17.4 l5 1 M33.4 17.4 l-5 1" stroke="#3a4048" stroke-width="1.3" stroke-linecap="round"/>
        <ellipse cx="24" cy="31" rx="2.4" ry="1.8" fill="#2a2530"/>
        <path d="M20.8 34.6 l1.4 3 M27.2 34.6 l-1.4 3" stroke="#f5f0dc" stroke-width="1.4" stroke-linecap="round"/>`,
    pirate: `<line x1="10" y1="4" x2="10" y2="44" stroke="#5a3a1c" stroke-width="2.4"/>
        <path d="M11 6 h28 q-3 8 0 16 h-28z" fill="#20242e" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M11.8 7 h8 l-0.4 14 h-7.6z" fill="#333947"/>
        <circle cx="25" cy="12.5" r="4.4" fill="#f2efe2" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="23.4" cy="12" r="1.2" fill="#20242e"/>
        <circle cx="26.6" cy="12" r="1.2" fill="#20242e"/>
        <path d="M24 14 l1 1.6 h-2z" fill="#20242e"/>
        <path d="M19 19.5 l12 -2.5 M19 17 l12 2.5" stroke="#f2efe2" stroke-width="1.8" stroke-linecap="round"/>
        <circle cx="10" cy="4.5" r="1.8" fill="#e6c04a" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M4 44 q6 -3 12 0 q6 3 12 0 q6 -3 12 0 l0 2.5 -36 0z" fill="#2b5f84" stroke="#2a1a0e" stroke-width="1.1"/>`,
    crate: `<path d="M9 16 L24 9 L39 16 L39 38 L24 45 L9 38 z" fill="#a87d4a" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M9 16 L24 23 L39 16 L24 9 z" fill="#c2955c" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M24 23 L24 45 L9 38 L9 16 z" fill="#8a6238" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M10.6 17.6 L24 11 M13 19 L26.6 12.2" stroke="#8a6238" stroke-width="0.9"/>
        <path d="M9.5 26.5 L24 33.4 L38.5 26.5" fill="none" stroke="#5a3a1c" stroke-width="2.4"/>
        <path d="M24 9.5 v13" stroke="#5a3a1c" stroke-width="2"/>
        <circle cx="16.6" cy="30.4" r="1" fill="#3c2a18"/>
        <circle cx="31.4" cy="30.4" r="1" fill="#3c2a18"/>
        <path d="M15 35.4 q9 4.6 18 0" fill="none" stroke="#e7c24c" stroke-width="1.6"/>`,
    tree: `<path d="M21.4 34 h5.2 l1 9 h-7.2z" fill="#7a4a22" stroke="#2a1a0e" stroke-width="1.3"/>
        <path d="M22.4 35 h2 l0.4 8 h-2.8z" fill="#9a6432"/>
        <circle cx="24" cy="18" r="12.5" fill="#3d7a2c" stroke="#2a1a0e" stroke-width="1.5"/>
        <circle cx="14.5" cy="24" r="8" fill="#356b26" stroke="#2a1a0e" stroke-width="1.4"/>
        <circle cx="33.5" cy="24" r="8" fill="#2d5c20" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M14.6 13.4 a12.5 12.5 0 0 1 9 -5.9 l0.1 4.6 q-5.5 0.6 -9.1 1.3z" fill="#55a03c"/>
        <path d="M9 20.6 a8 8 0 0 1 6 -4.4 l0.1 3.6 q-3.7 0.4 -6.1 0.8z" fill="#4a8a34"/>
        <circle cx="19" cy="21" r="1.3" fill="#e05c50"/>
        <circle cx="28" cy="15" r="1.3" fill="#e05c50"/>
        <circle cx="31" cy="27" r="1.3" fill="#e05c50"/>
        <path d="M8 43 q16 -3.6 32 0 l0 1.6 -32 0z" fill="#4f7a34" stroke="#2a1a0e" stroke-width="1"/>`,
    frog: `<ellipse cx="24" cy="30" rx="15" ry="11.5" fill="#4a9a3c" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M11 25.6 a15 11.5 0 0 1 11 -6.9 l0.1 4.4 q-6.7 0.7 -11.1 2.5z" fill="#63b551"/>
        <circle cx="15.5" cy="17" r="6" fill="#4a9a3c" stroke="#2a1a0e" stroke-width="1.4"/>
        <circle cx="32.5" cy="17" r="6" fill="#3f8433" stroke="#2a1a0e" stroke-width="1.4"/>
        <circle cx="15.5" cy="16.6" r="3.4" fill="#fde047" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="32.5" cy="16.6" r="3.4" fill="#fde047" stroke="#2a1a0e" stroke-width="0.9"/>
        <ellipse cx="15.5" cy="16.8" rx="1.2" ry="2" fill="#2a1a0e"/>
        <ellipse cx="32.5" cy="16.8" rx="1.2" ry="2" fill="#2a1a0e"/>
        <path d="M15 32 q9 5.6 18 0" fill="none" stroke="#2a1a0e" stroke-width="1.5" stroke-linecap="round"/>
        <ellipse cx="24" cy="37.8" rx="6.6" ry="2.6" fill="#d8ecb8"/>
        <circle cx="20" cy="26.4" r="1" fill="#2f6a24"/>
        <circle cx="28.6" cy="27.6" r="1" fill="#2f6a24"/>
        <path d="M8.5 39 q-2.6 2.4 -1.6 5 l4.6 -1.6 M39.5 39 q2.6 2.4 1.6 5 l-4.6 -1.6" fill="#4a9a3c" stroke="#2a1a0e" stroke-width="1.2"/>`,
    orc: `<circle cx="24" cy="24" r="14.5" fill="#6a8442" stroke="#2a1a0e" stroke-width="1.7"/>
        <path d="M12.4 17.8 a14.5 14.5 0 0 1 11.2 -8.2 l0.1 5.6 q-7 0.6 -11.3 2.6z" fill="#82a054"/>
        <path d="M12.6 32 a14.5 14.5 0 0 0 22.8 0 q-5.6 3.4 -11.4 3.4 q-5.8 0 -11.4 -3.4z" fill="#526b2c" opacity="0.8"/>
        <ellipse cx="18.4" cy="22" rx="2.8" ry="3.2" fill="#e8452f"/>
        <ellipse cx="29.6" cy="22" rx="2.8" ry="3.2" fill="#e8452f"/>
        <circle cx="18.8" cy="22.5" r="1.3" fill="#2a1a0e"/>
        <circle cx="29.2" cy="22.5" r="1.3" fill="#2a1a0e"/>
        <path d="M14 17.6 l6.4 1.8 M34 17.6 l-6.4 1.8" stroke="#28341a" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M15.4 30 q8.6 4.4 17.2 0 l-1.2 4 q-7.4 3 -14.8 0z" fill="#3a2c14" stroke="#2a1a0e" stroke-width="1.1"/>
        <polygon points="16.8,31.2 18.2,24.8 20.6,31.8" fill="#f5f0dc" stroke="#2a1a0e" stroke-width="0.7"/>
        <polygon points="31.2,31.2 29.8,24.8 27.4,31.8" fill="#f5f0dc" stroke="#2a1a0e" stroke-width="0.7"/>
        <path d="M22 9.4 q1.4 -3.6 3.4 -4.8 q1.6 2.6 0.8 5z" fill="#2c3a14" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="24" cy="27.4" r="1.8" fill="#587038"/>`,
    snowflake: `<g stroke="#9fd7f2" stroke-width="2.6" stroke-linecap="round">
            <line x1="24" y1="5" x2="24" y2="43"/>
            <line x1="7.5" y1="14.5" x2="40.5" y2="33.5"/>
            <line x1="40.5" y1="14.5" x2="7.5" y2="33.5"/>
        </g>
        <g stroke="#d9f1fc" stroke-width="1.6" stroke-linecap="round">
            <path d="M24 9 l-3.6 3.6 M24 9 l3.6 3.6 M24 39 l-3.6 -3.6 M24 39 l3.6 -3.6"/>
            <path d="M11 16.5 l1.2 5 M11 16.5 l4.9 -1.4 M37 31.5 l-1.2 -5 M37 31.5 l-4.9 1.4"/>
            <path d="M37 16.5 l-1.2 5 M37 16.5 l-4.9 -1.4 M11 31.5 l1.2 -5 M11 31.5 l4.9 1.4"/>
        </g>
        <circle cx="24" cy="24" r="4.6" fill="#e8f7fd" stroke="#2a1a0e" stroke-width="1.1"/>
        <circle cx="22.6" cy="22.6" r="1.3" fill="#ffffff"/>`,
    dragon: `<path d="M15 10 l-4.6 -8 9 4.6z" fill="#6e1a10" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M33 10 l4.6 -8 -9 4.6z" fill="#521008" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M24 6 q11.6 0 13.6 11 q1.4 7.6 -3.6 12 l-3 7 q-2.4 4.4 -7 4.4 q-4.6 0 -7 -4.4 l-3 -7 q-5 -4.4 -3.6 -12 q2 -11 13.6 -11z" fill="#a8341e" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M13.2 16.4 q2.2 -7.6 9.6 -8.4 l0.2 4.8 q-5.8 0.8 -7.8 6z" fill="#cf4a2c"/>
        <path d="M16.4 20.4 q2.8 -2.8 6 -1.2 l-0.6 3.4 q-2.8 -1.2 -5.4 -2.2z" fill="#fde047" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M31.6 20.4 q-2.8 -2.8 -6 -1.2 l0.6 3.4 q2.8 -1.2 5.4 -2.2z" fill="#fde047" stroke="#2a1a0e" stroke-width="1"/>
        <ellipse cx="19.4" cy="20.6" rx="1" ry="1.6" fill="#2a1a0e"/>
        <ellipse cx="28.6" cy="20.6" rx="1" ry="1.6" fill="#2a1a0e"/>
        <path d="M18.6 27 q5.4 -2.2 10.8 0 l1.2 5.4 q-1.4 3.6 -6.6 3.8 q-5.2 -0.2 -6.6 -3.8z" fill="#c2472a" stroke="#2a1a0e" stroke-width="1.1"/>
        <ellipse cx="21.6" cy="29.6" rx="1" ry="1.4" fill="#521010"/>
        <ellipse cx="26.4" cy="29.6" rx="1" ry="1.4" fill="#521010"/>
        <path d="M19.4 33.6 l1.8 2.6 1.6 -2.2 M28.6 33.6 l-1.8 2.6 -1.6 -2.2" fill="none" stroke="#f5f0dc" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M21 40.8 q3 3.4 3 6 M27 40.8 q-1 3 -1.4 5.4" stroke="#f59e0b" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    shadow: `<path d="M24 6 q10 0 12 10 l2 20 q0.4 4 -3.6 4.6 l-2.4 -6.6 -1 7 -5 0.8 -2 -7.4 -2 7.4 -5 -0.8 -1 -7 -2.4 6.6 q-4 -0.6 -3.6 -4.6 l2 -20 q2 -10 12 -10z" fill="#38284e" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M13.8 15.4 q1.8 -7 8.2 -7.8 l0.2 4.2 q-5 0.8 -6.8 5.4z" fill="#4d3a6a"/>
        <path d="M15 21 q0 -10 9 -10 q9 0 9 10 l-1 6 q-8 -3.4 -16 0z" fill="#1c1230" stroke="#2a1a0e" stroke-width="1.1"/>
        <path d="M18.6 20.8 q2.8 -2.2 5.2 0 q-2.6 1.6 -5.2 0z" fill="#a78bfa"/>
        <path d="M29.4 20.8 q-2.8 -2.2 -5.2 0 q2.6 1.6 5.2 0z" fill="#a78bfa"/>
        <path d="M18.9 20.5 q2.5 -1.8 4.6 0" stroke="#e9d5ff" stroke-width="0.8" fill="none"/>`,
    volcano: `<path d="M17 10 L31 10 L44 42 L4 42 z" fill="#5e5448" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M18.4 11.4 L24 11.4 L14 40.6 L6.6 40.6z" fill="#786c5c"/>
        <path d="M17 10.5 q7 4 14 0 l-1.6 6 q-5.4 2.6 -10.8 0z" fill="#e84a1e" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M22 15.8 q2 1 4 0 l1.6 9.4 q1.4 3.4 -1 7 l-2.6 -4.2 -2.6 4.2 q-2.4 -3.6 -1 -7z" fill="#f59e0b" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M23.2 17 q0.8 0.4 1.6 0 l1.2 8 q0.8 2.4 -0.6 4.6 l-1.4 -2.4z" fill="#fde047"/>
        <circle cx="15" cy="7" r="2.4" fill="#e84a1e" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="33.6" cy="5.4" r="1.9" fill="#f59e0b" stroke="#2a1a0e" stroke-width="0.9"/>
        <circle cx="24.6" cy="3.6" r="1.5" fill="#fde047" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M10 32 l4 5 M36 28 l-3.4 6" stroke="#3f382e" stroke-width="1.3"/>`,
    demon: `<path d="M13 14 q-5 -3 -6 -10 q6.6 1.2 9 6.6z" fill="#2e2430" stroke="#2a1a0e" stroke-width="1.2"/>
        <path d="M35 14 q5 -3 6 -10 q-6.6 1.2 -9 6.6z" fill="#241c26" stroke="#2a1a0e" stroke-width="1.2"/>
        <circle cx="24" cy="24" r="14" fill="#c83838" stroke="#2a1a0e" stroke-width="1.7"/>
        <path d="M12.8 18 a14 14 0 0 1 10.8 -7.9 l0.1 5.4 q-6.8 0.6 -10.9 2.5z" fill="#d95050"/>
        <path d="M13 31.8 a14 14 0 0 0 22 0 q-5.4 3.2 -11 3.2 q-5.6 0 -11 -3.2z" fill="#8a1c1c" opacity="0.8"/>
        <path d="M16 21.4 q3.4 -3 7 -1.2 l-0.8 3.8 q-3.2 -1.4 -6.2 -2.6z" fill="#fde047"/>
        <path d="M32 21.4 q-3.4 -3 -7 -1.2 l0.8 3.8 q3.2 -1.4 6.2 -2.6z" fill="#fde047"/>
        <ellipse cx="20" cy="22" rx="1.2" ry="1.7" fill="#2a1a0e"/>
        <ellipse cx="28" cy="22" rx="1.2" ry="1.7" fill="#2a1a0e"/>
        <path d="M16.6 29.4 q7.4 4.6 14.8 0 l-1.8 4.4 q-5.6 3 -11.2 0z" fill="#3a0808" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="18.6,30.4 20,33.8 21.6,31" fill="#f5f0dc"/>
        <polygon points="29.4,30.4 28,33.8 26.4,31" fill="#f5f0dc"/>`,
    skull: `<path d="M11 21 a13 13 0 0 1 26 0 q0 7.6 -5 10.4 l0 4.6 q-8 3 -16 0 l0 -4.6 q-5 -2.8 -5 -10.4z" fill="#f0eee0" stroke="#2a1a0e" stroke-width="1.5"/>
        <path d="M12.8 16.6 a12.4 12.4 0 0 1 10.2 -8 l0.1 5 q-6.2 0.6 -10.3 3z" fill="#fbfaf2"/>
        <ellipse cx="18.6" cy="22" rx="3.8" ry="4.4" fill="#1c1a22"/>
        <ellipse cx="29.4" cy="22" rx="3.8" ry="4.4" fill="#1c1a22"/>
        <circle cx="19.2" cy="22.6" r="1.3" fill="#e8452f"/>
        <circle cx="28.8" cy="22.6" r="1.3" fill="#e8452f"/>
        <polygon points="24,26 22.2,30 25.8,30" fill="#c8c4b4" stroke="#2a1a0e" stroke-width="0.7"/>
        <path d="M17.6 33.4 l12.8 0" stroke="#8a8474" stroke-width="1.2"/>
        <path d="M20 32.8 v4 M23 32.8 v4.6 M26 32.8 v4.6 M29 32.8 v4" stroke="#8a8474" stroke-width="1.4"/>
        <path d="M6 40 l7 -4 M42 40 l-7 -4" stroke="#b8b3a0" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M13 36 l-7 -4 M35 36 l7 -4" stroke="#d6d2c2" stroke-width="2.4" stroke-linecap="round"/>`,
    abyss: `<circle cx="24" cy="24" r="16" fill="#120a24" stroke="#2a1a0e" stroke-width="1.6"/>
        <path d="M24 9.6 a14.4 14.4 0 0 1 13.4 9.2 q-6 -3.8 -11 -1 q6.6 2.2 8.6 9.4 q-5.2 -4.4 -10.4 -2.6 q5 3.4 4.6 10.2 q-3.6 -5 -8.6 -5 q3 4.4 0.6 9.4 a14.4 14.4 0 0 1 -11.4 -9.6 q5.8 3.4 10.6 0.8 q-6.4 -2.2 -8.4 -9 q5.2 4 10.2 2.4 q-4.8 -3.6 -4.4 -10 q3.6 4.8 8.4 4.8 q-2.8 -4.4 -2.2 -9z" fill="#4d3a6a"/>
        <circle cx="24" cy="24" r="6.5" fill="#7c3aed" stroke="#2a1a0e" stroke-width="1"/>
        <circle cx="24" cy="24" r="3" fill="#c4a1ff"/>
        <circle cx="22.6" cy="22.6" r="1" fill="#efe4ff"/>`,
    celestial: `<circle cx="24" cy="24" r="9" fill="#ffe9a0" stroke="#2a1a0e" stroke-width="1.3"/>
        <circle cx="21" cy="21" r="2.6" fill="#fff8dc"/>
        <g stroke="#e6c04a" stroke-width="2.6" stroke-linecap="round">
            <line x1="24" y1="3" x2="24" y2="11"/>
            <line x1="24" y1="37" x2="24" y2="45"/>
            <line x1="3" y1="24" x2="11" y2="24"/>
            <line x1="37" y1="24" x2="45" y2="24"/>
        </g>
        <g stroke="#f2d066" stroke-width="1.8" stroke-linecap="round">
            <line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/>
            <line x1="38.5" y1="9.5" x2="33.5" y2="14.5"/>
            <line x1="9.5" y1="38.5" x2="14.5" y2="33.5"/>
            <line x1="38.5" y1="38.5" x2="33.5" y2="33.5"/>
        </g>
        <circle cx="24" cy="24" r="12.6" fill="none" stroke="#f7dd85" stroke-width="1" opacity="0.7"/>`,
    village: `<path d="M6 24 L16 15.5 L26 24 L26 40 L6 40 z" fill="#c9bfa6" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M7.2 24.2 L16 17 L16 38.8 L7.2 38.8z" fill="#ddd3ba"/>
        <polygon points="4,25 16,14 28,25 25.4,27 16,18.4 6.6,27" fill="#b03a2a" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="12.6" y="30" width="6.8" height="10" fill="#5a3a1c" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M24 28 L33 20.5 L42 28 L42 41 L24 41 z" fill="#a87d4a" stroke="#2a1a0e" stroke-width="1.4"/>
        <path d="M25.2 28.2 L33 21.8 L33 39.8 L25.2 39.8z" fill="#c2955c"/>
        <polygon points="22,29 33,19.5 44,29 41.6,30.8 33,23.2 24.4,30.8" fill="#8f2d18" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="30" y="33.5" width="6" height="7.5" fill="#4a3420" stroke="#2a1a0e" stroke-width="1"/>
        <rect x="9.6" y="26.6" width="3.6" height="3.6" rx="0.7" fill="#ffdf8a" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="37" y="30" width="3.4" height="3.4" rx="0.7" fill="#f0c85a" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M4 43 q20 -3.4 40 0 l0 1.6 -40 0z" fill="#4f7a34" stroke="#2a1a0e" stroke-width="1"/>`,
    default: `<rect x="15" y="12" width="18" height="30" fill="#9c948a" stroke="#2a1a0e" stroke-width="1.4"/>
        <rect x="15" y="12" width="7" height="30" fill="#b5ac9e"/>
        <path d="M14.5 12.5 h3.4 v-3.4 h3.4 v3.4 h5.4 v-3.4 h3.4 v3.4 h3.4" fill="none" stroke="#2a1a0e" stroke-width="1.2"/>
        <rect x="21.6" y="18" width="4.8" height="8" rx="2.2" fill="#241a10"/>
        <path d="M18 42 v-6 a6 6 0 0 1 12 0 v6z" fill="#3c2a18" stroke="#2a1a0e" stroke-width="1.1"/>
        <line x1="33" y1="9" x2="33" y2="3" stroke="#5a3a1c" stroke-width="1.2"/>
        <polygon points="33,3 39,4.8 33,6.8" fill="#c0392b" stroke="#2a1a0e" stroke-width="0.8"/>`
};

// Overrides assets.js version: inline SVG emblem instead of remote image.
function campIconHTML(iconKey) {
    const art = CAMP_ART[iconKey] || CAMP_ART.default;
    return `<svg class="camp-icon-img" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${iconKey}">${art}</svg>`;
}
