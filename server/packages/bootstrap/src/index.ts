import type {
  BootstrapRequestV1,
  BootstrapSnapshotPayloadV1,
  SignedBootstrapEnvelopeV1,
} from "@product/contracts";
import type { CommercialAccessResolution } from "@product/commercial-access";
import {
  type ResolveP3BootstrapPolicyInput,
  type ResolveP3BootstrapPolicyResult,
} from "@product/remote-config";
import { BootstrapSnapshotPayloadV1Schema } from "@product/contracts";
import { BootstrapAiResolutionService } from "./ai-resolution.js";

export * from "./ai-resolution.js";

export type BootstrapSubject = { accountId: string; deviceId: string };
export type BootstrapPolicyResolver = {
  resolve(
    input: ResolveP3BootstrapPolicyInput,
  ): Promise<ResolveP3BootstrapPolicyResult | { failure: string }>;
};
export type BootstrapSnapshotSigningService = {
  sign(
    keyId: string,
    payload: BootstrapSnapshotPayloadV1,
  ): Promise<SignedBootstrapEnvelopeV1>;
};
export type BootstrapClock = { now(): Date };
export type BootstrapCommercialAccessResolver = {
  resolve(accountId: string, at: Date): Promise<CommercialAccessResolution>;
};
export class BootstrapError extends Error {
  constructor(public readonly code: "DEVICE_MISMATCH" | "UNAVAILABLE") {
    super(code);
  }
}
export class BootstrapService {
  constructor(
    private readonly policy: BootstrapPolicyResolver,
    private readonly signer: BootstrapSnapshotSigningService,
    private readonly clock: BootstrapClock = { now: () => new Date() },
    private readonly commercialAccess?: BootstrapCommercialAccessResolver,
    private readonly aiResolution?: BootstrapAiResolutionService,
  ) {}
  async issue(
    subject: BootstrapSubject,
    request: BootstrapRequestV1,
  ): Promise<SignedBootstrapEnvelopeV1> {
    if (request.deviceId !== subject.deviceId)
      throw new BootstrapError("DEVICE_MISMATCH");
    const now = new Date(this.clock.now().getTime());
    const result = await this.policy.resolve({
      contractVersion: request.contractVersion,
      extensionVersion: request.extensionVersion,
      browser: request.browser,
      accountId: subject.accountId,
      deviceId: subject.deviceId,
    });
    if ("failure" in result) throw new BootstrapError("UNAVAILABLE");
    const commercial = this.commercialAccess
      ? await this.commercialAccess.resolve(subject.accountId, now)
      : undefined;
    if (commercial && commercial.kind !== "OK")
      throw new BootstrapError("UNAVAILABLE");
    const currentSubscription = commercial?.value.currentSubscription ?? null;
    const eligible = commercial?.value.access.kind === "ELIGIBLE";
    let ai: BootstrapSnapshotPayloadV1["ai"] = { status: "UNCONFIGURED" };
    if (request.detectedAi) {
      const detected = {
        family: request.detectedAi.family,
        surface: request.detectedAi.surface,
        variant: request.detectedAi.variant ?? null,
      };
      if (commercial && !eligible) {
        ai = { status: "UNAVAILABLE", detected, reason: "NO_PROFILE" };
      } else if (this.aiResolution) {
        try {
          ai = await this.aiResolution.resolve({
            detected,
            contractVersion: request.contractVersion,
            extensionVersion: request.extensionVersion,
            browser: request.browser,
            accountId: subject.accountId,
            deviceId: subject.deviceId,
          });
        } catch {
          throw new BootstrapError("UNAVAILABLE");
        }
      } else {
        ai = { status: "UNAVAILABLE", detected, reason: "NO_PROFILE" };
      }
    }
    const issuedAt = now.toISOString();
    let expiresAt = new Date(now.getTime() + 15 * 60_000);
    let offlineGraceUntil = new Date(expiresAt.getTime() + 24 * 60 * 60_000);
    if (eligible) {
      const deadline = commercial!.value.accessUntil!;
      offlineGraceUntil = new Date(
        Math.min(offlineGraceUntil.getTime(), deadline.getTime()),
      );
      expiresAt = new Date(
        Math.min(expiresAt.getTime(), offlineGraceUntil.getTime() - 1),
      );
      if (!(now < expiresAt && expiresAt < offlineGraceUntil))
        throw new BootstrapError("UNAVAILABLE");
    }
    const payload = BootstrapSnapshotPayloadV1Schema.parse({
      snapshotVersion: "bootstrap_snapshot_v1",
      contractVersion: "control_plane_v1",
      configVersion: result.configVersion,
      serverTime: issuedAt,
      issuedAt,
      expiresAt: expiresAt.toISOString(),
      offlineGraceUntil: offlineGraceUntil.toISOString(),
      account: { status: "ACTIVE" },
      subscription: currentSubscription
        ? {
            state: currentSubscription.state,
            planRevision: currentSubscription.currentPlanRevisionId,
          }
        : { state: "NONE", planRevision: null },
      devicePolicy: { status: "ACTIVE" },
      compatibility: result.compatibility,
      entitlements: eligible ? commercial!.value.entitlements : {},
      features: result.features,
      ai,
    });
    try {
      const envelope = await this.signer.sign(result.signingKeyId, payload);
      if (envelope.keyId !== result.signingKeyId)
        throw new Error("signing key mismatch");
      return envelope;
    } catch {
      throw new BootstrapError("UNAVAILABLE");
    }
  }
}
