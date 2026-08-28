import json
import os
import pytest

from app.acceptance import (AcceptanceSendSink, PRODUCTION_DB, STALE_DB, ScriptedCodex,
                            ScenarioCodexRouter, ScenarioController, ScriptedCodexError, build, project, status, resolve_run_paths)
from app.service import QuestionService
from app.state_machine import StaleState

@pytest.fixture(autouse=True)
def project_environment(monkeypatch):
 monkeypatch.setenv('TELEGRAM_BOT_TOKEN','offline-token')
 monkeypatch.setenv('TELEGRAM_OPERATOR_USER_ID','7')

@pytest.mark.asyncio
async def test_clean_start_requires_fresh_db_and_sends_nothing(tmp_path):
 for bad in (PRODUCTION_DB, STALE_DB):
  with pytest.raises(ValueError): await build('run',bad,tmp_path/'evidence.json')
 db,repo,evidence,sink,controller=await build('run',root=tmp_path)
 try:
  assert await controller.status() is None
  assert evidence.data['counters']['SYNTHETIC_QUESTIONS_CREATED']==0
  assert evidence.data['counters']['TELEGRAM_MESSAGES_CREATED']==0
 finally: await db.close()

@pytest.mark.asyncio
async def test_one_active_scenario_and_fresh_qids(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try:
  qids=[]
  for scenario in ('A_MANUAL','B_CODEX_SUCCESS','C_CODEX_ERROR_REPEAT','D_CODEX_ERROR_SWITCH','E_IGNORE'):
   q=await c.prepare(scenario); qids.append(q['public_id'])
   with pytest.raises(RuntimeError): await c.prepare('B_CODEX_SUCCESS')
   await c.close()
  assert len(qids)==len(set(qids))
 finally: await db.close()

async def svc(repo,sink,runner): return QuestionService(repo,{'ozon':sink,'wildberries':sink},None,runner,type('P',(),{'build':lambda self,q:'prompt'})())

@pytest.mark.asyncio
async def test_scripted_codex_success_repeat_and_switch(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try:
  # B
  q=await c.prepare('B_CODEX_SUCCESS'); service=await svc(repo,sink,ScriptedCodex('B_CODEX_SUCCESS',e)); await service.codex(q['id']); assert (await repo.get_question(q['id']))['status']=='REVIEW'; assert (await repo.get_current_answer_revision(q['id']))['text']=='T4 deterministic Codex answer'; await c.close()
  # C
  q=await c.prepare('C_CODEX_ERROR_REPEAT'); runner=ScriptedCodex('C_CODEX_ERROR_REPEAT',e); service=await svc(repo,sink,runner)
  with pytest.raises(ScriptedCodexError): await service.codex(q['id'])
  assert (await repo.get_question(q['id']))['status']=='CODEX_ERROR'; await service.codex(q['id']); assert (await repo.get_current_answer_revision(q['id']))['text']=='T4 retry success'; assert runner.calls==2; await c.close()
  # D: profile selection alone makes no attempt
  q=await c.prepare('D_CODEX_ERROR_SWITCH'); runner=ScriptedCodex('D_CODEX_ERROR_SWITCH',e); service=await svc(repo,sink,runner)
  with pytest.raises(ScriptedCodexError): await service.codex(q['id'])
  await repo.set_active_codex_profile('codex2'); assert runner.calls==1
  await service.codex(q['id']); attempt=await repo.get_current_draft_attempt(q['id']); assert attempt['codex_profile']=='codex2'; assert (await repo.get_current_answer_revision(q['id']))['text']=='T4 regenerated answer'
  assert e.data['counters']['REAL_CODEX_PROCESS_STARTS']==0
 finally: await db.close()

@pytest.mark.asyncio
async def test_send_sink_uses_claim_and_exact_current_revision(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try:
  q=await c.prepare('A_MANUAL'); await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.create_telegram_input(99,q['id'],'manual_answer'); rid=await repo.consume_reply(99,'T4 original answer')
  await repo.transition(q['id'],'REVIEW','EDITING'); await repo.create_telegram_input(100,q['id'],'edit_answer',rid); edited=await repo.consume_reply(100,'T4 edited answer')
  service=await svc(repo,sink,None); assert await service.send(q['id'],edited)=='SENT'; assert sink.calls[0]['text']=='T4 edited answer'; assert (await repo.get_question(q['id']))['status']=='SENT'
  with pytest.raises(StaleState): await service.send(q['id'],rid)
  assert len(sink.calls)==1 and e.data['counters']['MARKETPLACE_WRITES_PERFORMED']==0
 finally: await db.close()

@pytest.mark.asyncio
async def test_status_is_read_only_and_evidence_has_no_secrets(tmp_path):
 run=tmp_path/'run'; db,repo,e,sink,c=await build('run',root=tmp_path)
 try: q=await c.prepare('E_IGNORE')
 finally: await db.close()
 before=(run/'evidence.json').read_text(); value=await status('run',root=tmp_path)
 assert value['public_id']==q['public_id'] and value['would_send_count']==0
 assert (run/'evidence.json').read_text()==before
 assert 'TELEGRAM_BOT_TOKEN' not in before and 'codex auth' not in before.lower()

@pytest.mark.asyncio
async def test_runtime_router_selects_active_scenario_without_real_runner(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try:
  q=await c.prepare('B_CODEX_SUCCESS'); service=await svc(repo,sink,ScenarioCodexRouter(repo,e))
  await service.codex(q['id'])
  assert (await repo.get_current_answer_revision(q['id']))['text']=='T4 deterministic Codex answer'
  assert e.data['counters']['REAL_CODEX_PROCESS_STARTS']==0
 finally: await db.close()

def test_run_id_validation_and_paths_stay_below_root(tmp_path):
 for valid in ('t4-20260828-001','run_001','abc123'):
  run,db,evidence=resolve_run_paths(valid,tmp_path); assert run.parent==tmp_path.resolve() and db.parent==run and evidence.parent==run
 for invalid in ('../evil','..%2Fevil','/absolute','foo/bar','foo\\bar','.','..','',' ','a\nb','x'*65,'foo%2fbar'):
  with pytest.raises(ValueError): resolve_run_paths(invalid,tmp_path)

class FakeTelegramBot:
 def __init__(self, message_id=321, failure=None): self.calls=[]; self.message_id,self.failure=message_id,failure
 async def send_message(self, **kwargs):
  self.calls.append(kwargs)
  if self.failure: raise self.failure
  return type('Message',(),{'message_id':self.message_id})()

@pytest.mark.asyncio
async def test_project_uses_production_renderer_edge_and_persists_exact_positive_id(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try: q=await c.prepare('A_MANUAL')
 finally: await db.close()
 bot=FakeTelegramBot(321); result=await project('run',bot=bot,operator_id='7',root=tmp_path)
 assert result=={'status':'SUCCEEDED','telegram_message_id':321}
 assert len(bot.calls)==1 and bot.calls[0]['chat_id']=='7'
 rows=bot.calls[0]['reply_markup'].inline_keyboard
 assert [[x.text for x in row] for row in rows]==[['✍️ Ответить самому','🤖 Отправить в Codex'],['🚫 Игнорировать'],['🤖 Сменить Codex']]
 assert all(len(x.callback_data.encode())<=64 and str(q['id']) in x.callback_data for row in rows for x in row)
 value=await status('run',root=tmp_path)
 assert value['telegram_question_message_id']==321 and value['initial_projection_status']=='SUCCEEDED' and value['active_scenario_count']==1
 assert (tmp_path/'run'/'evidence.json').read_text().count('"telegram_message_id": 321')==1
 with pytest.raises(RuntimeError,match='already projected'): await project('run',bot=bot,operator_id='7',root=tmp_path)
 assert len(bot.calls)==1

@pytest.mark.asyncio
async def test_project_ambiguous_and_crash_claim_never_blind_resend(tmp_path):
 from telegram.error import TimedOut
 db,repo,e,sink,c=await build('ambiguous',root=tmp_path)
 try: await c.prepare('A_MANUAL')
 finally: await db.close()
 bot=FakeTelegramBot(failure=TimedOut()); result=await project('ambiguous',bot=bot,operator_id='7',root=tmp_path)
 assert result['status']=='AMBIGUOUS' and len(bot.calls)==1
 with pytest.raises(RuntimeError,match='unresolved'): await project('ambiguous',bot=bot,operator_id='7',root=tmp_path)
 assert len(bot.calls)==1
 db,repo,e,sink,c=await build('crash',root=tmp_path)
 try:
  q=await c.prepare('A_MANUAL'); row,attempt,_=await c.claim_projection()
  # Simulate a process death after Telegram accepted the request, before correlation.
  assert row['question_id']==q['id']
 finally: await db.close()
 bot2=FakeTelegramBot()
 with pytest.raises(RuntimeError,match='unresolved'): await project('crash',bot=bot2,operator_id='7',root=tmp_path)
 assert bot2.calls==[]

@pytest.mark.asyncio
async def test_project_without_active_scenario_fails_closed(tmp_path):
 db,repo,e,sink,c=await build('empty',root=tmp_path); await db.close()
 with pytest.raises(RuntimeError,match='exactly one ACTIVE'): await project('empty',bot=FakeTelegramBot(),operator_id='7',root=tmp_path)

@pytest.mark.asyncio
async def test_concurrent_project_has_one_message_create(tmp_path):
 db,repo,e,sink,c=await build('race',root=tmp_path)
 try: await c.prepare('A_MANUAL')
 finally: await db.close()
 class SlowBot(FakeTelegramBot):
  async def send_message(self,**kwargs):
   await __import__('asyncio').sleep(.03); return await super().send_message(**kwargs)
 bot=SlowBot()
 outcomes=await __import__('asyncio').gather(project('race',bot=bot,operator_id='7',root=tmp_path),project('race',bot=bot,operator_id='7',root=tmp_path),return_exceptions=True)
 assert sum(not isinstance(x,Exception) for x in outcomes)==1 and len(bot.calls)==1

@pytest.mark.asyncio
async def test_concurrent_prepare_creates_exactly_one_question(tmp_path):
 db1,repo1,e1,s1,c1=await build('run',root=tmp_path)
 db2,repo2,e2,s2,c2=await build('run',root=tmp_path)
 try:
  results=await __import__('asyncio').gather(c1.prepare('A_MANUAL'),c2.prepare('B_CODEX_SUCCESS'),return_exceptions=True)
  assert sum(not isinstance(result,Exception) for result in results)==1
  assert sum(isinstance(result,RuntimeError) and str(result)=='an acceptance scenario is already active' for result in results)==1
  assert (await (await repo1.db.execute("SELECT COUNT(*) FROM acceptance_scenarios WHERE status='ACTIVE'")).fetchone())[0]==1
  assert (await (await repo1.db.execute('SELECT COUNT(*) FROM questions')).fetchone())[0]==1
  await c1.close(); assert (await c2.prepare('B_CODEX_SUCCESS'))['public_id']=='Q-000002'
 finally: await db1.close(); await db2.close()

def test_evidence_instances_reload_before_every_mutation(tmp_path):
 from app.acceptance import Evidence
 path=tmp_path/'evidence.json'; db=tmp_path/'state.sqlite3'
 first=Evidence(path,'run',db); second=Evidence(path,'run',db)
 second.add_and_increment('scenarios',{'scenario':'B'},'SYNTHETIC_QUESTIONS_CREATED')
 first.add('errors',{'error':'A'})
 data=json.loads(path.read_text())
 assert data['scenarios']==[{'scenario':'B'}] and data['errors']==[{'error':'A'}]
 assert data['counters']['SYNTHETIC_QUESTIONS_CREATED']==1
 with pytest.raises(ValueError): Evidence(path,'other',db)

@pytest.mark.asyncio
@pytest.mark.parametrize('token,operator',[(None,'7'),('', '7'),('x',None),('x','abc'),('x','0'),('x','-1')])
async def test_project_local_secret_validation_precedes_claim(tmp_path,monkeypatch,token,operator):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try: await c.prepare('A_MANUAL')
 finally: await db.close()
 if token is None: monkeypatch.delenv('TELEGRAM_BOT_TOKEN')
 else: monkeypatch.setenv('TELEGRAM_BOT_TOKEN',token)
 if operator is None: monkeypatch.delenv('TELEGRAM_OPERATOR_USER_ID')
 else: monkeypatch.setenv('TELEGRAM_OPERATOR_USER_ID',operator)
 bot=FakeTelegramBot()
 with pytest.raises(RuntimeError): await project('run',bot=bot,root=tmp_path)
 assert bot.calls==[]
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try: assert await c.status() is not None and (await c.status())['initial_projection_status'] is None
 finally: await db.close()

@pytest.mark.asyncio
async def test_project_initialize_and_prepare_precede_claim(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try: await c.prepare('A_MANUAL')
 finally: await db.close()
 events=[]
 class Bot(FakeTelegramBot):
  def __init__(self,token): super().__init__(123); events.append('construct')
  async def initialize(self): events.append('initialize')
  async def shutdown(self): events.append('shutdown')
  async def send_message(self,**kwargs): events.append('send'); return await super().send_message(**kwargs)
 result=await project('run',root=tmp_path,bot_factory=Bot)
 assert result['telegram_message_id']==123 and events.index('initialize')<events.index('send')

@pytest.mark.asyncio
async def test_project_invalid_first_message_id_never_succeeds(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try: await c.prepare('A_MANUAL')
 finally: await db.close()
 result=await project('run',bot=FakeTelegramBot(0),root=tmp_path)
 assert result['status']=='DETERMINISTIC_FAILED'

@pytest.mark.asyncio
async def test_project_multicard_persists_first_message_id(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try:
  q=await c.prepare('A_MANUAL')
  await repo.db.execute('UPDATE questions SET question_text=? WHERE id=?',('x'*10000,q['id'])); await repo.db.commit()
 finally: await db.close()
 class Multi(FakeTelegramBot):
  async def send_message(self,**kwargs):
   self.calls.append(kwargs); return type('Message',(),{'message_id':100+len(self.calls)})()
 result=await project('run',bot=Multi(),root=tmp_path)
 assert result=={'status':'SUCCEEDED','telegram_message_id':101}

@pytest.mark.asyncio
async def test_project_initialize_failure_has_no_claim_or_send(tmp_path):
 db,repo,e,sink,c=await build('run',root=tmp_path)
 try: await c.prepare('A_MANUAL')
 finally: await db.close()
 class BadBot(FakeTelegramBot):
  def __init__(self,token): super().__init__()
  async def initialize(self): raise RuntimeError('getMe failed')
  async def shutdown(self): pass
 bot=[]
 def factory(token):
  value=BadBot(token); bot.append(value); return value
 with pytest.raises(RuntimeError,match='getMe failed'): await project('run',root=tmp_path,bot_factory=factory)
 assert bot[0].calls==[]

def test_project_systemd_unit_isolated_oneshot():
 unit=(__import__('pathlib').Path(__file__).parents[1]/'systemd/mqo-t4-project@.service').read_text()
 assert 'Type=oneshot' in unit and 'User=root' in unit and 'Group=root' in unit
 assert 'WorkingDirectory=/opt/marketplace-question-operator' in unit
 assert 'EnvironmentFile=/etc/marketplace-question-operator/secrets.env' in unit
 assert 'app.acceptance project --run-id %i' in unit and 'Restart=no' in unit and 'NoNewPrivileges=true' in unit
 assert 'flock' not in unit and 'app.acceptance run' not in unit
 clean=(__import__('pathlib').Path(__file__).parents[1]/'systemd/mqo-t4-clean@.service').read_text()
 assert 'flock' in clean and 'app.acceptance run --run-id %i' in clean
