import aiosqlite
from pathlib import Path
async def connect(path):
 Path(path).parent.mkdir(parents=True,exist_ok=True); db=await aiosqlite.connect(path); db.row_factory=aiosqlite.Row; await db.execute('PRAGMA foreign_keys=ON'); await db.execute('PRAGMA journal_mode=WAL'); return db
async def init(db): await db.executescript(Path(__file__).with_name('schema.sql').read_text()); await db.commit()
