// ============================================================
// TRUE 3D VILLAGE (Three.js / WebGL)
// Real 3D island, low-poly building models, dynamic lighting
// & shadows, orbiting camera, animated water. Toggle with  3D.
// ============================================================

let T3 = { active: false, ready: false, scene: null, camera: null, renderer: null, raf: 0, pick: [], water: null, theta: 0.8, phi: 0.95, dist: 26 };

function toggle3D() {
    if (!T3.active) {
        load3DLib(() => { T3.active = true; enter3D(); });
    } else {
        T3.active = false;
        exit3D();
    }
}

function load3DLib(cb) {
    if (window.THREE) { cb(); return; }
    toast('Loading 3D engine…', 'info');
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/three@0.147.0/build/three.min.js';
    s.onload = () => { toast('3D engine ready!', 'success'); cb(); };
    s.onerror = () => toast('Could not load 3D engine (offline?).', 'error');
    document.head.appendChild(s);
}

function enter3D() {
    const grid = document.getElementById('village-grid');
    const svg = document.getElementById('iso-svg');
    if (svg) svg.style.display = 'none';
    let host = document.getElementById('t3-host');
    if (!host) {
        host = document.createElement('div');
        host.id = 't3-host';
        grid.appendChild(host);
    }
    host.style.display = 'block';
    build3DScene(host);
    const btn = document.getElementById('btn-3d');
    if (btn) btn.classList.add('active');
}

// Release the WebGL context + window listeners from the current scene. Called
// before every rebuild and on exit so repeated 3D toggles / land purchases /
// building placements don't leak: browsers cap active WebGL contexts (~16) and
// the 3D view would otherwise go black, while orphaned pointer handlers would
// pile up unbounded and keep mutating stale cameras.
function t3Teardown() {
    cancelAnimationFrame(T3.raf);
    if (T3.onPointerMove) { window.removeEventListener('pointermove', T3.onPointerMove); T3.onPointerMove = null; }
    if (T3.onPointerUp) { window.removeEventListener('pointerup', T3.onPointerUp); T3.onPointerUp = null; }
    if (T3.renderer) {
        try { T3.renderer.dispose(); if (T3.renderer.forceContextLoss) T3.renderer.forceContextLoss(); } catch (e) {}
        T3.renderer = null;
    }
}

function exit3D() {
    t3Teardown();
    if (T3.pump) { clearInterval(T3.pump); T3.pump = 0; }
    const host = document.getElementById('t3-host');
    if (host) host.style.display = 'none';
    const svg = document.getElementById('iso-svg');
    if (svg) svg.style.display = '';
    const btn = document.getElementById('btn-3d');
    if (btn) btn.classList.remove('active');
    renderGrid();
}

function t3Rebuild() {
    if (T3.active && window.THREE) {
        const host = document.getElementById('t3-host');
        if (host && host.style.display !== 'none') {
            build3DScene(host);
        } else {
            // host was torn down (e.g. by a view switch); re-create it
            enter3D();
        }
    }
}

