"""Text-only birth date UX and strict dateparser regression tests."""
import json
import tempfile
import unittest
from datetime import date, datetime, timezone

import dateparser

from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator, DATE_CORRECTION, DATE_PROMPT
from recommendations.vk.bot_parser import DATEPARSER_SETTINGS, parse_birth_date
from recommendations.vk.storage import VKStorage


class Clock:
    def __call__(self): return datetime(2026, 8, 29, tzinfo=timezone.utc)


class TextBirthDateTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(); self.storage = VKStorage(f"{self.tmp.name}/vk.sqlite", clock=Clock())
        self.bot = BotOrchestrator(self.storage, RecommendationApplicationService())
    def tearDown(self): self.storage.close(); self.tmp.cleanup()
    def event(self, text, payload=None): return type("Event", (), {"event_type":"message_new","group_id":1,"peer_id":2,"from_id":2,"text":text,"payload":payload})()
    def send(self, text, payload=None):
        eid = self.storage.connection.execute("select count(*) from vk_inbound_events").fetchone()[0] + 1
        self.storage.connection.execute("insert into vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) values(1,'test',?,'x','message_new','{}','NEW',?)", (str(eid), Clock()().isoformat()))
        self.bot.process(eid, self.event(text, payload))
    def outbox(self): return self.storage.connection.execute("select * from vk_outbox order by outbox_id desc").fetchone()

    def test_date_prompt_copy_has_no_examples(self):
        self.assertEqual(DATE_PROMPT, "Введите дату рождения в формате день/месяц/год.")
        self.assertEqual(DATE_CORRECTION, "Не удалось распознать дату. Напишите дату рождения ещё раз в формате день/месяц/год.")

    def test_dateparser_dependency_and_required_formats(self):
        self.assertEqual(dateparser.__version__, "1.4.2")
        forms = ("13.01.1987", "13/01/1987", "13-01-1987", "13 01 1987", "13.01.87", "13 01 87", "13 января 1987", "13 янв. 1987", "13 January 1987", "January 13, 1987")
        for form in forms: self.assertEqual(parse_birth_date(form, today=date(2026,8,29)), date(1987,1,13), form)
        self.assertEqual(parse_birth_date("01/02/1987", today=date(2026,8,29)), date(1987,2,1))
        self.assertEqual(DATEPARSER_SETTINGS["DATE_ORDER"], "DMY")
        self.assertFalse(DATEPARSER_SETTINGS["PREFER_LOCALE_DATE_ORDER"])

    def test_invalid_incomplete_relative_future_and_unsupported_retry_without_mutation(self):
        self.send("Подобрать оберег", '{"kip":"menu","value":"recommend","v":1}')
        self.assertEqual(self.outbox()["message_text"], DATE_PROMPT); self.assertIsNone(self.outbox()["keyboard_json"])
        for value in ("31.02.1987", "29.02.2023", "13.13.2020", "13.10", "random text", "29.08.2026", "today", "сегодня", "tomorrow", "11023", "100187", "30.08.2027"):
            self.send(value); row = self.storage.session(1,2)
            self.assertEqual(row["state"], "WAITING_DATE", value); self.assertEqual((row["birth_day"], row["birth_month"], row["birth_year"]), (None,None,None), value)
            self.assertEqual(self.outbox()["message_text"], DATE_CORRECTION, value)

    def test_valid_date_clears_picker_columns_and_retires_old_payload(self):
        self.send("Подобрать оберег", '{"kip":"menu","value":"recommend","v":1}')
        self.send("2020–2026", '{"kip":"date","step":"year_range","start":2020,"end":2026,"v":1}')
        self.assertEqual(self.outbox()["message_text"], DATE_PROMPT); self.assertIsNone(self.outbox()["keyboard_json"])
        self.send("13 января 1987")
        row = self.storage.session(1,2); self.assertEqual((row["state"],row["birth_day"],row["birth_month"],row["birth_year"]), ("WAITING_GENDER",13,1,1987))
        self.assertTrue(all(row[key] is None for key in ("date_picker_step","date_picker_page","date_picker_range_start","date_picker_range_end","date_picker_day_start","date_picker_day_end")))
        self.assertIn("Мужчине", self.outbox()["keyboard_json"])

    def test_active_date_flow_has_no_picker_or_miniapp_actions(self):
        self.send("Подобрать оберег", '{"kip":"menu","value":"recommend","v":1}')
        payload = self.outbox()["keyboard_json"] or ""
        self.assertNotIn("open_app", payload); self.assertNotIn('"kip":"date"', payload)
