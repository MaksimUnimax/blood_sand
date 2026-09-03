import { randomUUID } from "node:crypto";
import type {
  AccessTokenIdentity,
  ExtensionAuthRepository,
} from "@product/extension-auth";
import type { DatabaseRuntime } from "./index.js";

type IdentityRow = {
  session_id: string;
  device_id: string;
  account_id: string;
};
const identitySql = `SELECT s.id AS session_id,d.id AS device_id,a.id AS account_id
  FROM sessions s JOIN devices d ON d.id=s.device_id JOIN accounts a ON a.id=s.account_id
  JOIN users u ON u.id=d.created_by_user_id
  WHERE s.id=$1 AND s.status='ACTIVE' AND s.revoked_at IS NULL
    AND d.status='ACTIVE' AND d.revoked_at IS NULL AND a.status='ACTIVE' AND u.status='ACTIVE'`;
function identity(
  row: IdentityRow | undefined,
): AccessTokenIdentity | undefined {
  return row
    ? {
        sessionId: row.session_id,
        deviceId: row.device_id,
        accountId: row.account_id,
      }
    : undefined;
}

export function createExtensionAuthRepository(
  runtime: DatabaseRuntime,
): ExtensionAuthRepository {
  return {
    async consumeRefreshRate(input) {
      const windowStartedAt = new Date(
        Math.floor(input.now.getTime() / input.windowMs) * input.windowMs,
      );
      // This is intentionally an autocommitted statement, outside refresh rotation.
      // PostgreSQL's conflict update locks the row, so every attempted request is
      // counted even when the later credential transaction rolls back or fails.
      const result = await runtime.query<{
        count: number;
        window_started_at: Date;
      }>(
        `INSERT INTO auth_rate_limit_buckets(action,key_hash,window_started_at,count,updated_at)
         VALUES('EXTENSION_REFRESH_IP',$1,$2,1,$3)
         ON CONFLICT(action,key_hash) DO UPDATE SET
           count=CASE WHEN auth_rate_limit_buckets.window_started_at=EXCLUDED.window_started_at
             THEN auth_rate_limit_buckets.count+1 ELSE 1 END,
           window_started_at=EXCLUDED.window_started_at,updated_at=EXCLUDED.updated_at
         RETURNING count,window_started_at`,
        [input.keyHash, windowStartedAt, input.now],
      );
      const row = result.rows[0];
      if (!row || Number(row.count) <= input.limit) return { allowed: true };
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(
          (new Date(row.window_started_at).getTime() +
            input.windowMs -
            input.now.getTime()) /
            1000,
        ),
      );
      return { allowed: false, retryAfterSeconds };
    },
    async authorize(sessionId) {
      const result = await runtime.query<IdentityRow>(identitySql, [sessionId]);
      return identity(result.rows[0]);
    },
    async authorizeFromRefreshHash(tokenHash) {
      const result = await runtime.query<IdentityRow>(
        `SELECT s.id AS session_id,d.id AS device_id,a.id AS account_id FROM refresh_tokens r
         JOIN sessions s ON s.id=r.session_id JOIN devices d ON d.id=s.device_id JOIN accounts a ON a.id=s.account_id
         JOIN users u ON u.id=d.created_by_user_id
         WHERE r.token_hash=$1 AND s.status='ACTIVE' AND s.revoked_at IS NULL
           AND d.status='ACTIVE' AND d.revoked_at IS NULL AND a.status='ACTIVE' AND u.status='ACTIVE'`,
        [tokenHash],
      );
      return identity(result.rows[0]);
    },
    async createRefresh(input) {
      return runtime.transaction(async (tx) => {
        const authorized = await tx.query<IdentityRow>(
          identitySql + " FOR UPDATE",
          [input.sessionId],
        );
        if (!authorized.rows[0]) return false;
        try {
          await tx.query(
            `INSERT INTO refresh_tokens(id,session_id,token_hash,generation,expires_at)
            SELECT $1,$2,$3,COALESCE(MAX(generation)+1,0),$4 FROM refresh_tokens WHERE session_id=$2`,
            [randomUUID(), input.sessionId, input.tokenHash, input.expiresAt],
          );
          return true;
        } catch {
          return false;
        }
      });
    },
    async rotateRefresh(input) {
      return runtime.transaction(async (tx) => {
        const found = await tx.query<{
          id: string;
          session_id: string;
          generation: number;
          consumed_at: Date | null;
          expires_at: Date;
          status: string;
          revoked_at: Date | null;
        }>(
          `SELECT r.id,r.session_id,r.generation,r.consumed_at,r.expires_at,s.status,s.revoked_at
           FROM refresh_tokens r JOIN sessions s ON s.id=r.session_id WHERE r.token_hash=$1 FOR UPDATE`,
          [input.tokenHash],
        );
        const token = found.rows[0],
          now = new Date();
        if (
          !token ||
          token.status !== "ACTIVE" ||
          token.revoked_at ||
          new Date(token.expires_at) <= now
        )
          return "invalid" as const;
        if (!token.consumed_at) {
          const replacementId = randomUUID();
          try {
            await tx.query(
              `INSERT INTO refresh_tokens(id,session_id,token_hash,generation,expires_at,rotation_idempotency_hash,replay_expires_at)
              VALUES($1,$2,$3,$4,$5,$6,$7)`,
              [
                replacementId,
                token.session_id,
                input.replacementHash,
                token.generation + 1,
                input.expiresAt,
                input.idempotencyHash,
                input.replayUntil,
              ],
            );
            await tx.query(
              `UPDATE refresh_tokens SET consumed_at=$2,replaced_by_token_id=$3 WHERE id=$1 AND consumed_at IS NULL`,
              [token.id, now, replacementId],
            );
            await tx.query(
              `UPDATE sessions SET last_refreshed_at=$2 WHERE id=$1 AND status='ACTIVE' AND revoked_at IS NULL`,
              [token.session_id, now],
            );
            await tx.query(
              `INSERT INTO audit_events(actor_type,action,target_type,target_id,correlation_id) VALUES('SYSTEM','REFRESH_ROTATED','SESSION',$1,$2)`,
              [token.session_id, input.correlationId],
            );
            return "rotated" as const;
          } catch {
            return "invalid" as const;
          }
        }
        const replay = await tx.query<{ id: string }>(
          `SELECT id FROM refresh_tokens WHERE id=$1 AND rotation_idempotency_hash=$2 AND replay_expires_at>$3`,
          [
            (
              await tx.query<{ replaced_by_token_id: string | null }>(
                "SELECT replaced_by_token_id FROM refresh_tokens WHERE id=$1",
                [token.id],
              )
            ).rows[0]?.replaced_by_token_id,
            input.idempotencyHash,
            now,
          ],
        );
        if (replay.rows[0]) return "replay" as const;
        await tx.query(
          `UPDATE refresh_tokens SET reuse_detected_at=COALESCE(reuse_detected_at,$2) WHERE id=$1`,
          [token.id, now],
        );
        await tx.query(
          `UPDATE sessions SET status='COMPROMISED',revoked_at=COALESCE(revoked_at,$2),revoke_reason='REFRESH_REUSE' WHERE id=$1`,
          [token.session_id, now],
        );
        await tx.query(
          `INSERT INTO audit_events(actor_type,action,target_type,target_id,correlation_id,reason) VALUES('SYSTEM','REFRESH_REUSE','SESSION',$1,$2,'REFRESH_REUSE')`,
          [token.session_id, input.correlationId],
        );
        return "reuse" as const;
      });
    },
  };
}
