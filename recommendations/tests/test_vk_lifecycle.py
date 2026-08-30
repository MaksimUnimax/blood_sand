import asyncio
import json
import os
import tempfile
import unittest
from pathlib import Path

import httpx

from recommendations.api.app import create_app
from recommendations.vk.config import VKRuntimeConfig
from recommendations.vk.runtime import VKRuntimeController
from recommendations.vk.vk_api import VKAPIResult

FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new.v5_199.sanitized.json"


class FakeAPI:
    def __init__(self): self.calls = []
    def messages_send(self, peer_id, message, random_id, keyboard=None):
        self.calls.append((peer_id, message, random_id, keyboard))
        return VKAPIResult(message_id=len(self.calls))


class LifecycleTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.config = VKRuntimeConfig(1, "token", "secret", "confirmation", str(Path(self.tmp.name) / "state.sqlite"), session_retention_seconds=60, worker_poll_seconds=.01)
        self.api = FakeAPI()
        self.app = create_app(vk_config=self.config, vk_runtime_factory=lambda config: VKRuntimeController(config, api_client=self.api))
        self.lifespan = self.app.router.lifespan_context(self.app)
        self.closed = False
        await self.lifespan.__aenter__()

    async def asyncTearDown(self):
        if not self.closed:
            await self.lifespan.__aexit__(None, None, None)
        await asyncio.sleep(.02)
        self.tmp.cleanup()

    def payload(self, text, event_id, payload=None):
        value = json.loads(FIXTURE.read_text())
        value.update(group_id=1, event_id=event_id, secret="secret")
        value["object"]["message"].update(peer_id=11, from_id=11, text=text, payload=payload)
        return value

    async def post(self, text, event_id, payload=None):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app), base_url="http://test") as client:
            response = await client.post("/internal/vk/callback", content=json.dumps(self.payload(text, event_id, payload)))
        self.assertEqual(response.text, "ok")

    async def wait_for(self, predicate):
        for _ in range(100):
            if predicate(): return
            await asyncio.sleep(.01)
        self.fail("runtime did not process eligible work")

    async def test_autonomous_complete_flow_without_manual_process_one(self):
        await self.post("Подобрать оберег", "start", '{"kip":"menu","value":"recommend","v":1}')
        await self.wait_for(lambda: len(self.api.calls) == 1)
        await self.post("13.10.1990", "date")
        await self.wait_for(lambda: len(self.api.calls) == 2)
        self.assertEqual(self.api.calls[1][1], "Для кого подбираем оберег?")
        self.assertIsNotNone(self.api.calls[1][3])
        await self.post("Мужчине", "gender", '{"kip":"gender","value":"male","v":1}')
        await self.wait_for(lambda: len(self.api.calls) == 3)
        self.assertIn("рекомендуем оберег", self.api.calls[2][1])
        self.assertIsNotNone(self.api.calls[2][3])
        await self.post("Подобрать снова", "restart", '{"kip":"restart","v":1}')
        await self.wait_for(lambda: len(self.api.calls) == 4)
        self.assertIn("день.месяц.год", self.api.calls[3][1])
        self.assertEqual(len({row[2] for row in self.api.calls}), 4)

    async def test_clean_shutdown_stops_tasks_and_closes_resources(self):
        controller = self.app.state.vk_runtime["controller"]
        self.assertEqual(len(controller.tasks), 2)
        await self.lifespan.__aexit__(None, None, None)
        self.closed = True
        self.assertFalse(controller.tasks)
        self.assertTrue(controller.http_client.is_closed)

    async def test_disabled_lifespan_opens_no_vk_state(self):
        app = create_app(vk_config=None)
        async with app.router.lifespan_context(app):
            self.assertIsNone(app.state.vk_runtime)
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
                self.assertEqual((await client.get("/healthz")).status_code, 200)
