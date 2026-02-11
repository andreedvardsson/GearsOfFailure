from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse
import json
import os
import random
import secrets
import threading
import time

PORT = int(os.getenv("PORT", "8001"))

games = {}
games_lock = threading.Lock()


def new_game_id():
    return secrets.token_hex(3).upper()


def new_token():
    return secrets.token_urlsafe(16)


def check_winner(board):
    lines = [
        (0, 1, 2),
        (3, 4, 5),
        (6, 7, 8),
        (0, 3, 6),
        (1, 4, 7),
        (2, 5, 8),
        (0, 4, 8),
        (2, 4, 6),
    ]
    for a, b, c in lines:
        if board[a] != " " and board[a] == board[b] == board[c]:
            return board[a]
    if all(cell != " " for cell in board):
        return "draw"
    return None


def role_for_token(game, token):
    if token == game["players"]["X"]:
        return "X"
    if token == game["players"]["O"]:
        return "O"
    return None


def reset_round(game):
    game["board"] = [" "] * 9
    game["turn"] = random.choice(["X", "O"])
    game["winner"] = None
    game["rematch"] = {
        "X": None,
        "O": None,
        "declined_by": None,
    }


def refresh_rematch_declined(game):
    if game["rematch"]["X"] is False:
        game["rematch"]["declined_by"] = "X"
        return
    if game["rematch"]["O"] is False:
        game["rematch"]["declined_by"] = "O"
        return
    game["rematch"]["declined_by"] = None


def game_payload(game_id, game, role):
    return {
        "game_id": game_id,
        "board": game["board"],
        "turn": game["turn"],
        "winner": game["winner"],
        "closed": game["closed"],
        "you": role,
        "players": {
            "X": bool(game["players"]["X"]),
            "O": bool(game["players"]["O"]),
        },
        "rematch": {
            "X": game["rematch"]["X"],
            "O": game["rematch"]["O"],
            "declined_by": game["rematch"]["declined_by"],
        },
    }


