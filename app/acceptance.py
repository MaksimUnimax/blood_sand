"""Clean, isolated T4 acceptance harness.

This module deliberately shares QuestionService, Repository and OperatorBot with
production.  Only Codex and marketplace write boundaries are substituted.
"""
import argparse
import asyncio
import json
import os
import signal
import tempfile
from datetime import datetime, timezone
from pathlib import Path

from telegram import Update
from telegram.ext import Application

from app.daemon import POLLING_KWARGS, TelegramTransport
from app.db.database import connect, init
from app.db.repository import Repository
from app.service import QuestionService
from app.telegram.bot import OperatorBot
from app.telegram.durable_queue import DurableUpdateQueue

PRODUCTION_DB = Path('/var/lib/marketplace-question-operator/state.sqlite3')
STALE_DB = Path('/var/lib/marketplace-question-operator/t4-acceptance/state.sqlite3')
SCENARIOS = ('A_MANUAL', 'B_CODEX_SUCCESS', 'C_CODEX_ERROR_REPEAT', 'D_CODEX_ERROR_SWITCH', 'E_IGNORE')

def stamp(): return datetime.now(timezone.utc).isoformat()

class ScriptedCodexError(RuntimeError):
 def __init__(self, kind): self.kind=kind; super().__init__(kind)

class Evidence:
 def __init__(self,path,run_id,db_path):
  self.path=Path(path); self.data={'run_id':run_id,'code_head':os.popen('git rev-parse HEAD').read().strip(),'started_at':stamp(),'db_path':str(db_path),'scenarios':[],'scripted_codex_invocations':[],'would_send':[],'profile_changes':[],'errors':[],'counters':{'SYNTHETIC_QUESTIONS_CREATED':0,'TELEGRAM_MESSAGES_CREATED':0,'REAL_CODEX_PROCESS_STARTS':0,'OZON_ANSWER_CREATE_CALLS':0,'WB_QUESTION_PATCH_CALLS':0,'MARKETPLACE_WRITES_PERFORMED':0}}
  self.flush()
 def flush(self):
  self.path.parent.mkdir(parents=True,exist_ok=True); self.path.write_text(json.dumps(self.data,indent=2,sort_keys=True)+'\n')
 def add(self,key,value): self.data[key].append(value); self.flush()

class ScriptedCodex:
 """No subprocess capability; outcomes are scenario + ordinal only."""
 def __init__(self,scenario,evidence): self.scenario,self.evidence=scenario,evidence; self.calls=0
 async def run(self,profile,prompt,attempt_id):
  self.calls+=1; scripts={'B_CODEX_SUCCESS':[('SUCCESS','T4 deterministic Codex answer')], 'C_CODEX_ERROR_REPEAT':[('LIMIT',None),('SUCCESS','T4 retry success')], 'D_CODEX_ERROR_SWITCH':[('LIMIT',None),('SUCCESS','T4 regenerated answer')]}
  try: outcome,text=scripts[self.scenario][self.calls-1]
  except (KeyError,IndexError):
   self.evidence.add('errors',{'at':stamp(),'error':'unexpected Codex attempt','scenario':self.scenario,'ordinal':self.calls}); raise ScriptedCodexError('UNEXPECTED_ATTEMPT')
  self.evidence.add('scripted_codex_invocations',{'at':stamp(),'scenario':self.scenario,'ordinal':self.calls,'attempt_id':str(attempt_id),'profile':profile,'outcome':outcome})
  if outcome!='SUCCESS': raise ScriptedCodexError(outcome)
  return text

class ScenarioCodexRouter:
 """Looks up the isolated scenario at invocation time; never delegates to Runner."""
 def __init__(self,repo,evidence): self.repo,self.evidence,self.runners=repo,evidence,{}
 async def run(self,profile,prompt,attempt_id):
  attempt=await self.repo.get_draft_attempt(int(attempt_id)); row=await (await self.repo.db.execute('SELECT scenario_id FROM acceptance_scenarios WHERE question_id=? AND status=?',(attempt['question_id'],'ACTIVE'))).fetchone()
  if not row: raise ScriptedCodexError('NO_ACTIVE_SCENARIO')
  scenario=row['scenario_id'].rsplit('-',1)[0]
  runner=self.runners.setdefault(attempt['question_id'],ScriptedCodex(scenario,self.evidence))
  return await runner.run(profile,prompt,attempt_id)

