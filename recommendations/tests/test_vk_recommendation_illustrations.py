import json
import tempfile
import unittest
from pathlib import Path

from recommendations.vk.illustrations import (
    VKIllustrationConfigurationError, active_product_keys, load_runtime_attachments,
    repository_product_keys, validate_attachment,
)
from recommendations.vk.outbox import OutboxWorker
from recommendations.vk.storage import VKStorage
from recommendations.vk.vk_api import VKAPIResult


PHOTO = "photo-1_42"


class API:
    def __init__(self): self.calls = []
    def messages_send(self, peer, message, random_id, keyboard=None, attachments=None):
        self.calls.append((peer, message, random_id, keyboard, attachments))
        return VKAPIResult(message_id=1)


class RetryAPI(API):
    def messages_send(self, peer, message, random_id, keyboard=None, attachments=None):
        self.calls.append((peer, message, random_id, keyboard, attachments))
        return VKAPIResult(error_code=6 if len(self.calls) == 1 else None, message_id=1)


class VKRecommendationIllustrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.path = str(Path(self.tmp.name) / "state.sqlite")
        self.storage = VKStorage(self.path)
    def tearDown(self): self.storage.close(); self.tmp.cleanup()

    def test_repository_registry_tracks_active_matrix_keys(self):
        self.assertEqual(repository_product_keys(), active_product_keys())
        self.assertEqual(len(active_product_keys()), 15)

    def test_runtime_registry_requires_full_valid_coverage_and_allows_one_placeholder(self):
        path = Path(self.tmp.name) / "illustrations.json"
        path.write_text(json.dumps({"version": 1, "attachments": {key: PHOTO for key in active_product_keys()}}))
        loaded = load_runtime_attachments(path)
        self.assertEqual(set(loaded), active_product_keys())
        self.assertEqual(set(loaded.values()), {PHOTO})
        path.write_text(json.dumps({"version": 1, "attachments": {"bear_paw": "bad"}}))
        with self.assertRaises(VKIllustrationConfigurationError): load_runtime_attachments(path)
        with self.assertRaises(VKIllustrationConfigurationError): validate_attachment("document1_2")

    def test_result_attachment_is_durable_and_retry_uses_same_identity(self):
        self.storage.accept({"group_id": 1, "event_id": "illustrated", "v": "5.199", "type": "message_new", "object": {"message": {"peer_id": 2, "from_id": 2, "text": "x"}}})
        event = self.storage.claim_event()
        keyboard = {"one_time": False, "inline": False, "buttons": []}
        self.storage.transition_and_enqueue(event["id"], 1, 2, "RESOLVED", {}, "result", keyboard, attachments=[PHOTO])
        row = self.storage.connection.execute("select * from vk_outbox").fetchone()
        self.assertEqual(json.loads(row["attachment_json"]), [PHOTO])
        self.assertEqual(json.loads(row["attachment_audit_json"]), {"attachment_present": True, "attachment_type": "photo", "attachment_count": 1})
        api = API(); OutboxWorker(self.storage, api).process_one()
        self.assertEqual(api.calls[0][3:], (row["keyboard_json"], [PHOTO]))

    def test_non_result_outbox_has_no_attachment(self):
        self.storage.accept({"group_id": 1, "event_id": "plain", "v": "5.199", "type": "message_new", "object": {"message": {"peer_id": 2, "from_id": 2, "text": "x"}}})
        event = self.storage.claim_event()
        self.storage.transition_and_enqueue(event["id"], 1, 2, "WAITING_DATE", {}, "prompt")
        row = self.storage.connection.execute("select attachment_json, attachment_audit_json from vk_outbox").fetchone()
        self.assertEqual(tuple(row), (None, None))

    def test_result_retry_reuses_persisted_keyboard_attachment_and_random_id(self):
        from recommendations.vk.keyboard import recommendation_marketplace_keyboard
        from recommendations.vk.product_links import product_links
        self.storage.accept({"group_id": 1, "event_id": "retry-result", "v": "5.199", "type": "message_new", "object": {"message": {"peer_id": 2, "from_id": 2, "text": "x"}}})
        event = self.storage.claim_event(); keyboard = recommendation_marketplace_keyboard("svarog", product_links("svarog"))
        self.storage.transition_and_enqueue(event["id"], 1, 2, "RESOLVED", {}, "result", keyboard, attachments=[PHOTO])
        row = self.storage.connection.execute("select * from vk_outbox").fetchone(); api = RetryAPI()
        OutboxWorker(self.storage, api, 0).process_one(); self.storage.connection.execute("update vk_outbox set next_attempt_at=null")
        OutboxWorker(self.storage, api, 0).process_one()
        self.assertEqual(api.calls[0], api.calls[1])
        self.assertEqual(api.calls[0][2:], (row["random_id"], row["keyboard_json"], [PHOTO]))
