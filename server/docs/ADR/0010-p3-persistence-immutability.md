# ADR-0010 — P3 Persistence Immutability

Date: 2026-09-04  
Status: Accepted

## Decision

Published P3 security and configuration records are append-only. Published extension release metadata, compatibility-policy revisions, and config releases are never edited or deleted in place. Later rollback or activation changes selection/assignment, never an old revision.

Signing public-key material is immutable and its lifecycle is represented by append-only events rather than rewriting key bytes. Production private config-signing keys never enter PostgreSQL.

P3.2 permits no generic JSONB policy/config payload. Later P3.3 resolution consumes typed immutable records.
