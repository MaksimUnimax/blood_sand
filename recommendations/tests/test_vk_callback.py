import asyncio, json, tempfile, unittest
from pathlib import Path
import httpx

from recommendations.api.app import create_app
from recommendations.vk.config import VKRuntimeConfig
from recommendations.vk.storage import VKStorage

FIXTURE = Path(__file__).parent / "fixtures/vk/staging/message_new.v5_199.sanitized.json"

class CallbackHTTPTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory(); self.config=VKRuntimeConfig(1,"test-token","test-secret","test-confirmation",str(Path(self.tmp.name)/"state.sqlite"),callback_max_body_bytes=1000);self.app=create_app(vk_config=self.config); self.app.state.vk_runtime={"config":self.config,"storage":VKStorage(self.config.state_db_path)}
 def tearDown(self): self.app.state.vk_runtime['storage'].close();self.tmp.cleanup()
 def request(self, content, headers=None):
  async def run():
   async with httpx.AsyncClient(transport=httpx.ASGITransport(app=self.app,raise_app_exceptions=False),base_url='http://test') as c:return await c.post('/internal/vk/callback',content=content,headers=headers or {'content-type':'application/json'})
  return asyncio.run(run())
 def event(self, **changes):
  p=json.loads(FIXTURE.read_text());p.update(group_id=1,event_id='event-1',secret='test-secret');p.update(changes);return p
 def rows(self): return self.app.state.vk_runtime['storage'].connection.execute('select * from vk_inbound_events').fetchall()
 def test_disabled_route_keeps_m2_usable(self):
  app=create_app(vk_config=None); self.assertEqual(self.request_for(app).status_code,404);self.assertEqual(self.request_for(app,'/healthz','GET').status_code,200)
 def request_for(self, app, path='/internal/vk/callback', method='POST'):
  async def run():
   async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app),base_url='http://test') as c:return await c.request(method,path)
  return asyncio.run(run())
 def test_confirmation_and_trust_rejections(self):
  p={'type':'confirmation','group_id':1,'secret':'test-secret'};self.assertEqual(self.request(json.dumps(p)).text,'test-confirmation');self.assertEqual(len(self.rows()),0)
  for key,value in [('group_id',2),('secret','wrong')]:
   q=dict(p);q[key]=value;self.assertEqual(self.request(json.dumps(q)).status_code,403)
  q=dict(p);q.pop('secret');self.assertEqual(self.request(json.dumps(q)).status_code,403);self.assertEqual(len(self.rows()),0)
 def test_malformed_scalar_array_and_exact_body_limit(self):
  for body in (b'\xff',b'{',b'1',b'[]') : self.assertEqual(self.request(body).status_code,400)
  self.assertEqual(self.request(b'x'*1001).status_code,413)
 def test_current_fixture_dedup_privacy_and_no_sync_send(self):
  p=self.event();r=self.request(json.dumps(p,ensure_ascii=False));self.assertEqual(r.text,'ok');self.assertEqual(self.request(json.dumps(p)).text,'ok');self.assertEqual(len(self.rows()),1)
  raw=self.rows()[0]['raw_payload_json'];self.assertNotIn('test-secret',raw);self.assertNotIn('access_token',raw);self.assertNotIn('confirmation',raw)
 def test_unsupported_event_is_durable_then_ignored(self):
  p=self.event(type='wall_post_new',object={});self.assertEqual(self.request(json.dumps(p)).text,'ok'); row=self.rows()[0];self.assertEqual(row['status'],'NEW')
