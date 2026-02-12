# GearsOfFailure

![CI Status](https://github.com/andreedvardsson/GearsOfFailure/actions/workflows/ci.yml/badge.svg)

Tvåspelar Tic-Tac-Toe som körs publikt på Render.

Detta projekt är gjort av en vibe coder med hjälp av OpenAI Codex.

## Play Online

- App: `https://gearsoffailure.onrender.com`
- Health: `https://gearsoffailure.onrender.com/health`

## How It Works

1. Spelare 1 öppnar appen och klickar `Skapa spel`.
2. En spelkod skapas och en länk visas.
3. Spelare 1 delar länken eller koden med spelare 2.
4. Spelare 2 öppnar länken (eller skriver in koden) och klickar `Gå med`.
5. Spelet startar och spelarna turas om att lägga `X` och `O`.
6. När spelet är slut visas popup `Spela igen?` för båda.
7. Om båda väljer `Ja` startar ny runda i samma session.
8. Om någon väljer `Nej` avslutas sessionen.

## Game Rules

1. Spelet spelas på ett 3x3-rutnät.
2. En spelare är `X`, den andra är `O`.
3. Man får bara spela i tomma rutor.
4. Tre i rad (vågrätt, lodrätt eller diagonalt) vinner.
5. Om alla rutor fylls utan vinnare blir det oavgjort.

## Notes

- På Render Free kan appen sova vid inaktivitet.
- Första request efter vila kan ta längre tid.

## Run Locally

```bash
cd simple-app/python-app
python3 tic_tac_toe.py
```

Local URL: `http://localhost:8001`
