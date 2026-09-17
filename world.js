// ============================================================
// ISOMETRIC WORLD RENDERER
// Real iso tilemap with depth sorting, animated decorations,
// detailed hand-crafted building art.
// ============================================================

const ISO = {
    // Tile size drives how much room each building gets. At 48x24 the art
    // (57-62px) crowded its plot: 12 overlapping pairs, worst 45% of a
    // building hidden. Measured 66x33 (same 2:1 projection every building
    // base is drawn against) down to a single 20% pair, which also frees us
    // to draw the buildings LARGER rather than shrinking them.
    TW: 66,        // tile half-width
    TH: 33,        // tile half-height
    GW: 20,        // grid width (cols) — matches MAP_W
    GH: 14,        // grid height (rows) — matches MAP_H
    OFFSET_X: 0,
    OFFSET_Y: 0
};

// Camera state — pan/zoom (SVG transform) + 3D view angle (CSS transform)
const CAM = { x: 0, y: 0, zoom: 3.1, minZoom: 0.5, maxZoom: 6.0 };
const VIEW = { spin: 0, tilt: 0 };  // LOCKED — the iso angle never changes (drag pans instead)

// Compute final viewbox & offset so everything is centered
function isoSetup() {
    const w = (ISO.GW + ISO.GH) * ISO.TW;
    const h = (ISO.GW + ISO.GH) * ISO.TH + 120; // room for tall buildings above
    ISO.OFFSET_X = ISO.GH * ISO.TW;
    ISO.OFFSET_Y = 80;
    return { w, h };
}

// Frame the camera on the land the player actually has, not the whole empty
// map. Without this the island renders as a small diamond marooned in a sea of
// nothing; with it the village fills the screen and the frame widens naturally
// as the kingdom grows.
function islandViewBox(fullW, fullH) {
    const owned = (typeof getOwnedTiles === 'function') ? getOwnedTiles() : null;
    if (!owned || !owned.size) return { vx: 0, vy: 0, vw: fullW, vh: fullH };
    let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    owned.forEach(pos => {
        const gx = pos % ISO.GW, gy = Math.floor(pos / ISO.GW);
        const p = iso(gx, gy);
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    });
    // tile half-extents + headroom for tall buildings, then a margin of sea
    const padX = ISO.TW * 0.5, padTop = 60, padBottom = ISO.TH * 1.0;
    let vx = minX - ISO.TW - padX;
    let vy = minY - ISO.TH - padTop;
    let vw = (maxX - minX) + ISO.TW * 2 + padX * 2;
    let vh = (maxY - minY) + ISO.TH * 2 + padTop + padBottom;
    // keep a pleasant landscape aspect so the island never looks squeezed
    const targetAR = 16 / 10;
    if (vw / vh < targetAR) { const need = vh * targetAR; vx -= (need - vw) / 2; vw = need; }
    else { const need = vw / targetAR; vy -= (need - vh) / 2; vh = need; }
    return { vx, vy, vw, vh };
}

// Deterministic 0..1 hash — same tile always gets the same variation, so the
// terrain never shimmers or reshuffles between renders.
function _tRand(n) { const v = Math.sin(n * 91.7 + 41.3) * 21753.19; return v - Math.floor(v); }
// Nudge a hex colour a few percent lighter/darker based on tile coords.
function _tileShade(hex, gx, gy) {
    const h = hex.replace('#', '');
    if (h.length !== 6) return hex;
    const d = (_tRand(gx * 3 + gy * 11) - 0.5) * 13;   // ±6.5 per channel
    const ch = (i) => {
        const v = Math.round(parseInt(h.substr(i, 2), 16) + d);
        return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
    };
    return '#' + ch(0) + ch(2) + ch(4);
}

// Shift a hex colour by a signed amount per channel. Used for ground mottling,
// which must stay close to the tile's own colour: derived from a fixed dark
// green instead, two patches up to 34px wide at 0.3 opacity read as stains or
// mould on the grass rather than as variation in it.
function _shiftHex(hex, d) {
    const h = hex.replace('#', '');
    if (h.length !== 6) return hex;
    const ch = (i) => {
        const v = Math.round(parseInt(h.substr(i, 2), 16) + d);
        return Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0');
    };
    return '#' + ch(0) + ch(2) + ch(4);
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
        // PINE — tapered bark trunk with root flare, drooping needle tiers with
        // ragged edges (a real conifer sags outward and down, it isn't a stack
        // of clean triangles), lit on the upper-left, deep shade on the right.
        `<ellipse cx="${x + 3}" cy="${y + 4}" rx="13" ry="3.2" fill="rgba(0,0,0,0.35)"/>
         <path d="M ${x - 3.4} ${y + 6} q 1.1 -3 0.9 -8 l 0.4 -10 l 4.2 0 l 0.4 10 q -0.2 5 0.9 8 Z" fill="#5a3818" stroke="#2a1a0e" stroke-width="0.45"/>
         <path d="M ${x + 0.5} ${y + 6} l 0.4 -18 l 2.6 0 l 0.4 10 q -0.2 5 0.9 8 Z" fill="#3d2410" opacity="0.55"/>
         ${[[-8, 14, '#1c6a2c'], [-16, 11.5, '#227a33'], [-24, 9, '#2b8f3d'], [-31, 6.5, '#34a447']].map(([dy, w, c]) => `
            <path d="M ${x - w} ${y + dy} q ${w * 0.35} 1.6 ${w * 0.55} -1.2 q ${w * 0.2} 2 ${w * 0.45} -0.6 L ${x} ${y + dy - 11}
                     q ${w * 0.45} 4.4 ${w * 0.9} 10.6 q -${w * 0.25} -2.6 -${w * 0.45} 0.6 q -${w * 0.2} -2.8 -${w * 0.55} 1.2 Z"
                  fill="${c}" stroke="#0e3818" stroke-width="0.4"/>
            <path d="M ${x} ${y + dy - 11} q ${w * 0.45} 4.4 ${w * 0.9} 10.6 q -${w * 0.25} -2.6 -${w * 0.45} 0.6 Z" fill="#000" opacity="0.14"/>
         `).join('')}
         <path d="M ${x - 4} ${y - 33} q 1.6 -4 4 -5.5 q 2.4 1.5 4 5.5 q -4 -2 -8 0 Z" fill="#3aae4d" stroke="#0e3818" stroke-width="0.35"/>`,
        // OAK — a real crown: forking limbs, then overlapping leaf CLUSTERS with
        // scalloped edges (never plain circles) in three depth tones.
        `<ellipse cx="${x + 3}" cy="${y + 5}" rx="17" ry="3.8" fill="rgba(0,0,0,0.35)"/>
         <path d="M ${x - 5} ${y + 6} q 1.8 -4 1.4 -9 l 0.5 -6 l 6.2 0 l 0.5 6 q -0.4 5 1.4 9 Z" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.5"/>
         <path d="M ${x + 1} ${y + 6} l 0.5 -15 l 3.1 0 l 0.5 6 q -0.4 5 1.4 9 Z" fill="#452a10" opacity="0.5"/>
         ${[[-3.5, -6], [-2, -3], [1, -5]].map(([tx, ty]) => `<line x1="${x + tx}" y1="${y + ty}" x2="${x + tx * 0.4}" y2="${y + ty - 4}" stroke="#3d2410" stroke-width="0.45" opacity="0.6"/>`).join('')}
         <path d="M ${x - 1} ${y - 9} q -3.5 -3 -7 -7" stroke="#5a3818" stroke-width="1.8" fill="none" stroke-linecap="round"/>
         <path d="M ${x + 1} ${y - 9} q 3.5 -3.5 7.5 -6" stroke="#5a3818" stroke-width="1.8" fill="none" stroke-linecap="round"/>
         <path d="M ${x} ${y - 10} q 0.5 -5 0.5 -9" stroke="#5a3818" stroke-width="1.6" fill="none" stroke-linecap="round"/>
         ${[[0, -23, 17, '#26762c'], [-10, -18, 10.5, '#2e8b34'], [11, -17, 9.5, '#2e8b34'], [2, -30, 9, '#3aa845'], [-6, -27, 7, '#3aa845']].map(([cx0, cy0, r, c]) => {
            let d = '';
            for (let k = 0; k < 9; k++) {
                const a = (k / 9) * Math.PI * 2;
                const rr = r * (k % 2 ? 0.80 : 1);
                const px = x + cx0 + Math.cos(a) * rr, py = y + cy0 + Math.sin(a) * rr * 0.86;
                d += (k ? ' Q ' : 'M ') + (k ? `${x + cx0 + Math.cos(a - 0.35) * r * 1.06} ${y + cy0 + Math.sin(a - 0.35) * r * 0.92} ${px} ${py}` : `${px} ${py}`);
            }
            return `<path d="${d} Z" fill="${c}" stroke="#154d18" stroke-width="0.45"/>`;
         }).join('')}
         <path d="M ${x - 14} ${y - 26} q 6 -5 13 -4.5 q -7 1.5 -13 4.5 Z" fill="#5ad078" opacity="0.45"/>
         <path d="M ${x + 6} ${y - 12} q 8 2 11 -3 q -3 6 -11 3 Z" fill="#0e3818" opacity="0.28"/>`,
        // CHERRY — blossom clusters with visible petal lobes and drifting petals.
        `<ellipse cx="${x + 2}" cy="${y + 4}" rx="14" ry="3" fill="rgba(0,0,0,0.3)"/>
         <path d="M ${x - 3.2} ${y + 6} q 1.2 -3.4 1 -8 l 0.4 -5 l 3.6 0 l 0.4 5 q -0.2 4.6 1 8 Z" fill="#5a3818" stroke="#2a1a0e" stroke-width="0.45"/>
         <path d="M ${x - 0.5} ${y - 7} q -3 -2.5 -6 -5" stroke="#4a2e16" stroke-width="1.3" fill="none" stroke-linecap="round"/>
         <path d="M ${x + 0.5} ${y - 7} q 3 -3 6.5 -4.5" stroke="#4a2e16" stroke-width="1.3" fill="none" stroke-linecap="round"/>
         ${[[0, -19, 13, '#f4a0c0'], [-8, -14, 8, '#f9bad2'], [9, -14, 8.5, '#f9bad2'], [1, -26, 7, '#ffd0e0']].map(([cx0, cy0, r, c]) => {
            let d = '';
            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                const rr = r * (k % 2 ? 0.78 : 1);
                const px = x + cx0 + Math.cos(a) * rr, py = y + cy0 + Math.sin(a) * rr * 0.85;
                d += (k ? ' Q ' : 'M ') + (k ? `${x + cx0 + Math.cos(a - 0.38) * r * 1.08} ${y + cy0 + Math.sin(a - 0.38) * r * 0.9} ${px} ${py}` : `${px} ${py}`);
            }
            return `<path d="${d} Z" fill="${c}" stroke="#b8608c" stroke-width="0.4"/>`;
         }).join('')}
         ${[[-11, -6], [8, -3], [-4, -1]].map(([px, py], i) => `<ellipse cx="${x + px}" cy="${y + py}" rx="1.5" ry="0.85" fill="#ffd0e0" opacity="0.85" transform="rotate(${i * 40 - 30} ${x + px} ${y + py})"/>`).join('')}`
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

// ---------------------------------------------------------------- upgrade tiers
// Every renderer takes `level` and not one of them used it: a Town Hall looked
// identical at level 1 and level 10, so the main reward loop of the game had no
// visual payoff at all. Rather than rewrite fifteen renderers, the plot itself
// is upgraded underneath and around whatever the renderer draws.
//
//   tier 0  (lv 1-2)   bare earth, small
//   tier 1  (lv 3-5)   a cut-stone footing appears, building grows
//   tier 2  (lv 6-8)   deeper footing, corner posts, a banner
//   tier 3  (lv 9-10)  gilded finial and a second banner
function buildingTier(level) {
    const lv = level || 1;
    return lv >= 9 ? 3 : lv >= 6 ? 2 : lv >= 3 ? 1 : 0;
}

// Scale ramps with tier so growth reads instantly at a glance, before any detail
// is legible. Kept modest: past ~0.72 neighbouring plots start to collide.
function buildingScale(level) {
    return 0.585 + buildingTier(level) * 0.045;
}

// An isometric stone slab under the building. Drawn in tile space (never scaled
// with the art) so it always seats exactly on its own plot.
function buildingPlinth(x, y, tier, scale) {
    if (tier < 1) return '';
    // Must track the building's own scale. Sized to the full tile it drew a slab
    // far wider than the building standing on it, which read as a rendering bug
    // rather than a stone footing.
    const k = (scale || 0.64) * 0.98;
    const w = ISO.TW * k, h = ISO.TH * k;
    const d = 1.6 + tier * 1.5;                       // course depth grows with tier
    const top = `${x},${y - h} ${x + w},${y} ${x},${y + h} ${x - w},${y}`;
    const face = (sx) => `${x + sx * w},${y} ${x},${y + h} ${x},${y + h + d} ${x + sx * w},${y + d}`;
    // Joint lines make it read as cut blocks rather than a flat grey shape.
    let joints = '';
    for (let i = 1; i <= 3; i++) {
        const t = i / 4;
        joints += `<line x1="${x - w + w * t}" y1="${y - h * t}" x2="${x + w * t}" y2="${y + h - h * t}" stroke="rgba(96,78,52,0.32)" stroke-width="0.55"/>`;
    }
    // Warm sandstone rather than cold grey: a neutral slab read as washed-out
    // against the saturated grass, more like a missing texture than masonry.
    // Light comes from the upper left throughout the scene, so the left face is
    // the lit one and the right face carries the shadow.
    return `<g class="bld-plinth">
        <ellipse cx="${x}" cy="${y + d + 1}" rx="${w * 1.02}" ry="${h * 0.9}" fill="rgba(28,20,10,0.20)"/>
        <polygon points="${face(-1)}" fill="#b09a7a"/>
        <polygon points="${face(1)}" fill="#7d6a50"/>
        <polygon points="${top}" fill="#d8c8a8" stroke="#7d6a50" stroke-width="0.7"/>
        ${joints}
        <polygon points="${top}" fill="none" stroke="rgba(255,252,240,0.45)" stroke-width="0.6"/>
    </g>`;
}

// Corner posts, banners and a gilded finial: the parts a player notices without
// reading the level badge.
function buildingCrest(x, y, tier, type, scale) {
    if (tier < 2) return '';
    const k = (scale || 0.64) * 0.82;
    const w = ISO.TW * k, h = ISO.TH * k;
    const colour = (type === 'barracks' || type === 'fortress' || type === 'archertower' || type === 'cannon')
        ? '#8e2f22' : '#2f5d8e';
    let out = '<g class="bld-crest">';
    // Squat corner posts on the two front edges, so they never hide the facade.
    [[-1, 0], [1, 0]].forEach(function (c) {
        const px = x + c[0] * w, py = y + c[1] * h;
        out += `<g>
            <polygon points="${px - 2.6},${py - 1} ${px},${py + 0.4} ${px + 2.6},${py - 1} ${px + 2.6},${py - 6} ${px},${py - 7.4} ${px - 2.6},${py - 6}" fill="#8d7a5c"/>
            <polygon points="${px - 2.6},${py - 6} ${px},${py - 7.4} ${px + 2.6},${py - 6} ${px},${py - 4.7} Z" fill="#d8c8a8" stroke="#7d6a50" stroke-width="0.4"/>
            <polygon points="${px},${py + 0.4} ${px + 2.6},${py - 1} ${px + 2.6},${py - 6} ${px},${py - 4.7} Z" fill="#7d6a50"/>
        </g>`;
    });
    out += `<g transform="translate(${x - w + 1}, ${y - 1}) scale(0.62)">${FLAG(0, 0, colour)}</g>`;
    if (tier >= 3) {
        out += `<g transform="translate(${x + w - 1}, ${y - 1}) scale(0.62)">${FLAG(0, 0, '#c9a227')}</g>`;
        // gilded ridge finial
        out += `<g transform="translate(${x}, ${y - h - 2})">
            <path d="M -3 0 L 0 -7 L 3 0 Z" fill="#e0b73c" stroke="#7a5f14" stroke-width="0.6"/>
            <circle cx="0" cy="-8.5" r="2" fill="#f2d472" stroke="#7a5f14" stroke-width="0.6"/>
        </g>`;
    }
    return out + '</g>';
}

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
    // Fit the art to its plot. The renderers draw at a generous scale so their
    // materials (thatch strands, shingle courses, stone joints) stay legible when
    // authored, but at full size neighbouring buildings collide into one mass.
    // Scaling about the anchor keeps every building seated on its own tile with
    // breathing room around it — footprint reads clearly, detail survives.
    const tier = buildingTier(level);
    const S = buildingScale(level);
    return `<g class="bld bld-${type} bld-tier${tier}" data-pos="${pos}" style="cursor:pointer">
        ${buildingPlinth(x, y, tier, S)}
        <g transform="translate(${x},${y}) scale(${S}) translate(${-x},${-y})">${fn(x, y, level)}</g>
        ${buildingCrest(x, y, tier, type, S)}
        <g class="bld-badge" transform="translate(${x + 7}, ${y - 3}) scale(0.55)">
            <rect x="0" y="0" width="22" height="13" rx="6" fill="#1a1a2e" stroke="#fbbf24" stroke-width="1"/>
            <text x="11" y="9.5" text-anchor="middle" font-size="9" font-weight="900" fill="#fbbf24" font-family="Inter, sans-serif">${level}</text>
        </g>
    </g>`;
}

function placeholderBuilding(x, y, type, lvl) {
    return `<g><rect x="${x - 20}" y="${y - 30}" width="40" height="30" fill="#6b4520" stroke="#3a2010"/></g>`;
}

// Reusable SVG fragments
const SHADOW = (x, y, w = 36) => `
    <ellipse cx="${x + w * 0.06}" cy="${y + 4}" rx="${w * 1.1}" ry="${w * 0.22}" fill="rgba(30,20,10,0.16)"/>
    <ellipse cx="${x}" cy="${y + 3}" rx="${w}" ry="${w * 0.17}" fill="rgba(30,20,10,0.32)"/>
`;
const FLAG = (x, y, color = '#b3402e') => `
    <line x1="${x}" y1="${y}" x2="${x}" y2="${y - 19}" stroke="#2a1a0e" stroke-width="1.4"/>
    <line x1="${x - 0.45}" y1="${y - 1}" x2="${x - 0.45}" y2="${y - 18}" stroke="rgba(255,255,255,0.35)" stroke-width="0.45"/>
    <circle cx="${x}" cy="${y - 19.5}" r="1.3" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.5"/>
    <path class="flag-wave" d="M ${x + 0.5} ${y - 18} Q ${x + 6.5} ${y - 19.6} ${x + 12.5} ${y - 17.6} L ${x + 9} ${y - 14.6} L ${x + 12.5} ${y - 11.6} Q ${x + 6.5} ${y - 9.6} ${x + 0.5} ${y - 11.2} Z" fill="${color}" stroke="#2a1a0e" stroke-width="0.6"/>
    <path class="flag-wave" d="M ${x + 0.5} ${y - 18} Q ${x + 6.5} ${y - 19.6} ${x + 12.5} ${y - 17.6} L ${x + 9} ${y - 14.6} L ${x + 4.5} ${y - 15.4} L ${x + 0.5} ${y - 14.6} Z" fill="rgba(255,255,255,0.22)"/>
`;
const SMOKE = (x, y) => `
    <circle class="smoke-puff" cx="${x}" cy="${y}" r="2.6" fill="rgba(238,233,224,0.75)"/>
    <circle class="smoke-puff" cx="${x + 2.5}" cy="${y - 7}" r="3.6" fill="rgba(228,223,214,0.55)" style="animation-delay:.6s"/>
    <circle class="smoke-puff" cx="${x - 1.5}" cy="${y - 14}" r="4.6" fill="rgba(218,213,204,0.38)" style="animation-delay:1.2s"/>
    <circle class="smoke-puff" cx="${x + 1}" cy="${y - 21}" r="5.4" fill="rgba(208,203,196,0.22)" style="animation-delay:1.8s"/>
`;
// Front-on window: cut back into the wall, with a jamb reveal, a projecting
// stone sill and the shadow that sill drops. Signature unchanged (top-left x,y).
const LIT_WINDOW = (x, y, w = 5, h = 7) => `
    <ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w * 1.7}" ry="${h * 1.35}" fill="#ffca5f" opacity="0.13"/>
    <rect x="${x - 1.5}" y="${y - 1.5}" width="${w + 3}" height="${h + 3}" rx="0.6" fill="#33220f"/>
    <rect x="${x - 0.8}" y="${y - 0.8}" width="${w + 1.6}" height="${h + 1.6}" rx="0.5" fill="#150c05"/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffd773">
        <animate attributeName="fill" values="#ffd773;#ffc247;#ffd773" dur="3.4s" repeatCount="indefinite"/>
    </rect>
    <rect x="${x}" y="${y}" width="${w}" height="${h * 0.42}" fill="rgba(255,255,255,0.35)"/>
    <line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#2a1a0e" stroke-width="0.5"/>
    <line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#2a1a0e" stroke-width="0.5"/>
    <line x1="${x - 1.5}" y1="${y - 1.5}" x2="${x + w + 1.5}" y2="${y - 1.5}" stroke="rgba(255,246,225,0.5)" stroke-width="0.6"/>
    <line x1="${x - 1.5}" y1="${y - 1.5}" x2="${x - 1.5}" y2="${y + h + 1.5}" stroke="rgba(255,246,225,0.3)" stroke-width="0.55"/>
    <rect x="${x - 2.4}" y="${y + h + 1.4}" width="${w + 4.8}" height="1.7" rx="0.4" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.45"/>
    <line x1="${x - 2.4}" y1="${y + h + 1.7}" x2="${x + w + 2.4}" y2="${y + h + 1.7}" stroke="rgba(255,255,255,0.5)" stroke-width="0.5"/>
    <rect x="${x - 2}" y="${y + h + 3.1}" width="${w + 4}" height="1.3" fill="rgba(26,16,8,0.25)"/>
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

// ============================================================
// ISO MATERIAL KIT
// The tile grid is 2:1 (half-width 48, half-height 24), so every plane on a
// building is built from the two directions (2,1) and (2,-1) plus true
// vertical. Nothing is ever drawn at an arbitrary angle.
// Quads are always passed top-left first, going around the perimeter:
//        A --u-->  B
//        |         |
//        v         v
//        D <-----  C
// so A/B is the ridge (or wall-plate) and D/C the eave (or ground line).
// Triangular roof faces are passed as a degenerate quad with A === B (apex).
// Key light is upper-LEFT: every helper takes a lit colour and a shade colour.
// ============================================================
const _rr = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const _L2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const _Q = (A, B, C, D, u, v) => _L2(_L2(A, D, v), _L2(B, C, v), u);
const _f = (n) => Math.round(n * 10) / 10;
const _PT = (...p) => p.map(q => `${_f(q[0])},${_f(q[1])}`).join(' ');
const _len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const _hx = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const _mix = (a, b, t) => '#' + _hx(a).map((v, i) => Math.max(0, Math.min(255, Math.round(v + (_hx(b)[i] - v) * t))).toString(16).padStart(2, '0')).join('');
// Every stroke helper batches its segments into ONE path — a wall of 40 mortar
// joints is one element, not forty.
const _seg = (segs, col, w, extra = '') => segs.length
    ? `<path d="${segs.map(s => `M${_f(s[0][0])} ${_f(s[0][1])}L${_f(s[1][0])} ${_f(s[1][1])}`).join('')}" stroke="${col}" stroke-width="${w}" fill="none"${extra ? ' ' + extra : ''}/>`
    : '';
const _ln = (a, b, col, w, extra = '') => _seg([[a, b]], col, w, extra);
const _pg = (pts, fill, stroke, w) => `<polygon points="${_PT(...pts)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${w || 0.7}"` : ''}/>`;
const OUTLINE = '#2a1a0e';

