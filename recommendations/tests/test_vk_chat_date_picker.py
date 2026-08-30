import json, tempfile, unittest
from datetime import datetime, timezone
from pathlib import Path
from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.keyboard import VK_INLINE_MAX_BUTTONS, day_bands_keyboard, days_keyboard, months_keyboard, year_ranges_keyboard, years_keyboard
from recommendations.vk.storage import VKStorage

class ChatDatePickerTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.clock=lambda:datetime(2026,8,30,tzinfo=timezone.utc);self.s=VKStorage(str(Path(self.tmp.name)/'s.sqlite'),clock=self.clock);self.bot=BotOrchestrator(self.s,RecommendationApplicationService());self.n=0
 def tearDown(self):self.s.close();self.tmp.cleanup()
 def send(self,text,payload=None):
  self.n+=1;self.s.connection.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(1,'t',?,'x','message_new','{}','NEW',?)",(str(self.n),self.clock().isoformat()));eid=self.s.connection.execute('select last_insert_rowid()').fetchone()[0];self.bot.process(eid,type('E',(),dict(event_type='message_new',group_id=1,peer_id=2,from_id=2,text=text,payload=payload))())
 def click(self,label,payload):self.send(label,json.dumps(payload,separators=(',',':')))
 def labels(self):return [b['action']['label'] for r in json.loads(self.s.connection.execute('select keyboard_json from vk_outbox order by outbox_id desc').fetchone()[0])['buttons'] for b in r]
 def test_all_builders_never_exceed_verified_limit(self):
  for year in (1900,1909,1919,2026,2035):
   for page in (0,1):
    try: keyboards=[year_ranges_keyboard(year,page)]
    except ValueError:keyboards=[]
    for k in keyboards:self.assertLessEqual(sum(map(len,k['buttons'])),VK_INLINE_MAX_BUTTONS)
  for k in (years_keyboard(1900,1909),months_keyboard(12,0),months_keyboard(12,1),day_bands_keyboard(31),days_keyboard(1,10),days_keyboard(21,30)):
   self.assertLessEqual(sum(map(len,k['buttons'])),10);self.assertTrue(k['inline']);self.assertFalse(k['one_time'])
 def test_911_regressions(self):
  self.assertLessEqual(sum(map(len,year_ranges_keyboard(2026,0)['buttons'])),10) # YEAR_RANGE_911_REGRESSION
  self.assertLessEqual(sum(map(len,years_keyboard(1900,1909)['buttons'])),10) # YEAR_1900S_911_REGRESSION
  self.assertLessEqual(sum(map(len,months_keyboard(12,0)['buttons'])),10) # MONTH_12_BUTTON_911_REGRESSION
  self.assertLessEqual(sum(map(len,days_keyboard(21,30)['buttons'])),10) # DAY_31_BUTTON_911_REGRESSION
 def test_paginated_happy_path_and_stale_page(self):
  self.send('Подобрать оберег');self.assertEqual(self.s.session(1,2)['date_picker_page'],0);self.assertIn('1990–1999',self.labels())
  self.click('1990–1999',{'kip':'date','step':'year_range','start':1990,'end':1999,'v':1});self.click('1990',{'kip':'date','step':'year','value':1990,'v':1});self.click('Июль–Декабрь →',{'kip':'date','step':'month_page','page':1,'v':1});self.click('Октябрь',{'kip':'date','step':'month','value':10,'v':1});self.click('11–20',{'kip':'date','step':'day_band','start':11,'end':20,'v':1});self.click('13',{'kip':'date','step':'day','value':13,'v':1});row=self.s.session(1,2);self.assertEqual((row['state'],row['birth_day']),('WAITING_GENDER',13))
  self.send('Подобрать оберег');self.click('Раньше →',{'kip':'date','step':'year_range_page','page':1,'v':1});self.assertEqual(self.s.session(1,2)['date_picker_page'],1);self.click('Раньше →',{'kip':'date','step':'year_range_page','page':1,'v':1});self.assertEqual(self.s.session(1,2)['date_picker_page'],1) # stale navigation resends current screen
 def test_current_filters_february_and_typed_date(self):
  self.send('Подобрать оберег');self.click('2020–2026',{'kip':'date','step':'year_range','start':2020,'end':2026,'v':1});self.click('2026',{'kip':'date','step':'year','value':2026,'v':1});self.assertNotIn('Сентябрь',self.labels())
  self.send('Подобрать оберег');self.send('13.10.1990');row=self.s.session(1,2);self.assertEqual((row['state'],row['birth_day'],row['birth_month'],row['birth_year']),('WAITING_GENDER',13,10,1990))
  self.assertEqual([b['action']['label'] for r in day_bands_keyboard(29)['buttons'] for b in r],['1–10','11–20','21–29'])
