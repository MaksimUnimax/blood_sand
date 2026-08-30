"""Deterministic local acceptance for the standalone M5 backend foundation."""
import asyncio
import base64
import hashlib
import hmac
import json
import tempfile
import unittest
from unittest.mock import patch
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode

import httpx

from recommendations.api.app import create_app
from recommendations.application import RecommendationApplicationService
from recommendations.vk.config import VKConfigurationError, VKMiniAppConfig
from recommendations.vk.storage import VKStorage


APP_ID, USER_ID, KEY, ORIGIN = 54743026, 12345, "synthetic-m5-key", "https://miniapp.example.test"


class Clock:
    def __init__(self): self.value = datetime(2026, 8, 30, 12, 0, tzinfo=timezone.utc)
    def __call__(self): return self.value
    def advance(self, seconds): self.value += timedelta(seconds=seconds)


def signed(timestamp, **extra):
    values = {"vk_app_id": str(APP_ID), "vk_user_id": str(USER_ID), "vk_ts": str(timestamp)} | {k: str(v) for k, v in extra.items()}
    material = urlencode(sorted((k, v) for k, v in values.items() if k.startswith("vk_")))
    sign = base64.urlsafe_b64encode(hmac.new(KEY.encode(), material.encode(), hashlib.sha256).digest()).decode().rstrip("=")
    return urlencode([*values.items(), ("sign", sign)])


