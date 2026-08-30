from __future__ import annotations
from calendar import monthrange
from recommendations.application import ApplicationRecommendationInput, RecommendationApplicationService
from recommendations.core import validate_birth_date, RecommendationInputError
from .bot_parser import is_restart, menu_text_action, parse_dates, parse_gender, parse_keyboard_payload
from .keyboard import day_bands_keyboard, days_keyboard, gender_keyboard, main_menu_keyboard, months_keyboard, year_ranges, year_ranges_keyboard, years_keyboard
from .presenter import DATE_CORRECTION, GENDER_PROMPT, present

HUMAN_HANDOFF_ACK="Напишите ваш вопрос сообщением — вам ответит человек."
ROUTING_PROMPT="Выберите, что хотите сделать:"
DATE_PROMPT="Выберите период года рождения\nили введите дату в формате ДД.ММ.ГГГГ."
PICKER_PROMPTS={"YEAR_RANGE":DATE_PROMPT,"YEAR":"Выберите год рождения.","MONTH":"Выберите месяц рождения.","DAY_BAND":"Выберите диапазон дня рождения.","DAY":"Выберите день рождения."}

class BotOrchestrator:
 def __init__(self,storage,service:RecommendationApplicationService,miniapp_config=None): self.storage,self.service=storage,service
 def _today(self): return self.storage.clock().date()
 def _last_day(self,row):
  last=monthrange(row['birth_year'],row['birth_month'])[1]; today=self._today()
  return min(last,today.day) if (row['birth_year'],row['birth_month'])==(today.year,today.month) else last
 def _keyboard(self,step,row):
  today=self._today(); page=row.get('date_picker_page') or 0
  if step=='YEAR_RANGE': return year_ranges_keyboard(today.year,page)
  if step=='YEAR': return years_keyboard(row['date_picker_range_start'],row['date_picker_range_end'])
  if step=='MONTH': return months_keyboard(today.month if row['birth_year']==today.year else 12,page)
  if step=='DAY_BAND': return day_bands_keyboard(self._last_day(row))
  return days_keyboard(row['date_picker_day_start'],row['date_picker_day_end'])
 def _prompt(self,eid,event,step,fields,kind='date_picker'):
  old=self.storage.session(event.group_id,event.peer_id); row=dict(old) if old else {}; row.update(fields); fields={**fields,'date_picker_step':step}
  self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'WAITING_DATE',fields,PICKER_PROMPTS[step],self._keyboard(step,row),kind)
 def _resend(self,eid,event,old): self._prompt(eid,event,old['date_picker_step'] or 'YEAR_RANGE',{},'date_picker_stale')
 def _finish(self,eid,event,old,day):
  try: validate_birth_date(day,old['birth_month'],old['birth_year'])
  except RecommendationInputError: self._resend(eid,event,old); return
  if (old['birth_year'],old['birth_month'],day)>tuple(self._today().timetuple()[:3]): self._resend(eid,event,old); return
  self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'WAITING_GENDER',{'birth_day':day,'gender':None,'date_picker_step':None,'date_picker_page':None,'date_picker_range_start':None,'date_picker_range_end':None,'date_picker_day_start':None,'date_picker_day_end':None},GENDER_PROMPT,gender_keyboard(),'date_picker_complete')
 def _date(self,eid,event,old,v):
  step=old['date_picker_step'] or 'YEAR_RANGE'; today=self._today()
  if step=='YEAR_RANGE' and v['step']=='year_range_page' and v['page'] in (0,1): self._prompt(eid,event,'YEAR_RANGE',{'date_picker_page':v['page']}); return
  if step=='YEAR_RANGE' and v['step']=='year_range' and (v['start'],v['end']) in year_ranges(today.year): self._prompt(eid,event,'YEAR',{'date_picker_range_start':v['start'],'date_picker_range_end':v['end'],'date_picker_page':None,'birth_year':None,'birth_month':None,'birth_day':None}); return
  if step=='YEAR' and v['step']=='year' and old['date_picker_range_start']<=v['value']<=old['date_picker_range_end'] and v['value']<=today.year: self._prompt(eid,event,'MONTH',{'birth_year':v['value'],'birth_month':None,'birth_day':None,'date_picker_page':0}); return
  if step=='MONTH' and v['step']=='month_page' and v['page'] in (0,1) and (v['page']==0 or not(old['birth_year']==today.year and today.month<=6)): self._prompt(eid,event,'MONTH',{'date_picker_page':v['page']}); return
  if step=='MONTH' and v['step']=='month' and 1<=v['value']<=12 and not(old['birth_year']==today.year and v['value']>today.month): self._prompt(eid,event,'DAY_BAND',{'birth_month':v['value'],'birth_day':None,'date_picker_page':None}); return
  if step=='DAY_BAND' and v['step']=='day_band' and v['start'] in (1,11,21) and v['end']==min(v['start']+9,self._last_day(old)): self._prompt(eid,event,'DAY',{'date_picker_day_start':v['start'],'date_picker_day_end':v['end']}); return
  if step=='DAY_BAND' and v['step']=='day' and v['value']==31 and self._last_day(old)==31: self._finish(eid,event,old,31); return
  if step=='DAY' and v['step']=='day' and old['date_picker_day_start']<=v['value']<=old['date_picker_day_end']: self._finish(eid,event,old,v['value']); return
  self._resend(eid,event,old)
 def process(self,eid,event):
  if event.event_type!='message_new' or event.peer_id is None:return 'IGNORED'
  old=self.storage.session(event.group_id,event.peer_id); state=old['state'] if old else 'START'; text=event.text or ''; present_payload=event.payload is not None; action=parse_keyboard_payload(event.payload,text) if present_payload else menu_text_action(text) or (('restart',None) if is_restart(text) else None)
  clear={'birth_day':None,'birth_month':None,'birth_year':None,'gender':None,'last_result_id':None,'date_picker_step':'YEAR_RANGE','date_picker_page':0,'date_picker_range_start':None,'date_picker_range_end':None,'date_picker_day_start':None,'date_picker_day_end':None}
  if action in (('menu','recommend'),('restart',None)): self._prompt(eid,event,'YEAR_RANGE',clear);return 'PROCESSED'
  if action==('menu','human'):
   if state!='HUMAN_HANDOFF': self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'HUMAN_HANDOFF',{**clear,'date_picker_step':None},HUMAN_HANDOFF_ACK,main_menu_keyboard())
   return 'PROCESSED'
  if state=='HUMAN_HANDOFF': return 'PROCESSED'
  if state=='START': self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'START',{},ROUTING_PROMPT,main_menu_keyboard());return 'PROCESSED'
  if state=='WAITING_DATE':
   if present_payload:
    if action and action[0]=='date': self._date(eid,event,old,action[1])
    else:self._resend(eid,event,old)
   else:
    dates=parse_dates(text)
    if len(dates)==1:
     d=dates[0];self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'WAITING_GENDER',{'birth_day':d.day,'birth_month':d.month,'birth_year':d.year,'gender':None,'date_picker_step':None,'date_picker_page':None,'date_picker_range_start':None,'date_picker_range_end':None,'date_picker_day_start':None,'date_picker_day_end':None},GENDER_PROMPT,gender_keyboard(),'typed_date')
    else:self._resend(eid,event,old)
   return 'PROCESSED'
  if state=='WAITING_GENDER':
   gender=action[1] if present_payload and action and action[0]=='gender' else (parse_gender(text) if not present_payload else None)
   if not gender:self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'WAITING_GENDER',{},GENDER_PROMPT,gender_keyboard());return 'PROCESSED'
   result=self.service.resolve(ApplicationRecommendationInput(old['birth_day'],old['birth_month'],gender,old['birth_year'],old['marketplace']));self.storage.transition_and_enqueue(eid,event.group_id,event.peer_id,'RESOLVED',{'gender':gender,'last_result_id':result.result_id},present(result.semantic_result),main_menu_keyboard());return 'PROCESSED'
  return 'IGNORED'
