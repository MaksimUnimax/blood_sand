import json, tempfile, unittest
from datetime import datetime, timezone
from pathlib import Path
from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.keyboard import year_ranges_keyboard, years_keyboard, months_keyboard, days_keyboard, day_tail_keyboard
from recommendations.vk.storage import VKStorage

class ChatDatePickerTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.clock=lambda: datetime(2026,8,30,tzinfo=timezone.utc); self.s=VKStorage(str(Path(self.tmp.name)/'s.sqlite'),clock=self.clock); self.bot=BotOrchestrator(self.s,RecommendationApplicationService()); self.n=0
 def tearDown(self): self.s.close(); self.tmp.cleanup()
 def send(self,text,payload=None):
  self.n+=1; self.s.connection.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(1,'t',?,'x','message_new','{}','NEW',?)",(str(self.n),self.clock().isoformat())); eid=self.s.connection.execute('select last_insert_rowid()').fetchone()[0]; self.bot.process(eid,type('E',(),dict(event_type='message_new',group_id=1,peer_id=2,from_id=2,text=text,payload=payload))())
 def click(self,label,payload): self.send(label,json.dumps(payload,separators=(',',':')))
 def test_builders_are_bounded(self):
  for k in (year_ranges_keyboard(2026),years_keyboard(1900,1919),months_keyboard(),days_keyboard(31),day_tail_keyboard(31)):
   self.assertTrue(k['inline']); self.assertFalse(k['one_time']); self.assertLessEqual(sum(map(len,k['buttons'])),24); self.assertTrue(all(len(r)<=4 for r in k['buttons']))
  self.assertEqual([b['action']['label'] for r in year_ranges_keyboard(2026)['buttons'] for b in r][-1],'2020–2026')
  self.assertNotIn('31',[b['action']['label'] for r in days_keyboard(30)['buttons'] for b in r])
 def test_happy_path_future_filter_back_and_stale(self):
  self.send('Подобрать оберег'); self.assertEqual(self.s.session(1,2)['date_picker_step'],'YEAR_RANGE'); self.assertEqual(self.s.connection.execute('select count(*) from vk_miniapp_handoffs').fetchone()[0],0)
  self.click('1990–1999',{'kip':'date','step':'year_range','start':1990,'end':1999,'v':1}); self.click('1990',{'kip':'date','step':'year','value':1990,'v':1}); self.click('Октябрь',{'kip':'date','step':'month','value':10,'v':1}); self.click('13',{'kip':'date','step':'day','value':13,'v':1})
  row=self.s.session(1,2); self.assertEqual((row['state'],row['birth_day'],row['birth_month'],row['birth_year']),('WAITING_GENDER',13,10,1990))
  self.send('Подобрать оберег'); self.click('2020–2026',{'kip':'date','step':'year_range','start':2020,'end':2026,'v':1}); self.click('2026',{'kip':'date','step':'year','value':2026,'v':1}); self.assertEqual(self.s.session(1,2)['date_picker_step'],'MONTH')
  labels=[b['action']['label'] for r in json.loads(self.s.connection.execute('select keyboard_json from vk_outbox order by outbox_id desc').fetchone()[0])['buttons'] for b in r]; self.assertNotIn('Сентябрь',labels)
  self.click('1990–1999',{'kip':'date','step':'year_range','start':1990,'end':1999,'v':1}); self.assertEqual(self.s.session(1,2)['date_picker_step'],'MONTH')
 def test_tail_and_typed_parity(self):
  self.send('Подобрать оберег'); self.click('1990–1999',{'kip':'date','step':'year_range','start':1990,'end':1999,'v':1}); self.click('1990',{'kip':'date','step':'year','value':1990,'v':1}); self.click('Октябрь',{'kip':'date','step':'month','value':10,'v':1}); self.click('21–31',{'kip':'date','step':'day_tail','last':31,'v':1}); self.click('31',{'kip':'date','step':'day_tail','value':31,'v':1}); self.assertEqual(self.s.session(1,2)['birth_day'],31)
  self.send('Подобрать оберег'); self.send('13.10.1990'); row=self.s.session(1,2); self.assertEqual((row['state'],row['birth_day'],row['birth_month'],row['birth_year']),('WAITING_GENDER',13,10,1990))
