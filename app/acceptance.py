"""Isolated live Telegram acceptance, assembled exclusively from production parts."""
import argparse
import asyncio
import json
import os
import signal
from pathlib import Path

from telegram import Update
from telegram.ext import Application

from app.daemon import POLLING_KWARGS, TelegramTransport
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.telegram.bot import OperatorBot
from app.telegram.durable_queue import DurableUpdateQueue


class MarketplaceWritesDisabled(RuntimeError):
    """Acceptance adapter boundary: no marketplace request can be constructed."""


class BlockedMarketplaceAdapter:
    def __init__(self, marketplace, counters):
        self.marketplace, self.counters = marketplace, counters

    async def fetch_unanswered_questions(self): return []

    async def send_answer(self, question, text):
        self.counters[f'{self.marketplace}_write_attempts'] += 1
        raise MarketplaceWritesDisabled(f'{self.marketplace} writes are disabled before any client request')

    async def reconcile_answer(self, question, expected_text, send_started_at):
        self.counters[f'{self.marketplace}_write_attempts'] += 1
        raise MarketplaceWritesDisabled(f'{self.marketplace} writes are disabled before any client request')


class CodexDisabled:
    async def run(self, profile, prompt, attempt_id):
        raise RuntimeError('Codex is physically disabled in Phase 1 acceptance')


def synthetic_questions():
    return [
        {'marketplace': 'ozon', 'external_question_id': 'T4-MANUAL-SYNTHETIC-001', 'product_id': 'T4-SYNTHETIC-PRODUCT', 'product_article': 'T4-MANUAL', 'product_title': 'T4 synthetic Manual scenario', 'question_text': 'T4-MANUAL synthetic question: manual answer, then review and edit. Do not publish.', 'raw_status': 'synthetic_acceptance'},
        {'marketplace': 'wildberries', 'external_question_id': 'T4-IGNORE-SYNTHETIC-001', 'product_id': 'T4-SYNTHETIC-PRODUCT', 'product_article': 'T4-IGNORE', 'product_title': 'T4 synthetic Ignore scenario', 'question_text': 'T4-IGNORE synthetic question: ignore flow only. Do not publish.', 'raw_status': 'synthetic_acceptance'},
        {'marketplace': 'ozon', 'external_question_id': 'T4-CODEX-SYNTHETIC-001', 'product_id': 'T4-SYNTHETIC-PRODUCT', 'product_article': 'T4-CODEX', 'product_title': 'T4 synthetic Codex scenario', 'question_text': 'T4-CODEX synthetic question: later Codex flow. Do not publish.', 'raw_status': 'synthetic_acceptance'},
    ]


async def prepare_questions(repo, transport):
    rows = []
    for raw in synthetic_questions():
        question, created = await repo.insert_question(raw)
        if not created: raise RuntimeError(f"refusing reused acceptance question: {raw['external_question_id']}")
        message_id = await transport.question(question)
        if not message_id: raise RuntimeError(f"initial delivery unconfirmed: {question['public_id']}")
        await repo.persist_question_message_id(question['id'], message_id)
        rows.append(await repo.get_question(question['id']))
    return rows


def evidence(db_path, rows, counters):
    return {'acceptance_db': str(db_path), 'questions': [dict(row) for row in rows], 'ozon_answer_create_calls': counters['ozon_write_attempts'], 'wb_question_patch_calls': counters['wildberries_write_attempts'], 'real_codex_generations': 0, 'polling': POLLING_KWARGS, 'durable_update_queue': True}


async def run(db_path, evidence_path):
    if db_path.resolve() == Path('/var/lib/marketplace-question-operator/state.sqlite3'): raise SystemExit('refusing production database')
    token, operator_id = os.environ['TELEGRAM_BOT_TOKEN'], os.environ['TELEGRAM_OPERATOR_USER_ID']
    db = await connect(db_path); await init(db); repo = Repository(db)
    counters = {'ozon_write_attempts': 0, 'wildberries_write_attempts': 0}
    queue = DurableUpdateQueue(repo)
    application = Application.builder().token(token).update_queue(queue).build()
    transport = TelegramTransport(application, operator_id, repo)
    service = QuestionService(repo, {'ozon': BlockedMarketplaceAdapter('ozon', counters), 'wildberries': BlockedMarketplaceAdapter('wildberries', counters)}, transport, CodexDisabled(), None)
    for handler in OperatorBot(operator_id, service).handlers(): application.add_handler(handler)
    stop = asyncio.Event(); loop = asyncio.get_running_loop()
    for signum in (signal.SIGTERM, signal.SIGINT): loop.add_signal_handler(signum, stop.set)
    try:
        await application.initialize(); await application.start()
        rows = await prepare_questions(repo, transport)
        Path(evidence_path).write_text(json.dumps(evidence(db_path, rows, counters), indent=2) + '\n')
        await application.bot.delete_webhook(drop_pending_updates=False)
        for row in await repo.pending_telegram_updates(): await queue.replay_put(Update.de_json(json.loads(row['update_json']), application.bot))
        await application.updater.start_polling(**POLLING_KWARGS)
        await stop.wait()
    finally:
        if application.updater.running: await application.updater.stop()
        if application.running: await application.stop()
        await application.shutdown(); await db.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', type=Path, required=True); parser.add_argument('--evidence', type=Path, required=True)
    args = parser.parse_args(); asyncio.run(run(args.db, args.evidence))


if __name__ == '__main__': main()
