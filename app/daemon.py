"""Single-process production entry point. Importing it performs no network work."""
import asyncio
import os
import signal

import httpx
from telegram.ext import Application
from telegram import Update
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

from app.codex.prompt_builder import PromptBuilder
from app.codex.runner import Runner
from app.config import Config
from app.db.database import connect, init
from app.db.repository import Repository
from app.marketplaces.ozon import OzonAdapter
from app.marketplaces.wildberries import WildberriesAdapter
from app.service import QuestionService
from app.telegram.bot import OperatorBot
from app.telegram import render
from app.telegram.callbacks import encode
from app.telegram.durable_queue import DurableUpdateQueue
from app.telegram.edge import TelegramEdge, Operation, Outcome
from telegram.error import Conflict

POLLING_CONFLICT_EXIT_CODE = 75

class PollingConflictExit(SystemExit):
    """Dedicated ownership-fault exit; systemd must not restart this code."""

    def __init__(self): super().__init__(POLLING_CONFLICT_EXIT_CODE)

REQUIRED = ('TELEGRAM_BOT_TOKEN', 'TELEGRAM_OPERATOR_USER_ID', 'WB_API_TOKEN', 'OZON_CLIENT_ID', 'OZON_API_KEY')


def live_config(env=None):
    env = os.environ if env is None else env
    missing = [key for key in REQUIRED if not env.get(key)]
    if missing:
        # Names are safe; values are intentionally never interpolated.
        raise RuntimeError('missing required production configuration: ' + ', '.join(missing))
    return {key: env[key] for key in REQUIRED}


class TelegramTransport:
    """Small production transport boundary used by the polling service."""
    def __init__(self, application, operator_id, repo):
        self.application, self.operator_id, self.repo = application, operator_id, repo
        self.last_question_send = {'executed': False}
        self.edge = TelegramEdge()
        self._last_outbound_at = 0.0

    async def _send(self, **kwargs):
        # Private operator chat: serialize initial-card sends at <= 1/sec.
        delay = self._last_outbound_at + 1.0 - asyncio.get_running_loop().time()
        if delay > 0: await asyncio.sleep(delay)
        result = await self.edge.mutate(Operation.MESSAGE_CREATE, lambda: self.application.bot.send_message(**kwargs))
        self._last_outbound_at = asyncio.get_running_loop().time()
        return result

    async def question(self, question):
        first = None
        buttons = InlineKeyboardMarkup([
            [InlineKeyboardButton('✍️ Ответить самому', callback_data=encode('manual', question['id'])),
             InlineKeyboardButton('🤖 Отправить в Codex', callback_data=encode('codex', question['id']))],
            [InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', question['id']))],
        ])
        for text in render.initial(question, await self.repo.active_codex_profile()):
            outcome = await self._send(chat_id=self.operator_id, text=text, reply_markup=buttons if first is None else None)
            if outcome.outcome is not Outcome.SUCCESS:
                await self.repo.record_error('telegram', outcome.outcome.value, str(outcome.error))
                await self.repo.record_delivery_failure(question['id'], 'INITIAL_CARD', outcome.outcome.value, str(outcome.error))
                return None
            sent = outcome.value
            if first is None:
                first = sent.message_id
                if not isinstance(first, int) or first <= 0:
                    raise RuntimeError('Telegram sendMessage did not return a positive message_id')
                self.last_question_send = {
                    'executed': True,
                    'response_type': type(sent).__name__,
                    'message_id': first,
                }
        return first


async def polling_loop(service, config, stop):
    while not stop.is_set():
        await service.poll_all()  # individual errors are returned, not fatal to the daemon
        try:
            await asyncio.wait_for(stop.wait(), timeout=config.poll_interval_seconds)
        except asyncio.TimeoutError:
            pass


async def retention_loop(repo, config, stop):
    while not stop.is_set():
        await repo.cleanup_retention(config.retention_days)
        try:
            await asyncio.wait_for(stop.wait(), timeout=24 * 60 * 60)
        except asyncio.TimeoutError:
            pass


async def main():
    secrets = live_config()
    config = Config()
    config.db_path.parent.mkdir(parents=True, exist_ok=True)
    config.jobs_dir.mkdir(parents=True, exist_ok=True)
    db = await connect(config.db_path)
    await init(db)
    repo = Repository(db)
    client = httpx.AsyncClient(timeout=httpx.Timeout(connect=10, read=20, write=20, pool=20))
    adapters = {'ozon': OzonAdapter(client, secrets['OZON_CLIENT_ID'], secrets['OZON_API_KEY']), 'wildberries': WildberriesAdapter(client, secrets['WB_API_TOKEN'])}
    update_queue = DurableUpdateQueue(repo)
    application = Application.builder().token(secrets['TELEGRAM_BOT_TOKEN']).update_queue(update_queue).build()
    service = QuestionService(repo, adapters, TelegramTransport(application, secrets['TELEGRAM_OPERATOR_USER_ID'], repo), Runner(config), PromptBuilder('prompts', config.reference_dir))
    for handler in OperatorBot(secrets['TELEGRAM_OPERATOR_USER_ID'], service).handlers(): application.add_handler(handler)
    stop = asyncio.Event(); loop = asyncio.get_running_loop()
    for signum in (signal.SIGTERM, signal.SIGINT): loop.add_signal_handler(signum, stop.set)
    polling_fault = {'conflict': None}
    def polling_error(error):
        if isinstance(error, Conflict):
            # Updater invokes this synchronously from its polling task. Stop the
            # daemon deliberately; main raises after orderly PTB shutdown so
            # systemd exposes the ownership fault instead of looping forever.
            polling_fault['conflict'] = error
            asyncio.create_task(repo.record_error('telegram', 'POLLING_CONFLICT', str(error)))
            stop.set()
    try:
        await application.initialize()
        # getUpdates and webhook delivery are mutually exclusive. Clearing a webhook
        # without dropping pending updates is the explicit production polling contract.
        await application.bot.delete_webhook(drop_pending_updates=False)
        await application.start()
        # Re-run every receipt that Telegram may already have confirmed during a
        # prior process lifetime before requesting further updates.
        for row in await repo.pending_telegram_updates():
            await update_queue.replay_put(Update.de_json(__import__('json').loads(row['update_json']), application.bot))
        await application.updater.start_polling(timeout=30, allowed_updates=['message','callback_query'], drop_pending_updates=False, error_callback=polling_error)
        await asyncio.gather(polling_loop(service, config, stop), retention_loop(repo, config, stop))
        if polling_fault['conflict']:
            raise PollingConflictExit()
    finally:
        if application.updater.running: await application.updater.stop()
        if application.running: await application.stop()
        await application.shutdown(); await client.aclose(); await db.close()


if __name__ == '__main__':
    asyncio.run(main())
