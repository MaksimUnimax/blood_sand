import base64
VALID={'manual','codex','ignore','send','edit','regenerate','retry_codex','choose_codex','cancel_input','retry_send'}
def encode(action,qid=None,rid=None,arg=None):
 if action not in VALID: raise ValueError('action')
 return 'mqo:'+base64.urlsafe_b64encode(f'{action}|{qid or ""}|{rid or ""}|{arg or ""}'.encode()).decode().rstrip('=')
def decode(s):
 try:
  if not s.startswith('mqo:'): raise ValueError()
  a,q,r,x=base64.urlsafe_b64decode(s[4:]+'===').decode().split('|')
  if a not in VALID: raise ValueError()
  return {'action':a,'question_id':int(q) if q else None,'revision_id':int(r) if r else None,'arg':x or None}
 except Exception: raise ValueError('malformed callback')
