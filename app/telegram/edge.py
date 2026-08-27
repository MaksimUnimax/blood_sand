"""Operation-aware Telegram mutation policy.

This module intentionally classifies outcomes instead of hiding them behind a
generic retry helper: a lost sendMessage response is not safe to repeat.
"""
import asyncio
from dataclasses import dataclass
from enum import Enum

from telegram.error import BadRequest, Conflict, Forbidden, NetworkError, RetryAfter, TelegramError


class Operation(str, Enum):
    CALLBACK_ACK = 'CALLBACK_ACK'
    UI_EDIT = 'UI_EDIT'
    MESSAGE_CREATE = 'MESSAGE_CREATE'
    POLLING = 'POLLING'


class Outcome(str, Enum):
    SUCCESS = 'SUCCESS'
    DETERMINISTIC_FAILURE = 'DETERMINISTIC_FAILURE'
    PERMISSION_FAILURE = 'PERMISSION_FAILURE'
    RATE_LIMIT_EXHAUSTED = 'RATE_LIMIT_EXHAUSTED'
    AMBIGUOUS_NETWORK_FAILURE = 'AMBIGUOUS_NETWORK_FAILURE'
    TRANSIENT_FAILURE = 'TRANSIENT_FAILURE'
    POLLING_CONFLICT = 'POLLING_CONFLICT'


@dataclass
class Result:
    outcome: Outcome
    value: object = None
    error: Exception | None = None


class TelegramEdge:
    """Bounded policy for a single Telegram API mutation (two attempts total)."""
    max_attempts = 2

    def __init__(self, sleep=asyncio.sleep):
        self.sleep = sleep

    @staticmethod
    def _seconds(value):
        return value.total_seconds() if hasattr(value, 'total_seconds') else float(value)

    async def mutate(self, operation, call):
        attempt = 0
        while True:
            attempt += 1
            try:
                return Result(Outcome.SUCCESS, await call())
            except RetryAfter as exc:
                if attempt >= self.max_attempts:
                    return Result(Outcome.RATE_LIMIT_EXHAUSTED, error=exc)
                await self.sleep(max(0.0, self._seconds(exc.retry_after)))
            except Conflict as exc:
                return Result(Outcome.POLLING_CONFLICT if operation == Operation.POLLING else Outcome.DETERMINISTIC_FAILURE, error=exc)
            except Forbidden as exc:
                return Result(Outcome.PERMISSION_FAILURE, error=exc)
            except BadRequest as exc:
                # PTB has no narrower typed 400 variants. Only this exact API
                # semantic is safe to regard as an idempotent edit success.
                if operation == Operation.UI_EDIT and exc.message.lower() == 'message is not modified':
                    return Result(Outcome.SUCCESS, error=exc)
                return Result(Outcome.DETERMINISTIC_FAILURE, error=exc)
            except NetworkError as exc:
                if operation == Operation.MESSAGE_CREATE:
                    return Result(Outcome.AMBIGUOUS_NETWORK_FAILURE, error=exc)
                if operation in {Operation.CALLBACK_ACK, Operation.UI_EDIT} and attempt < self.max_attempts:
                    continue
                return Result(Outcome.TRANSIENT_FAILURE, error=exc)
            except TelegramError as exc:
                return Result(Outcome.DETERMINISTIC_FAILURE, error=exc)
