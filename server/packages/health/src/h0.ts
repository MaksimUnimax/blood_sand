import {
  PersistedProfileRevisionSchema,
  validateProfileContent,
  type PersistedProfileRevision,
} from "@product/adapter-registry";

export type H0ValidationEvidence = {
  profileRevisionId: string;
  profileId: string;
  revision: number;
  schemaVersion: "adapter_profile_v1";
  contentSha256: string;
  remoteExecutableCapability: false;
  deterministicFingerprintInputs: {
    content: PersistedProfileRevision["content"];
    compatibility: PersistedProfileRevision["compatibility"];
  };
};

export function validateH0ProfileCandidate(
  input: unknown,
): H0ValidationEvidence {
  const candidate = PersistedProfileRevisionSchema.parse(input);
  if (candidate.state !== "CANDIDATE")
    throw new Error("H0_PROFILE_NOT_CANDIDATE");
  const validated = validateProfileContent({
    content: candidate.content,
    compatibility: candidate.compatibility,
  });
  if (validated.contentSha256 !== candidate.contentSha256) {
    throw new Error("H0_PROFILE_FINGERPRINT_MISMATCH");
  }
  return {
    profileRevisionId: candidate.id,
    profileId: candidate.profileId,
    revision: candidate.revision,
    schemaVersion: candidate.schemaVersion,
    contentSha256: validated.contentSha256,
    remoteExecutableCapability: false,
    deterministicFingerprintInputs: {
      content: validated.content,
      compatibility: validated.compatibility,
    },
  };
}
