import { randomUUID } from "node:crypto";
import type { AuthRepository, AuthResult } from "@product/auth";
import type { DatabaseQuery, DatabaseRuntime } from "./index.js";

const windowMs = 15 * 60_000;
async function consume(
  runtime: DatabaseQuery,
  action: string,
  key: string,
  limit: number,
): Promise<boolean> {
  const now = new Date();
  const windowStartedAt = new Date(
    Math.floor(now.getTime() / windowMs) * windowMs,
  );
  const result = await runtime.query<{ count: number }>(
    `INSERT INTO auth_rate_limit_buckets(action,key_hash,window_started_at,count,updated_at) VALUES($1,$2,$3,1,$4) ON CONFLICT(action,key_hash) DO UPDATE SET count=CASE WHEN auth_rate_limit_buckets.window_started_at=EXCLUDED.window_started_at THEN LEAST(auth_rate_limit_buckets.count+1,1000000) ELSE 1 END,window_started_at=EXCLUDED.window_started_at,updated_at=EXCLUDED.updated_at RETURNING count`,
    [action, key, windowStartedAt, now],
  );
  return Number(result.rows[0]?.count) <= limit;
}
export function createAuthRepository(runtime: DatabaseRuntime): AuthRepository {
  return {
    async requestOtp(input) {
      return runtime.transaction(async (tx) => {
        const now = new Date();
        // Serialize one identity's replacement/cooldown sequence. This lock is
        // transaction-scoped and the normalized email never leaves the database.
        await tx.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
          [input.email],
        );
        const [target, ip] = await Promise.all([
          consume(tx, "OTP_REQUEST_TARGET", input.targetKey, 3),
          consume(tx, "OTP_REQUEST_IP", input.ipKey, 20),
        ]);
        const cooldown = await tx.query<{ id: string }>(
          `SELECT id FROM otp_challenges WHERE purpose='LOGIN' AND normalized_identity_target=$1 AND created_at>$2 AND consumed_at IS NULL AND invalidated_at IS NULL`,
          [input.email, new Date(now.getTime() - 60_000)],
        );
        if (!target || !ip || cooldown.rows.length) {
          await tx.query(
            `INSERT INTO audit_events(actor_type,action,target_type,correlation_id,reason) VALUES('ANONYMOUS','AUTH_OTP_RATE_LIMITED','OTP',$1,'AUTH_RATE_LIMITED')`,
            [input.correlationId],
          );
          return { ok: false, code: "AUTH_RATE_LIMITED" } as AuthResult<never>;
        }
        await tx.query(
          `UPDATE otp_email_jobs SET status='DEAD',ciphertext=NULL,nonce=NULL,auth_tag=NULL WHERE challenge_id IN (SELECT id FROM otp_challenges WHERE purpose='LOGIN' AND normalized_identity_target=$1 AND consumed_at IS NULL AND invalidated_at IS NULL)`,
          [input.email],
        );
        await tx.query(
          `UPDATE otp_challenges SET invalidated_at=$2,invalidation_reason='SUPERSEDED' WHERE purpose='LOGIN' AND normalized_identity_target=$1 AND consumed_at IS NULL AND invalidated_at IS NULL`,
          [input.email, now],
        );
        await tx.query(
          `INSERT INTO otp_challenges(id,purpose,normalized_identity_target,verification_hash,max_attempts,expires_at) VALUES($1,'LOGIN',$2,$3,5,$4)`,
          [
            input.challengeId,
            input.email,
            input.verificationHash,
            input.expiresAt,
          ],
        );
        const jobId = randomUUID();
        await tx.query(
          `INSERT INTO otp_email_jobs(id,challenge_id,ciphertext,nonce,auth_tag,max_attempts,correlation_id) VALUES($1,$2,$3,$4,$5,5,$6)`,
          [
            jobId,
            input.challengeId,
            input.envelope.ciphertext,
            input.envelope.nonce,
            input.envelope.authTag,
            input.correlationId,
          ],
        );
        await tx.query(
          `INSERT INTO audit_events(actor_type,action,target_type,target_id,correlation_id,safe_metadata) VALUES('ANONYMOUS','AUTH_OTP_REQUESTED','OTP',$1,$2,jsonb_build_object('purpose','LOGIN','jobId',$3::text))`,
          [input.challengeId, input.correlationId, jobId],
        );
        return {
          ok: true,
          value: { challengeId: input.challengeId, expiresAt: input.expiresAt },
        };
      });
    },
    async verifyOtp(input) {
      return runtime.transaction(async (tx) => {
        if (!(await consume(tx, "OTP_VERIFY_IP", input.ipKey, 30)))
          return { ok: false, code: "AUTH_RATE_LIMITED" } as AuthResult<never>;
        const challenge = await tx.query<{
          id: string;
          normalized_identity_target: string;
          verification_hash: string;
          attempt_count: number;
          max_attempts: number;
          expires_at: Date;
          consumed_at: Date | null;
          invalidated_at: Date | null;
        }>(`SELECT * FROM otp_challenges WHERE id=$1 FOR UPDATE`, [
          input.challengeId,
        ]);
        const c = challenge.rows[0];
        const now = new Date();
        if (
          !c ||
          c.consumed_at ||
          c.invalidated_at ||
          new Date(c.expires_at) <= now ||
          c.attempt_count >= c.max_attempts
        )
          return { ok: false, code: "AUTH_OTP_INVALID" } as AuthResult<never>;
        if (!input.verify(c.normalized_identity_target, c.verification_hash)) {
          await tx.query(
            `UPDATE otp_challenges SET attempt_count=LEAST(attempt_count+1,max_attempts) WHERE id=$1`,
            [c.id],
          );
          await tx.query(
            `INSERT INTO audit_events(actor_type,action,target_type,target_id,correlation_id,reason) VALUES('ANONYMOUS','AUTH_OTP_VERIFY_FAILED','OTP',$1,$2,'AUTH_OTP_INVALID')`,
            [c.id, input.correlationId],
          );
          return { ok: false, code: "AUTH_OTP_INVALID" } as AuthResult<never>;
        }
        const claimed = await tx.query<{ id: string }>(
          `UPDATE otp_challenges SET consumed_at=$2 WHERE id=$1 AND consumed_at IS NULL RETURNING id`,
          [c.id, now],
        );
        if (!claimed.rows[0])
          return { ok: false, code: "AUTH_OTP_INVALID" } as AuthResult<never>;
        // This lock prevents two independent valid challenges from bootstrapping
        // separate users/accounts for the same first-time identity.
        await tx.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1, 0))",
          [c.normalized_identity_target],
        );
        const identity = await tx.query<{ user_id: string; status: string }>(
          `SELECT i.user_id,u.status FROM user_identities i JOIN users u ON u.id=i.user_id WHERE i.provider='EMAIL' AND i.normalized_identifier=$1`,
          [c.normalized_identity_target],
        );
        let userId: string;
        if (!identity.rows[0]) {
          userId = randomUUID();
          const accountId = randomUUID();
          await tx.query(`INSERT INTO users(id) VALUES($1)`, [userId]);
          await tx.query(`INSERT INTO accounts(id) VALUES($1)`, [accountId]);
          await tx.query(
            `INSERT INTO account_memberships(account_id,user_id,role) VALUES($1,$2,'OWNER')`,
            [accountId, userId],
          );
          await tx.query(
            `INSERT INTO user_identities(user_id,provider,normalized_identifier,verified_at) VALUES($1,'EMAIL',$2,$3)`,
            [userId, c.normalized_identity_target, now],
          );
          await tx.query(
            `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id) VALUES('SYSTEM',$1,'AUTH_IDENTITY_CREATED','USER',$1,$2)`,
            [userId, input.correlationId],
          );
        } else {
          userId = identity.rows[0].user_id;
          if (identity.rows[0].status === "SUSPENDED") {
            await tx.query(
              `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id,reason) VALUES('SYSTEM',$1,'AUTH_LOGIN_DENIED','USER',$1,$2,'AUTH_LOGIN_DENIED')`,
              [userId, input.correlationId],
            );
            return {
              ok: false,
              code: "AUTH_LOGIN_DENIED",
            } as AuthResult<never>;
          }
        }
        const sessionId = randomUUID();
        await tx.query(
          `INSERT INTO portal_sessions(id,user_id,session_token_hash,expires_at) VALUES($1,$2,$3,$4)`,
          [sessionId, userId, input.sessionHash, input.expiresAt],
        );
        await tx.query(
          `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id) VALUES('USER',$1,'AUTH_OTP_VERIFIED','OTP',$2,$3),('USER',$1,'PORTAL_SESSION_CREATED','PORTAL_SESSION',$4,$3)`,
          [userId, c.id, input.correlationId, sessionId],
        );
        return {
          ok: true,
          value: { sessionToken: "", expiresAt: input.expiresAt },
        };
      });
    },
    async authenticate(hash) {
      const r = await runtime.query<{ id: string; user_id: string }>(
        `SELECT s.id,s.user_id FROM portal_sessions s JOIN users u ON u.id=s.user_id WHERE s.session_token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.status='ACTIVE'`,
        [hash],
      );
      return r.rows[0]
        ? { sessionId: r.rows[0].id, userId: r.rows[0].user_id }
        : undefined;
    },
    async revoke(hash, correlationId) {
      const r = await runtime.query<{ id: string; user_id: string }>(
        `UPDATE portal_sessions SET revoked_at=now(),revoke_reason='LOGOUT' WHERE session_token_hash=$1 AND revoked_at IS NULL AND expires_at>now() RETURNING id,user_id`,
        [hash],
      );
      if (!r.rows[0]) return "missing";
      await runtime.query(
        `INSERT INTO audit_events(actor_type,actor_id,action,target_type,target_id,correlation_id) VALUES('USER',$1,'PORTAL_SESSION_REVOKED','PORTAL_SESSION',$2,$3)`,
        [r.rows[0].user_id, r.rows[0].id, correlationId],
      );
      return "revoked";
    },
  };
}
