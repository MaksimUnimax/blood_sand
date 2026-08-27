import pytest

from app.acceptance import BlockedMarketplaceAdapter, CodexDisabled, MarketplaceWritesDisabled, synthetic_questions
from app.daemon import POLLING_KWARGS


def test_t4_synthetic_questions_are_fresh_and_cover_all_scenarios():
    rows = synthetic_questions()
    assert [row['product_article'] for row in rows] == ['T4-MANUAL', 'T4-IGNORE', 'T4-CODEX']
    assert all(row['external_question_id'].startswith('T4-') for row in rows)


@pytest.mark.asyncio
async def test_acceptance_marketplace_boundary_fails_closed_before_any_request():
    counters = {'ozon_write_attempts': 0, 'wildberries_write_attempts': 0}
    for name in ('ozon', 'wildberries'):
        adapter = BlockedMarketplaceAdapter(name, counters)
        with pytest.raises(MarketplaceWritesDisabled): await adapter.send_answer({}, 'no')
        with pytest.raises(MarketplaceWritesDisabled): await adapter.reconcile_answer({}, 'no', None)
    assert counters == {'ozon_write_attempts': 2, 'wildberries_write_attempts': 2}


@pytest.mark.asyncio
async def test_t4_codex_boundary_fails_closed():
    with pytest.raises(RuntimeError, match='physically disabled'):
        await CodexDisabled().run('codex1', 'prompt', 'attempt')


def test_acceptance_reuses_production_polling_contract():
    assert POLLING_KWARGS == {'timeout': 30, 'allowed_updates': ['message', 'callback_query'], 'drop_pending_updates': False}
