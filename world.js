// ============================================================
// ISOMETRIC WORLD RENDERER
// Real iso tilemap with depth sorting, animated decorations,
// detailed hand-crafted building art.
// ============================================================

const ISO = {
    TW: 48,        // tile half-width
    TH: 24,        // tile half-height
    GW: 14,        // grid width (cols)
    GH: 10,        // grid height (rows)
    OFFSET_X: 0,
    OFFSET_Y: 0
};

// Camera state — pan/zoom (SVG transform) + 3D view angle (CSS transform)
const CAM = { x: 0, y: 0, zoom: 1, minZoom: 0.6, maxZoom: 2.2 };
const VIEW = { spin: 0, tilt: 0 };  // degrees: spin = orbit around, tilt = lean back

// Compute final viewbox & offset so everything is centered
function isoSetup() {
    const w = (ISO.GW + ISO.GH) * ISO.TW;
    const h = (ISO.GW + ISO.GH) * ISO.TH + 120; // room for tall buildings above
    ISO.OFFSET_X = ISO.GH * ISO.TW;
    ISO.OFFSET_Y = 80;
    return { w, h };
}

function iso(gx, gy) {
    return {
        x: (gx - gy) * ISO.TW + ISO.OFFSET_X,
        y: (gx + gy) * ISO.TH + ISO.OFFSET_Y
    };
}

// ============================================================
// PROCEDURAL TERRAIN — deterministic per session
// ============================================================
// Tile types: 0=grass, 1=darkgrass, 2=path, 3=water, 4=sand
let TERRAIN = null;
let DECORATIONS = null;

function genTerrain() {
    const T = [];
    for (let gy = 0; gy < ISO.GH; gy++) {
        T[gy] = [];
        for (let gx = 0; gx < ISO.GW; gx++) {
            const n = pseudoNoise(gx, gy);
            // Lake region on the left (gx 0-1, gy 3-6)
            if (gx <= 1 && gy >= 3 && gy <= 6) T[gy][gx] = 3;
            // Sand transition around lake
            else if (gx === 2 && gy >= 3 && gy <= 6) T[gy][gx] = 4;
            else if (gx === 0 && (gy === 2 || gy === 7)) T[gy][gx] = 4;
            else if (n > 0.78) T[gy][gx] = 1;
            else T[gy][gx] = 0;
        }
    }
    // Winding path from upper-right through middle to lower-left
    const path = [
        [12, 0], [12, 1], [11, 2], [10, 3], [9, 3], [8, 4], [7, 4], [6, 5],
        [5, 5], [5, 6], [4, 7], [4, 8], [5, 9]
    ];
    for (const [px, py] of path) {
        if (px >= 0 && px < ISO.GW && py >= 0 && py < ISO.GH && T[py][px] !== 3) T[py][px] = 2;
    }
    // Second branch
    const path2 = [[8, 4], [9, 5], [10, 6], [11, 7], [12, 7], [13, 8]];
    for (const [px, py] of path2) {
        if (px >= 0 && px < ISO.GW && py >= 0 && py < ISO.GH && T[py][px] !== 3) T[py][px] = 2;
    }
    return T;
}

function pseudoNoise(x, y) {
    // Simple deterministic hash-based noise
    const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return v - Math.floor(v);
}

function genDecorations() {
    const D = [];
    for (let gy = 0; gy < ISO.GH; gy++) {
        for (let gx = 0; gx < ISO.GW; gx++) {
            const t = TERRAIN[gy][gx];
            if (t !== 0 && t !== 1) continue;
            const n = pseudoNoise(gx + 1.7, gy + 2.3);
            if (n > 0.93) D.push({ gx, gy, type: 'tree', variant: Math.floor(pseudoNoise(gx, gy + 5) * 3) });
            else if (n > 0.88) D.push({ gx, gy, type: 'rock', variant: Math.floor(pseudoNoise(gx + 1, gy + 1) * 2) });
            else if (n > 0.83) D.push({ gx, gy, type: 'bush' });
            else if (n > 0.78 && t === 0) D.push({ gx, gy, type: 'flower', variant: Math.floor(pseudoNoise(gx, gy + 9) * 3) });
        }
    }
    return D;
}

// ============================================================
// SVG ATOMS — terrain tiles, decorations, building parts
// ============================================================

const tileSVG = (gx, gy, type) => {
    const { x, y } = iso(gx, gy);
    const fills = {
        0: { top: '#5fb43b', light: '#7ed64f', shadow: '#3a8024' },
        1: { top: '#4f9e30', light: '#6ec03e', shadow: '#2e6e1e' },
        2: { top: '#caa269', light: '#dcb784', shadow: '#9b7847' },
        3: { top: '#3a87d4', light: '#5fb0f0', shadow: '#1f5694' },
        4: { top: '#e6cf95', light: '#f3e0aa', shadow: '#b89e6a' }
    };
    const f = fills[type] || fills[0];
    const TW = ISO.TW, TH = ISO.TH;
    // Diamond polygon: top, right, bottom, left
    const pts = `${x},${y - TH} ${x + TW},${y} ${x},${y + TH} ${x - TW},${y}`;
    const animate = type === 3 ? `<animate attributeName="fill" values="${f.top};${f.light};${f.top}" dur="3s" repeatCount="indefinite"/>` : '';
    return `
        <polygon points="${pts}" fill="${f.top}" stroke="${f.shadow}" stroke-width="0.6" stroke-opacity="0.3">${animate}</polygon>
        <polygon points="${x},${y - TH} ${x + TW * 0.45},${y - TH * 0.3} ${x},${y - TH * 0.1} ${x - TW * 0.45},${y - TH * 0.3}" fill="${f.light}" opacity="0.35"/>
    `;
};

const treeSVG = (gx, gy, variant) => {
    const { x, y } = iso(gx, gy);
    const variants = [
        // Pine
        `<ellipse cx="${x + 2}" cy="${y + 4}" rx="14" ry="3" fill="rgba(0,0,0,0.35)"/>
         <rect x="${x - 2}" y="${y - 12}" width="4" height="18" fill="#5a3818" stroke="#3a2010" stroke-width="0.4"/>
         <polygon points="${x - 14},${y - 8} ${x + 14},${y - 8} ${x},${y - 38}" fill="#1e6e2e" stroke="#0e3818" stroke-width="0.6"/>
         <polygon points="${x - 11},${y - 16} ${x + 11},${y - 16} ${x},${y - 40}" fill="#27873a" stroke="#0e3818" stroke-width="0.4"/>
         <polygon points="${x - 8},${y - 24} ${x + 8},${y - 24} ${x},${y - 44}" fill="#33a04a" stroke="#0e3818" stroke-width="0.4"/>`,
        // Oak
        `<ellipse cx="${x + 2}" cy="${y + 5}" rx="18" ry="4" fill="rgba(0,0,0,0.35)"/>
         <rect x="${x - 3}" y="${y - 10}" width="6" height="16" fill="#6b4520" stroke="#3a2010" stroke-width="0.4"/>
         <line x1="${x}" y1="${y - 10}" x2="${x - 8}" y2="${y - 18}" stroke="#5a3818" stroke-width="1.5"/>
         <line x1="${x}" y1="${y - 10}" x2="${x + 8}" y2="${y - 18}" stroke="#5a3818" stroke-width="1.5"/>
         <circle cx="${x}" cy="${y - 22}" r="18" fill="#2e8b30" stroke="#1a5e1c" stroke-width="0.6"/>
         <circle cx="${x - 10}" cy="${y - 18}" r="11" fill="#33a04a" stroke="#1a5e1c" stroke-width="0.5"/>
         <circle cx="${x + 11}" cy="${y - 16}" r="10" fill="#33a04a" stroke="#1a5e1c" stroke-width="0.5"/>
         <circle cx="${x + 2}" cy="${y - 30}" r="9" fill="#3eb95a" stroke="#1a5e1c" stroke-width="0.5"/>
         <circle cx="${x - 5}" cy="${y - 25}" r="4" fill="#5ad078" opacity="0.6"/>`,
        // Cherry
        `<ellipse cx="${x + 2}" cy="${y + 4}" rx="15" ry="3" fill="rgba(0,0,0,0.3)"/>
         <rect x="${x - 2}" y="${y - 8}" width="4" height="14" fill="#5a3818"/>
         <circle cx="${x}" cy="${y - 18}" r="14" fill="#f7a5c4" stroke="#a04a78" stroke-width="0.6"/>
         <circle cx="${x - 8}" cy="${y - 14}" r="8" fill="#fcc4d8" stroke="#a04a78" stroke-width="0.4"/>
         <circle cx="${x + 9}" cy="${y - 14}" r="9" fill="#fcc4d8" stroke="#a04a78" stroke-width="0.4"/>
         <circle cx="${x}" cy="${y - 24}" r="6" fill="#ffd0e0"/>
         <circle cx="${x - 4}" cy="${y - 22}" r="1.2" fill="#fff" opacity="0.7"/>`
    ];
    return variants[variant % variants.length];
};

const rockSVG = (gx, gy, variant) => {
    const { x, y } = iso(gx, gy);
    if (variant === 0) {
        return `<ellipse cx="${x + 1}" cy="${y + 4}" rx="9" ry="2" fill="rgba(0,0,0,0.35)"/>
        <path d="M ${x - 8} ${y + 3} Q ${x - 9} ${y - 6} ${x - 2} ${y - 8} Q ${x + 6} ${y - 7} ${x + 8} ${y - 1} Q ${x + 7} ${y + 4} ${x - 8} ${y + 3} Z" fill="#8e8278" stroke="#3e3328" stroke-width="0.6"/>
        <path d="M ${x - 6} ${y - 4} Q ${x - 2} ${y - 8} ${x + 4} ${y - 6}" stroke="#b8a89c" stroke-width="0.6" fill="none" opacity="0.7"/>`;
    }
    return `<ellipse cx="${x + 1}" cy="${y + 3}" rx="7" ry="2" fill="rgba(0,0,0,0.35)"/>
    <path d="M ${x - 6} ${y + 2} Q ${x - 7} ${y - 4} ${x} ${y - 6} Q ${x + 6} ${y - 4} ${x + 6} ${y + 1} Q ${x + 4} ${y + 3} ${x - 6} ${y + 2} Z" fill="#a89c8e" stroke="#3e3328" stroke-width="0.5"/>
    <ellipse cx="${x - 1}" cy="${y - 3}" rx="2" ry="1" fill="rgba(255,255,255,0.4)"/>`;
};

const bushSVG = (gx, gy) => {
    const { x, y } = iso(gx, gy);
    return `<ellipse cx="${x + 1}" cy="${y + 3}" rx="10" ry="2" fill="rgba(0,0,0,0.3)"/>
    <circle cx="${x - 4}" cy="${y - 2}" r="5" fill="#2e8b30" stroke="#1a5e1c" stroke-width="0.5"/>
    <circle cx="${x + 4}" cy="${y - 2}" r="5" fill="#2e8b30" stroke="#1a5e1c" stroke-width="0.5"/>
    <circle cx="${x}" cy="${y - 5}" r="5" fill="#33a04a" stroke="#1a5e1c" stroke-width="0.5"/>
    <circle cx="${x - 2}" cy="${y - 4}" r="1.5" fill="#ff6b6b"/>
    <circle cx="${x + 3}" cy="${y - 3}" r="1.5" fill="#ff6b6b"/>`;
};

const flowerSVG = (gx, gy, variant) => {
    const { x, y } = iso(gx, gy);
    const colors = [['#ff5e6c', '#a02838'], ['#ffd23f', '#a06b00'], ['#a78bfa', '#5a3a8a']];
    const [c1, c2] = colors[variant % colors.length];
    return `<line x1="${x}" y1="${y + 2}" x2="${x}" y2="${y - 3}" stroke="#3a8024" stroke-width="0.8"/>
    <circle cx="${x}" cy="${y - 4}" r="2.2" fill="${c1}" stroke="${c2}" stroke-width="0.4"/>
    <circle cx="${x}" cy="${y - 4}" r="0.7" fill="#fde047"/>`;
};

// ============================================================
// BUILDINGS — detailed isometric SVG art
// ============================================================
// Each returns SVG fragment positioned at given grid coord.
// Anchor: bottom-center of building sits at iso(gx, gy).

