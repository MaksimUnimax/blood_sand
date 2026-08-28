import json
import pytest

from app.acceptance import (AcceptanceSendSink, PRODUCTION_DB, STALE_DB, ScriptedCodex,
                            ScenarioCodexRouter, ScenarioController, ScriptedCodexError, build, status)
from app.service import QuestionService
from app.state_machine import StaleState

@pytest.mark.asyncio
async def test_clean_start_requires_fresh_db_and_sends_nothing(tmp_path):
 for bad in (PRODUCTION_DB, STALE_DB):
  with pytest.raises(ValueError): await build('run',bad,tmp_path/'evidence.json')
 db,repo,evidence,sink,controller=await build('run',tmp_path/'state.sqlite3',tmp_path/'evidence.json')
 try:
  assert await controller.status() is None
  assert evidence.data['counters']['SYNTHETIC_QUESTIONS_CREATED']==0
  assert evidence.data['counters']['TELEGRAM_MESSAGES_CREATED']==0
 finally: await db.close()

@pytest.mark.asyncio
async def test_one_active_scenario_and_fresh_qids(tmp_path):
 db,repo,e,sink,c=await build('run',tmp_path/'state.sqlite3',tmp_path/'evidence.json')
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
 db,repo,e,sink,c=await build('run',tmp_path/'state.sqlite3',tmp_path/'evidence.json')
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
 db,repo,e,sink,c=await build('run',tmp_path/'state.sqlite3',tmp_path/'evidence.json')
 try:
  q=await c.prepare('A_MANUAL'); await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.create_telegram_input(99,q['id'],'manual_answer'); rid=await repo.consume_reply(99,'T4 original answer')
  await repo.transition(q['id'],'REVIEW','EDITING'); await repo.create_telegram_input(100,q['id'],'edit_answer',rid); edited=await repo.consume_reply(100,'T4 edited answer')
  service=await svc(repo,sink,None); assert await service.send(q['id'],edited)=='SENT'; assert sink.calls[0]['text']=='T4 edited answer'; assert (await repo.get_question(q['id']))['status']=='SENT'
  with pytest.raises(StaleState): await service.send(q['id'],rid)
  assert len(sink.calls)==1 and e.data['counters']['MARKETPLACE_WRITES_PERFORMED']==0
 finally: await db.close()

@pytest.mark.asyncio
async def test_status_is_read_only_and_evidence_has_no_secrets(tmp_path):
 run=tmp_path/'run'; db,repo,e,sink,c=await build('run',run/'state.sqlite3',run/'evidence.json')
 try: q=await c.prepare('E_IGNORE')
 finally: await db.close()
 before=(run/'evidence.json').read_text(); value=await status(run)
 assert value['public_id']==q['public_id'] and value['would_send_count']==0
 assert (run/'evidence.json').read_text()==before
 assert 'TELEGRAM_BOT_TOKEN' not in before and 'codex auth' not in before.lower()

@pytest.mark.asyncio
async def test_runtime_router_selects_active_scenario_without_real_runner(tmp_path):
 db,repo,e,sink,c=await build('run',tmp_path/'state.sqlite3',tmp_path/'evidence.json')
 try:
  q=await c.prepare('B_CODEX_SUCCESS'); service=await svc(repo,sink,ScenarioCodexRouter(repo,e))
  await service.codex(q['id'])
  assert (await repo.get_current_answer_revision(q['id']))['text']=='T4 deterministic Codex answer'
  assert e.data['counters']['REAL_CODEX_PROCESS_STARTS']==0
 finally: await db.close()
