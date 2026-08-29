import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.bot_parser import parse_keyboard_payload
from recommendations.vk.keyboard import gender_keyboard, restart_keyboard
from recommendations.vk.normalization import normalize_callback
from recommendations.vk.storage import VKStorage

FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new.v5_199.sanitized.json"
RESTART_FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new_text_keyboard_restart_click.v5_199.sanitized.json"

class KeyboardTests(unittest.TestCase):
    def setUp(self): self.tmp=tempfile.TemporaryDirectory(); self.s=VKStorage(str(Path(self.tmp.name)/"state.sqlite"))
    def tearDown(self): self.s.close(); self.tmp.cleanup()
    def event(self, text, eid, payload=None):
        raw=json.loads(FIXTURE.read_text()); raw.update(group_id=1,event_id=eid); raw['object']['message'].update(peer_id=11,from_id=11,text=text,payload=payload); return normalize_callback(raw)
    def process(self, text, eid, payload=None):
        event=self.event(text,eid,payload); self.s.accept(json.loads(FIXTURE.read_text()) | {"group_id":1,"event_id":eid,"object": {**json.loads(FIXTURE.read_text())["object"], "message": {**json.loads(FIXTURE.read_text())["object"]["message"],"peer_id":11,"from_id":11,"text":text,"payload":payload}}}); row=self.s.claim_event(); return BotOrchestrator(self.s,RecommendationApplicationService()).process(row['id'],event)
    def test_exact_builders(self):
        self.assertEqual(gender_keyboard(), {"one_time":True,"inline":False,"buttons":[[{"action":{"type":"text","label":"Мужчине","payload":"{\"kip\":\"gender\",\"value\":\"male\",\"v\":1}"},"color":"primary"},{"action":{"type":"text","label":"Женщине","payload":"{\"kip\":\"gender\",\"value\":\"female\",\"v\":1}"},"color":"secondary"}]]})
        self.assertEqual(restart_keyboard()["buttons"][0][0]["action"]["payload"], '{"kip":"restart","v":1}')
    def test_strict_payload_matrix(self):
        self.assertEqual(parse_keyboard_payload('{"kip":"gender","value":"male","v":1}',"Мужчине"),("gender","male")); self.assertEqual(parse_keyboard_payload('{"kip":"gender","value":"female","v":1}',"Женщине"),("gender","female")); self.assertEqual(parse_keyboard_payload('{"kip":"restart","v":1}',"Подобрать снова"),("restart",None))
        for payload in ('{', '[]', '{"kip":"gender","value":"male","v":2}', '{"kip":"gender","value":"male","v":1,"x":1}', '{"kip":"gender","v":1}', '{"kip":"x","value":"male","v":1}', '{"kip":"gender","value":"other","v":1}'):
            self.assertIsNone(parse_keyboard_payload(payload,"Мужчине"))
        self.assertIsNone(parse_keyboard_payload('{"kip":"gender","value":"male","v":1}',"Женщине"))
    def test_state_aware_payloads_and_real_restart_fixture(self):
        self.process("13.10.1990","date"); self.assertEqual(self.s.session(1,11)['state'],'WAITING_GENDER')
        self.process("Женщине","bad",'{"kip":"gender","value":"male","v":1}'); self.assertEqual(self.s.session(1,11)['state'],'WAITING_GENDER')
        self.process("Мужчине","male",'{"kip":"gender","value":"male","v":1}'); self.assertEqual(self.s.session(1,11)['state'],'RESOLVED')
        raw=json.loads(RESTART_FIXTURE.read_text()); raw.update(group_id=1,event_id="restart"); raw['object']['message'].update(peer_id=11,from_id=11); event=normalize_callback(raw); self.s.accept(raw); row=self.s.claim_event(); BotOrchestrator(self.s,RecommendationApplicationService()).process(row['id'],event); self.assertEqual(self.s.session(1,11)['state'],'WAITING_DATE')
    def test_keyboard_migration_and_atomic_serialization(self):
        path=str(Path(self.tmp.name)/"v1.sqlite"); c=sqlite3.connect(path); c.executescript('CREATE TABLE vk_schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL); INSERT INTO vk_schema_migrations VALUES(1,\"x\"); CREATE TABLE vk_outbox(outbox_id INTEGER PRIMARY KEY, source_event_id INTEGER NOT NULL, sequence_no INTEGER NOT NULL DEFAULT 1, vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, message_text TEXT NOT NULL, random_id INTEGER NOT NULL, status TEXT NOT NULL, attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT, created_at TEXT NOT NULL, claimed_at TEXT, sent_at TEXT, last_error_code TEXT, last_error_class TEXT, last_error_detail TEXT, vk_message_id INTEGER, UNIQUE(source_event_id,sequence_no));'); c.commit(); c.close(); migrated=VKStorage(path); self.assertEqual([row[0] for row in migrated.connection.execute('select version from vk_schema_migrations order by version')],[1,2]); self.assertIn('keyboard_json',[r[1] for r in migrated.connection.execute('pragma table_info(vk_outbox)')]); migrated.close()
