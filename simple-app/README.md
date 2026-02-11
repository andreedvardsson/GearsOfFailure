# Simple Python app for GearsOfFailure

Two-player Tic-Tac-Toe with invite code and browser UI.

## Open via GitHub (Codespaces)

1. Open this repo on GitHub.
2. Click `Code` -> `Codespaces` -> `Create codespace on main`.
3. In the Codespaces terminal run:

```bash
cd simple-app/python-app
python3 tic_tac_toe.py
```

4. Open the `Ports` tab, set port `8001` visibility to `Public`, then open the URL.

## Run

```bash
cd simple-app/python-app
python3 tic_tac_toe.py
```

Open: `http://localhost:8001`

## How to play (2 players)

1. Player 1 clicks **Skapa spel**.
2. Share the game code (or link) shown on screen.
3. Player 2 enters the code and clicks **Gå med**.
4. Play turns on the 5x5 board.
5. When the game ends, both players get a popup: **Spela igen?**
6. Choose `✅ Ja` or `❌ Nej`.
7. If both select `Ja`, a new round starts in the same session.
8. If any player selects `Nej`, the current session is closed and you must start a new game.

## API

- `POST /invite` create a game and get token for player X
- `POST /join` join an existing game as player O
- `POST /move` play a move (`position` 0-24)
- `POST /rematch` vote rematch (`decision`: `yes` or `no`)
- `GET /state?game_id=...&token=...` get current game state
- `GET /health` service health
