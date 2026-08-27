import base64
"""Small, versioned callback payloads. Never put customer text in callback_data."""
import base64

VALID={'manual','codex','ignore','send','edit','regenerate','retry_codex','choose_codex','cancel_input','retry_send'}
def encode(action,qid=None,rid=None,arg=None):
 if action not in VALID: raise ValueError('action')
 value='mqo1:'+base64.urlsafe_b64encode(f'{action}|{qid or ""}|{rid or ""}|{arg or ""}'.encode('utf-8')).decode().rstrip('=')
 if not 1 <= len(value.encode('utf-8')) <= 64: raise ValueError('callback too long')
 return value
def decode(s):
 try:
  if not isinstance(s,str) or not s.startswith('mqo1:') or len(s.encode('utf-8'))>64: raise ValueError()
  a,q,r,x=base64.urlsafe_b64decode(s[5:]+'===').decode('utf-8').split('|')
  if a not in VALID: raise ValueError()
  return {'action':a,'question_id':int(q) if q else None,'revision_id':int(r) if r else None,'arg':x or None}
 except Exception: raise ValueError('malformed callback')
