"""Single-process production entry point. Importing it performs no network work."""
import asyncio
import os
import signal

from telegram import (
    BotCommand,
    BotCommandScopeChat,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonCommands,
    Update,
)
from telegram.error import Conflict
from telegram.ext import Application

from app.codex.prompt_builder import PromptBuilder
from app.codex.runner import Runner
from app.config import Config
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.telegram.bot import OperatorBot
from app.telegram import render
from app.telegram.callbacks import encode
from app.telegram.durable_queue import DurableUpdateQueue
from app.telegram.edge import TelegramEdge, Operation, Outcome, Result

POLLING_CONFLICT_EXIT_CODE = 75
POLLING_KWARGS = {
    'timeout': 30,
    'allowed_updates': ['message', 'callback_query'],
    'drop_pending_updates': False,
}

# Ozon is intentionally TELEGRAM_MANUAL/MANUAL_COPY in this phase, and WB is
# intentionally deferred until a Personal token and pacing/backoff are enabled.
# Therefore production needs only Telegram credentials right now.
REQUIRED = ('TELEGRAM_BOT_TOKEN', 'TELEGRAM_OPERATOR_USER_ID')


class PollingConflictExit(SystemExit):
    """Dedicated ownership-fault exit; systemd must not restart this code."""

    def __init__(self):
        super().__init__(POLLING_CONFLICT_EXIT_CODE)


def live_config(env=None):
    env = os.environ if env is None else env
    missing = [key for key in REQUIRED if not env.get(key)]
    if missing:
        raise RuntimeError('missing required production configuration: ' + ', '.join(missing))
    return {key: env[key] for key in REQUIRED}


async def configure_operator_menu(bot, operator_id):
    """Make manual Ozon ingress discoverable from Telegram's persistent bot menu."""
    chat_id = int(operator_id)
    commands = [BotCommand('ozon', '➕ Отправить вопрос')]
    await bot.set_my_commands(commands, scope=BotCommandScopeChat(chat_id=chat_id))
    await bot.set_chat_menu_button(chat_id=chat_id, menu_button=MenuButtonCommands())


class TelegramTransport:
    """Small production transport boundary used by future API pollers."""

    def __init__(self, application, operator_id, repo):
        self.application = application
        self.operator_id = operator_id
        self.repo = repo
        self.last_question_send = {'executed': False}
        self.last_question_outcome = None
        self.edge = TelegramEdge()
        self._last_outbound_at = 0.0

    async def _send(self, **kwargs):
        delay = self._last_outbound_at + 1.0 - asyncio.get_running_loop().time()
        if delay > 0:
            await asyncio.sleep(delay)
        result = await self.edge.mutate(
            Operation.MESSAGE_CREATE,
            lambda: self.application.bot.send_message(**kwargs),
        )
        self._last_outbound_at = asyncio.get_running_loop().time()
        return result

    async def prepare_question(self, question):
        buttons = InlineKeyboardMarkup([
            [
                InlineKeyboardButton('✍️ Ответить самому', callback_data=encode('manual', question['id'])),
                InlineKeyboardButton('🤖 Отправить в Codex', callback_data=encode('codex', question['id'])),
            ],
            [InlineKeyboardButton('🚫 Игнорировать', callback_data=encode('ignore', question['id']))],
            [InlineKeyboardButton(
                '🤖 Сменить Codex',
                callback_data=encode('choose_codex', question['id'], None, 'menu'),
            )],
        ])
        payload = []
        for index, text in enumerate(render.initial(question, await self.repo.active_codex_profile())):
            if not isinstance(text, str) or not text:
                raise ValueError('invalid initial-card text')
            payload.append({
                'chat_id': self.operator_id,
                'text': text,
                'reply_markup': buttons if index == 0 else None,
            })
        if not payload:
            raise ValueError('initial-card payload is empty')
        return payload

    async def question(self, question, prepared=None):
        first = None
        for kwargs in prepared if prepared is not None else await self.prepare_question(question):
            outcome = await self._send(**kwargs)
            if outcome.outcome is not Outcome.SUCCESS:
                self.last_question_outcome = outcome
                await self.repo.record_error('telegram', outcome.outcome.value, str(outcome.error))
                await self.repo.record_delivery_failure(
                    question['id'], 'INITIAL_CARD', outcome.outcome.value, str(outcome.error)
                )
                return None
            sent = outcome.value
            self.last_question_outcome = outcome
            if first is None:
                first = sent.message_id
                if not isinstance(first, int) or first <= 0:
                    raise RuntimeError('Telegram sendMessage did not return a positive message_id')
                self.last_question_send = {
                    'executed': True,
                    'response_type': type(sent).__name__,
                    'message_id': first,
                }
        self.last_question_outcome = Result(
            Outcome.SUCCESS, type('InitialCard', (), {'message_id': first})()
        )
        return first


async def polling_loop(service, config, stop):
    while not stop.is_set():
        # Empty during the Ozon-manual-only phase. Keeping the loop makes later
        # WB activation a configuration/code change without topology changes.
        await service.poll_all()
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

    # No marketplace network adapter is enabled in this phase. Ozon is human
    # ingress/egress; WB will be enabled only after its separate acceptance.
    adapters = {}

    update_queue = DurableUpdateQueue(repo)
    application = (
        Application.builder()
        .token(secrets['TELEGRAM_BOT_TOKEN'])
        .update_queue(update_queue)
        .build()
    )
    service = QuestionService(
        repo,
        adapters,
        TelegramTransport(application, secrets['TELEGRAM_OPERATOR_USER_ID'], repo),
        Runner(config),
        PromptBuilder('prompts', config.reference_dir),
    )
    for handler in OperatorBot(secrets['TELEGRAM_OPERATOR_USER_ID'], service).handlers():
        application.add_handler(handler)

    stop = asyncio.Event()
    loop = asyncio.get_running_loop()
    for signum in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(signum, stop.set)

    polling_fault = {'conflict': None}

    def polling_error(error):
        if isinstance(error, Conflict):
            polling_fault['conflict'] = error
            asyncio.create_task(repo.record_error('telegram', 'POLLING_CONFLICT', str(error)))
            stop.set()

    try:
        await application.initialize()
        try:
            await configure_operator_menu(application.bot, secrets['TELEGRAM_OPERATOR_USER_ID'])
        except Exception as exc:
            # Menu setup is presentation-only: preserve bot availability and make
            # the failure observable. The persistent reply keyboard remains a
            # second entry point once the bot sends any operator-facing message.
            await repo.record_error('telegram', 'MENU_SETUP', str(exc))
        await application.bot.delete_webhook(drop_pending_updates=False)
        await application.start()
        for row in await repo.pending_telegram_updates():
            await update_queue.replay_put(
                Update.de_json(__import__('json').loads(row['update_json']), application.bot)
            )
        await application.updater.start_polling(**POLLING_KWARGS, error_callback=polling_error)
        await asyncio.gather(
            polling_loop(service, config, stop),
            retention_loop(repo, config, stop),
        )
        if polling_fault['conflict']:
            raise PollingConflictExit()
    finally:
        if application.updater.running:
            await application.updater.stop()
        if application.running:
            await application.stop()
        await application.shutdown()
        await db.close()


if __name__ == '__main__':
    asyncio.run(main())