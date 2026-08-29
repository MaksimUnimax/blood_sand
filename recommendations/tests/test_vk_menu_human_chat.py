import json
import tempfile
import unittest
from pathlib import Path

from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator, HUMAN_HANDOFF_ACK, ROUTING_PROMPT
from recommendations.vk.config import VKMiniAppConfig
from recommendations.vk.keyboard import calendar_keyboard, main_menu_keyboard
from recommendations.vk.normalization import normalize_callback
from recommendations.vk.storage import VKStorage

FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new.v5_199.sanitized.json"

class MenuStorage(VKStorage):
    fail_outbox = False
    def _before_outbox_insert(self, connection):
        if self.fail_outbox: raise RuntimeError("injected outbox failure")

class MenuHumanChatTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.s = MenuStorage(str(Path(self.tmp.name) / "state.sqlite"))
        self.service = RecommendationApplicationService()
    def tearDown(self): self.s.close(); self.tmp.cleanup()
    def deliver(self, text, event_id, payload=None, miniapp=False):
        raw = json.loads(FIXTURE.read_text()); raw.update(group_id=1, event_id=event_id)
        raw["object"]["message"].update(peer_id=11, from_id=11, text=text, payload=payload)
        self.assertTrue(self.s.accept(raw)); row = self.s.claim_event()
        result = BotOrchestrator(self.s, self.service, VKMiniAppConfig(enabled=miniapp, app_id=9, owner_id=-1)).process(row["id"], normalize_callback(raw))
        self.s.finish_event(row["id"], result)
        return result
    def session(self): return self.s.session(1, 11)
    def outbox(self): return self.s.connection.execute("select * from vk_outbox order by outbox_id").fetchall()

    def test_start_requires_explicit_mode_and_menu_builder_is_navigation(self):
        self.deliver("13.10.1990", "first")
        self.assertEqual(self.session()["state"], "START")
        row = self.outbox()[-1]; self.assertEqual(row["message_text"], ROUTING_PROMPT); self.assertEqual(json.loads(row["keyboard_json"]), main_menu_keyboard())

    def test_menu_recommend_starts_calendar_handoff_and_invalid_payload_fails_closed(self):
        self.deliver("Подобрать оберег", "recommend", '{"kip":"menu","value":"recommend","v":1}', miniapp=True)
        self.assertEqual(self.session()["state"], "WAITING_DATE"); self.assertEqual(len(self.outbox()), 1)
        self.assertEqual(json.loads(self.outbox()[0]["keyboard_json"])["buttons"][0][0]["action"]["type"], "open_app")
        self.assertEqual(self.s.connection.execute("select count(*) from vk_miniapp_handoffs").fetchone()[0], 1)
        self.deliver("Задать вопрос", "bad", '{"kip":"menu","value":"human","v":2}')
        self.assertEqual(self.session()["state"], "WAITING_DATE")

    def test_human_handoff_suppresses_messages_and_return_resets_fields(self):
        self.deliver("Подобрать оберег", "recommend")
        self.deliver("13.10.1990", "date")
        self.deliver("Задать вопрос", "human", '{"kip":"menu","value":"human","v":1}')
        self.assertEqual(self.session()["state"], "HUMAN_HANDOFF"); self.assertEqual(self.outbox()[-1]["message_text"], HUMAN_HANDOFF_ACK)
        self.assertEqual(json.loads(self.outbox()[-1]["keyboard_json"]), main_menu_keyboard())
        before = len(self.outbox()); self.deliver("нужен совет человека", "question"); self.deliver("и еще вопрос", "question-2")
        self.assertEqual(len(self.outbox()), before); self.assertEqual(self.session()["state"], "HUMAN_HANDOFF")
        self.deliver("Подобрать оберег", "return", '{"kip":"menu","value":"recommend","v":1}')
        s = self.session(); self.assertEqual(s["state"], "WAITING_DATE"); self.assertEqual(tuple(s[k] for k in ("birth_day", "birth_month", "birth_year", "gender", "last_result_id")), (None,) * 5)

    def test_menu_human_is_idempotent_and_transition_rolls_back_on_outbox_failure(self):
        self.deliver("Задать вопрос", "human", '{"kip":"menu","value":"human","v":1}')
        self.assertEqual(len(self.outbox()), 1); self.deliver("Задать вопрос", "again", '{"kip":"menu","value":"human","v":1}')
        self.assertEqual(len(self.outbox()), 1)
        other = MenuStorage(str(Path(self.tmp.name) / "other.sqlite")); other.fail_outbox = True
        try:
            raw = json.loads(FIXTURE.read_text()); raw.update(group_id=2, event_id="fail"); raw["object"]["message"].update(peer_id=22, from_id=22, text="Задать вопрос", payload='{"kip":"menu","value":"human","v":1}')
            other.accept(raw); row = other.claim_event()
            with self.assertRaises(RuntimeError): BotOrchestrator(other, self.service).process(row["id"], normalize_callback(raw))
            self.assertIsNone(other.session(2, 22)); self.assertEqual(other.connection.execute("select count(*) from vk_outbox").fetchone()[0], 0)
        finally: other.close()
        other = MenuStorage(str(Path(self.tmp.name) / "calendar-fail.sqlite")); other.fail_outbox = True
        try:
            raw = json.loads(FIXTURE.read_text()); raw.update(group_id=3, event_id="calendar-fail"); raw["object"]["message"].update(peer_id=33, from_id=33, text="Подобрать оберег", payload='{"kip":"menu","value":"recommend","v":1}')
            other.accept(raw); row = other.claim_event()
            with self.assertRaises(RuntimeError): BotOrchestrator(other, self.service, VKMiniAppConfig(enabled=True, app_id=9, owner_id=-1)).process(row["id"], normalize_callback(raw))
            self.assertIsNone(other.session(3, 33)); self.assertEqual(other.connection.execute("select count(*) from vk_miniapp_handoffs").fetchone()[0], 0)
        finally: other.close()

    def test_legacy_restart_and_completion_use_root_menu_not_restart(self):
        self.deliver("Подобрать снова", "legacy")
        self.assertEqual(self.session()["state"], "WAITING_DATE")
        self.deliver("13.10.1990", "date")
        self.deliver("Мужчине", "gender", '{"kip":"gender","value":"male","v":1}')
        self.assertEqual(self.session()["state"], "RESOLVED")
        self.assertEqual(json.loads(self.outbox()[-1]["keyboard_json"]), main_menu_keyboard())
