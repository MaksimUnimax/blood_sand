from __future__ import annotations

import json
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .migrations import initialize
from .normalization import redact_callback


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


class VKStorage:
    """Short-lived SQLite connections make ASGI threads and worker processes safe."""

    def __init__(self, path: str, claim_lease_seconds: int = 300, raw_payload_retention_seconds: int = 86400, session_retention_seconds: int = 86400, clock=None):
        self.path = path
        self.claim_lease_seconds = claim_lease_seconds
        self.raw_payload_retention_seconds = raw_payload_retention_seconds
        self.session_retention_seconds = session_retention_seconds
        self.clock = clock or (lambda: datetime.now(timezone.utc))
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        self.connection = self._connect()
        initialize(self.connection)

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=5, isolation_level=None)
        connection.row_factory = sqlite3.Row
        connection.execute("PRAGMA foreign_keys=ON")
        connection.execute("PRAGMA busy_timeout=5000")
        connection.execute("PRAGMA journal_mode=WAL")
        return connection

    def close(self):
        self.connection.close()

    def _now(self) -> str:
        return self.clock().astimezone(timezone.utc).isoformat()

    def _expired(self, row) -> bool:
        return bool(row and row["expires_at"] and row["expires_at"] <= self._now())

    def _run(self, fn):
        connection = self._connect()
        try:
            return fn(connection)
        finally:
            connection.close()

    def accept(self, payload: dict) -> bool:
        clean = redact_callback(payload)
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            try:
                c.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(?,?,?,?,?,?, 'NEW',?)", (clean["group_id"], "callback", str(clean["event_id"]), str(clean["v"]), clean["type"], json.dumps(clean, ensure_ascii=False), now()))
                c.commit(); return True
            except sqlite3.IntegrityError:
                c.rollback(); return False
            except Exception:
                c.rollback(); raise
        return self._run(run)

    def recover_stale_claims(self) -> None:
        cutoff = (datetime.now(timezone.utc) - timedelta(seconds=self.claim_lease_seconds)).isoformat()
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            c.execute("UPDATE vk_inbound_events SET status='NEW',claimed_at=NULL WHERE status='PROCESSING' AND claimed_at < ?", (cutoff,))
            c.execute("UPDATE vk_outbox SET status='PENDING',claimed_at=NULL WHERE status='SENDING' AND claimed_at < ?", (cutoff,))
            c.commit()
        self._run(run)

    def prune_raw_payloads(self) -> int:
        cutoff = (datetime.now(timezone.utc) - timedelta(seconds=self.raw_payload_retention_seconds)).isoformat()
        def run(c):
            # The v1 schema makes this column NOT NULL; an empty object is a
            # deliberate redacted tombstone while identity/dedup is retained.
            cur = c.execute("UPDATE vk_inbound_events SET raw_payload_json='{}' WHERE status IN ('PROCESSED','IGNORED','FAILED') AND received_at < ? AND raw_payload_json <> '{}'", (cutoff,))
            return cur.rowcount
        return self._run(run)

    def claim_event(self):
        self.recover_stale_claims()
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            row = c.execute("SELECT * FROM vk_inbound_events WHERE status='NEW' ORDER BY id LIMIT 1").fetchone()
            if not row: c.commit(); return None
            changed = c.execute("UPDATE vk_inbound_events SET status='PROCESSING',attempt_count=attempt_count+1,claimed_at=? WHERE id=? AND status='NEW'", (now(), row['id'])).rowcount
            c.commit(); return dict(row) if changed else None
        return self._run(run)

    def finish_event(self, id, status, normalized=None, error=None):
        self._run(lambda c: c.execute("UPDATE vk_inbound_events SET status=?, normalized_payload_json=?, processed_at=?,last_error_detail=? WHERE id=?", (status, json.dumps(normalized, ensure_ascii=False) if normalized else None, now(), error, id)))

    def session(self, g, p):
        def run(c):
            row = c.execute("SELECT * FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?", (g, p)).fetchone()
            if self._expired(row):
                c.execute("DELETE FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?", (g, p))
                return None
            return row
        return self._run(run)

    def _after_session_write(self, connection) -> None:
        """Narrow failure-injection seam; production intentionally does nothing."""

    def _before_outbox_insert(self, connection) -> None:
        """Narrow failure-injection seam; production intentionally does nothing."""

    def transition_and_enqueue(self, event_id, g, p, state, fields, text, keyboard=None):
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            try:
                old = c.execute("SELECT * FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?", (g, p)).fetchone()
                if self._expired(old):
                    old = None
                vals = {"birth_day":None,"birth_month":None,"birth_year":None,"gender":None,"marketplace":None,"last_result_id":None}
                if old: vals.update(dict(old))
                vals.update(fields)
                updated_at = self._now()
                expires_at = (self.clock().astimezone(timezone.utc) + timedelta(seconds=self.session_retention_seconds)).isoformat()
                c.execute("INSERT INTO vk_bot_sessions(vk_group_id,peer_id,state,birth_day,birth_month,birth_year,gender,marketplace,last_result_id,state_version,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(vk_group_id,peer_id) DO UPDATE SET state=excluded.state,birth_day=excluded.birth_day,birth_month=excluded.birth_month,birth_year=excluded.birth_year,gender=excluded.gender,marketplace=excluded.marketplace,last_result_id=excluded.last_result_id,state_version=vk_bot_sessions.state_version+1,updated_at=excluded.updated_at,expires_at=excluded.expires_at", (g,p,state,vals['birth_day'],vals['birth_month'],vals['birth_year'],vals['gender'],vals['marketplace'],vals['last_result_id'],1,updated_at,expires_at))
                self._after_session_write(c)
                rid = secrets.randbelow(2_000_000_000)+1
                self._before_outbox_insert(c)
                keyboard_json = json.dumps(keyboard, ensure_ascii=False, separators=(',', ':')) if keyboard is not None else None
                c.execute("INSERT INTO vk_outbox(source_event_id,vk_group_id,peer_id,message_text,keyboard_json,random_id,status,created_at) VALUES(?,?,?,?,?,?,'PENDING',?)", (event_id,g,p,text,keyboard_json,rid,now()))
                c.commit()
            except Exception:
                c.rollback(); raise
        self._run(run)

    def claim_outbox(self):
        self.recover_stale_claims()
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            row=c.execute("SELECT * FROM vk_outbox WHERE status IN ('PENDING','RETRY_WAIT') AND (next_attempt_at IS NULL OR next_attempt_at<=?) ORDER BY outbox_id LIMIT 1", (now(),)).fetchone()
            if not row: c.commit(); return None
            changed=c.execute("UPDATE vk_outbox SET status='SENDING',claimed_at=?,attempt_count=attempt_count+1 WHERE outbox_id=? AND status IN ('PENDING','RETRY_WAIT')", (now(),row['outbox_id'])).rowcount
            c.commit(); claimed=dict(row); claimed['attempt_count'] += 1; return claimed if changed else None
        return self._run(run)

    def outbox_result(self,id,status,code=None,klass=None,detail=None,next_at=None,message_id=None):
        self._run(lambda c: c.execute("UPDATE vk_outbox SET status=?,last_error_code=?,last_error_class=?,last_error_detail=?,next_attempt_at=?,sent_at=?,vk_message_id=? WHERE outbox_id=?", (status,code,klass,detail,next_at,now() if status=='SENT' else None,message_id,id)))