class M5BackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.clock = Clock()
        self.storage = VKStorage(str(Path(self.temp.name) / "state.sqlite"), clock=self.clock)
        self.config = VKMiniAppConfig(enabled=True, app_id=APP_ID, protected_key=KEY, session_ttl_seconds=900,
                                      allowed_origins=(ORIGIN,), launch_max_age_seconds=300, launch_future_clock_skew_seconds=60)
        self.app = create_app(service=RecommendationApplicationService(), miniapp_config=self.config, miniapp_storage=self.storage)

    def tearDown(self): self.storage.close(); self.temp.cleanup()

    def request(self, method, path, *, content=b"", headers=None):
        async def run():
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app, raise_app_exceptions=False), base_url="http://test") as client:
                return await client.request(method, path, content=content, headers=headers or {})
        return asyncio.run(run())

    def launch_header(self, timestamp=None):
        raw = signed(int((timestamp or self.clock()).timestamp()))
        return {"authorization": "VKLaunch " + base64.urlsafe_b64encode(raw.encode()).decode().rstrip("="), "origin": ORIGIN}

    def bootstrap(self, timestamp=None):
        response = self.request("POST", "/v1/vk/miniapp/session", headers=self.launch_header(timestamp))
        self.assertEqual(response.status_code, 200); return response.json()["session"]["session_token"]

    def bearer(self, token, **more): return {"authorization": "Bearer " + token, "origin": ORIGIN, "content-type": "application/json"} | more

    def test_bootstrap_boundaries_and_private_storage(self):
        for delta, expected in ((-300, 200), (-301, 401), (60, 200), (61, 401)):
            response = self.request("POST", "/v1/vk/miniapp/session", headers=self.launch_header(self.clock() + timedelta(seconds=delta)))
            self.assertEqual(response.status_code, expected)
        token = self.bootstrap()
        row = self.storage.connection.execute("select * from vk_miniapp_standalone_sessions where session_token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),)).fetchone()
        self.assertEqual(row["session_token_hash"], hashlib.sha256(token.encode()).hexdigest())
        self.assertEqual(len(row["launch_fingerprint"]), 64)
        self.assertNotIn(token, "".join(str(v) for v in row))
        self.assertNotIn("sign", "".join(str(v) for v in row).lower())

    def test_auth_and_origin_fail_closed(self):
        for headers in ({}, {"authorization": "Bearer x"}, {"authorization": "VKLaunch xx", "origin": ORIGIN}, self.launch_header() | {"origin": "https://wrong.test"}):
            response = self.request("POST", "/v1/vk/miniapp/session", headers=headers)
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()["error"]["code"], "MINIAPP_AUTH_INVALID")
        token = self.bootstrap()
        for headers in ({}, {"authorization": "Bearer unknown", "origin": ORIGIN}, self.bearer(token) | {"origin": "https://wrong.test"}):
            response = self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=b"{}", headers=headers)
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()["error"]["code"], "MINIAPP_SESSION_INVALID")

    def test_rotation_absolute_ttl_and_fingerprint_cleanup(self):
        launch = self.clock()
        first = self.bootstrap(launch); second = self.bootstrap(launch)
        self.assertNotEqual(first, second)
        self.assertEqual(self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=b'{"birth_day":20,"birth_month":12,"gender":"male"}', headers=self.bearer(first)).status_code, 401)
        row = self.storage.connection.execute("select expires_at from vk_miniapp_standalone_sessions where session_token_hash=?", (hashlib.sha256(second.encode()).hexdigest(),)).fetchone()
        expiry = row["expires_at"]
        self.assertEqual(self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=b'{"birth_day":20,"birth_month":12,"gender":"male"}', headers=self.bearer(second)).status_code, 200)
        self.assertEqual(self.storage.connection.execute("select expires_at from vk_miniapp_standalone_sessions where session_token_hash=?", (hashlib.sha256(second.encode()).hexdigest(),)).fetchone()["expires_at"], expiry)
        self.clock.advance(301)
        self.assertEqual(self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=b'{"birth_day":20,"birth_month":12,"gender":"male"}', headers=self.bearer(second)).status_code, 200)
        self.assertIsNone(self.storage.connection.execute("select launch_fingerprint from vk_miniapp_standalone_sessions where session_token_hash=?", (hashlib.sha256(second.encode()).hexdigest(),)).fetchone()[0])
        self.clock.advance(600)
        self.assertEqual(self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=b'{"birth_day":20,"birth_month":12,"gender":"male"}', headers=self.bearer(second)).status_code, 401)

    def test_resolve_parity_actions_cors_and_retired_routes(self):
        token = self.bootstrap()
        payload = {"birth_day": 20, "birth_month": 12, "gender": "male"}
        response = self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=json.dumps(payload).encode(), headers=self.bearer(token))
        self.assertEqual(response.status_code, 200); body = response.json()
        self.assertEqual(body["result"]["marketplace"], None)
        self.assertEqual(body["result"]["recommendation"]["product_key"], "kolyadnik")
        self.assertEqual([item["destination"] for item in body["product_actions"]], ["vk", "ozon", "wildberries"])
        self.assertEqual(response.headers["access-control-allow-origin"], ORIGIN)
        self.assertEqual(response.headers["x-result-id"], response.headers["x-result-id"])
        self.assertEqual(self.request("POST", "/v1/vk/miniapp/recommendations/resolve", content=b'{"birth_day":1,"birth_month":1,"gender":"male","marketplace":"ozon"}', headers=self.bearer(token)).status_code, 422)
        self.assertEqual(self.request("POST", "/vk-miniapp-api/v1/bootstrap", headers={}).status_code, 404)
        preflight = self.request("OPTIONS", "/v1/vk/miniapp/session", headers={"origin": ORIGIN, "access-control-request-method": "POST"})
        self.assertEqual(preflight.status_code, 204); self.assertEqual(preflight.headers["access-control-allow-origin"], ORIGIN)

    def test_environment_config_is_standalone_and_fail_closed(self):
        base = {"KIP_VK_MINIAPP_ENABLED": "true", "KIP_VK_MINIAPP_APP_ID": "54743026", "KIP_VK_MINIAPP_PROTECTED_KEY": KEY,
                "KIP_VK_MINIAPP_SESSION_TTL_SECONDS": "900", "KIP_VK_MINIAPP_ALLOWED_ORIGINS": ORIGIN,
                "KIP_VK_MINIAPP_LAUNCH_MAX_AGE_SECONDS": "300", "KIP_VK_MINIAPP_LAUNCH_FUTURE_CLOCK_SKEW_SECONDS": "60"}
        with patch.dict("os.environ", base, clear=True):
            config = VKMiniAppConfig.from_environment()
            self.assertTrue(config.enabled); self.assertIsNone(config.owner_id); self.assertIsNone(config.handoff_secret)
        for field, value in (("KIP_VK_MINIAPP_APP_ID", "9"), ("KIP_VK_MINIAPP_SESSION_TTL_SECONDS", "901"),
                             ("KIP_VK_MINIAPP_LAUNCH_MAX_AGE_SECONDS", "301"), ("KIP_VK_MINIAPP_LAUNCH_FUTURE_CLOCK_SKEW_SECONDS", "61"),
                             ("KIP_VK_MINIAPP_ALLOWED_ORIGINS", "https://*.example.test"), ("KIP_VK_MINIAPP_ALLOWED_ORIGINS", ORIGIN + "/path")):
            values = base | {field: value}
            with patch.dict("os.environ", values, clear=True), self.assertRaises(VKConfigurationError):
                VKMiniAppConfig.from_environment()
        with patch.dict("os.environ", {"KIP_VK_MINIAPP_ENABLED": "false"}, clear=True):
            self.assertFalse(VKMiniAppConfig.from_environment().enabled)

    def test_v7_migration_preserves_rows_and_is_idempotent(self):
        path = str(Path(self.temp.name) / "v7.sqlite")
        import sqlite3
        connection = sqlite3.connect(path)
        connection.executescript("""
        CREATE TABLE vk_schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
        INSERT INTO vk_schema_migrations VALUES(1,'x'); INSERT INTO vk_schema_migrations VALUES(2,'x'); INSERT INTO vk_schema_migrations VALUES(3,'x'); INSERT INTO vk_schema_migrations VALUES(4,'x'); INSERT INTO vk_schema_migrations VALUES(5,'x'); INSERT INTO vk_schema_migrations VALUES(6,'x'); INSERT INTO vk_schema_migrations VALUES(7,'x');
        CREATE TABLE vk_miniapp_handoffs(handoff_id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, expected_vk_user_id INTEGER NOT NULL, expected_state TEXT NOT NULL, expected_state_version INTEGER NOT NULL, purpose TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT NULL);
        CREATE TABLE vk_miniapp_sessions(session_token_hash TEXT PRIMARY KEY, handoff_id TEXT NOT NULL, vk_app_id INTEGER NOT NULL, vk_user_id INTEGER NOT NULL, vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, completed_at TEXT NULL);
        """)
        connection.commit(); connection.close()
        migrated = VKStorage(path, clock=self.clock)
        self.assertIsNotNone(migrated.connection.execute("select name from sqlite_master where name='vk_miniapp_standalone_sessions'").fetchone())
        migrated.close(); repeated = VKStorage(path, clock=self.clock)
        self.assertEqual(repeated.connection.execute("select count(*) from vk_schema_migrations where version=8").fetchone()[0], 1)
        repeated.close()
