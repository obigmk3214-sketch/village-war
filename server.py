#!/usr/bin/env python3
"""
Village War backend — single-file, zero-dependency (Python stdlib + SQLite).

Serves the static game AND a JSON API on the same origin (so no CORS issues),
turning the previously-simulated social systems into real server-backed ones:

  POST /api/register   {name, password}        -> {token, player}
  POST /api/login      {name, password}        -> {token, player}
  POST /api/save       {token, state}          -> {ok}             (server-authoritative save)
  GET  /api/load?token=...                      -> {state}
  GET  /api/leaderboard                         -> {rows:[...]}    (real, aggregates all accounts)
  GET  /api/clan/list                           -> {clans:[...]}
  POST /api/clan/create {token, name}          -> {clan}
  POST /api/clan/join   {token, clanId}        -> {clan}
  POST /api/clan/leave  {token}                -> {ok}
  GET  /api/clan?token=...                       -> {clan, members, chat}
  POST /api/clan/chat   {token, msg}           -> {ok}

Run:  python3 server.py [port]      (default 3456)
"""

import sys, os, json, sqlite3, hashlib, secrets, time, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.environ.get("VW_ROOT") or os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.environ.get("VW_DB") or os.path.join(ROOT, "villagewar.db")
PORT = int(os.environ.get("PORT") or (sys.argv[1] if len(sys.argv) > 1 else 3456))

_db_lock = threading.Lock()

# ---- simple in-memory rate limiter (per-IP, sliding window) ----
_rate = {}
_rate_lock = threading.Lock()
RATE_MAX = 60          # requests
RATE_WINDOW = 60.0     # seconds
AUTH_MAX = 10          # stricter limit for register/login per window


def rate_ok(ip, path):
    limit = AUTH_MAX if path in ("/api/register", "/api/login") else RATE_MAX
    now = time.time()
    key = (ip, "auth" if limit == AUTH_MAX else "gen")
    with _rate_lock:
        hits = [t for t in _rate.get(key, []) if now - t < RATE_WINDOW]
        if len(hits) >= limit:
            _rate[key] = hits
            return False
        hits.append(now)
        _rate[key] = hits
        return True