function buildingTile(gx, gy, type, level, pos) {
    const { x, y } = iso(gx, gy);
    const fn = BUILDING_RENDERERS[type];
    if (!fn) return placeholderBuilding(x, y, type, level);
    // `pos` is the building's integer grid index. It must be passed explicitly
    // for 2x2 buildings (rendered at fractional coords like gx+0.5) — deriving it
    // from gx/gy there yields a fractional value that parseInt() mangles, which
    // used to make the Town Hall / Fortress / Barracks unclickable. Fall back to
    // the derived value only for plain 1x1 renders.
    if (pos == null) pos = gx + gy * ISO.GW;
    return `<g class="bld bld-${type}" data-pos="${pos}" style="cursor:pointer">
        ${fn(x, y, level)}
        <g class="bld-badge" transform="translate(${x + 10}, ${y - 4})">
            <rect x="0" y="0" width="22" height="13" rx="6" fill="#1a1a2e" stroke="#fbbf24" stroke-width="1"/>
            <text x="11" y="9.5" text-anchor="middle" font-size="9" font-weight="900" fill="#fbbf24" font-family="Inter, sans-serif">${level}</text>
        </g>
    </g>`;
}

function placeholderBuilding(x, y, type, lvl) {
    return `<g><rect x="${x - 20}" y="${y - 30}" width="40" height="30" fill="#6b4520" stroke="#3a2010"/></g>`;
}

