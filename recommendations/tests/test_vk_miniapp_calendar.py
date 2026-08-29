"""Deterministic M3 calendar backend acceptance matrix (synthetic data only)."""
import asyncio
import base64
import hashlib
import hmac
import json
import sqlite3
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlencode

import httpx

from recommendations.api.app import create_app
from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.config import VKConfigurationError, VKMiniAppConfig, VKRuntimeConfig
from recommendations.vk.inbound_worker import InboundWorker
from recommendations.vk.keyboard import gender_keyboard
from recommendations.vk.miniapp import MiniAppError, verify_launch
from recommendations.vk.outbox import OutboxWorker
from recommendations.vk.storage import VKStorage
from recommendations.vk.vk_api import VKAPIResult

TEST_GROUP_ID, TEST_PEER_ID, TEST_USER_ID, OTHER_USER_ID = 1001, 2002, 3003, 3004
TEST_APP_ID, TEST_OWNER_ID, TEST_PROTECTED_KEY = 54743026, 7007, "synthetic-protected-key"


class Clock:
    def __init__(self): self.value = datetime(2026, 8, 29, tzinfo=timezone.utc)
    def __call__(self): return self.value
    def advance(self, seconds): self.value += timedelta(seconds=seconds)


def signed(**values):
    """Independent VK launch signature construction; does not call production code."""
    values = {"vk_app_id": str(TEST_APP_ID), "vk_user_id": str(TEST_USER_ID), "vk_ts": "1724932800"} | {k: str(v) for k, v in values.items()}
    material = urlencode(sorted((k, v) for k, v in values.items() if k.startswith("vk_")))
    sig = base64.urlsafe_b64encode(hmac.new(TEST_PROTECTED_KEY.encode(), material.encode(), hashlib.sha256).digest()).decode().rstrip("=")
    return urlencode(list(values.items()) + [("sign", sig)])


class FakeAPI:
    def __init__(self, results): self.results, self.calls = list(results), []
    def messages_send(self, peer, message, random_id, keyboard=None):
        self.calls.append((peer, message, random_id, keyboard)); return self.results.pop(0)


class CalendarAcceptanceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.clock = Clock()
        self.path = str(Path(self.tmp.name) / "state.sqlite")
        self.storage = VKStorage(self.path, clock=self.clock)
        self.config = VKMiniAppConfig(True, TEST_APP_ID, TEST_OWNER_ID, TEST_PROTECTED_KEY, "synthetic-handoff-secret", 600, 900, "https://miniapp.invalid")

    def tearDown(self): self.storage.close(); self.tmp.cleanup()

    def event(self, text, event_id):
        return type("Event", (), {"event_type":"message_new", "group_id":TEST_GROUP_ID, "peer_id":TEST_PEER_ID, "from_id":TEST_USER_ID, "text":text, "payload":None})()

    def start_calendar(self, event_id="calendar-start"):
        event_id = f"{event_id}-{self.storage.connection.execute('select count(*) from vk_inbound_events').fetchone()[0]}"
        self.storage.connection.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(?,?,?,?,?,?,?,?)", (TEST_GROUP_ID,"test",event_id,"x","message_new","{}","NEW",self.clock().isoformat()))
        inbound = self.storage.connection.execute("select id from vk_inbound_events where event_id=?", (event_id,)).fetchone()[0]
        BotOrchestrator(self.storage, RecommendationApplicationService(), self.config).process(inbound, self.event("bad", event_id))
        return self.storage.connection.execute("select * from vk_miniapp_handoffs").fetchone(), self.storage.connection.execute("select * from vk_outbox order by outbox_id desc").fetchone()

    def bootstrap(self):
        handoff, _ = self.start_calendar(); token = json.loads(_["keyboard_json"])["buttons"][0][0]["action"]["hash"]
        return handoff, token, self.storage.bootstrap_miniapp(token, TEST_USER_ID, TEST_APP_ID, 900)

    def test_schema_v2_to_v3_preserves_outbox(self):
        path = str(Path(self.tmp.name) / "v2.sqlite"); c = sqlite3.connect(path)
        c.executescript("""CREATE TABLE vk_schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
        INSERT INTO vk_schema_migrations VALUES(1,'x'); INSERT INTO vk_schema_migrations VALUES(2,'x');
        CREATE TABLE vk_outbox(outbox_id INTEGER PRIMARY KEY,source_event_id INTEGER NOT NULL,sequence_no INTEGER NOT NULL DEFAULT 1,vk_group_id INTEGER NOT NULL,peer_id INTEGER NOT NULL,message_text TEXT NOT NULL,random_id INTEGER NOT NULL,status TEXT NOT NULL,attempt_count INTEGER NOT NULL DEFAULT 0,next_attempt_at TEXT,created_at TEXT NOT NULL,claimed_at TEXT,sent_at TEXT,last_error_code TEXT,last_error_class TEXT,last_error_detail TEXT,vk_message_id INTEGER,keyboard_json TEXT,UNIQUE(source_event_id,sequence_no));
        INSERT INTO vk_outbox(outbox_id,source_event_id,vk_group_id,peer_id,message_text,random_id,status,created_at) VALUES(1,9,1,2,'old',3,'PENDING','x');"""); c.commit(); c.close()
        migrated = VKStorage(path); self.assertEqual([r[0] for r in migrated.connection.execute("select version from vk_schema_migrations order by version")], [1,2,3])
        self.assertEqual(migrated.connection.execute("select message_text from vk_outbox").fetchone()[0], "old")
        self.assertEqual({r[0] for r in migrated.connection.execute("select name from sqlite_master where type='table'") } >= {"vk_miniapp_handoffs", "vk_miniapp_sessions"}, True); migrated.close()

    def test_disabled_path_keeps_typed_date_and_no_handoff(self):
        bot = BotOrchestrator(self.storage, RecommendationApplicationService(), VKMiniAppConfig(enabled=False))
        self.storage.connection.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(?,?,?,?,?,?,?,?)", (TEST_GROUP_ID,"test","disabled","x","message_new","{}","NEW",self.clock().isoformat()))
        bot.process(1, self.event("bad", "disabled")); row = self.storage.session(TEST_GROUP_ID, TEST_PEER_ID)
        self.assertEqual(row["state"], "WAITING_DATE"); self.assertEqual(self.storage.connection.execute("select count(*) from vk_miniapp_handoffs").fetchone()[0], 0)
        self.assertNotIn("open_app", self.storage.connection.execute("select keyboard_json from vk_outbox").fetchone()[0] or "")
        self.storage.connection.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(?,?,?,?,?,?,?,?)", (TEST_GROUP_ID,"test","typed","x","message_new","{}","NEW",self.clock().isoformat()))
        bot.process(2, self.event("13.10.1990", "typed")); self.assertEqual(self.storage.session(TEST_GROUP_ID, TEST_PEER_ID)["state"], "WAITING_GENDER")
        self.assertEqual(json.loads(self.storage.connection.execute("select keyboard_json from vk_outbox order by outbox_id desc").fetchone()[0]), gender_keyboard())

    def test_waiting_date_binds_sender_state_and_exact_open_app_contract(self):
        handoff, outbox = self.start_calendar(); keyboard = json.loads(outbox["keyboard_json"]); action = keyboard["buttons"][0][0]["action"]
        self.assertEqual(self.storage.connection.execute("select count(*) from vk_bot_sessions").fetchone()[0], 1); self.assertEqual(self.storage.connection.execute("select count(*) from vk_miniapp_handoffs").fetchone()[0], 1)
        self.assertEqual((handoff["expected_vk_user_id"], handoff["expected_state"]), (TEST_USER_ID, "WAITING_DATE")); self.assertNotEqual(handoff["expected_vk_user_id"], TEST_PEER_ID)
        self.assertEqual(handoff["expected_state_version"], self.storage.session(TEST_GROUP_ID, TEST_PEER_ID)["state_version"])
        self.assertEqual(keyboard, {"inline":True,"one_time":False,"buttons":[[{"action":{"type":"open_app","app_id":TEST_APP_ID,"owner_id":TEST_OWNER_ID,"label":"📅 Выбрать дату","hash":action["hash"]}}]]})
        for forbidden in map(str, (TEST_PEER_ID, TEST_USER_ID)): self.assertNotIn(forbidden, action["hash"])
        self.assertEqual(handoff["token_hash"], hashlib.sha256(action["hash"].encode()).hexdigest()); self.assertNotIn(action["hash"], "".join(str(x) for x in handoff))

    def test_outbox_retry_and_terminal_scrub_do_not_damage_normal_keyboard(self):
        _, outbox = self.start_calendar(); raw = json.loads(outbox["keyboard_json"])["buttons"][0][0]["action"]["hash"]
        api = FakeAPI([VKAPIResult(error_code=6), VKAPIResult(message_id=55)]); worker = OutboxWorker(self.storage, api, 0)
        worker.process_one(); self.storage.connection.execute("update vk_outbox set next_attempt_at=null"); worker.process_one()
        self.assertEqual(len(api.calls), 2); self.assertEqual(api.calls[0], api.calls[1]); self.assertIn(raw, api.calls[0][3]); self.assertEqual(self.storage.connection.execute("select keyboard_json from vk_outbox where outbox_id=?", (outbox["outbox_id"],)).fetchone()[0], '{"redacted":"terminal_open_app"}')
        self.storage.connection.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(?,?,?,?,?,?,?,?)", (TEST_GROUP_ID,"test","normal","x","message_new","{}","NEW",self.clock().isoformat()))
        normal_event = self.storage.connection.execute("select id from vk_inbound_events where event_id='normal'").fetchone()[0]
        self.storage.transition_and_enqueue(normal_event, TEST_GROUP_ID, 99, "WAITING_GENDER", {}, "gender", gender_keyboard()); normal = self.storage.connection.execute("select outbox_id from vk_outbox order by outbox_id desc").fetchone()[0]
        OutboxWorker(self.storage, FakeAPI([VKAPIResult(message_id=8)])).process_one(); self.assertEqual(json.loads(self.storage.connection.execute("select keyboard_json from vk_outbox where outbox_id=?",(normal,)).fetchone()[0]), gender_keyboard())

    def test_signature_and_duplicate_and_wrong_app_matrix(self):
        self.assertEqual(verify_launch(signed(), TEST_PROTECTED_KEY, TEST_APP_ID)["vk_user_id"], str(TEST_USER_ID))
        for raw in (signed().replace("vk_user_id=3003", "vk_user_id=3004"), signed().split("&sign=")[0], signed()+"&sign=x", signed()+"&vk_user_id=3003", signed()+"&vk_app_id=54743026", signed()+"&vk_extra=x"):
            with self.assertRaises(MiniAppError): verify_launch(raw, TEST_PROTECTED_KEY, TEST_APP_ID)
        with self.assertRaises(MiniAppError): verify_launch(signed(vk_app_id=1), TEST_PROTECTED_KEY, TEST_APP_ID)

    def test_bootstrap_hash_binding_expiry_and_stale_rejections(self):
        handoff, token, bearer = self.bootstrap(); session = self.storage.connection.execute("select * from vk_miniapp_sessions").fetchone()
        self.assertEqual(session["session_token_hash"], hashlib.sha256(bearer.encode()).hexdigest()); self.assertNotIn(bearer, "".join(str(x) for x in session)); self.assertEqual(session["expires_at"], (self.clock()+timedelta(seconds=900)).isoformat())
        with self.assertRaises(ValueError): self.storage.bootstrap_miniapp(token, OTHER_USER_ID, TEST_APP_ID)
        with self.assertRaises(ValueError): self.storage.bootstrap_miniapp("unknown", TEST_USER_ID, TEST_APP_ID)
        self.clock.advance(901)
        with self.assertRaises(ValueError): self.storage.submit_miniapp_birth_date(bearer, "1990-10-13", "g", gender_keyboard())

    def test_date_validation_submit_replay_and_parity(self):
        _, _, bearer = self.bootstrap()
        for invalid in ("1990-02-30", "not-a-date", "13.10.1990", "1990-10-13T00:00:00Z", "", "2999-01-01"):
            with self.assertRaises(ValueError): self.storage.submit_miniapp_birth_date(bearer, invalid, "g", gender_keyboard())
        self.storage.submit_miniapp_birth_date(bearer, "1990-10-13", "g", gender_keyboard()); row = self.storage.session(TEST_GROUP_ID, TEST_PEER_ID)
        self.assertEqual((row["state"],row["birth_day"],row["birth_month"],row["birth_year"],row["gender"]), ("WAITING_GENDER",13,10,1990,None))
        self.assertIsNotNone(self.storage.connection.execute("select used_at from vk_miniapp_handoffs").fetchone()[0])
        with self.assertRaises(ValueError): self.storage.submit_miniapp_birth_date(bearer, "1990-10-13", "g", gender_keyboard())
        self.assertEqual(self.storage.connection.execute("select count(*) from vk_outbox").fetchone()[0], 2)

    def test_atomic_calendar_creation_and_submit_rollback(self):
        self.storage._before_outbox_insert = lambda c: (_ for _ in ()).throw(RuntimeError("synthetic"))
        with self.assertRaises(RuntimeError): self.start_calendar()
        self.assertIsNone(self.storage.session(TEST_GROUP_ID, TEST_PEER_ID)); self.assertEqual(self.storage.connection.execute("select count(*) from vk_miniapp_handoffs").fetchone()[0],0)
        self.storage._before_outbox_insert = lambda c: None; _, _, bearer = self.bootstrap(); self.storage._before_outbox_insert = lambda c: (_ for _ in ()).throw(RuntimeError("synthetic"))
        with self.assertRaises(RuntimeError): self.storage.submit_miniapp_birth_date(bearer,"1990-10-13","g",gender_keyboard())
        self.assertEqual(self.storage.session(TEST_GROUP_ID, TEST_PEER_ID)["state"],"WAITING_DATE"); self.assertIsNone(self.storage.connection.execute("select used_at from vk_miniapp_handoffs").fetchone()[0])

    def test_config_fail_closed(self):
        import os
        old = dict(os.environ)
        try:
            os.environ["KIP_VK_MINIAPP_ENABLED"] = "true"
            for key in ("APP_ID","OWNER_ID","PROTECTED_KEY","HANDOFF_SECRET","HANDOFF_TTL_SECONDS","SESSION_TTL_SECONDS","PUBLIC_URL"): os.environ.pop("KIP_VK_MINIAPP_"+key, None)
            with self.assertRaises(VKConfigurationError): VKMiniAppConfig.from_environment()
        finally: os.environ.clear(); os.environ.update(old)

    def test_http_api_disabled_and_extra_fields_fail_closed(self):
        runtime = VKRuntimeConfig(TEST_GROUP_ID, "synthetic-token", "synthetic-callback", "synthetic-confirm", self.path)
        def post(app, url, body, headers=None):
            async def run():
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test") as client:
                    return await client.post(url, content=json.dumps(body), headers=headers or {"content-type":"application/json"})
            return asyncio.run(run())
        disabled = create_app(vk_config=runtime, miniapp_config=VKMiniAppConfig(enabled=False)); disabled.state.vk_runtime={"config":runtime,"storage":self.storage}
        self.assertEqual(post(disabled,"/vk-miniapp-api/v1/bootstrap",{"launch_params":signed(),"handoff_token":"x"}).status_code,503)
        self.assertEqual(post(disabled,"/vk-miniapp-api/v1/birth-date",{"birth_date":"1990-10-13"},{"authorization":"Bearer x","content-type":"application/json"}).status_code,503)
        enabled = create_app(vk_config=runtime, miniapp_config=self.config); enabled.state.vk_runtime={"config":runtime,"storage":self.storage}
        self.assertEqual(post(enabled,"/vk-miniapp-api/v1/bootstrap",{"launch_params":signed(),"handoff_token":"x","x":"y"}).status_code,422)
        self.assertEqual(post(enabled,"/vk-miniapp-api/v1/birth-date",{"birth_date":"1990-10-13","x":"y"},{"authorization":"Bearer x","content-type":"application/json"}).status_code,422)
        self.assertEqual(post(enabled,"/vk-miniapp-api/v1/birth-date",{}, {"authorization":"Bearer x","content-type":"application/json"}).status_code,422)
        self.assertEqual(post(enabled,"/vk-miniapp-api/v1/birth-date",{"birth_date":19901013}, {"authorization":"Bearer x","content-type":"application/json"}).status_code,422)
