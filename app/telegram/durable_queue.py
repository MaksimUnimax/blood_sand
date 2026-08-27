"""A PTB-compatible queue that durably receipts an Update before PTB returns from put()."""
import asyncio


class DurableUpdateQueue(asyncio.Queue):
 def __init__(self, repo):
  super().__init__()
  self.repo=repo
 async def put(self, item):
  # Updater awaits this method before advancing its in-memory getUpdates offset.
  if hasattr(item, 'update_id') and hasattr(item, 'to_json'):
   await self.repo.receipt_telegram_update(item.update_id, item.to_json())
  await super().put(item)
 async def replay_put(self, item):
  # The row already exists; do not alter its completion state while replaying.
  await super().put(item)