// --- ROOFS -------------------------------------------------------------
// Overlapping courses of shingles/slates. Each course is offset half a tab
// from the one above and casts a shadow line onto the course below.
const SHINGLES = (A, B, C, D, rows, pitch, lit, shade, seed = 3) => {
    let s = _pg([A, B, C, D], shade);
    const tabs = [], butt = [], drop = [];
    for (let i = 0; i < rows; i++) {
        const t0 = i / rows, t1 = (i + 1) / rows;
        const p0 = _L2(A, D, t0), p1 = _L2(B, C, t0), p2 = _L2(B, C, t1), p3 = _L2(A, D, t1);
        s += _pg([p0, p1, p2, p3], _mix(lit, shade, 0.1 + t0 * 0.62));
        const n = Math.max(1, Math.round(_len(p3, p2) / pitch));
        for (let j = 1; j < n; j++) {
            const u = (j + (i % 2 ? 0.5 : 0)) / n;
            if (u <= 0.01 || u >= 0.99) continue;
            const b0 = _L2(p3, p2, u);
            tabs.push([b0, _L2(b0, _L2(p0, p1, u), 0.72 + _rr(i * 13.3 + j + seed) * 0.2)]);
        }
        butt.push([p3, p2]);                                        // lit edge of the course
        drop.push([[p3[0], p3[1] + 0.8], [p2[0], p2[1] + 0.8]]);     // shadow it throws below
    }
    return s + _seg(drop, _mix(shade, OUTLINE, 0.55), 0.9)
        + _seg(butt, _mix(lit, '#ffffff', 0.28), 0.55)
        + _seg(tabs, _mix(_mix(lit, shade, 0.5), OUTLINE, 0.5), 0.5);
};
// Thatch: fine strands running down the slope, ragged and dropping at the eave.
const THATCH = (A, B, C, D, strands, lit, shade, seed = 5) => {
    let s = _pg([A, B, C, D], _mix(shade, OUTLINE, 0.3));
    const bucket = ['', '', '', ''];
    for (let j = 0; j <= strands; j++) {
        const u = j / strands;
        const a = _L2(A, B, u), d = _L2(D, C, u);
        const r1 = _rr(j * 7.7 + seed), r2 = _rr(j * 3.1 + seed * 2);
        const tip = [d[0] + (r1 - 0.5) * 1.2, d[1] + (r1 - 0.5) * 0.6 + 2.4 * (0.35 + r2)];
        const m = _L2(a, tip, 0.55);
        bucket[Math.min(3, (r1 * 4) | 0)] += `M${_f(a[0])} ${_f(a[1])}Q${_f(m[0])} ${_f(m[1] - 0.7)} ${_f(tip[0])} ${_f(tip[1])}`;
    }
    bucket.forEach((d, i) => {
        if (d) s += `<path d="${d}" stroke="${_mix(shade, lit, 0.12 + i * 0.3)}" stroke-width="${0.65 + i * 0.15}" fill="none" stroke-linecap="round"/>`;
    });
    // hazel binding rods lashed across the slope
    s += _seg([0.34, 0.66].map(v => [_L2(A, D, v), _L2(B, C, v)]), _mix(shade, OUTLINE, 0.4), 1);
    s += _seg([0.34, 0.66].map(v => [[_L2(A, D, v)[0], _L2(A, D, v)[1] - 0.9], [_L2(B, C, v)[0], _L2(B, C, v)[1] - 0.9]]), _mix(lit, '#ffffff', 0.25), 0.45);
    return s;
};
// --- MASONRY -----------------------------------------------------------
// Irregular blocks laid in courses with real mortar joints between them.
const STONEWORK = (A, B, C, D, rows, blockLen, lit, shade, seed = 2) => {
    let s = _pg([A, B, C, D], _mix(shade, OUTLINE, 0.5));   // mortar bed showing through
    const hi = [], lo = [];
    for (let i = 0; i < rows; i++) {
        const v0 = i / rows + 0.012, v1 = (i + 1) / rows - 0.012;
        const off = (i % 2) ? 0.5 : 0;
        const n = Math.max(1, Math.round(_len(_L2(A, D, v0), _L2(B, C, v0)) / blockLen));
        for (let j = -1; j <= n; j++) {
            const u0 = Math.max(0.004, (j + off) / n + 0.014), u1 = Math.min(0.996, (j + 1 + off) / n - 0.014);
            if (u1 - u0 < 0.02) continue;
            const r = _rr(i * 31.7 + j * 5.3 + seed);
            const q0 = _Q(A, B, C, D, u0, v0), q1 = _Q(A, B, C, D, u1, v0);
            const q2 = _Q(A, B, C, D, u1, v1), q3 = _Q(A, B, C, D, u0, v1);
            s += _pg([q0, q1, q2, q3], _mix(_mix(shade, lit, 0.4 + r * 0.6), '#6f6255', r > 0.87 ? 0.35 : 0));
            hi.push([q0, q1]);
            lo.push([q3, q2]);
        }
    }
    return s + _seg(hi, _mix(lit, '#ffffff', 0.35), 0.4) + _seg(lo, _mix(shade, OUTLINE, 0.4), 0.4);
};
// Corner quoins: alternating big dressed blocks down a vertical arris.
const QUOINS = (px, py, h, s, n, lit, shade, dirX = 1) => {
    let out = '';
    const step = h / n;
    for (let i = 0; i < n; i++) {
        const w = ((i % 2) ? 4.5 : 6.5) * dirX, ty = py - i * step;
        out += _pg([[px, ty], [px + w, ty + w * s], [px + w, ty + w * s + step * 0.86], [px, ty + step * 0.86]],
            _mix(lit, shade, i % 2 ? 0.35 : 0.1), OUTLINE, 0.45);
    }
    return out;
};
// --- CARPENTRY ---------------------------------------------------------
// Individual boards with seams, a couple of knots and one warped plank.
const PLANKS = (A, B, C, D, n, lit, shade, seed = 1) => {
    let s = '';
    const seam = [], hi = [], grain = [], butt = [];
    let knots = '';
    for (let i = 0; i < n; i++) {
        const v0 = i / n, v1 = (i + 1) / n, r = _rr(i * 17.3 + seed), g = _rr(i * 9.1 + seed + 4);
        s += _pg([_L2(A, D, v0), _L2(B, C, v0), _L2(B, C, v1), _L2(A, D, v1)], _mix(lit, shade, 0.08 + r * 0.55));
        seam.push([_L2(A, D, v1), _L2(B, C, v1)]);
        hi.push([[_L2(A, D, v1)[0], _L2(A, D, v1)[1] - 0.7], [_L2(B, C, v1)[0], _L2(B, C, v1)[1] - 0.7]]);
        grain.push([_Q(A, B, C, D, 0.1 + g * 0.2, (v0 + v1) / 2), _Q(A, B, C, D, 0.4 + g * 0.3, (v0 + v1) / 2)]);
        if (r > 0.78) {
            const k = _Q(A, B, C, D, 0.2 + g * 0.55, (v0 + v1) / 2);
            knots += `<ellipse cx="${_f(k[0])}" cy="${_f(k[1])}" rx="1.1" ry="0.7" fill="${_mix(shade, OUTLINE, 0.5)}"/>`;
        }
        if (r > 0.55) butt.push([_Q(A, B, C, D, 0.3 + g * 0.4, v0), _Q(A, B, C, D, 0.3 + g * 0.4, v1)]);
    }
    return s + _seg(seam, _mix(shade, OUTLINE, 0.55), 0.55) + _seg(hi, _mix(lit, '#ffffff', 0.2), 0.35)
        + _seg(grain, _mix(shade, OUTLINE, 0.3), 0.35) + _seg(butt, _mix(shade, OUTLINE, 0.45), 0.4) + knots;
};
// Round log courses: each log carries a lit crown and a shadowed gap beneath,
// which is what makes a stack of bands read as cylinders.
const LOGS = (A, B, C, D, n, lit, shade, seed = 1) => {
    let s = _pg([A, B, C, D], _mix(shade, OUTLINE, 0.3));
    const crown = [], gap = [], grain = [];
    for (let i = 0; i < n; i++) {
        const v0 = i / n, v1 = (i + 1) / n, r = _rr(i * 7.1 + seed);
        s += _pg([_L2(A, D, v0), _L2(B, C, v0), _L2(B, C, v1), _L2(A, D, v1)], _mix(lit, shade, 0.12 + r * 0.42));
        crown.push([_L2(A, D, v0 + (v1 - v0) * 0.26), _L2(B, C, v0 + (v1 - v0) * 0.26)]);
        gap.push([_L2(A, D, v1), _L2(B, C, v1)]);
        grain.push([_Q(A, B, C, D, 0.15 + r * 0.25, (v0 + v1) / 2), _Q(A, B, C, D, 0.45 + r * 0.3, (v0 + v1) / 2)]);
    }
    return s + _seg(gap, _mix(shade, OUTLINE, 0.62), 1)
        + _seg(crown, _mix(lit, '#ffffff', 0.32), 0.9)
        + _seg(grain, _mix(shade, OUTLINE, 0.3), 0.35);
};
// Timber frame: pale daub infill behind dark exposed beams.
const HALFTIMBER = (A, B, C, D, bays, lit, shade, beam, beamDark) => {
    let s = _pg([A, B, C, D], lit);
    s += _pg([_L2(A, D, 0.55), _L2(B, C, 0.55), C, D], _mix(lit, shade, 0.5));
    const posts = [];
    for (let i = 1; i < bays; i++) posts.push([_L2(A, B, i / bays), _L2(D, C, i / bays)]);
    s += _seg(posts, beam, 1.6);
    // top plate, sill beam, corner posts, mid rail
    s += _seg([[A, B], [A, D], [_L2(A, D, 0.52), _L2(B, C, 0.52)]], beam, 2.1);
    s += _seg([[D, C], [B, C]], beamDark, 2);
    s += _seg([[[A[0], A[1] + 1.1], [B[0], B[1] + 1.1]]], _mix(beam, '#ffffff', 0.28), 0.5);
    // a pair of diagonal braces, both following the iso slope
    s += _seg([
        [_Q(A, B, C, D, 0.04, 0.52), _Q(A, B, C, D, 1 / bays - 0.02, 0.99)],
        [_Q(A, B, C, D, 0.96, 0.52), _Q(A, B, C, D, 1 - 1 / bays + 0.02, 0.99)]
    ], beamDark, 1.2);
    return s;
};
// --- ARCHITECTURAL DETAIL ---------------------------------------------
// Shadow the roof overhang throws onto the wall right under the eave.
const EAVE_SHADOW = (A, B, C, D, depth = 0.18) =>
    _pg([A, B, _L2(B, C, depth), _L2(A, D, depth)], 'rgba(26,16,8,0.30)');
// Damp staining and splash-back where the wall meets the ground.
const DAMP = (D, C, h = 4) =>
    _pg([[D[0], D[1] - h], [C[0], C[1] - h], C, D], 'rgba(48,40,26,0.22)');
// A 1px lighter rim along the upper-left silhouette.
const RIM = (a, b) => _ln(a, b, 'rgba(255,248,235,0.45)', 0.9);
// Stone base course under a timber wall.
const FOOTING = (D, C, h, lit, shade) => {
    const A = [D[0], D[1] - h], B = [C[0], C[1] - h];
    return STONEWORK(A, B, C, D, 2, 8, lit, shade, 9) + RIM(A, B);
};
// Recessed door in an iso wall face. (bx,by) sits on the ground line,
// s = +0.5 for a wall running down to the right, -0.5 for one running up.
// Doors are 15-18px tall so a 14px villager can walk through them.
const ISO_DOOR = (bx, by, s, w, h, o = {}) => {
    const wood = o.wood || '#7a4e24', dk = o.dark || '#3a2313', arch = o.arch === undefined ? 3.5 : o.arch;
    const hw = w / 2;
    const BL = [bx - hw, by - hw * s], BR = [bx + hw, by + hw * s];
    const TL = [BL[0], BL[1] - h], TR = [BR[0], BR[1] - h];
    const head =(pTL, pTR, a) => `Q ${((pTL[0] + pTR[0]) / 2).toFixed(2)} ${(((pTL[1] + pTR[1]) / 2) - a * 1.9).toFixed(2)} ${pTR[0].toFixed(2)} ${pTR[1].toFixed(2)}`;
    const face = (pBL, pTL, pTR, pBR, a) => `M ${pBL[0].toFixed(2)} ${pBL[1].toFixed(2)} L ${pTL[0].toFixed(2)} ${pTL[1].toFixed(2)} ${head(pTL, pTR, a)} L ${pBR[0].toFixed(2)} ${pBR[1].toFixed(2)} Z`;
    const gr = 1.7; // jamb / lintel reveal
    const oBL = [BL[0] - gr, BL[1] - gr * s], oBR = [BR[0] + gr, BR[1] + gr * s];
    const oTL = [oBL[0], oBL[1] - h - gr], oTR = [oBR[0], oBR[1] - h - gr];
    const iBL = [BL[0] + 1.4, BL[1] + 1.4 * s], iBR = [BR[0] - 1.4, BR[1] - 1.4 * s];
    const iTL = [iBL[0], iBL[1] - h + 1.4], iTR = [iBR[0], iBR[1] - h + 1.4];
    let out = '';
    // threshold stone, worn smooth
    out += _pg([[BL[0] - 2, BL[1] - 2 * s], [BR[0] + 2, BR[1] + 2 * s], [BR[0] + 2, BR[1] + 2 * s + 2.6], [BL[0] - 2, BL[1] - 2 * s + 2.6]], '#9aa3ab', OUTLINE, 0.5);
    out += _ln([BL[0] - 2, BL[1] - 2 * s], [BR[0] + 2, BR[1] + 2 * s], 'rgba(255,255,255,0.4)', 0.5);
    // jambs + lintel cut back into the wall
    out += `<path d="${face(oBL, oTL, oTR, oBR, arch + 1)}" fill="${dk}" stroke="${OUTLINE}" stroke-width="0.8"/>`;
    // the dark reveal itself
    out += `<path d="${face(BL, TL, TR, BR, arch)}" fill="#150c05"/>`;
    // door leaf, boarded and braced
    out += `<path d="${face(iBL, iTL, iTR, iBR, arch * 0.8)}" fill="${wood}"/>`;
    for (let i = 1; i < 4; i++) {
        const t = i / 4;
        out += _ln(_L2(iBL, iBR, t), _L2(iTL, iTR, t), _mix(wood, OUTLINE, 0.5), 0.55);
    }
    out += _ln(iBL, [iTR[0], iTR[1] + 1], _mix(wood, OUTLINE, 0.35), 1.1);
    // iron straps + ring handle
    for (const t of [0.26, 0.74]) {
        const a = _L2(iBL, iTL, t), b = _L2(iBR, iTR, t);
        out += _ln(a, b, '#3f434a', 1.3);
        out += _ln([a[0], a[1] - 0.5], [b[0], b[1] - 0.5], '#6b7280', 0.4);
    }
    out += `<circle cx="${(bx + hw * 0.45).toFixed(2)}" cy="${(by + hw * 0.45 * s - h * 0.42).toFixed(2)}" r="1.1" fill="none" stroke="#f4c44d" stroke-width="0.7"/>`;
    // light catching the top-left of the reveal
    out += _ln(oTL, [oTL[0] + w * 0.5, oTL[1] + w * 0.5 * s], 'rgba(255,246,225,0.55)', 0.7);
    out += _ln(oBL, oTL, 'rgba(255,246,225,0.35)', 0.6);
    return out;
};
// Recessed window in an iso wall face: reveal, sill, glazing bars, shutter.
const ISO_WIN = (cx, cy, s, w, h, o = {}) => {
    const hw = w / 2, lit = o.lit !== false;
    const BL = [cx - hw, cy - hw * s], BR = [cx + hw, cy + hw * s];
    const TL = [BL[0], BL[1] - h], TR = [BR[0], BR[1] - h];
    const g = 1.3;
    const oBL = [BL[0] - g, BL[1] - g * s], oBR = [BR[0] + g, BR[1] + g * s];
    const oTL = [oBL[0], oBL[1] - h - g], oTR = [oBR[0], oBR[1] - h - g];
    let out = '';
    if (lit) out += `<ellipse cx="${cx.toFixed(2)}" cy="${(cy - h / 2).toFixed(2)}" rx="${(w * 1.5).toFixed(2)}" ry="${(h * 1.3).toFixed(2)}" fill="#ffca5f" opacity="0.12"/>`;
    out += _pg([oTL, oTR, oBR, oBL], '#2a1a0e');
    out += lit
        ? `<polygon points="${_PT(TL, TR, BR, BL)}" fill="#ffd773"><animate attributeName="fill" values="#ffd773;#ffc247;#ffd773" dur="${(3 + _rr(cx + cy) * 1.6).toFixed(2)}s" repeatCount="indefinite"/></polygon>`
        : _pg([TL, TR, BR, BL], '#1d2430');
    if (lit) out += _pg([TL, TR, _L2(TR, BR, 0.45), _L2(TL, BL, 0.45)], 'rgba(255,255,255,0.34)');
    // glazing bars
    out += _ln(_L2(TL, TR, 0.5), _L2(BL, BR, 0.5), '#2a1a0e', 0.55);
    out += _ln(_L2(TL, BL, 0.5), _L2(TR, BR, 0.5), '#2a1a0e', 0.55);
    // projecting sill, and the shadow it drops on the wall
    const sBL = [BL[0] - 2, BL[1] - 2 * s + 0.6], sBR = [BR[0] + 2, BR[1] + 2 * s + 0.6];
    out += _pg([[sBL[0], sBL[1] - 1.4], [sBR[0], sBR[1] - 1.4], [sBR[0], sBR[1] + 1.4], [sBL[0], sBL[1] + 1.4]], '#b6bec5', OUTLINE, 0.5);
    out += _ln([sBL[0], sBL[1] - 1.4], [sBR[0], sBR[1] - 1.4], 'rgba(255,255,255,0.5)', 0.5);
    out += _ln([sBL[0], sBL[1] + 1.6], [sBR[0], sBR[1] + 1.6], 'rgba(26,16,8,0.28)', 1.4);
    // reveal highlight, upper-left
    out += _ln(oTL, oTR, 'rgba(255,246,225,0.5)', 0.6);
    out += _ln(oBL, oTL, 'rgba(255,246,225,0.3)', 0.5);
    if (o.shutter) {
        const sw = w * 0.42;
        out += _pg([[oTL[0] - sw, oTL[1] - sw * s], oTL, [oBL[0], oBL[1] + 0.4], [oBL[0] - sw, oBL[1] - sw * s + 0.4]], '#2c5aa0', OUTLINE, 0.6);
        out += _ln([oTL[0] - sw * 0.5, oTL[1] - sw * 0.5 * s], [oBL[0] - sw * 0.5, oBL[1] - sw * 0.5 * s], '#1d3c6e', 0.5);
    }
    return out;
};
// Moss / weeds catching in a valley or at a footing.
const MOSS = (px, py, n = 3, seed = 1, col = '#5a7f3e') => {
    let out = '';
    for (let i = 0; i < n; i++) {
        const r = _rr(i * 5.7 + seed), dx = (r - 0.5) * 7, dy = (_rr(i * 3.3 + seed) - 0.5) * 2.2;
        out += `<path d="M ${(px + dx).toFixed(2)} ${(py + dy).toFixed(2)} q ${(0.6 + r).toFixed(2)} -2.6 ${(2 + r).toFixed(2)} -3.4" stroke="${_mix(col, '#8fbf5e', r)}" stroke-width="${(0.7 + r * 0.5).toFixed(2)}" fill="none" stroke-linecap="round"/>`;
    }
    return out;
};
// Trodden earth in front of a doorway.
const WORN_PATH = (px, py, rx = 11) =>
    `<ellipse cx="${px}" cy="${py}" rx="${rx}" ry="${(rx * 0.42).toFixed(2)}" fill="#8a7550" opacity="0.32"/>` +
    `<ellipse cx="${px}" cy="${py}" rx="${(rx * 0.6).toFixed(2)}" ry="${(rx * 0.26).toFixed(2)}" fill="#9c8560" opacity="0.3"/>`;

