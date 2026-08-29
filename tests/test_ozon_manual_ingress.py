from pathlib import Path
import subprocess
from types import SimpleNamespace

import pytest

from app.codex.prompt_builder import PromptBuilder
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.state_machine import StaleState
from app.telegram.bot import OperatorBot, OZON_BUTTON
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


def test_primary_question_action_is_persistent_reply_keyboard_button():
    menu = OperatorBot.main_menu()
    assert OZON_BUTTON == '➕ Отправить вопрос'
    assert menu.keyboard[0][0].text == OZON_BUTTON
    assert menu.is_persistent is True
    assert menu.one_time_keyboard is False


@pytest.mark.asyncio
async def test_start_is_product_facing_and_does_not_dump_debug_status(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    service = QuestionService(repo, {}, NoTransport())
    calls = []

    class Telegram:
        async def send_message(self, **kwargs):
            calls.append(kwargs)
            return SimpleNamespace(message_id=1)

    telegram = Telegram()

    class Message:
        text = '/start'
        chat_id = 1

        def get_bot(self):
            return telegram

    update = SimpleNamespace(
        message=Message(),
        effective_user=SimpleNamespace(id=1),
        effective_chat=SimpleNamespace(id=1, type='private'),
    )
    await OperatorBot(1, service).command(update, None)
    assert len(calls) == 1
    payload = calls[0]
    assert 'DB available' not in payload['text']
    assert 'Open questions' not in payload['text']
    assert 'Active Codex' not in payload['text']
    assert '➕ Отправить вопрос' in payload['text']
    assert payload['reply_markup'].keyboard[0][0].text == '➕ Отправить вопрос'
    await db.close()


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

    revision = await repo.get_current_answer_revision(q['id'])
    markup = OperatorBot('1', service).buttons(q, revision=revision)
    labels = [button.text for row in markup.inline_keyboard for button in row]
    assert labels == ['✏️ Редактировать', '✅ Закрыть', '🤖 Отправить в Codex', '🤖 Сменить Codex']
    assert '✅ Отправить' not in labels

    with pytest.raises(StaleState):
        await service.claim_send(q['id'], rid)

    await service.close_manual_copy(q['id'], rid)
    q = await repo.get_question(q['id'])
    assert q['status'] == 'CLOSED'
    assert q['external_reply_id'] is None
    await db.close()


def test_v2_reference_snapshot_is_exact_and_contains_required_semantics():
    root = Path(__file__).resolve().parents[1]
    files = (
        'CUSTOMER_RECOMMENDATION_COPY_GUIDE.md', 'MARKETPLACE_QUESTION_REPLY_GUIDE.md',
        'PRODUCT_CLASSIFICATION.md', 'RECOMMENDATION_MATRIX.md', 'OZON_PRODUCT_LINKS.md',
        'WILDBERRIES_PRODUCT_LINKS.md',
    )
    for name in files:
        authority = subprocess.check_output(
            ['git', 'show', f'63e117000f75a08d1caa948c2ccba10ac181db65:recommendations/{name}'], cwd=root
        )
        assert (root / 'references' / name).read_bytes() == authority
    text = '\n'.join((root / 'references' / name).read_text() for name in files)
    assert 'KIP_RECOMMENDATION_MATRIX_V2_SALES_WEIGHTED' in text
    assert 'Лиса + мужчина → Чернобог' in text
    assert 'Лиса + женщина → Мара' in text
    assert 'Орёл + мужчина → Перун' in text
    assert 'Орёл + женщина → Звезда Лады' in text
    assert '19.11.1988' in text
    assert '19.11 относится к Чертогу Лебедя' in text
    assert 'если не указан и male/female различаются — обе ветки' in text
    assert 'https://www.ozon.ru/product/1630040194/' in text
    assert 'https://www.ozon.ru/product/2184199958/' in text
    assert 'Печать Велеса — Медвежья лапа' not in text
    assert 'Печать Велеса' in text


def test_shared_customer_answer_prompt_and_validation_limit(tmp_path):
    builder = prompt_builder(tmp_path, 'https://www.ozon.ru/product/1630040194/')
    q = {'marketplace': 'ozon', 'publish_mode': 'MANUAL_COPY', 'question_text': 'q'}
    for marketplace, mode in (('ozon', 'MANUAL_COPY'), ('wildberries', 'MARKETPLACE_API')):
        question = {**q, 'marketplace': marketplace, 'publish_mode': mode}
        prompt = builder.build(question)
        assert 'complete customer-ready marketplace reply' in prompt
        assert 'natural paragraph breaks' in prompt
        assert 'opening context paragraph must not contain a product recommendation' in prompt
        assert 'Separate it from the first recommendation block with exactly one blank line' in prompt
        assert 'each distinct recommendation or audience branch in its own paragraph' in prompt
        assert 'male and female branches in separate paragraphs' in prompt
        assert 'on its own line immediately after the recommendation paragraph it belongs to' in prompt
        assert 'concise marketplace' not in prompt
        assert '256 characters' not in prompt
        assert 'Stay within 4096 characters total' in prompt
        assert builder.validate_output(question, 'x') == 'x'
        assert builder.validate_output(question, 'x' * 4096) == 'x' * 4096
        with pytest.raises(ValueError, match='1..4096'):
            builder.validate_output(question, 'x' * 4097)


def test_validate_output_preserves_customer_paragraph_whitespace_exactly(tmp_path):
    url = 'https://www.ozon.ru/product/1630040194/'
    builder = prompt_builder(tmp_path, url)
    question = {'marketplace': 'ozon', 'publish_mode': 'MANUAL_COPY', 'question_text': 'q'}
    sample = f'Контекст.\n\nМужчине рекомендуем оберег: он подходит по смыслу.\n{url}\n\nЖенщине рекомендуем другой оберег: он подходит по смыслу.\n{url}'
    assert builder.validate_output(question, sample) == sample


@pytest.mark.asyncio
async def test_manual_copy_long_text_keeps_input_context_and_historical_revision_is_safe(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    service = QuestionService(repo, {}, NoTransport())
    await service.begin_ozon_question()
    result = await service.operator_text('q', 8001)
    qid = result['question_id']
    await repo.finish_draft_error(result['claim'][0], 'TEST', 'stop')
    await repo.transition(qid, 'CODEX_RUNNING', 'CODEX_ERROR')
    await service.begin_manual(qid)
    with pytest.raises(ValueError, match='CUSTOMER_ANSWER_TEXT_TOO_LONG'):
        await service.operator_text('x' * 4097, 8002)
    assert (await repo.get_active_text_input_context())['question_id'] == qid
    rid = (await service.operator_text('ok', 8003))['revision_id']
    q = await repo.get_question(qid)
    assert (await repo.get_answer_revision(rid))['text'] == 'ok'
    await db.execute('UPDATE answer_revisions SET text=? WHERE id=?', ('x' * 4097, rid))
    await db.commit()
    assert '📋 Скопировать ответ' not in [b.text for row in OperatorBot('1', service).buttons(q, revision=await repo.get_answer_revision(rid)).inline_keyboard for b in row]
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


@pytest.mark.asyncio
async def test_shared_review_presentation_is_clean_for_all_marketplaces_and_chunks_history(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3')
    await init(db)
    repo = Repository(db)
    service = QuestionService(repo, {}, NoTransport())

    class Wire:
        def __init__(self): self.calls = []
        async def send_message(self, **kwargs):
            self.calls.append(kwargs)
            return SimpleNamespace(message_id=len(self.calls))
    class Message:
        chat_id = 1
        def __init__(self, wire): self.wire = wire
        def get_bot(self): return self.wire

    for marketplace, mode, expected in (
        ('ozon', 'MANUAL_COPY', ['✏️ Редактировать', '✅ Закрыть', '🤖 Отправить в Codex', '🤖 Сменить Codex']),
        ('wildberries', 'MARKETPLACE_API', ['✅ Отправить', '✏️ Редактировать', '🤖 Отправить в Codex', '🚫 Игнорировать', '🤖 Сменить Codex']),
    ):
        q, _ = await repo.insert_question({'marketplace': marketplace, 'external_question_id': f'{marketplace}-review', 'question_text': 'buyer'})
        await db.execute('UPDATE questions SET publish_mode=? WHERE id=?', (mode, q['id']))
        await db.commit()
        await repo.start_manual_input(q['id'])
        text = 'Первый абзац.\n\nВторой абзац.'
        rid = await repo.consume_active_text(text)
        q = await repo.get_question(q['id'])
        wire = Wire()
        await OperatorBot('1', service).deliver_review(Message(wire), q)
        assert len(wire.calls) == 2
        assert wire.calls[1]['text'] == text
        assert wire.calls[0]['reply_markup'] is None
        assert [b.text for row in wire.calls[1]['reply_markup'].inline_keyboard for b in row] == expected
        assert 'ID:' not in wire.calls[1]['text'] and 'Источник:' not in wire.calls[1]['text']

    q, _ = await repo.insert_question({'marketplace': 'ozon', 'external_question_id': 'historical', 'question_text': 'buyer'})
    rid = await repo.create_answer_revision(q['id'], 'manual', 'x' * 4097)
    await repo.set_current_answer_revision(q['id'], rid)
    await repo.transition(q['id'], 'NEW', 'MANUAL_INPUT')
    await repo.transition(q['id'], 'MANUAL_INPUT', 'REVIEW')
    q = await repo.get_question(q['id'])
    wire = Wire()
    await OperatorBot('1', service).deliver_review(Message(wire), q)
    chunks = wire.calls[1:]
    assert ''.join(call['text'] for call in chunks) == 'x' * 4097
    assert all(call['reply_markup'] is None for call in chunks[:-1])
    assert chunks[-1]['reply_markup'] is not None
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
