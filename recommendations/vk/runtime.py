"""Lifespan-owned VK runtime for the single backend deployable."""
from __future__ import annotations

import asyncio
import logging

import httpx

from recommendations.application import RecommendationApplicationService
from .bot_orchestrator import BotOrchestrator
from .inbound_worker import InboundWorker
from .outbox import OutboxWorker
from .storage import VKStorage
from .vk_api import VKAPIClient

logger = logging.getLogger("recommendations.vk.runtime")


class VKRuntimeController:
    def __init__(self, config, *, api_client=None, storage_factory=VKStorage, service_factory=RecommendationApplicationService):
        self.config = config
        self._api_client = api_client
        self._storage_factory = storage_factory
        self._service_factory = service_factory
        self.storage = None
        self.http_client = None
        self.tasks = []
        self._stop = asyncio.Event()

    async def start(self) -> None:
        self.storage = self._storage_factory(self.config.state_db_path, self.config.claim_lease_seconds, self.config.raw_payload_retention_seconds, self.config.session_retention_seconds)
        self.storage.recover_stale_claims()
        self.http_client = httpx.Client(timeout=10)
        api = self._api_client or VKAPIClient(self.config, self.http_client)
        from .config import VKMiniAppConfig
        orchestrator = BotOrchestrator(self.storage, self._service_factory(), VKMiniAppConfig.from_environment(), self.config.product_illustrations if self.config.recommendation_images_enabled else None)
        self.inbound_worker = InboundWorker(self.storage, orchestrator)
        self.outbox_worker = OutboxWorker(self.storage, api, self.config.retry_delay_seconds)
        self.tasks = [asyncio.create_task(self._loop("inbound", self.inbound_worker), name="vk-inbound-worker"), asyncio.create_task(self._loop("outbox", self.outbox_worker), name="vk-outbox-worker")]
        logger.info("VK worker lifecycle started")

    async def _loop(self, kind, worker) -> None:
        while not self._stop.is_set():
            worked = False
            try:
                while not self._stop.is_set():
                    did_work = await asyncio.to_thread(worker.process_one)
                    if not did_work:
                        break
                    worked = True
            except asyncio.CancelledError:
                raise
            except Exception as exc:
                logger.warning("VK %s worker unexpected failure: %s", kind, type(exc).__name__)
            await self._wait(self.config.worker_poll_seconds if not worked else 0)

    async def _wait(self, seconds: float) -> None:
        if seconds <= 0:
            await asyncio.sleep(0)
            return
        try:
            await asyncio.wait_for(self._stop.wait(), timeout=seconds)
        except TimeoutError:
            pass

    async def stop(self) -> None:
        self._stop.set()
        for task in self.tasks:
            task.cancel()
        if self.tasks:
            await asyncio.gather(*self.tasks, return_exceptions=True)
        self.tasks = []
        if self.http_client is not None:
            self.http_client.close()
        if self.storage is not None:
            self.storage.close()
        logger.info("VK worker lifecycle stopped")