const BUILDING_RENDERERS = {
    townhall: (x, y, lvl) => `
        ${SHADOW(x, y, 46)}
        ${WORN_PATH(x - 16, y + 20, 14)}
        <!-- dressed stone plinth: paved top, two coursed faces, 7px high -->
        <polygon points="${x-42},${y-8} ${x},${y-29} ${x+42},${y-8} ${x},${y+13}" fill="#aeb6bf" stroke="#2a1a0e" stroke-width="0.9"/>
        ${_seg([0.25, 0.5, 0.75].map(t => [[x - 42 + 42 * t, y - 8 - 21 * t], [x + 42 * t, y + 13 - 21 * t]]), '#98a1aa', 0.5)}
        ${_seg([0.3, 0.62].map(t => [[x - 42 + 42 * t, y - 8 + 21 * t], [x + 42 * t, y - 29 + 21 * t]]), '#98a1aa', 0.5)}
        ${STONEWORK([x - 42, y - 8], [x, y + 13], [x, y + 20], [x - 42, y - 1], 1, 12, '#b9c1c9', '#828c97', 11)}
        ${STONEWORK([x, y + 13], [x + 42, y - 8], [x + 42, y - 1], [x, y + 20], 1, 12, '#828c97', '#565f6c', 17)}
        ${RIM([x - 42, y - 8], [x, y + 13])}
        ${DAMP([x - 42, y - 1], [x, y + 20], 3)}
        ${MOSS(x - 33, y + 5, 3, 4)}
        ${MOSS(x + 26, y + 5, 2, 9)}
        <!-- great hall: exposed frame over daub, on its own stone footing -->
        <polygon points="${x-32},${y-37} ${x},${y-53} ${x+32},${y-37} ${x},${y-21}" fill="#c4b69d" stroke="#2a1a0e" stroke-width="0.9"/>
        ${HALFTIMBER([x - 32, y - 37], [x, y - 21], [x, y + 7], [x - 32, y - 9], 4, '#f7efe0', '#e2d4ba', '#7a5228', '#5c3d1a')}
        ${HALFTIMBER([x, y - 21], [x + 32, y - 37], [x + 32, y - 9], [x, y + 7], 4, '#dccdb1', '#bcab8b', '#5c3d1a', '#432b12')}
        ${FOOTING([x - 32, y - 9], [x, y + 7], 6, '#c2cad2', '#8b95a0')}
        ${FOOTING([x, y + 7], [x + 32, y - 9], 6, '#959ea8', '#616a76')}
        ${QUOINS(x, y + 7, 28, 0.5, 7, '#efe7d4', '#c0b195', -1)}
        ${QUOINS(x, y + 7, 28, -0.5, 7, '#cec19f', '#9a8c6f', 1)}
        ${RIM([x - 32, y - 37], [x, y - 21])}
        <!-- recessed, silled windows; one shuttered -->
        ${ISO_WIN(x - 24, y - 13, 0.5, 8, 9, { shutter: true })}
        ${ISO_WIN(x + 9.6, y - 6, -0.5, 8, 9, {})}
        <!-- kingdom crest hung on the shaded face, clear of the eave -->
        <path d="M ${x + 17} ${y - 23} l 5 -2.5 l 5 2.5 l 0 5.5 q 0 4.2 -5 6.2 q -5 -2 -5 -6.2 Z" fill="#2c5aa0" stroke="#f4c44d" stroke-width="0.9"/>
        <path d="M ${x + 22} ${y - 22.8} l 1 2.4 2.6 0.3 -1.9 1.8 0.5 2.6 -2.2 -1.3 -2.2 1.3 0.5 -2.6 -1.9 -1.8 2.6 -0.3 Z" fill="#f4c44d"/>
        <!-- great arched door, 17px tall: a 14px villager walks straight in -->
        ${ISO_DOOR(x - 12, y + 1, 0.5, 14, 16, { wood: '#7a4e24', arch: 3.5 })}
        <!-- shadow the overhanging eave drops on the wall beneath it -->
        ${EAVE_SHADOW([x - 32, y - 37], [x, y - 21], [x, y + 7], [x - 32, y - 9], 0.13)}
        ${EAVE_SHADOW([x, y - 21], [x + 32, y - 37], [x + 32, y - 9], [x, y + 7], 0.13)}
        <!-- gilded tile roof, eight courses a plane, overhanging the wall by 4px -->
        ${SHINGLES([x, y - 62], [x, y - 62], [x, y - 16], [x - 36, y - 34], 8, 7.5, '#ffe08a', '#c08d28', 21)}
        ${SHINGLES([x, y - 62], [x, y - 62], [x + 36, y - 34], [x, y - 16], 8, 7.5, '#cfa03a', '#8a641a', 33)}
        <!-- a replacement tile in a paler batch, and a mossy patch -->
        ${_pg([[x - 21, y - 37], [x - 15, y - 34], [x - 16, y - 30], [x - 22, y - 33]], '#f2dc9c', '#b8902f', 0.4)}
        ${MOSS(x - 27, y - 30, 2, 12, '#75903f')}
        ${MOSS(x + 8, y - 19, 2, 3, '#6f8a3e')}
        <!-- fascia boards along both eaves -->
        ${_pg([[x - 36, y - 34], [x, y - 16], [x, y - 13.4], [x - 36, y - 31.4]], '#8a5a2b', OUTLINE, 0.7)}
        ${_pg([[x, y - 16], [x + 36, y - 34], [x + 36, y - 31.4], [x, y - 13.4]], '#573a19', OUTLINE, 0.7)}
        ${_ln([x - 36, y - 34], [x, y - 16], 'rgba(255,240,205,0.5)', 0.6)}
        <!-- lead hip rolls down all three visible arrises -->
        ${_ln([x, y - 62], [x, y - 16], '#ffeaa8', 1.7)}
        ${_seg([[[x, y - 62], [x - 36, y - 34]], [[x, y - 62], [x + 36, y - 34]]], '#c99a2b', 1.4)}
        ${_ln([x - 0.9, y - 60], [x - 0.9, y - 18], 'rgba(255,255,255,0.4)', 0.5)}
        <!-- finial + royal banner -->
        <circle cx="${x}" cy="${y - 63.5}" r="2.2" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.7"/>
        ${FLAG(x, y - 60)}
        ${lvl >= 4 ? `
            <!-- gilded eave trim, and a shingled porch canopy over the door -->
            ${_ln([x - 36, y - 34], [x, y - 16], '#f4c44d', 1.6)}
            ${_ln([x, y - 16], [x + 36, y - 34], '#c2912c', 1.6)}
            <!-- a flight of dressed stone steps down off the plinth -->
            ${[0, 1, 2].map(i => `
                ${_pg([[x - 21 - 3 * i, y + 0.5 + 3.9 * i], [x - 7 - 3 * i, y + 7.5 + 3.9 * i], [x - 10 - 3 * i, y + 9 + 3.9 * i], [x - 24 - 3 * i, y + 2 + 3.9 * i]], '#c2cad2', OUTLINE, 0.5)}
                ${_pg([[x - 24 - 3 * i, y + 2 + 3.9 * i], [x - 10 - 3 * i, y + 9 + 3.9 * i], [x - 10 - 3 * i, y + 11.4 + 3.9 * i], [x - 24 - 3 * i, y + 4.4 + 3.9 * i]], '#8b95a0', OUTLINE, 0.5)}
                ${_ln([x - 24 - 3 * i, y + 2 + 3.9 * i], [x - 10 - 3 * i, y + 9 + 3.9 * i], 'rgba(255,255,255,0.45)', 0.5)}
            `).join('')}
            <!-- iron lantern bracket beside the door -->
            ${_seg([[[x - 3, y - 9], [x - 6.5, y - 10.6]], [[x - 6.5, y - 10.6], [x - 6.5, y - 8]]], '#3f434a', 0.9)}
            <path d="M ${x - 8.4} ${y - 8} l 3.8 0 l 0.8 4.6 l -5.4 0 Z" fill="#2a1a0e"/>
            <rect x="${x - 7.6}" y="${y - 7.4}" width="2.6" height="3.4" fill="#ffd773">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
            </rect>
        ` : ''}
        ${lvl >= 7 ? `
            <!-- flanking stone turrets, coursed and shingled like the hall -->
            ${[[-38, 1], [38, -1]].map(([dx, sd]) => `
                ${STONEWORK([x + dx - 6, y - 15], [x + dx, y - 12], [x + dx, y + 9], [x + dx - 6, y + 6], 3, 6, sd > 0 ? '#c2cad2' : '#a2abb5', '#77818d', 41 + dx)}
                ${STONEWORK([x + dx, y - 12], [x + dx + 6, y - 15], [x + dx + 6, y + 6], [x + dx, y + 9], 3, 6, sd > 0 ? '#8b95a0' : '#79838f', '#4f5865', 53 + dx)}
                ${_pg([[x + dx - 6, y - 15], [x + dx, y - 18], [x + dx + 6, y - 15], [x + dx, y - 12]], '#9aa3ab', OUTLINE, 0.7)}
                ${SHINGLES([x + dx, y - 36], [x + dx, y - 36], [x + dx, y - 13], [x + dx - 8, y - 17], 5, 5.5, '#ffe08a', '#c08d28', 61)}
                ${SHINGLES([x + dx, y - 36], [x + dx, y - 36], [x + dx + 8, y - 17], [x + dx, y - 13], 5, 5.5, '#cfa03a', '#8a641a', 67)}
                ${_ln([x + dx, y - 36], [x + dx, y - 13], '#ffeaa8', 1.4)}
                <circle cx="${x + dx}" cy="${y - 37}" r="1.6" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
                ${ISO_WIN(x + dx - 3, y + 1, 0.5, 4.5, 6, {})}
            `).join('')}
            <g class="sparkle-fx">
                <polygon points="${x-12},${y-52} ${x-10.5},${y-48.5} ${x-12},${y-45} ${x-13.5},${y-48.5}" fill="#fff3c4"/>
                <polygon points="${x+13},${y-44} ${x+14.5},${y-41} ${x+13},${y-38} ${x+11.5},${y-41}" fill="#fff3c4" style="animation-delay:.6s"/>
            </g>
        ` : ''}
    `,

    goldmine: (x, y, lvl) => `
        ${SHADOW(x, y, 40)}
        <!-- CRAGGY ROCK FACE. Was five flat polygons — the flattest surface left
             in the village. Now built like real stone: broad facet planes, then
             bedding strata following each plane's dip, fracture lines cutting
             across them, chipped scree at the foot, and lichen where damp
             collects. Light from upper-left throughout. -->
        <path d="M ${x-38} ${y+4} L ${x-28} ${y-20} L ${x-10} ${y-36} L ${x+8} ${y-38} L ${x+26} ${y-26} L ${x+38} ${y+4} L ${x+18} ${y+17} L ${x-18} ${y+17} Z" fill="#857b6e" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-28} ${y-20} L ${x-10} ${y-36} L ${x+8} ${y-38} L ${x-2} ${y-14} Z" fill="#a89d8b"/>
        <path d="M ${x-38} ${y+4} L ${x-28} ${y-20} L ${x-2} ${y-14} L ${x-18} ${y+10} Z" fill="#958b7b"/>
        <path d="M ${x+8} ${y-38} L ${x+26} ${y-26} L ${x+38} ${y+4} L ${x+14} ${y-6} Z" fill="#6a6156"/>
        <path d="M ${x+14} ${y-6} L ${x+38} ${y+4} L ${x+18} ${y+17} Z" fill="#5d554b"/>
        <!-- extra facets break the big planes into crags -->
        <path d="M ${x-10} ${y-36} L ${x-2} ${y-14} L ${x-14} ${y-18} Z" fill="#b3a794" opacity="0.7"/>
        <path d="M ${x+26} ${y-26} L ${x+38} ${y+4} L ${x+27} ${y-2} Z" fill="#595147" opacity="0.75"/>
        <path d="M ${x+8} ${y-38} L ${x+14} ${y-6} L ${x+3} ${y-20} Z" fill="#7d7367" opacity="0.75"/>
        <path d="M ${x-38} ${y+4} L ${x-18} ${y+10} L ${x-18} ${y+17} Z" fill="#6f665b" opacity="0.8"/>
        <!-- bedding strata: parallel bands dipping with each face -->
        ${[0,1,2,3,4].map(i => {
            const t = 0.18 + i * 0.17;
            return `<path d="M ${x-36+8*t} ${y+2-24*t} q 10 ${-2-2*i} 20 ${-1-i}" stroke="#6d6459" stroke-width="0.5" fill="none" opacity="${(0.5-i*0.06).toFixed(2)}"/>
                    <path d="M ${x+12+6*t} ${y-6-20*t} q 9 ${2+i} 17 ${1+i}" stroke="#4e463c" stroke-width="0.5" fill="none" opacity="${(0.5-i*0.06).toFixed(2)}"/>`;
        }).join('')}
        <!-- fracture lines cutting across the bedding -->
        <path d="M ${x-24} ${y-18} l 5 9 l -3 7" stroke="#5d554b" stroke-width="0.6" fill="none" opacity="0.7"/>
        <path d="M ${x+4} ${y-32} l -4 8 l 3 6" stroke="#5d554b" stroke-width="0.55" fill="none" opacity="0.6"/>
        <path d="M ${x+22} ${y-20} l 4 10" stroke="#443d34" stroke-width="0.55" fill="none" opacity="0.65"/>
        <!-- rim light along the sunlit ridges -->
        <line x1="${x-28}" y1="${y-20}" x2="${x-10}" y2="${y-36}" stroke="rgba(255,255,255,0.42)" stroke-width="0.9"/>
        <line x1="${x-10}" y1="${y-36}" x2="${x+8}" y2="${y-38}" stroke="rgba(255,255,255,0.34)" stroke-width="0.9"/>
        <line x1="${x-38}" y1="${y+4}" x2="${x-28}" y2="${y-20}" stroke="rgba(255,255,255,0.22)" stroke-width="0.7"/>
        <!-- lichen where damp collects on the shaded side -->
        <ellipse cx="${x+20}" cy="${y-13}" rx="4.5" ry="2.4" fill="#5e7a34" opacity="0.3"/>
        <ellipse cx="${x-30}" cy="${y-6}" rx="3.2" ry="1.8" fill="#6b8a3c" opacity="0.26"/>
        <!-- scree: chipped rock fallen to the foot -->
        ${[[-32,13,2.6],[-25,15,1.9],[30,12,2.3],[34,15,1.6],[-9,16,1.7],[9,16.5,2.0]].map(([dx,dy,r], i) =>
            `<path d="M ${x+dx} ${y+dy} l ${r} ${-r*0.7} l ${r*0.9} ${r*0.5} l ${-r*0.6} ${r*0.8} Z" fill="${i%2?'#7d7367':'#6a6156'}" stroke="#3a342c" stroke-width="0.35"/>`).join('')}
        <!-- gold veins glinting in the rock -->
        <path d="M ${x-20} ${y-13} q 4 -3 3 -8 q 4 1 6 -5" stroke="#f4c44d" stroke-width="1.1" fill="none" opacity="0.9"/>
        <path d="M ${x+15} ${y-16} q 3 4 8 4" stroke="#d9a94a" stroke-width="1" fill="none" opacity="0.8"/>
        <path d="M ${x-30} ${y-2} q 3 -4 7 -3" stroke="#d9a94a" stroke-width="0.8" fill="none" opacity="0.7"/>
        <circle cx="${x-11}" cy="${y-26}" r="1.1" fill="#ffd76b"/>
        <circle cx="${x+19}" cy="${y-22}" r="0.8" fill="#ffd76b" opacity="0.85"/>
        <!-- timber portal frame -->
        <rect x="${x-17}" y="${y-16}" width="4" height="21" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="${x+13}" y="${y-16}" width="4" height="21" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="${x-20}" y="${y-20}" width="40" height="5" rx="1" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="${x-20}" y="${y-20}" width="40" height="1.6" fill="#a8763f"/>
        <!-- cave mouth with warm glow -->
        <path d="M ${x-13} ${y+5} L ${x-13} ${y-8} Q ${x} ${y-18} ${x+13} ${y-8} L ${x+13} ${y+5} Z" fill="#160c06" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M ${x-8} ${y+5} L ${x-8} ${y-5} Q ${x} ${y-11} ${x+8} ${y-5} L ${x+8} ${y+5} Z" fill="#3a2008">
            <animate attributeName="fill" values="#3a2008;#5c3810;#3a2008" dur="2.6s" repeatCount="indefinite"/>
        </path>
        <ellipse cx="${x}" cy="${y+1}" rx="4" ry="3" fill="#f4c44d" opacity="0.25">
            <animate attributeName="opacity" values="0.12;0.4;0.12" dur="2.6s" repeatCount="indefinite"/>
        </ellipse>
        <!-- lantern on the lintel -->
        <line x1="${x+9.5}" y1="${y-15}" x2="${x+9.5}" y2="${y-12}" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="${x+7.9}" y="${y-12}" width="3.2" height="4.2" rx="1" fill="#2a1a0e"/>
        <rect x="${x+8.6}" y="${y-11.3}" width="1.8" height="2.8" fill="#ffd773">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="1.8s" repeatCount="indefinite"/>
        </rect>
        <!-- rails out of the mine -->
        <line x1="${x-4}" y1="${y+5}" x2="${x+24}" y2="${y+15}" stroke="#6b7280" stroke-width="1.2"/>
        <line x1="${x+2}" y1="${y+3}" x2="${x+30}" y2="${y+13}" stroke="#6b7280" stroke-width="1.2"/>
        ${[1, 8, 15, 22].map(d => `<line x1="${x + d - 3}" y1="${y + 5.5 + d * 0.36}" x2="${x + d + 4}" y2="${y + 3.5 + d * 0.36}" stroke="#6b4520" stroke-width="1.5"/>`).join('')}
        <!-- ore cart heaped with gold -->
        <polygon points="${x+14},${y+1} ${x+30},${y+1} ${x+28},${y+9} ${x+16},${y+9}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x+14},${y+1} ${x+30},${y+1} ${x+29.4},${y+3.5} ${x+14.6},${y+3.5}" fill="#8a5a2b"/>
        <line x1="${x+19}" y1="${y+3.5}" x2="${x+19.4}" y2="${y+9}" stroke="#4a2e16" stroke-width="0.5"/>
        <line x1="${x+25}" y1="${y+3.5}" x2="${x+25.2}" y2="${y+9}" stroke="#4a2e16" stroke-width="0.5"/>
        <circle cx="${x+19}" cy="${y+0.2}" r="2.1" fill="#f4c44d" stroke="#c2912c" stroke-width="0.4"/>
        <circle cx="${x+24}" cy="${y-0.8}" r="2.3" fill="#ffd76b" stroke="#c2912c" stroke-width="0.4"/>
        <circle cx="${x+28}" cy="${y+0.4}" r="1.8" fill="#f4c44d" stroke="#c2912c" stroke-width="0.4"/>
        <circle cx="${x+18.5}" cy="${y+10.8}" r="2.2" fill="#3a3328" stroke="#2a1a0e" stroke-width="0.5"/>
        <circle cx="${x+26}" cy="${y+10.8}" r="2.2" fill="#3a3328" stroke="#2a1a0e" stroke-width="0.5"/>
        <circle cx="${x+18.5}" cy="${y+10.8}" r="0.8" fill="#8a8478"/>
        <circle cx="${x+26}" cy="${y+10.8}" r="0.8" fill="#8a8478"/>
        <!-- gold pile by the entrance -->
        <ellipse cx="${x-26}" cy="${y+9}" rx="7.5" ry="2.6" fill="#c2912c" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="${x-28.5}" cy="${y+6.5}" r="2.5" fill="#f4c44d" stroke="#c2912c" stroke-width="0.4"/>
        <circle cx="${x-23.5}" cy="${y+7}" r="2.2" fill="#ffd76b" stroke="#c2912c" stroke-width="0.4"/>
        <circle cx="${x-26}" cy="${y+4.4}" r="2" fill="#f4c44d" stroke="#c2912c" stroke-width="0.4"/>
        <g class="sparkle-fx">
            <polygon points="${x-26},${y+0.5} ${x-25},${y+2.8} ${x-26},${y+5} ${x-27},${y+2.8}" fill="#fff3c4"/>
            <polygon points="${x+24},${y-4.5} ${x+25},${y-2.5} ${x+24},${y-0.5} ${x+23},${y-2.5}" fill="#fff3c4" style="animation-delay:.5s"/>
            <polygon points="${x-13},${y-28} ${x-12},${y-26} ${x-13},${y-24} ${x-14},${y-26}" fill="#ffe9a3" style="animation-delay:1s"/>
        </g>
        ${lvl >= 4 ? `
            <line x1="${x-7}" y1="${y-20}" x2="${x-3}" y2="${y-29}" stroke="#6b4520" stroke-width="1.5"/>
            <line x1="${x+7}" y1="${y-20}" x2="${x+3}" y2="${y-29}" stroke="#54371a" stroke-width="1.5"/>
            <circle cx="${x}" cy="${y-29}" r="2.7" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.7"/>
            <line x1="${x}" y1="${y-29}" x2="${x}" y2="${y-16}" stroke="#4a4438" stroke-width="0.6"/>
            <rect x="${x-2}" y="${y-16}" width="4" height="3" fill="#c2912c" stroke="#2a1a0e" stroke-width="0.4"/>
        ` : ''}
        ${lvl >= 7 ? `
            <path d="M ${x-4} ${y-30} q 5 -2 6 -7" stroke="#ffd76b" stroke-width="1.5" fill="none">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
            </path>
            <polygon points="${x-3},${y-38} ${x+9},${y-37} ${x+3},${y-46}" fill="#f4c44d" stroke="#c2912c" stroke-width="0.7"/>
            <polygon points="${x-3},${y-38} ${x+3},${y-46} ${x+1},${y-39}" fill="#ffe9a3"/>
        ` : ''}
    `,

    ironmine: (x, y, lvl) => `
        ${SHADOW(x, y, 40)}
        <!-- faceted cold-rock hill -->
        <path d="M ${x-38} ${y+4} L ${x-26} ${y-22} L ${x-8} ${y-38} L ${x+10} ${y-38} L ${x+27} ${y-24} L ${x+38} ${y+4} L ${x+18} ${y+17} L ${x-18} ${y+17} Z" fill="#79808c" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-26} ${y-22} L ${x-8} ${y-38} L ${x+10} ${y-38} L ${x} ${y-14} Z" fill="#98a0ac"/>
        <path d="M ${x-38} ${y+4} L ${x-26} ${y-22} L ${x} ${y-14} L ${x-17} ${y+10} Z" fill="#868d99"/>
        <path d="M ${x+10} ${y-38} L ${x+27} ${y-24} L ${x+38} ${y+4} L ${x+15} ${y-6} Z" fill="#5c6370"/>
        <path d="M ${x+15} ${y-6} L ${x+38} ${y+4} L ${x+18} ${y+17} Z" fill="#4f5663"/>
        <line x1="${x-26}" y1="${y-22}" x2="${x-8}" y2="${y-38}" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
        <!-- snow dusting on the peak -->
        <polygon points="${x-8},${y-38} ${x+10},${y-38} ${x+5},${y-31} ${x-3},${y-32}" fill="#e8edf2" stroke="#aab4be" stroke-width="0.4"/>
        <!-- iron ore seams -->
        <path d="M ${x-19} ${y-11} q 4 -4 2 -9 q 5 0 6 -5" stroke="#c3ccd6" stroke-width="1.1" fill="none" opacity="0.85"/>
        <circle cx="${x+18}" cy="${y-14}" r="1.4" fill="#c3ccd6"/>
        <circle cx="${x+22}" cy="${y-10}" r="1" fill="#aab4be"/>
        <!-- timber portal frame -->
        <rect x="${x-17}" y="${y-16}" width="4" height="21" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="${x+13}" y="${y-16}" width="4" height="21" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.7"/>
        <rect x="${x-20}" y="${y-20}" width="40" height="5" rx="1" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.8"/>
        <rect x="${x-20}" y="${y-20}" width="40" height="1.6" fill="#a8763f"/>
        <!-- cave mouth, cool depths -->
        <path d="M ${x-13} ${y+5} L ${x-13} ${y-8} Q ${x} ${y-18} ${x+13} ${y-8} L ${x+13} ${y+5} Z" fill="#0c1016" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M ${x-8} ${y+5} L ${x-8} ${y-5} Q ${x} ${y-11} ${x+8} ${y-5} L ${x+8} ${y+5} Z" fill="#1b2530">
            <animate attributeName="fill" values="#1b2530;#2c3c4e;#1b2530" dur="3s" repeatCount="indefinite"/>
        </path>
        <!-- hanging lantern -->
        <line x1="${x-9.5}" y1="${y-15}" x2="${x-9.5}" y2="${y-12}" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="${x-11.1}" y="${y-12}" width="3.2" height="4.2" rx="1" fill="#2a1a0e"/>
        <rect x="${x-10.4}" y="${y-11.3}" width="1.8" height="2.8" fill="#ffd773">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="2.1s" repeatCount="indefinite"/>
        </rect>
        <!-- rails + cart of iron ingots -->
        <line x1="${x-4}" y1="${y+5}" x2="${x+24}" y2="${y+15}" stroke="#6b7280" stroke-width="1.2"/>
        <line x1="${x+2}" y1="${y+3}" x2="${x+30}" y2="${y+13}" stroke="#6b7280" stroke-width="1.2"/>
        ${[1, 8, 15, 22].map(d => `<line x1="${x + d - 3}" y1="${y + 5.5 + d * 0.36}" x2="${x + d + 4}" y2="${y + 3.5 + d * 0.36}" stroke="#6b4520" stroke-width="1.5"/>`).join('')}
        <polygon points="${x+14},${y+1} ${x+30},${y+1} ${x+28},${y+9} ${x+16},${y+9}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x+14},${y+1} ${x+30},${y+1} ${x+29.4},${y+3.5} ${x+14.6},${y+3.5}" fill="#8a5a2b"/>
        <polygon points="${x+16},${y+0.5} ${x+22},${y-1} ${x+28},${y+0.5} ${x+22},${y+2}" fill="#aeb8c4" stroke="#4f5663" stroke-width="0.5"/>
        <polygon points="${x+18},${y-1.5} ${x+22},${y-3} ${x+26},${y-1.5} ${x+22},${y-0.2}" fill="#cbd5e1" stroke="#4f5663" stroke-width="0.5"/>
        <circle cx="${x+18.5}" cy="${y+10.8}" r="2.2" fill="#3a3328" stroke="#2a1a0e" stroke-width="0.5"/>
        <circle cx="${x+26}" cy="${y+10.8}" r="2.2" fill="#3a3328" stroke="#2a1a0e" stroke-width="0.5"/>
        <circle cx="${x+18.5}" cy="${y+10.8}" r="0.8" fill="#8a8478"/>
        <circle cx="${x+26}" cy="${y+10.8}" r="0.8" fill="#8a8478"/>
        <!-- anvil + leaning pickaxe out front -->
        <polygon points="${x-33},${y+6} ${x-19},${y+6} ${x-21},${y+9} ${x-31},${y+9}" fill="#4f5663" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="${x-29}" y="${y+2.5}" width="6" height="4" fill="#6b7280" stroke="#2a1a0e" stroke-width="0.6"/>
        <path d="M ${x-30} ${y+2.5} L ${x-19} ${y+2.5} Q ${x-16.5} ${y+3.5} ${x-19} ${y+4.8} L ${x-30} ${y+4.8} Q ${x-32.5} ${y+3.5} ${x-30} ${y+2.5} Z" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.6"/>
        <line x1="${x-30}" y1="${y+3}" x2="${x-20}" y2="${y+3}" stroke="rgba(255,255,255,0.4)" stroke-width="0.6"/>
        <line x1="${x-36}" y1="${y+2}" x2="${x-28}" y2="${y-14}" stroke="#8a5a2b" stroke-width="1.8"/>
        <path d="M ${x-32} ${y-14.5} q 4.5 -4 9 0" stroke="#aeb8c4" stroke-width="2.2" fill="none"/>
        <!-- clinking sparks -->
        <g class="sparkle-fx">
            <polygon points="${x-25},${y-2} ${x-24.2},${y-0.2} ${x-25},${y+1.6} ${x-25.8},${y-0.2}" fill="#dfe7ee"/>
            <polygon points="${x+3},${y-24} ${x+4},${y-22} ${x+3},${y-20} ${x+2},${y-22}" fill="#dfe7ee" style="animation-delay:.7s"/>
        </g>
        ${lvl >= 4 ? `
            <line x1="${x-7}" y1="${y-20}" x2="${x-3}" y2="${y-29}" stroke="#6b4520" stroke-width="1.5"/>
            <line x1="${x+7}" y1="${y-20}" x2="${x+3}" y2="${y-29}" stroke="#54371a" stroke-width="1.5"/>
            <circle cx="${x}" cy="${y-29}" r="2.7" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.7"/>
            <line x1="${x}" y1="${y-29}" x2="${x}" y2="${y-16}" stroke="#4a4438" stroke-width="0.6"/>
            <rect x="${x-2}" y="${y-16}" width="4" height="3" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.4"/>
        ` : ''}
        ${lvl >= 7 ? `
            <path d="M ${x-4} ${y-28} q 5 -2 6 -7" stroke="#cbd5e1" stroke-width="1.5" fill="none">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="2.2s" repeatCount="indefinite"/>
            </path>
            <polygon points="${x-2},${y-42} ${x+2},${y-48} ${x+6},${y-42} ${x+2},${y-39}" fill="#cbd5e1" stroke="#4f5663" stroke-width="0.6"/>
            <polygon points="${x-2},${y-42} ${x+2},${y-48} ${x+2},${y-42}" fill="#eef2f6"/>
        ` : ''}
    `,

    lumbermill: (x, y, lvl) => `
        ${SHADOW(x, y, 42)}
        ${WORN_PATH(x - 17, y + 13, 12)}
        <!-- log cabin: round courses on a stone footing -->
        ${_pg([[x - 30, y - 32], [x, y - 47], [x + 30, y - 32], [x, y - 17]], '#7a5228', OUTLINE, 0.9)}
        ${LOGS([x - 30, y - 32], [x, y - 17], [x, y + 8], [x - 30, y - 7], 6, '#b07a3c', '#7c4f22', 6)}
        ${LOGS([x, y - 17], [x + 30, y - 32], [x + 30, y - 7], [x, y + 8], 6, '#875828', '#563715', 9)}
        ${FOOTING([x - 30, y - 7], [x, y + 8], 6, '#b9c1c9', '#828c97')}
        ${FOOTING([x, y + 8], [x + 30, y - 7], 6, '#8b95a0', '#5d6673')}
        ${DAMP([x - 30, y - 7], [x, y + 8], 3.5)}
        ${RIM([x - 30, y - 32], [x, y - 17])}
        <!-- notched log ends poking past the corner post, alternating course by course -->
        ${[0, 1, 2, 3, 4, 5].map(i => {
            const ly = y + 8 - 25 * (i + 0.5) / 6;
            return i % 2
                ? `<ellipse cx="${x - 4.2}" cy="${_f(ly + 2.1)}" rx="2.4" ry="1.9" fill="#c99a5e" stroke="${OUTLINE}" stroke-width="0.55"/><ellipse cx="${x - 4.2}" cy="${_f(ly + 2.1)}" rx="1" ry="0.8" fill="#8a5a2b"/>`
                : `<ellipse cx="${x + 4.2}" cy="${_f(ly + 2.1)}" rx="2.4" ry="1.9" fill="#a8763f" stroke="${OUTLINE}" stroke-width="0.55"/><ellipse cx="${x + 4.2}" cy="${_f(ly + 2.1)}" rx="1" ry="0.8" fill="#6b4520"/>`;
        }).join('')}
        <!-- doorway and windows, cut back into the log wall -->
        ${ISO_DOOR(x - 13.5, y + 1.25, 0.5, 13, 15, { wood: '#7a4e24', arch: 3 })}
        ${ISO_WIN(x - 25, y - 9, 0.5, 6, 7, {})}
        ${ISO_WIN(x + 16, y - 8, -0.5, 6, 7, { shutter: true })}
        ${EAVE_SHADOW([x - 30, y - 32], [x, y - 17], [x, y + 8], [x - 30, y - 7], 0.13)}
        ${EAVE_SHADOW([x, y - 17], [x + 30, y - 32], [x + 30, y - 7], [x, y + 8], 0.13)}
        <!-- thatch: strands down the slope, ragged at the eave, 6px overhang -->
        ${THATCH([x, y - 56], [x, y - 56], [x, y - 13], [x - 36, y - 31], 26, '#f0cf7c', '#a87c2c', 7)}
        ${THATCH([x, y - 56], [x, y - 56], [x + 36, y - 31], [x, y - 13], 24, '#c39a3e', '#7e5c18', 11)}
        <!-- turf ridge cap and the moss that always creeps up a thatch valley -->
        ${_ln([x, y - 56], [x, y - 13], '#c8a24a', 2.2)}
        ${_ln([x - 0.9, y - 54], [x - 0.9, y - 16], 'rgba(255,246,214,0.5)', 0.8)}
        ${_seg([[[x, y - 56], [x - 36, y - 31]], [[x, y - 56], [x + 36, y - 31]]], '#a87c2c', 1.6)}
        ${MOSS(x - 9, y - 19, 3, 13, '#6f8a3e')}
        ${MOSS(x + 7, y - 18, 2, 21, '#75903f')}
        <!-- stone chimney, coursed, with its own weathered cap -->
        ${STONEWORK([x - 21, y - 47], [x - 16.5, y - 44.8], [x - 16.5, y - 27], [x - 21, y - 29.2], 4, 5, '#a9b2bb', '#79838f', 27)}
        ${STONEWORK([x - 16.5, y - 44.8], [x - 12, y - 47], [x - 12, y - 29.2], [x - 16.5, y - 27], 4, 5, '#79838f', '#535c68', 31)}
        ${_pg([[x - 22, y - 47], [x - 16.5, y - 49.8], [x - 11, y - 47], [x - 16.5, y - 44.2]], '#6d7681', OUTLINE, 0.7)}
        ${_ln([x - 22, y - 47], [x - 16.5, y - 44.2], 'rgba(255,255,255,0.4)', 0.6)}
        ${MOSS(x - 18, y - 30, 2, 17)}
        ${SMOKE(x - 16.5, y - 52)}
        <!-- sawing trestle with its spinning blade -->
        ${_seg([[[x + 22, y + 16], [x + 27, y + 8]], [[x + 32, y + 16], [x + 27, y + 8]]], '#6b4520', 1.7)}
        ${PLANKS([x + 16, y + 5], [x + 40, y + 5], [x + 40, y + 10.5], [x + 16, y + 10.5], 2, '#c99a5e', '#8a5a2b', 3)}
        ${_pg([[x + 16, y + 5], [x + 40, y + 5], [x + 40, y + 10.5], [x + 16, y + 10.5]], 'none', OUTLINE, 0.7)}
        <circle cx="${x + 40}" cy="${y + 8}" r="2.5" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="${x + 40}" cy="${y + 8}" r="1.1" fill="#54371a"/>
        <g transform="translate(${x + 27}, ${y + 2})">
            <g class="sawblade">
                ${Array.from({length: 8}, (_, i) => {
                    const a = (i / 8) * Math.PI * 2;
                    const x1 = Math.cos(a) * 6.5, y1 = Math.sin(a) * 6.5;
                    const x2 = Math.cos(a + 0.22) * 8.5, y2 = Math.sin(a + 0.22) * 8.5;
                    return `<polygon points="${x1 - 1.2},${y1} ${x2},${y2} ${x1 + 1.2},${y1}" fill="#8b95a0"/>`;
                }).join('')}
                <circle r="6.5" fill="#aeb8c4" stroke="#2a1a0e" stroke-width="0.8"/>
                <circle r="4" fill="#8b95a0" stroke="#4f5663" stroke-width="0.4"/>
                <circle r="1.4" fill="#2a1a0e"/>
            </g>
        </g>
        <ellipse cx="${x + 27}" cy="${y + 13}" rx="8" ry="2.6" fill="#d9c08a" opacity="0.5"/>
        <!-- stacked timber, end grain showing its rings -->
        ${[[-41, 11.5], [-39, 6], [-37, 0.5]].map(([dx, dy], i) => `
            ${_pg([[x + dx, y + dy - 2.4], [x + dx + 20, y + dy - 2.4], [x + dx + 20, y + dy + 2.4], [x + dx, y + dy + 2.4]], i % 2 ? '#9a6a35' : '#a8763f', OUTLINE, 0.6)}
            ${_ln([x + dx, y + dy - 1.5], [x + dx + 20, y + dy - 1.5], 'rgba(255,255,255,0.28)', 0.7)}
            <ellipse cx="${x + dx}" cy="${y + dy}" rx="2.5" ry="2.5" fill="#e0b45c" stroke="#2a1a0e" stroke-width="0.6"/>
            <circle cx="${x + dx}" cy="${y + dy}" r="1.5" fill="none" stroke="#c08d3e" stroke-width="0.5"/>
            <circle cx="${x + dx}" cy="${y + dy}" r="0.6" fill="#a8763f"/>
        `).join('')}
        <!-- chopping block with the axe left in it -->
        ${_pg([[x - 14, y + 14], [x - 6, y + 14], [x - 6, y + 20], [x - 14, y + 20]], '#8a5a2b', OUTLINE, 0.6)}
        <ellipse cx="${x - 10}" cy="${y + 14}" rx="4" ry="1.8" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.5"/>
        ${_ln([x - 10, y + 13], [x - 5, y + 4], '#8a5a2b', 1.5)}
        <path d="M ${x - 6.5} ${y + 4.5} q 3.6 -1.4 4.4 2.4 l -4.6 1.4 Z" fill="#aeb8c4" stroke="#2a1a0e" stroke-width="0.5"/>
        ${lvl >= 4 ? `
            ${FLAG(x - 41, y + 3, '#2c5aa0')}
            <!-- a second saw bench and a fresh pile of offcuts -->
            ${_pg([[x + 10, y + 13], [x + 26, y + 13], [x + 26, y + 17], [x + 10, y + 17]], '#9a6a35', OUTLINE, 0.6)}
            ${_ln([x + 10, y + 13.8], [x + 26, y + 13.8], 'rgba(255,255,255,0.25)', 0.6)}
            <ellipse cx="${x + 10}" cy="${y + 15}" rx="2" ry="2" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.5"/>
            ${_seg([[[x + 13, y + 19], [x + 18, y + 17.5]], [[x + 16, y + 20], [x + 21, y + 18.6]]], '#c99a5e', 1.1)}
        ` : ''}
        ${lvl >= 7 ? `
            <!-- gilded barge boards, a finial, and a lantern by the door -->
            ${_seg([[[x - 36, y - 31], [x, y - 13]], [[x, y - 13], [x + 36, y - 31]]], '#f4c44d', 1.6)}
            <circle cx="${x}" cy="${y - 57.5}" r="2" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
            ${_seg([[[x - 5.5, y - 12.5], [x - 9, y - 14.2]], [[x - 9, y - 14.2], [x - 9, y - 11.6]]], '#3f434a', 0.9)}
            <path d="M ${x - 10.9} ${y - 11.6} l 3.8 0 l 0.8 4.6 l -5.4 0 Z" fill="#2a1a0e"/>
            <rect x="${x - 10.1}" y="${y - 11}" width="2.6" height="3.4" fill="#ffd773">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite"/>
            </rect>
            ${ISO_WIN(x + 26, y - 12, -0.5, 5.5, 6.5, {})}
        ` : ''}
    `,

    farm: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <!-- tilled field: a true iso rhombus, worked into ridge and furrow -->
        ${PLANKS([x - 13, y - 13.5], [x + 23, y + 4.5], [x - 3, y + 17.5], [x - 39, y - 0.5], 7, '#96683c', '#4a2d12', 3)}
        ${_pg([[x - 13, y - 13.5], [x + 23, y + 4.5], [x - 3, y + 17.5], [x - 39, y - 0.5]], 'none', OUTLINE, 0.8)}
        <!-- ripe wheat: individual stalks, not a fill -->
        ${(() => {
            const A = [x - 13, y - 13.5], B = [x + 23, y + 4.5], C = [x - 3, y + 17.5], D = [x - 39, y - 0.5];
            const stem = [], head = [], wash = [];
            for (let i = 0; i < 7; i++) {
                const v = (i + 0.45) / 7;
                wash.push([_Q(A, B, C, D, 0.03, v), _Q(A, B, C, D, 0.97, v)]);
                for (let j = 0; j < 19; j++) {
                    const r = _rr(i * 11.3 + j * 3.7);
                    const p = _Q(A, B, C, D, (j + 0.25 + r * 0.5) / 19, v);
                    const h = 4.2 + r * 1.6;
                    const t = [p[0] + (r - 0.5) * 1.1, p[1] - h];
                    stem.push([p, t]);
                    head.push([[t[0] - (r - 0.5) * 0.25, t[1] + 1.7], [t[0], t[1]]]);
                }
            }
            return _seg(wash.map(w => [[w[0][0], w[0][1] - 2.4], [w[1][0], w[1][1] - 2.4]]), '#b98f2e', 3.4, 'opacity="0.55"')
                + _seg(stem, '#9a7a24', 0.5) + _seg(head, '#e8c765', 0.9);
        })()}
        <!-- individual heads catching the breeze -->
        ${[[-30, 2], [-21, 7], [-11, 12], [-24, -4], [-14, 1], [-4, 6], [2, -2], [8, 3]].map(([dx, dy], i) => `
            <g class="flag-wave" style="animation-delay:${(i * 0.27).toFixed(2)}s">
                <path d="M ${x + dx} ${y + dy} q -0.9 -3.6 0.5 -6" stroke="#a8791f" stroke-width="0.6" fill="none"/>
                <ellipse cx="${x + dx + 0.6}" cy="${y + dy - 6.8}" rx="0.9" ry="1.9" fill="#eec86a" stroke="#a8791f" stroke-width="0.35"/>
            </g>
        `).join('')}
        <!-- post-and-rail fence along the near edge of the field -->
        ${_seg([0.12, 0.36, 0.6, 0.84].map(t => [[x - 39 + 36 * t, y + 1 + 18 * t], [x - 39 + 36 * t, y - 8 + 18 * t]]), '#6b4520', 1.9)}
        ${_seg([0.12, 0.36, 0.6, 0.84].map(t => [[x - 39.6 + 36 * t, y - 7.5 + 18 * t], [x - 39.6 + 36 * t, y - 3.5 + 18 * t]]), '#a8763f', 0.7)}
        ${_seg([[[x - 35, y - 4.5], [x - 8, y + 9]], [[x - 35, y - 1], [x - 8, y + 12.5]]], '#8a5a2b', 1.4)}
        ${_seg([[[x - 35, y - 5.1], [x - 8, y + 8.4]]], '#c99a5e', 0.5)}
        <!-- scarecrow on a leaning post -->
        ${_ln([x - 22, y - 1], [x - 21.4, y - 17], '#6b4520', 1.5)}
        ${_ln([x - 27, y - 12.5], [x - 15.5, y - 12.5], '#6b4520', 1.2)}
        ${_pg([[x - 24.6, y - 14.2], [x - 18.4, y - 14.2], [x - 18.8, y - 7.6], [x - 24.2, y - 7.6]], '#2c5aa0', '#1d3c6e', 0.5)}
        ${_seg([[[x - 24.6, y - 13.4], [x - 18.4, y - 13.4]]], 'rgba(255,255,255,0.3)', 0.5)}
        ${_seg([[[x - 26.4, y - 12.2], [x - 27.6, y - 9.6]], [[x - 15.8, y - 12.2], [x - 14.8, y - 9.4]]], '#d9a94a', 0.9)}
        <circle cx="${x - 21.5}" cy="${y - 17.6}" r="2.7" fill="#eec86a" stroke="#2a1a0e" stroke-width="0.5"/>
        ${_pg([[x - 26.5, y - 19.2], [x - 16.5, y - 19.2], [x - 21.5, y - 23.6]], '#c9973c', OUTLINE, 0.5)}
        ${_pg([[x - 26.5, y - 19.2], [x - 21.5, y - 23.6], [x - 21.5, y - 19.2]], '#e0b45c')}
        <g class="smoke-puff" style="animation-delay:.8s">
            <ellipse cx="${x - 28}" cy="${y - 13.6}" rx="1.8" ry="1.2" fill="#2a1a0e"/>
            <circle cx="${x - 29.5}" cy="${y - 14.7}" r="0.9" fill="#2a1a0e"/>
            <polygon points="${x-30.3},${y-14.7} ${x-31.5},${y-14.4} ${x-30.3},${y-14.1}" fill="#d9a94a"/>
        </g>
        <!-- BARN: board-and-batten over a stone footing, gable to the front-right -->
        ${WORN_PATH(x + 9, y + 6, 11)}
        ${_pg([[x + 5, y - 32.5], [x + 22, y - 41], [x + 39, y - 32.5], [x + 22, y - 24]], '#8c2f20', OUTLINE, 0.8)}
        ${PLANKS([x + 5, y - 32.5], [x + 5, y - 6.5], [x + 22, y + 2], [x + 22, y - 24], 9, '#cf5b44', '#9a3524', 12)}
        ${PLANKS([x + 22, y - 24], [x + 22, y + 2], [x + 39, y - 6.5], [x + 39, y - 32.5], 9, '#9c3524', '#6e2317', 15)}
        ${FOOTING([x + 5, y - 6.5], [x + 22, y + 2], 5, '#b9c1c9', '#828c97')}
        ${FOOTING([x + 22, y + 2], [x + 39, y - 6.5], 5, '#8b95a0', '#5d6673')}
        ${DAMP([x + 5, y - 6.5], [x + 22, y + 2], 3)}
        <!-- white corner boards and plate trim, the way barns are finished -->
        ${_seg([[[x + 5, y - 32.5], [x + 5, y - 6.5]], [[x + 22, y - 24], [x + 22, y + 2]], [[x + 5, y - 32.5], [x + 22, y - 24]]], '#f2ece0', 1.7)}
        ${_seg([[[x + 39, y - 32.5], [x + 39, y - 6.5]], [[x + 22, y - 24], [x + 39, y - 32.5]]], '#cfc7b6', 1.6)}
        <!-- big braced barn door, 17px tall, hung on a sliding track -->
        ${ISO_DOOR(x + 13.5, y - 2.25, 0.5, 15, 17, { wood: '#7a4e24', dark: '#f2ece0', arch: 0 })}
        ${_ln([x + 4, y - 27.5], [x + 23, y - 18], '#4f5663', 1.2)}
        ${ISO_WIN(x + 31.5, y - 11, -0.5, 6, 7, {})}
        ${EAVE_SHADOW([x + 5, y - 32.5], [x + 22, y - 24], [x + 22, y + 2], [x + 5, y - 6.5], 0.12)}
        <!-- gable end: boarded, with a hayloft door and its hoist beam -->
        ${_pg([[x + 22, y - 24], [x + 39, y - 32.5], [x + 30.5, y - 41.25]], '#a83c28', OUTLINE, 0.8)}
        ${_seg([0.2, 0.35, 0.5, 0.65, 0.8].map(t => {
            const bx = x + 22 + 17 * t, by = y - 24 - 8.5 * t;
            const ty = t < 0.5 ? (y - 24) + ((y - 41.25) - (y - 24)) * (t / 0.5) : (y - 41.25) + ((y - 32.5) - (y - 41.25)) * ((t - 0.5) / 0.5);
            return [[bx, by], [bx, ty]];
        }), '#7e2718', 0.55)}
        ${ISO_DOOR(x + 30.5, y - 28.5, -0.5, 9, 8, { wood: '#6e4a24', dark: '#f2ece0', arch: 0 })}
        ${_ln([x + 30.5, y - 42], [x + 36.5, y - 39], '#6b4520', 1.7)}
        ${_ln([x + 36.1, y - 39.2], [x + 36.1, y - 34], '#4a4438', 0.6)}
        <path d="M ${x + 33.7} ${y - 34} q 2.4 -2.4 4.8 0 q 1 3.8 -2.4 4.8 q -3.4 -1 -2.4 -4.8 Z" fill="#d9cbb0" stroke="#2a1a0e" stroke-width="0.6"/>
        <!-- shingled roof plane: ridge and eave both on the iso grid -->
        ${SHINGLES([x + 10.1, y - 51.4], [x + 33.9, y - 39.6], [x + 22.7, y - 19.8], [x - 1.1, y - 31.7], 7, 7, '#ded5c4', '#8b8275', 44)}
        ${_pg([[x - 1.1, y - 31.7], [x + 22.7, y - 19.8], [x + 22.7, y - 17.4], [x - 1.1, y - 29.3]], '#8a5a2b', OUTLINE, 0.7)}
        ${_ln([x - 1.1, y - 31.7], [x + 22.7, y - 19.8], 'rgba(255,255,255,0.5)', 0.6)}
        ${_ln([x + 10.1, y - 51.4], [x + 33.9, y - 39.6], '#f7f2e8', 2)}
        ${_ln([x + 10.1, y - 52.3], [x + 33.9, y - 40.5], 'rgba(255,255,255,0.55)', 0.6)}
        ${_ln([x + 33.9, y - 39.6], [x + 22.7, y - 19.8], '#f2ece0', 1.6)}
        ${MOSS(x + 5, y - 29, 3, 6, '#75903f')}
        ${lvl >= 4 ? `
            <!-- hen scratching at the barn door -->
            <ellipse cx="${x - 7}" cy="${y + 12}" rx="5" ry="3.4" fill="#f5f2ea" stroke="#2a1a0e" stroke-width="0.6"/>
            <ellipse cx="${x - 6}" cy="${y + 10.5}" rx="3.4" ry="2" fill="#fff" opacity="0.8"/>
            <circle cx="${x - 11.5}" cy="${y + 10}" r="2" fill="#f5f2ea" stroke="#2a1a0e" stroke-width="0.4"/>
            <path d="M ${x - 12.4} ${y + 8.2} q 1 -1.8 2 0" fill="#b3402e" stroke="#b3402e" stroke-width="0.5"/>
            <polygon points="${x-13.4},${y+10} ${x-15},${y+10.5} ${x-13.4},${y+11}" fill="#d9a94a"/>
            <circle cx="${x - 12.2}" cy="${y + 9.6}" r="0.4" fill="#2a1a0e"/>
            ${_seg([[[x - 9, y + 15], [x - 9, y + 17]], [[x - 5, y + 15], [x - 5, y + 17]]], '#d9a94a', 0.8)}
            <!-- water butt under the eave -->
            <path d="M ${x - 4} ${y - 4} q -1.4 4 0 8 q 4.4 2.2 8.8 0 q 1.4 -4 0 -8 q -4.4 -2.2 -8.8 0 Z" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.7"/>
            <ellipse cx="${x + 0.4}" cy="${y - 4}" rx="4.4" ry="1.7" fill="#3d6cb4" stroke="#2a1a0e" stroke-width="0.5"/>
            ${_seg([[[x - 4.8, y - 1.6], [x + 5.6, y - 1.6]], [[x - 4.8, y + 1.8], [x + 5.6, y + 1.8]]], '#4f5663', 0.9)}
        ` : ''}
        ${lvl >= 7 ? `
            <!-- ridge cupola with a turning weather vane -->
            ${_pg([[x + 18, y - 51], [x + 24, y - 54], [x + 30, y - 51], [x + 24, y - 48]], '#f2ece0', OUTLINE, 0.6)}
            ${_pg([[x + 18, y - 51], [x + 24, y - 48], [x + 24, y - 41], [x + 18, y - 44]], '#e0d8c8', OUTLINE, 0.6)}
            ${_pg([[x + 30, y - 51], [x + 24, y - 48], [x + 24, y - 41], [x + 30, y - 44]], '#b8ae9c', OUTLINE, 0.6)}
            ${SHINGLES([x + 24, y - 62], [x + 24, y - 62], [x + 24, y - 47], [x + 16, y - 51.5], 4, 5, '#d9705a', '#8c2f20', 51)}
            ${SHINGLES([x + 24, y - 62], [x + 24, y - 62], [x + 32, y - 51.5], [x + 24, y - 47], 4, 5, '#a83c28', '#6e2317', 55)}
            ${_ln([x + 24, y - 62], [x + 24, y - 67], '#4f5663', 1.3)}
            <g class="sawblade">
                <g transform="translate(${x + 24},${y - 67})">
                    ${[0, 90, 180, 270].map(a => `<polygon points="0,0 ${Math.cos(a * Math.PI / 180) * 8 - Math.sin(a * Math.PI / 180) * 1.8},${Math.sin(a * Math.PI / 180) * 8 * 0.6 + Math.cos(a * Math.PI / 180) * 1.8 * 0.6} ${Math.cos(a * Math.PI / 180) * 9 + Math.sin(a * Math.PI / 180) * 1.8},${Math.sin(a * Math.PI / 180) * 9 * 0.6 - Math.cos(a * Math.PI / 180) * 1.8 * 0.6}" fill="#f0e6d2" stroke="#2a1a0e" stroke-width="0.5"/>`).join('')}
                    <circle r="1.6" fill="#b3402e" stroke="#2a1a0e" stroke-width="0.5"/>
                </g>
            </g>
        ` : ''}
    `,

    coinmint: (x, y, lvl) => `
        ${SHADOW(x, y, 42)}
        <!-- marble stylobate steps -->
        <polygon points="${x-40},${y-4} ${x},${y-24} ${x+40},${y-4} ${x},${y+16}" fill="#e9e2d0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-40},${y-4} ${x},${y+16} ${x},${y+22} ${x-40},${y+2}" fill="#d9cbb0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+40},${y-4} ${x},${y+16} ${x},${y+22} ${x+40},${y+2}" fill="#b8a88c" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-40}" y1="${y-4}" x2="${x}" y2="${y+16}" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
        <!-- marble hall (iso box, flat top) -->
        <polygon points="${x-32},${y-22} ${x},${y-38} ${x+32},${y-22} ${x},${y-6}" fill="#f7f1e3" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-32},${y-22} ${x},${y-6} ${x},${y+10} ${x-32},${y-6}" fill="#f0e6d2" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+32},${y-22} ${x},${y-6} ${x},${y+10} ${x+32},${y-6}" fill="#d3c5a8" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-32}" y1="${y-22}" x2="${x}" y2="${y-6}" stroke="rgba(255,255,255,0.55)" stroke-width="0.9"/>
        <!-- gilded pilasters on both faces -->
        ${[[-27, 0], [-17, 0], [15, 0], [25, 0]].map(([dx]) => {
            const lit = dx < 0;
            const topY = y - 22 + Math.abs(dx) * 0.5 - 16;
            return `
            <polygon points="${x+dx-1.8},${topY} ${x+dx+1.8},${topY+1.8}, ${x+dx+1.8},${topY+18} ${x+dx-1.8},${topY+16.2}" fill="${lit ? '#e9dcbf' : '#c4b494'}" stroke="#2a1a0e" stroke-width="0.6"/>
            <rect x="${x+dx-2.6}" y="${topY-1.6}" width="5.2" height="2.6" rx="0.7" fill="${lit ? '#f4c44d' : '#c2912c'}" stroke="#2a1a0e" stroke-width="0.5"/>
            <rect x="${x+dx-2.6}" y="${topY+16.4}" width="5.2" height="2.6" rx="0.7" fill="${lit ? '#d9a94a' : '#a8791f'}" stroke="#2a1a0e" stroke-width="0.5"/>`;
        }).join('')}
        <!-- bronze vault door with gold dial -->
        <path d="M ${x-10} ${y-1.5} L ${x-10} ${y-13} Q ${x-5.5} ${y-18} ${x-1} ${y-8.5} L ${x-1} ${y+3} Z" fill="#4a2e16" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-8.6} ${y-2.6} L ${x-8.6} ${y-12} Q ${x-5.5} ${y-15.4} ${x-2.4} ${y-8.9} L ${x-2.4} ${y+1.4} Z" fill="#6e4a24"/>
        <circle cx="${x-5.5}" cy="${y-6.5}" r="2.1" fill="none" stroke="#f4c44d" stroke-width="0.8"/>
        <circle cx="${x-5.5}" cy="${y-6.5}" r="0.7" fill="#f4c44d"/>
        <!-- coin crest on the shaded face -->
        <circle cx="${x+20}" cy="${y-8}" r="4.6" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.7"/>
        <circle cx="${x+20}" cy="${y-8}" r="3.2" fill="none" stroke="#a8791f" stroke-width="0.6"/>
        <circle cx="${x+18.6}" cy="${y-9.6}" r="1.1" fill="rgba(255,255,255,0.6)"/>
        <!-- gold cornice band -->
        <polygon points="${x-34},${y-22} ${x},${y-39} ${x+34},${y-22} ${x},${y-5}" fill="none" stroke="#c2912c" stroke-width="2.2"/>
        <polygon points="${x-34},${y-22} ${x},${y-39} ${x},${y-36} ${x-30},${y-21}" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.5"/>
        <!-- great gold dome -->
        <ellipse cx="${x}" cy="${y-22}" rx="17" ry="8" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M ${x-16} ${y-23} A 16 15 0 0 1 ${x+16} ${y-23} Q ${x+8} ${y-18.5} ${x} ${y-18} Q ${x-8} ${y-18.5} ${x-16} ${y-23} Z" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-16} ${y-23} A 16 15 0 0 1 ${x-2} ${y-37.8} Q ${x-9} ${y-32} ${x-12} ${y-26.5} Z" fill="#ffd76b"/>
        <path d="M ${x+16} ${y-23} A 16 15 0 0 0 ${x+6} ${y-36.5} Q ${x+10} ${y-30} ${x+12} ${y-25.5} Z" fill="#c2912c"/>
        <ellipse cx="${x-6}" cy="${y-32}" rx="3" ry="2" fill="rgba(255,255,255,0.5)"/>
        <!-- finial + spinning coin -->
        <line x1="${x}" y1="${y-37.5}" x2="${x}" y2="${y-42}" stroke="#a8791f" stroke-width="1.2"/>
        <g>
            <ellipse cx="${x}" cy="${y - 48}" rx="6" ry="6" fill="#c2912c" stroke="#2a1a0e" stroke-width="0.9">
                <animate attributeName="rx" values="6;1.5;6" dur="2.6s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="${x}" cy="${y - 48}" rx="4.6" ry="4.6" fill="#f4c44d" stroke="#a8791f" stroke-width="0.6">
                <animate attributeName="rx" values="4.6;1;4.6" dur="2.6s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="${x-1.4}" cy="${y-49.6}" rx="1.4" ry="1.2" fill="rgba(255,255,255,0.55)">
                <animate attributeName="rx" values="1.4;0.4;1.4" dur="2.6s" repeatCount="indefinite"/>
            </ellipse>
        </g>
        <!-- overflowing coin piles at the steps -->
        <ellipse cx="${x - 27}" cy="${y + 10}" rx="8" ry="2.8" fill="#c2912c" stroke="#2a1a0e" stroke-width="0.6"/>
        ${[[-30, 7], [-25, 7.5], [-27.5, 5], [-23, 5.5]].map(([dx, dy]) => `<ellipse cx="${x + dx}" cy="${y + dy}" rx="2.3" ry="1.7" fill="#f4c44d" stroke="#a8791f" stroke-width="0.4"/>`).join('')}
        <ellipse cx="${x + 26}" cy="${y + 8}" rx="6" ry="2.2" fill="#c2912c" stroke="#2a1a0e" stroke-width="0.6"/>
        <ellipse cx="${x + 25}" cy="${y + 6}" rx="2.2" ry="1.6" fill="#ffd76b" stroke="#a8791f" stroke-width="0.4"/>
        <ellipse cx="${x + 28.5}" cy="${y + 6.8}" rx="2" ry="1.5" fill="#f4c44d" stroke="#a8791f" stroke-width="0.4"/>
        <g class="sparkle-fx">
            <polygon points="${x-26},${y+1} ${x-25},${y+3} ${x-26},${y+5} ${x-27},${y+3}" fill="#fff3c4"/>
            <polygon points="${x+11},${y-52} ${x+12.2},${y-49.5} ${x+11},${y-47} ${x+9.8},${y-49.5}" fill="#fff3c4" style="animation-delay:.5s"/>
            <polygon points="${x-12},${y-56} ${x-11},${y-54} ${x-12},${y-52} ${x-13},${y-54}" fill="#ffe9a3" style="animation-delay:1s"/>
        </g>
        ${lvl >= 4 ? `
            ${FLAG(x - 36, y - 26, '#2c5aa0')}
            ${FLAG(x + 36, y - 26, '#2c5aa0')}
        ` : ''}
        ${lvl >= 7 ? `
            <polygon points="${x-3},${y-56} ${x},${y-53} ${x+3},${y-56} ${x},${y-59}" fill="#f4c44d" stroke="#a8791f" stroke-width="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.6s" repeatCount="indefinite"/>
            </polygon>
            <ellipse cx="${x}" cy="${y - 44}" rx="14" ry="14" fill="#ffd76b" opacity="0.12">
                <animate attributeName="opacity" values="0.06;0.2;0.06" dur="3s" repeatCount="indefinite"/>
            </ellipse>
        ` : ''}
    `,

    storage: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <!-- broad timber warehouse (iso box) -->
        <polygon points="${x-38},${y-14} ${x},${y-33} ${x+38},${y-14} ${x},${y+5}" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-38},${y-14} ${x},${y+5} ${x},${y+20} ${x-38},${y+1}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+38},${y-14} ${x},${y+5} ${x},${y+20} ${x+38},${y+1}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-38}" y1="${y-14}" x2="${x}" y2="${y+5}" stroke="rgba(255,255,255,0.35)" stroke-width="0.8"/>
        <!-- plank courses + one tilted plank -->
        ${[5, 10].map(d => `
            <line x1="${x-38}" y1="${y-14+d}" x2="${x}" y2="${y+5+d}" stroke="#6f4722" stroke-width="0.5"/>
            <line x1="${x}" y1="${y+5+d}" x2="${x+38}" y2="${y-14+d}" stroke="#54371a" stroke-width="0.5"/>
        `).join('')}
        <line x1="${x+9}" y1="${y+9}" x2="${x+21}" y2="${y+4.4}" stroke="#54371a" stroke-width="0.7"/>
        <!-- X-brace on lit face -->
        <line x1="${x-34}" y1="${y-12}" x2="${x-14}" y2="${y+13}" stroke="#6b4520" stroke-width="1.6"/>
        <line x1="${x-34}" y1="${y+3}" x2="${x-14}" y2="${y-2}" stroke="#6b4520" stroke-width="1.6"/>
        <!-- Shingled pyramid roof drawn as OVERLAPPING COURSES rather than five
             scratch lines: 7 rows per plane, each row half-offset from the one
             above, with a shadow line under every course and individual shingle
             tabs picked out. This roof was the flattest surface in the village. -->
        <polygon points="${x-44},${y-14} ${x},${y-48} ${x},${y+3}" fill="#a8763f" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="${x+44},${y-14} ${x},${y-48} ${x},${y+3}" fill="#7c521f" stroke="#2a1a0e" stroke-width="1"/>
        ${[0.12,0.25,0.38,0.51,0.64,0.77,0.90].map((t, ri) => {
            // left plane: eave (x-44,y-14)->(x,y+3), apex (x,y-48)
            const lex = -44 + 44 * t, ley = -14 - 34 * t;      // along the sloping ridge edge
            const lcx = 0, lcy = 3 - 51 * t;                    // along the centre ridge
            const rex = 44 - 44 * t, rey = -14 - 34 * t;
            const tabs = [];
            for (let k = 0; k < 6; k++) {
                const f = (k + (ri % 2 ? 0.5 : 0)) / 6;
                if (f > 0.97) continue;
                const lx = lex + (lcx - lex) * f, ly = ley + (lcy - ley) * f;
                const rx = rex + (lcx - rex) * f, ry = rey + (lcy - rey) * f;
                tabs.push(`<line x1="${x + lx}" y1="${y + ly}" x2="${x + lx}" y2="${y + ly + 3.2}" stroke="#7a5426" stroke-width="0.45" opacity="0.7"/>`);
                tabs.push(`<line x1="${x + rx}" y1="${y + ry}" x2="${x + rx}" y2="${y + ry + 3.2}" stroke="#5a3a14" stroke-width="0.45" opacity="0.7"/>`);
            }
            return `
            <line x1="${x + lex}" y1="${y + ley}" x2="${x + lcx}" y2="${y + lcy}" stroke="#b98a52" stroke-width="1.7" opacity="0.85"/>
            <line x1="${x + lex}" y1="${y + ley + 1.3}" x2="${x + lcx}" y2="${y + lcy + 1.3}" stroke="#66421a" stroke-width="0.7" opacity="0.55"/>
            <line x1="${x + rex}" y1="${y + rey}" x2="${x + lcx}" y2="${y + lcy}" stroke="#8b5f28" stroke-width="1.7" opacity="0.85"/>
            <line x1="${x + rex}" y1="${y + rey + 1.3}" x2="${x + lcx}" y2="${y + lcy + 1.3}" stroke="#4d3010" stroke-width="0.7" opacity="0.55"/>
            ${tabs.join('')}`;
        }).join('')}
        <!-- ridge cap + eave fascia -->
        <line x1="${x}" y1="${y-48}" x2="${x}" y2="${y+3}" stroke="#6b4520" stroke-width="2.4"/>
        <line x1="${x}" y1="${y-48}" x2="${x}" y2="${y+3}" stroke="rgba(255,240,210,0.4)" stroke-width="0.9"/>
        <line x1="${x-44}" y1="${y-14}" x2="${x}" y2="${y+3}" stroke="#5a3a14" stroke-width="1.3"/>
        <line x1="${x}" y1="${y+3}" x2="${x+44}" y2="${y-14}" stroke="#452a0e" stroke-width="1.3"/>
        <!-- moss creeping up the shaded valley -->
        <ellipse cx="${x+14}" cy="${y-12}" rx="5" ry="2.4" fill="#5e7a34" opacity="0.35"/>
        <!-- patched shingle -->
        <polygon points="${x-24},${y-22} ${x-17},${y-19} ${x-18},${y-15} ${x-25},${y-18}" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.5"/>
        <!-- hoist beam + sack -->
        <line x1="${x}" y1="${y-48}" x2="${x+10}" y2="${y-42}" stroke="#6b4520" stroke-width="1.6"/>
        <line x1="${x+10}" y1="${y-42}" x2="${x+10}" y2="${y-33}" stroke="#4a4438" stroke-width="0.7"/>
        <path d="M ${x+7.5} ${y-33} q 2.5 -2.5 5 0 q 1 4 -2.5 5 q -3.5 -1 -2.5 -5 Z" fill="#d9cbb0" stroke="#2a1a0e" stroke-width="0.6"/>
        <!-- barn doors on lit face -->
        <path d="M ${x-11} ${y+2} L ${x-11} ${y-11} L ${x+1} ${y-5} L ${x+1} ${y+8} Z" fill="#4a2e16" stroke="#2a1a0e" stroke-width="0.8"/>
        <line x1="${x-5}" y1="${y-8}" x2="${x-5}" y2="${y+5}" stroke="#2a1a0e" stroke-width="0.6"/>
        <line x1="${x-11}" y1="${y-11}" x2="${x+1}" y2="${y+8}" stroke="#6e4a24" stroke-width="0.8"/>
        <line x1="${x-11}" y1="${y+2}" x2="${x+1}" y2="${y-5}" stroke="#6e4a24" stroke-width="0.8"/>
        <circle cx="${x-3.4}" cy="${y-0.5}" r="0.8" fill="#f4c44d"/>
        <!-- crate + barrel depth plane -->
        <g>
            <polygon points="${x-34},${y+7} ${x-26},${y+3} ${x-18},${y+7} ${x-26},${y+11}" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.7"/>
            <polygon points="${x-34},${y+7} ${x-26},${y+11} ${x-26},${y+19} ${x-34},${y+15}" fill="#a8763f" stroke="#2a1a0e" stroke-width="0.7"/>
            <polygon points="${x-18},${y+7} ${x-26},${y+11} ${x-26},${y+19} ${x-18},${y+15}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.7"/>
            <line x1="${x-33}" y1="${y+10.5}" x2="${x-27}" y2="${y+13.5}" stroke="#6b4520" stroke-width="0.5"/>
            <ellipse cx="${x+22}" cy="${y+16}" rx="5.5" ry="2.2" fill="rgba(30,20,10,0.25)"/>
            <path d="M ${x+16.5} ${y+6} q -1.8 5 0 10 q 5.5 2.6 11 0 q 1.8 -5 0 -10 q -5.5 -2.6 -11 0 Z" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.8"/>
            <ellipse cx="${x+22}" cy="${y+6}" rx="5.5" ry="2" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.6"/>
            <path d="M ${x+15.6} ${y+8.6} q 6.4 3 12.8 0" stroke="#4f5663" stroke-width="1" fill="none"/>
            <path d="M ${x+15.6} ${y+13.4} q 6.4 3 12.8 0" stroke="#4f5663" stroke-width="1" fill="none"/>
            <line x1="${x+18}" y1="${y+6.8}" x2="${x+18}" y2="${y+15.4}" stroke="#6b4520" stroke-width="0.5"/>
        </g>
        <!-- resident mouser cat on the crate -->
        <g class="flag-wave">
            <ellipse cx="${x-26}" cy="${y+3.6}" rx="3.4" ry="2" fill="#3a3328" stroke="#2a1a0e" stroke-width="0.5"/>
            <circle cx="${x-29.2}" cy="${y+1.6}" r="1.9" fill="#3a3328" stroke="#2a1a0e" stroke-width="0.5"/>
            <polygon points="${x-30.6},${y+0.4} ${x-30.2},${y-1.6} ${x-28.9},${y-0.2}" fill="#3a3328"/>
            <polygon points="${x-28.4},${y-0.3} ${x-27.7},${y-2} ${x-26.9},${y-0.1}" fill="#3a3328"/>
            <path d="M ${x-22.8} ${y+3.6} q 3 -0.5 2.6 -3.4" stroke="#3a3328" stroke-width="1.1" fill="none"/>
            <circle cx="${x-29.8}" cy="${y+1.3}" r="0.35" fill="#f4c44d"/>
            <circle cx="${x-28.4}" cy="${y+1.3}" r="0.35" fill="#f4c44d"/>
        </g>
        ${lvl >= 4 ? `
            <polygon points="${x+28},${y+2} ${x+34},${y-1} ${x+40},${y+2} ${x+34},${y+5}" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+28},${y+2} ${x+34},${y+5} ${x+34},${y+12} ${x+28},${y+9}" fill="#a8763f" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+40},${y+2} ${x+34},${y+5} ${x+34},${y+12} ${x+40},${y+9}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.6"/>
            ${FLAG(x - 40, y - 12, '#2c5aa0')}
        ` : ''}
        ${lvl >= 7 ? `
            <line x1="${x-44}" y1="${y-14}" x2="${x}" y2="${y+3}" stroke="#f4c44d" stroke-width="1.6"/>
            <line x1="${x}" y1="${y+3}" x2="${x+44}" y2="${y-14}" stroke="#c2912c" stroke-width="1.6"/>
            ${LIT_WINDOW(x - 3, y - 32, 6, 6)}
            <circle cx="${x}" cy="${y-49.5}" r="1.8" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
        ` : ''}
    `,

    harbor: (x, y, lvl) => `
        ${SHADOW(x, y, 42)}
        <!-- water inlet with drifting ripples -->
        <polygon points="${x+2},${y+2} ${x+44},${y-4} ${x+44},${y+16} ${x+12},${y+22}" fill="#2c5aa0" stroke="#1d3c6e" stroke-width="0.8"/>
        <polygon points="${x+4},${y+3} ${x+44},${y-2.5} ${x+44},${y+2} ${x+8},${y+7}" fill="#3d6cb4"/>
        <path d="M ${x+14} ${y+10} q 4 -1.6 8 0" stroke="#7fb2e8" stroke-width="0.9" fill="none">
            <animate attributeName="opacity" values="0.2;0.9;0.2" dur="3s" repeatCount="indefinite"/>
        </path>
        <path d="M ${x+28} ${y+14} q 4 -1.6 8 0" stroke="#7fb2e8" stroke-width="0.9" fill="none">
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="3s" repeatCount="indefinite"/>
        </path>
        <!-- stone quay (iso slab) -->
        <polygon points="${x-38},${y-8} ${x-4},${y-25} ${x+26},${y-13} ${x-6},${y+6}" fill="#a4adb5" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-38},${y-8} ${x-6},${y+6} ${x-6},${y+15} ${x-38},${y+1}" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+26},${y-13} ${x-6},${y+6} ${x-6},${y+15} ${x+26},${y-4}" fill="#6b7280" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-38}" y1="${y-8}" x2="${x-6}" y2="${y+6}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
        <line x1="${x-30}" y1="${y-2}" x2="${x-14}" y2="${y+5.5}" stroke="#79828c" stroke-width="0.5"/>
        <line x1="${x+2}" y1="${y+5}" x2="${x+20}" y2="${y-6}" stroke="#59626c" stroke-width="0.5"/>
        <!-- harbormaster's office -->
        <polygon points="${x-34},${y-20} ${x-20},${y-27} ${x-6},${y-21} ${x-20},${y-14}" fill="#b98a4e" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x-34},${y-20} ${x-20},${y-14} ${x-20},${y+2} ${x-34},${y-4}" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x-6},${y-21} ${x-20},${y-14} ${x-20},${y+2} ${x-6},${y-5}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x-37},${y-19} ${x-20},${y-38} ${x-20},${y-12} Z" fill="#3d6cb4" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-3},${y-20} ${x-20},${y-38} ${x-20},${y-12} Z" fill="#274b85" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-31} ${y-21} L ${x-20} ${y-33}" stroke="#5b8ccc" stroke-width="0.7"/>
        <path d="M ${x-26} ${y-17.5} L ${x-20} ${y-24}" stroke="#5b8ccc" stroke-width="0.7"/>
        ${LIT_WINDOW(x - 30, y - 12, 5, 6)}
        <path d="M ${x-14} ${y-2.5} L ${x-14} ${y-13} L ${x-9} ${y-10.5} L ${x-9} ${y+0.5} Z" fill="#4a2e16" stroke="#2a1a0e" stroke-width="0.7"/>
        <!-- timber pier on posts -->
        <polygon points="${x-2},${y+3} ${x+8},${y-1} ${x+40},${y+11} ${x+30},${y+16}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x-2},${y+3} ${x+8},${y-1} ${x+9.5},${y-0.2} ${x-0.5},${y+3.8}" fill="#a8763f"/>
        ${[6, 14, 22, 30].map(d => `<line x1="${x + d}" y1="${y + 1.5 + d * 0.37}" x2="${x + d + 6}" y2="${y - 1 + d * 0.37}" stroke="#6b4520" stroke-width="0.6"/>`).join('')}
        <line x1="${x+34}" y1="${y+13.5}" x2="${x+34}" y2="${y+20}" stroke="#54371a" stroke-width="1.8"/>
        <line x1="${x+6}" y1="${y+2.5}" x2="${x+6}" y2="${y+9}" stroke="#54371a" stroke-width="1.8"/>
        <!-- moored cog with waving sail -->
        <path d="M ${x + 22} ${y + 21} Q ${x + 33} ${y + 26.5} ${x + 44} ${y + 21} L ${x + 41} ${y + 15.5} L ${x + 25} ${y + 15.5} Z" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M ${x + 22} ${y + 21} Q ${x + 33} ${y + 26.5} ${x + 44} ${y + 21} L ${x + 43.2} ${y + 19.4} Q ${x + 33} ${y + 24.4} ${x + 23} ${y + 19.4} Z" fill="#6b4520"/>
        <line x1="${x + 33}" y1="${y + 15.5}" x2="${x + 33}" y2="${y - 4}" stroke="#54371a" stroke-width="1.3"/>
        <path class="flag-wave" d="M ${x + 33.8} ${y - 3} Q ${x + 42} ${y + 1} ${x + 40} ${y + 8} Q ${x + 37} ${y + 12} ${x + 33.8} ${y + 12.5} Z" fill="#f0e6d2" stroke="#2a1a0e" stroke-width="0.7"/>
        <path class="flag-wave" d="M ${x + 33.8} ${y - 3} Q ${x + 42} ${y + 1} ${x + 40} ${y + 8} Q ${x + 38.5} ${y + 4} ${x + 33.8} ${y + 2} Z" fill="rgba(255,255,255,0.4)"/>
        <path class="flag-wave" d="M ${x + 35.5} ${y + 3} q 2.5 1.5 2.8 4" stroke="#b3402e" stroke-width="1.1" fill="none"/>
        ${FLAG(x + 33, y - 3, '#b3402e')}
        <!-- wooden crane swinging cargo -->
        <line x1="${x + 4}" y1="${y - 6}" x2="${x + 4}" y2="${y - 28}" stroke="#6b4520" stroke-width="2"/>
        <line x1="${x + 4}" y1="${y - 28}" x2="${x + 18}" y2="${y - 19}" stroke="#6b4520" stroke-width="1.6"/>
        <line x1="${x + 4}" y1="${y - 20}" x2="${x + 12}" y2="${y - 23.5}" stroke="#54371a" stroke-width="1"/>
        <g class="flag-wave">
            <line x1="${x + 18}" y1="${y - 19}" x2="${x + 18}" y2="${y - 9}" stroke="#4a4438" stroke-width="0.7"/>
            <polygon points="${x+14.5},${y-9} ${x+18},${y-10.8} ${x+21.5},${y-9} ${x+18},${y-7.2}" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+14.5},${y-9} ${x+18},${y-7.2} ${x+18},${y-3.2} ${x+14.5},${y-5}" fill="#a8763f" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+21.5},${y-9} ${x+18},${y-7.2} ${x+18},${y-3.2} ${x+21.5},${y-5}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.6"/>
        </g>
        <!-- cargo on the quay -->
        <ellipse cx="${x-1}" cy="${y+11}" rx="4.5" ry="1.8" fill="rgba(30,20,10,0.25)"/>
        <path d="M ${x-5.5} ${y+3} q -1.4 4 0 8 q 4.5 2.2 9 0 q 1.4 -4 0 -8 q -4.5 -2.2 -9 0 Z" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.7"/>
        <ellipse cx="${x-1}" cy="${y+3}" rx="4.5" ry="1.7" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.5"/>
        <path d="M ${x-6.3} ${y+5.4} q 5.3 2.4 10.6 0" stroke="#4f5663" stroke-width="0.9" fill="none"/>
        <!-- gulls -->
        <g class="sparkle-fx">
            <path d="M ${x - 8} ${y - 40} q 2 -2.2 4 0 q 2 -2.2 4 0" stroke="#f0f0f4" stroke-width="0.9" fill="none"/>
            <path d="M ${x + 22} ${y - 33} q 1.6 -1.8 3.2 0 q 1.6 -1.8 3.2 0" stroke="#f0f0f4" stroke-width="0.8" fill="none" style="animation-delay:.7s"/>
        </g>
        ${lvl >= 4 ? `
            <polygon points="${x+10},${y+6} ${x+16},${y+3} ${x+22},${y+6} ${x+16},${y+9}" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+10},${y+6} ${x+16},${y+9} ${x+16},${y+15} ${x+10},${y+12}" fill="#a8763f" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+22},${y+6} ${x+16},${y+9} ${x+16},${y+15} ${x+22},${y+12}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.6"/>
        ` : ''}
        ${lvl >= 7 ? `
            <polygon points="${x-42},${y-14} ${x-36},${y-17} ${x-30},${y-14} ${x-31.5},${y+6} ${x-36},${y+8} ${x-40.5},${y+6}" fill="#f0e6d2" stroke="#2a1a0e" stroke-width="0.8"/>
            <polygon points="${x-42},${y-14} ${x-36},${y-17} ${x-36},${y+8} ${x-40.5},${y+6}" fill="#f7efe0"/>
            <polygon points="${x-40.8},${y-4} ${x-31.2},${y-4} ${x-31.8},${y+1} ${x-40.2},${y+1}" fill="#b3402e" stroke="#2a1a0e" stroke-width="0.5"/>
            <rect x="${x-39.5}" y="${y-13.5}" width="7" height="4.5" rx="1" fill="#1d3c6e" stroke="#2a1a0e" stroke-width="0.6"/>
            <rect x="${x-38.6}" y="${y-12.8}" width="5.2" height="3.1" fill="#ffd773">
                <animate attributeName="opacity" values="1;0.15;1" dur="2s" repeatCount="indefinite"/>
            </rect>
            <polygon points="${x-41},${y-14.5} ${x-31},${y-14.5} ${x-36},${y-19.5}" fill="#b3402e" stroke="#2a1a0e" stroke-width="0.7"/>
        ` : ''}
    `,

    researchlab: (x, y, lvl) => `
        ${SHADOW(x, y, 40)}
        <!-- stone terrace -->
        <polygon points="${x-34},${y-2} ${x},${y-19} ${x+34},${y-2} ${x},${y+15}" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-34},${y-2} ${x},${y+15} ${x},${y+22} ${x-34},${y+5}" fill="#9aa3ab" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+34},${y-2} ${x},${y+15} ${x},${y+22} ${x+34},${y+5}" fill="#6b7280" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- scholar's tower (deep blue, iso box) -->
        <polygon points="${x-24},${y-34} ${x},${y-46} ${x+24},${y-34} ${x},${y-22}" fill="#3a6ab0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-24},${y-34} ${x},${y-22} ${x},${y+10} ${x-24},${y-2}" fill="#2c5aa0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+24},${y-34} ${x},${y-22} ${x},${y+10} ${x+24},${y-2}" fill="#1d3c6e" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-24}" y1="${y-34}" x2="${x}" y2="${y-22}" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
        <!-- coursed ashlar: mortar lines every 5px with staggered vertical joints,
             so the tower reads as cut stone rather than a painted blue box -->
        ${[5,10,15,20,25,30].map((d,i) => `
            <line x1="${x-24}" y1="${y-34+d}" x2="${x}" y2="${y-22+d}" stroke="#24488a" stroke-width="0.55" opacity="0.9"/>
            <line x1="${x}" y1="${y-22+d}" x2="${x+24}" y2="${y-34+d}" stroke="#16305a" stroke-width="0.55" opacity="0.9"/>
            ${[0.3,0.66].map(f => `
                <line x1="${x-24+24*((f+i*0.17)%1)}" y1="${y-34+d+12*((f+i*0.17)%1)}" x2="${x-24+24*((f+i*0.17)%1)}" y2="${y-29+d+12*((f+i*0.17)%1)}" stroke="#24488a" stroke-width="0.45" opacity="0.7"/>
                <line x1="${x+24-24*((f+i*0.23)%1)}" y1="${y-34+d+12*((f+i*0.23)%1)}" x2="${x+24-24*((f+i*0.23)%1)}" y2="${y-29+d+12*((f+i*0.23)%1)}" stroke="#16305a" stroke-width="0.45" opacity="0.7"/>
            `).join('')}
        `).join('')}
        <!-- corner quoins down the leading edge -->
        ${[0,1,2,3,4,5].map(i => `<rect x="${x-2}" y="${y-22+i*5.4}" width="4" height="3.4" fill="#4a7cc4" opacity="0.55"/>`).join('')}
        <!-- glowing arcane windows -->
        ${[[-16, -14], [-16, 1]].map(([dx, dy]) => `
            <rect x="${x + dx - 2.6}" y="${y + dy - 6.5}" width="5.2" height="9" rx="2.6" fill="#10213c" stroke="#2a1a0e" stroke-width="0.6"/>
            <rect x="${x + dx - 1.6}" y="${y + dy - 5.5}" width="3.2" height="7" rx="1.6" fill="#7fd8ff">
                <animate attributeName="opacity" values="0.45;1;0.45" dur="2.8s" repeatCount="indefinite" begin="${dy * 0.1}s"/>
            </rect>
        `).join('')}
        <rect x="${x + 13.4}" y="${y - 19.5}" width="5.2" height="9" rx="2.6" fill="#10213c" stroke="#2a1a0e" stroke-width="0.6"/>
        <rect x="${x + 14.4}" y="${y - 18.5}" width="3.2" height="7" rx="1.6" fill="#7fd8ff">
            <animate attributeName="opacity" values="1;0.45;1" dur="2.8s" repeatCount="indefinite"/>
        </rect>
        <!-- arcane door -->
        <path d="M ${x + 4} ${y + 8} L ${x + 4} ${y - 3} Q ${x + 8.5} ${y - 8} ${x + 13} ${y - 7.5} L ${x + 13} ${y + 3.5} Z" fill="#10213c" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M ${x + 5.4} ${y + 6.6} L ${x + 5.4} ${y - 2.4} Q ${x + 8.5} ${y - 6} ${x + 11.6} ${y - 5.8} L ${x + 11.6} ${y + 4.4} Z" fill="#1b3660"/>
        <circle cx="${x + 8.5}" cy="${y - 1}" r="1.2" fill="#7fd8ff" opacity="0.9">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- observatory drum + brass dome -->
        <ellipse cx="${x}" cy="${y-34}" rx="17" ry="7.5" fill="#22467e" stroke="#2a1a0e" stroke-width="0.8"/>
        <path d="M ${x-17} ${y-36} L ${x-17} ${y-34} A 17 7.5 0 0 0 ${x+17} ${y-34} L ${x+17} ${y-36} Z" fill="#2c5aa0" stroke="#2a1a0e" stroke-width="0.7"/>
        <path d="M ${x-16.5} ${y-37} A 16.5 14.5 0 0 1 ${x+16.5} ${y-37} Q ${x+8} ${y-32.5} ${x} ${y-32} Q ${x-8} ${y-32.5} ${x-16.5} ${y-37} Z" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-16.5} ${y-37} A 16.5 14.5 0 0 1 ${x-2} ${y-51.4} Q ${x-9.5} ${y-45.5} ${x-12.5} ${y-40.5} Z" fill="#f4c44d"/>
        <path d="M ${x+16.5} ${y-37} A 16.5 14.5 0 0 0 ${x+7} ${y-50.3} Q ${x+10.5} ${y-44} ${x+12.5} ${y-40}" fill="#a8791f"/>
        <ellipse cx="${x-6}" cy="${y-46}" rx="3.2" ry="2.2" fill="rgba(255,255,255,0.5)"/>
        <line x1="${x+1}" y1="${y-51.5}" x2="${x+3.5}" y2="${y-33}" stroke="#2a1a0e" stroke-width="1.1"/>
        <!-- brass telescope out of the slit -->
        <line x1="${x+2.5}" y1="${y-42}" x2="${x+13}" y2="${y-54}" stroke="#a8791f" stroke-width="2.6"/>
        <line x1="${x+2.5}" y1="${y-42}" x2="${x+13}" y2="${y-54}" stroke="#f4c44d" stroke-width="1.1"/>
        <circle cx="${x+13.5}" cy="${y-54.5}" r="1.7" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.6"/>
        <!-- orbiting arcane motes -->
        <g class="sparkle-fx">
            <circle cx="${x + 20}" cy="${y - 44}" r="1.7" fill="#7fd8ff"/>
            <polygon points="${x-21},${y-28} ${x-19.5},${y-24.5} ${x-21},${y-21} ${x-22.5},${y-24.5}" fill="#bfeaff" style="animation-delay:.6s"/>
            <circle cx="${x - 15}" cy="${y - 50}" r="1.2" fill="#e6f6ff" style="animation-delay:1.1s"/>
        </g>
        ${lvl >= 4 ? `
            <polygon points="${x-24},${y-34} ${x},${y-22} ${x+24},${y-34} ${x+24},${y-31} ${x},${y-19} ${x-24},${y-31}" fill="none" stroke="#f4c44d" stroke-width="1.2" opacity="0.9"/>
            <circle cx="${x}" cy="${y-20.5}" r="1.6" fill="#f4c44d" stroke="#a8791f" stroke-width="0.5"/>
        ` : ''}
        ${lvl >= 7 ? `
            <g class="smoke-puff">
                <polygon points="${x-27},${y-44} ${x-24},${y-48} ${x-21},${y-44} ${x-24},${y-40}" fill="#7fd8ff" stroke="#e6f6ff" stroke-width="0.7"/>
            </g>
            <ellipse cx="${x}" cy="${y-42}" rx="22" ry="14" fill="#7fd8ff" opacity="0.08">
                <animate attributeName="opacity" values="0.04;0.14;0.04" dur="3.5s" repeatCount="indefinite"/>
            </ellipse>
        ` : ''}
    `,

    barracks: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        ${WORN_PATH(x - 17, y + 17, 14)}
        <!-- great hall: coursed ashlar with quoined corners -->
        ${_pg([[x - 26, y - 24], [x, y - 37], [x + 26, y - 24], [x, y - 11]], '#8b95a0', OUTLINE, 0.9)}
        ${STONEWORK([x - 26, y - 24], [x, y - 11], [x, y + 15], [x - 26, y + 2], 5, 10, '#c2cad2', '#8b95a0', 5)}
        ${STONEWORK([x, y - 11], [x + 26, y - 24], [x + 26, y + 2], [x, y + 15], 5, 10, '#8b95a0', '#5d6673', 8)}
        ${RIM([x - 26, y - 24], [x, y - 11])}
        ${DAMP([x - 26, y + 2], [x, y + 15], 4)}
        ${QUOINS(x, y + 15, 26, 0.5, 7, '#dee4ea', '#a9b2bb', -1)}
        ${QUOINS(x, y + 15, 26, -0.5, 7, '#a9b2bb', '#79838f', 1)}
        ${MOSS(x - 21, y + 3, 3, 23)}
        <!-- arched gate, 16px to the crown, with iron-strapped leaves -->
        ${ISO_DOOR(x - 13, y + 8.5, 0.5, 13, 16, { wood: '#6e4a24', arch: 2.5 })}
        <!-- arrow slits: deep, narrow, splayed -->
        ${ISO_WIN(x - 21, y - 2, 0.5, 3.4, 9, {})}
        ${ISO_WIN(x + 11, y + 1, -0.5, 3.4, 9, {})}
        ${ISO_WIN(x + 21, y - 4, -0.5, 3.4, 9, {})}
        <!-- painted shields hung out along the hall wall -->
        <path d="M ${x - 24} ${y - 10} l 4 -2 l 4 2 l 0 4.4 q 0 3.4 -4 5 q -4 -1.6 -4 -5 Z" fill="#b3402e" stroke="#f4c44d" stroke-width="0.7"/>
        <path d="M ${x + 15} ${y - 10} l 4 -2 l 4 2 l 0 4.4 q 0 3.4 -4 5 q -4 -1.6 -4 -5 Z" fill="#1d3c6e" stroke="#c2912c" stroke-width="0.7"/>
        <!-- crossed swords over the gate -->
        ${_seg([[[x - 20, y - 15], [x - 8, y - 9]]], '#dfe7ee', 1.7)}
        ${_seg([[[x - 20, y - 9], [x - 8, y - 15]]], '#aeb8c4', 1.7)}
        ${_pg([[x - 20.6, y - 15.8], [x - 18.4, y - 14.7], [x - 19, y - 13.6], [x - 21.2, y - 14.7]], '#8a5a2b', OUTLINE, 0.4)}
        ${_pg([[x - 7.4, y - 15.8], [x - 9.6, y - 14.7], [x - 9, y - 13.6], [x - 6.8, y - 14.7]], '#8a5a2b', OUTLINE, 0.4)}
        ${EAVE_SHADOW([x - 26, y - 24], [x, y - 11], [x, y + 15], [x - 26, y + 2], 0.12)}
        ${EAVE_SHADOW([x, y - 11], [x + 26, y - 24], [x + 26, y + 2], [x, y + 15], 0.12)}
        <!-- tiled hip roof, seven courses a plane, 4px overhang -->
        ${SHINGLES([x, y - 48], [x, y - 48], [x, y - 7], [x - 30, y - 22], 7, 7, '#d9705a', '#8c2f20', 12)}
        ${SHINGLES([x, y - 48], [x, y - 48], [x + 30, y - 22], [x, y - 7], 7, 7, '#a83c28', '#631f14', 16)}
        ${_pg([[x - 26, y - 30], [x - 20, y - 27], [x - 21, y - 23], [x - 27, y - 26]], '#c25a45', '#8c2f20', 0.5)}
        ${_pg([[x - 30, y - 22], [x, y - 7], [x, y - 4.6], [x - 30, y - 19.6]], '#7a5228', OUTLINE, 0.7)}
        ${_pg([[x, y - 7], [x + 30, y - 22], [x + 30, y - 19.6], [x, y - 4.6]], '#523618', OUTLINE, 0.7)}
        ${_ln([x - 30, y - 22], [x, y - 7], 'rgba(255,235,220,0.5)', 0.6)}
        ${_ln([x, y - 48], [x, y - 7], '#e08a72', 1.7)}
        ${_seg([[[x, y - 48], [x - 30, y - 22]], [[x, y - 48], [x + 30, y - 22]]], '#b84a34', 1.4)}
        ${MOSS(x - 8, y - 11, 2, 29, '#6f8a3e')}
        <!-- flanking drum towers, battered base and conical roof -->
        ${[[-35, 1], [35, -1]].map(([dx, sd]) => `
            ${_pg([[x + dx - 10, y - 33], [x + dx, y - 38], [x + dx + 10, y - 33], [x + dx, y - 28]], '#79838f', OUTLINE, 0.8)}
            ${STONEWORK([x + dx - 10, y - 33], [x + dx, y - 28], [x + dx, y - 2], [x + dx - 10, y - 7], 6, 7, sd > 0 ? '#c2cad2' : '#a9b2bb', '#828c97', 33 + dx)}
            ${STONEWORK([x + dx, y - 28], [x + dx + 10, y - 33], [x + dx + 10, y - 7], [x + dx, y - 2], 6, 7, sd > 0 ? '#8b95a0' : '#79838f', '#535c68', 37 + dx)}
            ${_pg([[x + dx - 12, y - 5], [x + dx, y + 1], [x + dx + 12, y - 5], [x + dx + 12, y - 1], [x + dx, y + 5], [x + dx - 12, y - 1]], '#8b95a0', OUTLINE, 0.7)}
            ${_ln([x + dx - 12, y - 5], [x + dx, y + 1], 'rgba(255,255,255,0.4)', 0.7)}
            ${_ln([x + dx - 10, y - 33], [x + dx, y - 28], 'rgba(255,248,235,0.45)', 0.9)}
            ${ISO_WIN(x + dx - 4, y - 12, 0.5, 3.2, 8, {})}
            ${SHINGLES([x + dx, y - 56], [x + dx, y - 56], [x + dx, y - 26], [x + dx - 11, y - 32], 6, 6, '#d9705a', '#8c2f20', 41)}
            ${SHINGLES([x + dx, y - 56], [x + dx, y - 56], [x + dx + 11, y - 32], [x + dx, y - 26], 6, 6, '#a83c28', '#631f14', 45)}
            ${_ln([x + dx, y - 56], [x + dx, y - 26], '#e08a72', 1.4)}
            ${_pg([[x + dx - 11, y - 32], [x + dx, y - 26], [x + dx, y - 24], [x + dx - 11, y - 30]], '#7a5228', OUTLINE, 0.6)}
            ${_pg([[x + dx, y - 26], [x + dx + 11, y - 32], [x + dx + 11, y - 30], [x + dx, y - 24]], '#523618', OUTLINE, 0.6)}
            ${MOSS(x + dx - 7, y - 4, 2, 47 + dx)}
        `).join('')}
        ${FLAG(x - 35, y - 57, '#b3402e')}
        ${FLAG(x + 35, y - 57, '#b3402e')}
        <!-- training dummy and a rack of spears in the yard -->
        ${_ln([x - 20, y + 22], [x - 20, y + 9], '#8a5a2b', 1.7)}
        ${_ln([x - 25, y + 12.5], [x - 15, y + 12.5], '#8a5a2b', 1.4)}
        <circle cx="${x - 20}" cy="${y + 7.6}" r="2.9" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.6"/>
        ${_ln([x - 23, y + 6.6], [x - 17, y + 6.6], '#2a1a0e', 0.5)}
        <circle cx="${x - 20}" cy="${y + 13}" r="1.5" fill="#b3402e" stroke="#2a1a0e" stroke-width="0.4"/>
        ${_seg([[[x - 27, y + 10.5], [x - 26, y + 13.6]], [[x - 14, y + 11], [x - 13.4, y + 14]]], '#c9b49a', 1)}
        ${_seg([[[x + 12, y + 21], [x + 26, y + 14]], [[x + 13, y + 18], [x + 13, y + 22]], [[x + 25, y + 12], [x + 25, y + 16]]], '#8a5a2b', 1.4)}
        ${_seg([[[x + 15, y + 19.5], [x + 16, y + 8]], [[x + 19, y + 18], [x + 20, y + 6.5]], [[x + 23, y + 16], [x + 23.6, y + 5]]], '#7a5228', 1.1)}
        ${_seg([[[x + 16, y + 8], [x + 16, y + 5]], [[x + 20, y + 6.5], [x + 20, y + 3.5]], [[x + 23.6, y + 5], [x + 23.6, y + 2]]], '#c3ccd6', 1.4)}
        ${lvl >= 4 ? `
            <!-- muster banner over the gate + a brazier lit at the door -->
            ${_pg([[x + 2, y - 14], [x + 9, y - 17.5], [x + 9, y - 2], [x + 5.5, y - 6], [x + 2, y - 4]], '#2c5aa0', '#1d3c6e', 0.6)}
            ${_pg([[x + 2, y - 14], [x + 9, y - 17.5], [x + 9, y - 14.6], [x + 2, y - 11.1]], 'rgba(255,255,255,0.22)')}
            <circle cx="${x + 5.5}" cy="${y - 9.5}" r="1.6" fill="#f4c44d"/>
            ${_ln([x - 29, y + 18], [x - 29, y + 11], '#4f5663', 1.4)}
            ${_pg([[x - 33, y + 11], [x - 25, y + 11], [x - 26.5, y + 7.5], [x - 31.5, y + 7.5]], '#3f434a', OUTLINE, 0.6)}
            <path d="M ${x - 31} ${y + 7.5} q 1.6 -4.6 3 -1.6 q 1.4 -3.4 2.6 1.6 Z" fill="#f59e2d" stroke="#b3402e" stroke-width="0.5">
                <animate attributeName="opacity" values="0.7;1;0.7" dur="0.9s" repeatCount="indefinite"/>
            </path>
            <ellipse cx="${x - 29}" cy="${y + 6}" rx="5" ry="4" fill="#ffca5f" opacity="0.16">
                <animate attributeName="opacity" values="0.08;0.24;0.08" dur="0.9s" repeatCount="indefinite"/>
            </ellipse>
        ` : ''}
        ${lvl >= 7 ? `
            <!-- gilded finials and eave trim on all three roofs -->
            ${_seg([[[x - 30, y - 22], [x, y - 7]], [[x, y - 7], [x + 30, y - 22]]], '#f4c44d', 1.5)}
            <circle cx="${x}" cy="${y - 49.5}" r="2" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
            ${_pg([[x - 37.5, y - 57], [x - 35, y - 63], [x - 32.5, y - 57], [x - 35, y - 55]], '#f4c44d', '#a8791f', 0.5)}
            ${_pg([[x + 37.5, y - 57], [x + 35, y - 63], [x + 32.5, y - 57], [x + 35, y - 55]], '#f4c44d', '#a8791f', 0.5)}
            ${ISO_WIN(x - 16, y - 16, 0.5, 5, 7, {})}
        ` : ''}
    `,

    stable: (x, y, lvl) => `
        ${SHADOW(x, y, 44)}
        <!-- PROPORTION FIX: the roof used to be 2.3x the wall height, so the
             building read as a giant hat over a sliver of wall. A stable needs
             headroom for horses: walls are now the dominant mass and the roof
             sits at a low, working pitch over them. -->
        <!-- stone footing course -->
        <polygon points="${x-36},${y-2} ${x},${y+16} ${x},${y+21} ${x-36},${y+3}" fill="#8d857a" stroke="#2a1a0e" stroke-width="0.7"/>
        <polygon points="${x+36},${y-2} ${x},${y+16} ${x},${y+21} ${x+36},${y+3}" fill="#6f675d" stroke="#2a1a0e" stroke-width="0.7"/>
        ${[0.25,0.5,0.75].map(f => `<line x1="${x-36+36*f}" y1="${y-2+18*f}" x2="${x-36+36*f}" y2="${y+3+18*f}" stroke="#6f675d" stroke-width="0.4"/>
            <line x1="${x+36-36*f}" y1="${y-2+18*f}" x2="${x+36-36*f}" y2="${y+3+18*f}" stroke="#544d45" stroke-width="0.4"/>`).join('')}
        <!-- timber plank walls (tall) -->
        <polygon points="${x-36},${y-22} ${x},${y-40} ${x+36},${y-22} ${x},${y-4}" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-36},${y-22} ${x},${y-4} ${x},${y+16} ${x-36},${y-2}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+36},${y-22} ${x},${y-4} ${x},${y+16} ${x+36},${y-2}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.9"/>
        <!-- individual planks with seams and a couple of knots -->
        ${[4,8,12,16].map(d => `
            <line x1="${x-36}" y1="${y-22+d}" x2="${x}" y2="${y-4+d}" stroke="#6f4722" stroke-width="0.5"/>
            <line x1="${x}" y1="${y-4+d}" x2="${x+36}" y2="${y-22+d}" stroke="#54371a" stroke-width="0.5"/>
        `).join('')}
        <ellipse cx="${x-22}" cy="${y-6}" rx="1.1" ry="0.7" fill="#6f4722" opacity="0.8"/>
        <ellipse cx="${x+17}" cy="${y-3}" rx="1" ry="0.6" fill="#4a2e16" opacity="0.8"/>
        <line x1="${x-36}" y1="${y-22}" x2="${x}" y2="${y-4}" stroke="rgba(255,255,255,0.32)" stroke-width="0.8"/>
        <!-- corner posts -->
        <rect x="${x-1.6}" y="${y-4}" width="3.2" height="20" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.5"/>
        <!-- two dutch stall doors, lower halves shut -->
        ${[[-26,-6],[-11,1]].map(([dx,dy]) => `
            <path d="M ${x+dx-5} ${y+dy+7} L ${x+dx-5} ${y+dy-7} L ${x+dx+5} ${y+dy-2} L ${x+dx+5} ${y+dy+12} Z" fill="#3f2712" stroke="#2a1a0e" stroke-width="0.8"/>
            <path d="M ${x+dx-5} ${y+dy+1} L ${x+dx+5} ${y+dy+6} L ${x+dx+5} ${y+dy+12} L ${x+dx-5} ${y+dy+7} Z" fill="#5a3a18" stroke="#2a1a0e" stroke-width="0.7"/>
            <line x1="${x+dx-5}" y1="${y+dy+4}" x2="${x+dx+5}" y2="${y+dy+9}" stroke="#734a1e" stroke-width="0.5"/>
            <circle cx="${x+dx+3}" cy="${y+dy+4.5}" r="0.7" fill="#c9a227"/>
        `).join('')}
        <!-- LOW-PITCH thatched hip roof with a deep overhang -->
        <polygon points="${x-44},${y-22} ${x},${y-46} ${x},${y-2}" fill="#e6bc63" stroke="#2a1a0e" stroke-width="1"/>
        <polygon points="${x+44},${y-22} ${x},${y-46} ${x},${y-2}" fill="#b98a35" stroke="#2a1a0e" stroke-width="1"/>
        ${[0.14,0.29,0.44,0.59,0.74,0.88].map(t => `
            <line x1="${x-44+44*t}" y1="${y-22-24*t}" x2="${x}" y2="${y-2-44*t}" stroke="#c39a44" stroke-width="1.5" opacity="0.85"/>
            <line x1="${x-44+44*t}" y1="${y-21+(-24*t)}" x2="${x}" y2="${y-1-44*t}" stroke="#8a6420" stroke-width="0.6" opacity="0.45"/>
            <line x1="${x+44-44*t}" y1="${y-22-24*t}" x2="${x}" y2="${y-2-44*t}" stroke="#9c732c" stroke-width="1.5" opacity="0.85"/>
            <line x1="${x+44-44*t}" y1="${y-21+(-24*t)}" x2="${x}" y2="${y-1-44*t}" stroke="#6d4d16" stroke-width="0.6" opacity="0.45"/>
        `).join('')}
        <!-- ragged eave fringe under the overhang -->
        ${[0.16,0.34,0.52,0.7,0.88].map(f => `
            <path d="M ${x-44+44*f} ${y-22+20*f} l -0.6 ${2.4+((f*31)%2)}" stroke="#a87c2e" stroke-width="0.9" stroke-linecap="round"/>
            <path d="M ${x+44-44*f} ${y-22+20*f} l 0.6 ${2.4+((f*47)%2)}" stroke="#7d5a1c" stroke-width="0.9" stroke-linecap="round"/>
        `).join('')}
        <line x1="${x}" y1="${y-46}" x2="${x}" y2="${y-2}" stroke="#7d5a1c" stroke-width="2.6"/>
        <line x1="${x}" y1="${y-46}" x2="${x}" y2="${y-2}" stroke="rgba(255,246,214,0.45)" stroke-width="0.9"/>
        <ellipse cx="${x-8}" cy="${y-26}" rx="3.4" ry="1.6" fill="#5e7a34" opacity="0.4"/>
        <!-- eave shadow cast onto the wall below -->
        <polygon points="${x-36},${y-22} ${x},${y-4} ${x},${y-1} ${x-36},${y-19}" fill="#000" opacity="0.14"/>
        <polygon points="${x},${y-4} ${x+36},${y-22} ${x+36},${y-19} ${x},${y-1}" fill="#000" opacity="0.2"/>
        <!-- horse looking over the near stall door -->
        <g class="flag-wave">
            <path d="M ${x-27} ${y-6} q -1.2 -6 2.4 -8.2 q 3.4 -1.6 4.6 1.6 q 0.8 2.4 -0.6 4.4 q 2 1.4 1.4 3.4 Z" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.7"/>
            <path d="M ${x-25.1} ${y-14.4} q -0.4 -2 1 -2.6 q 1 1 0.8 2.6 Z" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.5"/>
            <path d="M ${x-22.7} ${y-14.6} q 0.2 -2 1.6 -2.2 q 0.7 1.2 0.1 2.6 Z" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.5"/>
            <path d="M ${x-25.4} ${y-13.8} q 2.2 -1.4 3.4 0.4" stroke="#4a2e16" stroke-width="1.4" fill="none"/>
            <circle cx="${x-23.7}" cy="${y-10.8}" r="0.7" fill="#2a1a0e"/>
            <ellipse cx="${x-21.1}" cy="${y-6.4}" rx="1" ry="0.6" fill="#4a2e16"/>
        </g>
        <!-- swinging horseshoe sign -->
        <line x1="${x + 10}" y1="${y - 14}" x2="${x + 17}" y2="${y - 17.5}" stroke="#6b4520" stroke-width="1.4"/>
        <g class="flag-wave">
            <line x1="${x + 14}" y1="${y - 15.5}" x2="${x + 14}" y2="${y - 11}" stroke="#4a4438" stroke-width="0.6"/>
            <path d="M ${x + 11.5} ${y - 6.5} a 3 3 0 1 1 5 0 l -1.2 -0.6 a 1.7 1.7 0 1 0 -2.6 0 Z" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.6"/>
        </g>
        <!-- hay bales + pitchfork -->
        <ellipse cx="${x + 27}" cy="${y + 13}" rx="7.5" ry="2.6" fill="rgba(30,20,10,0.25)"/>
        <path d="M ${x + 20.5} ${y + 5} q -1.6 4.5 0 8 q 6.5 2.6 13 0 q 1.6 -3.5 0 -8 q -6.5 -2.8 -13 0 Z" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.8"/>
        <ellipse cx="${x + 27}" cy="${y + 5}" rx="6.5" ry="2.2" fill="#eec86a" stroke="#a8791f" stroke-width="0.5"/>
        <path d="M ${x + 21} ${y + 8} q 6 2.2 12 0" stroke="#a8791f" stroke-width="0.6" fill="none"/>
        <path d="M ${x + 21} ${y + 11} q 6 2.2 12 0" stroke="#a8791f" stroke-width="0.6" fill="none"/>
        <line x1="${x + 36}" y1="${y + 12}" x2="${x + 41}" y2="${y - 2}" stroke="#8a5a2b" stroke-width="1.2"/>
        ${[0, 1.8, 3.6].map(d => `<line x1="${x + 39.2 + d * 0.5}" y1="${y - 1}" x2="${x + 40 + d * 0.5}" y2="${y - 6}" stroke="#8b95a0" stroke-width="0.7"/>`).join('')}
        ${lvl >= 4 ? `
            ${FLAG(x - 42, y - 20, '#2c5aa0')}
            <ellipse cx="${x + 12}" cy="${y + 15}" rx="4.5" ry="1.6" fill="rgba(30,20,10,0.22)"/>
            <path d="M ${x + 8} ${y + 10} q -1 3 0 5.5 q 4 1.8 8 0 q 1 -2.5 0 -5.5 q -4 -1.8 -8 0 Z" fill="#d9a94a" stroke="#2a1a0e" stroke-width="0.6"/>
            <ellipse cx="${x + 12}" cy="${y + 10}" rx="4" ry="1.4" fill="#eec86a" stroke="#a8791f" stroke-width="0.4"/>
        ` : ''}
        ${lvl >= 7 ? `
            <line x1="${x-44}" y1="${y-22}" x2="${x}" y2="${y-2}" stroke="#f4c44d" stroke-width="1.6"/>
            <line x1="${x}" y1="${y-2}" x2="${x+44}" y2="${y-22}" stroke="#c2912c" stroke-width="1.6"/>
            <path d="M ${x - 2.5} ${y - 49.5} a 3 3 0 1 1 5 0 l -1.2 -0.6 a 1.7 1.7 0 1 0 -2.6 0 Z" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
            ${LIT_WINDOW(x + 14, y - 14, 5, 6)}
        ` : ''}
    `,

    fortress: (x, y, lvl) => `
        ${SHADOW(x, y, 48)}
        <!-- curtain wall (iso box) -->
        <polygon points="${x-42},${y-10} ${x},${y-31} ${x+42},${y-10} ${x},${y+11}" fill="#a4adb5" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-42},${y-10} ${x},${y+11} ${x},${y+22} ${x-42},${y+1}" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+42},${y-10} ${x},${y+11} ${x},${y+22} ${x+42},${y+1}" fill="#5d6673" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-42}" y1="${y-10}" x2="${x}" y2="${y+11}" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
        <line x1="${x-34}" y1="${y-2}" x2="${x-12}" y2="${y+9}" stroke="#79828c" stroke-width="0.5"/>
        <line x1="${x+12}" y1="${y+10}" x2="${x+34}" y2="${y-1}" stroke="#4d5663" stroke-width="0.5"/>
        <!-- battlement walk on the wall top -->
        ${[[-36, -10], [-27, -14.5], [-18, -19], [18, -19], [27, -14.5], [36, -10]].map(([dx, dy]) => `
            <polygon points="${x+dx-2.5},${y+dy-2} ${x+dx+2.5},${y+dy+0.5} ${x+dx+2.5},${y+dy-5} ${x+dx-2.5},${y+dy-7.5}" fill="${dx < 0 ? '#b6bec5' : '#79828c'}" stroke="#2a1a0e" stroke-width="0.5"/>
        `).join('')}
        <!-- corner towers -->
        <polygon points="${x-45},${y-16} ${x-36},${y-20.5} ${x-27},${y-16} ${x-27},${y+2} ${x-36},${y+6.5} ${x-45},${y+2}" fill="#9aa3ab" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-45},${y-16} ${x-36},${y-20.5} ${x-36},${y+6.5} ${x-45},${y+2}" fill="#b6bec5"/>
        <path d="M ${x-47} ${y-15} L ${x-36} ${y-35} L ${x-25} ${y-15} Q ${x-30.5} ${y-19} ${x-36} ${y-19} Q ${x-41.5} ${y-19} ${x-47} ${y-15} Z" fill="#2c5aa0" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-47} ${y-15} L ${x-36} ${y-35} L ${x-36} ${y-19} Q ${x-41.5} ${y-19} ${x-47} ${y-15} Z" fill="#4d79c0"/>
        <polygon points="${x+27},${y-16} ${x+36},${y-20.5} ${x+45},${y-16} ${x+45},${y+2} ${x+36},${y+6.5} ${x+27},${y+2}" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+27},${y-16} ${x+36},${y-20.5} ${x+36},${y+6.5} ${x+27},${y+2}" fill="#9aa3ab"/>
        <polygon points="${x+36},${y-20.5} ${x+45},${y-16} ${x+45},${y+2} ${x+36},${y+6.5}" fill="#5d6673" stroke="#2a1a0e" stroke-width="0.7"/>
        <path d="M ${x+25} ${y-15} L ${x+36} ${y-35} L ${x+47} ${y-15} Q ${x+41.5} ${y-19} ${x+36} ${y-19} Q ${x+30.5} ${y-19} ${x+25} ${y-15} Z" fill="#2c5aa0" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x+25} ${y-15} L ${x+36} ${y-35} L ${x+36} ${y-19} Q ${x+30.5} ${y-19} ${x+25} ${y-15} Z" fill="#1d3c6e"/>
        ${LIT_WINDOW(x - 38.5, y - 10, 4, 5.5)}
        ${LIT_WINDOW(x + 33.5, y - 10, 4, 5.5)}
        <!-- central keep, tall -->
        <polygon points="${x-16},${y-38} ${x},${y-46} ${x+16},${y-38} ${x},${y-30}" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-16},${y-38} ${x},${y-30} ${x},${y-2} ${x-16},${y-10}" fill="#9aa3ab" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+16},${y-38} ${x},${y-30} ${x},${y-2} ${x+16},${y-10}" fill="#6b7280" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-16}" y1="${y-38}" x2="${x}" y2="${y-30}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
        <line x1="${x-14}" y1="${y-26}" x2="${x-2}" y2="${y-20}" stroke="#828c96" stroke-width="0.5"/>
        <line x1="${x+2}" y1="${y-20}" x2="${x+14}" y2="${y-26}" stroke="#565f6a" stroke-width="0.5"/>
        ${LIT_WINDOW(x - 11, y - 27, 4.5, 6)}
        ${LIT_WINDOW(x + 6.5, y - 27, 4.5, 6)}
        <!-- keep spire (royal blue) -->
        <path d="M ${x-18} ${y-37} L ${x} ${y-64} L ${x+18} ${y-37} Q ${x+9} ${y-42.5} ${x} ${y-42.5} Q ${x-9} ${y-42.5} ${x-18} ${y-37} Z" fill="#2c5aa0" stroke="#2a1a0e" stroke-width="1"/>
        <path d="M ${x-18} ${y-37} L ${x} ${y-64} L ${x} ${y-42.5} Q ${x-9} ${y-42.5} ${x-18} ${y-37} Z" fill="#4d79c0"/>
        <circle cx="${x}" cy="${y-65}" r="2" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
        <!-- gatehouse with portcullis -->
        <path d="M ${x - 10} ${y + 12} L ${x - 10} ${y - 3} Q ${x - 5} ${y - 9} ${x} ${y - 4} L ${x} ${y + 17} Z" fill="#20160c" stroke="#2a1a0e" stroke-width="0.9"/>
        ${[-8, -5.5, -3].map(dx => `<line x1="${x + dx}" y1="${y + 10 + dx}" x2="${x + dx}" y2="${y + 15.5 + dx * 0.5}" stroke="#8b95a0" stroke-width="0.8"/>`).join('')}
        <line x1="${x - 9}" y1="${y + 4}" x2="${x - 1}" y2="${y + 8}" stroke="#8b95a0" stroke-width="0.8"/>
        <line x1="${x - 9}" y1="${y + 8}" x2="${x - 1}" y2="${y + 12}" stroke="#8b95a0" stroke-width="0.8"/>
        <!-- royal banners -->
        ${FLAG(x, y - 64, '#2c5aa0')}
        ${FLAG(x - 36, y - 33, '#2c5aa0')}
        ${FLAG(x + 36, y - 33, '#2c5aa0')}
        <!-- gold lion crest on shaded wall -->
        <path d="M ${x + 14} ${y - 2} l 5.5 -2.8 l 5.5 2.8 l 0 5.5 q 0 4.4 -5.5 6.4 q -5.5 -2 -5.5 -6.4 Z" fill="#1d3c6e" stroke="#f4c44d" stroke-width="0.9"/>
        <path d="M ${x + 19.5} ${y - 1.6} l 1.1 2.5 2.7 0.3 -2 1.9 0.5 2.7 -2.3 -1.4 -2.3 1.4 0.5 -2.7 -2 -1.9 2.7 -0.3 Z" fill="#f4c44d"/>
        ${lvl >= 4 ? `
            <line x1="${x-18}" y1="${y-37}" x2="${x+18}" y2="${y-37}" stroke="#f4c44d" stroke-width="1.3"/>
            <circle cx="${x-36}" cy="${y-36}" r="1.6" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.5"/>
            <circle cx="${x+36}" cy="${y-36}" r="1.6" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.5"/>
        ` : ''}
        ${lvl >= 7 ? `
            <g class="sparkle-fx">
                <polygon points="${x-8},${y-56} ${x-6.8},${y-53.5} ${x-8},${y-51} ${x-9.2},${y-53.5}" fill="#bcd2f2"/>
                <polygon points="${x+9},${y-50} ${x+10},${y-48} ${x+9},${y-46} ${x+8},${y-48}" fill="#bcd2f2" style="animation-delay:.7s"/>
            </g>
            <path d="M ${x-13} ${y+14} q -2.5 -1.2 -2.2 -4" stroke="#4c8a4c" stroke-width="1.1" fill="none"/>
            <path d="M ${x-14.5} ${y+12} q -3.5 0.5 -5 -2.5" stroke="#4c8a4c" stroke-width="1" fill="none"/>
            <ellipse cx="${x}" cy="${y-45}" rx="24" ry="16" fill="#7fb2e8" opacity="0.07">
                <animate attributeName="opacity" values="0.04;0.12;0.04" dur="4s" repeatCount="indefinite"/>
            </ellipse>
        ` : ''}
    `,

    wall: (x, y, lvl) => `
        ${SHADOW(x, y, 38)}
        <!-- low rampart (iso box) -->
        <polygon points="${x-36},${y-6} ${x},${y-24} ${x+36},${y-6} ${x},${y+12}" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-36},${y-6} ${x},${y+12} ${x},${y+22} ${x-36},${y+4}" fill="#9aa3ab" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+36},${y-6} ${x},${y+12} ${x},${y+22} ${x+36},${y+4}" fill="#6b7280" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-36}" y1="${y-6}" x2="${x}" y2="${y+12}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
        <!-- coursed masonry: two mortar courses per face with staggered vertical
             joints, so the rampart reads as stacked blocks instead of a grey slab -->
        ${[3.5, 7].map((d, row) => `
            <line x1="${x-36}" y1="${y-6+d+ (18-d)}" x2="${x}" y2="${y+12+d}" stroke="#7d8790" stroke-width="0.45" opacity="0"/>
            <line x1="${x-36}" y1="${y-6+18+d}" x2="${x}" y2="${y+12+d}" stroke="#828c96" stroke-width="0.5"/>
            <line x1="${x}" y1="${y+12+d}" x2="${x+36}" y2="${y-6+18+d}" stroke="#5b646e" stroke-width="0.5"/>
            ${[0.18,0.42,0.66,0.9].map(f => `
                <line x1="${x-36+36*((f+row*0.14)%1)}" y1="${y+12-18*(1-((f+row*0.14)%1))+d}" x2="${x-36+36*((f+row*0.14)%1)}" y2="${y+15.5-18*(1-((f+row*0.14)%1))+d}" stroke="#828c96" stroke-width="0.42"/>
                <line x1="${x+36-36*((f+row*0.26)%1)}" y1="${y+12-18*(1-((f+row*0.26)%1))+d}" x2="${x+36-36*((f+row*0.26)%1)}" y2="${y+15.5-18*(1-((f+row*0.26)%1))+d}" stroke="#5b646e" stroke-width="0.42"/>
            `).join('')}
        `).join('')}
        <!-- weathering: damp staining at the footing -->
        <polygon points="${x-36},${y+1} ${x},${y+19} ${x},${y+22} ${x-36},${y+4}" fill="#4e5761" opacity="0.35"/>
        <polygon points="${x},${y+19} ${x+36},${y+1} ${x+36},${y+4} ${x},${y+22}" fill="#3f4750" opacity="0.4"/>
        <!-- walkway inset on top -->
        <polygon points="${x-29},${y-6.5} ${x},${y-21} ${x+29},${y-6.5} ${x},${y+8}" fill="#9aa3ab" stroke="#79828c" stroke-width="0.6"/>
        <!-- merlons marching along both top edges -->
        ${[[-31, -8.5], [-21, -13.5], [-11, -18.5]].map(([dx, dy]) => `
            <polygon points="${x+dx-3},${y+dy+1.5} ${x+dx+2},${y+dy-1} ${x+dx+2},${y+dy-7} ${x+dx-3},${y+dy-4.5}" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+dx+2},${y+dy-1} ${x+dx+4},${y+dy} ${x+dx+4},${y+dy-6} ${x+dx+2},${y+dy-7}" fill="#79828c" stroke="#2a1a0e" stroke-width="0.6"/>
        `).join('')}
        ${[[11, -18.5], [21, -13.5], [31, -8.5]].map(([dx, dy]) => `
            <polygon points="${x+dx-2},${y+dy-1} ${x+dx+3},${y+dy+1.5} ${x+dx+3},${y+dy-4.5} ${x+dx-2},${y+dy-7}" fill="#a4adb5" stroke="#2a1a0e" stroke-width="0.6"/>
            <polygon points="${x+dx-4},${y+dy} ${x+dx-2},${y+dy-1} ${x+dx-2},${y+dy-7} ${x+dx-4},${y+dy-6}" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.6"/>
        `).join('')}
        <!-- grass tufts at the footing + resting sparrow -->
        <path d="M ${x-32} ${y+8} q 0.5 -3 2 -4 M ${x-30.5} ${y+8.5} q 1.5 -2.5 3 -2.5" stroke="#4c8a4c" stroke-width="0.9" fill="none"/>
        <g class="flag-wave">
            <ellipse cx="${x-11}" cy="${y-21.5}" rx="1.7" ry="1.2" fill="#8a5a2b"/>
            <circle cx="${x-12.4}" cy="${y-22.6}" r="0.9" fill="#a8763f"/>
            <polygon points="${x-13.2},${y-22.6} ${x-14.2},${y-22.3} ${x-13.2},${y-22}" fill="#f4c44d"/>
        </g>
        ${lvl >= 4 ? `
            <path d="M ${x - 27} ${y + 6} Q ${x - 30} ${y - 6} ${x - 24} ${y - 9} M ${x - 26.5} ${y - 1} q 2.5 -0.5 3.5 -2.5" stroke="#4c8a4c" stroke-width="1.2" fill="none"/>
            <circle cx="${x - 25.5}" cy="${y - 4}" r="1.3" fill="#3d713d"/>
        ` : ''}
        ${lvl >= 7 ? `
            <line x1="${x}" y1="${y-21}" x2="${x}" y2="${y-31}" stroke="#6b4520" stroke-width="1.6"/>
            <path d="M ${x-1.6} ${y-31} q 1.6 -4.5 3.2 0 q -0.4 2.4 -1.6 2.4 q -1.2 0 -1.6 -2.4 Z" fill="#f59e2d" stroke="#b3402e" stroke-width="0.5">
                <animate attributeName="opacity" values="0.75;1;0.75" dur="0.9s" repeatCount="indefinite"/>
            </path>
            <circle cx="${x}" cy="${y-31.5}" r="3.5" fill="#ffca5f" opacity="0.2">
                <animate attributeName="opacity" values="0.1;0.3;0.1" dur="0.9s" repeatCount="indefinite"/>
            </circle>
        ` : ''}
    `,

    archertower: (x, y, lvl) => `
        ${SHADOW(x, y, 30)}
        <!-- rocky footing -->
        <polygon points="${x-24},${y-2} ${x},${y-14} ${x+24},${y-2} ${x},${y+10}" fill="#a4adb5" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x-24},${y-2} ${x},${y+10} ${x},${y+19} ${x-24},${y+7}" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x+24},${y-2} ${x},${y+10} ${x},${y+19} ${x+24},${y+7}" fill="#5d6673" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- tapered stone shaft -->
        <path d="M ${x-13} ${y+4} L ${x-10} ${y-30} L ${x+10} ${y-30} L ${x+13} ${y+4} Q ${x} ${y+11} ${x-13} ${y+4} Z" fill="#9aa3ab" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-13} ${y+4} L ${x-10} ${y-30} L ${x-1} ${y-30} L ${x-1} ${y+8.5} Q ${x-7} ${y+8} ${x-13} ${y+4} Z" fill="#b6bec5"/>
        <line x1="${x-11.5}" y1="${y-28}" x2="${x-13.5}" y2="${y+3}" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
        <!-- stone courses -->
        <path d="M ${x-11} ${y-8} Q ${x} ${y-3} ${x+11} ${y-8}" stroke="#79828c" stroke-width="0.5" fill="none"/>
        <path d="M ${x-10.4} ${y-18} Q ${x} ${y-13.5} ${x+10.4} ${y-18}" stroke="#79828c" stroke-width="0.5" fill="none"/>
        <line x1="${x-5}" y1="${y-6}" x2="${x-5}" y2="${y-12.5}" stroke="#79828c" stroke-width="0.5"/>
        <line x1="${x+4}" y1="${y-16}" x2="${x+4}" y2="${y-22.5}" stroke="#79828c" stroke-width="0.5"/>
        <!-- glowing arrow slit -->
        <ellipse cx="${x-0.5}" cy="${y-12}" rx="4" ry="5" fill="#ffca5f" opacity="0.13"/>
        <path d="M ${x-2} ${y-17} L ${x+1} ${y-17} L ${x+1} ${y-8} L ${x-2} ${y-8} Z" fill="#2a1a0e"/>
        <rect x="${x-1.4}" y="${y-16.2}" width="1.8" height="7.4" fill="#ffd773">
            <animate attributeName="opacity" values="0.55;1;0.55" dur="2.6s" repeatCount="indefinite"/>
        </rect>
        <!-- corbelled wooden hoarding -->
        ${[-9, -4.5, 0, 4.5, 9].map(dx => `<polygon points="${x+dx-1.4},${y-30} ${x+dx+1.4},${y-30} ${x+dx+1},${y-33.5} ${x+dx-1},${y-33.5}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.4"/>`).join('')}
        <polygon points="${x-15},${y-33.5} ${x+15},${y-33.5} ${x+13.5},${y-42} ${x-13.5},${y-42}" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-15},${y-33.5} ${x-13.5},${y-42} ${x-6},${y-42} ${x-6.6},${y-33.5}" fill="#a8763f"/>
        ${[-7, 0, 7].map(dx => `<line x1="${x+dx}" y1="${y-34.5}" x2="${x+dx}" y2="${y-41}" stroke="#54371a" stroke-width="0.6"/>`).join('')}
        <!-- crenellated parapet -->
        ${[-12, -5.5, 1, 7.5].map(dx => `<rect x="${x+dx-1.6}" y="${y-46}" width="3.2" height="4.5" fill="${dx < 0 ? '#b6bec5' : '#8b95a0'}" stroke="#2a1a0e" stroke-width="0.5"/>`).join('')}
        <!-- watchful archer -->
        <circle cx="${x+3}" cy="${y-46}" r="2.2" fill="#e8b98a" stroke="#2a1a0e" stroke-width="0.5"/>
        <path d="M ${x+0.6} ${y-46.8} q 2.4 -2.4 4.8 0 l 0 -1.4 q -2.4 -1.6 -4.8 0 Z" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.4"/>
        <rect x="${x+0.8}" y="${y-44.4}" width="4.4" height="3.8" rx="1" fill="#4c7a3c" stroke="#2a1a0e" stroke-width="0.5"/>
        <path d="M ${x+7.5} ${y-49} q 3.5 3.6 0 7.2" stroke="#6b4520" stroke-width="1" fill="none"/>
        <line x1="${x+7.5}" y1="${y-49}" x2="${x+7.5}" y2="${y-41.8}" stroke="#d9cbb0" stroke-width="0.45"/>
        <!-- conical roof (signature red) -->
        <path d="M ${x-13} ${y-48.5} L ${x} ${y-66} L ${x+13} ${y-48.5} Q ${x+6.5} ${y-52} ${x} ${y-52} Q ${x-6.5} ${y-52} ${x-13} ${y-48.5} Z" fill="#b3402e" stroke="#2a1a0e" stroke-width="0.9"/>
        <path d="M ${x-13} ${y-48.5} L ${x} ${y-66} L ${x} ${y-52} Q ${x-6.5} ${y-52} ${x-13} ${y-48.5} Z" fill="#cd5a44"/>
        ${FLAG(x, y - 65)}
        ${lvl >= 4 ? `
            <polygon points="${x+11.5},${y-44} ${x+17},${y-46.8} ${x+17},${y-33} ${x+14.2},${y-36.2} ${x+11.5},${y-34.4}" fill="#2c5aa0" stroke="#1d3c6e" stroke-width="0.6"/>
            <circle cx="${x+14.2}" cy="${y-41.5}" r="1.4" fill="#f4c44d"/>
        ` : ''}
        ${lvl >= 7 ? `
            <circle cx="${x}" cy="${y-67.5}" r="1.9" fill="#f4c44d" stroke="#2a1a0e" stroke-width="0.6"/>
            <ellipse cx="${x-0.5}" cy="${y-12}" rx="7" ry="8" fill="#ffca5f" opacity="0.12">
                <animate attributeName="opacity" values="0.06;0.2;0.06" dur="2.6s" repeatCount="indefinite"/>
            </ellipse>
            ${LIT_WINDOW(x - 7, y - 26, 3, 6)}
        ` : ''}
    `,

    cannon: (x, y, lvl) => `
        ${SHADOW(x, y, 40)}
        <!-- stone bastion (iso platform) -->
        <polygon points="${x-36},${y-4} ${x},${y-22} ${x+36},${y-4} ${x},${y+14}" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x-36},${y-4} ${x},${y+14} ${x},${y+23} ${x-36},${y+5}" fill="#9aa3ab" stroke="#2a1a0e" stroke-width="0.9"/>
        <polygon points="${x+36},${y-4} ${x},${y+14} ${x},${y+23} ${x+36},${y+5}" fill="#6b7280" stroke="#2a1a0e" stroke-width="0.9"/>
        <line x1="${x-36}" y1="${y-4}" x2="${x}" y2="${y+14}" stroke="rgba(255,255,255,0.45)" stroke-width="0.8"/>
        <line x1="${x-28}" y1="${y+2}" x2="${x-8}" y2="${y+12}" stroke="#7d8790" stroke-width="0.5"/>
        <line x1="${x+8}" y1="${y+13}" x2="${x+28}" y2="${y+3}" stroke="#565f6a" stroke-width="0.5"/>
        <!-- low merlons on the back edges -->
        ${[[-28, -8], [-19, -12.5], [-10, -17]].map(([dx, dy]) => `
            <polygon points="${x+dx-2.5},${y+dy+1} ${x+dx+2},${y+dy-1.2} ${x+dx+2},${y+dy-6} ${x+dx-2.5},${y+dy-3.8}" fill="#b6bec5" stroke="#2a1a0e" stroke-width="0.5"/>
        `).join('')}
        ${[[10, -17], [19, -12.5], [28, -8]].map(([dx, dy]) => `
            <polygon points="${x+dx-2},${y+dy-1.2} ${x+dx+2.5},${y+dy+1} ${x+dx+2.5},${y+dy-3.8} ${x+dx-2},${y+dy-6}" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.5"/>
        `).join('')}
        <!-- wooden gun carriage -->
        <polygon points="${x-16},${y-3} ${x-4},${y-9} ${x+12},${y-1} ${x},${y+5}" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x-16},${y-3} ${x},${y+5} ${x},${y+9} ${x-16},${y+1}" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.8"/>
        <polygon points="${x+12},${y-1} ${x},${y+5} ${x},${y+9} ${x+12},${y+3}" fill="#54371a" stroke="#2a1a0e" stroke-width="0.8"/>
        <!-- spoked wheels -->
        <g>
            <circle cx="${x-11}" cy="${y+4}" r="5.5" fill="#6b4520" stroke="#2a1a0e" stroke-width="1"/>
            <circle cx="${x-11}" cy="${y+4}" r="3.6" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.5"/>
            <line x1="${x-11}" y1="${y-0.6}" x2="${x-11}" y2="${y+8.6}" stroke="#2a1a0e" stroke-width="0.7"/>
            <line x1="${x-15.6}" y1="${y+4}" x2="${x-6.4}" y2="${y+4}" stroke="#2a1a0e" stroke-width="0.7"/>
            <line x1="${x-14.2}" y1="${y+0.8}" x2="${x-7.8}" y2="${y+7.2}" stroke="#2a1a0e" stroke-width="0.6"/>
            <line x1="${x-14.2}" y1="${y+7.2}" x2="${x-7.8}" y2="${y+0.8}" stroke="#2a1a0e" stroke-width="0.6"/>
            <circle cx="${x-11}" cy="${y+4}" r="1.2" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.5"/>
        </g>
        <g>
            <circle cx="${x+7}" cy="${y+7}" r="4.6" fill="#54371a" stroke="#2a1a0e" stroke-width="0.9"/>
            <circle cx="${x+7}" cy="${y+7}" r="2.9" fill="#6b4520" stroke="#2a1a0e" stroke-width="0.5"/>
            <line x1="${x+7}" y1="${y+3.2}" x2="${x+7}" y2="${y+10.8}" stroke="#2a1a0e" stroke-width="0.6"/>
            <line x1="${x+3.2}" y1="${y+7}" x2="${x+10.8}" y2="${y+7}" stroke="#2a1a0e" stroke-width="0.6"/>
            <circle cx="${x+7}" cy="${y+7}" r="1" fill="#8b95a0" stroke="#2a1a0e" stroke-width="0.4"/>
        </g>
        <!-- black iron barrel, aimed down-right -->
        <g transform="rotate(18 ${x} ${y - 10})">
            <path d="M ${x-15} ${y-14.5} Q ${x-19} ${y-10} ${x-15} ${y-5.5} L ${x+14} ${y-7.5} L ${x+14} ${y-12.5} Z" fill="#3a3f47" stroke="#2a1a0e" stroke-width="0.9"/>
            <path d="M ${x-15} ${y-14.5} Q ${x-19} ${y-10} ${x-15} ${y-5.5} L ${x-9} ${y-6} Q ${x-12.5} ${y-10} ${x-9} ${y-14} Z" fill="#4a505a"/>
            <path d="M ${x-14} ${y-13.5} L ${x+13.5} ${y-11.8}" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>
            <ellipse cx="${x+14.5}" cy="${y-10}" rx="2.2" ry="3.3" fill="#15181c" stroke="#2a1a0e" stroke-width="0.7"/>
            <ellipse cx="${x-1}" cy="${y-10}" rx="1.5" ry="4.4" fill="#5d6673" stroke="#2a1a0e" stroke-width="0.5"/>
            <ellipse cx="${x+8}" cy="${y-10}" rx="1.4" ry="3.9" fill="#5d6673" stroke="#2a1a0e" stroke-width="0.5"/>
            <circle cx="${x-16.5}" cy="${y-10}" r="1.6" fill="#2a2e34" stroke="#2a1a0e" stroke-width="0.5"/>
        </g>
        <!-- sputtering fuse -->
        <path d="M ${x-15.5} ${y-17.5} q -3 -2.5 -2 -5.5" stroke="#6b4520" stroke-width="1" fill="none"/>
        <g class="sparkle-fx">
            <polygon points="${x-17.5},${y-25} ${x-16.3},${y-23} ${x-17.5},${y-21} ${x-18.7},${y-23}" fill="#ffb347"/>
            <circle cx="${x-15.8}" cy="${y-24.5}" r="0.8" fill="#ffe9a3" style="animation-delay:.3s"/>
        </g>
        <!-- cannonball pyramid + powder keg -->
        <ellipse cx="${x+24}" cy="${y+13.5}" rx="6.5" ry="2.1" fill="rgba(30,20,10,0.3)"/>
        <circle cx="${x+21.5}" cy="${y+10.5}" r="2.7" fill="#3a3f47" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="${x+26.5}" cy="${y+10.5}" r="2.7" fill="#3a3f47" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="${x+24}" cy="${y+6.8}" r="2.7" fill="#4a505a" stroke="#2a1a0e" stroke-width="0.6"/>
        <circle cx="${x+23.2}" cy="${y+6}" r="0.9" fill="rgba(255,255,255,0.35)"/>
        <ellipse cx="${x-24}" cy="${y+10}" rx="4.8" ry="1.8" fill="rgba(30,20,10,0.28)"/>
        <path d="M ${x-28.5} ${y+1.5} q -1.5 4.2 0 8.4 q 4.5 2.2 9 0 q 1.5 -4.2 0 -8.4 q -4.5 -2.2 -9 0 Z" fill="#9a6a35" stroke="#2a1a0e" stroke-width="0.8"/>
        <ellipse cx="${x-24}" cy="${y+1.5}" rx="4.5" ry="1.7" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.5"/>
        <path d="M ${x-29.3} ${y+4} q 5.3 2.4 10.6 0" stroke="#4f5663" stroke-width="0.9" fill="none"/>
        <path d="M ${x-29.3} ${y+7.4} q 5.3 2.4 10.6 0" stroke="#4f5663" stroke-width="0.9" fill="none"/>
        ${lvl >= 4 ? `
            <ellipse cx="${x+13.5}" cy="${y-5}" rx="2.4" ry="3.2" fill="#ff8a3c" opacity="0.75" transform="rotate(18 ${x} ${y - 10})">
                <animate attributeName="opacity" values="0.35;0.9;0.35" dur="0.7s" repeatCount="indefinite"/>
            </ellipse>
            ${FLAG(x - 33, y - 6, '#b3402e')}
        ` : ''}
        ${lvl >= 7 ? `
            <g transform="rotate(18 ${x} ${y - 10})">
                <ellipse cx="${x-1}" cy="${y-10}" rx="1.7" ry="4.7" fill="#f4c44d" stroke="#a8791f" stroke-width="0.5"/>
                <ellipse cx="${x+8}" cy="${y-10}" rx="1.6" ry="4.2" fill="#f4c44d" stroke="#a8791f" stroke-width="0.5"/>
                <ellipse cx="${x+14.8}" cy="${y-10}" rx="1.4" ry="3.6" fill="#f4c44d" stroke="#a8791f" stroke-width="0.5"/>
            </g>
            <circle cx="${x+24}" cy="${y+6.8}" r="2.7" fill="#f4c44d" stroke="#a8791f" stroke-width="0.6"/>
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

function villagerSVG(id, variant, tool) {
    const v = VILLAGER_VARIANTS[variant % VILLAGER_VARIANTS.length];
    // A PERSON, not a circle on a rectangle. Built the way a figure actually
    // reads at close zoom: boots -> tapered legs -> belted tunic that flares at
    // the hem -> shoulders -> arms with hands -> neck -> head with hair, brow,
    // eyes and mouth. Light from upper-left, so the right side of every mass
    // carries a shade pass.
    const hair = v.hair || '#4a3018';
    return `<g class="villager villager-${id}">
        <ellipse cx="0.3" cy="3.4" rx="4.2" ry="1.3" fill="rgba(0,0,0,0.42)"/>
        <!-- boots -->
        <path d="M -2.7 3.2 l 0 -1.6 l 1.9 0 l 0 1.6 q -0.95 0.5 -1.9 0 Z" fill="#3a2a18" stroke="#241608" stroke-width="0.28"/>
        <path d="M 0.8 3.2 l 0 -1.6 l 1.9 0 l 0 1.6 q -0.95 0.5 -1.9 0 Z" fill="#2f2213" stroke="#241608" stroke-width="0.28"/>
        <!-- legs, tapered -->
        <path d="M -2.5 1.7 l 0.35 -3.3 l 1.5 0 l -0.15 3.3 Z" fill="${v.bodyDark}" stroke="#241608" stroke-width="0.25"/>
        <path d="M 0.65 1.7 l 0.15 -3.3 l 1.5 0 l -0.35 3.3 Z" fill="#2c2318" stroke="#241608" stroke-width="0.25"/>
        <!-- tunic: narrow at the shoulder, flaring to the hem -->
        <path d="M -2.5 -6.2 q 2.5 -0.8 5 0 l 0.85 6.1 q -3.35 1.05 -6.7 0 Z" fill="${v.body}" stroke="${v.bodyDark}" stroke-width="0.35"/>
        <path d="M 0 -6.5 l 2.5 0.3 l 0.85 6.1 q -1.65 0.5 -3.35 0.5 Z" fill="${v.bodyDark}" opacity="0.45"/>
        <!-- belt + buckle -->
        <path d="M -2.9 -2.1 q 2.9 0.85 5.8 0 l 0.12 0.95 q -3.02 0.85 -6.04 0 Z" fill="#4a3018" stroke="#241608" stroke-width="0.25"/>
        <rect x="-0.5" y="-2.05" width="1" height="0.95" fill="#c9a227"/>
        <!-- collar -->
        <path d="M -1.5 -6.35 q 1.5 0.75 3 0 l -1.5 1.5 Z" fill="${v.bodyDark}"/>
        <!-- arms + hands -->
        <path d="M -2.6 -5.9 q -1.5 1.9 -1.15 4.5 l 1.15 0.2 q 0.15 -2.4 1 -3.9 Z" fill="${v.body}" stroke="${v.bodyDark}" stroke-width="0.3"/>
        <circle cx="-3.5" cy="-1.1" r="0.75" fill="${v.skin}" stroke="#5a3818" stroke-width="0.22"/>
        <path d="M 2.6 -5.9 q 1.5 1.9 1.15 4.5 l -1.15 0.2 q -0.15 -2.4 -1 -3.9 Z" fill="${v.bodyDark}" stroke="#241608" stroke-width="0.3"/>
        <circle cx="3.5" cy="-1.1" r="0.75" fill="${v.skin}" stroke="#5a3818" stroke-width="0.22"/>
        <!-- neck -->
        <rect x="-0.7" y="-7.2" width="1.4" height="1.2" fill="${v.skin}" stroke="#5a3818" stroke-width="0.2"/>
        <!-- head: rounded jaw, not a circle -->
        <path d="M -2.2 -9.1 q 0 -2.5 2.2 -2.5 q 2.2 0 2.2 2.5 q 0 2.1 -2.2 2.4 q -2.2 -0.3 -2.2 -2.4 Z" fill="${v.skin}" stroke="#5a3818" stroke-width="0.3"/>
        <path d="M 0 -11.6 q 2.2 0 2.2 2.5 q 0 2.1 -2.2 2.4 Z" fill="#000" opacity="0.1"/>
        <!-- hair sweeping over the brow -->
        <path d="M -2.25 -9.4 q 0.2 -2.35 2.25 -2.35 q 2.05 0 2.25 2.35 q -1.1 -1.1 -2.25 -0.9 q -1.15 -0.2 -2.25 0.9 Z" fill="${hair}" stroke="#241608" stroke-width="0.22"/>
        <!-- face -->
        <circle cx="-0.75" cy="-9.15" r="0.3" fill="#2a1a0e"/>
        <circle cx="0.75" cy="-9.15" r="0.3" fill="#2a1a0e"/>
        <path d="M -0.6 -7.95 q 0.6 0.45 1.2 0" stroke="#8a5a3a" stroke-width="0.25" fill="none" stroke-linecap="round"/>
        ${v.hat ? `<path d="M -2.9 -10.7 q 2.9 -1.1 5.8 0 q -0.5 0.55 -1.15 0.55 l -3.5 0 q -0.65 0 -1.15 -0.55 Z" fill="${v.hat}" stroke="#3a2010" stroke-width="0.28"/>
        <path d="M -2 -10.75 q 2 -2.1 4 0 Z" fill="${v.hat}" stroke="#3a2010" stroke-width="0.25"/>` : ''}
        ${villagerTool(tool)}
    </g>`;
}

// The prop that tells you what a villager DOES at a glance. Held in the right
// hand; the swinging ones animate so work reads as ongoing, not posed.
function villagerTool(tool) {
    switch (tool) {
        case 'axe':    return `<g class="tool-swing"><line x1="3.4" y1="-4" x2="6.2" y2="-9.5" stroke="#6b4520" stroke-width="0.9"/>
            <path d="M 5.4 -9.2 L 8.2 -11 L 8.6 -8.2 L 6.1 -7.6 Z" fill="#c3ccd4" stroke="#4b5259" stroke-width="0.4"/></g>`;
        case 'pick':   return `<g class="tool-swing"><line x1="3.4" y1="-4" x2="6" y2="-9.6" stroke="#6b4520" stroke-width="0.9"/>
            <path d="M 3.6 -10.6 q 2.6 -1.6 5.2 0.2" stroke="#9aa3ab" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>`;
        case 'hoe':    return `<g class="tool-swing"><line x1="3.4" y1="-4" x2="6.4" y2="-9.8" stroke="#6b4520" stroke-width="0.9"/>
            <path d="M 6.4 -9.8 l 2.6 0.8 l -0.6 2 l -2.4 -1 Z" fill="#8d949c" stroke="#4b5259" stroke-width="0.4"/></g>`;
        case 'spear':  return `<line x1="3.6" y1="2.5" x2="4.6" y2="-13" stroke="#6b4520" stroke-width="0.9"/>
            <path d="M 4.6 -13 l -1.1 2.4 l 2.4 0 Z" fill="#cbd5e1" stroke="#4b5259" stroke-width="0.35"/>`;
        case 'crate':  return `<g class="tool-bob"><rect x="2.8" y="-5.6" width="5" height="4.4" fill="#c99a5e" stroke="#5a3818" stroke-width="0.45"/>
            <line x1="2.8" y1="-3.4" x2="7.8" y2="-3.4" stroke="#5a3818" stroke-width="0.35"/></g>`;
        case 'tome':   return `<g class="tool-bob"><rect x="2.8" y="-6" width="4.6" height="3.6" rx="0.4" fill="#2a4a72" stroke="#0e1e33" stroke-width="0.45"/>
            <line x1="5.1" y1="-6" x2="5.1" y2="-2.4" stroke="#7fd8ff" stroke-width="0.4"/></g>`;
        case 'ledger': return `<g class="tool-bob"><rect x="2.8" y="-6" width="4.4" height="3.4" fill="#f0e6d2" stroke="#8a5a2b" stroke-width="0.45"/>
            <line x1="3.5" y1="-4.9" x2="6.5" y2="-4.9" stroke="#8a5a2b" stroke-width="0.3"/>
            <line x1="3.5" y1="-3.9" x2="6.1" y2="-3.9" stroke="#8a5a2b" stroke-width="0.3"/></g>`;
        default:       return '';
    }
}

// kind: 'trade' (cargo cog — click to open the Harbor), 'patrol' (naval guard
// when soldiers hold the patrol formation), or default ambient skiff.
function boatSVG(kind) {
    if (kind === 'trade') {
        return `<g class="ambient-boat">
            <ellipse cx="0" cy="4" rx="24" ry="2.6" fill="rgba(0,0,0,0.4)"/>
            <path d="M -22 0 L 22 0 L 16 7 L -16 7 Z" fill="#6e4a24" stroke="#2a1a0e" stroke-width="0.8"/>
            <path d="M -22 0 L 22 0 L 19 -2 L -19 -2 Z" fill="#8a5a2b"/>
            <line x1="-19" y1="-1" x2="19" y2="-1" stroke="#2a1a0e" stroke-width="0.4" opacity="0.6"/>
            <!-- cargo on deck -->
            <rect x="-14" y="-7" width="7" height="6" fill="#c99a5e" stroke="#2a1a0e" stroke-width="0.6"/>
            <rect x="-6" y="-6" width="5.5" height="5" fill="#a8763f" stroke="#2a1a0e" stroke-width="0.6"/>
            <ellipse cx="10" cy="-4" rx="3.4" ry="4" fill="#8a5a2b" stroke="#2a1a0e" stroke-width="0.6"/>
            <!-- mast + big trade sail with coin emblem -->
            <line x1="2" y1="-2" x2="2" y2="-30" stroke="#3a2010" stroke-width="1.4"/>
            <path d="M 2 -30 Q 18 -22 2 -6 Z" fill="#f0e6d2" stroke="#a88838" stroke-width="0.7"/>
            <path d="M 2 -30 Q 18 -22 2 -6 Z" fill="url(#sailShade)"/>
            <circle cx="7.5" cy="-18" r="4" fill="#f4c44d" stroke="#7a5410" stroke-width="0.8"/>
            <text x="7.5" y="-15.6" text-anchor="middle" font-size="6" font-weight="900" fill="#7a5410" font-family="Inter">$</text>
            <line x1="2" y1="-30" x2="2" y2="-34" stroke="#3a2010" stroke-width="0.5"/>
            <polygon points="2,-34 8,-31.5 2,-29.5" fill="#f4c44d" class="flag-wave"/>
        </g>`;
    }
    if (kind === 'patrol') {
        return `<g class="ambient-boat">
            <ellipse cx="0" cy="3" rx="20" ry="2.2" fill="rgba(0,0,0,0.4)"/>
            <path d="M -18 0 L 18 0 L 13 6 L -13 6 Z" fill="#4e5563" stroke="#20242c" stroke-width="0.8"/>
            <path d="M -18 0 L 18 0 L 15 -1.5 L -15 -1.5 Z" fill="#6b7280"/>
            <!-- shields along the gunwale -->
            ${[-10, -3, 4, 11].map(sx => `<circle cx="${sx}" cy="-2.4" r="2.6" fill="#2c5aa0" stroke="#1a3560" stroke-width="0.6"/><circle cx="${sx}" cy="-2.4" r="0.9" fill="#f4c44d"/>`).join('')}
            <line x1="0" y1="-1" x2="0" y2="-24" stroke="#2a2010" stroke-width="1.2"/>
            <path d="M 0 -24 L 0 -5 L 12 -14 Z" fill="#2c5aa0" stroke="#1a3560" stroke-width="0.7"/>
            <path d="M 0 -24 L 0 -5 L 12 -14 Z" fill="url(#sailShade)"/>
            <path d="M 4.5 -17 l 2.6 1.4 v 2.8 q 0 2 -2.6 3 q -2.6 -1 -2.6 -3 v -2.8 Z" fill="#f0e6d2" stroke="#1a3560" stroke-width="0.5"/>
            <line x1="0" y1="-24" x2="0" y2="-28" stroke="#2a2010" stroke-width="0.5"/>
            <polygon points="0,-28 6,-25.5 0,-23.5" fill="#2c5aa0" class="flag-wave"/>
        </g>`;
    }
    return `<g class="ambient-boat">
        <ellipse cx="0" cy="3" rx="18" ry="2" fill="rgba(0,0,0,0.4)"/>
        <path d="M -16 0 L 16 0 L 12 5 L -12 5 Z" fill="#5a3818" stroke="#2a1808" stroke-width="0.6"/>
        <path d="M -16 0 L 16 0 L 14 -1 L -14 -1 Z" fill="#7a5028"/>
        <line x1="0" y1="0" x2="0" y2="-20" stroke="#3a2010" stroke-width="1"/>
        <path d="M 0 -20 L 0 -2 L 10 -10 Z" fill="#fde047" stroke="#a87820" stroke-width="0.5"/>
        <path d="M 0 -20 L 0 -2 L 10 -10 Z" fill="url(#sailShade)"/>
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

// ============================================================
// WORKERS — every villager has a JOB tied to a real building, works
// beside it with the right tool, and names their trade on hover.
// Returned as depth-sorted entities so buildings correctly occlude
// them (a worker must never appear standing on a neighbour's roof).
// ============================================================
const WORKER_JOBS = {
    farm:       { variant: 1, tool: 'hoe',    title: 'Farmhand',   verb: 'tending the crops' },
    lumbermill: { variant: 2, tool: 'axe',    title: 'Woodcutter', verb: 'splitting logs' },
    goldmine:   { variant: 0, tool: 'pick',   title: 'Miner',      verb: 'working the gold seam' },
    ironmine:   { variant: 0, tool: 'pick',   title: 'Miner',      verb: 'hauling iron ore' },
    coinmint:   { variant: 3, tool: 'ledger', title: 'Minter',     verb: 'striking coins' },
    harbor:     { variant: 3, tool: 'crate',  title: 'Dockhand',   verb: 'loading the trade ship' },
    researchlab:{ variant: 4, tool: 'tome',   title: 'Scholar',    verb: 'poring over research' },
    storage:    { variant: 3, tool: 'crate',  title: 'Stevedore',  verb: 'stacking the stores' },
    barracks:   { variant: 5, tool: 'spear',  title: 'Drill Sgt.', verb: 'drilling recruits' },
    stable:     { variant: 1, tool: 'hoe',    title: 'Groom',      verb: 'brushing the horses' },
    townhall:   { variant: 5, tool: 'ledger', title: 'Steward',    verb: 'keeping the ledgers' },
    archertower:{ variant: 5, tool: 'spear',  title: 'Watchman',   verb: 'scanning the horizon' },
    cannon:     { variant: 0, tool: 'pick',   title: 'Gunner',     verb: 'swabbing the barrel' },
    fortress:   { variant: 5, tool: 'spear',  title: 'Guard',      verb: 'standing watch' }
};
// Villagers are drawn at full size but buildings render at BLD_SCALE, so a
// worker must be scaled to match or they tower over the architecture.
const WORKER_SCALE = 0.62;

function buildWorkerEntities() {
    const out = [];
    let n = 0;
    for (const b of state.buildings) {
        if (n >= 9) break;                       // keep the scene readable
        const job = WORKER_JOBS[b.type];
        if (!job || b.constructing) continue;
        const gx = b.pos % ISO.GW, gy = Math.floor(b.pos / ISO.GW);
        const { x, y } = iso(gx, gy);
        // Stand at the FRONT (south) edge of the plot, not mid-tile. Building
        // roofs are taller than one tile, so a worker sitting mid-tile can be
        // reached over by a diagonal neighbour's roof and read as standing on
        // it. Seated forward, they're clearly on open ground in front.
        const ox = -8 + _tRand(b.pos * 13 + 5) * 16;
        const oy = 15 + _tRand(b.pos * 7) * 5;
        const wx = x + ox, wy = y + oy;
        out.push({
            kind: 'worker', gx, gy, depth: gx + gy + 0.6,
            svg: `<g class="villager-wrap worker-job" data-vid="${n}" data-hx="${wx}" data-hy="${wy}" data-home="${b.pos}" style="transform:translate(${wx}px,${wy}px)">
                    <title>${job.title} — ${job.verb}</title>
                    <g transform="scale(${WORKER_SCALE})">${villagerSVG(n, job.variant, job.tool)}</g>
                  </g>`
        });
        n++;
    }
    // Nothing built yet: a couple of settlers survey the empty land.
    if (n === 0) {
        const cgx = Math.floor(ISO.GW / 2), cgy = Math.floor(ISO.GH / 2);
        const c = iso(cgx, cgy);
        for (let i = 0; i < 2; i++) {
            const wx = c.x + i * 20 - 10, wy = c.y + 9;
            out.push({
                kind: 'worker', gx: cgx, gy: cgy, depth: cgx + cgy + 0.6,
                svg: `<g class="villager-wrap" data-vid="${i}" data-hx="${wx}" data-hy="${wy}" style="transform:translate(${wx}px,${wy}px)">
                        <title>Settler — waiting for you to build</title>
                        <g transform="scale(${WORKER_SCALE})">${villagerSVG(i, i, null)}</g>
                      </g>`
            });
        }
    }
    return out;
}

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
    // WORKERS join the SAME depth-sorted stream as buildings and decorations.
    // They used to render in a separate layer painted after everything, so a
    // villager always drew on top of whatever was in front of them — which is
    // why workers appeared to stand on their neighbour's roof. Sorting at
    // gx+gy+0.6 puts each worker just in front of their own building while
    // still letting anything a row further south correctly occlude them.
    for (const w of buildWorkerEntities()) entities.push(w);
    entities.sort((a, b) => a.depth - b.depth);

    // ===== 3D EXTRUDED ISLAND =====
    // Only your land (owned + claimable) exists as a raised landmass on the water.
    // Far wild land is simply ocean — no ugly fog.
    let tilesSVG = '';
    const ownedTiles = (typeof getOwnedTiles === 'function') ? getOwnedTiles() : null;
    const buyable = (typeof buyableTiles === 'function') ? buyableTiles() : new Set();
    const landPx = (typeof landPrice === 'function') ? landPrice() : { coins: 0 };
    let buyMarkers = '';
    let buyShown = 0;   // cap visible expansion markers — clutter was the worst offender

    const TW = ISO.TW, TH = ISO.TH, DEPTH = 17;
    const PAL = {
        0: { top: '#6cc049', hi: '#8edd66', lip: '#4f9c31' },  // grass
        1: { top: '#63b742', hi: '#86d45d', lip: '#478c2a' },  // dark grass
        2: { top: '#d6b277', hi: '#ecca97', lip: '#ac8a52' },  // path
        3: { top: '#4a97d8', hi: '#7fc0ee', lip: '#2c608f' },  // water — same hue family as the ocean backdrop
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
    // ---- Living sea: swell bands + drifting whitecaps + sun glitter ----
    // The ocean is the largest thing on screen; flat blue is what made the view
    // read as unfinished. All deterministic (seeded) so it never jitters on
    // re-render, and all pointer-events:none so it can't steal clicks.
    let seaSVG = '';
    const _sr = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
    // long swell bands sweeping the whole basin
    for (let i = 0; i < 7; i++) {
        const sy = c0.y - 240 + i * 78 + _sr(i) * 26;
        const sw = 260 + _sr(i + 40) * 320;
        const sx = c0.x - 520 + _sr(i + 80) * 900;
        seaSVG += `<path class="sea-swell" d="M ${sx} ${sy} q ${sw * 0.25} -7 ${sw * 0.5} 0 q ${sw * 0.25} 7 ${sw * 0.5} 0"
            fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2" stroke-linecap="round"
            style="animation-delay:${(i * 1.3).toFixed(1)}s" pointer-events="none"/>`;
    }
    // whitecaps — small foam dashes drifting across the water
    for (let i = 0; i < 16; i++) {
        const wx = c0.x - 560 + _sr(i + 5) * 1120;
        const wy = c0.y - 250 + _sr(i + 25) * 560;
        const ww = 9 + _sr(i + 60) * 13;
        seaSVG += `<path class="sea-cap" d="M ${wx} ${wy} q ${ww / 2} -3 ${ww} 0"
            fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.6" stroke-linecap="round"
            style="animation-delay:${(_sr(i + 90) * 6).toFixed(1)}s" pointer-events="none"/>`;
    }
    // sun glitter path on the water beneath the sun
    for (let i = 0; i < 14; i++) {
        const gx = c0.x - 70 + _sr(i + 200) * 140;
        const gy = c0.y - 210 + _sr(i + 300) * 190;
        const gr = 1.2 + _sr(i + 400) * 1.8;
        seaSVG += `<ellipse class="sea-glint" cx="${gx}" cy="${gy}" rx="${gr * 1.9}" ry="${gr * 0.7}"
            fill="rgba(255,248,214,0.75)" style="animation-delay:${(_sr(i + 500) * 4).toFixed(1)}s" pointer-events="none"/>`;
    }
    tilesSVG += seaSVG + wavesSVG;
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
            // Claimable land reads as a QUIET shallow — a hint of a sandbar under
            // the water, not a badge. Eighteen loud price pills used to dominate
            // the whole frame; the price now lives in the hover tooltip and the
            // confirm, and only a few markers show at once (see buyShown below).
            // Drawn as a SUBMERGED SANDBAR: no raised dirt column (it's under
            // water), just a warm shallow tinting the sea — reads as "land you
            // could raise here" without stamping grey slabs around the island.
            tilesSVG += `<polygon points="${topPts}" fill="rgba(232,210,154,0.16)" pointer-events="none"/>
            <polygon points="${topPts}" fill="none" stroke="rgba(232,210,154,0.30)" stroke-width="1" stroke-dasharray="4 7" class="buy-tile" data-pos="${pos}" style="cursor:pointer">
                <title>Claim this land — ${landPx.coins >= 1000 ? (landPx.coins / 1000).toFixed(1) + 'K' : landPx.coins} coins</title>
            </polygon>`;
            // Only mark a handful of expansion spots so the eye has somewhere to rest.
            if (buyShown < 4) {
                buyShown++;
                buyMarkers += `<g class="buy-flag" data-pos="${pos}" style="cursor:pointer" transform="translate(${x},${y})">
                    <title>Claim this land — ${landPx.coins >= 1000 ? (landPx.coins / 1000).toFixed(1) + 'K' : landPx.coins} coins</title>
                    <circle cx="0" cy="0" r="9" fill="rgba(14,23,38,0.55)" stroke="rgba(244,196,77,0.75)" stroke-width="1.2"/>
                    <path d="M -4 0 H 4 M 0 -4 V 4" stroke="#f4c44d" stroke-width="1.8" stroke-linecap="round"/>
                </g>`;
            }
            continue;
        }

        // Shoreline detection: which sides face open water?
        const leftWater = !_own(gx - 1, gy);   // SW face (down-left)
        const rightWater = !_own(gx, gy + 1);  // SE face (down-right)... use neighbor below-right
        const swWater = !_own(gx - 1, gy) || !_own(gx, gy + 1);
        const isEdge = !_own(gx - 1, gy) || !_own(gx + 1, gy) || !_own(gx, gy - 1) || !_own(gx, gy + 1);

        // Solid land column: layered ROCK CLIFF faces, lip (sandy beach on shore),
        // top, highlight. The rim of the island is one of the largest surfaces on
        // screen — flat two-tone dirt was what made the land read as cardboard.
        // Only outward-facing columns get the full strata treatment (interior
        // columns are hidden behind their neighbours anyway).
        tilesSVG += `<polygon points="${x - TW},${y} ${x},${y + TH} ${x},${y + TH + DEPTH} ${x - TW},${y + DEPTH}" fill="${DIRT_L}"/>`;
        tilesSVG += `<polygon points="${x},${y + TH} ${x + TW},${y} ${x + TW},${y + DEPTH} ${x},${y + TH + DEPTH}" fill="${DIRT_R}"/>`;
        if (isEdge) {
            const rk = _tRand(gx * 19 + gy * 7);
            // horizontal strata bands following the iso slope of each face
            for (let b = 0; b < 3; b++) {
                const off = 5 + b * 4.5 + rk * 2.2;
                if (off >= DEPTH - 1) break;
                const op = (0.20 - b * 0.045).toFixed(2);
                // left (SW) face
                tilesSVG += `<polyline points="${x - TW},${y + off} ${x},${y + TH + off}" fill="none" stroke="#2b1a0a" stroke-width="1" opacity="${op}" pointer-events="none"/>`;
                // right (SE) face
                tilesSVG += `<polyline points="${x},${y + TH + off} ${x + TW},${y + off}" fill="none" stroke="#1f1206" stroke-width="1" opacity="${op}" pointer-events="none"/>`;
            }
            // a couple of chipped rock facets for irregularity
            const fx1 = x - TW * 0.55, fy1 = y + TH * 0.55 + 6 + rk * 4;
            tilesSVG += `<polygon points="${fx1},${fy1} ${fx1 + 8},${fy1 + 3.5} ${fx1 + 6},${fy1 + 9} ${fx1 - 1},${fy1 + 6}" fill="#57381a" opacity="0.5" pointer-events="none"/>`;
            const fx2 = x + TW * 0.35, fy2 = y + TH * 0.65 + 5 + (1 - rk) * 5;
            tilesSVG += `<polygon points="${fx2},${fy2} ${fx2 + 7},${fy2 - 3} ${fx2 + 9},${fy2 + 3} ${fx2 + 2},${fy2 + 6}" fill="#3a2410" opacity="0.45" pointer-events="none"/>`;
            // damp shadow where the cliff meets the water
            tilesSVG += `<polygon points="${x - TW},${y + DEPTH - 5} ${x},${y + TH + DEPTH - 5} ${x},${y + TH + DEPTH} ${x - TW},${y + DEPTH}" fill="#170e05" opacity="0.35" pointer-events="none"/>`;
            tilesSVG += `<polygon points="${x},${y + TH + DEPTH - 5} ${x + TW},${y + DEPTH - 5} ${x + TW},${y + DEPTH} ${x},${y + TH + DEPTH}" fill="#170e05" opacity="0.4" pointer-events="none"/>`;
            // grass overhanging the cliff edge (only on green tiles)
            if (type === 0 || type === 1) {
                const ov = (sx, sy, dir) => `<path d="M ${sx} ${sy} q ${dir * 1.5} 3 ${dir * 0.6} 5.5" stroke="#3f8226" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.75" pointer-events="none"/>`;
                tilesSVG += ov(x - TW * 0.6, y + TH * 0.4 + 4, -1) + ov(x - TW * 0.2, y + TH * 0.8 + 4, -1);
                tilesSVG += ov(x + TW * 0.3, y + TH * 0.7 + 4, 1) + ov(x + TW * 0.7, y + TH * 0.3 + 4, 1);
            }
        }
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
        // top — the tile keeps its own terrain colour. Shore tiles used to flip
        // WHOLESALE to sand, which on a small island meant almost every tile went
        // beige and the whole place read as a sandbar. Now the grass stays green
        // and a narrow beach band is painted only along the water-facing edges
        // (see the beach fringe below), so it reads as a green island with a shore.
        const topFill = p.top;
        const topHi = p.hi;
        // Per-tile deterministic shade jitter. Uniform fills made the island read
        // as a flat checkerboard of blocks; a few percent of variation per tile
        // is what makes hand-painted terrain look organic.
        const jit = _tileShade(topFill, gx, gy);
        tilesSVG += `<polygon points="${topPts}" fill="${jit}" shape-rendering="crispEdges"/>`;
        // TERRAIN BLENDING — where two ground types meet, feather the boundary by
        // bleeding the neighbour's colour a little way across the shared edge in
        // two fading steps. Hard diamond seams between grass/path/sand were the
        // last thing making the ground read as tiles rather than land.
        {
            const _tt = (nx, ny) => (nx >= 0 && nx < ISO.GW && ny >= 0 && ny < ISO.GH && _own(nx, ny)) ? TERRAIN[ny][nx] : null;
            // corners: N(x,y-TH) E(x+TW,y) S(x,y+TH) W(x-TW,y)
            const edges = [
                [_tt(gx + 1, gy), [x, y + TH], [x + TW, y]],   // SE
                [_tt(gx, gy + 1), [x - TW, y], [x, y + TH]],   // SW
                [_tt(gx - 1, gy), [x, y - TH], [x - TW, y]],   // NW
                [_tt(gx, gy - 1), [x + TW, y], [x, y - TH]]    // NE
            ];
            for (const [nt, A, B] of edges) {
                if (nt == null || nt === type || nt === 3) continue;
                const np = PAL[nt]; if (!np) continue;
                // two feathered steps so the bleed fades out instead of banding
                for (const [depth, op] of [[0.30, 0.55], [0.52, 0.22]]) {
                    const ax = A[0] + (x - A[0]) * depth, ay = A[1] + (y - A[1]) * depth;
                    const bx = B[0] + (x - B[0]) * depth, by = B[1] + (y - B[1]) * depth;
                    tilesSVG += `<polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${bx},${by} ${ax},${ay}" fill="${np.top}" opacity="${op}" pointer-events="none"/>`;
                }
                // a scatter of the neighbour's material spilling over the line
                for (let k = 0; k < 3; k++) {
                    const f = 0.22 + _tRand(gx * 5 + gy * 9 + k * 17 + nt) * 0.56;
                    const ex = A[0] + (B[0] - A[0]) * f, ey = A[1] + (B[1] - A[1]) * f;
                    const inward = 0.18 + _tRand(k * 31 + gx + gy) * 0.3;
                    const px = ex + (x - ex) * inward, py = ey + (y - ey) * inward;
                    tilesSVG += `<ellipse cx="${px}" cy="${py}" rx="${2.2 + _tRand(k + gx) * 2.6}" ry="${1.1 + _tRand(k + gy) * 1.2}" fill="${np.top}" opacity="0.4" pointer-events="none"/>`;
                }
            }
        }
        // BEACH FRINGE — a soft sand band on just the edges that meet open water.
        // Corners of the top diamond: N(x,y-TH) E(x+TW,y) S(x,y+TH) W(x-TW,y).
        // Neighbour->edge mapping in iso: gx+1 = SE, gy+1 = SW, gx-1 = NW, gy-1 = NE.
        if (type !== 3) {
            const t = 0.36, SANDC = '#e3cb92';
            const band = (ax, ay, bx, by) => {
                const aix = ax + (x - ax) * t, aiy = ay + (y - ay) * t;
                const bix = bx + (x - bx) * t, biy = by + (y - by) * t;
                return `<polygon points="${ax},${ay} ${bx},${by} ${bix},${biy} ${aix},${aiy}" fill="${SANDC}" opacity="0.85" pointer-events="none"/>`;
            };
            if (!_own(gx + 1, gy)) tilesSVG += band(x, y + TH, x + TW, y);          // SE
            if (!_own(gx, gy + 1)) tilesSVG += band(x - TW, y, x, y + TH);          // SW
            if (!_own(gx - 1, gy)) tilesSVG += band(x, y - TH, x - TW, y);          // NW
            if (!_own(gx, gy - 1)) tilesSVG += band(x + TW, y, x, y - TH);          // NE
        }
        // (No per-tile highlight wedge: an identical bright triangle stamped on
        //  every diamond is what made the ground read as tiles instead of land.
        //  Depth now comes from the mottling below plus the cliff faces.)
        // ground texture: grass tufts on green tiles, pebbles/ripples on sand & path
        // At close zoom a tile fills a third of the screen, so one lonely tuft
        // left it reading as a flat colour field. Every tile now carries mottled
        // patches plus a dozen scattered details, all seeded so nothing shimmers
        // between renders. Points are rejected outside the diamond so texture
        // never bleeds over a tile edge.
        {
            const inDiamond = (dx, dy) => Math.abs(dx) / TW + Math.abs(dy) / TH <= 0.92;
            let tex = '';
            // Soft mottling. Derived from THIS tile's own colour and kept small and
            // faint: large patches of a fixed contrasting green read as stains on
            // the grass rather than as texture within it. Many small variations
            // beat two big ones.
            for (let m = 0; m < 5; m++) {
                const a = _tRand(gx * 11 + gy * 23 + m * 91), b = _tRand(gx * 37 + gy * 5 + m * 47);
                const dx = (a - 0.5) * TW * 1.3, dy = (b - 0.5) * TH * 1.3;
                if (!inDiamond(dx, dy)) continue;
                const rr = 5 + _tRand(gx + gy + m * 13) * 9;
                const delta = (_tRand(gx * 5 + gy * 17 + m * 29) - 0.45) * 26;
                const mc = _shiftHex(jit, delta);
                tex += `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${rr}" ry="${rr * 0.5}" fill="${mc}" opacity="0.30" pointer-events="none"/>`;
            }
            if (type === 0 || type === 1) {
                // Curved blades springing from a common base, not three straight
                // ticks — the old version read as scratches scattered on paint.
                const tuft = (tx, ty, c, s) => `<path d="M ${tx} ${ty} q ${-1.1 * s} ${-1.9 * s} ${-2.1 * s} ${-3.1 * s}
                    M ${tx} ${ty} q ${0.35 * s} ${-2.2 * s} ${-0.2 * s} ${-4.2 * s}
                    M ${tx} ${ty} q ${1.2 * s} ${-1.8 * s} ${2.3 * s} ${-2.9 * s}"
                    stroke="${c}" stroke-width="${0.5 * s}" fill="none" stroke-linecap="round" opacity="0.42" pointer-events="none"/>`;
                for (let k = 0; k < 14; k++) {
                    const a = _tRand(gx * 7 + gy * 13 + k * 29), b = _tRand(gx * 31 + gy * 17 + k * 53);
                    const dx = (a - 0.5) * TW * 1.4, dy = (b - 0.5) * TH * 1.4;
                    if (!inDiamond(dx, dy)) continue;
                    // clumps grow in patches, so skip roughly a third at random
                    if (_tRand(k * 3 + gx * 2 + gy) < 0.32) continue;
                    const s = 0.55 + _tRand(k * 7 + gx + gy) * 0.4;
                    tex += tuft(x + dx, y + dy, k % 3 === 0 ? '#3d7a24' : (k % 3 === 1 ? '#4f9c31' : '#59a836'), s);
                }
                // a few tiny wildflowers
                for (let k = 0; k < 4; k++) {
                    const a = _tRand(gx * 61 + gy * 3 + k * 17), b = _tRand(gx * 5 + gy * 71 + k * 41);
                    const dx = (a - 0.5) * TW * 1.3, dy = (b - 0.5) * TH * 1.3;
                    if (!inDiamond(dx, dy) || _tRand(gx + gy * 3 + k) < 0.55) continue;
                    const fc = ['#f5d76e', '#e8738f', '#cfd8ff'][(gx + gy + k) % 3];
                    tex += `<circle cx="${x + dx}" cy="${y + dy}" r="0.95" fill="${fc}" opacity="0.9" pointer-events="none"/>`;
                }
            } else if (type === 4) {
                for (let k = 0; k < 9; k++) {
                    const a = _tRand(gx * 17 + gy * 43 + k * 31), b = _tRand(gx * 23 + gy * 11 + k * 59);
                    const dx = (a - 0.5) * TW * 1.5, dy = (b - 0.5) * TH * 1.5;
                    if (!inDiamond(dx, dy)) continue;
                    tex += `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${1 + a}" ry="${0.5 + a * 0.4}" fill="#c4aa70" opacity="0.45" pointer-events="none"/>`;
                }
            } else if (type === 2) {
                // packed-earth path: wheel ruts + scattered pebbles
                tex += `<path d="M ${x - TW * 0.55} ${y - TH * 0.1} Q ${x} ${y + TH * 0.12} ${x + TW * 0.55} ${y - TH * 0.08}" stroke="#a8834c" stroke-width="1.6" fill="none" opacity="0.35" pointer-events="none"/>`;
                for (let k = 0; k < 8; k++) {
                    const a = _tRand(gx * 13 + gy * 29 + k * 37), b = _tRand(gx * 47 + gy * 19 + k * 23);
                    const dx = (a - 0.5) * TW * 1.5, dy = (b - 0.5) * TH * 1.5;
                    if (!inDiamond(dx, dy)) continue;
                    tex += `<ellipse cx="${x + dx}" cy="${y + dy}" rx="${1.2 + a * 0.9}" ry="${0.6 + a * 0.4}" fill="${k % 2 ? '#8f6d3e' : '#c2a06a'}" opacity="0.45" pointer-events="none"/>`;
                }
            }
            tilesSVG += tex;
        }
        if (type === 3) tilesSVG += `<polygon points="${topPts}" fill="#7cc8f8" opacity="0.2" pointer-events="none"><animate attributeName="opacity" values="0.08;0.32;0.08" dur="3.2s" repeatCount="indefinite"/></polygon>`;
    }

    // Highlight overlay for placement
    let placementSVG = '';
    if (placingBuilding) {
    // A 2x2 building (Town Hall, Fortress, Barracks) needs all four of its tiles
    // free and owned. Highlighting a single free tile without checking the rest
    // told the player "place here" and then refused with an error - during the
    // tutorial's Barracks step that reads as the game ignoring the tap.
    const fitsHere = (pos) => {
        const foot = (typeof buildingFootprint === 'function')
            ? buildingFootprint(placingBuilding, pos) : [pos];
        for (const fp of foot) {
            if ((typeof tileOccupiedBy === 'function') ? tileOccupiedBy(fp)
                : state.buildings.find(b => b.pos === fp)) return false;
            if (ownedTiles && !ownedTiles.has(fp)) return false;
        }
        return foot.length === ((typeof FOOTPRINT_2X2 !== 'undefined' && FOOTPRINT_2X2[placingBuilding]) ? 4 : 1);
    };
        for (let gy = 0; gy < ISO.GH; gy++) {
            for (let gx = 0; gx < ISO.GW; gx++) {
                const pos = gx + gy * ISO.GW;
                // Must match the .tile-hit filter below, footprint included.
                if (!fitsHere(pos)) continue;
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
            // While placing, only offer tiles the building actually fits on.
            if (placingBuilding && typeof buildingFootprint === 'function') {
                const foot = buildingFootprint(placingBuilding, pos);
                const need = (typeof FOOTPRINT_2X2 !== 'undefined' && FOOTPRINT_2X2[placingBuilding]) ? 4 : 1;
                if (foot.length !== need) continue;
                let ok = true;
                for (const fp of foot) {
                    if (((typeof tileOccupiedBy === 'function') ? tileOccupiedBy(fp) : state.buildings.find(b => b.pos === fp))
                        || (ownedTiles && !ownedTiles.has(fp))) { ok = false; break; }
                }
                if (!ok) continue;
            }
            const { x, y } = iso(gx, gy);
            hitSVG += `<polygon points="${x},${y - ISO.TH} ${x + ISO.TW},${y} ${x},${y + ISO.TH} ${x - ISO.TW},${y}" fill="transparent" class="tile-hit" data-pos="${pos}" style="cursor:pointer"/>`;
        }
    }

    // Render entities in depth order
    const cleared = (state.clearedDecos instanceof Set) ? state.clearedDecos
                    : new Set(state.clearedDecos || []);
    let entSVG = '';
    for (const e of entities) {
        if (e.kind === 'worker') {
            entSVG += e.svg;
            continue;
        }
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
            // CAST SHADOW — a skewed pool thrown down-right (light is upper-left,
            // matching every building's own shading). Without this the buildings
            // read as stickers floating above the ground instead of standing on it.
            {
                const sc = iso(e.gx + (is2x2 ? 0.5 : 0), e.gy + (is2x2 ? 0.5 : 0));
                const s = is2x2 ? 1.5 : 1;
                entSVG += `<g transform="translate(${sc.x},${sc.y}) skewX(-32) translate(${-sc.x},${-sc.y})" pointer-events="none" opacity="0.26">
                    <ellipse cx="${sc.x + 14 * s}" cy="${sc.y + 2}" rx="${26 * s}" ry="${9 * s}" fill="#123018"/>
                </g>`;
            }
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

    // Workers live in the depth-sorted entity stream (buildWorkerEntities),
    // so this legacy layer stays empty.
    const workerSvg = '';

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

    // Boats with PURPOSE, not decoration:
    // - Trade Ship: appears whenever the Harbor stands and today's Trade Ship
    //   deals aren't sold out — click it to open the Harbor.
    // - Patrol Boat: circles close to shore while soldiers hold the Patrol
    //   formation — your coastal guard, click to review the patrol.
    // - Plain skiff only when neither has a reason to sail.
    let boat = '';
    {
        const b0 = iso(-1, 4);
        const hasHarbor = state.buildings.some(b => b.type === 'harbor' && !b.constructing);
        const dealsLeft = !!(state.exp && state.exp.trader && state.exp.trader.some(d => !d.bought));
        const patrolN = (typeof getDeployed === 'function') ? getDeployed('patrol').length : 0;
        if (hasHarbor && dealsLeft) {
            boat += `<g class="ambient-boat-wrap trade-ship" data-hx="${b0.x}" data-hy="${b0.y}" data-rx="${ISO.GW * ISO.TW * 0.55}" data-ry="${ISO.GH * ISO.TH * 0.7}" style="transform:translate(${b0.x}px,${b0.y}px);cursor:pointer">
                <title>Trade Ship — today's deals are in! Click to open the Harbor.</title>${boatSVG('trade')}</g>`;
        } else {
            boat += `<g class="ambient-boat-wrap" data-hx="${b0.x}" data-hy="${b0.y}" data-rx="${ISO.GW * ISO.TW * 0.55}" data-ry="${ISO.GH * ISO.TH * 0.7}" style="transform:translate(${b0.x}px,${b0.y}px)">${boatSVG()}</g>`;
        }
        if (patrolN > 0) {
            const p0 = iso(ISO.GW, 6);
            boat += `<g class="ambient-boat-wrap patrol-boat" data-hx="${p0.x}" data-hy="${p0.y}" data-rx="${ISO.GW * ISO.TW * 0.48}" data-ry="${ISO.GH * ISO.TH * 0.58}" style="transform:translate(${p0.x}px,${p0.y}px);cursor:pointer">
                <title>Patrol Boat — ${patrolN} soldier${patrolN === 1 ? '' : 's'} guarding your shores. Click to review.</title>${boatSVG('patrol')}</g>`;
        }
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
        if (!def || !def.production) continue;   // unknown type: skip, never throw
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
        prodSVG += `<g class="prod-indicator" data-pos="${b.pos}" style="cursor:pointer" transform="translate(${x}, ${y - 44}) scale(0.62)">
            <circle cx="0" cy="0" r="14" fill="#1a1a2e" stroke="#fbbf24" stroke-width="2" opacity="0.95"/>
            <circle cx="0" cy="0" r="14" fill="none" stroke="#fbbf24" stroke-width="1" opacity="0.5">
                <animate attributeName="r" values="14;20;14" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="1.6s" repeatCount="indefinite"/>
            </circle>
            ${iconSVG}
            <text x="11" y="-8" text-anchor="middle" font-size="7" font-weight="900" fill="#fff" stroke="#000" stroke-width="0.5">${Math.floor(ready)}</text>
        </g>`;
    }

    const VB = islandViewBox(w, h);
    return `<svg viewBox="${VB.vx} ${VB.vy} ${VB.vw} ${VB.vh}" xmlns="http://www.w3.org/2000/svg" id="iso-svg" preserveAspectRatio="xMidYMid meet">
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
        <g class="camera-layer" transform="translate(${CAM.x}, ${CAM.y}) scale(${CAM.zoom})" style="transform-origin: ${VB.vx + VB.vw/2}px ${VB.vy + VB.vh/2}px">
            <g class="tiles">${tilesSVG}</g>
            <g class="boats">${boat}</g>
            <g class="hits">${hitSVG}</g>
            <g class="entities" filter="url(#bldShadow)">${entSVG}</g>
            <g class="memorial">${memorialLayerSVG(ownedTiles)}</g>
            <g class="animals">${animals}</g>
            <g class="carts">${cart}</g>
            <g class="workers">${workerSvg}</g>
            <g class="placement">${placementSVG}</g>
            <g class="buy-markers">${buyMarkers}</g>
            <g class="particles">${particles}</g>
            <g class="birds">${birds}</g>
            <g class="indicators">${prodSVG}</g>
        </g>
        <rect class="day-night-overlay" x="${VB.vx}" y="${VB.vy}" width="${VB.vw}" height="${VB.vh}" fill="url(#dayNight)" pointer-events="none"/>
    </svg>`;
}

// ============================================================
// THE MEMORIAL — a small graveyard on the island's western shore.
// One headstone per fallen Elite/Legend (max 8 shown) + a cairn
// for the rest. Grows as your war history does. Click to open.
// ============================================================
function memorialLayerSVG(ownedTiles) {
    if (!state.memorial || !state.memorial.length) return '';
    // Find a free owned shore tile, westernmost on screen (min gx-gy).
    const occupied = (gx, gy) => {
        const pos = gx + gy * ISO.GW;
        if (typeof tileOccupiedBy === 'function' && tileOccupiedBy(pos)) return true;
        return state.buildings.some(b => b.pos === pos);
    };
    const isOwned = (gx, gy) => (gx >= 0 && gx < ISO.GW && gy >= 0 && gy < ISO.GH) && (!ownedTiles || ownedTiles.has(gx + gy * ISO.GW));
    let best = null;
    for (let gy = 0; gy < ISO.GH; gy++) {
        for (let gx = 0; gx < ISO.GW; gx++) {
            if (!isOwned(gx, gy) || occupied(gx, gy)) continue;
            const shore = !isOwned(gx - 1, gy) || !isOwned(gx + 1, gy) || !isOwned(gx, gy - 1) || !isOwned(gx, gy + 1);
            if (!shore) continue;
            const westness = gx - gy;
            if (!best || westness < best.westness) best = { gx, gy, westness };
        }
    }
    if (!best) return '';
    const { x, y } = iso(best.gx, best.gy);
    const honored = state.memorial.filter(m => m.rank === 'Elite' || m.rank === 'Legend').slice(0, 8);
    const rest = state.memorial.length - honored.length;
    let g = '';
    // low fence + consecrated ground
    g += `<ellipse cx="${x}" cy="${y}" rx="${ISO.TW * 0.82}" ry="${ISO.TH * 0.82}" fill="rgba(60,80,60,0.35)" stroke="rgba(230,220,190,0.5)" stroke-width="0.8" stroke-dasharray="3 3"/>`;
    // headstones for the honored dead
    honored.forEach((m, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        const hx = x - 14 + col * 9, hy = y - 4 + row * 9;
        g += `<g transform="translate(${hx},${hy})">
            <ellipse cx="0" cy="1.4" rx="4" ry="1.3" fill="rgba(0,0,0,0.35)"/>
            <path d="M -3 1 L -3 -5 A 3 3 0 0 1 3 -5 L 3 1 Z" fill="#9aa3ab" stroke="#4b5259" stroke-width="0.7"/>
            <line x1="-1.6" y1="-3.4" x2="1.6" y2="-3.4" stroke="#4b5259" stroke-width="0.6"/>
            ${m.rank === 'Legend' ? `<circle cx="0" cy="-6.6" r="1.5" fill="#fbbf24" stroke="#7a5410" stroke-width="0.5"/>` : ''}
        </g>`;
    });
    // cairn for the rest
    if (rest > 0) {
        g += `<g transform="translate(${x + 12},${y + 6})">
            <ellipse cx="0" cy="2" rx="6" ry="2" fill="rgba(0,0,0,0.3)"/>
            <circle cx="-2.5" cy="0" r="2.6" fill="#8b8f94" stroke="#4b5259" stroke-width="0.5"/>
            <circle cx="2.3" cy="0.4" r="2.2" fill="#9aa3ab" stroke="#4b5259" stroke-width="0.5"/>
            <circle cx="0" cy="-2.4" r="2" fill="#a8b0b8" stroke="#4b5259" stroke-width="0.5"/>
            <g transform="translate(8,-2)"><rect x="-7" y="-5" width="14" height="10" rx="4" fill="#0e1726" stroke="#9aa3ab" stroke-width="0.8"/><text x="0" y="2.6" text-anchor="middle" font-size="7" font-weight="800" fill="#cbd5e1">+${rest}</text></g>
        </g>`;
    }
    return `<g class="memorial-g" style="cursor:pointer" data-memorial="1">
        <title>The Memorial — ${state.memorial.length} fallen. Click to honor them.</title>${g}</g>`;
}

// Tap a building to collect accumulated resources (Clash of Clans style)
function collectBuilding(pos) {
    const b = state.buildings.find(b => b.pos === pos);
    if (!b) return;
    const def = BUILDING_DEFS[b.type];
    if (!def || !def.production || !b.collectReady || b.collectReady < 1) return;
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
