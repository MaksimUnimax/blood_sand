"""VK Mini App official launch verification and bounded transport helpers."""
from __future__ import annotations
import base64, hashlib, hmac
import re
from urllib.parse import parse_qsl, urlencode

class MiniAppError(ValueError): pass

MAX_LAUNCH_BYTES = 16384
_BASE64URL = re.compile(r"^[A-Za-z0-9_-]+$")

def decode_launch_authorization(value: str | None) -> str:
    """Decode our VKLaunch envelope without retaining or reporting its contents."""
    if not value or not value.startswith("VKLaunch ") or value.count(" ") != 1:
        raise MiniAppError("INVALID_LAUNCH")
    encoded = value[9:]
    if not encoded or len(encoded) > MAX_LAUNCH_BYTES * 2 or not _BASE64URL.fullmatch(encoded):
        raise MiniAppError("INVALID_LAUNCH")
    try:
        raw = base64.urlsafe_b64decode(encoded + "=" * (-len(encoded) % 4))
        if not raw or len(raw) > MAX_LAUNCH_BYTES:
            raise ValueError
        query = raw.decode("utf-8")
    except (ValueError, UnicodeDecodeError):
        raise MiniAppError("INVALID_LAUNCH") from None
    if not query or query.startswith("?"):
        raise MiniAppError("INVALID_LAUNCH")
    return query

def verify_launch(raw: str, protected_key: str, expected_app_id: int) -> dict[str, str]:
    try:
        pairs=parse_qsl(raw, keep_blank_values=True, strict_parsing=True)
    except ValueError as exc:
        raise MiniAppError('INVALID_LAUNCH') from exc
    keys=[k for k,_ in pairs]
    if len(keys)!=len(set(keys)): raise MiniAppError('DUPLICATE_LAUNCH_KEY')
    values=dict(pairs); sign=values.pop('sign',None)
    if not sign: raise MiniAppError('INVALID_LAUNCH')
    if not values.get('vk_app_id') or not values.get('vk_user_id'): raise MiniAppError('INVALID_LAUNCH')
    try:
        if int(values['vk_app_id']) != expected_app_id or int(values['vk_user_id']) <= 0: raise MiniAppError('INVALID_LAUNCH')
    except ValueError as exc: raise MiniAppError('INVALID_LAUNCH') from exc
    data=urlencode(sorted((k,v) for k,v in values.items() if k.startswith('vk_')))
    digest=hmac.new(protected_key.encode(),data.encode(),hashlib.sha256).digest()
    expected=base64.urlsafe_b64encode(digest).decode().rstrip('=')
    if not hmac.compare_digest(expected,sign): raise MiniAppError('INVALID_LAUNCH')
    return values