class AcceptanceSendSink:
 """Synthetic successful adapter. It has no HTTP client and cannot write."""
 def __init__(self,evidence): self.evidence=evidence; self.calls=[]
 async def fetch_unanswered_questions(self): return []
 async def send_answer(self,question,text):
  reply=f'acceptance-local-{question["id"]}-{len(self.calls)+1}'
  record={'at':stamp(),'marketplace':question['marketplace'],'question_id':question['id'],'external_question_id':question['external_question_id'],'text':text,'fake_external_reply_id':reply}
  self.calls.append(record); self.evidence.add('would_send',record); return {'status':'SUCCESS','answer_id':reply}
 async def reconcile_answer(self,question,expected_text,send_started_at): return 'NOT_FOUND'

class ScenarioController:
 def __init__(self,repo,run_id,evidence): self.repo,self.run_id,self.evidence=repo,run_id,evidence
 async def prepare(self,scenario):
  if scenario not in SCENARIOS: raise ValueError('unknown scenario')
  open_rows=await self.repo.db.execute("SELECT * FROM acceptance_scenarios WHERE run_id=? AND status='ACTIVE'",(self.run_id,)); active=await open_rows.fetchall()
  if active: raise RuntimeError('an acceptance scenario is already active')
  # monotonically unique external id makes every question a new logical row.
  n=(await (await self.repo.db.execute('SELECT COUNT(*) FROM acceptance_scenarios WHERE run_id=?',(self.run_id,))).fetchone())[0]+1
  raw={'marketplace':'ozon' if scenario!='E_IGNORE' else 'wildberries','external_question_id':f'T4-{self.run_id}-{scenario}-{n}','product_id':'T4-SYNTHETIC','product_article':scenario,'product_title':f'T4 {scenario}','question_text':f'T4 isolated {scenario} question. Do not publish.','raw_status':'synthetic_acceptance'}
  q,created=await self.repo.insert_question(raw)
  if not created: raise RuntimeError('refusing reused acceptance question')
  await self.repo.db.execute("INSERT INTO acceptance_scenarios(run_id,scenario_id,question_id,status,phase,expected_action,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",(self.run_id,f'{scenario}-{n}',q['id'],'ACTIVE','NEW','operator action',stamp(),stamp())); await self.repo.db.commit()
  row={'scenario_id':f'{scenario}-{n}','scenario':scenario,'question_id':q['id'],'public_id':q['public_id'],'status':'ACTIVE'}
  if self.evidence:
   self.evidence.data['counters']['SYNTHETIC_QUESTIONS_CREATED']+=1; self.evidence.add('scenarios',row)
  return q
 async def close(self):
  await self.repo.db.execute("UPDATE acceptance_scenarios SET status='COMPLETE',phase='COMPLETE',updated_at=? WHERE run_id=? AND status='ACTIVE'",(stamp(),self.run_id)); await self.repo.db.commit()
 async def status(self):
  r=await (await self.repo.db.execute("SELECT s.*,q.public_id,q.status AS question_status,q.telegram_current_message_id,q.current_answer_revision_id,(SELECT COUNT(*) FROM draft_attempts d WHERE d.question_id=q.id) attempts FROM acceptance_scenarios s JOIN questions q ON q.id=s.question_id WHERE s.run_id=? ORDER BY s.id DESC LIMIT 1",(self.run_id,))).fetchone()
  return dict(r) if r else None

class PromptStub:
 def build(self,q): return 'acceptance prompt for '+q['public_id']

async def build(run_id,db_path,evidence_path):
 db_path=Path(db_path).resolve()
 if db_path in {PRODUCTION_DB,STALE_DB}: raise ValueError('acceptance requires a fresh isolated database')
 if not run_id: raise ValueError('run_id is required')
 db=await connect(db_path); await init(db); repo=Repository(db); ev=Evidence(evidence_path,run_id,db_path); sink=AcceptanceSendSink(ev)
 return db,repo,ev,sink,ScenarioController(repo,run_id,ev)

async def run(run_id,db_path,evidence_path):
 db,repo,ev,sink,controller=await build(run_id,db_path,evidence_path)
 token,operator_id=os.environ['TELEGRAM_BOT_TOKEN'],os.environ['TELEGRAM_OPERATOR_USER_ID']
 queue=DurableUpdateQueue(repo); application=Application.builder().token(token).update_queue(queue).build(); transport=TelegramTransport(application,operator_id,repo)
 # A runner is intentionally not installed until a scenario is explicitly prepared.
 service=QuestionService(repo,{'ozon':sink,'wildberries':sink},transport,ScenarioCodexRouter(repo,ev),PromptStub())
 for handler in OperatorBot(operator_id,service).handlers(): application.add_handler(handler)
 stop=asyncio.Event(); loop=asyncio.get_running_loop()
 for signum in (signal.SIGTERM,signal.SIGINT): loop.add_signal_handler(signum,stop.set)
 try:
  await application.initialize(); await application.start(); await application.bot.delete_webhook(drop_pending_updates=False)
  for row in await repo.pending_telegram_updates(): await queue.replay_put(Update.de_json(json.loads(row['update_json']),application.bot))
  await application.updater.start_polling(**POLLING_KWARGS); await stop.wait()
 finally:
  if application.updater.running: await application.updater.stop()
  if application.running: await application.stop()
  await application.shutdown(); await db.close()

