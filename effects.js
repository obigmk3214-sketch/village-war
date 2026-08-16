// ============================================================
// AUDIO + VISUAL EFFECTS ENGINE
// ============================================================

// ----- AUDIO -----
// SFX always available. Music OFF by default — user toggles on with  button.
const Audio = (() => {
    let ctx = null;
    let sfxMuted = false;
    let musicEnabled = false;       // default OFF
    let musicGain = null, musicBus = null, reverbBus = null;
    let musicPlaying = false;
    let musicTimer = null;

    function init() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch(e) {}
        }
        return ctx;
    }

    function tone(freq, dur, type = 'sine', vol = 0.12, attack = 0.005) {
        if (sfxMuted) return;
        const c = init(); if (!c) return;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        const now = c.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(vol, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(gain).connect(c.destination);
        osc.start(now);
        osc.stop(now + dur + 0.1);
    }

    function noise(dur, vol = 0.08, freq = 1000) {
        if (sfxMuted) return;
        const c = init(); if (!c) return;
        const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/data.length, 2);
        const src = c.createBufferSource();
        const filter = c.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = freq;
        const gain = c.createGain();
        gain.gain.value = vol;
        src.buffer = buf;
        src.connect(filter).connect(gain).connect(c.destination);
        src.start();
    }

    function chord(freqs, dur, type = 'triangle', vol = 0.10) {
        freqs.forEach((f, i) => setTimeout(() => tone(f, dur, type, vol), i * 40));
    }

    // ----- MUSIC: real recorded medieval instrument tracks -----
    // Actual composed songs played by real instruments — no synth. Tagged by mood
    // so the score adapts: calm pieces in the village, epic pieces in battle.
    // Most tracks are by Kevin MacLeod (incompetech.com), CC-BY 4.0 — see the
    // Credits screen (More > System) for full attribution.
    // Bundled locally (in /music) as compact AAC/.m4a so music is instant &
    // reliable — no streaming. Crossfades between tracks; falls back to the synth
    // engine only if playback ever fails, so it's never silent.
    const BASE = 'music/';
    // `vibe` groups similar-sounding tracks so the queue never plays two of the
    // same vibe back-to-back (keeps the rotation feeling varied).
    // `trim` = per-track loudness normalization (linear gain), measured by decoding
    // every file in-browser and computing RMS: all tracks now sit at ~-15.5 dB RMS
    // so no piece jumps out louder or falls into the background.
    const PLAYLIST = [
        // Calm — village / exploration
        { title: 'Enchanted Journey',   mood: 'calm', vibe: 'soft',   url: BASE + 'kml-enchanted.m4a', eqLo: 0.5, eqHi: -0.3, trim: 0.876 },
        { title: 'Rogue Meadow',        mood: 'calm', vibe: 'soft',   url: BASE + 'rogue-meadow.m4a', trim: 0.972 },
        { title: 'Teller of the Tales', mood: 'calm', vibe: 'soft',   url: BASE + 'kml-teller.m4a', trim: 1.09 },
        { title: 'Skye Cuillin',        mood: 'calm', vibe: 'soft',   url: BASE + 'kml-skye.m4a', eqLo: 1.3, eqHi: -0.7, trim: 0.981 },
        { title: 'Thatched Villagers',  mood: 'calm', vibe: 'soft',   url: BASE + 'kml-thatched.m4a', eqLo: 1.6, eqHi: -0.9, trim: 0.953 },
        // Calm — lively tavern / folk
        { title: 'Dancing at the Inn',  mood: 'calm', vibe: 'lively', url: BASE + 'tavern-dance.m4a', eqLo: 2.9, eqHi: -1.5, trim: 1.033 },
        { title: 'Fiddles McGinty',     mood: 'calm', vibe: 'lively', url: BASE + 'kml-fiddles.m4a', eqLo: 3.1, eqHi: -1.6, trim: 1.073 },
        { title: 'The Path of the Goblin King', mood: 'calm', vibe: 'lively', url: BASE + 'kml-goblinking.m4a', eqLo: 0.5, eqHi: -0.3, trim: 0.914 },
        { title: 'Master of the Feast', mood: 'calm', vibe: 'lively', url: BASE + 'kml-feast.m4a', eqLo: 1.8, eqHi: -0.9, trim: 1.056 },
        { title: 'Wizardtorium',        mood: 'calm', vibe: 'lively', url: BASE + 'kml-wizardtorium.m4a', eqLo: 4.0, eqHi: -2.1, trim: 0.971 },
        // Calm — grand / stately
        { title: 'The Britons',         mood: 'calm', vibe: 'grand',  url: BASE + 'the-britons.m4a', trim: 1.04 },
        { title: 'Angevin',             mood: 'calm', vibe: 'grand',  url: BASE + 'kml-angevin.m4a', eqLo: 1.0, eqHi: -0.5, trim: 0.888 },
        { title: 'Minstrel Guild',      mood: 'calm', vibe: 'grand',  url: BASE + 'kml-minstrel.m4a', eqLo: 4.2, eqHi: -2.2, trim: 1.01 },
        // Epic — battle
        { title: 'Beyond New Horizons', mood: 'epic', vibe: 'epicA',  url: BASE + 'epic-horizons.m4a', eqLo: 1.7, eqHi: -0.9, trim: 0.92 },
        { title: 'Clash Defiant',       mood: 'epic', vibe: 'epicA',  url: BASE + 'kml-clash.m4a', trim: 0.992 },
        { title: 'Heroic Age',          mood: 'epic', vibe: 'epicA',  url: BASE + 'kml-heroic.m4a', eqLo: 1.6, eqHi: -0.9, trim: 0.813 },
        { title: 'Toward the Mountains',mood: 'epic', vibe: 'epicB',  url: BASE + 'mountains.m4a', eqLo: 1.2, eqHi: -0.6, trim: 0.978 },
        { title: 'Anguish',             mood: 'epic', vibe: 'epicB',  url: BASE + 'kml-anguish.m4a', trim: 0.9 }
    ];
    const CALM = PLAYLIST.map((t, i) => i).filter(i => PLAYLIST[i].mood === 'calm');
    const EPIC = PLAYLIST.map((t, i) => i).filter(i => PLAYLIST[i].mood === 'epic');
    let lastPlayedIdx = -1;

    const MUSIC_VOL = 0.55;
    const CROSSFADE_SEC = 5.5;                 // overlap length between tracks
    const CROSSFADE_MS = CROSSFADE_SEC * 1000;
    let musicAudio = null;
    let musicChainIn = null, musicChainBuilt = false;  // evolving-variety Web Audio graph
    let musicEQ = null;                                // { lo, hi } corrective shelves
    // Retune the shelves for the incoming track, ramped so the change is inaudible.
    function applyTrackEQ(idx) {
        if (!musicEQ) return;
        const t = PLAYLIST[idx] || {};
        const c = init(); if (!c) return;
        const now = c.currentTime;
        try {
            musicEQ.lo.gain.cancelScheduledValues(now);
            musicEQ.hi.gain.cancelScheduledValues(now);
            musicEQ.lo.gain.linearRampToValueAtTime(t.eqLo || 0, now + 1.2);
            musicEQ.hi.gain.linearRampToValueAtTime(t.eqHi || 0, now + 1.2);
        } catch (e) {}
    }
    let musicTrackIdx = 0;
    let onTrackChange = null;
    let musicMode = 'calm';
    let queue = [], qpos = 0;
    let failCount = 0, usingFallback = false;
    let preloadEl = null;

    function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
    // Build a play order that maximises contrast: randomise, then greedily pick so
    // each next track has a different `vibe` from the previous one. Also avoids
    // starting the new cycle on the track that just finished.
    // The village runs a 4-minute day/night cycle. Score the calm playlist against
    // the current hour so quiet pieces surface at night and lively ones at midday
    // — the score still leaves plenty of variety, it just biases the order.
    function dayPhase() {
        const t = (Date.now() / 1000 / 240) % 1;
        return (Math.sin(t * 2 * Math.PI) + 1) / 2;   // 0 = deep night, 1 = midday
    }
    function vibeFit(vibe, sun) {
        if (vibe === 'soft')   return 1 - sun;        // night
        if (vibe === 'lively') return sun;            // day
        if (vibe === 'grand')  return 1 - Math.abs(sun - 0.5) * 2;  // dawn/dusk
        return 0.5;
    }
    function buildQueue(mode) {
        const pool = (mode === 'epic' ? EPIC : CALM).slice();
        const order = [];
        if (mode === 'epic') {
            // battle: pure contrast, no time-of-day weighting
            const remaining = shuffle(pool);
            let prevVibe = lastPlayedIdx >= 0 ? PLAYLIST[lastPlayedIdx].vibe : null;
            while (remaining.length) {
                let at = remaining.findIndex(i => PLAYLIST[i].vibe !== prevVibe);
                if (at < 0) at = 0;
                const idx = remaining.splice(at, 1)[0];
                order.push(idx);
                prevVibe = PLAYLIST[idx].vibe;
            }
        } else {
            const sun = dayPhase();
            // weight by time-of-day fit, keep a strong random component so the
            // order never feels deterministic, then still avoid vibe repeats
            const remaining = pool.map(i => ({ i, w: vibeFit(PLAYLIST[i].vibe, sun) * 0.65 + Math.random() * 0.35 }))
                                  .sort((a, b) => b.w - a.w).map(o => o.i);
            let prevVibe = lastPlayedIdx >= 0 ? PLAYLIST[lastPlayedIdx].vibe : null;
            while (remaining.length) {
                let at = remaining.findIndex(i => PLAYLIST[i].vibe !== prevVibe);
                if (at < 0) at = 0;
                const idx = remaining.splice(at, 1)[0];
                order.push(idx);
                prevVibe = PLAYLIST[idx].vibe;
            }
        }
        // don't immediately replay the track that just ended
        if (order.length > 1 && order[0] === lastPlayedIdx) order.push(order.shift());
        return order;
    }

    // Smooth volume ramp using an equal-power (sine/cosine) curve — keeps the
    // combined loudness of a crossfade ~constant so there's no dip or bump in the
    // middle, and sounds far smoother than a linear ramp.
    function fadeTo(el, target, durMs, done) {
        if (!el) return;
        if (typeof durMs === 'function') { done = durMs; durMs = undefined; }
        durMs = durMs || 1200;
        const start = el.volume;
        const steps = Math.max(1, Math.round(durMs / 50));
        let i = 0;
        if (el._fadeIv) clearInterval(el._fadeIv);
        el._fadeIv = setInterval(() => {
            i++;
            const p = Math.min(1, i / steps);
            const k = start <= target ? Math.sin(p * Math.PI / 2) : Math.cos(p * Math.PI / 2);
            let v = start <= target ? start + (target - start) * k
                                    : target + (start - target) * k;
            if (p >= 1) { v = target; clearInterval(el._fadeIv); el._fadeIv = null; if (done) done(); }
            try { el.volume = Math.max(0, Math.min(1, v)); } catch (e) { clearInterval(el._fadeIv); el._fadeIv = null; }
        }, 50);
    }

    // Preload the next likely track during the title/gate screen so entry is instant.
    function preloadFirst() {
        if (preloadEl) return;
        const idx = (buildQueue('calm'))[0];
        const a = new window.Audio();
        a.preload = 'auto'; a.src = PLAYLIST[idx].url; a.volume = 0;
        a.load();
        preloadEl = a; preloadEl._idx = idx;
    }

    function attachHandlers(a) {
        // Start the next track a few seconds BEFORE this one ends so they overlap
        // and blend — a true crossfade, instead of a gap then a fade-in.
        a.addEventListener('timeupdate', () => {
            if (!musicPlaying || a !== musicAudio || a._xfStarted) return;
            const dur = a.duration;
            if (dur && isFinite(dur) && dur > CROSSFADE_SEC * 2 && dur - a.currentTime <= CROSSFADE_SEC) {
                a._xfStarted = true;
                playNext();
            }
        });
        // Fallback if timeupdate never crosses the threshold (e.g. unknown duration).
        a.addEventListener('ended', () => { if (musicPlaying && a === musicAudio) playNext(); });
        a.addEventListener('error', () => { onTrackError(a); });
        a.addEventListener('playing', () => { failCount = 0; });
    }
    function retryOnGesture(a) {
        const retry = () => { if (a === musicAudio) a.play().catch(() => {}); document.removeEventListener('pointerdown', retry); };
        document.addEventListener('pointerdown', retry, { once: true });
    }
    function onTrackError(a) {
        if (a !== musicAudio || !musicPlaying) return;
        failCount++;
        if (failCount >= 3 && typeof ProcMusic !== 'undefined') {
            // network keeps failing — switch to the synth engine so we're never silent
            usingFallback = true;
            ProcMusic.setBattle(musicMode === 'epic');
            ProcMusic.start();
            if (onTrackChange) onTrackChange('Live score (offline)', -1);
            return;
        }
        setTimeout(() => { if (musicPlaying) playNext(); }, 700);
    }

    // Synthetic hall impulse response (exponentially-decaying stereo noise) — a
    // plausible reverb without shipping an IR file.
    function makeIR(c, seconds, decay) {
        const len = Math.floor(c.sampleRate * seconds);
        const buf = c.createBuffer(2, len, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            const d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
        }
        return buf;
    }

    // Build a shared processing graph the music flows through, with slow, NON-
    // repeating modulation so each track's texture drifts over its runtime — a
    // filter that gently opens/closes and a reverb space that ebbs and flows.
    // The LFO rates are incommensurate, so the movement never obviously loops.
    // Returns the input node, or null if Web Audio isn't usable (music then plays
    // straight through, unchanged).
    function ensureMusicChain() {
        if (musicChainBuilt) return musicChainIn;
        const c = init(); if (!c) return null;
        try {
            if (c.state === 'suspended') c.resume();
            const inGain = c.createGain(); inGain.gain.value = 1;
            // Corrective per-track shelving. Spectral analysis of all 18 tracks
            // showed a wide spread in low-end content (~4% to ~10% of total
            // energy): the thin ones read as tinny next to the full ones. These
            // shelves are retuned on every track change (see applyTrackEQ).
            const loShelf = c.createBiquadFilter(); loShelf.type = 'lowshelf'; loShelf.frequency.value = 220; loShelf.gain.value = 0;
            const hiShelf = c.createBiquadFilter(); hiShelf.type = 'highshelf'; hiShelf.frequency.value = 5200; hiShelf.gain.value = 0;
            musicEQ = { lo: loShelf, hi: hiShelf };
            const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 13500; lp.Q.value = 0.4;
            const dry = c.createGain(); dry.gain.value = 1;
            const conv = c.createConvolver(); conv.buffer = makeIR(c, 2.6, 2.4);
            const wet = c.createGain(); wet.gain.value = 0.10;
            const master = c.createGain(); master.gain.value = 1;
            // routing: in -> lowpass -> (dry + reverb) -> master -> out
            inGain.connect(loShelf).connect(hiShelf).connect(lp);
            lp.connect(dry).connect(master);
            lp.connect(conv).connect(wet).connect(master);
            master.connect(c.destination);
            // --- slow modulators (periods of ~30-75s, deliberately non-matching) ---
            const mkLFO = (hz, depth, target, phaseType) => {
                const osc = c.createOscillator(); osc.type = 'sine'; osc.frequency.value = hz;
                const g = c.createGain(); g.gain.value = depth;
                osc.connect(g).connect(target);
                try { osc.start(); } catch (e) {}
                return osc;
            };
            // filter cutoff drifts ~8.5k–18.5k via two incommensurate LFOs
            mkLFO(0.021, 3000, lp.frequency);
            mkLFO(0.034, 1900, lp.frequency);
            // reverb amount breathes ~0.05–0.15
            mkLFO(0.013, 0.05, wet.gain);
            musicChainIn = inGain; musicChainBuilt = true;
            return musicChainIn;
        } catch (e) { musicChainBuilt = true; musicChainIn = null; return null; }
    }

    // Route an <audio> element's output into the processing graph. If the graph
    // isn't available we leave the element alone so it plays normally.
    function routeThroughChain(el) {
        if (!el || el._routed) return;
        const inNode = ensureMusicChain();
        if (!inNode) return;
        try {
            el._srcNode = init().createMediaElementSource(el);
            el._srcNode.connect(inNode);
            el._routed = true;
        } catch (e) { /* already routed or unsupported — play direct */ }
    }

    function crossfadeTo(idx) {
        const old = musicAudio;
        let a;
        if (preloadEl && preloadEl._idx === idx) { a = preloadEl; preloadEl = null; }
        else { a = new window.Audio(); a.preload = 'auto'; a.src = PLAYLIST[idx].url; }
        a.volume = 0;
        attachHandlers(a);
        routeThroughChain(a);
        musicAudio = a; musicTrackIdx = idx; lastPlayedIdx = idx;
        const pr = a.play();
        if (pr && pr.catch) pr.catch(() => retryOnGesture(a));
        applyTrackEQ(idx);
        fadeTo(a, MUSIC_VOL * (PLAYLIST[idx].trim || 1), CROSSFADE_MS);
        if (old && old !== a) fadeTo(old, 0, CROSSFADE_MS, () => { try { old.pause(); old.src = ''; if (old._srcNode) old._srcNode.disconnect(); } catch (e) {} });
        if (onTrackChange) onTrackChange(PLAYLIST[idx].title, idx);
    }

    function playNext() {
        if (usingFallback) return; // synth engine handles itself
        qpos++;
        if (!queue.length || qpos >= queue.length) { queue = buildQueue(musicMode); qpos = 0; }
        crossfadeTo(queue[qpos]);
    }
    function nextTrack() { if (musicPlaying && !usingFallback) playNext(); }
    function prevTrack() { if (musicPlaying && !usingFallback) { qpos = (qpos - 2 + queue.length) % queue.length; playNext(); } }

    // ============================================================
    // AMBIENT BED — the island soundscape: soft surf that swells and
    // recedes, with a rare distant gull. Sits far under the music
    // (-30 dB-ish) so it's felt more than heard. Muted with SFX.
    // ============================================================
    let ambientOn = false, ambientNodes = null, gullTimer = null;
    function startAmbient() {
        if (ambientOn) return;
        const c = init(); if (!c) return;
        ambientOn = true;
        // pink-ish noise → lowpass → slow swell LFO = waves on the shore
        const len = c.sampleRate * 4;
        const buf = c.createBuffer(1, len, c.sampleRate);
        const d = buf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < len; i++) {
            const w = Math.random() * 2 - 1;
            b0 = 0.997 * b0 + 0.029 * w; b1 = 0.985 * b1 + 0.032 * w; b2 = 0.950 * b2 + 0.048 * w;
            d[i] = (b0 + b1 + b2) * 0.6;
        }
        const src = c.createBufferSource();
        src.buffer = buf; src.loop = true;
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.4;
        const g = c.createGain(); g.gain.value = 0.028;
        const swell = c.createOscillator(); swell.type = 'sine'; swell.frequency.value = 0.09;   // ~11s wave period
        const swellG = c.createGain(); swellG.gain.value = 0.016;
        swell.connect(swellG).connect(g.gain);
        src.connect(lp).connect(g).connect(c.destination);
        src.start(); swell.start();
        ambientNodes = { src, swell, g };
        // a far-off gull every 18-45s (two falling chirps)
        const gull = () => {
            if (!ambientOn) return;
            if (!sfxMuted && !document.hidden) {
                const t0 = c.currentTime + 0.05;
                for (let k = 0; k < 2; k++) {
                    const o = c.createOscillator(), og = c.createGain();
                    o.type = 'sine';
                    o.frequency.setValueAtTime(1180 - k * 90, t0 + k * 0.28);
                    o.frequency.exponentialRampToValueAtTime(760, t0 + k * 0.28 + 0.22);
                    og.gain.setValueAtTime(0, t0 + k * 0.28);
                    og.gain.linearRampToValueAtTime(0.014, t0 + k * 0.28 + 0.04);
                    og.gain.exponentialRampToValueAtTime(0.0001, t0 + k * 0.28 + 0.26);
                    o.connect(og).connect(c.destination);
                    o.start(t0 + k * 0.28); o.stop(t0 + k * 0.28 + 0.3);
                }
            }
            gullTimer = setTimeout(gull, 18000 + Math.random() * 27000);
        };
        gullTimer = setTimeout(gull, 8000);
    }
    function stopAmbient() {
        ambientOn = false;
        if (gullTimer) { clearTimeout(gullTimer); gullTimer = null; }
        if (ambientNodes) { try { ambientNodes.src.stop(); ambientNodes.swell.stop(); } catch (e) {} ambientNodes = null; }
    }

    // ============================================================
    // STINGERS & DUCKING — short musical phrases for real moments,
    // played in the SAME key family as the score (D natural minor /
    // F major) so they read as part of the music rather than a beep
    // over it. The bed briefly ducks so the phrase has room.
    // ============================================================
    let duckTimer = null;
    function duckMusic(depth = 0.45, holdMs = 1400) {
        if (!musicAudio) return;
        const a = musicAudio;
        const full = MUSIC_VOL * ((PLAYLIST[musicTrackIdx] && PLAYLIST[musicTrackIdx].trim) || 1);
        if (duckTimer) { clearTimeout(duckTimer); duckTimer = null; }
        fadeTo(a, full * (1 - depth), 220);
        duckTimer = setTimeout(() => {
            duckTimer = null;
            if (musicAudio === a && musicPlaying) fadeTo(a, full, 900);
        }, holdMs);
    }
    // one plucked/bowed note with a soft attack — reads as an instrument
    function note(freq, when, dur, vol, type = 'triangle') {
        const c = init(); if (!c) return;
        const t0 = c.currentTime + when;
        const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
        o.type = type; o.frequency.setValueAtTime(freq, t0);
        lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.max(900, freq * 4), t0);
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(lp).connect(g).connect(c.destination);
        o.start(t0); o.stop(t0 + dur + 0.05);
    }
    const STINGERS = {
        // D minor rising arpeggio, settles on the octave — "something finished"
        build:    { notes: [[293.66, 0], [349.23, 0.10], [440.00, 0.20], [587.33, 0.32]], dur: 0.85, vol: 0.075 },
        // F major triad with an added 9th — brighter, "you grew"
        levelup:  { notes: [[349.23, 0], [440.00, 0.09], [523.25, 0.18], [698.46, 0.28], [783.99, 0.40]], dur: 1.1, vol: 0.085 },
        // short two-note lift — "claimed"
        reward:   { notes: [[440.00, 0], [659.25, 0.11]], dur: 0.6, vol: 0.065 },
        // low falling third — "lost / fell"
        loss:     { notes: [[293.66, 0], [246.94, 0.16], [196.00, 0.34]], dur: 1.0, vol: 0.07, type: 'sine' }
    };
    function stinger(kind) {
        if (sfxMuted) return;
        const s = STINGERS[kind]; if (!s) return;
        duckMusic(kind === 'levelup' ? 0.55 : 0.4, kind === 'levelup' ? 1800 : 1200);
        for (const [f, at] of s.notes) note(f, at, s.dur, s.vol, s.type || 'triangle');
        // a soft fifth underneath the first note gives the phrase body
        note(s.notes[0][0] / 2, 0, s.dur * 1.2, s.vol * 0.5, 'sine');
    }

    function startMusic() {
        if (musicPlaying) return;
        musicPlaying = true; failCount = 0; usingFallback = false;
        queue = buildQueue(musicMode); qpos = 0;
        crossfadeTo(queue[0]);
    }
    function stopMusic() {
        musicPlaying = false;
        if (usingFallback && typeof ProcMusic !== 'undefined') { ProcMusic.stop(); usingFallback = false; }
        if (musicAudio) { const a = musicAudio; fadeTo(a, 0, () => { try { a.pause(); a.src = ''; } catch (e) {} }); musicAudio = null; }
        if (onTrackChange) onTrackChange(null, -1);
    }
    // Adaptive: swap the whole mood (calm village ↔ epic battle) with a crossfade.
    function setMusicMode(mode) {
        if (mode === musicMode) return;
        musicMode = mode;
        if (usingFallback && typeof ProcMusic !== 'undefined') { ProcMusic.setBattle(mode === 'epic'); return; }
        if (musicPlaying) { queue = buildQueue(mode); qpos = 0; crossfadeTo(queue[0]); }
    }
    function getCurrentTrack() { return musicPlaying ? PLAYLIST[musicTrackIdx] : null; }

    return {
        // soft wooden tick: low knock + bright transient — reads as "physical button"
        click: () => { tone(880, 0.03, 'sine', 0.045); tone(240, 0.05, 'triangle', 0.05); },
        place: () => { tone(440, 0.08, 'sine', 0.13); setTimeout(() => tone(660, 0.12, 'sine', 0.10), 60); },
        coin:  () => { tone(1320, 0.06, 'sine', 0.08); setTimeout(() => tone(1760, 0.08, 'sine', 0.06), 50); },
        upgrade: () => { tone(523, 0.1, 'sine', 0.12); setTimeout(() => tone(659, 0.1, 'sine', 0.12), 80); setTimeout(() => tone(784, 0.18, 'sine', 0.12), 160); },
        train: () => { tone(220, 0.08, 'triangle', 0.09); setTimeout(() => tone(330, 0.1, 'triangle', 0.07), 50); },
        attack: () => { noise(0.15, 0.10, 800); setTimeout(() => tone(120, 0.2, 'sine', 0.10), 50); },
        victory: () => chord([523, 659, 784, 1047], 0.6, 'sine', 0.12),
        defeat: () => chord([392, 311, 247, 196], 0.5, 'triangle', 0.10),
        levelup: () => chord([523, 659, 784, 1047, 1319], 0.4, 'sine', 0.14),
        error: () => tone(150, 0.15, 'sine', 0.10),
        whoosh: () => noise(0.2, 0.05, 400),
        achievement: () => { chord([659, 880, 1175], 0.3, 'sine', 0.13); setTimeout(() => chord([784, 1047, 1397], 0.4, 'sine', 0.12), 200); },
        // ---- Music: real recorded medieval tracks (real instruments / real songs),
        // mood-adaptive (calm village ↔ epic battle), synth fallback if offline. ----
        startMusic: () => { if (musicEnabled) startMusic(); },
        stopMusic,
        nextTrack: () => { if (musicPlaying) nextTrack(); },
        prevTrack: () => { if (musicPlaying) prevTrack(); },
        getCurrentTrack,
        onTrackChange: (cb) => { onTrackChange = cb; if (typeof ProcMusic !== 'undefined') ProcMusic.onChange(cb); },
        setBattleMusic: (on) => { setMusicMode(on ? 'epic' : 'calm'); },
        startAmbient, stopAmbient, stinger, duckMusic,
        preloadMusic: () => { try { preloadFirst(); } catch (e) {} },
        fanfare: () => {},   // entry is now the real recorded theme (no synth flourish)
        enableMusic: () => { musicEnabled = true; startMusic(); return true; },
        toggleMusic: () => {
            musicEnabled = !musicEnabled;
            musicEnabled ? startMusic() : stopMusic();
            return musicEnabled;
        },
        isMusicOn: () => musicEnabled,
        toggleSfx: () => { sfxMuted = !sfxMuted; return sfxMuted; },
        isSfxMuted: () => sfxMuted,
        // Legacy compat
        toggleMute: () => { sfxMuted = !sfxMuted; return sfxMuted; },
        isMuted: () => sfxMuted
    };
})();

