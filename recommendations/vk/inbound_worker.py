from __future__ import annotations
import json
from .normalization import normalize_callback, VKNormalizationError
class InboundWorker:
 def __init__(self,storage,orchestrator): self.storage,self.orchestrator=storage,orchestrator
 def process_one(self):
  row=self.storage.claim_event()
  if not row:return False
  try:
   event=normalize_callback(json.loads(row['raw_payload_json'])); status=self.orchestrator.process(row['id'],event);self.storage.finish_event(row['id'],status,event.as_dict());return True
  except (ValueError,VKNormalizationError) as exc:self.storage.finish_event(row['id'],'FAILED',error='normalization_or_input_error');return True
