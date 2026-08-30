from __future__ import annotations
from datetime import datetime, timedelta, timezone
from .vk_api import VKTransportUnknown, VKProtocolError
import json
RETRYABLE={6,10,36}; PERMANENT={900,901,902,917,936,945,946,950,985,987,988,1012}; AUTH={5,7,15,925,103}; INVALID={8,100,911,914,921,943,944}
def classify(code):
 if code in RETRYABLE:return 'TRANSIENT_RATE_OR_SERVICE'
 if code in PERMANENT:return 'PERMANENT_USER_STATE'
 if code in AUTH:return 'AUTH_CONFIGURATION'
 if code in INVALID:return 'INVALID_REQUEST_OR_CODE_BUG'
 if code in {9,940}:return 'NO_AUTOMATIC_RETRY_BUT_TRANSIENT_OR_THROTTLING'
 return 'UNKNOWN_FAIL_CLOSED'
class OutboxWorker:
 def __init__(self,storage,api,retry_delay_seconds=5):self.storage,self.api,self.delay=storage,api,retry_delay_seconds
 def process_one(self):
  row=self.storage.claim_outbox()
  if not row:return False
  try:
   attachments=json.loads(row['attachment_json']) if row.get('attachment_json') else None
   if attachments:
    result=self.api.messages_send(row['peer_id'],row['message_text'],row['random_id'],row.get('keyboard_json'),attachments)
   elif row.get('keyboard_json') is not None:
    result=self.api.messages_send(row['peer_id'],row['message_text'],row['random_id'],row['keyboard_json'])
   else:
    result=self.api.messages_send(row['peer_id'],row['message_text'],row['random_id'])
  except (VKTransportUnknown, VKProtocolError):
   if row['attempt_count']<2:self.storage.outbox_result(row['outbox_id'],'RETRY_WAIT',klass='TRANSPORT_UNKNOWN',next_at=(datetime.now(timezone.utc)+timedelta(seconds=self.delay)).isoformat())
   else:self.storage.outbox_result(row['outbox_id'],'FAILED_TERMINAL',klass='TRANSPORT_UNKNOWN')
   return True
  if result.error_code is None:self.storage.outbox_result(row['outbox_id'],'SENT',message_id=result.message_id);return True
  code=int(result.error_code); klass=classify(code)
  if code in RETRYABLE and row['attempt_count']<2:self.storage.outbox_result(row['outbox_id'],'RETRY_WAIT',str(code),klass,next_at=(datetime.now(timezone.utc)+timedelta(seconds=self.delay)).isoformat())
  else:self.storage.outbox_result(row['outbox_id'],'FAILED_TERMINAL',str(code),klass)
  return True
