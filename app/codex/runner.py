import asyncio,json
from pathlib import Path
class CodexError(Exception):
 def __init__(self,kind,msg): self.kind,self.msg=kind,msg
def child_env(home): return {'PATH':'/root/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/usr/bin:/bin','HOME':'/root','CODEX_HOME':str(home),'LANG':'C.UTF-8'}
def parse_jsonl(data):
 try: rows=[json.loads(x) for x in data.splitlines() if x]
 except json.JSONDecodeError: raise CodexError('INVALID_OUTPUT','invalid JSONL')
 for row in reversed(rows):
  if row.get('type') in {'final','assistant_message'}:
   text=row.get('text') or row.get('content')
   if isinstance(text,str) and text.strip(): return text
 raise CodexError('INVALID_OUTPUT','no final assistant draft')
class Runner:
 def __init__(self,c): self.c=c
 async def run(self,profile,prompt,job):
  job=Path(job)/('attempt-'+str(__import__('uuid').uuid4())); job.mkdir(parents=True,exist_ok=True)
  try: p=await asyncio.create_subprocess_exec(str(self.c.codex_executable),'exec','--json','--ephemeral','-C',str(job),'-s','workspace-write',prompt,stdout=asyncio.subprocess.PIPE,stderr=asyncio.subprocess.PIPE,env=child_env(self.c.profiles[profile])); o,e=await asyncio.wait_for(p.communicate(),600)
  except asyncio.TimeoutError:
   p.kill(); await p.communicate(); raise CodexError('TIMEOUT','timeout')
  except OSError as x: raise CodexError('PROCESS_ERROR',str(x))
  if p.returncode:
   low=e.lower(); raise CodexError('LIMIT' if b'limit' in low else ('AUTH' if b'auth' in low else 'NONZERO_EXIT'),e.decode()[:500])
  return parse_jsonl(o.decode())
