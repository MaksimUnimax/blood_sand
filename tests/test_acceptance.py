import json

import pytest

from app.acceptance import AcceptanceSource, InteractiveAcceptanceConsumer, MarketplaceWritesDisabled
from app.telegram.callbacks import decode, encode


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


def test_persisted_r11b_card_manual_callback_is_resolvable_without_redelivery():
    """The R11D serve mode can safely reuse R11B's persisted Q-000001 card."""
    assert decode(encode('manual', 1)) == {
        'action': 'manual', 'question_id': 1, 'revision_id': None, 'arg': None,
    }


@pytest.mark.asyncio
async def test_interactive_consumer_survives_empty_poll_and_dispatches_later_callback(tmp_path):
    polls = iter([False, False, True])
    ticks = [0]
    async def poll_once(): return next(polls)
    async def yield_and_advance(_): ticks[0] += 1
    consumer = InteractiveAcceptanceConsumer(poll_once, tmp_path / 'evidence.json',
        clock=lambda: ticks[0], sleep=yield_and_advance)
    payload = {}
    assert await consumer.run(payload) == 'callback_received'
    assert consumer.armed is False
    assert json.loads((tmp_path / 'evidence.json').read_text())['consumer_exit_reason'] == 'callback_received'


@pytest.mark.asyncio
async def test_interactive_consumer_expires_cleanly_and_never_arms_after_death(tmp_path):
    ticks = [0]
    async def poll_once(): return False
    async def yield_and_advance(_): ticks[0] = 901
    consumer = InteractiveAcceptanceConsumer(poll_once, tmp_path / 'evidence.json',
        clock=lambda: ticks[0], sleep=yield_and_advance)
    assert await consumer.run({}) == 'deadline_expired'
    saved = json.loads((tmp_path / 'evidence.json').read_text())
    assert saved['consumer_alive'] is False
    assert saved['consumer_exit_reason'] == 'deadline_expired'
    assert consumer.armed is False
