from types import SimpleNamespace

import pytest

from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.telegram.bot import CHECK_QUESTIONS_BUTTON, OZON_BUTTON, OperatorBot


class WB:
    def __init__(self, rows): self.rows, self.calls = rows, 0
    async def fetch_unanswered_questions(self): self.calls += 1; return self.rows


def raw(identifier):
    return {'marketplace': 'wildberries', 'external_question_id': identifier, 'question_text': f'q {identifier}'}


@pytest.fixture
async def repo(tmp_path):
    db = await connect(tmp_path / 'state.sqlite3'); await init(db)
    yield Repository(db)
    await db.close()


@pytest.mark.asyncio
async def test_force_check_fetches_all_and_does_not_filter_existing_new(repo):
    old, _ = await repo.insert_question(raw('old'))
    wb = WB([raw('old'), raw('new')])
    rows = await QuestionService(repo, {'wildberries': wb}, None).check_wildberries_unanswered()
    assert wb.calls == 1
    assert [q['external_question_id'] for q in rows] == ['old', 'new']
    assert (await repo.get_question(old['id']))['id'] == old['id']
    count = await (await repo.db.execute("SELECT count(*) FROM questions")).fetchone()
    assert count[0] == 2


@pytest.mark.asyncio
async def test_force_check_recovers_terminal_without_new_revision(repo):
    q, _ = await repo.insert_question(raw('sent'))
    await repo.db.execute("UPDATE questions SET status='SENT',sent_at='x',external_reply_id='reply' WHERE id=?", (q['id'],)); await repo.db.commit()
    rows = await QuestionService(repo, {'wildberries': WB([raw('sent')])}, None).check_wildberries_unanswered()
    assert rows[0]['status'] == 'NEW'
    assert rows[0]['sent_at'] is None and rows[0]['external_reply_id'] is None
    assert (await (await repo.db.execute('SELECT count(*) FROM answer_revisions')).fetchone())[0] == 0


@pytest.mark.asyncio
async def test_force_check_recovers_terminal_to_review_when_revision_exists(repo):
    q, _ = await repo.insert_question(raw('ignored'))
    rid = await repo.create_answer_revision(q['id'], 'manual', 'draft')
    await repo.set_current_answer_revision(q['id'], rid)
    await repo.db.execute("UPDATE questions SET status='IGNORED' WHERE id=?", (q['id'],)); await repo.db.commit()
    rows = await QuestionService(repo, {'wildberries': WB([raw('ignored')])}, None).check_wildberries_unanswered()
    assert rows[0]['status'] == 'REVIEW' and rows[0]['current_answer_revision_id'] == rid
    assert (await (await repo.db.execute('SELECT count(*) FROM answer_revisions')).fetchone())[0] == 1


def test_persistent_menu_has_only_operator_actions_and_no_old_publication_button():
    menu = OperatorBot.main_menu()
    assert [[button.text for button in row] for row in menu.keyboard] == [[OZON_BUTTON], [CHECK_QUESTIONS_BUTTON]]
    assert '🔎 Проверить публикацию' not in str(menu.to_dict())

