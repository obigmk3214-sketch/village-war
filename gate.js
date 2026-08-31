// ============================================================
// PASSWORD GATE
// Anyone can open the site, but the game stays locked behind a
// password screen until the correct password is entered. Only the
// password's SHA-256 hash is shipped (config.js) — never the password.
//
// NOTE: this is a client-side gate. It reliably keeps casual visitors
// out, but it is not cryptographically unbreakable on a static host —
// a determined person who reads the page source could bypass it. For
// hard security, validate the password on the backend (server.py) and
// only then serve the game.
// ============================================================

(function () {
    const cfg = (typeof window !== 'undefined' && window.VW_GATE) || { enabled: false };
    if (!cfg.enabled || !cfg.hash) return;

    const LS_KEY = 'vw_gate_ok';

    async function sha256Hex(str) {
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
        return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // already unlocked on this device?
    try {
        if (cfg.remember && localStorage.getItem(LS_KEY) === cfg.hash) return;
    } catch (e) {}

    function buildGate() {
        if (document.getElementById('gate-overlay')) return;
        const g = document.createElement('div');
        g.id = 'gate-overlay';
        g.innerHTML = `
            <div class="gate-card">
                <div class="gate-crest">${(typeof svgIcon === 'function') ? svgIcon('lock') : '<svg viewBox="0 0 24 24" width="40" height="40"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#f4c44d" stroke-width="1.6"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#f4c44d" stroke-width="1.6"/></svg>'}</div>
                <h1 class="gate-title">Village War</h1>
                <p class="gate-sub">This realm is sealed. Enter the password to play.</p>
                <form id="gate-form" autocomplete="off">
                    <input id="gate-input" type="password" placeholder="Password" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" />
                    <button id="gate-submit" type="submit">Enter</button>
                </form>
                <div id="gate-err" class="gate-err"></div>
                <div class="gate-foot">Don't have it? Ask the keeper of the keep.</div>
            </div>`;
        document.body.appendChild(g);

        const form = g.querySelector('#gate-form');
        const input = g.querySelector('#gate-input');
        const err = g.querySelector('#gate-err');
        const card = g.querySelector('.gate-card');
        setTimeout(() => input.focus(), 50);

        let tries = 0, lockedUntil = 0;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const now = Date.now();
            if (now < lockedUntil) { err.textContent = `Too many attempts — wait a moment.`; return; }
            // Trim before hashing. Pasting the password from a message very often
            // brings a trailing space or newline with it, and mobile keyboards can
            // add one too — which failed silently and just looked like a wrong
            // password. No real password here starts or ends with whitespace.
            const val = (input.value || '').trim();
            let hex = '';
            try { hex = await sha256Hex(val); } catch (e2) { err.textContent = 'Your browser blocked the check.'; return; }
            if (hex === cfg.hash) {
                try { if (cfg.remember) localStorage.setItem(LS_KEY, cfg.hash); } catch (e3) {}
                g.classList.add('gate-open');
                setTimeout(() => g.remove(), 650);
            } else {
                tries++;
                err.textContent = tries >= 2
                    ? 'Wrong password. Check for capitals — it is case-sensitive.'
                    : 'Wrong password.';
                input.value = '';
                card.classList.remove('gate-shake'); void card.offsetWidth; card.classList.add('gate-shake');
                if (tries >= 5) { lockedUntil = now + 5000; tries = 0; err.textContent = 'Too many attempts — locked for 5s.'; }
                input.focus();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildGate);
    } else {
        buildGate();
    }
})();