def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            name_lower TEXT UNIQUE NOT NULL,
            salt TEXT NOT NULL,
            pwhash TEXT NOT NULL,
            token TEXT,
            trophies INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            state TEXT,
            clan_id INTEGER,
            created REAL,
            updated REAL
        );
        CREATE TABLE IF NOT EXISTS clans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            owner_id INTEGER,
            created REAL
        );
        CREATE TABLE IF NOT EXISTS clan_chat (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clan_id INTEGER NOT NULL,
            author TEXT NOT NULL,
            msg TEXT NOT NULL,
            ts REAL NOT NULL
        );
        """)


# ---- auth helpers ----
def hash_pw(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000).hex()


def user_by_token(c, token):
    if not token:
        return None
    return c.execute("SELECT * FROM users WHERE token=?", (token,)).fetchone()


def player_public(u):
    return {"id": u["id"], "name": u["name"], "trophies": u["trophies"], "level": u["level"],
            "clanId": u["clan_id"]}


# ---- API handlers (each returns (status, dict)) ----
def api_register(body):
    name = (body.get("name") or "").strip()
    pw = body.get("password") or ""
    if not (3 <= len(name) <= 16) or not name.replace("_", "").replace(" ", "").isalnum():
        return 400, {"error": "Name must be 3-16 letters/numbers."}
    if len(pw) < 4:
        return 400, {"error": "Password must be at least 4 characters."}
    with _db_lock, db() as c:
        if c.execute("SELECT 1 FROM users WHERE name_lower=?", (name.lower(),)).fetchone():
            return 409, {"error": "That name is taken."}
        salt = secrets.token_hex(8)
        token = secrets.token_hex(16)
        now = time.time()
        c.execute("""INSERT INTO users(name,name_lower,salt,pwhash,token,trophies,level,state,created,updated)
                     VALUES(?,?,?,?,?,0,1,?,?,?)""",
                  (name, name.lower(), salt, hash_pw(pw, salt), token, None, now, now))
        u = c.execute("SELECT * FROM users WHERE name_lower=?", (name.lower(),)).fetchone()
        return 200, {"token": token, "player": player_public(u)}


def api_login(body):
    name = (body.get("name") or "").strip()
    pw = body.get("password") or ""
    with _db_lock, db() as c:
        u = c.execute("SELECT * FROM users WHERE name_lower=?", (name.lower(),)).fetchone()
        if not u or hash_pw(pw, u["salt"]) != u["pwhash"]:
            return 401, {"error": "Wrong name or password."}
        token = secrets.token_hex(16)
        c.execute("UPDATE users SET token=? WHERE id=?", (token, u["id"]))
        u = c.execute("SELECT * FROM users WHERE id=?", (u["id"],)).fetchone()
        return 200, {"token": token, "player": player_public(u)}


def api_save(body):
    with _db_lock, db() as c:
        u = user_by_token(c, body.get("token"))
        if not u:
            return 401, {"error": "Not logged in."}
        state = body.get("state") or {}
        # The leaderboard ranks on these two columns, and the save blob is
        # client-supplied, so clamp them to sane bounds. This won't stop a
        # determined cheater (a truly authoritative save would re-simulate), but it
        # blocks the trivial "POST trophies: 99999999" leaderboard takeover.
        try:
            trophies = max(0, min(1_000_000, int(state.get("trophies") or 0)))
        except (TypeError, ValueError):
            trophies = 0
        try:
            level = max(1, min(500, int(state.get("level") or 1)))
        except (TypeError, ValueError):
            level = 1
        c.execute("UPDATE users SET state=?, trophies=?, level=?, updated=? WHERE id=?",
                  (json.dumps(state), trophies, level, time.time(), u["id"]))
        return 200, {"ok": True}


def api_load(qs):
    with db() as c:
        u = user_by_token(c, (qs.get("token") or [None])[0])
        if not u:
            return 401, {"error": "Not logged in."}
        return 200, {"state": json.loads(u["state"]) if u["state"] else None,
                     "player": player_public(u)}


def api_leaderboard(qs):
    with db() as c:
        rows = c.execute("""SELECT u.name, u.trophies, u.level, cl.name AS clan
                            FROM users u LEFT JOIN clans cl ON cl.id=u.clan_id
                            ORDER BY u.trophies DESC, u.level DESC LIMIT 50""").fetchall()
        return 200, {"rows": [{"name": r["name"], "trophies": r["trophies"],
                               "level": r["level"], "clan": r["clan"]} for r in rows]}


def api_clan_list(qs):
    with db() as c:
        rows = c.execute("""SELECT cl.id, cl.name, COUNT(u.id) AS members,
                                   COALESCE(SUM(u.trophies),0) AS trophies
                            FROM clans cl LEFT JOIN users u ON u.clan_id=cl.id
                            GROUP BY cl.id ORDER BY trophies DESC LIMIT 50""").fetchall()
        return 200, {"clans": [{"id": r["id"], "name": r["name"],
                                "members": r["members"], "trophies": r["trophies"]} for r in rows]}


def api_clan_create(body):
    with _db_lock, db() as c:
        u = user_by_token(c, body.get("token"))
        if not u:
            return 401, {"error": "Not logged in."}
        name = (body.get("name") or "").strip()
        if not (3 <= len(name) <= 20):
            return 400, {"error": "Clan name must be 3-20 chars."}
        # Restrict charset (like account names) so a clan name can't smuggle HTML
        # into other players' leaderboards / clan browser.
        if not name.replace("_", "").replace(" ", "").replace("-", "").isalnum():
            return 400, {"error": "Clan name: letters, numbers, spaces, - and _ only."}
        if c.execute("SELECT 1 FROM clans WHERE name=?", (name,)).fetchone():
            return 409, {"error": "Clan name taken."}
        c.execute("INSERT INTO clans(name,owner_id,created) VALUES(?,?,?)", (name, u["id"], time.time()))
        clan = c.execute("SELECT * FROM clans WHERE name=?", (name,)).fetchone()
        c.execute("UPDATE users SET clan_id=? WHERE id=?", (clan["id"], u["id"]))
        return 200, {"clan": {"id": clan["id"], "name": clan["name"]}}


def api_clan_join(body):
    with _db_lock, db() as c:
        u = user_by_token(c, body.get("token"))
        if not u:
            return 401, {"error": "Not logged in."}
        cid = int(body.get("clanId") or 0)
        clan = c.execute("SELECT * FROM clans WHERE id=?", (cid,)).fetchone()
        if not clan:
            return 404, {"error": "Clan not found."}
        c.execute("UPDATE users SET clan_id=? WHERE id=?", (cid, u["id"]))
        return 200, {"clan": {"id": clan["id"], "name": clan["name"]}}


def api_clan_leave(body):
    with _db_lock, db() as c:
        u = user_by_token(c, body.get("token"))
        if not u:
            return 401, {"error": "Not logged in."}
        c.execute("UPDATE users SET clan_id=NULL WHERE id=?", (u["id"],))
        return 200, {"ok": True}


def api_clan_get(qs):
    with db() as c:
        u = user_by_token(c, (qs.get("token") or [None])[0])
        if not u:
            return 401, {"error": "Not logged in."}
        if not u["clan_id"]:
            return 200, {"clan": None}
        clan = c.execute("SELECT * FROM clans WHERE id=?", (u["clan_id"],)).fetchone()
        if not clan:
            return 200, {"clan": None}
        members = c.execute("""SELECT name, trophies, level FROM users WHERE clan_id=?
                               ORDER BY trophies DESC""", (u["clan_id"],)).fetchall()
        chat = c.execute("""SELECT author, msg, ts FROM clan_chat WHERE clan_id=?
                            ORDER BY ts DESC LIMIT 40""", (u["clan_id"],)).fetchall()
        return 200, {
            "clan": {"id": clan["id"], "name": clan["name"]},
            "members": [{"name": m["name"], "trophies": m["trophies"], "level": m["level"]} for m in members],
            "chat": [{"author": r["author"], "msg": r["msg"], "ts": r["ts"]} for r in reversed(chat)]
        }


def api_clan_chat(body):
    with _db_lock, db() as c:
        u = user_by_token(c, body.get("token"))
        if not u:
            return 401, {"error": "Not logged in."}
        if not u["clan_id"]:
            return 400, {"error": "Join a clan first."}
        msg = (body.get("msg") or "").strip()[:200]
        if not msg:
            return 400, {"error": "Empty message."}
        c.execute("INSERT INTO clan_chat(clan_id,author,msg,ts) VALUES(?,?,?,?)",
                  (u["clan_id"], u["name"], msg, time.time()))
        return 200, {"ok": True}


GET_ROUTES = {
    "/api/load": api_load,
    "/api/leaderboard": api_leaderboard,
    "/api/clan/list": api_clan_list,
    "/api/clan": api_clan_get,
}
POST_ROUTES = {
    "/api/register": api_register,
    "/api/login": api_login,
    "/api/save": api_save,
    "/api/clan/create": api_clan_create,
    "/api/clan/join": api_clan_join,
    "/api/clan/leave": api_clan_leave,
    "/api/clan/chat": api_clan_chat,
}


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass

    def _sec_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "no-referrer")

    def _client_ip(self):
        # honour a reverse proxy if present, else the socket peer
        fwd = self.headers.get("X-Forwarded-For")
        return (fwd.split(",")[0].strip() if fwd else self.client_address[0])

    def _json(self, status, obj):
        data = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self._sec_headers()
        self.end_headers()
        self.wfile.write(data)

    def _static(self):
        path = urlparse(self.path).path
        if path == "/":
            path = "/index.html"
        # prevent directory traversal
        safe = os.path.normpath(os.path.join(ROOT, path.lstrip("/")))
        if not safe.startswith(ROOT) or not os.path.isfile(safe):
            self._json(404, {"error": "not found"})
            return
        ctypes = {".html": "text/html", ".js": "application/javascript", ".css": "text/css",
                  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
                  ".svg": "image/svg+xml", ".ico": "image/x-icon",
                  ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".m4a": "audio/mp4"}
        ext = os.path.splitext(safe)[1].lower()
        with open(safe, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", ctypes.get(ext, "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self._sec_headers()
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in GET_ROUTES:
            if not rate_ok(self._client_ip(), parsed.path):
                self._json(429, {"error": "Too many requests — slow down."})
                return
            try:
                status, obj = GET_ROUTES[parsed.path](parse_qs(parsed.query))
                self._json(status, obj)
            except Exception as e:
                self._json(500, {"error": str(e)})
            return
        self._static()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path in POST_ROUTES:
            if not rate_ok(self._client_ip(), parsed.path):
                self._json(429, {"error": "Too many requests — slow down."})
                return
            try:
                length = int(self.headers.get("Content-Length") or 0)
                if length > 256 * 1024:  # cap body size (saves can be a few KB; reject abuse)
                    self._json(413, {"error": "Payload too large."})
                    return
                raw = self.rfile.read(length) if length else b"{}"
                body = json.loads(raw.decode("utf-8") or "{}")
                status, obj = POST_ROUTES[parsed.path](body)
                self._json(status, obj)
            except Exception as e:
                self._json(500, {"error": str(e)})
            return
        self._json(404, {"error": "not found"})


def main():
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Village War server (game + API) on http://localhost:{PORT}  db={DB_PATH}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
