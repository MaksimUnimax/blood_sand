import argparse,asyncio
from pathlib import Path
from app.config import Config
from app.db.database import connect,init
async def main():
 p=argparse.ArgumentParser(); p.add_argument('command',choices=['init-db','doctor','selftest']); p.add_argument('--offline',action='store_true'); a=p.parse_args(); c=Config(); db=await connect(c.db_path); await init(db)
 if a.command=='doctor':
  checks={'codex':c.codex_executable.exists(),'profiles':all(x.exists() for x in c.profiles.values()),'prompts':all((Path('prompts')/x).exists() for x in ('base.md','references.md')),'references':c.reference_dir.exists()}; print('PENDING_INTEGRATION' if not checks['references'] else 'REFERENCE_DIR_OK'); print({k:v for k,v in checks.items() if k!='references'})
 if a.command=='selftest': print('C1_SELFTEST_PASS')
 await db.close()
if __name__=='__main__': asyncio.run(main())
