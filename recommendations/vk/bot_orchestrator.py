from __future__ import annotations
from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from .bot_parser import is_restart, parse_dates, parse_gender, parse_keyboard_payload
from .keyboard import gender_keyboard, restart_keyboard
from .presenter import DATE_CORRECTION, DATE_PROMPT, GENDER_PROMPT, present
class BotOrchestrator:
 def __init__(self,storage,service:RecommendationApplicationService): self.storage,self.service=storage,service
 def process(self,event_id,event):
  if event.event_type!='message_new' or event.peer_id is None: return 'IGNORED'
  old=self.storage.session(event.group_id,event.peer_id); state=old['state'] if old else 'START'; text=event.text or ''
  present_payload = event.payload is not None
  action = parse_keyboard_payload(event.payload, text) if present_payload else None
  if state=='RESOLVED' and ((action == ('restart', None)) if present_payload else is_restart(text)):
   self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_DATE',{'birth_day':None,'birth_month':None,'birth_year':None,'gender':None,'last_result_id':None},DATE_PROMPT);return 'PROCESSED'
  if state in {'START','WAITING_DATE'}:
   dates=parse_dates(text)
   if len(dates)==1:
    d=dates[0];self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{'birth_day':d.day,'birth_month':d.month,'birth_year':d.year,'gender':None},GENDER_PROMPT,gender_keyboard())
   else:self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_DATE',{},DATE_PROMPT if state=='START' else DATE_CORRECTION)
   return 'PROCESSED'
  if state=='WAITING_GENDER':
   gender = action[1] if present_payload and action and action[0] == 'gender' else (parse_gender(text) if not present_payload else None)
   if not gender:self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{},GENDER_PROMPT,gender_keyboard());return 'PROCESSED'
   result=self.service.resolve(ApplicationRecommendationInput(old['birth_day'],old['birth_month'],gender,old['birth_year'],old['marketplace']))
   self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'RESOLVED',{'gender':gender,'last_result_id':result.result_id},present(result.semantic_result),restart_keyboard());return 'PROCESSED'
  return 'IGNORED'
