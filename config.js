// Runtime config — loaded before the game scripts.
// On GitHub Pages (static, no backend) leave this empty: the game runs fully
// offline with localStorage saves. If you host the backend (server.py) somewhere
// public, put its URL here to light up accounts / cloud saves / leaderboard / clans
// across the internet, e.g.:
//   window.VW_API_BASE = "https://villagewar-api.yourdomain.com";
window.VW_API_BASE = "";

// ---- Password gate ----------------------------------------------------------
// Anyone can open the website, but the game stays locked until the correct
// password is entered. Only the password's SHA-256 hash is stored here, never
// the password itself.
//
// To change the password: run in any browser console (or terminal) ...
//   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR PASSWORD'))
//     .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//   # or:  printf 'YOUR PASSWORD' | shasum -a 256
// ... and paste the resulting hash below.
window.VW_GATE = {
    enabled: true,
    // The check value is derived with PBKDF2-HMAC-SHA256 over a random salt, not
    // a bare hash. This file is public, so the value below WILL be taken and
    // attacked offline; the iteration count is what makes that expensive.
    //
    // Never write the plaintext password in this repo. It was previously kept in
    // a comment right here and echoed by deploy.sh, which published it in full.
    //
    // To rotate, in a terminal:
    //   python3 - <<'EOF'
    //   import hashlib, secrets
    //   pw = "your new passphrase"
    //   salt = secrets.token_bytes(16); it = 310000
    //   print(salt.hex())
    //   print(hashlib.pbkdf2_hmac('sha256', pw.encode(), salt, it, dklen=32).hex())
    //   EOF
    kdf: { salt: "a0a91047c0cb8b83cc94094d9fe71ef3", iterations: 310000 },
    hash: "4645ab17f95671cff56a9c7335c3572573a83da89a2b98a7b24f36870770de15",
    remember: true   // remember unlock on this device so it's not asked every visit
};
