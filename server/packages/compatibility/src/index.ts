import {
  SemVerV1Schema,
  StableMachineIdentifierV1Schema,
} from "@product/shared";
import { z } from "zod";

const HashSchema = z.string().regex(/^[0-9a-f]{64}$/);
const BrowserFamilySchema = z.enum(["chrome", "yandex_chromium"]);
const TimestampSchema = z.date();
export const ReleaseChannelSchema = StableMachineIdentifierV1Schema;
export const ContractVersionSchema = z.literal("control_plane_v1");
export const ExtensionReleaseSchema = z
  .object({
    id: z.uuid(),
    version: SemVerV1Schema,
    releaseChannel: ReleaseChannelSchema,
    artifactSha256: HashSchema.nullable(),
    releasedAt: TimestampSchema,
    createdAt: TimestampSchema,
  })
  .strict();
export const ReleaseContractSupportSchema = z
  .object({ releaseId: z.uuid(), contractVersion: ContractVersionSchema })
  .strict();
export const ReleaseBrowserSupportSchema = z
  .object({ releaseId: z.uuid(), browserFamily: BrowserFamilySchema })
  .strict();
export const CompatibilityPolicyRevisionSchema = z
  .object({
    id: z.uuid(),
    policyKey: StableMachineIdentifierV1Schema,
    revision: z.number().int().positive(),
    contractVersion: ContractVersionSchema,
    browserFamily: BrowserFamilySchema.nullable(),
    minimumExtensionVersion: SemVerV1Schema.nullable(),
    recommendedExtensionVersion: SemVerV1Schema.nullable(),
    minimumBrowserVersion: z.string().min(1).max(64).nullable(),
    maintenanceMode: z.boolean(),
    maintenanceCode: StableMachineIdentifierV1Schema.nullable(),
    publishedAt: TimestampSchema,
    createdAt: TimestampSchema,
  })
  .strict();
export const BlockedExtensionVersionSchema = z
  .object({ policyRevisionId: z.uuid(), extensionVersion: SemVerV1Schema })
  .strict();
export type ExtensionRelease = z.infer<typeof ExtensionReleaseSchema>;
export type ReleaseContractSupport = z.infer<
  typeof ReleaseContractSupportSchema
>;
export type ReleaseBrowserSupport = z.infer<typeof ReleaseBrowserSupportSchema>;
export type CompatibilityPolicyRevision = z.infer<
  typeof CompatibilityPolicyRevisionSchema
>;
export type BlockedExtensionVersion = z.infer<
  typeof BlockedExtensionVersionSchema
>;
export interface CompatibilityCatalogRepository {
  findExtensionRelease(version: string): Promise<ExtensionRelease | undefined>;
  listReleaseContracts(releaseId: string): Promise<ReleaseContractSupport[]>;
  listReleaseBrowsers(releaseId: string): Promise<ReleaseBrowserSupport[]>;
  listCompatibilityPolicyRevisions(
    contractVersion: "control_plane_v1",
  ): Promise<CompatibilityPolicyRevision[]>;
  listBlockedVersions(
    policyRevisionId: string,
  ): Promise<BlockedExtensionVersion[]>;
}
