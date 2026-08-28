import aiosqlite
from pathlib import Path


async def connect(path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    db = await aiosqlite.connect(path)
    db.row_factory = aiosqlite.Row
    await db.execute('PRAGMA foreign_keys=ON')
    await db.execute('PRAGMA journal_mode=WAL')
    return db


async def _ensure_column(db, table, column, definition):
    rows = await (await db.execute(f'PRAGMA table_info({table})')).fetchall()
    if column not in {row['name'] for row in rows}:
        await db.execute(f'ALTER TABLE {table} ADD COLUMN {column} {definition}')


async def init(db):
    await db.executescript(Path(__file__).with_name('schema.sql').read_text())
    # Existing production databases predate manual-ingress routing metadata.
    # SQLite CREATE TABLE IF NOT EXISTS does not add columns, so migrate them
    # explicitly while preserving MARKETPLACE_API behavior for old rows.
    await _ensure_column(db, 'questions', 'ingress_mode', "TEXT NOT NULL DEFAULT 'MARKETPLACE_API'")
    await _ensure_column(db, 'questions', 'publish_mode', "TEXT NOT NULL DEFAULT 'MARKETPLACE_API'")
    await db.execute("UPDATE questions SET ingress_mode='MARKETPLACE_API' WHERE ingress_mode IS NULL OR ingress_mode='' ")
    await db.execute("UPDATE questions SET publish_mode='MARKETPLACE_API' WHERE publish_mode IS NULL OR publish_mode='' ")
    await db.commit()
