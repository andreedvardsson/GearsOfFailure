# Simple Python app for GearsOfFailure

Two-player Tic-Tac-Toe with invite code and browser UI.

## Run

```bash
cd simple-app/python-app
python3 app.py
```

Open: `http://localhost:8001`

## How to play (2 players)

1. Player 1 clicks **Skapa spel**.
2. Share the game code (or link) shown on screen.
3. Player 2 enters the code and clicks **Gå med**.
4. Play turns on the 3x3 board.

## API

- `POST /invite` create a game and get token for player X
- `POST /join` join an existing game as player O
- `POST /move` play a move (`position` 0-8)
- `GET /state?game_id=...&token=...` get current game state
- `GET /health` service health
