import { generateKeyPairSync } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  BootstrapSnapshotPayloadV1Schema,
  type BootstrapSnapshotPayloadV1,
  type BootstrapAiResolutionV1,
} from "@product/contracts";
import {
  canonicalizeJson,
  signBootstrapSnapshot,
  verifyBootstrapEnvelope,
} from "@product/remote-config";
import { profileRevisionFingerprint } from "@product/adapter-registry";
import {
  validateAndBindBootstrapAi,
  type ClientAiBindingContext,
} from "./ai-binding.js";
import { detectSimulatedPackagedAi } from "./detector.js";
import {
  SimulatedExtensionClient,
  type BootstrapCacheRecord,
  type BootstrapSnapshotStore,
} from "./index.js";

const detectedStandard = {
  family: "chatgpt",
  surface: "standard",
  variant: "standard_composer_v1",
} as const;
const content = {
  schemaVersion: "adapter_profile_v1" as const,
  page: {
    identityStrategy: "page_identity" as const,
    conversationStrategy: "conversation_root" as const,
    composerStrategy: "composer_root" as const,
  },
  selectors: {
    conversation: {
      strategy: "conversation_root" as const,
      primary: {
        kind: "packaged_selector_reference" as const,
        reference: "conversation-root" as const,
      },
      fallbacks: [],
      timeoutMs: 1000,
      observationMode: "polling" as const,
    },
    composer: {
      strategy: "composer_root" as const,
      primary: {
        kind: "packaged_selector_reference" as const,
        reference: "composer-root" as const,
      },
      fallbacks: [],
      timeoutMs: 1000,
      observationMode: "polling" as const,
    },
    send: {
      strategy: "send_control" as const,
      primary: {
        kind: "packaged_selector_reference" as const,
        reference: "send-control" as const,
      },
      fallbacks: [],
      timeoutMs: 1000,
      observationMode: "polling" as const,
    },
    assistantResponse: {
      strategy: "assistant_response" as const,
      primary: {
        kind: "packaged_selector_reference" as const,
        reference: "assistant-response" as const,
      },
      fallbacks: [],
      timeoutMs: 1000,
      observationMode: "polling" as const,
    },
  },
  observation: { mode: "polling" as const, intervalMs: 100 },
  contours: [
    {
      key: "page_identity" as const,
      required: true,
      expectedState: "PRESENT" as const,
      strategy: "page_identity" as const,
    },
    {
      key: "conversation_root" as const,
      required: true,
      expectedState: "PRESENT" as const,
      strategy: "conversation_root" as const,
    },
    {
      key: "composer_root" as const,
      required: true,
      expectedState: "INTERACTIVE" as const,
      strategy: "composer_root" as const,
    },
    {
      key: "send_control" as const,
      required: true,
      expectedState: "INTERACTIVE" as const,
      strategy: "send_control" as const,
    },
  ],
};
const compatibility = {
  schemaVersion: "profile_compatibility_v1" as const,
  contractVersion: "control_plane_v1" as const,
  browserFamilies: ["chrome" as const],
  minimumBrowserVersions: [],
  minimumExtensionVersion: null,
};
const profile = {
  profileKey: "chatgpt-standard",
  revision: 3,
  scopeVariant: "standard_composer_v1",
  schemaVersion: "adapter_profile_v1" as const,
  contentSha256: profileRevisionFingerprint({ content, compatibility }),
  content,
  compatibility,
};
const context: ClientAiBindingContext = {
  detectedAi: detectedStandard,
  contractVersion: "control_plane_v1",
  extensionVersion: "1.0.0",
  browser: { family: "chrome", version: "123" },
};

function payload(ai: BootstrapAiResolutionV1): BootstrapSnapshotPayloadV1 {
  return BootstrapSnapshotPayloadV1Schema.parse({
    snapshotVersion: "bootstrap_snapshot_v1",
    contractVersion: "control_plane_v1",
    configVersion: 1,
    issuedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-01-01T00:05:00.000Z",
    offlineGraceUntil: "2026-01-01T00:10:00.000Z",
    serverTime: "2026-01-01T00:00:00.000Z",
    account: { status: "ACTIVE" },
    subscription: { state: "NONE", planRevision: null },
    devicePolicy: { status: "ACTIVE" },
    compatibility: {
      extension: { status: "SUPPORTED", minimumVersion: null },
      browser: { status: "SUPPORTED" },
    },
    entitlements: {},
    features: {},
    ai,
  });
}

