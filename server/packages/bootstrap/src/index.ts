import type {
  BootstrapRequestV1,
  BootstrapSnapshotPayloadV1,
  SignedBootstrapEnvelopeV1,
} from "@product/contracts";
import {
  type ResolveP3BootstrapPolicyInput,
  type ResolveP3BootstrapPolicyResult,
} from "@product/remote-config";
import { BootstrapSnapshotPayloadV1Schema } from "@product/contracts";

export type BootstrapSubject = { accountId: string; deviceId: string };
export type BootstrapPolicyResolver = {
  resolve(
    input: ResolveP3BootstrapPolicyInput,
  ): Promise<ResolveP3BootstrapPolicyResult | { failure: string }>;
};
export type BootstrapSnapshotSigner = {
  readonly keyId: string;
  sign(payload: BootstrapSnapshotPayloadV1): SignedBootstrapEnvelopeV1;
};
export type BootstrapClock = { now(): Date };
export class BootstrapError extends Error {
  constructor(public readonly code: "DEVICE_MISMATCH" | "UNAVAILABLE") {
    super(code);
  }
}
export class BootstrapService {
  constructor(
    private readonly policy: BootstrapPolicyResolver,
    private readonly signer: BootstrapSnapshotSigner,
    private readonly clock: BootstrapClock = { now: () => new Date() },
  ) {}
  async issue(
    subject: BootstrapSubject,
    request: BootstrapRequestV1,
  ): Promise<SignedBootstrapEnvelopeV1> {
    if (request.deviceId !== subject.deviceId)
      throw new BootstrapError("DEVICE_MISMATCH");
    const result = await this.policy.resolve({
      contractVersion: request.contractVersion,
      extensionVersion: request.extensionVersion,
      browser: request.browser,
      accountId: subject.accountId,
      deviceId: subject.deviceId,
    });
    if ("failure" in result || result.signingKeyId !== this.signer.keyId)
      throw new BootstrapError("UNAVAILABLE");
    const now = this.clock.now();
    const issuedAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + 15 * 60_000);
    const payload = BootstrapSnapshotPayloadV1Schema.parse({
      snapshotVersion: "bootstrap_snapshot_v1",
      contractVersion: "control_plane_v1",
      configVersion: result.configVersion,
      serverTime: issuedAt,
      issuedAt,
      expiresAt: expiresAt.toISOString(),
      offlineGraceUntil: new Date(
        expiresAt.getTime() + 24 * 60 * 60_000,
      ).toISOString(),
      account: { status: "ACTIVE" },
      subscription: { state: "NONE", planRevision: null },
      devicePolicy: { status: "ACTIVE" },
      compatibility: result.compatibility,
      entitlements: {},
      features: result.features,
      ai: { status: "UNCONFIGURED" },
    });
    return this.signer.sign(payload);
  }
}
