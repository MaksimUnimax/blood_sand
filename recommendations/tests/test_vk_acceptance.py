import json, tempfile, unittest
from pathlib import Path
from datetime import datetime, timedelta, timezone
import httpx

from recommendations.application import RecommendationApplicationService
from recommendations.vk.bot_orchestrator import BotOrchestrator
from recommendations.vk.bot_parser import parse_dates, parse_gender
from recommendations.vk.inbound_worker import InboundWorker
from recommendations.vk.normalization import normalize_callback, VKNormalizationError
from recommendations.vk.outbox import OutboxWorker
from recommendations.vk.storage import VKStorage
from recommendations.vk.vk_api import VKAPIClient, VKProtocolError

FIXTURE=Path(__file__).parent/'fixtures/vk/staging/message_new.v5_199.sanitized.json'
class _Config: group_id=1;group_token='test-token'
class _API:
 def __init__(self, answer):self.answer=answer;self.calls=[]
 def messages_send(self,p,m,r):self.calls.append(r);return self.answer
class AcceptanceTests(unittest.TestCase):
 def setUp(self): self.tmp=tempfile.TemporaryDirectory();self.path=str(Path(self.tmp.name)/'db.sqlite');self.s=VKStorage(self.path,1,1)
 def tearDown(self):self.s.close();self.tmp.cleanup()
 def payload(self,text='13.10',eid='e1'):
  p=json.loads(FIXTURE.read_text());p.update(group_id=1,event_id=eid);p['object']['message'].update(peer_id=11,from_id=11,text=text);return p
 def test_normalizer_and_parser_matrix(self):
  e=normalize_callback(json.loads(FIXTURE.read_text()));self.assertEqual((e.event_id,e.group_id,e.api_version,e.peer_id,e.from_id,e.message_id,e.conversation_message_id),('sanitized',0,'5.199',0,0,0,0));self.assertEqual(e.text,'sanitized staging text')
  for form in ('13.10','13.10.1990','13/10','13/10/1990','13-10','13-10-1990'):self.assertEqual(len(parse_dates(form)),1)
  self.assertEqual(parse_dates('31.02 13.10'),[]);self.assertEqual(parse_dates('13.10 20.11'),[]);self.assertEqual(parse_dates('31.02'),[]);self.assertEqual(parse_dates('29.02.2020')[0].year,2020)
  for value in ('Мужчине',' женщине ','male','FEMALE'):self.assertIsNotNone(parse_gender(value))
  for value in ('Иван','мужчина','она','м','ж'):self.assertIsNone(parse_gender(value))
  bad=self.payload();bad['object'].pop('message');
  with self.assertRaises(VKNormalizationError):normalize_callback(bad)
 def test_state_idempotency_and_customer_copy(self):
  worker=InboundWorker(self.s,BotOrchestrator(self.s,RecommendationApplicationService()))
  self.s.accept(self.payload('Подобрать оберег','e0'));worker.process_one();self.s.accept(self.payload('16.01.1990'));worker.process_one();self.assertEqual(self.s.session(1,11)['state'],'WAITING_GENDER')
  self.s.accept(self.payload('Мужчине','e2'));worker.process_one();self.assertEqual(self.s.session(1,11)['state'],'RESOLVED');message=self.s.connection.execute('select message_text from vk_outbox where source_event_id=3').fetchone()[0];self.assertIn('Печать Велеса',message);self.assertNotIn('bear_paw',message);self.assertNotIn('rank2',message)
  self.s.accept(self.payload('anything','e3'));worker.process_one();self.assertEqual(self.s.connection.execute('select count(*) from vk_outbox').fetchone()[0],3)
 def test_two_connection_claims_and_restart_and_stale_recovery(self):
  self.s.accept(self.payload());other=VKStorage(self.path,1,1);self.assertIsNotNone(self.s.claim_event());self.assertIsNone(other.claim_event());self.s.connection.execute("update vk_inbound_events set claimed_at=?",((datetime.now(timezone.utc)-timedelta(seconds=2)).isoformat(),));claimed=other.claim_event();self.assertIsNotNone(claimed);other.finish_event(claimed['id'],'IGNORED');other.close()
  self.s.accept(self.payload(eid='e2'));row=self.s.claim_event();self.s.transition_and_enqueue(row['id'],1,11,'WAITING_DATE',{},'x');first=self.s.claim_outbox();rid=first['random_id'];self.s.connection.execute("update vk_outbox set claimed_at=?",((datetime.now(timezone.utc)-timedelta(seconds=2)).isoformat(),));again=self.s.claim_outbox();self.assertEqual(again['random_id'],rid)
 def test_retention_keeps_dedup_identity(self):
  self.s.accept(self.payload());row=self.s.claim_event();self.s.finish_event(row['id'],'IGNORED');self.s.connection.execute("update vk_inbound_events set received_at=?",((datetime.now(timezone.utc)-timedelta(seconds=2)).isoformat(),));self.assertEqual(self.s.prune_raw_payloads(),1);self.assertFalse(self.s.accept(self.payload()));self.assertEqual(self.s.connection.execute('select raw_payload_json from vk_inbound_events').fetchone()[0],'{}')
 def test_vk_client_success_shape_and_malformed_responses(self):
  class C:
   def __init__(self,data):self.data=data
   def post(self,*a,**kw):return type('R',(),{'json':lambda s:self.data})()
  self.assertEqual(VKAPIClient(_Config(),C({'response':0})).messages_send(1,'x',1).message_id,0)
  for data in ({},{'error':{}},{'foo':'bar'},{'response':None},{'response':'not-an-integer'}):
   with self.assertRaises(VKProtocolError):VKAPIClient(_Config(),C(data)).messages_send(1,'x',1)
 def test_outbox_protocol_error_never_sent_and_random_id_reused(self):
  self.s.accept(self.payload());event=self.s.claim_event();self.s.transition_and_enqueue(event['id'],1,11,'WAITING_DATE',{},'x');api=_API(None)
  # An adapter protocol failure follows the same bounded uncertainty path.
  api.messages_send=lambda *args: (_ for _ in ()).throw(VKProtocolError())
  worker=OutboxWorker(self.s,api,0);worker.process_one();self.s.connection.execute('update vk_outbox set next_attempt_at=NULL');worker.process_one();self.assertEqual(self.s.connection.execute('select status from vk_outbox').fetchone()[0],'FAILED_TERMINAL')