function build3DScene(host) {
    t3Teardown();
    host.innerHTML = '';
    const W = host.clientWidth || 900, H = Math.max(420, Math.round(W * 0.62));
    host.style.height = H + 'px';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87bfff);
    scene.fog = new THREE.Fog(0x87bfff, 60, 140);

    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 300);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    T3.renderer = renderer;

    // ---- Lighting: warm sun + cool sky bounce + soft shadows ----
    const hemi = new THREE.HemisphereLight(0xeaf6ff, 0x3a5a2a, 0.62);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.15);
    sun.position.set(18, 30, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
    sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
    sun.shadow.camera.near = 1; sun.shadow.camera.far = 80;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
    scene.add(sun);
    // gentle fill from the opposite side to lift shadow interiors
    const fill = new THREE.DirectionalLight(0xbfd6ff, 0.18);
    fill.position.set(-14, 10, -10);
    scene.add(fill);

    // ---- Water ----
    const waterGeo = new THREE.PlaneGeometry(240, 240, 24, 24);
    const waterMat = new THREE.MeshPhongMaterial({ color: 0x2f7fd0, transparent: true, opacity: 0.92, shininess: 90, specular: 0x9adcff });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.65;
    water.receiveShadow = true;
    scene.add(water);
    T3.water = water;

    // ---- Island tiles ----
    const owned = (typeof getOwnedTiles === 'function') ? getOwnedTiles() : null;
    const buyable = (typeof buyableTiles === 'function') ? buyableTiles() : new Set();
    const GW = 14, GH = 10, TS = 1.5;
    const ox = -GW * TS / 2, oz = -GH * TS / 2;
    const pick = [];

    const grassMat = new THREE.MeshLambertMaterial({ color: 0x69bd45 });
    const grassMat2 = new THREE.MeshLambertMaterial({ color: 0x58a838 });
    const sandMat = new THREE.MeshLambertMaterial({ color: 0xe6d093 });
    const pathMat = new THREE.MeshLambertMaterial({ color: 0xd2ad72 });
    const dirtMat = new THREE.MeshLambertMaterial({ color: 0x5c3f1f });
    const buyMat = new THREE.MeshLambertMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.35 });

    const ownedHas = (gx, gy) => (gx >= 0 && gx < GW && gy >= 0 && gy < GH) && (!owned || owned.has(gx + gy * GW));

    let cenX = 0, cenZ = 0, cenN = 0; // centroid of owned tiles, to frame the camera

    for (let gy = 0; gy < GH; gy++) {
        for (let gx = 0; gx < GW; gx++) {
            const pos = gx + gy * GW;
            const isOwned = !owned || owned.has(pos);
            const isBuy = !isOwned && buyable.has(pos);
            if (!isOwned && !isBuy) continue;
            const x = ox + gx * TS + TS / 2, z = oz + gy * TS + TS / 2;
            if (isOwned) { cenX += x; cenZ += z; cenN++; }
            if (isBuy) {
                const m = new THREE.Mesh(new THREE.BoxGeometry(TS * 0.96, 0.5, TS * 0.96), buyMat);
                m.position.set(x, -0.25, z);
                m.userData = { kind: 'buy', pos };
                scene.add(m); pick.push(m);
                continue;
            }
            // dirt base
            const dirt = new THREE.Mesh(new THREE.BoxGeometry(TS, 0.9, TS), dirtMat);
            dirt.position.set(x, -0.45, z);
            dirt.castShadow = true; dirt.receiveShadow = true;
            scene.add(dirt);
            // top layer: terrain colored
            const tt = (typeof TERRAIN !== 'undefined' && TERRAIN) ? TERRAIN[gy][gx] : 0;
            const edge = !ownedHas(gx - 1, gy) || !ownedHas(gx + 1, gy) || !ownedHas(gx, gy - 1) || !ownedHas(gx, gy + 1);
            let mat = grassMat;
            if (edge) mat = sandMat;
            else if (tt === 1) mat = grassMat2;
            else if (tt === 2) mat = pathMat;
            else if (tt === 4) mat = sandMat;
            const top = new THREE.Mesh(new THREE.BoxGeometry(TS * 0.99, 0.22, TS * 0.99), mat);
            top.position.set(x, 0.11, z);
            top.castShadow = false; top.receiveShadow = true;
            top.userData = { kind: 'tile', pos };
            scene.add(top); pick.push(top);
        }
    }

    // ---- Buildings as low-poly 3D models ----
    for (const b of state.buildings) {
        const gx = b.pos % GW, gy = Math.floor(b.pos / GW);
        const x = ox + gx * TS + TS / 2, z = oz + gy * TS + TS / 2;
        const g = t3BuildingModel(b.type, b.level);
        g.position.set(x, 0.22, z);
        g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData = { kind: 'bld', pos: b.pos }; pick.push(o); } });
        if (b.constructing || b.upgrading) {
            const scaff = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshLambertMaterial({ color: 0xb8862f, wireframe: true }));
            scaff.position.y = 0.6;
            g.add(scaff);
        }
        scene.add(g);
    }

    // ---- Trees on owned land (not cleared) ----
    const cleared = new Set(state.clearedDecos || []);
    if (typeof DECORATIONS !== 'undefined' && DECORATIONS) {
        for (const d of DECORATIONS) {
            if (d.type !== 'tree') continue;
            const pos = d.gx + d.gy * GW;
            if (owned && !owned.has(pos)) continue;
            if (cleared.has(d.gx + ',' + d.gy)) continue;
            if (state.buildings.some(bb => bb.pos === pos)) continue;
            const x = ox + d.gx * TS + TS / 2, z = oz + d.gy * TS + TS / 2;
            const tree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.5), new THREE.MeshLambertMaterial({ color: 0x5a3818 }));
            trunk.position.y = 0.25;
            const fol = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.0, 7), new THREE.MeshLambertMaterial({ color: 0x2e8b30 }));
            fol.position.y = 0.95;
            tree.add(trunk, fol);
            tree.position.set(x, 0.22, z);
            tree.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
            scene.add(tree);
        }
    }

    // ---- Camera orbit (drag) + zoom ----
    const target = new THREE.Vector3(cenN ? cenX / cenN : 0, 0, cenN ? cenZ / cenN : 0);
    function placeCam() {
        camera.position.set(
            target.x + T3.dist * Math.sin(T3.phi) * Math.cos(T3.theta),
            target.y + T3.dist * Math.cos(T3.phi),
            target.z + T3.dist * Math.sin(T3.phi) * Math.sin(T3.theta)
        );
        camera.lookAt(target);
    }
    placeCam();
    let drag = null;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, th: T3.theta, ph: T3.phi, moved: false }; });
    // Stored on T3 so t3Teardown() can remove them on the next rebuild / exit.
    T3.onPointerMove = e => {
        if (!drag) return;
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        T3.theta = drag.th + dx * 0.008;
        T3.phi = Math.max(0.35, Math.min(1.35, drag.ph + dy * 0.006));
        placeCam();
    };
    T3.onPointerUp = () => { setTimeout(() => { if (drag) drag = null; }, 0); };
    window.addEventListener('pointermove', T3.onPointerMove);
    window.addEventListener('pointerup', T3.onPointerUp);
    renderer.domElement.addEventListener('wheel', e => {
        e.preventDefault();
        T3.dist = Math.max(10, Math.min(46, T3.dist * (e.deltaY > 0 ? 1.08 : 0.92)));
        placeCam();
    }, { passive: false });

    // ---- Click → select building / buy land ----
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', e => {
        if (drag && drag.moved) return;
        const r = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        ray.setFromCamera(mouse, camera);
        const hits = ray.intersectObjects(pick, false);
        if (!hits.length) return;
        const u = hits[0].object.userData;
        if (u.kind === 'bld') {
            const b = state.buildings.find(x => x.pos === u.pos);
            if (b) showBuildingInfo(b);
        } else if (u.kind === 'buy') {
            buyLand(u.pos); t3Rebuild();
        } else if (u.kind === 'tile' && placingBuilding) {
            startPlacement(u.pos); t3Rebuild();
        }
    });

    // ---- Animate: water waves + render loop ----
    const wpos = waterGeo.attributes.position;
    const wBase = [];
    for (let i = 0; i < wpos.count; i++) wBase.push(wpos.getZ(i));
    let t0 = performance.now();
    let lastRender = performance.now();
    function frame(now) {
        const t = (now - t0) / 1000;
        for (let i = 0; i < wpos.count; i++) {
            wpos.setZ(i, wBase[i] + Math.sin(t * 1.4 + i * 0.7) * 0.07);
        }
        wpos.needsUpdate = true;
        renderer.render(scene, camera);
        lastRender = now;
    }
    function anim(now) {
        if (!T3.active) return;
        frame(now);
        T3.raf = requestAnimationFrame(anim);
    }
    // Render one frame immediately so the scene appears even if rAF is throttled,
    // then run the rAF loop for smooth animation in the foreground.
    frame(performance.now());
    T3.raf = requestAnimationFrame(anim);
    // Fallback pump for hidden/background tabs where rAF is paused.
    if (T3.pump) clearInterval(T3.pump);
    T3.pump = setInterval(() => {
        if (!T3.active) { clearInterval(T3.pump); T3.pump = 0; return; }
        const now = performance.now();
        if (now - lastRender > 200) frame(now);
    }, 150);
    T3.scene = scene; T3.camera = camera; T3.renderer = renderer; T3.pick = pick;
}

