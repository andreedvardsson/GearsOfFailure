# GearsOfFailure

![CI Status](https://github.com/andreedvardsson/GearsOfFailure/actions/workflows/ci.yml/badge.svg)

Minimal Python app for quick local testing.

## Open via GitHub

Run directly in GitHub Codespaces:

1. Open repo on GitHub.
2. Click `Code` -> `Codespaces` -> `Create codespace on main`.
3. In terminal:

```bash
cd simple-app/python-app
python3 tic_tac_toe.py
```

4. In `Ports`, make `8001` public and open the URL.

## Run

```bash
cd simple-app/python-app
python3 tic_tac_toe.py
```

## Endpoints

- `GET /` returns a hello message
- `GET /health` returns JSON status

Default URL: `http://localhost:8001`
