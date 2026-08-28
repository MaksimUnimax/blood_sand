import asyncio,json
from pathlib import Path
class CodexError(Exception):
 def __init__(self,kind,msg): self.kind,self.msg=kind,msg
def child_env(home): return {'PATH':'/root/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/usr/bin:/bin','HOME':'/root','CODEX_HOME':str(home),'LANG':'C.UTF-8'}
def parse_jsonl(data):
 try: rows=[json.loads(x) for x in data.splitlines() if x]
 except json.JSONDecodeError: raise CodexError('INVALID_OUTPUT','invalid JSONL')
 for row in reversed(rows):
  typ=row.get('type')
  # Current Codex CLI exec --json schema (0.144+ / 0.150.1): the final
  # assistant response is an item.completed event with item.type=agent_message.
  if typ=='item.completed':
   item=row.get('item')
   if isinstance(item,dict) and item.get('type') in {'agent_message','assistant_message'}:
    text=item.get('text') or item.get('content')
    if isinstance(text,str) and text.strip(): return text
  # Keep compatibility with the older top-level schema used by earlier CLI builds.
  if typ in {'final','assistant_message'}:
   text=row.get('text') or row.get('content')
   if isinstance(text,str) and text.strip(): return text
  if typ=='turn.failed':
   error=row.get('error')
   msg=error.get('message') if isinstance(error,dict) else str(error or 'turn failed')
   raise CodexError('TURN_FAILED',msg)
  if typ=='error':
   raise CodexError('EXEC_ERROR',str(row.get('message') or 'Codex event stream error'))
 event_types=','.join(str(row.get('type')) for row in rows[-8:])
 item_types=','.join(str(row.get('item',{}).get('type')) for row in rows[-8:] if isinstance(row.get('item'),dict))
 detail='no final assistant draft'
 if event_types: detail+=f'; event_types={event_types}'
 if item_types: detail+=f'; item_types={item_types}'
 raise CodexError('INVALID_OUTPUT',detail)
def exec_args(executable,job,prompt):
 return (str(executable),'exec','--json','--ephemeral','--skip-git-repo-check','-C',str(job),'-s','workspace-write',prompt)
class Runner:
 def __init__(self,c): self.c=c
 async def run(self,profile,prompt,job):
  job=Path(self.c.jobs_dir)/f'attempt-{job}-{__import__("uuid").uuid4()}'; job.mkdir(parents=True,exist_ok=True)
  try: p=await asyncio.create_subprocess_exec(*exec_args(self.c.codex_executable,job,prompt),stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE,env=child_env(self.c.profiles[profile])); o,e=await asyncio.wait_for(p.communicate(),600)
  except asyncio.TimeoutError:
   p.kill(); await p.communicate(); raise CodexError('TIMEOUT','timeout')
  except OSError as x: raise CodexError('PROCESS_ERROR',str(x))
  if p.returncode:
   low=e.lower(); raise CodexError('LIMIT' if b'limit' in low else ('AUTH' if b'auth' in low else 'NONZERO_EXIT'),e.decode()[:500])
  return parse_jsonl(o.decode())
