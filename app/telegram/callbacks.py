"""Canonical, compact, versioned callback payloads.

The wire format is mqo1 plus URL-safe base64 of a small binary record.  It
keeps all positive SQLite INTEGER ids renderable without making callback_data
depend on decimal-id width.
"""
import base64

MAX_CALLBACK_DATA_BYTES = 64
PROFILES = frozenset({'codex1', 'codex2', 'codex3'})
# Append new actions so existing action codes stay wire-compatible.
_ACTIONS = ('manual', 'codex', 'ignore', 'send', 'edit', 'retry_codex', 'choose_codex', 'confirm_regenerate', 'retry_send', 'close')
_CODE = {action: index + 1 for index, action in enumerate(_ACTIONS)}
_ACTION = {value: key for key, value in _CODE.items()}
# qid, rid, arg.  ``ignore`` has two renderer-emitted contextual forms.
SCHEMA = {
 'manual': ((True, False, None),), 'codex': ((True, False, None), (True, True, None)),
 'ignore': ((True, False, None), (True, True, None)),
 'send': ((True, True, None),), 'edit': ((True, True, None),),
 'retry_codex': ((True, False, None),), 'confirm_regenerate': ((True, False, None),),
 'retry_send': ((True, True, None),), 'close': ((True, True, None),),
 'choose_codex': ((True, False, 'menu'), (True, True, 'menu'), (True, False, 'profile'), (True, True, 'profile')),
}
_ARG_CODE = {None: 0, 'menu': 1, 'codex1': 2, 'codex2': 3, 'codex3': 4}
_ARG = {value: key for key, value in _ARG_CODE.items()}

def _integer(value):
 if not isinstance(value, int) or isinstance(value, bool) or value <= 0 or value > 9223372036854775807: raise ValueError('positive SQLite integer required')
 return value
def _varint(value):
 value=_integer(value); out=bytearray()
 while value > 127: out.append((value & 127) | 128); value >>= 7
 out.append(value); return bytes(out)
def _read_varint(data, offset):
 value=shift=0
 while offset < len(data):
  part=data[offset]; offset+=1; value |= (part & 127) << shift
  if not part & 128:
   if value <= 0 or _varint(value) != data[offset - len(_varint(value)):offset]: raise ValueError()
   return value,offset
  shift += 7
  if shift > 63: break
 raise ValueError()
def _shape(action, qid, rid, arg):
 kind='profile' if arg in PROFILES else arg
 shape=(qid is not None,rid is not None,kind)
 if shape not in SCHEMA[action]: raise ValueError('noncanonical callback fields')

def encode(action, qid=None, rid=None, arg=None):
 if action not in SCHEMA: raise ValueError('action')
 if qid is not None: qid=_integer(qid)
 if rid is not None: rid=_integer(rid)
 _shape(action,qid,rid,arg)
 raw=bytes((_CODE[action], _ARG_CODE[arg])) + (b'\x01'+_varint(qid) if qid is not None else b'\x00') + (b'\x01'+_varint(rid) if rid is not None else b'\x00')
 value='mqo1:'+base64.urlsafe_b64encode(raw).decode('ascii').rstrip('=')
 if not 1 <= len(value.encode('utf-8')) <= MAX_CALLBACK_DATA_BYTES: raise ValueError('callback too long')
 return value

def decode(value):
 try:
  if not isinstance(value,str) or not value.startswith('mqo1:') or len(value.encode('utf-8')) > MAX_CALLBACK_DATA_BYTES: raise ValueError()
  token=value[5:]
  if not token or any(c not in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_' for c in token): raise ValueError()
  raw=base64.urlsafe_b64decode(token + '=' * (-len(token) % 4))
  if len(raw) < 4 or raw[0] not in _ACTION or raw[1] not in _ARG: raise ValueError()
  action,arg=_ACTION[raw[0]],_ARG[raw[1]]; offset=2; fields=[]
  for _ in range(2):
   present=raw[offset]; offset+=1
   if present not in (0,1): raise ValueError()
   if present: field,offset=_read_varint(raw,offset); fields.append(field)
   else: fields.append(None)
  if offset != len(raw): raise ValueError()
  qid,rid=fields; _shape(action,qid,rid,arg)
  return {'action':action,'question_id':qid,'revision_id':rid,'arg':arg}
 except Exception as exc: raise ValueError('malformed callback') from exc
