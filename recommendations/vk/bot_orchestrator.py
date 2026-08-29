from __future__ import annotations
from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from .bot_parser import is_restart, menu_text_action, parse_dates, parse_gender, parse_keyboard_payload
from .keyboard import gender_keyboard, main_menu_keyboard
from .config import VKMiniAppConfig
from .presenter import DATE_CORRECTION, DATE_PROMPT, GENDER_PROMPT, present
HUMAN_HANDOFF_ACK = "Напишите ваш вопрос сообщением — вам ответит человек."
ROUTING_PROMPT = "Выберите, что хотите сделать:"

class BotOrchestrator:
 def __init__(self,storage,service:RecommendationApplicationService,miniapp_config=None): self.storage,self.service,self.miniapp_config=storage,service,miniapp_config or VKMiniAppConfig()
 def _date_prompt(self,event_id,event,fields,text):
  config=self.miniapp_config
  if config.enabled and event.from_id is not None:
   self.storage.transition_and_enqueue_calendar(event_id,event.group_id,event.peer_id,event.from_id,fields,text,app_id=config.app_id,owner_id=config.owner_id,ttl=config.handoff_ttl_seconds)
  else:self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_DATE',fields,text)
 def process(self,event_id,event):
  if event.event_type!='message_new' or event.peer_id is None: return 'IGNORED'
  old=self.storage.session(event.group_id,event.peer_id); state=old['state'] if old else 'START'; text=event.text or ''
  present_payload = event.payload is not None
  action = parse_keyboard_payload(event.payload, text) if present_payload else None
  # Payload-bearing messages are fail-closed: an invalid payload never falls
  # back to user-controlled text.  Menu actions are global, before flow input.
  if not present_payload:
   action = menu_text_action(text)
   if action is None and is_restart(text): action = ('restart', None)
  if action == ('menu', 'recommend') or action == ('restart', None):
   self._date_prompt(event_id,event,{'birth_day':None,'birth_month':None,'birth_year':None,'gender':None,'last_result_id':None},DATE_PROMPT);return 'PROCESSED'
  if action == ('menu', 'human'):
   if state == 'HUMAN_HANDOFF': return 'PROCESSED'
   self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'HUMAN_HANDOFF',{'birth_day':None,'birth_month':None,'birth_year':None,'gender':None,'last_result_id':None},HUMAN_HANDOFF_ACK,main_menu_keyboard());return 'PROCESSED'
  if state == 'HUMAN_HANDOFF': return 'PROCESSED'
  if state=='START':
   self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'START',{},ROUTING_PROMPT,main_menu_keyboard());return 'PROCESSED'
  if state=='WAITING_DATE':
   dates=parse_dates(text)
   if len(dates)==1:
    d=dates[0];self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{'birth_day':d.day,'birth_month':d.month,'birth_year':d.year,'gender':None},GENDER_PROMPT,gender_keyboard())
   else:self._date_prompt(event_id,event,{},DATE_PROMPT if state=='START' else DATE_CORRECTION)
   return 'PROCESSED'
  if state=='WAITING_GENDER':
   gender = action[1] if present_payload and action and action[0] == 'gender' else (parse_gender(text) if not present_payload else None)
   if not gender:self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{},GENDER_PROMPT,gender_keyboard());return 'PROCESSED'
   result=self.service.resolve(ApplicationRecommendationInput(old['birth_day'],old['birth_month'],gender,old['birth_year'],old['marketplace']))
   self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'RESOLVED',{'gender':gender,'last_result_id':result.result_id},present(result.semantic_result),main_menu_keyboard());return 'PROCESSED'
  return 'IGNORED'
