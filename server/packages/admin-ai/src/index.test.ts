import { describe, expect, it, vi } from "vitest";
import {
  AdminAiAssignmentScopeSchema,
  AdminAiCreateAdapterSchema,
  AdminAiError,
  AdminAiService,
  type AdminAiRegistryReadRepository,
  type AdminAiRegistryCommandRepository,
} from "./index.js";
import type { ProfileLifecycleRepository } from "@product/adapter-registry";

const id = "00000000-0000-4000-8000-000000000001";
const id2 = "00000000-0000-4000-8000-000000000002";
const now = new Date("2030-01-01T00:00:00.000Z");
const plan = (
  strategy:
    | "page_identity"
    | "conversation_root"
    | "composer_root"
    | "send_control",
) => ({
  strategy,
  primary: {
    kind: "packaged_selector_reference" as const,
    reference: "page-root" as const,
  },
  fallbacks: [],
  timeoutMs: 500,
  observationMode: "polling" as const,
});
const content = {
  schemaVersion: "adapter_profile_v1" as const,
  page: {
    identityStrategy: "page_identity" as const,
    conversationStrategy: "conversation_root" as const,
    composerStrategy: "composer_root" as const,
  },
  selectors: {
    conversation: plan("conversation_root"),
    composer: plan("composer_root"),
    send: plan("send_control"),
    assistantResponse: plan("page_identity"),
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
const revision = {
  id,
  profileId: id2,
  adapterId: id,
  surfaceId: id2,
  variantId: null,
  revision: 1,
  schemaVersion: "adapter_profile_v1" as const,
  state: "DRAFT" as const,
  content,
  compatibility,
  contentSha256: "a".repeat(64),
  createdAt: now,
  publishedAt: null,
  createdByAdminPrincipalId: id,
  publishedByAdminPrincipalId: null,
};
function service(
  overrides: Partial<AdminAiRegistryCommandRepository> = {},
  lifecycle: Partial<ProfileLifecycleRepository> = {},
) {
  const reads: AdminAiRegistryReadRepository = {
    listAdapters: async () => ({ items: [], nextCursor: null }),
    listSurfaces: async () => ({ items: [], nextCursor: null }),
    listVariants: async () => ({ items: [], nextCursor: null }),
    listProfiles: async () => ({ items: [], nextCursor: null }),
    getProfile: async () => null,
    listProfileRevisions: async () => ({ items: [], nextCursor: null }),
    getProfileRevision: async () => null,
    listAssignments: async () => ({ items: [], nextCursor: null }),
    getAssignment: async () => null,
    listAssignmentRevisions: async () => ({ items: [], nextCursor: null }),
  };
  const registry = {
    createAdapter: vi.fn(),
    createSurface: vi.fn(),
    createVariant: vi.fn(),
    createProfile: vi.fn(),
    updateAdapter: vi.fn(),
    updateSurface: vi.fn(),
    updateVariant: vi.fn(),
    updateProfile: vi.fn(),
    ...overrides,
  } as unknown as AdminAiRegistryCommandRepository;
  const commands = {
    createDraftProfileRevision: vi.fn(async () => revision),
    updateDraftProfileRevision: vi.fn(),
    markProfileRevisionCandidate: vi.fn(),
    publishProfileRevision: vi.fn(),
    retireProfileRevision: vi.fn(),
    createAssignmentScope: vi.fn(async () => ({
      id,
      cohortSeed: Buffer.alloc(32, 7),
    })),
    assignDirect: vi.fn(),
    startRollout: vi.fn(),
    changeRolloutPercentage: vi.fn(),
    pauseProfileRollout: vi.fn(),
    resumeProfileRollout: vi.fn(),
    completeRollout: vi.fn(),
    rollbackProfileAssignment: vi.fn(),
    ...lifecycle,
  } as unknown as ProfileLifecycleRepository;
  return {
    service: new AdminAiService(reads, registry, commands),
    registry,
    commands,
  };
}

describe("P7.4 admin-ai transport-neutral authority", () => {
  it("keeps registry input strict and excludes caller cohort seed", () => {
    expect(
      AdminAiAssignmentScopeSchema.safeParse({
        adapterId: id,
        surfaceId: id2,
        variantId: null,
        browserFamily: "chrome",
        subjectKind: "ACCOUNT",
        reason: "onboard",
        cohortSeed: "secret",
      }).success,
    ).toBe(false);
    expect(
      AdminAiCreateAdapterSchema.safeParse({
        machineKey: "chatgpt",
        displayName: "ChatGPT",
        description: "",
        reason: "onboard",
      }).success,
    ).toBe(true);
  });
  it("delegates stable profile creation without inventing lifecycle state", async () => {
    const { service: target, commands } = service();
    const result = await target.createDraft({
      profileId: id2,
      content,
      compatibility,
      actorId: id,
      correlationId: "corr",
      reason: "draft",
    });
    expect(commands.createDraftProfileRevision).toHaveBeenCalledWith(
      expect.objectContaining({
        profileId: id2,
        context: expect.objectContaining({
          actorType: "ADMIN",
          actorId: id,
          reason: "draft",
        }),
      }),
    );
    expect(result.state).toBe("DRAFT");
  });
  it("strips actor and stored reason fields from safe revision output", async () => {
    const { service: target } = service();
    const result = await target.createDraft({
      profileId: id2,
      content,
      compatibility,
      actorId: id,
      correlationId: "corr",
      reason: "private operator reason",
    });
    expect(result).not.toHaveProperty("createdByAdminPrincipalId");
    expect(result).not.toHaveProperty("publishedByAdminPrincipalId");
    expect(result).not.toHaveProperty("reason");
    expect(result.contentSha256).toHaveLength(64);
  });
  it("does not return the server-generated cohort seed", async () => {
    const { service: target, commands } = service();
    const result = await target.createAssignment({
      adapterId: id,
      surfaceId: id2,
      variantId: null,
      browserFamily: "chrome",
      subjectKind: "DEVICE",
      reason: "scope",
      actorId: id,
      correlationId: "corr",
    });
    expect(commands.createAssignmentScope).toHaveBeenCalled();
    expect(result).toEqual({ id });
    expect(result).not.toHaveProperty("cohortSeed");
  });
  it("delegates assignment mutations with exact expected revision", async () => {
    const { service: target, commands } = service({});
    (commands.assignDirect as ReturnType<typeof vi.fn>).mockResolvedValue({
      revision: 2,
    });
    await target.direct({
      assignmentId: id,
      baselineProfileRevisionId: id2,
      expectedLatestAssignmentRevision: 1,
      reason: "direct",
      actorId: id,
      correlationId: "corr",
    });
    expect(commands.assignDirect).toHaveBeenCalledWith(
      expect.objectContaining({ expectedLatestAssignmentRevision: 1 }),
    );
  });
  it("maps lifecycle failures to stable machine errors", async () => {
    const { service: target } = service(
      {},
      {
        publishProfileRevision: vi.fn(async () => {
          throw new Error("P7_ROLLOUT_NOT_ACTIVE");
        }),
      },
    );
    await expect(
      target.publish({
        profileId: id2,
        revision: 1,
        actorId: id,
        correlationId: "corr",
        reason: "publish",
      }),
    ).rejects.toMatchObject({
      code: "ADMIN_INVALID_LIFECYCLE",
    } satisfies Partial<AdminAiError>);
  });
});
