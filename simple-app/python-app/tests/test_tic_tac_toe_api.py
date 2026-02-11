import json
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path
import sys


APP_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP_DIR))

import tic_tac_toe as app  # noqa: E402


class TicTacToeApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = app.ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def setUp(self):
        with app.games_lock:
            app.games.clear()

    def request(self, method, path, payload=None):
        url = f"http://127.0.0.1:{self.port}{path}"
        headers = {"Content-Type": "application/json"}
        body = None if payload is None else json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, method=method, data=body, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return resp.status, data
        except urllib.error.HTTPError as exc:
            data = json.loads(exc.read().decode("utf-8"))
            return exc.code, data

    def finish_game_with_starter_win(self):
        _, invite = self.request("POST", "/invite", {})
        game_id = invite["game_id"]
        token_x = invite["token"]

        _, join = self.request("POST", "/join", {"game_id": game_id})
        token_o = join["token"]

        _, state = self.request("GET", f"/state?game_id={game_id}&token={token_x}")
        starter = state["turn"]
        starter_token = token_x if starter == "X" else token_o
        other_token = token_o if starter == "X" else token_x

        # Starter wins by filling top row in a 5x5 board.
        self.request("POST", "/move", {"game_id": game_id, "token": starter_token, "position": 0})
        self.request("POST", "/move", {"game_id": game_id, "token": other_token, "position": 5})
        self.request("POST", "/move", {"game_id": game_id, "token": starter_token, "position": 1})
        self.request("POST", "/move", {"game_id": game_id, "token": other_token, "position": 6})
        self.request("POST", "/move", {"game_id": game_id, "token": starter_token, "position": 2})
        self.request("POST", "/move", {"game_id": game_id, "token": other_token, "position": 7})
        self.request("POST", "/move", {"game_id": game_id, "token": starter_token, "position": 3})
        self.request("POST", "/move", {"game_id": game_id, "token": other_token, "position": 8})
        _, end_state = self.request(
            "POST", "/move", {"game_id": game_id, "token": starter_token, "position": 4}
        )
        return game_id, token_x, token_o, end_state

    def test_invite_join_move_and_rematch_yes(self):
        game_id, token_x, token_o, end_state = self.finish_game_with_starter_win()
        self.assertIn(end_state["winner"], ["X", "O"])

        self.request("POST", "/rematch", {"game_id": game_id, "token": token_x, "decision": "yes"})
        _, rematch = self.request(
            "POST", "/rematch", {"game_id": game_id, "token": token_o, "decision": "yes"}
        )

        self.assertTrue(rematch["restarted"])
        self.assertIsNone(rematch["winner"])
        self.assertEqual(rematch["board"], [" "] * 25)
        self.assertIn(rematch["turn"], ["X", "O"])
        self.assertFalse(rematch["closed"])

    def test_rematch_no_closes_session(self):
        game_id, token_x, token_o, _ = self.finish_game_with_starter_win()

        _, rematch_no = self.request(
            "POST", "/rematch", {"game_id": game_id, "token": token_o, "decision": "no"}
        )
        self.assertTrue(rematch_no["closed"])
        self.assertEqual(rematch_no["rematch"]["declined_by"], "O")

        code, move_after_close = self.request(
            "POST", "/move", {"game_id": game_id, "token": token_x, "position": 24}
        )
        self.assertEqual(code, 409)
        self.assertIn("closed", move_after_close["error"].lower())


if __name__ == "__main__":
    unittest.main()
