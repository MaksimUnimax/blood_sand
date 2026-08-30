from __future__ import annotations

import json
import secrets
import sqlite3
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path

from .migrations import initialize
from .normalization import redact_callback
from .audit import sanitize_keyboard_audit


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

    def _insert_transition_audit(self, c, event_id, old, state, state_version, kind):
        c.execute("INSERT INTO vk_transition_audit(source_event_id,from_state,to_state,from_state_version,to_state_version,transition_kind,created_at) VALUES(?,?,?,?,?,?,?)", (event_id, old['state'] if old else 'START', state, old['state_version'] if old else 0, state_version, kind, self._now()))

    def transition_and_enqueue(self, event_id, g, p, state, fields, text, keyboard=None, transition_kind='standard'):
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
                state_version = c.execute("SELECT state_version FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?", (g, p)).fetchone()[0]
                self._insert_transition_audit(c, event_id, old, state, state_version, transition_kind)
                rid = secrets.randbelow(2_000_000_000)+1
                self._before_outbox_insert(c)
                keyboard_json = json.dumps(keyboard, ensure_ascii=False, separators=(',', ':')) if keyboard is not None else None
                audit_json = json.dumps(sanitize_keyboard_audit(keyboard), ensure_ascii=False, separators=(',', ':')) if keyboard is not None else None
                c.execute("INSERT INTO vk_outbox(source_event_id,vk_group_id,peer_id,message_text,keyboard_json,keyboard_audit_json,random_id,status,created_at) VALUES(?,?,?,?,?,?,?,'PENDING',?)", (event_id,g,p,text,keyboard_json,audit_json,rid,now()))
                c.commit()
            except Exception:
                c.rollback(); raise
        self._run(run)

    def transition_and_enqueue_calendar(self, event_id, g, p, expected_vk_user_id, fields, text, *, app_id, owner_id, ttl):
        """Atomically create the post-transition-bound calendar capability and prompt."""
        from .keyboard import calendar_keyboard
        if not isinstance(expected_vk_user_id, int) or isinstance(expected_vk_user_id, bool) or expected_vk_user_id <= 0:
            raise ValueError("calendar requires a VK sender")
        token = secrets.token_urlsafe(32)
        handoff_id = str(uuid.uuid4())
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            try:
                old = c.execute("SELECT * FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?", (g, p)).fetchone()
                if self._expired(old): old = None
                vals = {"birth_day": None, "birth_month": None, "birth_year": None, "gender": None, "marketplace": None, "last_result_id": None}
                if old: vals.update(dict(old))
                vals.update(fields)
                updated_at = self._now()
                expires_at = (self.clock().astimezone(timezone.utc) + timedelta(seconds=self.session_retention_seconds)).isoformat()
                c.execute("INSERT INTO vk_bot_sessions(vk_group_id,peer_id,state,birth_day,birth_month,birth_year,gender,marketplace,last_result_id,state_version,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(vk_group_id,peer_id) DO UPDATE SET state=excluded.state,birth_day=excluded.birth_day,birth_month=excluded.birth_month,birth_year=excluded.birth_year,gender=excluded.gender,marketplace=excluded.marketplace,last_result_id=excluded.last_result_id,state_version=vk_bot_sessions.state_version+1,updated_at=excluded.updated_at,expires_at=excluded.expires_at", (g,p,'WAITING_DATE',vals['birth_day'],vals['birth_month'],vals['birth_year'],vals['gender'],vals['marketplace'],vals['last_result_id'],1,updated_at,expires_at))
                state_version = c.execute("SELECT state_version FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?", (g, p)).fetchone()[0]
                handoff_expires = (self.clock().astimezone(timezone.utc) + timedelta(seconds=ttl)).isoformat()
                c.execute("INSERT INTO vk_miniapp_handoffs VALUES(?,?,?,?,?,?,?,?,?,?,NULL)", (handoff_id, self.token_hash(token), g, p, expected_vk_user_id, 'WAITING_DATE', state_version, 'birth_date', updated_at, handoff_expires))
                self._after_session_write(c)
                keyboard = calendar_keyboard(app_id, owner_id, token)
                self._insert_transition_audit(c, event_id, old, 'WAITING_DATE', state_version, 'calendar')
                self._before_outbox_insert(c)
                c.execute("INSERT INTO vk_outbox(source_event_id,vk_group_id,peer_id,message_text,keyboard_json,keyboard_audit_json,random_id,status,created_at) VALUES(?,?,?,?,?,?,?,'PENDING',?)", (event_id,g,p,text,json.dumps(keyboard,ensure_ascii=False,separators=(',',':')),json.dumps(sanitize_keyboard_audit(keyboard),ensure_ascii=False,separators=(',',':')),secrets.randbelow(2_000_000_000)+1,updated_at))
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
        # Raw handoff capability is retained only while delivery may retry.
        def run(c):
            c.execute("UPDATE vk_outbox SET status=?,last_error_code=?,last_error_class=?,last_error_detail=?,next_attempt_at=?,sent_at=?,vk_message_id=? WHERE outbox_id=?", (status,code,klass,detail,next_at,now() if status=='SENT' else None,message_id,id))
            if status in {'SENT','FAILED_TERMINAL'}:
                row=c.execute("SELECT keyboard_json FROM vk_outbox WHERE outbox_id=?",(id,)).fetchone()
                if row and row['keyboard_json'] and 'open_app' in row['keyboard_json']:
                    c.execute("UPDATE vk_outbox SET keyboard_json=? WHERE outbox_id=?", ('{"redacted":"terminal_open_app"}',id))
        self._run(run)

    @staticmethod
    def token_hash(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    def create_handoff(self, g, p, user_id, state_version, purpose='birth_date', ttl=600):
        token=secrets.token_urlsafe(32); handoff_id=str(uuid.uuid4()); created=self._now(); expires=(self.clock().astimezone(timezone.utc)+timedelta(seconds=ttl)).isoformat()
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            try:
                c.execute("INSERT INTO vk_miniapp_handoffs VALUES(?,?,?,?,?,?,?,?,?,?,NULL)",(handoff_id,self.token_hash(token),g,p,user_id,'WAITING_DATE',state_version,purpose,created,expires)); c.commit()
            except Exception: c.rollback(); raise
        self._run(run); return handoff_id, token

    def bootstrap_miniapp(self, token, vk_user_id, app_id, session_ttl=900):
        digest=self.token_hash(token); created=self._now(); expires=(self.clock().astimezone(timezone.utc)+timedelta(seconds=session_ttl)).isoformat(); bearer=secrets.token_urlsafe(32)
        def run(c):
            c.execute("BEGIN IMMEDIATE")
            try:
                h=c.execute("SELECT * FROM vk_miniapp_handoffs WHERE token_hash=?",(digest,)).fetchone()
                if not h or h['purpose']!='birth_date' or h['used_at'] or h['expires_at']<=created or h['expected_vk_user_id'] != vk_user_id: raise ValueError('HANDOFF_REJECTED')
                bot=c.execute("SELECT * FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?",(h['vk_group_id'],h['peer_id'])).fetchone()
                if not bot or bot['state'] != h['expected_state'] or bot['state_version'] != h['expected_state_version']: raise ValueError('STALE_HANDOFF')
                c.execute("INSERT INTO vk_miniapp_sessions VALUES(?,?,?,?,?,?,?,?,NULL)",(self.token_hash(bearer),h['handoff_id'],app_id,vk_user_id,h['vk_group_id'],h['peer_id'],created,expires)); c.commit(); return bearer
            except Exception: c.rollback(); raise
        return self._run(run)

    def submit_miniapp_birth_date(self, bearer, birth_date, gender_prompt, gender_keyboard):
        try: date=datetime.strptime(birth_date,'%Y-%m-%d').date()
        except ValueError: raise ValueError('INVALID_BIRTH_DATE')
        if date > self.clock().date(): raise ValueError('INVALID_BIRTH_DATE')
        stamp=self._now()
        def run(c):
            c.execute('BEGIN IMMEDIATE')
            try:
                s=c.execute('SELECT * FROM vk_miniapp_sessions WHERE session_token_hash=?',(self.token_hash(bearer),)).fetchone()
                if not s or s['expires_at']<=stamp or s['completed_at']: raise ValueError('SESSION_REJECTED')
                h=c.execute('SELECT * FROM vk_miniapp_handoffs WHERE handoff_id=?',(s['handoff_id'],)).fetchone()
                if not h or h['used_at'] or h['expires_at']<=stamp: raise ValueError('HANDOFF_REJECTED')
                bot=c.execute('SELECT * FROM vk_bot_sessions WHERE vk_group_id=? AND peer_id=?',(h['vk_group_id'],h['peer_id'])).fetchone()
                if not bot or bot['state'] != h['expected_state'] or bot['state_version'] != h['expected_state_version']: raise ValueError('STALE_HANDOFF')
                c.execute('UPDATE vk_miniapp_handoffs SET used_at=? WHERE handoff_id=? AND used_at IS NULL',(stamp,h['handoff_id']))
                c.execute('UPDATE vk_miniapp_sessions SET completed_at=? WHERE session_token_hash=?',(stamp,self.token_hash(bearer)))
                c.execute("UPDATE vk_bot_sessions SET state='WAITING_GENDER',birth_day=?,birth_month=?,birth_year=?,gender=NULL,state_version=state_version+1,updated_at=? WHERE vk_group_id=? AND peer_id=?",(date.day,date.month,date.year,stamp,h['vk_group_id'],h['peer_id']))
                synthetic='miniapp:'+h['handoff_id']
                c.execute("INSERT INTO vk_inbound_events(vk_group_id,transport,event_id,api_version,event_type,raw_payload_json,status,received_at) VALUES(?,?,?,?,?,?,?,?)",(h['vk_group_id'],'miniapp',synthetic,'5.199','miniapp.birth_date','{}','PROCESSED',stamp))
                event_id=c.execute('SELECT id FROM vk_inbound_events WHERE vk_group_id=? AND transport=? AND event_id=?',(h['vk_group_id'],'miniapp',synthetic)).fetchone()['id']
                self._insert_transition_audit(c, event_id, bot, 'WAITING_GENDER', bot['state_version'] + 1, 'miniapp_birth_date')
                self._before_outbox_insert(c)
                c.execute("INSERT INTO vk_outbox(source_event_id,vk_group_id,peer_id,message_text,keyboard_json,keyboard_audit_json,random_id,status,created_at) VALUES(?,?,?,?,?,?,?,'PENDING',?)",(event_id,h['vk_group_id'],h['peer_id'],gender_prompt,json.dumps(gender_keyboard,ensure_ascii=False,separators=(',',':')),json.dumps(sanitize_keyboard_audit(gender_keyboard),ensure_ascii=False,separators=(',',':')),secrets.randbelow(2_000_000_000)+1,stamp))
                c.commit()
            except Exception: c.rollback(); raise
        return self._run(run)