// ----- POPUPS (floating "+X" numbers) -----
function popup(text, opts = {}) {
    const el = document.createElement('div');
    el.className = 'fx-popup';
    el.textContent = text;
    if (opts.color) el.style.color = opts.color;
    if (opts.big) el.classList.add('big');
    const x = opts.x != null ? opts.x : window.innerWidth / 2;
    const y = opts.y != null ? opts.y : window.innerHeight / 2;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
}

function lootPopups(loot, originX, originY) {
    const icons = { coins: (typeof COIN_ICON !== 'undefined' ? COIN_ICON : ''), gold: (typeof GOLD_ICON !== 'undefined' ? GOLD_ICON : ''), iron: (typeof IRON_ICON !== 'undefined' ? IRON_ICON : ''), wood: (typeof WOOD_ICON !== 'undefined' ? WOOD_ICON : ''), food: (typeof FOOD_ICON !== 'undefined' ? FOOD_ICON : '') };
    const colors = { coins: '#fde047', gold: '#fbbf24', iron: '#cbd5e1', wood: '#a87d4a', food: '#86efac' };
    let i = 0;
    for (const [r, v] of Object.entries(loot)) {
        if (!v) continue;
        setTimeout(() => {
            popupHTML(`${icons[r] || ''} +${v}`, {
                color: colors[r] || '#fff',
                x: originX + (Math.random() - 0.5) * 60,
                y: originY + (Math.random() - 0.5) * 30
            });
        }, i * 100);
        i++;
    }
}

