import base64
import json
from pathlib import Path

import httpx
import pytest

from app.marketplaces.wildberries import REQUEST_INTERVAL_SECONDS, WildberriesAdapter, classify_token


class FakeTime:
    def __init__(self): self.value = 0; self.sleeps = []
    def clock(self): return self.value
    async def sleep(self, delay): self.sleeps.append(delay); self.value += delay


def documented_question(**extra):
    row = {'id': 'x', 'text': 'q', 'createdDate': '2026-01-01', 'state': 'new',
           'productDetails': {'nmId': 7, 'supplierArticle': 'a', 'productName': 'name'}}
    row.update(extra)
    return row


@pytest.mark.asyncio
async def test_documented_envelope_product_details_and_single_poll_request():
    seen = []
    async def handler(request):
        seen.append(request)
        return httpx.Response(200, json={'data': {'questions': [documented_question()]}})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        rows = await WildberriesAdapter(client, 'token').fetch_unanswered_questions()
    assert rows == [{'marketplace': 'wildberries', 'external_question_id': 'x', 'question_text': 'q',
                     'question_created_at': '2026-01-01', 'raw_status': 'new', 'product_id': 7,
                     'product_article': 'a', 'product_title': 'name'}]
    assert len(seen) == 1
    assert dict(seen[0].url.params) == {'isAnswered': 'false', 'take': '10000', 'skip': '0', 'order': 'dateDesc'}


@pytest.mark.asyncio
async def test_historical_top_level_list_and_legacy_product_fields():
    async def handler(request): return httpx.Response(200, json=[{'id': 'x', 'nmId': 7, 'text': 'q'}])
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        rows = await WildberriesAdapter(client, 'token').fetch_unanswered_questions()
    assert rows[0]['product_id'] == 7 and rows[0]['product_article'] is None


@pytest.mark.asyncio
async def test_shared_pacing_serializes_requests():
    fake = FakeTime()
    async def handler(request): return httpx.Response(200, json={'data': {'questions': []}})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        adapter = WildberriesAdapter(client, 'token', clock=fake.clock, sleep=fake.sleep)
        await adapter.fetch_unanswered_questions()
        await adapter.fetch_unanswered_questions()
    assert fake.sleeps == [REQUEST_INTERVAL_SECONDS]


@pytest.mark.asyncio
async def test_429_retries_once_with_retry_header_and_no_third_request():
    fake, calls = FakeTime(), []
    async def handler(request):
        calls.append(request)
        return httpx.Response(429, headers={'x-ratelimit-retry': '2'}) if len(calls) <= 2 else httpx.Response(200, json={})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await WildberriesAdapter(client, 'token', clock=fake.clock, sleep=fake.sleep).send_answer({'external_question_id': 'x'}, 'answer')
    assert result['status'] == 'CLEAR_FAILURE' and len(calls) == 2 and 2 in fake.sleeps


@pytest.mark.asyncio
async def test_429_missing_header_uses_bounded_fallback_then_one_retry():
    fake, calls = FakeTime(), []
    async def handler(request):
        calls.append(request)
        return httpx.Response(429) if len(calls) == 1 else httpx.Response(200, json={})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await WildberriesAdapter(client, 'token', clock=fake.clock, sleep=fake.sleep).send_answer({'external_question_id': 'x'}, 'answer')
    assert result['status'] == 'ACCEPTED_UNVERIFIED' and len(calls) == 2 and all(delay <= 30 for delay in fake.sleeps)


@pytest.mark.asyncio
@pytest.mark.parametrize('response,status', [(httpx.Response(400), 'CLEAR_FAILURE'), (httpx.Response(500), 'AMBIGUOUS'), (httpx.Response(200, json={'error': True}), 'CLEAR_FAILURE'), (httpx.Response(200, json={}), 'ACCEPTED_UNVERIFIED')])
async def test_write_status_semantics_and_exact_payload(response, status):
    seen = []
    async def handler(request): seen.append(request); return response
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await WildberriesAdapter(client, 'token').send_answer({'external_question_id': 'x'}, ' exact ')
    payload = json.loads(seen[0].content)
    assert result['status'] == status
    assert payload == {'id': 'x', 'answer': {'text': ' exact '}, 'state': 'wbRu'}
    assert 'text' not in payload and payload['answer']['text'] == ' exact '
    assert payload['state'] == 'wbRu'


@pytest.mark.asyncio
async def test_timeout_is_ambiguous_and_not_retried():
    calls = []
    async def handler(request): calls.append(request); raise httpx.ReadTimeout('timeout')
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await WildberriesAdapter(client, 'token').send_answer({'external_question_id': 'x'}, 'a')
    assert result['status'] == 'AMBIGUOUS' and len(calls) == 1


def test_public_product_card_answer_path_has_no_private_or_buyer_chat_send():
    source = Path(__file__).parents[1].joinpath('app/marketplaces/wildberries.py').read_text()
    assert "'PATCH', '/api/v1/questions'" in source
    assert "'answer': {'text': text}" in source
    assert "'state': 'wbRu'" in source
    assert "'state': 'none'" not in source
    assert '/seller/message' not in source


@pytest.mark.asyncio
@pytest.mark.parametrize('answer,expected,outcome', [
    ({'text': ' exact '}, ' exact ', 'MATCHED'), ({'text': 'other'}, ' exact ', 'DIFFERENT'), (None, 'x', 'ABSENT')])
async def test_inspect_documented_data_answer_text(answer, expected, outcome):
    async def handler(request): return httpx.Response(200, json={'data': {'answer': answer}})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        result = await WildberriesAdapter(client, 'token').inspect_answer({'external_question_id': 'x'}, expected)
    assert result == outcome


@pytest.mark.asyncio
async def test_inspect_malformed_envelope_is_unknown():
    async def handler(request): return httpx.Response(200, json={'answer': None})
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
        assert await WildberriesAdapter(client, 'token').inspect_answer({'external_question_id': 'x'}, 'x') == 'UNKNOWN'


def jwt(claims):
    payload = base64.urlsafe_b64encode(json.dumps(claims).encode()).decode().rstrip('=')
    return 'header.' + payload + '.signature'


@pytest.mark.parametrize('claims,eligible', [
    ({'acc': 3, 'for': 'self', 't': False, 'exp': 2, 's': 1 << 7}, 'yes'),
    ({'acc': 1, 'for': 'self', 't': False, 'exp': 2, 's': 1 << 7}, 'no'),
    ({'acc': 3, 'for': 'self', 't': False, 'exp': 2, 's': 0}, 'no'),
    ({'acc': 3, 'for': 'self', 't': False, 'exp': 2, 's': (1 << 7) | (1 << 30)}, 'no'),
    ({'acc': 3, 'for': 'self', 't': False, 'exp': 0, 's': 1 << 7}, 'no'),
])
def test_local_jwt_classifier(claims, eligible):
    assert classify_token(jwt(claims), now=1)['production_wb_eligible'] == eligible


def test_malformed_token_fails_closed():
    assert classify_token('not-a-jwt')['production_wb_eligible'] == 'no'
