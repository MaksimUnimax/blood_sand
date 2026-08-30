import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from recommendations.tools import register_vk_product_image as registration


class Response:
    def __init__(self, value): self.value = value
    def json(self): return self.value


class Client:
    def __init__(self, *args, **kwargs): self.calls = []
    def __enter__(self): return self
    def __exit__(self, *args): return False
    def post(self, url, data=None, files=None):
        self.calls.append((url, data, files))
        if url.endswith("photos.getMessagesUploadServer"):
            return Response({"response": {"upload_url": "https://upload.invalid"}})
        if url == "https://upload.invalid":
            return Response({"photo": "uploaded-photo", "hash": "uploaded-hash", "server": 123456})
        if url.endswith("photos.saveMessagesPhoto"):
            return Response({"response": [{"owner_id": -1, "id": 42}]})
        raise AssertionError(url)


class VKImageRegistrationTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.image = Path(self.tmp.name) / "source.png"
        self.image.write_bytes(b"png")
        self.environment = {
            "KIP_VK_GROUP_ID": "1", "KIP_VK_GROUP_TOKEN": "protected",
            "KIP_VK_IMAGE_REGISTRATION_PEER_ID": "2",
        }

    def tearDown(self): self.tmp.cleanup()

    def test_official_integer_server_response_is_saved_without_coercion(self):
        client = Client()
        with patch.dict(os.environ, self.environment, clear=True), patch.object(registration.httpx, "Client", return_value=client), patch.object(registration.mimetypes, "guess_type", return_value=("image/png", None)):
            attachment = registration.register(self.image)
        self.assertEqual(attachment, "photo-1_42")
        save_call = client.calls[2]
        self.assertEqual(save_call[1]["server"], 123456)
        self.assertIs(type(save_call[1]["server"]), int)

    def test_decimal_string_server_response_is_saved_without_coercion(self):
        class StringServerClient(Client):
            def post(self, url, data=None, files=None):
                response = super().post(url, data=data, files=files)
                if url == "https://upload.invalid":
                    return Response({"photo": "uploaded-photo", "hash": "uploaded-hash", "server": "123456"})
                return response

        client = StringServerClient()
        with patch.dict(os.environ, self.environment, clear=True), patch.object(registration.httpx, "Client", return_value=client), patch.object(registration.mimetypes, "guess_type", return_value=("image/png", None)):
            registration.register(self.image)
        save_call = client.calls[2]
        self.assertEqual(save_call[1]["server"], "123456")
        self.assertIsInstance(save_call[1]["server"], str)

    def test_upload_server_method_uses_peer_id_only(self):
        client = Client()
        with patch.dict(os.environ, self.environment, clear=True), patch.object(registration.httpx, "Client", return_value=client), patch.object(registration.mimetypes, "guess_type", return_value=("image/png", None)):
            registration.register(self.image)
        self.assertEqual(client.calls[0][1]["peer_id"], 2)
        self.assertNotIn("group_id", client.calls[0][1])

    def test_unknown_product_fails_without_registry_write(self):
        path = Path(self.tmp.name) / "registry.json"
        with patch.dict(os.environ, {"KIP_VK_PRODUCT_ILLUSTRATIONS_PATH": str(path)}, clear=True):
            with self.assertRaisesRegex(ValueError, "unknown active"):
                registration.update_registry("unknown", "photo-1_42", False)
        self.assertFalse(path.exists())

    def test_assign_all_is_atomic_and_covers_every_active_product(self):
        path = Path(self.tmp.name) / "registry.json"
        with patch.dict(os.environ, {"KIP_VK_PRODUCT_ILLUSTRATIONS_PATH": str(path)}, clear=True):
            registration.update_registry("bear_paw", "photo-1_42", True)
        self.assertEqual(path.stat().st_mode & 0o777, 0o600)
        self.assertEqual(set(__import__("json").loads(path.read_text())["attachments"]), registration.active_product_keys())

    def test_api_failure_message_never_contains_token(self):
        class Rejected:
            def post(self, *args, **kwargs): return Response({"error": {"error_code": 5}})
        with self.assertRaises(RuntimeError) as raised:
            registration._api(Rejected(), "photos.getMessagesUploadServer", "private-token", {"peer_id": 2})
        self.assertNotIn("private-token", str(raised.exception))
