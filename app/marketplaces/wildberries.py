"""Wildberries Feedbacks and Questions API adapter.

This module deliberately has no startup or network side effects.  Token
classification is local-only so daemon activation can fail before contacting WB.
"""
import asyncio
import base64
import json
import time

import httpx


REQUEST_INTERVAL_SECONDS = 0.4
MAX_RATE_LIMIT_WAIT_SECONDS = 30.0


def classify_token(token, now=None):
    """Return only safe, non-identifying WB JWT classification fields."""
    result = {
        'token_present': bool(token), 'acc': None, 'token_type': 'UNKNOWN',
        'for_is_self': 'unknown', 'test_token': 'unknown', 'expired': 'unknown',
        'feedbacks_questions_bit': 'unknown', 'read_only_bit': 'unknown',
        'production_wb_eligible': 'no',
    }
    if not token or not isinstance(token, str):
        return result
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return result
        encoded = parts[1] + '=' * (-len(parts[1]) % 4)
        claims = json.loads(base64.urlsafe_b64decode(encoded.encode('ascii')))
        if not isinstance(claims, dict):
            return result
        acc = claims.get('acc')
        result['acc'] = acc if isinstance(acc, int) else None
        result['token_type'] = {1: 'BASE', 2: 'TEST', 3: 'PERSONAL', 4: 'SERVICE'}.get(result['acc'], 'UNKNOWN')
        if isinstance(claims.get('for'), str):
            result['for_is_self'] = 'yes' if claims['for'] == 'self' else 'no'
        if isinstance(claims.get('t'), bool):
            result['test_token'] = 'yes' if claims['t'] else 'no'
        if isinstance(claims.get('exp'), (int, float)):
            result['expired'] = 'yes' if claims['exp'] <= (time.time() if now is None else now) else 'no'
        permissions = claims.get('s')
        if isinstance(permissions, int):
            result['feedbacks_questions_bit'] = 'enabled' if permissions & (1 << 7) else 'disabled'
            result['read_only_bit'] = 'enabled' if permissions & (1 << 30) else 'disabled'
        if (result['acc'] == 3 and result['for_is_self'] == 'yes'
                and result['test_token'] == 'no' and result['expired'] == 'no'
                and result['feedbacks_questions_bit'] == 'enabled'
                and result['read_only_bit'] == 'disabled'):
            result['production_wb_eligible'] = 'yes'
    except (ValueError, UnicodeDecodeError, json.JSONDecodeError):
        pass
    return result


class WildberriesAdapter:
    base_url = 'https://feedbacks-api.wildberries.ru'

    def __init__(self, client, token='', *, clock=None, sleep=None):
        self.client = client
        self.headers = {'Authorization': 'Bearer ' + token}
        self._clock = clock or time.monotonic
        self._sleep = sleep or asyncio.sleep
        self._request_lock = asyncio.Lock()
        self._last_request_started = None

    @staticmethod
    def normalize_questions(payload):
        if isinstance(payload, list):
            return payload
        if not isinstance(payload, dict):
            return []
        data = payload.get('data')
        if isinstance(data, dict) and isinstance(data.get('questions'), list):
            return data['questions']
        if isinstance(data, list):
            return data
        if isinstance(payload.get('questions'), list):
            return payload['questions']
        return []

    @staticmethod
    def _normalise_question(question):
        if not isinstance(question, dict) or question.get('id') is None:
            return None
        details = question.get('productDetails')
        details = details if isinstance(details, dict) else question
        return {
            'marketplace': 'wildberries',
            'external_question_id': str(question['id']),
            'question_text': question.get('text', ''),
            'question_created_at': question.get('createdDate'),
            'raw_status': question.get('state', question.get('isAnswered')),
            'product_id': details.get('nmId'),
            'product_article': details.get('supplierArticle'),
            'product_title': details.get('productName'),
        }

    async def _pace_locked(self):
        if self._last_request_started is not None:
            delay = self._last_request_started + REQUEST_INTERVAL_SECONDS - self._clock()
            if delay > 0:
                await self._sleep(delay)
        self._last_request_started = self._clock()

    def _retry_delay(self, response):
        raw = response.headers.get('X-Ratelimit-Retry')
        if raw is None:
            raw = response.headers.get('X-Ratelimit-Reset')
        try:
            delay = float(raw)
            # Reset can be an epoch timestamp; convert it when clearly so.
            if delay > 100000000:
                delay = max(0.0, delay - time.time())
        except (TypeError, ValueError):
            delay = 1.0
        return min(MAX_RATE_LIMIT_WAIT_SECONDS, max(REQUEST_INTERVAL_SECONDS, delay))

    async def _request(self, method, path, **kwargs):
        """Serialize category requests and retry one rate-limited response."""
        async with self._request_lock:
            for attempt in range(2):
                await self._pace_locked()
                response = await self.client.request(method, self.base_url + path, headers=self.headers, **kwargs)
                if response.status_code != 429:
                    return response
                if attempt == 1:
                    return response
                await self._sleep(self._retry_delay(response))

    async def fetch_unanswered_questions(self):
        response = await self._request(
            'GET', '/api/v1/questions',
            params={'isAnswered': 'false', 'take': 10000, 'skip': 0, 'order': 'dateDesc'},
        )
        response.raise_for_status()
        return [normalised for row in self.normalize_questions(response.json())
                if (normalised := self._normalise_question(row)) is not None]

    async def send_answer(self, question, text):
        try:
            response = await self._request(
                'PATCH', '/api/v1/questions',
                json={'id': question['external_question_id'], 'text': text, 'state': 'wbRu'},
            )
        except (httpx.TimeoutException, httpx.TransportError):
            return {'status': 'AMBIGUOUS'}
        if 200 <= response.status_code < 300:
            # WB can return an application error in an otherwise successful HTTP
            # response.  HTTP acceptance is never evidence of publication.
            try:
                payload = response.json()
            except ValueError:
                payload = None
            if isinstance(payload, dict) and payload.get('error') is True:
                return {'status': 'CLEAR_FAILURE'}
            return {'status': 'ACCEPTED_UNVERIFIED'}
        if response.status_code >= 500:
            return {'status': 'AMBIGUOUS'}
        return {'status': 'CLEAR_FAILURE'}

    async def inspect_answer(self, question, expected_text):
        """Read the documented question envelope without changing answer text."""
        try:
            response = await self._request('GET', '/api/v1/question', params={'id': question['external_question_id']})
            response.raise_for_status()
            payload = response.json()
        except (httpx.HTTPError, ValueError):
            return 'UNKNOWN'
        data = payload.get('data') if isinstance(payload, dict) else None
        if not isinstance(data, dict):
            return 'UNKNOWN'
        answer = data.get('answer')
        if answer is None:
            return 'ABSENT'
        if not isinstance(answer, dict) or not isinstance(answer.get('text'), str):
            return 'UNKNOWN'
        return 'MATCHED' if answer['text'] == expected_text else 'DIFFERENT'

    async def reconcile_answer(self, question, expected_text, send_started_at):
        """Compatibility wrapper for old callers; new send paths use inspection."""
        return await self.inspect_answer(question, expected_text)
