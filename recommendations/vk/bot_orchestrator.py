from __future__ import annotations
from calendar import monthrange
from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from recommendations.core import validate_birth_date, RecommendationInputError
from .bot_parser import is_restart, menu_text_action, parse_dates, parse_gender, parse_keyboard_payload
from .keyboard import days_keyboard, day_tail_keyboard, gender_keyboard, main_menu_keyboard, months_keyboard, year_ranges_keyboard, years_keyboard
from .presenter import DATE_CORRECTION, GENDER_PROMPT, present

HUMAN_HANDOFF_ACK = "Напишите ваш вопрос сообщением — вам ответит человек."
ROUTING_PROMPT = "Выберите, что хотите сделать:"
DATE_PROMPT = "Выберите период года рождения\nили введите дату в формате ДД.ММ.ГГГГ."
PICKER_PROMPTS = {"YEAR_RANGE": DATE_PROMPT, "YEAR": "Выберите год рождения.", "MONTH": "Выберите месяц рождения.", "DAY": "Выберите день рождения.", "DAY_TAIL": "Выберите день рождения."}

class BotOrchestrator:
 def __init__(self, storage, service: RecommendationApplicationService, miniapp_config=None): self.storage,self.service=storage,service
 def _today(self): return self.storage.clock().date()
 def _last_day(self, row):
  last = monthrange(row['birth_year'], row['birth_month'])[1]
  today = self._today()
  return min(last, today.day) if (row['birth_year'], row['birth_month']) == (today.year, today.month) else last
 def _keyboard(self, step, row=None):
  today=self._today()
  if step == 'YEAR_RANGE': return year_ranges_keyboard(today.year)
  if step == 'YEAR': return years_keyboard(row['date_picker_range_start'], row['date_picker_range_end'])
  if step == 'MONTH': return months_keyboard(today.month if row['birth_year'] == today.year else 12)
  if step == 'DAY': return days_keyboard(self._last_day(row))
  return day_tail_keyboard(self._last_day(row))
 def _prompt(self,event_id,event,step,fields,kind='date_picker'):
  # Use a provisional merged view for keyboards derived from the selected fields.
  old=self.storage.session(event.group_id,event.peer_id); row=dict(old) if old else {}; row.update(fields)
  fields={**fields,'date_picker_step':step}
  self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_DATE',fields,PICKER_PROMPTS[step],self._keyboard(step,row),kind)
 def _resend(self,event_id,event,old):
  step=old['date_picker_step'] or 'YEAR_RANGE'
  self._prompt(event_id,event,step,{},'date_picker_stale')
 def _finish_date(self,event_id,event,old,day):
  try: validate_birth_date(day, old['birth_month'], old['birth_year'])
  except RecommendationInputError: self._resend(event_id,event,old); return
  today=self._today()
  if (old['birth_year'],old['birth_month'],day) > (today.year,today.month,today.day): self._resend(event_id,event,old); return
  self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{'birth_day':day,'gender':None,'date_picker_step':None,'date_picker_range_start':None,'date_picker_range_end':None},GENDER_PROMPT,gender_keyboard(),'date_picker_complete')
 def _date_action(self,event_id,event,old,value):
  step=old['date_picker_step'] or 'YEAR_RANGE'
  if value['step'] == 'back':
   expected={'YEAR':'year_range','MONTH':'year','DAY':'month','DAY_TAIL':'day'}.get(step)
   if value['to'] != expected: self._resend(event_id,event,old); return
   if step=='YEAR': self._prompt(event_id,event,'YEAR_RANGE',{'birth_day':None,'birth_month':None,'birth_year':None,'date_picker_range_start':None,'date_picker_range_end':None}); return
   if step=='MONTH': self._prompt(event_id,event,'YEAR',{'birth_day':None,'birth_month':None,'birth_year':None}); return
   if step=='DAY': self._prompt(event_id,event,'MONTH',{'birth_day':None,'birth_month':None}); return
   self._prompt(event_id,event,'DAY',{'birth_day':None}); return
  if step == 'YEAR_RANGE' and value['step'] == 'year_range':
   allowed=[]; y=self._today().year
   allowed.append((1900,1919)); allowed += [(a,min(a+9,y)) for a in range(1920,y+1,10) if a<=y]
   if (value['start'],value['end']) in allowed: self._prompt(event_id,event,'YEAR',{'date_picker_range_start':value['start'],'date_picker_range_end':value['end'],'birth_day':None,'birth_month':None,'birth_year':None}); return
  elif step == 'YEAR' and value['step'] == 'year' and old['date_picker_range_start'] <= value['value'] <= old['date_picker_range_end'] and value['value'] <= self._today().year:
   self._prompt(event_id,event,'MONTH',{'birth_year':value['value'],'birth_month':None,'birth_day':None}); return
  elif step == 'MONTH' and value['step'] == 'month' and 1 <= value['value'] <= 12 and not (old['birth_year'] == self._today().year and value['value'] > self._today().month):
   self._prompt(event_id,event,'DAY',{'birth_month':value['value'],'birth_day':None}); return
  elif step == 'DAY' and value['step'] == 'day' and 1 <= value['value'] <= min(20,self._last_day(old)):
   self._finish_date(event_id,event,old,value['value']); return
  elif step == 'DAY' and value['step'] == 'day_tail' and value['last'] == self._last_day(old) and value['last'] > 20:
   self._prompt(event_id,event,'DAY_TAIL',{'birth_day':None}); return
  elif step == 'DAY_TAIL' and value['step'] == 'day_tail' and 21 <= value['value'] <= self._last_day(old):
   self._finish_date(event_id,event,old,value['value']); return
  self._resend(event_id,event,old)
 def process(self,event_id,event):
  if event.event_type!='message_new' or event.peer_id is None: return 'IGNORED'
  old=self.storage.session(event.group_id,event.peer_id); state=old['state'] if old else 'START'; text=event.text or ''; present_payload=event.payload is not None
  action=parse_keyboard_payload(event.payload,text) if present_payload else None
  if not present_payload:
   action=menu_text_action(text)
   if action is None and is_restart(text): action=('restart',None)
  clear={'birth_day':None,'birth_month':None,'birth_year':None,'gender':None,'last_result_id':None,'date_picker_step':'YEAR_RANGE','date_picker_range_start':None,'date_picker_range_end':None}
  if action == ('menu','recommend') or action == ('restart',None): self._prompt(event_id,event,'YEAR_RANGE',clear); return 'PROCESSED'
  if action == ('menu','human'):
   if state != 'HUMAN_HANDOFF': self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'HUMAN_HANDOFF',{**clear,'date_picker_step':None},HUMAN_HANDOFF_ACK,main_menu_keyboard())
   return 'PROCESSED'
  if state=='HUMAN_HANDOFF': return 'PROCESSED'
  if state=='START': self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'START',{},ROUTING_PROMPT,main_menu_keyboard()); return 'PROCESSED'
  if state=='WAITING_DATE':
   if present_payload:
    if action and action[0]=='date': self._date_action(event_id,event,old,action[1])
    else: self._resend(event_id,event,old)
   else:
    dates=parse_dates(text)
    if len(dates)==1:
     d=dates[0]; self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{'birth_day':d.day,'birth_month':d.month,'birth_year':d.year,'gender':None,'date_picker_step':None,'date_picker_range_start':None,'date_picker_range_end':None},GENDER_PROMPT,gender_keyboard(),'typed_date')
    else: self._resend(event_id,event,old)
   return 'PROCESSED'
  if state=='WAITING_GENDER':
   gender=action[1] if present_payload and action and action[0]=='gender' else (parse_gender(text) if not present_payload else None)
   if not gender: self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'WAITING_GENDER',{},GENDER_PROMPT,gender_keyboard()); return 'PROCESSED'
   result=self.service.resolve(ApplicationRecommendationInput(old['birth_day'],old['birth_month'],gender,old['birth_year'],old['marketplace']))
   self.storage.transition_and_enqueue(event_id,event.group_id,event.peer_id,'RESOLVED',{'gender':gender,'last_result_id':result.result_id},present(result.semantic_result),main_menu_keyboard()); return 'PROCESSED'
  return 'IGNORED'
