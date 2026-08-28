from pathlib import Path

import pytest

from app.codex.prompt_builder import PromptBuilder
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.state_machine import StaleState
from app.telegram.bot import OperatorBot
from app.telegram.callbacks import decode, encode


class FakeRunner:
    def __init__(self, answer='Готовый ответ'):
        self.answer = answer
        self.calls = []

    async def run(self, profile, prompt, job):
        self.calls.append((profile, prompt, job))
        return self.answer


class NoTransport:
    pass


def prompt_builder(tmp_path, answer_url=None):
    prompts = tmp_path / 'prompts'
    refs = tmp_path / 'references'
    prompts.mkdir()
    refs.mkdir()
    (prompts / 'base.md').write_text('base', encoding='utf-8')
    (prompts / 'references.md').write_text('refs', encoding='utf-8')
    if answer_url:
        (refs / 'OZON_PRODUCT_LINKS.md').write_text(
            f'| identity | Ozon URL |\n|---|---|\n| test | {answer_url} |\n',
            encoding='utf-8',
        )
    return PromptBuilder(prompts, refs)


@pytest.mark.asyncio
async def test_ozon_input_is_durable_replay_safe_and_auto_claims_codex(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    runner = FakeRunner()
    builder = prompt_builder(tmp_path)
    service = QuestionService(repo, {}, NoTransport(), runner, builder)

    await service.begin_ozon_question()
    first = await service.operator_text('Подойдет ли этот оберег?', 7001)
    assert first['kind'] == 'ozon_question'
    assert first['created'] is True
    assert first['claim'][1] == 'codex1'

    q = await repo.get_question(first['question_id'])
    assert q['marketplace'] == 'ozon'
    assert q['external_question_id'] == 'telegram:7001'
    assert q['raw_status'] == 'MANUAL_INGRESS'
    assert q['ingress_mode'] == 'TELEGRAM_MANUAL'
    assert q['publish_mode'] == 'MANUAL_COPY'
    assert q['status'] == 'CODEX_RUNNING'

    replay = await service.operator_text('Подойдет ли этот оберег?', 7001)
    assert replay['question_id'] == q['id']
    assert replay['created'] is False
    assert replay['claim'] is None
    count = (await (await db.execute('SELECT COUNT(*) FROM draft_attempts WHERE question_id=?', (q['id'],))).fetchone())[0]
    assert count == 1

    rid = await service.codex(q['id'], claim=first['claim'])
    q = await repo.get_question(q['id'])
    assert q['status'] == 'REVIEW'
    assert q['current_answer_revision_id'] == rid
    assert len(runner.calls) == 1
    prompt = runner.calls[0][1]
    assert 'MARKETPLACE: OZON' in prompt
    assert 'INGRESS_MODE: TELEGRAM_MANUAL' in prompt
    assert 'PUBLISH_MODE: MANUAL_COPY' in prompt
    assert 'LINK_POLICY: OZON_ONLY' in prompt
    await db.close()


@pytest.mark.asyncio
async def test_ozon_global_input_and_question_bound_input_are_mutually_exclusive(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    q, _ = await repo.insert_question({
        'marketplace': 'wildberries',
        'external_question_id': 'wb-1',
        'question_text': 'q',
    })

    await repo.start_ozon_question_input()
    with pytest.raises(StaleState):
        await repo.start_manual_input(q['id'])

    await db.execute('DELETE FROM operator_input_context')
    await db.commit()
    await repo.start_manual_input(q['id'])
    with pytest.raises(StaleState):
        await repo.start_ozon_question_input()
    await db.close()


@pytest.mark.asyncio
async def test_manual_copy_review_has_no_send_and_close_is_local_only(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    runner = FakeRunner()
    builder = prompt_builder(tmp_path)
    service = QuestionService(repo, {}, NoTransport(), runner, builder)

    await service.begin_ozon_question()
    result = await service.operator_text('Вопрос', 7002)
    rid = await service.codex(result['question_id'], claim=result['claim'])
    q = await repo.get_question(result['question_id'])

    labels = [button.text for row in OperatorBot('1', service).buttons(q).inline_keyboard for button in row]
    assert labels == ['✏️ Редактировать', '✅ Закрыть', '🤖 Сменить Codex']
    assert '✅ Отправить' not in labels

    with pytest.raises(StaleState):
        await service.claim_send(q['id'], rid)

    await service.close_manual_copy(q['id'], rid)
    q = await repo.get_question(q['id'])
    assert q['status'] == 'CLOSED'
    assert q['external_reply_id'] is None
    await db.close()


@pytest.mark.asyncio
async def test_existing_marketplace_api_rows_keep_send_behavior(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    q, _ = await repo.insert_question({
        'marketplace': 'wildberries',
        'external_question_id': 'wb-2',
        'question_text': 'q',
    })
    assert q['ingress_mode'] == 'MARKETPLACE_API'
    assert q['publish_mode'] == 'MARKETPLACE_API'
    await repo.start_manual_input(q['id'])
    rid = await repo.consume_active_text('answer')
    claimed = await repo.claim_send(q['id'], rid)
    assert claimed['text'] == 'answer'
    await db.close()


def test_close_callback_is_revision_bound_and_wire_compatible_extension():
    payload = encode('close', 123, 456)
    assert decode(payload) == {
        'action': 'close',
        'question_id': 123,
        'revision_id': 456,
        'arg': None,
    }
    assert decode(encode('send', 123, 456))['action'] == 'send'


def test_prompt_builder_allows_only_matching_marketplace_registry_urls(tmp_path):
    ozon_url = 'https://www.ozon.ru/product/2184932293/'
    builder = prompt_builder(tmp_path, ozon_url)
    q = {
        'public_id': 'Q-000001',
        'marketplace': 'ozon',
        'ingress_mode': 'TELEGRAM_MANUAL',
        'publish_mode': 'MANUAL_COPY',
        'product_title': None,
        'question_text': 'Посоветуйте оберег',
    }
    assert builder.validate_output(q, f'Даждьбог\n{ozon_url}').endswith(ozon_url)
    with pytest.raises(ValueError, match='outside marketplace allowlist'):
        builder.validate_output(q, 'https://www.wildberries.ru/catalog/123/detail.aspx')
    with pytest.raises(ValueError, match='outside marketplace allowlist'):
        builder.validate_output(q, 'https://www.ozon.ru/product/999999/')


@pytest.mark.asyncio
async def test_init_migrates_legacy_questions_table_without_data_loss(tmp_path):
    db = await connect(tmp_path / 'legacy.sqlite3')
    await db.execute(
        "CREATE TABLE questions("
        "id INTEGER PRIMARY KEY,public_id TEXT UNIQUE,marketplace TEXT NOT NULL,"
        "external_question_id TEXT NOT NULL,product_id TEXT,product_article TEXT,product_title TEXT,"
        "question_text TEXT NOT NULL,question_created_at TEXT,raw_status TEXT,status TEXT NOT NULL DEFAULT 'NEW',"
        "current_answer_revision_id INTEGER,current_draft_attempt_id INTEGER,telegram_question_message_id INTEGER,"
        "telegram_current_message_id INTEGER,external_reply_id TEXT,created_at TEXT NOT NULL,updated_at TEXT NOT NULL,"
        "sent_at TEXT,UNIQUE(marketplace,external_question_id))"
    )
    await db.execute(
        "INSERT INTO questions(id,public_id,marketplace,external_question_id,question_text,status,created_at,updated_at) "
        "VALUES(1,'Q-000001','wildberries','legacy','old','NEW','t','t')"
    )
    await db.commit()

    await init(db)
    row = await (await db.execute('SELECT * FROM questions WHERE id=1')).fetchone()
    assert row['question_text'] == 'old'
    assert row['ingress_mode'] == 'MARKETPLACE_API'
    assert row['publish_mode'] == 'MARKETPLACE_API'
    await db.close()
