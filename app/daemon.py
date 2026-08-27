"""Single-process production entry point. Importing it performs no network work."""
import asyncio
import os
import signal

import httpx
from telegram.ext import Application
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

    async def question(self, question):
        first = None
        buttons = InlineKeyboardMarkup([
            [InlineKeyboardButton('✍️ Ответить самому', callback_data=encode('manual', question['id'])),
             InlineKeyboardButton('🤖 Отправить в Codex', callback_data=encode('codex', question['id']))],
            [InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', question['id']))],
        ])
        for text in render.initial(question, await self.repo.active_codex_profile()):
            sent = await self.application.bot.send_message(chat_id=self.operator_id, text=text, reply_markup=buttons if first is None else None)
            if first is None:
                first = sent.message_id
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
    application = Application.builder().token(secrets['TELEGRAM_BOT_TOKEN']).build()
    service = QuestionService(repo, adapters, TelegramTransport(application, secrets['TELEGRAM_OPERATOR_USER_ID'], repo), Runner(config), PromptBuilder('prompts', config.reference_dir))
    for handler in OperatorBot(secrets['TELEGRAM_OPERATOR_USER_ID'], service).handlers(): application.add_handler(handler)
    stop = asyncio.Event(); loop = asyncio.get_running_loop()
    for signum in (signal.SIGTERM, signal.SIGINT): loop.add_signal_handler(signum, stop.set)
    try:
        await application.initialize(); await application.start(); await application.updater.start_polling()
        await asyncio.gather(polling_loop(service, config, stop), retention_loop(repo, config, stop))
    finally:
        if application.updater.running: await application.updater.stop()
        if application.running: await application.stop()
        await application.shutdown(); await client.aclose(); await db.close()


if __name__ == '__main__':
    asyncio.run(main())
