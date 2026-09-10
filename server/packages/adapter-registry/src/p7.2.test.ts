import { describe, expect, it } from "vitest";
import {
  rolloutBucketV1,
  selectRolloutCandidateV1,
} from "@product/remote-config";
import {
  AssignmentScopeCommandSchema,
  P7_PROFILE_ROLLOUT_KEY,
  selectAssignedProfileRevision,
  type ProfileLifecycleRepository,
} from "./index.js";

type PublicAssignmentScopeInput = Parameters<
  ProfileLifecycleRepository["createAssignmentScope"]
>[0];

// @ts-expect-error The supported public input has no seed override field.
const unsupportedPublicSeedField: keyof PublicAssignmentScopeInput =
  "internalTestCohortSeed";
void unsupportedPublicSeedField;

describe("P7.2 profile assignment selection", () => {
  it("rejects a caller-supplied cohort seed from the public scope command", () => {
    const result = AssignmentScopeCommandSchema.safeParse({
      adapterId: "00000000-0000-4000-8000-000000000001",
      surfaceId: "00000000-0000-4000-8000-000000000002",
      variantId: null,
      browserFamily: "chrome",
      subjectKind: "ACCOUNT",
      internalTestCohortSeed: Buffer.alloc(32, 9),
    });
    expect(result.success).toBe(false);
  });

  it("reuses the accepted P3 primitive exactly", () => {
    const input = {
      rolloutKey: P7_PROFILE_ROLLOUT_KEY,
      cohortSeed: Buffer.alloc(32, 7),
      subjectKind: "ACCOUNT" as const,
      subjectId: "account-1",
    };
    const bucket = rolloutBucketV1(input);
    const percentageBps = bucket + 1;
    expect(
      selectAssignedProfileRevision({
        mode: "ROLLOUT",
        baselineProfileRevisionId: "baseline",
        candidateProfileRevisionId: "candidate",
        percentageBps,
        cohortSeed: input.cohortSeed,
        subjectKind: input.subjectKind,
        subjectId: input.subjectId,
      }),
    ).toBe(
      selectRolloutCandidateV1({ ...input, state: "ACTIVE", percentageBps })
        ? "candidate"
        : "baseline",
    );
  });

  it("is stable and has explicit endpoint semantics", () => {
    const common = {
      mode: "ROLLOUT" as const,
      baselineProfileRevisionId: "b",
      candidateProfileRevisionId: "c",
      cohortSeed: Buffer.alloc(32, 1),
      subjectKind: "DEVICE" as const,
      subjectId: "device-1",
    };
    expect(selectAssignedProfileRevision({ ...common, percentageBps: 0 })).toBe(
      "b",
    );
    expect(
      selectAssignedProfileRevision({ ...common, percentageBps: 10000 }),
    ).toBe("c");
    const first = selectAssignedProfileRevision({
      ...common,
      percentageBps: 5000,
    });
    expect(
      selectAssignedProfileRevision({ ...common, percentageBps: 5000 }),
    ).toBe(first);
    expect(
      selectAssignedProfileRevision({
        ...common,
        mode: "PAUSED",
        percentageBps: 10000,
      }),
    ).toBe("b");
  });
});