const resolved = payload({
  status: "RESOLVED",
  detected: detectedStandard,
  profile,
});

function verifySignedPayload(value: BootstrapSnapshotPayloadV1) {
  const pair = generateKeyPairSync("ed25519");
  const verified = verifyBootstrapEnvelope(
    signBootstrapSnapshot(value, "key", pair.privateKey),
    new Map([["key", pair.publicKey]]),
  );
  if (!verified.ok) throw new Error("test signing authority rejected payload");
  return verified.payload;
}

describe("P7.3 packaged detection and client binding", () => {
  it("recognizes only exact HTTPS ChatGPT origin fixtures", () => {
    expect(
      detectSimulatedPackagedAi({
        url: "https://chatgpt.com/",
        fixture: "CHATGPT_STANDARD",
      }),
    ).toEqual(detectedStandard);
    expect(
      detectSimulatedPackagedAi({
        url: "https://chatgpt.com/work",
        fixture: "CHATGPT_WORK",
      }),
    ).toEqual({
      family: "chatgpt",
      surface: "work",
      variant: "work_composer_v3",
    });
    for (const url of [
      "http://chatgpt.com/",
      "https://chatgpt.com.evil.example/",
      "https://evil.example/?next=https://chatgpt.com",
      "https://user:pass@chatgpt.com/",
      "https://chatgpt.com@evil.example/",
    ])
      expect(
        detectSimulatedPackagedAi({ url, fixture: "CHATGPT_STANDARD" }),
      ).toBeNull();
  });

  it("requires signed detected context and applies the variant binding rule", () => {
    expect(validateAndBindBootstrapAi(resolved, context)).toMatchObject({
      ok: true,
      binding: { profile: { profileKey: "chatgpt-standard" } },
    });
    expect(
      validateAndBindBootstrapAi(resolved, {
        ...context,
        detectedAi: { ...detectedStandard, surface: "work" },
      }),
    ).toEqual({ ok: false, error: "AI_CONTEXT_MISMATCH" });
    const unrelated = payload({
      status: "RESOLVED",
      detected: detectedStandard,
      profile: { ...profile, scopeVariant: "work_composer_v3" },
    });
    expect(validateAndBindBootstrapAi(unrelated, context)).toEqual({
      ok: false,
      error: "AI_CONTEXT_MISMATCH",
    });
    const fallback = payload({
      status: "RESOLVED",
      detected: detectedStandard,
      profile: { ...profile, scopeVariant: null },
    });
    expect(validateAndBindBootstrapAi(fallback, context)).toMatchObject({
      ok: true,
    });
  });

  it("rejects validly signed but semantically invalid profiles", () => {
    const invalid = structuredClone(resolved);
    const ai = invalid.ai;
    if (ai.status !== "RESOLVED") throw new Error("test fixture");
    const invalidContent = ai.profile.content as Record<string, unknown>;
    const page = invalidContent.page as Record<string, unknown>;
    page.identityStrategy = "unknown_strategy";
    expect(
      validateAndBindBootstrapAi(verifySignedPayload(invalid), context),
    ).toEqual({
      ok: false,
      error: "INVALID_PROFILE",
    });

    const badFingerprint = payload({
      status: "RESOLVED",
      detected: detectedStandard,
      profile: { ...profile, contentSha256: "0".repeat(64) },
    });
    expect(
      validateAndBindBootstrapAi(verifySignedPayload(badFingerprint), context),
    ).toEqual({
      ok: false,
      error: "INVALID_PROFILE",
    });
    const unsupportedBrowser = payload({
      status: "RESOLVED",
      detected: detectedStandard,
      profile: {
        ...profile,
        compatibility: {
          ...compatibility,
          browserFamilies: ["yandex_chromium"],
        } as unknown as typeof compatibility,
        contentSha256: profileRevisionFingerprint({
          content,
          compatibility: {
            ...compatibility,
            browserFamilies: ["yandex_chromium"],
          },
        }),
      },
    });
    expect(
      validateAndBindBootstrapAi(
        verifySignedPayload(unsupportedBrowser),
        context,
      ),
    ).toEqual({
      ok: false,
      error: "PROFILE_INCOMPATIBLE",
    });
    const minimum = {
      ...compatibility,
      minimumBrowserVersions: [
        { browserFamily: "chrome" as const, minimumVersion: "124" },
      ],
    };
    const belowBrowser = payload({
      status: "RESOLVED",
      detected: detectedStandard,
      profile: {
        ...profile,
        compatibility: minimum,
        contentSha256: profileRevisionFingerprint({
          content,
          compatibility: minimum,
        }),
      },
    });
    expect(
      validateAndBindBootstrapAi(verifySignedPayload(belowBrowser), context),
    ).toEqual({
      ok: false,
      error: "PROFILE_INCOMPATIBLE",
    });
  });

  it("rejects every listed unsigned tamper of a valid RESOLVED envelope", () => {
    const pair = generateKeyPairSync("ed25519");
    const envelope = signBootstrapSnapshot(resolved, "key", pair.privateKey);
    const cases: Array<(value: BootstrapSnapshotPayloadV1) => void> = [
      (value) => {
        if (value.ai.status === "RESOLVED") value.ai.detected.family = "other";
      },
      (value) => {
        if (value.ai.status === "RESOLVED") value.ai.detected.surface = "other";
      },
      (value) => {
        if (value.ai.status === "RESOLVED") value.ai.detected.variant = "other";
      },
      (value) => {
        if (value.ai.status === "RESOLVED")
          value.ai.profile.profileKey = "other";
      },
      (value) => {
        if (value.ai.status === "RESOLVED") value.ai.profile.revision += 1;
      },
      (value) => {
        if (value.ai.status === "RESOLVED")
          value.ai.profile.scopeVariant = null;
      },
      (value) => {
        if (value.ai.status === "RESOLVED")
          value.ai.profile.schemaVersion = "other" as "adapter_profile_v1";
      },
      (value) => {
        if (value.ai.status === "RESOLVED")
          value.ai.profile.contentSha256 = "0".repeat(64);
      },
      (value) => {
        if (value.ai.status === "RESOLVED")
          value.ai.profile.content = {
            ...value.ai.profile.content,
            extra: true,
          };
      },
      (value) => {
        if (value.ai.status === "RESOLVED")
          value.ai.profile.compatibility = {
            ...value.ai.profile.compatibility,
            extra: true,
          };
      },
    ];
    for (const mutate of cases) {
      const changed = structuredClone(resolved);
      mutate(changed);
      const tampered = {
        ...envelope,
        payload: canonicalizeJson(changed).toString("base64url"),
      };
      expect(
        verifyBootstrapEnvelope(tampered, new Map([["key", pair.publicKey]]))
          .ok,
      ).toBe(false);
    }
  });

  it("rejects UNAVAILABLE/RESOLVED when current request context is absent", () => {
    expect(
      validateAndBindBootstrapAi(
        payload({
          status: "UNAVAILABLE",
          detected: detectedStandard,
          reason: "NO_PROFILE",
        }),
        { ...context, detectedAi: null },
      ),
    ).toEqual({ ok: false, error: "AI_CONTEXT_MISMATCH" });
    expect(
      validateAndBindBootstrapAi(payload({ status: "UNCONFIGURED" }), context),
    ).toEqual({ ok: false, error: "AI_CONTEXT_MISMATCH" });
  });

  it("does not replay a Standard cache as Work when only cache metadata changes", async () => {
    let record: BootstrapCacheRecord | undefined;
    const store: BootstrapSnapshotStore = {
      load: async () => structuredClone(record),
      save: async (_key, value) => {
        record = structuredClone(value);
      },
      remove: async () => {
        record = undefined;
      },
    };
    const key = generateKeyPairSync("ed25519");
    const client = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      trustedConfigSigningKeys: new Map([["key", key.publicKey]]),
      snapshotStore: store,
      fetch: async () =>
        new Response(
          JSON.stringify(
            signBootstrapSnapshot(resolved, "key", key.privateKey),
          ),
          { status: 200 },
        ),
      clock: {
        wallNow: () => new Date("2026-01-01T00:01:00.000Z"),
        monotonicNowMs: () => 1,
      },
    });
    const credentials = {
      deviceId: "123e4567-e89b-42d3-a456-426614174000",
      sessionId: "123e4567-e89b-42d3-a456-426614174001",
      accessToken: "access",
      accessTokenExpiresAt: "2026-01-01T00:10:00.000Z",
      refreshToken: "refresh",
      refreshTokenExpiresAt: "2026-01-01T00:10:00.000Z",
    };
    (client as unknown as { credentials: object }).credentials = credentials;
    await client.bootstrapWithPolicy({
      ...context,
      detectedAi: detectedStandard,
    });
    const sameContextOffline = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      trustedConfigSigningKeys: new Map([["key", key.publicKey]]),
      snapshotStore: store,
      fetch: async () => {
        throw new TypeError("offline");
      },
      clock: {
        wallNow: () => new Date("2026-01-01T00:01:00.000Z"),
        monotonicNowMs: () => 1,
      },
    });
    (sameContextOffline as unknown as { credentials: object }).credentials =
      credentials;
    expect(
      await sameContextOffline.bootstrapWithPolicy({
        ...context,
        detectedAi: detectedStandard,
      }),
    ).toMatchObject({ kind: "READY", source: "CACHE" });
    record!.requestContext.detectedAi = {
      family: "chatgpt",
      surface: "work",
      variant: "work_composer_v3",
    };
    const offline = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      trustedConfigSigningKeys: new Map([["key", key.publicKey]]),
      snapshotStore: store,
      fetch: async () => {
        throw new TypeError("offline");
      },
      clock: {
        wallNow: () => new Date("2026-01-01T00:01:00.000Z"),
        monotonicNowMs: () => 1,
      },
    });
    (offline as unknown as { credentials: object }).credentials = credentials;
    expect(
      await offline.bootstrapWithPolicy({
        ...context,
        detectedAi: {
          family: "chatgpt",
          surface: "work",
          variant: "work_composer_v3",
        },
      }),
    ).toMatchObject({ kind: "UNAVAILABLE", reason: "SECURITY_FAILURE" });
  });

  it("does not replay a Work cache as Standard when only cache metadata changes", async () => {
    const workDetected = {
      family: "chatgpt",
      surface: "work",
      variant: "work_composer_v3",
    } as const;
    const workPayload = payload({
      status: "RESOLVED",
      detected: workDetected,
      profile: {
        ...profile,
        profileKey: "chatgpt-work",
        scopeVariant: "work_composer_v3",
      },
    });
    let record: BootstrapCacheRecord | undefined;
    const store: BootstrapSnapshotStore = {
      load: async () => structuredClone(record),
      save: async (_key, value) => {
        record = structuredClone(value);
      },
      remove: async () => {
        record = undefined;
      },
    };
    const key = generateKeyPairSync("ed25519");
    const first = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      trustedConfigSigningKeys: new Map([["key", key.publicKey]]),
      snapshotStore: store,
      fetch: async () =>
        new Response(
          JSON.stringify(
            signBootstrapSnapshot(workPayload, "key", key.privateKey),
          ),
          { status: 200 },
        ),
      clock: {
        wallNow: () => new Date("2026-01-01T00:01:00.000Z"),
        monotonicNowMs: () => 1,
      },
    });
    const credentials = {
      deviceId: "123e4567-e89b-42d3-a456-426614174000",
      sessionId: "123e4567-e89b-42d3-a456-426614174001",
      accessToken: "access",
      accessTokenExpiresAt: "2026-01-01T00:10:00.000Z",
      refreshToken: "refresh",
      refreshTokenExpiresAt: "2026-01-01T00:10:00.000Z",
    };
    (first as unknown as { credentials: object }).credentials = credentials;
    await first.bootstrapWithPolicy({ ...context, detectedAi: workDetected });
    record!.requestContext.detectedAi = detectedStandard;
    const offline = new SimulatedExtensionClient({
      controlPlaneApiOrigin: "https://api.test",
      portalOrigin: "https://portal.test",
      trustedConfigSigningKeys: new Map([["key", key.publicKey]]),
      snapshotStore: store,
      fetch: async () => {
        throw new TypeError("offline");
      },
      clock: {
        wallNow: () => new Date("2026-01-01T00:01:00.000Z"),
        monotonicNowMs: () => 1,
      },
    });
    (offline as unknown as { credentials: object }).credentials = credentials;
    expect(
      await offline.bootstrapWithPolicy({
        ...context,
        detectedAi: detectedStandard,
      }),
    ).toMatchObject({ kind: "UNAVAILABLE", reason: "SECURITY_FAILURE" });
  });
});
