import asyncio
import json
import tempfile
import threading
import unittest
from pathlib import Path

import httpx

from recommendations.api.app import create_app
from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.inbound_worker import InboundWorker
from recommendations.vk.outbox import OutboxWorker
from recommendations.vk.storage import VKStorage
from recommendations.vk.vk_api import VKAPIClient, VKAPIResult, VKTransportUnknown
from recommendations.vk.config import VKRuntimeConfig
from recommendations.vk.storage import VKStorage


FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new.v5_199.sanitized.json"


class RecordingService:
    def __init__(self): self.real = RecommendationApplicationService(); self.calls = []; self.results = []
    def resolve(self, request):
        self.calls.append(request); result = self.real.resolve(request); self.results.append(result); return result


class M3FinalAcceptanceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.path = str(Path(self.tmp.name) / "state.sqlite"); self.s = VKStorage(self.path, claim_lease_seconds=1)
    def tearDown(self): self.s.close(); self.tmp.cleanup()
    def payload(self, text="13.10", eid="e1", event_type="message_new"):
        p = json.loads(FIXTURE.read_text()); p.update(group_id=1, event_id=eid, type=event_type)
        p["object"]["message"].update(peer_id=11, from_id=11, text=text); return p
    def worker(self, service=None): return InboundWorker(self.s, BotOrchestrator(self.s, service or RecommendationApplicationService()))
    def deliver(self, text, eid, service=None):
        self.assertTrue(self.s.accept(self.payload(text, eid))); self.assertTrue(self.worker(service).process_one())
    def outbox(self): return self.s.connection.execute("select * from vk_outbox order by outbox_id").fetchall()

    def test_callback_durable_ack_and_failure_is_not_ok_or_secret_leak(self):
        config = VKRuntimeConfig(1, "token-private", "secret-private", "confirmation-private", self.path)
        app = create_app(vk_config=config); storage = VKStorage(config.state_db_path); app.state.vk_runtime = {"config": config, "storage": storage}
        def post(payload):
            async def run():
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test") as c:
                    return await c.post("/internal/vk/callback", content=json.dumps(payload), headers={"content-type":"application/json"})
            return asyncio.run(run())
        payload = self.payload("13.10", "http-1"); payload["secret"] = "secret-private"
        original = storage.accept
        storage.accept = lambda value: (_ for _ in ()).throw(RuntimeError("storage unavailable"))
        failed = post(payload)
        self.assertGreaterEqual(failed.status_code, 500); self.assertNotEqual(failed.text, "ok")
        for private in ("secret-private", "token-private", "confirmation-private", "13.10"): self.assertNotIn(private, failed.text)
        storage.accept = original
        self.assertEqual(post(payload).text, "ok"); self.assertEqual(post(payload).text, "ok")
        storage.close()

    def test_real_callback_to_worker_and_complete_local_bot_flow(self):
        config = VKRuntimeConfig(1, "token", "secret", "confirm", self.path)
        app = create_app(vk_config=config); storage = VKStorage(config.state_db_path); app.state.vk_runtime = {"config": config, "storage": storage}
        def post(text, eid):
            payload=self.payload(text,eid); payload["secret"]="secret"
            async def run():
                async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url="http://test") as client:
                    return await client.post("/internal/vk/callback",content=json.dumps(payload),headers={"content-type":"application/json"})
            return asyncio.run(run())
        for text,eid,state in (("Подобрать оберег","flow-start","WAITING_DATE"),("13.10.1990","flow-date","WAITING_GENDER"),("Мужчине","flow-gender","RESOLVED"),("Подобрать снова","flow-restart","WAITING_DATE")):
            self.assertEqual(post(text,eid).text,"ok"); self.assertTrue(InboundWorker(storage,BotOrchestrator(storage,RecommendationApplicationService())).process_one()); self.assertEqual(storage.session(1,11)["state"],state)
        rows=storage.connection.execute("select * from vk_outbox order by outbox_id").fetchall()
        self.assertEqual(len(rows),4); self.assertEqual(len({r["source_event_id"] for r in rows}),4); self.assertNotIn("bear_paw",rows[2]["message_text"])
        storage.close()

    def test_state_machine_full_matrix_state_versions_and_full_callback_flow(self):
        w = self.worker()
        cases = [("ordinary", "START", None), ("13.10", "START", None), ("13.10.1990", "START", None), ("13.10 20.11", "START", None), ("31.02", "START", None)]
        for number, (text, state, year) in enumerate(cases):
            self.deliver(text, f"case-{number}"); row = self.s.session(1, 11); self.assertEqual(row["state"], state)
            if year: self.assertEqual(row["birth_year"], year)
            # reset peer state for independent START cases
            self.s.connection.execute("delete from vk_bot_sessions where vk_group_id=1 and peer_id=11")
        self.deliver("Подобрать оберег", "wd-start"); self.deliver("bad", "wd-1"); self.deliver("13.10", "wd-2"); self.assertEqual(self.s.session(1,11)["state"], "WAITING_DATE")
        self.deliver("13.10.1990", "wd-valid"); self.assertEqual(self.s.session(1,11)["state"], "WAITING_GENDER")
        self.deliver("no", "wg-bad"); self.assertEqual(self.s.session(1,11)["state"], "WAITING_GENDER")
        before = len(self.outbox()); self.deliver("Мужчине", "wg-male"); resolved = self.s.session(1,11)
        self.assertEqual(resolved["state"], "RESOLVED"); self.assertEqual(resolved["gender"], "male"); self.assertEqual(len(self.outbox()), before + 1)
        version = resolved["state_version"]; self.assertFalse(self.s.accept(self.payload("Мужчине", "wg-male"))); self.assertEqual(self.s.session(1,11)["state_version"], version)
        count = len(self.outbox()); self.deliver("unrelated", "resolved-other"); self.assertEqual(len(self.outbox()), count)
        self.deliver("Подобрать снова", "restart"); reset = self.s.session(1,11)
        self.assertEqual(reset["state"], "WAITING_DATE"); self.assertEqual(tuple(reset[k] for k in ("birth_day","birth_month","birth_year","gender","last_result_id")), (None,)*5)
        self.s.connection.execute("delete from vk_bot_sessions where vk_group_id=1 and peer_id=11")
        self.deliver("Подобрать оберег", "female-start"); self.deliver("13.10.1990", "female-date"); self.deliver("Женщине", "female-gender"); self.assertEqual(self.s.session(1,11)["gender"], "female")
        unsupported = self.payload("x", "unsupported", "wall_post_new"); unsupported["object"]["message"]["peer_id"] = 99
        self.assertTrue(self.s.accept(unsupported)); w.process_one(); self.assertEqual(self.s.connection.execute("select status from vk_inbound_events where event_id='unsupported'").fetchone()[0], "IGNORED"); self.assertIsNone(self.s.session(1,99))

    def test_transaction_rolls_back_both_directions_and_unique_message(self):
        self.s.accept(self.payload(eid="tx")); event = self.s.claim_event()
        self.s._after_session_write = lambda c: (_ for _ in ()).throw(RuntimeError("after session"))
        with self.assertRaises(RuntimeError): self.s.transition_and_enqueue(event["id"], 1, 11, "WAITING_DATE", {}, "x")
        self.assertIsNone(self.s.session(1,11)); self.assertEqual(len(self.outbox()), 0)
        self.s._after_session_write = lambda c: None
        self.s._before_outbox_insert = lambda c: (_ for _ in ()).throw(RuntimeError("outbox insert"))
        with self.assertRaises(RuntimeError): self.s.transition_and_enqueue(event["id"], 1, 11, "WAITING_DATE", {}, "x")
        self.assertIsNone(self.s.session(1,11)); self.assertEqual(len(self.outbox()), 0)
        self.s._before_outbox_insert = lambda c: None
        self.s.transition_and_enqueue(event["id"], 1, 11, "WAITING_DATE", {}, "x")
        self.assertEqual(len(self.outbox()), 1); self.assertEqual(self.s.session(1,11)["state"], "WAITING_DATE")
        self.assertEqual(self.s.connection.execute("select count(*) from vk_schema_migrations").fetchone()[0], 6)

    def test_two_connection_outbox_claim_and_pending_restart_recovery(self):
        self.s.accept(self.payload(eid="restart")); event = self.s.claim_event(); self.s.transition_and_enqueue(event["id"],1,11,"WAITING_DATE",{},"x")
        first = self.outbox()[0]; other = VKStorage(self.path)
        barrier = threading.Barrier(2); results = []
        def claim(storage): barrier.wait(); results.append(storage.claim_outbox())
        a = threading.Thread(target=claim, args=(self.s,)); b = threading.Thread(target=claim, args=(other,)); a.start(); b.start(); a.join(); b.join()
        claimed = [r for r in results if r is not None]; self.assertEqual(len(claimed), 1); self.assertEqual(claimed[0]["outbox_id"], first["outbox_id"]); self.assertEqual(claimed[0]["attempt_count"], 1); self.assertEqual(claimed[0]["random_id"], first["random_id"])
        other.close()
        self.s.connection.execute("update vk_outbox set status='PENDING', claimed_at=null")
        outbox_id, random_id = first["outbox_id"], first["random_id"]; self.s.close(); self.s = VKStorage(self.path)
        api = SequenceAPI([VKAPIResult(message_id=7)]); OutboxWorker(self.s, api).process_one(); row = self.s.connection.execute("select * from vk_outbox where outbox_id=?",(outbox_id,)).fetchone()
        self.assertEqual((row["status"], row["random_id"], api.calls), ("SENT", random_id, [random_id]))
        self.assertTrue(self.s.accept(self.payload("13.10", "new-restart"))); self.s.close(); self.s=VKStorage(self.path); self.assertTrue(self.worker().process_one()); self.assertEqual(self.s.connection.execute("select count(*) from vk_outbox where source_event_id=(select id from vk_inbound_events where event_id='new-restart')").fetchone()[0],1)

    def test_business_parity_uses_real_service_not_bot_mapping(self):
        service = RecordingService(); core = service.real._core
        names = {"Медведь", "Волк", "Лиса", "Орёл", "Раса"}; dates = {}
        for month in range(1,13):
            for day in range(1,32):
                try: name = core.resolve_chertog(day,month)["name"]
                except ValueError: continue
                if name in names: dates.setdefault(name,(day,month))
        for index, name in enumerate(sorted(names)):
            day, month = dates[name]
            for gender, word in (("male", "Мужчине"), ("female", "Женщине")):
                peer = 100 + index * 10 + (gender == "female"); self.s.connection.execute("delete from vk_bot_sessions where peer_id=?", (peer,))
                p = self.payload("Подобрать оберег", f"parity-{index}-{gender}-start"); p["object"]["message"]["peer_id"] = peer; self.s.accept(p); self.worker(service).process_one()
                p = self.payload(f"{day:02d}.{month:02d}.1990", f"parity-{index}-{gender}-date"); p["object"]["message"]["peer_id"] = peer; self.s.accept(p); self.worker(service).process_one()
                p = self.payload(word, f"parity-{index}-{gender}"); p["object"]["message"]["peer_id"] = peer; self.s.accept(p); self.worker(service).process_one()
                direct = service.real.resolve(service.calls[-1]).semantic_result; self.assertEqual(direct["chertog"]["name"], name); self.assertEqual(self.s.session(1,peer)["last_result_id"], service.results[-1].result_id)
                self.assertIn(direct["recommendation"]["customer_label"], self.outbox()[-1]["message_text"])
                self.assertEqual(direct["recommendation"]["product_key"], service.real.resolve(service.calls[-1]).semantic_result["recommendation"]["product_key"])
        # Marketplace override boundary is exercised below the bot; no M4 question is invented.
        voron = next((d,m) for m in range(1,13) for d in range(1,29) if core.resolve_chertog(d,m)["name"] == "Ворон")
        base = service.real.resolve(type("I", (), {"birth_day":voron[0],"birth_month":voron[1],"gender":"male","birth_year":1990,"marketplace":None})()).semantic_result
        marketplace = service.real.resolve(type("I", (), {"birth_day":voron[0],"birth_month":voron[1],"gender":"male","birth_year":1990,"marketplace":"wildberries"})()).semantic_result
        self.assertNotEqual(base["recommendation"]["product_key"], marketplace["recommendation"]["product_key"])

    def test_http_error_class_retry_transport_and_mixed_budget(self):
        classes = {"PERMANENT_USER_STATE":(900,901,902,917,936,945,946,950,985,987,988,1012), "AUTH_CONFIGURATION":(5,7,15,925,103), "INVALID_REQUEST_OR_CODE_BUG":(8,100,911,914,921,943,944), "NO_AUTOMATIC_RETRY_BUT_TRANSIENT_OR_THROTTLING":(9,940), "UNKNOWN_FAIL_CLOSED":(777,778)}
        for klass,codes in classes.items():
            for code in codes:
                self._enqueue(f"code-{code}"); api = self.client_api([{"error":{"error_code":code}}]); OutboxWorker(self.s,api,0).process_one(); row=self.outbox()[-1]; self.assertEqual((row["status"],row["attempt_count"],row["last_error_class"]),("FAILED_TERMINAL",1,klass))
        for code in (6,10,36):
            self._enqueue(f"retry-{code}"); api=self.client_api([{"error":{"error_code":code}},{"response":4}]); worker=OutboxWorker(self.s,api,0); worker.process_one(); self.s.connection.execute("update vk_outbox set next_attempt_at=null where outbox_id=?",(self.outbox()[-1]["outbox_id"],)); worker.process_one(); row=self.outbox()[-1]; self.assertEqual((row["status"],row["attempt_count"]),("SENT",2)); self.assertEqual(api.random_ids[0],api.random_ids[1])
            self._enqueue(f"retry-terminal-{code}"); api=self.client_api([{"error":{"error_code":code}},{"error":{"error_code":code}}]); worker=OutboxWorker(self.s,api,0); worker.process_one(); self.s.connection.execute("update vk_outbox set next_attempt_at=null where outbox_id=?",(self.outbox()[-1]["outbox_id"],)); worker.process_one(); self.assertEqual((self.outbox()[-1]["status"],len(api.random_ids)),("FAILED_TERMINAL",2))
        for exc in (httpx.ConnectError("x"),httpx.ConnectTimeout("x"),httpx.ReadTimeout("x"),httpx.TransportError("x")):
            self._enqueue("transport"); api=self.client_api([exc,{"response":9}]); worker=OutboxWorker(self.s,api,0); worker.process_one(); self.s.connection.execute("update vk_outbox set next_attempt_at=null where outbox_id=?",(self.outbox()[-1]["outbox_id"],));worker.process_one();self.assertEqual(self.outbox()[-1]["status"],"SENT");self.assertEqual(api.random_ids[0],api.random_ids[1])
        self._enqueue("transport-terminal"); api=self.client_api([httpx.ConnectError("x"),httpx.ReadTimeout("x")]); worker=OutboxWorker(self.s,api,0); worker.process_one(); self.s.connection.execute("update vk_outbox set next_attempt_at=null where outbox_id=?",(self.outbox()[-1]["outbox_id"],)); worker.process_one(); self.assertEqual((self.outbox()[-1]["status"],len(api.random_ids)),("FAILED_TERMINAL",2))
        self._enqueue("mixed"); api=self.client_api([{"error":{"error_code":10}},httpx.ConnectError("x")]); worker=OutboxWorker(self.s,api,0); worker.process_one(); self.s.connection.execute("update vk_outbox set next_attempt_at=null where outbox_id=?",(self.outbox()[-1]["outbox_id"],)); worker.process_one(); self.assertEqual((self.outbox()[-1]["status"],len(api.random_ids)),("FAILED_TERMINAL",2))
        self._enqueue("mixed-reverse"); api=self.client_api([httpx.ConnectError("x"),{"error":{"error_code":6}}]); worker=OutboxWorker(self.s,api,0); worker.process_one(); self.s.connection.execute("update vk_outbox set next_attempt_at=null where outbox_id=?",(self.outbox()[-1]["outbox_id"],)); worker.process_one(); self.assertEqual((self.outbox()[-1]["status"],len(api.random_ids)),("FAILED_TERMINAL",2))

    def test_unexpected_api_exception_keeps_single_stale_recoverable_claim(self):
        self._enqueue("internal"); row=self.outbox()[-1]
        class Broken:
            def messages_send(self, *args): raise RuntimeError("unexpected")
        with self.assertRaises(RuntimeError): OutboxWorker(self.s,Broken()).process_one()
        sending=self.outbox()[-1]; self.assertEqual((sending["status"],sending["random_id"]),("SENDING",row["random_id"]))
        self.s.connection.execute("update vk_outbox set claimed_at='2000-01-01T00:00:00+00:00' where outbox_id=?",(row["outbox_id"],))
        recovered=self.s.claim_outbox(); self.assertEqual((recovered["outbox_id"],recovered["random_id"]),(row["outbox_id"],row["random_id"]))

    def _enqueue(self, eid):
        event_id = f"{eid}-{self.s.connection.execute('select count(*) from vk_inbound_events').fetchone()[0]}"
        self.assertTrue(self.s.accept(self.payload(eid=event_id))); event=self.s.claim_event(); self.s.transition_and_enqueue(event["id"],1,11,"WAITING_DATE",{},"x")
    def client_api(self, outcomes):
        ids=[]
        def handler(request):
            ids.append(int(request.content.decode().split("random_id=")[1].split("&")[0])); outcome=outcomes.pop(0)
            if isinstance(outcome,Exception): raise outcome
            return httpx.Response(200,json=outcome)
        api=VKAPIClient(type("C",(),{"group_id":1,"group_token":"x"})(),httpx.Client(transport=httpx.MockTransport(handler)))
        api.random_ids=ids; return api


class SequenceAPI:
    def __init__(self, outcomes): self.outcomes=outcomes; self.calls=[]
    def messages_send(self, peer, text, random): self.calls.append(random); outcome=self.outcomes.pop(0); return outcome
