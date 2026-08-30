from __future__ import annotations

from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from recommendations.core import RecommendationInputError, validate_birth_date
from .bot_parser import is_restart, menu_text_action, parse_birth_date, parse_gender, parse_keyboard_payload
from .keyboard import gender_keyboard, main_menu_keyboard
from .presenter import GENDER_PROMPT, present

HUMAN_HANDOFF_ACK = "Напишите ваш вопрос сообщением — вам ответит человек."
ROUTING_PROMPT = "Выберите, что хотите сделать:"
DATE_PROMPT = "Введите дату рождения в формате день/месяц/год.\nНапример: 13.01.1987 или 13 января 1987."
DATE_CORRECTION = "Не удалось распознать дату.\nНапишите дату рождения ещё раз в формате день/месяц/год.\nНапример: 13.01.1987."
PICKER_FIELDS = {
    "date_picker_step": None, "date_picker_page": None,
    "date_picker_range_start": None, "date_picker_range_end": None,
    "date_picker_day_start": None, "date_picker_day_end": None,
}


class BotOrchestrator:
    def __init__(self, storage, service: RecommendationApplicationService, miniapp_config=None):
        self.storage, self.service = storage, service

    def _today(self):
        return self.storage.clock().date()

    def _date_prompt(self, eid, event, fields=None, *, correction=False, kind="date_text"):
        self.storage.transition_and_enqueue(
            eid, event.group_id, event.peer_id, "WAITING_DATE", {**PICKER_FIELDS, **(fields or {})},
            DATE_CORRECTION if correction else DATE_PROMPT, None, kind,
        )

    def process(self, eid, event):
        if event.event_type != "message_new" or event.peer_id is None:
            return "IGNORED"
        old = self.storage.session(event.group_id, event.peer_id)
        state = old["state"] if old else "START"
        text = event.text or ""
        present_payload = event.payload is not None
        action = parse_keyboard_payload(event.payload, text) if present_payload else menu_text_action(text) or (("restart", None) if is_restart(text) else None)
        clear = {"birth_day": None, "birth_month": None, "birth_year": None, "gender": None, "last_result_id": None, **PICKER_FIELDS}

        if action in (("menu", "recommend"), ("restart", None)):
            self._date_prompt(eid, event, clear)
            return "PROCESSED"
        if action == ("menu", "human"):
            if state != "HUMAN_HANDOFF":
                self.storage.transition_and_enqueue(eid, event.group_id, event.peer_id, "HUMAN_HANDOFF", clear, HUMAN_HANDOFF_ACK, main_menu_keyboard())
            return "PROCESSED"
        if state == "HUMAN_HANDOFF":
            return "PROCESSED"
        if state == "START":
            self.storage.transition_and_enqueue(eid, event.group_id, event.peer_id, "START", {}, ROUTING_PROMPT, main_menu_keyboard())
            return "PROCESSED"
        if state == "WAITING_DATE":
            # Retired picker payloads are deliberately treated as another request for text.
            if present_payload:
                self._date_prompt(eid, event, correction=False, kind="retired_date_picker")
                return "PROCESSED"
            parsed = parse_birth_date(text, today=self._today())
            if parsed is None:
                self._date_prompt(eid, event, correction=True, kind="date_text_invalid")
                return "PROCESSED"
            try:
                validate_birth_date(parsed.day, parsed.month, parsed.year)
            except RecommendationInputError:
                self._date_prompt(eid, event, correction=True, kind="date_text_invalid")
                return "PROCESSED"
            if parsed >= self._today():
                self._date_prompt(eid, event, correction=True, kind="date_text_invalid")
                return "PROCESSED"
            self.storage.transition_and_enqueue(
                eid, event.group_id, event.peer_id, "WAITING_GENDER",
                {"birth_day": parsed.day, "birth_month": parsed.month, "birth_year": parsed.year, "gender": None, **PICKER_FIELDS},
                GENDER_PROMPT, gender_keyboard(), "typed_date",
            )
            return "PROCESSED"
        if state == "WAITING_GENDER":
            gender = action[1] if present_payload and action and action[0] == "gender" else (parse_gender(text) if not present_payload else None)
            if not gender:
                self.storage.transition_and_enqueue(eid, event.group_id, event.peer_id, "WAITING_GENDER", {}, GENDER_PROMPT, gender_keyboard())
                return "PROCESSED"
            result = self.service.resolve(ApplicationRecommendationInput(old["birth_day"], old["birth_month"], gender, old["birth_year"], old["marketplace"]))
            self.storage.transition_and_enqueue(eid, event.group_id, event.peer_id, "RESOLVED", {"gender": gender, "last_result_id": result.result_id}, present(result.semantic_result), main_menu_keyboard())
            return "PROCESSED"
        return "IGNORED"
