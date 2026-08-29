"""VK Mini App launch verification and narrow calendar API helpers."""
from __future__ import annotations
import base64, hashlib, hmac
from urllib.parse import parse_qsl, urlencode

class MiniAppError(ValueError): pass

def verify_launch(raw: str, protected_key: str, expected_app_id: int) -> dict[str, str]:
    pairs=parse_qsl(raw, keep_blank_values=True, strict_parsing=True)
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
