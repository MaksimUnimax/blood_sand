import type { BootstrapSnapshotPayloadV1 } from "@product/contracts";

export type BootstrapFreshness = "FRESH" | "OFFLINE_GRACE" | "EXPIRED";
export type SignedPolicySource = "LIVE" | "CACHE";
export type CompatibilityState =
  | "READY"
  | "UPDATE_RECOMMENDED"
  | "UPDATE_REQUIRED"
  | "UNSUPPORTED_BROWSER"
  | "MAINTENANCE";

export function classifyBootstrapFreshness(input: {
  effectiveNowMs: number;
  expiresAt: string;
  offlineGraceUntil: string;
}): BootstrapFreshness {
  const expiresAtMs = Date.parse(input.expiresAt);
  const offlineGraceUntilMs = Date.parse(input.offlineGraceUntil);
  if (input.effectiveNowMs < expiresAtMs) return "FRESH";
  if (input.effectiveNowMs < offlineGraceUntilMs) return "OFFLINE_GRACE";
  return "EXPIRED";
}

/** One resolver is shared by live and cached signed policy. */
export function resolveClientCompatibility(
  payload: BootstrapSnapshotPayloadV1,
): CompatibilityState {
  if (payload.compatibility.browser.status === "MAINTENANCE")
    return "MAINTENANCE";
  if (payload.compatibility.browser.status === "UNSUPPORTED_BROWSER")
    return "UNSUPPORTED_BROWSER";
  if (payload.compatibility.extension.status === "UPDATE_REQUIRED")
    return "UPDATE_REQUIRED";
  if (payload.compatibility.extension.status === "UPDATE_RECOMMENDED")
    return "UPDATE_RECOMMENDED";
  return "READY";
}

export type SignedOperationalResult = {
  kind: CompatibilityState;
  source: SignedPolicySource;
  freshness: Exclude<BootstrapFreshness, "EXPIRED">;
  payload: BootstrapSnapshotPayloadV1;
};
