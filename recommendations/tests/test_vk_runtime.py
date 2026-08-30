import json
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.bot_parser import parse_dates, parse_gender
from recommendations.vk.inbound_worker import InboundWorker
from recommendations.vk.normalization import normalize_callback
from recommendations.vk.outbox import OutboxWorker, classify
from recommendations.vk.storage import VKStorage
from recommendations.vk.vk_api import VKAPIResult, VKTransportUnknown


FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new.v5_199.sanitized.json"
TEXT_KEYBOARD_RESTART_FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new_text_keyboard_restart_click.v5_199.sanitized.json"

class FakeAPI:
    def __init__(self, result): self.result=result; self.calls=[]
    def messages_send(self, peer_id, message, random_id):
        self.calls.append(random_id)
        if self.result == "transport": raise VKTransportUnknown()
        return self.result

class VKRuntimeTests(unittest.TestCase):
    def setUp(self):
        self.dir=tempfile.TemporaryDirectory(); self.db=VKStorage(str(Path(self.dir.name)/"vk.sqlite"))
    def tearDown(self): self.db.close(); self.dir.cleanup()
    def payload(self, text="13.10", eid="e1"):
        p=json.loads(FIXTURE.read_text());p.update(group_id=1,event_id=eid,secret="ignored");p['object']['message'].update(peer_id=10,from_id=10,text=text);return p
    def test_real_nested_fixture_normalizes(self):
        event=normalize_callback(json.loads(FIXTURE.read_text()))
        self.assertEqual(event.event_type,"message_new"); self.assertEqual(event.text,"sanitized staging text"); self.assertIn('keyboard',event.client_info)
    def test_real_text_keyboard_click_fixture_preserves_text_and_payload(self):
        event=normalize_callback(json.loads(TEXT_KEYBOARD_RESTART_FIXTURE.read_text()))
        self.assertEqual(event.event_type,"message_new")
        self.assertEqual(event.text,"Подобрать снова")
        self.assertEqual(event.payload,'{"kip":"restart","v":1}')
    def test_dates_and_gender_are_deterministic(self):
        self.assertEqual(parse_dates('13.10 20.11'),[]); self.assertEqual(parse_dates('29.02.2020')[0].year,2020)
        self.assertEqual(parse_gender('Мужчине'),'male'); self.assertIsNone(parse_gender('Иван'))
    def test_dedup_and_atomic_claim(self):
        p=self.payload();self.assertTrue(self.db.accept(p));self.assertFalse(self.db.accept(p));self.assertIsNotNone(self.db.claim_event());self.assertIsNone(self.db.claim_event())
    def test_worker_transition_and_restart(self):
        self.db.accept(self.payload('Подобрать оберег','start')); worker=InboundWorker(self.db,BotOrchestrator(self.db,RecommendationApplicationService()));self.assertTrue(worker.process_one()); self.db.accept(self.payload('13.10.1990')); self.assertTrue(worker.process_one())
        s=self.db.session(1,10);self.assertEqual(s['state'],'WAITING_GENDER')
        self.db.accept(self.payload('Мужчине','e2'));worker.process_one();self.assertEqual(self.db.session(1,10)['state'],'RESOLVED')
        rows=self.db.connection.execute('select * from vk_outbox').fetchall();self.assertEqual(len(rows),3);self.assertNotIn('bear_paw',rows[2]['message_text'])
    def test_outbox_success_and_retry_reuses_random_id(self):
        self.db.accept(self.payload()); e=self.db.claim_event(); self.db.transition_and_enqueue(e['id'],1,10,'WAITING_DATE',{},'x')
        api=FakeAPI(VKAPIResult(error_code=6));worker=OutboxWorker(self.db,api);worker.process_one(); row=self.db.connection.execute('select * from vk_outbox').fetchone();self.db.connection.execute("update vk_outbox set next_attempt_at=NULL where outbox_id=?",(row['outbox_id'],));worker.process_one()
        self.assertEqual(api.calls,[row['random_id'],row['random_id']]);self.assertEqual(self.db.connection.execute('select status from vk_outbox').fetchone()[0],'FAILED_TERMINAL')
    def test_error_policy_is_fail_closed(self):
        self.assertEqual(classify(9),'NO_AUTOMATIC_RETRY_BUT_TRANSIENT_OR_THROTTLING');self.assertEqual(classify(940),'NO_AUTOMATIC_RETRY_BUT_TRANSIENT_OR_THROTTLING');self.assertEqual(classify(999),'UNKNOWN_FAIL_CLOSED')
    def test_bootstrap_is_idempotent_and_restart_persists(self):
        path=self.db.path;self.db.close();other=VKStorage(path);self.assertEqual(other.connection.execute('select version from vk_schema_migrations').fetchone()[0],1);other.close();self.db=VKStorage(path)

    def test_session_retention_expires_to_fresh_start_without_breaking_dedup(self):
        self.db.close()
        current = [datetime(2026, 1, 1, tzinfo=timezone.utc)]
        self.db = VKStorage(self.db.path, session_retention_seconds=60, clock=lambda: current[0])
        worker = InboundWorker(self.db, BotOrchestrator(self.db, RecommendationApplicationService()))
        self.assertTrue(self.db.accept(self.payload("Подобрать оберег", "retained-start"))); worker.process_one()
        first = self.payload("13.10.1990", "retained-date")
        self.assertTrue(self.db.accept(first)); worker.process_one()
        session = self.db.session(1, 10)
        self.assertIsNotNone(session["expires_at"])
        current[0] += timedelta(seconds=59)
        self.assertEqual(self.db.session(1, 10)["state"], "WAITING_GENDER")
        current[0] += timedelta(seconds=2)
        self.assertIsNone(self.db.session(1, 10))
        fresh = self.payload("Мужчине", "expired-gender")
        self.assertTrue(self.db.accept(fresh)); worker.process_one()
        reset = self.db.session(1, 10)
        self.assertEqual(reset["state"], "START")
        self.assertIsNone(reset["birth_day"])
        self.assertFalse(self.db.accept(first))