HTML_PAGE = """<!doctype html>
<html lang=\"sv\">
<head>
  <meta charset=\"utf-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>GearsOfFailure Tic-Tac-Toe</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 980px; margin: 24px auto; padding: 0 16px; }
    .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    button { padding: 8px 12px; cursor: pointer; }
    input { padding: 8px; }
    .content-wrap { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; margin-top: 12px; }
    .game-column { min-width: 0; }
    #board { margin-top: 18px; display: grid; grid-template-columns: repeat(3, 90px); gap: 8px; }
    .cell { width: 90px; height: 90px; font-size: 36px; font-weight: bold; }
    .mono { font-family: monospace; }
    .hint { color: #444; }
    .fun-panel { border: 1px solid #ddd; border-radius: 10px; padding: 10px; background: #fafafa; }
    .fun-panel img { width: 100%; height: auto; border-radius: 8px; display: block; }
    @media (max-width: 900px) {
      .content-wrap { grid-template-columns: 1fr; }
      .fun-panel { max-width: 520px; }
    }
    #rematchModal {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.45);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-box {
      background: #fff;
      border-radius: 10px;
      width: min(460px, calc(100% - 24px));
      padding: 16px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    .modal-title { margin: 0 0 8px; }
    .modal-text { margin: 0 0 14px; }
    .vote-row { display: flex; gap: 10px; }
    .vote-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      border: 1px solid #bbb;
      border-radius: 8px;
      padding: 10px 14px;
      background: #fff;
    }
    .vote-btn:hover { border-color: #666; }
    .vote-icon { font-size: 18px; }
    .modal-note { margin-top: 10px; color: #444; font-size: 14px; }
  </style>
</head>
<body>
  <h1>Tic-Tac-Toe (2 spelare)</h1>
  <p class=\"hint\">Skapa spel, dela kod/länk och spela mot en annan person.</p>

  <div class=\"row\">
    <button id=\"createBtn\">Skapa spel</button>
    <input id=\"joinCode\" placeholder=\"Spelkod (t.ex. A1B2C3)\" />
    <button id=\"joinBtn\">Gå med</button>
  </div>

  <p id=\"share\" class=\"mono\"></p>
  <p id=\"status\"></p>

  <div class=\"content-wrap\">
    <div class=\"game-column\">
      <div id=\"board\"></div>
    </div>
    <aside class=\"fun-panel\">
      <img src=\"https://upload.wikimedia.org/wikipedia/commons/d/da/Donald_Trump_%2825245031795%29.jpg\" alt=\"Sidobild\" />
    </aside>
  </div>

  <div id=\"rematchModal\">
    <div class=\"modal-box\">
      <h2 class=\"modal-title\">Spela igen?</h2>
      <p id=\"rematchResult\" class=\"modal-text\"></p>
      <div class=\"vote-row\">
        <button id=\"yesBtn\" class=\"vote-btn"><span class=\"vote-icon\">✅</span>Ja</button>
        <button id=\"noBtn\" class=\"vote-btn"><span class=\"vote-icon\">❌</span>Nej</button>
      </div>
      <p id=\"rematchVotes\" class=\"modal-note\"></p>
    </div>
  </div>

  <script>
    let gameId = null;
    let token = null;
    let state = null;

    const statusEl = document.getElementById('status');
    const shareEl = document.getElementById('share');
    const boardEl = document.getElementById('board');
    const rematchModal = document.getElementById('rematchModal');
    const rematchResult = document.getElementById('rematchResult');
    const rematchVotes = document.getElementById('rematchVotes');

    function setStatus(msg) { statusEl.textContent = msg; }

    function parseQuery() {
      const p = new URLSearchParams(window.location.search);
      const qGame = p.get('game');
      if (qGame) {
        document.getElementById('joinCode').value = qGame;
      }
    }

    async function api(path, method='GET', body=null) {
      const opts = { method, headers: { 'Content-Type': 'application/json' } };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    }

    async function copyText(text) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        return false;
      }
    }

    function renderShare(gameCode, roleText) {
      const link = `${window.location.origin}/?game=${encodeURIComponent(gameCode)}`;
      const prefix = roleText ? `${roleText} ` : '';
      shareEl.innerHTML = `${prefix}Dela kod: ${gameCode} | Länk: <a id=\"shareLink\" href=\"${link}\" target=\"_blank\" rel=\"noopener\">${link}</a>`;
      const linkEl = document.getElementById('shareLink');
      linkEl.onclick = async (e) => {
        e.preventDefault();
        const ok = await copyText(link);
        setStatus(ok ? 'Länken kopierad.' : 'Kunde inte kopiera länken.');
      };
    }

    function voteText(v) {
      if (v === true) return 'Ja';
      if (v === false) return 'Nej';
      return 'Väntar';
    }

    function showRematchPrompt() {
      if (!state || !state.you || !state.players.O) {
        rematchModal.style.display = 'none';
        return;
      }
      if (state.closed) {
        rematchResult.textContent = 'Session avslutad. Minst en spelare valde Nej.';
        rematchVotes.textContent = `X: ${voteText(state.rematch.X)} | O: ${voteText(state.rematch.O)}`;
        document.getElementById('yesBtn').style.display = 'none';
        document.getElementById('noBtn').style.display = 'none';
        rematchModal.style.display = 'flex';
        return;
      }
      if (!state.winner) {
        rematchModal.style.display = 'none';
        return;
      }
      const winnerText = state.winner === 'draw' ? 'Oavgjort!' : `Spelare ${state.winner} vann.`;
      rematchResult.textContent = `${winnerText} Spela igen?`;
      rematchVotes.textContent = `X: ${voteText(state.rematch.X)} | O: ${voteText(state.rematch.O)}`;
      document.getElementById('yesBtn').style.display = 'inline-flex';
      document.getElementById('noBtn').style.display = 'inline-flex';
      rematchModal.style.display = 'flex';
    }

    function renderBoard() {
      boardEl.innerHTML = '';
      if (!state) return;
      state.board.forEach((cell, idx) => {
        const btn = document.createElement('button');
        btn.className = 'cell';
        btn.textContent = cell === ' ' ? '' : cell;
        const myTurn = state.you && state.turn === state.you && !state.winner;
        btn.disabled = !myTurn || cell !== ' ';
        btn.onclick = async () => {
          try {
            await api('/move', 'POST', { game_id: gameId, token, position: idx });
            await refresh();
          } catch (e) {
            setStatus(e.message);
          }
        };
        boardEl.appendChild(btn);
      });
    }

    function renderStatus() {
      if (!state) {
        setStatus('Skapa eller gå med i ett spel.');
        return;
      }
      if (!state.players.O) {
        setStatus('Väntar på spelare O...');
        return;
      }
      if (state.closed) {
        setStatus('Session avslutad. Starta ett nytt spel för att fortsätta.');
        return;
      }
      if (state.winner) {
        if (state.rematch.declined_by) {
          setStatus(`Spelare ${state.rematch.declined_by} valde Nej. Session avslutad.`);
          return;
        }
        if (state.winner === 'draw') {
          setStatus('Oavgjort. Väntar på svar: Spela igen?');
          return;
        }
        setStatus(`Spelare ${state.winner} vann. Väntar på svar: Spela igen?`);
        return;
      }
      if (!state.you) {
        setStatus(`Pågående match. Tur: ${state.turn}`);
        return;
      }
      if (state.turn === state.you) {
        setStatus(`Din tur (${state.you}).`);
      } else {
        setStatus(`Motståndarens tur. Du är ${state.you}.`);
      }
    }

    async function refresh() {
      if (!gameId) return;
      try {
        state = await api(`/state?game_id=${encodeURIComponent(gameId)}&token=${encodeURIComponent(token || '')}`);
        renderBoard();
        renderStatus();
        showRematchPrompt();
      } catch (e) {
        setStatus(e.message);
      }
    }

    async function submitRematch(decision) {
      if (!gameId || !token) return;
      try {
        await api('/rematch', 'POST', { game_id: gameId, token, decision });
        await refresh();
      } catch (e) {
        setStatus(e.message);
      }
    }

    document.getElementById('createBtn').onclick = async () => {
      try {
        const data = await api('/invite', 'POST', {});
        gameId = data.game_id;
        token = data.token;
        renderShare(gameId, '');
        rematchModal.style.display = 'none';
        await refresh();
      } catch (e) {
        setStatus(e.message);
      }
    };

    document.getElementById('joinBtn').onclick = async () => {
      try {
        const code = document.getElementById('joinCode').value.trim().toUpperCase();
        if (!code) {
          setStatus('Fyll i spelkod.');
          return;
        }
        const data = await api('/join', 'POST', { game_id: code });
        gameId = data.game_id;
        token = data.token;
        renderShare(gameId, `Du gick med i spel ${gameId} som O. `);
        rematchModal.style.display = 'none';
        await refresh();
      } catch (e) {
        setStatus(e.message);
      }
    };

    document.getElementById('yesBtn').onclick = () => submitRematch('yes');
    document.getElementById('noBtn').onclick = () => submitRematch('no');

    parseQuery();
    setInterval(refresh, 1200);
    refresh();
  </script>
</body>
</html>
"""


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, status, html):
        body = html.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length == 0:
            return {}
        raw = self.rfile.read(content_length)
        return json.loads(raw.decode("utf-8"))

    def log_message(self, fmt, *args):
        return

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/health":
            self._send_json(200, {"status": "ok", "app": "tic-tac-toe", "time": int(time.time())})
            return

        if parsed.path == "/state":
            params = parse_qs(parsed.query)
            game_id = (params.get("game_id") or [""])[0].upper()
            token = (params.get("token") or [""])[0]
            if not game_id:
                self._send_json(400, {"error": "game_id is required"})
                return

            with games_lock:
                game = games.get(game_id)
                if not game:
                    self._send_json(404, {"error": "Game not found"})
                    return
                role = role_for_token(game, token)
                payload = game_payload(game_id, game, role)

            self._send_json(200, payload)
            return

        if parsed.path == "/":
            self._send_html(200, HTML_PAGE)
            return

        self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)

        try:
            data = self._read_json_body()
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        if parsed.path == "/invite":
            with games_lock:
                game_id = new_game_id()
                while game_id in games:
                    game_id = new_game_id()

                token_x = new_token()
                games[game_id] = {
                    "board": [" "] * 9,
                    "players": {"X": token_x, "O": None},
                    "turn": random.choice(["X", "O"]),
                    "winner": None,
                    "closed": False,
                    "rematch": {
                        "X": None,
                        "O": None,
                        "declined_by": None,
                    },
                }

            self._send_json(201, {"game_id": game_id, "token": token_x, "you": "X"})
            return

        if parsed.path == "/join":
            game_id = str(data.get("game_id", "")).upper()
            if not game_id:
                self._send_json(400, {"error": "game_id is required"})
                return

            with games_lock:
                game = games.get(game_id)
                if not game:
                    self._send_json(404, {"error": "Game not found"})
                    return
                if game["players"]["O"] is not None:
                    self._send_json(409, {"error": "Game already has 2 players"})
                    return

                token_o = new_token()
                game["players"]["O"] = token_o

            self._send_json(200, {"game_id": game_id, "token": token_o, "you": "O"})
            return

        if parsed.path == "/move":
            game_id = str(data.get("game_id", "")).upper()
            token = str(data.get("token", ""))
            position = data.get("position")

            if not game_id or not token:
                self._send_json(400, {"error": "game_id and token are required"})
                return

            if not isinstance(position, int) or not 0 <= position <= 8:
                self._send_json(400, {"error": "position must be an integer 0-8"})
                return

            with games_lock:
                game = games.get(game_id)
                if not game:
                    self._send_json(404, {"error": "Game not found"})
                    return

                role = role_for_token(game, token)
                if not role:
                    self._send_json(403, {"error": "Invalid token for this game"})
                    return

                if game["closed"]:
                    self._send_json(409, {"error": "Session is closed. Start a new game."})
                    return

                if game["winner"]:
                    self._send_json(409, {"error": "Game is already finished"})
                    return

                if game["players"]["O"] is None:
                    self._send_json(409, {"error": "Waiting for second player"})
                    return

                if game["turn"] != role:
                    self._send_json(409, {"error": "Not your turn"})
                    return

                if game["board"][position] != " ":
                    self._send_json(409, {"error": "Cell already occupied"})
                    return

                game["board"][position] = role
                game["winner"] = check_winner(game["board"])
                if game["winner"]:
                    game["rematch"]["X"] = None
                    game["rematch"]["O"] = None
                    game["rematch"]["declined_by"] = None
                else:
                    game["turn"] = "O" if game["turn"] == "X" else "X"

                payload = game_payload(game_id, game, role)

            self._send_json(200, payload)
            return

        if parsed.path == "/rematch":
            game_id = str(data.get("game_id", "")).upper()
            token = str(data.get("token", ""))
            decision = str(data.get("decision", "")).lower()

            if not game_id or not token:
                self._send_json(400, {"error": "game_id and token are required"})
                return

            if decision not in {"yes", "no"}:
                self._send_json(400, {"error": "decision must be 'yes' or 'no'"})
                return

            with games_lock:
                game = games.get(game_id)
                if not game:
                    self._send_json(404, {"error": "Game not found"})
                    return

                role = role_for_token(game, token)
                if not role:
                    self._send_json(403, {"error": "Invalid token for this game"})
                    return

                if game["closed"]:
                    self._send_json(409, {"error": "Session is closed. Start a new game."})
                    return

                if not game["winner"]:
                    self._send_json(409, {"error": "Rematch vote is only allowed after game end"})
                    return

                game["rematch"][role] = decision == "yes"
                refresh_rematch_declined(game)

                restarted = False
                if game["rematch"]["X"] is True and game["rematch"]["O"] is True:
                    reset_round(game)
                    restarted = True
                elif decision == "no":
                    game["closed"] = True

                payload = game_payload(game_id, game, role)
                payload["restarted"] = restarted

            self._send_json(200, payload)
            return

        self._send_json(404, {"error": "Not found"})


if __name__ == "__main__":
    print(f"Tic-Tac-Toe app running on http://localhost:{PORT}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