// Like popup() but allows HTML content (for SVG icons)
function popupHTML(html, opts = {}) {
    const el = document.createElement('div');
    el.className = 'fx-popup';
    el.innerHTML = html;
    if (opts.color) el.style.color = opts.color;
    if (opts.big) el.classList.add('big');
    el.style.left = (opts.x != null ? opts.x : window.innerWidth / 2) + 'px';
    el.style.top = (opts.y != null ? opts.y : window.innerHeight / 2) + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1600);
}

// ----- CONFETTI -----
function confetti(count = 80, duration = 2500) {
    const container = document.createElement('div');
    container.className = 'fx-confetti-container';
    document.body.appendChild(container);
    const colors = ['#fbbf24', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#fff'];
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'fx-confetti-piece';
        p.style.background = colors[Math.floor(Math.random() * colors.length)];
        p.style.left = (Math.random() * 100) + '%';
        p.style.animationDelay = (Math.random() * 0.3) + 's';
        p.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
        p.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(p);
    }
    setTimeout(() => container.remove(), duration);
}

// ----- SCREEN SHAKE -----
function screenShake(intensity = 6, duration = 400) {
    const root = document.getElementById('app');
    if (!root) return;
    root.style.animation = `screenShake ${duration}ms cubic-bezier(.36,.07,.19,.97) both`;
    root.style.setProperty('--shake-intensity', intensity + 'px');
    setTimeout(() => { root.style.animation = ''; }, duration);
}

// ----- SPARKLE BURST -----
function sparkleBurst(x, y, count = 12) {
    for (let i = 0; i < count; i++) {
        const s = document.createElement('div');
        s.className = 'fx-sparkle';
        const angle = (Math.PI * 2 * i) / count;
        const dist = 30 + Math.random() * 50;
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        s.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 800);
    }
}

// Bind click sound to all buttons globally
document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .nav-btn, .build-card, .raid-card, .hero-card');
    if (btn && !btn.disabled) Audio.click();
}, true);