// Low-poly building factory — every type gets a distinct 3D model
function t3BuildingModel(type, level) {
    const g = new THREE.Group();
    const M = (c, opts) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.78, metalness: 0.04, flatShading: true }, opts || {}));
    const add = (geo, mat, x, y, z, ry) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x || 0, y || 0, z || 0);
        if (ry) m.rotation.y = ry;
        m.castShadow = true; m.receiveShadow = true;
        g.add(m); return m;
    };
    // Stone foundation slab grounds every building and catches its own shadow.
    const baseMat = M(0x70675a, { roughness: 0.96 });
    const base = add(new THREE.BoxGeometry(1.34, 0.1, 1.34), baseMat, 0, 0.05, 0);
    base.castShadow = false;
    const lvlScale = 1 + Math.min(0.35, (level - 1) * 0.045);
    switch (type) {
        case 'townhall': {
            add(new THREE.BoxGeometry(1.3, 0.9, 1.3), M(0xeaddc0), 0, 0.45, 0);          // walls
            add(new THREE.BoxGeometry(1.34, 0.14, 1.34), M(0x8a6a3c), 0, 0.9, 0);         // wall trim
            add(new THREE.ConeGeometry(1.12, 0.95, 4), M(0xf0b429), 0, 1.4, 0, Math.PI / 4); // roof
            add(new THREE.ConeGeometry(1.16, 0.16, 4), M(0xb9842a), 0, 0.96, 0, Math.PI / 4); // eaves
            add(new THREE.BoxGeometry(0.34, 0.55, 0.06), M(0x6b4423), 0, 0.275, 0.66);    // door
            add(new THREE.BoxGeometry(0.26, 0.26, 0.05), M(0x9ad8ff), -0.42, 0.6, 0.66);  // window L
            add(new THREE.BoxGeometry(0.26, 0.26, 0.05), M(0x9ad8ff), 0.42, 0.6, 0.66);   // window R
            add(new THREE.CylinderGeometry(0.045, 0.045, 0.75), M(0x4a2f18), 0, 2.1, 0);  // flagpole
            add(new THREE.BoxGeometry(0.34, 0.2, 0.02), M(0xdc2626), 0.18, 2.32, 0);      // flag
            break;
        }
        case 'goldmine':
            add(new THREE.ConeGeometry(0.85, 1.1, 6), M(0x8e8074), 0, 0.55, 0);
            add(new THREE.BoxGeometry(0.4, 0.34, 0.12), M(0x1a0f08), 0, 0.2, 0.62);
            add(new THREE.SphereGeometry(0.12, 6, 5), M(0xfbc536), 0.4, 0.1, 0.5);
            break;
        case 'ironmine':
            add(new THREE.ConeGeometry(0.85, 1.15, 6), M(0x6a7080), 0, 0.58, 0);
            add(new THREE.BoxGeometry(0.4, 0.34, 0.12), M(0x0a0a14), 0, 0.2, 0.62);
            break;
        case 'lumbermill':
            add(new THREE.BoxGeometry(1.1, 0.6, 0.9), M(0xa87d4a), 0, 0.3, 0);
            add(new THREE.ConeGeometry(0.85, 0.55, 4), M(0xc89a40), 0, 0.88, 0, Math.PI / 4);
            add(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 12), M(0xcbd5e1), 0.62, 0.5, 0).rotation.z = Math.PI / 2;
            break;
        case 'farm':
            add(new THREE.BoxGeometry(0.9, 0.55, 0.7), M(0xc0392b), -0.25, 0.28, 0);
            add(new THREE.ConeGeometry(0.62, 0.5, 4), M(0x7a1808), -0.25, 0.8, 0, Math.PI / 4);
            add(new THREE.BoxGeometry(0.55, 0.06, 0.85), M(0xe8c850), 0.45, 0.05, 0);
            break;
        case 'coinmint':
            add(new THREE.BoxGeometry(1.15, 0.75, 1.0), M(0xf0ead8), 0, 0.38, 0);
            add(new THREE.ConeGeometry(0.95, 0.55, 4), M(0xe8b94a), 0, 1.0, 0, Math.PI / 4);
            add(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 12), M(0xfbc536), 0, 1.42, 0);
            break;
        case 'storage':
            add(new THREE.BoxGeometry(1.2, 0.7, 1.0), M(0xa87d4a), 0, 0.35, 0);
            add(new THREE.ConeGeometry(0.95, 0.6, 4), M(0x5a3818), 0, 1.0, 0, Math.PI / 4);
            break;
        case 'barracks':
            add(new THREE.BoxGeometry(1.25, 0.7, 1.05), M(0xa89e8e), 0, 0.35, 0);
            add(new THREE.CylinderGeometry(0.18, 0.2, 1.0, 8), M(0x9c948a), -0.55, 0.5, -0.4);
            add(new THREE.ConeGeometry(0.26, 0.34, 8), M(0xa02818), -0.55, 1.17, -0.4);
            add(new THREE.CylinderGeometry(0.18, 0.2, 1.0, 8), M(0x9c948a), 0.55, 0.5, 0.4);
            add(new THREE.ConeGeometry(0.26, 0.34, 8), M(0xa02818), 0.55, 1.17, 0.4);
            break;
        case 'stable':
            add(new THREE.BoxGeometry(1.25, 0.6, 0.95), M(0xa87d4a), 0, 0.3, 0);
            add(new THREE.ConeGeometry(0.92, 0.55, 4), M(0xc89a40), 0, 0.88, 0, Math.PI / 4);
            break;
        case 'researchlab':
            add(new THREE.BoxGeometry(1.0, 0.8, 1.0), M(0x1e3a5a), 0, 0.4, 0);
            add(new THREE.SphereGeometry(0.34, 10, 8), M(0x5fb0f0), 0, 1.05, 0);
            break;
        case 'fortress':
            add(new THREE.BoxGeometry(1.35, 1.0, 1.35), M(0x5e5448), 0, 0.5, 0);
            add(new THREE.CylinderGeometry(0.24, 0.27, 1.5, 8), M(0x4e4438), -0.55, 0.75, -0.55);
            add(new THREE.CylinderGeometry(0.24, 0.27, 1.5, 8), M(0x4e4438), 0.55, 0.75, 0.55);
            add(new THREE.ConeGeometry(0.3, 0.4, 8), M(0x7e1818), -0.55, 1.7, -0.55);
            add(new THREE.ConeGeometry(0.3, 0.4, 8), M(0x7e1818), 0.55, 1.7, 0.55);
            break;
        case 'wall':
            add(new THREE.BoxGeometry(1.3, 0.55, 0.4), M(0x9c948a), 0, 0.28, 0);
            break;
        case 'archertower':
            add(new THREE.CylinderGeometry(0.3, 0.38, 1.3, 8), M(0x9c948a), 0, 0.65, 0);
            add(new THREE.ConeGeometry(0.45, 0.6, 8), M(0xa02818), 0, 1.6, 0);
            break;
        case 'cannon':
            add(new THREE.CylinderGeometry(0.42, 0.5, 0.35, 10), M(0x5e5448), 0, 0.18, 0);
            add(new THREE.CylinderGeometry(0.12, 0.16, 0.8, 8), M(0x2a2418), 0, 0.5, 0.2).rotation.x = Math.PI / 3;
            break;
        default:
            add(new THREE.BoxGeometry(0.9, 0.7, 0.9), M(0x8a6b3a), 0, 0.35, 0);
    }
    g.scale.setScalar(lvlScale);
    return g;
}
