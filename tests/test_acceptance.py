import pytest

from app.acceptance import AcceptanceSource, MarketplaceWritesDisabled


@pytest.mark.asyncio
async def test_acceptance_source_is_one_synthetic_question_and_writes_are_disabled():
    source = AcceptanceSource()
    rows = await source.fetch_unanswered_questions()
    assert len(rows) == 1
    assert rows[0]['external_question_id'].startswith('R11A-SYNTHETIC-')
    assert await source.fetch_unanswered_questions() == []
    with pytest.raises(MarketplaceWritesDisabled):
        await source.send_answer({}, 'must not send')
    with pytest.raises(MarketplaceWritesDisabled):
        await source.reconcile_answer({}, 'must not reconcile', None)
