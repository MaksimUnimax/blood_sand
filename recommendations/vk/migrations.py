from __future__ import annotations
import sqlite3

SCHEMA_VERSION = 3
DDL = """
CREATE TABLE IF NOT EXISTS vk_schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS vk_inbound_events(id INTEGER PRIMARY KEY, vk_group_id INTEGER NOT NULL, transport TEXT NOT NULL, event_id TEXT NOT NULL, api_version TEXT NOT NULL, event_type TEXT NOT NULL, raw_payload_json TEXT NOT NULL, normalized_payload_json TEXT, status TEXT NOT NULL, attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT, received_at TEXT NOT NULL, claimed_at TEXT, processed_at TEXT, last_error_code TEXT, last_error_detail TEXT, UNIQUE(vk_group_id,transport,event_id));
CREATE TABLE IF NOT EXISTS vk_bot_sessions(vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, state TEXT NOT NULL, birth_day INTEGER, birth_month INTEGER, birth_year INTEGER, gender TEXT, marketplace TEXT, last_result_id TEXT, state_version INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, expires_at TEXT, PRIMARY KEY(vk_group_id,peer_id));
CREATE TABLE IF NOT EXISTS vk_outbox(outbox_id INTEGER PRIMARY KEY, source_event_id INTEGER NOT NULL, sequence_no INTEGER NOT NULL DEFAULT 1, vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, message_text TEXT NOT NULL, random_id INTEGER NOT NULL, status TEXT NOT NULL, attempt_count INTEGER NOT NULL DEFAULT 0, next_attempt_at TEXT, created_at TEXT NOT NULL, claimed_at TEXT, sent_at TEXT, last_error_code TEXT, last_error_class TEXT, last_error_detail TEXT, vk_message_id INTEGER, UNIQUE(source_event_id,sequence_no), FOREIGN KEY(source_event_id) REFERENCES vk_inbound_events(id));
"""


def initialize(connection: sqlite3.Connection) -> None:
    connection.execute("PRAGMA journal_mode=WAL"); connection.execute("PRAGMA foreign_keys=ON"); connection.execute("PRAGMA busy_timeout=5000")
    connection.executescript(DDL)
    connection.execute("BEGIN IMMEDIATE")
    try:
        versions = {row[0] for row in connection.execute("SELECT version FROM vk_schema_migrations")}
        if 1 not in versions:
            connection.execute("INSERT INTO vk_schema_migrations(version,applied_at) VALUES(1,datetime('now'))")
        columns = {row[1] for row in connection.execute("PRAGMA table_info(vk_outbox)")}
        if "keyboard_json" not in columns:
            connection.execute("ALTER TABLE vk_outbox ADD COLUMN keyboard_json TEXT NULL")
        if 2 not in versions:
            connection.execute("INSERT INTO vk_schema_migrations(version,applied_at) VALUES(2,datetime('now'))")
        if 3 not in versions:
            connection.executescript("""
            CREATE TABLE IF NOT EXISTS vk_miniapp_handoffs(handoff_id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, expected_vk_user_id INTEGER NOT NULL, expected_state TEXT NOT NULL, expected_state_version INTEGER NOT NULL, purpose TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, used_at TEXT NULL, FOREIGN KEY(vk_group_id,peer_id) REFERENCES vk_bot_sessions(vk_group_id,peer_id));
            CREATE TABLE IF NOT EXISTS vk_miniapp_sessions(session_token_hash TEXT PRIMARY KEY, handoff_id TEXT NOT NULL, vk_app_id INTEGER NOT NULL, vk_user_id INTEGER NOT NULL, vk_group_id INTEGER NOT NULL, peer_id INTEGER NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL, completed_at TEXT NULL, FOREIGN KEY(handoff_id) REFERENCES vk_miniapp_handoffs(handoff_id));
            CREATE INDEX IF NOT EXISTS vk_miniapp_handoffs_lookup ON vk_miniapp_handoffs(token_hash);
            CREATE INDEX IF NOT EXISTS vk_miniapp_sessions_handoff ON vk_miniapp_sessions(handoff_id);
            """)
            connection.execute("INSERT INTO vk_schema_migrations(version,applied_at) VALUES(3,datetime('now'))")
        connection.commit()
    except Exception:
        connection.rollback(); raise