async def status(run_dir):
 run_dir=Path(run_dir); data=json.loads((run_dir/'evidence.json').read_text()); db=await connect(run_dir/'state.sqlite3'); await init(db); repo=Repository(db); controller=ScenarioController(repo,data['run_id'],None)
 try:
  result=await controller.status() or {}; result.update({'run_id':data['run_id'],'active_profile':await repo.active_codex_profile(),'would_send_count':len(data['would_send'])}); return result
 finally: await db.close()

async def selftest():
 """Offline smoke test: no Application, network client, or external runner."""
 with tempfile.TemporaryDirectory(prefix='mqo-t4-selftest-') as directory:
  root=Path(directory); db,repo,ev,sink,controller=await build('selftest',root/'state.sqlite3',root/'evidence.json')
  try:
   service=QuestionService(repo,{'ozon':sink,'wildberries':sink},None,ScenarioCodexRouter(repo,ev),PromptStub())
   q=await controller.prepare('A_MANUAL'); await repo.transition(q['id'],'NEW','MANUAL_INPUT'); await repo.create_telegram_input(1,q['id'],'manual_answer'); old=await repo.consume_reply(1,'old'); await repo.transition(q['id'],'REVIEW','EDITING'); await repo.create_telegram_input(2,q['id'],'edit_answer',old); edited=await repo.consume_reply(2,'T4 edited answer'); await service.send(q['id'],edited); await controller.close()
   for scenario,answer in (('B_CODEX_SUCCESS','T4 deterministic Codex answer'),('C_CODEX_ERROR_REPEAT','T4 retry success'),('D_CODEX_ERROR_SWITCH','T4 regenerated answer')):
    q=await controller.prepare(scenario)
    if scenario!='B_CODEX_SUCCESS':
     try: await service.codex(q['id'])
     except ScriptedCodexError: pass
     if scenario=='D_CODEX_ERROR_SWITCH': await repo.set_active_codex_profile('codex2')
    await service.codex(q['id']); assert (await repo.get_current_answer_revision(q['id']))['text']==answer; await controller.close()
   q=await controller.prepare('E_IGNORE'); await service.ignore(q['id']); await controller.close()
   assert ev.data['counters']['REAL_CODEX_PROCESS_STARTS']==0 and ev.data['counters']['MARKETPLACE_WRITES_PERFORMED']==0
   return True
  finally: await db.close()

def main():
 p=argparse.ArgumentParser(description=__doc__); sub=p.add_subparsers(dest='command',required=True)
 start=sub.add_parser('run'); start.add_argument('--run-id',required=True); start.add_argument('--db',type=Path,required=True); start.add_argument('--evidence',type=Path,required=True)
 prepare=sub.add_parser('prepare'); prepare.add_argument('--run-dir',type=Path,required=True); prepare.add_argument('--scenario',choices=SCENARIOS,required=True)
 close=sub.add_parser('close'); close.add_argument('--run-dir',type=Path,required=True)
 state=sub.add_parser('status'); state.add_argument('--run-dir',type=Path,required=True)
 sub.add_parser('selftest')
 a=p.parse_args()
 if a.command=='run': asyncio.run(run(a.run_id,a.db,a.evidence))
 elif a.command=='selftest': print('ACCEPTANCE_HARNESS_SELFTEST = PASS' if asyncio.run(selftest()) else 'ACCEPTANCE_HARNESS_SELFTEST = FAIL')
 elif a.command=='status': print(json.dumps(asyncio.run(status(a.run_dir)),sort_keys=True))
 else:
  async def go():
   d,r,e,s,c=await build(a.run_dir.name,a.run_dir/'state.sqlite3',a.run_dir/'evidence.json')
   try:
    if a.command=='close': await c.close(); print('closed')
    else: print((await c.prepare(a.scenario))['public_id'])
   finally: await d.close()
  asyncio.run(go())
if __name__=='__main__': main()