// Reusable SVG fragments
const SHADOW = (x, y, w = 36) => `<ellipse cx="${x}" cy="${y + 3}" rx="${w}" ry="${w * 0.18}" fill="rgba(0,0,0,0.45)"/>`;
const FLAG = (x, y, color = '#dc2626') => `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 18}" stroke="#3a2010" stroke-width="1.2"/>
    <path class="flag-wave" d="M ${x} ${y - 18} Q ${x + 5} ${y - 16} ${x + 10} ${y - 18} Q ${x + 8} ${y - 14} ${x + 10} ${y - 12} Q ${x + 5} ${y - 14} ${x} ${y - 12} Z" fill="${color}" stroke="#3a0808" stroke-width="0.4"/>
`;
const SMOKE = (x, y) => `
    <circle class="smoke-puff" cx="${x}" cy="${y}" r="3" fill="rgba(200,200,200,0.7)"/>
    <circle class="smoke-puff" cx="${x + 2}" cy="${y - 6}" r="4" fill="rgba(180,180,180,0.5)" style="animation-delay:.5s"/>
    <circle class="smoke-puff" cx="${x - 1}" cy="${y - 12}" r="5" fill="rgba(160,160,160,0.35)" style="animation-delay:1s"/>
`;
const LIT_WINDOW = (x, y, w = 5, h = 7) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1a2840" stroke="#0a0418" stroke-width="0.4"/>
    <rect x="${x + 0.6}" y="${y + 0.6}" width="${w - 1.2}" height="${h - 1.2}" fill="#ffd773" opacity="0.85">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
    </rect>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#3a2010" stroke-width="0.3"/>
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#3a2010" stroke-width="0.3"/>
`;
const STONE_WALL = (cx, cy, w, h, color = '#a89e8e', dark = '#5e5448') => {
    const half = w / 2;
    return `
        <polygon points="${cx - half},${cy} ${cx},${cy - h * 0.5} ${cx + half},${cy} ${cx + half},${cy + h} ${cx},${cy + h + h * 0.5} ${cx - half},${cy + h}"
            fill="${color}" stroke="${dark}" stroke-width="0.6"/>
        <polygon points="${cx - half},${cy} ${cx},${cy - h * 0.5} ${cx + half},${cy}" fill="rgba(255,255,255,0.18)"/>
        <polygon points="${cx + half},${cy} ${cx + half},${cy + h} ${cx},${cy + h + h * 0.5}" fill="rgba(0,0,0,0.18)"/>
    `;
};

const BUILDING_RENDERERS = {
    townhall: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <!-- iso base block -->
        <polygon points="${x-40},${y-8} ${x},${y-28} ${x+40},${y-8} ${x+40},${y+2} ${x},${y+22} ${x-40},${y+2}" fill="#d8c89c" stroke="#5a4520" stroke-width="0.8"/>
        <polygon points="${x-40},${y-8} ${x},${y-28} ${x+40},${y-8}" fill="#ead9a8"/>
        <polygon points="${x-40},${y-8} ${x-40},${y+2} ${x},${y+22} ${x},${y-28}" fill="rgba(0,0,0,0.12)"/>
        <!-- column pillars (front face) -->
        ${[-26, -10, 6, 22].map(dx => `<rect x="${x + dx - 2}" y="${y - 22}" width="4" height="22" fill="#c0b08a" stroke="#5a4520" stroke-width="0.4"/>`).join('')}
        <!-- windows -->
        ${LIT_WINDOW(x - 22, y - 18, 6, 9)}
        ${LIT_WINDOW(x + 14, y - 18, 6, 9)}
        <!-- ornate door -->
        <path d="M ${x - 6} ${y - 4} L ${x - 6} ${y - 16} Q ${x} ${y - 22} ${x + 6} ${y - 16} L ${x + 6} ${y - 4} Z" fill="#5a3818" stroke="#2a1808" stroke-width="0.8"/>
        <circle cx="${x + 3}" cy="${y - 10}" r="1" fill="#fbbf24"/>
        <!-- gold roof (multi-tier) -->
        <polygon points="${x-44},${y-26} ${x+44},${y-26} ${x},${y-58}" fill="#f0c050" stroke="#7a5410" stroke-width="0.8"/>
        <polygon points="${x-44},${y-26} ${x},${y-58} ${x},${y-26}" fill="rgba(0,0,0,0.18)"/>
        <!-- roof shingles texture -->
        ${[-1, -10, -19, -28].map(yo => `<path d="M ${x - 36} ${y + yo - 26} L ${x + 36} ${y + yo - 26}" stroke="#a87820" stroke-width="0.4" opacity="0.6"/>`).join('')}
        <!-- spire + flag -->
        <polygon points="${x-3},${y-58} ${x+3},${y-58} ${x},${y-68}" fill="#fbbf24" stroke="#7a5410" stroke-width="0.5"/>
        <line x1="${x}" y1="${y - 68}" x2="${x}" y2="${y - 84}" stroke="#3a2010" stroke-width="1"/>
        <circle cx="${x}" cy="${y - 84}" r="1.5" fill="#fbbf24"/>
        ${FLAG(x, y - 78)}
        <!-- gold crest on facade -->
        <circle cx="${x}" cy="${y - 32}" r="5" fill="#f0c050" stroke="#7a5410" stroke-width="0.6"/>
        <path d="M ${x} ${y - 35} l 1.2 2.5 2.8 0.4 -2 2 0.5 2.8 -2.5 -1.3 -2.5 1.3 0.5 -2.8 -2 -2 2.8 -0.4 Z" fill="#7a5410"/>
        ${lvl >= 3 ? `<g>${FLAG(x - 36, y - 22, '#3b82f6')}${FLAG(x + 36, y - 22, '#3b82f6')}</g>` : ''}
        ${lvl >= 5 ? `<rect x="${x - 4}" y="${y - 12}" width="8" height="3" fill="#7a1818" stroke="#3a0808" stroke-width="0.3"/><polygon points="${x-4},${y-12} ${x+4},${y-12} ${x},${y-15}" fill="#dc2626"/>` : ''}
    `,

    goldmine: (x, y, lvl) => `
        ${SHADOW(x, y, 38)}
        <!-- mountain mass -->
        <polygon points="${x-36},${y+2} ${x-24},${y-30} ${x-8},${y-42} ${x+12},${y-44} ${x+28},${y-32} ${x+36},${y+2} ${x},${y+22}" fill="#8e8074" stroke="#3e3328" stroke-width="0.8"/>
        <polygon points="${x-36},${y+2} ${x-24},${y-30} ${x-8},${y-42} ${x-12},${y-20} ${x},${y+22}" fill="rgba(0,0,0,0.22)"/>
        <!-- snow cap -->
        <polygon points="${x-12},${y-40} ${x+14},${y-42} ${x+6},${y-32} ${x-4},${y-34}" fill="#f0f0f0" stroke="#aaa" stroke-width="0.3"/>
        <!-- cave entrance -->
        <path d="M ${x - 14} ${y + 2} L ${x - 14} ${y - 10} Q ${x} ${y - 22} ${x + 14} ${y - 10} L ${x + 14} ${y + 2} Z" fill="#0a0408" stroke="#1a1408" stroke-width="0.6"/>
        <path d="M ${x - 12} ${y + 1} L ${x - 12} ${y - 10} Q ${x} ${y - 20} ${x + 12} ${y - 10} L ${x + 12} ${y + 1}" fill="#1a0e08"/>
        <!-- wooden support beams -->
        <rect x="${x - 16}" y="${y - 12}" width="3" height="14" fill="#5a3818" stroke="#2a1808" stroke-width="0.3"/>
        <rect x="${x + 13}" y="${y - 12}" width="3" height="14" fill="#5a3818" stroke="#2a1808" stroke-width="0.3"/>
        <rect x="${x - 18}" y="${y - 14}" width="38" height="3" fill="#5a3818" stroke="#2a1808" stroke-width="0.3"/>
        <!-- rails -->
        <line x1="${x - 10}" y1="${y + 2}" x2="${x + 10}" y2="${y + 8}" stroke="#5a4838" stroke-width="1"/>
        <line x1="${x - 8}" y1="${y + 4}" x2="${x + 12}" y2="${y + 10}" stroke="#5a4838" stroke-width="1"/>
        ${[-6, -2, 2, 6].map(dx => `<line x1="${x + dx}" y1="${y + 2 + (dx + 6) * 0.3}" x2="${x + dx + 2}" y2="${y + 4 + (dx + 6) * 0.3}" stroke="#3a2818" stroke-width="0.5"/>`).join('')}
        <!-- mine cart with gold -->
        <rect x="${x + 4}" y="${y + 2}" width="16" height="8" fill="#5a3818" stroke="#2a1808" stroke-width="0.6"/>
        <rect x="${x + 5}" y="${y + 1}" width="14" height="3" fill="#f0c050" stroke="#a87820" stroke-width="0.4"/>
        <circle cx="${x + 6}" cy="${y + 1}" r="1" fill="#ffe080"/>
        <circle cx="${x + 10}" cy="${y}" r="1.2" fill="#ffe080"/>
        <circle cx="${x + 14}" cy="${y + 1}" r="1" fill="#ffe080"/>
        <circle cx="${x + 17}" cy="${y}" r="0.8" fill="#ffe080"/>
        <circle cx="${x + 6}" cy="${y + 11}" r="1.8" fill="#1a0808" stroke="#000" stroke-width="0.3"/>
        <circle cx="${x + 18}" cy="${y + 11}" r="1.8" fill="#1a0808" stroke="#000" stroke-width="0.3"/>
        <!-- gold piles outside -->
        <ellipse cx="${x - 22}" cy="${y + 4}" rx="6" ry="2" fill="#a87820"/>
        <ellipse cx="${x - 22}" cy="${y + 2}" rx="5" ry="2" fill="#f0c050" stroke="#a87820" stroke-width="0.4"/>
        <circle cx="${x - 24}" cy="${y}" r="1" fill="#ffe080"/>
        <circle cx="${x - 21}" cy="${y + 1}" r="1" fill="#ffe080"/>
        <!-- sparkles -->
        <g class="sparkle-fx">
            <polygon points="${x-8},${y-30} ${x-6},${y-25} ${x-8},${y-20} ${x-10},${y-25}" fill="#ffe080" opacity="0.9"/>
            <polygon points="${x+16},${y-32} ${x+18},${y-28} ${x+16},${y-24} ${x+14},${y-28}" fill="#ffe080" opacity="0.8" style="animation-delay:.4s"/>
        </g>
        ${lvl >= 3 ? `<polygon points="${x-30},${y-22} ${x-22},${y-30} ${x-16},${y-22}" fill="#9e918a" stroke="#3e3328" stroke-width="0.4"/>` : ''}
    `,

    ironmine: (x, y, lvl) => `
        ${SHADOW(x, y, 38)}
        <polygon points="${x-36},${y+2} ${x-24},${y-30} ${x-8},${y-44} ${x+12},${y-44} ${x+28},${y-32} ${x+36},${y+2} ${x},${y+22}" fill="#6a7080" stroke="#1a1e28" stroke-width="0.8"/>
        <polygon points="${x-36},${y+2} ${x-24},${y-30} ${x-8},${y-44} ${x-10},${y-20} ${x},${y+22}" fill="rgba(0,0,0,0.3)"/>
        <polygon points="${x-10},${y-40} ${x+14},${y-42} ${x+4},${y-32} ${x-2},${y-34}" fill="#dadce0"/>
        <path d="M ${x - 14} ${y + 2} L ${x - 14} ${y - 10} Q ${x} ${y - 22} ${x + 14} ${y - 10} L ${x + 14} ${y + 2} Z" fill="#0a0a14" stroke="#1a1e28" stroke-width="0.6"/>
        <rect x="${x - 16}" y="${y - 12}" width="3" height="14" fill="#5a3818" stroke="#2a1808" stroke-width="0.3"/>
        <rect x="${x + 13}" y="${y - 12}" width="3" height="14" fill="#5a3818" stroke="#2a1808" stroke-width="0.3"/>
        <rect x="${x - 18}" y="${y - 14}" width="38" height="3" fill="#5a3818" stroke="#2a1808" stroke-width="0.3"/>
        <!-- iron chunks -->
        <polygon points="${x-26},${y+2} ${x-20},${y-2} ${x-14},${y+4} ${x-22},${y+6}" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>
        <polygon points="${x-22},${y-2} ${x-18},${y-4} ${x-16},${y}" fill="#f1f5f9"/>
        <polygon points="${x+14},${y+4} ${x+20},${y+2} ${x+24},${y+6} ${x+18},${y+8}" fill="#cbd5e1" stroke="#475569" stroke-width="0.5"/>
        <polygon points="${x+16},${y+4} ${x+20},${y+3} ${x+22},${y+6}" fill="#f1f5f9"/>
        <!-- mine cart with iron -->
        <rect x="${x + 2}" y="${y + 2}" width="16" height="8" fill="#5a3818" stroke="#2a1808" stroke-width="0.6"/>
        <polygon points="${x + 3},${y + 1} ${x + 17},${y + 1} ${x + 16},${y + 3} ${x + 4},${y + 3}" fill="#94a3b8" stroke="#475569" stroke-width="0.4"/>
        <circle cx="${x + 4}" cy="${y + 11}" r="1.8" fill="#1a0808" stroke="#000" stroke-width="0.3"/>
        <circle cx="${x + 16}" cy="${y + 11}" r="1.8" fill="#1a0808" stroke="#000" stroke-width="0.3"/>
        <!-- pickaxe -->
        <line x1="${x - 30}" y1="${y - 8}" x2="${x - 22}" y2="${y - 22}" stroke="#5a3818" stroke-width="2"/>
        <polygon points="${x-24},${y-24} ${x-18},${y-22} ${x-22},${y-26}" fill="#94a3b8" stroke="#475569" stroke-width="0.5"/>
    `,

    lumbermill: (x, y, lvl) => `
        ${SHADOW(x, y, 42)}
        <!-- log piles foreground -->
        <g>
            <ellipse cx="${x - 32}" cy="${y + 6}" rx="8" ry="2.5" fill="#5a3818"/>
            <ellipse cx="${x - 32}" cy="${y + 3}" rx="7" ry="3" fill="#a87d4a" stroke="#5a3818" stroke-width="0.5"/>
            <circle cx="${x - 32}" cy="${y + 3}" r="2.5" fill="#7a5028"/>
            <circle cx="${x - 32}" cy="${y + 3}" r="1" fill="#5a3818"/>
        </g>
        <!-- iso building base -->
        <polygon points="${x-36},${y-6} ${x},${y-22} ${x+36},${y-6} ${x+36},${y+6} ${x},${y+22} ${x-36},${y+6}" fill="#a87d4a" stroke="#3a2010" stroke-width="0.8"/>
        <polygon points="${x-36},${y-6} ${x-36},${y+6} ${x},${y+22} ${x},${y-22}" fill="rgba(0,0,0,0.18)"/>
        <!-- wood plank lines -->
        ${[2, 8, 14].map(dy => `<line x1="${x - 36}" y1="${y - 6 + dy}" x2="${x + 36}" y2="${y - 6 + dy}" stroke="#5a3818" stroke-width="0.4"/>`).join('')}
        <!-- thatched roof -->
        <polygon points="${x-40},${y-6} ${x+40},${y-6} ${x},${y-46}" fill="#c89a40" stroke="#5a3010" stroke-width="0.8"/>
        <polygon points="${x-40},${y-6} ${x},${y-46} ${x},${y-6}" fill="rgba(0,0,0,0.22)"/>
        ${[-2, -10, -18, -26, -34].map(dy => `<line x1="${x - 38 + Math.abs(dy) * 0.4}" y1="${y + dy - 6}" x2="${x + 38 - Math.abs(dy) * 0.4}" y2="${y + dy - 6}" stroke="#8a6520" stroke-width="0.4"/>`).join('')}
        <!-- door -->
        <rect x="${x + 8}" y="${y - 6}" width="10" height="14" fill="#3a2010" stroke="#1a0808" stroke-width="0.5"/>
        <circle cx="${x + 16}" cy="${y + 1}" r="0.7" fill="#fbbf24"/>
        <!-- window -->
        ${LIT_WINDOW(x - 18, y - 12, 6, 7)}
        <!-- saw blade (animated) -->
        <g transform="translate(${x + 22}, ${y - 14})">
            <circle r="9" fill="#cbd5e1" stroke="#1a1408" stroke-width="0.8"/>
            <circle r="6" fill="#94a3b8" stroke="#475569" stroke-width="0.4"/>
            <g class="sawblade">
                ${Array.from({length: 8}, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    const x1 = Math.cos(a) * 9, y1 = Math.sin(a) * 9;
                    const x2 = Math.cos(a) * 11, y2 = Math.sin(a) * 11;
                    return `<polygon points="${x1 - 1},${y1} ${x2},${y2} ${x1 + 1},${y1}" fill="#1a1408"/>`;
                }).join('')}
            </g>
            <circle r="1.5" fill="#1a1408"/>
        </g>
        <!-- chimney + smoke -->
        <rect x="${x - 30}" y="${y - 36}" width="4" height="14" fill="#3a2010" stroke="#1a0808" stroke-width="0.3"/>
        ${SMOKE(x - 28, y - 38)}
        ${lvl >= 3 ? `<ellipse cx="${x + 32}" cy="${y + 6}" rx="6" ry="2" fill="#5a3818"/><rect x="${x + 26}" y="${y - 2}" width="12" height="4" fill="#a87d4a" stroke="#5a3818" stroke-width="0.4"/><rect x="${x + 26}" y="${y - 6}" width="12" height="4" fill="#a87d4a" stroke="#5a3818" stroke-width="0.4"/>` : ''}
    `,

    farm: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <!-- crop field (iso parallelogram) -->
        <polygon points="${x-44},${y+2} ${x-14},${y-12} ${x+30},${y-8} ${x},${y+18}" fill="#7a5028" stroke="#3a2010" stroke-width="0.6"/>
        <!-- wheat rows -->
        ${[-12, -8, -4, 0, 4, 8, 12].map(dy => {
            const sx = x - 44 + Math.abs(dy + 12) * 1.5;
            const ex = x + 30 - Math.abs(dy + 12) * 0.8;
            return `<line x1="${sx}" y1="${y + dy * 0.5}" x2="${ex}" y2="${y + dy * 0.5 - 4}" stroke="#e8c850" stroke-width="1.5"/>
                    <line x1="${sx}" y1="${y + dy * 0.5}" x2="${ex}" y2="${y + dy * 0.5 - 4}" stroke="#a88838" stroke-width="0.4"/>`;
        }).join('')}
        <!-- wheat tufts -->
        ${[[-30, -6], [-18, 4], [-4, -2], [8, 6], [18, -4]].map(([dx, dy]) => `
            <polygon points="${x+dx-1.5},${y+dy} ${x+dx+1.5},${y+dy} ${x+dx},${y+dy-3}" fill="#fde047" stroke="#a87820" stroke-width="0.3"/>
        `).join('')}
        <!-- barn (right side) -->
        <polygon points="${x+10},${y-6} ${x+38},${y-12} ${x+38},${y+2} ${x+10},${y+10}" fill="#a02818" stroke="#5a0808" stroke-width="0.8"/>
        <polygon points="${x+10},${y-6} ${x+10},${y+10} ${x+38},${y+2} ${x+38},${y-12}" fill="rgba(0,0,0,0.18)"/>
        <!-- barn roof -->
        <polygon points="${x+6},${y-8} ${x+42},${y-14} ${x+24},${y-32}" fill="#7a1808" stroke="#3a0808" stroke-width="0.8"/>
        <polygon points="${x+6},${y-8} ${x+24},${y-32} ${x+24},${y-12}" fill="rgba(0,0,0,0.18)"/>
        <!-- white trim -->
        <rect x="${x + 14}" y="${y - 16}" width="20" height="4" fill="#fff" stroke="#5a0808" stroke-width="0.4"/>
        <line x1="${x + 24}" y1="${y - 16}" x2="${x + 24}" y2="${y - 12}" stroke="#5a0808" stroke-width="0.3"/>
        <!-- big door -->
        <path d="M ${x + 18} ${y + 8} L ${x + 18} ${y - 8} L ${x + 30} ${y - 12} L ${x + 30} ${y + 4} Z" fill="#3a2010" stroke="#1a0808" stroke-width="0.5"/>
        <line x1="${x + 24}" y1="${y - 10}" x2="${x + 24}" y2="${y + 6}" stroke="#1a0808" stroke-width="0.4"/>
        <!-- star -->
        <polygon points="${x+24},${y-22} ${x+26},${y-18} ${x+30},${y-18} ${x+27},${y-15} ${x+28},${y-11} ${x+24},${y-13} ${x+20},${y-11} ${x+21},${y-15} ${x+18},${y-18} ${x+22},${y-18}" fill="#fff" stroke="#a02818" stroke-width="0.3"/>
        <!-- scarecrow -->
        ${lvl >= 2 ? `
            <line x1="${x - 26}" y1="${y + 2}" x2="${x - 26}" y2="${y - 10}" stroke="#5a3818" stroke-width="1"/>
            <line x1="${x - 30}" y1="${y - 6}" x2="${x - 22}" y2="${y - 6}" stroke="#5a3818" stroke-width="1"/>
            <circle cx="${x - 26}" cy="${y - 12}" r="2.5" fill="#e8a06a" stroke="#5a3818" stroke-width="0.4"/>
            <polygon points="${x-30},${y-13} ${x-22},${y-13} ${x-26},${y-17}" fill="#a87820" stroke="#5a3818" stroke-width="0.3"/>
        ` : ''}
        <!-- sheep -->
        ${lvl >= 4 ? `
            <ellipse cx="${x - 14}" cy="${y - 6}" rx="5" ry="3.5" fill="#fff" stroke="#5a5848" stroke-width="0.5"/>
            <circle cx="${x - 18}" cy="${y - 8}" r="2" fill="#fff" stroke="#5a5848" stroke-width="0.4"/>
            <circle cx="${x - 19}" cy="${y - 9}" r="0.4" fill="#000"/>
        ` : ''}
    `,

    coinmint: (x, y, lvl) => `
        ${SHADOW(x, y, 42)}
        <polygon points="${x-40},${y-8} ${x},${y-26} ${x+40},${y-8} ${x+40},${y+2} ${x},${y+22} ${x-40},${y+2}" fill="#f0ead8" stroke="#5a4818" stroke-width="0.8"/>
        <polygon points="${x-40},${y-8} ${x-40},${y+2} ${x},${y+22} ${x},${y-26}" fill="rgba(0,0,0,0.15)"/>
        ${[-30, -18, -6, 6, 18, 30].map(dx => `<rect x="${x + dx - 2}" y="${y - 20}" width="4" height="20" fill="#dad0a8" stroke="#5a4818" stroke-width="0.4"/>`).join('')}
        <!-- pediment -->
        <polygon points="${x-44},${y-26} ${x+44},${y-26} ${x},${y-52}" fill="#e8b94a" stroke="#5a3a08" stroke-width="0.8"/>
        <polygon points="${x-44},${y-26} ${x},${y-52} ${x},${y-26}" fill="rgba(0,0,0,0.18)"/>
        <!-- giant coin -->
        <circle cx="${x}" cy="${y - 36}" r="9" fill="#f0c050" stroke="#7a5410" stroke-width="1"/>
        <circle cx="${x}" cy="${y - 36}" r="7" fill="none" stroke="#7a5410" stroke-width="0.4"/>
        <text x="${x}" y="${y - 32}" text-anchor="middle" font-size="11" font-weight="900" fill="#7a5410" font-family="Inter">$</text>
        <circle cx="${x - 2}" cy="${y - 39}" r="2" fill="rgba(255,255,255,0.5)"/>
        <!-- door -->
        <path d="M ${x - 6} ${y - 4} L ${x - 6} ${y - 14} Q ${x} ${y - 18} ${x + 6} ${y - 14} L ${x + 6} ${y - 4} Z" fill="#3a2010" stroke="#1a0808" stroke-width="0.5"/>
        <!-- coin piles -->
        <ellipse cx="${x - 26}" cy="${y + 4}" rx="5" ry="1.5" fill="#a87820"/>
        <circle cx="${x - 28}" cy="${y + 2}" r="2" fill="#f0c050" stroke="#a87820"/>
        <circle cx="${x - 24}" cy="${y + 1}" r="2" fill="#f0c050" stroke="#a87820"/>
        <circle cx="${x - 26}" cy="${y - 1}" r="2" fill="#f0c050" stroke="#a87820"/>
        <!-- sparkles -->
        <g class="sparkle-fx">
            <polygon points="${x-14},${y-30} ${x-12},${y-26} ${x-14},${y-22} ${x-16},${y-26}" fill="#fff" opacity="0.9"/>
            <polygon points="${x+14},${y-30} ${x+16},${y-26} ${x+14},${y-22} ${x+12},${y-26}" fill="#fff" opacity="0.9" style="animation-delay:.5s"/>
        </g>
    `,

    storage: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <polygon points="${x-40},${y-4} ${x},${y-22} ${x+40},${y-4} ${x+40},${y+4} ${x},${y+22} ${x-40},${y+4}" fill="#a87d4a" stroke="#3a2010" stroke-width="0.8"/>
        <polygon points="${x-40},${y-4} ${x-40},${y+4} ${x},${y+22} ${x},${y-22}" fill="rgba(0,0,0,0.18)"/>
        <!-- horizontal bands -->
        ${[8, 14].map(dy => `<line x1="${x - 40}" y1="${y - 4 + dy}" x2="${x + 40}" y2="${y - 4 + dy}" stroke="#3a2010" stroke-width="0.5"/>`).join('')}
        <!-- X braces -->
        <line x1="${x - 36}" y1="${y - 2}" x2="${x - 4}" y2="${y + 18}" stroke="#3a2010" stroke-width="0.6"/>
        <line x1="${x - 36}" y1="${y + 4}" x2="${x - 4}" y2="${y - 12}" stroke="#3a2010" stroke-width="0.6"/>
        <line x1="${x + 36}" y1="${y - 2}" x2="${x + 4}" y2="${y + 18}" stroke="#3a2010" stroke-width="0.6"/>
        <line x1="${x + 36}" y1="${y + 4}" x2="${x + 4}" y2="${y - 12}" stroke="#3a2010" stroke-width="0.6"/>
        <!-- roof -->
        <polygon points="${x-44},${y-6} ${x+44},${y-6} ${x},${y-44}" fill="#5a3818" stroke="#1a0808" stroke-width="0.8"/>
        <polygon points="${x-44},${y-6} ${x},${y-44} ${x},${y-6}" fill="rgba(0,0,0,0.22)"/>
        <!-- big doors -->
        <path d="M ${x - 12} ${y + 16} L ${x - 12} ${y - 8} L ${x + 12} ${y - 14} L ${x + 12} ${y + 10} Z" fill="#2a1808" stroke="#0a0408" stroke-width="0.5"/>
        <line x1="${x}" y1="${y + 13}" x2="${x}" y2="${y - 11}" stroke="#0a0408" stroke-width="0.5"/>
        <rect x="${x - 4}" y="${y - 1}" width="2.5" height="2.5" fill="#fbbf24"/>
        <rect x="${x + 2}" y="${y - 2}" width="2.5" height="2.5" fill="#fbbf24"/>
        <!-- crates -->
        <rect x="${x - 32}" y="${y + 4}" width="10" height="9" fill="#a87d4a" stroke="#5a3818" stroke-width="0.5"/>
        <line x1="${x - 32}" y1="${y + 8.5}" x2="${x - 22}" y2="${y + 8.5}" stroke="#5a3818" stroke-width="0.4"/>
        <line x1="${x - 27}" y1="${y + 4}" x2="${x - 27}" y2="${y + 13}" stroke="#5a3818" stroke-width="0.4"/>
    `,

    researchlab: (x, y, lvl) => `
        ${SHADOW(x, y, 40)}
        <!-- iso body -->
        <polygon points="${x-38},${y-8} ${x},${y-26} ${x+38},${y-8} ${x+38},${y+2} ${x},${y+22} ${x-38},${y+2}" fill="#2a4a72" stroke="#0e1e33" stroke-width="0.8"/>
        <polygon points="${x-38},${y-8} ${x-38},${y+2} ${x},${y+22} ${x},${y-26}" fill="rgba(0,0,0,0.25)"/>
        <!-- glowing rune windows -->
        ${[-24, -8, 8, 24].map(dx => `<rect x="${x + dx - 2.5}" y="${y - 18}" width="5" height="12" rx="1.5" fill="#0e1e33" stroke="#0a1420" stroke-width="0.4"/><rect x="${x + dx - 1.5}" y="${y - 17}" width="3" height="10" rx="1" fill="#7fd8ff"><animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite"/></rect>`).join('')}
        <!-- door -->
        <path d="M ${x - 6} ${y - 2} L ${x - 6} ${y - 12} Q ${x} ${y - 16} ${x + 6} ${y - 12} L ${x + 6} ${y - 2} Z" fill="#0e1e33" stroke="#0a1420" stroke-width="0.5"/>
        <!-- observatory drum -->
        <rect x="${x - 16}" y="${y - 40}" width="32" height="16" rx="2" fill="#1e3a5a" stroke="#0e1e33" stroke-width="0.8"/>
        <rect x="${x - 16}" y="${y - 40}" width="10" height="16" rx="2" fill="rgba(0,0,0,0.22)"/>
        <!-- dome -->
        <path d="M ${x - 18} ${y - 40} A 18 16 0 0 1 ${x + 18} ${y - 40} Z" fill="#5fb0f0" stroke="#0e1e33" stroke-width="0.9"/>
        <path d="M ${x - 18} ${y - 40} A 18 16 0 0 1 ${x} ${y - 56} L ${x} ${y - 40} Z" fill="rgba(255,255,255,0.25)"/>
        <ellipse cx="${x - 6}" cy="${y - 50}" rx="4" ry="3" fill="rgba(255,255,255,0.5)"/>
        <!-- dome slit + finial -->
        <line x1="${x}" y1="${y - 40}" x2="${x}" y2="${y - 55}" stroke="#0e1e33" stroke-width="1.2"/>
        <line x1="${x}" y1="${y - 56}" x2="${x}" y2="${y - 64}" stroke="#7a5410" stroke-width="1"/>
        <circle cx="${x}" cy="${y - 65}" r="2.5" fill="#fbbf24" stroke="#7a5410" stroke-width="0.6"/>
        <!-- arcane sparkles -->
        <g class="sparkle-fx">
            <circle cx="${x + 14}" cy="${y - 48}" r="1.8" fill="#7fd8ff"/>
            <polygon points="${x-16},${y-30} ${x-14},${y-26} ${x-16},${y-22} ${x-18},${y-26}" fill="#bfeaff" opacity="0.9" style="animation-delay:.6s"/>
        </g>
    `,

    barracks: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <!-- left tower -->
        <polygon points="${x-36},${y-10} ${x-22},${y-14} ${x-22},${y+4} ${x-36},${y+8}" fill="#9c948a" stroke="#1a1408" stroke-width="0.8"/>
        <polygon points="${x-36},${y-10} ${x-36},${y+8} ${x-22},${y+4} ${x-22},${y-14}" fill="rgba(0,0,0,0.18)"/>
        <polygon points="${x-38},${y-10} ${x-20},${y-14} ${x-29},${y-34}" fill="#a02818" stroke="#5a0808" stroke-width="0.6"/>
        <!-- right tower -->
        <polygon points="${x+22},${y-14} ${x+36},${y-10} ${x+36},${y+8} ${x+22},${y+4}" fill="#9c948a" stroke="#1a1408" stroke-width="0.8"/>
        <polygon points="${x+22},${y-14} ${x+22},${y+4} ${x+36},${y+8} ${x+36},${y-10}" fill="rgba(0,0,0,0.05)"/>
        <polygon points="${x+20},${y-14} ${x+38},${y-10} ${x+29},${y-34}" fill="#a02818" stroke="#5a0808" stroke-width="0.6"/>
        <!-- main wall -->
        <polygon points="${x-22},${y-6} ${x},${y-14} ${x+22},${y-6} ${x+22},${y+4} ${x},${y+18} ${x-22},${y+4}" fill="#a89e8e" stroke="#1a1408" stroke-width="0.8"/>
        <polygon points="${x-22},${y-6} ${x-22},${y+4} ${x},${y+18} ${x},${y-14}" fill="rgba(0,0,0,0.15)"/>
        <!-- stone brick pattern -->
        ${[0, 4, 8].map(dy => `<line x1="${x - 22}" y1="${y - 6 + dy}" x2="${x + 22}" y2="${y - 6 + dy}" stroke="#5a5448" stroke-width="0.3" opacity="0.6"/>`).join('')}
        <!-- arched gate -->
        <path d="M ${x - 8} ${y + 8} L ${x - 8} ${y - 4} Q ${x} ${y - 12} ${x + 8} ${y - 4} L ${x + 8} ${y + 6} Z" fill="#3a2010" stroke="#1a0808" stroke-width="0.6"/>
        <path d="M ${x - 6} ${y + 5} L ${x - 6} ${y - 3} Q ${x} ${y - 10} ${x + 6} ${y - 3} L ${x + 6} ${y + 4}" fill="#5a3018"/>
        <!-- shield emblem -->
        <path d="M ${x} ${y - 4} Q ${x - 4} ${y - 4} ${x - 4} ${y} Q ${x - 4} ${y + 4} ${x} ${y + 6} Q ${x + 4} ${y + 4} ${x + 4} ${y} Q ${x + 4} ${y - 4} ${x} ${y - 4}" fill="#3b82f6" stroke="#1e3a8a" stroke-width="0.4"/>
        <polygon points="${x},${y-2} ${x+1},${y+1} ${x+3},${y+1} ${x+1.5},${y+3} ${x+2},${y+5} ${x},${y+4} ${x-2},${y+5} ${x-1.5},${y+3} ${x-3},${y+1} ${x-1},${y+1}" fill="#fbbf24"/>
        <!-- crossed swords -->
        <line x1="${x - 12}" y1="${y - 16}" x2="${x + 12}" y2="${y - 4}" stroke="#cbd5e1" stroke-width="2"/>
        <line x1="${x + 12}" y1="${y - 16}" x2="${x - 12}" y2="${y - 4}" stroke="#cbd5e1" stroke-width="2"/>
        <line x1="${x - 12}" y1="${y - 16}" x2="${x + 12}" y2="${y - 4}" stroke="#475569" stroke-width="0.3"/>
        <line x1="${x + 12}" y1="${y - 16}" x2="${x - 12}" y2="${y - 4}" stroke="#475569" stroke-width="0.3"/>
        ${FLAG(x - 29, y - 28, '#dc2626')}
        ${FLAG(x + 29, y - 28, '#dc2626')}
    `,

    stable: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <polygon points="${x-40},${y-6} ${x},${y-22} ${x+40},${y-6} ${x+40},${y+6} ${x},${y+22} ${x-40},${y+6}" fill="#a87d4a" stroke="#3a2010" stroke-width="0.8"/>
        <polygon points="${x-40},${y-6} ${x-40},${y+6} ${x},${y+22} ${x},${y-22}" fill="rgba(0,0,0,0.18)"/>
        <polygon points="${x-44},${y-6} ${x+44},${y-6} ${x},${y-46}" fill="#c89a40" stroke="#5a3010" stroke-width="0.8"/>
        <polygon points="${x-44},${y-6} ${x},${y-46} ${x},${y-6}" fill="rgba(0,0,0,0.22)"/>
        ${[-2, -10, -18, -26].map(dy => `<line x1="${x - 38 + Math.abs(dy) * 0.4}" y1="${y + dy - 6}" x2="${x + 38 - Math.abs(dy) * 0.4}" y2="${y + dy - 6}" stroke="#8a6520" stroke-width="0.4"/>`).join('')}
        <!-- 3 stall doors -->
        ${[-22, 0, 22].map((dx, i) => `
            <path d="M ${x + dx - 5} ${y + 14 + Math.abs(dx) * 0.1} L ${x + dx - 5} ${y - 4} L ${x + dx + 5} ${y - 6 - Math.abs(dx) * 0.05} L ${x + dx + 5} ${y + 12 + Math.abs(dx) * 0.1} Z" fill="#3a2010" stroke="#1a0808" stroke-width="0.5"/>
            <line x1="${x + dx}" y1="${y + 13}" x2="${x + dx}" y2="${y - 5}" stroke="#1a0808" stroke-width="0.4"/>
            ${i === 1 ? `<circle cx="${x + dx}" cy="${y + 2}" r="3" fill="#5a3818"/><ellipse cx="${x + dx}" cy="${y + 6}" rx="2" ry="3" fill="#5a3818"/>` : ''}
        `).join('')}
        <!-- hay bale -->
        <ellipse cx="${x - 34}" cy="${y + 12}" rx="6" ry="2" fill="#a88838"/>
        <ellipse cx="${x - 34}" cy="${y + 9}" rx="6" ry="3" fill="#e8c850" stroke="#a88838" stroke-width="0.4"/>
    `,

    fortress: (x, y, lvl) => `
        ${SHADOW(x, y, 48)}
        <!-- outer walls -->
        <polygon points="${x-44},${y-6} ${x},${y-26} ${x+44},${y-6} ${x+44},${y+8} ${x},${y+24} ${x-44},${y+8}" fill="#5e5448" stroke="#0a0408" stroke-width="0.8"/>
        <polygon points="${x-44},${y-6} ${x-44},${y+8} ${x},${y+24} ${x},${y-26}" fill="rgba(0,0,0,0.25)"/>
        <!-- left tower -->
        <polygon points="${x-44},${y-26} ${x-30},${y-30} ${x-30},${y-6} ${x-44},${y-2}" fill="#4e4438" stroke="#0a0408" stroke-width="0.7"/>
        <polygon points="${x-46},${y-26} ${x-28},${y-30} ${x-37},${y-50}" fill="#7e1818" stroke="#3a0808" stroke-width="0.6"/>
        <!-- right tower -->
        <polygon points="${x+30},${y-30} ${x+44},${y-26} ${x+44},${y-2} ${x+30},${y-6}" fill="#5e5448" stroke="#0a0408" stroke-width="0.7"/>
        <polygon points="${x+28},${y-30} ${x+46},${y-26} ${x+37},${y-50}" fill="#7e1818" stroke="#3a0808" stroke-width="0.6"/>
        <!-- central keep -->
        <polygon points="${x-12},${y-32} ${x+12},${y-32} ${x+12},${y-6} ${x-12},${y-6}" fill="#a89e8e" stroke="#0a0408" stroke-width="0.8"/>
        <polygon points="${x-14},${y-32} ${x+14},${y-32} ${x},${y-58}" fill="#7e1818" stroke="#3a0808" stroke-width="0.7"/>
        <!-- crenellations -->
        ${[-12, -6, 0, 6].map(dx => `<rect x="${x + dx - 1}" y="${y - 36}" width="2" height="4" fill="#a89e8e" stroke="#0a0408" stroke-width="0.3"/>`).join('')}
        <!-- windows -->
        ${LIT_WINDOW(x - 8, y - 22, 4, 6)}
        ${LIT_WINDOW(x + 4, y - 22, 4, 6)}
        ${LIT_WINDOW(x - 40, y - 18, 3, 5)}
        ${LIT_WINDOW(x + 37, y - 18, 3, 5)}
        <!-- gate -->
        <path d="M ${x - 8} ${y + 14} L ${x - 8} ${y - 2} Q ${x} ${y - 10} ${x + 8} ${y - 2} L ${x + 8} ${y + 10} Z" fill="#1a0808" stroke="#000" stroke-width="0.6"/>
        <line x1="${x}" y1="${y + 12}" x2="${x}" y2="${y - 8}" stroke="#0a0408" stroke-width="0.5"/>
        <!-- royal banner -->
        ${FLAG(x, y - 70, '#7c3aed')}
        ${FLAG(x - 37, y - 50, '#7c3aed')}
        ${FLAG(x + 37, y - 50, '#7c3aed')}
        <!-- emblem -->
        <circle cx="${x}" cy="${y - 22}" r="4" fill="#7c3aed" stroke="#4c1d95" stroke-width="0.5"/>
        <polygon points="${x},${y-25} ${x+1},${y-22} ${x+3},${y-22} ${x+1.5},${y-20} ${x+2},${y-18} ${x},${y-19} ${x-2},${y-18} ${x-1.5},${y-20} ${x-3},${y-22} ${x-1},${y-22}" fill="#fbbf24"/>
    `,

    wall: (x, y, lvl) => `
        ${SHADOW(x, y, 40)}
        <polygon points="${x-38},${y-4} ${x},${y-18} ${x+38},${y-4} ${x+38},${y+8} ${x},${y+22} ${x-38},${y+8}" fill="#9c948a" stroke="#1a1408" stroke-width="0.8"/>
        <polygon points="${x-38},${y-4} ${x-38},${y+8} ${x},${y+22} ${x},${y-18}" fill="rgba(0,0,0,0.2)"/>
        <!-- crenellations along top edges -->
        ${[-30, -22, -14, -6, 2, 10, 18, 26].map(dx => `
            <rect x="${x + dx - 2}" y="${y - 14 + Math.abs(dx) * 0.15}" width="4" height="6" fill="#a89e8e" stroke="#1a1408" stroke-width="0.4"/>
        `).join('')}
        ${[4, 10].map(dy => `<line x1="${x - 38}" y1="${y - 4 + dy}" x2="${x + 38}" y2="${y - 4 + dy}" stroke="#5a5448" stroke-width="0.4"/>`).join('')}
        ${lvl >= 5 ? `<path d="M ${x - 30} ${y + 10} Q ${x - 32} ${y - 4} ${x - 26} ${y - 8}" stroke="#22c55e" stroke-width="1.2" fill="none"/><circle cx="${x - 28}" cy="${y - 2}" r="1.5" fill="#16a34a"/>` : ''}
    `,

    archertower: (x, y, lvl) => `
        ${SHADOW(x, y, 28)}
        <!-- iso base -->
        <polygon points="${x-22},${y+2} ${x},${y-8} ${x+22},${y+2} ${x+22},${y+10} ${x},${y+20} ${x-22},${y+10}" fill="#7a7268" stroke="#1a1408" stroke-width="0.6"/>
        <!-- tower shaft -->
        <polygon points="${x-14},${y-30} ${x+14},${y-30} ${x+14},${y+2} ${x-14},${y+2}" fill="#9c948a" stroke="#1a1408" stroke-width="0.7"/>
        <polygon points="${x-14},${y-30} ${x-14},${y+2} ${x-10},${y+2} ${x-10},${y-30}" fill="rgba(0,0,0,0.15)"/>
        <!-- battlements -->
        ${[-14, -8, -2, 4, 10].map(dx => `<rect x="${x + dx - 1.5}" y="${y - 36}" width="3" height="6" fill="#a89e8e" stroke="#1a1408" stroke-width="0.3"/>`).join('')}
        <!-- pointed roof -->
        <polygon points="${x-16},${y-36} ${x+16},${y-36} ${x},${y-58}" fill="#a02818" stroke="#5a0808" stroke-width="0.8"/>
        <polygon points="${x-16},${y-36} ${x},${y-58} ${x},${y-36}" fill="rgba(0,0,0,0.22)"/>
        ${FLAG(x, y - 56)}
        <!-- arrow slits -->
        ${LIT_WINDOW(x - 8, y - 24, 3, 8)}
        ${LIT_WINDOW(x + 5, y - 24, 3, 8)}
        ${LIT_WINDOW(x - 3, y - 12, 6, 8)}
        <!-- archer silhouette behind battlement -->
        <circle cx="${x}" cy="${y - 33}" r="2" fill="#3a2010"/>
        <rect x="${x - 1.5}" y="${y - 31}" width="3" height="4" fill="#5a3818"/>
        <path d="M ${x - 5} ${y - 32} Q ${x} ${y - 36} ${x + 5} ${y - 32}" stroke="#5a3818" stroke-width="1" fill="none"/>
    `,

    cannon: (x, y, lvl) => `
        ${SHADOW(x, y, 42)}
        <!-- iso platform -->
        <polygon points="${x-38},${y+4} ${x},${y-12} ${x+38},${y+4} ${x+38},${y+12} ${x},${y+24} ${x-38},${y+12}" fill="#5e5448" stroke="#0a0408" stroke-width="0.8"/>
        <polygon points="${x-38},${y+4} ${x-38},${y+12} ${x},${y+24} ${x},${y-12}" fill="rgba(0,0,0,0.25)"/>
        <!-- crenellations -->
        ${[-30, -20, -10, 0, 10, 20].map(dx => `<polygon points="${x + dx - 2.5},${y - 8 + Math.abs(dx) * 0.05} ${x + dx + 2.5},${y - 8 + Math.abs(dx) * 0.05} ${x + dx + 2.5},${y - 14 + Math.abs(dx) * 0.05} ${x + dx - 2.5},${y - 14 + Math.abs(dx) * 0.05}" fill="#5e5448" stroke="#1a1408" stroke-width="0.4"/>`).join('')}
        <!-- cannon mount + wheels -->
        <rect x="${x - 14}" y="${y - 8}" width="28" height="8" fill="#5a3818" stroke="#1a0808" stroke-width="0.6"/>
        <circle cx="${x - 14}" cy="${y - 2}" r="5" fill="#3a2010" stroke="#1a0808" stroke-width="0.5"/>
        <circle cx="${x - 14}" cy="${y - 2}" r="3" fill="#5a3018"/>
        <line x1="${x - 14}" y1="${y - 7}" x2="${x - 14}" y2="${y + 3}" stroke="#1a0808" stroke-width="0.4"/>
        <line x1="${x - 19}" y1="${y - 2}" x2="${x - 9}" y2="${y - 2}" stroke="#1a0808" stroke-width="0.4"/>
        <circle cx="${x + 14}" cy="${y - 2}" r="5" fill="#3a2010" stroke="#1a0808" stroke-width="0.5"/>
        <circle cx="${x + 14}" cy="${y - 2}" r="3" fill="#5a3018"/>
        <!-- barrel -->
        <ellipse cx="${x}" cy="${y - 16}" rx="18" ry="6" fill="#2a2418" stroke="#000" stroke-width="0.8"/>
        <ellipse cx="${x}" cy="${y - 17}" rx="18" ry="5" fill="#3a3328"/>
        <ellipse cx="${x}" cy="${y - 18}" rx="16" ry="3" fill="rgba(255,255,255,0.12)"/>
        <ellipse cx="${x + 18}" cy="${y - 16}" rx="2.5" ry="4" fill="#000"/>
        <!-- bands -->
        <ellipse cx="${x - 8}" cy="${y - 16}" rx="2" ry="5.5" fill="#94a3b8" stroke="#475569" stroke-width="0.3"/>
        <ellipse cx="${x + 6}" cy="${y - 16}" rx="2" ry="5" fill="#94a3b8" stroke="#475569" stroke-width="0.3"/>
        ${lvl >= 4 ? `<ellipse cx="${x + 18}" cy="${y - 16}" rx="2" ry="3" fill="#ff6b00" opacity="0.8"><animate attributeName="opacity" values="0.5;1;0.5" dur="0.6s" repeatCount="indefinite"/></ellipse>` : ''}
        <!-- cannonball pile -->
        ${lvl >= 2 ? `
            <ellipse cx="${x + 28}" cy="${y + 14}" rx="5" ry="1.5" fill="rgba(0,0,0,0.4)"/>
            <circle cx="${x + 26}" cy="${y + 11}" r="2.5" fill="#1a1408"/>
            <circle cx="${x + 30}" cy="${y + 11}" r="2.5" fill="#1a1408"/>
            <circle cx="${x + 28}" cy="${y + 8}" r="2.5" fill="#1a1408"/>
        ` : ''}
    `
};

// ============================================================
// VILLAGERS & AMBIENT NPCS
// ============================================================

const VILLAGER_VARIANTS = [
    { body: '#3b82f6', bodyDark: '#1e3a8a', hat: '#a87820', skin: '#f5d6a8' },        // blue worker
    { body: '#dc2626', bodyDark: '#7f1d1d', hat: '#3a2010', skin: '#f5d6a8' },        // red farmer
    { body: '#15803d', bodyDark: '#14532d', hat: '#22c55e', skin: '#f5d6a8' },        // green woodsman
    { body: '#a16207', bodyDark: '#713f12', hat: '#fbbf24', skin: '#f5d6a8' },        // brown trader
    { body: '#7c3aed', bodyDark: '#4c1d95', hat: '#a78bfa', skin: '#f5d6a8' },        // purple mage
    { body: '#0891b2', bodyDark: '#155e75', hat: '#22d3ee', skin: '#f5d6a8' }         // teal scholar
];

function villagerSVG(id, variant) {
    const v = VILLAGER_VARIANTS[variant % VILLAGER_VARIANTS.length];
    return `<g class="villager villager-${id}">
        <ellipse cx="0" cy="3" rx="4" ry="1.2" fill="rgba(0,0,0,0.45)"/>
        <rect x="-3" y="-5" width="6" height="8" fill="${v.body}" stroke="${v.bodyDark}" stroke-width="0.4"/>
        <rect x="-3" y="-5" width="6" height="2" fill="${v.bodyDark}"/>
        <circle cx="0" cy="-8" r="2.6" fill="${v.skin}" stroke="#5a3818" stroke-width="0.3"/>
        <circle cx="-0.7" cy="-8" r="0.3" fill="#000"/>
        <circle cx="0.7" cy="-8" r="0.3" fill="#000"/>
        <rect x="-2.5" y="-12" width="5" height="2.5" fill="${v.hat}" stroke="#3a2010" stroke-width="0.3"/>
        <rect x="-3" y="-10" width="6" height="0.8" fill="#3a2010"/>
        <rect x="-2.5" y="-1" width="1.5" height="4" fill="${v.bodyDark}"/>
        <rect x="1" y="-1" width="1.5" height="4" fill="${v.bodyDark}"/>
    </g>`;
}

function boatSVG() {
    return `<g class="ambient-boat">
        <ellipse cx="0" cy="3" rx="18" ry="2" fill="rgba(0,0,0,0.4)"/>
        <!-- hull -->
        <path d="M -16 0 L 16 0 L 12 5 L -12 5 Z" fill="#5a3818" stroke="#2a1808" stroke-width="0.6"/>
        <path d="M -16 0 L 16 0 L 14 -1 L -14 -1 Z" fill="#7a5028"/>
        <!-- mast -->
        <line x1="0" y1="0" x2="0" y2="-20" stroke="#3a2010" stroke-width="1"/>
        <!-- sail -->
        <path d="M 0 -20 L 0 -2 L 10 -10 Z" fill="#fde047" stroke="#a87820" stroke-width="0.5"/>
        <path d="M 0 -20 L 0 -2 L 10 -10 Z" fill="url(#sailShade)"/>
        <!-- flag -->
        <line x1="0" y1="-20" x2="0" y2="-24" stroke="#3a2010" stroke-width="0.4"/>
        <polygon points="0,-24 5,-22 0,-20" fill="#dc2626"/>
    </g>`;
}

function birdSVG(id) {
    return `<g class="ambient-bird bird-${id}">
        <path d="M -6 0 Q -3 -3 0 0 Q 3 -3 6 0" stroke="#1a1408" stroke-width="1.2" fill="none" stroke-linecap="round">
            <animate attributeName="d" values="M -6 0 Q -3 -3 0 0 Q 3 -3 6 0; M -6 -2 Q -3 1 0 -2 Q 3 1 6 -2; M -6 0 Q -3 -3 0 0 Q 3 -3 6 0" dur="0.4s" repeatCount="indefinite"/>
        </path>
    </g>`;
}

function cartSVG() {
    return `<g class="ambient-cart">
        <ellipse cx="0" cy="6" rx="14" ry="2" fill="rgba(0,0,0,0.4)"/>
        <!-- horse -->
        <ellipse cx="-14" cy="0" rx="6" ry="4" fill="#7a5028" stroke="#3a2010" stroke-width="0.5"/>
        <ellipse cx="-19" cy="-3" rx="3" ry="2.5" fill="#7a5028" stroke="#3a2010" stroke-width="0.5"/>
        <rect x="-21" y="-5" width="1.5" height="2" fill="#7a5028"/>
        <rect x="-15" y="3" width="1.2" height="4" fill="#3a2010"/>
        <rect x="-12" y="3" width="1.2" height="4" fill="#3a2010"/>
        <!-- cart body -->
        <rect x="-6" y="-3" width="14" height="7" fill="#a87d4a" stroke="#5a3818" stroke-width="0.5"/>
        <rect x="-6" y="-3" width="14" height="1.5" fill="#5a3818"/>
        <!-- cargo (barrels) -->
        <ellipse cx="-2" cy="-4" rx="2" ry="3" fill="#7a4818" stroke="#3a2010" stroke-width="0.3"/>
        <ellipse cx="3" cy="-4" rx="2" ry="3" fill="#7a4818" stroke="#3a2010" stroke-width="0.3"/>
        <line x1="-2" y1="-6" x2="-2" y2="-2" stroke="#3a2010" stroke-width="0.3"/>
        <line x1="3" y1="-6" x2="3" y2="-2" stroke="#3a2010" stroke-width="0.3"/>
        <!-- wheels -->
        <circle cx="-3" cy="5" r="3" fill="#3a2010" stroke="#000" stroke-width="0.5"/>
        <circle cx="-3" cy="5" r="1" fill="#5a3818"/>
        <circle cx="6" cy="5" r="3" fill="#3a2010" stroke="#000" stroke-width="0.5"/>
        <circle cx="6" cy="5" r="1" fill="#5a3818"/>
        <!-- driver -->
        <circle cx="0" cy="-7" r="1.5" fill="#f5d6a8"/>
        <rect x="-1" y="-9" width="2" height="1.5" fill="#a87820"/>
    </g>`;
}

function cowSVG() {
    return `<g class="ambient-cow">
        <ellipse cx="0" cy="4" rx="8" ry="1.5" fill="rgba(0,0,0,0.4)"/>
        <ellipse cx="0" cy="0" rx="7" ry="4" fill="#fff" stroke="#3a2818" stroke-width="0.5"/>
        <ellipse cx="-2" cy="-1" rx="3" ry="2" fill="#1a1408"/>
        <ellipse cx="3" cy="0" rx="2" ry="1.5" fill="#1a1408"/>
        <ellipse cx="-6" cy="-2" rx="2.5" ry="2" fill="#fff" stroke="#3a2818" stroke-width="0.5"/>
        <circle cx="-7" cy="-2.5" r="0.3" fill="#000"/>
        <rect x="-3" y="4" width="1" height="3" fill="#3a2818"/>
        <rect x="3" y="4" width="1" height="3" fill="#3a2818"/>
    </g>`;
}

// ============================================================
// MAIN RENDER
// ============================================================

function renderIsoWorld() {
    if (!TERRAIN) TERRAIN = genTerrain();
    if (!DECORATIONS) DECORATIONS = genDecorations();
    const { w, h } = isoSetup();

    // Sort entities by depth
    const entities = [];
    const _ownedForDeco = (typeof getOwnedTiles === 'function') ? getOwnedTiles() : null;
    DECORATIONS.forEach(d => {
        // only show decorations on land you actually own (not floating on water)
        if (_ownedForDeco && !_ownedForDeco.has(d.gx + d.gy * ISO.GW)) return;
        entities.push({ ...d, depth: d.gx + d.gy, kind: 'deco' });
    });
    state.buildings.forEach(b => {
        const gx = b.pos % ISO.GW;
        const gy = Math.floor(b.pos / ISO.GW);
        entities.push({ gx, gy, type: b.type, level: b.level, depth: gx + gy + 0.5, kind: 'bld', pos: b.pos });
    });
    entities.sort((a, b) => a.depth - b.depth);

    // ===== 3D EXTRUDED ISLAND =====
    // Only your land (owned + claimable) exists as a raised landmass on the water.
    // Far wild land is simply ocean — no ugly fog.
    let tilesSVG = '';
    const ownedTiles = (typeof getOwnedTiles === 'function') ? getOwnedTiles() : null;
    const buyable = (typeof buyableTiles === 'function') ? buyableTiles() : new Set();
    const landPx = (typeof landPrice === 'function') ? landPrice() : { coins: 0 };
    let buyMarkers = '';

    const TW = ISO.TW, TH = ISO.TH, DEPTH = 17;
    const PAL = {
        0: { top: '#6cc049', hi: '#8edd66', lip: '#4f9c31' },  // grass
        1: { top: '#59ad3a', hi: '#7fcd55', lip: '#3f8226' },  // dark grass
        2: { top: '#d6b277', hi: '#ecca97', lip: '#ac8a52' },  // path
        3: { top: '#3f97e2', hi: '#74c2f6', lip: '#2a6cb0' },  // water
        4: { top: '#ead49d', hi: '#f6e6b8', lip: '#c4aa70' }   // sand
    };
    const DIRT_L = '#4a3014', DIRT_R = '#684527';

    // Soft drop shadow under the whole island (floating look)
    const c0 = iso(7, 5);
    // Animated ocean wave rings radiating from the island
    const wrx = (ISO.GW) * TW * 0.5, wry = (ISO.GH) * TH * 0.62;
    let wavesSVG = '';
    for (let i = 0; i < 3; i++) {
        wavesSVG += `<ellipse class="ocean-wave" cx="${c0.x}" cy="${c0.y + 26}" rx="${wrx}" ry="${wry}" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" style="animation-delay:${i * 1.7}s"/>`;
    }
    tilesSVG += wavesSVG;
    tilesSVG += `<ellipse cx="${c0.x}" cy="${c0.y + 70}" rx="${(ISO.GW) * TW * 0.62}" ry="${(ISO.GH) * TH * 0.62}" fill="rgba(0,0,0,0.16)" filter="url(#islandShadow)"/>`;

    // Edge detection for beaches: an owned tile touching non-owned land = shoreline
    const _own = (gx, gy) => (gx >= 0 && gx < ISO.GW && gy >= 0 && gy < ISO.GH) && (!ownedTiles || ownedTiles.has(gx + gy * ISO.GW));
    const SAND = '#e8d29a', FOAM = 'rgba(255,255,255,0.7)';

    // Collect land tiles (owned + claimable) and draw back-to-front so columns stack
    const land = [];
    for (let gy = 0; gy < ISO.GH; gy++) {
        for (let gx = 0; gx < ISO.GW; gx++) {
            const pos = gx + gy * ISO.GW;
            const owned = !ownedTiles || ownedTiles.has(pos);
            const isBuy = !owned && buyable.has(pos);
            if (owned || isBuy) land.push({ gx, gy, pos, owned, isBuy });
        }
    }
    land.sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));

    for (const t of land) {
        const { gx, gy, pos, owned, isBuy } = t;
        const { x, y } = iso(gx, gy);
        const type = owned ? TERRAIN[gy][gx] : 0;
        const p = PAL[type] || PAL[0];
        const topPts = `${x},${y - TH} ${x + TW},${y} ${x},${y + TH} ${x - TW},${y}`;

        if (isBuy) {
            // Claimable land: faded ghost column + cyan dashed top (subtle, clickable)
            tilesSVG += `<g opacity="0.5">
                <polygon points="${x - TW},${y} ${x},${y + TH} ${x},${y + TH + DEPTH} ${x - TW},${y + DEPTH}" fill="${DIRT_L}"/>
                <polygon points="${x},${y + TH} ${x + TW},${y} ${x + TW},${y + DEPTH} ${x},${y + TH + DEPTH}" fill="${DIRT_R}"/>
                <polygon points="${topPts}" fill="${p.top}"/>
            </g>
            <polygon points="${topPts}" fill="rgba(34,211,238,0.10)" stroke="#22d3ee" stroke-width="2" stroke-dasharray="6 4" class="buy-tile" data-pos="${pos}" style="cursor:pointer"/>`;
            buyMarkers += `<g class="buy-flag" data-pos="${pos}" style="cursor:pointer" transform="translate(${x},${y - 8})">
                <circle cx="0" cy="0" r="11" fill="#0e1726" stroke="#22d3ee" stroke-width="1.5"/>
                <text x="0" y="3.5" text-anchor="middle" font-size="12" font-weight="900" fill="#22d3ee">+</text>
                <g transform="translate(0,16)"><rect x="-21" y="-7" width="42" height="13" rx="6" fill="#0e1726" stroke="#22d3ee" stroke-width="1"/><text x="0" y="2.5" text-anchor="middle" font-size="7.5" font-weight="800" fill="#7fe9f5">${(landPx.coins>=1000?(landPx.coins/1000).toFixed(1)+'K':landPx.coins)}c</text></g>
            </g>`;
            continue;
        }

        // Shoreline detection: which sides face open water?
        const leftWater = !_own(gx - 1, gy);   // SW face (down-left)
        const rightWater = !_own(gx, gy + 1);  // SE face (down-right)... use neighbor below-right
        const swWater = !_own(gx - 1, gy) || !_own(gx, gy + 1);
        const isEdge = !_own(gx - 1, gy) || !_own(gx + 1, gy) || !_own(gx, gy - 1) || !_own(gx, gy + 1);

        // Solid land column: dirt faces, lip (sandy beach on shore), top, highlight
        tilesSVG += `<polygon points="${x - TW},${y} ${x},${y + TH} ${x},${y + TH + DEPTH} ${x - TW},${y + DEPTH}" fill="${DIRT_L}"/>`;
        tilesSVG += `<polygon points="${x},${y + TH} ${x + TW},${y} ${x + TW},${y + DEPTH} ${x},${y + TH + DEPTH}" fill="${DIRT_R}"/>`;
        const lipL = (!_own(gx - 1, gy) || !_own(gx, gy + 1)) && type !== 3 ? SAND : p.lip;
        const lipR = (!_own(gx + 1, gy) || !_own(gx, gy + 1)) && type !== 3 ? SAND : p.lip;
        tilesSVG += `<polygon points="${x - TW},${y} ${x},${y + TH} ${x},${y + TH + 5} ${x - TW},${y + 5}" fill="${lipL}"/>`;
        tilesSVG += `<polygon points="${x},${y + TH} ${x + TW},${y} ${x + TW},${y + 5} ${x},${y + TH + 5}" fill="${lipR}"/>`;
        // foam line where the beach meets the sea
        if (isEdge && type !== 3) {
            if (!_own(gx - 1, gy) || !_own(gx, gy + 1))
                tilesSVG += `<polyline points="${x - TW},${y + 5} ${x},${y + TH + 5}" fill="none" stroke="${FOAM}" stroke-width="1.6" class="foam-edge"/>`;
            if (!_own(gx + 1, gy) || !_own(gx, gy + 1))
                tilesSVG += `<polyline points="${x},${y + TH + 5} ${x + TW},${y + 5}" fill="none" stroke="${FOAM}" stroke-width="1.6" class="foam-edge"/>`;
        }
        // top — sandy beach tile if it's a shore grass tile
        const topFill = (isEdge && type === 0) ? '#dcc488' : p.top;
        const topHi = (isEdge && type === 0) ? '#ecd9a0' : p.hi;
        tilesSVG += `<polygon points="${topPts}" fill="${topFill}" stroke="${p.lip}" stroke-width="0.5" stroke-opacity="0.35"/>`;
        // upper-half highlight for a soft 3D sheen
        tilesSVG += `<polygon points="${x},${y - TH} ${x + TW * 0.5},${y - TH * 0.5} ${x},${y} ${x - TW * 0.5},${y - TH * 0.5}" fill="${topHi}" opacity="0.45" pointer-events="none"/>`;
        if (type === 3) tilesSVG += `<polygon points="${topPts}" fill="#7cc8f8" opacity="0.2" pointer-events="none"><animate attributeName="opacity" values="0.08;0.32;0.08" dur="3.2s" repeatCount="indefinite"/></polygon>`;
    }

    // Highlight overlay for placement
    let placementSVG = '';
    if (placingBuilding) {
        for (let gy = 0; gy < ISO.GH; gy++) {
            for (let gx = 0; gx < ISO.GW; gx++) {
                const pos = gx + gy * ISO.GW;
                if ((typeof tileOccupiedBy === 'function') ? tileOccupiedBy(pos) : state.buildings.find(b => b.pos === pos)) continue;
                const { x, y } = iso(gx, gy);
                placementSVG += `<polygon points="${x},${y - ISO.TH} ${x + ISO.TW},${y} ${x},${y + ISO.TH} ${x - ISO.TW},${y}" fill="rgba(251,191,36,0.3)" stroke="#fbbf24" stroke-width="1" class="placement-tile" data-pos="${pos}" style="cursor:pointer"/>`;
            }
        }
    }

    // Tile hover hit-zones (only OWNED empty tiles are placeable)
    let hitSVG = '';
    for (let gy = 0; gy < ISO.GH; gy++) {
        for (let gx = 0; gx < ISO.GW; gx++) {
            const pos = gx + gy * ISO.GW;
            if ((typeof tileOccupiedBy === 'function') ? tileOccupiedBy(pos) : state.buildings.find(b => b.pos === pos)) continue;
            if (ownedTiles && !ownedTiles.has(pos)) continue;  // can't place on wild land
            const { x, y } = iso(gx, gy);
            hitSVG += `<polygon points="${x},${y - ISO.TH} ${x + ISO.TW},${y} ${x},${y + ISO.TH} ${x - ISO.TW},${y}" fill="transparent" class="tile-hit" data-pos="${pos}" style="cursor:pointer"/>`;
        }
    }

    // Render entities in depth order
    const cleared = (state.clearedDecos instanceof Set) ? state.clearedDecos
                    : new Set(state.clearedDecos || []);
    let entSVG = '';
    for (const e of entities) {
        if (e.kind === 'deco') {
            const key = e.gx + ',' + e.gy;
            if (cleared.has(key)) continue;                       // already cleared
            const clearable = (e.type === 'tree' || e.type === 'rock');
            let svg = '';
            if (e.type === 'tree') svg = treeSVG(e.gx, e.gy, e.variant);
            else if (e.type === 'rock') svg = rockSVG(e.gx, e.gy, e.variant);
            else if (e.type === 'bush') svg = bushSVG(e.gx, e.gy);
            else if (e.type === 'flower') svg = flowerSVG(e.gx, e.gy, e.variant);
            if (clearable) {
                const reward = e.type === 'tree' ? '' : '';
                entSVG += `<g class="deco-clear" data-key="${key}" data-type="${e.type}" style="cursor:pointer">${svg}</g>`;
            } else {
                entSVG += svg;
            }
        } else if (e.kind === 'bld') {
            const is2x2 = (typeof FOOTPRINT_2X2 !== 'undefined') && FOOTPRINT_2X2[e.type];
            if (is2x2) {
                // render at center of 2x2 footprint, scaled up
                const c = iso(e.gx + 0.5, e.gy + 0.5);
                entSVG += `<g transform="translate(${c.x},${c.y}) scale(1.5) translate(${-c.x},${-c.y})">${buildingTile(e.gx + 0.5, e.gy + 0.5, e.type, e.level, e.pos)}</g>`;
            } else {
                entSVG += buildingTile(e.gx, e.gy, e.type, e.level, e.pos);
            }
            // construction / upgrade badge with countdown
            const bb = state.buildings.find(b => b.pos === e.pos);
            const job = bb && (bb.constructing ? bb.endsAt : (bb.upgrading ? bb.upgrading.endsAt : 0));
            if (job) {
                const { x: bx, y: by } = iso(e.gx + (is2x2 ? 0.5 : 0), e.gy + (is2x2 ? 0.5 : 0));
                const remain = Math.max(0, Math.ceil((job - Date.now()) / 1000));
                const gems = (typeof finishCostGems === 'function') ? finishCostGems(job) : 1;
                entSVG += `<g class="build-timer" data-pos="${e.pos}" style="cursor:pointer" transform="translate(${bx},${by - 56})">
                    <rect x="-34" y="-11" width="68" height="22" rx="10" fill="#0e1726" stroke="#fbbf24" stroke-width="1.4"/>
                    <text class="bt-remain" x="-12" y="4" text-anchor="middle" font-size="10" fill="#fde68a" font-weight="800">${remain}s</text>
                    <path d="M14 -4 L18 0 L14 4 L10 0 Z" fill="#7dd3fc"/>
                    <text x="26" y="4" text-anchor="middle" font-size="9" fill="#7dd3fc" font-weight="800">${gems}</text>
                </g>`;
            }
        }
    }

    // Villagers — each wanders RANDOMLY (JS-driven, no looped keyframes)
    let workerSvg = '';
    const villagerCount = Math.min(6, 2 + state.buildings.length);
    for (let i = 0; i < villagerCount; i++) {
        const b = state.buildings[i % Math.max(1, state.buildings.length)];
        let gx = 6, gy = 5;
        if (b) { gx = b.pos % ISO.GW; gy = Math.floor(b.pos / ISO.GW); }
        const { x, y } = iso(gx, gy);
        workerSvg += `<g class="villager-wrap" data-vid="${i}" data-hx="${x}" data-hy="${y - 8}" style="transform:translate(${x}px,${y - 8}px)">${villagerSVG(i, i)}</g>`;
    }

    // Cow grazing
    let animals = '';
    if (state.buildings.find(b => b.type === 'farm')) {
        const farm = state.buildings.find(b => b.type === 'farm');
        const fgx = farm.pos % ISO.GW;
        const fgy = Math.floor(farm.pos / ISO.GW);
        const { x: fx, y: fy } = iso(fgx, fgy);
        animals += `<g class="ambient-cow-wrap cow-anim" style="transform:translate(${fx + 60}px,${fy + 20}px)">${cowSVG()}</g>`;
    }

    // Cart roams the island (JS-driven random wander — not a fixed loop)
    let cart = '';
    {
        const c = iso(7, 5);
        cart += `<g class="ambient-cart-wrap" data-hx="${c.x}" data-hy="${c.y}" data-rx="${ISO.GW * ISO.TW * 0.34}" data-ry="${ISO.GH * ISO.TH * 0.5}" style="transform:translate(${c.x}px,${c.y}px)">${cartSVG()}</g>`;
    }

    // Boat sails the open water around the island (JS-driven random wander)
    let boat = '';
    {
        const b0 = iso(-1, 4);
        boat += `<g class="ambient-boat-wrap" data-hx="${b0.x}" data-hy="${b0.y}" data-rx="${ISO.GW * ISO.TW * 0.55}" data-ry="${ISO.GH * ISO.TH * 0.7}" style="transform:translate(${b0.x}px,${b0.y}px)">${boatSVG()}</g>`;
    }

    // Birds flying across the sky
    let birds = '';
    for (let i = 0; i < 5; i++) {
        const startY = 30 + i * 18;
        birds += `<g class="ambient-bird-wrap bird-fly-${i}" style="--bird-y:${startY}px;--bird-w:${w}px">${birdSVG(i)}</g>`;
    }

    // Ambient butterflies near flowers
    let particles = '';
    for (let i = 0; i < 6; i++) {
        const px = 150 + i * 120;
        const py = (ISO.GH * ISO.TH) * 0.5 + (i % 2) * 80;
        particles += `<g class="butterfly bf${i % 4}" style="transform:translate(${px}px,${py}px)">
            <ellipse cx="-3" cy="0" rx="3" ry="2" fill="${['#fbbf24','#f87171','#a78bfa','#22d3ee'][i % 4]}" stroke="#1a1408" stroke-width="0.3"/>
            <ellipse cx="3" cy="0" rx="3" ry="2" fill="${['#fbbf24','#f87171','#a78bfa','#22d3ee'][i % 4]}" stroke="#1a1408" stroke-width="0.3"/>
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#1a1408" stroke-width="0.5"/>
        </g>`;
    }

    // Production indicators floating above ready buildings
    let prodSVG = '';
    for (const b of state.buildings) {
        const def = BUILDING_DEFS[b.type];
        if (!def.production) continue;
        const ready = (b.collectReady || 0);
        if (ready < 5) continue;
        const gx = b.pos % ISO.GW, gy = Math.floor(b.pos / ISO.GW);
        const { x, y } = iso(gx, gy);
        const resKey = Object.keys(def.production)[0];
        // Native SVG gold shapes for coins/gold (emoji renders silver inside SVG)
        let iconSVG;
        if (resKey === 'coins') {
            iconSVG = `<circle cx="0" cy="0" r="8" fill="#fbc536" stroke="#8a5a06" stroke-width="1.4"/><circle cx="0" cy="0" r="5.4" fill="none" stroke="#a86d06" stroke-width="0.8"/><text x="0" y="3" text-anchor="middle" font-size="9" font-weight="900" fill="#8a5a06">$</text>`;
        } else if (resKey === 'gold') {
            iconSVG = `<polygon points="-7,4 7,4 8.5,8 -8.5,8" fill="#fcd34d" stroke="#a16207" stroke-width="0.8"/><polygon points="-5,-2 5,-2 7,4 -7,4" fill="#fde68a" stroke="#a16207" stroke-width="0.8"/>`;
        } else if (resKey === 'iron') {
            iconSVG = `<polygon points="-7,3 7,3 8.5,7 -8.5,7" fill="#9aa3b2" stroke="#454c5a" stroke-width="0.8"/><polygon points="-5,-3 5,-3 7,3 -7,3" fill="#c2c9d6" stroke="#454c5a" stroke-width="0.8"/>`;
        } else if (resKey === 'wood') {
            iconSVG = `<ellipse cx="-4" cy="-1" rx="4" ry="4" fill="#a9743c" stroke="#5a3a18" stroke-width="1"/><ellipse cx="-4" cy="-1" rx="1.6" ry="1.6" fill="none" stroke="#7a5028"/><ellipse cx="4" cy="-1" rx="4" ry="4" fill="#a9743c" stroke="#5a3a18" stroke-width="1"/><ellipse cx="4" cy="-1" rx="1.6" ry="1.6" fill="none" stroke="#7a5028"/><ellipse cx="0" cy="4" rx="4" ry="4" fill="#bd864a" stroke="#5a3a18" stroke-width="1"/>`;
        } else if (resKey === 'food') {
            iconSVG = `<g stroke="#9a7320" stroke-width="0.9"><line x1="0" y1="8" x2="0" y2="-2"/><line x1="0" y1="6" x2="-4" y2="2"/><line x1="0" y1="6" x2="4" y2="2"/></g><ellipse cx="0" cy="-4" rx="2" ry="3.4" fill="#f0c850" stroke="#a9842c" stroke-width="0.5"/><ellipse cx="-3" cy="-1" rx="1.6" ry="2.8" fill="#f0c850" stroke="#a9842c" stroke-width="0.5" transform="rotate(-28 -3 -1)"/><ellipse cx="3" cy="-1" rx="1.6" ry="2.8" fill="#f0c850" stroke="#a9842c" stroke-width="0.5" transform="rotate(28 3 -1)"/>`;
        } else {
            iconSVG = `<text x="0" y="4" text-anchor="middle" font-size="14"></text>`;
        }
        prodSVG += `<g class="prod-indicator" data-pos="${b.pos}" style="cursor:pointer" transform="translate(${x}, ${y - 70})">
            <circle cx="0" cy="0" r="14" fill="#1a1a2e" stroke="#fbbf24" stroke-width="2" opacity="0.95"/>
            <circle cx="0" cy="0" r="14" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="14;20;14" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite"/>
            </circle>
            ${iconSVG}
            <text x="11" y="-8" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" stroke="#000" stroke-width="0.5">${Math.floor(ready)}</text>
        </g>`;
    }

    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" id="iso-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
            <filter id="bldShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="4" stdDeviation="2" flood-opacity="0.4"/>
            </filter>
            <filter id="islandShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="18"/>
            </filter>
            <radialGradient id="dayNight" cx="0.5" cy="0">
                <stop offset="0" stop-color="rgba(255,200,120,0)"/>
                <stop offset="1" stop-color="rgba(0,0,30,0)"/>
            </radialGradient>
            <linearGradient id="sailShade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="rgba(0,0,0,0)"/>
                <stop offset="1" stop-color="rgba(0,0,0,0.3)"/>
            </linearGradient>
            <pattern id="fogPattern" x="0" y="0" width="10" height="6" patternUnits="userSpaceOnUse">
                <rect width="10" height="6" fill="transparent"/>
                <circle cx="2" cy="2" r="1" fill="rgba(60,60,80,0.4)"/>
                <circle cx="7" cy="4" r="0.8" fill="rgba(80,80,100,0.3)"/>
            </pattern>
        </defs>
        <g class="camera-layer" transform="translate(${CAM.x}, ${CAM.y}) scale(${CAM.zoom})" style="transform-origin: ${w/2}px ${h/2}px">
            <g class="tiles">${tilesSVG}</g>
            <g class="boats">${boat}</g>
            <g class="hits">${hitSVG}</g>
            <g class="entities" filter="url(#bldShadow)">${entSVG}</g>
            <g class="animals">${animals}</g>
            <g class="carts">${cart}</g>
            <g class="workers">${workerSvg}</g>
            <g class="placement">${placementSVG}</g>
            <g class="buy-markers">${buyMarkers}</g>
            <g class="particles">${particles}</g>
            <g class="birds">${birds}</g>
            <g class="indicators">${prodSVG}</g>
        </g>
        <rect class="day-night-overlay" x="0" y="0" width="${w}" height="${h}" fill="url(#dayNight)" pointer-events="none"/>
    </svg>`;
}

// Tap a building to collect accumulated resources (Clash of Clans style)
function collectBuilding(pos) {
    const b = state.buildings.find(b => b.pos === pos);
    if (!b) return;
    const def = BUILDING_DEFS[b.type];
    if (!def.production || !b.collectReady || b.collectReady < 1) return;
    const amount = Math.floor(b.collectReady);
    const resKey = Object.keys(def.production)[0];
    state.resources[resKey] = Math.min((state.resources[resKey] || 0) + amount, state.maxResources[resKey] || 99999);
    b.collectReady = 0;
    if (typeof expOnCollect === 'function') expOnCollect();

    // Find building screen position for fly-out animation
    const grid = document.getElementById('village-grid');
    const indicator = grid?.querySelector(`.prod-indicator[data-pos="${pos}"]`);
    let originX = window.innerWidth / 2, originY = window.innerHeight / 2;
    if (indicator) {
        const r = indicator.getBoundingClientRect();
        originX = r.left + r.width / 2;
        originY = r.top + r.height / 2;
    }
    try {
        Audio.coin();
        flyResource(resKey, amount, originX, originY);
    } catch(e) {}
    updateResources();
    renderGrid();
    saveGame();
}

// Animate a resource pickup flying to the header
function flyResource(resKey, amount, ox, oy) {
    const target = document.getElementById('res-' + resKey);
    if (!target) { lootPopups({ [resKey]: amount }, ox, oy); return; }
    const tr = target.getBoundingClientRect();
    const tx = tr.left + tr.width / 2;
    const ty = tr.top + tr.height / 2;
    const count = 8;
    const icons = { coins: (typeof COIN_ICON !== 'undefined' ? COIN_ICON : ''), gold: (typeof GOLD_ICON !== 'undefined' ? GOLD_ICON : ''), iron: (typeof IRON_ICON !== 'undefined' ? IRON_ICON : ''), wood: (typeof WOOD_ICON !== 'undefined' ? WOOD_ICON : ''), food: (typeof FOOD_ICON !== 'undefined' ? FOOD_ICON : '') };
    for (let i = 0; i < count; i++) {
        const c = document.createElement('div');
        c.className = 'fx-coin-fly';
        c.innerHTML = icons[resKey] || '';
        c.style.left = ox + 'px';
        c.style.top = oy + 'px';
        c.style.setProperty('--tx', (tx - ox) + 'px');
        c.style.setProperty('--ty', (ty - oy) + 'px');
        c.style.animationDelay = (i * 0.04) + 's';
        document.body.appendChild(c);
        setTimeout(() => c.remove(), 1200);
    }
    setTimeout(() => {
        target.classList.add('res-bump');
        setTimeout(() => target.classList.remove('res-bump'), 400);
        popup(`+${amount}`, { x: tx, y: ty - 28, color: '#fde047' });
    }, 700);
}

// ============================================================
// VILLAGER RANDOM WANDER (JS-driven, non-repeating)
// ============================================================
let _villagerWanderTimers = [];
function stopVillagerWander() {
    _villagerWanderTimers.forEach(t => clearTimeout(t));
    _villagerWanderTimers = [];
}
// Generic random wanderer — never repeats a fixed path
function _wanderEl(el, opts) {
    const hx = parseFloat(el.dataset.hx);
    const hy = parseFloat(el.dataset.hy);
    const rx = parseFloat(el.dataset.rx) || opts.rx || 120;
    const ry = parseFloat(el.dataset.ry) || opts.ry || (rx * 0.6);
    const inner = opts.innerSel ? el.querySelector(opts.innerSel) : null;
    let cx = hx, cy = hy;
    const step = () => {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random();                      // 0..1 of the range
        let tx = hx + Math.cos(angle) * rx * r;
        let ty = hy + Math.sin(angle) * ry * r;
        const idle = opts.idleChance && Math.random() < opts.idleChance;
        if (idle) { tx = cx; ty = cy; }
        const dist = Math.hypot(tx - cx, ty - cy);
        const speed = opts.speed[0] + Math.random() * (opts.speed[1] - opts.speed[0]);
        const ms = idle ? (opts.pause[0] + Math.random() * (opts.pause[1] - opts.pause[0]))
                        : Math.max(800, (dist / speed) * 1000);
        if (inner) inner.style.transform = (tx < cx ? 'scaleX(-1)' : 'scaleX(1)');
        el.style.transition = `transform ${ms}ms ${idle ? 'ease-in-out' : 'ease-in-out'}`;
        el.style.transform = `translate(${tx}px, ${ty}px)`;
        cx = tx; cy = ty;
        const pause = opts.pause[0] + Math.random() * (opts.pause[1] - opts.pause[0]);
        _villagerWanderTimers.push(setTimeout(step, ms + pause));
    };
    _villagerWanderTimers.push(setTimeout(step, Math.random() * (opts.startDelay || 1500)));
}

function startVillagerWander(grid) {
    stopVillagerWander();
    grid.querySelectorAll('.villager-wrap').forEach((el) =>
        _wanderEl(el, { speed: [14, 24], pause: [200, 2800], idleChance: 0.22, innerSel: '.villager', startDelay: 1500 }));
    // Boat drifts slowly & randomly over open water
    grid.querySelectorAll('.ambient-boat-wrap').forEach((el) =>
        _wanderEl(el, { speed: [8, 16], pause: [400, 1600], idleChance: 0.1, startDelay: 800 }));
    // Cart trundles randomly around the island
    grid.querySelectorAll('.ambient-cart-wrap').forEach((el) =>
        _wanderEl(el, { speed: [12, 22], pause: [600, 3000], idleChance: 0.18, innerSel: '.ambient-cart', startDelay: 1200 }));
}
