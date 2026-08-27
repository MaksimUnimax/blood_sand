"""Isolated, live Telegram acceptance runner (never a production entry point)."""
import argparse
import asyncio
import json
import os
from pathlib import Path

from telegram.ext import Application

from app.daemon import TelegramTransport
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.telegram.bot import OperatorBot


class MarketplaceWritesDisabled(RuntimeError):
    """Raised before any marketplace client or request can be constructed."""


class AcceptanceSource:
    """One synthetic inbound question; outbound marketplace operations are fail-closed."""
    def __init__(self):
        self.delivered = False

    async def fetch_unanswered_questions(self):
        if self.delivered:
            return []
        self.delivered = True
        return [{
            'marketplace': 'ozon',
            'external_question_id': 'R11A-SYNTHETIC-ISOLATED-TELEGRAM-001',
            'product_id': 'R11A-SYNTHETIC-PRODUCT',
            'product_article': 'R11A-ACCEPTANCE',
            'product_title': 'R11A synthetic acceptance item',
            'question_text': 'R11A synthetic Telegram acceptance question. Do not publish.',
            'raw_status': 'synthetic_acceptance',
        }]

    async def send_answer(self, question, text):
        raise MarketplaceWritesDisabled('marketplace writes are disabled in the acceptance runner')

    async def reconcile_answer(self, question, expected_text, send_started_at):
        raise MarketplaceWritesDisabled('marketplace writes are disabled in the acceptance runner')


class CodexDisabled:
    async def run(self, profile, prompt, attempt_id):
        raise RuntimeError('Codex is disabled in the acceptance runner')


def evidence(repo, db_path):
    """Return non-secret, inspectable acceptance state and fixed no-write counters."""
    return {
        'acceptance_db': str(db_path),
        'ozon_answer_create_calls': 0,
        'wb_question_patch_calls': 0,
        'marketplace_writes_performed': 0,
        'real_codex_generations': 0,
    }


async def run(db_path, evidence_path, serve=False):
    token = os.environ['TELEGRAM_BOT_TOKEN']
    operator_id = os.environ['TELEGRAM_OPERATOR_USER_ID']
    db = await connect(db_path)
    await init(db)
    repo = Repository(db)
    source = AcceptanceSource()
    application = Application.builder().token(token).build()
    transport = TelegramTransport(application, operator_id, repo)
    service = QuestionService(repo, {'ozon': source}, transport, CodexDisabled(), None)
    for handler in OperatorBot(operator_id, service).handlers():
        application.add_handler(handler)
    try:
        await application.initialize()
        await application.start()
        # This is one normal QuestionService.poll delivery from a synthetic source.
        # No recurring polling or Telegram update loop is started, and no real
        # marketplace adapter exists.
        await service.poll('ozon')
        question = (await repo.list_open_questions())[0]
        payload = evidence(repo, db_path) | {
            'question_id': question['id'], 'public_id': question['public_id'],
            'telegram_question_message_id': question['telegram_question_message_id'],
            'initial_state': question['status'],
            'telegram_send': transport.last_question_send,
        }
        Path(evidence_path).write_text(json.dumps(payload, indent=2) + '\n')
        print('R11B isolated Telegram initial delivery complete.', flush=True)
        print(f"QUESTION_ID={question['id']} PUBLIC_Q_ID={question['public_id']} TELEGRAM_MESSAGE_ID={question['telegram_question_message_id']}", flush=True)
        if serve:
            # This acceptance process is deliberately the only update consumer.
            # service.poll() above remains deduplicated, so a persisted R11B card
            # is reused instead of emitting another synthetic card.
            await application.updater.start_polling(drop_pending_updates=False)
            print('R11D isolated Telegram polling active.', flush=True)
            try:
                await asyncio.Event().wait()
            finally:
                await application.updater.stop()
    finally:
        if application.running:
            await application.stop()
        await application.shutdown()
        await db.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', type=Path, required=True)
    parser.add_argument('--evidence', type=Path, required=True)
    parser.add_argument('--serve', action='store_true', help='keep isolated Telegram polling active')
    args = parser.parse_args()
    if args.db.resolve() == Path('/var/lib/marketplace-question-operator/state.sqlite3'):
        raise SystemExit('refusing production database')
    asyncio.run(run(args.db, args.evidence, args.serve))


if __name__ == '__main__':
    main()
